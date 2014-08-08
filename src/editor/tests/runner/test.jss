module.exports = function (req, res) {
    res.render('runner', {
        externalLinks: [
            '/kissy/src/css/assets/dpl/base.css'
        ],
        component: 'editor',
        query: req.query
    });
};
