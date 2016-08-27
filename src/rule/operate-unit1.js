/**
 * @file 运算符检验
 *       + / - 两侧的操作数必须（MUST）有相同的单位，如果其中一个是变量，另一个数值必须（MUST）书写单位。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E8%BF%90%E7%AE%97
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
const msg = ''
    + '`+`、`-` on both sides of the operand must have the same unit, '
    + 'if one side has unit, the other side must has unit';


/**
 * 递归分析 ast node 的集合
 *
 * @param {Array} node 待分析的 ast 节点集合
 * @param {Object} opts 当前规则检测的参数
 */
const recursionNodes = (nodes, opts) => {
    let errors = opts.errors;
    nodes.forEach((node) => {
        recursionNodes(node.nodes || [], opts);

        if (node.type === 'atrule') {
            let lineNum = node.source.start.line;
            let lineContent = getLineContent(lineNum, opts.fileContent);
            let params = node.params;
            console.warn(params);
        }

        // if (node.type === 'atrule') {
        //     let lineNum = node.source.start.line;
        //     let lineContent = getLineContent(lineNum, opts.fileContent);
        //     let name = node.name;

        //     // node.name 后面会有一个 :
        //     name = name.replace(/:$/, '');
        //     if (!VARIABLE_NAME_REG.test(name)) {
        //         // @CCCC，@aa-CC 这类的变量命名也会报
        //         addInvalidList.call(errors,
        //             opts.ruleName,
        //             lineNum,
        //             node.source.start.column,
        //             '`' + lineContent + '` ' + msg,
        //             '`' + lineContent.replace(
        //                     '@' + name,
        //                     ($1) => {
        //                         return chalk.magenta($1);
        //                     }
        //                 )
        //                 + '` '
        //                 + chalk.grey(msg)
        //         );
        //     }
        // }
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
export function rule(opts) {
    if (!Array.isArray(opts.ruleVal)) {
        opts.ruleVal = [opts.ruleVal];
    }

    let ast = opts.ast.root;
    let nodes = ast.nodes;
    recursionNodes(nodes, opts);
}