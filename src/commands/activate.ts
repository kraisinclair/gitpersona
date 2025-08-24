import chalk from "chalk";
import { PersonaManager } from "../utils/persona";

export async function activatePersona(name: string): Promise<void> {
  const personaManager = new PersonaManager();

  // Find persona by name
  const persona = personaManager.getPersonaByName(name);
  if (!persona) {
    throw new Error(
      `Persona "${name}" not found. Use "gitpersona list" to see available personas.`
    );
  }

  // Check if already active
  const activePersona = personaManager.getActivePersona();
  if (activePersona && activePersona.id === persona.id) {
    console.log(chalk.yellow(`Persona "${name}" is already active.`));
    return;
  }

  console.log(chalk.blue(`Activating persona: ${name}`));
  console.log(`Git User Name: ${persona.gitUserName}`);
  console.log(`Email: ${persona.email}`);
  console.log(`SSH Key: ${persona.sshKeyPath}`);

  try {
    // Activate the persona
    personaManager.activatePersona(persona.id);

    console.log(chalk.green(`\n✓ Successfully activated persona "${name}"`));
    console.log(`\nGit configuration updated:`);
    console.log(`  user.name = ${persona.gitUserName}`);
    console.log(`  user.email = ${persona.email}`);
    console.log(`\nSSH key added to agent: ${persona.sshKeyPath}`);

    // Show current status
    console.log(chalk.blue("\n=== Current Status ==="));
    const status = personaManager.getPersonaStatus();
    console.log(`Active persona: ${status.active?.name}`);
    console.log(`Total personas: ${status.total}`);
  } catch (error) {
    console.error(chalk.red(`\n✗ Failed to activate persona: ${error}`));
    throw error;
  }
}
