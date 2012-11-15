module.exports = function (req, res) {
    var start = parseInt(req.query.start), data = [];
    for (var i = 0; i < 10; i++) {
        data.push(i + start + '')
    }
    res.json({
        result: data
    });
};