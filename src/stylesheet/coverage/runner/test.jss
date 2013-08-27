module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'stylesheet',
        jss: '/kissy/src/stylesheet/tests/runner/test.jss'
    }));
};