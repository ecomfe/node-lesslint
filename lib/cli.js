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

    var patterns = [
        '**/*.less',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    var candidates = meUtil.getCandidates(args, patterns);
    console.warn(candidates);
    if (candidates.length) {
    }

};
