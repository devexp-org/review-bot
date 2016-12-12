import TestFileResolver from './class';

export default class FijiResolver extends TestFileResolver {

  getProject(filepath) {
    if ((/images/).test(filepath)) {
      return 'images';
    } else if ((/video/).test(filepath)) {
      return 'video';
    }

    return 'sakhalin';
  }

  getParams(filepath) {
    const params = super.getParams(filepath);

    params.project = this.getProject(filepath);

    return params;
  }
}
