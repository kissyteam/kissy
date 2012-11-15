module.exports = function (req, res) {
    var json, m = req.param("_method");
    if (m == "read") {
        json = {"x": 1, "y": 2, "id": 9};
    }

    if (m == "update") {
        if (req.param('model')) {
            json = {"x": 5, "y": 2, "id": 9};
        } else {
            json = {"x": 566, "y": 6662, "id": 9};
        }
    }

    if (m == "delete") {
        json = {"x": -1, "y": 2, "id": -1};
    }

    res.json(json);
};