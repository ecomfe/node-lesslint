/**
 * @file lesslint 默认配置
 * @author ielgnaw(wuji0223@gmail.com)
 */

module.exports = {

    // 单行注释尽量使用 // 方式
    comment: true,

    // 属性值为 0 时，必须省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）
    zeroUnit: true,

    // 变量命名必须采用 @foo-bar 形式，不得使用 @fooBar 形式
    variableName: true,

    // 必须写在引号内，单双引均可，同一项目必须统一， .less 后缀不得省略
    importRules: true,

    // 当多个选择器共享一个声明块时，每个选择器声明必须独占一行
    selectorVerify: true,

    // 可以省略小数点前的 0 ，同一项目中必须保持一致
    omitZeroBeforeDecimalpoint: true,

    // 颜色定义必须使用 #RRGGBB 格式定义，并在可能时尽量缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式
    colorVerify: true,


    // 选择器和 { 之间必须保留一个空格
    // 属性名后的冒号 : 与属性值之间必须保留一个空格，冒号前不得保留空格
    // 定义变量时冒号 : 与变量值之间必须保留一个空格，冒号前不得保留空格
    // 在用逗号 , 分隔的列表中，逗号后必须保留一个空格，逗号前不得保留空格
    spaceVerify: true,

    // +, -, *, / 四个运算符两侧必须保留一个空格
    // +, - 两侧的操作数必须有相同的单位，如果其中一个是变量，另一个数值必须书写单位
    operatorVerify: true,

    // mixin 和后面的括号之间不得包含空格
    // 在给 mixin 传递参数时，在参数分隔符（ , 或 ; ）后必须保留一个空格
    mixinVerify: true,


    // 同一属性有不同私有前缀的，尽量按前缀长度降序书写，标准形式必须写在最后
    privatePropertyPrefix: true,

    // 使用继承时，如果在声明块内书写 :extend 语句，必须写在开头
    extendVerify: true


};
