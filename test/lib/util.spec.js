/**
 * @file lib/util.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');

var util = require('../../lib/util');

describe('times: ', function () {
    var count = 1;
    it('should return right count', function () {
        util.times(
            3,
            function () {
                count++;
            }
        );
        expect(4).toEqual(count);
    });
});

describe('formatMsg: ', function () {
    it('should return format message', function () {
        var message = util.formatMsg(
            'This is a message',
            5
        );
        expect('     This is a message').toEqual(message);
    });
});


describe('line, lineContent, location: ', function () {
    var candidateIndex = 10;
    var candidateLineNumber = 1;

    var fileContent = fs.readFileSync(
        path.join(__dirname, '../fixture/test.less'),
        'utf8'
    ).replace(/\r\n?/g, '\n');

    it('should return right linenumber: ', function () {
        var lineNumber = util.getLine(candidateIndex, fileContent);
        expect(candidateLineNumber).toEqual(lineNumber);
    });

    it('should return right linecontent: ', function () {
        var lineContent = util.getLineContent(candidateLineNumber, fileContent);
        expect('@foo: 1px;').toEqual(lineContent);
    });

});

describe('trim: ', function () {
    it('1. should return tirm string', function () {
        var str = '   aaaa   ';
        expect('aaaa').toEqual(util.trim(str));
    });
    it('2. should return tirm string', function () {
        var str = '';
        expect('').toEqual(util.trim(str));
    });
});

describe('escapeRegExp: ', function () {
    it('should return right result', function () {
        var str = '[{"*height:10px"}]';
        expect('\\[\\{"\\*height:10px"\\}\\]').toEqual(util.escapeRegExp(str));
    });
});

describe('uniqueMsg: ', function () {
    it('should return right result', function () {
        var msg = [
            {
                uniqueFlag: '111',
                ruleName: 'hex-color',
                line: 1,
                message: '`@color1: green;` Color value must use the hexadecimal mark forms '
                    + 'such as `#RRGGBB`. Don\'t use RGB、HSL expression',
                colorMessage: '`@color1\u001b[35m: green\u001b[39m;` \u001b[90mColor value must use '
                    + 'the hexadecimal mark forms such as `#RRGGBB`. Don\'t use RGB、HSL expression\u001b[39m'
            },
            {
                uniqueFlag: '111',
                ruleName: 'hex-color',
                line: 2,
                message: '`@color2: rgb(255, 255, 255);` Color value must use the hexadecimal mark forms '
                    + 'such as `#RRGGBB`. Don\'t use RGB、HSL expression',
                colorMessage: '`@color2: \u001b[35mrgb\u001b[39m(255, 255, 255);` \u001b[90mColor value '
                    + 'must use the hexadecimal mark forms such as `#RRGGBB`. Don\'t use RGB、HSL expression\u001b[39m'
            },
            {
                uniqueFlag: '222',
                ruleName: 'hex-color',
                line: 2,
                message: '`@color2: rgb(255, 255, 255);` Color value must use the hexadecimal mark forms '
                    + 'such as `#RRGGBB`. Don\'t use RGB、HSL expression',
                colorMessage: '`@color2: \u001b[35mrgb\u001b[39m(255, 255, 255);` \u001b[90mColor value '
                    + 'must use the hexadecimal mark forms such as `#RRGGBB`. Don\'t use RGB、HSL expression\u001b[39m'
            }
        ];
        expect(2).toEqual(util.uniqueMsg(msg).length);
    });
});

describe('getCandidates: ', function () {
    it('should return right result', function () {
        var patterns = [
            '**/block-indent.less',
            '!**/{output,node_modules,asset,dist,release,doc,dep,report}/**'
        ];

        var candidates = util.getCandidates([], patterns);
        expect(1).toEqual(candidates.length);
        expect('test/fixture/block-indent.less').toEqual(candidates[0]);

        var patterns1 = [
            '**/*.less',
            '!**/{output,node_modules,asset,dist,release,doc,dep,report,*.bak}/**'
        ];
        var candidates1 = util.getCandidates([], patterns1);
        expect(51).toEqual(candidates1.length);

        var patterns2 = [
            '**/no-exist.less'
        ];
        var candidates2 = util.getCandidates([], patterns2);
        expect(0).toEqual(candidates2.length);

        var patterns3 = [
            '**/block-indent1.less'
        ];
        var candidates3 = util.getCandidates(['test/fixture'], patterns3);
        expect(1).toEqual(candidates3.length);
        expect('test/fixture/block-indent1.less').toEqual(candidates3[0]);

        var patterns4 = [
            '**/block-indent1.less'
        ];
        var candidates4 = util.getCandidates(['test/fixture-no-exist'], patterns4);
        expect(0).toEqual(candidates4.length);

        var patterns5 = [
            '**/block-indent1.less'
        ];
        var candidates5 = util.getCandidates(['test/fixture/block-indent1.less'], patterns5);
        expect(1).toEqual(candidates5.length);
        expect('test/fixture/block-indent1.less').toEqual(candidates5[0]);
    });
});


describe('getIgnorePatterns: ', function () {
    it('1. should return right result', function () {
        expect(28).toEqual(util.getIgnorePatterns(path.join(__dirname, '../', 'fixture/block-indent.less')).length);
    });
    it('2. should return right result', function () {
        expect(0).toEqual(util.getIgnorePatterns(path.join(__dirname, '../', 'fixture/no-exist.less')).length);
    });
});
