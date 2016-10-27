/**
 * @file 选择器检验
 *       当多个选择器共享一个声明块时，每个选择器声明必须（MUST）独占一行。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%80%89%E6%8B%A9%E5%99%A8
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
const RULENAME = 'require-newline';

/**
 * 判断逗号后面没有跟着换行符的正则
 * 如果未匹配，则说明逗号后面有换行符
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_NOTLF = /(,(?!\s*\n))/;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'When multiple selectors share a statement block, each selector statement must be per line';

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

        if (realRuleVal.indexOf('selector') > -1) {
            css.walkRules(rule => {
                const selector = rule.selector;
                if (
                    !rule.ruleWithoutBody // 排除 mixin 调用
                    && PATTERN_NOTLF.test(selector)
                ) {
                    const source = rule.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column;
                    // 如果是 `p, i, \n.cc` 这样的选择器，那么高亮就应该把后面的 `\n.cc` 去掉
                    // 直接用 lineContent 来匹配 `p, i, \n.cc` 无法高亮
                    const colorStr = selector.replace(/\n.*/, '');
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + lineContent.replace(colorStr, chalk.magenta(colorStr))
                            + '` '
                            + chalk.grey(MSG)
                    });
                }
            });
        }
    }
);
