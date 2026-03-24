import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

export class GetPatientNotificationsUseCase {
    constructor(private readonly notificationRepo: INotificationRepository) {}

    async execute(userId: string) {
        return this.notificationRepo.findByUserId(userId);
    }
}
