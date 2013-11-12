KISSY.add(function () {
    var module = this;
    var x = module.require('./x');
    module.require('./y.css');
    return "y + " + x
});

