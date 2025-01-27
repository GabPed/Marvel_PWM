import mongoose from "mongoose"
import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] //Bearer token
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.JWT_SECRET, (error, user)=>{
        if (error && error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token scaduto, effettua nuovamente il login' });
        }
        if(error) return res.sendStatus(401)

        const { id } = user
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({message: 'Id non conforme'});
        req.user = user
        next();
    })
}