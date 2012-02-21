/**
 * @fileOverview setup data structure for kissy loader
 * @author yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }

    function Loader(SS) {
        this.SS = SS;
    }

    S.Loader = Loader;

    // 脚本(loadQueue)/模块(mod) 公用状态
    Loader.STATUS = {
        "INIT":0,
        "LOADING":1,
        "LOADED":2,
        "ERROR":3,
        // 模块特有
        "ATTACHED":4
    };
})(KISSY);