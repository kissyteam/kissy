module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'event/dom/base',
        jss: '/kissy/src/event/sub-modules/dom/sub-modules/base/tests/runner/test.jss'
    }));
};