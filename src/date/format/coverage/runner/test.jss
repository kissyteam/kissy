module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'date/format',
        jss: '/kissy/src/date/format/tests/runner/test.jss'
    }));
};