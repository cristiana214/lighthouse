/**
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

/* eslint-env mocha */

const fs = require('fs');
const assert = require('assert');
const TraceProcessor = require('../../../../src/lib/traces/tracing-processor');
const traceProcessor = new TraceProcessor();

function readTrace(filename, cb) {
  return fs.readFile('./test/fixtures/traces/' + filename, 'utf8', cb);
}

describe('Trace Processor', function() {
  it('throws if no processes are found', function() {
    return assert.throws(_ => traceProcessor.analyzeTrace(null),
        'Zero processes (tabs) found.');
  });

  it('throws if given invalid input data is given', function() {
    return assert.throws(_ => traceProcessor.analyzeTrace('wobble'),
        'Invalid trace contents; not JSON');
  });

  it('throws if given a trace with extensions and strict mode is enabled',
    function(done) {
      readTrace('load-extensions.json',

        function(err, data) {
          if (err) {
            throw err;
          }

          var error = 'Extensions running during capture; ' +
              'see http://bit.ly/bigrig-extensions';

          assert.throws(_ => {
            traceProcessor.analyzeTrace(data, {
              strict: true
            });
          }, error);

          done();
        });
    });

  // TODO(paullewis) Add multiprocess test.

  it('returns JSON for a file with a single process', function(done) {
    readTrace('load.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);

        assert.ok(Array.isArray(jsonData));
        assert.equal(typeof jsonData[0], 'object');
        done();
      });
  });

  it('generates valid JSON', function(done) {
    readTrace('load.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);
        jsonData = JSON.parse(JSON.stringify(jsonData));

        assert.ok(Array.isArray(jsonData));
        done();
      });
  });

  it('supports timed ranges', function(done) {
    readTrace('animation.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);

        assert.ok(typeof jsonData[0], 'object');
        assert.equal(jsonData[0].title, 'sideNavAnimation');
        assert.ok(jsonData[0].start > 0);
        assert.ok(jsonData[0].end > 1179);
        assert.ok(jsonData[0].end < 1180);
        done();
      });
  });

  it('correctly applies RAIL type when time range is specified',

    function(done) {
      readTrace('animation.json',
        function(err, data) {
          if (err) {
            throw err;
          }

          var jsonData = traceProcessor.analyzeTrace(data, {
            types: {
              sideNavAnimation: traceProcessor.ANIMATION
            }
          });

          assert.equal(jsonData[0].type, traceProcessor.ANIMATION);
          done();
        });
    });

  it('correctly infers RAIL Load when time range not specified',
    function(done) {
      readTrace('load.json',
        function(err, data) {
          if (err) {
            throw err;
          }

          var jsonData = traceProcessor.analyzeTrace(data);
          assert.equal(jsonData[0].type, traceProcessor.LOAD);
          assert.equal(jsonData[0].title, 'Load');
          done();
        });
    });

  it('correctly infers RAIL Response when time range not specified',
    function(done) {
      readTrace('response.json',
        function(err, data) {
          if (err) {
            throw err;
          }

          var jsonData = traceProcessor.analyzeTrace(data);
          assert.equal(jsonData[0].type, traceProcessor.RESPONSE);
          assert.equal(jsonData[0].title, 'sideNavResponse');
          done();
        });
    });

  it('correctly infers RAIL Animation when time range not specified',
    function(done) {
      readTrace('animation.json',
        function(err, data) {
          if (err) {
            throw err;
          }

          var jsonData = traceProcessor.analyzeTrace(data);
          assert(jsonData[0].type, traceProcessor.ANIMATION);
          assert(jsonData[0].title, 'sideNavAnimation');
          done();
        });
    });

  it('correctly infers multiple RAIL regions', function(done) {
    readTrace('response-animation.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);

        assert.equal(jsonData.length, 2);

        assert.equal(jsonData[0].type, traceProcessor.RESPONSE);
        assert.equal(jsonData[0].title, 'sideNavResponse');

        assert.equal(jsonData[1].type, traceProcessor.ANIMATION);
        assert.equal(jsonData[1].title, 'sideNavAnimation');

        done();
      });
  });

  it('returns the correct fps for animations', function(done) {
    readTrace('animation.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);
        assert.ok(jsonData[0].fps > 59);
        assert.ok(jsonData[0].fps < 61);
        done();
      });
  });

  it('returns the correct JS breakdown', function(done) {
    readTrace('load.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);
        assert.ok(jsonData[0].extendedInfo.javaScript['localhost:11080'] > 245);
        assert.ok(jsonData[0].extendedInfo.javaScript['localhost:11080'] < 246);
        assert.ok(jsonData[0].extendedInfo.javaScript['www.google-analytics.com'] > 59);
        assert.ok(jsonData[0].extendedInfo.javaScript['www.google-analytics.com'] < 60);
        done();
      });
  });

  it('correctly captures forced layouts and recalcs', function(done) {
    readTrace('forced-recalc-layout.json',
      function(err, data) {
        if (err) {
          throw err;
        }

        var jsonData = traceProcessor.analyzeTrace(data);
        assert.equal(jsonData[0].extendedInfo.forcedRecalcs, 1);
        assert.equal(jsonData[0].extendedInfo.forcedLayouts, 1);
        done();
      });
  });
});
