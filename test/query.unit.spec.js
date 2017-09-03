'use strict';


//global dependencies
const path = require('path');
const expect = require('chai').expect;
const query = require(path.join(__dirname, '..', 'src', 'query'));


describe('query', function () {

  describe('select', function () {

    it('should be able to parse fields to select', function () {
      expect(query.select(['a', 'b'])).to.be.eql(['_id', 'a', 'b']);
      expect(query.select('a,b')).to.be.eql(['_id', 'a', 'b']);
      expect(query.select('a, b')).to.be.eql(['_id', 'a', 'b']);
      expect(query.select('a, b ')).to.be.eql(['_id', 'a', 'b']);
      expect(query.select(' a, b ')).to.be.eql(['_id', 'a', 'b']);
      expect(query.select(' a , b ')).to.be.eql(['_id', 'a', 'b']);

      expect(query.fields(['a', 'b'])).to.be.eql(['_id', 'a', 'b']);
      expect(query.fields('a,b')).to.be.eql(['_id', 'a', 'b']);
      expect(query.fields('a, b')).to.be.eql(['_id', 'a', 'b']);
      expect(query.fields('a, b ')).to.be.eql(['_id', 'a', 'b']);
      expect(query.fields(' a, b ')).to.be.eql(['_id', 'a', 'b']);
      expect(query.fields(' a , b ')).to.be.eql(['_id', 'a', 'b']);
    });

  });

});