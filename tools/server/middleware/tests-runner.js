var prefix = '/kissy/src/';

module.exports = function (req, res, next) {
    var m = req.originalUrl.match(/(.+)\/tests\/runner(\?.+)?$/);
    if (!m) {
        next();
        return;
    }
    var componentName = m[1].slice(prefix.length).replace(/\/-(?=\/|$)/g, '');
    res.render('runner', {
        component: componentName,
        query: req.query
    });
};