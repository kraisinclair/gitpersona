import chalk from "chalk";
import inquirer from "inquirer";
import { PersonaManager } from "../utils/persona";
import { SSHManager } from "../utils/ssh";
import { EditOptions } from "../types";

export async function editPersona(name: string): Promise<void> {
  const personaManager = new PersonaManager();
  const sshManager = new SSHManager();

  // Find persona by name
  const persona = personaManager.getPersonaByName(name);
  if (!persona) {
    throw new Error(
      `Persona "${name}" not found. Use "gitpersona list" to see available personas.`
    );
  }

  console.log(chalk.blue(`=== Edit Persona: ${name} ===\n`));
  console.log(`Current configuration:`);
  console.log(`  Name: ${persona.name}`);
  console.log(`  Git User Name: ${persona.gitUserName}`);
  console.log(`  Email: ${persona.email}`);
  console.log(`  SSH Key: ${persona.sshKeyPath}`);
  if (persona.autoActivatePaths && persona.autoActivatePaths.length > 0) {
    console.log(`  Auto-activate in: ${persona.autoActivatePaths.join(", ")}`);
  }
  console.log("");

  // What to edit
  const editChoices = await inquirer.prompt([
    {
      type: "checkbox",
      name: "fields",
      message: "What would you like to edit?",
      choices: [
        { name: "Name", value: "name" },
        { name: "Git User Name", value: "gitUserName" },
        { name: "Email", value: "email" },
        { name: "SSH Key", value: "sshKey" },
        { name: "Auto-activation paths", value: "autoActivate" },
      ],
    },
  ]);

  const updates: EditOptions = {};

  // Edit name
  if (editChoices.fields.includes("name")) {
    const nameAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter new name:",
        default: persona.name,
        validate: (input: string) => {
          if (!input.trim()) {
            return "Persona name is required";
          }
          const existing = personaManager.getPersonaByName(input.trim());
          if (existing && existing.id !== persona.id) {
            return "Persona with this name already exists";
          }
          return true;
        },
      },
    ]);
    updates.name = nameAnswer.name.trim();
  }

  // Edit git user name
  if (editChoices.fields.includes("gitUserName")) {
    const gitUserNameAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "gitUserName",
        message: "Enter new git user name:",
        default: persona.gitUserName,
        validate: (input: string) => {
          if (!input.trim()) {
            return "Git user name is required";
          }
          return true;
        },
      },
    ]);
    updates.gitUserName = gitUserNameAnswer.gitUserName.trim();
  }

  // Edit email
  if (editChoices.fields.includes("email")) {
    const emailAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Enter new email:",
        default: persona.email,
        validate: (input: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            return "Please enter a valid email address";
          }
          return true;
        },
      },
    ]);
    updates.email = emailAnswer.email.trim();
  }

  // Edit SSH key
  if (editChoices.fields.includes("sshKey")) {
    const existingKeys = sshManager.getExistingSSHKeys();

    if (existingKeys.length === 0) {
      console.log(chalk.yellow("No existing SSH keys found."));
      const createNewAnswer = await inquirer.prompt([
        {
          type: "confirm",
          name: "createNew",
          message: "Would you like to create a new SSH key?",
          default: false,
        },
      ]);

      if (createNewAnswer.createNew) {
        const keyNameAnswer = await inquirer.prompt([
          {
            type: "input",
            name: "keyName",
            message: "Enter SSH key name:",
            default: updates.name || persona.name,
          },
        ]);

        try {
          const email = updates.email || persona.email;
          const sshKey = await sshManager.createSSHKey(
            keyNameAnswer.keyName,
            email
          );
          updates.sshKeyPath = sshKey.path;
          console.log(chalk.green(`✓ New SSH key created: ${sshKey.path}`));
        } catch (error) {
          console.error(chalk.red(`Failed to create SSH key: ${error}`));
          return;
        }
      }
    } else {
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
          message: "Select new SSH key:",
          choices: keyChoices,
        },
      ]);

      updates.sshKeyPath = keyAnswer.sshKey;
    }
  }

  // Edit auto-activation paths
  if (editChoices.fields.includes("autoActivate")) {
    const currentPaths = persona.autoActivatePaths || [];
    const pathsAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "paths",
        message:
          "Enter directory paths (comma-separated, leave empty to clear):",
        default: currentPaths.join(", "),
        validate: (input: string) => {
          if (!input.trim()) return true; // Allow empty
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

    if (pathsAnswer.paths.trim()) {
      updates.autoActivatePaths = pathsAnswer.paths
        .split(",")
        .map((p: string) => p.trim())
        .filter((p: string) => p);
    } else {
      updates.autoActivatePaths = [];
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log(chalk.yellow("No changes selected."));
    return;
  }

  // Show changes
  console.log(chalk.blue("\n=== Changes to Apply ==="));
  if (updates.name) console.log(`Name: ${persona.name} → ${updates.name}`);
  if (updates.gitUserName)
    console.log(
      `Git User Name: ${persona.gitUserName} → ${updates.gitUserName}`
    );
  if (updates.email) console.log(`Email: ${persona.email} → ${updates.email}`);
  if (updates.sshKeyPath)
    console.log(`SSH Key: ${persona.sshKeyPath} → ${updates.sshKeyPath}`);
  if (updates.autoActivatePaths !== undefined) {
    const oldPaths = persona.autoActivatePaths || [];
    const newPaths = updates.autoActivatePaths;
    console.log(
      `Auto-activation: ${oldPaths.join(", ") || "none"} → ${
        newPaths.join(", ") || "none"
      }`
    );
  }

  const confirmAnswer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Apply these changes?",
      default: true,
    },
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.yellow("Changes cancelled."));
    return;
  }

  try {
    // Apply updates
    const updatedPersona = personaManager.editPersona(persona.id, updates);

    console.log(chalk.green("\n✓ Persona updated successfully!"));
    console.log(`\nUpdated configuration:`);
    console.log(`  Name: ${updatedPersona.name}`);
    console.log(`  Git User Name: ${updatedPersona.gitUserName}`);
    console.log(`  Email: ${updatedPersona.email}`);
    console.log(`  SSH Key: ${updatedPersona.sshKeyPath}`);
    if (
      updatedPersona.autoActivatePaths &&
      updatedPersona.autoActivatePaths.length > 0
    ) {
      console.log(
        `  Auto-activate in: ${updatedPersona.autoActivatePaths.join(", ")}`
      );
    }

    // If this persona is active, show activation status
    if (updatedPersona.isActive) {
      console.log(chalk.blue("\nThis persona is currently active."));
      console.log(
        "Git configuration and SSH agent have been updated automatically."
      );
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to update persona: ${error}`));
    throw error;
  }
}

import path from "path";
