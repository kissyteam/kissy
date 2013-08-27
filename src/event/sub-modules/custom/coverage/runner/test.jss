module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'event/custom',
        jss: '/kissy/src/event/sub-modules/custom/tests/runner/test.jss'
    }));
};