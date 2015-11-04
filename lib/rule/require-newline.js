/**
 * @file 选择器检验
 *       当多个选择器共享一个声明块时，每个选择器声明必须（MUST）独占一行。
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%80%89%E6%8B%A9%E5%99%A8
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

var chalk = require('chalk');

var msg = 'When multiple selectors share a statement block, each selector statement must be per line';

/**
 * 当前已经检测过的 rule 的 selectorsFlag 集合
 *
 * @type {Array}
 */
var checkedRuleSelectorsFlags = [];

/**
 * 分析选择器组
 *
 * @param {Object} realVal rule.realVal
 * @param {string} ruleName 当前的规则名称
 */
function analyzeSelectors(realVal, ruleName) {
    var me = this; // me 指 lesslintVisitor 实例

    // 参照的行号
    var refLineNum = -1;

    // 缓存上一个 lineNum
    var lastLineNumCache = -1;

    var selectors = realVal.selectors;
    // console.log(require('util').inspect(selectors,{showHidden: true, depth: null}));


    selectors.forEach(
        function (selector) {
            // elements 是指选择器的元素，是一个数组
            // 例如： h1 > a {...} 那么 elements 就是 [h1, a] ，数组长度为 2，其中 a 的 combinator.value 为 >
            // 如果是 h1 {...} 那么 elements 就是 [h1] ，数组长度为 1
            // 因此判断 当多个选择器共享一个声明块时，每个选择器声明是否独占一行时，
            // 只需要拿 当前 selector.elements[0] 的行号和下一个 selector.elements[0] 的行号是否在一行即可
            // 当然，如果像如下的写法，这种判断是有问题的
            // h1 >
            //     a {...}

            // 这里不用循环 realVal.selectors.elements 了，
            // 因为 realVal.selectors.elements 这个数组里的选择器就是 { 前面的那一坨，，
            var element = selector.elements[0];

            var curLineNum = util.getLine(element.index, me.fileData);

            // console.warn(curLineNum);
            // console.warn(refLineNum, curLineNum);
            var lineContent = util.getLineContent(curLineNum, me.fileData);

            // var tmpIndex = 0;
            // console.log(require('util').inspect(selector,{showHidden: true, depth: null}));
            // 第一个
            if (refLineNum === -1) {
                refLineNum = curLineNum;
                lastLineNumCache = curLineNum;
            }
            else {
                if (refLineNum === curLineNum
                    || lastLineNumCache === curLineNum
                ) {

                    // var cssText = util.trim(selector.toCSS({}));

                    /**
                     * 类似如下 less
                     * .@{prefix}-aa,.@{prefix}-bb {
                     *     padding-left: 12px;
                     * }
                     * 这里 selectorStrCache 就是为了获取 .@{prefix}-bb 便于之后高亮报错
                     */
                    var selectorStrCache = '';
                    selector.elements.forEach(
                        function (elem) {
                            var v = elem.value;
                            // console.log(v);
                            if (typeof v !== 'string') {
                                if (v.name) {
                                    v = '@{' + v.name.replace('@', '') + '}';
                                }
                            }
                            selectorStrCache += elem.combinator.toCSS({}) + v;
                            // var v;
                            // if (typeof elem.value === 'string') {
                            //     v = elem.value;
                            // }
                            // else {
                            //     v = '@{' + elem.value.name.replace('@', '') + '}';
                            // }
                            // selectorStrCache += elem.combinator.toCSS({}) + v;
                        }
                    );

                    me.invalidList.push({
                        ruleName: ruleName,
                        line: curLineNum,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + lineContent.replace(
                                selectorStrCache,
                                chalk.magenta(selectorStrCache)
                            )
                            // + lineContent.replace(
                            //     new RegExp(cssText, 'g'),
                            //     function ($1, $2) {
                            //         if (lineContent.slice(tmpIndex, $2).indexOf(',') !== -1) {
                            //             return $1.magenta;
                            //         }
                            //         else {
                            //             return $1;
                            //         }
                            //         tmpIndex = $2;
                            //     }
                            // )
                            + '` '
                            + chalk.grey(msg)
                    });
                }
                lastLineNumCache = curLineNum;
            }
        }
    );
}

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * 如下例子无法检测
 * h4, h5{
 *     i, em {
 *         width: 50px;
 *     }
 * }
 * 其中 h4, h5 这一组选择器无法检测
 *
 * @param {Object} rule ast 节点中 rules 的每个 item
 * @param {string} ruleName 当前的规则名称
 */
module.exports = function (rule, ruleName) {
    var me = this;

    // 当前 rule 上的 realVal
    var realVal = rule.realVal;

    // 当前 rule 的 name
    var name = realVal.name;

    if (Array.isArray(name)) {
        try {
            name = name[0].toCSS({});
        }
        catch (e) {
            name = name[0].name;
        }
    }

    if (realVal.selectors) {

        // 说明之前已经检测过这个 rule 所在的选择器组了
        if (checkedRuleSelectorsFlags.length
            && checkedRuleSelectorsFlags.indexOf(rule.selectorsFlag) !== -1
        ) {
            return;
        }

        checkedRuleSelectorsFlags.push(rule.selectorsFlag);

        var length = realVal.selectors.length;

        // 说明这个选择器组有一个以上的选择器
        // eg:
        // h1, h2 {
        //     ...
        // }
        if (length > 1) {
            analyzeSelectors.call(me, realVal, ruleName);
        }

    }
};
