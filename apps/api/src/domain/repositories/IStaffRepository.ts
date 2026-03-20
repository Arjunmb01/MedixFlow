import { UserStatus } from "@prisma/client";

export interface IStaffRepository {
    getDoctors(query: any): Promise<any>;
    createDoctor(data: any, temporaryPassword?: string): Promise<any>;
    updateDoctor(doctorId: string, data: any): Promise<any>;
    blockDoctor(userId: string, status: UserStatus): Promise<any>;
    deleteDoctor(userId: string): Promise<any>;
    setupPassword(token: string, password: string): Promise<any>;
}
