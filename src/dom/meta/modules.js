config({
    "dom": {
        "alias": [
            'dom/base',
            Features.isIELessThan(9) ? 'dom/ie' : '',
            !Features.isQuerySelectorSupported() ? 'dom/selector' : '',
            Features.isClassListSupported() ? '' : 'dom/class-list'
        ]
    }
});