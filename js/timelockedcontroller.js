import pkg from "https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.10.1/dist/index.umd.js/+esm"
//import pkg from "https://esm.run/@walletconnect/ethereum-provider@2.9.0/dist/index.umd.js"
let ethereumProvider = undefined;
const projectId = 'bc177d1cc47f9d2a8b8de0ac8f0ac14d';
if (projectId === 'YOUR_PROJECT_ID') {
  throw new Error("You need to provide a project ID");
}

var currentAddr;
var networkID = 0;
var web3 = null;
var tempWeb3 = null;

var stakingFlex = null;
var stakingLocked = null;
var stakingLPSS = null;
var stakingLPUni = null;
var stakingLPUniV3 = null;

//wPAW
var tokenWPAW = null;
var stakingFlexWPAW = null;

var timeLockedControl = null;


function toPlainString(num) {
    return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
      function(a,b,c,d,e) {
        return e < 0
          ? b + '0.' + Array(1-e-c.length).join(0) + c + d
          : b + c + d + Array(e-d.length+1).join(0);
      });
}


window.addEventListener('load', () => {

    $('#address').text(ADDRESS_TIME_LOCKED_CONTROLLER);
    
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("https://api.coingecko.com/api/v3/coins/ethereum/contract/0xDc63269eA166b70d4780b3A11F5C825C2b761B01", requestOptions)
    .then(response => response.json())
    .then(result => {
        $("#token-price").text("$" + toPlainString(result.market_data.current_price.usd))
        console.log("$" + toPlainString(result.market_data.current_price.usd));
    })
    .catch(error => console.log('error', error));

    //Reset
    currentAddr = null;
    web3 = null;
    tempWeb3 = null;


    stakingFlex = null;
    stakingLocked = null;
    stakingLPSS = null;
    stakingLPUni = null;
    stakingLPUniV3 = null;

    tokenWPAW = null;
    stakingFlexWPAW = null;

    timeLockedControl = null;

    //ConnectEthereumWallet();
})


async function initContracts() {

    stakingFlex = await new web3.eth.Contract(ABI_STAKE_FLEX, ADDRESS_STAKE_FLEX);
    stakingLocked = await new web3.eth.Contract(ABI_STAKE_LOCK, ADDRESS_STAKE_LOCK);
    stakingLPSS = await new web3.eth.Contract(ABI_STAKE_LPSS, ADDRESS_STAKE_LPSS);
    stakingLPUni = await new web3.eth.Contract(ABI_STAKE_LPUNIV2, ADDRESS_STAKE_LPUNIV2);
    stakingLPUniV3 = await new web3.eth.Contract(ABI_STAKE_LPUNIV3, ADDRESS_STAKE_LPUNIV3);

    tokenWPAW = await new web3.eth.Contract(ABI_ERC20, ADDRESS_WPAW);
    stakingFlexWPAW = await new web3.eth.Contract(ABI_STAKE_FLEX, ADDRESS_STAKE_WPAW_FLEX);

    timeLockedControl = await new web3.eth.Contract(ABI_TIME_LOCKED_CONTROLLER, ADDRESS_TIME_LOCKED_CONTROLLER);
}

async function ConnectEthereumWallet() {
    if (window.ethereum) {
        tempWeb3 = new Web3(window.ethereum)
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            let accounts = await window.ethereum.request({ method: 'eth_accounts' })
            currentAddr = accounts[0]
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
            window.ethereum.on('accountsChanged', function(accounts) {
                window.location.reload();
            })
            runAPP()
            return
        } catch (error) {
            console.error(error)
        }
    }
}


async function runAPP() {
    networkID = await tempWeb3.eth.net.getId()
    if (networkID == NETID) {

        web3 = tempWeb3;

        await initContracts();

        await getCurrentWallet();
        //localStorage.setItem("logout", "false");

        //flexpaw
        $("#btn-connect1").css("display", "none");
        $("#select-contract").css("display", "block");

        update();
    } else {
      $("#btn-connect").text("Wrong network!");

      if (window.ethereum) {
          const data = [{ chainId: '0x1', }];
          /* eslint-disable */
          const tx = await window.ethereum.request({ method: 'wallet_addEthereumChain', params: data }).catch()
          if (tx) {
              console.log(tx)
          }
      }
    }
}


$("#btn-connect-metamask").click(() => {
  if (window.ethereum) {
      ConnectEthereumWallet();
  } else {
      swal("Oops", "Please install Metamask first!");
  }
})

$("#btn-connect-trust").click(() => {
  if (window.ethereum) {
      ConnectEthereumWallet();
  } else {
    swal("Oops", "Please install Trust wallet and open the website on Trust -> Browser!");
  }
})


$("#btn-connect-wlconnect").click(async() => {
    if (!ethereumProvider) {
        ethereumProvider = await pkg.EthereumProvider.init({
          projectId,
          showQrModal: true,
          qrModalOptions: { themeMode: "light" },
          chains: [1],
          methods: ["eth_sendTransaction", "personal_sign"],
          events: ["chainChanged", "accountsChanged"],
        });
  
        // 6. Set up connection listener
        ethereumProvider.on("connect", () =>
          console.info(ethereumProvider.accounts)
        );
        /*
        ethereumProvider.on("chainChanged", (chainId) => {
            window.location.reload();
        });
      
        ethereumProvider.on("accountsChanged", (chainId) => {
            window.location.reload();
        });
      
        ethereumProvider.on("disconnect", (code, reason) => {
            console.log(code, reason);
            window.location.reload();
        });
        */
    }
    await ethereumProvider.connect();
    tempWeb3 = new Web3(ethereumProvider);
    runAPP()
})


async function getCurrentWallet() {
  const accounts = await web3.eth.getAccounts();
  if(accounts.length > 0){
      currentAddr = accounts[0];
      var connectedAddr = currentAddr[0] + currentAddr[1] + currentAddr[2] + currentAddr[3] + '...' + currentAddr[currentAddr.length - 4] + currentAddr[currentAddr.length - 3] + currentAddr[currentAddr.length - 2] + currentAddr[currentAddr.length - 1]
      $("#btn-connect").text(connectedAddr);
      $("#btn-connect").prop("disabled", true);
  }
}


function update() {
    // Do nothing
}



$("#btn-status").click(() => {
    var functionId = parseInt($("#select-functions").val());
    if(functionId == 1){
        approveWPAW(1);
    }else if(functionId == 2){
        addRewardWPAW(1);
    }else if(functionId == 3){
        updateAPY(1);
    }else if(functionId == 4){
        withdrawReward(1);
    }else if(functionId == 5){
        transferOwner(1);
    }else if(functionId == 6){
        addNewStakingAddress(1);
    }else if(functionId == 7){
        removeStakingAddress(1);
    }else if(functionId == 8){
        
    }

})

$("#btn-schedule").click(() => {
    //cmd = 2
    var functionId = parseInt($("#select-functions").val());
    if(functionId == 1){
        approveWPAW(2);
    }else if(functionId == 2){
        addRewardWPAW(2);
    }else if(functionId == 3){
        updateAPY(2);
    }else if(functionId == 4){
        withdrawReward(2);
    }else if(functionId == 5){
        transferOwner(2);
    }else if(functionId == 6){
        addNewStakingAddress(2);
    }else if(functionId == 7){
        removeStakingAddress(2);
    }else if(functionId == 8){
        
    }

})

$("#btn-execute").click(() => {
    //cmd = 2
    var functionId = parseInt($("#select-functions").val());
    if(functionId == 1){
        approveWPAW(3);
    }else if(functionId == 2){
        addRewardWPAW(3);
    }else if(functionId == 3){
        updateAPY(3);
    }else if(functionId == 4){
        withdrawReward(3);
    }else if(functionId == 5){
        transferOwner(3);
    }else if(functionId == 6){
        addNewStakingAddress(3);
    }else if(functionId == 7){
        removeStakingAddress(3);
    }else if(functionId == 8){
        
    }

})

$("#btn-cancel").click(() => {
    var functionId = parseInt($("#select-functions").val());
    if(functionId == 1){
        approveWPAW(4);
    }else if(functionId == 2){
        addRewardWPAW(4);
    }else if(functionId == 3){
        updateAPY(4);
    }else if(functionId == 4){
        withdrawReward(4);
    }else if(functionId == 5){
        transferOwner(4);
    }else if(functionId == 6){
        addNewStakingAddress(4);
    }else if(functionId == 7){
        removeStakingAddress(4);
    }else if(functionId == 8){
        
    }
})



function getContract(){
    switch($("#select-contract").val()){
        case '1':
            return stakingFlex;
        case '2':
            return stakingLocked;
        case '3':
            return stakingLPSS;
        case '4':
            return stakingLPUni;
        case '5':
            return stakingLPUniV3;
        case '6':
            return stakingFlexWPAW;
        default:
            return null;
    }
}

/*
    function schedule(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt, uint256 delay)
    function execute( address target, uint256 value, bytes calldata payload, bytes32 predecessor, bytes32 salt)
    function hashOperation( address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt)
    function getOperationState(bytes32 id)
    function cancel(bytes32 id)
*/

/* 1: get status, 2: schedule, 3 execute, 4 cancel*/
function approveWPAW(command){
    if($("#approve-amount").val() == 0){
        swal("Oops", "Please check input amount!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }
    var approve = tokenWPAW.methods.approve(getContract().options.address, $("#approve-amount").val());
    var approveABI = approve.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(ADDRESS_WPAW, 0, approveABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    }) 
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(ADDRESS_WPAW, 0, approveABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(ADDRESS_WPAW, 0, approveABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(ADDRESS_WPAW, 0, approveABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cacnel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
}

function addRewardWPAW(command){
    if($("#add-amount").val() == 0){
        swal("Oops", "Please check input amount!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }

    // REAL
    var addReward = getContract().methods.addRewardTreasure($("#add-amount").val());
    var addRewardABI = addReward.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, addRewardABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    }) 
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(getContract().options.address, 0, addRewardABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(getContract().options.address, 0, addRewardABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, addRewardABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cancel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
}

function updateAPY(command){
    if($("#new-apy").val() == 0){
        swal("Oops", "Please check input amount!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }

    var updateAPY = getContract().methods.updateNewAPY($("#new-apy").val());
    var updateAPYABI = updateAPY.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, updateAPYABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    }) 
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(getContract().options.address, 0, updateAPYABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(getContract().options.address, 0, updateAPYABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, updateAPYABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cancel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
}

function withdrawReward(command){
    if($("#withdraw-amount").val() == 0){
        swal("Oops", "Please check input amount!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }

    var withdraw = getContract().methods.emergencyRewardWithdraw($("#withdraw-amount").val());
    var withdrawABI = withdraw.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, withdrawABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    })   
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(getContract().options.address, 0, withdrawABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(getContract().options.address, 0, withdrawABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, withdrawABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cancel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
} 

function transferOwner(command){
    if($("#new-owner").val() == ''){
        swal("Oops", "Please check new owner address!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }

    var owner = getContract().methods.transferOwnership($("#new-owner").val());
    var ownerABI = owner.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, ownerABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Waiting cold-down');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    }) 
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(getContract().options.address, 0, ownerABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(getContract().options.address, 0, ownerABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, ownerABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cancel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
} 

function addNewStakingAddress(command){
    if($("#new-stakingadd").val() == ''){
        swal("Oops", "Please check new main staking address!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }

    var addNewStaking = getContract().methods.addToListMainStakingAddress($("#new-stakingadd").val());
    var addNewStakingABI = addNewStaking.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, addNewStakingABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Waiting cold-down');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    }) 
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(getContract().options.address, 0, addNewStakingABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(getContract().options.address, 0, addNewStakingABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, addNewStakingABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cancel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
}

function removeStakingAddress(command){
    if($("#remove-stakingadd").val() == ''){
        swal("Oops", "Please check new main staking address!");
        return;
    }
    if(command == 2){
        if($("#delay").val() < MIN_DELAY){
            swal("Oops", "Please check delay time!");
            return;
        }
    }

    var removeMainStaking = getContract().methods.removeFromListMainStakingAddress($("#remove-stakingadd").val());
    var removeMainStakingABI = removeMainStaking.encodeABI();

    if(command == 1){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, removeMainStakingABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.getOperationState(id).call().then(status => {
                console.log("Status of " + id + "    is " + status);
                if(status == 0){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'block');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Unset, ready to schedule');   
                }else if(status == 1){
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Waiting cold-down');
                    timeLockedControl.methods.getTimestamp(id).call().then(unlockTimeStamp => {
                        var unlockDate = new Date(unlockTimeStamp * 1000);
                        var hour = unlockDate.getHours();
                        var min = unlockDate.getMinutes();
                        var date = unlockDate.getDate();
                        var month = unlockDate.getMonth() + 1;
                        var year = unlockDate.getFullYear();
                        $('#status').text('Waiting cold-down till ' + date + "/" + month + "/" + year + " - " + hour + ":" + min);
                    }) 
                }else if(status == 2) {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'block');
                    $('#btn-cancel').css('display', 'block');
                    $('#status').text('Ready to execute');   
                }else {
                    $('#btn-status').css('display', 'block');
                    $('#btn-schedule').css('display', 'none');
                    $('#btn-execute').css('display', 'none');
                    $('#btn-cancel').css('display', 'none');
                    $('#status').text('Done, command was executed.');   
                }
            });
        });
    }else if(command == 2){
        timeLockedControl.methods.schedule(getContract().options.address, 0, removeMainStakingABI, web3.utils.toHex(0), web3.utils.toHex(0), $("#delay").val()).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 3){
        timeLockedControl.methods.execute(getContract().options.address, 0, removeMainStakingABI, web3.utils.toHex(0), web3.utils.toHex(0)).send({
            value: 0,
            from: currentAddr,
        })
    }else if(command == 4){
        timeLockedControl.methods.hashOperation(getContract().options.address, 0, removeMainStakingABI, web3.utils.toHex(0), web3.utils.toHex(0)).call().then(id => {
            timeLockedControl.methods.cancel(id).send({
                value: 0,
                from: currentAddr,
            })
        });
    }
} 



function clearAllInput() {
    $('#approve-amount').val('');
    $('#add-amount').val('');
    $('#new-apy').val('');
    $('#withdraw-amount').val('');
    $('#new-owner').val('');


    $('#approve-wpaw').css('display', 'none');
    $('#add-wpaw').css('display', 'none');
    $('#update-apy').css('display', 'none');
    $('#withdraw-reward').css('display', 'none');
    $('#transfer-owner').css('display', 'none');
    $('#delay').css('display', 'none');
    $('#actions').css('display', 'none');
    $('#status').text('Status of command');
}

function requireGetStatus(){
    $('#btn-status').css('display', 'block');
    $('#btn-schedule').css('display', 'none');
    $('#btn-execute').css('display', 'none');
    $('#btn-cancel').css('display', 'none');
}


$("#select-contract").change(() => {
    clearAllInput();
    $("#select-functions").val('0');
    $('#select-functions').css('display', 'block');

    $('#select-functions1').css('display', 'block');
    $('#select-functions2').css('display', 'block');
    $('#select-functions3').css('display', 'block');
    $('#select-functions4').css('display', 'block');
    $('#select-functions5').css('display', 'block');
    $('#select-functions6').css('display', 'block');
    $('#select-functions7').css('display', 'block');

    var currentContract = $("#select-contract").val();
    if(currentContract == '1' ||currentContract == '2' ||currentContract == '3' ||currentContract == '4' ||currentContract == '5'){
        $('#select-functions6').css('display', 'none');
        $('#select-functions7').css('display', 'none');
    }
    if(currentContract == '3' ||currentContract == '4' ||currentContract == '5'){
        $('#select-functions3').css('display', 'none');
    }
})


$("#select-functions").change(() => {
    clearAllInput();
    $('#actions').css('display', 'block');
    requireGetStatus();
    console.log($("#select-functions").val())
    switch ($("#select-functions").val()) {
        case '1': 
            $('#approve-wpaw').css('display', 'block');
            break;
        case '2': 
            $('#add-wpaw').css('display', 'block');
            break;
        case '3': 
            $('#update-apy').css('display', 'block');
            break;
        case '4': 
            $('#withdraw-reward').css('display', 'block');
            break;
        case '5': 
            $('#transfer-owner').css('display', 'block');
            break;
        case '6': 
            $('#add-mainstaking').css('display', 'block');
            break;
        case '7': 
            $('#remove-mainstaking').css('display', 'block');
            break; 
            //removeFromListMainStakingAddress
        default:
            break;
    }

    $('#delay').css('display', 'block');

})

$("#approve-amount").change(() => {
    requireGetStatus();
})

$("#add-amount").change(() => {
    requireGetStatus();
})

$("#new-apy").change(() => {
    requireGetStatus();
})

$("#new-stakingadd").change(() => {
    requireGetStatus();
})

$("#new-owner").change(() => {
    requireGetStatus();
})

$("#new-stakingadd").change(() => {
    requireGetStatus();
})

$("#remove-stakingadd").change(() => {
    requireGetStatus();
})
