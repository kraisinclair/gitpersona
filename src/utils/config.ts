import fs from "fs-extra";
import path from "path";
import os from "os";
import { Config, Persona, SSHKey } from "../types";

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor() {
    this.configPath = path.join(os.homedir(), ".gitpersona", "config.json");
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn("Failed to load existing config, creating new one");
    }

    // Create default config
    const defaultConfig: Config = {
      personas: [],
      sshKeys: [],
      version: "1.0.0",
    };

    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  private saveConfig(config: Config): void {
    try {
      const configDir = path.dirname(this.configPath);
      fs.ensureDirSync(configDir);
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public getPersonas(): Persona[] {
    return this.config.personas;
  }

  public getPersonaById(id: string): Persona | undefined {
    return this.config.personas.find((p) => p.id === id);
  }

  public getPersonaByName(name: string): Persona | undefined {
    return this.config.personas.find((p) => p.name === name);
  }

  public getActivePersona(): Persona | undefined {
    if (!this.config.activePersonaId) return undefined;
    return this.getPersonaById(this.config.activePersonaId);
  }

  public addPersona(persona: Persona): void {
    // Deactivate all other personas
    this.config.personas.forEach((p) => (p.isActive = false));

    this.config.personas.push(persona);
    this.saveConfig(this.config);
  }

  public updatePersona(id: string, updates: Partial<Persona>): void {
    const index = this.config.personas.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Persona with id ${id} not found`);
    }

    this.config.personas[index] = {
      ...this.config.personas[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveConfig(this.config);
  }

  public deletePersona(id: string): void {
    const index = this.config.personas.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Persona with id ${id} not found`);
    }

    this.config.personas.splice(index, 1);

    // If deleted persona was active, clear active persona
    if (this.config.activePersonaId === id) {
      this.config.activePersonaId = undefined;
    }

    this.saveConfig(this.config);
  }

  public activatePersona(id: string): void {
    const persona = this.getPersonaById(id);
    if (!persona) {
      throw new Error(`Persona with id ${id} not found`);
    }

    // Deactivate all personas
    this.config.personas.forEach((p) => (p.isActive = false));

    // Activate the selected persona
    persona.isActive = true;
    this.config.activePersonaId = id;

    this.saveConfig(this.config);
  }

  public getSSHKeys(): SSHKey[] {
    return this.config.sshKeys;
  }

  public addSSHKey(sshKey: SSHKey): void {
    this.config.sshKeys.push(sshKey);
    this.saveConfig(this.config);
  }

  public getSSHKeyByName(name: string): SSHKey | undefined {
    return this.config.sshKeys.find((key) => key.name === name);
  }

  public getSSHKeyByPath(path: string): SSHKey | undefined {
    return this.config.sshKeys.find((key) => key.path === path);
  }

  public fixSSHKeyPaths(): void {
    // Fix any personas that have .pub extensions in their SSH key paths
    let hasChanges = false;

    for (const persona of this.config.personas) {
      if (persona.sshKeyPath && persona.sshKeyPath.endsWith(".pub")) {
        const privateKeyPath = persona.sshKeyPath.replace(".pub", "");
        if (fs.existsSync(privateKeyPath)) {
          persona.sshKeyPath = privateKeyPath;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      this.saveConfig(this.config);
    }
  }
}
