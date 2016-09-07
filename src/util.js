/**
 * @file 通用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import {statSync, existsSync, readFileSync} from 'fs';
import {glob, log, util as edpUtil, path as edpPath} from 'edp-core';

'use strict';

/**
 * 调用给定的迭代函数 n 次,每一次传递 index 参数，调用迭代函数。
 * from underscore
 *
 * @param {number} n 迭代次数
 * @param {Function} iterator 处理函数
 * @param {Object} context 上下文
 *
 * @return {Array} 结果
 */
function times(n, iterator, context) {
    const accum = new Array(Math.max(0, n));
    for (let i = 0; i < n; i++) {
        accum[i] = iterator.call(context, i);
    }
    return accum;
}


/**
 * 格式化信息
 *
 * @param {string} msg 输出的信息
 * @param {number} spaceCount 信息前面空格的个数即缩进的长度
 *
 * @return {string} 格式化后的信息
 */
export function formatMsg(msg, spaceCount) {
    let space = '';
    spaceCount = spaceCount || 0;
    times(spaceCount, () => {
        space += ' ';
    });
    return space + msg;
}

/**
 * 去掉 error.messages 里面重复的信息
 *
 * @param {Array} msg error.messages
 *
 * @return {Array} 结果数组，是一个新数组
 */
export function uniqueMsg(msg) {
    let ret = [];
    let tmp = [];
    for (let i = 0, j = 1, len = msg.length; i < len; i++, j++) {
        let cur = msg[i];
        if (!cur.uniqueFlag) {
            ret.push(cur);
        }
        else {
            if (tmp.indexOf(cur.uniqueFlag) === -1) {
                tmp.push(cur.uniqueFlag);
                ret.push(cur);
            }
        }
    }
    return ret;
}


/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} patterns minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
export function getCandidates(args, patterns) {
    let candidates = [];

    args = args.filter((item) => {
        return item !== '.';
    });

    if (!args.length) {
        candidates = glob.sync(patterns);
    }
    else {
        let i = -1;
        let len = args.length;
        while (++i < len) {
            let target = args[i];
            if (!existsSync(target)) {
                log.warn('No such file or directory %s', target);
                continue;
            }

            let stat = statSync(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(
                    candidates,
                    glob.sync(target + '/' + patterns[0])
                );
            }
            /* istanbul ignore else */
            else if (stat.isFile()) {
                candidates.push(target);
            }
        }
    }

    return candidates;
}

/**
 * 获取忽略的 pattern
 *
 * @param {string} file 文件路径
 *
 * @return {Array.<string>} 结果
 */
export function getIgnorePatterns(file) {
    if (!existsSync(file)) {
        return [];
    }

    let patterns = readFileSync(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter((item) => {
        return item.trim().length > 0 && item[0] !== '#';
    });
}

const _IGNORE_CACHE = {};

/**
 * 判断一下是否应该忽略这个文件.
 *
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
export function isIgnored(file, name) {
    let ignorePatterns = null;

    name = name || '.jshintignore';
    file = edpPath.resolve(file);

    let key = name + '@'  + edpPath.dirname(file);
    if (_IGNORE_CACHE[key]) {
        ignorePatterns = _IGNORE_CACHE[key];
    }
    else {
        let options = {
            name: name,
            factory: (item) => {
                let config = {};
                getIgnorePatterns(item).forEach((line) => {
                    config[line] = true;
                });
                return config;
            }
        };
        ignorePatterns = edpUtil.getConfig(
            edpPath.dirname(file),
            options
        );

        _IGNORE_CACHE[key] = ignorePatterns;
    }

    let bizOrPkgRoot = process.cwd();

    try {
        bizOrPkgRoot = edpPath.getRootDirectory();
    }
    catch (ex) {
    }

    const dirname = edpPath.relative(bizOrPkgRoot, file);
    const isMatch = glob.match(dirname, Object.keys(ignorePatterns));

    return isMatch;
}

/**
 * 目录配置信息的缓存数据
 * @ignore
 */
const _CONFIG_CACHE = {};

/**
 * 读取默认的配置信息，可以缓存一下.
 *
 * @param {string} configName 配置文件的名称.
 * @param {string} file 文件名称.
 * @param {Object=} defaultConfig 默认的配置信息.
 *
 * @return {Object} 配置信息
 */
export function getConfig(configName, file, defaultConfig) {
    const dir = edpPath.dirname(edpPath.resolve(file));
    const key = configName + '@' + dir;

    if (_CONFIG_CACHE[key]) {
        return _CONFIG_CACHE[key];
    }

    const options = {
        name: configName,
        defaultConfig: defaultConfig,
        factory: function (item) {
            /* istanbul ignore if */
            if (!existsSync(item)) {
                return null;
            }

            return JSON.parse(readFileSync(item, 'utf-8'));
        }
    };

    const value = edpUtil.getConfig(dir, options);

    _CONFIG_CACHE[key] = value;

    return value;
}

/**
 * 根据行号获取当前行的内容
 *
 * @param {number} line 行号
 * @param {string} fileData 文件内容
 * @param {boolean} notRemoveSpace 不去掉前面的空格，为 true，则不去掉，为 false 则去掉
 *                                 这是后加的参数，为了兼容之前的代码
 *
 * @return {string} 当前行内容
 */
export function getLineContent(line, fileData, notRemoveSpace) {
    if (notRemoveSpace) {
        return fileData.split('\n')[line - 1];
    }
    // 去掉前面的缩进
    return fileData.split('\n')[line - 1].replace(/^\s*/, '');
}

/**
 * 根据索引把一行内容中的某个子串变色
 * 直接用正则匹配的话，可能会把这一行所有的 colorStr 给变色，所以要通过索引来判断
 *
 * @param {string} source 源字符串
 * @param {number} startIndex 开始的索引，通常是 col
 * @param {string} colorStr 要变色的字符串
 *
 * @return {string} 改变颜色后的字符串
 */
export function changeColorByIndex(source, startIndex, colorStr) {
    let ret = '';
    if (source) {
        const colorStrLen = colorStr.length;
        const endIndex = startIndex + colorStrLen;
        ret = ''
            + source.slice(0, startIndex) // colorStr 前面的部分
            + chalk.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
            + source.slice(endIndex, source.length); // colorStr 后面的部分
    }
    return ret;
}

/**
 * 根据开始和结束的索引来高亮字符串的子串
 *
 * @param {string} source 源字符串
 * @param {number} startIndex 开始的索引
 * @param {number} endIndex 结束的索引
 *
 * @return {string} 改变颜色后的字符串
 */
export function changeColorByStartAndEndIndex(source, startIndex, endIndex) {
    if (!source) {
        return '';
    }

    startIndex -= 1;
    endIndex -= 1;

    return ''
        + source.slice(0, startIndex) // colorStr 前面的部分
        + chalk.magenta(source.slice(startIndex, endIndex)) // colorStr 的部分
        + source.slice(endIndex, source.length); // colorStr 后面的部分
}

/**
 * 把错误信息放入 errors 数组中
 *
 * @param {string} ruleName 规则名称
 * @param {number} line 行号
 * @param {number} col 列号
 * @param {string} message 错误信息
 * @param {string} colorMessage 彩色错误信息
 */
// function addInvalidList(ruleName, line, col, message, colorMessage) {
//     this.push({
//         ruleName: ruleName,
//         line: line,
//         col: col,
//         message: message,
//         colorMessage: colorMessage
//     });
// }
