module.exports = function (req, res) {
    var contentType, sleep, query = req.query;
    if ((contentType = query.contentType)) {
        res.set('Content-Type', contentType);
    }

    sleep = query.sleep;

    function merge() {
        var ret = {};
        for (var i = 0; i < arguments.length; i++) {
            var from = arguments[i];
            for (var j in from) {
                ret[j] = from[j];
            }
        }
        return ret;
    }

    function run() {
        var data = merge({
                contentType: req.get('content-type'),
                'name': 'test',
                'birth': '2010/11/23',
                'email': 'test@gmail.com'
            }, query, req.body), dataStr = JSON.stringify(data),
            t;

        if (t = (query.customCallback || query.callback)) {
            dataStr = t + '(' + dataStr + ');';
        } else if (req.method === 'POST' && query.dataType === 'script') {
            dataStr = 'var globalScriptTest = 500;';
        } else if (query.dataType === 'script') {
            dataStr = 'var globalScriptTest = 200;';
        }

        res.send(dataStr);
    }

    if (sleep) {
        setTimeout(run, sleep);
    } else {
        run();
    }
};