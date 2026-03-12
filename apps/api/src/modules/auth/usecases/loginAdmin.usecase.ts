import authRepository from "../repositories/auth.repository";
import bcrypt from 'bcryptjs'
import tokenService from "../services/token.service";
import sessionService from "../services/session.service";

export interface loginAdminData{
    email : string;
    password : string
}

class LoginAdminUsecase {
    async execute(data : loginAdminData) {
        const user = await authRepository.findUserByEmail(data.email)

        if(!user || user.role !== "ADMIN") throw new Error("Invalid admin login")

        const valid = await bcrypt.compare(data.password,user.passwordHash)
        if(!valid) throw new Error("Invalid credentials")

        const accessToken = tokenService.generateAccessToken(user.id,user.role)
        const refreshToken = tokenService.generateRefreshToken(user.id)
        await sessionService.saveSession(user.id,refreshToken)

        return {accessToken,refreshToken}
    }
}

export default new LoginAdminUsecase()