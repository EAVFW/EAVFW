import { useContext } from "react";
import { AppInfoContext } from "./AppInfoContext";
import { AppNavigationContext } from "./AppNavigationContext";

export const useAppInfo = () => ({ ...useContext(AppInfoContext)!, ...useContext(AppNavigationContext)! });
