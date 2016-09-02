/**
 * @file 运算符检验
 *       + / - / * / / 四个运算符两侧必须（MUST）保留一个空格。
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
const RULENAME = 'require-around-space';

/**
 * 错误信息
 *
 * @type {string}
 */
const MSG = '`+`、`-`、`*`、`/` four operators on both sides must keep a space';

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

        /* jshint maxcomplexity:false */
        css.walkDecls((decl) => {
            const valueAst = parser(decl.value).parse();

            valueAst.walk(child => {
                if (child.type !== 'operator') {
                    return;
                }

                // 当前 child 的索引
                const index = child.parent.index(child);

                // child 的后一个元素
                const nextElem = child.parent.nodes[index + 1];

                // child 的前一个元素
                const prevElem = child.parent.nodes[index - 1];

                // 忽略负数 -1
                if (child.value === '-'
                    && (child.raws.before || decl.raws.between)
                    && nextElem.type === 'number'
                    && !nextElem.raws.before
                ) {
                    return;
                }

                // 忽略变量 -@foo
                if (child.value === '-'
                    && (child.raws.before || decl.raws.between)
                    && nextElem.type === 'atword'
                    && !nextElem.raws.before
                ) {
                    return;
                }

                // 忽略 font-size/line-height 简写定义
                if (decl.prop === 'font'
                    && child.value === '/'
                    && prevElem.type === 'number'
                    && nextElem.type === 'number'
                ) {
                    return;
                }

                // 判断 operator 前面是否有空格
                const isBeforeValid = child.raws.before === ' ' || /^\s/.test(child.raws.before);

                // 判断 operator 后面是否有空格
                const isAfterValid = nextElem.raws.before === ' ' || /\s$/.test(nextElem.raws.before);

                if (isBeforeValid || isAfterValid) {
                    const problemElem = !/\s$/.test(child.raws.before) ? child : nextElem;
                    const {source, prop, raws} = decl;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css, true);
                    const col = 0
                        + source.start.column + prop.length + raws.between.length + problemElem.source.start.column
                        - 1
                        - (isBeforeValid ? child.value.length: 0);

                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: '`' + lineContent + '` ' + MSG,
                        colorMessage: '`'
                            + changeColorByStartAndEndIndex(lineContent, col, col + child.value.length)
                            + '` '
                            + chalk.grey(MSG)
                    });
                }
            });
        });
    };
});

export {check};
