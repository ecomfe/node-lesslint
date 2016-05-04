/**
 * @file 扩展 postcss/lib/comment，增加对多行注释的处理
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

import Comment from 'postcss/lib/comment';

export default class MulitComment extends Comment {

    /**
     * MulitComment constructor
     *
     * @extends postcss/lib/comment
     * @constructor
     */
    constructor(input) {
        super(input);
        this.type = 'mulit-comment';
    }

}
