/**
 * @file 颜色检验
 *       颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%A2%9C%E8%89%B2
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import {getLineContent, changeColorByStartAndEndIndex} from '../util';

'use strict';

/**
 * 规则名称
 *
 * @type {string}
 */
const RULENAME = 'hex-color';

/**
 * 匹配 rgb, hsl 颜色表达式的正则
 *
 * @type {RegExp}
 */
const PATTERN_COLOR_EXP = /(\brgb\b|\bhsl\b)/gi;

/**
 * 错误信息
 *
 * @type {string}
 */
const MSG = ''
    + 'Color value must use the hexadecimal mark forms such as `#RRGGBB`.'
    + ' Don\'t use RGB、HSL expression';

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
            let match = null;
            /* eslint-disable no-extra-boolean-cast */
            while (!!(match = PATTERN_COLOR_EXP.exec(decl.value))) {
                const source = decl.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css, true);
                const col = source.start.column + decl.prop.length + decl.raws.between.length + match.index;
                result.warn(RULENAME, {
                    node: decl,
                    ruleName: RULENAME,
                    line: line,
                    col: e.column,
                    message: MSG,
                    colorMessage: '`'
                        + changeColorByStartAndEndIndex(
                            lineContent, col, source.end.column
                        )
                        + '` '
                        + chalk.grey(MSG)
                });
            }
            /* eslint-enable no-extra-boolean-cast */
        });
    };
});

export {check};
