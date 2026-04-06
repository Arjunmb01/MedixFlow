import { Request, Response } from "express";
import { GetAvailableSlotCase } from "@/application/use-cases/slot/getAvailableSlots.usecase";
import { BookAppointmentUseCase } from "@/application/use-cases/appointment/bookAppointment.usecase";
import { StatusCode } from "@/shared/constants";

type GetSlotsParams = {
  doctorId: string;
};

export class AppointmentController {
    constructor (private readonly getSlotsUseCase : GetAvailableSlotCase,
        private readonly bookUseCase : BookAppointmentUseCase
    ) {}

    async getSlots (req : Request<GetSlotsParams>, res : Response) : Promise<void>{
        try {
            const { doctorId } = req.params;
            const { date } = req.query;

            if(!doctorId || !date || typeof date !== 'string'){
                res.status(StatusCode.BAD_REQUEST).json({message : "Invalid input"})
                return;
            }

            const slots = await this.getSlotsUseCase.execute({ 
                doctorId, 
                date: new Date(date) 
            });
            res.status(StatusCode.OK).json(slots)

        } catch (error) {
            
            if(error instanceof Error) {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message : error.message})
            }else {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message : "Unknown error"})
            }

        }
    }

    async book (req : Request, res : Response) : Promise<void> {
        try {
            const {patientId, doctorId,date, slotStart,slotEnd} = req.body



            const appointment = await this.bookUseCase.execute({
                patientId,
                doctorId,
                appointmentDate : new Date(date),
                slotStart,
                slotEnd,
            })

            res.status(StatusCode.CREATED).json(appointment)
        } catch (error : unknown) {
            console.error("Booking Error:", error);
            if(error instanceof Error){
                res.status(StatusCode.BAD_REQUEST).json({message : error.message})
            }else{
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message: "Unknown error"})
            }
        }
    }
 }
