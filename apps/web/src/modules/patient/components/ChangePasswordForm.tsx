import { useState } from "react"
import { updatePassword } from "../services/patient.api"

export default function ChangePasswordForm() {

  const [currentPassword, setCurrent] = useState("")
  const [newPassword, setNew] = useState("")

  const handleSubmit = async () => {

    await updatePassword({
      currentPassword,
      newPassword
    })

    alert("Password updated")

  }

  return (

    <div className="bg-white p-5 rounded-xl shadow">

      <h3 className="font-semibold mb-3">
        Change Password
      </h3>

      <input
        type="password"
        placeholder="Current Password"
        onChange={(e) => setCurrent(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setNew(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Update Password
      </button>

    </div>

  )
}