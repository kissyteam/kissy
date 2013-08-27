module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'io',
        jss: '/kissy/src/io/tests/runner/test.jss'
    }));
};