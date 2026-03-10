#!/usr/bin/env node
/**
 * KEO Token Minting Script
 * Mints KEO tokens to a specified address on Starknet Sepolia
 *
 * Usage: node mint-keo.js <recipient_address> <amount> [private_key]
 * Example: node mint-keo.js 0x1234...5678 3.5
 */

// CommonJS version - generates calldata for sncast invoke
const crypto = require("crypto");

// Configuration
const STARKNET_RPC = "https://starknet-sepolia-rpc.publicnode.com/";
const CONTRACT_ADDRESS =
  "0x0664a769efba61a16f939fdfe19eb6aca53197a4cec9b2e5efaf46dbb9d51550";
const CHAIN_ID = "0x534e5f5345504f4c4941"; // SN_SEPOLIA

// KEO Contract ABI (mint function)
const KEO_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "core::starknet::contract_address::ContractAddress" },
      { name: "amount", type: "core::integer::u256" },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "balance_of",
    inputs: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [{ type: "core::integer::u256" }],
    state_mutability: "view",
  },
];

function mintKEO(recipientAddress, amountStr, privateKey) {
  try {
    console.log("🚀 KEO Token Minting Script");
    console.log("═".repeat(50));

    // Parse arguments
    const recipient = recipientAddress.trim();
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Must be a positive number.");
    }

    // Convert amount to u256 (with 18 decimals for ERC20)
    const decimals = 18;
    const amountU256Str = Math.floor(
      amount * Math.pow(10, decimals),
    ).toString();
    const amountU256 = BigInt(amountU256Str);

    // Split u256 into low and high u128 components
    const MAX_U128 = BigInt("340282366920938463463374607431768211455"); // 2^128 - 1
    const lowU128 = amountU256 & MAX_U128;
    const highU128 = amountU256 >> BigInt(128);

    console.log(`\n📋 Minting Details:`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   Amount: ${amount} KEO`);
    console.log(`   Amount (u256): ${amountU256.toString()}`);
    console.log(`   Amount (low u128): ${lowU128.toString()}`);
    console.log(`   Amount (high u128): ${highU128.toString()}`);
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Network: Starknet Sepolia`);
    console.log(`   RPC: ${STARKNET_RPC}\n`);

    console.log("💾 Transaction data (for sncast execution):");
    console.log(`   Function: mint`);
    console.log(`   Recipient: ${recipient}`);
    console.log(
      `   Amount (u256 split): ${lowU128.toString()} ${highU128.toString()}`,
    );
    console.log("\n📊 sncast Command:");
    console.log(`   sncast invoke --network sepolia \\`);
    console.log(`     --contract-address ${CONTRACT_ADDRESS} \\`);
    console.log(`     --function mint \\`);
    console.log(
      `     --calldata ${recipient} ${lowU128.toString()} ${highU128.toString()}`,
    );

    console.log("\n✅ Mint script completed successfully!");
    console.log(`   Next step: Execute the sncast command above.\n`);

    return {
      recipient: recipient,
      amount_keo: amount,
      amount_u256: amountU256.toString(),
      low_u128: lowU128.toString(),
      high_u128: highU128.toString(),
      contract: CONTRACT_ADDRESS,
    };
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.stack) {
      console.error("\n📋 Details:", error.stack);
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: node mint-keo.js <recipient_address> <amount>

Arguments:
  recipient_address  - Starknet address to mint tokens to (0x...)
  amount             - Number of KEO tokens to mint (e.g., 3.5)

Examples:
  node mint-keo.js 0x18eaef8b1ee0f1d44117dbf85d6545084b55f13d6be0bbdc96db193d7c08fbb 3.5
  node mint-keo.js 0x18eaef8b1ee0f1d44117dbf85d6545084b55f13d6be0bbdc96db193d7c08fbb 2.5

Network: Starknet Sepolia
Contract: ${CONTRACT_ADDRESS}
`);
  process.exit(0);
}

const [recipientAddress, amountStr, privateKey] = args;
mintKEO(recipientAddress, amountStr, privateKey);
