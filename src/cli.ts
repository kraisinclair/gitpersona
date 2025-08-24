#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { PersonaManager } from "./utils/persona";
import { showActivePersona } from "./commands/show";
import { listPersonas } from "./commands/list";
import { setupPersona } from "./commands/setup";
import { activatePersona } from "./commands/activate";
import { editPersona } from "./commands/edit";
import { deletePersona } from "./commands/delete";
import { fixConfiguration } from "./commands/fix";

const program = new Command();

program
  .name("gitpersona")
  .description(
    "Manage multiple git and SSH personas for different projects and clients"
  )
  .version("1.0.0");

// Show active persona
program
  .command("show")
  .description("Show the currently active persona")
  .action(async () => {
    try {
      await showActivePersona();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// List all personas
program
  .command("list")
  .description("List all available personas")
  .action(async () => {
    try {
      await listPersonas();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Setup new persona
program
  .command("setup")
  .description("Setup a new persona")
  .action(async () => {
    try {
      await setupPersona();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Activate persona
program
  .command("activate")
  .description("Activate a specific persona")
  .argument("<name>", "Name of the persona to activate")
  .action(async (name: string) => {
    try {
      await activatePersona(name);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Edit persona
program
  .command("edit")
  .description("Edit an existing persona")
  .argument("<name>", "Name of the persona to edit")
  .action(async (name: string) => {
    try {
      await editPersona(name);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Delete persona
program
  .command("delete")
  .description("Delete a persona")
  .argument("<name>", "Name of the persona to delete")
  .action(async (name: string) => {
    try {
      await deletePersona(name);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Fix configuration issues
program
  .command("fix")
  .description("Fix configuration issues for existing personas")
  .action(async () => {
    try {
      await fixConfiguration();
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Auto-activation check
program
  .command("check-auto")
  .description("Check if auto-activation should trigger for current directory")
  .action(async () => {
    try {
      const personaManager = new PersonaManager();
      const currentPath = process.cwd();
      const activatedPersona = personaManager.checkAutoActivation(currentPath);

      if (activatedPersona) {
        console.log(
          chalk.green(`Auto-activated persona: ${activatedPersona.name}`)
        );
        console.log(
          chalk.blue(`Git User Name: ${activatedPersona.gitUserName}`)
        );
        console.log(chalk.blue(`Email: ${activatedPersona.email}`));
        console.log(chalk.blue(`SSH Key: ${activatedPersona.sshKeyPath}`));
      } else {
        console.log(
          chalk.yellow("No auto-activation triggered for current directory")
        );
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

// Status command
program
  .command("status")
  .description("Show overall persona status")
  .action(async () => {
    try {
      const personaManager = new PersonaManager();
      const status = personaManager.getPersonaStatus();

      console.log(chalk.blue("=== GitPersona Status ==="));
      console.log(`Total personas: ${status.total}`);

      if (status.active) {
        console.log(chalk.green(`Active persona: ${status.active.name}`));
        console.log(`Git User Name: ${status.active.gitUserName}`);
        console.log(`Email: ${status.active.email}`);
        console.log(`SSH Key: ${status.active.sshKeyPath}`);
      } else {
        console.log(chalk.yellow("No active persona"));
      }

      if (status.autoActivationPaths.length > 0) {
        console.log(chalk.blue("\nAuto-activation paths:"));
        status.autoActivationPaths.forEach((path) => {
          console.log(`  - ${path}`);
        });
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

program.parse();
