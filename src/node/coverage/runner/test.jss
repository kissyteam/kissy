module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'node',
        jss: '/kissy/src/node/tests/runner/test.jss'
    }));
};