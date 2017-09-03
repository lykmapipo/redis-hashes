'use strict';


//global dependencies
const path = require('path');
const _ = require('lodash');


//local dependencies
const hash = require(path.join(__dirname, 'src', 'hash'));


exports = module.exports = function (options) {

  //merge options
  hash.defaults = _.merge({}, hash.defaults, options);

  //export
  return hash;

};