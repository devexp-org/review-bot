export default function setup(options, imports) {

  return {

    /**
     * Extend pull_request model to add extra body content field.
     *
     * @return {Object}
     */
    extender() {
      return {
        section: {}
      };
    }

  };

}
