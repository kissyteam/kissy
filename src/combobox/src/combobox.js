/**
 * @ignore
 *  Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox", function (S, ComboBox, MultiValueComboBox, FilterSelect, LocalDataSource, RemoteDataSource) {
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    ComboBox.FilterSelect = FilterSelect;
    ComboBox.MultiValueComboBox = MultiValueComboBox;
    return ComboBox;
}, {
    requires: [
        'combobox/base',
        'combobox/multi-value-combobox',
        'combobox/filter-select',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
});