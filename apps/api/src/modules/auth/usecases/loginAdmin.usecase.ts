import { MESSAGES } from "../../../core/constants";
import { IAuthRepository } from "../interfaces/IAuthRepository";
import bcrypt from "bcryptjs";
import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

export interface loginAdminData {
    email: string;
    password: string;
}

export class LoginAdminUseCase {
    constructor(private authRepository: IAuthRepository) {}

    async execute(data: loginAdminData) {
        const user = await this.authRepository.findUserByEmail(data.email);

        if (!user || user.role !== "ADMIN") throw new Error(MESSAGES.INVALID_ROLE_ADMIN);

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

        const accessToken = tokenService.generateAccessToken(user.id, user.role, user.email);
        const refreshToken = tokenService.generateRefreshToken(user.id, user.role, user.email);
        await sessionService.saveSession(user.id, refreshToken);

        return { accessToken, refreshToken };
    }
}