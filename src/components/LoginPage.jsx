import React, { useState } from 'react';
import logo from '../images/logo.png';

const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Usar variable de entorno para la contraseña
    const correctPassword = process.env.REACT_APP_PASSWORD;
    
    if (password === correctPassword) {
      localStorage.setItem('afs_authenticated', 'true');
      onLogin();
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="AFS Logo" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <p className="text-gray-600 mt-2">Ingrese la contraseña para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese la contraseña"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Ingresar
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Acceso restringido</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
