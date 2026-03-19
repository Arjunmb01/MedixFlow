import { MESSAGES } from "../../../core/constants";
import bcrypt from "bcryptjs";
import { IAuthRepository } from "../interfaces/IAuthRepository";
import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

export interface LoginDoctorData {
    email: string;
    password: string;
}

export class LoginDoctorUseCase {
    constructor(private authRepository: IAuthRepository) {}

    async execute(data: LoginDoctorData) {
        const user = await this.authRepository.findUserByEmail(data.email);

        if (!user || user.role !== "DOCTOR") throw new Error(MESSAGES.LOGIN_FAILED);

        if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
            throw new Error(MESSAGES.ACCOUNT_BLOCKED);
        }

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

        const accessToken = tokenService.generateAccessToken(user.id, user.role, user.email);
        const refreshToken = tokenService.generateRefreshToken(user.id, user.role, user.email);

        await sessionService.saveSession(user.id, refreshToken);

        return { accessToken, refreshToken };
    }
}
