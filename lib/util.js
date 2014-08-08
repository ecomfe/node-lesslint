/**
 * @file 常用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var edp = require('edp-core');

/**
 * 调用给定的迭代函数 n 次,每一次传递 index 参数，调用迭代函数。
 * from underscore
 *
 * @param {number} n 迭代次数
 * @param {Function} iterator 处理函数
 * @param {Object} context 上下文
 */
exports.times = function (n, iterator, context) {
    var accum = new Array(Math.max(0, n));
    for (var i = 0; i < n; i++) {
        accum[i] = iterator.call(context, i);
    }
    return accum;
};

/**
 * 格式化信息
 *
 * @param {string} msg 输出的信息
 * @param {number} spaceCount 信息前面空格的个数即缩进的长度
 *
 * @return {string} 格式化后的信息
 */
exports.formatMsg = function (msg, spaceCount) {
    var space = '';
    spaceCount = spaceCount || 0;
    exports.times(
        spaceCount,
        function () {
            space += ' ';
        }
    );
    return space + msg;
}

/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
exports.getCandidates = function(args, patterns) {
    var candidates = [];

    args = args.filter(function(item) {
        return item !== '.';
    });

    if (!args.length) {
        candidates = edp.glob.sync(patterns);
    }
    else {
        for (var i = 0; i < args.length; i++) {
            var target = args[i];
            if (!fs.existsSync(target)) {
                edp.log.warn('No such file or directory %s', target);
                continue;
            }

            var stat = fs.statSync(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(
                    candidates,
                    edp.glob.sync(target + '/' + patterns[0]));
            }
            else if (stat.isFile()) {
                candidates.push(target);
            }
        }
    }

    return candidates;
};


// exports.padLine = function (line) {
//     var num = (line + '. ');
//     var space = '';
//     exports.times(
//         10 - num.length,
//         function () {
//             space += ' ';
//         }
//     )
//     return (space + num).grey;
// };
