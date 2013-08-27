module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'anim/transition',
        jss: '/kissy/src/anim/sub-modules/transition/tests/runner/test.jss'
    }));
};