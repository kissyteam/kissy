module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'base',
        jss: '/kissy/src/base/tests/runner/test.jss'
    }));
};