import Queue from '../../modules/queue';

export default function queue(options, imports) {
  const service = new Queue();

  return service;
}
