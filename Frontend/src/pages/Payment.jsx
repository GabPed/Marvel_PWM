import Toast from 'bootstrap/js/dist/toast';
import React, { useEffect, useState } from "react";
import config from "../config";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../auth/ApiRequest";
import { useRef } from "react";


function Payment() {
  const { status } = useParams(); 
  const [stateStatus, setStateStatus] = useState(status); 
  const [loading, setLoading] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [toastContent, setToastContent] = useState();

  const [payment, setPayment] = useState();
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const location = useLocation();

  const toastRef = useRef(null);

  useEffect(() => {
    /*if (toastContent) {
      showToast();
    }*/
  }, [toastContent]);

  const hideToast = () => {
    if (toastRef.current) {
      toastRef.current.hide();
    }
  };

  const showToast = () => {
    if (toastRef.current) {
      toastRef.current.show();
    }
  };

  useEffect(() => {
    // Inizializza il toast solo dopo che il componente è montato
    const toastElement = document.getElementById("toast_payment");
    toastRef.current = new Toast(toastElement); 
  }, []);

  const getQueryParams = () => {
    const queryParams = new URLSearchParams(location.search);
    const params = {};
    queryParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  const queryParams = getQueryParams();
  
  useEffect(() => {
    if (stateStatus === 'success') getPayments();
    else cancelPayments();
  }, [stateStatus]);

  const cancelPayments = async () => {
    setLoadingCancel(true);
    try {
      const response = await apiRequest(`${config.serverUrl}/payments/cancel`, {
        method: 'PATCH'
      }, navigate);

      if (response.ok) {
        setToastContent({ title: "Payment Cancelled", message: "Your payment has been cancelled. You will be redirected shortly." });
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (stateStatus === 'cancel') navigate('/');
      }
    } catch (error) {
      console.error("Errore durante la richiesta di login:", error);
    } finally {
      setLoadingCancel(false);
    }
  };
  
  const successPayments = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest(`${config.serverUrl}/payments/success`, {
        method: 'PATCH',
        body: JSON.stringify({
          payerId: queryParams.PayerID,
          paymentId: queryParams.paymentId
        })
      }, navigate);

      const data = await response.json();
      if (response.ok) {
        setToastContent({ title: "Payment Successful", message: "Thank you! Your payment has been processed successfully. You will be redirected shortly." });
        localStorage.setItem('user', JSON.stringify({ ...user, crediti: user.crediti + payment.crediti }));
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/');
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error("Errore durante la richiesta di login:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPayments = async () => {
    try {
      const response = await apiRequest(`${config.serverUrl}/payments/` + queryParams.paymentId, {
        method: 'GET'
      }, navigate);

      const data = await response.json();
      if (response.ok) {
        setPayment(data.payment);
      } else {
        navigate('/');
      }
    } catch (error) {
      navigate('/');
      console.error("Errore durante la richiesta di login:", error);
    }
  };

  if (!payment) return <></>;

  return (
    <div className='container-fluid d-flex vh-100 flex-column'>
      <div 
        id="toast_payment"
        className="toast fade position-fixed bottom-0 end-0 p-2 m-4" 
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
        <form className="col-sm-8 col-md-6 col-xl-4 p-4" onSubmit={successPayments}>
          <h1 className="h3 mb-4 fw-normal">Payment Summary</h1>
          <div className="card p-1 my-3">
            <div className="card-body d-flex flex-column p-1 px-2">
              <span className="fs-6 text-secondary">Username</span>
              <span className="fs-5">{user.username}</span>
            </div>
          </div>
          <div className="card p-1 my-3">
            <div className="card-body d-flex flex-column p-1 px-2">
              <span className="fs-6 text-secondary">Email</span>
              <span className="fs-5">{user.email}</span>
            </div>
          </div>
          <div className="card p-1 my-3">
            <div className="card-body d-flex flex-column p-1 px-2">
              <span className="fs-6 text-secondary">Total credits </span>
              <span className="fs-5">{payment.crediti}</span>
            </div>
          </div>
          <button 
            className="btn btn-primary w-100 pb-2 mt-3" 
            type="submit"
            disabled={loading || loadingCancel}
          >
            Confirm payment €{payment.amount}
            {loading &&
              <div className="ms-2 spinner-grow spinner-grow-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            }
          </button>
          <button 
            className="btn btn-link w-100 link-secondary link-underline-secondary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
            onClick={() => setStateStatus('cancel')}
            disabled={loading || loadingCancel}
            type="button"
          >
            Cancel payment
            {loadingCancel &&
              <div className="ms-2 spinner-grow spinner-grow-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;

