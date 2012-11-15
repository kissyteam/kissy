module.exports = function (req, res) {

    res.set('Content-Type', 'text/xml');
    res.send('<?xml version="1.0" encoding="utf-8" ?>' +
        '<item><name>John</name></item>');

};