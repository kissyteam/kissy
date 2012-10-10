/**
 * @module loader
 * @author lifesinger@gmail.com,yiminghe@gmail.com,lijing00333@163.com
 * @description: constant member and common method holder
 */
(function (S, loader, data) {
    if ("require" in this) {
        return;
    }
    var ATTACHED = data.ATTACHED,
        mix = S.mix;

    mix(loader, {

        // 当前页面所在的目录
        // http://xx.com/y/z.htm#!/f/g
        // ->
        // http://xx.com/y/
        __pagePath: location.href.replace(/#.*$/, "").replace(/[^/]*$/i, ""),

        //firefox,ie9,chrome 如果add没有模块名，模块定义先暂存这里
        __currentModule: null,

        //ie6,7,8开始载入脚本的时间
        __startLoadTime: 0,

        //ie6,7,8开始载入脚本对应的模块名
        __startLoadModuleName: null,

        __isAttached: function (modNames) {
            var mods = this.Env.mods,
                ret = true;
            S.each(modNames, function (name) {
                var mod = mods[name];
                if (!mod || mod.status !== ATTACHED) {
                    ret = false;
                    return ret;
                }
            });
            return ret;
        }
    });


})(KISSY, KISSY.__loader, KISSY.__loaderData);

/**
 * 2011-01-04 chengyu<yiminghe@gmail.com> refactor:
 *
 * adopt requirejs :
 *
 * 1. packages(cfg) , cfg :{
 *    name : 包名，用于指定业务模块前缀
 *    path: 前缀包名对应的路径
 *    charset: 该包下所有文件的编码
 *
 * 2. add(moduleName,function(S,depModule){return function(){}},{requires:["depModuleName"]});
 *    moduleName add 时可以不写
 *    depModuleName 可以写相对地址 (./ , ../)，相对于 moduleName
 *
 * 3. S.use(["dom"],function(S,DOM){
 *    });
 *    依赖注入，发生于 add 和 use 时期
 *
 * 4. add,use 不支持 css loader ,getScript 仍然保留支持
 *
 * 5. 部分更新模块文件代码 x/y?t=2011 ，加载过程中注意去除事件戳，仅在载入文件时使用
 *
 * demo : http://lite-ext.googlecode.com/svn/trunk/lite-ext/playground/module_package/index.html
 *
 * 2011-03-01 yiminghe@gmail.com note:
 *
 * compatibility
 *
 * 1. 保持兼容性，不得已而为之
 *      支持 { host : }
 *      如果 requires 都已经 attached，支持 add 后立即 attach
 *      支持 { attach : false } 显示控制 add 时是否 attach
 *      支持 { global : Editor } 指明模块来源
 *
 *
 * 2011-05-04 初步拆分文件，tmd 乱了
 */

