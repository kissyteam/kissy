module.exports = function (req, res,utils) {
    res.status(301);
    res.set('Location','http://'+req.host+':'+utils.config.ports[0]+'/kissy/package.json');
    res.end();
};