import _, { filter, forEach, isEmpty } from 'lodash';

function findResponsible(members, component, list) {

  let responsible = filter(list, (login) => _.find(members, { login }));

  if (!isEmpty(responsible)) {
    responsible = _.find(members, { login: _.first(_.sample(responsible, 1)) });
    responsible.responsible = true;

    responsible.components = responsible.components || [];
    responsible.components.push(component);

    return true;
  }

  return false;
}

function processResponsible(review, components) {
  forEach(components, (component) => {
    if (findResponsible(review.members, component.name, component.responsibles)) {
      return;
    }

    findResponsible(review.members, component.name, component.experts);
  });

  return review;
}

export default function setup(options, imports) {
  const componentsAPI = imports['components-api'];

  /**
   * Choose reviewer by responsible.
   *
   * @param {Review} review
   * @param {Object} payload
   *
   * @return {Promise}
   */
  function responsible(review, payload) {
    const files = _.map(review.pullRequest.files, 'filename');

    return componentsAPI
      .getResponsibles(null, { files }, 3600 * 24)
      .then(components => processResponsible(review, components));
  }

  return responsible;
}
