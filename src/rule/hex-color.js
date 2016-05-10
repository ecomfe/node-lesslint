/**
 * @file 颜色检验
 *       颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%A2%9C%E8%89%B2
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import less from 'less';
import {getLineContent, addInvalidList} from '../util';

'use strict';

/**
 * 错误信息
 *
 * @type {string}
 */
const msg = ''
    + 'Color value must use the hexadecimal mark forms such as `#RRGGBB`.'
    + ' Don\'t use RGB、HSL expression';

/**
 * less 中关于颜色的一些表达式
 * 暂时先判断这么多
 *
 * @type {Array}
 */
const COLOR_FUNC_REG = /\s*(rgb|hsv|hsl)(\(.*\))\s*/;

/**
 * less 支持的颜色名称
 *
 * @type {Object}
 */
let lessColors = less.data.colors;

let colors = (function () {
    let ret = '';
    for (let i in lessColors) {
        if (lessColors.hasOwnProperty(i)) {
            ret += i + '|';
        }
    }
    return ret.slice(0, -1); // 去掉最后一个 |
})();

/**
 * 匹配颜色名称的正则
 *
 * @type {RegExp}
 */
let p1 = new RegExp('\\b\\s?\\s*(' + colors + ')\\b', 'ig');


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

        // 匹配使用 rgb, hsl, hsv 表达式的情况
        if (COLOR_FUNC_REG.test(value)) {
            addInvalidList.call(errors,
                opts.ruleName,
                lineNum, childNode.source.end.column - value.length,
                '`' + lineContent
                    + '` '
                    + msg,
                '`' + lineContent.replace(
                        value,
                        ($1) => {
                            return chalk.magenta($1);
                        }
                    )
                    + '` '
                    + chalk.grey(msg)
            );
        }
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
    let ast = opts.ast.root;
    let errors = opts.errors;
    let nodes = ast.nodes;

    nodes.forEach((node) => {
        // console.warn(safeStringify(node, null, 4));
        // TODO: 这里仅仅用 type 来判断够么？
        if (node.type === 'atrule') {
            let params = node.params;

            let lineNum = node.source.start.line;
            let lineContent = getLineContent(lineNum, opts.fileContent);

            // 匹配直接使用颜色名称的情况
            if (p1.test(params)) {
                addInvalidList.call(errors,
                    opts.ruleName,
                    lineNum, node.source.end.column - node.params.length,
                    '`' + lineContent
                        + '` '
                        + msg,
                    '`' + lineContent.replace(
                            p1,
                            ($1) => {
                                return chalk.magenta($1);
                            }
                        )
                        + '` '
                        + chalk.grey(msg)
                );
            }

            // 匹配使用 rgb, hsl, hsv 表达式的情况
            if (COLOR_FUNC_REG.test(params)) {
                addInvalidList.call(errors,
                    opts.ruleName,
                    lineNum, node.source.end.column - node.params.length,
                    '`' + lineContent
                        + '` '
                        + msg,
                    '`' + lineContent.replace(
                            RegExp.$1 + RegExp.$2,
                            ($1) => {
                                return chalk.magenta($1);
                            }
                        )
                        + '` '
                        + chalk.grey(msg)
                );
            }
        }

        recursionNodes(node, opts);
    });
}

export {rule};