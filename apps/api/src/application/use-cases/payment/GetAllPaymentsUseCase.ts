import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";

export class GetAllPaymentsUseCase {
    constructor(private readonly paymentRepository: IPaymentRepository) {}

    async execute(filters: { status?: PaymentStatus; paymentMethod?: PaymentMethod; page?: number; limit?: number; search?: string }) {
        return this.paymentRepository.findAll(filters);
    }
}
