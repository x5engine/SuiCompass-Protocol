module suicompass::lossless_lottery {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::random::{Self, Random};

    /// Error: No players in the pool
    const ENoPlayers: u64 = 1;

    /// The Lottery Pool
    public struct Pool has key {
        id: UID,
        total_principal: Balance<SUI>,
        interest_accumulated: Balance<SUI>,
        players: vector<address>,
    }

    // --- Events ---
    public struct DepositMade has copy, drop { player: address, amount: u64 }
    public struct WinnerDrawn has copy, drop { winner: address, amount: u64 }

    // --- Functions ---

    /// Create the Lottery Pool
    public fun create_pool(ctx: &mut TxContext) {
        let pool = Pool {
            id: object::new(ctx),
            total_principal: balance::zero(),
            interest_accumulated: balance::zero(),
            players: vector::empty(),
        };
        transfer::share_object(pool);
    }

    /// Deposit SUI into the pool
    public fun deposit(pool: &mut Pool, payment: Coin<SUI>, ctx: &mut TxContext) {
        let player = ctx.sender();
        let amount = coin::value(&payment);
        
        balance::join(&mut pool.total_principal, coin::into_balance(payment));
        
        if (!vector::contains(&pool.players, &player)) {
            vector::push_back(&mut pool.players, player);
        };

        event::emit(DepositMade { player, amount });
    }

    /// Mock function to add interest
    public fun add_interest(pool: &mut Pool, yield: Coin<SUI>) {
        balance::join(&mut pool.interest_accumulated, coin::into_balance(yield));
    }

    /// Draw a winner
    public entry fun draw_winner(
        pool: &mut Pool,
        r: &Random,
        ctx: &mut TxContext
    ) {
        let num_players = vector::length(&pool.players);
        assert!(num_players > 0, ENoPlayers);

        let mut generator = random::new_generator(r, ctx);
        let winner_index = random::generate_u64_in_range(&mut generator, 0, num_players - 1);
        let winner = *vector::borrow(&pool.players, winner_index);

        let winnings_amount = balance::value(&pool.interest_accumulated);
        let winnings = coin::take(&mut pool.interest_accumulated, winnings_amount, ctx);
        
        event::emit(WinnerDrawn { winner, amount: winnings_amount });
        
        transfer::public_transfer(winnings, winner);
    }

    /// Withdraw principal (Simplified)
    public fun withdraw_all(pool: &mut Pool, ctx: &mut TxContext): Coin<SUI> {
        let amount = balance::value(&pool.total_principal);
        coin::take(&mut pool.total_principal, amount, ctx)
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;

    #[test]
    fun test_lottery_flow() {
        let admin = @0xA;
        let player1 = @0xB;
        
        let mut scenario = test_scenario::begin(admin);
        
        {
            create_pool(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, player1);
        {
            let mut pool = test_scenario::take_shared<Pool>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let payment = coin::mint_for_testing<SUI>(1000, ctx);
            deposit(&mut pool, payment, ctx);
            test_scenario::return_shared(pool);
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut pool = test_scenario::take_shared<Pool>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let interest = coin::mint_for_testing<SUI>(50, ctx);
            add_interest(&mut pool, interest);
            test_scenario::return_shared(pool);
        };

        test_scenario::end(scenario);
    }
}
