module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'kison',
        jss: '/kissy/src/kison/tests/runner/test.jss'
    }));
};