/* @flow */

import { EventEmitter2 } from 'eventemitter2';

type EventEmitter = {
  on: (event: string) => void,
  once: (event: string) => void,
  emit: (event: string) => void,
  emitAsync: (event: string) => Promise<void>,
  addListener: (event: string) => void,
  removeListener: (event: string) => void
}

export default function setup(): EventEmitter {

  return new EventEmitter2();

}
