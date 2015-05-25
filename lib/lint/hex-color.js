/**
 * @file 颜色检验
 *       颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%A2%9C%E8%89%B2
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

var msg = ''
    + 'Color definitions must use #RRGGBB format definition,'
    + ' Don\'t use RGB、HSL expression';

/**
 * less 中关于颜色的一些表达式
 * 暂时先判断这么多
 *
 * @type {Array}
 */
var colorFuncs = [
    'rgb',
    // 'rgba',
    'hsl',
    // 'hsla',
    'hsv'
    // 'hsva'
];


/**
 * less 支持的颜色名称
 *
 * @type {Object}
 */
var lessColors = require('less/lib/less/tree').colors;

var colors = (function () {
    var ret = '';
    for (var i in lessColors) {
        if (lessColors.hasOwnProperty(i)) {
            ret += i + '|';
        }
    }
    return ret.slice(0, -1); // 去掉最后一个 |
})();

/**
 * 匹配颜色名称的正则
 *
 * @type {RegExp}
 */
// var p1 = new RegExp('\\b\\s?(' + colors + ')', 'g');
var p1 = new RegExp('\\b\\s?:\\s*(' + colors + ')', 'g');

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName 当前的规则名称
 */
module.exports = function (rule, ruleName) {
    var me = this;

    // 当前 less 文件的内容
    var fileData = me.fileData;

    // 当前 rule 上的 realVal
    var realVal = rule.realVal;

    // 当前 rule 的索引
    var index = realVal.index;

    // 当前 rule 的 name
    var name = realVal.name;
    if (Array.isArray(name)) {
        try {
            name = name[0].toCSS({});
        }
        catch (e) {
            name = name[0].name;
        }
    }

    var lineNum = util.getLine(index, fileData);
    var lineContent = util.getLineContent(lineNum, fileData);

    // 如何知道这个 rule 是颜色
    // realVal.type === 'Color'
    // 或者
    // realVal.type === 'Call' 且 realVal.refFuncs in colorFuncs
    // 或者
    // realVal.values[index].value == '1px solid #fff'

    if (realVal.type === 'Color') {
        // 由于 less 的语法树上，如下两种 rule 是完全一样的
        // @color1: white;
        // @color2: #ffffff;

        if (p1.test(lineContent)) {
            me.invalidList.push({
                ruleName: ruleName,
                line: lineNum,
                // col: lineContent.indexOf(RegExp.$1) + 1,
                message: '`'
                    + lineContent
                    + '` '
                    + msg,
                colorMessage: '`'
                    + lineContent.replace(
                        p1,
                        function ($1) {
                            return chalk.magenta($1);
                        }
                    )
                    + '` '
                    + chalk.grey(msg)
            });
        }

        // 移到 shorthand
        // if (p2.test(lineContent)) {
        //     var $1 = RegExp.$1;
        //     if (p3.test($1)) {
        //         me.invalidList.push({
        //             ruleName: ruleName,
        //             line: lineNum,
        //             // col: lineContent.indexOf($1),
        //             message: '`'
        //                 + lineContent
        //                 + '` '
        //                 + msg,
        //             colorMessage: '`'
        //                 + lineContent.replace(
        //                     ('#' + $1),
        //                     chalk.magenta('#' + $1)
        //                 )
        //                 + '` '
        //                 + chalk.grey(msg)
        //         });
        //     }
        // }
    }
    else if (realVal.type !== 'Comment') {
        var refFuncs = realVal.refFuncs;
        if (refFuncs.length) {
            for (var i = 0, len = refFuncs.length; i < len; i++) {
                if (colorFuncs.indexOf(refFuncs[i].name) !== -1) {
                    me.invalidList.push({
                        ruleName: ruleName,
                        line: lineNum,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + lineContent.replace(
                                refFuncs[i].name,
                                chalk.magenta(refFuncs[i].name)
                            )
                            + '`'
                            + ' '
                            + chalk.grey(msg)
                    });
                }
            }
        }

        // 移到 shorthand
        // var values = realVal.values;
        // if (values.length) {
        //     for (var j = 0, jLen = realVal.values.length; j < jLen; j++) {
        //         var v = realVal.values[j];
        //         p2.test(v.value);
        //         /* eslint-disable no-redeclare */
        //         var $1 = RegExp.$1;
        //         /* eslint-enable no-redeclare */
        //         if (p3.test($1)) {
        //             me.invalidList.push({
        //                 ruleName: ruleName,
        //                 line: lineNum,
        //                 message: '`'
        //                     + lineContent
        //                     + '` '
        //                     + msg,
        //                 colorMessage: '`'
        //                     + lineContent.replace(
        //                         ('#' + $1),
        //                         chalk.magenta('#' + $1)
        //                     )
        //                     + '` '
        //                     + chalk.grey(msg)
        //             });
        //         }
        //     }
        // }
    }
};
