/**
 * status constants
 * @author yiminghe@gmail.com
 */
(function(S, data) {
    if ("require" in this) {
        return;
    }
    // 脚本(loadQueue)/模块(mod) 公用状态
    S.mix(data, {
        "INIT":0,
        "LOADING" : 1,
        "LOADED" : 2,
        "ERROR" : 3,
        // 模块特有
        "ATTACHED" : 4
    });
})(KISSY, KISSY.__loaderData);