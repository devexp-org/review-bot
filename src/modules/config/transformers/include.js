import _ from 'lodash';
import path from 'path';
import { requireIfExists } from '../';

export default function transformer(basePath) {

  return function include(json) {

    return (function visit(context) {

      if (_.isPlainObject(context)) {
        const addons = [];
        const newObj = _(context)
          .mapValues((v, k) => {
            if (k.substr(0, 9) === '#include:') {
              const includePath = path.join(basePath, v);
              const includeContent = requireIfExists(includePath);

              addons.push(visit(includeContent));

              return null;
            }

            return visit(v);
          })
          .omitBy(_.isNull)
          .value();

        return _.merge.apply(_, [newObj].concat(addons));
      }

      return context;

    }(json));

  };

}
