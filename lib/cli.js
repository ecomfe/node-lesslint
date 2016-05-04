/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

exports.__esModule = true;
exports.parse = parse;

var _fs = require('fs');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _input = require('postcss/lib/input');

var _input2 = _interopRequireDefault(_input);

var _jsonStringifySafe = require('json-stringify-safe');

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _util = require('./util');

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 显示默认的信息
 */
function showDefaultInfo() {
    console.warn(_package2.default);
    console.log('');
    console.log(_package2.default.name + ' v' + _package2.default.version);
    console.log(_chalk2.default.bold.green((0, _util.formatMsg)(_package2.default.description)));
}

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
function parse(args) {
    args = args.slice(2);

    // 不带参数时，默认检测当前目录下所有的 less 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    var patterns = ['**/*.less', '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'];

    var candidates = (0, _util.getCandidates)(args, patterns);

    var count = candidates.length;

    if (!count) {
        return;
    }

    // 错误信息的集合
    var errors = [];

    /**
     * 每个文件的校验结果回调，主要用于统计校验完成情况
     *
     * @inner
     */
    var callback = function callback() {
        count--;
        if (!count) {
            // report(errors);
        }
    };

    // 遍历每个需要检测的 less 文件
    candidates.forEach(function (candidate) {
        var readable = (0, _fs.createReadStream)(candidate, {
            encoding: 'utf8'
        });
        readable.on('data', function (chunk) {
            var file = {
                content: chunk,
                path: candidate
            };
            var input = new _input2.default(file.content, { from: file.path });
            var parser = new _parser2.default(input);
            // console.warn(safeStringify(parser, null, 4));
            parser.tokenize();
            parser.loop();
            console.warn();
            console.warn();
            console.warn((0, _jsonStringifySafe2.default)(parser, null, 4));
            // console.warn(parser);

            // require('./checker').check(file, errors, callback);
        });
        readable.on('error', function (err) {
            throw err;
        });
    });
}