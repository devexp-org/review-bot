import { combineReducers } from 'redux';
import userForm from './user-form';
import users from './users';
import user from './user';

export default combineReducers({
  userForm,
  users,
  user
});
