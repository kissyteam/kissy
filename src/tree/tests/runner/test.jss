module.exports = function (req, res) {
    res.render('runner', {
        component: 'tree',
        externalLinks: [
            '/kissy/build/tree/assets/dpl.css'
        ],
        query: req.query
    });
};
