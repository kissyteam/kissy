module.exports = function (req, res) {

    setTimeout(function () {
        res.set('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
        res.set('Cache-Control', 'no-cache');
        res.set('Pragma', 'no-cache');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Origin', 'http://chengyu.taobao.ali.com:8888');
        res.set('Access-Control-Allow-Headers', 'Content-Type, *');
        res.send('{"' + req.query.action + '": 1}');
    }, 1000);

};