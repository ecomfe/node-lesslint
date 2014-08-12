/**
 * @file LesslintVisitor 基类
 *       这个类里会遍历 less ast 的 rules ，根据 rule 的类型去加载 lint 目录下不同的检测文件
 * @author ielgnaw(wuji0223@gmail.com)
 */

var path = require('path');
var fs = require('fs');
var tree = require('less/lib/less/tree');

var util = require('./util');

/**
 * LesslintVisitor 类
 *
 * @param {Object} options 配置项
 * @param {string} options.fileData 当前检测的less文件内容
 * @param {string} options.env 环境信息
 *
 * @constructor
 */
function LesslintVisitor(options) {
    this.fileData = options.fileData;
    this._visitor = new tree.visitor(this);
    this._env = options.env;

    // 需要检测的规则配置
    this.detectConfigs = options.detectConfigs || {};

    // 不合法的信息集合
    this.invalidList = [];
}

/**
 * less 文件中 @import 的标记，值为 rules 的索引，默认为 -1 不存在
 *
 * @type {number}
 */
var importFlag = -1;

function checkRules(rules) {
    var me = this;
    rules.forEach(
        function (rule, index) {
            var lintPath = '';
            var lowerType = rule.type.toLowerCase();
            if (rule.type === 'Rule' || rule.type === 'Ruleset') {
                if (rule.variable) {
                    if (typeof rule.variable !== 'function') {
                        // TODO: 这里先写死 zeroUnit ，继续找规律
                        if (me.candidateConfigs['zeroUnit']) {
                            lintPath = path.join(__dirname, 'lint', 'zeroUnit');
                            require(lintPath).call(me, rule);
                        }

                        if (me.candidateConfigs['variableName']) {
                            lintPath = path.join(__dirname, 'lint', 'variableName');
                            require(lintPath).call(me, rule);
                        }
                    }
                    else {
                        checkRules.call(me, rule.rules);
                    }
                }
                else {
                    if (me.candidateConfigs['zeroUnit']) {
                        lintPath = path.join(__dirname, 'lint', 'zeroUnit');
                        require(lintPath).call(me, rule);
                    }


                    /*if (rule.value.value[0].type === 'Anonymous') {
                        if (me.candidateConfigs['zeroUnit']) {
                            lintPath = path.join(__dirname, 'lint', 'zeroUnit');
                            require(lintPath).call(me, rule);
                        }
                    }
                    else if (rule.value.value[0].type === 'Expression') {
                        // if (rule.value.value[0].value[0].type === 'Dimension') {
                            // console.log(rule.value.value[0].value);
                        // }
                        if (me.candidateConfigs['zeroUnit']) {
                            lintPath = path.join(__dirname, 'lint', 'zeroUnit');
                            require(lintPath).call(me, rule);
                        }


                        // console.log(rule.value.value[0].value[0].type);
                        // console.log(rule.value.value[0].value[0]);
                        // console.log(rule.value.value[0].value[0]);
                    }*/
                }
            }
            else if (rule.type === 'Comment') {
                if (me.candidateConfigs[lowerType]) {
                    lintPath = path.join(__dirname, 'lint', lowerType);
                    require(lintPath).call(me, rule);
                }
            }
            else if (rule.type === 'Import') {
                if (me.candidateConfigs['importRules']) {
                    // 当前文件的第一个 @import
                    if (importFlag === -1) {
                        // 说明这个 @import 不是第一个 rule 了
                        if (index > 0) {
                            me.importOrderError = 1;
                        }
                        else {
                            importFlag = index;
                        }
                    }
                    // 当前文件之前已经有 @import 了，
                    // 那么需要看当前这个 @import 是否和之前的 @import 紧靠在一起即 rule 的 index 是否相差 1
                    else {
                        if (Math.abs(importFlag - index) > 1) {
                            me.importOrderError = 1;
                        }
                    }
                    lintPath = path.join(__dirname, 'lint', 'importRules');
                    require(lintPath).call(me, rule);
                }
            }
        }
    )
}

/**
 * 遍历当前这个 less 文件里 ast 上的 rules
 *
 * @param {Array} rules ast rules
 */
function detectRules(rules) {
    var me = this;  // me 指 lesslintVisitor 实例
    rules.forEach(
        function (rule) {

            // me.detectConfigs 里的每个配置都要运行，粒度是每个 rule
            for (var i in me.detectConfigs) {
                me.detectConfigs[i].call(me, rule);
            }
        }
    )
}

/**
 * LesslintVisitor exec
 *
 * @param {Object} root astRoot
 * @param {Array.<Object>} root.rules 根节点的 rules
 *
 */
LesslintVisitor.prototype.exec = function (root) {
    var me = this;
    me._astRoot = root;
    me._visitor.visit(root);

    // console.log(require('util').inspect(root, { showHidden: true, depth: null }));
    me.detectConfigs = analyzeConfigs.call(me);
    detectRules.call(me, root.rules);
};

/**
 * 解析 me.detectConfigs
 */

/**
 * 解析需要检测的规则配置，生成真正需要检测的配置
 * 会把不需要检测的配置从 me.detectConfigs 中过滤掉，需要检测的换成 lint 文件里的 exports
 *
 * @return {Object} 真正需要检测的配置
 */
function analyzeConfigs() {
    var ret = {};
    var me = this;
    fs.readdirSync(
        path.join(__dirname, 'lint')
    ).forEach(
        function (fileName) {
            fileName = fileName.replace(/\.js$/, '');
            if (me.detectConfigs[fileName]) {
                // 这个文件是肯定存在的，因为这里是以 lint 里的文件来循环的
                ret[fileName] = require(path.join(__dirname, 'lint', fileName));
            }
        }
    );
    return ret;
}

/**
 * 匹配注释的正则
 *
 * @type {RegExp}
 */
// var pattern = /^\/\*.*[\n]*.*\*\//;

// LesslintVisitor.prototype.visitComment = function (commentNode, visitArgs) {
//     var me = this;
//     var cssText = commentNode.toCSS({});
//     var index = commentNode.index || 0;
//     // console.log(util.getLocation(index, me.fileData), util.getLine(index, me.fileData));
//     if (pattern.test(cssText)) {
//         me.invalidList.push({
//             line: util.getLine(index, me.fileData),
//             message: '`'
//                 + cssText
//                 + '`'
//                 + ' '
//                 + 'Single Comment should be use `//`'
//         });
//     }
// };

// LesslintVisitor.prototype.visitRule = function (ruleNode, visitArgs) {
//     var me = this;
//     debugger
//     console.log(ruleNode.name, ruleNode.variable);
// }


module.exports = exports = LesslintVisitor;
