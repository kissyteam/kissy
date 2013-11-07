self.onmessage = function (e) {
    importScripts('http://' + e.data.host + '/kissy/build/seed.js');
    KISSY.config('base', 'http://' + e.data.host + '/kissy/build/');
    //KISSY.config('combine',true);
    KISSY.config('loadModsFn', function (rs, config) {
        importScripts(rs.fullpath);
        config.success();
    });
    KISSY.use('color',function(S,Color){
        self.onmessage=function(e){
           self.postMessage({
              color: Color.parse(e.data.color).toRGB()
           });
        };
        self.postMessage({
            complete:1
        });
    });
};