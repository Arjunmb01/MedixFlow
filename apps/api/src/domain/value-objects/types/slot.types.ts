export interface CreateSlotInput {
    doctorId : string,
    date : Date,
    startTime : Date,
    endTime : Date,
    capacity : number,
    consultationType : "VIDEO" | "CLINIC"
}

export interface SlotDto {
     id: string,
     doctorId : string,
     date : Date;
     startTime : Date;
     endTime : Date;
     capacity : number;
     bookedCount : number;
     isBooked: boolean;
     consultationType : "VIDEO" | "CLINIC"
}