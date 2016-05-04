class Person {
    // constructor
    constructor(name, age) {
      this.name = name;
      this.age = age;
    }

    get age() {
      return this._age;
    }

    set age(value) {
        if (typeof value !== 'number') {
            throw new Error('"age" must be a number.');
        }

        this._age = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (typeof value !== 'string') {
            throw new Error('"name" must be a string.');
        }

        this._name = value;
    }
}

module.exports = Person;