export class GetCustomerById {
    constructor(customerRepo) {
        if (!customerRepo) {
            throw new Error('CustomerRepository is required');
        }
        this.customerRepo = customerRepo;
    }

    async execute(idCustomer) {
        if (!idCustomer) {
            throw new Error('Invalid customer ID');
        }

        const customer = await this.customerRepo.findById(idCustomer);
        if (!customer) {
            throw new Error('Customer not found');
        }
        
        return customer;
    }
}