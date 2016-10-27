/**
 * @file 选择器和 { 之间必须（MUST）保留一个空格。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B1%9E%E6%80%A7%E5%8F%98%E9%87%8F
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
const RULENAME = 'require-before-space';

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Must contain spaces before the `{`';

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

        if (realRuleVal.length) {
            css.walkRules(rule => {
                // 只有 { 时，才能用 between 处理，其他符号的 require-before-space 规则还未实现
                if (
                    !rule.ruleWithoutBody // 排除 mixin 调用
                        && rule.raws.between === '' && realRuleVal.indexOf('{') !== -1
                    ) {
                    const source = rule.source;
                    const line = source.start.line;
                    const col = source.start.column + rule.selector.length;
                    const lineContent = getLineContent(line, source.input.css) || '';
                    result.warn(RULENAME, {
                        node: rule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + lineContent.replace(
                                '{',
                                chalk.magenta('{')
                            )
                            + '` '
                            + chalk.grey(MSG)
                    });
                }
            });
        }
    }
);
