const serverless = require('serverless-http');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Logger } = require('@aws-lambda-powertools/logger');
const sdk = require('@serverless/sdk');

const indexRouter = require('./routes/index');
const formRouter = require('./routes/fourm');

const app = express();
const logger = new Logger({ serviceName: 'aws-lambda-typescript-express' });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  sdk.setTag('rootTag1', 'rootTagValue1');
  sdk.setTag('rootTag2', 'rootTagValue2');
  next();
});

app.use('/index', indexRouter);
app.use('/form', formRouter);

app.get('/root/:test', (req, res) => {
  return res.send({ message: 'Hi mom', params: req.params });
});

const handler = serverless(app, {
  async response(response, event, context) {
    logger.info('Lambda Event', { event });
    // the return value is always ignored
    return new Promise(resolve => {
      // delay your responses by 300ms!
      setTimeout(() => {
        // this value has no effect on the response
        resolve(true);
      }, 300);
    });
  }
});

module.exports = {
  handler
};
