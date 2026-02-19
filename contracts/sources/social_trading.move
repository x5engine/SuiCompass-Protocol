module suicompass::social_trading {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use std::string::{String};

    /// Error: Caller is not the trader
    const ENotTrader: u64 = 0;
    /// Error: Insufficient funds
    const EInsufficientFunds: u64 = 1;

    /// The Vault
    public struct TradingVault has key {
        id: UID,
        trader: address,
        performance_fee_bps: u64,
        total_assets: Balance<SUI>,
        total_shares: u64, 
    }

    /// Share Token witness
    public struct VAULT_SHARE has drop {}

    public struct VaultTreasury has key {
        id: UID,
        cap: TreasuryCap<VAULT_SHARE>,
    }

    // --- Events ---
    public struct VaultCreated has copy, drop { id: ID, trader: address, fee_bps: u64 }

    // --- Functions ---

    /// Create a new Social Trading Vault with provided cap
    public fun create_vault_with_cap(
        cap: TreasuryCap<VAULT_SHARE>,
        fee_bps: u64,
        ctx: &mut TxContext
    ) {
        let vault = TradingVault {
            id: object::new(ctx),
            trader: ctx.sender(),
            performance_fee_bps: fee_bps,
            total_assets: balance::zero(),
            total_shares: 0,
        };

        event::emit(VaultCreated {
            id: object::uid_to_inner(&vault.id),
            trader: vault.trader,
            fee_bps: vault.performance_fee_bps,
        });

        transfer::share_object(vault);
        transfer::share_object(VaultTreasury {
            id: object::new(ctx),
            cap,
        });
    }

    /// Deposit funds into the vault
    public fun deposit(
        vault: &mut TradingVault,
        treasury: &mut VaultTreasury,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ): Coin<VAULT_SHARE> {
        let amount = payment.value();
        balance::join(&mut vault.total_assets, payment.into_balance());
        let shares = treasury.cap.mint(amount, ctx);
        vault.total_shares = vault.total_shares + amount;
        shares
    }

    /// Withdraw funds
    public fun withdraw(
        vault: &mut TradingVault,
        treasury: &mut VaultTreasury,
        shares: Coin<VAULT_SHARE>,
        ctx: &mut TxContext
    ): Coin<SUI> {
        let share_amount = shares.value();
        treasury.cap.burn(shares);
        vault.total_shares = vault.total_shares - share_amount;
        coin::take(&mut vault.total_assets, share_amount, ctx)
    }

    /// Report Profit
    public fun report_profit(
        vault: &mut TradingVault,
        mut profit_coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
         assert!(ctx.sender() == vault.trader, ENotTrader);
         let profit_amount = profit_coin.value();
         let fee = (profit_amount * vault.performance_fee_bps) / 10000;
         let fee_coin = profit_coin.split(fee, ctx);
         transfer::public_transfer(fee_coin, vault.trader);
         balance::join(&mut vault.total_assets, profit_coin.into_balance());
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
