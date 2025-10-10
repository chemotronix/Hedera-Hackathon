// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


// ERC20 Token for Carbon Credits
contract ChemotronixToken is ERC20 {
    constructor() ERC20("Chemotronix", "CMX") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}

// ERC721 Token for Retirement Certificates
contract ChemotronixCertificate is ERC721URIStorage{
    uint256 public currentTokenId = 1;
    
    constructor() ERC721("Chemotronix Certificate", "CMXC") {}
    
    // Only the project manager contract can mint certificates
    function mintCertificate(address to, string memory tokenURI) external returns (uint256) {
        uint256 tokenId = currentTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        currentTokenId++;
        return tokenId;
    }
}

// Main Contract to Manage Projects and Coordinate Token Operations
contract ChemotronixManager {
    ChemotronixToken public cmxToken;

    ChemotronixCertificate public cmxCertificate;
    
    mapping(string => uint256) public projectBalance;

    mapping(string => uint256) public projectRetiredCredits;

    mapping(address => mapping(string => uint256)) public personalProjectBalance;

    mapping(string => bool) public verifiedProjects;

    uint256 public totalRetiredCredits;
    
    // Events
    event projectVerified(string projectId);
    event creditsMinted(address indexed to, string projectId, uint256 amount);
    event creditsTransferred(address indexed from, address indexed to, string projectId, uint256 amount);
    event creditsRetired(address indexed by, string projectId, uint256 amount, uint256 certificateId);
    
    constructor() {
        cmxToken = new ChemotronixToken();
        cmxCertificate = new ChemotronixCertificate();
    }
    
    modifier onlyVerifiedProject(string memory projectId) {
        require(verifiedProjects[projectId], "Project not verified");
        _;
    }
    
    function verifyProject(string memory projectId) public {
        verifiedProjects[projectId] = true;
        emit projectVerified(projectId);
    }
    
    function mintNewToken(string memory projectId, uint256 amount) public onlyVerifiedProject(projectId) {
        cmxToken.mint(msg.sender, amount);
        projectBalance[projectId] += amount;
        personalProjectBalance[msg.sender][projectId] += amount;
        emit creditsMinted(msg.sender, projectId, amount);
    }

    // function transferCredits(string memory projectId, address to, uint256 amount) public onlyVerifiedProject(projectId) {
    //     cmxToken.transfer(to, amount);
    //     personalProjectBalance[msg.sender][projectId] -= amount;
    //     personalProjectBalance[to][projectId] += amount;
    //     emit creditsTransferred(msg.sender, to, projectId, amount);
    // }

    function transferCredits(
    string memory projectId,
    address to,
    uint256 amount
    ) public onlyVerifiedProject(projectId) {
        cmxToken.transferFrom(msg.sender, to, amount); 
        personalProjectBalance[msg.sender][projectId] -= amount;
        personalProjectBalance[to][projectId] += amount;
        emit creditsTransferred(msg.sender, to, projectId, amount);
    }


    // function transferCredits(string memory projectId, address to, uint256 amount)
    // public
    // onlyVerifiedProject(projectId) returns(bool)
    // {
    //     //require(personalProjectBalance[msg.sender][projectId] >= amount, "Insufficient project balance");
    //     cmxToken.transfer(to, amount);

    //     // projectBalance[projectId] -= amount;
    //     // personalProjectBalance[msg.sender][projectId] -= amount;
    //     // personalProjectBalance[to][projectId] += amount;

    //     emit creditsTransferred(msg.sender, to, projectId, amount);
    // }
    
    function retireCredits(string memory projectId, uint256 amount, string memory tokenURI) public onlyVerifiedProject(projectId) returns (uint256) {
        cmxToken.burn(msg.sender, amount);        
        personalProjectBalance[msg.sender][projectId] -= amount;
        projectBalance[projectId] -= amount;
        projectRetiredCredits[projectId] += amount;
        totalRetiredCredits += amount;
        
        // Mint a retirement certificate
        uint256 certificateId = cmxCertificate.mintCertificate(msg.sender, tokenURI);
        emit creditsRetired(msg.sender, projectId, amount, certificateId);
        return certificateId;
    }
    
    function getPersonalProjectBalance(string memory projectId) public view onlyVerifiedProject(projectId) returns (uint256) {
        return personalProjectBalance[msg.sender][projectId];
    }
    
    function getProjectRetiredCredits(string memory projectId) public view onlyVerifiedProject(projectId) returns (uint256) {
        return projectRetiredCredits[projectId];
    }
    
    function getTotalRetiredCredits() public view returns (uint256) {
        return totalRetiredCredits;
    }

    function getProjectBalance(string memory projectId) public view onlyVerifiedProject(projectId) returns (uint256) {
        return projectBalance[projectId];
    }

//     function transferCredits(string memory projectId, address to, uint256 amount)
//     public
//     onlyVerifiedProject(projectId)
// {
//     require(personalProjectBalance[msg.sender][projectId] >= amount, "Insufficient project balance");
//     require(cmxToken.transfer(to, amount), "Token transfer failed");

//     personalProjectBalance[msg.sender][projectId] -= amount;
//     personalProjectBalance[to][projectId] += amount;

//     emit CreditsTransferred(msg.sender, to, projectId, amount);
// }
}
