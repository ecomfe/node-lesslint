/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */


var fs = require('fs');
var edp = require('edp-core');

var sys = require('../package');
var util = require('./util');


/**
 * 校验结果报告
 *
 * @inner
 * @param {Object} errors 按文件类型为 key，值为对应的校验错误信息列表的对象
 */
function report(errors) {
    var t12 = true;

    if (errors.length) {
        errors.forEach(
            function (error) {
                edp.log.info(error.path);
                error.messages.forEach(
                    function (message) {
                        var msg = '→ ';
                        // 全局性的错误可能没有位置信息
                        if (typeof message.line === 'number') {
                            msg += ('line ' + message.line);
                            if (typeof message.col === 'number') {
                                msg += (', col ' + message.col);
                            }
                            msg += ': ';
                        }

                        msg += message.message;
                        edp.log.warn(msg);
                    }
                );
            }
        );
        t12 = false;
    }

    if (t12) {
        edp.log.info('Congratulations! Everything gone well, you are T12!');
    }
    else {
        process.exit(1);
    }
}

/**
 * 显示默认的信息
 */
function showDefaultInfo() {
    console.log('');
    console.log((sys.name + ' v' + sys.version));
    console.log(util.formatMsg(sys.description.bold.green));
}

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
exports.parse = function (args) {
    args = args.slice(2);

    // var chalk = require('chalk');
    // var error = chalk.bold.red;
    // console.log(error('Error!'));


    // var name = 'Sindre';
    // console.log(chalk.green('Hello %s %s'), name, 123);

    // console.log(  chalk.green('I am a green line ' + chalk.blue('with a blue substring') + ' that becomes green again!')  );
    // console.log(  chalk.blue.bgRed.bold('Hello world!')  );
    // var a = '`&[disabled], &.disabled, &[readonly], &.readonly {`';
    // var ret = '';
    // ret =

    // return;


    // 不带参数时，默认检测当前目录下所有的 less 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    // 错误信息的集合
    var errors = [];

    var patterns = [
        '**/*.less',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    var candidates = util.getCandidates(args, patterns);

    if (candidates.length) {

        var count = candidates.length;
        /**
         * 每个文件的校验结果回调，主要用于统计校验完成情况
         *
         * @inner
         */
        var callback = function () {
            count--;
            if (!count) {
                report(errors);
            }
        };

        // 遍历每个需要检测的 less 文件
        candidates.forEach(
            function (candidate) {
                var file = {
                    // less 编译的时候是以 \n 来界定的，返回的 rule 的 index 也会有影响
                    // （参见 less/lib/less/parser.js 第 630 行）
                    // 因此这里把 文件的换行分隔符统一换成 \n ，便于之后获取行号
                    content: fs.readFileSync(
                        candidate,
                        'utf-8'
                    // ).replace(/\r\n/g, '\n').replace(/\r/g, '\n'),
                    ).replace(/\r\n?/g, '\n'),
                    path: candidate
                };
                require('./checker').check(file, errors, callback);
            }
        );
    }

};
