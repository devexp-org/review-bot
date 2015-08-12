'use strict';

import { Schema } from 'mongoose';

/**
 * Extend pull_request model to add extra body content field.
 *
 * @return {Object}
 */
export function extender() {

  return {
    section: Schema.Types.Mixed
  };

}
