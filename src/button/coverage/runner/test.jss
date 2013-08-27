module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'button',
        jss: '/kissy/src/button/tests/runner/test.jss'
    }));
};