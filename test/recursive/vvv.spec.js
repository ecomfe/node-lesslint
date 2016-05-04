let chai = require('chai');
var path = require('path');

// Tell chai that we'll be using the "should" style assertions.
chai.should();

// The fat arrow (=>) syntax is a new way to define
// functions in ES6. One feature that is different
// from the usual "function" keyword is that the scope
// is inherited from the parent, so there is no need to write
//
//   function() {
//     ...
//   }.bind(this)
//
// anymore. In this case we are not using "this" so the new
// syntax is just used for brevity.
describe('vvv', () => {
    describe('111', () => {
        let obj = {
            aaa: 1
        };

        it('-----', () => {
            obj.aaa.should.equal(1);
        });
    });
});