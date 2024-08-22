const mongoose = require('mongoose');

// Définir le schéma pour un utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // adresse e-mail unique
  password: { type: String, required: true } // mot de passe haché
});

// Créer le modèle basé sur le schéma
const User = mongoose.model('User', userSchema);

module.exports = User;
