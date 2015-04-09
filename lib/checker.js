/**
 * @file checker 针对 less 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var path = require('path');
var less = require('less');
var Q = require('q');
var edp = require('edp-core');

var util = require('./util');

var chalk = require('chalk');

/**
 * less 检测的默认配置
 *
 * @type {Object}
 */
var defaultConfig = require('./config');

var LesslintVisitor = require('./LesslintVisitor');

/**
 * less parser 参数
 *
 * @type {Object}
 */
var parseOptions = {
    paths: [path.dirname('.')],
    includePath: [],
    relativeUrls: true
    // paths: [path.dirname(this.path)].concat(this.options.includePath)
};

var parser;

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 * @param {string} filePath 文件路径，根据这个参数来设置 less 编译时的 paths
 * @param {Object=} rcConfig 检测规则的配置，可选
 *
 * @return {Promise} Promise 对象
 */
exports.checkString = function (fileContent, filePath, rcConfig) {

    // 这里把文件内容的 \r\n 统一替换成 \n，便于之后获取行号
    // less 编译的时候是以 \n 来界定的，返回的 rule 的 index 也会有影响
    // （参见 less/lib/less/parser.js 第 630 行）
    fileContent = fileContent.replace(/\r\n?/g, '\n');

    // 如果 rcConfig 不存在，则用默认的配置，单独作为模块调用时用到
    rcConfig = rcConfig || defaultConfig;

    // 当前检测文件的相对路径
    var relativePath = edp.path.relative(process.cwd(), filePath);

    // 当前检测文件的绝对路径
    var absolutePath = edp.path.join(process.cwd(), relativePath);

    // 获取当前文件的目录的相对路径，并 push 到 less 的 paths 中
    // TODO: 这里应该还应该支持设置路径 parseOptions.paths.concat(this.options.includePath)
    var relativeDirPath = edp.path.relative(
        process.cwd(),
        absolutePath.slice(
            0,
            absolutePath.lastIndexOf('/')
        )
    );

    if (parseOptions.paths.indexOf(relativeDirPath) === -1) {
        parseOptions.paths.push(relativeDirPath);
    }

    var errors = [];
    var deferred = Q.defer();
    var errMsg = '';

    parser = new (less.Parser)(parseOptions);
    parser.parse(
        fileContent,
        function (err, tree) {
            // parse 本身错误
            if (err) {
                errMsg = err.message;
                if (err.extract) {
                    errMsg += ': '
                        + err.extract[1].slice(0, err.column)
                        + err.extract[1].slice(err.column);
                }

                errors.push({
                    path: filePath,
                    messages: [
                        {
                            line: err.line,
                            col: err.column + 1,
                            message: ''
                                + 'LESS `'
                                + err.type
                                + '` Error, '
                                + errMsg,
                            colorMessage: ''
                                + chalk.red(
                                    'LESS `' + chalk.red(err.type) + '` Error, ' + errMsg
                                )
                        }
                    ]
                });
                deferred.reject(errors);
                return;
            }

            var lesslintVisitor = new LesslintVisitor({
                fileData: fileContent,
                filePath: filePath,
                detectConfigs: rcConfig
            });

            lesslintVisitor.exec(tree);

            var invalidList = lesslintVisitor.invalidList;

            if (invalidList.length) {
                errors.push({
                    path: filePath,
                    messages: invalidList
                });
            }

            try {
                tree.toCSS();
            }
            catch (e) {
                // parse css 错误
                errMsg = e.message;
                if (e.extract) {
                    errMsg += ': '
                        + e.extract[1].slice(0, e.column)
                        + e.extract[1].slice(e.column);
                }

                errors.push({
                    path: filePath,
                    messages: [
                        {
                            line: e.line,
                            col: e.column + 1,
                            message: ''
                                + 'LESS `'
                                + e.type
                                + '` Error, '
                                + errMsg,
                            colorMessage: ''
                                + chalk.red(
                                    'LESS `' + chalk.red(e.type) + '` Error, ' + errMsg
                                )
                        }
                    ]
                });

                deferred.reject(errors);
                return;
            }

            deferred.resolve(errors);
        }
    );

    return deferred.promise;

    /*var errors = [];

    var parser = new (less.Parser)(parseOptions);
    parser.parse(
        fileContent,
        function (err, tree) {
            // parse 本身错误
            if (err) {
                errors.push({
                    path: filePath,
                    messages: [
                        {
                            line: err.line,
                            message: ''
                                + '`'
                                + chalk.red('LESS Parse Error: ')
                                + 'type: '
                                + chalk.red(err.type)
                                + '` '
                                + chalk.grey(err.message)
                        }
                    ]
                });
                return;
            }

            var lesslintVisitor = new LesslintVisitor({
                fileData: fileContent,
                filePath: filePath,
                detectConfigs: rcConfig
            });

            // console.log(require('util').inspect(tree, { showHidden: true, depth: null }));

            lesslintVisitor.exec(tree);

            var invalidList = lesslintVisitor.invalidList;

            if (invalidList.length) {
                errors.push({
                    path: filePath,
                    messages: invalidList
                });
            }

            try {
                tree.toCSS();
            }
            catch (e) {
                // parse css 错误
                errors.push({
                    path: filePath,
                    messages: [
                        {
                            line: e.line,
                            message: ''
                                + '`'
                                + chalk.red('LESS Parse CSS Error: ')
                                + 'type: '
                                + chalk.red(e.type)
                                + '` '
                                + chalk.grey(e.message)
                        }
                    ]
                });
                return;
            }
        }
    );

    return errors;*/
};

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    if (util.isIgnored(file.path, '.lesslintignore')) {
        done();
        return;
    }

    var rcConfig = util.getConfig('.lesslintrc', file.path, defaultConfig);

    /**
     * checkString 的 promise 的 reject 和 resolve 的返回值的结构以及处理方式都是一样的
     * reject 指的是 parse 本身的错误以及 ast.toCSS({}) 的错误，这些代表程序的错误。
     * resolve 代表的是 lesslint 检测出来的问题
     *
     * @param {Array.<Object>} invalidList 错误信息集合
     */
    var thenFunc = function (invalidList) {
        if (invalidList.length) {
            invalidList.forEach(function (invalid) {
                errors.push({
                    path: invalid.path,
                    messages: invalid.messages
                });
            });
        }
        done();
    };

    exports.checkString(file.content, file.path, rcConfig).then(thenFunc, thenFunc);

    // console.warn(invalidList);

    /*function Parent(opts) {
        this.name = opts && opts.name || 'parent';
    }
    Parent.prototype.fn = function () {
        console.log('this a parent func in prototype');
    }

    function Sub(opts) {
        Parent.call(this, opts);
    }
    Sub.prototype = new Parent();

    Sub.prototype.fn = function () {
        console.log('thisasdsad');
    }

    var p = new Parent({
        name: 'ppp'
    });
    var s = new Sub();

    console.log(p);
    console.log(s);

    p.fn();
    s.fn();*/

};
