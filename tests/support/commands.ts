import { APIRequestContext, expect, Page } from '@playwright/test'
import { faker } from '@faker-js/faker'
import fs from 'fs'

export async function logInUserViaApi(request: APIRequestContext, bypassParalelismNumber: string) {
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
    const user = {
        user_email: body.user_email,
        user_id: body.user_id,
        user_name: body.user_name,
        user_password: body.user_password
    }
    const responseLU = await request.post(`api/users/login`, {
        data: {
            email: user.user_email,
            password: user.user_password
        }
    });
    const responseBodyLU = await responseLU.json()
    expect(responseBodyLU.data.email).toEqual(user.user_email)
    expect(responseBodyLU.data.id).toEqual(user.user_id)
    expect(responseBodyLU.data.name).toEqual(user.user_name) 
    expect(responseBodyLU.message).toEqual('Login successful')
    expect(responseLU.status()).toEqual(200)    
    console.log(responseBodyLU.message)   
    fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
        user_email: user.user_email,
        user_id: user.user_id,
        user_name: user.user_name,
        user_password: user.user_password,
        user_token: responseBodyLU.data.token
    }), "utf8");
}

export async function deleteUserViaApi(request: APIRequestContext, bypassParalelismNumber: string) {
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
    const user_token = body.user_token
    const responseDU = await request.delete(`api/users/delete-account`,{
        headers: { 'X-Auth-Token': user_token }
    })
    const responseBodyDU = await responseDU.json()
    expect(responseBodyDU.message).toEqual('Account successfully deleted')
    expect(responseDU.status()).toEqual(200)
    console.log(responseBodyDU.message)
}

export async function createUserViaApi(request: APIRequestContext, bypassParalelismNumber: string) {
    const user = {            
        //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
        user_email: faker.internet.exampleEmail().toLowerCase(),
        user_name: faker.person.fullName(), 
        user_password: faker.internet.password({ length: 8 })
    }
    const responseCU = await request.post(`api/users/register`, {
        data: {
            name: user.user_name,
            email: user.user_email,
            password: user.user_password
        }
    });
    const responseBodyCU = await responseCU.json()
    expect(responseBodyCU.data.email).toEqual(user.user_email)
    expect(responseBodyCU.data.name).toEqual(user.user_name) 
    expect(responseBodyCU.message).toEqual('User account created successfully')
    expect(responseCU.status()).toEqual(201)    
    console.log(responseBodyCU.message)   
    fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
        user_email: user.user_email,
        user_id:responseBodyCU.data.id,
        user_name: user.user_name,                
        user_password: user.user_password            
    }), "utf8"); 
}

export async function deleteNoteViaApi(request: APIRequestContext, bypassParalelismNumber: string) {
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
    const note_id = body.note_id;
    const user_token = body.user_token
    const responseDN = await request.delete(`api/notes/${note_id}`,{
        headers: { 'X-Auth-Token': user_token }
    })
    const responseBodyDN = await responseDN.json()
    expect(responseBodyDN.message).toEqual('Note successfully deleted')
    expect(responseDN.status()).toEqual(200)
    console.log(responseBodyDN.message)
}

export async function createNoteViaApi(request: APIRequestContext, bypassParalelismNumber: string) {
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
    const user = {
        user_id: body.user_id,
        user_token: body.user_token
    }
    const note = {            
        note_title: faker.word.words(3),
        note_description: faker.word.words(5),
        note_category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
    }
    const responseCN = await request.post(`api/notes`, {
        headers: { 'X-Auth-Token': user.user_token },
        data: {
            category: note.note_category,
            description: note.note_description,
            title: note.note_title 
        }
    })
    const responseBodyCN = await responseCN.json()
    expect(responseBodyCN.data.category).toEqual(note.note_category)
    expect(responseBodyCN.data.description).toEqual(note.note_description)
    expect(responseBodyCN.data.title).toEqual(note.note_title)
    expect(responseBodyCN.data.user_id).toEqual(user.user_id)  
    expect(responseBodyCN.message).toEqual('Note successfully created')
    expect(responseBodyCN.status).toEqual(200)                
    console.log(responseBodyCN.message)
    fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
        note_category: responseBodyCN.data.category,
        note_description: responseBodyCN.data.description,
        note_id: responseBodyCN.data.id,
        note_title: responseBodyCN.data.title,
        user_id: user.user_id,
        user_token: user.user_token           
    }), "utf8"); 
}

export async function getFullFilledResponseCU(page: Page) {
    return page.waitForResponse('/notes/api/users/register')
}

export async function getFullFilledResponseLogIn(page: Page) {
    return page.waitForResponse('/notes/api/users/login')
}

export async function logInUserViaUi(page: Page, bypassParalelismNumber: string) {
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
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
    fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
        user_email: user.user_email,
        user_id: user.user_id,
        user_name: user.user_name,
        user_password: user.user_password,
        user_token: responseBody.data.token
    }), "utf8");
}

export async function deleteJsonFile(bypassParalelismNumber: string) {
    try {fs.unlinkSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`)} catch(err) {throw err}
}

export async function deleteUserViaUi(page: Page) {
    await page.goto('app/profile')
    await page.click('button:has-text("Delete Account")')     
    await page.getByTestId('note-delete-confirm').click() 
    const alertMessage = page.getByTestId('alert-message')
    await expect(alertMessage).toContainText('Your account has been deleted. You should create a new account to continue.')        
    await expect(alertMessage).toBeVisible()
}

export async function createUserViaUi(page: Page, bypassParalelismNumber: string) {
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
}

export async function deleteNoteViaUi(page: Page, bypassParalelismNumber: string) {
    await page.locator('[data-testid="note-delete"]').click()     
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
    const note = {
        note_title: body.note_title
    }
    const noteModal = page.locator('[class="modal-content"]')
    await expect(noteModal).toContainText(note.note_title)
    await page.locator('[data-testid="note-delete-confirm"]').click()  
}

export async function createNoteViaUi(page: Page, bypassParalelismNumber: string) {
    const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
    const user = {
        user_email: body.user_email,
        user_id: body.user_id,
        user_name: body.user_name,
        user_password: body.user_password,
        //Here, there is the need to also read the token, so we will be able to use furter api custom commands
        user_token: body.user_token
    }
    const note = {            
        title: faker.word.words(3),
        description: faker.word.words(5),
        category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
        completed: faker.number.int({ min: 1, max: 2 })
    }
    await page.goto('app/')
    await page.click('button:has-text("+ Add Note")') 
    await page.locator('[name="category"]').selectOption(note.category)
    //Playwright has no support for click(n times), so we create a for with max random limit
    for (let k = 0; k < note.completed; k++) {
        await page.getByTestId('note-completed').click()                
    } 
    await page.locator('input[name="title"]').fill(note.title)
    await page.locator('textarea[name="description"]').fill(note.description)
    await page.click('button:has-text("Create")') 
    const noteTitle = page.locator('[data-testid="note-card-title"]')
    await expect(noteTitle).toContainText(note.title)        
    await expect(noteTitle).toBeVisible()
    const noteDescription = page.locator('[data-testid="note-card-description"]')
    await expect(noteDescription).toContainText(note.description)        
    await expect(noteDescription).toBeVisible()
    await page.locator('[data-testid="toggle-note-switch"]').check()
    await page.locator('[data-testid="note-view"]').click() 
    const noteCardTitle = page.locator('[data-testid="note-card-title"]')
    await expect(noteCardTitle).toContainText(note.title)        
    await expect(noteCardTitle).toBeVisible()
    const noteCardDescription = page.locator('[data-testid="note-card-description"]')
    await expect(noteCardDescription).toContainText(note.description)        
    await expect(noteCardDescription).toBeVisible()
    await page.locator('[data-testid="toggle-note-switch"]').isChecked()
    //To get rid of the iframe, reload() was used here
    await page.reload()
    const url = page.url()
    const note_id = url.replace(/^([https://practice.expandtesting.com/notes/app/notes/]*)/g, '')
    // console.log(note_id)
    fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
        note_id: note_id,
        note_category: note.category,
        note_completed: note.completed,
        note_description: note.description,
        note_title: note.title,
        user_email: user.user_email,
        user_id: user.user_id,
        user_name: user.user_name,                
        user_password: user.user_password,  
        user_token: user.user_token     
    }), "utf8"); 
}
