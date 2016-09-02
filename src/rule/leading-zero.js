/**
 * @file 数值检验
 *       对于处于 (0, 1) 范围内的数值，小数点前的 0 可以（MAY）省略，同一项目中必须（MUST）保持一致。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%95%B0%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import {getLineContent, changeColorByIndex} from '../util';

'use strict';

/**
 * 规则名称
 *
 * @type {string}
 */
const RULENAME = 'leading-zero';

/**
 * 错误信息
 *
 * @type {string}
 */
const MSG = 'When value is between 0 - 1 decimal, omitting the integer part of the `0`';

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

        css.walkDecls((decl) => {
            const parts = postcss.list.space(decl.value);
            const source = decl.source;
            const lineNum = source.start.line;
            for (let i = 0, len = parts.length; i < len; i++) {
                const part = parts[i];
                const numericVal = parseFloat(part);
                if (numericVal < 1 && numericVal > 0) {
                    if (part.slice(0, 2) === '0.') {
                        const lineContent = getLineContent(lineNum, source.input.css, true);
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: lineNum,
                            col: lineContent.indexOf(part) + 1,
                            message: MSG,
                            colorMessage: '`'
                                + changeColorByIndex(lineContent, lineContent.indexOf(part), part)
                                + '` '
                                + chalk.grey(MSG)
                        });
                    }
                }
            }
        });
    };
});

export {check};