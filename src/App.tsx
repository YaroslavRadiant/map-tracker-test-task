import { Navigate, Route, Routes } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { useStores } from "./providers/useStores";
import { LoginPage } from "./pages/LoginPage";
import { MapPage } from "./pages/MapPage";

export const App = observer(() => {
  const { authStore } = useStores();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authStore.isAuthorized ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        path="/"
        element={
          authStore.isAuthorized ? (
            <MapPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
});
