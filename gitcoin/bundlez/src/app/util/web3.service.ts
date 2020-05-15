import { Injectable } from "@angular/core";
const contract = require("@truffle/contract");
import { Subject } from "rxjs";
declare let require: any;
const Web3 = require("web3");

declare let window: any;

@Injectable()
export class Web3Service {
  public web3: any;
  private accounts: string[];
  public ready = false;

  public accountsObservable = new Subject<string[]>();

  constructor() {
    // window.addEventListener('load', (event) => {
    //   this.bootstrapWeb3();
    // });
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          this.web3.eth.sendTransaction({
            /* ... */
            // from: '0x847c48907dd173D5b12A532B86c1Ab7523bAb594',
            // to: '0x33E08c90f78FFC613f898D5EB85C549BfbA71952',
            // value: '1000000000000000000'
          });
        } catch (error) {
          // User denied account access...
          console.log("Cannot send the transaction");
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(this.web3.currentProvider);
        // Acccounts always exposed
        this.web3.eth.sendTransaction({
          /* ... */
        });
      }
      // Non-dapp browsers...
      else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    });
    setInterval(() => this.refreshAccounts(), 5000);
  }

  // public bootstrapWeb3() {
  //   // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  //   if (typeof window.web3 !== 'undefined') {
  //     // Use Mist/MetaMask's provider
  //     this.web3 = new Web3(window.web3.currentProvider);
  //     console.log(' web3 MetaMask!');
  //   } else {
  //     console.log('No web3? You should consider trying MetaMask!');

  //     // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
  //     Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
  //     // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  //     this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  //   }

  //   setInterval(() => this.refreshAccounts(), 5000);
  // }

  public async artifactsToContract(artifacts) {
    if (!window.web3) {
      const delay = new Promise((resolve) => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(window.web3.currentProvider);
    return contractAbstraction;
  }

  private refreshAccounts() {
    window.web3.eth.getAccounts((err, accs) => {
      console.log("Refreshing accounts");
      if (err != null) {
        console.warn("There was an error fetching your accounts.");
        return;
      }
      console.log("accounts : ");
      console.log(accs);
      // console.log(window.web3.eth.getBalance(accs[0]));
      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn(
          "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        );
        return;
      }

      if (
        !this.accounts ||
        this.accounts.length !== accs.length ||
        this.accounts[0] !== accs[0]
      ) {
        console.log("Observed new accounts");

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
// private async refreshAccounts() {
//   var accounts = await this.web3.eth.getAccounts();
//   console.log(accounts);
//}
