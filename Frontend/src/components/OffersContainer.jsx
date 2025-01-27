import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../auth/ApiRequest';
import CardOffer from './CardOffer';
import Container from './Sidebar/Container';
import config from '../config';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

function OffersContainer({icon, title, url, titleModal, buttonModal, children}) {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]); // Stato per memorizzare le offerte
  const [page, setPage] = useState(1); // Stato per memorizzare eventuali errori
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    getOffers();
  }, [page, refresh]);

  useEffect(() => {
    reset();
  }, [url]);

  const getOffers = async () => {
    try {
      const response = await apiRequest(`${import.meta.env.VITE_SERVER_URL}/offers?${url}&page=${page}`, {
        method: 'GET',
      }, navigate);

      const data = await response.json();

      if (response.ok) {
        setOffers([...offers, ...data.offers]);
        setHasMore(data.totalPages > page);
        
      } else {
        setHasMore(false);
        console.log(data.message || 'Errore durante il recupero delle offerte');
      }
    } catch (error) {
      console.error("Errore durante la richiesta:", error);
    }
  };

  const loadMoreOffers = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa di 5 secondi
    setPage(page+1);
  };

  const removeOffer = (offerId) => {
    const offerFiltered = offers.filter(offer => offer._id !== offerId);
    console.log(offerFiltered)
    setOffers([...offerFiltered])
  }

  const reset = () => {
    setPage(1);
    setOffers([]);
    setRefresh(!refresh);
  }

  return (
    <Container className='overflow-auto w-100 p-4'>
      <InfiniteScroll className='overflow-x-hidden min-vh-100 overflow-y-hidden position-relative py-2 px-1'
          dataLength={offers.length}
          next={loadMoreOffers}
          hasMore={hasMore}
          loader={
            <div className="d-flex justify-content-center mt-3">
              <div className="spinner-grow text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
      >
        <div className='row justify-content-center g-3 p-3'>
          <div className="col-12 d-flex justify-content-center align-items-center d-column mt-3 mb-0">
              <i className={icon+" h2 me-2"}></i>
              <h1 className="h2">
                {title}
              </h1>
              <button type="button" className="btn btn-link ms-2" onClick={reset}><i className="bi bi-arrow-clockwise h2 m-0"></i></button>  
          </div>
          {children && 
            <div className="col-12 d-flex justify-content-center align-items-center mt-0 mb-4">
              {children}
            </div>
          }
          {offers.length > 0 && (
            offers.map((offer) => (
              <div key={offer._id} className='col-sm-10 col-md-5 col-lg-4'>
                <CardOffer 
                  offer = {offer} 
                  title = {titleModal}
                  buttonEnable = {buttonModal}
                  removeOffer = {removeOffer}
                /> 
              </div>
            ))
          )}
        </div>
        {offers.length == 0 && !hasMore &&
            (<div className="p-2 position-absolute start-50 top-50 translate-middle d-flex justify-content-center align-items-center text-secondary">
                <i className="bi bi-x-circle h5 me-2"></i> 
                <h5 className="h5">No offers found!</h5>
              </div>)          
        }
      </InfiniteScroll>
    </Container>
  );
}

export default OffersContainer;
