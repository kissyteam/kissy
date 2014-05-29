module.exports = function (req, res) {
    res.render('runner', {
        externalStyle: '.ks-dd-proxy {position:absolute;left:-9999px;top:-9999px}',
        component: 'dd/plugin/proxy',
        query: req.query
    });
};