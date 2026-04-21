import './Avatar.css';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { Dots } from 'react-activity';
import 'react-activity/dist/library.css';
import { FaBell, FaRegBell } from 'react-icons/fa';

const Avatar = ({ name, role, superRole, email }) => {
  const { user, setUser, socket, profile } = useContext(AppContext);
  const [isDroppedDownOpen, setIsDropDownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  console.log('Full user context', user);
  const userId = user?.data?.id;

  // Actualizează starea locală când se schimbă user-ul din context
  useEffect(() => {
    if (user?.data?.profilePicURL) {
      setProfilePicUrl(user.data.profilePicURL);
    }
  }, [user?.data?.profilePicURL]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropDownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!socket || role !== 'patient') return;

    console.log('Setting up socket listener for patient:', userId);

    socket.on('patientAppointmentNotification', (data) => {
      console.log('SOCKET: Received notification:', data);
      const notification = {
        appointmentId: data.appointmentId,
        status: data.status,
        appointmentDate: data.appointmentDate,
        time: data.time,
        doctorName: data.doctorName,
        message: data.message,
      };
      console.log('SOCKET: Notification data:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.off('patientAppointmentNotification');
  }, [socket, userId]);

  const handleLogout = async () => {
    try {
      console.log('Logging out!');
      await user.logout(profile);
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', message: 'Failed to logout' });
    }
  };

  const handlePhotoUpload = () => {
    console.log('Upload photo!');
    fileInputRef.current.click();
  };

  //Avatar.js
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const result = await user.updateUserProfilePic(userId, file);
      if (result.user?.profilePicURL) {
        // localStorage.setItem(
        //   'user',
        //   JSON.stringify({
        //     ...user,
        //     data: {
        //       ...user.data,
        //       user: result.user,
        //     },
        //   })
        // );
        if (result.user?.profilePicURL) {
          // Actualizează localStorage
          const updatedUserData = {
            ...user.data,
            profilePicURL: result.user.profilePicURL, // Actualizează direct profilePicURL
          };

          user.data = updatedUserData;
          localStorage.setItem('user', JSON.stringify(updatedUserData));

          // Actualizează contextul dacă există setUser
          if (setUser) {
            setUser(updatedUserData);
          }

          // Actualizează starea locală cu timestamp pentru a forța re-render
          const newProfilePicUrl = `${
            result.user.profilePicURL
          }?t=${Date.now()}`;
          setProfilePicUrl(newProfilePicUrl);

          setMessage({
            type: 'success',
            message: 'Fotografia a fost actualizată cu succes!',
          });
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage({
        type: 'error',
        message: 'Eroare la încărcarea fotografiei!',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = () => {
    console.log('Change password!');
    navigate('/change-password');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  // Determină URL-ul imaginii cu cache-busting
  const getImageUrl = () => {
    if (profilePicUrl) {
      return profilePicUrl;
    }
    if (user?.data?.profilePicURL) {
      return `${user.data.profilePicURL}`;
    }
    return 'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg';
  };

  return (
    <div className="avatar-container" ref={dropdownRef}>
      {role === 'patient' && (
        <div className="notification-icon" onClick={toggleNotifications}>
          {unreadCount > 0 ? (
            <>
              <FaBell className="bell-icon" />
              <span className="notification-badge">{unreadCount}</span>
            </>
          ) : (
            <FaRegBell className="bell-icon" />
          )}
        </div>
      )}

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notificări</h3>
            <button onClick={() => setShowNotifications(false)}>×</button>
          </div>
          {notifications.length > 0 ? (
            <ul className="notifications-list">
              {notifications.map((notification, index) => (
                <li key={index} className="notification-item">
                  <p>{notification.message}</p>
                  <small>{new Date().toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-notifications">Nu există notificări...</p>
          )}
        </div>
      )}

      <div
        className="avatar-image-container"
        onClick={() => setIsDropDownOpen(!isDroppedDownOpen)}
      >
        <img
          // src={
          //   user?.data?.profilePicURL ||
          //   'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
          // }
          src={getImageUrl()}
          alt={name}
          className="avatar-image"
          key={profilePicUrl || user?.data?.profilePicURL}
        />{' '}
        {role === 'admin' && <span className="admin-badge">Admin</span>}
        {role === 'doctor' && <span className="doctor-badge">Doctor</span>}
        {role === 'patient' && <span className="patient-badge">Pacient</span>}
      </div>

      {isUploading && (
        <div style={{ marginTop: '0.5rem' }}>
          <Dots color="#09f" size={16} />
        </div>
      )}

      {isDroppedDownOpen && (
        <div className="avatar-dropdown">
          <div className="dropdown-header">
            <p>{email}</p>
            <h3>
              Bună,{' '}
              {name.startsWith('New')
                ? role === 'patient'
                  ? 'Pacient'
                  : role === 'doctor'
                    ? 'Doctor'
                    : 'Utilizator'
                : name.split(' ')[0]}
              !
            </h3>
          </div>

          <div className="dropdown-section">
            <h3 className="section-title">Opțiuni</h3>
            <button className="dropdown-option" onClick={handlePhotoUpload}>
              <span className="material-icons-outlined">upload</span>
              Încarcă fotografie
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button className="dropdown-option" onClick={handleChangePassword}>
              <span className="material-icons-outlined">lock</span>
              Schimbă parola
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <button
              className="dropdown-option logout-btn"
              onClick={handleLogout}
            >
              <span className="material-icons-outlined">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="avatar-info">
        <span className="avatar-name">{name}</span>
        <span className="avatar-role">{superRole}</span>
      </div>
    </div>
  );
};

export default Avatar;
