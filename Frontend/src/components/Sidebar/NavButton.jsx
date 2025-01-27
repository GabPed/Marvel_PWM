import React from "react";
import './NavButton.css';

function NavButton () {
    return (
    <button id="NavButton" className="fixed-top top-0 start-0 m-2 btn btn-primary d-sm-none " type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-expanded="false" aria-controls="sidebar">
        <i className="bi bi-list h2"></i>
    </button>
    );
}

export default NavButton;