import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './DynamoClient.js';
import { DeliveryEntity } from '#/domain/entities/DeliveryEntity.js';

/**
 * Implementación DynamoDB del DeliveryRepository
 * Solo persistencia, cero lógica de negocio.
 */
export class DeliveryDynamoDB {
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
          ':entity': 'DeliveryEntity',
        },
      })
    );

    return result.Items.map(item => new DeliveryEntity(item));
  }

  async findById(id) {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `DELIVERY#${id}`,
          SK: `DELIVERY#${id}`,
        },
      })
    );

    if (!result.Item) return null;

    return new DeliveryEntity(result.Item);
  }

  async save(delivery) {
    await dynamoDb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `DELIVERY#${delivery.id}`,
          SK: `DELIVERY#${delivery.id}`,
          entity: 'DeliveryEntity',
          ...delivery,
        },
      })
    );

    return delivery
  }

  async update(delivery) {
    await dynamoDb.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `DELIVERY#${delivery.id}`,
          SK: `DELIVERY#${delivery.id}`,
        },
        UpdateExpression: `
          SET address = :address,
              #status = :status,
              updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':address': delivery.address,
          ':status': delivery.status,
          ':updatedAt': delivery.updatedAt,
        },
      })
    );
  }
}
