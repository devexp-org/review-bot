import stepsFactory from '../modules/choose-reviewer-steps';

export default function chooseReviewerStepsService(options, imports) {
  imports.team = imports['choose-team'];

  const service = stepsFactory(options, imports);

  return Promise.resolve({ service });
}
