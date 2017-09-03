'use strict';

/**
 * @module query
 * @name query
 * @description hash query utilities
 * @author lally elias<lallyelias87@gmail.com>
 * @singleton
 * @public
 * @since 0.1.0
 * @version 0.1.0
 */


//global dependencies
const _ = require('lodash');


//NOTE!: all hash has implicit _id field as an id field


/**
 * @function
 * @name select
 * @param  {Array|String} fields field to select from redis hash
 * @example
 * 	['name', 'age', 'company.name'] or
 * 	'name, age, company.name' or
 * 	'name,age,company.name'
 * @return {Array} unique fields to be selected from hash
 * @since  0.2.0
 * @version 0.1.0
 * @public
 */
exports.select = exports.fields = function (fields) {

  //ensure fields
  fields = _.compact(['_id'].concat(fields));

  //clean fields
  fields = _.chain(fields)
    .map(function (field) {
      //split comma separated strings
      return _.split(field, ',');
    })
    .flattenDeep() //flat all fields into array
    .map(function (field) {
      //trim fields
      return _.trim(field);
    })
    .compact().uniq().value(); //ensure unique fields

  return fields;

};