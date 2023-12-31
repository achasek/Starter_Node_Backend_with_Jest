const morgan = require('morgan');
const logger = require('./logger');
const config = require('./config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

morgan.token('body', function getBody (req) {
  return JSON.stringify(req.body);
});

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  if (request.headers.authorization) {
    logger.info('Header:  ', request.headers.authorization);
  }
  logger.info('---');
  next();
};

// this does not have the next parameter since being an endpoint would be the end of the middleware pipeline
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  // if token is invalid or missing
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: error.message });
  }
  // if token is expired || error.message.contains('expired')
  else if (error.name === 'TokenExpiredError' || error.message === 'jwt expired') {
    return response.status(401).json({
      error: 'token expired: please log in again'
    });
  }

  next(error);
};

// isolates the token from the authorization header and assigns that value to a custom key-value in the req object
const getTokenFrom = (request, response, next) => {
  let authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    authorization = authorization.replace('Bearer ', '');
    request.token = authorization;
  }
  next();
};

// extracts user from HTTP req that requires a logged-in user to perform
const getUserFrom = async (request, response, next) => {
  // this is only to make POST testing pass. I could not figure out how to set the request.token in testing to the auth header
  const token = request.token || request.headers.authorization;
  // if middleware is working right, should log token WITHOUT Bearer in front
  // console.log('token in middleware',token)

  try {
    if (!token) {
      return response.status(401).json({
        error: 'token not found'
      });
    } else {
      const decodedToken = jwt.verify(token, config.SECRET);
      console.log("DECODED TOKEN --->", decodedToken); // --------------------

      if (!decodedToken.id) {
        return response.status(401).json({
          error: 'token invalid'
        });
      }

      const user = await User.findById(decodedToken.id);

      request.user = user;
    }
  } catch(error) {
    next(error);
  }
  next();
};

module.exports = {
  morgan,
  requestLogger,
  unknownEndpoint,
  errorHandler,
  getTokenFrom,
  getUserFrom
};