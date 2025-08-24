import chalk from "chalk";
import { PersonaManager } from "../utils/persona";
import { GitManager } from "../utils/git";

export async function showActivePersona(): Promise<void> {
  const personaManager = new PersonaManager();
  const gitManager = new GitManager();

  const activePersona = personaManager.getActivePersona();

  if (!activePersona) {
    console.log(chalk.yellow("No active persona"));

    // Show current git config if available
    const gitConfig = gitManager.getGitConfig();
    if (gitConfig) {
      console.log(chalk.blue("\nCurrent git configuration:"));
      console.log(`  Name: ${gitConfig.user.name}`);
      console.log(`  Email: ${gitConfig.user.email}`);
    }

    return;
  }

  console.log(chalk.green("=== Active Persona ==="));
  console.log(`Name: ${activePersona.name}`);
  console.log(`Git User Name: ${activePersona.gitUserName}`);
  console.log(`Email: ${activePersona.email}`);
  console.log(`SSH Key: ${activePersona.sshKeyPath}`);
  console.log(
    `Created: ${new Date(activePersona.createdAt).toLocaleDateString()}`
  );
  console.log(
    `Updated: ${new Date(activePersona.updatedAt).toLocaleDateString()}`
  );

  if (
    activePersona.autoActivatePaths &&
    activePersona.autoActivatePaths.length > 0
  ) {
    console.log(chalk.blue("\nAuto-activation paths:"));
    activePersona.autoActivatePaths.forEach((path) => {
      console.log(`  - ${path}`);
    });
  }

  // Show current git config
  const gitConfig = gitManager.getGitConfig();
  if (gitConfig) {
    console.log(chalk.blue("\nCurrent git configuration:"));
    console.log(`  Name: ${gitConfig.user.name}`);
    console.log(`  Email: ${gitConfig.user.email}`);

    // Check if git config matches persona
    if (
      gitConfig.user.name === activePersona.gitUserName &&
      gitConfig.user.email === activePersona.email
    ) {
      console.log(chalk.green("✓ Git config matches persona"));
    } else {
      console.log(chalk.yellow("⚠ Git config does not match persona"));
    }
  }

  // Show SSH agent status
  console.log(chalk.blue("\nSSH Agent Status:"));
  try {
    const { execSync } = require("child_process");
    const sshAddOutput = execSync("ssh-add -l", { encoding: "utf8" });
    if (sshAddOutput.includes("no identities")) {
      console.log(chalk.yellow("⚠ No SSH keys loaded in agent"));
    } else {
      console.log(chalk.green("✓ SSH keys loaded in agent"));
      console.log(sshAddOutput);
    }
  } catch (error) {
    console.log(chalk.red("✗ Failed to check SSH agent status"));
  }
}
