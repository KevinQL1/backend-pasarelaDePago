import { deliverySchema } from '#/infrastructure/Schemas/GetDeliveryByIdSchema.js'
import { DeliveryDynamoDB } from '#/infrastructure/dynamodb/DeliveryDynamoDB.js';
import { GetDeliveryById } from '#/application/useCases/GetDeliveryById.js';
import { ok, badRequest, serverError } from '#/config/utils/httpResponse.js';

const deliveryDynamoDB = new DeliveryDynamoDB(process.env.DELIVERY_TABLE)
const getDeliveryById = new GetDeliveryById(deliveryDynamoDB);

export const handler = async (event) => {
  try {
    const { idDelivery } = event.pathParameters;

    // Validar pathParameters con Joi
    const { error } = deliverySchema.validate(event.pathParameters, { abortEarly: false });
    if (error) {
      return badRequest(event, error);
    }

    const result = await getDeliveryById.execute(idDelivery);

    return ok(event, result);
  } catch (err) {
    console.error('Error obtaining delivery: ', err)
    return serverError(event, err);
  }
};
