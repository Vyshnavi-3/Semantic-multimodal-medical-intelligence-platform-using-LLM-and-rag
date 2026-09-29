import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  MessageSquare,
  Activity,
  Users,
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function Sidebar() {

  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Patients",
      path: "/patients",
      icon: Users
    },
    {
      name: "Upload Document",
      path: "/upload",
      icon: UploadCloud
    },
    {
      name: "Medical Documents",
      path: "/documents",
      icon: FileText
    },
    {
      name: "AI Assistant",
      path: "/chat",
      icon: MessageSquare
    },
    {
      name: "Reports & Results",
      path: "/report",
      icon: Activity
    }
  ];

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-logo">
          M
        </div>

        <div>
          <h2>Mediora</h2>
          <span>Medical Intelligence</span>
        </div>

      </div>

      <div className="workspace">

        <ShieldCheck size={15} />

        <span>Secure Clinical Workspace</span>

      </div>

      <nav className="navigation">

        <p className="nav-label">
          WORKSPACE
        </p>

        {navigation.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >

              <Icon size={19} />

              <span>{item.name}</span>

            </NavLink>
          );

        })}

      </nav>

      <div className="sidebar-bottom">

        <button
          className="logout-button"
          onClick={() => navigate("/")}
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>

        <div className="security-note">
          <ShieldCheck size={16} />

          <div>
            <strong>Privacy first</strong>

            <span>
              Your medical data stays protected.
            </span>
          </div>

        </div>

      </div>

    </aside>
  );
}