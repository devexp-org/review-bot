#!/usr/bin/env bash

NODE_MODULES=node_modules

if [ ! -d $NODE_MODULES/app ]; then
    ln -s ../app $NODE_MODULES/app
fi

mkdir -p data 2> /dev/null
mkdir -p logs 2> /dev/null
