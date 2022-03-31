export const jsonFetcher = async (
    input: RequestInfo,
    init: RequestInit,
    ...args: any[]
) => {
    const res = await fetch(input, { ...init, credentials: "include" });

    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.') as any;
        // Attach extra info to the error object.
        try {
            error.info = await res.json()
        } catch (err) {

        }
        error.status = res.status
        throw error
    }

    return res.json();
};