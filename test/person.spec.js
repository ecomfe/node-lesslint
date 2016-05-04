'use strict';

let chai = require('chai');
let path = require('path');

chai.should();

let Person = require(path.join(__dirname, '../src', 'Person'));

describe('Person', () => {
    let person;

    beforeEach(() => {
        person = new Person('yato', 11);
    });

    describe('#name', () => {
        it('returns the name', () => {
              person.name.should.equal('yato');
        });

        it('name can be changed', () => {
            person.name = 'yato1';
            person.name.should.equal('yato1');
        });
    });

    describe('#age', () => {
        it('returns the age', () => {
            person.age.should.equal(11);
        });

        it('age can be changed', () => {
            person.age = 33;
            person.age.should.equal(33);
        });
    });
});