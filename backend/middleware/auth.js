const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Assure-toi que cette clé est sécurisée et définie correctement

module.exports = (req, res, next) => {
  try {
    // Vérifie si le header contient un token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou incorrect' });
    }

    // Extrait le token
    const token = authHeader.split(' ')[1];
    console.log('Token reçu:', token);

    // Vérifie et décode le token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log('ID utilisateur décodé:', decodedToken.userId);

    // Ajoute l'ID de l'utilisateur au requête
    req.userId = decodedToken.userId;

    next(); // Passe à la prochaine fonction middleware ou route
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};
