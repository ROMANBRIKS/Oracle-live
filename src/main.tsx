import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

// Axios Global Interceptor for JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or invalid. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use window.location instead of useNavigate because we are outside a component tree
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
