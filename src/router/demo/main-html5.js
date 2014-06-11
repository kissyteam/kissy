/**
 * main函数
 * @author yiminghe@gmail.com
 */

    /**
     * 启动 app router
     */
    require('./mods/app').initializer({
        // 触发当前地址对应的 route 操作
        triggerRoute: true,
        urlRoot: location.pathname,
        success: function () {
            require('node')('#loading').hide();
        }
    });