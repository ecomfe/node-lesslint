/**
 * @file 注释检验
 *       单行注释尽量使用 // 方式
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');

/**
 * 匹配注释的正则
 *
 * @type {RegExp}
 */
var pattern = /^\/\*.*[\n]*.*\*\//;

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

    // Comment 这个类型无法获取行号，因为 less tree.Comment 上没有挂载 index
    // （参见 less/lib/less/tree/comment.js 第 3 行）
    if (realVal.type === 'Comment') {
        var cssText = rule.toCSS({});
        if (pattern.test(cssText)) {
            me.invalidList.push({
                // line: util.getLine(index, me.fileData),
                ruleName: ruleName,
                message: '`'
                    + cssText
                    + '` '
                    + 'Single Comment should be use `//`',
                colorMessage: '`'
                    + chalk.magenta(cssText)
                    + '` '
                    + chalk.grey('Single Comment should be use `//`')
            });
        }
    }

};
