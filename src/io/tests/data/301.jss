module.exports = function (req, res,config) {
    res.status(301);
    res.set('Location','http://'+config.server.host+':'+config.server.ports[0]+'/kissy/package.json');
    res.end();
};