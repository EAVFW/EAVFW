import React from 'react';
import { SelectionMode, IColumn } from "@fluentui/react";
import { IRecord } from '@eavfw/manifest';
import { useSelectionContext } from '../../../Selection/useSelectionContext';

export type MobileListComponentProps = {
    onItemInvoked: (item: IRecord) => void
    onRenderItemColumn: (item?: any, index?: number, column?: IColumn) => React.ReactNode
    className?: string
    selectionMode: SelectionMode
    items: any[]
}

export const MobileListComponent: React.FC<MobileListComponentProps> = ({
    onItemInvoked,
    onRenderItemColumn,
    className,
    selectionMode,
    items = mockDemoData
}) => {
    const { selection } = useSelectionContext();

    const handleItemClick = (item: IRecord) => {
        // Only invoke the item if selection mode is none, 
        // otherwise, selection should handle the click
        if (selectionMode === SelectionMode.none) {
            onItemInvoked(item);
        }
    };

    console.log("Displaying <MobileListComponent />");

    return (
        <div className={className}>
            {items.map((item, index) => (
                <div key={item.key} onClick={() => handleItemClick(item)}>
                    {onRenderItemColumn(item, index,)}
                </div>
            ))}
        </div>
    );
};

export default MobileListComponent;

type DemoType = {
    title: string;
    createdById: string;
    createdOn: string;
    modifiedById: string;
    modifiedOn: string;
    ownerId: string;
    payloadId: string;
    rowVersion: number;
    templateId: string;
    loiDocumentId: string;
    status: string;
    signingRequestId: string;
    loiDocumentPdfId: string;
    quickformDefinition: string;
    chartererId: string;
    chartererPartyId: string;
    vesselId: string;
    voyageId: string;

}

const mockDemoData: DemoType[] = [
    {
        title: 'Letter of Indemnity for Voyage 12345',
        createdById: '102',
        createdOn: '2023-01-01T00:00:00Z',
        modifiedById: '204',
        modifiedOn: '2023-01-02T00:00:00Z',
        ownerId: '308',
        payloadId: 'xyz-123-payload',
        rowVersion: 1,
        templateId: 'temp-456',
        loiDocumentId: 'loi-789-document',
        status: 'Draft',
        signingRequestId: 'sign-req-1122',
        loiDocumentPdfId: 'pdf-333-document',
        quickformDefinition: 'QFD-001',
        chartererId: 'charterer-404',
        chartererPartyId: 'party-505',
        vesselId: 'vessel-606',
        voyageId: 'voyage-707',
    },
    // New mock data entries
    {
        title: 'Indemnity Letter for Voyage 23456',
        createdById: '103',
        createdOn: '2023-02-01T00:00:00Z',
        modifiedById: '205',
        modifiedOn: '2023-02-02T00:00:00Z',
        ownerId: '309',
        payloadId: 'abc-234-payload',
        rowVersion: 2,
        templateId: 'temp-457',
        loiDocumentId: 'loi-790-document',
        status: 'Completed',
        signingRequestId: 'sign-req-1133',
        loiDocumentPdfId: 'pdf-334-document',
        quickformDefinition: 'QFD-002',
        chartererId: 'charterer-405',
        chartererPartyId: 'party-506',
        vesselId: 'vessel-607',
        voyageId: 'voyage-808',
    },
    {
        title: 'Voyage 34567 LOI',
        createdById: '104',
        createdOn: '2023-03-01T00:00:00Z',
        modifiedById: '206',
        modifiedOn: '2023-03-02T00:00:00Z',
        ownerId: '310',
        payloadId: 'def-345-payload',
        rowVersion: 3,
        templateId: 'temp-458',
        loiDocumentId: 'loi-791-document',
        status: 'Under Review',
        signingRequestId: 'sign-req-1144',
        loiDocumentPdfId: 'pdf-335-document',
        quickformDefinition: 'QFD-003',
        chartererId: 'charterer-406',
        chartererPartyId: 'party-507',
        vesselId: 'vessel-608',
        voyageId: 'voyage-909',
    },
    {
        title: 'Guarantee Document for Voyage 45678',
        createdById: '105',
        createdOn: '2023-04-01T00:00:00Z',
        modifiedById: '207',
        modifiedOn: '2023-04-02T00:00:00Z',
        ownerId: '311',
        payloadId: 'ghi-456-payload',
        rowVersion: 4,
        templateId: 'temp-459',
        loiDocumentId: 'loi-792-document',
        status: 'Pending',
        signingRequestId: 'sign-req-1155',
        loiDocumentPdfId: 'pdf-336-document',
        quickformDefinition: 'QFD-004',
        chartererId: 'charterer-407',
        chartererPartyId: 'party-508',
        vesselId: 'vessel-609',
        voyageId: 'voyage-1010',
    },
    {
        title: 'Indemnity for Voyage 56789',
        createdById: '106',
        createdOn: '2023-05-01T00:00:00Z',
        modifiedById: '208',
        modifiedOn: '2023-05-02T00:00:00Z',
        ownerId: '312',
        payloadId: 'jkl-567-payload',
        rowVersion: 5,
        templateId: 'temp-460',
        loiDocumentId: 'loi-793-document',
        status: 'Active',
        signingRequestId: 'sign-req-1166',
        loiDocumentPdfId: 'pdf-337-document',
        quickformDefinition: 'QFD-005',
        chartererId: 'charterer-408',
        chartererPartyId: 'party-509',
        vesselId: 'vessel-610',
        voyageId: 'voyage-1111',
    },
    {
        title: 'Voyage 67890 Indemnity Claim',
        createdById: '107',
        createdOn: '2023-06-01T00:00:00Z',
        modifiedById: '209',
        modifiedOn: '2023-06-02T00:00:00Z',
        ownerId: '313',
        payloadId: 'mno-678-payload',
        rowVersion: 6,
        templateId: 'temp-461',
        loiDocumentId: 'loi-794-document',
        status: 'Rejected',
        signingRequestId: 'sign-req-1177',
        loiDocumentPdfId: 'pdf-338-document',
        quickformDefinition: 'QFD-006',
        chartererId: 'charterer-409',
        chartererPartyId: 'party-510',
        vesselId: 'vessel-611',
        voyageId: 'voyage-1212',
    },
];