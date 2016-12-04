export default function setup(options, imports) {

  /**
   * Extend pull_request model to add extra body content field.
   *
   * @param {Object} schema - mongoose schema.
   */
  return function (schema) {
    schema.add({ section: {} });
  };

}
