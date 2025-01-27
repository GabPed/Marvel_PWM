import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../redux/actions/fetchCards'; 
import CardHero from '../components/CardHero';
import Container from '../components/Sidebar/Container';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchBar from '../components/SearchBar';
import { addAlbumSearch, resetAlbum } from '../redux/slices/albumSlice';
import { addAvailableSearch, resetAvailable } from '../redux/slices/availableSlice';
import { addTradedSearch, resetTraded } from '../redux/slices/tradedSlice';

function Album() {
  const [currentSection, setCurrentSection] = useState(sessionStorage.getItem("albumSection") || "D"); // Stato per gestire la sezione corrente
  const [hasMore, setHasMore] = useState(false);
  const [refresh,  setRefresh] = useState(false);

  const dispatch = useDispatch();

  const albumCards = useSelector((state) => state.album.cards);
  const availableCards = useSelector((state) => state.available.cards);
  const tradedCards = useSelector((state) => state.traded.cards);
  
  const currentPageAlbum = useSelector((state) => state.album.currentPage);
  const currentPageAvailable = useSelector((state) => state.available.currentPage);
  const currentPageTraded = useSelector((state) => state.traded.currentPage);

  const totalAlbumCards = useSelector((state) => state.album.totalCards);
  const totalAvailableCards = useSelector((state) => state.available.totalCards);
  const totalTradedCards = useSelector((state) => state.traded.totalCards);

  const searchAlbumCards = useSelector((state) => state.album.search);
  const searchAvailableCards = useSelector((state) => state.available.search);
  const searchTradedCards = useSelector((state) => state.traded.search);
  
  const navigate = useNavigate();

  // Funzione per gestire il cambio della sezione
  const handleSectionChange = (section) => {
    sessionStorage.setItem("albumSection", section);
    setCurrentSection(section);
  };

  const searchByName = (search) => {
    if (currentSection === 'D' && searchAlbumCards != search) {
      dispatch(resetAlbum())
      dispatch(addAlbumSearch({search}))
    } 
    if (currentSection === 'S' && searchAvailableCards != search) {
      dispatch(resetAvailable())
      dispatch(addAvailableSearch({search}))
    } 
    if (currentSection === 'B' && searchTradedCards != search) {
      dispatch(resetTraded())
      dispatch(addTradedSearch({search}))
    } 
  }

  const removeSearch = () => {
    if (currentSection === 'D') {
      dispatch(resetAlbum())
      dispatch(addAlbumSearch({search: ''}))
    } 
    if (currentSection === 'S') {
      dispatch(resetAvailable())
      dispatch(addAvailableSearch({search: ''}))
    } 
    if (currentSection === 'B') {
      dispatch(resetTraded())
      dispatch(addTradedSearch({search: ''}))
    } 
  }

  const reset = () => {
    if (currentSection === 'D') {
      dispatch(resetAlbum())
    } 
    if (currentSection === 'S') {
      dispatch(resetAvailable())
    } 
    if (currentSection === 'B') {
      dispatch(resetTraded())
    } 
    setRefresh(!refresh);
  }

  const getSearch = () => {
    if (currentSection === 'D') {
      return searchAlbumCards
    } 
    if (currentSection === 'S') {
      return searchAvailableCards
    } 
    if (currentSection === 'B') {
      return searchTradedCards
    } 
  }

  const callSection = (section) => {
    if (section === 'D') fetch(section, getHasMore(section)) 
    if (section === 'S') fetch(section, getHasMore(section))
    if (section === 'B') fetch(section, getHasMore(section)) 
  }

  // Funzione per caricare più carte alla fine della pagina
  const loadMoreCards = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa di 5 secondi
    fetch(currentSection);  // Chiamata a fetch dopo la pausa
  };
  

  const fetch = (section, option = true) => {
    if (section === 'D' && option) {
      dispatch(fetchCards('D', currentPageAlbum + 1, searchAlbumCards, navigate));
    } else if (section === 'S' && option) {
      dispatch(fetchCards('S', currentPageAvailable + 1, searchAvailableCards, navigate));
    } else if (section === 'B' && option) {
      dispatch(fetchCards('B', currentPageTraded + 1,searchTradedCards, navigate));
    }
  };

  const getHasMore = (section) => {
    if (section === 'D') return (albumCards.length < totalAlbumCards);
    if (section === 'S') return (availableCards.length < totalAvailableCards)
    if (section === 'B') return (tradedCards.length < totalTradedCards);
  }

  // Funzione per ottenere icona e testo per il dropdown
  const getIconAndText = (section) => {
    switch(section) {
      case 'D':
        return { icon: 'bi bi-grid-3x3-gap', text: 'Album' };
      case 'S':
        return { icon: 'bi bi-box-arrow-up-right', text: 'Listable Cards' };
      case 'B':
        return { icon: 'bi bi-arrow-repeat', text: 'Listed Cards' };
      default:
        return { icon: '', text: '' };
    }
  };

  
  useEffect(() => {
    setHasMore(getHasMore(currentSection))
  }, [dispatch, albumCards, availableCards, tradedCards, currentSection, currentPageAlbum, currentPageAvailable, currentPageTraded]);

  // Al cambio di sezione o all'aggiornamento di pagina viene fatta la chiamata
  useEffect(() => {
    callSection(currentSection); 
  },  [searchAlbumCards, searchAvailableCards, searchTradedCards, currentSection, refresh]);

  // Seleziona le carte da visualizzare in base alla sezione corrente
  const cardData = currentSection === 'D' 
    ? albumCards 
    : currentSection === 'S' 
    ? availableCards 
    : tradedCards;

  return (
    <Container>
      <InfiniteScroll className='overflow-x-hidden min-vh-100 overflow-y-hidden py-2 px-1 position-relative'
          dataLength={cardData.length}
          next={loadMoreCards}
          hasMore={hasMore}
          loader={<div className="d-flex justify-content-center mt-3">
            <div className="spinner-grow text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          }
      >
        <div className='row g-3 justify-content-center py-3'>
          <div className="col-12 d-flex justify-content-sm-between justify-content-center mb-0 px-3">            
            <div className="btn-group">
                <div className="dropdown-toggle d-flex align-items-center " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className={getIconAndText(currentSection).icon + " h2 me-3"}></i> 
                  <h1 className="h2">{getIconAndText(currentSection).text}</h1>
                </div>
                <ul className="dropdown-menu">
                        {['D', 'S', 'B'].map((section) => {
                          const { icon, text } = getIconAndText(section);
                          return (
                            <li key={section}>
                              <button 
                                className={`dropdown-item d-flex align-items-center ${currentSection === section ? 'active' : ''}`} 
                                onClick={() => handleSectionChange(section)}
                              >
                                <i className={`${icon} me-2`}></i> 
                                <p className="mb-0">{text}</p>
                              </button>
                            </li>
                          );
                        })}
                </ul>
                <button type="button" className="btn btn-link ms-2" onClick={reset}><i className="bi bi-arrow-clockwise h2 m-0"></i></button>  
            </div>
            <div className='d-none d-sm-block'>
              <SearchBar hint = "Search by name..." action={searchByName} />
            </div>
          </div>
          <div className='col-12 d-flex justify-content-center d-block d-sm-none my-2 px-3'>
              <SearchBar hint = "Search by name..." action={searchByName}/>
          </div>
          {getSearch() !== '' &&
          <div className='col-12 d-flex justify-content-start mb-2 '>
            <div className="mx-1 my-0">
              <span className="badge rounded-pill d-flex flex-row align-items-center justify-content-center bg-body-tertiary text-wrap text-body shadow m-0">
                <p className='m-2 fs-6 fw-normal text-break'>{getSearch()}</p>
                <button type="button" className="btn-close btn-sm m-2" aria-label="Close" onClick={removeSearch}/>
              </span>
            </div>
          </div>
          }
          {cardData.length > 0 &&
            (cardData.map((card) => (
              <div className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex align-items-stretch justify-content-center" key={card._id}>
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
              ))
            )
          }        
        </div>
        {cardData.length === 0 && !hasMore && (
            <div className="p-2 position-absolute start-50 top-50 translate-middle d-flex justify-content-center align-items-center text-secondary">
              <i className="bi bi-x-circle h5 me-2"></i> 
              <h5 className="h5">No cards found!</h5>
            </div>
        )}

      </InfiniteScroll>
    </Container>
  );
}

export default Album;
