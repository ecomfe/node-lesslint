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
 * @const
 * @type {string}
 */
const RULENAME = 'hex-color';

/**
 * 判断颜色值是否可以缩写
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_COLOR = /#([\da-f])\1([\da-f])\2([\da-f])\3/i;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Color value can be abbreviated, must use the abbreviation form';

/**
 * 行数的缓存，避免相同的行报多次，因为这里是直接按照 value 值整体来报的
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
export const check = postcss.plugin(RULENAME, opts =>
    (css, result) => {
        const ruleVal = opts.ruleVal;
        const realRuleVal = [];

        Array.prototype.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (!realRuleVal.length) {
            return;
        }

        lineCache = 0;

        if (realRuleVal.indexOf('color') > -1) {

            css.walkDecls(decl => {
                const {value, source} = decl;
                const parts = postcss.list.space(value);
                for (let i = 0, len = parts.length; i < len; i++) {
                    const part = parts[i];
                    if (PATTERN_COLOR.test(part)) {
                        if (lineCache === source.start.line) {
                            continue;
                        }

                        const line = source.start.line;
                        lineCache = line;
                        const lineContent = getLineContent(line, source.input.css, true);
                        const col = source.start.column + decl.prop.length + decl.raws.between.length;
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
                    }
                }
            });
        }
    }
);
