module.exports = function (req, res) {
    res.status(301);
    res.set('Location','http://localhost:8888/package.json');
    res.end();
};