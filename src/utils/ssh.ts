import fs from "fs-extra";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { SSHKey } from "../types";

export class SSHManager {
  private sshDir: string;

  constructor() {
    this.sshDir = path.join(os.homedir(), ".ssh");
  }

  public async createSSHKey(name: string, email: string): Promise<SSHKey> {
    const keyPath = path.join(this.sshDir, `id_rsa_${name}`);
    const publicKeyPath = `${keyPath}.pub`;

    try {
      // Check if key already exists
      if (fs.existsSync(keyPath)) {
        throw new Error(`SSH key ${keyPath} already exists`);
      }

      // Create SSH key
      execSync(
        `ssh-keygen -t rsa -b 4096 -f "${keyPath}" -C "${email}" -N ""`,
        {
          stdio: "inherit",
        }
      );

      // Read the generated keys
      const privateKey = fs.readFileSync(keyPath, "utf8");
      const publicKey = fs.readFileSync(publicKeyPath, "utf8");

      const sshKey: SSHKey = {
        name,
        path: keyPath,
        publicKey,
        privateKey,
      };

      return sshKey;
    } catch (error) {
      // Clean up on failure
      if (fs.existsSync(keyPath)) {
        fs.removeSync(keyPath);
      }
      if (fs.existsSync(publicKeyPath)) {
        fs.removeSync(publicKeyPath);
      }
      throw new Error(`Failed to create SSH key: ${error}`);
    }
  }

  public getExistingSSHKeys(): string[] {
    try {
      if (!fs.existsSync(this.sshDir)) {
        return [];
      }

      const files = fs.readdirSync(this.sshDir);
      return files
        .filter((file) => file.endsWith(".pub"))
        .map((file) => path.join(this.sshDir, file))
        .filter((file) => {
          // Check if corresponding private key exists
          const privateKeyPath = file.replace(".pub", "");
          return fs.existsSync(privateKeyPath);
        });
    } catch (error) {
      return [];
    }
  }

  public getSSHKeyInfo(
    keyPath: string
  ): { name: string; email: string } | null {
    try {
      if (!fs.existsSync(keyPath)) {
        return null;
      }

      const publicKey = fs.readFileSync(keyPath, "utf8");
      const match = publicKey.match(/ssh-rsa [^ ]+ ([^@]+)@(.+)/);

      if (match) {
        return {
          name: match[1],
          email: `${match[1]}@${match[2]}`,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  public addSSHKeyToAgent(keyPath: string): void {
    try {
      // First, try to remove any existing keys with the same name
      // We need to get the fingerprint first, then remove by fingerprint
      try {
        const fingerprint = this.getSSHKeyFingerprint(keyPath);
        if (fingerprint) {
          // List current keys in agent
          const currentKeys = execSync("ssh-add -l", { encoding: "utf8" });
          if (currentKeys && currentKeys !== "The agent has no identities.") {
            // Try to remove by fingerprint if key exists in agent
            execSync(`ssh-add -d "${fingerprint}"`, { stdio: "ignore" });
          }
        }
      } catch (error) {
        // Ignore errors when trying to remove keys - agent might be empty
      }

      // Add the new key
      execSync(`ssh-add "${keyPath}"`);
    } catch (error) {
      throw new Error(`Failed to add SSH key to agent: ${error}`);
    }
  }

  public removeSSHKeyFromAgent(keyPath: string): void {
    try {
      const fingerprint = this.getSSHKeyFingerprint(keyPath);
      if (fingerprint) {
        execSync(`ssh-add -d "${fingerprint}"`);
      }
    } catch (error) {
      // Ignore errors when removing keys
    }
  }

  public clearSSHAgent(): void {
    try {
      execSync("ssh-add -D");
    } catch (error) {
      // Ignore errors when clearing agent
    }
  }

  public getSSHKeyFingerprint(keyPath: string): string | null {
    try {
      const output = execSync(`ssh-keygen -lf "${keyPath}"`, {
        encoding: "utf8",
      });
      const match = output.match(/^(\d+ [a-f0-9:]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  public validateSSHKey(keyPath: string): boolean {
    try {
      if (!fs.existsSync(keyPath)) {
        return false;
      }

      // Check if it's a valid SSH key by trying to read it
      const keyContent = fs.readFileSync(keyPath, "utf8");
      return (
        keyContent.includes("-----BEGIN OPENSSH PRIVATE KEY-----") ||
        keyContent.includes("-----BEGIN RSA PRIVATE KEY-----")
      );
    } catch {
      return false;
    }
  }

  public fixSSHKeyPermissions(keyPath: string): void {
    try {
      if (fs.existsSync(keyPath)) {
        // Set private key permissions to 600 (user read/write only)
        fs.chmodSync(keyPath, 0o600);

        // Set public key permissions to 644 (user read/write, others read)
        const publicKeyPath = `${keyPath}.pub`;
        if (fs.existsSync(publicKeyPath)) {
          fs.chmodSync(publicKeyPath, 0o644);
        }
      }
    } catch (error) {
      throw new Error(`Failed to fix SSH key permissions: ${error}`);
    }
  }

  public backupSSHKey(keyPath: string, backupDir: string): string {
    try {
      const keyName = path.basename(keyPath);
      const backupPath = path.join(
        backupDir,
        `${keyName}_backup_${Date.now()}`
      );

      fs.ensureDirSync(backupDir);
      fs.copySync(keyPath, backupPath);

      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup SSH key: ${error}`);
    }
  }
}
