module.exports = function (req, res, config) {
    res.status(301);
    res.set('Location', 'http://' + req.host + ':' + config.server.ports[0] + '/kissy/package.json');
    res.end();
};