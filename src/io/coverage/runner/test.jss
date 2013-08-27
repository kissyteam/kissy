module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'html-parser',
        jss: '/kissy/src/html-parser/tests/runner/test.jss'
    }));
};