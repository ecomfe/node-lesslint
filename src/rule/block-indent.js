/**
 * @file 缩进校验
 *       必须（MUST）采用 4 个空格为一次缩进， 不得（MUST NOT）采用 TAB 作为缩进。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%B5%8C%E5%A5%97%E5%92%8C%E7%BC%A9%E8%BF%9B
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
const RULENAME = 'block-indent';

/**
 * 行号的缓存，防止同一行多次报错
 *
 * @type {number}
 */
let lineCache = 0;

/**
 * 获取错误信息
 *
 * @param {string} curIndent 当前的缩进（错误的）
 * @param {string} neededIndent 期望的的缩进（正确的）
 *
 * @return {string} 错误信息
 */
const getMsg = (curIndent, neededIndent) => ''
    + 'Bad indentation, Expected `'
    + (neededIndent)
    + '` but saw `'
    + (curIndent)
    + '`';

/**
 * 添加报错信息
 *
 * @param {Object} node node 对象，可能是 decl 也可能是 rule
 * @param {Object} result postcss 转换的结果对象
 * @param {string} msg 错误信息
 * @param {string} hackPrefixChar 属性 hack 的前缀，`_` 或者 `*`
 */
const addWarn = (node, result, msg, hackPrefixChar = '') => {
    const source = node.source;
    const line = source.start.line;
    if (lineCache !== line) {
        lineCache = line;
        const col = source.start.column;

        let lineContent = getLineContent(line, source.input.css) || '';
        let colorStr = '';

        if (node.selector) {
            colorStr = node.selector;
        }
        else if (node.type === 'atrule') {
            colorStr = lineContent;
        }
        else {
            colorStr = hackPrefixChar + node.prop + node.raws.between + node.value;
            colorStr = colorStr.replace(/\n/g, '');
        }

        result.warn(RULENAME, {
            node: node,
            ruleName: RULENAME,
            line: line,
            col: col,
            message: msg,
            colorMessage: '`'
                + lineContent.replace(
                    colorStr,
                    chalk.magenta(colorStr)
                )
                + '` '
                + chalk.grey(msg)
        });
    }
};

/**
 * 遍历 ruleList，为了分析 decl
 *
 * @param {Array} ruleList rule 集合
 * @param {Object} result postcss 转换的结果对象
 */
const ruleListIterator = (ruleList, result) => {
    ruleList.forEach(r => {
        const rule = r.node;
        let indentStr = r.indentStr;
        if (rule.nodes && rule.nodes.length) {
            // 属性要比它所属的选择器多一层缩进
            indentStr += '    ';
            rule.nodes.forEach(childNode => {
                if (childNode.type !== 'decl') {
                    return;
                }

                const curIndent = childNode.raws.before.replace(/\n*/, '').length;
                const neededIndent = indentStr.length;
                if (curIndent !== neededIndent) {
                    addWarn(childNode, result, getMsg(curIndent + 1, neededIndent + 1));
                }
            });
        }
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

        lineCache = 0;

        // 收集顶层变量定义
        css.walkDecls(decl => {
            if (decl.parent.type === 'root') {
                let curIndent = decl.raws.before.replace(/\n*/, '').length;
                const neededIndent = 0;
                if (curIndent !== neededIndent) {
                    addWarn(decl, result, getMsg(curIndent + 1, neededIndent + 1));
                }
            }
        });

        const ruleList = [];

        const analyzeIndent = (rule, indentStr) => {
            if (rule.type !== 'rule') {
                return;
            }

            let curIndent = rule.raws.before.replace(/\n*/, '').length;
            const neededIndent = indentStr.length;
            if (curIndent !== neededIndent) {
                addWarn(rule, result, getMsg(curIndent + 1, neededIndent + 1));
            }

            ruleList.push({
                node: rule,
                indentStr: indentStr
            });

            if (rule.nodes && rule.nodes.length) {
                rule.nodes.forEach(r => {
                    analyzeIndent(r, indentStr + '    ');
                });
            }
        };

        // 收集顶层选择器
        css.walkRules(rule => {
            if (rule.parent.type === 'root') {
                analyzeIndent(rule, '');
            }
        });

        ruleListIterator(ruleList, result);

    }
);
