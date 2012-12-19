module.exports = function (req, res) {
    console.log(req);

    res.json({
        url:req.url,
        originalUrl:req.originalUrl,
        query:req.query.t
    });
};