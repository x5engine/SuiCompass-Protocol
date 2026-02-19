module suicompass::reputation_id {
    use std::string::{Self, String};
    use sui::event;

    /// Error: Not an authorized attestor
    #[allow(unused_const)]
    const ENotAuthorized: u64 = 0;

    /// The Reputation Object (Linked to a specific user)
    public struct ReputationProfile has key {
        id: UID,
        user: address,
        score: u64, // 0 to 1000
        total_interactions: u64,
        last_updated: u64,
    }

    /// Admin capability to authorize attestors
    public struct AdminCap has key, store { id: UID }

    /// Capability for a protocol to update reputation
    public struct AttestorCap has key, store {
        id: UID,
        protocol_name: String,
    }

    // --- Events ---
    public struct ProfileCreated has copy, drop { user: address, profile_id: ID }
    public struct ScoreUpdated has copy, drop { user: address, new_score: u64, protocol: String }

    // --- Functions ---

    public fun init_admin(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
    }

    /// User creates their own reputation profile
    public fun create_profile(ctx: &mut TxContext) {
        let profile = ReputationProfile {
            id: object::new(ctx),
            user: ctx.sender(),
            score: 500, // Initial neutral score
            total_interactions: 0,
            last_updated: tx_context::epoch(ctx),
        };

        event::emit(ProfileCreated {
            user: ctx.sender(),
            profile_id: object::uid_to_inner(&profile.id),
        });

        transfer::share_object(profile);
    }

    /// Admin issues an Attestor Capability
    public fun authorize_attestor(
        _admin: &AdminCap,
        protocol_name: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let cap = AttestorCap {
            id: object::new(ctx),
            protocol_name: string::utf8(protocol_name),
        };
        transfer::public_transfer(cap, recipient);
    }

    /// Attestor updates a user's score
    public fun update_reputation(
        cap: &AttestorCap,
        profile: &mut ReputationProfile,
        points: u64,
        positive: bool,
        ctx: &mut TxContext
    ) {
        if (positive) {
            profile.score = profile.score + points;
            if (profile.score > 1000) profile.score = 1000;
        } else {
            if (profile.score > points) {
                profile.score = profile.score - points;
            } else {
                profile.score = 0;
            }
        };

        profile.total_interactions = profile.total_interactions + 1;
        profile.last_updated = tx_context::epoch(ctx);

        event::emit(ScoreUpdated {
            user: profile.user,
            new_score: profile.score,
            protocol: cap.protocol_name,
        });
    }

    // --- Getters ---
    public fun get_score(profile: &ReputationProfile): u64 { profile.score }

    // --- Tests ---
    #[test_only] use sui::test_scenario;

    #[test]
    fun test_reputation_flow() {
        let admin = @0xA;
        let user = @0xB;
        let protocol = @0xC;

        let mut scenario = test_scenario::begin(admin);
        
        {
            init_admin(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            create_profile(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, admin);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            authorize_attestor(&admin_cap, b"Lending Protocol", protocol, test_scenario::ctx(&mut scenario));
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::next_tx(&mut scenario, protocol);
        {
            let mut profile = test_scenario::take_shared<ReputationProfile>(&scenario);
            let attestor_cap = test_scenario::take_from_sender<AttestorCap>(&scenario);
            
            update_reputation(&attestor_cap, &mut profile, 100, true, test_scenario::ctx(&mut scenario));
            
            assert!(get_score(&profile) == 600, 0);

            test_scenario::return_to_sender(&scenario, attestor_cap);
            test_scenario::return_shared(profile);
        };
        test_scenario::end(scenario);
    }
}
