import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role, AuthState } from "@/domain/auth/types/auth.types";

const getPersistedRole = (): Role | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("medixflow_user_role") as Role;
};

const initialState: AuthState = {
    ADMIN: { isAuthenticated: false, user: null, accessToken: null },
    PATIENT: { isAuthenticated: false, user: null, accessToken: null },
    DOCTOR: { isAuthenticated: false, user: null, accessToken: null },
    loading: false,
    persistedRole: getPersistedRole()
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
            state.persistedRole = role;
            localStorage.setItem("medixflow_user_role", role);
        },
        logout(state, action: PayloadAction<{ role: Role }>) {
            const role = action.payload.role;
            state[role].isAuthenticated = false;
            state[role].user = null;
            state[role].accessToken = null;
            state.persistedRole = null;
            localStorage.removeItem("medixflow_user_role");
        },
        setAccessToken(state, action: PayloadAction<{ role: Role; accessToken: string }>) {
            const { role, accessToken } = action.payload;
            state[role].accessToken = accessToken;
            state[role].isAuthenticated = true;
        }
    }
})

export const { setAuth, logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer