import cron from 'node-cron';
import { load } from '../controllers/characters.js'; 

// Definisci il cron job per eseguire la funzione 'load' ogni giorno alle 2 di notte
cron.schedule('0 2 * * *', async () => {
  console.log('Esecuzione cron job alle 2 di notte');
  try {
    await load();
  } catch (error) {
    console.error('Errore durante l\'esecuzione del cron job:', error);
  }
});
