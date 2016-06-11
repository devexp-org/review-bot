import parse from 'path-parse';
import bemNaming from 'bem-naming';
import { template, uniq } from 'lodash';

export default class TestFileResolver {

  constructor(pattern) {
    this.pattern = pattern;

    this.PUB_RE = /\.(js|test\.js)$/;
    this.PRIV_RE = /\.priv\.js$|\.test-priv\.js$/;
    this.VISUAL_RE = /gemini|(\.bemhtml|\.bemhtml\.js|\.bh\.js|\.css|\.styl)$/;
    this.OTHER_RE = /(deps|priv|bemhtml|bemdecl|bh|ru|en|uk|kk|tr|be|id|tt)\.js/;
  }

  isPriv(filepath) {
    return this.PRIV_RE.test(filepath);
  }

  getPriv(filepath) {
    return [filepath.replace(this.PRIV_RE, '.test-priv.js')];
  }

  isClient(filepath) {
    return this.PUB_RE.test(filepath) && !this.OTHER_RE.test(filepath);
  }

  getClient(filepath) {
    return [filepath.replace(this.PUB_RE, '.test.js')];
  }

  isGemini(filepath) {
    return this.VISUAL_RE.test(filepath);
  }

  isDesktop(filepath) {
    return (/desktop|deskpad|common/).test(filepath);
  }

  isTouchPhone(filepath) {
    return (/touch-phone|touch\/|common/).test(filepath);
  }

  isTouchPad(filepath) {
    return (/touch-pad|touch\/|deskpad|common/).test(filepath);
  }

  getPlatforms(filepath) {
    const platforms = [];

    if (this.isDesktop(filepath)) {
      platforms.push('desktop');
    }

    if (this.isTouchPad(filepath)) {
      platforms.push('touch-pad');
    }

    if (this.isTouchPhone(filepath)) {
      platforms.push('touch-phone');
    }

    return platforms;
  }

  renderGeminiPath(params) {
    return template(this.pattern)(params);
  }

  getParams(filepath) {
    const params = {};

    params.block = bemNaming.parse(params.filename).block;
    params.filename = parse(filepath).name.replace(/\..+/, '');
    params.platforms = this.getPlatforms(filepath);

    return params;
  }

  getGemini(filepath) {
    if (/gemini/.test(filepath)) {
      return filepath;
    }

    const params = this.getParams(filepath);

    return uniq(params.platforms.map(platform => {
      params.platform = platform;

      return this.renderGeminiPath(params);
    }, this));
  }

}
