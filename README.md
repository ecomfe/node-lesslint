Lesslint
===
[![lesslint](https://travis-ci.org/ielgnaw/node-lesslint.svg?branch=master)](https://travis-ci.org/ielgnaw/node-lesslint)
[![lesslint](https://d25lcipzij17d.cloudfront.net/badge.png?title=npm&type=3d&v=0.1.1)](https://www.npmjs.org/package/lesslint)
[![依赖模块状态](https://david-dm.org/ielgnaw/node-lesslint.png)](https://david-dm.org/ielgnaw/node-lesslint)


Lesslint 是一个基于 NodeJS 以及 EDP 的一个 lint 工具，使用它可以 `lint` 你的 less code，目前的 lint 规则是基于 ecomfe 的[Less编码规范 [1.0]](https://github.com/ecomfe/spec/blob/master/less-code-style.md)。

已经实现的 lint 规则：

+ [颜色检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%A2%9C%E8%89%B2)：颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式。

+ [注释检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A)：单行注释尽量使用 // 方式。

+ [@import 检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#import-%E8%AF%AD%E5%8F%A5)：@import 语句引用的文件必须（MUST）写在一对引号内，.less 后缀不得（MUST NOT）省略（与引入 CSS 文件时的路径格式一致）。引号使用 ' 和 " 均可，但在同一项目内必须（MUST）统一。

+ [数值检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%95%B0%E5%80%BC)：对于处于 (0, 1) 范围内的数值，小数点前的 0 可以（MAY）省略，同一项目中必须（MUST）保持一致。
+ [选择器检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E9%80%89%E6%8B%A9%E5%99%A8)：当多个选择器共享一个声明块时，每个选择器声明必须（MUST）独占一行。

+ [变量检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%8F%98%E9%87%8F)：变量命名必须（MUST）采用 @foo-bar 形式，不得（MUST NOT）使用 @fooBar 形式。

+ [0 值检验](https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC)：属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）。


安装与更新
-------

lesslint 已发布到 npm 上，可通过如下命令安装。`-g`是必选项。

    $ [sudo] npm install lesslint -g

升级 lesslint 请用如下命令。

    $ [sudo] npm update lesslint -g
    

使用
------

lesslint 目前就一条命令，后面带 `-v` 参数，会显示版本信息；后面带目录或者文件名就会对目录或文件执行 lesslint。

    $ lesslint -v   // 显示版本信息
    $ lesslint [filePath|dirPath]   // 对 file 或 dir 执行 lesslint


TODO
------

1. 覆盖更多的 `lint` 规则。
2. 类似`jsHint`的行内注释。
3. 能够让使用者自定义配置。


   