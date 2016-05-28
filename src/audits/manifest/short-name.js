/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Audit = require('../audit');
const _get = require('lodash.get');

class ManifestShortName extends Audit {
  /**
   * @override
   */
  static get category() {
    return 'Manifest';
  }

  /**
   * @override
   */
  static get name() {
    return 'manifest-short-name';
  }

  /**
   * @override
   */
  static get description() {
    return 'Manifest contains short_name';
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    let hasShortName = false;
    const manifest = artifacts.manifest.value;

    if (manifest) {
      const manifestShortName = _get(manifest, 'short_name.value');
      const manifestName = _get(manifest, 'name.value');
      hasShortName = !!(manifestShortName || manifestName);
    }

    return ManifestShortName.generateAuditResult({
      value: hasShortName
    });
  }
}

module.exports = ManifestShortName;
