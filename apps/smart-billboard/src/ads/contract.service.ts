/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { AdsBoard__factory } from '../../../../ethereum/typechain/factories/AdsBoard__factory';
import { AdStatusDto } from './dto/ad-status.dto';

/*
        snippet to catch events:
        contract.on('AdPurchased', (author, path, duration) => {
            console.log(`Ad purchased! ${author} ${path} ${duration}`);
        });

        snipper to get all events:

        const eventsFilter = contract.filters.AdPurchased();
        const events = await contract.queryFilter(eventsFilter);
        console.log(events);

        return events.map(evt => {
            return { sender: evt.args.author, path: evt.args.path, duration: evt.args.duration.toNumber() };
        })

 */

@Injectable()
export class ContractService {
    private readonly ethProvider: ethers.providers.JsonRpcProvider;
    private readonly signer: ethers.Signer;
    private readonly contract: ethers.Contract;

    constructor(private readonly configService: ConfigService) {
        const rpcUrl = configService.get<string>('ETHEREUM_URL');
        const adBoardContractAddress = configService.get<string>('ADSBOARD_CONTRACT'); // 0x5FbDB2315678afecb367f032d93F642f64180aa3

        this.ethProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        this.signer = this.ethProvider.getSigner();

        const factory = new AdsBoard__factory(this.signer);
        this.contract = new ethers.Contract(adBoardContractAddress,
            factory.interface,
            this.signer);

        console.log('Initializing ContractService');
        console.log(`-- using adboard contract address: ${this.contract.address}`);

        this.signer.getAddress().then((addr) => {
            console.log(`-- using account: ${addr}`);
        }, (err) => {
            console.log(`RPC CONNECTION FAILED, ${err}`);
        })
    }

    async buyAd(imageHash: string, adDurationSeconds: number): Promise<number> {
        console.log(`imageHash = ${imageHash}`)
        //TODO i will remove it after some checks
        //const x = Buffer.from(imageHash, 'base64')
        //console.log(`x = ${x}`)
        //var arrByte = Uint8Array.from(x)
        //console.log(`arrByte = ${arrByte}`)
        const buffer = Buffer.from(imageHash, 'hex')
        console.log(`buffer = ${buffer}`)
        console.log(`buffer.buffer = ${buffer.buffer}`)
        const possibleNewId = await this.contract.callStatic.buyAd(imageHash, adDurationSeconds)
        await this.contract.buyAd(imageHash, adDurationSeconds);

        console.log(`BuyAd on blockchain is complete, resulting id: ${possibleNewId.toNumber()} (PROBABLY)`);
        return possibleNewId.toNumber();
    }

    async getAdStatus(id: number): Promise<AdStatusDto> {
        const ad = await this.contract.getAd(id);
        const resultId: number = ad.id.toNumber();

        if (resultId == 0) {
            throw new NotFoundException();
        }

        return {
            id: resultId,
            author: ad.author,
            duration: ad.duration.toNumber(),
            path: ad.path + ad.imageHash,
            isDisplayed: ad.isDisplayed
        };
    }

    private base64ToArrayBuffer(base64): Buffer {
        //nary data should be performed using `Buffer.from(str, 'base64')` and`buf.toString('base64')`.**
        var x = Buffer.from(base64, 'base64')
        return x
    }
}
