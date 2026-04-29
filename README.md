# MedixFlow - Modern Healthcare Management Platform

MedixFlow is a premium, full-stack healthcare ecosystem designed to bridge the gap between patients, healthcare providers, and administrators. Built with a robust monorepo architecture, it leverages cutting-edge technologies to provide a seamless, secure, and AI-enhanced medical experience.

## 🚀 Visionary Features

### 🎥 Peer-to-Peer (P2P) Video Consultations
- **Secure Remote Care**: High-quality, low-latency video consultations between doctors and patients.
- **End-to-End Privacy**: Direct P2P communication ensuring patient data and conversations remain confidential.
- **Integrated Workspace**: Consultations happen within an EMR-integrated workspace, allowing doctors to view history and take notes simultaneously.

### 🤖 Patient AI Assistant (MedBot)
- **24/7 Doubt Clarification**: An intelligent AI assistant trained to answer patient queries regarding symptoms, precautions, and general medical information.
- **Symptom Guidance**: Helps patients understand their condition better before or after a consultation.
- **Context-Aware**: Integrates with the patient's medical profile to provide personalized guidance.

### 📝 AI-Powered Prescription Assistant
- **Smart Generation**: Assists doctors in generating accurate digital prescriptions using advanced AI logic.
- **Drug Interaction Safety**: AI analysis of medicine combinations to identify potential risks or allergies.
- **One-Click EMR**: Automatically populates Electronic Medical Records from consultation notes and AI suggestions.

## 🛠 Technology Stack

### Frontend (User Interface)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Modern, Responsive, Premium Dark/Light Modes)
- **State Management**: Redux Toolkit (Thunks, Persist)
- **Real-time**: Socket.io-client for instant notifications and signaling.
- **UI Components**: Lucide Icons, Sonner (Toasts), Framer Motion (Animations).

### Backend (Server & API)
- **Core**: Node.js + Express + TypeScript
- **Architecture**: Domain Driven Design (DDD) with Clean Architecture principles.
- **Database**: PostgreSQL (Neon.tech) with Prisma ORM.
- **Session/Storage**: Redis-backed session management and caching.
- **Communication**: Socket.io for real-time data flow.
- **External Services**: Cloudinary (Media), Razorpay (Payments), Gmail SMTP (Communications).

## 🏢 Platform Modules

### 👤 Patient Portal
- **Dashboard**: Holistic view of upcoming appointments, wallet balance, and health stats.
- **Booking**: Smart slot-based appointment booking system.
- **Wallet**: Integrated Razorpay wallet for seamless consultation payments.
- **Medical Vault**: Access to all past prescriptions, lab reports, and consultation history.

### 👨‍⚕️ Doctor Portal
- **Consultation Workspace**: A powerful EMR tool for vitals, clinical assessment, and digital prescriptions.
- **Queue Management**: Real-time patient queue for efficient daily workflows.
- **Leave Management**: Built-in scheduling conflicts checker for leave applications.

### ⚙️ Admin Portal
- **Doctor Onboarding**: Verification and management of medical staff.
- **System Analytics**: Overview of platform health, financials, and patient growth.
- **Content Management**: Controlling specialties and platform-wide configurations.

---

Built with ❤️ by the MedixFlow Team.
