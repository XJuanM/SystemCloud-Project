import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import SignIn from "./pages/SignIn.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/sign-in"
          element={<SignIn />}
        />

        <Route
          path="/recuperar-contraseña"
          element={<ResetPassword />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;







