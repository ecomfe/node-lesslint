/**
 * @file 运算符检验
 *       + / - 两侧的操作数必须（MUST）有相同的单位，如果其中一个是变量，另一个数值必须（MUST）书写单位。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E8%BF%90%E7%AE%97
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');
var chalk = require('chalk');

var msg = ''
    + '`+`、`-` on both sides of the operand must have the same unit, '
    + 'if one is variable, to another number write unit';

/**
 * 注释正则
 *
 * @type {RegExp}
 */
// var commentPattern = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

/**
 * 两侧必须有相同单位的运算符
 *
 * @type {Array}
 */
var mustSameUnitOperaters = [
    '+',
    '-'
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
            /* jshint maxdepth: 6 */
            if (val.op && mustSameUnitOperaters.indexOf(val.op) !== -1) {
                // console.log(val);
                // v.unit.numerator[0]
                // var units = [];
                // console.log(require('util').inspect(val, { showHidden: true, depth: null }));
                var firstUnit = '';
                for (var j = 0, jLen = operands.length; j < jLen; j++) {
                    var curOperands = operands[j];
                    if (curOperands.unit) {
                        if (firstUnit && firstUnit !== curOperands.unit.toString()) {
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
                        firstUnit = curOperands.unit.toString();
                    }
                    // else {
                        // units.push(curOperands);
                        // analyzeOperands.call(me, curOperands, lineNum, lineContent, ruleName);
                    // }
                    // console.warn(operands[j].unit.toString(),1);
                    // units.push(operands[j].unit.numerator[0]);
                }
                // console.log(units);

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

    // console.log(realVal);

    analyzeOperands.call(me, realVal.values, lineNum, lineContent, ruleName);

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

