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
 * 分析每个 rule 的 value ，把 value 中的值挂载到 realVal 上
 *
 * @param {Object|Array|number|string} value 当前 rule 中的 value
 * @param {string=|Array=} name rule 的名称
 * @param {Object=} unit rule 的单位
 * @param {number=} index rule 在 ast 上的索引
 * @param {string=} type rule 的类型，type 是指 rule 的 type ，而不是 value 里面的 rule 的 type
 */
function analyzeValue(value, name, unit, index, type) {
    var me = this;
    // debugger

    if (Array.isArray(value)) {
        for(var i = 0; i < value.length; i++) {
            analyzeValue.call(
                me,
                value[i],
                value.name || name,
                value.unit || unit,
                value.index || index,
                value.type || type
            );
            // if (value.length > (i + 1)) {
            //     console.log(value, value.realVal, 'aaaaaaaaaaaa'.green);
            // }
        }
    }
    else {
        if (value.value || value.value === 0) {
            analyzeValue.call(
                me,
                value.value,
                value.name || name,
                value.unit || unit,
                value.index || index,
                value.type || type
            );
        }
        else {
            me.realVal.name = name;
            me.realVal.unit = unit;
            me.realVal.index = index || 0;
            me.realVal.type = type || value.type;
            me.realVal.values.push({
                value: value,
                unit: unit
            });
            // 说明 value 中有变量或者 less function
            if (typeof value === 'object') {
                if (require('less/lib/less/tree').functions[value.name]) {
                    me.realVal.refFuncs.push({
                        name: value.name,
                        args: value.args,
                        index: value.index
                    });
                }
                if (value.type === 'Variable') {
                    me.realVal.refVars.push(value.name);
                }
            }
            // console.log('========================');
            // console.log(name, value, unit, index, type, ('bbbbbbbbbbbb'.green));
        }
    }
}

/**
 * 分析每个 rules 里面的子项
 *
 * @param {Object} rule ast rule
 */
function analyzeRule(rule) {
    var me = this;

    // 给每个 rule 上挂载 realVal 属性，这个属性里面存储当前这个 rule 的信息，便于之后获取
    rule.realVal = {
        values: [],
        refVars: [],
        refFuncs: []
    };

    // TODO: 注意 rule.variable 为 function 的情况
    analyzeValue.call(rule, rule);
    // console.log(require('util').inspect(rule, { showHidden: true, depth: null }), 'completecompletecomplete'.green);
}


/**
 * 分析 ast 上的 rules
 *
 * @param {Array} rules ast rules
 */
function analyzeRules(rules) {
    var me = this;
    rules.forEach(
        function (rule) {
            if (rule.selectors && Array.isArray(rule.selectors)) {
                analyzeRules.call(me, rule.rules);
            }
            else {
                analyzeRule.call(me, rule);
            }
        }
    );
}

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
 * 调用 lint 文件夹里的文件分别执行每个 rules
 *
 * @param {Array} rules ast rules
 */
function lintRules(rules) {
    var me = this;
    rules.forEach(
        function (rule) {
            if (rule.selectors && Array.isArray(rule.selectors)) {
                lintRules.call(me, rule.rules);
            }
            else {
                // me.detectConfigs 里的每个配置都要运行，粒度是每个 rule
                for (var i in me.detectConfigs) {
                    me.detectConfigs[i].call(me, rule);
                }
            }
        }
    );
}

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

    var rules = root.rules;
    analyzeRules.call(me, rules);

    lintRules.call(me, rules);
};

module.exports = exports = LesslintVisitor;
