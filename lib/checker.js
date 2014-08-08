/**
 * @file checker 针对 less 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var less = require('less');

var edp = require('edp-core');

var meUtil = require('./util');

/**
 * less 检测的默认配置
 *
 * @type {Object}
 */
var defaultConfig = require('./config');

var AbstractVisitor = require('./lint/AbstractVisitor');

/**
 * 校验器接受的文件扩展名数组
 *
 * @type {Array}
 */
exports.extensions = ['less'];

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

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    if (meUtil.isIgnored(file.path, '.lesslintignore')) {
        done();
        return;
    }

    var lessLintConfig = meUtil.getConfig('.lesslintrc', file.path, defaultConfig);

    fs.readdirSync(
        path.join(__dirname, 'lint')
    ).forEach(
        function (name) {
            var key = name
                .replace(/\.js$/, '')
                .replace(/Visitor$/, '')
                .toLowerCase();

            if (lessLintConfig[key]) {
                // 这个文件是肯定存在的，因为这里是以 lint 里的文件来循环的
                require(path.join(__dirname, 'lint', name));
            }
        }
    )


    // console.warn(lessLintConfig);

    // 当前检测文件的相对路径
    var relativePath = edp.path.relative(process.cwd(), file.path);

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

    var parser = new (less.Parser)(parseOptions);
    parser.parse(
        file.content,
        function (err, tree) {
            if (err) {
                throw err;
            }

            var abstractVisitor = new AbstractVisitor({
                fileData: file.content
            });

            abstractVisitor.exec(tree);

            // try {
            //     tree.toCSS();
            // }
            // catch ( e ) {
            //     edp.log.error( e.toString() );
            // }
        }
    );


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
