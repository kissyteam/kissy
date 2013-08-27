module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'json',
        jss: '/kissy/src/json/tests/runner/test.jss'
    }));
};