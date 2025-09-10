import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BudgetPage from './pages/BudgetPage';
import LoginPage from './components/LoginPage';
import './index.css';

function App() {
  return (
    <div className="App">
      <Router basename="/afs">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/instalaciones" element={<BudgetPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
