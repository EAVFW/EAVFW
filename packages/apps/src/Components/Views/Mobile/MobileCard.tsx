import { Body1, Button, Caption1, Card, CardFooter, CardHeader } from '@fluentui/react-components';
import { DocumentDataRegular } from "@fluentui/react-icons";

export const MobileCard: React.FC<{ handleItemClicked: (item: any) => void, item: any, index: number, className: string }> = ({ item, index, handleItemClicked, className }) => {

    return (
        <Card style={{ marginBottom: '10px' }}>
            <CardHeader
                image={<DocumentDataRegular />}
                header={
                    <Body1>
                        <b>{item.title}</b> - {item.charterparty.cpname}
                    </Body1>
                }
                description={
                    <Caption1>{item.vessel.vesselname} - {item.voyage.voyagename}</Caption1>
                }
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {ledIndicator(getStatusColor(item.status))}
                    <Caption1 style={{ marginLeft: '10px' }}>Status: {resolveStatus(item.status)}</Caption1>
                </div>
                <Caption1>Broker: <span style={{ fontStyle: 'italic' }}>Not Available</span></Caption1>
            </div>

            <CardFooter style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px' }}>
                <Button onClick={() => handleItemClicked(item)}>View Details</Button>
            </CardFooter>
        </Card>
    )
}

// Status text based on status code
const resolveStatus = (status: number) => {
    switch (status) {
        case 0:
            return 'Pending';
        case 1:
            return 'Approved';
        case 2:
            return 'In Progress';
        // Define other cases as needed
        default:
            return 'Unknown';
    }
};

// Function to resolve the color based on the status
const getStatusColor = (status: number) => {
    switch (status) {
        case 0: return '#FF0000'; // Pending - Red
        case 1: return '#00FF00'; // Approved - Green
        case 2: return '#FFA500'; // In Progress - Orange
        // Define other cases as needed
        default: return '#808080'; // Unknown or not set - Grey
    }
};

// LED light indicator SVG
const ledIndicator = (color: string) => (
    <svg height="24" width="24">
        <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
);