var prefix = '/kissy/src/';

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/(.+)\/tests\/runner(\?.+)?$/);
    if (!m) {
        next();
        return;
    }
    var path = m[1];
    var componentName = path.slice(prefix.length).replace(/sub-modules\//g, '');
    res.render('runner', {
        component: componentName,
        query: req.query
    });
};