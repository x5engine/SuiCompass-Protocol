module suicompass::flash_loan {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;

    /// Error: Loan not repaid correctly
    const ELoanRepaymentFailed: u64 = 0;

    /// The Flash Loan Pool
    public struct FlashLender has key {
        id: UID,
        balance: Balance<SUI>,
        fee_bps: u64,
    }

    /// The "Receipt" or "Hot Potato" that must be returned to repay the loan
    public struct LoanReceipt {
        amount: u64,
        fee: u64,
    }

    // --- Events ---
    public struct LoanTaken has copy, drop {
        borrower: address,
        amount: u64,
        fee: u64,
    }

    // --- Functions ---

    /// Initialize a Flash Lender pool
    public fun create_lender(payment: Coin<SUI>, ctx: &mut TxContext) {
        let lender = FlashLender {
            id: object::new(ctx),
            balance: coin::into_balance(payment),
            fee_bps: 5,
        };
        transfer::share_object(lender);
    }

    /// Borrow funds (Flash Loan)
    public fun borrow(
        lender: &mut FlashLender, 
        amount: u64, 
        ctx: &mut TxContext
    ): (Coin<SUI>, LoanReceipt) {
        let loan_balance = balance::split(&mut lender.balance, amount);
        let loan_coin = coin::from_balance(loan_balance, ctx);

        let fee = (amount * lender.fee_bps) / 10000;

        event::emit(LoanTaken {
            borrower: ctx.sender(),
            amount,
            fee,
        });

        let receipt = LoanReceipt { amount, fee };
        (loan_coin, receipt)
    }

    /// Repay the loan
    public fun repay(
        lender: &mut FlashLender, 
        payment: Coin<SUI>, 
        receipt: LoanReceipt
    ) {
        let LoanReceipt { amount, fee } = receipt;
        let repayment_amount = coin::value(&payment);

        assert!(repayment_amount >= amount + fee, ELoanRepaymentFailed);

        balance::join(&mut lender.balance, coin::into_balance(payment));
    }

    // --- Tests ---
    #[test_only] use sui::test_scenario;
    
    #[test]
    fun test_flash_loan_cycle() {
        let admin = @0xA;
        let borrower = @0xB;
        
        let mut scenario = test_scenario::begin(admin);
        
        {
            let ctx = test_scenario::ctx(&mut scenario);
            let init_funds = coin::mint_for_testing<SUI>(100000, ctx);
            create_lender(init_funds, ctx);
        };

        test_scenario::next_tx(&mut scenario, borrower);
        {
            let mut lender = test_scenario::take_shared<FlashLender>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // 1. Borrow
            let (mut loan_coin, receipt) = borrow(&mut lender, 10000, ctx);
            
            // 2. Perform Trade (Simulated: Add profit)
            let profit_coin = coin::mint_for_testing<SUI>(100, ctx);
            coin::join(&mut loan_coin, profit_coin);
            
            // 3. Repay
            let repayment_amount = receipt.amount + receipt.fee;
            let repayment_coin = coin::split(&mut loan_coin, repayment_amount, ctx);
            repay(&mut lender, repayment_coin, receipt);
            
            // 4. Verify Profit
            assert!(coin::value(&loan_coin) == 95, 0); // 100 profit - 5 fee
            
            transfer::public_transfer(loan_coin, borrower);
            test_scenario::return_shared(lender);
        };

        test_scenario::end(scenario);
    }
}
