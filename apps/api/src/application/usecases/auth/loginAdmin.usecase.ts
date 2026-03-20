import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import bcrypt from "bcryptjs";
import { ITokenService } from "@/domain/services/ITokenService";
import { ISessionService } from "@/domain/services/IAuthServices";

export interface loginAdminData {
    email: string;
    password: string;
}

export class LoginAdminUseCase {
    constructor(
        private authRepository: IAuthRepository,
        private tokenService: ITokenService,
        private sessionService: ISessionService
    ) {}

    async execute(data: loginAdminData) {
        const user = await this.authRepository.findUserByEmail(data.email);

        if (!user || user.role !== "ADMIN") throw new Error(MESSAGES.INVALID_ROLE_ADMIN);

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

        const accessToken = this.tokenService.generateAccessToken(user.id, user.role, user.email);
        const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role, user.email);
        await this.sessionService.saveSession(user.id, refreshToken);

        return { accessToken, refreshToken };
    }
}
