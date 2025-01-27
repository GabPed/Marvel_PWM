import OffersContainer from '../components/OffersContainer';

function OldOffers() {
  return (
    <OffersContainer
      icon = "bi bi-clock-history"
      title = "Old Offers"
      titleModal = "Old Offer"
      buttonModal = {false}
      url= "state=closed"
    />
  );
}

export default OldOffers;
