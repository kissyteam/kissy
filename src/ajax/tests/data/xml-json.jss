module.exports = function (req, res) {

        res.set('Content-Type', 'text/xml');
        res.send('{"x":1}');

};