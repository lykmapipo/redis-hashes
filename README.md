redis-hashes
===============

[![Build Status](https://travis-ci.org/lykmapipo/redis-hashes.svg?branch=master)](https://travis-ci.org/lykmapipo/redis-hashes)
[![Dependency Status](https://img.shields.io/david/lykmapipo/redis-hashes.svg?style=flat)](https://david-dm.org/lykmapipo/redis-hashes)
[![npm version](https://badge.fury.io/js/redis-hashes.svg)](https://badge.fury.io/js/redis-hashes)

redis hash utilities for nodejs

*Note!: From v0.5+ all indexes keys will be using format <prefix>:indexes:<collection>:...*

## Requirements
- [Redis 2.8.0+](http://redis.io/)
- [NodeJS 8.1.4+](https://nodejs.org/en/)

## Installation
```sh
$ npm install --save redis-hashes
```

## Usage

```javascript
//initialize redis-hashes with default options
const redis = require('redis-hashes')([options]);

//save single user
const user = ...;
hash.save(user, {collection: 'users' }, done);

//save multiple users
const users = ...;
hash.save(users, {collection: 'users' }, done);


//get single user
hash.get(<id>, function(error, user){
   ...
});

//get single user and select specified fields
hash.get(<id>, { fields: 'name, email'}, function(error, user){
   ...
});


//get multiple users
hash.get(<id>, <id>, function(error, users){
   ...
});

//search users collection
hash.search(<search_query>, function (error, users) {
    ...
});


//count number of users
hash.count('users', function(error, counters){
  ...
});


//count number of users and orders
hash.count('users', 'orders', function(error, counters){
  ...
});


//remove single users
hash.remove(<id>, function(error, results){
   ...
});


//remove multiple users
hash.remove(<id>, <id>, function(error, results){
   ...
});

...

```

## Options
- `prefix:String` - redis key prefix. default to `r`
- `separator:String` - redis key separator. default to `:`
- `redis:Object|String` - [redis](https://github.com/NodeRedis/node_redis#rediscreateclient) connections options or string.

To initialize `redis` with custom options use

```js
const redis = require('redis-hashes')({
    prefix:'q',
    separator:'-',
    redis: {
    port: 6379,
    host: '127.0.0.1'
  }
});

...

or

const redis = require('redis-clients')({
    prefix:'q',
    separator:'-',
    redis: 'redis://localhost:6379'
});


```

## API

### `save(objects:Object|Object[],[options:Object],done:Fuction)`
Store`(create or update)` object(s) into redis [hash datatype](http://redis.io/commands/HSET). Before saving the whole of object is [flatten'ed](https://github.com/hughsk/flat) and serialized. i.e all `dates` will be converted to `timestamps` etc.


Options:
- `index:Boolean` - whether to [index](https://github.com/tj/reds) the object or not for search. default to `true`.
- `collection:String` - name of collection or namespace used in prefix hash keys. default to `hash`
- `ignore: Array[String]` - Collection of `object fields` to ignore when indexing 

```js
const object = ...;
hash.save(object, function (error, saved) {
    ...
});

const user = ...;
hash.save(user, {collection: 'users' }, function (error, saved) {
    ...
});

//or bulk save
const objects = ...;
hash.save(objects, function (error, objects) {
    ...
});

const users = ...;
hash.save(users, {collection: 'users' }, function (error, users) {
    ...
});
```

### `get(...keys,[{ fields: String|String[] }],done:Function)`
Get single or multiple saved object using their keys

```js
//get single
hash.get(<id>, function(error, object){
   ...
});

//get single
hash.get(<id>, { fields: 'name, email'}, function(error, object){
   ...
});

//get multiple object
hash.get([<id>, <id>], function(error, objects){
   ...
});

//get multiple object
hash.get([<id>, <id>], { fields: 'name, email'},  function(error, objects){
   ...
});

//get multiple object
hash.get(<id>, <id>, function(error, objects){
   ...
});

//get multiple object
hash.get(<id>, <id>, { fields: 'name, email'}, function(error, objects){
   ...
});
```

### `search(options:String|Object,[{ fields: String|String[]}],done:Function)`
Search existing objects.

Options:
- `type:String` - type of [reds](https://github.com/tj/reds) search. default to `or`
- `collection:String` - name of collection used in searching. default to `hash`
- `q: String` - query string. default to ''

```js
//search default collection
hash.search(<search_query>, function (error, objects) {
    ...
});

//search default collection and select specified fields
hash
  .search({q:<search_query>, fields: 'name, email'}, function (error, objects) {
    ...
});

//search specific collection
hash.search({
    q: <search_query>,
    collection: 'users',
    type:'or'
  }, function (error, objects) {
    ...
});

//search specific collection and select specified fields
hash.search({
    q: <search_query>,
    collection: 'users',
    type:'or',
    fields: 'name, email'
  }, function (error, objects) {
    ...
});
```

### `remove(...keys,done:Function)`
Remove single or multiple saved object using their keys

```js
//remove single
hash.remove(<id>, function(error, object){
   ...
});

//remove multiple object
hash.remove([<id>, <id>], function(error, objects){
   ...
});


//remove multiple object
hash.remove(<id>, <id>, function(error, objects){
   ...
});
```

### `count(...collections, done:Function)`
Count number of saved object(s) on specified collection(s)

```js
//count in single collection
hash.count('users', function(error, counters){
   ...
});

//count in multiple collections
hash.count('users', 'orders', 'contacts', function(error, counters){
   ...
});

```

## References
- [store-javascript-objects-in-redis-with-node-js-the-right-way](https://medium.com/@stockholmux/store-javascript-objects-in-redis-with-node-js-the-right-way-1e2e89dbbf64#.eb1040111)
- [reds-internals-searching-and-better-searching-with-node-js-and-redis](https://medium.com/@stockholmux/reds-internals-searching-and-better-searching-with-node-js-and-redis-57da99077e83#.5nhdaxnl4)


## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```

* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence

The MIT License (MIT)

Copyright (c) 2017 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 