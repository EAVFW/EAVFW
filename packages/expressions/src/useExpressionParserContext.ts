import { useContext } from "react";
import { ExpressionParserContext } from "./ExpressionParserContext";

export const useExpressionParserContext = () => useContext(ExpressionParserContext);