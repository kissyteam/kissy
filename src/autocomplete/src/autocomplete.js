/**
 * export autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete", function (S, AutoComplete, Input, LocalDataSource) {
    AutoComplete.Input = Input;
    AutoComplete.LocalDataSource = LocalDataSource;
    return AutoComplete;
}, {
    requires:['autocomplete/base', 'autocomplete/input', 'autocomplete/localdatasource']
})