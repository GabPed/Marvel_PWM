import express from 'express';
import mongoose from 'mongoose'; //Ci permette di lavorare su MONGODB 
import cors from 'cors'; //Ci permette a gestire le chiamate cross origin
import mongoSanitize from 'express-mongo-sanitize' //Ci permette di evitare injection
import dotenv from 'dotenv'

import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from "swagger-ui-express";

import avatarsRoutes from './routes/avatars.js';
import usersRoutes from './routes/users.js';
import albumsRoutes from './routes/albums.js';
import registerRoutes from './routes/auth.js';
import offersRoutes from './routes/offers.js';
import paymentsRoutes from './routes/payments.js';
import charactersRoutes from './routes/characters.js';

import './cronjob/characters.js';  // Percorso relativo

import {authenticateToken} from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT;

dotenv.config();

//app.use(mongoSanitize());
app.use(cors()); //Si fa una sola volta
app.use(express.json());

app.use('/users',authenticateToken,usersRoutes);
app.use('/albums',authenticateToken,albumsRoutes);
app.use('/offers',authenticateToken,offersRoutes);
app.use('/payments',authenticateToken,paymentsRoutes);
app.use('/characters',authenticateToken,charactersRoutes);
app.use('/auth',registerRoutes);
app.use('/avatars',avatarsRoutes);


// Configurazione Swagger
const swaggerDocument = yaml.load(fs.readFileSync('swagger.yaml', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


mongoose.connect(process.env.CONNECTION_URL)
.then(() =>{
    
    app.listen(PORT, () => { //Ci mettiamo in ascolto solo se la connessione al DB è andata a buon fine
        console.log('Server running on port: '+PORT);
        
    });
})
.catch(Error=>console.error(error))

