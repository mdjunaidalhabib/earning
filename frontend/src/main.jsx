import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "@/context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0B2B26",
              color: "#F7F3EA",
              border: "1px solid rgba(201,162,75,0.35)",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: { primary: "#4A7C59", secondary: "#F7F3EA" },
            },
            error: {
              iconTheme: { primary: "#B5453F", secondary: "#F7F3EA" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
