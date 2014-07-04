include benchmark:

loading: includes/common,includes/xtpl,includes/common-dust,includes/dust,includes/common-nunjucks,includes/common-handlebars,includes/handlebars

benchmarking: includes/common,includes/xtpl,includes/common-dust,includes/dust,includes/common-nunjucks,includes/common-handlebars,includes/handlebars

includes/common x 34,809 ops/sec ±4.53% (78 runs sampled)

includes/common-dust x 52,913 ops/sec ±4.95% (80 runs sampled)

includes/common-nunjucks x 30,962 ops/sec ±3.16% (78 runs sampled)

includes/common-handlebars x 138,828 ops/sec ±2.51% (84 runs sampled)

common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/xtpl x 95,101 ops/sec ±8.09% (62 runs sampled)

common/dust x 97,869 ops/sec ±2.58% (67 runs sampled)

common/jade x 23,351 ops/sec ±3.91% (70 runs sampled)

common/nunjucks x 68,718 ops/sec ±3.25% (79 runs sampled)

common/handlebars x 320,949 ops/sec ±2.67% (86 runs sampled)

common/ejs x 59,510 ops/sec ±2.58% (84 runs sampled)

all is over

## defer

include benchmark:

loading: includes/common,includes/xtpl,includes/common-dust,includes/dust,includes/common-nunjucks,includes/common-handlebars,includes/handlebars

benchmarking: includes/common,includes/xtpl,includes/common-dust,includes/dust,includes/common-nunjucks,includes/common-handlebars,includes/handlebars

includes/common x 199 ops/sec ±1.56% (24 runs sampled)

includes/common-dust x 199 ops/sec ±2.40% (43 runs sampled)

includes/common-nunjucks x 197 ops/sec ±1.50% (23 runs sampled)

includes/common-handlebars x 198 ops/sec ±1.55% (24 runs sampled)

common benchmark:

loading: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

benchmarking: common/xtpl,common/dust,common/jade,common/nunjucks,common/handlebars,common/ejs

common/xtpl x 198 ops/sec ±2.53% (23 runs sampled)

common/dust x 197 ops/sec ±2.69% (23 runs sampled)

common/jade x 199 ops/sec ±1.48% (24 runs sampled)

common/nunjucks x 199 ops/sec ±1.79% (24 runs sampled)

common/handlebars x 197 ops/sec ±0.39% (6 runs sampled)

common/ejs x 196 ops/sec ±0.59% (6 runs sampled)

all is over