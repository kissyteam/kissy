module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'anim/timer',
        jss: '/kissy/src/anim/sub-modules/timer/tests/runner/test.jss'
    }));
};