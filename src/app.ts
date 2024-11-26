import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import notesRouter from './controllers/notes';
import usersRouter from './controllers/users';
import loginRouter from './controllers/login';
import testingRouter from './controllers/testing';
import mongoose from 'mongoose';
import logger from './utils/logger';
import config from './utils/config';
import middleware from './utils/middleware';

// Initialize express app
const app  = express();

// Initiate MongoDB connection
mongoose.set('strictQuery', false);
logger.info('connecting to', config.MONGODB_URI!);
mongoose.connect(config.MONGODB_URI!)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error: unknown) => {
    if (error instanceof Error) {
      logger.error('error connecting to MongoDB:', error.message);
    }
  });

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// Set up routing for notes
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use('/api/notes', middleware.userExtractor, notesRouter);

// Set up routing for users
app.use('/api/users', usersRouter);

// Set up routing for login
app.use('/api/login', loginRouter);

// Empties DB in testing mode
if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;