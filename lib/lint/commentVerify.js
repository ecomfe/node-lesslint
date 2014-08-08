/**
 * @file 注释检验
 *       单行注释尽量使用 // 方式
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * 匹配注释的正则
 *
 * @type {RegExp}
 */
var pattern = /^\/\*.*[\n]*.*\*\//;


/**
 * 规则检测
 *
 * @param {Array} rules ast 上的规则
 * @param {Function} callback 回调函数
 */
function checkRules(rules, callback) {
    rules.forEach(
        function (rule) {
            var value = rule.value;
            var type = rule.type;
            var cssText = '';
            // console.log(rule.type);

            if (type === 'Comment') {
                cssText = rule.toCSS({});
                if (pattern.test(cssText)) {
                    callback({
                        index: rule.index,
                        message: '`'
                            + cssText
                            + '`'
                            + ' '
                            + 'Single Comment should be use `//`'
                    });
                }
            }

            if (rule.rules) {
                checkRules(rule.rules, callback);
            }
        }
    );
}

/**
 * 模块输出的接口
 *
 * @param {Object} ast less 语法树
 * @param {string} data 文件内容
 */
module.exports = function (ast, data, callback) {

    var rules = ast.rules;

    // 如果语法树上没有需要校验的 rules ，直接返回
    if (!rules) {
        return;
    }

    checkRules(rules, callback);
};
