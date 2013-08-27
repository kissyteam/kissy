module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'event/dom/focusin',
        jss: '/kissy/src/event/sub-modules/dom/sub-modules/focusin/tests/runner/test.jss'
    }));
};