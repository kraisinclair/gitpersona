import { execSync } from "child_process";
import { GitConfig } from "../types";

export class GitManager {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  public isGitRepository(): boolean {
    try {
      execSync("git rev-parse --git-dir", { cwd: this.cwd, stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  public getGitConfig(): GitConfig | null {
    try {
      const name = execSync("git config user.name", {
        cwd: this.cwd,
        encoding: "utf8",
      }).trim();
      const email = execSync("git config user.email", {
        cwd: this.cwd,
        encoding: "utf8",
      }).trim();

      return {
        user: { name, email },
      };
    } catch {
      return null;
    }
  }

  public setGitConfig(name: string, email: string): void {
    try {
      execSync(`git config user.name "${name}"`, { cwd: this.cwd });
      execSync(`git config user.email "${email}"`, { cwd: this.cwd });
    } catch (error) {
      throw new Error(`Failed to set git config: ${error}`);
    }
  }

  public setGitConfigGlobal(name: string, email: string): void {
    try {
      execSync(`git config --global user.name "${name}"`);
      execSync(`git config --global user.email "${email}"`);
    } catch (error) {
      throw new Error(`Failed to set global git config: ${error}`);
    }
  }

  public getGitConfigGlobal(): GitConfig | null {
    try {
      const name = execSync("git config --global user.name", {
        encoding: "utf8",
      }).trim();
      const email = execSync("git config --global user.email", {
        encoding: "utf8",
      }).trim();

      return {
        user: { name, email },
      };
    } catch {
      return null;
    }
  }

  public getRepositoryRemote(): string | null {
    try {
      const remote = execSync("git remote get-url origin", {
        cwd: this.cwd,
        encoding: "utf8",
      }).trim();
      return remote;
    } catch {
      return null;
    }
  }

  public getRepositoryName(): string | null {
    try {
      const remote = this.getRepositoryRemote();
      if (remote) {
        const match = remote.match(/([^/]+)\.git$/);
        return match ? match[1] : null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
