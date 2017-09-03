'use strict';

process.env.NODE_ENV = 'test';

//global dependencies
const redis = require('redis-clients')();

before(function (done) {
  redis.clear(done);
});


before(function () {
  redis.reset();
});


after(function (done) {
  redis.clear(done);
});


after(function () {
  redis.reset();
});