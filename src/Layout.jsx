import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Users, 
  Bell, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft
} from "lucide-react";
import { useEffect, useState } from "react";

function Layout({ onLogout, isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Toggle sidebar on Cmd+B (Mac) or Ctrl+B (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Search/Explore", path: "/search", icon: <Search size={20} /> },
    { name: "Communities", path: "/communities", icon: <Users size={20} /> },
    { name: "Activity", path: "/activity", icon: <Bell size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#121212",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* --- MASTER SIDEBAR --- */}
      <nav
        style={{
          width: isSidebarOpen ? "240px" : "0",
          minWidth: isSidebarOpen ? "240px" : "0",
          backgroundColor: "#000",
          borderRight: isSidebarOpen ? "1px solid #222" : "none",
          padding: isSidebarOpen ? "24px" : "0",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "40px",
            color: "white",
            paddingLeft: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: isSidebarOpen ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <span>SongApp</span>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {navItems.map((item) => (
            <li
              key={item.name}
              onClick={() => navigate(item.path)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderRadius: "8px",
                marginBottom: "8px",
                backgroundColor: activeTab === item.path ? "#282828" : "transparent",
                color: activeTab === item.path ? "#fff" : "#b3b3b3",
                fontWeight: activeTab === item.path ? "600" : "400",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.path) {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.path) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#b3b3b3";
                }
              }}
            >
              <span style={{ display: "flex", alignItems: "center", opacity: 0.8 }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "0.95rem" }}>{item.name}</span>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              style={{
                background: "transparent",
                border: "1px solid #333",
                color: "#aaa",
                padding: "10px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#555";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#333";
                e.currentTarget.style.color = "#aaa";
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "#770505",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#900")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#770505")}
              >
                <LogIn size={16} /> Log In
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#555")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
              >
                <UserPlus size={16} /> Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        id="sidebar-toggle"
        title={isSidebarOpen ? "Close Sidebar (Cmd+B)" : "Open Sidebar (Cmd+B)"}
        style={{
          position: "absolute",
          top: "16px",
          left: isSidebarOpen ? "194px" : "16px",
          zIndex: 1100,
          background: isSidebarOpen ? "transparent" : "rgba(40, 40, 40, 0.6)",
          border: isSidebarOpen ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: isSidebarOpen ? "none" : "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(60, 60, 60, 0.8)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isSidebarOpen ? "transparent" : "rgba(40, 40, 40, 0.6)";
          e.currentTarget.style.borderColor = isSidebarOpen ? "none" : "1px solid rgba(255, 255, 255, 0.1)";
        }}
      >
        <span>{isSidebarOpen ? <PanelLeftClose size={20} color="white"/> : <PanelLeftOpen size={24} color="white" />}</span>
      </button>

      {/* --- CONTENT AREA --- */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          position: "relative",
          paddingLeft: isSidebarOpen ? "0px" : "40px",
          transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;