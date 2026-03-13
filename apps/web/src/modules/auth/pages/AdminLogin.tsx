import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch } from "@/core/store/hooks"
import { setAuth } from "../../store/authSlice"

import { adminLogin } from "@/infrastructure/api/auth.api"

import type { LoginPayload } from "../types/auth.types"

export default function AdminLogin() {

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [form, setForm] = useState<LoginPayload>({
        email: "",
        password: ""
    })

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {

        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

    }

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault()

        try {

            const res = await adminLogin(form)

            dispatch(
                setAuth({
                    token: res.data.accessToken,
                    role: "ADMIN"
                })
            )

            navigate("/admin/dashboard")

        } catch (error) {

            console.error("Admin login failed:", error)

        }

    }

    return (

        <div className="flex items-center justify-center min-h-screen bg-gray-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4"
            >

                <h2 className="text-xl font-bold text-center">
                    Admin Login
                </h2>

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full rounded"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full rounded"
                    value={form.password}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    className="bg-purple-600 text-white p-2 w-full rounded"
                >
                    Login
                </button>

            </form>

        </div>

    )

}