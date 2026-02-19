module suicompass::portfolio {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;

    /// Error: Caller is not the portfolio owner
    const ENotOwner: u64 = 0;
    /// Error: Caller is not the authorized manager
    #[allow(unused_const)]
    const ENotManager: u64 = 1;
    /// Error: Insufficient funds for withdrawal
    const EInsufficientFunds: u64 = 2;

    /// Capability allowing the holder (AI Agent) to manage/rebalance the portfolio
    public struct ManagerCap has key, store {
        id: UID
    }

    /// The Portfolio object holding the assets
    public struct Portfolio has key {
        id: UID,
        /// Owner of the funds (User)
        owner: address,
        /// The SUI balance
        sui_balance: Balance<SUI>,
    }

    // --- Events ---
    public struct PortfolioCreated has copy, drop {
        id: ID,
        owner: address,
    }

    public struct Deposit has copy, drop {
        portfolio_id: ID,
        amount: u64,
    }

    public struct Withdrawal has copy, drop {
        portfolio_id: ID,
        amount: u64,
    }

    public struct Rebalanced has copy, drop {
        portfolio_id: ID,
        strategy: std::string::String,
    }

    // --- Functions ---

    /// Create a new Portfolio and mint a ManagerCap for the AI
    public fun create_portfolio(ctx: &mut TxContext): ManagerCap {
        let owner = ctx.sender();
        let id = object::new(ctx);
        
        event::emit(PortfolioCreated {
            id: object::uid_to_inner(&id),
            owner,
        });

        let portfolio = Portfolio {
            id,
            owner,
            sui_balance: balance::zero(),
        };

        // Share the portfolio so it's accessible by owner and manager
        transfer::share_object(portfolio);

        // Return the ManagerCap to the sender (who can then transfer it to the AI agent)
        ManagerCap { id: object::new(ctx) }
    }

    /// Deposit funds into the portfolio
    public fun deposit(portfolio: &mut Portfolio, payment: Coin<SUI>, _ctx: &mut TxContext) {
        let amount = payment.value();
        balance::join(&mut portfolio.sui_balance, payment.into_balance());
        
        event::emit(Deposit {
            portfolio_id: object::uid_to_inner(&portfolio.id),
            amount,
        });
    }

    /// Withdraw funds (Owner Only)
    public fun withdraw(
        portfolio: &mut Portfolio, 
        amount: u64, 
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(ctx.sender() == portfolio.owner, ENotOwner);
        assert!(balance::value(&portfolio.sui_balance) >= amount, EInsufficientFunds);

        event::emit(Withdrawal {
            portfolio_id: object::uid_to_inner(&portfolio.id),
            amount,
        });

        coin::take(&mut portfolio.sui_balance, amount, ctx)
    }

    /// Simulate a rebalance strategy (Manager Only)
    public fun execute_strategy(
        _cap: &ManagerCap, 
        portfolio: &mut Portfolio, 
        strategy_name: std::string::String,
        _ctx: &mut TxContext
    ) {
        assert!(balance::value(&portfolio.sui_balance) > 0, EInsufficientFunds);

        event::emit(Rebalanced {
            portfolio_id: object::uid_to_inner(&portfolio.id),
            strategy: strategy_name,
        });
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;
    #[test_only] use std::string;

    #[test]
    fun test_portfolio_flow() {
        let user = @0xA;
        let ai_agent = @0xB;
        
        let mut scenario = test_scenario::begin(user);
        
        // 1. User creates portfolio
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let cap = create_portfolio(ctx);
            transfer::public_transfer(cap, ai_agent);
        };

        // 2. User deposits
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut portfolio = test_scenario::take_shared<Portfolio>(&scenario);
            let coin = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
            deposit(&mut portfolio, coin, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(portfolio);
        };

        // 3. AI executes strategy
        test_scenario::next_tx(&mut scenario, ai_agent);
        {
            let mut portfolio = test_scenario::take_shared<Portfolio>(&scenario);
            let cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            
            execute_strategy(
                &cap, 
                &mut portfolio, 
                string::utf8(b"Maximize Yield"), 
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_to_sender(&scenario, cap);
            test_scenario::return_shared(portfolio);
        };

        // 4. User withdraws
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut portfolio = test_scenario::take_shared<Portfolio>(&scenario);
            let withdrawn = withdraw(&mut portfolio, 500, test_scenario::ctx(&mut scenario));
            assert!(coin::value(&withdrawn) == 500, 0);
            
            coin::burn_for_testing(withdrawn);
            test_scenario::return_shared(portfolio);
        };

        test_scenario::end(scenario);
    }
}
