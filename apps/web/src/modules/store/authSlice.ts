import { createSlice } from "@reduxjs/toolkit";

interface User {
    id: string
    email: string
    role : "ADMIN" | "DOCTOR" | "PATIENT"
}

interface AuthState {
    accessToken : string|null
    user: User | null
}

const initialState:AuthState = {
    accessToken:null,
    user:null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action) {
            state.accessToken = action.payload;
            localStorage.setItem("accessToken", action.payload);
        },
        logout(state) {
            state.accessToken = null;
            state.user = null;
            localStorage.removeItem("accessToken");
        }
    }
})


export const {setAuth,logout} = authSlice.actions
export default authSlice.reducer