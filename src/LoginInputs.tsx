import React from 'react';

type LoginInputsProps = {
  username: string;
  password: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
};

const LoginInputs: React.FC<LoginInputsProps> = ({ username, password, setUsername, setPassword }) => (
  <>
    <div className="form-group">
      <label htmlFor="username" className="label">Username:</label>
      <input
        type="text"
        id="username"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="auth-input"
      />
    </div>
    <div className="form-group">
      <label htmlFor="password" className="label">Password:</label>
      <input
        type="password"
        id="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
      />
    </div>
  </>
);

export default LoginInputs;
