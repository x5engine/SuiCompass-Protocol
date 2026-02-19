module suicompass::stream_pay {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock::{Self, Clock};

    /// Error: Stream not started
    #[allow(unused_const)]
    const EStreamNotStarted: u64 = 0;
    /// Error: Insufficient vested balance
    const EInsufficientVested: u64 = 1;
    /// Error: Not the payee
    const ENotPayee: u64 = 2;
    /// Error: Not the payer
    const ENotPayer: u64 = 3;

    /// The Stream Object
    public struct Stream has key {
        id: UID,
        payer: address,
        payee: address,
        balance: Balance<SUI>,
        start_time: u64,
        duration: u64,
        total_amount: u64,
        claimed_amount: u64,
        last_claim_time: u64,
    }

    // --- Events ---
    public struct StreamCreated has copy, drop {
        id: ID,
        payer: address,
        payee: address,
        amount: u64,
        duration: u64,
    }

    public struct FundsClaimed has copy, drop {
        stream_id: ID,
        amount: u64,
    }

    public struct StreamCancelled has copy, drop {
        stream_id: ID,
        refund_amount: u64,
    }

    // --- Functions ---

    /// Create a new payment stream
    public fun create_stream(
        payee: address,
        amount: Coin<SUI>,
        duration: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let total_amount = coin::value(&amount);
        let start_time = clock::timestamp_ms(clock);

        let stream = Stream {
            id: object::new(ctx),
            payer: ctx.sender(),
            payee,
            balance: coin::into_balance(amount),
            start_time,
            duration,
            total_amount,
            claimed_amount: 0,
            last_claim_time: start_time,
        };

        event::emit(StreamCreated {
            id: object::uid_to_inner(&stream.id),
            payer: stream.payer,
            payee,
            amount: total_amount,
            duration,
        });

        transfer::share_object(stream);
    }

    /// Calculate vested amount
    public fun calculate_vested_amount(stream: &Stream, current_time: u64): u64 {
        if (current_time <= stream.start_time) {
            return 0
        };

        let elapsed = current_time - stream.start_time;
        
        if (elapsed >= stream.duration) {
            return stream.total_amount
        };

        ((stream.total_amount as u128) * (elapsed as u128) / (stream.duration as u128)) as u64
    }

    /// Claim vested funds
    public fun claim(
        stream: &mut Stream,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(ctx.sender() == stream.payee, ENotPayee);

        let current_time = clock::timestamp_ms(clock);
        let vested_total = calculate_vested_amount(stream, current_time);
        
        let claimable = vested_total - stream.claimed_amount;
        assert!(claimable > 0, EInsufficientVested);

        stream.claimed_amount = stream.claimed_amount + claimable;
        stream.last_claim_time = current_time;

        event::emit(FundsClaimed {
            stream_id: object::uid_to_inner(&stream.id),
            amount: claimable,
        });

        coin::take(&mut stream.balance, claimable, ctx)
    }

    /// Cancel Stream
    public fun cancel_stream(
        stream: Stream,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let Stream { 
            id, 
            payer, 
            payee, 
            mut balance, 
            start_time, 
            duration, 
            total_amount, 
            claimed_amount, 
            last_claim_time: _ 
        } = stream;

        assert!(ctx.sender() == payer, ENotPayer);

        let current_time = clock::timestamp_ms(clock);
        
        let vested_total = if (current_time >= start_time + duration) {
            total_amount
        } else {
            ((total_amount as u128) * ((current_time - start_time) as u128) / (duration as u128)) as u64
        };

        let payee_owed = vested_total - claimed_amount;

        if (payee_owed > 0) {
            let payee_coin = coin::take(&mut balance, payee_owed, ctx);
            transfer::public_transfer(payee_coin, payee);
        };

        let refund_amount = balance.value();
        let refund_coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(refund_coin, payer);

        event::emit(StreamCancelled {
            stream_id: object::uid_to_inner(&id),
            refund_amount,
        });

        object::delete(id);
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;

    #[test]
    fun test_stream_flow() {
        let payer = @0xA;
        let payee = @0xB;

        let mut scenario = test_scenario::begin(payer);
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let payment = coin::mint_for_testing<SUI>(1000, ctx);
            create_stream(payee, payment, 1000, &clock, ctx);
        };

        clock::increment_for_testing(&mut clock, 500);

        test_scenario::next_tx(&mut scenario, payee);
        {
            let mut stream = test_scenario::take_shared<Stream>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let claimed = claim(&mut stream, &clock, ctx);
            assert!(coin::value(&claimed) == 500, 0);
            coin::burn_for_testing(claimed);
            test_scenario::return_shared(stream);
        };

        clock::increment_for_testing(&mut clock, 500);

        test_scenario::next_tx(&mut scenario, payee);
        {
            let mut stream = test_scenario::take_shared<Stream>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let claimed = claim(&mut stream, &clock, ctx);
            assert!(coin::value(&claimed) == 500, 1);
            coin::burn_for_testing(claimed);
            test_scenario::return_shared(stream);
        };

        clock.destroy_for_testing();
        test_scenario::end(scenario);
    }
}
