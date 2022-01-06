import React from "react"
import { FormRender } from "./FormRender"
import { FormRenderProps } from "./FormRenderProps"


export const LazyFormRender = (props: FormRenderProps) => {
    return <FormRender {...props} />
}
