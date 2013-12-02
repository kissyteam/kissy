module.exports = function (req, res) {
    var contentType, sleep, query = req.query;
    if ((contentType = query.contentType)) {
        res.set('Content-Type', contentType);
    }

    sleep = query.sleep;

    function run() {
        var data = KISSY.merge({
                contentType:req.get('content-type'),
                'name': 'test',
                'birth': '2010/11/23',
                'email': 'test@gmail.com'
            }, query,req.body), dataStr = JSON.stringify(data),
            t;

        if (t = (query.customCallback || query.callback)) {
            dataStr = t + '(' + dataStr + ');';
        } else if (req.method === 'POST' && query.dataType === 'script') {
            dataStr = 'var global_script_test = 500;';
        } else if (query.dataType === 'script') {
            dataStr = 'var global_script_test = 200;';
        }

        res.send(dataStr);
    }

    if (sleep) {
        setTimeout(run, sleep);
    } else {
        run();
    }
};