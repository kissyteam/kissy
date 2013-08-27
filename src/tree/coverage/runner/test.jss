module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'tree',
        jss: '/kissy/src/tree/tests/runner/test.jss'
    }));
};