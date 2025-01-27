import React from "react";
import CardSettings from "../components/ProfileInfo/CardSettings";
import CardDeleteSettings from "../components/ProfileInfo/CardDeleteSettings";
import Container from "../components/Sidebar/Container";

function Settings() {
    return (
      <Container className="w-100 p-4">
        <div className="row g-4 justify-content-center mt-1 px-2">
          <div className="col-12 d-flex justify-content-center align-items-center d-column my-3">
            <i className="bi bi-gear-wide-connected h2 me-2"></i>
            <h1 className="h2">
              Settings 
            </h1>
          </div>
          <div className="col-11 col-xl-6">
            <CardSettings title = "Profile Information" icon = "bi-person-lines-fill" button = "Edit Profile" link = "/settings/edit-profile"/>
          </div>
          <div className="col-11 col-xl-6">
            <CardSettings title = "Password" icon = "bi-person-fill-lock" button = "Change Password" link = "/settings/edit-password"/>
          </div>
          <div className="col-11 col-xl-12">
            <CardDeleteSettings/>
          </div>
        </div>
      </Container>
    );
      
}

export default Settings;