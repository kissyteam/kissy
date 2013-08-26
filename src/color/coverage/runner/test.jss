module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'color',
        jss: '/kissy/src/color/tests/runner/test.jss'
    }));
};