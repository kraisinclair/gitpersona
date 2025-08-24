#!/bin/bash

# GitPersona Auto-activation Script
# Source this script in your .bashrc, .zshrc, or similar shell profile
# Example: source ~/path/to/gitpersona/scripts/auto-activate.sh

# Function to check and auto-activate persona
gitpersona_auto_activate() {
    # Only run if gitpersona is available
    if command -v gitpersona >/dev/null 2>&1; then
        # Get current directory
        local current_dir=$(pwd)
        
        # Check if auto-activation should trigger
        local activated=$(gitpersona check-auto 2>/dev/null | grep "Auto-activated persona:" | cut -d':' -f2 | xargs)
        
        if [ -n "$activated" ]; then
            echo "🔄 Auto-activated GitPersona: $activated"
        fi
    fi
}

# Hook into directory changes
if [[ -n "$BASH_VERSION" ]]; then
    # Bash
    export PROMPT_COMMAND="gitpersona_auto_activate; $PROMPT_COMMAND"
elif [[ -n "$ZSH_VERSION" ]]; then
    # Zsh
    precmd_functions+=(gitpersona_auto_activate)
fi

# Also run on shell startup
gitpersona_auto_activate
