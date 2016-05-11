/**
 * @file 重写 postcss/lib/tokenize
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

const SINGLE_QUOTE = '\''.charCodeAt(0);
const DOUBLE_QUOTE =  '"'.charCodeAt(0);
const BACKSLASH = '\\'.charCodeAt(0);
const SLASH = '/'.charCodeAt(0);
const NEWLINE = '\n'.charCodeAt(0);
const SPACE = ' '.charCodeAt(0);
const FEED = '\f'.charCodeAt(0);
const TAB = '\t'.charCodeAt(0);
const CR = '\r'.charCodeAt(0);
const OPEN_PARENTHESES = '('.charCodeAt(0);
const CLOSE_PARENTHESES = ')'.charCodeAt(0);
const OPEN_CURLY = '{'.charCodeAt(0);
const CLOSE_CURLY = '}'.charCodeAt(0);
const SEMICOLON = ';'.charCodeAt(0);
const ASTERICK = '*'.charCodeAt(0);
const COLON = ':'.charCodeAt(0);
const COMMA = ','.charCodeAt(0);
const AT = '@'.charCodeAt(0);
const RE_AT_END = /[ \n\t\r\{\(\)'"\\;/]/g;
const RE_WORD_END = /[ \n\t\r\(\)\{\}:;@!'"\\#]|\/(?=\*)/g;
const RE_BAD_BRACKET = /.[\\\/\("'\n]/;
// const WAVE = '~'.charCodeAt(0);

/**
 * lessTokenize 方法
 * 针对 less 重写 postcss/lib/tokenize
 */
export default function lessTokenize(input) {

    let tokens = [];
    let css = input.css.valueOf();

    let code;
    let next;
    let quote;
    let lines;
    let last;
    let content;
    let escape;
    let nextLine;
    let nextOffset;
    let escaped;
    let escapePos;
    let prev;
    let n;

    let length = css.length;
    let offset = -1;
    let line =  1;
    let pos = 0;

    function unclosed(what) {
        throw input.error('Unclosed ' + what, line, pos - offset);
    }

    while (pos < length) {
        code = css.charCodeAt(pos);

        // less 语言中大括号可以嵌套
        // 所以这里排除掉 FEED, CR 等
        if (code === NEWLINE) {
            offset = pos;
            line += 1;
        }

        switch (code) {
            case NEWLINE:
            case SPACE:
            case TAB:
            case CR:
            case FEED:
                next = pos;
                do {
                    next += 1;
                    code = css.charCodeAt(next);
                    if (code === NEWLINE) {
                        offset = next;
                        line  += 1;
                    }
                } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED );

                tokens.push(['space', css.slice(pos, next)]);
                pos = next - 1;
                break;

            case OPEN_CURLY:
                tokens.push(['{', '{', line, pos - offset]);
                break;

            case CLOSE_CURLY:
                tokens.push(['}', '}', line, pos - offset]);
                break;

            case COLON:
                tokens.push([':', ':', line, pos - offset]);
                break;

            case SEMICOLON:
                tokens.push([';', ';', line, pos - offset]);
                break;

            case COMMA:
                tokens.push(['word', ',', line, pos - offset, line, pos - offset + 1]);
                break;

            case OPEN_PARENTHESES:
                prev = tokens.length ? tokens[tokens.length - 1][1] : '';
                n = css.charCodeAt(pos + 1);
                if (prev === 'url'
                        && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE
                        && n !== SPACE && n !== NEWLINE && n !== TAB
                        && n !== FEED && n !== CR
                ) {
                    next = pos;
                    do {
                        escaped = false;
                        next = css.indexOf(')', next + 1);
                        if (next === -1) {
                            unclosed('bracket');
                        }
                        escapePos = next;
                        while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                            escapePos -= 1;
                            escaped = !escaped;
                        }
                    } while (escaped);

                    tokens.push(['brackets', css.slice(pos, next + 1),
                        line, pos - offset,
                        line, next - offset
                    ]);
                    pos = next;
                }
                else {
                    next = css.indexOf(')', pos + 1);
                    content = css.slice(pos, next + 1);
                    let badBracket = RE_BAD_BRACKET.test(content);
                    let foundParam = content.indexOf('@') >= 0;

                    if (!content.length || content === '...' || foundParam) {
                        // 处理 mixin 参数块
                        // @is-url-exp: ~`/^url\([^()]+\)$/i.test("@{url}") ? 'true' : 'false'`; 这种会报错
                        // if (next === -1 || badBracket) {
                        //     unclosed('bracket');
                        // }
                        tokens.push(['(', '(', line, pos - offset]);
                    }
                    else if (next === -1 || badBracket) {
                        tokens.push(['(', '(', line, pos - offset]);
                    }
                    else {
                        tokens.push(['brackets', content,
                            line, pos  - offset,
                            line, next - offset
                        ]);
                        pos = next;
                    }
                }
                break;

            case CLOSE_PARENTHESES:
                tokens.push([')', ')', line, pos - offset]);
                break;

            case SINGLE_QUOTE:
            case DOUBLE_QUOTE:
                quote = code === SINGLE_QUOTE ? '\'' : '"';
                next = pos;
                do {
                    escaped = false;
                    next = css.indexOf(quote, next + 1);
                    if (next === -1) {
                        unclosed('quote');
                    }
                    escapePos = next;
                    while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                        escapePos -= 1;
                        escaped = !escaped;
                    }
                } while (escaped);

                tokens.push(['string', css.slice(pos, next + 1),
                    line, pos  - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            case BACKSLASH:
                next = pos;
                escape = true;
                while ( css.charCodeAt(next + 1) === BACKSLASH) {
                    next += 1;
                    escape = !escape;
                }
                code = css.charCodeAt(next + 1);
                if (escape
                        && (code !== SLASH
                                && code !== SPACE
                                && code !== NEWLINE
                                && code !== TAB
                                && code !== CR
                                && code !== FEED
                            )
                ) {
                    next += 1;
                }
                tokens.push(['word', css.slice(pos, next + 1),
                    line, pos - offset,
                    line, next - offset
                ]);
                pos = next;
                break;

            default:
                n = css.charCodeAt(pos + 1);

                if (code === AT) {
                    if (n === OPEN_CURLY) {
                        next = css.indexOf('}', pos + 2);
                        if ( next === -1 ) {
                            unclosed('interpolation');
                        }

                        content = css.slice(pos, next + 1);
                        lines = content.split('\n');
                        last = lines.length - 1;

                        if (last > 0) {
                            nextLine = line + last;
                            nextOffset = next - lines[last].length;
                        }
                        else {
                            nextLine = line;
                            nextOffset = offset;
                        }

                        tokens.push(['word', content,
                            line, pos  - offset,
                            nextLine, next - nextOffset
                        ]);

                        offset = nextOffset;
                        line = nextLine;
                        pos = next;
                    }
                    else {
                        // TODO: .mixin(...); .mixin(@a: 1; ...)
                        let prevToken = tokens[tokens.length - 1];
                        let nParenStart = tokens.findIndex(t => t[0] === '(');
                        let nParenEnd = tokens.findIndex(t => t[0] === ')');
                        // let isMixinParam = nParenStart >= 0 && nParenEnd < 0;
                        let isMixinParam = nParenStart >= 0 && (nParenEnd < 0 || prevToken[2] > tokens[nParenEnd][2]);

                        RE_AT_END.lastIndex = pos + 1;
                        RE_AT_END.test(css);

                        if (RE_AT_END.lastIndex === 0) {
                            next = css.length - 1;
                        }
                        else {
                            next = RE_AT_END.lastIndex - 2;
                        }

                        content = css.slice(pos, next + 1);

                        tokens.push([isMixinParam ? 'mixin-param' : 'at-word',
                            content,
                            line, pos - offset,
                            line, next - offset
                        ]);

                        if (isMixinParam && content.indexOf('...') + 3 === content.length) {
                            // 处理可变参数列表
                            tokens[tokens.length - 1].push('var-dict');
                        }

                        pos = next;
                        break;
                    }
                }
                else if (code === SLASH && n === ASTERICK) {
                    next = css.indexOf('*/', pos + 2) + 1;
                    if (next === 0) {
                        unclosed('comment');
                    }

                    content = css.slice(pos, next + 1);
                    lines = content.split('\n');
                    last = lines.length - 1;

                    if (last > 0) {
                        nextLine = line + last;
                        nextOffset = next - lines[last].length;
                    }
                    else {
                        nextLine = line;
                        nextOffset = offset;
                    }

                    tokens.push(['mulit-comment', content,
                        line, pos  - offset,
                        nextLine, next - nextOffset
                    ]);

                    offset = nextOffset;
                    line = nextLine;
                    pos = next;

                }
                else if (code === SLASH && n === SLASH) {
                    next = css.indexOf('\n', pos + 2) - 1;
                    if (next === -2) {
                        next = css.length - 1;
                    }

                    content = css.slice(pos, next + 1);

                    tokens.push(['comment', content,
                        line, pos - offset,
                        line, next - offset,
                        'inline'
                    ]);

                    pos = next;

                }
                else {
                    RE_WORD_END.lastIndex = pos + 1;
                    RE_WORD_END.test(css);
                    if (RE_WORD_END.lastIndex === 0) {
                        next = css.length - 1;
                    }
                    else {
                        next = RE_WORD_END.lastIndex - 2;
                    }

                    content = css.slice(pos, next + 1);

                    tokens.push(['word', content,
                        line, pos - offset,
                        line, next - offset
                    ]);
                    pos = next;
                }

                break;
            }
            pos++;
    }

    return tokens;
}
