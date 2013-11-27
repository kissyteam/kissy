module.exports = function (req, res) {
    var json={}, m = req.param("_method");
    if (m == "read") {
        json = [{'x':11,'y':22,'id':9}];
    }

    if (m == "save") {
        json = {'x':5,'y':2,'id':9};
    }


    if (m == "create") {
        json = {'x':11,'y':22,'id':9};
    }

    res.json(json);
};