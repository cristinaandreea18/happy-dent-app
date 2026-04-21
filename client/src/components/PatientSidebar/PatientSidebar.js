import './PatientSidebar.css';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { TbCalendarClock } from 'react-icons/tb';
import { TbMessageChatbot } from 'react-icons/tb';
import { FaRobot } from 'react-icons/fa';

const PatientSidebar = () => {
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
          icon={<FaUser />}
          text="Profil"
          link="/profile"
        ></SidebarItem>
        <SidebarItem
          icon={<FaCalendarAlt />}
          text="Programare"
          link="/appointment"
        ></SidebarItem>
        <SidebarItem
          icon={<TbCalendarClock />}
          text="Vizite"
          link="/visits"
        ></SidebarItem>
        <SidebarItem
          icon={<FaRobot />}
          text="HappyDentBot"
          link="/chatbot-page"
        ></SidebarItem>
      </ul>
    </div>
  );
};

export default PatientSidebar;
