import {test, expect } from '@playwright/test'

test.describe('/users_api', () => {   

    test('Check the healt of the app website via UI', async ({ page }) =>{
        await page.goto('app')
        await expect(page).toHaveTitle('Notes React Application for Automation Testing Practice')
        const locator = page.locator('.fw-bold');
        await expect(locator).toHaveText('Welcome to Notes App');
        await expect(locator).toBeVisible()    
    }) 
})









