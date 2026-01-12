import { AuthService } from './AuthService';

/**
 * API types
 */
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

/**
 * API Service for making REST calls to the SpecManager backend
 */
export class ApiService {
  private apiUrl: string;

  constructor(
    private readonly authService: AuthService,
    apiUrl: string
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Update API URL (for configuration changes)
   */
  setApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  /**
   * Generic request method with Bearer token authentication
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const accessToken = await this.authService.getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const url = `${this.apiUrl}/api/v1${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    let response = await fetch(url, options);

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const newToken = await this.authService.refreshAccessToken(this.apiUrl);
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({} as { message?: string; error?: string })) as { message?: string; error?: string };
      throw new Error(error.message || error.error || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // ============ User ============

  /**
   * Get current user info
   */
  async getMe(): Promise<User> {
    const data = await this.request<{ user: User }>('GET', '/me');
    return data.user;
  }

  // ============ Projects ============

  /**
   * List all projects for the authenticated user
   */
  async listProjects(): Promise<Project[]> {
    const data = await this.request<{ projects: Project[] }>('GET', '/projects');
    return data.projects;
  }

  /**
   * Get a project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    const data = await this.request<{ project: Project }>('GET', `/projects/${projectId}`);
    return data.project;
  }

  /**
   * Get a project by GitHub repository full name
   */
  async getProjectByRepo(repoFullName: string): Promise<Project> {
    const data = await this.request<{ project: Project }>(
      'GET',
      `/projects/by-repo?repo=${encodeURIComponent(repoFullName)}`
    );
    return data.project;
  }

  // ============ Specs ============

  /**
   * List specs for a project
   */
  async listSpecs(projectId: string): Promise<Spec[]> {
    const data = await this.request<{ specs: Spec[] }>('GET', `/projects/${projectId}/specs`);
    return data.specs;
  }

  /**
   * Get a spec by ID with documents
   */
  async getSpec(specId: string): Promise<Spec> {
    const data = await this.request<{ spec: Spec }>('GET', `/specs/${specId}`);
    return data.spec;
  }

  // ============ Tasks ============

  /**
   * List tasks for a project
   */
  async listTasks(projectId: string, status?: string): Promise<Task[]> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    const data = await this.request<{ tasks: Task[] }>('GET', `/projects/${projectId}/tasks${params}`);
    return data.tasks;
  }

  /**
   * List tasks for a spec
   */
  async listSpecTasks(specId: string, status?: string): Promise<Task[]> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    const data = await this.request<{ tasks: Task[] }>('GET', `/specs/${specId}/tasks${params}`);
    return data.tasks;
  }

  /**
   * Get a task by ID with spec context
   */
  async getTask(taskId: string): Promise<TaskDetail> {
    const data = await this.request<{ task: TaskDetail }>('GET', `/tasks/${taskId}`);
    return data.task;
  }

  /**
   * Start a task (mark as in-progress)
   */
  async startTask(taskId: string): Promise<Task> {
    const data = await this.request<{ task: Task }>('PATCH', `/tasks/${taskId}/start`);
    return data.task;
  }

  /**
   * Complete a task
   */
  async completeTask(
    taskId: string,
    summary: string,
    filesModified: string[],
    implementation?: string
  ): Promise<Task> {
    const data = await this.request<{ task: Task }>('PATCH', `/tasks/${taskId}/complete`, {
      summary,
      filesModified,
      implementation,
    });
    return data.task;
  }

  /**
   * Report progress on a task
   */
  async reportProgress(taskId: string, message: string, percent?: number): Promise<void> {
    await this.request<{ success: boolean }>('POST', `/tasks/${taskId}/progress`, {
      message,
      percent,
    });
  }

  // ============ Approvals ============

  /**
   * List approvals for a project (pending)
   */
  async listApprovals(projectId: string): Promise<Approval[]> {
    // This endpoint needs to be added to the backend
    const data = await this.request<{ approvals: Approval[] }>('GET', `/projects/${projectId}/approvals`);
    return data.approvals;
  }

  /**
   * Respond to an approval
   */
  async respondToApproval(
    approvalId: string,
    status: 'approved' | 'rejected' | 'needs-revision',
    response?: string
  ): Promise<Approval> {
    const data = await this.request<{ approval: Approval }>('PATCH', `/approvals/${approvalId}/respond`, {
      status,
      response,
    });
    return data.approval;
  }
}
