module.exports = function (req, res) {

    res.set('Content-Type', 'text/html');
    res.send('<html><script>window.ooxx_html_jss=1</script><body><b>html</b></body></html>');

};