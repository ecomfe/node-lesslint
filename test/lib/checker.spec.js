/**
 * @file lib/checker.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var checker = require('../../lib/checker');
var filePath = path.join(__dirname, '../fixture/test.less');

describe('checkString', function () {
    var fileContent = fs.readFileSync(
        filePath,
        'utf8'
    ).replace(/\r\n?/g, '\n');

    it('should return right length', function () {
        var thenFunc = function (invalidList) {
            var invalidListLen = invalidList[0].messages.length;
            assert.strictEqual(2, invalidListLen);
        };
        checker.checkString(fileContent, filePath).then(thenFunc, thenFunc);
    });
});
