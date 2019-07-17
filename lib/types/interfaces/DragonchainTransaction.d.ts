declare enum DragonchainResourceName {
    Transaction_L1_Search_Index = "Transaction::L1::SearchIndex",
    Transaction_L1_Full = "Transaction::L1::FullTransaction",
    Transaction_L1_Queue_Task = "Transaction::L1::QueueTask",
    Transaction_L1_Bulk_Queue_Task = "Transaction::L1::BulkQueueTask",
    Transaction_L1_Stripped = "Transaction::L1::Stripped",
    Block_L1_Search_Index = "Block::L1::SearchIndex",
    Block_L2_Search_Index = "Block::L2::SearchIndex",
    Block_L3_Search_Index = "Block::L3::SearchIndex",
    Block_L4_Search_Index = "Block::L4::SearchIndex",
    Block_L1_At_Rest = "Block::L1::AtRest",
    Block_L2_At_Rest = "Block::L2::AtRest",
    Block_L3_At_Rest = "Block::L3::AtRest",
    Block_L4_At_Rest = "Block::L4::AtRest",
    Broadcast_L1_InTransit = "Broadcast::L1::InTransit",
    Broadcast_L2_InTransit = "Broadcast::L2::InTransit",
    Broadcast_L3_InTransit = "Broadcast::L3::InTransit",
    Broadcast_L4_InTransit = "Broadcast::L4::InTransit",
    Verification_Record_Desired_At_Rest = "VerificationRecord::Desired::AtRest",
    Verification_Record_Sent_At_Rest = "VerificationRecord::Sent::AtRest",
    Verification_Record_Receipt_At_Rest = "VerificationRecord::Receipt::AtRest",
    SmartContract_L1_At_Rest = "SmartContract::L1::AtRest",
    SmartContract_L1_Search_Index = "SmartContract::L1::SearchIndex",
    SmartContract_L1_Create = "SmartContract::L1::Create",
    SmartContract_L1_Update = "SmartContract::L1::Update"
}
export interface DragonchainTransaction {
    dcrn: DragonchainResourceName.Transaction_L1_Full;
    version: Number;
    header: {
        txn_type: string;
        dc_id: string;
        txn_id: string;
        tag: string;
        timestamp: string;
        block_id: string;
        invoker: string;
    };
    payload: string;
    proof: {
        full: string;
        stripped: string;
    };
}
export interface DragonchainSearchResult {
    total: Number;
    results: DragonchainTransaction[];
}
export interface DragonchainTransactionCreatePayload {
    version: string;
    txn_type: string;
    payload: object | string;
    tag: string;
}
export {};
