import { UserStatus } from "../value-objects/enums/UserStatus";
import { 
    StaffDoctorFilters, 
    PaginatedStaffDoctors, 
    CreateDoctorInput, 
    UpdateDoctorInput,
    StaffDoctorListItem
} from "../value-objects/types/staff.repository.types";

export interface IStaffRepository {
    getDoctors(query: StaffDoctorFilters & { page: number; limit: number }): Promise<PaginatedStaffDoctors>;
    createDoctor(data: CreateDoctorInput, temporaryPassword?: string): Promise<{ user: StaffDoctorListItem; setupToken: string }>;
    updateDoctor(doctorId: string, data: UpdateDoctorInput): Promise<StaffDoctorListItem>;
    blockDoctor(userId: string, status: UserStatus): Promise<void>;
    deleteDoctor(userId: string): Promise<void>;
    setupPassword(token: string, password: string): Promise<{ success: boolean }>;
}
