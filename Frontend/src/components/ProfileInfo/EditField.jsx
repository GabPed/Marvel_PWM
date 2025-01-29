import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FloatingInput from './FloatingInput';
import { apiRequest } from '../../auth/ApiRequest';
import config from '../../config';
import Toast from 'bootstrap/js/dist/toast';
import FloatingSelect from './FloatingSelect';

function EditField({ visibleFields, insert, reset }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {};
  const navigate = useNavigate();
  const formData = {};
  
  // State hooks for form fields and errors
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [favoriteHero, setFavoriteHero] = useState(user.favoriteHero || '');
  const [errors, setErrors] = useState({});
  const [toastContent, setToastContent] = useState();
  const [superHero, setSuperHero] = useState([]);

  const [spinner, setSpinner] = useState(false)

  // Modal reference
  const toastRef = useRef(null);

  if (visibleFields.includes('username')) formData.username = username;
  if (visibleFields.includes('email')) formData.email = email;
  if (visibleFields.includes('oldPassword')) formData.oldPassword = oldPassword;
  if (visibleFields.includes('password')) formData.password = password;
  if (visibleFields.includes('confirmPassword')) formData.confirmPassword = confirmPassword;
  if (visibleFields.includes('favoriteHero')) formData.favoriteHero = favoriteHero;

  
  useEffect(() => {
    toastRef.current = new Toast(document.getElementById("toast_updateDone")); 
    
    document.getElementById("toast_updateDone").addEventListener('hidden.bs.toast', () => {
      setToastContent()
    });

    if(visibleFields.includes('favoriteHero')) {
      getSuperHero();
    }
  }, []);

  useEffect(() => {
    if(toastContent) {
      showToast();
    }
  }, [toastContent]);
  
  const hideToast = () => {
    toastRef.current.hide();
  }

  const showToast = () => {
    toastRef.current.show();
  }

  const getSuperHero = async () => {
    try {
      const response = await apiRequest(import.meta.env.VITE_SERVER_URL+'/avatars', {
        method: 'GET',
      }, navigate);

      const data = await response.json();

      if (response.ok) {
        setSuperHero(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkFormData = () => {
    for (const key in formData) {
      if (formData[key].trim() === '') {
          return true;
      }
    }
    return false;
  }

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (visibleFields.includes('email')) {
      const emailError = isEmailValid(email);
      if (emailError) newErrors.email = emailError;
    }
    
    // Password validation
    if (visibleFields.includes('oldPassword')) {
      const oldPasswordError = isPasswordValid(oldPassword);
      if (oldPasswordError) newErrors.oldPassword = oldPasswordError;
    }

    if (visibleFields.includes('password')) {
      const passwordError = isPasswordValid(password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (visibleFields.includes('confirmPassword') && confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }


    if (visibleFields.includes('username') && !username) newErrors.username = 'Username is required';
    if (visibleFields.includes('favoriteHero') && !favoriteHero) newErrors.favoriteHero = 'Favorite Hero is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSpinner(true);
    if (!validateForm()) {
      setSpinner(false);
      return;
    } 

    try {
      const response = await apiRequest(`${import.meta.env.VITE_SERVER_URL}${insert ? '/auth/register' : '/users'}`, {
        method: insert ? 'POST' : 'PATCH',
        body: JSON.stringify(formData),
      }, navigate);

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (insert) {
          localStorage.setItem('token', data.token);
          setToastContent({title: "Registration Successful", message: "Welcome! Your account has been created successfully. You will be redirected shortly."})
          await new Promise(resolve => setTimeout(resolve, 2000));
          navigate('/');
        } 
        else if (reset) {
          setToastContent({title: "Changes Saved", message: "Your password have been saved successfully. You will be redirected shortly."})
          localStorage.removeItem('token');
          await new Promise(resolve => setTimeout(resolve, 2000));
          navigate('/login')
        }
        else {
          setToastContent({title: "Changes Saved", message: "All changes have been saved successfully."})
        }
      } else {
        setErrors({ form: data.message || (insert ? 'Sign-up failed' : 'Update failed') });
      }
    } catch (error) {
      setErrors({ form: 'Error during the request' });
      console.error('Sign-up request error:', error);
    }
    setSpinner(false);
  };

  return (
    <div className="container-fluid d-flex vh-100 flex-column">
      <div 
        id = "toast_updateDone"
        className="toast fade position-fixed bottom-0 end-0 p-2 m-2 m-sm-4" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div className="toast-header">
          <strong className="me-auto">{toastContent && toastContent.title}</strong>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={hideToast}
            />
        </div>         
        <div className="toast-body">{toastContent && toastContent.message}</div>
      </div>
      <div className="row my-auto justify-content-center align-item-center">
        <form className="col-sm-8 col-md-6 col-xl-4 p-4" onSubmit={handleSignUp}>
          <h1 className="h3 mb-4 fw-normal d-flex align-items-center">
            {insert ? 'Sign Up' : (
              <>
                {
                ((!visibleFields.includes('confirmPassword') && !visibleFields.includes('oldPassword')) 
                || (visibleFields.includes('confirmPassword') && visibleFields.includes('oldPassword')))
                  &&
                  <Link to="/settings" className='btn btn-link'>
                    <i className="bi bi-arrow-left-circle h3"></i> 
                  </Link> 
                }
               
                { visibleFields.includes('confirmPassword') ? 'Change Password' : 'Edit Profile'}
              </>
            )}
          </h1>

          {errors.form && <p className="text-danger">{errors.form}</p>}

          {visibleFields.includes('username') && (
            <FloatingInput
              id="floatingUsername"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              error={errors.username}
            />
          )}
          {visibleFields.includes('email') && (
            <FloatingInput
              id="floatingEmail"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              error={errors.email}
            />
          )}
          {visibleFields.includes('oldPassword') && (
            <FloatingInput
              id="floatingOldPassword"
              label="Old Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value.trim())}
              error={errors.oldPassword}
            />
          )}
          {visibleFields.includes('password') && (
            <FloatingInput
              id="floatingPassword"
              label={insert ? "Password" : "New Password"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              error={errors.password}
            />
          )}
          {visibleFields.includes('confirmPassword') && (
            <FloatingInput
              id="floatingConfirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.trim())}
              error={errors.confirmPassword}
            />
          )}
          {visibleFields.includes('favoriteHero') && (
            <FloatingSelect
              id="floatingFavoriteHero"
              label="Favorite Hero"
              type="text"
              value={favoriteHero}
              onChange={(e) => setFavoriteHero(e.target.value.trim())}
              error={errors.favoriteHero}
              options={superHero}
            />
          )}

          <button className="btn btn-primary w-100 pb-2 mb-3" type="submit" disabled={checkFormData() || spinner}>
            {!spinner ? (insert ? 'Sign Up' : 'Update') :
              <div className="my-auto spinner-grow spinner-grow-sm " role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            }
          </button>
          {insert && <p className="text-center">Already a member? <Link to="/login" className="link-primary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">Sign In</Link></p>}
          <p className="mt-5 text-body-secondary">© Gabriel Pedranzini {new Date().getFullYear()}</p>
        </form>
      </div>
    </div>
  );
}

export default EditField;

const isEmailValid = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

const isPasswordValid = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};
