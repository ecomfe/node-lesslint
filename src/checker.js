/**
 * @file checker 针对 less 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

import Input from 'postcss/lib/input';
import safeStringify from 'json-stringify-safe';
import chalk from 'chalk';
import {formatMsg, getCandidates, getIgnorePatterns, isIgnored, getConfig} from './util';
import {loadConfig} from './config';
import LessParser from './parser';
import {join} from 'path';
import {writeFileSync, existsSync} from 'fs';

'use strict';

/**
 * rule 逻辑实现的文件夹路径
 */
const ruleDir = join(__dirname, './rule');

// /**
//  * less parser 参数
//  *
//  * @type {Object}
//  */
// var parseOptions = {
//     paths: [path.dirname('.')],
//     includePath: [],
//     relativeUrls: true
//     // paths: [path.dirname(this.path)].concat(this.options.includePath)
// };

// var parser;

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 * @param {string} filePath 文件路径，根据这个参数来设置 less 编译时的 paths
 * @param {Object=} rcConfig 检测规则的配置，可选
 *
 * @return {Promise} Promise 对象
 */
function checkString(fileContent, filePath, realConfig) {
    // 这里把文件内容的 \r\n 统一替换成 \n，便于之后获取行号
    fileContent = fileContent.replace(/\r\n?/g, '\n');

    let input = new Input(fileContent, {from: filePath});
    let parser = new LessParser(input);

    let errors = [];

    let parsePromise = new Promise((resolve, reject) => {
        try {
            parser.tokenize();
            parser.loop();

            console.warn(parser.root);

            Object.getOwnPropertyNames(
                realConfig
            ).forEach((prop) => {
                let ruleFilePath = join(ruleDir, prop) + '.js';
                if (existsSync(ruleFilePath)) {
                    require(join(ruleDir, prop)).rule({
                        ruleVal: realConfig[prop],
                        fileContent: fileContent,
                        filePath: filePath,
                        errors: errors
                    });
                }
            });
            resolve(errors);

            let parserRet = safeStringify(parser, null, 4);
            let outputFile = join(__dirname, '../ast.json');
            writeFileSync(outputFile, parserRet);
        }
        catch (e) {
            let errMsg = e.message;
            errors.push({
                path: filePath,
                messages: [
                    {
                        line: e.line,
                        col: e.column,
                        message: ''
                            + e.name
                            + ', '
                            + errMsg,
                        colorMessage: ''
                            + chalk.red(
                                e.name + ', ' + errMsg
                            )
                    }
                ]
            });
            reject(errors);
        }
    });

    return parsePromise;

    // console.warn();
    // console.warn();
    // console.warn(parser.root);

    // console.warn(realConfig);
    // console.warn(parser);
    // let thisPromiseCount = 0;
    // let removePromise = new Promise((resolve, reject) => {
    //     thisPromiseCount++;
    //     resolve(thisPromiseCount);
    //     // setTimeout(function () {
    //     //     try {
    //     //         resolve(thisPromiseCount);
    //     //     }
    //     //     catch (e) {
    //     //         reject('rrrrrrr');
    //     //     }
    //     // }, Math.random() * 2000 + 1000);
    // });

    // return removePromise;

    // removePromise.then(
    //     function (val) {
    //         console.warn(val);
    //     }
    // ).catch(
    //     function (reason) {
    //         console.log('Handle rejected promise (' + reason + ') here.');
    //     }
    // );
}

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
function check(file, errors, done) {
    if (isIgnored(file.path, '.lesslintignore')) {
        done();
        return;
    }

    checkString(file.content, file.path, loadConfig(file.path, true))
        .then(done)
        .catch(function (invalidList) {
            if (invalidList.length) {
                invalidList.forEach(function (invalid) {
                    errors.push({
                        path: invalid.path,
                        messages: invalid.messages
                    });
                });
                done();
            }
        }
    );
}

export {check, checkString};
