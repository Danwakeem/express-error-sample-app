const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { Logger } = require('@aws-lambda-powertools/logger');

const logger = new Logger({ serviceName: 'aws-lambda-typescript-express' });
const { TABLE_NAME: TableName } = process.env;
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const router = express.Router();


/* GET home page. */
router.get('/', async (_, res) => {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': 'form',
      ':sk': 'form:',
    },
  });
  const { Items: forms } = await ddb.send(command);
  res.send({ forms });
});

router.get('/:formId/:count', async (req, res) => {
  logger.info('Fetching form', { formId: req.params.formId });

  let form;
  for (let i = 0; i < parseInt(req.params.count); i++) {
    const command = new GetCommand({
      TableName,
      Key: {
        pk: `form:${req.params.formId}`,
        sk: `form:${req.params.formId}`,
      },
    })
    const { Item } = await ddb.send(command);
    form = Item;
  }

  alskdjf // undefined variable

  res.send({
    form
  });
});

router.get('/:formId/threads', async (req, res) => {
  logger.info('Fetching threads', { formId: req.params.formId });
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': `form:${req.params.formId}`,
      ':sk': 'thread:',
    },
  });
  const { Items: threads } = await ddb.send(command);
  logger.info(`Threads for Form ${req.params.formId} found.`, { formId: req.params.formId, threadCount: threads.length });
  res.send({ threads });
});

router.get('/:formId/thread/:threadId', async (req, res) => {
  const command = new GetCommand({
    TableName,
    Key: {
      pk: `form:${req.params.formId}`,
      sk: `thread:${req.params.threadId}`
    }
  });
  const { Item: thread } = await ddb.send(command);

  if (req.query.comments) {
    const command = new QueryCommand({
      TableName,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `form:${req.params.formId}:thread:${req.params.threadId}`,
        ':sk': 'comment:',
      },
    });
    const { Items: comments } = await ddb.send(command);

    return res.send({ thread, comments });
  }

  res.send({ thread });
});

router.get('/:formId/thread/:threadId/comments', async (req, res) => {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': `form:${req.params.formId}:thread:${req.params.threadId}`,
      ':sk': 'comment:',
    },
  });
  const { Items: comments } = await ddb.send(command);
  res.send({ comments });
});

router.get('/:formId/thread/:threadId/comment/:commentId', async (req, res) => {
  const command = new GetCommand({
    TableName,
    Key: {
      pk: `form:${req.params.formId}:thread:${req.params.threadId}`,
      sk: `comment:${req.params.commentId}`
    }
  });
  const { Item: comment } = await ddb.send(command);
  res.send({ comment });
});

module.exports = router;
