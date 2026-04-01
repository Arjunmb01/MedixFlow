import { ConflictError, ResourceNotFoundError, BusinessRuleError } from "./BaseDomainError";

export class ConsultationNotFoundError extends ResourceNotFoundError {
    constructor(id: string) {
        super("Consultation", id);
    }
}

export class PatientAlreadyCheckedInError extends ConflictError {
    constructor(patientId: string) {
        super(`Patient with ID ${patientId} is already in the queue for this doctor today.`);
    }
}

export class ConsultationAlreadyStartedError extends BusinessRuleError {
    constructor(id: string) {
        super(`Consultation with ID ${id} has already been started.`);
    }
}

export class ConsultationAlreadyCompletedError extends BusinessRuleError {
    constructor(id: string) {
        super(`Consultation with ID ${id} has already been completed.`);
    }
}
