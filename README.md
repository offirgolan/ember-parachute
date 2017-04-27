# Ember Parachute

[![Build Status](https://travis-ci.org/offirgolan/ember-parachute.svg)](https://travis-ci.org/offirgolan/ember-parachute)
[![npm version](https://badge.fury.io/js/ember-parachute.svg)](http://badge.fury.io/js/ember-parachute)

## <img src="https://i.imgur.com/HaN5cCc.png" alt="ember-parachute" width="30"> Philosophy

`ember-parachute` is an addon that improves upon the experience of working with
query params in Ember. Instead of defining query params in both your route and controller, with this addon you can define them in one place as a query param map/object.

This map is the source of truth for your query params, and will generate a mixin that you can then add into your controller. The mixin adds very helpful properties and methods that makes working with query params a breeze!

One important point about this addon is that it is opinionated about _where_ the data is fetched. In a traditional query params setup, your route is responsible for fetching data in its `model` hook. With this addon, the responsibility moves into the controller. The benefit of this approach is that data fetching no longer blocks your UI from loading, and paves the way for advanced UX such as ["skeleton UI"][skeleton-ui].

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
    defaultValue: true,
  },
  page: {
    defaultValue: 1,
    refresh: true
  },
  search: {
    defaultValue: '',
    refresh: true
  },
  tags: {
    defaultValue: ['Ember', 'Parachute']
  }
});

export default Ember.Controller.extend(myQueryParams.Mixin, {
  queryParamsChanged: Ember.computed.or('queryParamsState.{page,search,tags}.changed'),

  queryParamsDidChange({ shouldRefresh, queryParams }) {
    // if any query param with `refresh: true` is changed, `shouldRefresh` is `true`
    if (shouldRefresh) {
      this.fetchData(queryParams);
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

In the above example, the mixin adds a `queryParamsDidChange` hook. You can use this hook to perform tasks like fetching data based on the query params. Additionally, you can create a computed property observing `queryParamsState` that will allow you to display a button in your UI that can clear all query params via `resetQueryParams`.

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
    refresh: true
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
  defaultValue?: any;
  refresh?: boolean;
  scope?: 'controller';
}
```

For example:

```js
direction: {
  as: 'dir',
  defaultValue: 'asc',
  refresh: true,
  scope: 'controller'
}
```

### `as`

The `as` option lets you optionally override the query param URL key for a query param. By default this will be the same as the key in the query param map.

### `defaultValue`

The `defaultValue` option specifies the default value for the query param. When a query param is set to its default value, it will not appear in the URL.

### `refresh`

When `refresh` is `true`, the `queryParamsDidChange` hook provided by the mixin will notify you when a refreshable query param has changed. You can use that value to determine whether or not you need to refetch data.

### `scope`

`scope` can only be one value if specified: `controller`. This is equivalent to the `scope` option in regular Ember query params. You can read more about it in the bottom paragraph [here][ember-qp-docs].

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

### Function - `queryParamsDidChange`

The mixin also adds a hook that you can use to update your controller when any query params change. The hook receives a single argument:

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

interface QueryParamsChangedEvent {
  changes: QueryParamsChanges;
  changed: QueryParamsChanged;
  queryParams: QueryParams;
  routeName: string;
  shouldRefresh: boolean;
}

function queryParamsDidChange(queryParamsChangedEvent: QueryParamsChangedEvent): void;
```

You can destructure and use only what you need:

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

### Event - `queryParamsDidChange`

The controller also emits an event when query params change. This receives the same `QueryParamsChangedEvent` object as the `queryParamsDidChange` hook:

```ts
export default Ember.Controller.extend({
  onQueryParamsChanged: Ember.on('queryParamsDidChange', function(queryParamsChangedEvent: QueryParamsChangedEvent) {
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
function resetQueryParams(params?: Array<string>): void;
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

[changelog]: CHANGELOG.md
[demo]: https://offirgolan.github.io/ember-parachute
[ember-metrics]: https://github.com/poteto/ember-metrics
[ember-qp-docs]: https://guides.emberjs.com/v2.5.0/routing/query-params/
[skeleton-ui]: https://medium.com/ux-for-india/facilitating-better-interactions-using-skeleton-screens-a034a51120a5
