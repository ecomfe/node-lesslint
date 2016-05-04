/**
 * @file 通用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

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
    var accum = new Array(Math.max(0, n));
    for (var i = 0; i < n; i++) {
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
function formatMsg(msg, spaceCount) {
    let space = '';
    spaceCount = spaceCount || 0;
    times(spaceCount, () => {
        space += ' ';
    });
    return space + msg;
}

/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} patterns minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
function getCandidates(args, patterns) {
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
function getIgnorePatterns(file) {
    if (!existsSync(file)) {
        return [];
    }

    let patterns = readFileSync(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter((item) => {
        return item.trim().length > 0 && item[0] !== '#';
    });
}

var _IGNORE_CACHE = {};

/**
 * 判断一下是否应该忽略这个文件.
 *
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
function isIgnored(file, name) {
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

    var dirname = edpPath.relative(bizOrPkgRoot, file);
    var isMatch = glob.match(dirname, Object.keys(ignorePatterns));

    return isMatch;
}

/**
 * 目录配置信息的缓存数据
 * @ignore
 */
var _CONFIG_CACHE = {};

/**
 * 读取默认的配置信息，可以缓存一下.
 *
 * @param {string} configName 配置文件的名称.
 * @param {string} file 文件名称.
 * @param {Object=} defaultConfig 默认的配置信息.
 *
 * @return {Object} 配置信息
 */
function getConfig(configName, file, defaultConfig) {
    var dir = edpPath.dirname(edpPath.resolve(file));
    var key = configName + '@' + dir;

    if (_CONFIG_CACHE[key]) {
        return _CONFIG_CACHE[key];
    }

    var options = {
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

    var value = edpUtil.getConfig(dir, options);

    _CONFIG_CACHE[key] = value;

    return value;
}


export {formatMsg, getCandidates, getIgnorePatterns, isIgnored, getConfig};