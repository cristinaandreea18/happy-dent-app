import './AdminSidebar.css';
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaUsers } from 'react-icons/fa';
import { TbReportSearch } from 'react-icons/tb';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const SidebarItem = ({ icon, text, link, isOpen }) => {
    return (
      <li className="sidebar-item">
        <Link to={link} className="flex items-center">
          <span className="icon">{icon}</span>
          <span className={isOpen ? '' : 'hidden'}>{text}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen && <span>Clinica HappyDent</span>}
        <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
          <FaBars />
        </button>
      </div>
      <ul className="sidebar-menu">
        <SidebarItem icon={<FaUsers />} text="Personal medical" link="/admin">
          isOpen ={isOpen}
        </SidebarItem>
        <SidebarItem icon={<TbReportSearch />} text="Rapoarte" link="/reports">
          isOpen ={isOpen}
        </SidebarItem>
      </ul>
    </div>
  );
};

export default AdminSidebar;
