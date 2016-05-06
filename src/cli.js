/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {createReadStream} from 'fs';
import chalk from 'chalk';
import sys from '../package';
import {formatMsg, getCandidates} from './util';
import {check} from './checker';

'use strict';

/**
 * 显示默认的信息
 */
function showDefaultInfo() {
    console.warn(sys);
    console.log('');
    console.log((sys.name + ' v' + sys.version));
    console.log(chalk.bold.green(formatMsg(sys.description)));
}


/**
 * 校验结果报告
 *
 * @inner
 * @param {Object} errors 按文件类型为 key，值为对应的校验错误信息列表的对象
 */
function report(errors) {
    // console.warn(errors);
}

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
function parse(args) {
    args = args.slice(2);

    // 不带参数时，默认检测当前目录下所有的 less 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    let patterns = [
        '**/*.less',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    let candidates = getCandidates(args, patterns);

    let count = candidates.length;

    if (!count) {
        return;
    }

    // 错误信息的集合
    let errors = [];

    /**
     * 每个文件的校验结果回调，主要用于统计校验完成情况
     *
     * @inner
     */
    let callback = () => {
        count--;
        if (!count) {
            report(errors);
        }
    };

    // 遍历每个需要检测的 less 文件
    candidates.forEach((candidate) => {
        let readable = createReadStream(candidate, {
            encoding: 'utf8'
        });
        readable.on('data', (chunk) => {
            let file = {
                content: chunk,
                path: candidate
            };
            check(file, errors, callback);
        });
        readable.on('error', (err) => {
            throw err;
        });
    });
}

export {parse};