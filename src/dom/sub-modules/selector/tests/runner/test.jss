module.exports = function (req, res) {
    res.render('runner', {
        externalScripts: [
            'http://g.tbcdn.cn/kissy/third-party/0.1.0/jquery.js',
            'http://g.tbcdn.cn/kissy/third-party/0.1.0/sizzle.js'
        ],
        component: 'dom/selector',
        query: req.query
    });
};