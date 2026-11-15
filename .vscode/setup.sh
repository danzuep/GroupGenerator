#!/usr/bin/env bash

# Setup Instructions for PowerShell / Windows:
# winget install --id Git.Git -e
# winget install --id github.cli -e
# bash -c "./.vscode/setup.sh"

set -e

# Variable Definitions
ORG_NAME="danzuep"
PROJECT_NAME="${1:-${projectName:-GroupGenerator}}"
PROJECT_DESC="Group generator using constraint programming."

echo "Initializing project: ${PROJECT_NAME}..."

# Setup Root Directory
CURRENT_DIR=$(basename "$PWD")

if [ "$CURRENT_DIR" != "${PROJECT_NAME}" ]; then
    if [ ! -d "${PROJECT_NAME}" ]; then
        mkdir -p "${PROJECT_NAME}"
    fi
    cd "${PROJECT_NAME}"
fi

# Setup Git Repo
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# VS Code Workspace Setup
if [ ! -d ".vscode" ]; then
	mkdir -p ".vscode"
	cat << EOF > ".vscode/${PROJECT_NAME}.code-workspace"
{
    "folders": [
        {
            "path": ".."
        }
    ]
}
EOF
fi

# Git Commit & GitHub Repository Creation
# Verify Git identity is set; fall back to local defaults if missing
if git config user.name > /dev/null && git config user.email > /dev/null; then
    git add .vscode
    if git status --porcelain | grep -q .; then
        git commit -m "Initial commit"
    fi

    if ! git remote | grep -q "origin"; then
        gh repo create "${ORG_NAME}/${PROJECT_NAME}" --source=. --public --description "${PROJECT_DESC}" # --confirm
        git push -u origin main
    fi
fi

# LICENSE creation
if [ ! -f "LICENSE" ]; then
    curl -sSL https://raw.githubusercontent.com/licenses/license-templates/master/templates/mit.txt \
        | sed "s/{{ year }}/$(date +%Y)/g; s/{{ organization }}/${ORG_NAME}/g" > LICENSE
    echo "Downloaded and created MIT LICENSE file."
    git add LICENSE
    git commit -m "Add LICENSE"
fi

echo "Project ${PROJECT_NAME} initialized and built successfully."
