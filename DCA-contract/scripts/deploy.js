//Import ethers from Hardhat package
const { ethers } = require("hardhat");

async function main() {
  //Call the main function and catch if there is any error
  /*
A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
so nftContract here is a factory for instances of our GameItem contract. 
*/
  const finalProject = await ethers.getContractFactory("FinalProject");
  const SWAPROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  // here we deploy the contract
  // 172, 800 for 2 days,
  const deployedfinalProject = await finalProject.deploy(
    "172800",
    SWAPROUTER_ADDRESS
  );

  // wait for the contract to deploy
  await deployedfinalProject.deployed();

  //print the address of the deployed contract
  console.log("FinalProject Contract Address:", deployedfinalProject.address);
}

//Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
