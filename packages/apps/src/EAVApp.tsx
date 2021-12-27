import { AppContext } from "./AppContext";
import { ModelDrivenApp } from "./ModelDrivenApp";

export const EAVApp: React.FC<{ model: ModelDrivenApp }> = ({ children, model }) => <AppContext.Provider value={model}>{children}</AppContext.Provider>