/**
 * @file 变量检验
 *       变量命名必须（MUST）采用 @foo-bar 形式，不得（MUST NOT）使用 @fooBar 形式。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%8F%98%E9%87%8F
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

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
var errorMsg = 'Variable name must be like this `@foo-bar`'.grey;

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} valueNode ast 节点
 */
module.exports = function (valueNode) {
    var me = this;

    var name = valueNode.name;
    var cssText = valueNode.toCSS({});

    if (!pattern.test(name)) {
        me.invalidList.push({
            line: util.getLine(valueNode.index, me.fileData),
            message: '`'
                + cssText.yellow
                + '`'
                + ' '
                + errorMsg
        });
    }
};
