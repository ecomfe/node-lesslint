/**
 * @file 选择器和 { 之间必须（MUST）保留一个空格。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B1%9E%E6%80%A7%E5%8F%98%E9%87%8F
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

var msg = 'Must contain spaces before the `{`';

var lastLineNumCache = -1;

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

    var selectors = realVal.selectors;
    if (!selectors) {
        return;
    }

    // lastLineNumCache = -1;

    selectors.forEach(
        function (selector) {
            selector.elements.forEach(function (elem) {
                var curLineNum = util.getLine(elem.index, fileData);
                var lineContent = util.getLineContent(curLineNum, fileData, true);
                var match = lineContent.match(/[^\{]*[^\s](\{)$/);
                if (match) {
                    var inputStr = match[0];
                    var matchStr = match[1];
                    me.invalidList.push({
                        uniqueFlag: ruleName + curLineNum + inputStr + matchStr,
                        ruleName: ruleName,
                        line: curLineNum,
                        col: lineContent.indexOf(matchStr) + 1,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + lineContent.replace(
                                '{',
                                chalk.magenta('{')
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                }
            });
        }
    );
};

