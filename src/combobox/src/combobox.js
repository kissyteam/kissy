/**
 * @ignore
 * @fileOverview Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox", function (S, ComboBox, FilterSelect, LocalDataSource, RemoteDataSource) {
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    ComboBox.FilterSelect = FilterSelect;
    return ComboBox;
}, {
    requires: [
        'combobox/base',
        'combobox/filter-select',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
});