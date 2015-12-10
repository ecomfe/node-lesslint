/**
 * @file lib/rule 的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var checker = require('../../lib/checker');
var ruleDir = path.join(__dirname, '../../lib/rule');

var rule = {};
fs.readdirSync(ruleDir).forEach(
    function (file) {
        if (file.match(/.+\.js/g) !== null) {
            var name = file.replace('.js', '');
            rule[name] = require(ruleDir + path.sep + file);
        }
    }
);

describe('block-indent: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/block-indent.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/block-indent.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(15).toEqual(errors[0].messages.length);
                done();
            }
        );
    });

    it('2. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/block-indent1.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/block-indent1.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(26).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('hex-color: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/hex-color.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/hex-color.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(5).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
    it('2. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/hex-color1.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/hex-color1.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(2).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('import: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/import.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/import.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(1).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('leading-zero: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/leading-zero.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/leading-zero.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(5).toEqual(errors[0].messages.length);
                done();
            }
        );
    });

    it('2. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/leading-zero1.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/leading-zero1.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(6).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('operate-unit: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/operate-unit.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/operate-unit.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(1).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
    it('2. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/operator.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/operator.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(2).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('require-after-space: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/require-after-space.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/require-after-space.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(7).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('require-around-space: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/require-around-space.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/require-around-space.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(5).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('require-before-space: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/require-before-space.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/require-before-space.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(6).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('require-newline: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/require-newline.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/require-newline.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(2).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('shorthand: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/shorthand.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/shorthand.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(4).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('single-comment: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/single-comment.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/single-comment.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(9).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('variable-name: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/variable.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/variable.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(7).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});

describe('zero-unit: ', function () {
    it('1. should return right message length', function (done) {
        var filePath = path.join(__dirname, '../fixture/zero-unit.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/zero-unit.less'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        var f = {
            path: filePath,
            content: fileContent
        };

        var errors = [];
        checker.check(
            f,
            errors,
            function () {
                expect(16).toEqual(errors[0].messages.length);
                done();
            }
        );
    });
});
