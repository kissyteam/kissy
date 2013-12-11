/**
 * main函数
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    /**
     * 启动 app router
     */
    require('./mods/app').initializer({
        success: function () {
            require('node').all('#loading').hide();
        }
    });
});