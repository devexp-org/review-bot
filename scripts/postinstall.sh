#!/usr/bin/env bash
source ./scripts/colors.sh 2>/dev/null;
source ./colors.sh 2>/dev/null;

NODE_MODULES=node_modules

if [ ! -f config/secret.json ]; then
    echo "Copying empty secret.json"
    cp scripts/templates/secret.json config/
fi

mkdir -p data 2> /dev/null
mkdir -p logs 2> /dev/null
