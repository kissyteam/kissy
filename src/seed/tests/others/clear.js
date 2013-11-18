KISSY.clearLoader = function () {
    var self = this,
        Env = self.Env,
        modules = Env.mods,
        m;

    var ignore={
        empty:1,
        uri:1,
        ua:1,
        path:1
    };

    self.config({
        packages: false
    });

    for (m in modules) {
        if (!ignore[m]) {
            var p;
            for (p in modules[m]) {
                if (p != 'alias' &&
                    p != 'name' &&
                    p != 'type' &&
                    p != 'runtime') {
                    delete modules[m][p];
                }
            }
            modules[m].waitedCallbacks = [];
            modules[m].status = 0;
        }
    }
};