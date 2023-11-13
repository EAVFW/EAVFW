type LOIMockData = {
    charterer: {
        name: string;
        '$type': string;
    }
    chartererId: string;
    charterParty: {
        cpname: string;
        '$type': string;
    }
    charterPartyId: string;
    createdOn: string;
    entityName: string;
    id: string;
    modifiedOn: string;
    rowVersion: string;
    status: number;
    title: string;
    vessel: {
        vesselname: string;
        '$type': string;
    }
    vesselId: string;
    voyage: {
        voyagename: string;
        '$type': string;
    }
    voyageId: string;
}

export const loiMockData: LOIMockData[] = [
    {
        charterer: {
            '$type': 'charterer',
            name: 'Hafnia'
        },
        chartererId: '664052de-e775-4c20-46b4-08dbe10d2969',
        charterParty: {
            '$type': 'charterparty',
            cpname: "CP 10.11.2023"
        },
        charterPartyId: '643d4560-8bee-451e-cb88-08dbe10d2978',
        createdOn: '2023-11-09T10:18:05.0442087Z',
        entityName: 'letterofindemnityrequest',
        id: "c3391566-e413-411c-854b-08dbe10d297c",
        modifiedOn: '2023-11-13T15:30:28.1809667Z',
        rowVersion: "AAAAAAACuFM=",
        status: 0,
        title: 'Test-LOI',
        vessel: {
            '$type': "vessel",
            vesselname: "Hafnia Larvik"
        },
        vesselId: 'bea0bdba-8098-411f-3870-08dbe10d2974',
        voyage: {
            '$type': 'voyage',
            voyagename: "Voyage #5493"
        },
        voyageId: '9cd70438-001c-4e3e-2276-08dbe10d2970'
    },
    {
        charterer: {
            "$type": "charterer",
            name: "Hafnia"
        },
        chartererId: "2f0a1bb9-aad2-4e2a-56c3-19df56a85b21",
        charterParty: {
            "$type": "charterparty",
            cpname: "CP 11.11.2023"
        },
        charterPartyId: "f4d3bb12-4a22-4e1f-eb33-29df56a85c22",
        createdOn: "2023-11-10T11:19:06.0553098Z",
        entityName: "letterofindemnityrequest",
        id: "d3201767-f514-422c-965c-39df56a85d23",
        modifiedOn: "2023-11-14T16:31:29.1919778Z",
        rowVersion: "AAAAAAACuF1=",
        status: 10,
        title: "Test-LOI-B",
        vessel: {
            "$type": "vessel",
            vesselname: "Hafnia Lillesand"
        },
        vesselId: "cd01bdbb-9123-412f-4971-29df56a85e24",
        voyage: {
            "$type": "voyage",
            voyagename: "Voyage #5494"
        },
        voyageId: "ac17c438-002d-4d3f-3377-49df56a85f25"
    },
    {
        charterer: {
            "$type": "charterer",
            name: "Hafnia"
        },
        chartererId: "3g1d2cc0-bbf3-5f3b-67d4-20ef67b96c32",
        charterParty: {
            "$type": "charterparty",
            cpname: "CP 12.11.2023"
        },
        charterPartyId: "g5e4cc13-5b33-5f2g-fc44-30ef67b97d33",
        createdOn: "2023-11-11T12:20:07.0664019Z",
        entityName: "letterofindemnityrequest",
        id: "e4312878-g625-533d-a76d-40ef67b98e34",
        modifiedOn: "2023-11-15T17:32:30.2029889Z",
        rowVersion: "AAAAAAACuG2=",
        status: 20,
        title: "Test-LOI-C",
        vessel: {
            "$type": "vessel",
            vesselname: "Hafnia Languedoc"
        },
        vesselId: "de12cdbc-c234-523g-5a82-30ef67b99f35",
        voyage: {
            "$type": "voyage",
            voyagename: "Voyage #5495"
        },
        voyageId: "bd28d539-013e-5e4f-4488-50ef67b9a036"
    },
    {
        charterer: {
            "$type": "charterer",
            name: "Hafnia"
        },
        chartererId: "4h2e3dd1-ccd4-6g4c-78e5-21fg78c0ad43",
        charterParty: {
            "$type": "charterparty",
            cpname: "CP 13.11.2023"
        },
        charterPartyId: "h6f5dd24-6c44-6e2h-gd55-41fg78c0be44",
        createdOn: "2023-11-12T13:21:08.0774930Z",
        entityName: "letterofindemnityrequest",
        id: "f5423989-h736-644e-b87e-51fg78c0cf45",
        modifiedOn: "2023-11-16T18:33:31.2140000Z",
        rowVersion: "AAAAAAACuH3=",
        status: 30,
        title: "Test-LOI-D",
        vessel: {
            "$type": "vessel",
            "vesselname": "Hafnia Nanjing"
        },
        vesselId: "ef23dedd-d345-634h-6b93-41fg78c0dg46",
        voyage: {
            "$type": "voyage",
            voyagename: "Voyage #5496"
        },
        voyageId: "ce39e651-024f-6e5g-5599-61fg78c0eh47"
    },
    {
        charterer: {
            "$type": "charterer",
            name: "Hafnia"
        },
        chartererId: "4h2e3dd1-ccd4-6g4c-78e5-21fg78c0ad43",
        charterParty: {
            "$type": "charterparty",
            cpname: "CP 13.11.2023"
        },
        charterPartyId: "h6f5dd24-6c44-6e2h-gd55-41fg78c0be44",
        createdOn: "2023-11-12T13:21:08.0774930Z",
        entityName: "letterofindemnityrequest",
        id: "f5423989-h736-644e-b87e-51fg78c0cf45",
        modifiedOn: "2023-11-16T18:33:31.2140000Z",
        rowVersion: "AAAAAAACuH3=",
        status: 40,
        title: "Test-LOI-D",
        vessel: {
            "$type": "vessel",
            "vesselname": "Hafnia Thames"
        },
        vesselId: "ef23dedd-d345-634h-6b93-41fg78c0dg46",
        voyage: {
            "$type": "voyage",
            voyagename: "Voyage #5496"
        },
        voyageId: "ce39e651-024f-6e5g-5599-61fg78c0eh47"
    },
    {
        charterer: {
            "$type": "charterer",
            name: "Hafnia"
        },
        chartererId: "4h2e3dd1-ccd4-6g4c-78e5-21fg78c0ad43",
        charterParty: {
            "$type": "charterparty",
            cpname: "CP 13.11.2023"
        },
        charterPartyId: "h6f5dd24-6c44-6e2h-gd55-41fg78c0be44",
        createdOn: "2023-11-12T13:21:08.0774930Z",
        entityName: "letterofindemnityrequest",
        id: "f5423989-h736-644e-b87e-51fg78c0cf45",
        modifiedOn: "2023-11-16T18:33:31.2140000Z",
        rowVersion: "AAAAAAACuH3=",
        status: 50,
        title: "Test-LOI-D",
        vessel: {
            "$type": "vessel",
            "vesselname": "Hafnia Pioneer"
        },
        vesselId: "ef23dedd-d345-634h-6b93-41fg78c0dg46",
        voyage: {
            "$type": "voyage",
            voyagename: "Voyage #5496"
        },
        voyageId: "ce39e651-024f-6e5g-5599-61fg78c0eh47"
    },
    {
        charterer: {
            "$type": "charterer",
            name: "Hafnia"
        },
        chartererId: "4h2e3dd1-ccd4-6g4c-78e5-21fg78c0ad43",
        charterParty: {
            "$type": "charterparty",
            cpname: "CP 13.11.2023"
        },
        charterPartyId: "h6f5dd24-6c44-6e2h-gd55-41fg78c0be44",
        createdOn: "2023-11-12T13:21:08.0774930Z",
        entityName: "letterofindemnityrequest",
        id: "f5423989-h736-644e-b87e-51fg78c0cf45",
        modifiedOn: "2023-11-16T18:33:31.2140000Z",
        rowVersion: "AAAAAAACuH3=",
        status: 60,
        title: "Test-LOI-D",
        vessel: {
            "$type": "vessel",
            "vesselname": "Hafnia Guangzhou"
        },
        vesselId: "ef23dedd-d345-634h-6b93-41fg78c0dg46",
        voyage: {
            "$type": "voyage",
            voyagename: "Voyage #5496"
        },
        voyageId: "ce39e651-024f-6e5g-5599-61fg78c0eh47"
    }

];