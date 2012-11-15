module.exports = function (req, res) {
    setTimeout(function () {
        res.set('Content-Type', 'text/javascript');
        res.send('{"x":1}');
    }, 5000);
};