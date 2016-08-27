/**
 * @file checker 针对 less 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

import safeStringify from 'json-stringify-safe';
import Input from 'postcss/lib/input';
import less from 'less';
import chalk from 'chalk';
import {isIgnored} from './util';
import {loadConfig} from './config';
import LessParser from './parser';
import {join,dirname,relative,resolve} from 'path';
import {writeFileSync, existsSync} from 'fs';
import {glob, log, util as edpUtil, path as edpPath} from 'edp-core';

'use strict';

/**
 * rule 逻辑实现的文件夹路径
 */
const ruleDir = join(__dirname, './rule');

/**
 * less option
 *
 * @type {Object}
 */
let lessOption = {
    // paths: ['.', join(__dirname, '../test/fixture')],
    paths: ['.'],
    relativeUrls: true
};

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

    var invalid = {
        path: '',
        messages: []
    };

    // TODO: 在 parser 之前，应该用 less 本身 parse 一次
    let analyzePromise = new Promise((resolve, reject) => {
        try {
            parser.tokenize();
            parser.loop();

            Object.getOwnPropertyNames(
                realConfig
            ).forEach((prop) => {
                let ruleFilePath = join(ruleDir, prop) + '.js';
                if (existsSync(ruleFilePath)) {
                    require(join(ruleDir, prop)).rule({
                        ast: parser,
                        ruleName: prop,
                        ruleVal: realConfig[prop],
                        fileContent: fileContent,
                        filePath: filePath,
                        errors: invalid.messages
                    });

                    if (invalid.messages.length && invalid.path !== filePath) {
                        invalid.path = filePath;
                        errors.push(invalid);
                    }
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

    return analyzePromise;
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

    // var less = require('less');

    // class TestVisitor extends less.visitors.Visitor {
    //     constructor(tree) {
    //         super(tree);
    //     }
    //     vvv() {
    //         console.log('sss');
    //     }
    // }

    // less.parse(file.content, {}, function (err, root, imports, options) {
    //     if (err) {
    //         console.warn('err', err);
    //     }

    //     var result;
    //     try {
    //         var parseTree = new less.ParseTree(root, imports);
    //         // console.warn(safeStringify(parseTree, null, 4));
    //         // console.warn();
    //         // console.warn();
    //         // console.warn();
    //         result = parseTree.toCSS(options);
    //         var t = new TestVisitor(root);
    //         console.warn(t);
    //         console.warn(t.vvv);
    //         console.warn(t.flatten);
    //         // t.run(parseTree);
    //         // console.warn(less.visitors);
    //         // console.log(safeStringify(t, null, 4));
    //     }
    //     catch (err) {
    //         console.warn('err', err);
    //     }
    //     console.warn(result);

    // });

    return

    /**
     * checkString 的 promise 的 reject 和 resolve 的返回值的结构以及处理方式都是一样的
     * reject 指的是 parse 本身的错误以及 ast.toCSS({}) 的错误，这些代表程序的错误。
     * resolve 代表的是 lesslint 检测出来的问题
     *
     * @param {Array.<Object>} invalidList 错误信息集合
     */
    function callback(invalidList) {
        if (invalidList.length) {
            invalidList.forEach((invalid) => {
                errors.push({
                    path: invalid.path,
                    messages: invalid.messages
                });
            });
        }
        done();
    }

    checkString(file.content, file.path, loadConfig(file.path, true)).then(callback).catch(callback);
}

export {check, checkString};
