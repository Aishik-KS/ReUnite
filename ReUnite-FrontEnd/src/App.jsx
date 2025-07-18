import React from "react";
import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashBoard";
import SubmitPage from "./pages/SubmitPage";
import SearchPage from "./pages/SearchPage";
import ErrorPage from "./pages/ErrorPage";
import SearchImagePage from "./pages/SearchImagePage";
import NotificationService from "./pages/NotificationService";
import FAQ from "./pages/faq";
import SendString from "./pages/SendString";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/SubmitPage" element={<SubmitPage />} />
        <Route path="/SearchPage" element={<SearchPage />} />
        <Route path="/Notify" element={<NotificationService />} />
        <Route path="/Error" element={<ErrorPage />} />
        <Route path="/SearchImagePage" element={<SearchImagePage />} />
        <Route path="/Faq" element={<FAQ />} />
        <Route path="/send" element={<SendString />} />
      </Routes>
    </div>
  );
};

export default App;
