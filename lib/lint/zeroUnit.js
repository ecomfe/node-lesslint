/**
 * @file 0 值检验
 *       属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * 属性值为 0 时，可省的单位集合
 *
 * @type {Array}
 */
var units = [
    '%',
    'in',
    'cm',
    'mm',
    'em',
    'ex',
    'pt',
    'pc',
    'px'
];

/**
 * 匹配 0 值后的单位的正则
 *
 * @type {RegExp}
 */
var pattern = new RegExp('\\b0\\s?(' + units.join('|') + ')');

function checkType(value) {
    var ret = value.value;
    var is = true;
    if (ret && ret.length) {
        for (var i = 0, len = ret.length; i < len; i++) {
            // console.log(ret[i].type, 9999);
            if (ret[i].type === 'Variable'
                || ret[i].type === 'Call'
            ) {
                is = false;
                break;
            }

            checkType(ret[i]);
        }
    }
    return is;
}

/**
 * 规则检测
 *
 * @param {Array} rules ast 上的规则
 * @param {Function} callback 回调函数
 * @return {[type]} [description]
 */
function checkRules(rules, data, callback) {
    rules.forEach(
        function (rule) {
            // var value = rule.value;
            // console.log(rule.rules);

            // if (rule.rules && Array.isArray(rule.rules)) {
            //     checkRules(rule.rules, data, callback);
            // }
            // else {
            //     aa(rule.value);
            // }

            var value = rule.value;
            var cssText = '';

            // 是 Value 类型的 rule
            if (value && value.type === 'Value') {

                try {
                    cssText = value.toCSS({});
                }
                catch (e) {

                    function aa(v) {
                        if (v.type === 'Call') {
                            for (var i = 0, len = v.args.length; i < len; i++) {
                                if (aa(v.args[i])) {
                                    break;
                                }
                            }
                        }
                        else if (v.type === 'Variable') {
                            debugger
                            console.log(v);
                            console.log(cssText);
                            return callback({
                                index: v.index,
                                message: 'asdasdasdas'
                            });
                            return 1;
                        }
                        else {
                            if (v.value && Array.isArray(v.value)) {
                                for (var i = 0, len = v.value.length; i < len; i++) {
                                    if (aa(v.value[i])) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    aa(value);
                    console.log(value.value[0].value[0].unit);
                    console.log(value.value[0].value[1].unit);
                    // console.log(value.value[1].value);
                    // console.log(value.value);
                    // console.log(value.type);
                    // console.log(e);
                }

                /**
                 * 在 less 中如下情况
                 * div {
                 *     width: @testVal
                 * }
                 * 那么 toCSS 的时候会报错，因此这里避免掉这种情况
                 */
                // if (value.value[0].value[0].type === 'Variable'
                //     || value.value[0].value[0].type === 'Call'
                // ) {
                //     return;
                // }
                // try {
                    // cssText = value.toCSS({});
                // }
                // catch (e) {
                //     debugger
                //     function getLine(index, data) {
                //         var str = data.slice(0, index);
                //         return (str.match(/\n/g) || '').length + 1;
                //     }
                //     console.log(e);
                //     console.log(rule);
                //     // console.warn(value.value[0].value[0]);
                //     console.log('Line: ' + getLine(rule.index, data));
                // }
                if (pattern.test(cssText)) {
                    callback({
                        index: rule.index,
                        message: '`'
                            + cssText
                            + '`'
                            + ' '
                            + 'No need to specify units when a value is 0'
                    });
                }
            }

            if (rule.rules) {
                checkRules(rule.rules, data, callback);
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

    checkRules(rules, data, callback);
};
