import { test, expect } from '@playwright/test';

test.describe('/health_api', ()=> {
    test('Check the healt of the API Notes services via API', async ({ request }) =>{
        const response = await request.get(`api/health-check`);
        const responseBody = await response.json()
        expect(responseBody.message).toEqual('Notes API is Running')
        expect(response.status()).toEqual(200)    
        console.log(responseBody.message)
    })
})