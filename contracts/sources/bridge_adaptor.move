module suicompass::bridge_adaptor {
    use sui::coin::{Self, Coin};
    use sui::event;
    use std::string::{Self, String};

    /// The Bridge Adaptor Config
    public struct BridgeConfig has key {
        id: UID,
        owner: address,
        is_paused: bool,
    }

    // --- Events ---
    public struct BridgeInitiated has copy, drop {
        sender: address,
        token_type: String,
        amount: u64,
        target_chain: String,
        target_address: String,
    }

    // --- Functions ---

    public fun create_config(ctx: &mut TxContext) {
        let config = BridgeConfig {
            id: object::new(ctx),
            owner: ctx.sender(),
            is_paused: false,
        };
        transfer::share_object(config);
    }

    /// Unified Bridge Function
    public fun bridge_asset<T>(
        _config: &BridgeConfig,
        token: Coin<T>,
        target_chain: vector<u8>,
        target_address: vector<u8>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&token);
        let token_type_ascii = std::type_name::get<T>().into_string();

        event::emit(BridgeInitiated {
            sender: ctx.sender(),
            token_type: string::from_ascii(token_type_ascii),
            amount,
            target_chain: string::utf8(target_chain),
            target_address: string::utf8(target_address),
        });

        transfer::public_transfer(token, @0x0);
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;
    #[test_only] use sui::sui::SUI;

    #[test]
    fun test_bridge_flow() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        {
            create_config(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let config = test_scenario::take_shared<BridgeConfig>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            let payment = coin::mint_for_testing<SUI>(1000, ctx);
            
            bridge_asset(&config, payment, b"Ethereum", b"0x123", ctx);
            
            test_scenario::return_shared(config);
        };
        test_scenario::end(scenario);
    }
}
