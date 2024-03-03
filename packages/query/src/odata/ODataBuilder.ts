


type ArrayElement<ArrayType> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : any;

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
export class ODataBuilder<T>{
    private _odata = {} as {
        '$select'?: { [key: string]: any },
        '$orderby'?: { [key: string]: "desc" | "asc" },
        '$expand'?: { [key: string]: ODataBuilder<any> }
        '$filter'?: string
    };

    public filter(filter: string) {
        this._odata['$filter'] = filter;
        return this;
    }


    public select(...fields: Array<keyof T>) {

        if (!('$select' in this._odata)) {
            this._odata["$select"] = {};
        }

        for (let field of fields) {
            this._odata["$select"]![field as string] = {};
        }
        return this;
    }
    public orderby(prop: keyof T, order: "desc" | "asc") {
        if (!('$orderby' in this._odata)) {
            this._odata["$orderby"] = {};
        }
        this._odata["$orderby"]![prop as string] = order;

        return this;
    }
    public expand<T1 extends keyof T, T2 extends T[T1]>(prop: T1, expander: (a: ODataBuilder<T2>) => ODataBuilder<T2>) {
        if (!('$expand' in this._odata)) {
            this._odata["$expand"] = {};
        }

        this._odata["$expand"]![prop as string] = expander(new ODataBuilder<T2>());

        return this;
    }
    public expandCollection<T1 extends KeysMatching<T, Array<any>>, T2 extends ArrayElement<T[T1]>>(prop: T1, expander: (a: ODataBuilder<T2>) => ODataBuilder<T2>) {
        if (!('$expand' in this._odata)) {
            this._odata["$expand"] = {};
        }

        this._odata["$expand"]![prop as string] = expander(new ODataBuilder<ArrayElement<T2>>());

        return this;
    }

    public build(seperator: '&' | ';' = '&'): string {

        return Object.entries(this._odata).map(([k, v]) =>
            `${k}=${typeof (v) === "string" ? v : Object.entries(v).map(([prop, propvalue]) => propvalue instanceof ODataBuilder ? `${prop}(${propvalue.build(';')})` : k === "$orderby" ? `${prop} ${propvalue}` : prop).join(',')}`).join(seperator);
    }
}
