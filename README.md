# Marvel PWM

Applicazione full-stack per la gestione di un catalogo/album di figurine dei personaggi Marvel, con sistema di scambio (baratto) tra utenti e acquisto di pacchetti tramite PayPal.

🔗 **Demo:** [marvel-pwm.vercel.app](https://marvel-pwm.vercel.app)

## Funzionalità principali

- Autenticazione utenti (registrazione, login, reset/modifica password) con JWT
- Album personale dei personaggi Marvel, con avatar e profilo utente
- Ricerca di altri utenti e gestione delle offerte di scambio (baratto) delle figurine
- Acquisto di nuovi pacchetti di personaggi tramite integrazione PayPal
- Aggiornamento periodico del catalogo personaggi tramite cron job
- Documentazione delle API tramite Swagger

## Stack tecnologico

**Backend** ([`/Backend`](Backend))
- Node.js / Express 5
- MongoDB con Mongoose
- Autenticazione JWT (`jsonwebtoken`, `bcryptjs`)
- PayPal REST SDK per i pagamenti
- `node-cron` per l'aggiornamento periodico dei personaggi
- Swagger (`swagger-jsdoc`, `swagger-ui-express`) per la documentazione delle API, esposta su `/api-docs`

**Frontend** ([`/Frontend`](Frontend))
- React 18 + Vite
- Redux Toolkit per la gestione dello stato
- React Router per il routing
- React Bootstrap per l'interfaccia

**Deploy:** Frontend pubblicato su Vercel — [marvel-pwm.vercel.app](https://marvel-pwm.vercel.app)

## Struttura del progetto

```
Marvel_PWM/
├── Backend/     # API Express, modelli MongoDB, autenticazione, pagamenti, swagger
├── Frontend/    # Applicazione React/Vite/Redux
└── docs/        # Documentazione del progetto
```

## Avvio in locale

### Backend

```bash
cd Backend
npm install
npm run dev
```

Richiede un file `.env` con le variabili di connessione (es. `PORT`, `CONNECTION_URL` per MongoDB, credenziali JWT e PayPal).

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Documentazione

- La relazione del progetto è disponibile in [docs/Relazione_PWM.docx](docs/Relazione_PWM.docx)
- La documentazione delle API è generata da Swagger a partire da [`Backend/swagger.yaml`](Backend/swagger.yaml) ed è consultabile su `/api-docs` una volta avviato il backend
