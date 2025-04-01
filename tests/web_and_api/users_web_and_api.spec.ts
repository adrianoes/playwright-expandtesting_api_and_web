import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, logInUserViaApi, deleteUserViaApi, deleteJsonFile, getFullFilledResponseCU, getFullFilledResponseLogIn, logInUserViaWeb } from '../support/commands'
import fs from 'fs'

test.beforeAll(async () => {
    try {fs.unlinkSync(`tests/fixtures/testdata.json`)} catch(err) {throw err}
    fs.writeFileSync(`tests/fixtures/testdata.json`,' ', "utf8"); 
});

test.beforeEach(async ({ page }) => {
    await page.goto('app')
});

test.describe('/users_web_and_api', () => { 

    test('Creates a new user account via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()  
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
        fs.writeFileSync(`tests/fixtures/testdata-${randomNumber}.json`,JSON.stringify({
            user_email: user.user_email,
            user_id: responseBody.data.id,
            user_name: user.user_name,                
            user_password: user.user_password        
        }), "utf8"); 
        // console.log(user_id)   
        await logInUserViaApi(request, randomNumber) 
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Log in as an existing user via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()  
        await createUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_email: body.user_email,
            user_id: body.user_id,
            user_name: body.user_name,
            user_password: body.user_password
        }
        await page.goto('app/login')
        await page.getByTestId('login-email').fill(user.user_email)
        await page.getByTestId('login-password').fill(user.user_password)
        const responsePromise = getFullFilledResponseLogIn(page)
        await page.click('button:has-text("Login")') 
        const response = await responsePromise
        const responseBody = await response.json()
        await page.goto('app/profile')
        const userEmail = page.locator('[data-testid="user-email"]')
        await expect(userEmail).toHaveValue(user.user_email)        
        await expect(userEmail).toBeVisible()
        const userId = page.locator('[data-testid="user-id"]')
        await expect(userId).toHaveValue(user.user_id)        
        await expect(userId).toBeVisible()
        const userName = page.locator('[data-testid="user-name"]')
        await expect(userName).toHaveValue(user.user_name)        
        await expect(userName).toBeVisible()    
        fs.writeFileSync(`tests/fixtures/testdata-${randomNumber}.json`,JSON.stringify({
            user_email: user.user_email,
            user_id: user.user_id,
            user_name: user.user_name,
            user_password: user.user_password,
            user_token: responseBody.data.token
        }), "utf8");
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Log in as an existing user via WEB and API - Wrong password @WEB_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()  
        await createUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_email: body.user_email,
            user_id: body.user_id,
            user_name: body.user_name,
            user_password: body.user_password
        }
        await page.goto('app/login')
        await page.getByTestId('login-email').fill(user.user_email)
        await page.getByTestId('login-password').fill('e'+user.user_password)
        await page.click('button:has-text("Login")') 
        const alertMessage = page.locator('[data-testid="alert-message"]')
        await expect(alertMessage).toContainText('Incorrect email address or password')        
        await expect(alertMessage).toBeVisible()
        await logInUserViaApi(request, randomNumber)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Log in as an existing user via WEB and API - Invalid e-mail @WEB_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()  
        await createUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_email: body.user_email,
            user_id: body.user_id,
            user_name: body.user_name,
            user_password: body.user_password
        }
        await page.goto('app/login')
        await page.getByTestId('login-email').fill('e'+user.user_email)
        await page.getByTestId('login-password').fill(user.user_password)
        await page.click('button:has-text("Login")') 
        const alertMessage = page.locator('[data-testid="alert-message"]')
        await expect(alertMessage).toContainText('Incorrect email address or password')        
        await expect(alertMessage).toBeVisible()
        await logInUserViaApi(request, randomNumber)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Retrieve user profile information via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await page.goto('app/profile')
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Update user profile information via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber) 
        await page.goto('app/profile')
        await page.locator('input[name="phone"]').fill(faker.string.numeric({ length: 12 }))
        await page.locator('input[name="company"]').fill(faker.internet.userName())
        await page.click('button:has-text("Update profile")') 
        const profileUpdated = page.locator('[data-testid="alert-message"]')
        await expect(profileUpdated).toContainText('Profile updated successful')        
        await expect(profileUpdated).toBeVisible()         
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Update user profile information via WEB and API - Invalid company name @WEB_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber) 
        await page.goto('app/profile')
        await page.locator('input[name="phone"]').fill(faker.string.numeric({ length: 12 }))
        await page.locator('input[name="company"]').fill('e')
        await page.click('button:has-text("Update profile")') 
        const alertMessage = page.locator('.mb-4 > .invalid-feedback')
        await expect(alertMessage).toContainText('company name should be between 4 and 30 characters')        
        await expect(alertMessage).toBeVisible()         
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Update user profile information via WEB and API - Invalid phone number @WEB_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber) 
        await page.goto('app/profile')
        await page.locator('input[name="phone"]').fill(faker.string.numeric({ length: 2 }))
        await page.locator('input[name="company"]').fill(faker.internet.userName())
        await page.click('button:has-text("Update profile")') 
        const alertMessage = page.locator(':nth-child(2) > .mb-2 > .invalid-feedback')
        await expect(alertMessage).toContainText('Phone number should be between 8 and 20 digits')        
        await expect(alertMessage).toBeVisible()         
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Change a user\'s password via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber)  
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_password: body.user_password,
            new_password: faker.internet.password({ length: 8 })
        }
        await page.goto('app/profile')
        await page.click('button:has-text("Change password")')
        await page.getByTestId('current-password').fill(user.user_password)
        await page.getByTestId('new-password').fill(user.new_password)
        await page.getByTestId('confirm-password').fill(user.new_password)
        await page.click('button:has-text("Update password")')
        const passwordChanged = page.locator('[data-testid="alert-message"]')
        await expect(passwordChanged).toContainText('The password was successfully updated')        
        await expect(passwordChanged).toBeVisible()        
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Change a user\'s password via WEB and API - Type same password @WEB_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber)  
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_password: body.user_password
        }
        await page.goto('app/profile')
        await page.click('button:has-text("Change password")')
        await page.getByTestId('current-password').fill(user.user_password)
        await page.getByTestId('new-password').fill(user.user_password)
        await page.getByTestId('confirm-password').fill(user.user_password)
        await page.click('button:has-text("Update password")')
        const alertMessage = page.locator('[data-testid="alert-message"]')
        await expect(alertMessage).toContainText('The new password should be different from the current password')        
        await expect(alertMessage).toBeVisible()        
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Log out a user via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber) 
        await page.click('button:has-text("Logout")')
        const logout = page.locator('[href="/notes/app/login"]')
        await expect(logout).toContainText('Login')        
        await expect(logout).toBeVisible()
        await logInUserViaApi(request, randomNumber)
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Delete user account via WEB and API @WEB_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaWeb(page, randomNumber)  
        await page.goto('app/profile')
        await page.click('button:has-text("Delete Account")')     
        await page.getByTestId('note-delete-confirm').click() 
        const alertMessage = page.getByTestId('alert-message')
        await expect(alertMessage).toContainText('Your account has been deleted. You should create a new account to continue.')        
        await expect(alertMessage).toBeVisible() 
        await deleteJsonFile(randomNumber) 
    })

})