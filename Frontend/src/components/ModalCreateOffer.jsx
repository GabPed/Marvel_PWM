import { useDispatch } from 'react-redux';
import ScrollableCards from './ScrollableCards';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../auth/ApiRequest';
import config from '../config';
import './ModalOffer.css';
import CardHeroPreview from './CardHeroPreview';
import { removeCardAvailable } from '../redux/slices/availableSlice';
import Toast from 'bootstrap/js/dist/toast';

function ModalCreateOffer({singleCardOff, idAcq, idOff, title = ''}) {
  const navigate = useNavigate();
  const [buttonEnable, setButtonEnable] = useState(false);
  const [cardAcq, setCardAcq] = useState([]);
  const [cardOff, setCardOff] = useState([]);
  const [cardOffSelected, setCardOffSelected] = useState([]);
  const [cardAcqSelected, setCardAcqSelected] = useState([]);

  const [viewOffSelected, setViewOffSelected] = useState(false);
  const [viewAcqSelected, setViewAcqSelected] = useState(false);

  const [refreshOff,  setRefreshOff] = useState(false);
  const [pageOff, setPageOff] = useState(1);
  const [searchOff, setSearchOff] = useState('');
  const [hasMoreOff,  sethasMoreOff] = useState(false);

  const [refreshAcq,  setRefreshAcq] = useState(false);
  const [pageAcq, setPageAcq] = useState(1);
  const [searchAcq, setSearchAcq] = useState('');
  const [hasMoreAcq,  sethasMoreAcq] = useState(false);
  
  const [toastMessage, setToastMessage] = useState('');

  const toastRef = useRef(null);

  const dispatch = useDispatch();

  const getCardsAcq = async () => {
    var request = `${config.serverUrl}/offers/cardstooffer/${idOff}?page=${pageAcq}`
    if (searchAcq && searchAcq.trim() !== '') {
      request += `&search=${searchAcq}`;
    }

    try {
      // Aggiungi i parametri state e page alla richiesta
      const response = await apiRequest(request, {
        method: 'GET',
      }, navigate);

      const data = await response.json();

      if (response.ok) {
        
        if(cardOff.length === 0) setCardAcq([...cardAcq,...data.album]);
        else {
          data.album  = data.album.filter(card => !cardAcqSelected.includes(card._id));
          setCardAcq([...cardAcq,...data.album]);
        }
        sethasMoreAcq(data.totalPages > pageAcq)
      } 
    } catch (error) {
      setError('Errore durante la richiesta');
      console.error("Errore durante la richiesta:", error);
    }
  }

  const searchByNameAcq = (new_search) => {
    if(new_search === searchAcq) return;
    resetAcq();
    setSearchAcq(new_search);
  }

  const resetSearchAcq = () => {
    setSearchAcq('');
    resetAcq();
  }

  const resetAcq = () => {
    const selected = cardAcq.filter(card => cardAcqSelected.includes(card._id));
    setCardAcq([...selected]);
    setPageAcq(1);
  }

  const getCardsOff = async () => {
    var request = `${config.serverUrl}/offers/cardstoselect/${idOff}?page=${pageOff}`
    if (searchOff && searchOff.trim() !== '') {
      request += `&search=${searchOff}`;
    }

    try {
      // Aggiungi i parametri state e page alla richiesta
      const response = await apiRequest(request, {
        method: 'GET',
      }, navigate);
  
      const data = await response.json();

      if (response.ok) {
        // Controlla se singleCardOff è già presente nell'array
        data.album = data.album.filter(card => card._id !== singleCardOff._id);
        if(cardOff.length === 0) setCardOff([singleCardOff,...cardOff,...data.album]);
        else {
          data.album  = data.album.filter(card => !cardOffSelected.includes(card._id));
          setCardOff([...cardOff,...data.album]);
        }
        sethasMoreOff(data.totalPages > pageOff)
      }
      else sethasMoreOff(false)
    } catch (error) {
      setError('Errore durante la richiesta');
      console.error("Errore durante la richiesta:", error);
    }
  };
  
  const searchByNameOff = (new_search) => {
    if(new_search === searchOff) return;
    resetOff();
    setSearchOff(new_search);
  }

  const resetSearchOff = () => {
    setSearchOff('');
    resetOff();
  }

  const resetOff = () => {
    const selected = cardOff.filter(card => cardOffSelected.includes(card._id));
    setCardOff([...selected]);
    setPageOff(1);
  }

  const toggleCardsOff = (id) => {
    setCardOffSelected((prevIds) => {
      const index = prevIds.indexOf(id);
      if (index !== -1) {
        return prevIds.filter((existingId) => existingId !== id);
      }
      if (prevIds.length >= 3) {
        return prevIds;
      }
      return [...prevIds, id];
    });
  };
  
  const toggleCardsAcq = (id) => {
    setCardAcqSelected((prevIds) => {
      const index = prevIds.indexOf(id);
      if (index !== -1) {
        return prevIds.filter((existingId) => existingId !== id);
      }
      if (prevIds.length >= 3) {
        return prevIds;
      }
      return [...prevIds, id];
    });
  };
  
  const sortSelectedCardsFirst = (cards, selectedIds) => {
    return [...cards].sort((a, b) => {
      const indexA = selectedIds.indexOf(a._id);
      const indexB = selectedIds.indexOf(b._id);
  
      if (indexA === -1 && indexB !== -1) return 1;  // a non è selezionata, b è selezionata
      if (indexA !== -1 && indexB === -1) return -1; // a è selezionata, b non è selezionata
      if (indexA === -1 && indexB === -1) return 0;  // nessuna delle due è selezionata
      return indexA - indexB; // entrambe sono selezionate, ordina in base alla posizione in selectedIds
    });
  };
  
  const cardsOffView = () => {
    if(viewOffSelected) return cardOff.filter(card => cardOffSelected.includes(card._id));
    return cardOff
  }

  const cardsAcqView = () => {
    if(viewAcqSelected) return cardAcq.filter(card => cardAcqSelected.includes(card._id));
    return cardAcq
  }

  const createOffer = async () => {
    try {
      const response = await apiRequest(`${config.serverUrl}/offers`, {
        method: 'POST', 
        body: JSON.stringify({
          idOfferente: idOff,
          idFigurineOfferente:  [...cardOffSelected],
          idFigurineAcquirente: [...cardAcqSelected]
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      }, navigate);

      const data = await response.json();

      if (response.ok) {
        cardAcqSelected.forEach((cardId) => {
          dispatch(removeCardAvailable({ _id: cardId }));
        });
        const selected = cardAcq.filter(card => !cardAcqSelected.includes(card._id));
        setCardAcq([...selected]);
        setCardAcqSelected([]);
        setToastMessage('Offer created with success!')
      } else {
        setToastMessage(data.message)
        console.error(data.message || 'Error');
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
    toggleCardsOff(singleCardOff._id)
    toastRef.current = new Toast(document.getElementById("toast_" + idOff + singleCardOff.idUnique));
  }, []);

  useEffect(() => {
    if(cardAcqSelected.length > 0 && cardOffSelected.length > 0) setButtonEnable(true) 
    else setButtonEnable(false)
    
    if(cardAcqSelected.length === 0) {
      document.getElementById('viewSelectedCardsAcq').checked = false;
      setViewAcqSelected(false);
    }
    if(cardOffSelected.length === 0) {
      document.getElementById('viewSelectedCardsOff').checked = false;
      setViewOffSelected(false);
    }
  }, [cardAcqSelected, cardOffSelected]);

  useEffect(() => {
    getCardsAcq();
  }, [searchAcq, pageAcq, refreshAcq]);

  useEffect(() => {
    getCardsOff();
  }, [searchOff, pageOff, refreshOff]);

  return (
    <>
      <div
        className="modal fade"
        id={"modal_" + idOff + singleCardOff.idUnique}  // Modificato qui
        tabIndex={-1}
        aria-labelledby={"modal_" + idOff + "_LabelledBy"}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className='position-relative'>
                <button
                      type="button"
                      className="btn-close position-absolute m-2 top-0 end-0 btn-danger"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                />
            </div>
            <div className="modal-header border-0 m-0 pb-0">
              <h3 className="modal-title w-100 text-center h3">{title}</h3>
            </div>
            <div className="modal-body my-4 py-0">
              <div className="d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-center my-3">
                  <ScrollableCards title="Select up to 3 cards to trade" 
                    user={singleCardOff.user} 
                    search={cardOff.length > 18 ? searchByNameOff : undefined}
                    searchString={searchOff}
                    removeSearch={resetSearchOff}
                    action= {() => setPageOff(pageOff + 1)}
                    hasMore= {hasMoreOff}        
                  >
                      {cardOff.length === 0 
                      ?
                      <div className="ms-auto me-auto d-flex justify-content-center align-items-center text-secondary W-100">
                        <i className="bi bi-x-circle h5 me-2"></i> 
                        <h5 className="h5">No cards found!</h5>
                      </div>
                      :
                      cardsOffView().map((card) => (
                        <div className="ms-auto me-auto" key={idOff + card._id}>
                          <CardHeroPreview
                            _id={card._id}
                            image={card.image}
                            hero={card.hero}
                            description={card.description}
                            info={card.info}
                            stato={'D'}
                            personal={false}
                            user={card.user}
                            className={`card-hero ${cardOffSelected.includes(card._id) ? '' : 'opacity-50'}`}
                            option={() => toggleCardsOff(card._id)}
                          />
                        </div>
                      ))}
                      <div className="form-check form-switch position-absolute top-0 start-0 m-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="viewSelectedCardsOff"
                          disabled={cardOffSelected.length === 0}
                          onChange={() => setViewOffSelected(!viewOffSelected)}
                        />
                      </div>
                      <div className="position-absolute top-0 end-0 m-2">
                        
                      </div>
                  </ScrollableCards>
                </div>
                <div className="d-flex justify-content-center align-items-center my-3 w-100 h-100 position-relative">
                  <button
                    type="button"
                    className='btn btn-primary rounded-circle p-2 shadow-sm'
                    onClick={createOffer}
                    disabled={!buttonEnable} 
                  >
                   <div className='p-0 m-0 '>
                      <i className="bi bi-arrow-down-up h2 m-1 fw-bolder text-white"></i>
                    </div> 
                  </button>
                  <div 
                    id = {"toast_" + idOff + singleCardOff.idUnique}
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
                  <ScrollableCards 
                    title="Select up to 3 cards to trade"
                    search={cardAcq.length > 18 ? searchByNameAcq : undefined}
                    searchString={searchAcq}
                    removeSearch={resetSearchAcq}
                    action= {() => setPageAcq(pageAcq + 1)}
                    hasMore= {hasMoreAcq}  
                  >
                    {cardAcq.length === 0 ?
                    <div className="ms-auto me-auto d-flex justify-content-center align-items-center text-secondary W-100">
                        <i className="bi bi-x-circle h5 me-2"></i> 
                        <h5 className="h5">No cards found!</h5>
                    </div>
                    :
                    cardsAcqView().map((card) => (
                      <div className="ms-auto me-auto" key={idAcq + card._id}>
                        <CardHeroPreview
                          _id={card._id}
                          image={card.image}
                          hero={card.hero}
                          user={card.user}
                          className={`card-hero ${cardAcqSelected.includes(card._id) ? '' : 'opacity-50'}`}
                          option = {() => toggleCardsAcq(card._id)}
                        />
                      </div>
                    ))}
                    <div className="form-check form-switch position-absolute top-0 start-0 m-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="viewSelectedCardsAcq"
                          disabled={cardAcqSelected.length == 0}
                          onChange={() => setViewAcqSelected(!viewAcqSelected)}
                        />
                      </div>
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

export default ModalCreateOffer;