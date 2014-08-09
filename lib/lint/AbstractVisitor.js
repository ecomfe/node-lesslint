/**
 * @file AbstractVisitor 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

var tree = require('less/lib/less/tree');

/**
 * AbstractVisitor 类
 *
 * @param {Object} options 配置项
 * @param {string} options.fileData 当前检测的less文件内容
 * @param {string} options.env 环境信息
 *
 * @constructor
 */
function AbstractVisitor(options) {
    this.fileData = options.fileData;
    this._visitor = new tree.visitor(this);
    this._env = options.env;

    /**
     * 不合法的信息集合
     *
     * @type {Array<Object>}
     */
    this.invalidList = [];
}

/**
 * AbstractVisitor exec
 *
 * @param {Object} root astRoot
 */
AbstractVisitor.prototype.exec = function (root) {
    var me = this;
    me._astRoot = root;
    me._visitor.visit(root);
};


module.exports = exports = AbstractVisitor;

