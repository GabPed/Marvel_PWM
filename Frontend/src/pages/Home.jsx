import { useState } from "react";
import Container from "../components/Sidebar/Container";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../auth/ApiRequest";
import config from "../config";
import { useRef } from "react";
import Modal from 'bootstrap/js/dist/modal';
import { useEffect } from "react";
import ScrollableCards from "../components/ScrollableCards";
import CardHero from "../components/CardHero";
import { useDispatch, useSelector } from "react-redux";
import { addAvailableCards } from "../redux/slices/availableSlice";
import { addAlbumCards } from "../redux/slices/albumSlice";

function Home () {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [crediti, setCrediti] = useState(5);
    const [loading, setLoading] = useState(false);
    const [loadingStickers, setLoadingStickers] = useState(false);
    const [cardData, setCardData] = useState([]);

    const modalRef = useRef(null);

    const price = 1.50;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentPageAlbum = useSelector((state) => state.album.currentPage);
    const currentPageAvailable = useSelector((state) => state.available.currentPage);

    const totalAlbumCards = useSelector((state) => state.album.totalCards);
    const totalAvailableCards = useSelector((state) => state.available.totalCards);
    
    const albumCards = useSelector((state) => state.album.cards);

    const addCredits = async () => {
        setLoading(true);
        try {
            // Aggiungi i parametri state e page alla richiesta
            const response = await apiRequest(`${import.meta.env.VITE_SERVER_URL}/payments/`, {
                method: 'POST',
                body: JSON.stringify({
                    crediti: crediti
                  })
            }, navigate);

            const data = await response.json();
            if (response.ok) {
                window.location.href = (data.redirectUrl);
            }
            else {
                console.log(data)
            }
        }
        catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    const buyStickerPacks = async () => {
        setLoadingStickers(true);
        try {
            // Aggiungi i parametri state e page alla richiesta
            const response = await apiRequest(`${import.meta.env.VITE_SERVER_URL}/albums/buyStickerPacks`, {
                method: 'PATCH'
            }, navigate);

            const data = await response.json();
            if (response.ok) {
                const cardsD = data.cards.filter(card => card.stato === 'D')
                if(cardsD.length > 0) {
                    dispatch(addAlbumCards({
                        cards: [...cardsD],
                        currentPage: currentPageAlbum,
                        totalCards: totalAlbumCards + cardsD.length,
                    }));
                }

                const cardsS = data.cards.filter(card => card.stato === 'S')
                if(cardsS.length > 0) {
                    dispatch(addAvailableCards({
                        cards: [...cardsS],
                        currentPage: currentPageAvailable,
                        totalCards: totalAvailableCards + cardsS.length,
                    }));
                }
                localStorage.setItem('user', JSON.stringify({...user,crediti: user.crediti - 1,cardsFound: user.cardsFound + cardsD.length}));
                setUser({...user,crediti: user.crediti - 1,cardsFound: user.cardsFound + cardsD.length})
                setCardData([...data.cards]);

            }
            else {
                console.log(data)
            }
        }
        catch (err) {
            console.log(err)
        }
        setLoadingStickers(false)
    }

    useEffect(() => {
        modalRef.current = new Modal(document.getElementById("modal_stickersPack"));
    }, []);

    useEffect(() => {
        if(cardData.length > 0) showModal();
    }, [cardData]);

    const showModal = () => {
        modalRef.current.show();
    }
  
    const hideModal = () => {
        setCardData([]);
        modalRef.current.hide();
    }

    return (
        <Container className="w-100 p-4">
            <div className="row g-4 justify-content-center mt-1 px-2">
                <div className="col-10">
                    <div className="d-flex justify-content-center justify-content-center align-items-center">
                        <img
                            className="rounded-circle shadow"
                            src={"/assets/avatars/"+user.favoriteHero_img}
                            alt="avatar"
                            width="70"
                        /> 
                        <div className="m-0 ms-3">
                            <h4 className="ms-3 my-0 h2">
                                {user.username}
                            </h4>
                            <p  className="ms-3 my-0 fs-6 fw-regular fst-italic">
                                {user.email}
                            </p>
                        </div>                   
                    </div>
                </div>
                <div className="col-11 mt-5">
                    <div className="card shadow rounded">
                        <div className="card-body">
                            <div className="row align-items-center justify-content-center g-2 gy-3">
                                <div className="col-11 col-md-2 text-center text-md-start">
                                    <i className="h1 align-self-center mx-md-3 bi bi-coin"></i>
                                </div>
                                <div className="col-11 col-md-6 text-center">
                                    <p className="card-text align-self-center h4 m-0">Total credits: {user.crediti && user.crediti.toFixed(1)}<span className="fs-5">ᛗ</span></p>
                                </div>
                                <div className="col-11 col-md-4 d-flex justify-content-between align-items-center p-2">
                                    <button 
                                        className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#modal_crediti"
                                    >
                                        <span className="fs-5">
                                            Add credits
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal fade" id="modal_crediti" tabIndex="-1" aria-labelledby="modal_creditiLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header border-0">
                                        <h1 className="modal-title fs-5" id="exampleModalLabel">Select a Credit Package</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" data-bs-target="#modal_crediti"></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row d-flex justify-content-center my-3">
                                            <div className="col-3 d-flex justify-content-center">
                                                <button type="button" className={"btn btn-outline-primary fs-5 " + (crediti === 5 && 'active')} onClick={() => setCrediti(5)}>
                                                    5<span className="fs-6">ᛗ</span>
                                                </button>
                                            </div>
                                            <div className="col-3 d-flex justify-content-center">
                                                <button type="button" className={"btn btn-outline-primary fs-5 " + (crediti === 10 && 'active')} onClick={() => setCrediti(10)}> 
                                                    10<span className="fs-6">ᛗ</span>
                                                </button>
                                            </div>
                                            <div className="col-3 d-flex justify-content-center">
                                                <button type="button" className={"btn btn-outline-primary fs-5 " + (crediti === 25 && 'active')} onClick={() => setCrediti(25)}>
                                                    25<span className="fs-6">ᛗ</span>
                                                </button>
                                            </div>
                                            <div className="col-3 d-flex justify-content-center">
                                                <button type="button" className={"btn btn-outline-primary fs-5 " + (crediti === 50 && 'active')} onClick={() => setCrediti(50)}>
                                                    50<span className="fs-6">ᛗ</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer d-flex flex-column">
                                        <button type="button" className="btn btn-primary mt-3 mb-0" onClick={addCredits} disabled={loading}>
                                            Proceed payment €{crediti*price}
                                            {loading &&
                                            <div className="ms-2 spinner-grow spinner-grow-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>}
                                        </button>
                                        <button type="button" className="btn btn-link link-secondary link-underline-secondary link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover my-0" data-bs-dismiss="modal" disabled={loading}>Cancel</button>
                                        <span className="text-secondary fw-light text-center">
                                            For payments, use the email pennyless@marvel.com and the password Marvel24!
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-11 mt-5">
                    <div className="card shadow rounded">
                        <div className="card-body">
                            <div className="row align-items-center justify-content-center g-2 gy-3">
                                <div className="col-11 col-md-2 text-center text-md-start">
                                    <i className="h1 align-self-center mx-md-3 bi bi-grid-3x3-gap-fill"></i>
                                </div>
                                <div className="col-11 col-md-6 text-center">
                                    <p className="card-text align-self-center h4 m-0">Cards found:  {user.cardsFound ? user.cardsFound+'/'+user.totalCards : '0'}</p>
                                </div>
                                <div className="col-11 col-md-4 d-flex justify-content-between align-items-center p-2">
                                    <button 
                                        className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                                        disabled={user.crediti <= 0 || loadingStickers}
                                        onClick={buyStickerPacks}
                                    >
                                        <span className="fs-5">
                                            Buy new cards
                                            {loadingStickers &&
                                            <div className="ms-2 spinner-grow spinner-grow-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal fade" id="modal_stickersPack" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog modal modal-dialog-centered">
                                <div className="modal-content">
                                    <button
                                        type="button"
                                        className="btn-close position-absolute m-2 top-0 end-0 z-3"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        data-bs-target="#modal_stickersPack"
                                    />
                                    <div className="modal-body p-0 z-2">
                                        <div className="d-flex justify-content-center m-0">
                                            <ScrollableCards>
                                                {cardData.map((card) => (
                                                    <div className="ms-auto me-auto" key={card._id}>
                                                        <CardHero
                                                            _id={card._id}
                                                            idUnique={card._id}
                                                            image={card.image}
                                                            hero={card.hero}
                                                            description={card.description}
                                                            info={card.info}
                                                            stato={card.stato}
                                                            personal={true}
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
                </div>
            </div>
        </Container>
    )
}

export default Home;