import { combineReducers } from 'redux';
import userInfo from './user';
import userList from './userList';
import userForm from './userForm';

export default combineReducers({
  userInfo,
  userList,
  userForm
});
