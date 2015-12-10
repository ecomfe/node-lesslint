/**
 * @file 颜色检验
 *       颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%A2%9C%E8%89%B2
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

var colors = require('less').tree.colors;

var msg = 'Color value can be abbreviated, must use the abbreviation form';

/**
 * 匹配 #fff 或者 #ffffff
 *
 * @type {RegExp}
 */
// var p2 = /\s*#([0-9a-fA-F]{0,6})\s*/;
var p2 = /#([0-9a-fA-F]{0,6})/;

/**
 * 判断颜色值是否可以缩写
 *
 * @type {RegExp}
 */
var p3 = /#([\da-f])\1([\da-f])\2([\da-f])\3/i;


/**
 * 处理属性的缩进
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName ruleName
 * @param {string} configVal 当前规则配置的值
 */
function dealProperty(rule, ruleName, configVal) {
    var me = this;
    if (rule.type === 'Comment' || !rule.value || rule.value.type !== 'Value') {
        return;
    }

    var name = rule.name;

    if (Array.isArray(name)) {
        name = name.reduce(function (value, item) {
            if (item.toCSS) {
                value += item.toCSS({});
            }
            else {
                value += item.name;
            }
            return value;
        }, '');
    }

    var lineNum = util.getLine(rule.index, me.fileData);
    var lineContent = util.getLineContent(lineNum, me.fileData, true);

    var values = rule.realVal.values;
    var i = -1;
    var len = values.length;
    var value;
    while (++i < len) {
        value = values[i];
        if (value && value.value && typeof value.value === 'string') {
            // 说明是 hex 格式颜色值
            if (p2.test(value.value)) {
                var hex = RegExp.$1;
                // 可以缩写
                if (p3.test(value.value)) {
                    me.invalidList.push({
                        uniqueFlag: ruleName + name + lineNum + '-hex',
                        ruleName: ruleName,
                        line: lineNum,
                        col: lineContent.indexOf(hex),
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + lineContent.replace(
                                ('#' + hex),
                                chalk.magenta('#' + hex)
                            )
                            + '` '
                            + chalk.grey(msg)
                    });
                }
            }
            // 说明是单词形式的颜色值
            else if (colors[value.value]) {
                me.invalidList.push({
                    uniqueFlag: ruleName + name + lineNum + '-namedColor',
                    ruleName: ruleName,
                    line: lineNum,
                    col: lineContent.indexOf(value.value) + 1,
                    message: '`'
                        + lineContent
                        + '` '
                        + msg,
                    colorMessage: '`'
                        + lineContent.replace(
                            value.value,
                            chalk.magenta(value.value)
                        )
                        + '` '
                        + chalk.grey(msg)
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
    dealProperty.call(me, rule, ruleName, configVal);
};
