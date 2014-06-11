// --no-module-wrap--
KISSY.clearLoader = function () {
    var self = this,
        Env = self.Env,
        modules = Env.mods,
        m;

    self.config({
        alias: false,
        tag: false,
        debug: true,
        group: false,
        packages: false
    });

    for (m in modules) {
        if (m !== 'logger') {
            delete modules[m];
        }
    }
};