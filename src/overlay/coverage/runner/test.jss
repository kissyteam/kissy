module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'overlay',
        jss: '/kissy/src/overlay/tests/runner/test.jss'
    }));
};