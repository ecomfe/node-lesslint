/**
 * @file @import 检验
 *       @import 语句引用的文件必须（MUST）写在一对引号内，.less 后缀不得（MUST NOT）省略（与引入 CSS 文件时的路径格式一致）。
 *       引号使用 ' 和 " 均可，但在同一项目内必须（MUST）统一。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#import-%E8%AF%AD%E5%8F%A5
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import {getLineContent} from '../util';

'use strict';

/**
 * 规则名称
 *
 * @type {string}
 */
const RULENAME = 'import';

/**
 * less 文件后缀正则
 *
 * @type {RegExp}
 */
const LESS_SUFFIX_REG = /\.less$/;

/**
 * 记录当前检测的 less 文件中 @import 的引号是单引号还是双引号
 * 按第一个读取到的引号为准，同一文件内要统一  {quoteVal, filePath}
 *
 * @type {Object}
 */
const importQuote = {
    quoteVal: null,
    filePath: ''
};

/**
 * 具体的检测逻辑
 *
 * @param {Object} opts 参数
 * @param {*} opts.ruleVal 当前规则具体配置的值
 * @param {string} opts.fileContent 文件内容
 * @param {string} opts.filePath 文件路径
 */

const check = postcss.plugin(RULENAME, (opts) => {
    return (css, result) => {

        if (!opts.ruleVal) {
            return;
        }

        if (importQuote.filePath !== opts.filePath) {
            importQuote.filePath = opts.filePath;
            importQuote.quoteVal = null;
        }

        css.walkAtRules((rule) => {
            if (rule.name !== 'import') {
                return;
            }

            const params = rule.params.replace(/^(['"])/, '').replace(/(['"])$/, '');

            const quote = RegExp.$1;
            const lineNum = rule.source.start.line;
            const lineContent = getLineContent(lineNum, opts.fileContent);

            // @import 语句引用的文件必须（MUST）写在一对引号内
            if (!quote) {
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: lineNum,
                    col: rule.source.end.column - rule.params.length,
                    message: `\`${lineContent}\` @import statement must wrote a pair of quotation marks`,
                    colorMessage: '`'
                        + lineContent.replace(
                            params,
                            chalk.magenta(params)
                        )
                        + '` '
                        + chalk.grey('@import statement must wrote a pair of quotation marks')
                });
            }
            else {
                if (!importQuote.quoteVal) {
                    importQuote.quoteVal = quote;
                }

                // 同一个文件内，引号和当前文件的第一个引号不相同
                if (quote !== importQuote.quoteVal && opts.filePath === importQuote.filePath) {
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: lineNum,
                        col: rule.source.end.column - rule.params.length,
                        message: ``
                            + `\`${lineContent}\` Quotes must be the same in the same file,`
                            + `Current file the first quote is \`${importQuote.quoteVal}\``,
                        colorMessage: '`'
                            + lineContent.replace(
                                new RegExp(quote, 'g'),
                                chalk.magenta(quote)
                            )
                            + ' '
                            + chalk.grey('Quotes must be the same in the same file, Current file '
                            + 'the first quote is `'
                            + chalk.magenta(importQuote.quoteVal)
                            + '`')
                    });
                }
            }

            // .less 后缀不得（MUST NOT）省略
            if (!LESS_SUFFIX_REG.test(params)) {
                result.warn(RULENAME, {
                    node: rule,
                    ruleName: RULENAME,
                    line: lineNum,
                    col: rule.source.end.column - rule.params.length,
                    message: `\`${lineContent}\` .less suffix must not be omitted`,
                    colorMessage: '`'
                        + lineContent.replace(
                            params,
                            chalk.magenta(params)
                        )
                        + '` '
                        + chalk.grey('.less suffix must not be omitted')
                });
            }
        });
    };
});

export {check};
