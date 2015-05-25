/**
 * @file 变量检验
 *       变量命名必须（MUST）采用 @foo-bar 形式，不得（MUST NOT）使用 @fooBar 形式。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%8F%98%E9%87%8F
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

var chalk = require('chalk');

/**
 * 匹配变量名字的正则
 *
 * @type {RegExp}
 */
var pattern = /^@([a-z0-9\-]+)$/;

/**
 * 错误信息
 *
 * @type {string}
 */
var msg = 'Variable name must be like this `@foo-bar or @foobar`';

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

    if (name && name.indexOf('@') === 0) {
        if (!pattern.test(name)) {
            me.invalidList.push({
                ruleName: ruleName,
                line: lineNum,
                message: '`'
                    + util.getLineContent(lineNum, fileData).replace(name, '')
                    + msg,
                colorMessage: '`'
                    + chalk.magenta(name)
                    + util.getLineContent(lineNum, fileData).replace(name, '')
                    + '` '
                    + chalk.grey(msg)
            });
        }
    }
};
