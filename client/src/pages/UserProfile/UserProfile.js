import './UserProfile.css';
import React, { useState, useContext, useEffect } from 'react';
import AppContext from '../../state/AppContext';
import validation from '../../utils/validation';
import Button from '../../components/Button/Button';
import PatientSidebar from '../../components/PatientSidebar/PatientSidebar';
import DoctorSidebar from '../../components/DoctorSidebar/DoctorSidebar';
import Avatar from '../../components/Avatar/Avatar';
import MessageBox from '../../components/MessageBox/MessageBox';
import { FaUser } from 'react-icons/fa';

const UserProfile = () => {
  const { profile, user, doctor } = useContext(AppContext);
  const userId = user?.data?.id;
  const userEmail = user?.data?.email;
  const role = user?.data?.role;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [gender, setGender] = useState('');
  const [ocupation, setOcupation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [county, setCounty] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [counties, setCounties] = useState([]);
  const [cities, setCities] = useState([]);
  const [message, setMessage] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  console.log('user profile', profile);

  function checkDate(selectedDate) {
    const now = new Date();
    const isoToday = now.toISOString().split('T')[0];
    if (selectedDate > isoToday) {
      setMessage({
        type: 'error',
        message: 'Data ar trebui să fie în viitor!',
      });
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (!profile) return;
    else {
      const fetchProfile = async () => {
        try {
          const userProfile = await profile.getUserProfile(userId);
          if (userProfile) {
            console.log('User Profile:', userProfile);
            setFirstName(userProfile.firstName || '');
            setLastName(userProfile.lastName || '');
            let finalDate = '';
            const parts = userProfile.dateOfBirth.split('.');
            if (parts.length === 3) {
              const [dd, mm, yyyy] = parts;
              finalDate = `${yyyy}-${mm}-${dd}`;
            }
            setDateOfBirth(finalDate);
            setIdentificationNumber(userProfile.identificationNumber || '');
            setGender(userProfile.gender || '');
            setOcupation(userProfile.ocupation || '');
            setPhoneNumber(userProfile.phoneNumber || '');
            setCounty(userProfile.county || '');
            setCity(userProfile.city || '');
            setEmail(userProfile.email || userEmail || '');
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } catch (err) {
          setMessage({ type: 'error', message: err.message });
        }
      };
      fetchProfile();
    }
  }, [userId, userEmail, profile]);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const response = await fetch('/const/judete.json');
        const data = await response.json();
        setCounties(data.judete || []);
      } catch (err) {
        setMessage({
          type: 'error',
          message: 'Eroare la încărcarea județelor!',
        });
      }
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    if (!county) {
      setCities([]);
      return;
    }
    const selectedCounty = counties.find((c) => c.nume === county);
    setCities(
      selectedCounty?.localitati
        ?.map((loc) => loc.nume)
        ?.sort((a, b) => a.localeCompare(b, 'ro')) || []
    );
  }, [county, counties]);

  const handleSubmit = async () => {
    const validationErrors = validation.validateUserProfile(
      gender,
      identificationNumber,
      phoneNumber,
      dateOfBirth
    );

    if (validationErrors) {
      setMessage({ type: 'warning', message: validationErrors });
      return;
    }

    try {
      const existingProfile = await profile.getUserProfile(userId);
      if (existingProfile) {
        setMessage({
          type: 'error',
          message: 'Profilul există deja! Te rugăm să-l actualizezi în schimb.',
        });
        return;
      }

      let finalDate = '';
      if (dateOfBirth && dateOfBirth.includes('-')) {
        const parts = dateOfBirth.split('-');
        if (parts.length === 3) {
          const [yyyy, mm, dd] = parts;
          finalDate = `${dd}.${mm}.${yyyy}`;
        }
      }

      await profile.createUserProfile(
        userId,
        firstName,
        lastName,
        finalDate,
        identificationNumber,
        gender,
        ocupation,
        phoneNumber,
        county,
        city,
        email
      );
      setMessage({ type: 'success', message: 'Profil creat cu succes!' });
      setHasProfile(true);
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  const handleUpdate = async () => {
    const validationErrors = validation.validateUserProfile(
      gender,
      identificationNumber,
      phoneNumber,
      dateOfBirth
    );

    if (validationErrors) {
      setMessage({ type: 'warning', message: validationErrors });
      return;
    }

    try {
      let finalDate = '';
      if (dateOfBirth && dateOfBirth.includes('-')) {
        const parts = dateOfBirth.split('-');
        if (parts.length === 3) {
          const [yyyy, mm, dd] = parts;
          finalDate = `${dd}.${mm}.${yyyy}`;
        }
      }

      await profile.updateUserProfile(
        userId,
        firstName,
        lastName,
        finalDate,
        identificationNumber,
        gender,
        ocupation,
        phoneNumber,
        county,
        city,
        email
      );
      setMessage({ type: 'success', message: 'Profil actualizat cu succes!' });
    } catch (err) {
      setMessage({ type: 'error', message: err.message });
    }
  };

  let userRole = role;
  let specialization = '';
  let fullName = '';
  if (role === 'patient') {
    if (profile?.data?.firstName) {
      fullName = `${profile?.data?.firstName} ${profile?.data?.lastName}`;
    } else {
      fullName = 'Patient nou';
    }
  }

  if (role === 'doctor') {
    if (doctor?.data?.firstName) {
      fullName = `${doctor?.data?.firstName} ${doctor?.data?.lastName}`;
      specialization = doctor?.data?.specialization;
    } else {
      fullName = 'Doctor nou';
    }
  }

  return (
    <div className="profile-page-container">
      {role === 'doctor' ? <DoctorSidebar /> : <PatientSidebar />}{' '}
      <div className="profile-main-content">
        <div className="profile-header">
          <h1>
            <FaUser />
            Completează profilul
          </h1>{' '}
          <div className="user-info">
            <Avatar
              // image={
              //   user?.data?.profilePicURL ||
              //   'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg'
              // }
              name={fullName || 'New user'}
              role={userRole}
              superRole={specialization}
              email={userEmail}
            />
          </div>
        </div>
        <div className="profile-form">
          <div className="profile-input-box">
            <label className="input-label">Prenume</label>
            <input
              type="text"
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="profile-input-text"
            />
          </div>
          <div className="profile-input-box">
            <label className="input-label">Nume</label>
            <input
              type="text"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="profile-input-text"
            />
          </div>
          <div className="profile-input-box">
            <label className="input-label">Data nașterii</label>
            <input
              type="date"
              placeholder="Date of Birth"
              required
              value={dateOfBirth}
              onChange={(e) => {
                const selectedDate = e.target.value;
                console.log(selectedDate);
                if (checkDate(selectedDate)) {
                  setDateOfBirth(selectedDate);
                }
              }}
              className="profile-input-text"
            ></input>
          </div>
          <div className="profile-input-box">
            <label className="input-label">Cod numeric personal</label>
            <input
              type="text"
              placeholder="Identification Number"
              required
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              className="profile-input-text"
            />
          </div>
          <div className="profile-input-box">
            <label className="input-label">Gen</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Selectează gen</option>
              <option value="male">Masculin</option>
              <option value="female">Feminin</option>
            </select>
          </div>
          <div className="profile-input-box">
            <label className="input-label">Ocupație</label>
            <input
              type="text"
              placeholder="Ocupation"
              required
              value={ocupation}
              onChange={(e) => setOcupation(e.target.value)}
              className="profile-input-text"
            />
          </div>
          <div className="profile-input-box">
            <label className="input-label">Telefon</label>
            <input
              type="text"
              placeholder="Phone Number"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="profile-input-text"
            />
          </div>
          <div className="profile-input-box">
            <label className="input-label">Județ</label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              required
            >
              <option value="">Selectează județ</option>
              {counties.map((c) => (
                <option key={c.nume} value={c.nume}>
                  {c.nume}
                </option>
              ))}
            </select>
          </div>
          <div className="profile-input-box">
            <label className="input-label">Oraș</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              <option value="">Selectează oraș</option>
              {cities.map((city, i) => (
                <option key={`${city}-${i}`} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="profile-input-box">
            <label className="input-label">Email</label>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              readOnly
            />
          </div>
          <div className="profile-buttons-container">
            {!hasProfile ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmit}
                className="btn-create"
              >
                Creează profil
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleUpdate}
                className="btn-update"
              >
                Actualizează profil
              </Button>
            )}
          </div>
        </div>
        {message && (
          <MessageBox
            type={message.type}
            message={message.message}
            duration={3000}
            onClose={() => setMessage(null)}
          />
        )}{' '}
      </div>
    </div>
  );
};

export default UserProfile;
