export default function setup(options, imports) {

  /**
   * Extend pull_request model to add extra body content field.
   *
   * @param {Object} schema - mongoose schema.
   */
  return function plugin(schema) {
    schema.add({ section: Object });
  };

}
