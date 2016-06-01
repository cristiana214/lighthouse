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

const assets = require('../../../src/lib/save-assets');
const assert = require('assert');
const fs = require('fs');

const screenshots = require('../audits/performance/screenshots.json');
const traceContents = require('../audits/performance/progressive-app.json');

/* global describe, it */
describe('save-assets helper', () => {
  it('generates HTML', () => {
    const options = {url: 'https://example.com'};
    const artifacts = {screenshots: [], traceContents: []};
    const output = assets.prepareAssets(options, artifacts);
    assert.ok(/<!doctype/gim.test(output.html));
  });

  describe('saves files to disk with real filenames', function() {
    const options = {
      url: 'https://example.com/',
      date: new Date(1464737670547),
      flags: {
        saveAssets: true
      }
    };
    const artifacts = {
      traceContents,
      screenshots
    };

    assets.saveAssets(options, artifacts);

    it('trace file saved to disk with data', () => {
      const traceFilename = `example.com_${options.date.toISOString()}.trace.json`
        .replace(/[\/\?<>\\:\*\|":]/g, '-');
      const traceFileContents = fs.readFileSync(traceFilename, 'utf8');
      assert.equal(traceFileContents.length, 3754841);
      fs.unlinkSync(traceFilename);
    });

    it('screenshots file saved to disk with data', () => {
      const ssFilename = `example.com_${options.date.toISOString()}.screenshots.html`
        .replace(/[\/\?<>\\:\*\|":]/g, '-');
      const ssFileContents = fs.readFileSync(ssFilename, 'utf8');
      assert.ok(/<!doctype/gim.test(ssFileContents));
      assert.ok(ssFileContents.includes('{"timestamp":674089419.919'));
      fs.unlinkSync(ssFilename);
    });
  });
});
