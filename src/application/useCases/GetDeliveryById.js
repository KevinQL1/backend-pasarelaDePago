export class GetDeliveryById {
    constructor(deliveryRepo) {
        if (!deliveryRepo) {
            throw new Error('DeliveryRepository is required');
        }
        this.deliveryRepo = deliveryRepo;
    }

        async execute(idDelivery) {
        if (!idDelivery) {
            throw new Error('Invalid delivery ID');
        }

        const delivery = await this.deliveryRepo.findById(idDelivery);
        if (!delivery) {
            throw new Error('Delivery not found');
        }
        
        return delivery;
    }
}