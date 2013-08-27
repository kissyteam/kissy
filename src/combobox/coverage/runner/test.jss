module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'combobox',
        jss: '/kissy/src/combobox/tests/runner/test.jss'
    }));
};