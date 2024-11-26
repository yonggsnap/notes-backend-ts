import UserModel from '../../models/user';

const usersInDb = async () => {
  const users = await UserModel.find({});
  return users.map(u => u.toJSON());
};

export default {
  usersInDb
};