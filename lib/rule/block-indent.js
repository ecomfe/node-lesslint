/**
 * @file 缩进校验
 *       必须（MUST）采用 4 个空格为一次缩进， 不得（MUST NOT）采用 TAB 作为缩进。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B5%8C%E5%A5%97%E5%92%8C%E7%BC%A9%E8%BF%9B
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

/**
 * 规范默认的缩进为 4
 *
 * @type {number}
 */
var INDENT = 4;

/**
 * 获取错误信息
 *
 * @param {number} num 正确的缩进
 *
 * @return {string} 错误信息
 */
function getMsg(num) {
    return 'Expected indentation of ' + num + ' spaces.';
}

/**
 * 处理选择器的缩进
 *
 * @param {Object} rules ast node
 * @param {string} ruleName ruleName
 */
function dealSelectorIndent(rules, ruleName) {
    var me = this;
    for (var i = 0, rulesLen = rules.length; i < rulesLen; i++) {
        var rule = rules[i];
        var selectors = rule.selectors;

        if (!selectors) {
            continue;
        }
        var selectorLen = selectors.length;

        for (var j = 0; j < selectorLen; j++) {
            var selector = selectors[j];
            var elements = selector.elements;
            if (selector.selectorLevel === undefined) {
                selector.selectorLevel = 0;
            }
            for (var m = 0, elementsLen = elements.length; m < elementsLen; m++) {
                var element = elements[m];
                var index = element.index;

                // mixin 时，index 为 undefined
                if (index === undefined) {
                    index = me.fileData.indexOf(element.value);
                }

                var lineNum = util.getLine(index, me.fileData);
                var lineContent = util.getLineContent(lineNum, me.fileData, true);
                // 不去掉开头空格的 lineContent，目的是和 lineContent 的长度做比较，算出 lineContent 的缩进
                var lineContent1 = util.getLineContent(lineNum, me.fileData);
                var spacesNum = selector.selectorLevel * INDENT;
                var reg;

                if (spacesNum === 0) {
                    reg = new RegExp('^[^\\s]');
                }
                else {
                    reg = new RegExp('^\\s{' + spacesNum + '}[^\\s]+');
                }

                if (lineContent && !reg.test(lineContent))  {
                    me.invalidList.push({
                        uniqueFlag: ruleName + lineNum + '-selector',
                        ruleName: ruleName,
                        line: lineNum,
                        col: lineContent.length - lineContent1.length + 1,
                        message: '`'
                            + lineContent
                            + '` '
                            + getMsg(spacesNum),
                        colorMessage: '`'
                            + lineContent.replace(
                                lineContent,
                                chalk.magenta(lineContent)
                            )
                            + '`'
                            + ' '
                            + chalk.grey(getMsg(spacesNum).replace(spacesNum, chalk.magenta(spacesNum)))
                    });
                }
            }
        }

        dealSelectorIndent.call(me, rule.rules, ruleName);
    }
}

/**
 * 处理属性的缩进
 *
 * @param {Object} realVal ast node
 * @param {string} ruleName ruleName
 * @param {Object} rule ast node
 */
function dealPropertyIndent(realVal, ruleName, rule) {
    var me = this;
    if (realVal.type !== 'Comment') {

        var propertyLineNum = util.getLine(rule.index, me.fileData);
        var propertyLineContent = util.getLineContent(propertyLineNum, me.fileData, true);
        // 去掉开头空格的 lineContent，目的是和 lineContent 的长度做比较，算出 lineContent 的缩进
        var propertyLineContent1 = util.getLineContent(propertyLineNum, me.fileData);

        var propertySpacesNum;
        if (realVal.selectors) {
            propertySpacesNum = (realVal.selectors[0].selectorLevel + 1) * INDENT;
        }
        else {
            propertySpacesNum = 0;
        }

        var reg;
        if (propertySpacesNum === 0) {
            reg = new RegExp('^[^\\s]');
        }
        else {
            reg = new RegExp('^\\s{' + propertySpacesNum + '}[^\\s]+');
        }

        if (propertyLineContent && !reg.test(propertyLineContent))  {
            me.invalidList.push({
                uniqueFlag: ruleName + propertyLineNum + '-property-name',
                ruleName: ruleName,
                line: propertyLineNum,
                col: propertyLineContent.length - propertyLineContent1.length + 1,
                message: '`'
                    + propertyLineContent
                    + '` '
                    + getMsg(propertySpacesNum),
                colorMessage: '`'
                    + propertyLineContent.replace(
                        propertyLineContent,
                        chalk.magenta(propertyLineContent)
                    )
                    + '`'
                    + ' '
                    + chalk.grey(getMsg(propertySpacesNum).replace(
                        propertySpacesNum, chalk.magenta(propertySpacesNum))
                    )
            });
        }


        var valueSpacesNum = propertySpacesNum + INDENT;
        realVal.values.reduce(function (v, item) {
            var index = item.value.index;
            if (!index) {
                return;
            }
            var valueLineNum = util.getLine(index, me.fileData);
            if (valueLineNum > propertyLineNum) {
                var valueReg = new RegExp('^\\s{' + valueSpacesNum + '}[^\\s]+');
                var valueLineContent = util.getLineContent(valueLineNum, me.fileData, true);
                var valueLineContent1 = util.getLineContent(valueLineNum, me.fileData);
                if (valueLineContent && !valueReg.test(valueLineContent))  {
                    me.invalidList.push({
                        uniqueFlag: ruleName + valueLineNum + '-property-value',
                        ruleName: ruleName,
                        line: valueLineNum,
                        col: valueLineContent.length - valueLineContent1.length + 1,
                        message: '`'
                            + valueLineContent
                            + '` '
                            + getMsg(valueSpacesNum),
                        colorMessage: '`'
                            + valueLineContent.replace(
                                valueLineContent,
                                chalk.magenta(valueLineContent)
                            )
                            + '`'
                            + ' '
                            + chalk.grey(getMsg(valueSpacesNum).replace(valueSpacesNum, chalk.magenta(valueSpacesNum)))
                    });
                }
            }
        }, '');

    }
}

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName 当前的规则名称
 */
module.exports = function (rule, ruleName) {
    var me = this;

    // 当前 rule 上的 realVal
    var realVal = rule.realVal;

    var rules = me._astRoot.rules;
    dealSelectorIndent.call(me, rules, ruleName);
    dealPropertyIndent.call(me, realVal, ruleName, rule);
};
