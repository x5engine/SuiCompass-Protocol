module suicompass::rwa_registry {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;

    /// Real World Asset types
    const ASSET_TYPE_REAL_ESTATE: u8 = 1;
    const ASSET_TYPE_INVOICE: u8 = 2;
    const ASSET_TYPE_BOND: u8 = 3;

    /// Error codes
    const E_INVALID_ASSET_TYPE: u64 = 0;
    const E_INVALID_VALUATION: u64 = 1;

    /// RWA Token representing a real-world asset
    struct RWAToken has key, store {
        id: UID,
        /// Asset type (1=Real Estate, 2=Invoice, 3=Bond)
        asset_type: u8,
        /// Asset name/description
        name: String,
        /// Asset location or identifier
        location: String,
        /// Valuation in USD (scaled by 1e6)
        valuation: u64,
        /// IPFS hash for documentation
        documentation_uri: String,
        /// Issuer/Originator address
        issuer: address,
        /// Timestamp of tokenization
        created_at: u64,
    }

    /// Event emitted when RWA is minted
    struct RWAMinted has copy, drop {
        token_id: address,
        asset_type: u8,
        name: String,
        valuation: u64,
        issuer: address,
    }

    /// Mint a new Real Estate RWA token
    public entry fun mint_real_estate(
        name: vector<u8>,
        location: vector<u8>,
        valuation: u64,
        documentation_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        mint_rwa(
            ASSET_TYPE_REAL_ESTATE,
            name,
            location,
            valuation,
            documentation_uri,
            ctx
        );
    }

    /// Mint a new Invoice RWA token
    public entry fun mint_invoice(
        name: vector<u8>,
        location: vector<u8>,
        valuation: u64,
        documentation_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        mint_rwa(
            ASSET_TYPE_INVOICE,
            name,
            location,
            valuation,
            documentation_uri,
            ctx
        );
    }

    /// Mint a new Bond RWA token
    public entry fun mint_bond(
        name: vector<u8>,
        location: vector<u8>,
        valuation: u64,
        documentation_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        mint_rwa(
            ASSET_TYPE_BOND,
            name,
            location,
            valuation,
            documentation_uri,
            ctx
        );
    }

    /// Internal function to mint RWA token
    fun mint_rwa(
        asset_type: u8,
        name: vector<u8>,
        location: vector<u8>,
        valuation: u64,
        documentation_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(asset_type >= 1 && asset_type <= 3, E_INVALID_ASSET_TYPE);
        assert!(valuation > 0, E_INVALID_VALUATION);

        let issuer = tx_context::sender(ctx);
        let token = RWAToken {
            id: object::new(ctx),
            asset_type,
            name: string::utf8(name),
            location: string::utf8(location),
            valuation,
            documentation_uri: string::utf8(documentation_uri),
            issuer,
            created_at: tx_context::epoch(ctx),
        };

        let token_id = object::uid_to_address(&token.id);

        event::emit(RWAMinted {
            token_id,
            asset_type,
            name: token.name,
            valuation,
            issuer,
        });

        transfer::public_transfer(token, issuer);
    }

    /// Transfer RWA token to another address
    public entry fun transfer_rwa(
        token: RWAToken,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        transfer::public_transfer(token, recipient);
    }

    /// Get asset type
    public fun get_asset_type(token: &RWAToken): u8 {
        token.asset_type
    }

    /// Get valuation
    public fun get_valuation(token: &RWAToken): u64 {
        token.valuation
    }
}
