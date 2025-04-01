import {test, expect } from '@playwright/test'

test.describe('/health_web', () => {   

    test('Check the healt of the app website via WEB @WEB @BASIC @FULL', async ({ page }) =>{
        await page.goto('app')
        await expect(page).toHaveTitle('Notes React Application for Automation Testing Practice')
        const locator = page.locator('.fw-bold')
        await expect(locator).toHaveText('Welcome to Notes App')
        await expect(locator).toBeVisible()    
    }) 
    
})









