/**
 * @fileOverview Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox", function (S, Menu, ComboBox, LocalDataSource, RemoteDataSource) {
    ComboBox.Menu = Menu;
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    return ComboBox;
}, {
    requires:[
        'combobox/menu',
        'combobox/base',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
})