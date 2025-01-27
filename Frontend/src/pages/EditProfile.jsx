import React from "react";
import EditField from "../components/ProfileInfo/EditField";
import Container from "../components/Sidebar/Container";

function EditProfile() {
    return (
      <Container>
        <EditField visibleFields={['username','email','favoriteHero']} insert={false}/>
      </Container>
    );
      
}

export default EditProfile;