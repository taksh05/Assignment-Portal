import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup"; // <-- import Signup
import Dashboard from "./pages/dashboard/Dashboard";
import Classes from "./pages/classes/Classes";
import ClassDetail from "./pages/classes/ClassDetail";
import AssignmentDetail from "./pages/assignments/AssignmentDetail";
import MySubmissions from "./pages/submissions/MySubmissions";
import AdminPanel from "./pages/admin/AdminPanel";
import PrivateRoute from "./components/PrivateRoute";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> {/* <-- Signup page */}

      {/* Protected Routes with Dashboard Layout */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/assignments/:aid" element={<AssignmentDetail />} />
        <Route path="/submissions" element={<MySubmissions />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Default redirect: If logged in, go to dashboard; else, login */}
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Redirect any invalid route to login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
