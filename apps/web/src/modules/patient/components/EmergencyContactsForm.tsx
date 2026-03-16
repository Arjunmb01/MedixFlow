import { useState } from "react"
import { updateEmergencyContacts } from "../services/patient.api"

export default function EmergencyContactsForm() {

  const [contacts, setContacts] = useState([
    { name: "", mobile: "" }
  ])

  const handleSubmit = async () => {

    await updateEmergencyContacts(contacts)

    alert("Contacts saved")

  }

  return (

    <div className="bg-white p-5 rounded-xl shadow">

      <h3 className="font-semibold mb-3">
        Emergency Contacts
      </h3>

      {contacts.map((c, i) => (

        <div key={i}>

          <input
            placeholder="Name"
            onChange={(e) => {
              const updated = [...contacts]
              updated[i].name = e.target.value
              setContacts(updated)
            }}
          />

          <input
            placeholder="Mobile"
            onChange={(e) => {
              const updated = [...contacts]
              updated[i].mobile = e.target.value
              setContacts(updated)
            }}
          />

        </div>

      ))}

      <button onClick={handleSubmit}>
        Save Contacts
      </button>

    </div>

  )
}