/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/user';
import ts_utils from '../utils/ts_utils';

const usersRouter = Router();

// GET all users
usersRouter.get('/', async (_req: Request, res: Response) => {
  const users = await UserModel
    .find({})
    .populate('notes', { user: 0});
  res.json(users);
});

// CREATE a new user
usersRouter.post('/', async (req: Request, res: Response ) => {
  const { username, name, password } = ts_utils.validateNewUser(req.body);
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = new UserModel({
    username, name, passwordHash
  });

  const savedUser = await newUser.save();
  res.status(201).json(savedUser);

});

export default usersRouter;