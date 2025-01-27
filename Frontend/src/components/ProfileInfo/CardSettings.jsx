import React from "react";
import NavButton from "../Sidebar/NavButton";
import Sidebar from "../Sidebar/Sidebar";
import { Link } from "react-router-dom";

function CardSettings({icon, title, button, link}) {
    return (
        <div className="card w-100 shadow rounded">
            <div className="card-body p-2">
                <div className="row align-items-center justify-content-center g-2 gy-3">
                    <div className="col-9 col-sm-2 text-center text-sm-start">
                        <i className={"h1 align-self-center mx-sm-3 bi "+icon}></i>
                    </div>
                    <div className="col-9 col-sm-6 text-center">
                        <p className="card-text align-self-center h4 m-0"> {title}</p>
                    </div>
                    <div className="col-9 col-sm-4 d-flex justify-content-between align-items-center p-2">
                        <Link to={link} className="btn btn-primary w-100">
                         {button}
                        </Link>
                    </div>
                </div>
            </div>
        </div>              
    );
      
}

export default CardSettings;