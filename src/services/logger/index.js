/* @flow */

import intel from 'intel';

type writeMessage = (message: string, ...x: Array<string>) => void

type Logger = {
  log: writeMessage,
  info: writeMessage,
  warn: writeMessage,
  error: writeMessage,
  getLogger: (logger: string) => Logger
}

export default function setup(options: Object): Logger {

  intel.config(options);

  return intel;

}
