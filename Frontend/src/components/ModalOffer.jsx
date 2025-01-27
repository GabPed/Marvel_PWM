import { useDispatch, useSelector } from 'react-redux';
import ScrollableCards from './ScrollableCards';
import CardHero from './CardHero';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../auth/ApiRequest';
import config from '../config';
import { removeCardTraded } from '../redux/slices/tradedSlice';
import { addAlbumCards } from '../redux/slices/albumSlice';
import './ModalOffer.css';
import Toast from 'bootstrap/js/dist/toast';


function ModalOffer({ idOffer, cardAcq, cardOff, userAcq, userOff, title, buttonEnable = false, removeOffer, state}) {
  const navigate = useNavigate();
  const [showButtons, setShowButtons] = useState(false); // Stato per mostrare o nascondere i bottoni
  const [isRotated, setIsRotated] = useState(false); // Stato per la rotazione dell'icona

  const [toastMessage, setToastMessage] = useState('');

  const dispatch = useDispatch();

  const currentPageAlbum = useSelector((state) => state.album.currentPage);
  const totalAlbumCards = useSelector((state) => state.album.totalCards);

  const toastRef = useRef(null);

  const updateOffer = async (stato) => {
    try {
      const response = await apiRequest(`${config.serverUrl}/offers`, {
        method: 'PATCH',
        body: JSON.stringify({
          idOffer,
          stato
        })
      }, navigate);

      const data = await response.json();

      if (response.ok) {
        if(stato === 'Accettata') {
            cardOff.forEach((card) => {
              dispatch(removeCardTraded({_id: card.id}));
            });
            
            const cards = cardAcq.map((card) => ({
              _id: card.id, 
              ...card,   
            }));
            
            cards.forEach(card => delete card.id); 
            dispatch(addAlbumCards({
              cards: cards, 
              currentPage: currentPageAlbum,
              totalCards: totalAlbumCards + cardOff.length,
            }));       
        }
        setToastMessage('Offer update with success!')
        removeOffer(idOffer);
      } else {
        setToastMessage(data.message)
      }
      showToast();
    } catch (error) {
      console.error("Errore durante la richiesta:", error);
    }
  };

  const hideToast = () => {
    toastRef.current.hide();
  }

  const showToast = () => {
    toastRef.current.show();
  }

  useEffect(() => {
    toastRef.current = new Toast(document.getElementById("toast_" + idOffer));
  }, []);

  // Funzione per gestire il click del bottone con l'icona della freccia
  const handleToggleButtons = () => {
    setShowButtons(!showButtons); // Mostra o nascondi i bottoni
    setIsRotated(!isRotated); // Ruota l'icona
  };
  
  const getButtonAndText = (state) => {
    switch(state) {
      case 'D':
        return { button: 'btn-danger', text: 'Declined' };
      case 'A':
        return { button: 'btn-success', text: 'Accepted' };
      case 'W':
        return { button: 'btn-secondary', text: 'Waiting' };
    }
  };
  
  return (
    <>
      <div
        className="modal fade"
        id={"modal_" + idOffer}  
        tabIndex={-1}
        aria-labelledby={"modal_" + idOffer + "_LabelledBy"}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className='position-relative'>
                <button
                      type="button"
                      className="btn-close position-absolute m-2 top-0 end-0"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                />
            </div>
            <div className="modal-header border-0 m-0 pb-0 d-block">
              <h3 className="modal-title w-100 text-center h3">{title}</h3>
              <h5 className="modal-title w-100 text-center text-secondary h6 fw-medium">{getButtonAndText(state).text}</h5>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-center mt-2 mb-3">
                  <ScrollableCards user = {userOff}>
                    {cardAcq.map((card) => (
                      <div className="ms-auto me-auto" key={card.id}>
                        <CardHero
                          _id={card.id}
                          idUnique={card.id+idOffer}
                          image={card.image}
                          hero={card.hero}
                          description={card.description}
                          info={card.info}
                          stato={card.stato}
                          personal={false}
                        />
                      </div>
                    ))}
                  </ScrollableCards>
                </div>
                <div className="d-flex justify-content-center align-items-center my-3 w-100 h-100">
                  <div className={`p-2 me-3 ${showButtons ? 'show-pop' : 'hide-pop'}`}>
                    <button
                      type="button"
                      className="btn btn-danger rounded-pill shadow h4 m-0 scale-hover fw-medium"
                      data-bs-dismiss="modal"
                      onClick={() => updateOffer('Rifiutata')}
                    >
                      Decline
                    </button>
                  </div>

                  <button
                    type="button"
                    className={'btn rounded-circle p-2 shadow-sm ' + getButtonAndText(state).button}
                    onClick={handleToggleButtons}
                    disabled={!buttonEnable} 
                  >
                   <div className={'p-0 m-0 '+(isRotated ? 'rotated-right' : 'rotated-left')}>
                      <i className="bi bi-arrow-down-up h2 m-1 fw-bolder text-white"></i>
                    </div> 
                  </button>

                  <div className={`p-2 ms-3 ${showButtons ? 'show-pop' : 'hide-pop'}`}>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill shadow h4 m-0 scale-hover fw-medium"
                      onClick={() => updateOffer('Accettata')}
                    >
                      Accept
                    </button>
                  </div>

                  <div 
                    id = {"toast_" + idOffer}
                    className="toast fade position-absolute top-50 start-50 translate-middle" 
                    role="alert" 
                    aria-live="assertive" 
                    aria-atomic="true"
                  >
                  <div className="toast-header">
                  
                    <strong className="me-auto">Offer status</strong>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={hideToast}
                    />
                  </div>
              <div className="toast-body">{toastMessage}</div>
                  </div>
                </div>
                <div className="d-flex justify-content-center my-3">
                  <ScrollableCards>
                    {cardOff.map((card) => (
                      <div className="ms-auto me-auto" key={card.id}>
                        <CardHero
                          _id={card.id}
                          idUnique={card.id+idOffer}
                          image={card.image}
                          hero={card.hero}
                          description={card.description}
                          info={card.info}
                          stato={card.stato}
                          personal={false}
                        />
                      </div>
                    ))}
                  </ScrollableCards>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalOffer;
