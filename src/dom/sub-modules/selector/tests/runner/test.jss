module.exports = function (req, res) {
    res.render('runner', {
        externalScripts: [
            '/kissy/tools/third-party/jquery.js',
            '/kissy/tools/third-party/sizzle.js'
        ],
        component: 'dom/selector'
    });
};