/**
 * @file 选择器检验
 *       当多个选择器共享一个声明块时，每个选择器声明必须（MUST）独占一行。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%80%89%E6%8B%A9%E5%99%A8
 * @author ielgnaw(wuji0223@gmail.com)
 */

import safeStringify from 'json-stringify-safe';
import chalk from 'chalk';
import {getLineContent, addInvalidList} from '../util';

'use strict';

/**
 * 错误信息
 *
 * @type {string}
 */
let msg = 'When multiple selectors share a statement block, each selector statement must be per line';


/**
 * 递归分析 ast node
 *
 * @param {Object} node 待分析的 ast 节点
 * @param {Object} opts 当前规则检测的参数
 */
// function recursionNodes(node, opts) {
//     let errors = opts.errors;
//     let childNodes = node.nodes || [];
//     // console.warn(safeStringify(node, null, 4));
//     childNodes.forEach((childNode) => {
//         let selector = childNode.selector;

//         if (!selector) {
//             return;
//         }

//         let items = selector.split(',');
//         var itemsLen = items.length;
//         // 说明没有逗号分隔
//         if (itemsLen <= 1) {
//             return;
//         }

//         // 有逗号分隔情况下，如果 \n 分隔的项的数量小于逗号分隔的项的数量，那么就认为是违反规则的
//         if (selector.split('\n').length < itemsLen) {
//             let lineNum = childNode.source.start.line;
//             let lineContent = getLineContent(lineNum, opts.fileContent);
//             addInvalidList.call(errors,
//                 opts.ruleName,
//                 lineNum,
//                 null,
//                 '`' + lineContent
//                     + '` '
//                     + msg,
//                 '`' + lineContent.replace(
//                         lineContent,
//                         ($1) => {
//                             return chalk.magenta($1);
//                         }
//                     )
//                     + '` '
//                     + chalk.grey(msg)
//             );
//         }

//         recursionNodes(childNode, opts);
//     });
// }

/**
 * 递归分析 ast node 的集合
 *
 * @param {Array} node 待分析的 ast 节点集合
 * @param {Object} opts 当前规则检测的参数
 */
function recursionNodes(nodes, opts) {
    let errors = opts.errors;
    nodes.forEach((node) => {
        let selector = node.selector;
        if (!selector) {
            return;
        }

        let items = selector.split(',');
        var itemsLen = items.length;
        // 说明没有逗号分隔
        if (itemsLen <= 1) {
            return;
        }

        // 有逗号分隔情况下，如果 \n 分隔的项的数量小于逗号分隔的项的数量，那么就认为是违反规则的
        if (selector.split('\n').length < itemsLen) {
            let lineNum = node.source.start.line;
            let lineContent = getLineContent(lineNum, opts.fileContent);
            addInvalidList.call(errors,
                opts.ruleName,
                lineNum,
                null,
                '`' + lineContent
                    + '` '
                    + msg,
                '`' + lineContent.replace(
                        lineContent,
                        ($1) => {
                            return chalk.magenta($1);
                        }
                    )
                    + '` '
                    + chalk.grey(msg)
            );
        }

        recursionNodes(node.nodes, opts);
    });
}

/**
 * 具体的检测逻辑
 *
 * @param {Object} opts 参数
 * @param {Object} opts.ast 语法树对象
 * @param {*} opts.ruleVal 当前规则具体配置的值
 * @param {string} opts.ruleName 当前规则名
 * @param {string} opts.fileContent 文件内容
 * @param {string} opts.filePath 文件路径
 * @param {Array} opts.errors 错误信息的集合
 *
 * @return {Array} 不符合规则检测的集合
 */
function rule(opts) {
    let ast = opts.ast.root;
    let nodes = ast.nodes;
    recursionNodes(nodes, opts);
}

export {rule};