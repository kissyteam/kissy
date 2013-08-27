module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'cookie',
        jss: '/kissy/src/cookie/tests/runner/test.jss'
    }));
};