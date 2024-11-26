import supertest from 'supertest';
import app from '../app';

// App API for testing purposes
const api = supertest(app);

export default api;