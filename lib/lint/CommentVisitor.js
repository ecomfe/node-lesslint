/**
 * @file 注释检验
 *       直接在 AbstractVisitor 挂载 visitComment 方法
 *       是因为在调用处我们只调用 AbstractVisitor 实例的 exec 方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

var AbstractVisitor = require('./AbstractVisitor');

var meUtil = require('../util');


/**
 * 匹配注释的正则
 *
 * @type {RegExp}
 */
var pattern = /^\/\*.*[\n]*.*\*\//;

AbstractVisitor.prototype.visitComment = function (commentNode, visitArgs) {
    var me = this;
    // var value = commentNode.value;
    var cssText = commentNode.toCSS({});
    var index = commentNode.index || 0;
    if (pattern.test(cssText)) {
        me.invalidList.push({
            index: index,
            message: '`'
                + cssText
                + '`'
                + ' '
                + 'Single Comment should be use `//`'
        });
    }


    // if (pattern.test(value)) {
    //     console.log(commentNode.typeIndex);
        // console.log(meUtil.getLine(commentNode.index, me.fileData));
    //     console.log(commentNode);
    //     console.log(value);
    // }
    // var pattern = /^\/\*.*[\n]*.*\*\//;
    // var value = commentNode.value;
    // if ( pattern.test( value ) ) {
    //     me.invalidList.push( {
    //         type: 'COMMENT',
    //         content: 'Invalid comment: `'
    //                     + value.replace(/\n*/g, '')   // replace是为了提示信息在一行
    //                     + '`, 单行注释尽量使用 // 方式。'
    //     } );
    // }
};
//

// function CommentVisitor(options) {
//     AbstractVisitor.call(this, options);
// }

// /**
//  * 注释接口
//  * 单行注释尽量（SHOULD）使用 // 方式。
//  *
//  * @param {Object} node AST node
//  *
//  * @see https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
//  */
// CommentVisitor.prototype.visitComment = function (node, visitArgs) {
//     var me = this;
//     console.log(me);
//     // var pattern = /^\/\*.*[\n]*.*\*\//;
//     // var value = node.value;
//     // if ( pattern.test( value ) ) {
//     //     me.invalidList.push( {
//     //         type: 'COMMENT',
//     //         content: 'Invalid comment: `'
//     //                     + value.replace(/\n*/g, '')   // replace是为了提示信息在一行
//     //                     + '`, 单行注释尽量使用 // 方式。'
//     //     } );
//     // }
// };


// module.exports = exports = CommentVisitor;
