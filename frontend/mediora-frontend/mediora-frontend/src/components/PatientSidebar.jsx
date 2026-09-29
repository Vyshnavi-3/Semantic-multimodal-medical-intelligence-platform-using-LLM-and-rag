import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  LogOut,
  ShieldCheck
} from "lucide-react";


export default function PatientSidebar() {

  const navigate = useNavigate();


  const navigation = [
    {
      name: "Dashboard",
      path: "/patient",
      icon: LayoutDashboard
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: Users
    },
    {
      name: "My Reports",
      path: "/report",
      icon: FileText
    },
    {
      name: "My AI",
      path: "/chat",
      icon: MessageSquare
    }
  ];


  function handleLogout() {

    localStorage.removeItem("mediora_user");

    localStorage.removeItem("selectedPatient");

    navigate("/");
  }


  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-logo">
          M
        </div>

        <div>

          <h2>
            Mediora
          </h2>

          <span>
            Medical Intelligence
          </span>

        </div>

      </div>


      <div className="workspace">

        <ShieldCheck size={15} />

        <span>
          Secure Clinical Workspace
        </span>

      </div>


      <nav className="navigation">

        <p className="nav-label">
          MY WORKSPACE
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

              <span>
                {item.name}
              </span>

            </NavLink>
          );

        })}

      </nav>


      <div className="sidebar-bottom">

        <button
          className="logout-button"
          onClick={handleLogout}
          type="button"
        >

          <LogOut size={18} />

          <span>
            Sign out
          </span>

        </button>


        <div className="security-note">

          <ShieldCheck size={16} />

          <div>

            <strong>
              Privacy first
            </strong>

            <span>
              Your medical data stays protected.
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}