import './PasswordForms.css';
import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import Button from '../Button/Button';
import validation from '../../utils/validation';
import MessageBox from '../MessageBox/MessageBox';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const { token } = useParams();
  const { user } = useContext(AppContext);
  console.log('ResetPassword component loaded');
  console.log('Token from URL:', token);
  const navigate = useNavigate();

  const handleReset = async () => {
    const passwordValidation = validation.validatePassword(
      newPassword,
      confirmPassword
    );

    if (passwordValidation) {
      setMessage({
        type: 'error',
        message: passwordValidation,
      });
      return;
    }

    try {
      await user.resetPassword(token, newPassword);
      setMessage({
        type: 'success',
        message: 'Parola a fost schimbată! Vei fi redirecționat...',
      });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setMessage({
        type: 'error',
        message: err.message,
      });
    }
  };

  return (
    <div className="password-form">
      <h2>Introdu o parolă nouă</h2>
      <input
        type="password"
        placeholder="Parolă nouă"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder=" Confirmă parola nouă"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button variant="wrap" size="small" onClick={handleReset}>
        Resetează Parola
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

export default ResetPassword;
