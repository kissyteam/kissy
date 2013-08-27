module.exports = function (req, res, utils) {
    res.send(utils.render('coverage', {
        component: 'swf',
        jss: '/kissy/src/swf/tests/runner/test.jss'
    }));
};