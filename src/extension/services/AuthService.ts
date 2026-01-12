import * as vscode from 'vscode';

const ACCESS_TOKEN_KEY = 'specmanager.accessToken';
const REFRESH_TOKEN_KEY = 'specmanager.refreshToken';

/**
 * Authentication service for managing session tokens
 * Uses VSCode SecretStorage for secure credential storage
 */
export class AuthService {
  // Store promise resolvers for OAuth flow
  private _oauthResolve: ((value: { accessToken: string }) => void) | undefined;
  private _oauthReject: ((reason: Error) => void) | undefined;
  private _oauthTimeout: NodeJS.Timeout | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Store tokens securely
   */
  async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await this.context.secrets.store(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await this.context.secrets.store(REFRESH_TOKEN_KEY, refreshToken);
    }
    console.log('[AuthService] Tokens stored securely');
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | undefined> {
    return this.context.secrets.get(ACCESS_TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | undefined> {
    return this.context.secrets.get(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear tokens (logout)
   */
  async clearTokens(): Promise<void> {
    await this.context.secrets.delete(ACCESS_TOKEN_KEY);
    await this.context.secrets.delete(REFRESH_TOKEN_KEY);
    console.log('[AuthService] Tokens cleared');
  }

  /**
   * Check if authenticated (has access token stored)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return Boolean(token);
  }

  /**
   * Login with email/password
   * Stores the session tokens for future API calls
   */
  async loginWithCredentials(
    apiUrl: string,
    email: string,
    password: string
  ): Promise<{ accessToken: string; user: any }> {
    const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json().catch(() => ({} as { message?: string })) as { message?: string };
      throw new Error(error.message || 'Login failed');
    }

    const loginData = await loginResponse.json() as {
      tokens: { accessToken: string; refreshToken?: string };
      user: unknown
    };

    const { accessToken, refreshToken } = loginData.tokens;

    // Store the session tokens
    await this.storeTokens(accessToken, refreshToken);

    return {
      accessToken,
      user: loginData.user as Record<string, unknown>,
    };
  }

  /**
   * Login with GitHub OAuth
   * Opens browser for OAuth flow, then stores tokens via URI handler callback
   */
  async loginWithGitHub(apiUrl: string): Promise<{ accessToken: string }> {
    // Clean up any existing OAuth flow
    this.cleanupOAuthFlow();

    // Create a unique state for this OAuth attempt
    const state = this.generateState();

    // Store the state for verification (used by URI handler)
    await this.context.globalState.update('oauthState', state);

    // Build OAuth URL
    // The backend should redirect to: vscode://specmanager.specmanager/oauth-callback?token=JWT&state=STATE
    const oauthUrl = `${apiUrl}/api/auth/github?state=${state}&redirect=vscode`;

    // Return a promise that will be resolved by the URI handler callback
    return new Promise((resolve, reject) => {
      // Store resolvers for the URI handler to use
      this._oauthResolve = resolve;
      this._oauthReject = reject;

      // Set a timeout for the OAuth flow (5 minutes)
      this._oauthTimeout = setTimeout(() => {
        this.cleanupOAuthFlow();
        reject(new Error('OAuth timeout - please try again'));
      }, 300000);

      // Open browser for OAuth
      vscode.env.openExternal(vscode.Uri.parse(oauthUrl));
    });
  }

  /**
   * Resolve the OAuth flow successfully (called by URI handler)
   */
  resolveOAuthFlow(): void {
    if (this._oauthResolve) {
      this.getAccessToken().then((accessToken) => {
        if (accessToken && this._oauthResolve) {
          this._oauthResolve({ accessToken });
        }
        this.cleanupOAuthFlow();
      });
    }
  }

  /**
   * Reject the OAuth flow with an error (called by URI handler)
   */
  rejectOAuthFlow(error: string): void {
    if (this._oauthReject) {
      this._oauthReject(new Error(error));
    }
    this.cleanupOAuthFlow();
  }

  /**
   * Clean up OAuth flow state
   */
  private cleanupOAuthFlow(): void {
    if (this._oauthTimeout) {
      clearTimeout(this._oauthTimeout);
      this._oauthTimeout = undefined;
    }
    this._oauthResolve = undefined;
    this._oauthReject = undefined;
    this.context.globalState.update('oauthState', undefined);
  }

  /**
   * Handle OAuth callback with tokens
   * Stores the session tokens
   */
  async handleOAuthCallback(accessToken: string, refreshToken?: string): Promise<void> {
    await this.storeTokens(accessToken, refreshToken);
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(apiUrl: string): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh token is invalid, clear everything
        await this.clearTokens();
        return null;
      }

      const data = await response.json() as {
        accessToken: string;
        refreshToken?: string
      };

      await this.storeTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Validate stored access token by making a test request
   */
  async validateToken(apiUrl: string): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await this.refreshAccessToken(apiUrl);
        return newToken !== null;
      }

      return response.ok;
    } catch (error) {
      console.error('[AuthService] Token validation failed:', error);
      return false;
    }
  }

  /**
   * Generate a random state string for OAuth
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // ============================================
  // Backwards compatibility - deprecated methods
  // ============================================

  /**
   * @deprecated Use getAccessToken() instead
   */
  async getApiKey(): Promise<string | undefined> {
    return this.getAccessToken();
  }

  /**
   * @deprecated Use storeTokens() instead
   */
  async storeApiKey(apiKey: string): Promise<void> {
    await this.storeTokens(apiKey);
  }

  /**
   * @deprecated Use clearTokens() instead
   */
  async clearApiKey(): Promise<void> {
    await this.clearTokens();
  }

  /**
   * @deprecated Use validateToken() instead
   */
  async validateApiKey(apiUrl: string): Promise<boolean> {
    return this.validateToken(apiUrl);
  }
}
