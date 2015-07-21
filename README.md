## DEVEXP

#### Getting started
Requirements: mongodb, nodejs >= 0.12, nodemon, forever.

##### Setup Prod:
```bash
npm install --production

// run
npm run mongo:deamon:start
npm run forever:start
```

##### Setup Dev:
```bash
npm install

// run
npm run dev
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
│   ├── modules // Modules like: github, review, models, logger, etc
│   │   └── index.js // Modules registry
|   ├── config // Configs for modules and plugins
│   └── server // Express server
|       └── views // Server side views
├── app.js // App entry point
├── data // Mongodb data
├── public // Compiled assets
├── scripts // Some post/pre install scripts
└── tests // Test setup
    └── setup.js // Initial setup for tests
```

#### Main libs

* Alt — https://github.com/goatslacker/alt
* Express — http://expressjs.com/
* Mongoose — http://mongoosejs.com/
* React — http://facebook.github.io/react
* Fetch — https://github.com/github/fetch
* node-github — https://github.com/mikedeboer/node-github
