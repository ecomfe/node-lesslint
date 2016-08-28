/**
 * @file 注释检验
 *       单行注释尽量使用 // 方式
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import {getLineContent} from '../util';

'use strict';

const RULENAME = 'single-comment';

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

        css.walkComments((comment) => {

            // 排除单行注释
            if (comment.inline) {
                return;
            }

            const startLine = comment.source.start.line;
            const endLine = comment.source.end.line;
            if (startLine === endLine) {
                const lineContent = getLineContent(startLine, opts.fileContent);

                result.warn(RULENAME, {
                    node: comment,
                    ruleName: RULENAME,
                    line: startLine,
                    col: comment.source.start.column,
                    message: `\`${lineContent}\` Single Comment should be use \`//\``,
                    colorMessage: '`'
                        + lineContent.replace(
                            lineContent,
                            ($1) => {
                                return chalk.magenta($1);
                            }
                        )
                        + '` '
                        + chalk.grey('Single Comment should be use `//`')
                });
            }
        });

        // css.walkRules((rule) => {
        //     rule.walkDecls((decl) => {
        //         console.log(decl);
        //         // console.log(decl.type);
        //     })
        // });

        /*css.walkAtRules((rule) => {
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
        });*/
    };
});

export {check};