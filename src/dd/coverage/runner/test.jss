module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'dd',
        jss: '/kissy/src/dd/tests/runner/test.jss'
    }));
};