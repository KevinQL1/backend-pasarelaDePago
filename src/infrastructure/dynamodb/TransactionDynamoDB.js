import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { dynamoDb } from './DynamoClient.js';
import { TransactionEntity } from '#/domain/entities/TransactionEntity.js';

/**
 * Implementación DynamoDB del TransactionRepository
 * Solo persistencia, cero lógica de negocio.
 */
export class TransactionDynamoDB {
  constructor(tableName) {
    if (!tableName) {
      throw new Error('Table name is required');
    }

    this.tableName = tableName;
  }

  async findAll() {
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'entity = :entity',
        ExpressionAttributeValues: {
          ':entity': 'TransactionEntity',
        },
      })
    );

    return result.Items.map(item => new TransactionEntity(item));
  }

  async findById(id) {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `TRANSACTION#${id}`,
          SK: `TRANSACTION#${id}`,
        },
      })
    );

    if (!result.Item) return null;

    return new TransactionEntity(result.Item);
  }

  async save(transaction) {
    await dynamoDb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `TRANSACTION#${transaction.id}`,
          SK: `TRANSACTION#${transaction.id}`,
          entity: 'TransactionEntity',
          ...transaction,
        },
      })
    );

    return transaction;
  }

  async update(transaction) {
    await dynamoDb.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `TRANSACTION#${transaction.id}`,
          SK: `TRANSACTION#${transaction.id}`,
        },
        UpdateExpression: `
          SET #status = :status,
              wompiTransactionId = :wompiTransactionId,
              updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': transaction.status,
          ':wompiTransactionId': transaction.wompiTransactionId,
          ':updatedAt': transaction.updatedAt,
        },
      })
    );

    return this.findById(id);
  }

  async updateStatus(id, status, wompiTransactionId = null, customerId = null) {
    const now = new Date().toISOString();

    await dynamoDb.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `TRANSACTION#${id}`,
          SK: `TRANSACTION#${id}`,
        },
        UpdateExpression: `
        SET #status = :status,
            wompiTransactionId = :wompiTransactionId,
            customerId = :customerId
            updatedAt = :updatedAt
      `,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':wompiTransactionId': wompiTransactionId,
          ':customerId': customerId,
          ':updatedAt': now,
        },
      })
    );

    return this.findById(id);
  }

  async findByWompiTransactionId(wompiTransactionId) {
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'wompiTransactionId = :wid',
        ExpressionAttributeValues: {
          ':wid': wompiTransactionId,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) return null;

    return new TransactionEntity(result.Items[0]);
  }
}
