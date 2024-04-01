import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
const MANAGEMENT_URL = process.env.MAIN_SERVICE_URL ;


@Injectable()
export class ManagementSeedService {

    constructor(private httpService: HttpService){}


    async seed(token: string){
        const options = {
            headers: {
                'Authorization': token
            }
        }
        const url = `${MANAGEMENT_URL}/seed-all`;
        await this.httpService.post(url, {}, options).toPromise();
    }    
}
