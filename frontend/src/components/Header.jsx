import { NavLink } from "react-router-dom";
import './Header.scss';

const Header = () => {
  return (
    <header className="app-header">
      <h1>Timeline App</h1>
      <nav>
        <NavLink to="/locations" className={({ isActive }) => (isActive ? "active" : "")}>
          Locations
        </NavLink>
        <NavLink to="/travels" className={({ isActive }) => (isActive ? "active" : "")}>
          Travels
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;