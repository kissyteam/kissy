/**
 * 笔记model
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    /*
     笔记模型
     */
    return require('../mvc/').Model.extend({},{
        ATTRS:{
            sync:{
                value:require('./sync')
            }
        }
    });
});