export default function setup(options, imports) {
  const projectConfig = imports['project-config'];

  return (review) => projectConfig.process(review.pullRequest);
}
