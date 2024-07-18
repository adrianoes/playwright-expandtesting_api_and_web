import {test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, logInUserViaApi, deleteUserViaApi, deleteJsonFile } from '../support/commands'
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
            name: faker.person.fullName(), 
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            email: faker.internet.exampleEmail().toLowerCase(),
            password: faker.internet.password({ length: 8 })
        }
        const createAnAccount = page.locator('[href="/notes/app/register"]')
        await expect(createAnAccount).toHaveText('Create an account')
        await expect(createAnAccount).toBeVisible() 
        await createAnAccount.click()
        await expect(page).toHaveTitle('Notes React Application for Automation Testing Practice')
   
        await page.getByTestId('register-email').fill(user.email)
        await page.getByTestId('register-name').fill(user.name)
        await page.getByTestId('register-password').fill(user.password)
        await page.getByTestId('register-confirm-password').fill(user.password)
        // cy.intercept('/notes/api/users/register').as('loginForm')
        // const register = page.locator('data-testid="register-submit"')
        await page.click('button:has-text("Register")')
        // await expect(register).toBeVisible() 
        await expect(page).toHaveTitle('Notes React Application for Automation Testing Practice')
        const userRegistered = page.locator('b')
        await expect(userRegistered).toContainText('User account created successfully')        
        await expect(userRegistered).toBeVisible() 
        const login = page.locator('[href="/notes/app/login"]')
        await expect(login).toHaveText('Click here to Log In')
        await expect(login).toBeVisible()  
        await page.getByTestId('login-view').click()
        await expect(page).toHaveTitle('Notes React Application for Automation Testing Practice')
        const loginPage = page.locator('h1')
        await expect(loginPage).toHaveText('Login')
        await expect(loginPage).toBeVisible() 
        
        // cy.wait('@loginForm').then(({response}) => {
        //     expect(response.body.message).to.eq('User account created successfully')
        //     expect(response.statusCode).to.eq(201)
        //     cy.writeFile('cypress/fixtures/ui.json', {
        //         "user_email": user.email,
        //         "user_name": user.name,
        //         "user_password": user.password,
        //         "user_id": response.body.data.id
        //     })
        // })
        // cy.logInUserViaUi()
        // cy.deleteUserViaUi()






    })




})