import { createContext } from "react";
import { NotAuthorizedProfile, UserProfile } from "./UserProfile";

export const UserContext = createContext<UserProfile | NotAuthorizedProfile>({ isAuthenticated:false });