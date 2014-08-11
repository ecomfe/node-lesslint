/**
 * @file @import 检验
 *       @import 语句引用的文件必须（MUST）写在一对引号内，.less 后缀不得（MUST NOT）省略（与引入 CSS 文件时的路径格式一致）。
 *       引号使用 ' 和 " 均可，但在同一项目内必须（MUST）统一。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#import-%E8%AF%AD%E5%8F%A5
 * @author ielgnaw(wuji0223@gmail.com)
 */


var util = require('../util');

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
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} importNode ast 节点
 */
module.exports = function (importNode) {
    var me = this;
    var index = importNode.index || 0;
    var importedPathValue = importNode.path.value;
    var quote = importNode.path.quote;

    if (me.importOrderError === 1) {
        me.invalidList.push({
            line: util.getLine(index, me.fileData),
            message: '`'
                + ('@import '
                + quote
                + importedPathValue
                + quote
                + '`').yellow
                + ' '
                + 'must be appear in the beginning of the file'.grey
        });
    }

    if (!suffixPattern.test(importedPathValue)) {
        me.invalidList.push({
            line: util.getLine(index, me.fileData),
            message: '`'
                + ('@import '
                + quote
                + importedPathValue
                + quote
                + '`').yellow
                + ' '
                + '.less suffix must not be omitted'.grey
        });
    }

    // 如果有 importQuote ，那么用当前规则的 quote 与之比较
    // 不相同的话说明本文件内 @import 的引号不一致
    if (importQuote
        && importQuote !== quote
    ) {
        me.invalidList.push({
            line: util.getLine(index, me.fileData),
            message: '`'
                + ('@import '
                + quote
                + importedPathValue
                + quote
                + '`').yellow
                + ' '
                + ('Quotes must be the same in the same file, Current file '
                + 'the first quote is `'
                + importQuote.magenta
                + '`').grey
        });
    }
    else {
        importQuote = quote;
    }
};
