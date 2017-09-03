redis-hash
===============

[![Build Status](https://travis-ci.org/paywell/redis-hash.svg?branch=master)](https://travis-ci.org/paywell/redis-hash)
[![Dependency Status](https://img.shields.io/david/paywell/redis-hash.svg?style=flat)](https://david-dm.org/paywell/redis-hash)
[![npm version](https://badge.fury.io/js/redis-hash.svg)](https://badge.fury.io/js/redis-hash)

redis hash utilities for nodejs

## Requirements
- [Redis 2.8.0+](http://redis.io/)
- [NodeJS 8.1.4+](https://nodejs.org/en/)

## Installation
```sh
$ npm install --save redis-hash
```

## Usage

```javascript
//initialize redis-hash with default options
const redis = require('redis-hash')([options]);

//save
const user = ...;
hash.save(user, {collection: 'users' }, done);

//get single user
hash.get(<id>, function(error, user){
   ...
});

//get multiple users
hash.get([<id>, <id>], function(error, users){
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

...

```

## Options
- `prefix:String` - redis key prefix. default to `r`
- `separator:String` - redis key separator. default to `:`
- `redis:Object` - [redis](https://github.com/NodeRedis/node_redis#rediscreateclient) connections options.

To initialize `redis` with custom options use

```js
const redis = require('redis-hash')({
    prefix:'q',
    separator:'-',
    redis: {
    port: 6379,
    host: '127.0.0.1'
  }
});

...

```

## API
Store object into redis [hash datatype](http://redis.io/commands/HSET). Before saving the whole of object is [flatten'ed](https://github.com/hughsk/flat) and serialized. i.e all `dates` will be converted to `timestamps` etc. 

#### `save(object:Object,[options:Object],done:Fuction)`
Save given object as a [flat](https://github.com/hughsk/flat) redis hash.

Options:
- `index:Boolean` - whether to [index](https://github.com/tj/reds) the object or not for search. default to `true`.
- `collection:String` - name of collection or namespace used in prefix hash keys. default to `hash`
- `ignore: Array[String]` - Collection of `object fields` to ignore when indexing 

```js
const object = ...;
hash.save(object, function (error, _object) {
    ...
});

const user = ...;
hash.save(user, {collection: 'users' }, function (error, _object) {
    ...
});
```

#### `get(...keys,done:Function)`
Get single or multiple saved object using their keys

```js
//get single
hash.get(<id>, function(error, object){
   ...
});

//get multiple object
hash.get([<id>, <id>], function(error, objects){
   ...
});

//get multiple object
hash.get(<id>, <id>, function(error, objects){
   ...
});
```

#### `search(options:String|Object,done:Function)`
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

//search specific collection
hash.search({
    q: objectx.username,
    collection: 'users',
    type:'or'
  }, function (error, objects) {
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