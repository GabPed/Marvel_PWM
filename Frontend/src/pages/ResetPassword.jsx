import React, { useEffect, useRef, useState } from "react";
import EditField from "../components/ProfileInfo/EditField";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../auth/ApiRequest";
import config from "../config";
import Toast from 'bootstrap/js/dist/toast';

function ResetPassword() {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [spinner, setSpinner] = useState(false)

  const navigate = useNavigate();
  
  const ResetPassword = async (e) => {
    e.preventDefault();
    setSpinner(true);
    try {
      const response = await apiRequest(`${import.meta.env.VITE_SERVER_URL}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          username: email
        }),
      },navigate);

      const data = await response.json();

      if (response.ok) {
        showToast();
      } else {
        setError(data.message || 'Reset password failed');
      }
    } catch (error) {
      setError('Errore durante la richiesta');
      console.error("Errore durante la richiesta di login:", error);
    }
    setSpinner(false);
  };

  const toastRef = useRef(null);

  const hideToast = () => {
    toastRef.current.hide();
  }

  const showToast = () => {
    toastRef.current.show();
  }

  useEffect(() => {
    if(token) localStorage.setItem('token', token);
    toastRef.current = new Toast(document.getElementById("toast_emailSended")); 
  }, []);

  if(token) return <EditField visibleFields={['password','confirmPassword']} insert={false} reset={true}/>
    
  return (
    <div className='container-fluid d-flex vh-100 flex-column'>
      <div 
        id = "toast_emailSended"
        className="toast fade position-fixed bottom-0 end-0 p-2 m-4" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
      <div className="toast-header">
          <strong className="me-auto">Recovery Email Sent</strong>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={hideToast}
            />
        </div>         
        <div className="toast-body">An email to reset your password has been sent. If you don't see it, please check your spam folder.</div>
      </div>
      <div className="row my-auto justify-content-center align-item-center">
        <form className="col-sm-8 col-md-6 col-xl-4 p-4" onSubmit={ResetPassword}>
          <h1 className="h3 mb-4 fw-normal">Reset Password</h1>
          {error && <p className="text-danger">{error}</p>}
          <div className="form-floating mb-3 mx-auto">
            <input
              type="username"
              className={"form-control "+(error && "is-invalid")}
              id="floatingInput"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingInput">Email o Username</label>
          </div>
          <button className="btn btn-primary w-100 pb-2 mb-1" type="submit" disabled={email.trim() === '' || spinner}>
            {!spinner ? "Send Email" :
              <div className="my-auto spinner-grow spinner-grow-sm " role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            }
          </button>
          <p className="text-center"><Link to="/login" className="link-primary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">Sign In</Link></p>
          <p className="mt-5 text-body-secondary">© Gabriel Pedranzini {new Date().getFullYear()}</p>
        </form>
      </div>
    </div>
  )
      
}

export default ResetPassword;