import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BudgetsPage from './pages/BudgetsPage';
import InstallationsPage from './pages/InstallationsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import LoginPage from './pages/LoginPage';
import ClientsPage from './pages/ClientsPage';
import './index.css';

function App() {
  return (
    <div className="App">
      <Router basename="/afs">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/instalaciones" element={<InstallationsPage />} />
          <Route path="/presupuesto" element={<BudgetsPage />} />
          <Route path="/recibos" element={<ReceiptsPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
