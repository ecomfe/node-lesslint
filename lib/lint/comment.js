/**
 * @file 注释检验
 *       单行注释尽量使用 // 方式
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
 * @author ielgnaw(wuji0223@gmail.com)
 */


var util = require('../util');

/**
 * 匹配注释的正则
 *
 * @type {RegExp}
 */
var pattern = /^\/\*.*[\n]*.*\*\//;

var errorMsg = 'Single Comment should be use `//`'.grey;

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} commentNode ast 节点
 */
module.exports = function (commentNode) {
    var me = this;
    var cssText = commentNode.toCSS({});
    var index = commentNode.index || 0;
    if (pattern.test(cssText)) {
        me.invalidList.push({
            line: util.getLine(index, me.fileData),
            message: '`'
                + cssText.yellow
                + '`'
                + ' '
                + errorMsg
        });
    }
};
