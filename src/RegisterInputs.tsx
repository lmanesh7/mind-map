import React from 'react';

type RegisterInputsProps = {
  username: string;
  password: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
};

const RegisterInputs: React.FC<RegisterInputsProps> = ({ username, password, setUsername, setPassword }) => (
  <>
    <div className="form-group">
      <label htmlFor="newUsername" className="label">New Username:</label>
      <input
        type="text"
        id="newUsername"
        name="newUsername"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="auth-input"
      />
    </div>
    <div className="form-group">
      <label htmlFor="newPassword" className="label">New Password:</label>
      <input
        type="password"
        id="newPassword"
        name="newPassword"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
      />
    </div>
  </>
);

export default RegisterInputs;
