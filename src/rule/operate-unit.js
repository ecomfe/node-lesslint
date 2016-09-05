/**
 * @file 运算符检验
 *       + / - 两侧的操作数必须（MUST）有相同的单位，如果其中一个是变量，另一个数值必须（MUST）书写单位。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E8%BF%90%E7%AE%97
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';
import parser from 'postcss-values-parser';

import {getLineContent, changeColorByStartAndEndIndex} from '../util';

'use strict';

/**
 * 规则名称
 *
 * @type {string}
 */
const RULENAME = 'operate-unit';

/**
 * 错误信息
 *
 * @type {string}
 */
const MSG = ''
    + '`+`、`-` on both sides of the operand must have the same unit, '
    + 'if one side has unit, the other side must has unit';

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

        // TODO:
        // `@a: 1 + 2;` is walkDecls
        // `@a : 1 + 2;` is walkAtRules 这种情况还未处理

        /* jshint maxcomplexity:false */
        css.walkDecls((decl) => {
            const valueAst = parser(decl.value).parse();

            valueAst.walk(child => {
                if (child.type !== 'operator' || (child.value !== '+' && child.value !== '-')) {
                    return;
                }

                // 当前 child 的索引
                const index = child.parent.index(child);

                // child 的后一个元素
                const nextElem = child.parent.nodes[index + 1];

                // child 的前一个元素
                const prevElem = child.parent.nodes[index - 1];

                let problemElem = null;

                // 后一个是变量
                if (nextElem.type === 'atword' && prevElem.type !== 'atword') {
                    if (!prevElem.unit) {
                        problemElem = prevElem;
                    }
                }

                // 前一个是变量
                if (prevElem.type === 'atword' && nextElem.type !== 'atword') {
                    if (!nextElem.unit) {
                        problemElem = nextElem;
                    }
                }

                if (problemElem) {
                    const {source, prop, raws} = decl;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css, true);
                    const col =
                        source.start.column + prop.length + raws.between.length + problemElem.source.start.column - 1;

                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: '`' + lineContent + '` ' + MSG,
                        colorMessage: '`'
                            + changeColorByStartAndEndIndex(lineContent, col, col + problemElem.value.length)
                            + '` '
                            + chalk.grey(MSG)
                    });
                }
            });
        });
    };
});

export {check};
