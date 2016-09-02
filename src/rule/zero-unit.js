/**
 * @file 0 值检验
 *       属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC
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
const RULENAME = 'zero-unit';

/**
 * css 长度单位集合
 * https://developer.mozilla.org/en-US/docs/Web/CSS/length
 *
 * @type {Array}
 */
const LENGTH_UNITS = [
    // Relative length units
    'em', 'ex', 'ch', 'rem', // Font-relative lengths
    'vh', 'vw', 'vmin', 'vmax', // Viewport-percentage lengths

    // Absolute length units
    'px', 'mm', 'cm', 'in', 'pt', 'pc'
];

/**
 * 数字正则
 *
 * @type {RegExp}
 */
const PATTERN_NUMERIC = /\d+[\.\d]*/;

/**
 * 错误信息
 *
 * @type {string}
 */
const MSG = 'Values of 0 shouldn\'t have units specified';

/**
 * 行号的缓存，防止同一行多次报错
 *
 * @type {number}
 */
let lineCache = 0;

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

        lineCache = 0;

        css.walkDecls((decl) => {
            const parts = postcss.list.space(decl.value);
            for (let i = 0, len = parts.length; i < len; i++) {
                const part = parts[i];
                const numericVal = parseFloat(part);

                // TODO: background-color: darken(#fff, 0px);
                if (numericVal === 0) {
                    const unit = part.replace(PATTERN_NUMERIC, '');
                    const source = decl.source;
                    const line = source.start.line;
                    if (LENGTH_UNITS.indexOf(unit) > -1 && lineCache !== line) {
                        lineCache = line;
                        const lineContent = getLineContent(line, source.input.css);
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: source.start.column + decl.prop.length + decl.raws.between.length,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    decl.value,
                                    chalk.magenta(decl.value)
                                )
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
