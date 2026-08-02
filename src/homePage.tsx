import { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import LoginInputs from './LoginInputs';
import RegisterInputs from './RegisterInputs';

type LoginFormProps = {
  onLoginSuccess: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { username, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        setErrorMsg(data.message || 'Login failed!');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Login failed!');
    }
  };

  const handleRegistrationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { username, password });
      if (data.success) {
        setSuccessMsg('Registration successful! You can now log in.');
        setActiveTab('login');
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Registration failed!');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button 
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
        >
          Login
        </button>
        <button 
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
        >
          Register
        </button>
      </div>

      <div className="auth-content">
        {errorMsg && <div className="error">{errorMsg}</div>}
        {successMsg && <div className="success">{successMsg}</div>}
        
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <LoginInputs username={username} password={password} setUsername={setUsername} setPassword={setPassword} />
            <button type="submit" className="button auth-submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegistrationSubmit}>
            <RegisterInputs username={username} password={password} setUsername={setUsername} setPassword={setPassword} />
            <button type="submit" className="button auth-submit">Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
