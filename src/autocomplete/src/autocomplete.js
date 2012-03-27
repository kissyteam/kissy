/**
 * export autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete", function (S, AutoComplete, Input, LocalDataSource, RemoteDataSource) {
    AutoComplete.Input = Input;
    AutoComplete.LocalDataSource = LocalDataSource;
    AutoComplete.RemoteDataSource = RemoteDataSource;
    return AutoComplete;
}, {
    requires:['autocomplete/base',
        'autocomplete/input',
        'autocomplete/localDataSource',
        'autocomplete/remoteDataSource']
})