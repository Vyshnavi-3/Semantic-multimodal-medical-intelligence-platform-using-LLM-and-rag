import Sidebar from "./Sidebar";
import PatientSidebar from "./PatientSidebar";
import Topbar from "./Topbar";

export default function Layout({
  children,
  title,
  subtitle
}) {

  let userRole = null;

  const savedUser =
    localStorage.getItem("mediora_user");

  if (savedUser) {
    try {

      const parsedData =
        JSON.parse(savedUser);

      userRole =
        parsedData?.user?.role || null;

    } catch (error) {

      console.error(
        "Invalid logged-in user:",
        error
      );

    }
  }

  const isPatient =
    userRole === "patient";

  return (
    <div className="app">

      {isPatient ? (
        <PatientSidebar />
      ) : (
        <Sidebar />
      )}

      <div className="content-area">

        <Topbar />

        <main className="page-content">

          <div className="page-heading">

            <div>

              <p className="eyebrow">
                MEDIORA HEALTH INTELLIGENCE
              </p>

              <h1>
                {title}
              </h1>

              {subtitle && (
                <p className="page-subtitle">
                  {subtitle}
                </p>
              )}

            </div>

          </div>

          {children}

        </main>

      </div>

    </div>
  );
}