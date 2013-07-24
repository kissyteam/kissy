module.exports = function (req, res) {
    setTimeout(function () {
        res.sendfile(__dirname+'/space.gif');
    }, 1000);
};