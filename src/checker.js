/**
 * @file checker 针对 less 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {join} from 'path';
import {existsSync} from 'fs';
import chalk from 'chalk';
import postcssLess from 'postcss-less';
import postcss from 'postcss';

import {isIgnored} from './util';
import {loadConfig} from './config';

'use strict';

/**
 * rule 逻辑实现的文件夹路径
 */
const ruleDir = join(__dirname, './rule');

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 * @param {string} filePath 文件路径，根据这个参数来设置 less 编译时的 paths
 * @param {Object=} realConfig 检测规则的配置，可选
 *
 * @return {Promise} Promise 对象
 */
export function checkString(fileContent, filePath, realConfig) {
    // 这里把文件内容的 \r\n 统一替换成 \n，便于之后获取行号
    fileContent = fileContent.replace(/\r\n?/g, '\n');

    // postcss 插件集合即规则检测的文件集合
    const plugins = [];

    Object.getOwnPropertyNames(
        realConfig
    ).forEach(
        function (prop) {
            const ruleFilePath = join(ruleDir, prop) + '.js';
            if (existsSync(ruleFilePath)) {
                plugins.push(
                    require(join(ruleDir, prop)).check({
                        ruleVal: realConfig[prop],
                        // 实际上在 postcss 的 plugin 里面通过 node.source.input.css 也可以拿到文件内容
                        // 但是通过这种方式拿到的内容是去掉 BOM 的，因此在检测 no-bom 规则时候会有问题
                        // 所以这里把文件的原内容传入进去
                        fileContent: fileContent,
                        filePath: filePath
                    })
                );
            }
        }
    );

    // 不合法的信息集合
    const invalidList = [];

    const invalid = {
        path: '',
        messages: []
    };

    const checkPromise = new Promise((resolve, reject) => {
        postcss(plugins).process(fileContent, {
            syntax: postcssLess
        }).then(result => {
            result.warnings().forEach(data => {
                invalid.messages.push({
                    ruleName: data.ruleName,
                    line: data.line,
                    col: data.col,
                    errorChar: data.errorChar || '',
                    message: data.message,
                    colorMessage: data.colorMessage
                });
                if (invalid.path !== filePath) {
                    invalid.path = filePath;
                    invalidList.push(invalid);
                }
            });
            resolve(invalidList);

            // const parserRet = safeStringify(result.root.toResult().root, null, 4);
            // const outputFile = join(__dirname, '../ast.json');
            // writeFileSync(outputFile, parserRet);
        }).catch(e => {
            // 这里 catch 的是代码中的错误
            const str = e.toString();
            invalid.messages.push({
                ruleName: 'CssSyntaxError',
                line: e.line,
                col: e.column,
                message: str,
                colorMessage: chalk.red(str)
            });

            if (invalid.path !== filePath) {
                invalid.path = filePath;
                invalidList.push(invalid);
            }
            reject(invalidList);
        });
    });

    return checkPromise;
}

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 *
 * @return {Function} checkString 方法
 */
export function check(file, errors, done) {
    if (isIgnored(file.path, '.lesslintignore')) {
        done();
        return;
    }

    /**
     * checkString 的 promise 的 reject 和 resolve 的返回值的结构以及处理方式都是一样的
     * reject 指的是 parse 本身的错误以及 ast.toCSS({}) 的错误，这些代表程序的错误。
     * resolve 代表的是 lesslint 检测出来的问题
     *
     * @param {Array.<Object>} invalidList 错误信息集合
     */
    const callback = invalidList => {
        if (invalidList.length) {
            invalidList.forEach(invalid => {
                errors.push({
                    path: invalid.path,
                    messages: invalid.messages
                });
            });
        }
        done();
    };

    return checkString(file.content, file.path, loadConfig(file.path, true)).then(callback).catch(callback);
}
