function log(str) {
    self.postMessage({
        log: str
    });
}

self.onmessage = function (e) {
    importScripts('http://' + e.data.host + '/kissy/build/seed.js');
    KISSY.config('base', 'http://' + e.data.host + '/kissy/build/');
    //KISSY.config('combine',true);
    KISSY.config('loadModsFn', function (rs, config) {
        importScripts(rs.fullpath);
        config.success();
    });
    var S = KISSY;
    S.use('color', function (S, Color) {
        // reuse
        var color = new Color({
            r: 0,
            g: 0,
            b: 0
        });
        self.onmessage = function (e) {
            var originalImageData = e.data.data;
            var percentage = e.data.percentage;
            var pixelData = [];
            for (var i = 0; i < originalImageData.length; i += 4) {
                var r = originalImageData[i];
                var g = originalImageData[i + 1];
                var b = originalImageData[i + 2];
                color.set({
                    r: r,
                    g: g,
                    b: b
                });
                var hsl = color.getHSL();
                hsl.h *= percentage.h;
                hsl.s *= percentage.s;
                hsl.l *= percentage.l;
                color.setHSL(hsl);
                pixelData[i] = color.get('r');
                pixelData[i + 1] = color.get('g');
                pixelData[i + 2] = color.get('b');
                pixelData[i + 3] = originalImageData[i + 3];
            }
            self.postMessage({
                data: pixelData,
                callback: e.data.callback
            });
        };

        self.postMessage({
            complete: 1
        });
    });
};