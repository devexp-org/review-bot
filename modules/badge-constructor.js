'use strict';

/* eslint-disable complexity */

import fs from 'fs';
import ejs from 'ejs';
import path from 'path';

export default class BadgeConstructor {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {String} [options.templateName] - svg template for badge.
   * @param {String} [options.templatePath] - path where templates are located.
   */
  constructor(options) {
    this.templateName = options && options.templateName || 'flat';
    this.templatePath = options && options.templatePath || './';
  }

  /**
   * Compile template source and cache it.
   *
   * @private
   */
  compile() {
    const templateFile = path.join(
      this.templatePath,
      this.templateName + '.ejs'
    );

    if (!fs.existsSync(templateFile)) {
      throw new Error('Template `' + templateFile + '` not found');
    }

    const source = fs.readFileSync(templateFile, 'utf-8');
    this.template = ejs.compile(source);
  }

  /**
   * Map color keyword to hex value.
   *
   * @private
   *
   * @param {String} color - keyword or hex value
   *
   * @return {String}
   */
  mapColor(color) {

    switch (color) {
      case 'brightgreen':
        return '#4c1';
      case 'green':
        return '#97ca00';
      case 'yellowgreen':
        return '#a4a61d';
      case 'yellow':
        return '#dfb317';
      case 'orange':
        return '#fe7d37';
      case 'red':
        return '#e05d44';
      case 'lightgrey':
        return '#9f9f9f';
      case 'blue':
        return '#007ec6';
      default:
        if ((/^([a-f0-9]{3}){1,2}$/i).test(color)) {
          return '#' + color.toLowerCase();
        }

        return '#9f9f9f';
    }

  }

  /**
   * Render badge with given subject and status.
   *
   * @param {String} subject - subject text
   * @param {String} status - status text
   * @param {String} color - color, keyword or hex (#fff)
   *
   * @return {String}
   */
  render(subject, status, color) {
    if (!this.template) {
      this.compile();
    }

    const templateData = {
      textA: subject,
      textB: status,
      colorA: '#555',
      colorB: this.mapColor(color),
      widthA: subject.length * 5 + 15,
      widthB: status.length * 5 + 15
    };

    return this.template(templateData);
  }

}
