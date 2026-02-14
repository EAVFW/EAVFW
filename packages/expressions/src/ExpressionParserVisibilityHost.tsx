import { PropsWithChildren, useEffect, useMemo } from "react";
import { useExpressionParserLoadingContext } from "./ExpressionParserAttributeContext";
import { ExpressionOrder, useExpressionParser } from "./useExpressionParser";
import { useUuid } from "@eavfw/hooks";

export const ExpressionParserVisibilityHost: React.FC<PropsWithChildren<{
    onVisibilityCalculated?: (visiblity: boolean) => void,
    visible?: string | boolean, attributeKey?: string
}>> = ({ children, visible, attributeKey, onVisibilityCalculated }) => {

    const { data, isLoading, error } = useExpressionParser<boolean>(typeof visible === "string" ? visible : undefined, ExpressionOrder.last);
     
    const showShow = useMemo(() => {
        if (typeof visible === "boolean" && visible === false) {

            return false;
        }

        if (isLoading) {

            return undefined;
        }

        if (typeof data === "boolean" && data === false) {

            return false;
        }

        if (error) {

            return undefined;
        }

        if (typeof data === "undefined")
            return undefined;

        return true;
    }, [visible, data, isLoading, error]);

    useEffect(() => {
        if (onVisibilityCalculated && typeof showShow === "boolean")
            onVisibilityCalculated(showShow);

    }, [showShow])

    if (showShow)
        return <>{children}</>

    return null;
}