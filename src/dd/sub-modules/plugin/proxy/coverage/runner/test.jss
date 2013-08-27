module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'dd/plugin/proxy',
        jss: '/kissy/src/dd/sub-modules/plugin/proxy/tests/runner/test.jss'
    }));
};