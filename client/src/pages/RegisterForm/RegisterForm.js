import './RegisterForm.css';
import React, { useState, useContext, useEffect } from 'react';
import AppContext from '../../state/AppContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import validation from '../../utils/validation';
import Button from '../../components/Button/Button';
import MessageBox from '../../components/MessageBox/MessageBox';

const RegisterForm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState(null);
  //const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const userValidationErrors = validation.validateUser(
      username,
      email,
      password,
      confirmPassword
    );
    if (userValidationErrors) {
      setMessage({ type: 'error', message: userValidationErrors });
      return;
    }

    try {
      await user.register(username, email, password, role);
      setMessage('');
      navigate('/');
    } catch (err) {
      setMessage({
        type: 'error',
        message:
          err.message ||
          'Eroare de la server! Te rugăm să încerci mai târziu...',
      });
    }
  };

  return (
    <div className="register-form">
      <div className="form-container">
        <div className="clinic-header">
          <h1> Clinica HappyDent</h1>
          <h1 className="auth-title">Creează un cont</h1>
        </div>
      </div>
      <div className="input-box">
        <input
          type="text"
          id="username-input"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <i className="bx bxs-user"></i>
      </div>
      <div className="input-box">
        <input
          type="email"
          id="email-input"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <i className="bx bxs-envelope"></i>
      </div>
      <div className="input-box">
        <input
          type="password"
          id="password-input"
          placeholder="Parolă"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <i className="bx bxs-lock-alt"></i>
      </div>
      <div className="input-box">
        <input
          type="password"
          id="confirm-password-input"
          placeholder="Confirmă Parola"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <i className="bx bxs-lock-alt"></i>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="large"
        onClick={handleSubmit}
        className="btn-register"
        style={{ width: '100%', height: '45px' }}
      >
        Înregistrează-te
      </Button>
      <p className="login-link">
        Ai deja un cont? <Link to="/login">LOGIN</Link>
      </p>
      {message && (
        <MessageBox
          type={message.type}
          message={message.message}
          duration={3000}
          onClose={() => setMessage(null)}
        />
      )}{' '}
    </div>
  );
};

export default RegisterForm;
