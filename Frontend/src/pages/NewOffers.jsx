import { useState } from 'react';
import OffersContainer from '../components/OffersContainer';

function NewOffers() {
  const [url, setUrl] = useState('state=In attesa&direction=received')
  const [option, setOption] = useState('Received')

  const setReceived =  () => {
    setUrl('state=In attesa&direction=received');
    setOption('Received');
  }

  const setSended =  () => {
    setUrl('state=In attesa&direction=sended');
    setOption('Sended');
  }

  return (
    <OffersContainer
      icon = "bi bi-bell"
      title = "New Offers"
      titleModal = "New Offer"
      buttonModal = {true}
      url= {url}
    >
      <div className="btn-group">
                <div className="dropdown-toggle d-flex align-items-center " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <h5 className="h5">{option}</h5>
                </div>
                <ul className="dropdown-menu">
                  <li>
                    <button 
                      className={`dropdown-item d-flex align-items-center ${option === 'Received' ? 'active' : ''}`} 
                                onClick={setReceived}
                    > 
                                <p className="mb-0">{'Received'}</p>
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`dropdown-item d-flex align-items-center ${option === 'Sended' ? 'active' : ''}`} 
                                onClick={setSended}
                    > 
                                <p className="mb-0">{'Sended'}</p>
                    </button>
                  </li>
                </ul>  
            </div>
    </OffersContainer>
  );
}

export default NewOffers;
