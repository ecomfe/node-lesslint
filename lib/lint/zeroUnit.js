/**
 * @file 0 值检验
 *       属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

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
var errorMsg = 'No need to specify units when a value is 0'.grey;

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 */
module.exports = function (rule) {
    var me = this;
    console.log(rule);
    // console.log(require('util').inspect(rule, { showHidden: true, depth: null }));
    return;
};
