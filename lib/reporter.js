/**
 * @file reporter 校验错误信息输出
 * @author chris[wfsr@foxmail.com]
 */

var edp = require('edp-core');

/**
 * 校验错误信息输出报告
 * 
 * @param {Array.<{path, error}>} errors 校验错误数据信息
 */
exports.report = function (errors) {
    errors.forEach(function (error) {
        edp.log.info(error.path);
        error.messages.forEach(function (message) {
            var msg = '→ ';
            // 全局性的错误可能没有位置信息
            if (typeof message.line === 'number') {
                msg += ('line ' + message.line);
                if (typeof message.col === 'number') {
                    msg += (', col ' + message.col);
                }
                msg += ': ';
            }

            msg += message.message;
            edp.log.warn(msg);
        });
        console.log();
    });
};
