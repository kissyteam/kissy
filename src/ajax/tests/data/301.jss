module.exports = function (req, res) {
    res.status(301);
    res.set('Location','http://'+req.host+':8888/kissy/package.json');
    res.end();
};