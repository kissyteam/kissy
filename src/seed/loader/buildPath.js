/**
 * build full path from relative path and base path
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        __buildPath:function (mod, base) {
            var self = this,
                Config = self.Config;

            base = base || Config.base;

            build("fullpath", "path");

            if (mod["cssfullpath"] !== data.LOADED) {
                build("cssfullpath", "csspath");
            }

            function build(fullpath, path) {

                if (mod[fullpath + "__builded"]) {
                    return;
                }

                mod[fullpath + "__builded"] = 1;

                if (!mod[fullpath] && mod[path]) {
                    //如果是 ./ 或 ../ 则相对当前模块路径
                    mod[path] = utils.normalDepModuleName(mod.name, mod[path]);
                    mod[fullpath] = base + mod[path];
                }
                // debug 模式下，加载非 min 版
                if (mod[fullpath] && Config.debug) {
                    mod[fullpath] = mod[fullpath].replace(/-min/ig, "");
                }

                //刷新客户端缓存，加时间戳 tag
                if (mod[fullpath]
                    && !(mod[fullpath].match(/\?t=/))
                    && mod.tag) {
                    mod[fullpath] += "?t=" + mod.tag;
                }

                if (mod[fullpath]) {
                    mod[fullpath] = self.__getMappedPath(mod[fullpath]);
                }

            }
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);