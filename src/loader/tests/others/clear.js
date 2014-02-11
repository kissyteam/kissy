KISSY.clearLoader = function () {
    var self = this,
        Env = self.Env,
        modules = Env.mods,
        m;

    var ignore = {
        empty: 1,
        uri: 1,
        ua: 1,
        path: 1
    };

    self.config({
        alias: false,
        tag: false,
        debug: true,
        group: false,
        packages: false
    });

    self.Env.corePackage = new self.Loader.Package({
        name: '',
        runtime: self,
        uri: self.Config.baseUri
    });

    for (m in modules) {
        if (!ignore[m]) {
            delete modules[m];
        }
    }
};