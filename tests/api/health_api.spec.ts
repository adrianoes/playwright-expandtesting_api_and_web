import { test, expect } from '@playwright/test';

test.describe('/health_api', ()=> {

    test('Check the healt of the API Notes services via API @API @BASIC @FULL', async ({ request }) =>{
        const responseCH = await request.get(`api/health-check`);
        const responseBodyCH = await responseCH.json()
        expect(responseBodyCH.message).toEqual('Notes API is Running')
        expect(responseCH.status()).toEqual(200)    
        console.log(responseBodyCH.message)
    })
    
})