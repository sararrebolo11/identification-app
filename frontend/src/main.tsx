import "../src/styles/App.css";
import "../src/styles/forms.css";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NotificationsProvider } from "./ui/notifications";

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </BrowserRouter>
);
