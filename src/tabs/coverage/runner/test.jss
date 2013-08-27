module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'tabs',
        jss: '/kissy/src/tabs/tests/runner/test.jss'
    }));
};