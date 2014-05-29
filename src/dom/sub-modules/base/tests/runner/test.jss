module.exports = function (req, res) {
    res.render('runner', {
        externalScripts: ['/kissy/tools/third-party/jquery.js'],
        component: 'dom/base',
        query: req.query
    });
};