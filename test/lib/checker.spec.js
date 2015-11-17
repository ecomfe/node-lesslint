/**
 * @file lib/checker.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');

var checker = require('../../lib/checker');

describe('checkString: ', function () {
    it('1. should return right length', function (done) {
        var filePath = 'path/to/file.less';
        var fileContent = '\np {\nheight: 0px\n}\n';

        var p = checker.checkString(fileContent, filePath);
        p.then(function (invalidList) {
            expect(2).toEqual(invalidList[0].messages.length);
            done();
        });
    });

    it('2. should catch error with line', function (done) {
        var filePath = 'path/to/file.css';
        var fileContent = '\np {\nheight: 0px\n\n';

        var p = checker.checkString(fileContent, filePath);
        p.then(function () {

        }, function (invalidList) {
            var messages = invalidList[0].messages;
            expect(2).toEqual(messages[0].line);
            expect('LESS `Parse` Error, missing closing `}`: p {').toEqual(messages[0].message);
            done();
        });
    });
});

describe('check: ', function () {
    it('1. should return right length', function (done) {
        var filePath = path.join(__dirname, '../fixture/test.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/test.less'),
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

    it('2. should return right length with ignore', function (done) {
        var filePath = path.join(__dirname, '../fixture/Tip.less');
        var fileContent = fs.readFileSync(
            path.join(__dirname, '../fixture/Tip.less'),
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
                expect(0).toEqual(errors.length);
                done();
            }
        );
    });
});
