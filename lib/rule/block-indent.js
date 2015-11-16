/**
 * @file 缩进校验
 *       必须（MUST）采用 4 个空格为一次缩进， 不得（MUST NOT）采用 TAB 作为缩进。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B5%8C%E5%A5%97%E5%92%8C%E7%BC%A9%E8%BF%9B
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

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
                var lineNum = util.getLine(element.index, me.fileData);
                var lineContent = util.getLineContent(lineNum, me.fileData, true);

                // 不去掉开头空格的 lineContent，目的是和 lineContent 的长度做比较，算出 lineContent 的缩进
                var lineContent1 = util.getLineContent(lineNum, me.fileData);
                var spacesNum = selector.selectorLevel * 4;
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
 */
function dealPropertyIndent(realVal, ruleName) {
    var me = this;
    if (realVal.type !== 'Comment') {
        var lineNum = util.getLine(realVal.index, me.fileData);
        var lineContent = util.getLineContent(lineNum, me.fileData, true);

        // 不去掉开头空格的 lineContent，目的是和 lineContent 的长度做比较，算出 lineContent 的缩进
        var lineContent1 = util.getLineContent(lineNum, me.fileData);

        var spacesNum;
        if (realVal.selectors) {
            spacesNum = (realVal.selectors[0].selectorLevel + 1) * 4;
        }
        else {
            spacesNum = 0;
        }
        var reg;

        if (spacesNum === 0) {
            reg = new RegExp('^[^\\s]');
        }
        else {
            reg = new RegExp('^\\s{' + spacesNum + '}[^\\s]+');
        }

        if (lineContent && !reg.test(lineContent))  {
            me.invalidList.push({
                uniqueFlag: ruleName + lineNum + '-property',
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

    var rules = me._astRoot.rules;
    dealSelectorIndent.call(me, rules, ruleName);
    dealPropertyIndent.call(me, realVal, ruleName);
};
