config({
    'dom/basic': {
        alias: [
            'dom/base',
            UA.ieMode < 9 ? 'dom/ie' : '',
            Feature.isClassListSupported() ? '' : 'dom/class-list'
        ]
    },
    dom: {
        alias: [
            'dom/basic',
            !Feature.isQuerySelectorSupported() ? 'dom/selector' : ''
        ]
    }
});