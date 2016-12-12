import * as complexity from './index';

export const MAX_COMPLEXITY = 40;

export default function setup(options, imports) {

  return function plugin(schema) {

    schema.add({
      complexity: {
        type: Number,
        'default': 0
      }
    });

    schema.pre('save', function (next) {
      let value = 0;

      value += complexity.additionsComplexity(this.additions);
      value += complexity.deletionsComplexity(this.deletions);
      value += complexity.commitsComplexity(this.commits);

      this.complexity = (value * 100) / MAX_COMPLEXITY;

      next();
    });

  };

}
