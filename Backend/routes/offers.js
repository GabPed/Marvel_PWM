import express from 'express';
import { addOffers, getCardsToOffer, getCardsToSelect, getOffers, updateOffer } from '../controllers/offers.js';

const router = express.Router();

router.get('/',getOffers);
router.get('/cardsToOffer/:idOfferente',getCardsToOffer)
router.get('/cardsToSelect/:idOfferente',getCardsToSelect)
router.post('/',addOffers);
router.patch('/',updateOffer);

export default router;