#!/bin/sh

if [ -z "$1" ]
then
  echo "No argument supplied"
else
  curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: pull_request"   \
    --data-binary "@$1" \
    "localhost:8080/github/webhook"
fi
