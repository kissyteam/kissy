# event/dom advanced api

## DomEvent.on(node, 'click', fn);

## DomEvent.on(node, 'click.g1.g2', fn);

## DomEvent.on(node, 'click', fn, context);

## DomEvent.on(node, 'click', cfg)

``` javascript
DomEvent.on(node, 'click', {
  fn: fn,
  context: context,
  filter:filter,
  once: true
});

DomEvent.on(node, 'click', {
  fn: fn,
  data: data
});

function fn(e, data){
}
```

## DomEvent.on(node, cfg);

``` javascript
DomEvent.on(node, {
  click: {

  }
});
```

## DomEvent.detach(node, 'click', fn);

## DomEvent.detach(node, 'click.g1.g2', fn);

## DomEvent.detach(node, 'click', fn, context);

## DomEvent.detach(node, 'click', cfg);

``` javascript
DomEvent.detach(node, 'click', {
  fn: fn,
  context: context,
  filter: filter,
  deep: true
});
```

## DomEvent.detach(node, cfg)

``` javascript
DomEvent.detach(node, {
  click: {
    fn: fn
  }
});
```