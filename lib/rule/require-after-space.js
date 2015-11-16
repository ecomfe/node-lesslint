/**
 * @file
 * `:` : 1. 属性名后的冒号（:）与属性值之间必须（MUST）保留一个空格，冒号前不得（MUST NOT）保留空格。
 *       2. 定义变量时冒号（:）与变量值之间必须（MUST）保留一个空格，冒号前不得（MUST NOT）保留空格。
 * `,` : 1. 在用逗号（,）分隔的列表（Less 函数参数列表、以 , 分隔的属性值等）中，逗号后必须（MUST）保留一个空格，
 *      逗号前不得（MUST NOT）保留空格。
 *       2. 在给 mixin 传递参数时，在参数分隔符（, / ;）后必须（MUST）保留一个空格
 *
 * 逗号暂时不太好实现
 *
 * https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B1%9E%E6%80%A7%E5%8F%98%E9%87%8F
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

/**
 * 冒号的错误信息
 *
 * @type {string}
 */
var COLON_MSG = ''
    + 'Disallow contain spaces between the `attr-name` and `:`, '
    + 'Must contain spaces between `:` and `attr-value`';

/**
 * 处理属性的缩进
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName ruleName
 * @param {string} configVal 当前规则配置的值
 */
function dealPropertyIndent(rule, ruleName, configVal) {
    var me = this;
    if (rule.type !== 'Comment') {
        var realVal = rule.realVal;
        // 当前 rule 的 name
        var name = rule.name;

        if (!name) {
            return;
        }

        if (Array.isArray(name)) {
            name = name.reduce(function (value, item) {
                value += item.toCSS({});
                return value;
            }, '');
        }

        var lineNum = util.getLine(realVal.index, me.fileData);
        var lineContent = util.getLineContent(lineNum, me.fileData, true);

        var inputStr;
        var matchStr;

        var beforeColonReg = new RegExp('\\s*(' + util.escapeRegExp(name) + '\\s+:)');
        var beforeColonMatch = lineContent.match(beforeColonReg);
        if (beforeColonMatch) {
            inputStr = beforeColonMatch[0];
            matchStr = beforeColonMatch[1];
            me.invalidList.push({
                uniqueFlag: ruleName + lineNum + inputStr + matchStr + '-beforeColon',
                ruleName: ruleName,
                line: lineNum,
                col: lineContent.indexOf(matchStr) + 1,
                message: '`'
                    + lineContent
                    + '` '
                    + COLON_MSG,
                colorMessage: '`'
                    + lineContent.replace(
                        matchStr,
                        chalk.magenta(matchStr)
                    )
                    + '`'
                    + ' '
                    + COLON_MSG
            });
        }
        else {
            var reg = new RegExp('\\s*(' + util.escapeRegExp(name) + ':)[^\\s]+;*');
            var match = lineContent.match(reg);
            if (match) {
                inputStr = match[0];
                matchStr = match[1];
                me.invalidList.push({
                    uniqueFlag: ruleName + lineNum + inputStr + matchStr + '-afterColon',
                    ruleName: ruleName,
                    line: lineNum,
                    col: lineContent.indexOf(matchStr) + 1,
                    message: '`'
                        + lineContent
                        + '` '
                        + COLON_MSG,
                    colorMessage: '`'
                        + lineContent.replace(
                            matchStr,
                            chalk.magenta(matchStr)
                        )
                        + '`'
                        + ' '
                        + COLON_MSG
                });
            }
        }
    }
}


/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName 当前的规则名称
 * @param {string} configVal 当前规则配置的值
 */
module.exports = function (rule, ruleName, configVal) {
    var me = this;
    dealPropertyIndent.call(me, rule, ruleName, configVal);
};

