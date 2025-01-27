import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '../components/Sidebar/Container';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchBar from '../components/SearchBar';
import { apiRequest } from '../auth/ApiRequest';
import config from '../config';
import UsersAvatar from '../components/usersAvatar';

function Searchusers() {
  const { usersname } = useParams();
  const [hasMore, setHasMore] = useState(false);
  const [refresh,  setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cardData, setCardData] = useState([]);
  const [users, setusers] = useState({});
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

  // Funzione per caricare più carte alla fine della pagina

  
  const resetData = () => {
    setPage(1);
    setHasMore(false);
    setusers([]);
  }

  const fetch = async () => {
    var request = `${config.serverUrl}/users/search/${search}`;
    try {
      // Aggiungi i parametri state e page alla richiesta
      const response = await apiRequest(request, {
        method: 'GET',
      }, navigate); 

      if (response.ok) {
        const data = await response.json();
        setusers([...data.users]);
        setHasMore(false)
      }
      else {
        setHasMore(false)
      }
    }
    catch (err) {
      setHasMore(false)
    }
  };
  
  const loadMoreCards = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa di 5 secondi
    setPage(page+1);
  };

  useEffect(() => {
    if(search.trim() !== '') fetch();
  }, [search, page, refresh]);

  // Seleziona le carte da visualizzare in base alla sezione corrente

  return (
    <Container className='overflow-auto w-100 p-4'>
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
          <div className="col-12 d-flex justify-content-center align-items-center mb-2 px-3">           
            <i className="bi bi-people h2 me-2"></i>
            <h1 className="h2">
              Search Users
            </h1>
          </div>
          <div className='col-12 d-flex justify-content-center d-block mt-2 px-3'>
              <SearchBar hint = "Search by username..." action={searchByName}/>
          </div>
          {search !== '' &&
          <div className='col-11 d-flex justify-content-start mb-3'>
            <div className="mx-2 my-0">
              <span className="badge rounded-pill d-flex flex-row align-items-center justify-content-center bg-body-tertiary text-wrap text-body shadow m-0">
                <p className='m-2 fs-6 fw-normal text-break'>{search}</p>
                <button type="button" className="btn-close btn-sm m-2" aria-label="Close" onClick={removeSearch}/>
              </span>
            </div>
          </div>
          }
          {users.length > 0 &&
            (users.map((user) => (
              <div className="col-10 d-flex align-items-stretch justify-content-center my-1" key={user._id}>
                <div className='card w-100  shadow'>
                  <div className='card-body d-flex justify-content-start px-4'>
                    <UsersAvatar user ={user} size = 'lg' className = 'stretched-link'/> 
                  </div> 
                </div>
              </div>
              ))
            )
          }        
        </div>
        {users.length === 0 && !hasMore && (
            <div className="p-2 position-absolute start-50 top-50 translate-middle d-flex justify-content-center align-items-center text-secondary">
              <i className="bi bi-x-circle h5 me-2"></i> 
              <h5 className="h5">No users found!</h5>
            </div>
        )}

      </InfiniteScroll>
    </Container>
  );
}

export default Searchusers;


