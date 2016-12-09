#!/bin/sh

curl \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ${2:-pull_request}"   \
  --data-binary "@${1:-tests/e2e/data/pull_request_webhook.json}" \
  "localhost:8080/github/webhook"
