/**
 * @file 数值检验
 *       对于处于 (0, 1) 范围内的数值，小数点前的 0 可以（MAY）省略，同一项目中必须（MUST）保持一致。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%95%B0%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import {getLineContent, addInvalidList} from '../util';

'use strict';

/**
 * 错误信息
 *
 * @type {string}
 */
let msg = 'When value is between 0 - 1 decimal, omitting the integer part of the `0`';

/**
 * 判断小数的正则
 *
 * @type {RegExp}
 */
// const DECIMAL_REG = /(\d*)\.\d+\w*/;
const DECIMAL_REG = /(\d*)\.\d+[^\s);]*/;

/**
 * 递归分析 ast node
 *
 * @param {Object} node 待分析的 ast 节点
 * @param {Object} opts 当前规则检测的参数
 */
function recursionNodes(node, opts) {
    let errors = opts.errors;
    let childNodes = node.nodes || [];
    childNodes.forEach((childNode) => {
        let lineNum = childNode.source.start.line;
        let lineContent = getLineContent(lineNum, opts.fileContent);
        let value = childNode.value;
        var items = value ? value.split(' ') : [];
        items.forEach((item) => {
            if (DECIMAL_REG.test(item)) {
                var match = RegExp.$1;

                if (match === '0') {
                    addInvalidList.call(errors,
                        opts.ruleName,
                        lineNum,
                        null,
                        '`' + lineContent
                            + '` '
                            + msg,
                        '`' + lineContent.replace(
                                item,
                                ($1) => {
                                    return chalk.magenta($1);
                                }
                            )
                            + '` '
                            + chalk.grey(msg)
                    );
                }
            }
        });
        recursionNodes(childNode, opts);
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
    if (!opts.ruleVal) {
        return;
    }

    let ast = opts.ast.root;
    let errors = opts.errors;
    let nodes = ast.nodes;

    nodes.forEach((node) => {
        if (node.type === 'atrule') {
            let lineNum = node.source.start.line;
            let lineContent = getLineContent(lineNum, opts.fileContent);
            let params = node.params;
            var items = params.split(' ');
            items.forEach((item) => {
                if (DECIMAL_REG.test(item)) {
                    var match = RegExp.$1;

                    if (match === '0') {
                        addInvalidList.call(errors,
                            opts.ruleName,
                            lineNum,
                            null,
                            '`' + lineContent
                                + '` '
                                + msg,
                            '`' + lineContent.replace(
                                    item,
                                    ($1) => {
                                        return chalk.magenta($1);
                                    }
                                )
                                + '` '
                                + chalk.grey(msg)
                        );
                    }
                }
            });
        }

        recursionNodes(node, opts);
    });
}

export {rule};