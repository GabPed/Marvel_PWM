import React, { useEffect, useRef, useState } from "react";
import Accordion from "./Accordion";
import './CardHero.css';
import { apiRequest } from "../auth/ApiRequest";
import config from '../config';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addAvailableCards, removeCardAvailable } from "../redux/slices/availableSlice";
import { addTradedCards, removeCardTraded } from "../redux/slices/tradedSlice";
import Modal from 'bootstrap/js/dist/modal';
import UsersAvatar from "./UsersAvatar";
import ModalCreateOffer from "./ModalCreateOffer";
import CardHeroPreview from "./CardHeroPreview";

function CardHero(card) {
    const {_id, idUnique, image, hero, description, info, stato, personal, user, showAvatar = 'true'} = card;
    
    const [enableModal, setEnableModal] = useState(false);
    
    const modalRef = useRef(null);
    const modalCreateOffer = useRef(null);
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const availableCards = useSelector((state) => state.available.cards);
    const tradedCards = useSelector((state) => state.traded.cards);

    const currentPageAvailable = useSelector((state) => state.available.currentPage);
    const currentPageTraded = useSelector((state) => state.traded.currentPage);

    const totalAvailableCards = useSelector((state) => state.available.totalCards);
    const totalTradedCards = useSelector((state) => state.traded.totalCards);

    useEffect(() => {
        modalRef.current = new Modal(document.getElementById(idUnique+"Modal"));
    }, []);
    
    useEffect(() => {
        if((!personal && stato === 'B') && enableModal) modalCreateOffer.current = new Modal(document.getElementById("modal_"+user._id+idUnique));
        if(enableModal) showModalCreateOffer();
    }, [enableModal]);

    const handleEnableModal = () => {
        setEnableModal(true);
        if(enableModal === true) showModalCreateOffer();
    }

    const showModalCreateOffer = () => {
        modalCreateOffer.current.show();
    }
  
    const hideModalCreateOffer = () => {
        modalCreateOffer.current.hide();
    }

    const showModal = () => {
        modalRef.current.show();
    }
  
    const hideModal = () => {
        modalRef.current.hide();
    }

    const handleOption = async (option) => {
        try {

            const response = await apiRequest(`${config.serverUrl}/albums/${option}`, {
                method: 'PATCH',
                body: JSON.stringify({ _id }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }, navigate); 
            if(response.ok) {
                const data = await response.json();
                console.log(data);
                modalRef.current.hide();
            
            if (option === "unlistCard") {
                
                // Trova la carta disponibile
                const cardToAvailable = {...tradedCards.find(card => card._id === _id)};
            
                // Se la carta esiste, procedi
                if (cardToAvailable) {
                    // Modifica lo stato della carta
                    cardToAvailable.stato = 'S';
            
                    // Rimuovi la carta dagli disponibili
                    dispatch(removeCardTraded({ _id })); // Assicurati che questa azione funzioni come previsto
            
                    // Aggiungi la carta agli scambiati
                    dispatch(addAvailableCards({
                        cards: [cardToAvailable], // Passa un array con la carta aggiornata
                        currentPage: currentPageAvailable,
                        totalCards: totalAvailableCards + 1,
                    }));
                } else {
                    console.log("Carta non trovata:", _id);
                }
            }
            else {
                const cardToTrade = {...availableCards.find(card => card._id === _id)};
            
                // Se la carta esiste, procedi
                if (cardToTrade) {
                    // Rimuovi la carta dagli disponibili
                    dispatch(removeCardAvailable({ _id })); // Assicurati che questa azione funzioni come previsto
                    if(option === 'listCard') {
                        // Modifica lo stato della carta
                        cardToTrade.stato = 'B';
                
                        // Aggiungi la carta agli scambiati
                        dispatch(addTradedCards({
                            cards: [cardToTrade], // Passa un array con la carta aggiornata
                            currentPage: currentPageTraded,
                            totalCards: totalTradedCards + 1,
                        }));
                    }
                } else {
                    console.log("Carta non trovata:", _id);
                }
            }
            }
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    }
    
    return (
        <>  
            <CardHeroPreview
                className="card-hero"
                option = {showModal}
                hero = {hero}
                image = {image}
            >
                {personal && stato === 'S' &&
                    <div className="card-footer d-flex d-column justify-content-end">
                        <div className="d-flex justify-content-center align-items-center d-column me-2">
                            <button
                                type="button"
                                className="btn btn-success btn-sm rounded-pill py-1 px-2"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleOption("sellCard");
                                }}
                            >
                                <i className="bi bi-cash-coin h6 m-0"></i>
                            </button>
                        </div>
                        <div className="d-flex justify-content-center align-items-center d-column">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-sm rounded-pill align-items-center py-1 px-2"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleOption("listCard");
                                }}
                            >
                                <i className="bi bi-arrow-repeat h6 m-0"></i>
                            </button>
                        </div>
                    </div>              
                }
                {personal && stato === 'B' &&
                    (<div className="card-footer d-flex justify-content-end">
                        <div className="d-flex justify-content-center align-items-center d-column">
                            <button 
                                type="button" 
                                className="btn btn-danger btn-sm rounded-pill py-1 px-2" 
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleOption("unlistCard");
                                }}
                            >
                                <i className="bi bi-arrow-repeat h6 m-0"></i>
                            </button>
                        </div>
                    </div>)
                }           
                {user && showAvatar &&
                    <div className="card-footer d-flex justify-content-center">
                        <UsersAvatar user = {user} size = 'sm'/>
                    </div>
                } 
            </CardHeroPreview> 
            <div
                className="modal fade p-2 modal-card-hero"
                id={idUnique+"Modal"}
                tabIndex={-1}
                aria-labelledby={idUnique+"ModalLabel"}
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content position-relative">
                        <button 
                            type="button" 
                            className="btn-close position-absolute top-0 end-0 m-2" 
                            aria-label="Close" 
                            onClick={hideModal} 
                        />
                        <img src={image} className="card-img-top rounded-top shadow-sm" alt={hero + " image"} />
                        <div className="modal-header border-0 pb-0">
                            <p className="modal-title h3" id="exampleModalLabel">
                                {hero}
                            </p>
                        </div>
                        <div className="modal-body">
                            <p className="mb-2">{description}</p>
                            <Accordion
                                id={_id}
                                items={info}
                            />
                        </div>
                        {personal && stato === 'S' &&
                            <div className="modal-footer justify-content-center justify-content-sm-end">
                                <div className="d-flex justify-content-center align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-success rounded-pill"
                                        onClick={() => handleOption("sellCard")}
                                    >
                                        <i className="bi bi-cash-coin h4 me-2"></i> Sell for 0.2<span className="">ᛗ</span>
                                    </button>
                                </div>
                                <div className="d-flex justify-content-center align-items-center">
                                    <button 
                                        type="button" 
                                        className="btn btn-primary rounded-pill"
                                        onClick={() => handleOption("listCard")}
                                    >
                                        <i className="bi bi-arrow-repeat h4 me-2"></i> List for Trade
                                    </button>
                                </div>
                            </div>
                        }
                        {personal && stato === 'B' &&
                            (<div className="modal-footer">
                                <div className="d-flex justify-content-center align-items-center d-column">
                                    <button 
                                        type="button" 
                                        className="btn btn-danger rounded-pill" 
                                        onClick={() => handleOption("unlistCard")}
                                    >
                                        <i className="bi bi-arrow-repeat h4 me-2"></i> Unlist
                                    </button>
                                </div>
                            </div>)
                        }
                        {!personal && stato === 'B' &&
                            (<div className="modal-footer justify-content-between">
                                {user  && showAvatar &&  <UsersAvatar user = {user} size = 'md' onClick={hideModal}/> }  
                                <div className="d-flex justify-content-center align-items-center d-column">
                                    <button 
                                        type="button" 
                                        className="btn btn-primary rounded-pill" 
                                        onClick={handleEnableModal}
                                    >
                                        <i className="bi bi-arrow-repeat h4 me-2"></i> Create an offer
                                    </button>
                                    {enableModal &&
                                        <ModalCreateOffer 
                                            singleCardOff={card}
                                            idAcq = {JSON.parse(localStorage.getItem('user'))._id}
                                            idOff = {user._id}
                                            title = ''
                                        />
                                    }
                                </div>
                            </div>)
                        }
                    </div>
                </div>
            </div>  
        </>  
    );
      
}

export default CardHero;