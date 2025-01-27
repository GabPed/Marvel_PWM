import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardHero from '../components/CardHero';
import Container from '../components/Sidebar/Container';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchBar from '../components/SearchBar';
import { apiRequest } from '../auth/ApiRequest';
import config from '../config';

function Baratto() {
  const [hasMore, setHasMore] = useState(true);
  const [refresh,  setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cardData, setCardData] = useState([]);
  const navigate = useNavigate();

  const searchByName = (new_search) => {
    if(new_search === search) return;
    setSearch(new_search)
    resetData();
  }

  const removeSearch = () => {
    setSearch('');
    resetData();
  }

  const reset = () => {
    setRefresh(!refresh);
    resetData();
  }

  // Funzione per caricare più carte alla fine della pagina
  const loadMoreCards = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa di 5 secondi
    setPage(page+1);
  };
  
  const resetData = () => {
    setPage(1);
    setCardData([]);
  }

  const fetch = async () => {
    var request = `${config.serverUrl}/albums/listedcards?page=${page}`;
    if (search && search.trim() !== '') {
      request += `&search=${search}`;
    }

    try {
      // Aggiungi i parametri state e page alla richiesta
      const response = await apiRequest(request, {
        method: 'GET',
      }, navigate);

      if (response.ok) {
        const data = await response.json();
        const { album, totalPages } = data; 
        
        setCardData([...cardData, ...album]);
        setHasMore(totalPages > page)
      }
      else {
        setHasMore(false)
      }
    }
    catch (err) {
      setHasMore(false)
    }
  };
  
  useEffect(() => {
    fetch();
  }, [search, page, refresh]);

  // Seleziona le carte da visualizzare in base alla sezione corrente

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
                <i className=" h2 me-3"></i> 
                <h1 className="h2">Listed Cards</h1>
                <button type="button" className="btn btn-link ms-2" onClick={reset}><i className="bi bi-arrow-clockwise h2 m-0"></i></button>  
            </div>
            <div className='d-none d-sm-block'>
              <SearchBar hint = "Search by name..." action={searchByName} />
            </div>
          </div>
          <div className='col-12 d-flex justify-content-center d-block d-sm-none my-2 px-3'>
              <SearchBar hint = "Search by name..." action={searchByName}/>
          </div>
          {search !== '' &&
          <div className='col-12 d-flex justify-content-start mb-2 '>
            <div className="mx-1 my-0">
              <span className="badge rounded-pill d-flex flex-row align-items-center justify-content-center bg-body-tertiary text-wrap text-body shadow m-0">
                <p className='m-2 fs-6 fw-normal text-break'>{search}</p>
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
                    idUnique={card._id+card.userInfo._id}
                    image={card.image}
                    hero={card.hero}
                    description={card.description}
                    info={card.info}
                    stato={card.stato}
                    personal={false}
                    user={card.userInfo}
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

export default Baratto;


