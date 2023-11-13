import { Body1, Button, Caption1, Card, CardFooter, CardHeader } from '@fluentui/react-components';
import { DocumentDataRegular } from "@fluentui/react-icons";

export const MobileCard: React.FC<{ handleItemClicked: (item: any) => void, item: any, className: string }> = ({ item, handleItemClicked, className }) => {

    // First 4 properties are for the header.

    // All remaining properties are for the body.

    // Button elements are for actions (How many should we allow?)

    return (
        <Card style={{ marginBottom: '10px' }} className={className}>
            <CardHeader
                image={<DocumentDataRegular />}
                header={
                    <Body1>
                        <b>{capitalizeFirstLetter(item?.vessel?.vesselname ?? 'N/A')}</b> - {item?.charterParty?.cpname ?? 'N/A'}
                    </Body1>
                }
                description={
                    <Caption1> {item?.voyage?.voyagename ?? 'N/A'}</Caption1>
                }
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {ledIndicator(getStatusColor(item.status))}
                    <Caption1 style={{ marginLeft: '10px' }}>Status: {resolveStatus(item?.status)}</Caption1>
                </div>
                <Caption1>Broker: <span style={{ fontStyle: 'italic' }}>Not Available</span></Caption1>
                <Caption1>LOI Template: {item?.title ?? 'N/A'}</Caption1>
            </div>

            <CardFooter style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px' }}>
                <Button onClick={() => window.alert("Captain has been notified.")}>Send to captain</Button>
                <Button onClick={() => handleItemClicked(item)}>View Details</Button>
            </CardFooter>
        </Card>
    )
}

type PropertyComponentProps = {
    propertyName: string;
    value: any;
};

const StringComponent: React.FC<PropertyComponentProps> = ({ propertyName, value }) => (
    <Caption1>{propertyName}: {value}</Caption1>
);

const NumberComponent: React.FC<PropertyComponentProps> = ({ propertyName, value }) => (
    <input type="number" name={propertyName} defaultValue={value} />
);

const BooleanComponent: React.FC<PropertyComponentProps> = ({ propertyName, value }) => (
    <input type="checkbox" name={propertyName} defaultChecked={value} />
);

const renderComponent = (propertyName: string, value: any) => {
    const type = typeof value;
    switch (type) {
        case 'string':
            return <StringComponent propertyName={propertyName} value={value} />;
        case 'number':
            return <NumberComponent propertyName={propertyName} value={value} />;
        case 'boolean':
            return <BooleanComponent propertyName={propertyName} value={value} />;
        default:
            return <div>Unsupported type: {type}</div>;
    }
};

const capitalizeFirstLetter = (string: string): string => string.charAt(0).toUpperCase() + string.slice(1);

const resolveStatus = (status: number) => {
    switch (status) {
        case 0:
            return 'New';
        case 10:
            return 'Sent';
        case 20:
            return 'Opened';
        case 30:
            return 'Filled';
        case 40:
            return 'Approved';
        case 50:
            return 'Signed';
        case 60:
            return 'Sent to captain';
        case 400:
            return 'Archived';
        default:
            return 'N/A';
    }
};

const getStatusColor = (status: number) => {
    switch (status) {
        case 0:
            return '#F00';
        case 10:
            return '#F00';
        case 20:
            return '#F00';
        case 30:
            return '#FEFF00';
        case 40:
            return '#FEFF00';
        case 50:
            return '#FEFF00';
        case 60:
            return '#0F0';
        case 400:
            return '#808080';
        default: return '#808080'; // Unknown or not set - Grey
    }
};

const ledIndicator = (color: string) => (
    <svg height="24" width="24">
        <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
);