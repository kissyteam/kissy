module.exports = function (req, res,utils) {
    setTimeout(function () {
        var t = {},
            query = req.body;
        if (query.test) {
            t.test = query.test;
        }
        if (query.test2) {
            t.test2 = query.test2;
        }
        if (query.test3) {
            t.test3 = query.test3;
        }
        if (query.test4) {
            t.test4 = query.test4;
        }
        if (query.test5) {
            t.test5 = query.test5;
        }
        var data = '<!doctype html><html><head>' +
            '<script>document.domain=window.location.hostname.split(".").slice(-3).join(".");</script>' +
            '</head><body>';
        data += JSON.stringify(t);
        data += '</body></html>';
        res.set('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
        res.set('Cache-Control', 'no-cache');
        res.set('Pragma', 'no-cache');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Origin', 'http://'+req.host+':'+utils.config.ports[0]);
        res.set('Access-Control-Allow-Headers', 'origin, x-requested-with, yiminghe, content-type, accept, *');
        res.send(data);
    }, 10);
};