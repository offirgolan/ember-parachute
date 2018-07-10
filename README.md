# Ember Parachute

[![Build Status](https://travis-ci.org/offirgolan/ember-parachute.svg?branch=master)](https://travis-ci.org/offirgolan/ember-parachute)
[![npm version](https://badge.fury.io/js/ember-parachute.svg)](http://badge.fury.io/js/ember-parachute)

## <img src="https://i.imgur.com/HaN5cCc.png" alt="ember-parachute" width="30"> Philosophy

`ember-parachute` is an addon that improves upon the experience of working with
query params in Ember. Instead of defining query params in both your route and controller, with this addon you can define them in one place as a query param map/object.

This map is the source of truth for your query params, and will generate a mixin that you can then add into your controller. The mixin adds very helpful properties and methods that makes working with query params a breeze!

One important point about this addon is that it is opinionated about _where_ the data is fetched. In a traditional query params setup, your route is responsible for fetching data in its `model` hook. With this addon, the responsibility moves into the controller. The benefit of this approach is that data fetching no longer blocks your UI from loading, and paves the way for advanced UX such as ["skeleton loading"][skeleton-loading].

<div style="text-align:center">
  <img src="http://i.imgur.com/COd11eL.png" />
</div>

## Installation

```
ember install ember-parachute
```

## Helpful Links

- ### [Live Demo][demo]
- ### [Changelog][changelog]

## Looking for help?
If it is a bug [please open an issue on GitHub](http://github.com/offirgolan/ember-parachute/issues).

## Usage

The source of truth for your application's query params are query param maps. First, define one in your controller:

```js
// controllers/my-route.js
import Ember from 'ember';
import QueryParams from 'ember-parachute';

export const myQueryParams = new QueryParams({
  parachuteOpen: {
    as: 'parachute',
    defaultValue: true
  },
  page: {
    defaultValue: 1,
    refresh: true,
    replace: true
  },
  search: {
    defaultValue: '',
    refresh: true
  },
  tags: {
    defaultValue: ['Ember', 'Parachute'],
    serialize(value) {
      return value.toString();
    },
    deserialize(value = '') {
      return value.split(',');
    }
  }
});

export default Ember.Controller.extend(myQueryParams.Mixin, {
  queryParamsChanged: Ember.computed.or('queryParamsState.{page,search,tags}.changed'),

  setup({ queryParams }) {
    this.fetchData(queryParams);
  },

  queryParamsDidChange({ shouldRefresh, queryParams }) {
    // if any query param with `refresh: true` is changed, `shouldRefresh` is `true`
    if (shouldRefresh) {
      this.fetchData(queryParams);
    }
  },

  reset({ queryParams }, isExiting) {
    if (isExiting) {
      this.resetQueryParams();
    }
  },

  fetchData(queryParams) {
    // fetch data
  },

  actions: {
    resetAll() {
      // reset all query params to their default values specified in the query param map
      this.resetQueryParams();
    }
  }
});
```

In the above example, the mixin adds the `setup`, `reset`, and `queryParamsDidChange` hooks. You can use these hooks to perform tasks like fetching data based on the query params or resetting them when leaving the route. Additionally, you can create a computed property observing `queryParamsState` that will allow you to display a button in your UI that can clear all query params via `resetQueryParams`.

Please continue reading for more advanced usage.

## Query Param Map

The query param map is the source of truth for your query params. Here, you'll be able to define configuration for each query param:

```js
import QueryParams from 'ember-parachute';

const myQueryParams = new QueryParams({
  direction: {
    as: 'dir',
    defaultValue: 'asc',
    refresh: true
  },
  page: {
    defaultValue: 1,
    refresh: true,
    replace: true
  },
  search: {
    defaultValue: '',
    refresh: true
  }
});
```

Each query param is defined as follows (using TypeScript notation for documenting types):

```ts
interface QueryParamOption {
  as?: string;
  defaultValue: any; // required
  refresh?: boolean;
  replace?: boolean;
  scope?: 'controller';
  serialize?(value: any): any;
  deserialize?(value: any): any;
}
```

For example:

```js
direction: {
  as: 'dir',
  defaultValue: 'asc',
  refresh: true,
  scope: 'controller',
  serialize(value) {
    return value;
  },
  deserialize(value) {
    return value;
  }
}
```

### `as`

The `as` option lets you optionally override the query param URL key for a query param. By default this will be the same as the key in the query param map.

### `defaultValue`

**Required.** The `defaultValue` option specifies the default value for the query param. When a query param is set to its default value, it will not appear in the URL.

### `refresh`

When `refresh` is `true`, the `queryParamsDidChange` hook provided by the mixin will notify you when a refreshable query param has changed. You can use that value to determine whether or not you need to refetch data.

### `replace`

By default, Ember will use **pushState** to update the URL in the address bar in response to a controller query param property change, but when `replace` is `true` it will use **replaceState** instead (which prevents an additional item from being added to your browser's history).

### `scope`

`scope` can only be one value if specified: `controller`. This is equivalent to the `scope` option in regular Ember query params. You can read more about it in the bottom paragraph [here][ember-qp-docs].

### `serialize`

An optional function that lets you serialize or format a value before it is updated in the URL. For example, if your query param represents an array of values, you could do the following to avoid having the `[` and `]` being included into the URL:

```js
tags: {
  defaultValue: ['Ember', 'Parachute'],
  serialize(value) {
    return value.toString();
  },
  deserialize(value = '') {
    return value.split(',');
  }
}
```

The above will show `?tags=Ember,Parachute` (before encoding) in the URL. When you get the value though, it is still an array:

```js
controller.get('tags'); // ['Ember', 'Parachute']
```

### `deserialize`

If you provide a `serialize` function, you will need to include a `deserialize` as well. This function will be used to transform the value in the URL back into the value your controller receives.

For example:

```js
showReadme: {
  as: 'readme',
  defaultValue: true,
  serialize(value) {
    return value ? 'yes' : 'no';
  },
  deserialize(value) {
    return value === 'yes' ? true : false;
  }
}
```

Your controller value for `showReadme` will still be `true` or `false`, even though it is displayed in your URL as `?showReadme=yes`.

### Extending

The Query Param Map not only accepts multiple arguments, but it can also be extended.

```js
import QueryParams from 'ember-parachute';

const SortParams = {
  sortName: {
    defaultValue: 'name',
    refresh: true
  },
  sortDirection: {
    defaultValue: 'asc',
    refresh: true
  }
};

const SearchParams = {
  query: {
    defaultValue: '',
    refresh: true
  }
}

const myQueryParams = new QueryParams(SortParams, SearchParams /*, ... */);

const myExtendedQueryParams = myQueryParams.extend({
  sidebarOpen: {
    defaultValue: true
  }
} /*, ... */);
```

With the above code, the `myExtendedQueryParams` map will generate Query Params for `sortName`, `sortDirection`, `query`, and `sidebarOpen`.

## Controller Mixin

After creating a query params map, you can generate a controller mixin with the `Mixin` property on the query params map:

```js
const myQueryParams = new QueryParams({ /* ... */ });

export default Ember.Controller.extend(myQueryParams.Mixin, {
  // ...
});
```

The mixin adds the following to your controller:

### Computed Property - `allQueryParams`

You can use this CP to get all query param values:

```js
controller.get('allQueryParams'); // { page: 2, direction: 'desc' };
```

This CP is useful in scenarios where you need to pass all query params as an option. For example, you could pass these into a `link-to`.

### Computed Property - `queryParamsState`

This CP returns an object with information about the state of your query params.

```js
controller.get('queryParamsState.page'); // { value: 2, defaultValue: 1, changed: true }
```

This CP is useful when creating another CP to determine if any query params have changed from their default values:

```js
queryParamsChanged: Ember.computed.or('queryParamsState.{page,search,tags}.changed')
```

You can then use this CP to conditionally display a button that can clear all query params to their default values.

### Hooks

All hooks will receives a `ParachuteEvent` as an argument which can be defined as:

```ts
// what changed
interface QueryParamsChanged {
  [queryParamKey: string]: string;
}

// all changes
interface QueryParamsChanges {
  [queryParamKey: string]: string;
}

// all query param values
interface QueryParams {
  [queryParamKey: string]: any;
}

interface ParachuteEvent {
  changes: QueryParamsChanges;
  changed: QueryParamsChanged;
  queryParams: QueryParams;
  routeName: string;
  shouldRefresh: boolean;
}
```

### Hook - `queryParamsDidChange`

```ts
function queryParamsDidChange(queryParamsChangedEvent: ParachuteEvent): void;
```

```js
export default Controller.extend(myQueryParams.Mixin, {
  queryParamsDidChange({ routeName, shouldRefresh, queryParams, changed, changes }) {
    if (shouldRefresh) {
      // refetch data
    }

    if (changed.myQueryParamKey) {
      // do something special
    }
  }
});
```

### Hook - `setup`

```ts
function setup(queryParamsChangedEvent: ParachuteEvent): void;
```

```js
export default Controller.extend(myQueryParams.Mixin, {
  setup({ routeName, shouldRefresh, queryParams, changed, changes }) {
    // Fetch some initial data & setup the controller
  }
});
```

> Note: If you've overridden your route's `setupController`, you must use `this._super(...arguments);` in `setupController` for the `setup` hook to fire.

### Hook - `reset`

```ts
function reset(queryParamsChangedEvent: ParachuteEvent, isExiting: boolean): void;
```

```js
export default Controller.extend(myQueryParams.Mixin, {
  reset({ routeName, shouldRefresh, queryParams, changed, changes }, isExiting) {
    if (isExiting) {
      this.resetQueryParams();
    }
  }
});
```

> Note: If you've overridden your route's `resetController`, you must use `this._super(...arguments);` in `resetController` for the `reset` hook to fire.

### Events

The controller also emits an event for each hook which receives the same arguments:

```ts
export default Ember.Controller.extend({
  onChange: Ember.on('queryParamsDidChange', function(queryParamsChangedEvent: ParachuteEvent) {
    // ...
  }),

  onSetup: Ember.on('setup', function(queryParamsChangedEvent: ParachuteEvent) {
    // ...
  }),

  onReset: Ember.on('reset', function(queryParamsChangedEvent: ParachuteEvent, isExiting: boolean) {
    // ...
  })
});
```

For example, you can use this in conjunction with [`ember-metrics`][ember-metrics] to track when query params were changed:

```js
this.get('metrics').trackEvent(Object.assign({
  event: 'Query Params Changed',
  routeName: routeName,
}, queryParams));
```

### Function - `resetQueryParams`

```ts
function resetQueryParams(params?: string[]): void;
```

Reset all or given params to their default value. The second argument is an array of query params to reset. If empty, all query params will be reset. You can use this in an action to reset query params when they have changed:

```js
export default Ember.Controller.extend(myQueryParams.Mixin, {
  queryParamsChanged: Ember.computed.or('queryParamsState.{page,search,tags}.changed'),

  actions: {
    resetAll() {
      this.resetQueryParams();
    }
  }
});
```

```hbs
{{#button onClick=(action "resetAll") disabled=(not queryParamsChanged)}}
  Reset All
{{/button}}
```

### Function - `setDefaultQueryParamValue`

```ts
function setDefaultQueryParamValue(key: string, defaultValue: any): void;
```

Set the default value for a given param. An example where this is useful is where you need to fetch default values from elsewhere (e.g. your API).

```js
controller.setDefaultQueryParamValue('search', 'foo');
controller.setDefaultQueryParamValue('direction', 'asc');
```

__NOTE__: Changing the defaultValue at any point will not clear the query parameter from being shown in the URI. We do not have control over that as it is private API.

[changelog]: CHANGELOG.md
[demo]: https://offirgolan.github.io/ember-parachute
[ember-metrics]: https://github.com/poteto/ember-metrics
[ember-qp-docs]: https://guides.emberjs.com/v2.14.0/routing/query-params/
[skeleton-loading]: https://emberway.io/skeleton-screen-loading-in-ember-js-2f7ac2384d63
