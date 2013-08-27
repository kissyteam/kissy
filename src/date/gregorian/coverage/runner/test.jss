module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'date/gregorian',
        jss: '/kissy/src/date/gregorian/tests/runner/test.jss'
    }));
};