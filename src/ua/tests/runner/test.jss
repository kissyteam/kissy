module.exports = function (req, res) {
    req.query = req.query || {};
    req.query.loader = 1;
    res.render('runner', {
        loader: true,
        component: 'ua',
        query: req.query
    });
};