/* eslint-disable @typescript-eslint/no-misused-promises */
import { Request, Response, Router } from 'express';
import ts_utils from '../utils/ts_utils';
import UserModel from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../utils/config';

const loginRouter = Router();

// Log in user

loginRouter.post('/', async (req: Request, res: Response) => {
  const { username, password } = ts_utils.validateLoginRequest(req.body);

  const user = await UserModel.findOne({ username });

  const passwordCorrect = !user
    ? false 
    : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    });
  }

  // This userForToken will be used for token digital signature
  const userForToken = {
    username: user.username,
    id: user._id
  };

  const token = jwt.sign(
    userForToken, 
    config.SECRET as string,
    { expiresIn: 60 * 60}
  );

  return res
    .status(200)
    .send({
      token,
      username: user.username,
      name: user.name
    });

});

export default loginRouter;