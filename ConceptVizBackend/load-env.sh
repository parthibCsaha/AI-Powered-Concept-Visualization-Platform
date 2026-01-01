#!/bin/bash
# Load environment variables from .env file
# Usage: source load-env.sh

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Load environment variables, skipping comments and empty lines
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! "$key" =~ ^#.* ]] && [[ -n "$key" ]]; then
        # Remove leading/trailing whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        # Export the variable
        export "$key=$value"
        echo "Loaded: $key"
    fi
done < .env

echo "✅ Environment variables loaded successfully!"

