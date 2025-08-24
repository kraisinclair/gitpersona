import chalk from "chalk";
import { ConfigManager } from "../utils/config";
import { SSHManager } from "../utils/ssh";

export async function fixConfiguration(): Promise<void> {
  console.log(chalk.blue("=== Fixing Configuration Issues ===\n"));

  const configManager = new ConfigManager();
  const sshManager = new SSHManager();

  try {
    // Fix SSH key paths
    configManager.fixSSHKeyPaths();

    // Fix SSH key permissions for all personas
    const personas = configManager.getPersonas();
    for (const persona of personas) {
      if (persona.sshKeyPath) {
        try {
          sshManager.fixSSHKeyPermissions(persona.sshKeyPath);
          console.log(chalk.green(`✓ Fixed permissions for ${persona.name}`));
        } catch (error) {
          console.log(
            chalk.yellow(
              `⚠ Could not fix permissions for ${persona.name}: ${error}`
            )
          );
        }
      }
    }

    console.log(chalk.green("\n✓ Configuration issues fixed!"));
    console.log("\nYou can now try activating your personas again.");
  } catch (error) {
    console.error(chalk.red(`✗ Failed to fix configuration: ${error}`));
    throw error;
  }
}
