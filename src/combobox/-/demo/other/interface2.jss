module.exports = function (req, res) {
    var start = parseInt(req.query.start,10),
        data = [];
    for (var i = 0; i < 1000; i++) {
        data.push(i + start + '');
    }
    res.json({
        result: data
    });
};