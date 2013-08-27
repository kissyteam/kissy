module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'dom/selector',
        jss: '/kissy/src/dom/sub-modules/selector/tests/runner/test.jss'
    }));
};