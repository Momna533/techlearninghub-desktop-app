import { useState } from 'react';

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';


function AppShell({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false); 
  const handleMobileMenuToggle = () => { setMobileOpen((value) => !value); }; 
  const handleMobileClose = () => { setMobileOpen(false); };

  return (
    <div className="app-frame">
      <Sidebar user={user} onLogout={onLogout} mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
      <div className="app-main">
        <Header user={user} onMobileMenuToggle={handleMobileMenuToggle} />
        <main className="app-content p-4">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
