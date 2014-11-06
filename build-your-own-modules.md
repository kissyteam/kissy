# build your own modules

KISSY 5 is a collection of independent modulex modules now, if you do not like all of its modules in KISSY 5,
you can build your own modules, as a bonus, you can control each module's version.


## create bower.json

Create bower.json and fill its ``dependencies`` field with the specified versioned modules you what.

For example: I only want to use loader and anim module

```javascript
{
  "name":"my-kissy",
  "dependencies": {
    "modulex":"1.6.2",
    "modulex-anim":"1.0.2"
  }
}
```

## create package.json

Require ``aggregate-bower`` modules

For example:

```javascript
{
  "name":"my-kissy",
  "dependencies": {
    "aggregate-bower": "^1.0.9"
  }
}
```

## create build.js

Copy https://github.com/kissyteam/kissy/blob/master/build.js to your folder

## build

Run the following command:

```
npm install
bower install
node build
```

The files in ``build/`` folder is what you want, you can load ``build/seed.js`` and use your own custom kissy version.