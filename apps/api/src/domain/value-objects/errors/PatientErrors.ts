import { BaseDomainError, ConflictError, ResourceNotFoundError } from "./BaseDomainError";

export class PatientAlreadyExistsError extends ConflictError {
    constructor(email: string) {
        super(`Patient with email ${email} already exists.`);
    }
}

export class PatientNotFoundError extends ResourceNotFoundError {
    constructor(identifier: string) {
        super("Patient", identifier);
    }
}

export class InvalidPatientDataError extends BaseDomainError {
    constructor(message: string) {
        super(message, 400);
    }
}
