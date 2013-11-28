config({
    'dom/basic': {
        'alias': [
            'dom/base',
            Features.isIELessThan(9) ? 'dom/ie' : '',
            Features.isClassListSupported() ? '' : 'dom/class-list'
        ]
    },
    'dom': {
        'alias': [
            'dom/basic',
            !Features.isQuerySelectorSupported() ? 'dom/selector' : ''
        ]
    }
});