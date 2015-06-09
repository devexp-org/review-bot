#!/usr/bin/env bash

NODE_MODULES=node_modules

if [ ! -d $NODE_MODULES/app ]; then
    ln -sf ../modules $NODE_MODULES
fi
