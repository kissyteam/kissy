/**
 * export autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete", function (S, Menu, AutoComplete, LocalDataSource, RemoteDataSource, Basic) {
    AutoComplete.Menu = Menu;
    AutoComplete.LocalDataSource = LocalDataSource;
    AutoComplete.RemoteDataSource = RemoteDataSource;
    AutoComplete.Basic = Basic;
    return AutoComplete;
}, {
    requires:['autocomplete/menu',
        'autocomplete/input',
        'autocomplete/localDataSource',
        'autocomplete/remoteDataSource',
        'autocomplete/basic']
})