import chalk from "chalk";
import inquirer from "inquirer";
import { PersonaManager } from "../utils/persona";

export async function deletePersona(name: string): Promise<void> {
  const personaManager = new PersonaManager();

  // Find persona by name
  const persona = personaManager.getPersonaByName(name);
  if (!persona) {
    throw new Error(
      `Persona "${name}" not found. Use "gitpersona list" to see available personas.`
    );
  }

  console.log(chalk.blue(`=== Delete Persona: ${name} ===\n`));
  console.log(`Persona details:`);
  console.log(`  Name: ${persona.name}`);
  console.log(`  Git User Name: ${persona.gitUserName}`);
  console.log(`  Email: ${persona.email}`);
  console.log(`  SSH Key: ${persona.sshKeyPath}`);
  console.log(`  Created: ${new Date(persona.createdAt).toLocaleDateString()}`);
  console.log(
    `  Status: ${
      persona.isActive ? chalk.green("ACTIVE") : chalk.gray("Inactive")
    }`
  );

  if (persona.autoActivatePaths && persona.autoActivatePaths.length > 0) {
    console.log(`  Auto-activate in: ${persona.autoActivatePaths.join(", ")}`);
  }

  console.log("");

  // Show warning if this is the active persona
  if (persona.isActive) {
    console.log(chalk.yellow("⚠ WARNING: This persona is currently active!"));
    console.log(
      chalk.yellow(
        "   Deleting it will remove it from the SSH agent and clear git configuration."
      )
    );
    console.log("");
  }

  // Show warning if this persona has auto-activation paths
  if (persona.autoActivatePaths && persona.autoActivatePaths.length > 0) {
    console.log(
      chalk.yellow(
        "⚠ WARNING: This persona has auto-activation paths configured."
      )
    );
    console.log(
      chalk.yellow("   Deleting it will remove these auto-activation rules.")
    );
    console.log("");
  }

  // Confirm deletion
  const confirmAnswer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to delete persona "${name}"?`,
      default: false,
    },
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.yellow("Persona deletion cancelled."));
    return;
  }

  // Additional confirmation for active personas
  if (persona.isActive) {
    const activeConfirmAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message:
          "This persona is currently active. Deleting it will clear your git configuration. Continue?",
        default: false,
      },
    ]);

    if (!activeConfirmAnswer.confirm) {
      console.log(chalk.yellow("Persona deletion cancelled."));
      return;
    }
  }

  try {
    // Delete the persona
    personaManager.deletePersona(persona.id);

    console.log(chalk.green(`\n✓ Persona "${name}" deleted successfully!`));

    // Show what was affected
    if (persona.isActive) {
      console.log(chalk.blue("\nChanges made:"));
      console.log("  - Persona removed from SSH agent");
      console.log("  - Git configuration cleared");
      console.log("  - No active persona");
    }

    if (persona.autoActivatePaths && persona.autoActivatePaths.length > 0) {
      console.log(chalk.blue("\nAuto-activation paths removed:"));
      persona.autoActivatePaths.forEach((path) => {
        console.log(`  - ${path}`);
      });
    }

    // Show remaining personas
    const remainingPersonas = personaManager.getAllPersonas();
    if (remainingPersonas.length > 0) {
      console.log(
        chalk.blue(`\nRemaining personas: ${remainingPersonas.length}`)
      );
      remainingPersonas.forEach((p) => {
        console.log(`  - ${p.name}${p.isActive ? " (active)" : ""}`);
      });

      if (remainingPersonas.length === 1 && !remainingPersonas[0].isActive) {
        console.log(
          chalk.yellow(
            "\nTip: You have one remaining persona. Consider activating it:"
          )
        );
        console.log(
          chalk.blue(`  gitpersona activate ${remainingPersonas[0].name}`)
        );
      }
    } else {
      console.log(chalk.yellow("\nNo personas remaining."));
      console.log(
        chalk.blue('Use "gitpersona setup" to create a new persona.')
      );
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to delete persona: ${error}`));
    throw error;
  }
}
