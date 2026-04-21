import './LoginForm.css';
import React, { useState, useContext } from 'react';
import AppContext from '../../state/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import MessageBox from '../../components/MessageBox/MessageBox';

const LoginForm = () => {
  //const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  //const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      //??
      await user.login(username, password);
      setMessage('');

      const userRole = user.data?.role;

      if (userRole === 'doctor') {
        navigate('/dashboard');
      } else if (userRole === 'patient') {
        navigate('/profile');
      } else {
        navigate('/admin');
      }
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
    <div className="login-form">
      <div className="form-container">
        <div className="clinic-header">
          <h1>HappyDent</h1>
          <h1 className="auth-title">Autentificare</h1>
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
          type="password"
          id="password-input"
          placeholder="Parolă"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <i className="bx bxs-lock-alt"></i>
      </div>
      {message && (
        <MessageBox
          type={message.type}
          message={message.message}
          duration={3000}
          onClose={() => setMessage(null)}
        />
      )}{' '}
      <Button
        type="button"
        variant="primary"
        size="large"
        onClick={handleLogin}
        className="btn-login"
        style={{
          width: '100%',
          height: '45px',
        }}
      >
        Conectează-te
      </Button>
      <p className="register-link">
        Nu ai un cont? <Link to="/register">Înregistrează-te aici</Link>
      </p>
      <p className="forgot-link">
        <Link to="/forgot-password">Ai uitat parola?</Link>
      </p>
    </div>
  );
};

export default LoginForm;
