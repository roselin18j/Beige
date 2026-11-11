import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

import AppRoutes from "./AppRoutes.jsx";
import store from "./redux/store";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </Provider>
  </React.StrictMode>
);