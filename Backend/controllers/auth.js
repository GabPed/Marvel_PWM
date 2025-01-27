import { User } from "../models/users.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {isPasswordValid, isEmailValid} from '../validation/users.js';
import { cleanUser } from "./users.js";
import { Character } from "../models/characters.js";
import nodemailer from 'nodemailer';

export const register = async (req, res) => {
    const { username, email, password, confirmPassword, favoriteHero} = req.body || {};
    
    // Verifica username
    if (!username || typeof username != 'string' || username.trim() === '') return res.status(400).json({ message: "Username non valido" })
    
    // Verifica l'email
    if (!isEmailValid(email)) return res.status(400).json({ message: "Email non valida" })
    
    // Verifica la password
    const passwordCheck = isPasswordValid(password)
    if (!passwordCheck.valid) return res.status(400).json({ message: passwordCheck.message });

    // Verifica se le password corrispondono
    if (password != confirmPassword) return res.status(400).json({ message: "Le password non corrispondono" })
    if (!favoriteHero || typeof favoriteHero != 'string' || favoriteHero.trim() === '') return res.status(400).json({ message: "Eroe preferito non valido" })
    
    // Fa l'hashing della password prima di salvarla dul DB
    const passwordHashed = await bcrypt.hash(password, 10);

    // Creo l'user
    const user = new User({
        username: username,
        email: email,
        password: passwordHashed,
        favoriteHero: favoriteHero,
        crediti: 0
    })

    try {
        await user.save();

        // Effettuo il login in automatico dopo la creazione del nuovo utente
        const fakeReq = {
            body: {
                username: username,
                password: password
            }
        };
        await login(fakeReq, res);
        
    } catch (error) {
        if (error.code === 11000) {
            // Controlla se l'errore è causato da una chiave duplicata
            console.error("Errore di chiave duplicata:", error.keyValue);
            
            // Puoi restituire una risposta specifica se stai gestendo un'API
            return res.status(400).json({ message: "Esiste già un utente con questo username o email."});
        }
        res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    const {username, password} = req.body || {};
    try{
        if(!username || !password) return res.status(404).json({ status: 'error', message: 'Username e/o Password errati' })
            const user = await User.findOne({$or: [
                    { username: username },  
                    { email: username }     
                ]})
            if(!user) return res.status(404).json({ status: 'error', message: 'Username e/o Password errati' })
            
            // Creazione del token di AUTH  
            if(await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({
                    id: user._id
                },process.env.JWT_SECRET/*, { expiresIn: '1h' }*/)

                const charactersCount = await Character.countDocuments();
                const album = user.album.filter(card => card.stato === 'D').length || 0
                
                // Ritorna il token e le informazioni dell'utente togliendo alcune informazioni
                return res.status(200).json({
                    token: token,
                    user: {...await cleanUser(user), cardsFound: album, totalCards: charactersCount}
                });
            }
            res.status(404).json({ status: 'error', message: 'Username e/o Password errati' })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const resetPassword = async (req, res) => {

    const {username} = req.body || {};
    try{
        if(!username) return res.status(404).json({ status: 'error', message: 'Username o Email errata' })
            const user = await User.findOne({$or: [
                    { username: username },  
                    { email: username }     
                ]})
            if(!user) return res.status(404).json({ status: 'error', message: 'Username o Email non presente' })
            
            // Creazione del token di AUTH  
           
                const token = jwt.sign({
                    id: user._id,
                    email: user.email
                },process.env.JWT_SECRET, { expiresIn: '10m' })

                const resetLink = 'http://localhost:5173/reset-password/'+token;

                // Configura il trasportatore
                const transporter = nodemailer.createTransport({
                  service: 'gmail', 
                  auth: {
                    user: process.env.Email, 
                    pass: process.env.EmailSecret,
                  },
                });
                
                // Definisci i dettagli dell'email
                const mailOptions = {
                  from: 'no-reply@marvel-pwm.com', // Indirizzo del mittente
                  to: user.email, // Destinatario
                  subject: 'Password Reset Instructions - Expires in 10m',
                  text: `
                        Hello ${user.username},

                        We received a request to reset your password. Click the link below to set a new password:

                        ${resetLink}

                        If you didn't request a password reset, please ignore this email.

                        Best regards,
                        Marvel PWM
                    `,
                  html:  `
                  <p>Hello ${user.username},</p>
                  <p>We received a request to reset your password. Click the link below to set a new password:</p>
                  <p><a href="${resetLink}">${resetLink}</a></p>
                  <p>If you didn't request a password reset, please ignore this email.</p>
                  <p>Best regards,<br>Marvel PWM</p>
              `, 
                };
                
                transporter.sendMail(mailOptions, (error, info) => {
                if (!error) {
                    return res.status(200).json({message: "Reset password richiesto"});
                } else {
                    console.log(error)
                    res.status(500).json({ message: "Error " });
                }
            });
                
            // Ritorna il token e le informazioni dell'utente togliendo alcune informazioni
           
    } catch (error) {
        res.status(500).json({ message: error.message });
    } 
}