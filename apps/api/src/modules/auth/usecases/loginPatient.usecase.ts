import bcrypt from 'bcryptjs'
import authRepository from '../repositories/auth.repository'
import tokenService from '../services/token.service'
import sessionService from '../services/session.service';


export interface LoginData {
    email : string;
    password : string
}

class LoginPatientUseCase{
    async execute (data : LoginData){
        const user = await authRepository.findUserByEmail(data.email)

        if(!user || user.role !== "PATIENT") throw new Error("Invalid Login")

        if(user.status === "INACTIVE" || user.status === "SUSPENDED") {
            throw new Error("Your account has been blocked by the administrator. Please contact support.")
        }

        const valid = await bcrypt.compare(data.password,user.passwordHash)
        if(!valid) throw new Error("Invalid Credentials")
            
        const accessToken = tokenService.generateAccessToken(
            user.id,
            user.role
        )

        const refreshToken = tokenService.generateRefreshToken(user.id, user.role)

        await sessionService.saveSession(user.id,refreshToken)
        return {accessToken,refreshToken}
    }
}

export default new LoginPatientUseCase()