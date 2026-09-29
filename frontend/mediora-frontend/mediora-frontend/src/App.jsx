import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";

import PatientSelection from "./pages/PatientSelection";
import Dashboard from "./pages/Dashboard";
import UploadDocument from "./pages/UploadDocument";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Report from "./pages/Report";

import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Doctors from "./pages/Doctors";


export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            PROTECTED ROUTES
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          {/* -------------------------------------------------
              DOCTOR HOME
          ------------------------------------------------- */}

          <Route
            path="/doctor"
            element={<DoctorDashboard />}
          />


          {/* -------------------------------------------------
              PATIENT HOME
          ------------------------------------------------- */}

          <Route
            path="/patient"
            element={<PatientDashboard />}
          />


          {/* -------------------------------------------------
              DOCTOR PATIENT SELECTION
          ------------------------------------------------- */}

          <Route
            path="/patients"
            element={<PatientSelection />}
          />


          {/* -------------------------------------------------
              SELECTED PATIENT WORKSPACE
              
              IMPORTANT:
              This page is intentionally available to the
              logged-in doctor after selecting a patient.
          ------------------------------------------------- */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* -------------------------------------------------
              MEDICAL DOCUMENTS
          ------------------------------------------------- */}

          <Route
            path="/documents"
            element={<Documents />}
          />


          {/* -------------------------------------------------
              UPLOAD DOCUMENT
          ------------------------------------------------- */}

          <Route
            path="/upload"
            element={<UploadDocument />}
          />


          {/* -------------------------------------------------
              AI CHAT
          ------------------------------------------------- */}

          <Route
            path="/chat"
            element={<Chat />}
          />


          {/* -------------------------------------------------
              REPORT
          ------------------------------------------------- */}

          <Route
            path="/report"
            element={<Report />}
          />


          {/* -------------------------------------------------
              DOCTOR AVAILABILITY
              
              Patient uses this page to view doctors and
              send enquiries.
          ------------------------------------------------- */}

          <Route
            path="/doctors"
            element={<Doctors />}
          />

        </Route>


        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}