/**
 * @file @import 检验
 *       @import 语句引用的文件必须（MUST）写在一对引号内，.less 后缀不得（MUST NOT）省略（与引入 CSS 文件时的路径格式一致）。
 *       引号使用 ' 和 " 均可，但在同一项目内必须（MUST）统一。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#import-%E8%AF%AD%E5%8F%A5
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

var chalk = require('chalk');

/**
 * less 文件后缀正则
 *
 * @type {RegExp}
 */
var suffixPattern = /\.less$/;

/**
 * 记录当前检测的 less 文件中 @import 的引号是单引号还是双引号
 * 按第一个读取到的引号为准，同一文件内要统一
 *
 * @type {string}
 */
var importQuote = '';

/**
 * less 文件中 @import 的计数器，值为 rules 的索引，默认为 -1 不存在
 *
 * @type {number}
 */
var importCount = -1;

/**
 * rule 的计数器
 *
 * @type {number}
 */
var ruleCount = 0;

/**
 * 文件 path 的缓存，当文件变化时，应该要把 importCount ，ruleCount 还原
 */
var _filePathCache;

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName 当前的规则名称
 */
module.exports = function (rule, ruleName) {
    var me = this;

    if (!_filePathCache) {
        _filePathCache = me.filePath;
    }
    else {
        // 当文件变化时，应该要把 importCount ，ruleCount 还原
        if (_filePathCache !== me.filePath) {
            ruleCount = 0;
            importCount = -1;
            _filePathCache = me.filePath;
        }
    }

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

    if (realVal.type === 'Import') {

        importCount++;

        var importedPathValue = rule.path.value;
        var quote = rule.path.quote;
        if (importCount < ruleCount) {
            me.invalidList.push({
                ruleName: ruleName,
                line: lineNum,
                message: '`'
                    + util.getLineContent(lineNum, fileData)
                    + '` '
                    + 'must be appear in the beginning of the file',
                colorMessage: '`'
                    + util.getLineContent(lineNum, fileData).replace(
                        importedPathValue,
                        chalk.magenta(importedPathValue)
                    )
                    + ' '
                    + chalk.grey('must be appear in the beginning of the file')
            });
        }


        if (!suffixPattern.test(importedPathValue)) {
            me.invalidList.push({
                ruleName: ruleName,
                line: lineNum,
                message: '`'
                    + util.getLineContent(lineNum, fileData)
                    + '` '
                    + '.less suffix must not be omitted',
                colorMessage: '`'
                    + util.getLineContent(lineNum, fileData).replace(
                        importedPathValue,
                        chalk.magenta(importedPathValue)
                    )
                    + ' '
                    + chalk.grey('.less suffix must not be omitted')
            });
        }

        // 如果有 importQuote ，那么用当前规则的 quote 与之比较
        // 不相同的话说明本文件内 @import 的引号不一致
        if (importQuote
            && importQuote !== quote
        ) {
            me.invalidList.push({
                ruleName: ruleName,
                line: lineNum,
                message: '`'
                    + util.getLineContent(lineNum, fileData)
                    + '` '
                    + 'Quotes must be the same in the same file, Current file '
                    + 'the first quote is `'
                    + importQuote
                    + '`',
                colorMessage: '`'
                    + util.getLineContent(lineNum, fileData).replace(
                        new RegExp(quote, 'g'),
                        chalk.magenta(quote)
                    )
                    + ' '
                    + chalk.grey('Quotes must be the same in the same file, Current file '
                    + 'the first quote is `'
                    + chalk.magenta(importQuote)
                    + '`')
            });
        }
        else {
            importQuote = quote;
        }

    }

    if (realVal.type !== 'Comment') {
        ruleCount++;
    }
};
