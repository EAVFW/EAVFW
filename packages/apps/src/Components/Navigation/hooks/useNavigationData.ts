import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { ModelDrivenNavigationArea } from "../ModelDrivenNavigation";
import { useUserProfile } from "../../Profile/useUserProfile";
import { ModelDrivenSitemap } from '../../../Model/ModelDrivenSitemap';
import { ModelDrivenSitemapEntry } from '../../../Model/ModelDrivenSitemapEntry';

function filterEntry(user: any) {

    if (!user)
        return () => false;

    return ([key, entry]: [string, ModelDrivenSitemapEntry]) => {

        if (!entry.roles)
            return true;

        return entry.roles.allowed?.filter(r => user.role.filter((rr: string) => r === rr).length > 0)?.length ?? 0 > 0;
    };
}

export function useNavigationData(sitemap: ModelDrivenSitemap) {
    const router = useRouter();
    const user = useUserProfile();

    return useMemo(() => {
        try {
            const areas = Object.keys(sitemap.areas).filter(area => {
                if (!user) return true;

                let noRoleInfoDefined = true;
                for (let g of Object.keys(sitemap.areas[area])) {
                    let group = sitemap.areas[area][g];
                    for (let e of Object.keys(group)) {
                        let roles = group[e].roles;

                        if (roles) {
                            noRoleInfoDefined = false;
                            if (roles?.allowed?.filter(role => user.role.filter((r: string) => role === r).length > 0)?.length ?? 0 > 0) {
                                return true;
                            }
                        }
                    }
                }

                return noRoleInfoDefined;
            }).map(area => ({ key: area, text: area, id: area } as ModelDrivenNavigationArea));

            const result = {
                areas,
                selectedArea: router.query.area as string ?? areas[0]?.key,
                groups: Object.entries(sitemap.areas[router.query.area as string ?? areas[0]?.key])
                    .map(([groupKey, groupEntry]) => {
                        const entries = Object.entries(groupEntry).filter(filterEntry(user))
                            .sort(([akey, aentry], [bkey, bentry]) => aentry.order - bentry.order);

                        return [groupKey, entries] as [string, typeof entries]
                    }).filter(x => x[1].length > 0)
            }
            return result;
        } finally {
        }
    }, [user, router.query.area]);
}
