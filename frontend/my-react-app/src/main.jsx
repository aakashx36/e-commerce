import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ProductProvider } from "./context/productContext.jsx";
import { UserProvider } from "./context/userContext.jsx"; // Context import karo

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* UserProvider ko yahan wrap karo taaki poora App user data access kar sake */}
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
);
