import { combineReducers } from 'redux';
import userInfo from './UserInfo';
import userList from './UserList';
import userForm from './UserForm';

export default combineReducers({
  userInfo,
  userList,
  userForm
});
