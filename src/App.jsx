import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BudgetPage from './pages/BudgetPage';
import LoginPage from './components/LoginPage';
import './index.css';

function App() {
  return (
    <div className="App">
      <Router basename="/afs">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/instalaciones" element={<BudgetPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
