module.exports = function (req, res) {
    res.set('content-type','application/json');
    res.json({
        url:req.url,
        originalUrl:req.originalUrl,
        t:req.query.t,
        y:req.query.y
    });
};
