/**
 * @fileOverview logic for config.global , mainly for kissy.editor
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader) {
    if (typeof require !== 'undefined') {
        return;
    }
    S.mix(loader, {

        // 按需从 global 迁移模块定义到当前 loader 实例，并根据 global 设置 fullpath
        __mixMod: function(name, global) {
            // 从 __mixMods 调用过来时，可能本实例没有该模块的数据结构
            var self = this,
                mods = self.Env.mods,
                gMods = global.Env.mods,
                mod = mods[name] || {},
                status = mod.status;

            if (gMods[name]) {

                S.mix(mod, S.clone(gMods[name]));

                // status 属于实例，当有值时，不能被覆盖。
                // 1. 只有没有初始值时，才从 global 上继承
                // 2. 初始值为 0 时，也从 global 上继承
                // 其他都保存自己的状态
                if (status) {
                    mod.status = status;
                }
            }

            // 来自 global 的 mod, path 也应该基于 global
            self.__buildPath(mod, global.Config.base);

            mods[name] = mod;
        }
    });
})(KISSY, KISSY.__loader);