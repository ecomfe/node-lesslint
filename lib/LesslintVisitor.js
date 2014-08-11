/**
 * @file LesslintVisitor 基类
 * @author ielgnaw(wuji0223@gmail.com)
 */

var path = require('path');
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
    this.candidateConfigs = options.candidateConfigs || {};

    /**
     * 不合法的信息集合
     *
     * @type {Array<Object>}
     */
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
 * LesslintVisitor exec
 *
 * @param {Object} root astRoot
 */
LesslintVisitor.prototype.exec = function (root) {
    var me = this;
    me._astRoot = root;
    me._visitor.visit(root);

    // var rules = root.rules;

    // rules.forEach(
    //     function (rule) {
    //         var lowerKey = rule.type.toLowerCase();
    //         console.log(me.candidateRulesConfig[lowerKey], lowerKey);
    //         me.candidateRulesConfig[lowerKey](me, rule)
    //         // console.warn(me.candidateRulesConfig[lowerKey]);
    //         // (me.candidateRulesConfig[lowerKey]).call(me, rule);
    //         // if (me.candidateRulesConfig[lowerKey]) {
    //             // require(me.candidateRulesConfig[lowerKey]).call(me, rule);
    //         // }
    //     }
    // );

    var rules = root.rules;
    checkRules.call(me, rules);
};

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
