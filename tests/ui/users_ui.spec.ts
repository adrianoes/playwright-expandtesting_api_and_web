import {test, expect, Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, logInUserViaApi, deleteUserViaApi, deleteJsonFile, getFullFilledResponse } from '../support/commands'
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
        const responsePromise = getFullFilledResponse(page)
        await page.click('button:has-text("Register")')
        const response = await responsePromise
        const responseBody = await response.json()
        console.log(responseBody)

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
        fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
            user_email: user.user_email,
            user_id: responseBody.data.id,
            user_name: user.user_name,                
            user_password: user.user_password        
        }), "utf8"); 
        // console.log(user_id)   

        await page.goto('app/login')
        await page.getByTestId('login-email').fill(user.user_email)
        await page.getByTestId('login-password').fill(user.user_password)
        await page.click('button:has-text("Login")')




        // cy.createUserViaUi()
        // cy.readFile('cypress/fixtures/ui.json').then(response => {
        //     const user = {
        //         user_email: response.user_email,
        //         user_id: response.user_id,
        //         user_name: response.user_name,
        //         user_password: response.user_password
        //     }         
        //     cy.visit(baseAppUrl + '/login')
        //     cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        //     cy.get('input[name="email"]').click().type(user.user_email)
        //     cy.get('input[name="password"]').click().type(user.user_password)
        //     //API validation can be done using intercept(). I'm not sure if it is needed here.
        //     cy.intercept('/notes/api/users/login').as('loginFormAndToken')
        //     cy.contains('button', 'Login').click()
        //     cy.get('input[placeholder="Search notes..."]').should('be.visible')
        //     cy.wait('@loginFormAndToken').then(({response}) => {
        //         cy.visit(baseAppUrl + '/profile')
        //         cy.get('[data-testid="user-email"]').should('have.value', user.user_email).should('be.visible')
        //         cy.get('[data-testid="user-id"]').should('have.value', user.user_id).should('be.visible')
        //         cy.get('[data-testid="user-name"]').should('have.value', user.user_name).should('be.visible')
        //         expect(response.body.message).to.eq('Login successful')
        //         expect(response.statusCode).to.eq(200)
        //         cy.writeFile('cypress/fixtures/ui.json', {
        //             "user_id": user.user_id,
        //             "user_email": user.user_email,
        //             "user_name": user.user_name,
        //             "user_password": user.user_password,
        //             "user_token": response.body.data.token
        //         })
        //     })
        // })
        // cy.deleteUserViaUi()  

        // cy.createUserViaUi()
        // cy.logInUserViaUi()
        // cy.visit(baseAppUrl + '/profile')
        // cy.contains('button', 'Delete Account').click()
        // cy.get('[data-testid="note-delete-confirm"]').click()
        // cy.get('[data-testid="alert-message"]').contains('Your account has been deleted. You should create a new account to continue.').should('be.visible')

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