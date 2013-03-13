KISSY.clearLoader = function () {
    var self = this,
        Env = self.Env,
        modules = Env.mods,
        m,
        l;

    if ((l = Env._comboLoader) && l.clear) {
        l.clear();
    }
    if ((l = Env._loader) && l.clear) {
        l.clear();
    }

    self.config({
        map: false,
        mapCombo: false,
        packages: false
    });

    for (m in modules) {
        if (m != 'empty') {
            var p;
            for (p in modules[m]) {
                if (p != 'alias' &&
                    p != 'name' &&
                    p != 'type' &&
                    p != 'runtime') {
                    delete modules[m][p];
                }
            }
            modules[m].status = 0;
        }
    }
};