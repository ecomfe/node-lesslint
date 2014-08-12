/**
 * @file 0 值检验
 *       属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）
 *       https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('../util');

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
var pattern = new RegExp('\\b0\\s?(' + units.join('|') + ')', 'g');


/**
 * 错误信息
 *
 * @type {string}
 */
var errorMsg = 'No need to specify units when a value is 0'.grey;

/**
 * 模块输出的接口
 * 上下文对象是 LesslintVisitor 实例
 *
 * @param {Object} valueNode ast 节点
 */
module.exports = function (valueNode) {
    var me = this;

    /**
     * ast 结构
     * {
     *     name: [Array|string]
     *     value: [Object]
     * }
     */

    /**
     * 对应 less 属性名称
     * 如果是变量的话，那么是字符串
     * 如果是 css 属性名称，那么是数组， length 为 1
     *
     * eg:
     *     @outerVal: 10px;                 此时 name 为 @outerVal
     *     div {
     *         @innerVal: 1px;              此时 name 为 @innerVal
     *         border: 1px solid #fff;      此时 name 为 [{value: 'border'}]
     *     }
     */
    var name = valueNode.name;

    /**
     * 对应 less 属性值
     * 这个数组的长度为 1 ，因为一个 css 属性只能对应一个值
     *
     * @type {Array}
     */
    var value = valueNode.value.value[0];

    /**
     * 属性值在 ast 上的对应值
     * 当对应值不是 less function 以及不是变量的时候，这个值是字符串
     *
     * eg:
     *     @right-unit: 1px;
     *         propertyValues = [
     *             {
     *                 value: 1
     *                 unit: {
     *                     numerator: ['px'],
     *                     denominator: [],
     *                     backupUnit: undefined
     *                 }
     *             }
     *         ]
     *
     *     以下两个说明了，value 中只要有变量或者 less function 的情况下和直接字符串 value 的区别
     *
     *     padding: 0px 0px;
     *         propertyValues = '0px 0px'
     *
     *     padding: 0px @value;
     *         propertyValues = [
     *             {
     *                 value: 0,
     *                 unit: {
     *                     numerator: ['px'],
     *                     denominator: [],
     *                     backupUnit: undefined
     *                 }
     *             },
     *             {
     *                 name: '@value',
     *                 index: 303,
     *                 currentFileInfo: {...}
     *             }
     *         ]
     *
     *     padding: 0px lighten(@border, 50%);
     *         propertyValues = [
     *             {
     *                 value: 0,
     *                 unit: {
     *                     numerator: ['px'],
     *                     denominator: [],
     *                     backupUnit: undefined
     *                 }
     *             },
     *             {
     *                 name: 'lighten',
     *                 args: [
     *                     {
     *                         value: [
     *                             {
     *                                 name: '@border',
     *                                 index: 336,
     *                                 currentFileInfo: {...}
     *                             }
     *                         ]
     *                     },
     *                     value: [
     *                         {
     *                             value: 50,
     *                             unit: {
     *                                 numerator: ['px'],
     *                                 denominator: [],
     *                                 backupUnit: undefined
     *                             }
     *                         }
     *                     ]
     *                 ]
     *                 index: 383,
     *                 currentFileInfo: {...}
     *             }
     *         ]
     *
     * @type {Array|string}
     */
    var propertyValues = value.value;

    // 说明这个 less 属性对应的值没有变量，以及没有 less function
    if (typeof propertyValues === 'string') {
        if (pattern.test(propertyValues)) {
            me.invalidList.push({
                line: util.getLine(valueNode.index, me.fileData),
                message: '`'
                    + name[0].toCSS({})
                    + ': '
                    + propertyValues.replace(
                            pattern,
                            function ($1) {
                                return 0 + $1.slice(1).yellow
                            }
                        )
                    + '`'
                    + ' '
                    + errorMsg
            });
        }
    }
    else {
        // console.warn(propertyValues, 222);
        // console.log('===============');
        for (var i = 0, len = propertyValues.length; i < len; i++) {
            var propertyValue = propertyValues[i];
            test(propertyValue);
            // // 值为 0
            // if (propertyValue.value === 0) {

            //     // 有单位，单位只有一个，因此可以直接下标获取
            //     if (propertyValue.unit.numerator.length) {
            //         if (units.indexOf(propertyValue.unit.numerator[0]) !== -1) {
            //             if (typeof name === 'string') {
            //                 me.invalidList.push({
            //                     line: util.getLine(valueNode.index, me.fileData),
            //                     message: '`'
            //                         + name
            //                         + ': '
            //                         + propertyValue.value
            //                         + propertyValue.unit.numerator[0]
            //                         + '`'
            //                         + ' '
            //                         + errorMsg
            //                 });
            //             }
            //             else {
            //                 me.invalidList.push({
            //                     line: util.getLine(valueNode.index, me.fileData),
            //                     message: '`'
            //                         + name[0].toCSS({})
            //                         + ': '
            //                         + propertyValue.value
            //                         + propertyValue.unit.numerator[0] + 'ddds'
            //                         + '`'
            //                         + ' '
            //                         + errorMsg
            //                 });
            //             }
            //         }
            //     }
            // }
            // else {
            //     if (propertyValue.type === 'Call') {
            //         var args = propertyValue.args;
            //         for (var j = 0, argsLen = args.length; j < argsLen; j++) {
            //             console.log(args[j].value);
            //             // 这里要递归

            //             // if (args[j].value[0].value === 0) {
            //             //     if (args[j].value[0].unit.numerator.length) {
            //             //         me.invalidList.push({
            //             //             line: util.getLine(propertyValue.index, me.fileData),
            //             //             message: ''
            //             //                 + 'Less function '
            //             //                 + '`'
            //             //                 + propertyValue.name.yellow
            //             //                 + '` args: `'
            //             //                 + args[j].value[0].value
            //             //                 + args[j].value[0].unit.numerator[0].yellow
            //             //                 + '`'
            //             //                 + ' '
            //             //                 + errorMsg
            //             //         });
            //             //     }
            //             // }
            //         }
            //         console.log(999);
            //     }
            // }
        }
    }

    function test(propertyValue) {
        // 值为 0
        if (propertyValue.value === 0) {

            // 有单位，单位只有一个，因此可以直接下标获取
            if (propertyValue.unit.numerator.length) {
                if (units.indexOf(propertyValue.unit.numerator[0]) !== -1) {
                    if (typeof name === 'string') {
                        me.invalidList.push({
                            line: util.getLine(valueNode.index, me.fileData),
                            message: '`'
                                + name
                                + ': '
                                + propertyValue.value
                                + propertyValue.unit.numerator[0]
                                + '`'
                                + ' '
                                + errorMsg
                        });
                    }
                    else {
                        me.invalidList.push({
                            line: util.getLine(valueNode.index, me.fileData),
                            message: '`'
                                + name[0].toCSS({})
                                + ': '
                                + propertyValue.value
                                + propertyValue.unit.numerator[0] + 'ddds'
                                + '`'
                                + ' '
                                + errorMsg
                        });
                    }
                }
            }
        }
        else {
            if (propertyValue.type === 'Call') {
                var args = propertyValue.args;
                for (var j = 0, argsLen = args.length; j < argsLen; j++) {
                    console.log(args[j], args[j].value, 888);
                    test(args[j]);

                    // if (args[j].value[0].value === 0) {
                    //     if (args[j].value[0].unit.numerator.length) {
                    //         me.invalidList.push({
                    //             line: util.getLine(propertyValue.index, me.fileData),
                    //             message: ''
                    //                 + 'Less function '
                    //                 + '`'
                    //                 + propertyValue.name.yellow
                    //                 + '` args: `'
                    //                 + args[j].value[0].value
                    //                 + args[j].value[0].unit.numerator[0].yellow
                    //                 + '`'
                    //                 + ' '
                    //                 + errorMsg
                    //         });
                    //     }
                    // }
                }
            }

            if (propertyValue.type === 'Expression') {
                // console.warn(propertyValue.value);
                // test(propertyValue.value);
            }
        }
    }

    // console.log(require('util').inspect(propertyValues, { showHidden: true, depth: null }));



    /*var childNode = valueNode.value.value[0];
    if (childNode.type === 'Expression') {
        // if (childNode.value[0].type === 'Dimension') {
            for (var i = 0, len = childNode.value.length; i < len; i++) {

            }
            // console.log(childNode.value, valueNode.index);
        // }
        return
    }*/






    // var cssText = valueNode.toCSS({});
    // if (valueNode.name) {
    //     if (typeof valueNode.name !== 'string') {
    //         cssText = cssText.replace(
    //             '[object Object]',
    //             valueNode.name[0].toCSS({})
    //         );
    //     }
    // }
    // if (pattern.test(cssText)) {
    //     me.invalidList.push({
    //         line: util.getLine(valueNode.index, me.fileData),
    //         message: '`'
    //             + cssText.replace(
    //                     pattern,
    //                     function ($1) {
    //                         return 0 + $1.slice(1).yellow
    //                     }
    //                 )
    //             + '`'
    //             + ' '
    //             + errorMsg
    //     });
    // }
};
