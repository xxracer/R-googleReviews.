import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
      const response = await axios.post('/api/reset-password', {
        username,
        securityAnswer,
        newPassword,
      });
      setSuccess(response.data.message);
      // Clear fields after success
      setUsername('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(onClose, 2000); // Close modal after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al restablecer la contraseña.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <form onSubmit={handlePasswordResetSubmit}>
          <h2>Restablecer Contraseña</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="security-answer">Pregunta de seguridad: BJJ?</label>
            <input
              type="text"
              id="security-answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Nueva Contraseña</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Restablecer Contraseña</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
