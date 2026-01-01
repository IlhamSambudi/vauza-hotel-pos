import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Routes from './Routes';

export default function App() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isLoginPage = location.pathname === '/login';
  const isCLPage = location.pathname.startsWith('/cl/');
  const showSidebar = !isLoginPage && !isCLPage;

  return (
    <div className="flex min-h-screen bg-bgMain text-textMain font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      {showSidebar && isSidebarOpen && <Sidebar />}

      <main className={`flex-1 flex flex-col transition-all duration-300 ${!isLoginPage && !isCLPage ? 'h-screen overflow-y-auto' : ''}`}>
        {/* Toggle Button Area - Only show if sidebar is technically allowed (not login/cl) */}
        {showSidebar && (
          <div className="p-4 pb-0 sticky top-0 z-20 bg-gray-50/90 backdrop-blur-sm">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-textSub hover:text-primary"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? (
                // Close Icon (Sidebar is open)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              ) : (
                // Menu Icon (Sidebar is closed)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        )}

        <div className={`p-10 ${showSidebar ? 'pt-4' : ''} flex-1`}>
          <Routes />
        </div>
      </main>
    </div>
  );
}
