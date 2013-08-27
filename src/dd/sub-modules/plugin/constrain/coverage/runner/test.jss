module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'dd/plugin/constrain',
        jss: '/kissy/src/dd/sub-modules/plugin/constrain/tests/runner/test.jss'
    }));
};