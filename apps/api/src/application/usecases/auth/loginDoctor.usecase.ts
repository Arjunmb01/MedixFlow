import { MESSAGES } from "@/shared/constants";
import bcrypt from "bcryptjs";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/domain/services/ITokenService";
import { ISessionService } from "@/domain/services/IAuthServices";

export interface LoginDoctorData {
    email: string;
    password: string;
}

export class LoginDoctorUseCase {
    constructor(
        private authRepository: IAuthRepository,
        private tokenService: ITokenService,
        private sessionService: ISessionService
    ) {}

    async execute(data: LoginDoctorData) {
        const user = await this.authRepository.findUserByEmail(data.email);

        if (!user || user.role !== "DOCTOR") throw new Error(MESSAGES.LOGIN_FAILED);

        if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
            throw new Error(MESSAGES.ACCOUNT_BLOCKED);
        }

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

        const accessToken = this.tokenService.generateAccessToken(user.id, user.role, user.email);
        const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role, user.email);

        await this.sessionService.saveSession(user.id, refreshToken);

        return { accessToken, refreshToken };
    }
}
