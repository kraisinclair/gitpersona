# GitPersona

A powerful CLI tool for managing multiple git and SSH personas for different projects and clients. Switch between different developer identities seamlessly based on your current directory or manually activate them.

## Features

- 🔐 **SSH Key Management**: Create, select, and manage SSH keys for different personas
- 📧 **Git Configuration**: Manage git user.name and user.email for each persona
- 🚀 **Auto-activation**: Automatically switch personas based on directory paths
- 📋 **Persona Management**: Create, edit, delete, and list all personas
- 🎯 **Easy Switching**: Quick commands to show active persona and switch between them

## Installation

### Global Installation (Recommended)

```bash
npm install -g gitpersona
```

### Local Development

```bash
git clone <repository>
cd gitpersona
npm install
npm run build
npm link
```

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

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
