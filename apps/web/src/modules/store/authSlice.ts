import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role, AuthState } from "../auth/types/auth.types";
const initialState: AuthState = {
    ADMIN: { isAuthenticated: false, user: null, accessToken: null },
    PATIENT: { isAuthenticated: false, user: null, accessToken: null },
    DOCTOR: { isAuthenticated: false, user: null, accessToken: null },
    loading: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action: PayloadAction<{ role: Role; accessToken: string; user?: any }>) {
            const { role, accessToken, user } = action.payload;
            state[role].isAuthenticated = true;
            state[role].user = user || { id: "", email: "", role };
            state[role].accessToken = accessToken;
        },
        logout(state, action: PayloadAction<{ role: Role }>) {
            const role = action.payload.role;
            state[role].isAuthenticated = false;
            state[role].user = null;
            state[role].accessToken = null;
        },
        setAccessToken(state, action: PayloadAction<{ role: Role; accessToken: string }>) {
            const { role, accessToken } = action.payload;
            state[role].accessToken = accessToken;
        }
    }
})

export const { setAuth, logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer