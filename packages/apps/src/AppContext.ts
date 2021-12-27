import { createContext } from "react";
import { ModelDrivenApp } from "./ModelDrivenApp";

export const AppContext = createContext<ModelDrivenApp>(new ModelDrivenApp());