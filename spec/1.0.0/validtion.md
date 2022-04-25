---
title: Validtion specification
keywords: error, warning, info, validtion
---

# Validtion

Used to apply extra validtion to entity attributes besides restrictions defined as [json-schema](https://json-schema.org/understanding-json-schema/reference/), using [expressions](https://github.com/delegateas/expressionengine). 

```json
// validtion
"<unique-name>": {
    "isValid": "<expression : true|false>",
    "message": "<string>", // optional
    "messageCode": "<string>", // optional
    "messageArgs": [], // optional
    "target": "<entity-attribute>",
    "type": "<info|warning|error>"
```

Read _isValid_ as: 
* If expression is valid then disregard message, otherwise show message.
* If expression is invalid then show message.

## Behavoir

### `info`
Must show additional info to targeted field.

### `warning`
Must show warning to targeted field.

### `error`
Must show error to targeted field and block submitting the form.

## Example

* Warning must be shown when value of `Field1` is less than `10` with the message _Field1 must be greater than 10_.
* Error must be shown when value of `Field1` is greater than `100` with the message _Much be less than 100_

```json

{
    "errorMessages": {
        "1033": {
            "err-minimum": "Much be larger than {0}"
        }
    },
    "entities": {
        "Entity1": {
            "description": "Entity description",
            "attributes": {
                "Fiedl1": {
                    "type": "deciaml"
                }
            },
            "validation": {
                "warn-above_threshold": {
                    "isValid": "@greater(formvalue('field1'), 10)",
                    "message": "Field1 must be greater than {0}",
                    "messageArgs": [ 10 ],
                    "target": "field1",
                    "type": "warning"
                },
                "err-some_error": {
                    "isValid": "@less(formvalue('field1'), 100)",
                    "messageCode": "err-maximum",
                    "messageArgs": [ 100 ],
                    "target": "field1",
                    "type": "error"
                }
            }
        },
    }
}
```