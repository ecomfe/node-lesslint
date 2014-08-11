/**
 * @file checker 针对 less 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var less = require('less');
var edp = require('edp-core');

var util = require('./util');

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
    // console.warn(rcConfig);

    // fs.readdirSync(
    //     path.join(__dirname, 'visitor')
    // ).forEach(
    //     function (name) {
    //         var key = name
    //             .replace(
    //                 /(\-[a-z])/gi,
    //                 function ($1) {
    //                     return $1.toUpperCase().replace('-', '')
    //                 }
    //             )
    //             .replace(/\.js$/, '');

    //         if (rcConfig[key]) {
    //             // 这个文件是肯定存在的，因为这里是以 lint 里的文件来循环的
    //             require(path.join(__dirname, 'visitor', name));
    //         }
    //     }
    // )


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

            var lesslintVisitor = new LesslintVisitor({
                fileData: file.content,
                candidateConfigs: rcConfig
                // fileData: tree.toCSS({})
            });

            lesslintVisitor.exec(tree);

            var invalidList = lesslintVisitor.invalidList;

            if (invalidList.length) {
                errors.push({
                    path: file.path,
                    messages: invalidList
                });
            }

            done();

            // console.log(done);

            // var invalidList = lesslintVisitor.invalidList;

            // if (invalidList.length) {
            //     invalidList.forEach(dump);
            // }
            // if ( !invalidList.length ) {
            //     edp.log.info( 'File `%s` is well :-)', item );
            // }

            // try {
            //     tree.toCSS();
            // }
            // catch ( e ) {
            //     edp.log.error( e.toString() );
            // }

            // console.warn(lesslintVisitor);


            // var sourceMap = require('source-map');
            // fs.readFile(process.cwd() + '/33333.css.map', 'utf8', function (err, data) {
            //     if (err) {
            //         throw err;
            //     }
            //     // console.log(JSON.parse(data));
            //     var source_map = new sourceMap.SourceMapConsumer(data);
            //     console.warn(source_map);
            //     debugger
            //     console.log(source_map.originalPositionFor({
            //         column: 6,
            //         line: 5
            //     }));
            // });


            try {

                tree.toCSS();

                // var ensureDirectory = function (filepath) {
                //     var dir = path.dirname(filepath),
                //         cmd,
                //         existsSync = fs.existsSync || path.existsSync;
                //     if (!existsSync(dir)) {
                //         if (mkdirp === undefined) {
                //             try {mkdirp = require('mkdirp');}
                //             catch(e) { mkdirp = null; }
                //         }
                //         cmd = mkdirp && mkdirp.sync || fs.mkdirSync;
                //         cmd(dir);
                //     }
                // };


                // var opts = {
                //     sourceMap: '33333.css.map',
                //     sourceMapBasepath: process.cwd(),
                //     sourceMapFilename: '33333.css.map'
                // }

                // var writeSourceMap = function (output) {
                //     var filename = opts.sourceMapFullFilename || opts.sourceMap;
                //     ensureDirectory(filename);
                //     fs.writeFileSync(filename, output, 'utf8');
                // };

                // tree.toCSS({
                //     sourceMap: !!opts.sourceMap,
                //     sourceMapBasepath: process.cwd(),
                //     sourceMapFilename: opts.sourceMapFilename,
                //     writeSourceMap: writeSourceMap
                // });
            }
            catch (e) {
                // console.log(e);
            }
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
