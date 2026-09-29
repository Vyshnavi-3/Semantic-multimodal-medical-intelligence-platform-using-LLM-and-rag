import { useEffect, useState } from "react";

import {
  Bell,
  Search,
  ChevronDown,
  ShieldCheck
} from "lucide-react";


/* ========================================================= */
/* MEDIORA THEME                                               */
/* ========================================================= */

const theme = {
  background: "#071413",
  surface: "#0C1D1B",
  surfaceHover: "#102522",

  border: "#1B3834",
  borderStrong: "#28534C",

  primary: "#20C7B5",

  text: "#ECF8F6",
  secondary: "#91AAA6",
  muted: "#607A75"
};


export default function Topbar() {

  const [user, setUser] =
    useState(null);


  /* ======================================================= */
  /* LOAD LOGGED-IN USER                                      */
  /* ======================================================= */

  useEffect(() => {

    const savedUser =
      localStorage.getItem(
        "mediora_user"
      );


    if (!savedUser) {
      return;
    }


    try {

      const parsedData =
        JSON.parse(
          savedUser
        );


      const loggedInUser =
        parsedData?.user ||
        parsedData;


      if (!loggedInUser) {
        return;
      }


      setUser(
        loggedInUser
      );


    } catch (error) {

      console.error(
        "Invalid logged-in user:",
        error
      );

      localStorage.removeItem(
        "mediora_user"
      );

    }

  }, []);


  /* ======================================================= */
  /* INITIALS                                                 */
  /* ======================================================= */

  function getInitials(
    name
  ) {

    if (!name) {
      return "U";
    }


    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map(
        word =>
          word[0]
      )
      .join("")
      .substring(
        0,
        2
      )
      .toUpperCase();

  }


  /* ======================================================= */
  /* USER INFORMATION                                         */
  /* ======================================================= */

  const userName =
    user?.name ||
    "User";


  const userRole =
    user?.role
      ? user.role
          .charAt(0)
          .toUpperCase() +
        user.role.slice(1)
      : "User";


  const initials =
    getInitials(
      userName
    );


  /* ======================================================= */
  /* UI                                                       */
  /* ======================================================= */

  return (

    <header
      style={{
        height: "76px",
        width: "100%",
        boxSizing: "border-box",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: "0 28px",

        background:
          theme.background,

        borderBottom:
          `1px solid ${theme.border}`,

        color:
          theme.text,

        fontFamily:
          '"Manrope", "DM Sans", system-ui, sans-serif',

        position: "relative",

        zIndex: 50
      }}
    >


      {/* ================================================= */}
      {/* LEFT SIDE                                          */}
      {/* ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: 0
        }}
      >

        {/* MEDIORA BRAND */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px"
          }}
        >

          <div
            style={{
              width: "31px",
              height: "31px",

              borderRadius: "9px",

              background:
                "rgba(32,199,181,0.10)",

              border:
                "1px solid rgba(32,199,181,0.16)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >

            <ShieldCheck
              size={16}
              color={
                theme.primary
              }
            />

          </div>


          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1
            }}
          >

            <strong
              style={{
                color:
                  theme.text,

                fontSize:
                  "11px",

                fontWeight:
                  "900",

                letterSpacing:
                  "1.7px"
              }}
            >
              MEDIORA
            </strong>


            <span
              style={{
                marginTop:
                  "4px",

                color:
                  theme.primary,

                fontSize:
                  "6px",

                fontWeight:
                  "800",

                letterSpacing:
                  "1.1px"
              }}
            >
              HEALTH INTELLIGENCE
            </span>

          </div>

        </div>


        {/* SEARCH */}

        <div
          className="mediora-topbar-search"
          style={{
            width:
              "min(350px, 30vw)",

            minWidth:
              "190px",

            height:
              "38px",

            boxSizing:
              "border-box",

            display:
              "flex",

            alignItems:
              "center",

            gap:
              "9px",

            padding:
              "0 12px",

            marginLeft:
              "18px",

            background:
              theme.surface,

            border:
              `1px solid ${theme.border}`,

            borderRadius:
              "10px"
          }}
        >

          <Search
            size={15}
            color={
              theme.muted
            }
          />


          <input
            type="text"
            placeholder="Search patients, documents..."
            aria-label="Search patients and documents"
            style={{
              width:
                "100%",

              border:
                "none",

              outline:
                "none",

              background:
                "transparent",

              color:
                theme.text,

              fontFamily:
                "inherit",

              fontSize:
                "10px"
            }}
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* RIGHT SIDE                                         */}
      {/* ================================================= */}

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            "15px",

          flexShrink:
            0
        }}
      >


        {/* NOTIFICATION */}

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          style={{
            position:
              "relative",

            width:
              "36px",

            height:
              "36px",

            border:
              `1px solid ${theme.border}`,

            borderRadius:
              "10px",

            background:
              "rgba(255,255,255,0.018)",

            color:
              theme.secondary,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            cursor:
              "pointer",

            transition:
              "all 0.2s ease"
          }}
          onMouseEnter={(event) => {

            event.currentTarget.style.background =
              theme.surfaceHover;

            event.currentTarget.style.color =
              theme.primary;

            event.currentTarget.style.borderColor =
              theme.borderStrong;

          }}
          onMouseLeave={(event) => {

            event.currentTarget.style.background =
              "rgba(255,255,255,0.018)";

            event.currentTarget.style.color =
              theme.secondary;

            event.currentTarget.style.borderColor =
              theme.border;

          }}
        >

          <Bell
            size={17}
          />


          {/* NOTIFICATION DOT */}

          <span
            style={{
              position:
                "absolute",

              top:
                "7px",

              right:
                "7px",

              width:
                "6px",

              height:
                "6px",

              borderRadius:
                "50%",

              background:
                "#FF7474",

              border:
                `2px solid ${theme.background}`,

              boxSizing:
                "content-box"
            }}
          />

        </button>


        {/* USER PROFILE */}

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "9px",

            padding:
              "5px 7px 5px 5px",

            borderRadius:
              "12px",

            cursor:
              "pointer",

            transition:
              "background 0.2s ease"
          }}
          onMouseEnter={(event) => {

            event.currentTarget.style.background =
              "rgba(255,255,255,0.035)";

          }}
          onMouseLeave={(event) => {

            event.currentTarget.style.background =
              "transparent";

          }}
        >


          {/* AVATAR */}

          <div
            style={{
              width:
                "38px",

              height:
                "38px",

              flexShrink:
                0,

              borderRadius:
                "12px",

              background:
                "rgba(32,199,181,0.10)",

              border:
                "1px solid rgba(32,199,181,0.14)",

              color:
                theme.primary,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              fontSize:
                "11px",

              fontWeight:
                "900"
            }}
          >

            {initials}

          </div>


          {/* USER INFO */}

          <div
            style={{
              minWidth:
                "120px",

              display:
                "flex",

              flexDirection:
                "column"
            }}
          >

            <strong
              style={{
                color:
                  theme.text,

                fontSize:
                  "10px",

                fontWeight:
                  "850",

                lineHeight:
                  1.3,

                whiteSpace:
                  "nowrap",

                overflow:
                  "hidden",

                textOverflow:
                  "ellipsis"
              }}
            >
              {userName}
            </strong>


            <span
              style={{
                marginTop:
                  "3px",

                color:
                  theme.secondary,

                fontSize:
                  "8px",

                lineHeight:
                  1.2
              }}
            >
              {userRole}
            </span>

          </div>


          {/* ARROW */}

          <ChevronDown
            size={15}
            color={
              theme.secondary
            }
          />

        </div>

      </div>


      {/* ================================================= */}
      {/* RESPONSIVE CSS                                     */}
      {/* ================================================= */}

      <style>
        {`

          @media (max-width: 900px) {

            .mediora-topbar-search {
              display: none !important;
            }

          }


          @media (max-width: 600px) {

            .mediora-topbar {
              padding-left: 15px;
              padding-right: 15px;
            }

          }

        `}
      </style>

    </header>

  );

}