import React, { useEffect, useState } from "react";
import config from "../config";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../auth/ApiRequest";
import { useDispatch } from "react-redux";
import { resetAlbum } from "../redux/slices/albumSlice";
import { resetAvailable } from "../redux/slices/availableSlice";
import { resetTraded } from "../redux/slices/tradedSlice";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [spinner, setSpinner] = useState(false)

  useEffect(() => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    sessionStorage.removeItem('albumSection');
    dispatch(resetAlbum());
    dispatch(resetAvailable());
    dispatch(resetTraded());
  }, []);
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setSpinner(true);
    try {
      const response = await apiRequest(`${config.serverUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          username: email, 
          password: password,
        }),
      },navigate);

      const data = await response.json();

      if (response.ok) {
        // Salva i dati nel localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect alla home
        navigate('/'); 
      } else {
        setError(data.message || 'Login fallito');
      }
    } catch (error) {
      setError('Errore durante la richiesta');
      console.error("Errore durante la richiesta di login:", error);
    }
    setSpinner(false);
  };

  return (
    <div className='container-fluid d-flex vh-100 flex-column'>
      <div className="row my-auto justify-content-center align-item-center">
        <form className="col-sm-8 col-md-6 col-xl-4 p-4" onSubmit={handleLogin}>
          <h1 className="h3 mb-4 fw-normal">Sign in</h1>
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
          <div className="form-floating mb-3 mx-auto">
            <input
              type="password"
              className={"form-control "+(error && "is-invalid")}
              id="floatingPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="floatingPassword">Password</label>
          </div>
          <button 
            className="btn btn-primary w-100 pb-2 mb-1" 
            type="submit"
            disabled={email.trim() === '' || password.trim() === '' || spinner}
            >
            {!spinner ? "Sign in" :
              <div className="my-auto spinner-grow spinner-grow-sm " role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            }
          </button>
          <div className="w-50 mb-4">
            <Link to="/reset-password" className="link-secondary link-underline-secondary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">Forgot Password</Link>
          </div>
          <p className="text-center">Not a member? <Link to="/sign-up" className="link-primary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">Sign Up</Link></p>
          <p className="mt-5 text-body-secondary">© Gabriel Pedranzini {new Date().getFullYear()}</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
