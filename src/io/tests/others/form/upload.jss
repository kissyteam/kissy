module.exports = function (req, res) {

    //setTimeout(function () {
    var t = {}, query = req.body;
    if (query.test) {
        t.test = query.test;
    }
    if (query.test2) {
        t.test2 = query.test2;
    }
    if (query.test3) {
        t.test3 = query.test3;
    }
    if (query.test4) {
        t.test4 = query.test4;
    }
    if (query.test5) {
        t.test5 = query.test5;
    }
    res.send(JSON.stringify(t));

    //},
    // >10 will error for phantomjs!
    //10);


};