module.exports = function (req, res) {
    res.json({
        url:req.url,
        originalUrl:req.originalUrl,
        t:req.query.t,
        y:req.query.y
    });
};