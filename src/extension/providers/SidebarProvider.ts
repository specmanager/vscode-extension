import * as vscode from 'vscode';
import { AuthService } from '../services/AuthService';
import { ApiService, type User } from '../services/ApiService';
import { EventService } from '../services/EventService';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'specmanager.sidebar';
  private _view?: vscode.WebviewView;
  private _messageQueue: Array<{ type: string; data: any }> = [];
  private _currentProjectId: string | null = null;
  private _eventUnsubscribes: Array<() => void> = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
    private readonly _outputChannel: vscode.OutputChannel,
    private readonly _authService: AuthService,
    private readonly _apiService: ApiService,
    private readonly _eventService: EventService
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, 'webview-dist')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      try {
        await this.handleWebviewMessage(message);
      } catch (error) {
        console.error('[SidebarProvider] Error handling message:', error);
        this.sendError((error as Error).message);
      }
    });

    // Check authentication status on load
    this.checkAuthStatus();

    // Process queued messages
    this.processMessageQueue();
  }

  /**
   * Handle messages from webview
   */
  private async handleWebviewMessage(message: any): Promise<void> {
    switch (message.type) {
      // Auth
      case 'check-auth':
        await this.checkAuthStatus();
        break;

      case 'login-credentials':
        await this.handleLoginCredentials(message.data.email, message.data.password);
        break;

      case 'login-github':
        await this.handleLoginGitHub();
        break;

      case 'logout':
        await this.handleLogout();
        break;

      // Projects
      case 'get-projects':
        await this.sendProjects();
        break;

      case 'select-project':
        await this.handleSelectProject(message.data.projectId);
        break;

      case 'get-project-details':
        await this.sendProjectDetails(message.data.projectId);
        break;

      // Specs
      case 'get-specs':
        await this.sendSpecs(message.data.projectId);
        break;

      case 'get-spec':
        await this.sendSpec(message.data.specId);
        break;

      // Tasks
      case 'get-tasks':
        await this.sendTasks(message.data.projectId, message.data.status);
        break;

      case 'get-spec-tasks':
        await this.sendSpecTasks(message.data.specId, message.data.status);
        break;

      case 'get-task':
        await this.sendTask(message.data.taskId);
        break;

      // Approvals
      case 'get-approvals':
        await this.sendApprovals(message.data.projectId);
        break;

      case 'respond-approval':
        await this.handleRespondApproval(
          message.data.approvalId,
          message.data.status,
          message.data.response
        );
        break;

      // Config
      case 'set-language':
        await this.setLanguage(message.data.language);
        break;

      case 'get-language':
        await this.sendLanguage();
        break;

      case 'get-config':
        await this.sendConfig();
        break;

      // Navigation
      case 'open-external-url':
        await vscode.env.openExternal(vscode.Uri.parse(message.data.url));
        break;

      // Refresh
      case 'refresh-all':
        await this.refreshData();
        break;
    }
  }

  // ============ Auth Handlers ============

  private async checkAuthStatus(): Promise<void> {
    const config = vscode.workspace.getConfiguration('specmanager');
    const apiUrl = config.get<string>('apiUrl', 'https://api.specmanager.ai');

    const isAuthenticated = await this._authService.isAuthenticated();
    let user: User | undefined;

    if (isAuthenticated) {
      // Validate the API key and get user info
      const isValid = await this._authService.validateApiKey(apiUrl);
      if (isValid) {
        try {
          user = await this._apiService.getMe();
        } catch (error) {
          console.error('[SidebarProvider] Failed to get user info:', error);
        }
      } else {
        // API key is invalid, clear it
        await this._authService.clearApiKey();
      }
    }

    this.postMessageToWebview({
      type: 'auth-status',
      data: {
        authenticated: isAuthenticated && !!user,
        user,
      },
    });
  }

  private async handleLoginCredentials(email: string, password: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('specmanager');
    const apiUrl = config.get<string>('apiUrl', 'https://api.specmanager.ai');

    try {
      await this._authService.loginWithCredentials(apiUrl, email, password);
      const user = await this._apiService.getMe();

      this.postMessageToWebview({
        type: 'auth-status',
        data: { authenticated: true, user },
      });

      this.sendNotification('Successfully logged in', 'success');
    } catch (error) {
      this.postMessageToWebview({
        type: 'auth-error',
        data: { message: (error as Error).message },
      });
    }
  }

  private async handleLoginGitHub(): Promise<void> {
    const config = vscode.workspace.getConfiguration('specmanager');
    const apiUrl = config.get<string>('apiUrl', 'https://api.specmanager.ai');

    try {
      await this._authService.loginWithGitHub(apiUrl);
      const user = await this._apiService.getMe();

      this.postMessageToWebview({
        type: 'auth-status',
        data: { authenticated: true, user },
      });

      this.sendNotification('Successfully logged in with GitHub', 'success');
    } catch (error) {
      this.postMessageToWebview({
        type: 'auth-error',
        data: { message: (error as Error).message },
      });
    }
  }

  public async handleLogout(): Promise<void> {
    // Disconnect SSE
    this._eventService.disconnect();
    this._eventUnsubscribes.forEach((unsub) => unsub());
    this._eventUnsubscribes = [];

    // Clear stored project
    this._currentProjectId = null;
    await this._context.globalState.update('selectedProjectId', undefined);

    // Notify webview
    this.postMessageToWebview({
      type: 'auth-status',
      data: { authenticated: false, user: undefined },
    });
  }

  /**
   * Notify webview that OAuth authentication succeeded
   * Called by the URI handler in extension.ts after successful OAuth callback
   */
  public async notifyAuthSuccess(): Promise<void> {
    // Re-check auth status which will fetch user info and notify webview
    await this.checkAuthStatus();
  }

  // ============ Project Handlers ============

  private async sendProjects(): Promise<void> {
    try {
      const projects = await this._apiService.listProjects();
      this.postMessageToWebview({
        type: 'projects-updated',
        data: projects,
      });
    } catch (error) {
      this.sendError('Failed to load projects: ' + (error as Error).message);
    }
  }

  private async handleSelectProject(projectId: string): Promise<void> {
    this._currentProjectId = projectId;
    await this._context.globalState.update('selectedProjectId', projectId);

    // Connect to SSE for this project
    this.setupEventListeners(projectId);

    // Send confirmation
    this.postMessageToWebview({
      type: 'project-selected',
      data: { projectId },
    });

    // Load project data
    await this.sendProjectDetails(projectId);
    await this.sendSpecs(projectId);
    await this.sendTasks(projectId);
    await this.sendApprovals(projectId);
  }

  private async sendProjectDetails(projectId: string): Promise<void> {
    try {
      const project = await this._apiService.getProject(projectId);
      this.postMessageToWebview({
        type: 'project-details-updated',
        data: project,
      });
    } catch (error) {
      this.sendError('Failed to load project details: ' + (error as Error).message);
    }
  }

  // ============ Specs Handlers ============

  private async sendSpecs(projectId: string): Promise<void> {
    try {
      const specs = await this._apiService.listSpecs(projectId);
      this.postMessageToWebview({
        type: 'specs-updated',
        data: specs,
      });
    } catch (error) {
      this.sendError('Failed to load specs: ' + (error as Error).message);
    }
  }

  private async sendSpec(specId: string): Promise<void> {
    try {
      const spec = await this._apiService.getSpec(specId);
      this.postMessageToWebview({
        type: 'spec-updated',
        data: spec,
      });
    } catch (error) {
      this.sendError('Failed to load spec: ' + (error as Error).message);
    }
  }

  // ============ Tasks Handlers ============

  private async sendTasks(projectId: string, status?: string): Promise<void> {
    try {
      const tasks = await this._apiService.listTasks(projectId, status);
      this.postMessageToWebview({
        type: 'tasks-updated',
        data: tasks,
      });
    } catch (error) {
      this.sendError('Failed to load tasks: ' + (error as Error).message);
    }
  }

  private async sendSpecTasks(specId: string, status?: string): Promise<void> {
    try {
      const tasks = await this._apiService.listSpecTasks(specId, status);
      this.postMessageToWebview({
        type: 'spec-tasks-updated',
        data: { specId, tasks },
      });
    } catch (error) {
      this.sendError('Failed to load spec tasks: ' + (error as Error).message);
    }
  }

  private async sendTask(taskId: string): Promise<void> {
    try {
      const task = await this._apiService.getTask(taskId);
      this.postMessageToWebview({
        type: 'task-updated',
        data: task,
      });
    } catch (error) {
      this.sendError('Failed to load task: ' + (error as Error).message);
    }
  }

  // ============ Approvals Handlers ============

  private async sendApprovals(projectId: string): Promise<void> {
    try {
      const approvals = await this._apiService.listApprovals(projectId);
      this.postMessageToWebview({
        type: 'approvals-updated',
        data: approvals,
      });
    } catch (error) {
      // Approvals endpoint might not exist yet
      console.error('[SidebarProvider] Failed to load approvals:', error);
      this.postMessageToWebview({
        type: 'approvals-updated',
        data: [],
      });
    }
  }

  private async handleRespondApproval(
    approvalId: string,
    status: 'approved' | 'rejected' | 'needs-revision',
    response?: string
  ): Promise<void> {
    try {
      await this._apiService.respondToApproval(approvalId, status, response);
      this.sendNotification('Approval response submitted', 'success');

      // Refresh approvals
      if (this._currentProjectId) {
        await this.sendApprovals(this._currentProjectId);
      }
    } catch (error) {
      this.sendError('Failed to respond to approval: ' + (error as Error).message);
    }
  }

  // ============ Config Handlers ============

  private async setLanguage(language: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('specmanager');
    await config.update('language', language, vscode.ConfigurationTarget.Global);
    this.postMessageToWebview({
      type: 'language-updated',
      data: language,
    });
  }

  private async sendLanguage(): Promise<void> {
    const config = vscode.workspace.getConfiguration('specmanager');
    const language = config.get<string>('language', 'auto');
    this.postMessageToWebview({
      type: 'language-updated',
      data: language,
    });
  }

  private async sendConfig(): Promise<void> {
    const config = vscode.workspace.getConfiguration('specmanager');
    this.postMessageToWebview({
      type: 'config-updated',
      data: {
        apiUrl: config.get<string>('apiUrl', 'https://api.specmanager.ai'),
        soundsEnabled: config.get<boolean>('notifications.sounds.enabled', true),
        soundsVolume: config.get<number>('notifications.sounds.volume', 0.5),
        language: config.get<string>('language', 'auto'),
      },
    });
  }

  // ============ SSE Event Handlers ============

  private setupEventListeners(projectId: string): void {
    // Clear existing listeners
    this._eventUnsubscribes.forEach((unsub) => unsub());
    this._eventUnsubscribes = [];

    // Connect to SSE
    this._eventService.connect(projectId);

    // Subscribe to events
    this._eventUnsubscribes.push(
      this._eventService.on('task-started', (event) => {
        this.postMessageToWebview({
          type: 'task-started',
          data: event,
        });
        // Refresh tasks
        this.sendTasks(projectId);
      })
    );

    this._eventUnsubscribes.push(
      this._eventService.on('task-progress', (event) => {
        this.postMessageToWebview({
          type: 'task-progress',
          data: event,
        });
      })
    );

    this._eventUnsubscribes.push(
      this._eventService.on('task-completed', (event) => {
        this.postMessageToWebview({
          type: 'task-completed',
          data: event,
        });
        // Refresh tasks
        this.sendTasks(projectId);
        // Show notification
        const taskCompletedEvent = event as import('../services/EventService').TaskCompletedEvent;
        vscode.window.showInformationMessage(`Task completed: ${taskCompletedEvent.summary}`);
      })
    );

    this._eventUnsubscribes.push(
      this._eventService.on('approval-created', (event) => {
        this.postMessageToWebview({
          type: 'approval-created',
          data: event,
        });
        // Refresh approvals
        this.sendApprovals(projectId);
        // Show notification
        const approvalCreatedEvent = event as import('../services/EventService').ApprovalCreatedEvent;
        vscode.window.showInformationMessage(`New approval request: ${approvalCreatedEvent.title}`);
      })
    );

    this._eventUnsubscribes.push(
      this._eventService.on('approval-responded', (event) => {
        this.postMessageToWebview({
          type: 'approval-responded',
          data: event,
        });
        // Refresh approvals
        this.sendApprovals(projectId);
      })
    );
  }

  // ============ Refresh ============

  public async refreshData(): Promise<void> {
    // Check auth first
    await this.checkAuthStatus();

    // Get stored project
    const storedProjectId = this._context.globalState.get<string>('selectedProjectId');

    // Load projects
    await this.sendProjects();

    // If we have a stored project, load its data
    if (storedProjectId) {
      this._currentProjectId = storedProjectId;
      await this.sendProjectDetails(storedProjectId);
      await this.sendSpecs(storedProjectId);
      await this.sendTasks(storedProjectId);
      await this.sendApprovals(storedProjectId);
    }

    // Send config
    await this.sendConfig();
    await this.sendLanguage();
  }

  // ============ Utility ============

  private postMessageToWebview(message: { type: string; data: any }): void {
    if (this._view) {
      this._view.webview.postMessage(message);
    } else {
      this._messageQueue.push(message);
    }
  }

  private processMessageQueue(): void {
    if (this._messageQueue.length > 0 && this._view) {
      const messages = [...this._messageQueue];
      this._messageQueue = [];
      messages.forEach((message) => {
        this._view!.webview.postMessage(message);
      });
    }
  }

  private sendError(message: string): void {
    this.postMessageToWebview({
      type: 'error',
      data: { message },
    });
  }

  private sendNotification(message: string, level: 'info' | 'success' | 'error'): void {
    this.postMessageToWebview({
      type: 'notification',
      data: { message, level },
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'main.js');
    const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'globals.css');

    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
    const styleUri = webview.asWebviewUri(stylePathOnDisk);

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; connect-src ${webview.cspSource} https:;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>SpecManager</title>
        <style>
          body { visibility: hidden; }
          body.loaded { visibility: visible; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
