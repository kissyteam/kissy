module.exports = function (req, res) {
    res.render('runner', {
        loader:true,
        component: 'path',
        query: req.query
    });
};