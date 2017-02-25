export default function setup(options, imports) {

  return function plugin(schema) {

    schema.add({
      staffGroupId: { type: Number }
    });

  };

}
