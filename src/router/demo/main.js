/**
 * main函数
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    /**
     * 启动 app router
     */
    require('./mods/app').initializer({
        useHash: true,
        success: function () {
            require('node')('#loading').hide();
        }
    });
});