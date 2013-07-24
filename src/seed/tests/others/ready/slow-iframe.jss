module.exports = function (req, res) {
    setTimeout(function () {
        res.send('<html><body>1234</body></html>');
    }, 5000);
};