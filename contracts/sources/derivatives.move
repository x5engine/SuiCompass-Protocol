module suicompass::derivatives {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::event;

    /// Error: Option has expired
    const EOptionExpired: u64 = 0;
    /// Error: Option not yet expired
    const EOptionNotExpired: u64 = 1;
    /// Error: Incorrect strike price paid
    const EIncorrectStrikePrice: u64 = 3;

    /// A Call Option on a generic Sui object
    public struct CallOption<T: key + store> has key, store {
        id: UID,
        underlying_asset: T,
        seller: address,
        strike_price: u64,
        expiry: u64,
    }

    // --- Events ---
    public struct OptionCreated has copy, drop {
        id: ID,
        seller: address,
        strike_price: u64,
        expiry: u64,
    }

    public struct OptionExercised has copy, drop {
        id: ID,
        buyer: address,
    }

    public struct AssetReclaimed has copy, drop {
        id: ID,
        seller: address,
    }

    // --- Functions ---

    /// Create (Sell/Write) a Call Option
    public fun create_option<T: key + store>(
        asset: T,
        strike_price: u64,
        expiry: u64,
        ctx: &mut TxContext
    ): CallOption<T> {
        let id = object::new(ctx);
        
        event::emit(OptionCreated {
            id: object::uid_to_inner(&id),
            seller: ctx.sender(),
            strike_price,
            expiry,
        });

        CallOption {
            id,
            underlying_asset: asset,
            seller: ctx.sender(),
            strike_price,
            expiry,
        }
    }

    /// Exercise the option
    public fun exercise<T: key + store>(
        option: CallOption<T>,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ): T {
        let CallOption { id, underlying_asset, seller, strike_price, expiry } = option;

        assert!(clock::timestamp_ms(clock) < expiry, EOptionExpired);
        assert!(coin::value(&payment) == strike_price, EIncorrectStrikePrice);

        transfer::public_transfer(payment, seller);

        event::emit(OptionExercised {
            id: object::uid_to_inner(&id),
            buyer: ctx.sender(),
        });

        object::delete(id);
        underlying_asset
    }

    /// Reclaim the asset if option expired
    public fun reclaim_asset<T: key + store>(
        option: CallOption<T>,
        clock: &Clock,
        _ctx: &mut TxContext
    ): T {
        let CallOption { id, underlying_asset, seller, strike_price: _, expiry } = option;

        assert!(clock::timestamp_ms(clock) >= expiry, EOptionNotExpired);

        event::emit(AssetReclaimed {
            id: object::uid_to_inner(&id),
            seller,
        });

        object::delete(id);
        underlying_asset
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;
    #[test_only] public struct MockAsset has key, store { id: UID }

    #[test]
    fun test_derivatives_flow() {
        let seller = @0xA;
        let buyer = @0xB;

        let mut scenario = test_scenario::begin(seller);
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let asset = MockAsset { id: object::new(ctx) };
            let option = create_option(asset, 100, 2000, ctx);
            transfer::public_transfer(option, buyer);
        };

        test_scenario::next_tx(&mut scenario, buyer);
        {
            let option = test_scenario::take_from_sender<CallOption<MockAsset>>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let payment = coin::mint_for_testing<SUI>(100, ctx);
            let asset = exercise(option, payment, &clock, ctx);
            transfer::public_transfer(asset, buyer);
        };

        clock.destroy_for_testing();
        test_scenario::end(scenario);
    }
}
