module.exports = function (req, res, utils) {
    setTimeout(function () {
        res.set('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
        res.set('Cache-Control', 'no-cache');
        res.set('Pragma', 'no-cache');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Origin', 'http://' + req.host + ':' + utils.config.ports[0]);
        res.set('Access-Control-Allow-Headers', 'origin, x-requested-with, yiminghe, content-type, accept, *');
        var ret = {
            yiminghe: req.get('yiminghe'),
            action: req.query.action,
            cors: req.cookies.cors
        };
        if (req.get('X-Requested-With')) {
            ret['X-Requested-With'] = req.get('X-Requested-With');
        }
        res.json(ret);
    }, 10);
};