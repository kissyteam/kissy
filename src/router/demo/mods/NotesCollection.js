/**
 * 笔记collection
 * @author yiminghe@gmail.com
 */

    /*
     笔记列表模型
     */
    module.exports = require('../mvc/index').Collection.extend({}, {
        ATTRS: {
            sync:{
                value:require('./sync')
            },
            model: {
                value: require('./NoteModel')
            }
        }
    });