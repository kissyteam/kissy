module.exports = function (req, res) {
    res.redirect('../ok.jss?callback=' + req.param('callback'));
};