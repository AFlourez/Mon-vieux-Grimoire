// Requiring modules
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const booksRoutes = require('./routes/booksRoutes');
require('dotenv').config();

// Creating express object
const app = express();

// Configurer CORS pour autoriser les requêtes depuis votre frontend
app.use(cors({
  origin: 'http://localhost:3000',  // URL de votre frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json());

// Serving files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mon vieux grimoire',
      version: '1.0.0',
      description: 'Mon vieux grimoire',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, 'routes/*.js')],
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);

module.exports = app;
