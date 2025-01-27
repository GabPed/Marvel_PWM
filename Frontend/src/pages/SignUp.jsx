import React from "react";
import EditField from "../components/ProfileInfo/EditField";

function SignUp() {
    return <EditField visibleFields={['username', 'email', 'password', 'confirmPassword','favoriteHero']} insert={true}/>
}

export default SignUp;