import { Notification } from "@prisma/client";

export interface INotificationRepository {
    createMany(data : {
        userId :string;
        title : string;
        message :string;
        type : string
    }[]) : Promise<void>;
    
    create(data: {
        userId: string;
        title: string;
        message: string;
        type: string;
    }): Promise<Notification>;

    findByUserId(userId: string): Promise<Notification[]>;
}