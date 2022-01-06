import { FormColumnDefinition } from "@eavfw/manifest";

 

export function filterRoles(roles: FormColumnDefinition["roles"], user: any) {
    let noRoleInfoDefined = true;
    console.log("filterrole", [roles, user]);
    if (roles) {
        noRoleInfoDefined = false;

        if (!user)
            return false;

        if (roles?.allowed?.filter(role => user.role.filter((r: string) => role === r).length > 0)?.length ?? 0 > 0) {
            return true;
        }
    }

    return noRoleInfoDefined;
}