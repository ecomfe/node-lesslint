'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = parse;

var _fs = require('fs');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _input = require('postcss/lib/input');

var _input2 = _interopRequireDefault(_input);

var _jsonStringifySafe = require('json-stringify-safe');

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _util = require('./util');

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _checker = require('./checker');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

/**
 * 显示默认的信息
 */
function showDefaultInfo() {
    console.warn(_package2.default);
    console.log('');
    console.log(_package2.default.name + ' v' + _package2.default.version);
    console.log(_chalk2.default.bold.green((0, _util.formatMsg)(_package2.default.description)));
}

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
function parse(args) {
    args = args.slice(2);

    // 不带参数时，默认检测当前目录下所有的 less 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    var patterns = ['**/*.less', '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'];

    var candidates = (0, _util.getCandidates)(args, patterns);

    var count = candidates.length;

    if (!count) {
        return;
    }

    // 错误信息的集合
    var errors = [];

    /**
     * 每个文件的校验结果回调，主要用于统计校验完成情况
     *
     * @inner
     */
    var callback = function callback() {
        count--;
        if (!count) {
            // report(errors);
        }
    };

    // 遍历每个需要检测的 less 文件
    candidates.forEach(function (candidate) {
        var readable = (0, _fs.createReadStream)(candidate, {
            encoding: 'utf8'
        });
        readable.on('data', function (chunk) {
            var file = {
                content: chunk,
                path: candidate
            };
            // let input = new Input(file.content, {from: file.path});
            // let parser = new LessParser(input);
            // // console.warn(safeStringify(parser, null, 4));
            // parser.tokenize();
            // parser.loop();
            // console.warn();
            // console.warn();
            // console.warn(safeStringify(parser, null, 4));
            // // console.warn(parser);
            (0, _checker.check)(file, errors, callback);
        });
        readable.on('error', function (err) {
            throw err;
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7UUErQmdCLEssR0FBQSxLOztBQTFCaEI7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUFFQTs7Ozs7QUFLQSxTQUFTLGVBQVQsR0FBMkI7QUFDdkIsWUFBUSxJQUFSO0FBQ0EsWUFBUSxHQUFSLENBQVksRUFBWjtBQUNBLFlBQVEsR0FBUixDQUFhLGtCQUFJLElBQUosR0FBVyxJQUFYLEdBQWtCLGtCQUFJLE9BQW5DO0FBQ0EsWUFBUSxHQUFSLENBQVksZ0JBQU0sSUFBTixDQUFXLEtBQVgsQ0FBaUIscUJBQVUsa0JBQUksV0FBZCxDQUFqQixDQUFaO0FBQ0g7Ozs7Ozs7QUFPTSxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQXFCO0FBQ3hCLFdBQU8sS0FBSyxLQUFMLENBQVcsQ0FBWCxDQUFQOzs7QUFHQSxRQUFJLEtBQUssTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUNuQixhQUFLLElBQUwsQ0FBVSxHQUFWO0FBQ0g7O0FBRUQsUUFBSSxLQUFLLENBQUwsTUFBWSxXQUFaLElBQTJCLEtBQUssQ0FBTCxNQUFZLElBQTNDLEVBQWlEO0FBQzdDO0FBQ0E7QUFDSDs7QUFFRCxRQUFJLFdBQVcsQ0FDWCxXQURXLEVBRVgscUVBRlcsQ0FBZjs7QUFLQSxRQUFJLGFBQWEseUJBQWMsSUFBZCxFQUFvQixRQUFwQixDQUFqQjs7QUFFQSxRQUFJLFFBQVEsV0FBVyxNQUF2Qjs7QUFFQSxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1I7QUFDSDs7O0FBR0QsUUFBSSxTQUFTLEVBQWI7Ozs7Ozs7QUFPQSxRQUFJLFdBQVcsU0FBWCxRQUFXLEdBQU07QUFDakI7QUFDQSxZQUFJLENBQUMsS0FBTCxFQUFZOztBQUVYO0FBQ0osS0FMRDs7O0FBUUEsZUFBVyxPQUFYLENBQW1CLFVBQUMsU0FBRCxFQUFlO0FBQzlCLFlBQUksV0FBVywwQkFBaUIsU0FBakIsRUFBNEI7QUFDdkMsc0JBQVU7QUFENkIsU0FBNUIsQ0FBZjtBQUdBLGlCQUFTLEVBQVQsQ0FBWSxNQUFaLEVBQW9CLFVBQUMsS0FBRCxFQUFXO0FBQzNCLGdCQUFJLE9BQU87QUFDUCx5QkFBUyxLQURGO0FBRVAsc0JBQU07QUFGQyxhQUFYOzs7Ozs7Ozs7O0FBYUEsZ0NBQU0sSUFBTixFQUFZLE1BQVosRUFBb0IsUUFBcEI7QUFDSCxTQWZEO0FBZ0JBLGlCQUFTLEVBQVQsQ0FBWSxPQUFaLEVBQXFCLFVBQUMsR0FBRCxFQUFTO0FBQzFCLGtCQUFNLEdBQU47QUFDSCxTQUZEO0FBR0gsS0F2QkQ7QUF3QkgiLCJmaWxlIjoiY2xpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSDlkb3ku6TooYzlip/og73mqKHlnZdcbiAqIEBhdXRob3IgaWVsZ25hdyh3dWppMDIyM0BnbWFpbC5jb20pXG4gKi9cblxuaW1wb3J0IHtjcmVhdGVSZWFkU3RyZWFtfSBmcm9tICdmcyc7XG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IElucHV0IGZyb20gJ3Bvc3Rjc3MvbGliL2lucHV0JztcbmltcG9ydCBzYWZlU3RyaW5naWZ5IGZyb20gJ2pzb24tc3RyaW5naWZ5LXNhZmUnO1xuaW1wb3J0IHN5cyBmcm9tICcuLi9wYWNrYWdlJztcbmltcG9ydCB7Zm9ybWF0TXNnLCBnZXRDYW5kaWRhdGVzfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IExlc3NQYXJzZXIgZnJvbSAnLi9wYXJzZXInO1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi9jaGVja2VyJztcblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIOaYvuekuum7mOiupOeahOS/oeaBr1xuICovXG5mdW5jdGlvbiBzaG93RGVmYXVsdEluZm8oKSB7XG4gICAgY29uc29sZS53YXJuKHN5cyk7XG4gICAgY29uc29sZS5sb2coJycpO1xuICAgIGNvbnNvbGUubG9nKChzeXMubmFtZSArICcgdicgKyBzeXMudmVyc2lvbikpO1xuICAgIGNvbnNvbGUubG9nKGNoYWxrLmJvbGQuZ3JlZW4oZm9ybWF0TXNnKHN5cy5kZXNjcmlwdGlvbikpKTtcbn1cblxuLyoqXG4gKiDop6PmnpDlj4LmlbDjgILkvZzkuLrlkb3ku6TooYzmiafooYznmoTlhaXlj6NcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIOWPguaVsOWIl+ihqFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoYXJncykge1xuICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDIpO1xuXG4gICAgLy8g5LiN5bim5Y+C5pWw5pe277yM6buY6K6k5qOA5rWL5b2T5YmN55uu5b2V5LiL5omA5pyJ55qEIGxlc3Mg5paH5Lu2XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGFyZ3MucHVzaCgnLicpO1xuICAgIH1cblxuICAgIGlmIChhcmdzWzBdID09PSAnLS12ZXJzaW9uJyB8fCBhcmdzWzBdID09PSAnLXYnKSB7XG4gICAgICAgIHNob3dEZWZhdWx0SW5mbygpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhdHRlcm5zID0gW1xuICAgICAgICAnKiovKi5sZXNzJyxcbiAgICAgICAgJyEqKi97b3V0cHV0LHRlc3Qsbm9kZV9tb2R1bGVzLGFzc2V0LGRpc3QscmVsZWFzZSxkb2MsZGVwLHJlcG9ydH0vKionXG4gICAgXTtcblxuICAgIGxldCBjYW5kaWRhdGVzID0gZ2V0Q2FuZGlkYXRlcyhhcmdzLCBwYXR0ZXJucyk7XG5cbiAgICBsZXQgY291bnQgPSBjYW5kaWRhdGVzLmxlbmd0aDtcblxuICAgIGlmICghY291bnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIOmUmeivr+S/oeaBr+eahOmbhuWQiFxuICAgIGxldCBlcnJvcnMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIOavj+S4quaWh+S7tueahOagoemqjOe7k+aenOWbnuiwg++8jOS4u+imgeeUqOS6jue7n+iuoeagoemqjOWujOaIkOaDheWGtVxuICAgICAqXG4gICAgICogQGlubmVyXG4gICAgICovXG4gICAgbGV0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICBjb3VudC0tO1xuICAgICAgICBpZiAoIWNvdW50KSB7XG4gICAgICAgICAgICAvLyByZXBvcnQoZXJyb3JzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyDpgY3ljobmr4/kuKrpnIDopoHmo4DmtYvnmoQgbGVzcyDmlofku7ZcbiAgICBjYW5kaWRhdGVzLmZvckVhY2goKGNhbmRpZGF0ZSkgPT4ge1xuICAgICAgICBsZXQgcmVhZGFibGUgPSBjcmVhdGVSZWFkU3RyZWFtKGNhbmRpZGF0ZSwge1xuICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGY4J1xuICAgICAgICB9KTtcbiAgICAgICAgcmVhZGFibGUub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNodW5rLFxuICAgICAgICAgICAgICAgIHBhdGg6IGNhbmRpZGF0ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIGxldCBpbnB1dCA9IG5ldyBJbnB1dChmaWxlLmNvbnRlbnQsIHtmcm9tOiBmaWxlLnBhdGh9KTtcbiAgICAgICAgICAgIC8vIGxldCBwYXJzZXIgPSBuZXcgTGVzc1BhcnNlcihpbnB1dCk7XG4gICAgICAgICAgICAvLyAvLyBjb25zb2xlLndhcm4oc2FmZVN0cmluZ2lmeShwYXJzZXIsIG51bGwsIDQpKTtcbiAgICAgICAgICAgIC8vIHBhcnNlci50b2tlbml6ZSgpO1xuICAgICAgICAgICAgLy8gcGFyc2VyLmxvb3AoKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUud2FybigpO1xuICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLndhcm4oc2FmZVN0cmluZ2lmeShwYXJzZXIsIG51bGwsIDQpKTtcbiAgICAgICAgICAgIC8vIC8vIGNvbnNvbGUud2FybihwYXJzZXIpO1xuICAgICAgICAgICAgY2hlY2soZmlsZSwgZXJyb3JzLCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICByZWFkYWJsZS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSJdfQ==