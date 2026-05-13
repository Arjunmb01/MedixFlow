import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { PaymentMethod } from "../../../domain/value-objects/enums/PaymentMethod";

import { PaginationQuery } from "@/domain/value-objects/types/pagination.types";

export class GetAllPaymentsUseCase {
    constructor(private readonly paymentRepository: IPaymentRepository) {}

    async execute(filters: PaginationQuery & { status?: PaymentStatus; paymentMethod?: PaymentMethod }) {
        return this.paymentRepository.findAll(filters);
    }
}
