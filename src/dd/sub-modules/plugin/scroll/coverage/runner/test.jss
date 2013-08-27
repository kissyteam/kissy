module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'dd/plugin/scroll',
        jss: '/kissy/src/dd/sub-modules/plugin/scroll/tests/runner/test.jss'
    }));
};