KISSY.clearLoader = function () {
    var self = this,
        Env = self.Env,
        modules = Env.mods,
        m;

    var ignore={
        empty:1,
        uri:1,
        promise:1,
        ua:1,
        path:1
    };

    self.config({
        map: false,
        mapCombo: false,
        packages: false
    });

    for (m in modules) {
        if (!ignore[m]) {
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