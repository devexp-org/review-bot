import { combineReducers } from 'redux';
import userInfo from '../actions/userInfo';
import userList from '../actions/userList';
import userForm from '../actions/userForm';

export default combineReducers({
  userInfo,
  userList,
  userForm
});
