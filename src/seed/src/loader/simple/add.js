/**
 * @ignore
 * add module to kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        UA = S.UA,
        utils = Loader.Utils;

    S.augment(Loader, Loader.Target, {

        // standard browser 如果 add 没有模块名，模块定义先暂存这里
        __currentMod: null,

        // ie 开始载入脚本的时间
        __startLoadTime: 0,

        // ie6,7,8开始载入脚本对应的模块名
        __startLoadModName: null,

        /**
         * Registers a module.
         * @param {String|Object} [name] module name
         * @param {Function|Object} [fn] entry point into the module that is used to bind module to KISSY
         * @param {Object} [config] special config for this add
         * @param {String[]} [config.requires] array of mod 's name that current module requires
         * @member KISSY.Loader
         *
         * for example:
         *      @example
         *      KISSY.add('package-name/module-name', function(S){ }, {requires: ['mod1']});
         */
        add: function (name, fn, config) {
            var self = this,
                runtime = self.runtime;

            // S.add(name[, fn[, config]])
            if (typeof name == 'string') {
                utils.registerModule(runtime, name, fn, config);
                return;
            }
            // S.add(fn,config);
            else if (S.isFunction(name)) {
                config = fn;
                fn = name;
                if (UA.ie) {
                    /*
                     Kris Zyp
                     2010年10月21日, 上午11时34分
                     We actually had some discussions off-list, as it turns out the required
                     technique is a little different than described in this thread. Briefly,
                     to identify anonymous modules from scripts:
                     * In non-IE browsers, the onload event is sufficient, it always fires
                     immediately after the script is executed.
                     * In IE, if the script is in the cache, it actually executes *during*
                     the DOM insertion of the script tag, so you can keep track of which
                     script is being requested in case define() is called during the DOM
                     insertion.
                     * In IE, if the script is not in the cache, when define() is called you
                     can iterate through the script tags and the currently executing one will
                     have a script.readyState == 'interactive'
                     See RequireJS source code if you need more hints.
                     Anyway, the bottom line from a spec perspective is that it is
                     implemented, it works, and it is possible. Hope that helps.
                     Kris
                     */
                    // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                    // use onload to get module name is not right in ie
                    name = findModuleNameByInteractive(self);
                    S.log('ie get modName by interactive: ' + name);
                    utils.registerModule(runtime, name, fn, config);
                    self.__startLoadModName = null;
                    self.__startLoadTime = 0;
                } else {
                    // 其他浏览器 onload 时，关联模块名与模块定义
                    self.__currentMod = {
                        fn: fn,
                        config: config
                    };
                }
                return;
            }
            S.log('invalid format for KISSY.add !', 'error');
        }
    });


    // ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
    // 如果找不到，返回发送前那个脚本
    function findModuleNameByInteractive(self) {
        var scripts = S.Env.host.document.getElementsByTagName('script'),
            re,
            i,
            name,
            script;

        for (i = scripts.length - 1; i >= 0; i--) {
            script = scripts[i];
            if (script.readyState == 'interactive') {
                re = script;
                break;
            }
        }
        if (re) {
            name = re.getAttribute('data-mod-name');
        } else {
            // sometimes when read module file from cache,
            // interactive status is not triggered
            // module code is executed right after inserting into dom
            // i has to preserve module name before insert module script into dom,
            // then get it back here
            // S.log('can not find interactive script,time diff : ' + (+new Date() - self.__startLoadTime), 'error');
            // S.log('old_ie get mod name from cache : ' + self.__startLoadModName);
            name = self.__startLoadModName;
        }
        return name;
    }

})(KISSY);

/*
 2012-02-21 yiminghe@gmail.com refactor:

 拆分 ComboLoader 与 Loader

 2011-01-04 chengyu<yiminghe@gmail.com> refactor:

 adopt requirejs :

 1. packages(cfg) , cfg :{
 name : 包名，用于指定业务模块前缀
 path: 前缀包名对应的路径
 charset: 该包下所有文件的编码

 2. add(moduleName,function(S,depModule){return function(){}},{requires:['depModuleName']});
 moduleName add 时可以不写
 depModuleName 可以写相对地址 (./ , ../)，相对于 moduleName

 3. S.use(['dom'],function(S,DOM){
 });
 依赖注入，发生于 add 和 use 时期

 4. add,use 不支持 css loader ,getScript 仍然保留支持

 5. 部分更新模块文件代码 x/y?t=2011 ，加载过程中注意去除事件戳，仅在载入文件时使用

 demo : http://lite-ext.googlecode.com/svn/trunk/lite-ext/playground/module_package/index.html

 2011-03-01 yiminghe@gmail.com note:

 compatibility

 1. 保持兼容性
 如果 requires 都已经 attached，支持 add 后立即 attach
 支持 { attach : false } 显示控制 add 时是否 attach

 2011-05-04 初步拆分文件，tmd 乱了
 */
