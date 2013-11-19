/**
 * @ignore
 * Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    var module=this;
    var ComboBox=module.require('combobox/control');
    var MultiValueComboBox=module.require('combobox/multi-value-combobox');
    var FilterSelect=module.require('combobox/filter-select');
    var LocalDataSource=module.require('combobox/local-data-source');
    var RemoteDataSource=module.require('combobox/remote-data-source');

    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    ComboBox.FilterSelect = FilterSelect;
    ComboBox.MultiValueComboBox = MultiValueComboBox;
    return ComboBox;
});