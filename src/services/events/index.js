import { EventEmitter2 } from 'eventemitter2';

/**
 * Creates "EventEmitter" service.
 *
 * @return {EventEmitter}
 */
export default function setup() {

  return new EventEmitter2();

}

/**
 * @classdesc Event emitter.
 *
 * @name EventEmitter
 * @class
 */

/**
 * Registers a new event listener for the given event.
 *
 * @name EventEmitter#on
 * @method
 *
 * @param {String} event - name of the event.
 * @param {Function} callback - callback function.
 *
 * @return {void}
 */

/**
 * Removes an event listener for the given event.
 *
 * @name EventEmitter#off
 * @method
 *
 * @param {String} event - The event we want to remove.
 * @param {Function} callback - the listener that we need to find.
 *
 * @return {void}
 */

/**
 * Registers an event listener that is called only once.
 *
 * @name EventEmitter#once
 * @method
 *
 * @param {String} event - name of the event.
 * @param {Function} callback - callback function.
 *
 * @return {void}
 */

/**
 * Emits an event to all registered event listeners.
 *
 * @name EventEmitter#emit
 * @method
 *
 * @param {String} event - the name of the event.
 *
 * @return {void}
 */
