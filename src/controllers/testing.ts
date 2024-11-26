/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response, Router } from 'express';
import NoteModel from '../models/note';
import UserModel from '../models/user';

const testingRouter = Router();

// Empty the DB (users and notes). This is used only for tests
testingRouter.post('/reset', async (_req: Request, res: Response) => {
  await NoteModel.deleteMany({});
  await UserModel.deleteMany({});

  res.status(204).end();
});

export default testingRouter;