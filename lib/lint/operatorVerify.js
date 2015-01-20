/**
 * @file 运算符检验
 *       + / - / * / / 四个运算符两侧必须（MUST）保留一个空格。+ / - 两侧的操作数必须（MUST）有相同的单位，如果其中一个是变量，另一个数值必须（MUST）书写单位。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E8%BF%90%E7%AE%97
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

/**
 * 注释正则
 *
 * @type {RegExp}
 */
var commentPattern = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

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

/**
 * 两侧必须有相同单位的运算符
 *
 * @type {Array}
 */
var mustSameUnitOperaters = [
    '+',
    '-'
];

function analyzeOperands(values, lineNum, lineContent) {
    var me = this; // me 是 lesslintVisitor
    for (var i = 0, len = values.length; i < len; i++) {
        var v = values[i];
        if (Array.isArray(v.value)) {
            analyzeOperands.call(me, v.value, lineNum, lineContent);
        }
        else {
            var val = v.value || v;
            var operands = val.operands;
            if (operands) {
                analyzeOperands.call(me, operands, lineNum, lineContent);
            }

            if (val.op) {
                if (mustSpaceOperaters.indexOf(val.op) !== -1) {
                    if (!val.isSpaced) {
                        me.invalidList.push({
                            line: lineNum,
                            message: '`'
                                + lineContent.replace(
                                    val.op,
                                    chalk.magenta(val.op)
                                )
                                + '`'
                                + ' '
                                + chalk.grey(''
                                    + '`+`、`-`、`*`、`/` four operators '
                                    + 'on both sides must keep a space'
                                )
                        });
                    }
                    // console.log(val.op);
                    // console.log(lineNum);
                    // console.warn(lineContent);
                    // console.log(val);
                    // console.log();
                }

                if (mustSameUnitOperaters.indexOf(val.op) !== -1) {
                    // console.log(val);
                    // v.unit.numerator[0]
                    var units = [];
                    for (var j = 0, jLen = val.operands.length; j < jLen; j++) {
                        // console.warn(val.operands[j],1);
                        // units.push(val.operands[j].unit.numerator[0]);
                    }
                    // console.log(units);
                }
            }
        }
    }
    // if (value.operands) {
    //     for (var i = 0, len = value.operands.length; i < len; i++) {
    //         console.log(value.operands[i], 333);
    //     }
    // }
    // if (operands) {
        // for (var i = 0, len = operands.length; i < len; i++) {
            // console.log(operands[i]);
        // }
    // }
    // for (var i = 0, len = value.values.length; i < len; i++) {
        // var v = value.values[i];
        // if (v.value.op) {
            // console.log(chalk.red(v.value.op), lineContent, lineNum);
        // }
        // console.log(require('util').inspect(v, { showHidden: true, depth: null }));
    // }
}

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 */
module.exports = function (rule) {
    var me = this;

    // 当前 less 文件的内容
    var fileData = me.fileData;
    // var fileData = me.fileData.replace(commentPattern, '');

    // 当前 rule 上的 realVal
    var realVal = rule.realVal;

    // 当前 rule 的索引
    var index = realVal.index;

    // 当前 rule 的 name
    var name = realVal.name;

    if (Array.isArray(name)) {
        name = name[0].toCSS({});
    }

    var lineNum = util.getLine(index, fileData);
    var lineContent = util.getLineContent(lineNum, fileData);

    // console.log(realVal);

    analyzeOperands.call(me, realVal.values, lineNum, lineContent);

    // for (var i = 0, len = realVal.values.length; i < len; i++) {
    //     var v = realVal.values[i];
    //     analyzeOperands.call(realVal, v.value);
    //     // analyzeOperands(v.value.operands);
    //     // if (v.value.op) {
    //         // console.log(chalk.red(v.value.op), lineContent, lineNum);
    //     // }
    //     // console.log(require('util').inspect(v, { showHidden: true, depth: null }));
    // }

};

