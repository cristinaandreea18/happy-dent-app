import './DoctorSidebar.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaUsers, FaClock, FaCalendarAlt } from 'react-icons/fa';

const DoctorSidebar = () => {
  const SidebarItem = ({ icon, text, link }) => {
    return (
      <li className="sidebar-item">
        <Link to={link} className="flex items-center">
          <span className="icon">{icon}</span>
          <span>{text}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>Clinica HappyDent</span>
      </div>
      <ul className="sidebar-menu">
        <SidebarItem
          icon={<FaUsers />}
          text="Pacienți"
          link="/dashboard"
        ></SidebarItem>
        <SidebarItem
          icon={<FaUser />}
          text="Profil"
          link="/doctor-profile"
        ></SidebarItem>
        <SidebarItem
          icon={<FaClock color="#4facfe" />}
          text="Programări"
          link="/appointments/:did"
        ></SidebarItem>
        <SidebarItem
          icon={<FaCalendarAlt />}
          text="Calendar"
          link="/schedule/:did"
        ></SidebarItem>
      </ul>
    </div>
  );
};

export default DoctorSidebar;
