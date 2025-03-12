export interface VirtualNode {
    holdingIdentity: {
        x500Name: string;
        groupId: string;
        shortHash: string;
        fullHash: string;
    };
    cpiIdentifier: {
        cpiName: string;
        cpiVersion: string;
        signerSummaryHash: string;
    };
    vaultDdlConnectionId: string;
    vaultDmlConnectionId: string;
    cryptoDdlConnectionId: string;
    cryptoDmlConnectionId: string;
    uniquenessDdlConnectionId: string;
    uniquenessDmlConnectionId: string;
    hsmConnectionId: string | null;
    flowP2pOperationalStatus: string;
    flowStartOperationalStatus: string;
    flowOperationalStatus: string;
    vaultDbOperationalStatus: string;
    operationInProgress: any;
    externalMessagingRouteConfiguration: any;
}

export interface Document {
    id: string;
    documentName: string;
    authorizationID: number;
    createdAt: string; // Assuming createdAt and lastUpdated are ISO date strings
    lastUpdated: string;
    recordState: string; // Assuming recordState is a string enum
    version: number;
}