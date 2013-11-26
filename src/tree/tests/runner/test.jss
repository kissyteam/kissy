module.exports = function (req, res, utils) {
    res.send(utils.render('runner', {
        component: 'tree',
        externalLinks: [
            '/kissy/build/tree/assets/dpl.css'
        ]
    }));
};
