import './PasswordForms.css';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import Button from '../Button/Button';
import validation from '../../utils/validation';

import MessageBox from '../MessageBox/MessageBox';

const ChangePassword = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (step === 1) {
      if (!oldPassword) {
        setMessage({ type: 'error', message: 'Introduce parola actuală' });
        return;
      }
      setStep(2);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', message: 'Completează toate câmpurile' });
      return;
    }

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

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', message: 'Parolele nu coincid!' });
      return;
    }

    try {
      await user.changePassword(oldPassword, newPassword);
      setMessage({
        type: 'success',
        message: 'Parola a fost schimbată cu succes!',
      });

      if (user.data?.role === 'doctor') {
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }
      if (user.data?.role === 'patient') {
        setTimeout(() => navigate('/profile'), 2000);
        return;
      }
      if (user.data?.role === 'admin') {
        setTimeout(() => navigate('/admin'), 2000);
        return;
      }
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="password-form">
      <h2>Schimbă Parola</h2>

      {step === 1 && (
        <>
          <input
            type="password"
            placeholder="Parola actuală"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Button onClick={handleSubmit}>Continuă</Button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="password"
            placeholder="Parolă nouă"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmă parolă nouă"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={handleSubmit}>Schimbă Parola</Button>
        </>
      )}

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

export default ChangePassword;
