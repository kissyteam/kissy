module.exports = function (req, res) {
    res.render('runner', {
        component: 'combobox',
        externalLinks: [
            '/kissy/src/button/assets/dpl.css',
            '/kissy/src/combobox/-/assets/dpl.css',
            '/kissy/src/menu/assets/dpl.css'],
        query: req.query
    });
};
