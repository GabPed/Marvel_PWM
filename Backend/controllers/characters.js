import mongoose from "mongoose";
import { Character } from "../models/characters.js";
import crypto from 'crypto'; 
import dotenv from 'dotenv';
dotenv.config();
 
const ts = new Date().getTime(); // timestamp
const hash =  crypto.createHash('md5').update(ts + process.env.MarvelPrivateKey + process.env.MarvelPublicKey).digest('hex');
async function getCharacters(limit, offset) {
    let urlCharacters = `${process.env.MarvelBaseUrl}${process.env.MarvelCharactersEndpoint}?ts=${ts}&apikey=${process.env.MarvelPublicKey}&hash=${hash}&limit=${limit}&offset=${offset}`;
    console.log(urlCharacters)
    try {
      let response = await fetch(urlCharacters);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      let characters = await response.json();
      characters = characters.data.results
      for(let i=0;i<characters.length;i++) {
        Save(characters[i]);
      }
      
    } catch (error) {
      console.error(error.message);
      return null;
    }
    
}

async function Save(character) {
  const filter = { id: character.id }; // Condizione per trovare il documento
  const update = {
    hero: character.name,
    description: character.description,
    image: `${character.thumbnail.path}.${character.thumbnail.extension}`,
    series: character.series.items.map(item => item.name), // Trasforma in un array di nomi
    events: character.events.items.map(item => item.name), // Trasforma in un array di nomi
    comics: character.comics.items.map(item => item.name)  // Trasforma in un array di nomi
  };

  try {
    const doc = await Character.findOneAndUpdate(filter, update, {
      new: true,       // Restituisce il documento aggiornato
      upsert: true,   // Crea un nuovo documento se non esiste
      runValidators: true // Applica i validatori
    });
    console.log('Eroe ' + character.id + ' inserito');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento o inserimento:', error);
  }
  
}

async function getCharactersNumber(limit=1, offset=0) {
  const url = `${process.env.MarvelBaseUrl}${process.env.MarvelCharactersEndpoint}?ts=${ts}&apikey=${process.env.MarvelPublicKey}&hash=${hash}&limit=${limit}&offset=${offset}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    } 
    const json = await response.json();
    return json.data.total;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export async function load() {
  const maxCharacters = await getCharactersNumber();
  const limit = 100;
  for(let offset=0;offset<maxCharacters;offset = offset+limit) {
    getCharacters(limit, offset);
  }
}

export const getCharacterInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const character = await Character.findOne({id})
    if(!character) return res.status(404).json({ message: 'Character non trovato' });
      
    return res.status(200).json({character: character});
  } catch (error) {
    console.error("Errore durante l'ottenimento del character:", error);
    res.status(500).json({ message: error.message });
  }
}

function arrayToString(arr) {
  if (!Array.isArray(arr)) {
      throw new Error('Input must be an array');
  }
  return arr.join(', ');
}

export const getCharacter =  async (id) => {
  try {
    const character = await Character.findOne({id}).lean();
    
    if(!character) return console.log('Character con id: '+id+' non trovato' );

    const info = [
      { title: "Series", quantity: character.series.length, content: arrayToString(character.series)},
      { title: "Events", quantity: character.events.length, content: arrayToString(character.events)},
      { title: "Comics", quantity: character.comics.length, content: arrayToString(character.comics)},
    ]
    return { hero: character.hero, description: character.description, image: character.image, info: [...info]};
  } catch (error) {
    console.error("Errore durante l'ottenimento del character: ", error);
    res.status(500).json({ message: error.message });
  }
}