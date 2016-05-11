/**
 * @file @import 检验
 *       @import 语句引用的文件必须（MUST）写在一对引号内，.less 后缀不得（MUST NOT）省略（与引入 CSS 文件时的路径格式一致）。
 *       引号使用 ' 和 " 均可，但在同一项目内必须（MUST）统一。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#import-%E8%AF%AD%E5%8F%A5
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import {getLineContent, addInvalidList} from '../util';

'use strict';

/**
 * less 文件后缀正则
 *
 * @type {RegExp}
 */
const LESS_SUFFIX_REG = /\.less$/;

/**
 * 记录当前检测的 less 文件中 @import 的引号是单引号还是双引号
 * 按第一个读取到的引号为准，同一文件内要统一  {quoteVal, filePath}
 *
 * @type {Object}
 */
let importQuote = {
    quoteVal: null,
    filePath: ''
};

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

    if (importQuote.filePath !== opts.filePath) {
        importQuote.filePath = opts.filePath;
        importQuote.quoteVal = null;
    }

    let ast = opts.ast.root;
    let errors = opts.errors;
    let nodes = ast.nodes;

    nodes.forEach((node) => {
        if (node.type !== 'atrule' || node.name !== 'import') {
            return;
        }

        let params = node.params;
        params = params.replace(/^(['"])/, '').replace(/(['"])$/, '');

        let quote = RegExp.$1;

        let lineNum = node.source.start.line;
        let lineContent = getLineContent(lineNum, opts.fileContent);

        // @import 语句引用的文件必须（MUST）写在一对引号内
        if (!quote) {
            addInvalidList.call(errors,
                opts.ruleName,
                lineNum, node.source.end.column - node.params.length,
                '`' + lineContent + '` '
                    + '@import statement must wrote a pair of quotation marks',
                '`' + lineContent.replace(
                        params,
                        chalk.magenta(params)
                    )
                    + '` '
                    + chalk.grey('@import statement must wrote a pair of quotation marks')
            );
        }
        else {
            if (!importQuote.quoteVal) {
                importQuote.quoteVal = quote;
            }

            // 同一个文件内，引号和当前文件的第一个引号不相同
            if (quote !== importQuote.quoteVal && opts.filePath === importQuote.filePath) {
                addInvalidList.call(errors,
                    opts.ruleName,
                    lineNum, node.source.end.column - node.params.length,
                    '`' + lineContent
                        + '` '
                        + 'Quotes must be the same in the same file, Current file '
                        + 'the first quote is `'
                        + importQuote.quoteVal
                        + '`',
                    '`' + lineContent.replace(
                            new RegExp(quote, 'g'),
                            chalk.magenta(quote)
                        )
                        + ' '
                        + chalk.grey('Quotes must be the same in the same file, Current file '
                        + 'the first quote is `'
                        + chalk.magenta(importQuote.quoteVal)
                        + '`')
                );
            }
        }

        // .less 后缀不得（MUST NOT）省略
        if (!LESS_SUFFIX_REG.test(params)) {
            addInvalidList.call(errors,
                opts.ruleName,
                lineNum, node.source.end.column - node.params.length,
                '`' + lineContent
                    + '` '
                    + '.less suffix must not be omitted',
                '`' + lineContent.replace(
                        params,
                        chalk.magenta(params)
                    )
                    + '` '
                    + chalk.grey('.less suffix must not be omitted')
            );
        }
    });
}

export {rule};