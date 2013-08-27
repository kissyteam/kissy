module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'editor',
        jss: '/kissy/src/editor/tests/runner/test.jss'
    }));
};