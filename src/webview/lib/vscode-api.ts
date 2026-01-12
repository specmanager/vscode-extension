/**
 * VSCode API types and utilities for webview communication
 */

declare global {
  interface Window {
    acquireVsCodeApi?: () => VsCodeApi;
  }
}

interface VsCodeApi {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  githubUsername?: string | null;
  githubAvatarUrl?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  githubRepositoryFullName: string | null;
  githubRepositoryUrl: string | null;
  githubRepositoryDefaultBranch?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Spec {
  id: string;
  projectId: string;
  title: string;
  stage: 'requirements' | 'design' | 'tasks' | 'implementation' | 'complete';
  requirementsContent?: string | null;
  designContent?: string | null;
  planContent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  specId: string;
  taskNumber: number;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  files: string[] | null;
  implementation?: string | null;
  purposes: string[] | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  spec: {
    id: string;
    title: string;
    stage: string;
    requirementsContent?: string | null;
    designContent?: string | null;
  };
}

export interface Approval {
  id: string;
  specId: string;
  type: 'requirements' | 'design' | 'tasks';
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  requestedAt: string;
  respondedAt?: string | null;
  response?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  apiUrl: string;
  soundsEnabled: boolean;
  soundsVolume: number;
  language: string;
}

// Message types
export type ExtensionMessage =
  | { type: 'auth-status'; data: { authenticated: boolean; user?: User } }
  | { type: 'auth-error'; data: { message: string } }
  | { type: 'projects-updated'; data: Project[] }
  | { type: 'project-selected'; data: { projectId: string } }
  | { type: 'project-details-updated'; data: Project }
  | { type: 'specs-updated'; data: Spec[] }
  | { type: 'spec-updated'; data: Spec }
  | { type: 'tasks-updated'; data: Task[] }
  | { type: 'spec-tasks-updated'; data: { specId: string; tasks: Task[] } }
  | { type: 'task-updated'; data: TaskDetail }
  | { type: 'approvals-updated'; data: Approval[] }
  | { type: 'task-started'; data: { specId: string; taskId: string; taskTitle: string } }
  | { type: 'task-progress'; data: { specId: string; taskId: string; message: string; percent?: number } }
  | { type: 'task-completed'; data: { specId: string; taskId: string; summary: string } }
  | { type: 'approval-created'; data: { approvalId: string; specId: string; title: string } }
  | { type: 'approval-responded'; data: { approvalId: string; status: string } }
  | { type: 'config-updated'; data: Config }
  | { type: 'language-updated'; data: string }
  | { type: 'error'; data: { message: string } }
  | { type: 'notification'; data: { message: string; level: 'info' | 'success' | 'error' } };

export type WebviewMessage =
  | { type: 'check-auth' }
  | { type: 'login-credentials'; data: { email: string; password: string } }
  | { type: 'login-github' }
  | { type: 'logout' }
  | { type: 'get-projects' }
  | { type: 'select-project'; data: { projectId: string } }
  | { type: 'get-project-details'; data: { projectId: string } }
  | { type: 'get-specs'; data: { projectId: string } }
  | { type: 'get-spec'; data: { specId: string } }
  | { type: 'get-tasks'; data: { projectId: string; status?: string } }
  | { type: 'get-spec-tasks'; data: { specId: string; status?: string } }
  | { type: 'get-task'; data: { taskId: string } }
  | { type: 'get-approvals'; data: { projectId: string } }
  | { type: 'respond-approval'; data: { approvalId: string; status: string; response?: string } }
  | { type: 'set-language'; data: { language: string } }
  | { type: 'get-language' }
  | { type: 'get-config' }
  | { type: 'open-external-url'; data: { url: string } }
  | { type: 'refresh-all' };

class VsCodeApiService {
  private api: VsCodeApi | null = null;
  private messageListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (window.acquireVsCodeApi) {
      this.api = window.acquireVsCodeApi();
    }

    window.addEventListener('message', (event) => {
      const message = event.data as ExtensionMessage;
      this.notifyListeners(message.type, message);
    });
  }

  postMessage(message: WebviewMessage): void {
    if (this.api) {
      this.api.postMessage(message);
    } else {
      console.warn('VSCode API not available:', message);
    }
  }

  onMessage(type: string, callback: (data: any) => void): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(callback);

    return () => {
      this.messageListeners.get(type)?.delete(callback);
    };
  }

  private notifyListeners(type: string, message: ExtensionMessage): void {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      listeners.forEach((callback) => callback(message));
    }
  }

  setState(state: any): void {
    if (this.api) {
      this.api.setState(state);
    }
  }

  getState(): any {
    if (this.api) {
      return this.api.getState();
    }
    return null;
  }

  // Convenience methods
  checkAuth(): void {
    this.postMessage({ type: 'check-auth' });
  }

  loginWithCredentials(email: string, password: string): void {
    this.postMessage({ type: 'login-credentials', data: { email, password } });
  }

  loginWithGitHub(): void {
    this.postMessage({ type: 'login-github' });
  }

  logout(): void {
    this.postMessage({ type: 'logout' });
  }

  getProjects(): void {
    this.postMessage({ type: 'get-projects' });
  }

  selectProject(projectId: string): void {
    this.postMessage({ type: 'select-project', data: { projectId } });
  }

  getProjectDetails(projectId: string): void {
    this.postMessage({ type: 'get-project-details', data: { projectId } });
  }

  getSpecs(projectId: string): void {
    this.postMessage({ type: 'get-specs', data: { projectId } });
  }

  getSpec(specId: string): void {
    this.postMessage({ type: 'get-spec', data: { specId } });
  }

  getTasks(projectId: string, status?: string): void {
    this.postMessage({ type: 'get-tasks', data: { projectId, status } });
  }

  getSpecTasks(specId: string, status?: string): void {
    this.postMessage({ type: 'get-spec-tasks', data: { specId, status } });
  }

  getTask(taskId: string): void {
    this.postMessage({ type: 'get-task', data: { taskId } });
  }

  getApprovals(projectId: string): void {
    this.postMessage({ type: 'get-approvals', data: { projectId } });
  }

  respondToApproval(approvalId: string, status: string, response?: string): void {
    this.postMessage({ type: 'respond-approval', data: { approvalId, status, response } });
  }

  setLanguage(language: string): void {
    this.postMessage({ type: 'set-language', data: { language } });
  }

  getLanguage(): void {
    this.postMessage({ type: 'get-language' });
  }

  getConfig(): void {
    this.postMessage({ type: 'get-config' });
  }

  openExternalUrl(url: string): void {
    this.postMessage({ type: 'open-external-url', data: { url } });
  }

  refreshAll(): void {
    this.postMessage({ type: 'refresh-all' });
  }
}

export const vscodeApi = new VsCodeApiService();
