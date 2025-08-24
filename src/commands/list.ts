import chalk from "chalk";
import { PersonaManager } from "../utils/persona";

export async function listPersonas(): Promise<void> {
  const personaManager = new PersonaManager();
  const personas = personaManager.getAllPersonas();

  if (personas.length === 0) {
    console.log(chalk.yellow("No personas configured yet."));
    console.log(
      chalk.blue('Use "gitpersona setup" to create your first persona.')
    );
    return;
  }

  console.log(chalk.blue(`=== Available Personas (${personas.length}) ===\n`));

  personas.forEach((persona, index) => {
    const status = persona.isActive ? chalk.green("● ACTIVE") : chalk.gray("○");
    const separator = index < personas.length - 1 ? "\n" : "";

    console.log(`${status} ${chalk.bold(persona.name)}`);
    console.log(`   Git User Name: ${persona.gitUserName}`);
    console.log(`   Email: ${persona.email}`);
    console.log(`   SSH Key: ${persona.sshKeyPath}`);
    console.log(
      `   Created: ${new Date(persona.createdAt).toLocaleDateString()}`
    );
    console.log(
      `   Updated: ${new Date(persona.updatedAt).toLocaleDateString()}`
    );

    if (persona.autoActivatePaths && persona.autoActivatePaths.length > 0) {
      console.log(`   Auto-activate: ${persona.autoActivatePaths.join(", ")}`);
    }

    console.log(separator);
  });

  // Show summary
  const activeCount = personas.filter((p) => p.isActive).length;
  const autoActivationCount = personas.filter(
    (p) => p.autoActivatePaths && p.autoActivatePaths.length > 0
  ).length;

  console.log(chalk.blue("=== Summary ==="));
  console.log(`Total personas: ${personas.length}`);
  console.log(`Active: ${activeCount}`);
  console.log(`With auto-activation: ${autoActivationCount}`);
}
