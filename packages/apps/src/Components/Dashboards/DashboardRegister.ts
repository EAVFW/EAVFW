
export const Dashboards: { [key: string]: any } = {};

export function RegisterDashboard(name: string, dashboard: any) {
    Dashboards[name] = dashboard;
}
