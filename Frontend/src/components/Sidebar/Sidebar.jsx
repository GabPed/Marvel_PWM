import React, { useEffect } from 'react';
import './Sidebar.css';
import NavItem from './NavItem';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const { isDarkMode, toggleTheme } = useTheme();
  
  useEffect(() => {
    if (window.bootstrap) {
      tooltipRef.current.forEach((el) => {
        if (el) {
          new window.bootstrap.Tooltip(el);
        }
      });
    }
  }, []);

  return (
  <div id="sidebar" className="offcanvas-sm offcanvas-start d-sm-flex flex-column flex-shrink-0 sticky-sm-top min-vh-100 shadow" data-bs-scroll="true" tab-index="-1">
    <div className="d-flex align-items-center justify-content-center p-4">
      <img src={"../src/assets/avatars/"+user.favoriteHero_img} className='rounded-circle' height="55"/>
    </div>
    <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
      <NavItem link="" title="Home" icon="bi-app"></NavItem>
      <NavItem link="album" title="Album" icon="bi-collection"></NavItem>
      <NavItem link="baratto" title="Baratto" icon="bi-arrow-repeat"></NavItem>
      <NavItem link="new-offers" title="Nuove offerte" icon="bi-bell"></NavItem>
      <NavItem link="old-offers" title="Cronologia offerte" icon="bi-clock-history"></NavItem>
      <NavItem link="search-users" title="Ricerca utenti" icon="bi-people"></NavItem>
    </ul>
    <div className="dropdown border-top"> 
      <button className="btn btn-link d-flex align-items-center justify-content-center p-3 text-decoration-none dropdown-toggle" id="dropdownUser3" data-bs-toggle="dropdown" aria-expanded="false">
        <i className="bi bi-gear-wide-connected h2"></i>
      </button>
      <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser3">
        <li>
          <div className="dropdown-item">
            <div className="form">
              <label id="modeSelector" className="form-check-label d-flex align-item-center" htmlFor="darkModeSwitch">
                {isDarkMode ? <><i className="bi bi-brightness-high-fill me-2"></i> Light mode </> : <><i className="bi bi-moon-stars-fill me-2"></i> Dark mode</>}
              </label>
              <input
                type="checkbox"
                id="darkModeSwitch"
                checked={isDarkMode}
                onChange={toggleTheme}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </li>
        <li><Link className="dropdown-item d-flex align-item-center" to="/settings"><i className="bi bi-gear-wide-connected me-2"></i>Settings</Link></li>
        <li><hr className="dropdown-divider" /></li>
        <li><Link className="dropdown-item d-flex align-item-center" to="/login"><i className="bi bi-box-arrow-in-right me-2"></i> Sign out</Link></li>
      </ul>
    </div>
  </div>

  );
}

export default Sidebar;
