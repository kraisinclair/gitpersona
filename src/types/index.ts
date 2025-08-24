export interface Persona {
  id: string;
  name: string;
  gitUserName: string;
  email: string;
  sshKeyPath: string;
  sshKeyName: string;
  autoActivatePaths?: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface GitConfig {
  user: {
    name: string;
    email: string;
  };
}

export interface SSHKey {
  name: string;
  path: string;
  publicKey: string;
  privateKey: string;
}

export interface Config {
  personas: Persona[];
  activePersonaId?: string;
  sshKeys: SSHKey[];
  version: string;
}

export interface SetupOptions {
  name: string;
  gitUserName: string;
  email: string;
  sshKeyPath?: string;
  createNewSSHKey?: boolean;
  sshKeyName?: string;
  autoActivatePaths?: string[];
}

export interface EditOptions {
  name?: string;
  gitUserName?: string;
  email?: string;
  sshKeyPath?: string;
  autoActivatePaths?: string[];
}
