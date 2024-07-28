import {test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, deleteJsonFile, getFullFilledResponseCU, logInUserViaUi, deleteUserViaUi } from '../support/commands'
import fs from 'fs'

test.beforeAll(async () => {
    try {fs.unlinkSync(`tests/fixtures/testdata.json`)} catch(err) {throw err}
    fs.writeFileSync(`tests/fixtures/testdata.json`,' ', "utf8"); 
});

test.beforeEach(async ({ page }) => {
    await page.goto('app')
});

test.describe('/users_api', () => {  

    test('Creates a new user account via UI', async ({ page }) => {
        const bypassParalelismNumber = faker.finance.creditCardNumber()  
        const user = {
            user_name: faker.person.fullName(), 
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            user_email: faker.internet.exampleEmail().toLowerCase(),
            user_password: faker.internet.password({ length: 8 })
        }
        await page.goto('app/register')
        await page.getByTestId('register-email').fill(user.user_email)
        await page.getByTestId('register-name').fill(user.user_name)
        await page.getByTestId('register-password').fill(user.user_password)
        await page.getByTestId('register-confirm-password').fill(user.user_password)
        //Intercept to get user id and be able to use it in login custom command.
        const responsePromise = getFullFilledResponseCU(page)
        await page.click('button:has-text("Register")')
        const response = await responsePromise
        const responseBody = await response.json()
        // console.log(responseBody)
        await expect(page).toHaveTitle('Notes React Application for Automation Testing Practice')
        const userRegistered = page.locator('b')
        await expect(userRegistered).toContainText('User account created successfully')        
        await expect(userRegistered).toBeVisible() 
        fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
            user_email: user.user_email,
            user_id: responseBody.data.id,
            user_name: user.user_name,                
            user_password: user.user_password        
        }), "utf8"); 
        // console.log(user_id)   
        await logInUserViaUi(page, bypassParalelismNumber)
        await deleteUserViaUi(page)
        await deleteJsonFile(bypassParalelismNumber)

    })

})