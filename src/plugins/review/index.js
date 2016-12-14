import Review from './class';

export default function setup(options, imports) {
  imports.logger = imports.logger.getLogger('review');

  return new Review(options, imports);
}
