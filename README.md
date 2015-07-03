## DEVEXP

#### Getting started
Requirements: mongodb, nodejs >= 0.12, gulp

```bash
npm install
node run mongo
gulp dev
```

#### Structure
```js
├── .build // Gulp tasks
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
│   └── server // Express server
|       ├── index.js // Place for including routes and initializing server side part of plugins
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
