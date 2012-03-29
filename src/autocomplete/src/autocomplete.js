/**
 * export autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete", function (S, Menu, AutoComplete, LocalDataSource, RemoteDataSource, Basic, BasicComboBox) {
    AutoComplete.Menu = Menu;
    AutoComplete.LocalDataSource = LocalDataSource;
    AutoComplete.RemoteDataSource = RemoteDataSource;
    AutoComplete.Basic = Basic;
    AutoComplete.BasicComboBox = BasicComboBox;
    return AutoComplete;
}, {
    requires:['autocomplete/menu',
        'autocomplete/input',
        'autocomplete/localDataSource',
        'autocomplete/remoteDataSource',
        'autocomplete/basic',
        'autocomplete/BasicComboBox']
})