/**
 * @fileOverview Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox", function (S, ComboBox, LocalDataSource, RemoteDataSource) {
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    return ComboBox;
}, {
    requires:[
        'combobox/base',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
})