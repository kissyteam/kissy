module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'mvc',
        jss: '/kissy/src/mvc/tests/runner/test.jss'
    }));
};