/**
 * @ignore
 * Export ComboBox.
 * @author yiminghe@gmail.com
 */

var ComboBox = require('combobox/control');
var LocalDataSource = require('combobox/local-data-source');
var RemoteDataSource = require('combobox/remote-data-source');
ComboBox.LocalDataSource = LocalDataSource;
ComboBox.RemoteDataSource = RemoteDataSource;
module.exports = ComboBox;