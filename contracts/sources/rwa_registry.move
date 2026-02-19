module suicompass::rwa_registry {
    use std::string::{Self, String};
    use sui::event;

    /// Real World Asset types
    const ASSET_TYPE_REAL_ESTATE: u8 = 1;
    const ASSET_TYPE_INVOICE: u8 = 2;
    const ASSET_TYPE_BOND: u8 = 3;

    /// RWA Status
    const STATUS_PENDING: u8 = 1;
    #[allow(unused_const)]
    const STATUS_VERIFIED: u8 = 2;
    #[allow(unused_const)]
    const STATUS_PAID: u8 = 3;
    #[allow(unused_const)]
    const STATUS_DEFAULTED: u8 = 4;

    /// Error codes
    const E_INVALID_ASSET_TYPE: u64 = 0;
    const E_INVALID_VALUATION: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;

    /// RWA NFT representing a real-world asset
    public struct RWANFT has key, store {
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
        /// Current status of the asset
        status: u8,
        /// Timestamp of tokenization
        created_at: u64,
    }

    /// Event emitted when RWA is minted
    public struct RWAMinted has copy, drop {
        token_id: address,
        asset_type: u8,
        name: String,
        valuation: u64,
        issuer: address,
    }

    /// Event emitted when status is updated
    public struct RWAStatusUpdated has copy, drop {
        token_id: address,
        old_status: u8,
        new_status: u8,
    }

    /// Event emitted when RWA is burned
    public struct RWABurned has copy, drop {
        token_id: address,
        name: String,
    }

    /// Mint a new Real Estate RWA NFT
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

    /// Mint a new Invoice RWA NFT
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

    /// Mint a new Bond RWA NFT
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

    /// Internal function to mint RWA NFT
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

        let issuer = ctx.sender();
        let nft = RWANFT {
            id: object::new(ctx),
            asset_type,
            name: string::utf8(name),
            location: string::utf8(location),
            valuation,
            documentation_uri: string::utf8(documentation_uri),
            issuer,
            status: STATUS_PENDING,
            created_at: ctx.epoch(),
        };

        let token_id = object::uid_to_address(&nft.id);

        event::emit(RWAMinted {
            token_id,
            asset_type,
            name: nft.name,
            valuation,
            issuer,
        });

        transfer::public_transfer(nft, issuer);
    }

    /// Transfer RWA NFT to another address
    public entry fun transfer_rwa(
        nft: RWANFT,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        transfer::public_transfer(nft, recipient);
    }

    /// Update the status of the RWA NFT
    /// Only the issuer can update the status (simple permission model for MVP)
    public entry fun update_status(
        nft: &mut RWANFT,
        new_status: u8,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        assert!(sender == nft.issuer, E_NOT_AUTHORIZED);

        let old_status = nft.status;
        nft.status = new_status;

        let token_id = object::uid_to_address(&nft.id);

        event::emit(RWAStatusUpdated {
            token_id,
            old_status,
            new_status,
        });
    }

    /// Burn (destroy) the RWA NFT
    public entry fun burn(nft: RWANFT, _ctx: &mut TxContext) {
        let RWANFT {
            id,
            asset_type: _,
            name,
            location: _,
            valuation: _,
            documentation_uri: _,
            issuer: _,
            status: _,
            created_at: _,
        } = nft;

        let token_id = object::uid_to_address(&id);

        event::emit(RWABurned {
            token_id,
            name,
        });

        object::delete(id);
    }

    // --- Getters ---

    public fun get_asset_type(nft: &RWANFT): u8 {
        nft.asset_type
    }

    public fun get_valuation(nft: &RWANFT): u64 {
        nft.valuation
    }

    public fun get_status(nft: &RWANFT): u8 {
        nft.status
    }
}
