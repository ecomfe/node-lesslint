/**
 * @file @import 校验
 *       必须写在引号内，单双引均可，同一项目必须统一， .less 后缀不得省略
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#import-%E8%AF%AD%E5%8F%A5
 * @author ielgnaw(wuji0223@gmail.com)
 */

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
 *
 * @param {Object} ast less 语法树
 * @param {string} data 文件内容
 */
module.exports = function (ast, data, callback) {

    var rules = ast.rules;

    // 如果语法树上没有需要校验的 rules ，直接返回
    if (!rules) {
        return;
    }

    rules.forEach(
        function (rule) {

            var path = rule.path;
            var importedFilename = rule.importedFilename;

            // 是 import 类型
            if (path && importedFilename) {
                var importedFilepath = path.value;
                var quote = path.quote; // 当前这个 @import 规则的引号
                if (!suffixPattern.test(importedFilepath)) {
                    callback({
                        index: rule.index,
                        message: '`'
                            + importedFilepath
                            + '`'
                            + ' '
                            + '.less suffix must not be omitted'
                    });
                }

                // 如果有 importQuote ，那么用当前规则的 quote 与之比较
                // 不相同的话说明本文件内 @import 的引号不一致
                if (importQuote
                    && importQuote !== quote
                ) {
                    callback({
                        index: rule.index,
                        message: '`'
                            + quote + importedFilepath + quote
                            + '`'
                            + ' '
                            + 'Quotes must be the same in the same file'
                    });
                }
                else {
                    importQuote = quote;
                }
            }
        }
    );
};
