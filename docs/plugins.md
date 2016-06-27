# Plugins

## choose-reviewer

Main choose reviewers module. Performs choosing process.

## choose-reviewer-steps

Module responsible for mapping team to configured sequence of "choose reviewer" steps.

Example configuration:

```json
"choose-reviewer-steps": {
  "path": "./core/services/choose-reviewer-steps",
  "options": {
    "team-github": {
      "steps": [
        "choose-reviewer-step-remove-author",
        "choose-reviewer-step-remove-already-reviewers",
        "choose-reviewer-step-random",
        "...",
        "choose-reviewer-step-sort",
        "choose-reviewer-step-total-number"
      ]
    }
  },
  "dependencies": [
    "choose-team",
    "choose-reviewer-step-remove-author",
    "choose-reviewer-step-remove-already-reviewers",
    "choose-reviewer-step-random",
    "...",
    "choose-reviewer-step-sort",
    "choose-reviewer-step-total-number"
  ]
}
```

## choose-team

Defines which repository maps to which team.

```json
"choose-team": {
  "path": "./core/services/choose-team",
  "options": {
    "routes": [
      { "team-github": ["*/*"] }
    ]
  },
  "dependencies": ["logger", "team-github"]
}
```

## command

Maps command handlers to command trigger words. ```TODO: Commands list```

```json
"command": {
  "path": "./core/services/command",
  "options": {
    "events": ["github:issue_comment"],
    "commands": [
      {
        "test": "\/start",
        "handlers": ["command-start"]
      },
      {
        "test": "\/stop",
        "handlers": ["command-stop"]
      },
      "..."
    ]
  },
  "dependencies": [
    "...",
    "command-start",
    "command-stop",
    "...",
  ]
}
```

## events

Event emitter wrapper.

## github

GitHub api wrapper. Uses [github npm module](https://www.npmjs.com/package/github) underneath.

## http

HTTP module is responsible for handling http requests.

## jabber

Module transport for notifications through the jabber.

```json
"jabber": {
  "path": "./core/services/jabber",
  "options": {
    "host": "github.com",
    "auth": {
      "login": "1",
      "password": "2"
    }
  },
  "dependencies": ["logger"]
},
```

## logger

Module for logging all kind of things.

```json
"logger": {
  "path": "./core/services/logger",
  "options": {
    "transports": [
      { "name": "console", "timestamp": true, "colorize": true }
    ]
  }
}
// OR
"logger": {
  "options": {
    "transports": [
      { "name": "file", "timestamp": true, "filename": "logs/main.log", "json": false }
    ]
  }
}
```

## model

Module is responsible for managing mongoose models and addons for models.

```json
"model": {
  "path": "./core/services/model",
  "options": {
    "addons": {
      "pull_request": [
        "./core/services/complexity/addon",
        "./core/services/pull-request-github/addon"
      ]
    }
  },
  "dependencies": ["mongoose"]
}
```

## mongoose

Mongoose wrapper.

```json
"mongoose": {
  "path": "./core/services/mongoose",
  "options": {
    "host": "mongodb://localhost/devexp"
  },
  "dependencies": ["logger"]
}
```

## parse-logins

Module for parsing user logins from any string.

## pull-request-action

Performs actions on pull requests. Possible actions are:

* Save pull request
* Approve review for pull request

```json
"pull-request-action": {
  "path": "./core/services/pull-request-action",
  "options": {
    "defaultApproveCount": 2,
    "team-github": { "approveCount": 1 }
  },
  "dependencies": ["..."]
}
```

## pull-request-body-section-queue

Updates pull request body ensures order for updates to avoid race conditions in updating.

## pull-request-github

Helpers for working with pull request through GitHub API.

```json
"pull-request-github": {
  "path": "./core/services/pull-request-github",
  "options": {
    "separator": {
      "top": "<div id='review-content-top'></div><hr>",
      "bottom": "<div id='review-content-bottom'></div>"
    }
  },
  "dependencies": ["..."]
}
```

## queue

Implements simple queue which might be used in any other service.

## review-autoassign

If enabled automatically starts choose reviewers process.

## review-badges

Prints review status badges in pull request body through [pull-request-body-queue](#pull-request-body-queue).

```json
"review-badges": {
  "path": "./core/services/review-badges",
  "options": {
    "url": "http://localhost:8080/badges/",
    "style": "flat"
  },
  "dependencies": ["events", "pull-request-body-queue"]
}
```

## review-notifications

Sends notifications on such events like:

* Start review
* Ping command
* Review completed

Uses jabber transport if provided.

```json
"review-notification": {
  "path": "./core/services/review-notification",
  "options": {
    "events": {
      "review:started": "./core/services/review-notification/templates/start",
      "review:command:ping": "./core/services/review-notification/templates/ping",
      "review:complete": "./core/services/review-notification/templates/complete"
    },
    "transport": "jabber"
  },
  "dependencies": ["..."]
}
```

## team-github

Adapter for [choose-team](#choose-team) for getting team from GitHub organistaion.

```json
"team-github": {
  "path": "./core/services/team-github",
  "options": { "team": "owners" },
  "dependencies": ["github"]
}
```

## team-static

Adapter for [choose-team](#choose-team) for getting team from configuration.

```json
"team-static": {
  "path": "./core/services/team-static",
  "options": {
    "members": [
      "artems",
      "d4rkr00t",
      "mishanga",
      "sbmaxx"
    ]
  }
}
```
