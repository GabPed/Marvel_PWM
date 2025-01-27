import React from "react";
import EditField from "../components/ProfileInfo/EditField";
import Container from "../components/Sidebar/Container";

function EditPassword() {
    return (
      <Container>
        <EditField visibleFields={['oldPassword','password','confirmPassword']} insert={false}/>
      </Container>
    )
      
}

export default EditPassword;