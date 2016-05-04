'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getConfig = exports.isIgnored = exports.getIgnorePatterns = exports.getCandidates = exports.formatMsg = undefined;

var _fs = require('fs');

var _edpCore = require('edp-core');

/**
 * @file 通用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

/**
 * 调用给定的迭代函数 n 次,每一次传递 index 参数，调用迭代函数。
 * from underscore
 *
 * @param {number} n 迭代次数
 * @param {Function} iterator 处理函数
 * @param {Object} context 上下文
 *
 * @return {Array} 结果
 */
function times(n, iterator, context) {
    var accum = new Array(Math.max(0, n));
    for (var i = 0; i < n; i++) {
        accum[i] = iterator.call(context, i);
    }
    return accum;
}

/**
 * 格式化信息
 *
 * @param {string} msg 输出的信息
 * @param {number} spaceCount 信息前面空格的个数即缩进的长度
 *
 * @return {string} 格式化后的信息
 */
function formatMsg(msg, spaceCount) {
    var space = '';
    spaceCount = spaceCount || 0;
    times(spaceCount, function () {
        space += ' ';
    });
    return space + msg;
}

/**
 * 根据参数以及模式匹配相应的文件
 *
 * @param {Array} args 文件
 * @param {Array} patterns minimatch 模式
 *
 * @return {Array.<string>} 匹配的文件集合
 */
function getCandidates(args, patterns) {
    var candidates = [];

    args = args.filter(function (item) {
        return item !== '.';
    });

    if (!args.length) {
        candidates = _edpCore.glob.sync(patterns);
    } else {
        var i = -1;
        var len = args.length;
        while (++i < len) {
            var target = args[i];
            if (!(0, _fs.existsSync)(target)) {
                _edpCore.log.warn('No such file or directory %s', target);
                continue;
            }

            var stat = (0, _fs.statSync)(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(candidates, _edpCore.glob.sync(target + '/' + patterns[0]));
            }
            /* istanbul ignore else */
            else if (stat.isFile()) {
                    candidates.push(target);
                }
        }
    }

    return candidates;
}

/**
 * 获取忽略的 pattern
 *
 * @param {string} file 文件路径
 *
 * @return {Array.<string>} 结果
 */
function getIgnorePatterns(file) {
    if (!(0, _fs.existsSync)(file)) {
        return [];
    }

    var patterns = (0, _fs.readFileSync)(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter(function (item) {
        return item.trim().length > 0 && item[0] !== '#';
    });
}

var _IGNORE_CACHE = {};

/**
 * 判断一下是否应该忽略这个文件.
 *
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
function isIgnored(file, name) {
    var ignorePatterns = null;

    name = name || '.jshintignore';
    file = _edpCore.path.resolve(file);

    var key = name + '@' + _edpCore.path.dirname(file);
    if (_IGNORE_CACHE[key]) {
        ignorePatterns = _IGNORE_CACHE[key];
    } else {
        var options = {
            name: name,
            factory: function factory(item) {
                var config = {};
                getIgnorePatterns(item).forEach(function (line) {
                    config[line] = true;
                });
                return config;
            }
        };
        ignorePatterns = _edpCore.util.getConfig(_edpCore.path.dirname(file), options);

        _IGNORE_CACHE[key] = ignorePatterns;
    }

    var bizOrPkgRoot = process.cwd();

    try {
        bizOrPkgRoot = _edpCore.path.getRootDirectory();
    } catch (ex) {}

    var dirname = _edpCore.path.relative(bizOrPkgRoot, file);
    var isMatch = _edpCore.glob.match(dirname, Object.keys(ignorePatterns));

    return isMatch;
}

/**
 * 目录配置信息的缓存数据
 * @ignore
 */
var _CONFIG_CACHE = {};

/**
 * 读取默认的配置信息，可以缓存一下.
 *
 * @param {string} configName 配置文件的名称.
 * @param {string} file 文件名称.
 * @param {Object=} defaultConfig 默认的配置信息.
 *
 * @return {Object} 配置信息
 */
function getConfig(configName, file, defaultConfig) {
    var dir = _edpCore.path.dirname(_edpCore.path.resolve(file));
    var key = configName + '@' + dir;

    if (_CONFIG_CACHE[key]) {
        return _CONFIG_CACHE[key];
    }

    var options = {
        name: configName,
        defaultConfig: defaultConfig,
        factory: function factory(item) {
            /* istanbul ignore if */
            if (!(0, _fs.existsSync)(item)) {
                return null;
            }

            return JSON.parse((0, _fs.readFileSync)(item, 'utf-8'));
        }
    };

    var value = _edpCore.util.getConfig(dir, options);

    _CONFIG_CACHE[key] = value;

    return value;
}

exports.formatMsg = formatMsg;
exports.getCandidates = getCandidates;
exports.getIgnorePatterns = getIgnorePatterns;
exports.isIgnored = isIgnored;
exports.getConfig = getConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFLQTs7QUFDQTs7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7QUFZQSxTQUFTLEtBQVQsQ0FBZSxDQUFmLEVBQWtCLFFBQWxCLEVBQTRCLE9BQTVCLEVBQXFDO0FBQ2pDLFFBQUksUUFBUSxJQUFJLEtBQUosQ0FBVSxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixDQUFWLENBQVo7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEI7QUFDeEIsY0FBTSxDQUFOLElBQVcsU0FBUyxJQUFULENBQWMsT0FBZCxFQUF1QixDQUF2QixDQUFYO0FBQ0g7QUFDRCxXQUFPLEtBQVA7QUFDSDs7Ozs7Ozs7OztBQVdELFNBQVMsU0FBVCxDQUFtQixHQUFuQixFQUF3QixVQUF4QixFQUFvQztBQUNoQyxRQUFJLFFBQVEsRUFBWjtBQUNBLGlCQUFhLGNBQWMsQ0FBM0I7QUFDQSxVQUFNLFVBQU4sRUFBa0IsWUFBTTtBQUNwQixpQkFBUyxHQUFUO0FBQ0gsS0FGRDtBQUdBLFdBQU8sUUFBUSxHQUFmO0FBQ0g7Ozs7Ozs7Ozs7QUFVRCxTQUFTLGFBQVQsQ0FBdUIsSUFBdkIsRUFBNkIsUUFBN0IsRUFBdUM7QUFDbkMsUUFBSSxhQUFhLEVBQWpCOztBQUVBLFdBQU8sS0FBSyxNQUFMLENBQVksVUFBQyxJQUFELEVBQVU7QUFDekIsZUFBTyxTQUFTLEdBQWhCO0FBQ0gsS0FGTSxDQUFQOztBQUlBLFFBQUksQ0FBQyxLQUFLLE1BQVYsRUFBa0I7QUFDZCxxQkFBYSxjQUFLLElBQUwsQ0FBVSxRQUFWLENBQWI7QUFDSCxLQUZELE1BR0s7QUFDRCxZQUFJLElBQUksQ0FBQyxDQUFUO0FBQ0EsWUFBSSxNQUFNLEtBQUssTUFBZjtBQUNBLGVBQU8sRUFBRSxDQUFGLEdBQU0sR0FBYixFQUFrQjtBQUNkLGdCQUFJLFNBQVMsS0FBSyxDQUFMLENBQWI7QUFDQSxnQkFBSSxDQUFDLG9CQUFXLE1BQVgsQ0FBTCxFQUF5QjtBQUNyQiw2QkFBSSxJQUFKLENBQVMsOEJBQVQsRUFBeUMsTUFBekM7QUFDQTtBQUNIOztBQUVELGdCQUFJLE9BQU8sa0JBQVMsTUFBVCxDQUFYO0FBQ0EsZ0JBQUksS0FBSyxXQUFMLEVBQUosRUFBd0I7QUFDcEIseUJBQVMsT0FBTyxPQUFQLENBQWUsV0FBZixFQUE0QixFQUE1QixDQUFUO0FBQ0EsMkJBQVcsSUFBWCxDQUFnQixLQUFoQixDQUNJLFVBREosRUFFSSxjQUFLLElBQUwsQ0FBVSxTQUFTLEdBQVQsR0FBZSxTQUFTLENBQVQsQ0FBekIsQ0FGSjtBQUlIOztBQU5ELGlCQVFLLElBQUksS0FBSyxNQUFMLEVBQUosRUFBbUI7QUFDcEIsK0JBQVcsSUFBWCxDQUFnQixNQUFoQjtBQUNIO0FBQ0o7QUFDSjs7QUFFRCxXQUFPLFVBQVA7QUFDSDs7Ozs7Ozs7O0FBU0QsU0FBUyxpQkFBVCxDQUEyQixJQUEzQixFQUFpQztBQUM3QixRQUFJLENBQUMsb0JBQVcsSUFBWCxDQUFMLEVBQXVCO0FBQ25CLGVBQU8sRUFBUDtBQUNIOztBQUVELFFBQUksV0FBVyxzQkFBYSxJQUFiLEVBQW1CLE9BQW5CLEVBQTRCLEtBQTVCLENBQWtDLFFBQWxDLENBQWY7QUFDQSxXQUFPLFNBQVMsTUFBVCxDQUFnQixVQUFDLElBQUQsRUFBVTtBQUM3QixlQUFPLEtBQUssSUFBTCxHQUFZLE1BQVosR0FBcUIsQ0FBckIsSUFBMEIsS0FBSyxDQUFMLE1BQVksR0FBN0M7QUFDSCxLQUZNLENBQVA7QUFHSDs7QUFFRCxJQUFJLGdCQUFnQixFQUFwQjs7Ozs7Ozs7O0FBU0EsU0FBUyxTQUFULENBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCO0FBQzNCLFFBQUksaUJBQWlCLElBQXJCOztBQUVBLFdBQU8sUUFBUSxlQUFmO0FBQ0EsV0FBTyxjQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUDs7QUFFQSxRQUFJLE1BQU0sT0FBTyxHQUFQLEdBQWMsY0FBUSxPQUFSLENBQWdCLElBQWhCLENBQXhCO0FBQ0EsUUFBSSxjQUFjLEdBQWQsQ0FBSixFQUF3QjtBQUNwQix5QkFBaUIsY0FBYyxHQUFkLENBQWpCO0FBQ0gsS0FGRCxNQUdLO0FBQ0QsWUFBSSxVQUFVO0FBQ1Ysa0JBQU0sSUFESTtBQUVWLHFCQUFTLGlCQUFDLElBQUQsRUFBVTtBQUNmLG9CQUFJLFNBQVMsRUFBYjtBQUNBLGtDQUFrQixJQUFsQixFQUF3QixPQUF4QixDQUFnQyxVQUFDLElBQUQsRUFBVTtBQUN0QywyQkFBTyxJQUFQLElBQWUsSUFBZjtBQUNILGlCQUZEO0FBR0EsdUJBQU8sTUFBUDtBQUNIO0FBUlMsU0FBZDtBQVVBLHlCQUFpQixjQUFRLFNBQVIsQ0FDYixjQUFRLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FEYSxFQUViLE9BRmEsQ0FBakI7O0FBS0Esc0JBQWMsR0FBZCxJQUFxQixjQUFyQjtBQUNIOztBQUVELFFBQUksZUFBZSxRQUFRLEdBQVIsRUFBbkI7O0FBRUEsUUFBSTtBQUNBLHVCQUFlLGNBQVEsZ0JBQVIsRUFBZjtBQUNILEtBRkQsQ0FHQSxPQUFPLEVBQVAsRUFBVyxDQUNWOztBQUVELFFBQUksVUFBVSxjQUFRLFFBQVIsQ0FBaUIsWUFBakIsRUFBK0IsSUFBL0IsQ0FBZDtBQUNBLFFBQUksVUFBVSxjQUFLLEtBQUwsQ0FBVyxPQUFYLEVBQW9CLE9BQU8sSUFBUCxDQUFZLGNBQVosQ0FBcEIsQ0FBZDs7QUFFQSxXQUFPLE9BQVA7QUFDSDs7Ozs7O0FBTUQsSUFBSSxnQkFBZ0IsRUFBcEI7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxTQUFULENBQW1CLFVBQW5CLEVBQStCLElBQS9CLEVBQXFDLGFBQXJDLEVBQW9EO0FBQ2hELFFBQUksTUFBTSxjQUFRLE9BQVIsQ0FBZ0IsY0FBUSxPQUFSLENBQWdCLElBQWhCLENBQWhCLENBQVY7QUFDQSxRQUFJLE1BQU0sYUFBYSxHQUFiLEdBQW1CLEdBQTdCOztBQUVBLFFBQUksY0FBYyxHQUFkLENBQUosRUFBd0I7QUFDcEIsZUFBTyxjQUFjLEdBQWQsQ0FBUDtBQUNIOztBQUVELFFBQUksVUFBVTtBQUNWLGNBQU0sVUFESTtBQUVWLHVCQUFlLGFBRkw7QUFHVixpQkFBUyxpQkFBVSxJQUFWLEVBQWdCOztBQUVyQixnQkFBSSxDQUFDLG9CQUFXLElBQVgsQ0FBTCxFQUF1QjtBQUNuQix1QkFBTyxJQUFQO0FBQ0g7O0FBRUQsbUJBQU8sS0FBSyxLQUFMLENBQVcsc0JBQWEsSUFBYixFQUFtQixPQUFuQixDQUFYLENBQVA7QUFDSDtBQVZTLEtBQWQ7O0FBYUEsUUFBSSxRQUFRLGNBQVEsU0FBUixDQUFrQixHQUFsQixFQUF1QixPQUF2QixDQUFaOztBQUVBLGtCQUFjLEdBQWQsSUFBcUIsS0FBckI7O0FBRUEsV0FBTyxLQUFQO0FBQ0g7O1FBR08sUyxHQUFBLFM7UUFBVyxhLEdBQUEsYTtRQUFlLGlCLEdBQUEsaUI7UUFBbUIsUyxHQUFBLFM7UUFBVyxTLEdBQUEsUyIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZSDpgJrnlKjmlrnms5VcbiAqIEBhdXRob3IgaWVsZ25hdyh3dWppMDIyM0BnbWFpbC5jb20pXG4gKi9cblxuaW1wb3J0IHtzdGF0U3luYywgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2dsb2IsIGxvZywgdXRpbCBhcyBlZHBVdGlsLCBwYXRoIGFzIGVkcFBhdGh9IGZyb20gJ2VkcC1jb3JlJztcblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIOiwg+eUqOe7meWumueahOi/reS7o+WHveaVsCBuIOasoSzmr4/kuIDmrKHkvKDpgJIgaW5kZXgg5Y+C5pWw77yM6LCD55So6L+t5Luj5Ye95pWw44CCXG4gKiBmcm9tIHVuZGVyc2NvcmVcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbiDov63ku6PmrKHmlbBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yIOWkhOeQhuWHveaVsFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQg5LiK5LiL5paHXG4gKlxuICogQHJldHVybiB7QXJyYXl9IOe7k+aenFxuICovXG5mdW5jdGlvbiB0aW1lcyhuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IG5ldyBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgYWNjdW1baV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGkpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjdW07XG59XG5cblxuLyoqXG4gKiDmoLzlvI/ljJbkv6Hmga9cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbXNnIOi+k+WHuueahOS/oeaBr1xuICogQHBhcmFtIHtudW1iZXJ9IHNwYWNlQ291bnQg5L+h5oGv5YmN6Z2i56m65qC855qE5Liq5pWw5Y2z57yp6L+b55qE6ZW/5bqmXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSDmoLzlvI/ljJblkI7nmoTkv6Hmga9cbiAqL1xuZnVuY3Rpb24gZm9ybWF0TXNnKG1zZywgc3BhY2VDb3VudCkge1xuICAgIGxldCBzcGFjZSA9ICcnO1xuICAgIHNwYWNlQ291bnQgPSBzcGFjZUNvdW50IHx8IDA7XG4gICAgdGltZXMoc3BhY2VDb3VudCwgKCkgPT4ge1xuICAgICAgICBzcGFjZSArPSAnICc7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNwYWNlICsgbXNnO1xufVxuXG4vKipcbiAqIOagueaNruWPguaVsOS7peWPiuaooeW8j+WMuemFjeebuOW6lOeahOaWh+S7tlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3Mg5paH5Lu2XG4gKiBAcGFyYW0ge0FycmF5fSBwYXR0ZXJucyBtaW5pbWF0Y2gg5qih5byPXG4gKlxuICogQHJldHVybiB7QXJyYXkuPHN0cmluZz59IOWMuemFjeeahOaWh+S7tumbhuWQiFxuICovXG5mdW5jdGlvbiBnZXRDYW5kaWRhdGVzKGFyZ3MsIHBhdHRlcm5zKSB7XG4gICAgbGV0IGNhbmRpZGF0ZXMgPSBbXTtcblxuICAgIGFyZ3MgPSBhcmdzLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbSAhPT0gJy4nO1xuICAgIH0pO1xuXG4gICAgaWYgKCFhcmdzLmxlbmd0aCkge1xuICAgICAgICBjYW5kaWRhdGVzID0gZ2xvYi5zeW5jKHBhdHRlcm5zKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgIGxldCBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGFyZ3NbaV07XG4gICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmModGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKCdObyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5ICVzJywgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHN0YXQgPSBzdGF0U3luYyh0YXJnZXQpO1xuICAgICAgICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5yZXBsYWNlKC9bXFwvfFxcXFxdKyQvLCAnJyk7XG4gICAgICAgICAgICAgICAgY2FuZGlkYXRlcy5wdXNoLmFwcGx5KFxuICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGVzLFxuICAgICAgICAgICAgICAgICAgICBnbG9iLnN5bmModGFyZ2V0ICsgJy8nICsgcGF0dGVybnNbMF0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2FuZGlkYXRlcztcbn1cblxuLyoqXG4gKiDojrflj5blv73nlaXnmoQgcGF0dGVyblxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIOaWh+S7tui3r+W+hFxuICpcbiAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSDnu5PmnpxcbiAqL1xuZnVuY3Rpb24gZ2V0SWdub3JlUGF0dGVybnMoZmlsZSkge1xuICAgIGlmICghZXhpc3RzU3luYyhmaWxlKSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgbGV0IHBhdHRlcm5zID0gcmVhZEZpbGVTeW5jKGZpbGUsICd1dGYtOCcpLnNwbGl0KC9cXHI/XFxuL2cpO1xuICAgIHJldHVybiBwYXR0ZXJucy5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udHJpbSgpLmxlbmd0aCA+IDAgJiYgaXRlbVswXSAhPT0gJyMnO1xuICAgIH0pO1xufVxuXG52YXIgX0lHTk9SRV9DQUNIRSA9IHt9O1xuXG4vKipcbiAqIOWIpOaWreS4gOS4i+aYr+WQpuW6lOivpeW/veeVpei/meS4quaWh+S7ti5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZSDpnIDopoHmo4Dmn6XnmoTmlofku7bot6/lvoQuXG4gKiBAcGFyYW0ge3N0cmluZz19IG5hbWUgaWdub3Jl5paH5Lu255qE5ZCN56ewLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNJZ25vcmVkKGZpbGUsIG5hbWUpIHtcbiAgICBsZXQgaWdub3JlUGF0dGVybnMgPSBudWxsO1xuXG4gICAgbmFtZSA9IG5hbWUgfHwgJy5qc2hpbnRpZ25vcmUnO1xuICAgIGZpbGUgPSBlZHBQYXRoLnJlc29sdmUoZmlsZSk7XG5cbiAgICBsZXQga2V5ID0gbmFtZSArICdAJyAgKyBlZHBQYXRoLmRpcm5hbWUoZmlsZSk7XG4gICAgaWYgKF9JR05PUkVfQ0FDSEVba2V5XSkge1xuICAgICAgICBpZ25vcmVQYXR0ZXJucyA9IF9JR05PUkVfQ0FDSEVba2V5XTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGZhY3Rvcnk6IChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgICAgIGdldElnbm9yZVBhdHRlcm5zKGl0ZW0pLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnW2xpbmVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZ25vcmVQYXR0ZXJucyA9IGVkcFV0aWwuZ2V0Q29uZmlnKFxuICAgICAgICAgICAgZWRwUGF0aC5kaXJuYW1lKGZpbGUpLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICApO1xuXG4gICAgICAgIF9JR05PUkVfQ0FDSEVba2V5XSA9IGlnbm9yZVBhdHRlcm5zO1xuICAgIH1cblxuICAgIGxldCBiaXpPclBrZ1Jvb3QgPSBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYml6T3JQa2dSb290ID0gZWRwUGF0aC5nZXRSb290RGlyZWN0b3J5KCk7XG4gICAgfVxuICAgIGNhdGNoIChleCkge1xuICAgIH1cblxuICAgIHZhciBkaXJuYW1lID0gZWRwUGF0aC5yZWxhdGl2ZShiaXpPclBrZ1Jvb3QsIGZpbGUpO1xuICAgIHZhciBpc01hdGNoID0gZ2xvYi5tYXRjaChkaXJuYW1lLCBPYmplY3Qua2V5cyhpZ25vcmVQYXR0ZXJucykpO1xuXG4gICAgcmV0dXJuIGlzTWF0Y2g7XG59XG5cbi8qKlxuICog55uu5b2V6YWN572u5L+h5oGv55qE57yT5a2Y5pWw5o2uXG4gKiBAaWdub3JlXG4gKi9cbnZhciBfQ09ORklHX0NBQ0hFID0ge307XG5cbi8qKlxuICog6K+75Y+W6buY6K6k55qE6YWN572u5L+h5oGv77yM5Y+v5Lul57yT5a2Y5LiA5LiLLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWdOYW1lIOmFjee9ruaWh+S7tueahOWQjeensC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIOaWh+S7tuWQjeensC5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gZGVmYXVsdENvbmZpZyDpu5jorqTnmoTphY3nva7kv6Hmga8uXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSDphY3nva7kv6Hmga9cbiAqL1xuZnVuY3Rpb24gZ2V0Q29uZmlnKGNvbmZpZ05hbWUsIGZpbGUsIGRlZmF1bHRDb25maWcpIHtcbiAgICB2YXIgZGlyID0gZWRwUGF0aC5kaXJuYW1lKGVkcFBhdGgucmVzb2x2ZShmaWxlKSk7XG4gICAgdmFyIGtleSA9IGNvbmZpZ05hbWUgKyAnQCcgKyBkaXI7XG5cbiAgICBpZiAoX0NPTkZJR19DQUNIRVtrZXldKSB7XG4gICAgICAgIHJldHVybiBfQ09ORklHX0NBQ0hFW2tleV07XG4gICAgfVxuXG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIG5hbWU6IGNvbmZpZ05hbWUsXG4gICAgICAgIGRlZmF1bHRDb25maWc6IGRlZmF1bHRDb25maWcsXG4gICAgICAgIGZhY3Rvcnk6IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhpdGVtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShyZWFkRmlsZVN5bmMoaXRlbSwgJ3V0Zi04JykpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciB2YWx1ZSA9IGVkcFV0aWwuZ2V0Q29uZmlnKGRpciwgb3B0aW9ucyk7XG5cbiAgICBfQ09ORklHX0NBQ0hFW2tleV0gPSB2YWx1ZTtcblxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuXG5leHBvcnQge2Zvcm1hdE1zZywgZ2V0Q2FuZGlkYXRlcywgZ2V0SWdub3JlUGF0dGVybnMsIGlzSWdub3JlZCwgZ2V0Q29uZmlnfTsiXX0=