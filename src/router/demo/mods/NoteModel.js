/**
 * 笔记model
 * @author yiminghe@gmail.com
 */
    /*
     笔记模型
     */
    module.exports = require('../mvc/').Model.extend({},{
        ATTRS:{
            sync:{
                value:require('./sync')
            }
        }
    });