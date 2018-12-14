declare module 'ember-parachute' {
    interface QueryParamOption<T> {
        as?: string;
        defaultValue: T;
        refresh?: boolean;
        replace?: boolean;
        scope?: 'controller';
        serialize?(value: T): string;
        deserialize?(value: string): T;
    }

    type QueryParamOptions < T > = {
        [K in keyof T]: QueryParamOption<T[K]>;
    };

    type QueryParamsState < T > = {
        [K in keyof T]: {
            value: T[K];
            default: T[K];
            changed: boolean;
        }
    };

    export interface ParachuteEvent<T> {
        changes: T;
        changed: T;
        queryParams: T;
        routeName: string;
        shouldRefresh: boolean;
    }

    export class QueryParamMixin<T> {
        queryParamsState: QueryParamsState<T>;
        setup(queryParamsChangedEvent: ParachuteEvent<T>): void;
        queryParamsDidChange(queryParamsChangedEvent: ParachuteEvent<T>): void;
        reset(queryParamsChangedEvent: ParachuteEvent<T>, isExiting: boolean): void;
        resetQueryParams(params?: string[]): void;
    }

    export default class QueryParams<T> {
        constructor(...params: Array<QueryParamOptions<T>>);
        Mixin: QueryParamMixin<T> & T;
    }
}
