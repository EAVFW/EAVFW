import { useEffect, useMemo } from "react";
import { useExpressionParser } from "./useExpressionParser";


export const ExpressionParserVisibilityHost: React.FC<{
    onVisibilityCalculated?: (visiblity: boolean) => void,
    visible?: string | boolean, attributeKey?: string
}> = ({ children, visible, attributeKey, onVisibilityCalculated }) => {

    const { data, isLoading, error } = useExpressionParser<boolean>(typeof visible === "string" ? visible : undefined);



    const showShow = useMemo(() => {
        if (typeof visible === "boolean" && visible === false) {
            console.debug("ExpressionParserVisibilityHost " + attributeKey + ": Hiding as visibility is false")

            
            return false;
        }

        if (isLoading) {
            console.debug("ExpressionParserVisibilityHost " + attributeKey + ": Hiding as visibility is loading")
            
            return false;
        }

        if (typeof data === "boolean" && data === false) {
            console.debug("ExpressionParserVisibilityHost " + attributeKey + ": Hiding as visibility is calculated to false")
            
            return false;
        }


        if (error) {
            console.debug("ExpressionParserVisibilityHost " + attributeKey + ": Hiding as visibility had error on calculation", error)

            return false;
        }

        if (typeof data === "undefined")
            console.debug("ExpressionParserVisibilityHost " + attributeKey + ": Showing as visibility not provided", [visible, data]);
        else
            console.debug("ExpressionParserVisibilityHost " + attributeKey + ": Showing as visibility is calculated", [visible, data]);

       

        return true;
    }, [visible, data, isLoading, error]);

    useEffect(() => {
        if (onVisibilityCalculated)
            onVisibilityCalculated(showShow);
    }, [showShow])

    if (showShow)
        return <>{children}</>

    return null;
}