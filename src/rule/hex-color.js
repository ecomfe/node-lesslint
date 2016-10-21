/**
 * @file 颜色检验
 *       颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%A2%9C%E8%89%B2
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import less from 'less';
import {getLineContent, changeColorByStartAndEndIndex} from '../util';

'use strict';

/**
 * 规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'hex-color';

/**
 * Less 中的所有颜色值
 *
 * @const
 * @type {Object}
 */
const LESS_COLORS = less.data.colors;

/**
 * 对 Less 中的所有颜色值做处理，便于之后正则
 *
 * @const
 * @return {string} 字符串
 */
// const namedColors = (function () {
//     let ret = '';
//     for (let key of Object.keys(LESS_COLORS)) {
//         ret += key + '|';
//     }
//     return ret.slice(0, -1); // 去掉最后一个 |
// })();

/**
 * 匹配颜色名的正则
 *
 * @const
 * @type {RegExp}
 */
// const PATTERN_NAMED_COLOR_EXP = new RegExp('\\b\\s?:\\s*(' + namedColors + ')', 'g');
// console.log(PATTERN_NAMED_COLOR_EXP);
// console.log();

/**
 * 匹配 rgb, hsl 颜色表达式的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COLOR_EXP = /(\brgb\b|\bhsl\b)/gi;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = ''
    + 'Color value must use the hexadecimal mark forms such as `#RRGGBB`.'
    + ' Don\'t use RGB、HSL expression';

/**
 * 添加报错信息
 *
 * @param {Object} node decl 对象
 * @param {Object} result postcss 转换的结果对象
 */
const addWarn = (decl, result) => {
    const {source, prop, raws} = decl;
    const line = source.start.line;
    const lineContent = getLineContent(line, source.input.css, true);
    const col = source.start.column + prop.length + raws.between.length;
    result.warn(RULENAME, {
        node: decl,
        ruleName: RULENAME,
        line: line,
        col: col,
        message: MSG,
        colorMessage: '`'
            + changeColorByStartAndEndIndex(
                lineContent, col, source.end.column
            )
            + '` '
            + chalk.grey(MSG)
    });
};

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

        css.walkDecls(decl => {
            const value = decl.value;
            if (LESS_COLORS[value]) {
                addWarn(decl, result);
            }
            else {
                let match = null;
                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_COLOR_EXP.exec(value))) {
                    addWarn(decl, result);
                }
                /* eslint-enable no-extra-boolean-cast */
            }
        });
    }
);
