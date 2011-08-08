/**
 * logic for config.global , mainly for kissy.editor
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader) {
    if("require" in this) {
        return;
    }
    S.mix(loader, {
        __mixMods: function(global) {
            var mods = this.Env.mods,
                gMods = global.Env.mods,
                name;
            for (name in gMods) {
                this.__mixMod(mods, gMods, name, global);
            }
        },

        __mixMod: function(mods, gMods, name, global) {
            var mod = mods[name] || {},
                status = mod.status;

            S.mix(mod, S.clone(gMods[name]));

            // status 属于实例，当有值时，不能被覆盖。
            // 1. 只有没有初始值时，才从 global 上继承
            // 2. 初始值为 0 时，也从 global 上继承
            // 其他都保存自己的状态
            if (status) {
                mod.status = status;
            }

            // 来自 global 的 mod, path 应该基于 global
            if (global) {
                this.__buildPath(mod, global.Config.base);
            }

            mods[name] = mod;
        }
    });
})(KISSY, KISSY.__loader);