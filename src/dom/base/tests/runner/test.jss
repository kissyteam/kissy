module.exports = function (req, res) {
    res.render('runner', {
        externalScripts: ['http://g.alicdn.com/kissy/third-party/0.1.0/jquery.js'],
        component: 'dom/base',
        query: req.query
    });
};
