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

/**
 * 规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'single-comment';

/**
 * 具体的检测逻辑
 *
 * @param {Object} opts 参数
 * @param {*} opts.ruleVal 当前规则具体配置的值
 * @param {string} opts.fileContent 文件内容
 * @param {string} opts.filePath 文件路径
 */
export const check = postcss.plugin(RULENAME, opts =>
    (css, result) => {
        if (!opts.ruleVal) {
            return;
        }

        css.walkComments(comment => {
            // 排除单行注释
            if (comment.inline) {
                return;
            }

            const {source} = comment;

            const startLine = source.start.line;
            const endLine = source.end.line;
            if (startLine === endLine) {
                const lineContent = getLineContent(startLine, opts.fileContent);

                result.warn(RULENAME, {
                    node: comment,
                    ruleName: RULENAME,
                    line: startLine,
                    col: source.start.column,
                    message: `\`${lineContent}\` Single Comment should be use \`//\``,
                    colorMessage: '`'
                        + lineContent.replace(
                            lineContent,
                            $1 => chalk.magenta($1)
                        )
                        + '` '
                        + chalk.grey('Single Comment should be use `//`')
                });
            }
        });
    }
);
