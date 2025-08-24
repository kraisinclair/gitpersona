# GitPersona

A powerful CLI tool for managing multiple git and SSH personas for different projects and clients. Switch between different developer identities seamlessly based on your current directory or manually activate them.

## Features

- 🔐 **SSH Key Management**: Create, select, and manage SSH keys for different personas
- 📧 **Git Configuration**: Manage git user.name and user.email for each persona
- 🚀 **Auto-activation**: Automatically switch personas based on directory paths
- 📋 **Persona Management**: Create, edit, delete, and list all personas
- 🎯 **Easy Switching**: Quick commands to show active persona and switch between them

## What is GitPersona?

GitPersona is a ready-to-use local development tool that helps developers manage multiple git identities and SSH configurations. Whether you're working on personal projects, company work, or client projects, GitPersona allows you to maintain separate git configurations and SSH keys for each context.

The tool automatically detects your current working directory and switches to the appropriate persona, ensuring you're always using the correct git identity and SSH key for your current project.

## Usage

### Basic Commands

```bash
# Show active persona
gitpersona show

# List all personas
gitpersona list

# Setup new persona
gitpersona setup

# Activate a persona
gitpersona activate <persona-name>

# Edit existing persona
gitpersona edit <persona-name>

# Delete persona
gitpersona delete <persona-name>
```

### Command Details

#### `gitpersona show`

Displays the currently active persona with SSH key, email, and name information.

#### `gitpersona list`

Shows all available personas with their configuration details.

#### `gitpersona setup`

Interactive setup for creating a new persona:

- Enter persona name
- Enter git user name
- Select existing SSH key or create new one
- Set git user.email
- Optionally set auto-activation directory

#### `gitpersona activate <persona-name>`

Manually activates a specific persona, updating both git config and SSH agent.

#### `gitpersona edit <persona-name>`

Allows editing of an existing persona's configuration.

#### `gitpersona delete <persona-name>`

Removes a persona and its associated configurations.

## Configuration

The tool stores persona configurations in:

- `~/.gitpersona/config.json` - Persona definitions
- `~/.ssh/` - SSH keys
- Git config files in respective repositories

## Auto-activation

Set up auto-activation by specifying a directory path during persona setup. When you navigate to that directory, the persona will automatically activate.

## Examples

### Setup a Work Persona

```bash
gitpersona setup
# Follow the prompts to create a work persona
# Name: work
# Email: developer@company.com
# SSH Key: ~/.ssh/id_rsa_work
# Auto-activate in: /Users/username/Projects/work
```

### Setup a Client Persona

```bash
gitpersona setup
# Follow the prompts to create a client persona
# Name: client-project
# Email: dev@clientproject.com
# SSH Key: ~/.ssh/id_rsa_client
# Auto-activate in: /Users/username/Projects/client-project
```

## How It Works

GitPersona works by:

1. **Storing Personas**: Each persona contains git configuration (name, email) and SSH key information
2. **Directory Detection**: When you navigate to a configured directory, the tool automatically switches to the appropriate persona
3. **Git Configuration**: Updates the local git config with the persona's name and email
4. **SSH Management**: Manages SSH keys in your SSH agent for secure authentication

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
