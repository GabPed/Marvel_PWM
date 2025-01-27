import { Avatar } from "../models/avatars.js";

export const getAvatars = async (req, res) => {
    try {
        const avatars = await Avatar.find(); 
        res.json(avatars); 
      } catch (error) {
        res.status(500).json({ message: 'Errore durante il recupero degli avatar', error });
    }
}