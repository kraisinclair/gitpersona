# GitPersona Usage Guide

This guide provides detailed information on how to use GitPersona effectively for managing multiple git and SSH personas.

## Quick Start

1. **Install GitPersona:**

   ```bash
   npm install -g gitpersona
   ```

2. **Create your first persona:**

   ```bash
   gitpersona setup
   ```

3. **Activate a persona:**
   ```bash
   gitpersona activate <persona-name>
   ```

## Commands Reference

### `gitpersona show`

Shows the currently active persona with detailed information.

**Example:**

```bash
$ gitpersona show
=== Active Persona ===
Name: work
Email: developer@company.com
SSH Key: /Users/username/.ssh/id_rsa_work
Created: 1/1/2024
Updated: 1/1/2024

Auto-activation paths:
  - /Users/username/Projects/work
  - /Users/username/Projects/company

Current git configuration:
  Name: developer@company.com
  Email: developer@company.com
✓ Git config matches persona

SSH Agent Status:
✓ SSH keys loaded in agent
4096 SHA256:abc123... username@hostname (RSA)
```

### `gitpersona list`

Lists all available personas with their status.

**Example:**

```bash
$ gitpersona list
=== Available Personas (3) ===

● ACTIVE work
   Email: developer@company.com
   SSH Key: /Users/username/.ssh/id_rsa_work
   Created: 1/1/2024
   Updated: 1/1/2024
   Auto-activate: /Users/username/Projects/work, /Users/username/Projects/company

○ personal
   Email: dev@personal.com
   SSH Key: /Users/username/.ssh/id_rsa_personal
   Created: 1/1/2024
   Updated: 1/1/2024
   Auto-activate: /Users/username/Projects/personal

○ client-project
   Email: dev@clientproject.com
   SSH Key: /Users/username/.ssh/id_rsa_client
   Created: 1/1/2024
   Updated: 1/1/2024
   Auto-activate: /Users/username/Projects/client-project

=== Summary ===
Total personas: 3
Active: 1
With auto-activation: 3
```

### `gitpersona setup`

Interactive setup for creating a new persona.

**Example workflow:**

```bash
$ gitpersona setup
=== Setup New Persona ===

Enter persona name: freelance-project
Enter git user name: John Doe
Enter email address: dev@freelance.com

SSH Key options:
❯ Use existing SSH key
  Create new SSH key
  No SSH key for now

Select SSH key: /Users/username/.ssh/id_rsa_freelance (dev@freelance.com)

Set up auto-activation for specific directories? (Y/n) y
Enter directory paths (comma-separated): /Users/username/Projects/freelance

=== Persona Configuration ===
Name: freelance-project
Git User Name: John Doe
Email: dev@freelance.com
SSH Key: /Users/username/.ssh/id_rsa_freelance (existing)
Auto-activate in: /Users/username/Projects/freelance

Create this persona? (Y/n) y

✓ Persona created successfully!

To activate this persona, run:
  gitpersona activate freelance-project

This persona will auto-activate when you navigate to:
  /Users/username/Projects/freelance
```

### `gitpersona activate <name>`

Activates a specific persona.

**Example:**

```bash
$ gitpersona activate personal
Activating persona: personal
Git User Name: John Doe
Email: dev@personal.com
SSH Key: /Users/username/.ssh/id_rsa_personal

✓ Successfully activated persona "personal"

Git configuration updated:
  user.name = John Doe
  user.email = dev@personal.com

SSH key added to agent: /Users/username/.ssh/id_rsa_personal

=== Current Status ===
Active persona: personal
Total personas: 3
```

### `gitpersona edit <name>`

Edits an existing persona.

**Example:**

```bash
$ gitpersona edit work
=== Edit Persona: work ===

Current configuration:
  Name: work
  Git User Name: John Doe
  Email: developer@company.com
  SSH Key: /Users/username/.ssh/id_rsa_work
  Auto-activate in: /Users/username/Projects/work, /Users/username/Projects/company

What would you like to edit? (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯ ◉ Name
  ◉ Git User Name
  ◉ Email
  ◉ SSH Key
  ◉ Auto-activation paths

Enter new name: work-company
Enter new email: dev@workcompany.com

=== Changes to Apply ===
Name: work → work-company
Email: developer@company.com → dev@workcompany.com

Apply these changes? (Y/n) y

✓ Persona updated successfully!

Updated configuration:
  Name: work-company
  Email: dev@workcompany.com
  SSH Key: /Users/username/.ssh/id_rsa_work
  Auto-activate in: /Users/username/Projects/work, /Users/username/Projects/company

This persona is currently active.
Git configuration and SSH agent have been updated automatically.
```

### `gitpersona delete <name>`

Deletes a persona.

**Example:**

```bash
$ gitpersona delete old-project
=== Delete Persona: old-project ===

Persona details:
  Name: old-project
  Git User Name: John Doe
  Email: dev@oldproject.com
  SSH Key: /Users/username/.ssh/id_rsa_old
  Created: 1/1/2024
  Status: Inactive

Are you sure you want to delete persona "old-project"? (y/N) y

✓ Persona "old-project" deleted successfully!

Remaining personas: 2
  - work-company (active)
  - personal
```

### `gitpersona status`

Shows overall persona status.

**Example:**

```bash
$ gitpersona status
=== GitPersona Status ===
Total personas: 3
Active persona: work-company
Git User Name: John Doe
Email: dev@workcompany.com
SSH Key: /Users/username/.ssh/id_rsa_work

Auto-activation paths:
  - /Users/username/Projects/work
  - /Users/username/Projects/company
  - /Users/username/Projects/personal
  - /Users/username/Projects/freelance
```

### `gitpersona check-auto`

Checks if auto-activation should trigger for the current directory.

**Example:**

```bash
$ cd /Users/username/Projects/work
$ gitpersona check-auto
Auto-activated persona: work-company
Git User Name: John Doe
Email: dev@workcompany.com
SSH Key: /Users/username/.ssh/id_rsa_work
```

## Auto-activation Setup

### Shell Integration

To enable automatic persona switching based on directory, add this to your shell profile:

**For Bash (.bashrc):**

```bash
source ~/path/to/gitpersona/scripts/auto-activate.sh
```

**For Zsh (.zshrc):**

```bash
source ~/path/to/gitpersona/scripts/auto-activate.sh
```

### How Auto-activation Works

1. **Directory Monitoring**: The script monitors your current directory
2. **Path Matching**: When you change directories, it checks if any persona has auto-activation paths that match
3. **Automatic Switching**: If a match is found, the persona is automatically activated
4. **Configuration Update**: Git config and SSH agent are updated accordingly

### Auto-activation Best Practices

- **Use absolute paths**: Always use full paths for auto-activation
- **Be specific**: Avoid overly broad paths that might trigger unexpectedly
- **Test thoroughly**: Verify auto-activation works in your workflow
- **Monitor performance**: Auto-activation runs on every directory change

## SSH Key Management

### Creating New SSH Keys

When setting up a persona, you can choose to create a new SSH key:

```bash
$ gitpersona setup
# ... other prompts ...
SSH Key options:
  Use existing SSH key
❯ Create new SSH key
  No SSH key for now

Enter SSH key name: new-project
```

The tool will:

1. Generate a new RSA key pair
2. Store it in `~/.ssh/id_rsa_new-project`
3. Add it to your persona configuration
4. Optionally add it to the SSH agent

### Using Existing SSH Keys

You can also use existing SSH keys:

```bash
$ gitpersona setup
# ... other prompts ...
SSH Key options:
❯ Use existing SSH key
  Create new SSH key
  No SSH key for now

Select SSH key: /Users/username/.ssh/id_rsa_existing (user@domain.com)
```

### SSH Key Validation

The tool validates SSH keys by:

- Checking file existence
- Verifying key format
- Ensuring private/public key pairs match

## Git Configuration

### Repository vs Global Config

- **In Git Repository**: Persona settings are applied to the current repository
- **Outside Repository**: Persona settings are applied globally

### Configuration Verification

Use `gitpersona show` to verify that git configuration matches your active persona:

```bash
$ gitpersona show
# ... persona info ...

Current git configuration:
  Name: work-company
  Email: dev@workcompany.com
✓ Git config matches persona
```

## Best Practices

### 1. Naming Conventions

- Use descriptive names: `work`, `personal`, `client-project`
- Avoid generic names: `default`, `main`, `user`
- Include context: `company-work`, `freelance-client`

### 2. Email Management

- Use consistent email patterns for each context
- Consider using `+` aliases: `dev+work@company.com`
- Keep work and personal emails separate

### 3. SSH Key Organization

- Use descriptive key names: `id_rsa_work`, `id_rsa_personal`
- Store keys in `~/.ssh/` directory
- Use passphrase protection for sensitive keys

### 4. Auto-activation Paths

- Use absolute paths for reliability
- Group related projects under common parent directories
- Test auto-activation in your workflow

### 5. Regular Maintenance

- Review personas periodically
- Clean up unused personas
- Update SSH keys when needed
- Verify auto-activation paths

## Troubleshooting

### Common Issues

1. **Persona not activating:**

   - Check if SSH key exists and is valid
   - Verify git repository status
   - Check SSH agent status

2. **Auto-activation not working:**

   - Ensure shell integration is properly set up
   - Verify auto-activation paths are correct
   - Check for path permission issues

3. **SSH key errors:**

   - Verify key file permissions (600 for private keys)
   - Check if key is in SSH agent
   - Validate key format

4. **Git config issues:**
   - Check repository vs global config
   - Verify persona is active
   - Check for conflicting git configurations

### Debug Commands

```bash
# Check SSH agent status
ssh-add -l

# Verify git configuration
git config --list | grep user

# Check persona status
gitpersona status

# Test auto-activation
gitpersona check-auto
```

## Advanced Usage

### Multiple Auto-activation Paths

You can set multiple paths for a single persona:

```bash
$ gitpersona setup
# ... other prompts ...
Enter directory paths (comma-separated): /Users/username/Projects/work, /Users/username/Projects/company, /Users/username/Projects/legacy
```

### Conditional Activation

Use different personas for different project types:

- **Work projects**: `/Users/username/Projects/work/*`
- **Personal projects**: `/Users/username/Projects/personal/*`
- **Client projects**: `/Users/username/Projects/clients/*`

### Integration with Other Tools

- **Shell aliases**: Create shortcuts for common operations
- **Git hooks**: Integrate with pre-commit hooks
- **CI/CD**: Use personas in automated workflows

## Support and Contributing

For issues, questions, or contributions:

1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with detailed information
4. Submit pull requests for improvements

## License

This project is licensed under the MIT License.
