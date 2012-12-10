module.exports = function (req, res) {
    var data = {};
    data = req.body;
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
};
