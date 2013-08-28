module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'dom/base',
        jss: '/kissy/src/dom/sub-modules/base/tests/runner/test.jss'
    }));
};