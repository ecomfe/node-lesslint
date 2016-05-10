/**
 * @file 注释检验
 *       单行注释尽量使用 // 方式
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import {getLineContent, addInvalidList} from '../util';

'use strict';

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
    let tokens = opts.ast.tokens;
    let errors = opts.errors;

    tokens.forEach((token) => {
        if (token[0] === 'mulit-comment') {
            if (token[2] === token[4]) {
                let lineNum = token[2];
                let lineContent = getLineContent(lineNum, opts.fileContent);
                addInvalidList.call(errors,
                    opts.ruleName,
                    lineNum, token[3],
                    '`' + lineContent
                        + '` '
                        + 'Single Comment should be use `//`',
                    '`' + lineContent.replace(
                            lineContent,
                            ($1) => {
                                return chalk.magenta($1);
                            }
                        )
                        + '` '
                        + chalk.grey('Single Comment should be use `//`')
                );
            }
        }
    });
}

export {rule};