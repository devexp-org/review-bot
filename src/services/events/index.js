import EventEmitter from 'eventemitter2';

export default function setup() {

  const service = new EventEmitter();
  service.emit = service.emitAsync;

  return service;

}
