import { BrowserRouter,Routes,Route } from "react-router-dom";

import PatientLogin from "@/modules/auth/pages/PatientLogin"
import Register from "@/modules/auth/pages/Register"
import VerifyOtp from "@/modules/auth/pages/VerifyOtp"
import AdminLogin from "@/modules/auth/pages/AdminLogin"
import LandingPage from "@/modules/landing/pages/LandingPage";


export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element = {<LandingPage/>}/>
                <Route path="/patient/login" element = {<PatientLogin/>}/>
                <Route path="/auth/register" element = {<Register/>}/>
                <Route path="/auth/verify-otp" element = {<VerifyOtp/>}/>
                <Route path="/admin/login" element = {<AdminLogin/>}/>
            </Routes>
        </BrowserRouter>
    )
}