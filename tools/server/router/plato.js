var plato = require('../../plato/plato');

module.exports = function (app) {
    app.get('/plato/*', function (req, res) {
        var mod = req.params[0];
        plato.run(mod, function () {
            res.redirect('/kissy/reports/' + mod + '/index.html');
        });
    });
};