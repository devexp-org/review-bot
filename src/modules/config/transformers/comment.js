import _ from 'lodash';

export default function transformer() {

  return function comment(json) {

    return (function visit(context) {

      if (_.isArray(context)) {
        return context
          .filter(key => !_.isString(key) || key.substr(0, 9) !== '#comment:')
          .map(visit);
      }

      if (_.isPlainObject(context)) {
        return _(context)
          .mapValues((v, k) => {
            if (k.substr(0, 9) === '#comment:') {
              return null;
            }

            return visit(v);
          })
          .omitBy(_.isNull)
          .value();
      }

      return context;
    }(json));

  };

}
