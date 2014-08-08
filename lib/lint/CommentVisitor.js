/**
 * @file 注释检验
 * @author ielgnaw(wuji0223@gmail.com)
 */

var AbstractVisitor = require('./AbstractVisitor');

AbstractVisitor.prototype.visitComment = function (node, visitArgs) {
    var me = this;
    console.log(node.toCSS(), 11111);
    // var pattern = /^\/\*.*[\n]*.*\*\//;
    // var value = node.value;
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
