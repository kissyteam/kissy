/**
 * 笔记collection
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    /*
     笔记列表模型
     */
    return require('../mvc/').Collection.extend({}, {
        ATTRS: {
            sync:{
                value:require('./sync')
            },
            model: {
                value: require('./NoteModel')
            }
        }
    });
});