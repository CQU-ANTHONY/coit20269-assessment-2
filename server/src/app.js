'use strict';

const express = require('express');
const cors = require('cors');

const apiRouter = require('./routers/index');
const { notFound, errorHandler } = require('./middleware/error-handler');

function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '5mb' }));

    app.use('/api', apiRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
