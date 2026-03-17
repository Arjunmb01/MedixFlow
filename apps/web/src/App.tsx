import AppRoutes from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <AppRoutes/>
    </>
  )
}