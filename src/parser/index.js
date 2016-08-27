/**
 * @file less 的 parser，继承自 postcss/lib/parser
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

import Comment from 'postcss/lib/comment';
import Parser from 'postcss/lib/parser';
import AtRule from 'postcss/lib/at-rule';

import MulitComment from './mulit-comment';
import lessTokenizer from './tokenize';

/* eslint max-len: 0 */
const RE_MIXIN_DEF = /^([#.](?:[\w-]|\\(?:[A-Fa-f0-9]{1,6} ?|[^A-Fa-f0-9]))+)\s*\(/im;

/* jshint maxstatements: 40 */

/**
 * LessParser 类
 * 针对 less 重写 postcss/lib/parser
 */
export default class LessParser extends Parser {

    /**
     * LessParser constructor
     *
     * @extends postcss/lib/parser
     * @constructor
     */
    constructor(input) {
        super(input);

        // 扩展的属性
        this.mixins = {};
    }

    /**
     * 重写 postcss/lib/parser 的 tokenize
     */
    tokenize() {
        this.tokens = lessTokenizer(this.input);
        // console.warn('---------------------------');
        // console.warn(this.tokens);
        // console.warn('---------------------------');
    }

    loop() {
        let token;
        while (this.pos < this.tokens.length) {
            token = this.tokens[this.pos];

            switch ( token[0] ) {
            case 'word':
            case ':':
                this.word();
                break;

            case '}':
                this.end(token);
                break;

            case 'comment':
                this.comment(token);
                break;

            case 'at-word':
                this.atrule(token);
                break;

            case '{':
                this.emptyRule(token);
                break;

            default:
                this.spaces += token[1];
                break;
            }

            this.pos += 1;
        }
        this.endFile();
    }

    /**
     * 重写 postcss/lib/parser 的 comment
     * 增加对 mulit-comment 的处理
     */
    comment(token) {
        if (token[6] === 'inline') {
            let node = new Comment();
            this.init(node, token[2], token[3]);
            node.raws.inline = true;
            node.source.end = {line: token[4], column: token[5]};

            let text = token[1].slice(2);
            if (/^\s*$/.test(text)) {
                node.text = '';
                node.raws.left = text;
                node.raws.right = '';
            }
            else {
                let match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
                node.text = match[2];
                node.raws.left = match[1];
                node.raws.right = match[3];
            }
        }
        else {
            let node = new MulitComment();
            this.init(node, token[2], token[3]);
            node.source.end = {line: token[4], column: token[5]};

            let text = token[1].slice(2, -2);
            if (/^\s*$/.test(text)) {
                node.text = '';
                node.raws.left = text;
                node.raws.right = '';
            } else {
                let match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
                node.text = match[2];
                node.raws.left = match[1];
                node.raws.right = match[3];
            }
        }
    }

    /**
     * 重写 postcss/lib/parser 的 rule
     * 增加对 mixin 的处理
     */
    rule(token) {
        Parser.prototype.rule.call(this, token);

        if (RE_MIXIN_DEF.test(this.current.source.input.css)) {
            // this.current 属性是由 Parser.prototype.rule 方法调用后创建的
            this.current.type = 'mixin';
            this.current.definition = true;
            this.current.params = [];

            let blockStart = token.findIndex(t => t[0] === '(');
            let blockEnd = token.findIndex(t => t[0] === ')');

            token.forEach(tok => {
                if (tok[0] !== 'mixin-param') {
                    return;
                }

                let param = new AtRule();
                param.name = tok[1].slice(1);
                param.type = 'mixin-param';
                param.source = {
                    start: {line: tok[2], column: tok[3]},
                    input: this.input
                };
                param.raws = {before: '', after: '', between: ''};

                if (tok[6] && tok[6] === 'var-dict') {
                    param.variableDict = true;
                }

                let t;
                let prev = this.current.params[this.current.params.length - 1];
                let pos = blockStart;

                while (pos < blockEnd) {
                    t = token[pos];

                    if (t[0] === ';') {
                        param.source.end = {line: t[2], column: t[3]};
                        param.raws.semicolon = true;
                        blockStart = pos + 1;
                        break;
                    }
                    else if (t[0] === 'space') {
                        param.raws.before += t[1];

                        if (prev) {
                            prev.raws.after += t[1];
                        }
                    }

                    pos += 1;
                }

                let index = token.indexOf(tok);

                if (pos === blockEnd) {
                    pos = index;
                    while (pos < blockEnd) {
                        t = token[pos];

                        if (t[0] === 'space') {
                            param.raws.after += t[1];
                        }

                        pos += 1;
                    }

                    param.source.end = {line: tok[4], column: tok[5]};
                }

                this.current.params.push(param);
            });


            let curSelector = this.current.selector;
            // 正则是为了 mixin 的 () 以及 () 中的参数去掉
            // let removeParentheses = curSelector.replace(/(.*)(\(.*\))/, RegExp.$1);
            let removeParentheses = curSelector.replace(/\(.*\)$/, '');
            this.mixins[removeParentheses] = this.current;
        }
    }

    atrule(token) {
        let node  = new AtRule();
        node.name = token[1].slice(1);
        if (node.name === '') {
            this.unnamedAtrule(node, token);
        }
        this.init(node, token[2], token[3]);

        let last = false;
        let open = false;
        let params = [];

        this.pos += 1;
        while (this.pos < this.tokens.length) {
            token = this.tokens[this.pos];
            if (token[0] === ';') {
                node.source.end = { line: token[2], column: token[3] };
                this.semicolon = true;
                break;
            }
            else if (token[0] === '{') {
                open = true;
                break;
            }
            else if (token[0] === '}') {
                this.end(token);
                break;
            }
            else {
                params.push(token);
            }

            this.pos += 1;
        }
        if ( this.pos === this.tokens.length ) {
            last = true;
        }

        node.raws.between = this.spacesFromEnd(params);
        if ( params.length ) {
            node.raws.afterName = this.spacesFromStart(params);
            this.raw(node, 'params', params);
            if ( last ) {
                token = params[params.length - 1];
                node.source.end   = { line: token[4], column: token[5] };
                this.spaces       = node.raws.between;
                node.raws.between = '';
            }
        } else {
            node.raws.afterName = '';
            node.params         = '';
        }

        if ( open ) {
            node.nodes   = [];
            this.current = node;
        }
    }

    unknownWord(start) {
        var token = this.tokens[start];
        if (!this.mixins[token[1]]) {
            throw this.input.error('Unknown word', token[2], token[3]);
        }
    }
}
