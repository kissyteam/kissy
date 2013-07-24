KISSY.clearLoader = function () {
    var self = this,
        Env = self.Env,
        modules = Env.mods,
        m;

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
                    p != 'callbacks' &&
                    p != 'runtime') {
                    delete modules[m][p];
                }
            }
            modules[m].status = 0;
        }
    }
};