


type ArrayElement<ArrayType> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : any;

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
export class ODataBuilder<T>{
    private _odata = {} as {
        '$select'?: { [key: string]: any },
        '$orderby'?: { [key: string]: "desc" | "asc" },
        '$expand'?: { [key: string]: ODataBuilder<any> }
        '$filter'?: string
        '$top'?: number
        '$count'?: true
    };

    public filter(...filter: Array<string | undefined>) {
        this._odata['$filter'] = filter.filter(x => x).join(' and ');
        return this;
    }

    public take(top: number) {
        this._odata['$top'] = top;
        return this;
    }
    public count() {
        this._odata['$count'] = true;
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


        const parts = [];
        for (let k of Object.keys(this._odata) as Array<keyof typeof this._odata>) {

            const v = this._odata[k];

            switch (k) {
                case "$filter":
                case "$count":
                case "$top":
                    parts.push(`${k}=${v}`);
                    break;
                case "$orderby":

                    parts.push(`${k}=${Object.entries(v as (Required<typeof this._odata>)[typeof k]).map(([prop, propvalue]) => `${prop} ${propvalue}`).join(',')}`);

                    break;
                case "$expand":

                    parts.push(`${k}=${Object.entries(v as (Required<typeof this._odata>)[typeof k]).map(([prop, propvalue]) => `${prop}(${propvalue.build(';')})`).join(',')}`);
                    break;
                case "$select":
                    parts.push(`${k}=${Object.entries(v as (Required<typeof this._odata>)[typeof k]).map(([prop, propvalue]) => `${prop}`).join(',')}`);
                    break;

            }


        }
        return parts.join(seperator);

        //return Object.entries(this._odata).map(([k, v]) =>
        //    `${k}=${typeof (v) === "string" ? v
        //        : Object.entries(v).map(([prop, propvalue]) => propvalue instanceof ODataBuilder ? `${prop}(${propvalue.build(';')})` : k === "$orderby" ? `${prop} ${propvalue}` : prop).join(',')}`).join(seperator);
    }
}
