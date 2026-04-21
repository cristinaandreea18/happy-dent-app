import './PasswordForms.css';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import Button from '../Button/Button';
import MessageBox from '../MessageBox/MessageBox';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await user.requestPasswordReset(email);
      setMessage({
        type: 'success',
        message: 'Verifică emailul pentru linkul de resetare.',
      });

      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setMessage({
        type: 'error',
        message: err.message,
      });
    }
  };

  return (
    <div className="password-form">
      <h2>Resetare Parolă</h2>
      <input
        type="email"
        placeholder="Emailul tău"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button variant="wrap" size="small" onClick={handleSubmit}>
        Trimite link de resetare
      </Button>
      {message && (
        <MessageBox
          type={message.type}
          message={message.message}
          duration={5000}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
