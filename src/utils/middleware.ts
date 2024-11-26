import { NextFunction, Request, Response } from 'express';
import logger from './logger';
import ts_utils from './ts_utils';
import jwt from 'jsonwebtoken';
import config from './config';
import UserModel from '../models/user';

// If request header Authorization contains a token, sets req.token field to be that token
const tokenExtractor = (req: Request, _res: Response, next: NextFunction) => {
  // Retrieve the 'Bearer [token]' field
  const authorization = req.get('authorization');
  // If the Bearer [token] field is confirmed exist, set req.token to be the [token] part
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '');
  }

  next();
};

// Decodes token and finds out which user the token belongs to
const userExtractor = async (req: Request, res: Response, next: NextFunction) => {
  if (req.token) {
    // Retrieve token from request, then decode using jwt
    const decodedToken = ts_utils.validateUserForToken(jwt.verify(req.token, config.SECRET as string));

    // If the decodedToken object doesn't contain id field, then the token is invalid
    if (!decodedToken.id) {
      res.status(401).json({ error: 'token invalid' });
    } else {
      // Otherwise if token is valid, find user using the decoded token's id
      const user = await UserModel.findById(decodedToken.id);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
};

// requestLogger middleware
const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log('Method: ', req.method);
  if (req.path) {
    console.log('Path: ', req.path);
  }
  console.log('Body: ', req.body);
  const authorization = req.get('authorization');
  if (authorization) {
    console.log('Authorization: ', authorization);
  }
  if (req.user) {
    console.log('User: ', req.user);
  }
  console.log('---');
  next();
};

// Catch requests to non-existing routes
const unknownEndpoint = (_req: Request, res: Response) => {
  return res.status(404).send({
    error: 'unknown endpoint'
  });
};

// Error handler
const errorHandler = (error: Error, _req: Request, res: Response, next: NextFunction) => {
  logger.error('Error name: ' + error.name);
  logger.error('Error message: ' + error.message);

  switch (error.name){
    case 'CastError':
      return res.status(400).send({ error: 'provided id format is incorrect'});
    case 'ValidationError':
      return res.status(400).json({ error: error.message });
    case 'MongoServerError': {
      if (error.message.includes('E11000 duplicate key error')) {
        return res.status(400).json({ error: 'expected `username` to be unique'});
      }
      return res.status(400).json({ error: error.message });
    }
    case 'JsonWebTokenError': 
      return res.status(401).json({ error: 'token missing or invalid' });
    case 'TokenExpiredError':
      return res.status(401).json({ error: 'token expired' });
    default:
      return next(error);
  }
};

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
};