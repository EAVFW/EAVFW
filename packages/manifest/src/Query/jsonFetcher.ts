export const jsonFetcher = async (
    input: RequestInfo,
    init: RequestInit,
    ...args: any[]
) => {
    const res = await fetch(input, { ...init, credentials: "include" });
    return res.json();
};