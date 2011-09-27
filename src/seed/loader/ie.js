/**
 * for ie ,find current executive script ,then infer module name
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        //ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
        // 如果找不到，返回发送前那个脚本
        __findModuleNameByInteractive:function() {
            var self = this,
                scripts = document.getElementsByTagName("script"),
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
                S.log("can not find interactive script,time diff : " + (+new Date() - self.__startLoadTime), "error");
                S.log("old_ie get modname from cache : " + self.__startLoadModuleName);
                return self.__startLoadModuleName;
                //S.error("找不到 interactive 状态的 script");
            }

            // src 必定是绝对路径
            var src = utils.normalBasePath(re.src);
            src = src.substring(0, src.length - 1);
            S.log("interactive src :" + src);
            // 注意：模块名不包含后缀名以及参数，所以去除
            // 系统模块去除系统路径
            // 需要 base norm , 防止 base 被指定为相对路径
            self.Config.base = utils.normalBasePath(self.Config.base);
            if (src.lastIndexOf(self.Config.base, 0)
                === 0) {
                return utils.removePostfix(src.substring(self.Config.base.length));
            }

            var packages = self.__packages;
            //外部模块去除包路径，得到模块名
            for (var p in packages) {
                var p_path = packages[p].path;
                if (packages.hasOwnProperty(p)
                    && src.lastIndexOf(p_path, 0) === 0) {
                    return utils.removePostfix(src.substring(p_path.length));
                }
            }

            S.log("interactive script not have package config ：" + src, "error");
            //S.error("interactive 状态的 script 没有对应包 ：" + src);
            return undefined;
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);