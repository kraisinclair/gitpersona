import chalk from "chalk";
import inquirer from "inquirer";
import { PersonaManager } from "../utils/persona";
import { SSHManager } from "../utils/ssh";
import { SetupOptions } from "../types";

export async function setupPersona(): Promise<void> {
  console.log(chalk.blue("=== Setup New Persona ===\n"));

  const personaManager = new PersonaManager();
  const sshManager = new SSHManager();

  // Get persona name
  const nameAnswer = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter persona name:",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Persona name is required";
        }
        if (personaManager.getPersonaByName(input.trim())) {
          return "Persona with this name already exists";
        }
        return true;
      },
    },
  ]);

  // Get git user name
  const gitUserNameAnswer = await inquirer.prompt([
    {
      type: "input",
      name: "gitUserName",
      message: "Enter git user name:",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Git user name is required";
        }
        return true;
      },
    },
  ]);

  // Get email
  const emailAnswer = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Enter email address:",
      validate: (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return "Please enter a valid email address";
        }
        return true;
      },
    },
  ]);

  // Check for existing SSH keys
  const existingKeys = sshManager.getExistingSSHKeys();

  let sshKeyChoice: "existing" | "new" | "none";
  let sshKeyPath: string | undefined;
  let createNewSSHKey = false;
  let sshKeyName: string | undefined;

  if (existingKeys.length > 0) {
    const sshChoiceAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "sshChoice",
        message: "SSH Key options:",
        choices: [
          { name: "Use existing SSH key", value: "existing" },
          { name: "Create new SSH key", value: "new" },
          { name: "No SSH key for now", value: "none" },
        ],
      },
    ]);

    sshKeyChoice = sshChoiceAnswer.sshChoice;

    if (sshKeyChoice === "existing") {
      const keyChoices = existingKeys.map((key) => ({
        name: `${path.basename(key)} (${
          sshManager.getSSHKeyInfo(key)?.email || "unknown"
        })`,
        value: key,
      }));

      const keyAnswer = await inquirer.prompt([
        {
          type: "list",
          name: "sshKey",
          message: "Select SSH key:",
          choices: keyChoices,
        },
      ]);

      // Convert public key path to private key path
      sshKeyPath = keyAnswer.sshKey.replace(".pub", "");
      sshKeyName = path.basename(sshKeyPath!);

      // Fix permissions for the selected key
      if (sshKeyPath) {
        sshManager.fixSSHKeyPermissions(sshKeyPath);
      }
    } else if (sshKeyChoice === "new") {
      createNewSSHKey = true;
      sshKeyName = nameAnswer.name;
    }
  } else {
    const noKeysAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "sshChoice",
        message: "No existing SSH keys found:",
        choices: [
          { name: "Create new SSH key", value: "new" },
          { name: "No SSH key for now", value: "none" },
        ],
      },
    ]);

    sshKeyChoice = noKeysAnswer.sshChoice;
    if (sshKeyChoice === "new") {
      createNewSSHKey = true;
      sshKeyName = nameAnswer.name;
    }
  }

  // Auto-activation paths
  const autoActivateAnswer = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoActivate",
      message: "Set up auto-activation for specific directories?",
      default: false,
    },
  ]);

  let autoActivatePaths: string[] | undefined;

  if (autoActivateAnswer.autoActivate) {
    const pathsAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "paths",
        message: "Enter directory paths (comma-separated):",
        default: process.cwd(),
        validate: (input: string) => {
          const paths = input.split(",").map((p) => p.trim());
          for (const path of paths) {
            if (!path) continue;
            try {
              require("fs").realpathSync(path);
            } catch {
              return `Directory does not exist: ${path}`;
            }
          }
          return true;
        },
      },
    ]);

    autoActivatePaths = pathsAnswer.paths
      .split(",")
      .map((p: string) => p.trim())
      .filter((p: string) => p);
  }

  // Confirm setup
  console.log(chalk.blue("\n=== Persona Configuration ==="));
  console.log(`Name: ${nameAnswer.name}`);
  console.log(`Git User Name: ${gitUserNameAnswer.gitUserName}`);
  console.log(`Email: ${emailAnswer.email}`);

  if (sshKeyChoice === "existing" && sshKeyPath) {
    console.log(`SSH Key: ${sshKeyPath} (existing)`);
  } else if (createNewSSHKey) {
    console.log(`SSH Key: Will create new key named "${sshKeyName}"`);
  } else {
    console.log(`SSH Key: None`);
  }

  if (autoActivatePaths && autoActivatePaths.length > 0) {
    console.log(`Auto-activate in: ${autoActivatePaths.join(", ")}`);
  }

  const confirmAnswer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Create this persona?",
      default: true,
    },
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.yellow("Persona setup cancelled."));
    return;
  }

  try {
    const setupOptions: SetupOptions = {
      name: nameAnswer.name,
      gitUserName: gitUserNameAnswer.gitUserName,
      email: emailAnswer.email,
      sshKeyPath,
      createNewSSHKey,
      sshKeyName,
      autoActivatePaths,
    };

    const persona = await personaManager.setupPersona(setupOptions);

    console.log(chalk.green("\n✓ Persona created successfully!"));
    console.log(`\nTo activate this persona, run:`);
    console.log(chalk.blue(`  gitpersona activate ${persona.name}`));

    if (autoActivatePaths && autoActivatePaths.length > 0) {
      console.log(`\nThis persona will auto-activate when you navigate to:`);
      autoActivatePaths.forEach((path) => {
        console.log(chalk.blue(`  ${path}`));
      });
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to create persona: ${error}`));
    throw error;
  }
}

import path from "path";
