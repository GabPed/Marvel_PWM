import { useEffect, useRef } from 'react';
import './CardOffer.css'
import ModalOffer from './ModalOffer';
import Modal from 'bootstrap/js/dist/modal';

function CardOffer({offer, title, buttonEnable, removeOffer}) {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const modalRef = useRef(null);

    useEffect(() => {
        modalRef.current = new Modal(document.getElementById("modal_" + offer._id));
    }, []);

    const hideModal = () => {
        modalRef.current.hide();
    }

    const showModal = () => {
        modalRef.current.show();
    }

    return (        
        <>
            <div 
                className='card card-offer shadow-sm p-2 h-auto rounded' 
                data-bs-toggle="modal"
                data-bs-target={"#modal_" + offer._id}
                type="button"
            >
                <div className='card-body p-1'>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="stack-left shadow">
                                {offer.figurine_acquirente.map((card) => (
                                    <div key={"cardOffer"+card.id} className="stack-card-left rounded">
                                        <img className="img-stack shadow-sm rounded" src={card.image} alt={card.hero} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <span className={'rounded-circle p-2 ' + (offer.stato === 'Rifiutata' ? 'bg-danger' : (offer.stato === 'Accettata' ? 'bg-success' : (offer.stato === 'In attesa' ? 'bg-secondary' : '')))}>
                            <div className='p-0 m-0'>
                                <i className="bi bi-arrow-left-right h3 m-1 fw-bolder text-white"></i>
                            </div> 
                        </span>
                        <div>
                            <div className="stack-right shadow">
                                {offer.figurine_offerente.map((card) => (
                                    <div key={"cardOffer"+card.id} className="stack-card-right rounded">
                                        <img className="img-stack shadow-sm rounded" src={card.image} alt={card.hero} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {String(offer.id_utente_acquirente) === String(user._id) ? (
                    <ModalOffer 
                        idOffer={offer._id}
                        cardAcq={offer.figurine_offerente}
                        cardOff={offer.figurine_acquirente}
                        userOff={offer.utente_offerente}  
                        title={title+' Send '}
                        state={
                            offer.stato === 'In attesa' ? 'W' :
                            offer.stato === 'Accettata' ? 'A' :
                            offer.stato === 'Rifiutata' ? 'D' : ''
                        }
                        removeOffer = {removeOffer}
                    />
                ) : 
                (   
                    <ModalOffer 
                        idOffer={offer._id}
                        cardAcq={offer.figurine_acquirente}
                        cardOff={offer.figurine_offerente}
                        userOff={offer.utente_acquirente}  
                        title={title+' Received'}
                        buttonEnable={buttonEnable}
                        state={
                            offer.stato === 'In attesa' ? 'W' :
                            offer.stato === 'Accettata' ? 'A' :
                            offer.stato === 'Rifiutata' ? 'D' : ''
                        }
                        removeOffer = {removeOffer}
                    />
                )
            }
        </>    
    );
}

export default CardOffer;