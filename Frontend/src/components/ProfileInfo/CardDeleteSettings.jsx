import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "./FloatingInput";
import { apiRequest } from "../../auth/ApiRequest";
import config from "../../config";
import Modal from 'bootstrap/js/dist/modal';

function CardDeleteSettings() {
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState('');
    const [isLoading, setIsLoading] = useState(false);  // Stato per gestire il caricamento
    const navigate = useNavigate();
    const modalRef = useRef(null);

    const handleDelete = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Imposta lo stato di caricamento su true

        try {
          const response = await apiRequest(import.meta.env.VITE_SERVER_URL + '/users', {
            method: "DELETE",
            body: JSON.stringify({
              password: password
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          }, navigate);
    
          const data = await response.json();
    
          if (response.ok) {
            modalRef.current.hide(); // Nascondi il modale dopo la cancellazione
            navigate('/login');
          } else {
            setErrors(data.message || 'Delete Failed');
          }
        } catch (error) {
          setErrors('Error during the request');
          console.error('Delete request error:', error);
        } finally {
          setIsLoading(false); // Ripristina lo stato di caricamento su false
        }
    };

    useEffect(() => {
      modalRef.current = new Modal(document.getElementById('deleteModal'));
    }, []);

    const showModal = () => {
      setErrors(''); // Ripulisci gli errori quando apri il modale
      modalRef.current.show();
    }

    const hideModal = () => {
      setErrors(''); // Ripulisci gli errori quando chiudi il modale
      modalRef.current.hide();
    }

    return (
        <div className="card w-100 shadow rounded">
        <div className="card-header ps-4">
          <h4 className="mb-0">Delete your account</h4>
          <p className="mb-0">Delete or Close your account permanently.</p>
        </div>
        <div className="card-body p-4">
          <span className="text-danger h5">Warning</span>
          <p>
            If you close your account, you will lose all your progress and will lose access forever.
          </p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={showModal}
            disabled={isLoading}  // Disabilita il bottone se la richiesta è in corso
          >
            {isLoading ? 'Processing...' : 'Close My Account'}
          </button>
          <div
            className="modal fade"
            id="deleteModal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex={-1}
            aria-labelledby="deleteModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title" id="staticBackdropLabel">
                        <p className="h1 fs-4 fw-medium text-danger">
                            Warning
                        </p>
                        <p className="mb-2 fs-6">
                            Are you sure you want to close your account? <br/>
                            This action is irreversible and will permanently delete all your progress.
                        </p>
                    </div>
                </div>
                <div className="modal-body px-5">  
                    <p className="text-center fw-medium fs-5">
                        Insert password to delete your account
                    </p>
                    <FloatingInput
                        id="floatingPassword"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value.trim())}
                        error=''
                    />
                    {errors && <p className="text-danger my-0 mx-1">{errors}</p>}
                </div>
                <div className="modal-footer justify-content-center">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={hideModal}
                    disabled={isLoading}  // Disabilita il bottone se la richiesta è in corso
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleDelete}
                    disabled={isLoading}  // Disabilita il bottone se la richiesta è in corso
                  >
                    {isLoading ? 'Deleting...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>             
    );
}

export default CardDeleteSettings;
