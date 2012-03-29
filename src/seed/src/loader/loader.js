/**
 * simple loader from KISSY<=1.2
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        utils = Loader.Utils;


    S.augment(Loader,
        Loader.Target,
        {

            //firefox,ie9,chrome 如果add没有模块名，模块定义先暂存这里
            __currentModule:null,

            //ie6,7,8开始载入脚本的时间
            __startLoadTime:0,

            //ie6,7,8开始载入脚本对应的模块名
            __startLoadModuleName:null,

            /**
             * Registers a module.
             * @param {String|Object} [name] module name
             * @param {Function|Object} [def] entry point into the module that is used to bind module to KISSY
             * @param {Object} [config] special config for this add
             * @param {String[]} [config.requires] array of mod's name that current module requires
             * @example
             * <code>
             * KISSY.add('module-name', function(S){ }, {requires: ['mod1']});

             * KISSY.add({
             *     'mod-name': {
             *         fullpath: 'url',
             *         requires: ['mod1','mod2']
             *     }
             * });
             * </code>
             */
            add:function (name, def, config) {
                var self = this,
                    SS = self.SS,
                    mod,
                    requires,
                    mods = SS.Env.mods,
                    o;

                if (utils.normAdd(SS, name, def, config)) {
                    return;
                }

                // S.add(name[, fn[, config]])
                if (S.isString(name)) {

                    utils.registerModule(SS, name, def, config);

                    mod = mods[name];

                    // 显示指定 add 不 attach
                    if (config && config['attach'] === false) {
                        return;
                    }

                    requires = utils.normalizeModNames(SS, mod.requires, name);

                    if (utils.isAttached(SS, requires)) {
                        utils.attachMod(SS, mod);
                    }
                    return;
                }
                // S.add(fn,config);
                else if (S.isFunction(name)) {
                    config = def;
                    def = name;
                    if (utils.IE) {
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
                         have a script.readyState == "interactive"
                         See RequireJS source code if you need more hints.
                         Anyway, the bottom line from a spec perspective is that it is
                         implemented, it works, and it is possible. Hope that helps.
                         Kris
                         */
                        // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                        // use onload to get module name is not right in ie
                        name = findModuleNameByInteractive(self);
                        S.log("old_ie get modname by interactive : " + name);
                        utils.registerModule(SS, name, def, config);
                        self.__startLoadModuleName = null;
                        self.__startLoadTime = 0;
                    } else {
                        // 其他浏览器 onload 时，关联模块名与模块定义
                        self.__currentModule = {
                            def:def,
                            config:config
                        };
                    }
                    return;
                }
                S.log("invalid format for KISSY.add !", "error");
            }
        });




    // ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
    // 如果找不到，返回发送前那个脚本
    function findModuleNameByInteractive(self) {
        var self = this,
            SS = self.SS,
            base,
            scripts = S.Env.host.document.getElementsByTagName("script"),
            re,
            script;

        for (var i = 0; i < scripts.length; i++) {
            script = scripts[i];
            if (script.readyState == "interactive") {
                re = script;
                break;
            }
        }
        if (!re) {
            // sometimes when read module file from cache , interactive status is not triggered
            // module code is executed right after inserting into dom
            // i has to preserve module name before insert module script into dom , then get it back here
            S.log("can not find interactive script,time diff : " + (+new Date() - self.__startLoadTime), "error");
            S.log("old_ie get modname from cache : " + self.__startLoadModuleName);
            return self.__startLoadModuleName;
            //S.error("找不到 interactive 状态的 script");
        }

        // src 必定是绝对路径
        // or re.hasAttribute ? re.src :  re.getAttribute('src', 4);
        // http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        var src = utils.absoluteFilePath(re.src);
        // 注意：模块名不包含后缀名以及参数，所以去除
        // 系统模块去除系统路径
        // 需要 base norm , 防止 base 被指定为相对路径
        // configs 统一处理
        // SS.Config.base = SS.normalBasePath(self.Config.base);
        if (src.lastIndexOf(base = SS.Config.base, 0) === 0) {
            return utils.removePostfix(src.substring(base.length));
        }
        var packages = SS.Config.packages;
        //外部模块去除包路径，得到模块名
        for (var p in packages) {
            if (packages.hasOwnProperty(p)) {
                var p_path = packages[p].path;
                if (packages.hasOwnProperty(p) &&
                    src.lastIndexOf(p_path, 0) === 0) {
                    return utils.removePostfix(src.substring(p_path.length));
                }
            }
        }
        S.log("interactive script does not have package config ：" + src, "error");
    }

})(KISSY);

/**
 * 2012-02-21 yiminghe@gmail.com refactor:
 *
 * 拆分 ComboLoader 与 Loader
 *
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
 * 2011-05-04 初步拆分文件，tmd 乱了
 */
