/**
 * @file 运算符检验
 *       + / - / * / / 四个运算符两侧必须（MUST）保留一个空格。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E8%BF%90%E7%AE%97
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

var msg = '`+`、`-`、`*`、`/` four operators on both sides must keep a space';

/**
 * 注释正则
 *
 * @type {RegExp}
 */
// var commentPattern = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

/**
 * 两侧必须保留空格的运算符
 *
 * @type {Array}
 */
var mustSpaceOperaters = [
    '+',
    '-',
    '*',
    '/'
];

function analyzeOperands(values, lineNum, lineContent, ruleName) {
    var me = this; // me 是 lesslintVisitor
    for (var i = 0, len = values.length; i < len; i++) {
        var v = values[i];
        if (Array.isArray(v.value)) {
            analyzeOperands.call(me, v.value, lineNum, lineContent, ruleName);
        }
        else {
            var val = v.value || v;

            var operands = val.operands;
            if (operands) {
                analyzeOperands.call(me, operands, lineNum, lineContent, ruleName);
            }

            if (val.op && mustSpaceOperaters.indexOf(val.op) !== -1) {
                if (!val.isSpaced) {
                    me.invalidList.push({
                        ruleName: ruleName,
                        line: lineNum,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + lineContent.replace(
                                val.op,
                                chalk.magenta(val.op)
                            )
                            + '`'
                            + ' '
                            + chalk.grey(msg)
                    });
                }
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
 */
module.exports = function (rule, ruleName) {
    var me = this;

    // 当前 less 文件的内容
    var fileData = me.fileData;
    // var fileData = me.fileData.replace(commentPattern, '');

    // 当前 rule 上的 realVal
    var realVal = rule.realVal;
    // console.log(require('util').inspect(realVal, { showHidden: true, depth: null }));

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
    var lineContent = util.getLineContent(lineNum, fileData);

    // 防止 font: italic bold 12px/20px arial,sans-serif; 这种情况的误报
    if (realVal.type === 'Operation') {
        analyzeOperands.call(me, realVal.values, lineNum, lineContent, ruleName);
    }

};

