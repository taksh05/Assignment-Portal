import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

// --- ICONS (Inline SVGs) ---

const IconGrid = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconCheckSquare = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

// This is the component for each sidebar link
const SidebarLink = ({ to, icon, children, onClick }) => {
  const activeClass = "bg-purple-100 text-purple-700"; // Active link style
  const inactiveClass = "text-gray-500 hover:bg-gray-100 hover:text-gray-900"; // Inactive link style

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive ? activeClass : inactiveClass
        }`
      }
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-sm">{children}</span>
      </div>
      <IconChevronRight />
    </NavLink>
  );
};

// This is the main Layout component
export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // To get the current page path
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  // Get user name from local storage
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name ? user.name.split(' ')[0] : 'User'; // Get first name

  // Update page title based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) setPageTitle("Dashboard");
    else if (path.includes("/classes")) setPageTitle("Classes");
    else if (path.includes("/assignments")) setPageTitle("Assignments");
    else if (path.includes("/submissions")) setPageTitle("Submissions");
    else if (path.includes("/admin")) setPageTitle("Admin Panel");
    else setPageTitle("Dashboard");
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  }

  return (
    // The main container is now relative to position the main content
    <div className="min-h-screen flex bg-gray-50 relative">
      
      {/* --- Sidebar Overlay (Always active when sidebar is open) --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* --- Sidebar --- */}
      <aside
        className={`
          bg-white w-64 p-4 flex flex-col
          fixed inset-y-0 left-0 transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          z-50 shadow-lg border-r border-gray-200
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-6">
          <span className="text-2xl font-bold text-purple-600">Asteroids</span>
          
          {/* Close Button (always visible in sidebar) */}
          <button onClick={toggleSidebar} className="ml-auto text-gray-500 hover:text-gray-900">
            <IconX />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2">
          <SidebarLink to="/dashboard" icon={<IconGrid />} onClick={closeSidebar}>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/classes" icon={<IconUsers />} onClick={closeSidebar}>
            Classes
          </SidebarLink>
          <SidebarLink to="/assignments/aid" icon={<IconFileText />} onClick={closeSidebar}>
            Assignments
          </SidebarLink>
          <SidebarLink to="/submissions" icon={<IconCheckSquare />} onClick={closeSidebar}>
            Submissions
          </SidebarLink>
          {user?.role === 'admin' && ( // Only show Admin Panel to admins
            <SidebarLink to="/admin" icon={<IconSettings />} onClick={closeSidebar}>
              Admin Panel
            </SidebarLink>
          )}
        </nav>

        {/* Logout button at the bottom */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-500 hover:bg-red-100 hover:text-red-600"
          >
            <IconLogOut />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      {/* This 'div' replaces the 'main' tag to be a flex container */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center">
            {/* Hamburger Button (Always visible) */}
            <button onClick={toggleSidebar} className="text-gray-700 focus:outline-none mr-4">
              <IconMenu />
            </button>
            {/* This title now changes based on the page */}
            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">{pageTitle}</h1> 
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm font-medium hidden md:block">Welcome back, {userName}! 👋</span>
            <img 
              src={`https://ui-avatars.com/api/?name=${userName}&background=E9D5FF&color=6B21A8&bold=true`}
              alt="User Avatar" 
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

