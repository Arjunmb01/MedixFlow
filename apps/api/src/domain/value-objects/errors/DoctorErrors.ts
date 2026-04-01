import { BaseDomainError, ConflictError, ResourceNotFoundError } from "./BaseDomainError";

export class DoctorNotFoundError extends ResourceNotFoundError {
    constructor(id: string) {
        super("Doctor", id);
    }
}

export class DoctorAlreadyExistsError extends ConflictError {
    constructor(email: string) {
        super(`Doctor with email ${email} already exists.`);
    }
}

export class InvalidCredentialsError extends BaseDomainError {
    constructor(message: string = "Invalid credentials.") {
        super(message, 401);
    }
}

export class UserNotActiveError extends BaseDomainError {
    constructor(message: string = "User account is suspended.") {
        super(message, 403);
    }
}
