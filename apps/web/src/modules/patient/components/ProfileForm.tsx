import { useState } from "react"
import { updatePatientProfile } from "@/infrastructure/api/patient.api"

export default function ProfileForm() {

  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")

  const handleSubmit = async () => {

    await updatePatientProfile({
      name,
      mobile,
      bloodGroup
    })

    alert("Profile updated")
  }

  return (

    <div className="bg-white p-5 rounded-xl shadow">

      <h3 className="font-semibold mb-3">
        Personal Information
      </h3>

      <input
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Mobile"
        onChange={(e) => setMobile(e.target.value)}
      />

      <input
        placeholder="Blood Group"
        onChange={(e) => setBloodGroup(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Save
      </button>

    </div>

  )
}