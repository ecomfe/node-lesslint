/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */


function colorsTest() {
    var a = [
        'bold',
        'italic',
        'underline',
        'inverse',
        'yellow',
        'cyan',
        'white',
        'magenta',
        'green',
        'red',
        'grey- blue',
        'rainbow',
        'zebra',
        'random'
    ];

    for (var i = 0, len = a.length; i < len; i++) {
        console.log('haha123哈哈'[a[i]], a[i]);
    }
}

var fs = require('fs');
var colors = require('colors');

var sys = require('../package');
var meUtil = require('./util');

/**
 * 显示默认的信息
 */
function showDefaultInfo() {
    console.log('');
    console.log((sys.name + ' v' + sys.version));
    console.log(meUtil.formatMsg(sys.description.bold.green));
}

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
exports.parse = function (args) {
    args = args.slice(2);

    // 不带参数时，默认检测当前目录下所有的 less 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    // 错误信息的集合
    var errors = [];

    var patterns = [
        '**/*.less',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    var candidates = meUtil.getCandidates(args, patterns);
    if (candidates.length) {

        var count = candidates.length;
        /**
         * 每个文件的校验结果回调，主要用于统计校验完成情况
         *
         * @inner
         */
        function callback() {
            count--;
            if (!count) {
                console.log(errors);
                // report(errors);
            }
        }

        candidates.forEach(
            function (candidate) {
                var file = {
                    content: fs.readFileSync(candidate, 'utf-8'),
                    path: candidate
                };
                require('./checker').check(file, errors, callback);
            }
        )

        // var lint = require('../lib/lint');
        // lint.check(candidates, [require('../lib/less/checker')]);
    }

};
