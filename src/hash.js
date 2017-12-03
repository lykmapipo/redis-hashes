'use strict';


/**
 * @module redis-hash
 * @name redis-hash
 * @description redis hash utilities
 * @author lally elias<lallyelias87@gmail.com>
 * @singleton
 * @public
 * @version 0.4.1
 * @see  {@link https://github.com/lykmapipo/redis-hash}
 */


//global dependencies
const path = require('path');
const _ = require('lodash');
const async = require('async');
const traverse = require('traverse');
const uuid = require('uuid');
const reds = require('reds');
const flat = require('flat').flatten;
const unflat = require('flat').unflatten;
let redis = require('redis-clients');


//local dependencies
const query = require(path.join(__dirname, 'query'));


//initialize defaults settings
const defaults = {
  prefix: 'r',
  separator: ':',
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
};


//default fields to be ignored from search indexes
const ignore = ['_id', 'createdAt', 'updatedAt'];


/**
 * @name defaults
 * @description default redis client connection options
 * @type {Object}
 * @since 0.1.0
 * @public
 */
exports.defaults = _.merge({}, defaults);


/**
 * @function
 * @name serialize
 * @description traverse js object and try convert values to appropriate redis
 *              redis storage type
 *              e.g dates will be converted to timestamp
 * @param  {Object} object valid js plain object
 * @return {Object}        object with all nodes converted to their respective
 *                         possible redis storage types
 *
 * @since 0.1.0
 * @private
 */
exports.serialize = function (object) {

  //ensure object
  object = _.merge({}, object);

  //TODO allow custom serializers

  //traverse object and apply serializers
  traverse(object).forEach(function (value) {

    //parse convert dates to timestamps
    const isDate = _.isDate(value);
    if (isDate) {
      value = value.getTime();
      //update current field
      this.update(value);
    }

  });

  return object;
};


/**
 * @function
 * @name deserialize
 * @description traverse js object and try convert values to their respective
 *              js type i.e numbers etc
 * @param  {Object} object valid js plain object
 * @return {Object}        object with all nodes converted to their respective
 *                                js types
 *
 * @since 0.1.0
 * @private
 */
exports.deserialize = function (object) {

  //ensure object
  object = _.merge({}, object);

  //TODO allow custom deserializer

  //traverse object and apply parser
  traverse(object).forEach(function (value) {

    //parse number strings to js numbers
    const isNumber = !isNaN(value);
    if (isNumber) {
      value = Number(value);
      //update current field
      this.update(value);
    }

  });

  return object;
};


/**
 * @object
 * @name reds
 * @description redis search utility
 * @since 0.1.0
 * @public
 */
exports.reds = reds;


/**
 * @object
 * @name indexes
 * @description map of all collection search indexes
 * @since 0.1.0
 * @private
 */
exports.indexes = {};


/**
 * @function
 * @name client
 * @description obtain current active redis client
 * @return {Object} redis client
 * @since 0.1.0
 * @private
 */
exports.client = function () {

  //initialize redis clients internal
  if (_.isFunction(redis)) {
    redis = redis(exports.defaults);
  }

  //obtain current redis client
  const _client = redis.client();

  //set reds client
  if (!reds.client) {
    reds.client = _client;
  }

  return _client;
};


/**
 * @function
 * @name key
 * @description prepare storage key
 * @return {Object} redis client
 * @since 0.1.0
 * @private
 */
exports.key = function (...args) {
  const _key = redis.key([].concat(...args));
  return _key;
};


/**
 * @function
 * @name multi
 * @description create new instance of redis multi object
 * @return {Object} redis client
 * @since 0.1.0
 * @private
 */
exports.multi = function () {
  const client = exports.client();
  const multi = client.multi();
  return multi;
};


/**
 * @function
 * @name indexKey
 * @description prepare collection index key
 * @param  {String} collection valid name of the collection
 * @since 0.1.0
 * @public
 */
exports.indexKey = function (collection) {
  collection = [].concat(collection).concat(['search']);
  const indexKey = exports.key(collection);
  return indexKey;
};


/**
 * @function
 * @name save
 * @description store object into redis as hash
 * @param  {Object|Object[]}   objects objects to be stored
 * @param  {Object}   [options] options to be used on storage
 * @param  {Boolean}   [options.index] if index is allowed or not. default true
 * @param  {String[]}   [options.ignore] field to be excluded from search indexes
 * @param  {String}   [options.collection] collection name used in key 
 *                                         namespacing. default hash
 * @param  {Function} done   a callback to invoke on success or failure
 * @return {Object}          created and persisted object with key added
 * @since 0.1.0
 * @version 0.2.0
 * @public
 */
exports.save = exports.create = function (objects, options, done) {
  //TODO create and index operations atomically
  //TODO fork reds and allow to pass multi on its operations
  //TODO refactor

  //normalize arguments
  if (_.isFunction(options)) {
    done = options;
    options = {};
  }

  //merge with default options
  options = _.merge({}, {
    index: true,
    collection: 'hash',
    ignore: ignore
  }, options);

  //ensure _id is ignored on indexing
  options.ignore = _.uniq(ignore.concat(options.ignore));

  //collect for multi create
  objects = [].concat(objects);

  //ensure they are objects
  objects = _.map(objects, function (object) { return _.merge({}, object); });

  //start multi save
  const _client = exports.multi();

  //iterate & map
  objects = _.map(objects, function (object) {

    //ensure js types
    object = exports.deserialize(object);

    //TODO validate key to ensure it start with required prefix

    //ensure timestamps
    if (object._id) {
      //update timestamps
      object.createdAt = object.createdAt || Date.now();
      object.updatedAt = Date.now();
    } else {
      //set timestamps
      object.createdAt = object.updatedAt = Date.now();
    }

    //obtain key from the object to be saved
    //or generate one
    object._id = object._id || exports.key([options.collection, uuid.v1()]);

    //flat the object
    let flatObject = flat(object);

    //serialize flattened object
    flatObject = exports.serialize(flatObject);

    //ensure index
    if (options.index) {
      //prepare collection search index
      const indexKey = exports.indexKey(options.collection);
      exports.indexes[indexKey] =
        exports.indexes[indexKey] || exports.reds.createSearch(indexKey);


      //index flat object
      _.forEach(flatObject, function (value, key) {
        //ignore object key and ignored fields from indexes
        key = _.last(key.split('.')); //obtain actual field name after flatting the object
        if (!_.has(options.ignore, key)) {
          //ensure indexes
          value = String(value);
          exports.indexes[indexKey].index(value, flatObject._id);
        }
      });
    }

    //queue save
    _client.hmset(flatObject._id, flatObject);

    //collect mapped object
    return object;

  });

  //ensure single or multi objects
  objects = objects.length === 1 ? _.first(objects) : objects;

  //save the objects and flush indexes
  _client.exec(function afterSave(error) {
    done(error, objects);
  });

};


/**
 * @function
 * @name get
 * @description get objects from redis
 * @param  {String|String[]|...String}   keys a single or collection of existing keys
 * @param  {Object} [criteria] optional selection criteria
 * @param  {Array} [criteria.fields] optional fields to select
 * @param  {Function} done   a callback to invoke on success or failure
 * @return {Object|[Object]} single or collection of existing hash
 * @since 0.1.0
 * @public
 */
exports.get = function (...keys) {

  //TODO refactor to query?

  //normalize keys to array
  keys = [].concat(...keys);

  //TODO ensure they are valid keys

  //compact and ensure unique keys
  keys = _.uniq(_.compact(keys));

  //obtain callback
  const done = _.last(keys);
  //drop callback if provided
  if (_.isFunction(done)) {
    keys = _.initial(keys);
  }

  //obtain selection criteria if specified
  let criteria = _.last(keys);
  criteria = _.isPlainObject(criteria) ? criteria : undefined;
  //drop criteria if provided
  if (criteria) {
    //shape criteria to ensure fields are in array
    criteria.fields = query.fields(criteria.fields);
    keys = _.initial(keys);
  }
  //check if there are fields
  const criteriaHasFields = (criteria && criteria.fields);

  //initiate multi command client
  const _client = exports.multi();

  //prepare multiple hgetall
  _.forEach(keys, function (key) {

    //select specified hash fields
    if (criteriaHasFields) { _client.hmget(key, criteria.fields); }

    //select all hash fields
    else { _client.hgetall(key); }

  });

  //execute batch / multi commands
  _client.exec(function (error, objects) {

    //unflat objects
    if (!error) {

      //unflatten objects
      objects = _.map(objects, function (object) {

        //unflatten object from redis
        object = unflat(object);

        //parse object
        object = exports.deserialize(object);

        //ensure selected fields name
        //NOTE: redis return fields in order as they have requested
        if (criteriaHasFields) {
          _.forEach(object, function (value, key) {
            const fieldName = criteria.fields[key];
            if (fieldName) {
              object[fieldName] = value;
              delete object[key];
            }
          });
        }

        //double unflat the object in case of 
        //specified fields for selections
        return unflat(object);

      });

      //ensure single or multi objects
      objects = keys.length === 1 ? _.first(objects) : objects;

    }

    //ensure objects exists
    if (_.isEmpty(objects)) {
      error = error || new Error();
      error.message = 'Not Found';
      error.status = 404;
      objects = undefined;
    }

    done(error, objects);

  });

};


/**
 * @function
 * @name remove
 * @description remove objects from redis
 * @param  {String|String[]|...String} keys  a single or collection of existing keys
 * @param  {Function} done   a callback to invoke on success or failure
 * @return {Object|[Object]} single or collection of existing hash
 * @since 0.3.0
 * @public
 */
exports.remove = function (...keys) {
  //TODO refactor to query?

  //normalize keys to array
  keys = [].concat(...keys);

  //compact and ensure unique keys
  keys = _.uniq(_.compact(keys));

  //obtain callback
  const done = _.last(keys);
  //drop callback if provided
  if (_.isFunction(done)) {
    keys = _.initial(keys);
  }

  //ensure keys
  if (keys && keys.length > 0) {
    //initiate multi command client
    const _client = exports.multi();

    //delete each keys in transaction
    _client.del(keys);

    //execute deletes in batch
    //TODO shape the returned response
    _client.exec(done);

  }

  //reply with bad request
  //as no keys specified
  else {
    let error = new Error('Missing Keys');
    error.status = 400;
    done(error);
  }

};


/**
 * @function
 * @name search
 * @description search stored objects from redis
 * @param  {Object|String}   options    search options
 * @param  {String}   options.collection    searched collections. default to hash
 * @param  {String}   options.type    search operator(and / or). default to or
 * @param  {String}   options.q    search term. default to ''
 * @param  {String|String[]}   options.fields    fields to select
 * @param  {Function} done   a callback to invoke on success or failure
 * @since 0.1.0
 * @public
 */
exports.search = function (options, done) {
  //normalize options
  if (_.isString(options)) {
    options = {
      q: options
    };
  }

  //merge options
  options = _.merge({}, {
    type: 'or', //default search operator
    collection: 'hash', //default collection or namespace
    q: '' //search term
  }, options);

  //obtain search index
  const indexKey = exports.indexKey(options.collection);
  const search = exports.indexes[indexKey];

  //perform search if search index exists
  //TODO try using multi or lua script
  if (search && !_.isEmpty(options.q)) {
    async.waterfall([
      function find(next) {
        //issue search query using reds
        search.query(options.q).type(options.type).end(next);
      },
      function onSearchEnd(keys, next) {
        if (options.fields) {
          exports.get(keys, { fields: options.fields }, next);
        } else {
          exports.get(keys, next);
        }
      },
      function normalizeResults(results, next) {
        results = [].concat(results);
        next(null, results);
      }
    ], function onFinish(error, results) {
      done(error, results);
    });
  }

  //no search index exists return empty results
  else {
    done(null, []);
  }
};


//TODO pagination
//TODO count
//TODO sorting
//TODO add ability to score base on fields
//TODO add timestamps(createdAt, updatedAt)
//TODO implement remove
//TODO metadata
//TODO support unique secondary indexes
//TODO ensure id's are unique(i.e not exists)
//TODO build metadata if not provided
//TODO benchmarks
//TODO improve test coverage
//TODO notify after create, update, delete