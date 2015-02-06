/**
 * @file 数值检验
 *       对于处于 (0, 1) 范围内的数值，小数点前的 0 可以（MAY）省略，同一项目中必须（MUST）保持一致。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%95%B0%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

var chalk = require('chalk');

var msg = function (isColor) {
    return ''
        + 'In (0, 1) numerical range, before the decimal point 0 MAY omitted, must be '
        + 'the same project consistent, Current file before the decimal point 0 is '
        + (isColor ? chalk.magenta('not omitted.') : 'not omitted.');
};

/**
 * 注释正则
 *
 * @type {RegExp}
 */
var commentPattern = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

/**
 * 判断小数的正则
 *
 * @type {RegExp}
 */
// var pattern = /(\d*)\.\d+\w*/g;
var pattern = /(\d*)\.\d+[^\s);]*/g;

/**
 * 这个检测是直接用正则匹配文件内容的，但是 lint 下的内容是以 rule 为粒度的，所以有多少个
 * rule 就会执行多少次 lint 下的文件。
 * 因此，这里用这个 filePathCache 变量来缓存执行的 rule 所在的文件，同一文件就不再执行了
 *
 * @type {string}
 */
var filePathCache = '';

/**
 * 记录处于 (0, 1) 范围内的数值，小数点前的 0 是否省略的状态
 * '0' 为省略，'1' 为没省略
 * 按第一个读取到的引号为准，同一文件内要统一
 *
 * @type {string}
 */
var zeroBeforeDecimalpointType = '';

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName 当前的规则名称
 */
module.exports = function (rule, ruleName) {
    var me = this;

    // 同一文件就不执行了
    if (filePathCache && filePathCache === me.filePath) {
        return;
    }

    filePathCache = me.filePath;

    // test
    // if (me.filePath === 'dev-fe/dep/est/1.2.1/src/effects.less') {
    //     debugger
    // }

    // 当前 less 文件的内容
    var fileData = me.fileData.replace(commentPattern, '');

    var match = null;

    /* eslint-disable no-extra-boolean-cast */
    while (!!(match = pattern.exec(fileData))) {
        var index = match.index;
        var lineNum = util.getLine(index, fileData);
        var lineContent = util.getLineContent(lineNum, fileData);
        var value = match[0];

        var valueArr = (value + '').split('.');

        if (valueArr.length === 2
            && !/.*[-(@].*/.test(valueArr[1])
        ) {
            // if (me.filePath === 'dev-fe/dep/est/1.2.1/src/effects.less') {
            //     console.log(valueArr[1]);
            // }
            // 省略小数点前的 0
            if (valueArr[0] === '') {
                if (!zeroBeforeDecimalpointType) {
                    // console.log(me.filePath, lineNum); // 决定 zeroBeforeDecimalpointType 的文件路径
                    zeroBeforeDecimalpointType = '0';
                }
                else {
                    if (zeroBeforeDecimalpointType === '1') {
                        me.invalidList.push({
                            line: lineNum,
                            ruleName: ruleName,
                            message: '`'
                                + lineContent
                                + '` '
                                + msg(),
                            colorMessage: '`'
                                + lineContent.replace(
                                    value,
                                    chalk.magenta(value)
                                )
                                + '` '
                                + chalk.grey(msg(false))
                        });
                    }
                }
            }
            else if (valueArr[0] === '0') {
                if (!zeroBeforeDecimalpointType) {
                    // console.log(me.filePath, lineNum); // 决定 zeroBeforeDecimalpointType 的文件路径
                    zeroBeforeDecimalpointType = '1';
                }
                else {
                    if (zeroBeforeDecimalpointType === '0') {
                        me.invalidList.push({
                            ruleName: ruleName,
                            line: lineNum,
                            message: '`'
                                + lineContent
                                + '` '
                                + msg(),
                            colorMessage: '`'
                                + lineContent.replace(
                                    value,
                                    chalk.magenta(value)
                                )
                                + '`'
                                + ' '
                                + chalk.grey(msg(true))
                        });
                    }
                }
            }
        }
        // return;

        // if (/0\.[\s\S]*/.test(value)) {
        //     if (!zeroBeforeDecimalpointType) {
        //         // console.log(me.filePath, lineNum); // 决定 zeroBeforeDecimalpointType 的文件路径
        //         zeroBeforeDecimalpointType = '1';
        //     }
        //     else {
        //         if (zeroBeforeDecimalpointType === '0') {
        //             console.log(chalk.green(value));
        //             me.invalidList.push({
        //                 line: lineNum,
        //                 message: '`'
        //                     + lineContent.replace(
        //                         value,
        //                         chalk.magenta(value)
        //                     )
        //                     + '`'
        //                     + ' '
        //                     + chalk.grey(''
        //                         + 'In (0, 1) numerical range, '
        //                         + 'before the decimal point 0 MAY omitted, '
        //                         + 'must be the same project consistent, '
        //                         + 'Current file before the decimal point 0 is '
        //                         + chalk.magenta('omitted.')
        //                     )
        //             });
        //         }
        //     }
        // }
        // else {
        //     if (!zeroBeforeDecimalpointType) {
        //         // console.log(me.filePath, lineNum); // 决定 zeroBeforeDecimalpointType 的文件路径
        //         zeroBeforeDecimalpointType = '0';
        //     }
        //     else {
        //         if (zeroBeforeDecimalpointType === '1') {
        //             console.log(chalk.blue(value));
        //             me.invalidList.push({
        //                 line: lineNum,
        //                 message: '`'
        //                     + lineContent.replace(
        //                         value,
        //                         chalk.magenta(value)
        //                     )
        //                     + '`'
        //                     + ' '
        //                     + chalk.grey(''
        //                         + 'In (0, 1) numerical range, '
        //                         + 'before the decimal point 0 MAY omitted, '
        //                         + 'must be the same project consistent, '
        //                         + 'Current file before the decimal point 0 is '
        //                         + chalk.magenta('not omitted.')
        //                     )
        //             });
        //         }
        //     }
        // }
    }
    /* eslint-enable no-extra-boolean-cast */
};
