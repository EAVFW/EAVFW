import { useModelDrivenApp } from "../../useModelDrivenApp";
import { NotAuthorizedProfile, UserProfile } from "./UserProfile";
import useSWR from "swr";
import { getRecordSWR, jsonFetcher } from "@eavfw/manifest";
import { UserContext } from "./UserContext";

const DefaultLoader = () => <div>loading...</div>;
const notAuthorizedUser: NotAuthorizedProfile = { isAuthenticated: false };
function getProfile(entityKey?: string) {

    const app = useModelDrivenApp();

    const { data, error } =  useSWR<UserProfile>(`${process.env.NEXT_PUBLIC_BASE_URL}.auth/me`,
        {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false,
            refreshWhenOffline: false,
            refreshWhenHidden: false,
            refreshInterval: 0,
            fetcher: jsonFetcher
        }
    )



    console.log(data, error);
    if (data?.role && !Array.isArray(data.role)) {
        data.role = [data.role];
    }

    const { record: userInfo } = getRecordSWR(entityKey ? app.getEntityFromKey(entityKey).collectionSchemaName : "", data?.sub!, "", entityKey && data ? true : false)


    return {
        record: data ? data : notAuthorizedUser ,
        isLoading: !error && !data && (entityKey && !userInfo),
        isError: error
    }
}

export const UserProvider: React.FC<{ authorize?: boolean, onRenderLoading?: React.FC, loadUserInfoEntityKey?: string }> = ({ loadUserInfoEntityKey, children, authorize, onRenderLoading: Loader = DefaultLoader }) => {

    const { record, isLoading, isError } = getProfile(loadUserInfoEntityKey);

    console.log("UserProvider PreAuthorize", [authorize, record]);

    if (authorize) {
        if (!record || record.isAuthenticated === false)
            return <Loader />

    }

    console.log("UserProvider PostAuthorize", [authorize, record]);

    return <UserContext.Provider value={record}> {children} </UserContext.Provider>
}