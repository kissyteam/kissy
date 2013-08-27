module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'resizable',
        jss: '/kissy/src/resizable/tests/runner/test.jss'
    }));
};