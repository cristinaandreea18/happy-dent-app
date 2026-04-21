import { createContext } from 'react';

const AppContext = createContext({
  user: null,
  setUser: null,
  profile: null,
  doctor: null,
  admin: null,
  appointment: null,
  notification: null,
  availableSlots: null,
  service: null,
  specialization: null,
});

export default AppContext;
