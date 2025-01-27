import React from 'react';
import './NavItem.css';
import { Link, useLocation } from 'react-router-dom';

function NavItem({link, title, activeTitle, icon, onClick}) {
  const location = useLocation(); // Ottiene il percorso corrente

  return (
    <li className="nav-item">
      <Link to= {"/"+link} className={"nav-link "+("/"+link === location.pathname ? "active" : "" )+" py-3 rounded-0"} aria-current="page" title={title} data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title={title}>
        <i className={"bi "+icon+" h2"}></i>
      </Link>
    </li>
  );
 }
  
  export default NavItem;