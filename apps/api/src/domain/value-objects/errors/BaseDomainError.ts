export abstract class BaseDomainError extends Error {
    public readonly statusCode: number;
    public readonly name: string;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ResourceNotFoundError extends BaseDomainError {
    constructor(resource: string, identifier: string | number) {
        super(`${resource} with identifier ${identifier} was not found.`, 404);
    }
}

export class UnauthorizedError extends BaseDomainError {
    constructor(message: string = "Unauthorized access.") {
        super(message, 401);
    }
}

export class BusinessRuleError extends BaseDomainError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class ConflictError extends BaseDomainError {
    constructor(message: string) {
        super(message, 409);
    }
}
