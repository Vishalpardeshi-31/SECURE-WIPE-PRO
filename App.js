import React, { useState, useEffect } from 'react';
import './App.css';
import { getJobStatus } from './api/wipingApi';

// Import pages
import Dashboard from './Pages/Dashboard';
import AdminDashboard from './Pages/AdminDashboard';
import UserDashboard from './Pages/UserDashboard';
import Analytics from './Pages/Analytics';
import Certificates from './Pages/Certificates';
import SecureVault from './Pages/SecureVault';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'user':
        return <UserDashboard />;
      case 'analytics':
        return <Analytics />;
      case 'certificates':
        return <Certificates />;
      case 'vault':
        return <SecureVault />;
      case 'test':
        return <TestBackendConnection />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">SecureWipe-PRO</div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
          <button onClick={() => setCurrentPage('user')}>User</button>
          <button onClick={() => setCurrentPage('analytics')}>Analytics</button>
          <button onClick={() => setCurrentPage('certificates')}>Certificates</button>
          <button onClick={() => setCurrentPage('vault')}>Secure Vault</button>
          <button onClick={() => setCurrentPage('test')}>Test Backend</button>
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

function TestBackendConnection() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    getJobStatus('test-job')
      .then(data => setStatus('Connected to backend: ' + JSON.stringify(data)))
      .catch(err => setStatus('Error connecting to backend: ' + err.message));
  }, []);

  return <div>{status}</div>;
}

export default App;
