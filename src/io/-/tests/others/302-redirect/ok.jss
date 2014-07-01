module.exports = function (req, res) {
    var callback = req.param('callback');
    res.set('Content-Type', 'text/javascript');
    res.send(callback + '({ok:1});');
};