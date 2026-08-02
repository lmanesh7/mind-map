// AppWrapper.js
import React, { useState } from 'react';
import LoginForm from './homePage';
import App from './App';
import { ReactFlowProvider } from 'reactflow';

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <React.StrictMode>
      <ReactFlowProvider>
        {isLoggedIn ? <App /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
      </ReactFlowProvider>
    </React.StrictMode>
  );
}

export default AppWrapper;
