#!/usr/bin/env bash
source ./.scripts/colors.sh 2>/dev/null;
source ./colors.sh 2>/dev/null;

NODE_MODULES=node_modules

configs=(
    default.json
    development.json
    production.json
    testing.json
    secret.json
)

for cfg in "${configs[@]}"; do
    if [ ! -f "config/$cfg" ]; then
        echo "Copying $cfg"
        cp ".scripts/templates/$cfg" config/
    fi
done

mkdir -p logs 2> /dev/null
