const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const swaggerSetup = require('./swagger');

swaggerSetup(app);

// Connexion à MongoDB
mongoose.connect('mongodb+srv://flourezalexis:ojpgTgnpLMDe6ewm@mvg.739qc.mongodb.net/?retryWrites=true&w=majority&appName=MVG', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(error => console.error('Erreur de connexion à MongoDB :', error));

const port = process.env.PORT || 4000;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
  console.log(`Swagger démarré sur le port ${port}`);
});

