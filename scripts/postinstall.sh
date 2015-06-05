#!/usr/bin/env bash

NODE_MODULES=node_modules

if [ ! -d $NODE_MODULES/app ]; then
    ln -s ../modules $NODE_MODULES/modules
fi
