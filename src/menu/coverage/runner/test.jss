module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'menu',
        jss: '/kissy/src/menu/tests/runner/test.jss'
    }));
};