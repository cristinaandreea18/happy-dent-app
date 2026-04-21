//import logo from './logo.svg';
//import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import {
  HashRouter as Router,
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import AppContext from '../../state/AppContext';
import { io } from 'socket.io-client';

//pages
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import UserProfile from '../UserProfile';
import DoctorDashboard from '../DoctorDashboard';
import AdminDashboard from '../AdminDashboard';
import PatientProfile from '../PatientProfile';
import ProtectedRoute from '../ProtectedRoute';
import Appointment from '../Appointment';
import DoctorAppointments from '../DoctorAppointments';
import DoctorSchedule from '../DoctorSchedule';
import Visits from '../Visits';
import HappyDentChatbot from '../../components/HappyDentChatbot/HappyDentChatbot';
import AdminReports from '../AdminReports';
import HappyDentAssistant from '../HappyDentAssistant';
import DoctorProfile from '../DoctorProfile';
import ForgotPassword from '../../components/Password/ForgotPassword';
import ResetPassword from '../../components/Password/ResetPassword';
import ChangePassword from '../../components/Password/ChangePassword';

//stores
import AdminStore from '../../state/stores/adminStore';
import UserStore from '../../state/stores/UserStore';
import UserProfileStore from '../../state/stores/UserProfileStore';
import DoctorStore from '../../state/stores/doctorStore';
import AppointmentStore from '../../state/stores/appointmentStore';
import AvailableSlotsStore from '../../state/stores/availableSlotsStore';
import TreatmentPlanStore from '../../state/stores/treatmentPlanStore';
import ServiceStore from '../../state/stores/serviceStore';
import SpecializationStore from '../../state/stores/specializationStore';
import CompetencyStore from '../../state/stores/competencyStore';
import HolidayStore from '../../state/stores/holidayStore';

let socketInstance = null;
const App = () => {
  const [userStore] = useState(new UserStore());
  const [userProfile] = useState(new UserProfileStore());
  const [doctorStore] = useState(new DoctorStore());
  const [adminStore] = useState(new AdminStore());
  const [appointmentStore] = useState(new AppointmentStore());
  const [socket, setSocket] = useState(null);
  const [availableSlotsStore] = useState(new AvailableSlotsStore());
  const [treatmentPlanStore] = useState(new TreatmentPlanStore());
  const [serviceStore] = useState(new ServiceStore());
  const [specializationStore] = useState(new SpecializationStore());
  const [competencyStore] = useState(new CompetencyStore());
  const [holidayStore] = useState(new HolidayStore());

  // Adaugă state pentru a putea actualiza userStore
  const [userStoreState, setUserStoreState] = useState(userStore);

  // Funcție pentru actualizarea userStore
  const updateUserStore = (newUserData) => {
    // Actualizează store-ul
    userStore.data = newUserData;

    // Actualizează localStorage
    localStorage.setItem('user', JSON.stringify(newUserData));

    // Forțează re-render prin actualizarea state-ului
    setUserStoreState({ ...userStore });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      //userStore.data = JSON.parse(storedUser);
      //
      const userData = JSON.parse(storedUser);
      userStore.data = userData;
      setUserStoreState({ ...userStore });
      //
      socketInstance = io('http://localhost:8080', {
        query: {
          userId: userStore.data.id,
          role: userStore.data.role,
        },
        transports: ['websocket'],
      });

      setSocket(socketInstance);

      if (userStore?.data?.id) {
        socketInstance.connect();

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      }

      return () => {
        if (socketInstance) {
          socketInstance.offAny();
          socketInstance.disconnect();
          socketInstance = null;
        }
      };
    }
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user: userStore, // Folosește state-ul actualizabil
        setUser: updateUserStore, // Adaugă funcția de actualizare
        profile: userProfile,
        doctor: doctorStore,
        admin: adminStore,
        appointment: appointmentStore,
        socket: socket,
        availableSlots: availableSlotsStore,
        treatmentPlan: treatmentPlanStore,
        service: serviceStore,
        specialization: specializationStore,
        competency: competencyStore,
        holiday: holidayStore,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />}></Route>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute role="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-profile"
            element={
              <ProtectedRoute role="doctor">
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/:id"
            element={
              <ProtectedRoute role="doctor">
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointment"
            element={
              <ProtectedRoute role="user">
                <Appointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/visits"
            element={
              <ProtectedRoute role="user">
                <Visits />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute role="user">
                <HappyDentChatbot />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot-page"
            element={
              <ProtectedRoute role="user">
                <HappyDentAssistant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/:did"
            element={
              <ProtectedRoute role="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule/:did"
            element={
              <ProtectedRoute role="doctor">
                <DoctorSchedule />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
};

export default App;
