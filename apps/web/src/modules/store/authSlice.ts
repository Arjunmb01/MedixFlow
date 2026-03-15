import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role, AuthState } from "../auth/types/auth.types";
const initialState: AuthState = {
    ADMIN: { isAuthenticated: false, user: null },
    PATIENT: { isAuthenticated: false, user: null },
    DOCTOR: { isAuthenticated: false, user: null },
    loading: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action: PayloadAction<{ role: Role }>) {
            const role = action.payload.role;
            state[role].isAuthenticated = true;
            state[role].user = { id: "", email: "", role };
        },
        logout(state, action: PayloadAction<{ role: Role }>) {
            const role = action.payload.role;
            state[role].isAuthenticated = false;
            state[role].user = null;
        }
    }
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer