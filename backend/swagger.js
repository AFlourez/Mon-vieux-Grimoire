const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'A simple API documentation example using Swagger',
    },
    servers: [
      {
        url: 'http://localhost:4000', // L'URL API
      },
    ],
  },
  apis: ['./frontend/src/utils/constants.js'], // es chemin vers le fichier contenant vos routes d'API
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
