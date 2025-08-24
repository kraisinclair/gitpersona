import { v4 as uuidv4 } from "uuid";
import { Persona, SetupOptions, EditOptions } from "../types";
import { ConfigManager } from "./config";
import { GitManager } from "./git";
import { SSHManager } from "./ssh";

export class PersonaManager {
  private configManager: ConfigManager;
  private gitManager: GitManager;
  private sshManager: SSHManager;

  constructor() {
    this.configManager = new ConfigManager();
    this.gitManager = new GitManager();
    this.sshManager = new SSHManager();
  }

  public async setupPersona(options: SetupOptions): Promise<Persona> {
    let sshKeyPath = options.sshKeyPath;
    let sshKeyName = options.sshKeyName;

    // Handle SSH key creation or selection
    if (options.createNewSSHKey) {
      if (!sshKeyName) {
        sshKeyName = options.name;
      }

      const sshKey = await this.sshManager.createSSHKey(
        sshKeyName,
        options.email
      );
      sshKeyPath = sshKey.path;

      // Fix permissions for the new key
      this.sshManager.fixSSHKeyPermissions(sshKeyPath);

      // Add to config
      this.configManager.addSSHKey(sshKey);
    } else if (!sshKeyPath) {
      // Select from existing keys
      const existingKeys = this.sshManager.getExistingSSHKeys();
      if (existingKeys.length === 0) {
        throw new Error("No existing SSH keys found. Please create a new one.");
      }

      // For now, use the first available key
      // In a real implementation, you'd want to show a selection menu
      sshKeyPath = existingKeys[0];
      sshKeyName = this.sshManager.getSSHKeyInfo(sshKeyPath)?.name || "unknown";
    }

    // Create persona
    const persona: Persona = {
      id: uuidv4(),
      name: options.name,
      gitUserName: options.gitUserName,
      email: options.email,
      sshKeyPath: sshKeyPath!,
      sshKeyName: sshKeyName!,
      autoActivatePaths: options.autoActivatePaths || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
    };

    // Add to config
    this.configManager.addPersona(persona);

    return persona;
  }

  public activatePersona(personaId: string): void {
    const persona = this.configManager.getPersonaById(personaId);
    if (!persona) {
      throw new Error(`Persona with id ${personaId} not found`);
    }

    // Clear SSH agent
    this.sshManager.clearSSHAgent();

    // Add SSH key to agent
    this.sshManager.addSSHKeyToAgent(persona.sshKeyPath);

    // Set git config
    if (this.gitManager.isGitRepository()) {
      this.gitManager.setGitConfig(persona.gitUserName, persona.email);
    } else {
      // Set global git config if not in a repository
      this.gitManager.setGitConfigGlobal(persona.gitUserName, persona.email);
    }

    // Activate in config
    this.configManager.activatePersona(personaId);
  }

  public editPersona(personaId: string, updates: EditOptions): Persona {
    const persona = this.configManager.getPersonaById(personaId);
    if (!persona) {
      throw new Error(`Persona with id ${personaId} not found`);
    }

    // Update persona
    this.configManager.updatePersona(personaId, updates);

    // If this persona is active, update git config
    if (persona.isActive) {
      const updatedPersona = this.configManager.getPersonaById(personaId)!;
      if (this.gitManager.isGitRepository()) {
        this.gitManager.setGitConfig(
          updatedPersona.gitUserName,
          updatedPersona.email
        );
      } else {
        this.gitManager.setGitConfigGlobal(
          updatedPersona.gitUserName,
          updatedPersona.email
        );
      }
    }

    return this.configManager.getPersonaById(personaId)!;
  }

  public deletePersona(personaId: string): void {
    const persona = this.configManager.getPersonaById(personaId);
    if (!persona) {
      throw new Error(`Persona with id ${personaId} not found`);
    }

    // Remove SSH key from agent if active
    if (persona.isActive) {
      this.sshManager.removeSSHKeyFromAgent(persona.sshKeyPath);
    }

    // Delete from config
    this.configManager.deletePersona(personaId);
  }

  public getActivePersona(): Persona | undefined {
    return this.configManager.getActivePersona();
  }

  public getAllPersonas(): Persona[] {
    return this.configManager.getPersonas();
  }

  public getPersonaByName(name: string): Persona | undefined {
    return this.configManager.getPersonaByName(name);
  }

  public getPersonaById(id: string): Persona | undefined {
    return this.configManager.getPersonaById(id);
  }

  public checkAutoActivation(currentPath: string): Persona | null {
    const personas = this.configManager.getPersonas();

    for (const persona of personas) {
      if (persona.autoActivatePaths) {
        for (const autoPath of persona.autoActivatePaths) {
          if (currentPath.startsWith(autoPath)) {
            // Auto-activate this persona
            this.activatePersona(persona.id);
            return persona;
          }
        }
      }
    }

    return null;
  }

  public getPersonaStatus(): {
    active: Persona | undefined;
    total: number;
    autoActivationPaths: string[];
  } {
    const active = this.getActivePersona();
    const total = this.getAllPersonas().length;
    const autoActivationPaths = this.getAllPersonas()
      .filter((p) => p.autoActivatePaths && p.autoActivatePaths.length > 0)
      .flatMap((p) => p.autoActivatePaths!);

    return {
      active,
      total,
      autoActivationPaths,
    };
  }

  public validatePersona(persona: Persona): boolean {
    // Check if SSH key exists
    if (!this.sshManager.validateSSHKey(persona.sshKeyPath)) {
      return false;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(persona.email)) {
      return false;
    }

    // Check if name is not empty
    if (!persona.name || persona.name.trim().length === 0) {
      return false;
    }

    // Check if gitUserName is not empty
    if (!persona.gitUserName || persona.gitUserName.trim().length === 0) {
      return false;
    }

    return true;
  }
}
