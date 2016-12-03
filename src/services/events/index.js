import { EventEmitter2 } from 'eventemitter2';

export default function setup() {

  const service = new EventEmitter2();

  return service;

}
