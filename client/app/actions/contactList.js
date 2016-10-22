export const USER_ADD_CONTACT = 'USER_ADD_CONTACT';
export const USER_DELETE_CONTACT = 'USER_DELETE_CONTACT';
export const USER_CHANGE_CONTACT = 'USER_CHANGE_CONTACT';

const before = (state, index) => state.slice(0, index);
const after = (state, index) => state.slice(index + 1);

const INITIAL_STATE = [];

const INITIAL_CONTACT = { id: 'email', account: '' };

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case USER_ADD_CONTACT:
      return state.concat(INITIAL_CONTACT);

    case USER_DELETE_CONTACT:
      return [].concat(before(state, action.index), after(state, action.index));

    case USER_CHANGE_CONTACT:
      let contact = Object.assign({}, state[action.index], {
        [action.name]: action.value
      });

      return [].concat(before(state, action.index), contact, after(state, action.index));

    default:
      return state;

  }
}
