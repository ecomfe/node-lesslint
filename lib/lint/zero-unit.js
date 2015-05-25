/**
 * @file 0 值检验
 *       属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

var chalk = require('chalk');

/**
 * 属性值为 0 时，可省的单位集合
 *
 * @type {Array}
 */
var units = [
    '%',
    'in',
    'cm',
    'mm',
    'em',
    'ex',
    'pt',
    'pc',
    'px'
];

/**
 * 匹配 0 值后的单位的正则
 *
 * @type {RegExp}
 */
var pattern = new RegExp('\\b0\\s?(' + units.join('|') + ')', 'g');


/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'No need to specify units when a value is 0';

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

    var colorMsg = lineContent.replace(
        pattern,
        function ($1) {
            return 0 + chalk.magenta($1.slice(1));
        }
    );

    for (var i = 0, len = realVal.values.length; i < len; i++) {
        var v = realVal.values[i];
        if (v.value === 0) {
            if (v.unit.numerator.length) {
                if (units.indexOf(v.unit.numerator[0]) !== -1) {
                    me.invalidList.push({
                        ruleName: ruleName,
                        line: lineNum,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + colorMsg
                            + '` '
                            + chalk.grey(msg)
                    });
                }
            }
        }
        if (pattern.test(v.value)) {
            me.invalidList.push({
                ruleName: ruleName,
                line: lineNum,
                message: '`'
                    + lineContent
                    + '` '
                    + msg,
                colorMessage: '`'
                    + colorMsg
                    + '` '
                    + chalk.grey(msg)
            });
        }
    }
};
