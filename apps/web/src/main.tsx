import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

import { Provider } from "react-redux"
import { store, persistor } from "./core/store/store"
import { PersistGate } from "redux-persist/integration/react"
import { GoogleOAuthProvider } from "@react-oauth/google"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </GoogleOAuthProvider>
)