// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ChemotronixManager} from "../src/carboncredit.sol";

contract ChemotronixScript is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("OPERATOR_KEY");
        vm.startBroadcast(deployerPrivateKey);
        //address deployerAddress = vm.addr(deployerPrivateKey);
        ChemotronixManager chemotronix = new ChemotronixManager();
        vm.stopBroadcast();
        console.log("Contract deployed to:", address(chemotronix));
        return address(chemotronix);
    }
}

//forge script script/chemotronix.s.sol:ChemotronixScript --rpc-url testnet --broadcast

