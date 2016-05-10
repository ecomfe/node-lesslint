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
    let errors = opts.errors;
    let nodes = ast.nodes;

    nodes.forEach((node) => {
        if (node.selector) {
            // console.warn(node.selector);

            let childNodes = node.nodes;
            childNodes.forEach((childNode) => {
               // console.warn(childNode);
            });
        }
    });
}

export {rule};