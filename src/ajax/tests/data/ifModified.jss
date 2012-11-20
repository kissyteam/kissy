module.exports = function (req, res) {
    if (req.get('If-Modified-Since')) {
        res.set('Expires', 'Thu, 16 Aug 2012 01:50:40 GMT');
        res.status(304);
        res.end();
    } else {
        res.set('Last-Modified', 'Thu, 18 Jul 2002 15:48:32 GMT');
        res.set('Expires', 'Thu, 16 Aug 2012 01:50:40 GMT');
        res.send("haha");
    }
};