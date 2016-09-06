/**
 * @file
 * `:` : 1. 属性名后的冒号（:）与属性值之间必须（MUST）保留一个空格，冒号前不得（MUST NOT）保留空格。
 *       2. 定义变量时冒号（:）与变量值之间必须（MUST）保留一个空格，冒号前不得（MUST NOT）保留空格。
 * `,` : 1. 在用逗号（,）分隔的列表（Less 函数参数列表、以 , 分隔的属性值等）中，逗号后必须（MUST）保留一个空格，
 *      逗号前不得（MUST NOT）保留空格。
 *       2. 在给 mixin 传递参数时，在参数分隔符（, / ;）后必须（MUST）保留一个空格
 *
 * 逗号暂时不太好实现
 *
 * https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B1%9E%E6%80%A7%E5%8F%98%E9%87%8F
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
const RULENAME = 'require-after-space';

/**
 * 冒号
 *
 * @type {string}
 */
const COLON = ':';

/**
 * 逗号
 *
 * @type {string}
 */
const COMMA = ',';

/**
 * 匹配 css 属性值的 url(...);
 *
 * @type {RegExp}
 */
const PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

/**
 * 冒号的错误信息
 *
 * @type {string}
 */
const COLON_MSG = ''
    + 'Disallow contain spaces between the `attr-name` and `:`, '
    + 'Must contain spaces between `:` and `attr-value`';

/**
 * 逗号的错误信息
 *
 * @type {string}
 */
const COMMA_MSG = 'Must contain spaces after `,` in `attr-value`';

/**
 * 具体的检测逻辑
 *
 * @param {Object} opts 参数
 * @param {*} opts.ruleVal 当前规则具体配置的值
 * @param {string} opts.fileContent 文件内容
 * @param {string} opts.filePath 文件路径
 */
const check = postcss.plugin(RULENAME, (opts) => {
    return function (css, result) {
        const ruleVal = opts.ruleVal;
        const realRuleVal = [];
        Array.prototype.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            css.walkDecls(decl => {
                const source = decl.source;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css) || '';

                if (realRuleVal.indexOf(COLON) !== -1) {
                    const between = decl.raws.between;

                    if (between.slice(0, 1) !== ':' // `属性名` 与之后的 `:` 之间包含空格了
                        || between.slice(-1) === ':' // `:` 与 `属性值` 之间不包含空格
                    ) {
                        const colorStr = decl.prop + decl.raws.between + decl.value;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            message: COLON_MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    colorStr,
                                    chalk.magenta(colorStr)
                                )
                                + '` '
                                + chalk.grey(COLON_MSG)
                        });
                    }
                }

                if (realRuleVal.indexOf(COMMA) !== -1) {
                    const value = decl.value;

                    // 排除掉 uri 的情况，例如
                    // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                    // background-image: 2px 2px url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                    // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...) 2px 2px;
                    if (!PATTERN_URI.test(value)) {
                        const items = lineContent.split(';');
                        for (let j = 0, jLen = items.length; j < jLen; j++) {
                            const s = items[j];
                            if (s.indexOf(',') > -1
                                && /.*,(?!\s)/.test(s)
                                && s.length !== lineContent.length // s.length === lineContent.length 的情况表示当前行结束了
                            ) {
                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: COMMA,
                                    line: line,
                                    message: COMMA_MSG,
                                    colorMessage: '`'
                                        + lineContent.replace(
                                            value,
                                            chalk.magenta(value)
                                        )
                                        + '` '
                                        + chalk.grey(COMMA_MSG)
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                            }
                        }
                    }
                }

            });
        }
    };
});

export {check};