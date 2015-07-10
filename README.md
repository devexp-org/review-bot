## DEVEXP

#### Getting started
Requirements: mongodb, nodejs >= 0.12.

##### Setup Prod:
```bash
npm install --production
npm install forever

// run
npm run mongo:deamon:start
npm run forever:start
```

##### Setup Dev:
```bash
npm install

// run
npm run dev

// or
npm run dev:tdd
```

#### Structure
```js
├── .webpack // Webpack configs
├── app
│   ├── client // Core client side functionality
│   │   ├── actions // Flux actions
│   │   ├── components // React components
│   │   ├── index.jsx // Client side app entry point, there is place for including new routes
│   │   ├── pages // React components which responsible for whole page rendering
│   │   ├── stores // Flux stores
│   │   ├── styles // App styles
│   │   └── utils // Some utils for using in client side components
│   ├── core // Core modules like: github, review, models, logger, etc
|   ├── config // Configs for modules and plugins
│   ├── plugins // Modules which extends core functionality
│   │   └── index.js // Plugins registry
│   └── server // Express server
|       └── views // Server side views
├── app.js // App entry point
├── data // Mongodb data
├── public // Compiled assets
├── scripts // Some post/pre install scripts
└── tests // Test setup
    ├── config // Test config for modules
    └── setup.js // Initial setup for tests
```

#### Main libs

* Alt — https://github.com/goatslacker/alt
* Express — http://expressjs.com/
* Mongoose — http://mongoosejs.com/
* React — http://facebook.github.io/react
* Fetch — https://github.com/github/fetch
* node-github — https://github.com/mikedeboer/node-github
