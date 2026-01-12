export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number;
  agent?: string;
  files?: string[];
  implementation?: string[];
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  type: 'requirements' | 'design';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Spec {
  id: string;
  name: string;
  description: string;
  requirements: Document;
  design: Document;
  tasks: Task[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  specs: Spec[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}
