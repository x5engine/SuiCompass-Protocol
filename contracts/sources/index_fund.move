module suicompass::index_fund {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;

    /// Mock stablecoin
    public struct USDC has drop {}

    /// The share token
    public struct SHARE has drop {}

    /// Error: Incorrect ratio
    const EIncorrectRatio: u64 = 0;
    /// Error: Insufficient shares
    const EInsufficientShares: u64 = 1;

    /// The Index Fund vault
    public struct FundVault has key {
        id: UID,
        sui_balance: Balance<SUI>,
        usdc_balance: Balance<USDC>,
        total_shares: u64,
        ratio_sui_per_usdc: u64, 
    }

    /// Registry for the treasury cap
    public struct FundTreasury has key {
        id: UID,
        cap: TreasuryCap<SHARE>,
    }

    // --- Events ---
    public struct FundCreated has copy, drop { id: ID }

    // --- Functions ---

    /// Create fund with a provided treasury cap
    public fun create_fund_with_cap(cap: TreasuryCap<SHARE>, ctx: &mut TxContext) {
        let vault = FundVault {
            id: object::new(ctx),
            sui_balance: balance::zero(),
            usdc_balance: balance::zero(),
            total_shares: 0,
            ratio_sui_per_usdc: 100,
        };
        event::emit(FundCreated { id: object::uid_to_inner(&vault.id) });
        transfer::share_object(vault);
        transfer::share_object(FundTreasury {
            id: object::new(ctx),
            cap,
        });
    }

    /// Deposit and mint shares
    public fun mint_shares(
        vault: &mut FundVault,
        treasury: &mut FundTreasury,
        sui_payment: Coin<SUI>,
        usdc_payment: Coin<USDC>,
        ctx: &mut TxContext
    ): Coin<SHARE> {
        let sui_val = sui_payment.value();
        let usdc_val = usdc_payment.value();
        assert!(sui_val == usdc_val * vault.ratio_sui_per_usdc, EIncorrectRatio);
        let shares_to_mint = usdc_val; 
        vault.sui_balance.join(sui_payment.into_balance());
        vault.usdc_balance.join(usdc_payment.into_balance());
        vault.total_shares = vault.total_shares + shares_to_mint;
        treasury.cap.mint(shares_to_mint, ctx)
    }

    /// Redeem shares
    public fun redeem_shares(
        vault: &mut FundVault,
        treasury: &mut FundTreasury,
        shares: Coin<SHARE>,
        ctx: &mut TxContext
    ): (Coin<SUI>, Coin<USDC>) {
        let amount = shares.value();
        assert!(vault.total_shares >= amount, EInsufficientShares);
        treasury.cap.burn(shares);
        vault.total_shares = vault.total_shares - amount;
        let usdc_out = amount;
        let sui_out = amount * vault.ratio_sui_per_usdc;
        (
            coin::from_balance(vault.sui_balance.split(sui_out), ctx),
            coin::from_balance(vault.usdc_balance.split(usdc_out), ctx)
        )
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;
    
    #[test]
    fun test_build_only() {
        let admin = @0xA;
        let scenario = test_scenario::begin(admin);
        test_scenario::end(scenario);
    }
}
