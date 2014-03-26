/**
 * @ignore
 * Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var ComboBox = require('combobox/control');
    var LocalDataSource = require('combobox/local-data-source');
    var RemoteDataSource = require('combobox/remote-data-source');
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    return ComboBox;
});