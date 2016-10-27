/**
 * @file 对配置文件的读取合并等等
 * @author ielgnaw(wuji0223@gmail.com)
 */

import Manis from 'manis';
import {join} from 'path';
import yaml from 'js-yaml';

'use strict';

let STORAGE = null;

/**
 * 获取 merge 后的配置文件
 * 用户自定义的配置文件优先级 .lesslintrc > config.yml > config.json
 *
 * @param {string} filePath 待检查的文件路径，根据这个路径去寻找用户自定义的配置文件，然后和默认的配置文件 merge
 * @param {boolean} refresh 是否强制刷新内存中已经存在的配置
 *
 * @return {Object} merge 后的配置对象
 */
export function loadConfig(filePath, refresh) {
    if (refresh && STORAGE) {
        return STORAGE;
    }

    let manis = new Manis({
        files: [
            '.lesslintrc'
        ],
        loader(content) {
            if (!content) {
                return '';
            }
            let ret;
            try {
                ret = yaml.load(content);
            }
            catch (e) {}
            return ret;
        }
    });

    manis.setDefault(join(__dirname, './config.yml'));

    STORAGE = manis.from(filePath);

    return STORAGE;
}

/**
 * 清空 STORAGE
 */
export function clearStorage() {
    STORAGE = null;
}
