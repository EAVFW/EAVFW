
import { useModelDrivenApp } from "@eavfw/apps";
import { NextComponentType, NextPageContext } from "next";
import { createContext, useContext } from "react";
import useSWR from "swr";
import { UserContext } from "./UserContext";
import { UserProfile } from "./UserProfile";










export const useUserProfile = <T extends UserProfile>() => {

    const profile = useContext(UserContext);

    if (profile.isAuthenticated===false)
        return undefined;

    return profile as T;
}


