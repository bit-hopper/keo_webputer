// KEO Token - ERC20 Token on Starknet
// A standard ERC20 token contract implementation

use starknet::ContractAddress;

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(
        self: @TContractState, owner: ContractAddress, spender: ContractAddress
    ) -> u256;
    fn transfer(ref self: TContractState, to: ContractAddress, amount: u256) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, amount: u256
    ) -> bool;
}

#[starknet::interface]
pub trait IKEOToken<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
    fn burn(ref self: TContractState, amount: u256);
    fn owner(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
pub mod KEOToken {
    use super::{IERC20, IKEOToken};
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess,
        StorageMapWriteAccess, Map
    };
    use core::num::traits::Zero;

    #[storage]
    struct Storage {
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        total_supply: u256,
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
        Mint: Mint,
        Burn: Burn,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        from: ContractAddress,
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        owner: ContractAddress,
        spender: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Mint {
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Burn {
        from: ContractAddress,
        value: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, initial_supply: u256, recipient: ContractAddress, owner: ContractAddress
    ) {
        self.name.write("KEO");
        self.symbol.write("KEO");
        self.decimals.write(18);
        self.total_supply.write(initial_supply);
        self.balances.write(recipient, initial_supply);
        self.owner.write(owner);

        self
            .emit(
                Transfer {
                    from: Zero::zero(), to: recipient, value: initial_supply
                }
            );
    }

    #[abi(embed_v0)]
    impl ERC20Impl of IERC20<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }

        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress
        ) -> u256 {
            self.allowances.read((owner, spender))
        }

        fn transfer(ref self: ContractState, to: ContractAddress, amount: u256) -> bool {
            let from = get_caller_address();
            assert(from.into() != 0, 'ZERO_ADDRESS_SENDER');
            assert(to.into() != 0, 'ZERO_ADDRESS_RECIPIENT');
            
            let from_balance = self.balances.read(from);
            assert(from_balance >= amount, 'INSUFFICIENT_BALANCE');
            
            self.balances.write(from, from_balance - amount);
            let to_balance = self.balances.read(to);
            self.balances.write(to, to_balance + amount);
            
            self.emit(Transfer { from, to, value: amount });
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            let owner = get_caller_address();
            assert(spender.into() != 0, 'ZERO_ADDRESS_SPENDER');
            
            self.allowances.write((owner, spender), amount);
            self.emit(Approval { owner, spender, value: amount });
            true
        }

        fn transfer_from(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, amount: u256
        ) -> bool {
            let caller = get_caller_address();
            assert(from.into() != 0, 'ZERO_ADDRESS_SENDER');
            assert(to.into() != 0, 'ZERO_ADDRESS_RECIPIENT');
            
            let from_balance = self.balances.read(from);
            assert(from_balance >= amount, 'INSUFFICIENT_BALANCE');
            
            if caller != from {
                let allowed = self.allowances.read((from, caller));
                assert(allowed >= amount, 'INSUFFICIENT_ALLOWANCE');
                self.allowances.write((from, caller), allowed - amount);
            }
            
            self.balances.write(from, from_balance - amount);
            let to_balance = self.balances.read(to);
            self.balances.write(to, to_balance + amount);
            
            self.emit(Transfer { from, to, value: amount });
            true
        }
    }

    #[abi(embed_v0)]
    impl KEOTokenImpl of IKEOToken<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            assert(get_caller_address() == self.owner.read(), 'ONLY_OWNER');
            assert(to.into() != 0, 'ZERO_ADDRESS_RECIPIENT');
            
            let total = self.total_supply.read();
            self.total_supply.write(total + amount);
            
            let balance = self.balances.read(to);
            self.balances.write(to, balance + amount);
            
            self.emit(Mint { to, value: amount });
        }

        fn burn(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            assert(caller.into() != 0, 'ZERO_ADDRESS_SENDER');
            
            let balance = self.balances.read(caller);
            assert(balance >= amount, 'INSUFFICIENT_BALANCE');
            
            self.balances.write(caller, balance - amount);
            
            let total = self.total_supply.read();
            self.total_supply.write(total - amount);
            
            self.emit(Burn { from: caller, value: amount });
        }

        fn owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }
    }
}
