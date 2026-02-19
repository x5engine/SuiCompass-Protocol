module suicompass::prediction_market {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use std::string::{Self, String};

    /// Error: Market already resolved
    const EMarketResolved: u64 = 0;
    /// Error: Market not resolved yet
    const EMarketNotResolved: u64 = 1;
    /// Error: Caller is not the Oracle
    const ENotOracle: u64 = 2;
    /// Error: User has no winning stake
    const ENoWinningStake: u64 = 3;

    /// The Prediction Market Object
    public struct Market has key {
        id: UID,
        question: String,
        oracle: address,
        resolved: bool,
        outcome: bool, // true = YES, false = NO
        total_yes_stake: u64,
        total_no_stake: u64,
        pot: Balance<SUI>,
    }

    /// NFT representing a user's bet
    public struct BetReceipt has key, store {
        id: UID,
        market_id: ID,
        prediction: bool, // true = YES
        amount: u64,
    }

    // --- Events ---
    public struct MarketCreated has copy, drop {
        id: ID,
        question: String,
    }

    public struct BetPlaced has copy, drop {
        market_id: ID,
        user: address,
        prediction: bool,
        amount: u64,
    }

    public struct MarketResolved has copy, drop {
        id: ID,
        outcome: bool,
    }

    public struct WinningsClaimed has copy, drop {
        market_id: ID,
        user: address,
        amount: u64,
    }

    // --- Functions ---

    /// Create a new prediction market
    public fun create_market(
        question: vector<u8>,
        oracle: address,
        ctx: &mut TxContext
    ) {
        let market = Market {
            id: object::new(ctx),
            question: string::utf8(question),
            oracle,
            resolved: false,
            outcome: false,
            total_yes_stake: 0,
            total_no_stake: 0,
            pot: balance::zero(),
        };

        event::emit(MarketCreated {
            id: object::uid_to_inner(&market.id),
            question: market.question,
        });

        transfer::share_object(market);
    }

    /// Place a bet
    public fun place_bet(
        market: &mut Market,
        prediction: bool,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ): BetReceipt {
        assert!(!market.resolved, EMarketResolved);

        let amount = coin::value(&payment);
        balance::join(&mut market.pot, coin::into_balance(payment));

        if (prediction) {
            market.total_yes_stake = market.total_yes_stake + amount;
        } else {
            market.total_no_stake = market.total_no_stake + amount;
        };

        event::emit(BetPlaced {
            market_id: object::uid_to_inner(&market.id),
            user: ctx.sender(),
            prediction,
            amount,
        });

        BetReceipt {
            id: object::new(ctx),
            market_id: object::uid_to_inner(&market.id),
            prediction,
            amount,
        }
    }

    /// Resolve the market (Oracle Only)
    public fun resolve_market(
        market: &mut Market,
        outcome: bool,
        ctx: &mut TxContext
    ) {
        assert!(ctx.sender() == market.oracle, ENotOracle);
        assert!(!market.resolved, EMarketResolved);

        market.resolved = true;
        market.outcome = outcome;

        event::emit(MarketResolved {
            id: object::uid_to_inner(&market.id),
            outcome,
        });
    }

    /// Claim winnings
    public fun claim_winnings(
        market: &mut Market,
        receipt: BetReceipt,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(market.resolved, EMarketNotResolved);
        
        let BetReceipt { id, market_id, prediction, amount } = receipt;
        object::delete(id);

        assert!(market_id == object::uid_to_inner(&market.id), ENoWinningStake);
        assert!(prediction == market.outcome, ENoWinningStake);

        let total_winning_stake = if (market.outcome) { 
            market.total_yes_stake 
        } else { 
            market.total_no_stake 
        };

        assert!(total_winning_stake > 0, ENoWinningStake);

        let total_pot = balance::value(&market.pot);
        let payout_amount = ((amount as u128) * (total_pot as u128) / (total_winning_stake as u128)) as u64;

        event::emit(WinningsClaimed {
            market_id,
            user: ctx.sender(),
            amount: payout_amount,
        });

        coin::take(&mut market.pot, payout_amount, ctx)
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;

    #[test]
    fun test_prediction_market() {
        let admin = @0xA;
        let oracle = @0xB;
        let gambler_yes = @0xC;
        let gambler_no = @0xD;

        let mut scenario = test_scenario::begin(admin);

        {
            let ctx = test_scenario::ctx(&mut scenario);
            create_market(b"Will SUI hit $10?", oracle, ctx);
        };

        test_scenario::next_tx(&mut scenario, gambler_yes);
        {
            let mut market = test_scenario::take_shared<Market>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let payment = coin::mint_for_testing<SUI>(100, ctx);
            let receipt = place_bet(&mut market, true, payment, ctx);
            transfer::public_transfer(receipt, gambler_yes);
            test_scenario::return_shared(market);
        };

        test_scenario::next_tx(&mut scenario, gambler_no);
        {
            let mut market = test_scenario::take_shared<Market>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let payment = coin::mint_for_testing<SUI>(50, ctx);
            let receipt = place_bet(&mut market, false, payment, ctx);
            transfer::public_transfer(receipt, gambler_no);
            test_scenario::return_shared(market);
        };

        test_scenario::next_tx(&mut scenario, oracle);
        {
            let mut market = test_scenario::take_shared<Market>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            resolve_market(&mut market, true, ctx);
            test_scenario::return_shared(market);
        };

        test_scenario::next_tx(&mut scenario, gambler_yes);
        {
            let mut market = test_scenario::take_shared<Market>(&scenario);
            let receipt = test_scenario::take_from_sender<BetReceipt>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let winnings = claim_winnings(&mut market, receipt, ctx);
            assert!(coin::value(&winnings) == 150, 0);
            coin::burn_for_testing(winnings);
            test_scenario::return_shared(market);
        };

        test_scenario::end(scenario);
    }
}
