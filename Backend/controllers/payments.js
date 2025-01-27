import { User } from "../models/users.js";
import { Payment } from "../models/payments.js";
import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';
dotenv.config();
const costo_crediti = 1.50;
// Configura l'SDK con le credenziali sandbox
paypal.configure({
  mode: 'sandbox', // Usa 'live' in produzione
  client_id: process.env.PayPalClientId,
  client_secret: process.env.PayPalSecret
});

export const getPayment = async (req, res) => {
  const { id } = req.user
  
  try {
    const payment = await Payment.findOne(
      { id_utente: id, stato: 'In sospeso' }
    );
    if(!payment) return res.status(404).json({ message: "Nessun pagamento trovato"});
    return res.status(200).json({ payment: payment});
  }
  catch(error) {
    console.log(error)
  }
}

export const getPaymentByPaymentId = async (req, res) => {
  const { id } = req.user
  const { paymentId } = req.params;

  // Verifica la presenza di payerId e paymentId
  if (!paymentId) return res.status(400).json({ message: 'Errore: payerId o paymentId mancante' });
  try {
    const payment = await Payment.findOne(
      { id_utente: id, paymentId, stato: 'In sospeso' }
    );
    if(!payment) return res.status(404).json({ message: "Nessun pagamento trovato"});
    return res.status(200).json({ payment: payment});
  }
  catch(error) {
    console.log(error)
  }
}

// Endpoint per creare un pagamento
export const createPayment = async (req, res) => {
  const { id } = req.user; // ID dell'utente dal token JWT
  const { crediti } = req.body || {}; // Numero di pacchetti dal frontend

  // Calcola il totale in base al numero di pacchetti
  if (!crediti || crediti === 0) {
    return res.status(400).json({ message: 'Numero di crediti insufficiente' });
  }
  const totalAmount = (crediti * costo_crediti).toFixed(2); // Prezzo totale

  // Dati per creare il pagamento con PayPal
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: process.env.DominioClient+'/payment/success',  // URL per il successo del pagamento
      cancel_url: process.env.DominioClient+'/payment/cancel'    // URL per il fallimento o cancellazione
    },
    transactions: [{
      amount: {
        total: totalAmount,   // Usa l'importo calcolato
        currency: 'EUR'   // Valuta
      },
      description: `Acquisto di ${crediti} pacchetti`
    }]
  };

  try {
    // Crea il pagamento con PayPal
    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Errore durante la creazione del pagamento' });
      }

      // Salva nel database il pagamento con lo stato "In sospeso"
      const newPayment = new Payment({
        id_utente: id,
        paymentId: payment.id,  
        amount: totalAmount,
        crediti: crediti,
        stato: 'In sospeso'
      });

      await newPayment.save();

      // Trova e restituisci l'URL di approvazione per il frontend
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          return res.status(200).json({ redirectUrl: payment.links[i].href });
        }
      }
    });
  } catch (error) {
    console.error('Errore durante il salvataggio del pagamento', error);
    return res.status(500).json({ message: 'Errore interno al server' });
  }
};

// Endpoint per gestire il successo del pagamento
export const successPayment = async (req, res) => {
    const { id } = req.user;
    const { payerId, paymentId } = req.body;

    // Verifica la presenza di payerId e paymentId
    if (!payerId || !paymentId) return res.status(400).json({ message: 'Errore: payerId o paymentId mancante' });

    try {
        // Trova e aggiorna il pagamento nel database
        const payment = await Payment.findOneAndUpdate(
            { id_utente: id, paymentId, stato: 'In sospeso' },  
            { payerId, stato: 'Completato' },
            { new: true }
        );

        if (!payment) return res.status(404).json({ message: 'Pagamento non trovato' });

        const execute_payment_json = {
            payer_id: payerId,
            transactions: [{
                amount: {
                    currency: 'EUR',
                    total: payment.amount
                }
            }]
        };

        // Esegui il pagamento su PayPal
        paypal.payment.execute(paymentId, execute_payment_json, async (error, paymentResponse) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Errore durante l\'esecuzione del pagamento' });
            }

            try {
                const crediti = payment.amount / costo_crediti; 

                // Incrementa i crediti dell'utente
                const user = await User.findByIdAndUpdate(id, { $inc: { crediti: crediti } }, { new: true });
        
                if (!user) return res.status(404).json({ message: 'Utente non trovato' });

                res.status(200).json({ message: 'Pagamento completato con successo e crediti aggiunti!', user });
            } catch (error) {
                console.error('Errore durante l\'aggiornamento dei crediti dell\'utente:', error);
                return res.status(500).json({ message: 'Errore durante l\'aggiornamento dei crediti' });
            }
        });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del pagamento:', error);
        return res.status(500).json({ message: 'Errore interno al server' });
    }
};

// Endpoint per cancellare un pagamento
export const cancelPayment = async (req, res) => {
    const { paymentId } = req.body || {};
    const { id } = req.user;  
    try {
        // Trova il pagamento nel DB in base a paymentId e id_utente
        const payments = (paymentId 
                          ? await Payment.find({ id_utente: id, paymentId })
                          : await Payment.find({ id_utente: id, stato: 'In sospeso' }));
        if (payments.length === 0) {
            return res.status(404).json({ message: 'Nessun pagamento trovato' });
        }

        // Se lo stato è già "Completato", non può essere cancellato
        if (payments.stato === 'Completato') {
            return res.status(400).json({ message: 'Il pagamento è già completato e non può essere cancellato.' });
        }

        for (const payment of payments) {
          payment.stato = 'Cancellato';
          await payment.save(); // Salva il pagamento aggiornato
        }

        // Rispondi con una conferma della cancellazione
        res.status(200).json({ message: 'Pagamenti cancellati con successo.'});
    } catch (error) {
        console.error('Errore durante la cancellazione del pagamento:', error);
        res.status(500).json({ message: 'Errore interno del server' });
    }
};
