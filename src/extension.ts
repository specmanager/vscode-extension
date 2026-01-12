import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

import { SidebarProvider } from './extension/providers/SidebarProvider';
import { AuthService } from './extension/services/AuthService';
import { ApiService } from './extension/services/ApiService';
import { EventService } from './extension/services/EventService';

export function activate(context: vscode.ExtensionContext) {
  console.log(localize('extension.active', 'SpecManager extension is now active!'));

  // Create output channel for debugging
  const outputChannel = vscode.window.createOutputChannel('SpecManager');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine(localize('logging.enabled', 'SpecManager extension activated - logging enabled'));

  // Get API URL from configuration
  const config = vscode.workspace.getConfiguration('specmanager');
  const apiUrl = config.get<string>('apiUrl', 'https://api.specmanager.ai');

  // Initialize services
  const authService = new AuthService(context);
  const apiService = new ApiService(authService, apiUrl);
  const eventService = new EventService(authService, apiUrl);

  // Variable to hold sidebar provider reference for OAuth callback
  const sidebarProviderRef: { current: SidebarProvider | undefined } = { current: undefined };

  // Register URI handler for OAuth callback
  // VS Code will call this when the user is redirected back from OAuth
  // URI format: vscode://specmanager.specmanager/oauth-callback?token=JWT_TOKEN&state=STATE
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      async handleUri(uri: vscode.Uri) {
        outputChannel.appendLine(`[OAuth] Received URI callback: ${uri.toString()}`);

        // Parse the callback URI
        if (uri.path === '/oauth-callback' || uri.path === 'oauth-callback') {
          const params = new URLSearchParams(uri.query);
          const token = params.get('token');
          const state = params.get('state');
          const error = params.get('error');

          if (error) {
            outputChannel.appendLine(`[OAuth] Error received: ${error}`);
            vscode.window.showErrorMessage(`OAuth failed: ${error}`);
            authService.rejectOAuthFlow(error);
            return;
          }

          if (!token) {
            outputChannel.appendLine('[OAuth] No token in callback');
            vscode.window.showErrorMessage('OAuth failed: No token received');
            authService.rejectOAuthFlow('No token received');
            return;
          }

          // Verify state to prevent CSRF
          const storedState = context.globalState.get<string>('oauthState');
          if (state && storedState && state !== storedState) {
            outputChannel.appendLine('[OAuth] State mismatch - possible CSRF attack');
            vscode.window.showErrorMessage('OAuth failed: Invalid state parameter');
            authService.rejectOAuthFlow('Invalid state parameter');
            return;
          }

          try {
            // Get current API URL (may have changed since activation)
            const currentApiUrl = vscode.workspace.getConfiguration('specmanager').get<string>('apiUrl', 'https://api.specmanager.ai');

            // Exchange JWT for API key
            outputChannel.appendLine('[OAuth] Exchanging token for API key...');
            await authService.handleOAuthCallback(currentApiUrl, token);

            // Clear OAuth state
            await context.globalState.update('oauthState', undefined);

            outputChannel.appendLine('[OAuth] Successfully authenticated via OAuth');
            vscode.window.showInformationMessage('Successfully logged in with GitHub!');

            // Resolve the pending OAuth promise (this triggers the loginWithGitHub promise to resolve)
            authService.resolveOAuthFlow();

            // Notify the sidebar to refresh auth status
            if (sidebarProviderRef.current) {
              sidebarProviderRef.current.notifyAuthSuccess();
            }
          } catch (err) {
            outputChannel.appendLine(`[OAuth] Failed to exchange token: ${err}`);
            vscode.window.showErrorMessage(`OAuth failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
            authService.rejectOAuthFlow(err instanceof Error ? err.message : 'Unknown error');
          }
        }
      }
    })
  );

  // Create the sidebar provider
  const sidebarProvider = new SidebarProvider(
    context.extensionUri,
    context,
    outputChannel,
    authService,
    apiService,
    eventService
  );

  // Store reference for OAuth callback
  sidebarProviderRef.current = sidebarProvider;

  // Register the webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('specmanager.openDashboard', () => {
      vscode.commands.executeCommand('workbench.view.extension.specmanager');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('specmanager.refreshData', async () => {
      await sidebarProvider.refreshData();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('specmanager.logout', async () => {
      await authService.clearApiKey();
      sidebarProvider.handleLogout();
      vscode.window.showInformationMessage(localize('logout.success', 'Successfully logged out'));
    })
  );

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('specmanager.apiUrl')) {
        const newApiUrl = vscode.workspace.getConfiguration('specmanager').get<string>('apiUrl', 'https://api.specmanager.ai');
        apiService.setApiUrl(newApiUrl);
        eventService.setApiUrl(newApiUrl);
      }
    })
  );

  // Show welcome message for first-time users
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
  if (!hasShownWelcome) {
    const openSidebar = localize('welcome.openSidebar', 'Open Sidebar');
    vscode.window.showInformationMessage(
      localize('welcome.message', 'SpecManager is now active! Open the sidebar to get started.'),
      openSidebar
    ).then(selection => {
      if (selection === openSidebar) {
        vscode.commands.executeCommand('workbench.view.extension.specmanager');
      }
    });
    context.globalState.update('hasShownWelcome', true);
  }
}

export function deactivate() {
  console.log(localize('extension.deactivated', 'SpecManager extension deactivated'));
}
