ucefkh@MSI:~/projects/hackathons/suiDefiAgent/sui_rwa$ sui client publish --gas-budget 100000000 --skip-dependency-verification
[NOTE] Dependencies on Sui, MoveStdlib, Bridge, DeepBook, and SuiSystem are automatically added, but this feature is disabled for your package because you have explicitly included dependencies on Sui. Consider removing these dependencies from `Move.toml`.
INCLUDING DEPENDENCY MoveStdlib
INCLUDING DEPENDENCY Sui
BUILDING sui_rwa
Transaction Digest: 9LusTS5wQc3LdCoAUmZ416eDUDv1DbbATw7QKB7CPfqY
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Transaction Data                                                                                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Sender: 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669                                   │
│ Gas Owner: 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669                                │
│ Gas Budget: 100000000 MIST                                                                                   │
│ Gas Price: 550 MIST                                                                                          │
│ Gas Payment:                                                                                                 │
│  ┌──                                                                                                         │
│  │ ID: 0xd277feea9a075b4fc64ca28d440a69750afead526897c97f30f7cdfe83229175                                    │
│  │ Version: 792384077                                                                                        │
│  │ Digest: Ex4GJHZnAR7aErFKygeQy2WfjDgXoqJeBQTnxYc9EPJN                                                      │
│  └──                                                                                                         │
│                                                                                                              │
│ Transaction Kind: Programmable                                                                               │
│ ╭──────────────────────────────────────────────────────────────────────────────────────────────────────────╮ │
│ │ Input Objects                                                                                            │ │
│ ├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ 0   Pure Arg: Type: address, Value: "0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669" │ │
│ ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────╯ │
│ ╭─────────────────────────────────────────────────────────────────────────╮                                  │
│ │ Commands                                                                │                                  │
│ ├─────────────────────────────────────────────────────────────────────────┤                                  │
│ │ 0  Publish:                                                             │                                  │
│ │  ┌                                                                      │                                  │
│ │  │ Dependencies:                                                        │                                  │
│ │  │   0x0000000000000000000000000000000000000000000000000000000000000001 │                                  │
│ │  │   0x0000000000000000000000000000000000000000000000000000000000000002 │                                  │
│ │  └                                                                      │                                  │
│ │                                                                         │                                  │
│ │ 1  TransferObjects:                                                     │                                  │
│ │  ┌                                                                      │                                  │
│ │  │ Arguments:                                                           │                                  │
│ │  │   Result 0                                                           │                                  │
│ │  │ Address: Input  0                                                    │                                  │
│ │  └                                                                      │                                  │
│ ╰─────────────────────────────────────────────────────────────────────────╯                                  │
│                                                                                                              │
│ Signatures:                                                                                                  │
│    EQ5o1qcivJuKuOlCi2MVvlFr1XOTlhX2yXJEOrjmVoS5JkGa1o702yFd/NUlIRjsplRbyBQvkqw12Isanzm6Aw==                  │
│                                                                                                              │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Transaction Effects                                                                               │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Digest: 9LusTS5wQc3LdCoAUmZ416eDUDv1DbbATw7QKB7CPfqY                                              │
│ Status: Success                                                                                   │
│ Executed Epoch: 1042                                                                              │
│                                                                                                   │
│ Created Objects:                                                                                  │
│  ┌──                                                                                              │
│  │ ID: 0x1a4b6931cb1be21d5fc8445b00e10add496e5c56729ff938cec39fd4f65ad56d                         │
│  │ Owner: Account Address ( 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669 )  │
│  │ Version: 792384078                                                                             │
│  │ Digest: 8wJRmdHtya4jBeAmxCc4x97CTepUJKKrJbkady4p7xaK                                           │
│  └──                                                                                              │
│  ┌──                                                                                              │
│  │ ID: 0x33bd2f7e8b9032625fb2647bc840eeed71e4c2e7fa8a3f2b65d869a2472fc710                         │
│  │ Owner: Immutable                                                                               │
│  │ Version: 1                                                                                     │
│  │ Digest: D7E6U8rAnMjt1hHxKj2wjAjvAfxfnA3Xm9MEscjKFpxw                                           │
│  └──                                                                                              │
│ Mutated Objects:                                                                                  │
│  ┌──                                                                                              │
│  │ ID: 0xd277feea9a075b4fc64ca28d440a69750afead526897c97f30f7cdfe83229175                         │
│  │ Owner: Account Address ( 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669 )  │
│  │ Version: 792384078                                                                             │
│  │ Digest: 7n9SMfbL6xB9rLPS2MU8wuTt7AngAaugrEceSofY1kGU                                           │
│  └──                                                                                              │
│ Gas Object:                                                                                       │
│  ┌──                                                                                              │
│  │ ID: 0xd277feea9a075b4fc64ca28d440a69750afead526897c97f30f7cdfe83229175                         │
│  │ Owner: Account Address ( 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669 )  │
│  │ Version: 792384078                                                                             │
│  │ Digest: 7n9SMfbL6xB9rLPS2MU8wuTt7AngAaugrEceSofY1kGU                                           │
│  └──                                                                                              │
│ Gas Cost Summary:                                                                                 │
│    Storage Cost: 14242400 MIST                                                                    │
│    Computation Cost: 550000 MIST                                                                  │
│    Storage Rebate: 978120 MIST                                                                    │
│    Non-refundable Storage Fee: 9880 MIST                                                          │
│                                                                                                   │
│ Transaction Dependencies:                                                                         │
│    4yd1s4WdPMaYyUWbUef8UWeECZxv8GTCRbrcLiH4xxJj                                                   │
│    7jiEfzJ5ZCREDe2TJhWMxo81TkQmHjidUDhssaJfAdic                                                   │
│    FnD1aPTyr7b2cPfEuhRvUvfianx5DMc5uY71dn1vnA9g                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                                                 │
│  ┌──                                                                                             │
│  │ ObjectID: 0x1a4b6931cb1be21d5fc8445b00e10add496e5c56729ff938cec39fd4f65ad56d                  │
│  │ Sender: 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669                    │
│  │ Owner: Account Address ( 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669 ) │
│  │ ObjectType: 0x2::package::UpgradeCap                                                          │
│  │ Version: 792384078                                                                            │
│  │ Digest: 8wJRmdHtya4jBeAmxCc4x97CTepUJKKrJbkady4p7xaK                                          │
│  └──                                                                                             │
│ Mutated Objects:                                                                                 │
│  ┌──                                                                                             │
│  │ ObjectID: 0xd277feea9a075b4fc64ca28d440a69750afead526897c97f30f7cdfe83229175                  │
│  │ Sender: 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669                    │
│  │ Owner: Account Address ( 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669 ) │
│  │ ObjectType: 0x2::coin::Coin<0x2::sui::SUI>                                                    │
│  │ Version: 792384078                                                                            │
│  │ Digest: 7n9SMfbL6xB9rLPS2MU8wuTt7AngAaugrEceSofY1kGU                                          │
│  └──                                                                                             │
│ Published Objects:                                                                               │
│  ┌──                                                                                             │
│  │ PackageID: 0x33bd2f7e8b9032625fb2647bc840eeed71e4c2e7fa8a3f2b65d869a2472fc710                 │
│  │ Version: 1                                                                                    │
│  │ Digest: D7E6U8rAnMjt1hHxKj2wjAjvAfxfnA3Xm9MEscjKFpxw                                          │
│  │ Modules: rwa_nft                                                                              │
│  └──                                                                                             │
╰──────────────────────────────────────────────────────────────────────────────────────────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Balance Changes                                                                                   │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──                                                                                              │
│  │ Owner: Account Address ( 0x70f703094e887862884a35f62f8f234773cdd20a1e923b652132bc145de84669 )  │
│  │ CoinType: 0x2::sui::SUI                                                                        │
│  │ Amount: -13814280                                                                              │
│  └──                                                                                              │
╰──────────────────────────────────────────────────────────────────────────