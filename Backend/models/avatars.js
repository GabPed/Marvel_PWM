import mongoose from "mongoose";

const avatarSchema = new mongoose.Schema({
    superhero: String,
    file: String
  });
  
export const Avatar = mongoose.model('Avatar', avatarSchema);
