import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, deleteUserViaApi, deleteJsonFile, logInUserViaUi, createNoteViaApi } from '../support/commands'
import fs from 'fs'

test.beforeAll(async () => {
    try {fs.unlinkSync(`tests/fixtures/testdata.json`)} catch(err) {throw err}
    fs.writeFileSync(`tests/fixtures/testdata.json`,' ', "utf8"); 
});

test.beforeEach(async ({ page }) => {
    await page.goto('app')
});

test.describe('/notes_ui_and_api', () => { 

    test('Create a new note via UI and API @UI_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
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
        fs.writeFileSync(`tests/fixtures/testdata-${randomNumber}.json`,JSON.stringify({
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
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Create a new note via UI and API - Invalid title @UI_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        const note = {            
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
        await page.locator('input[name="title"]').fill('e')
        await page.locator('textarea[name="description"]').fill(note.description)
        await page.click('button:has-text("Create")') 
        const alertMessage = page.locator(':nth-child(3) > .invalid-feedback')
        await expect(alertMessage).toContainText('Title should be between 4 and 100 characters')        
        await expect(alertMessage).toBeVisible()
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Create a new note via UI and API - Invalid description @UI_AND_API @FULL @NEGATIVE', async ({ page, request }) => {        
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        const note = {            
            title: faker.word.words(3),
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
        await page.locator('textarea[name="description"]').fill('e')
        await page.click('button:has-text("Create")') 
        const alertMessage = page.locator(':nth-child(4) > .invalid-feedback')
        await expect(alertMessage).toContainText('Description should be between 4 and 1000 characters')        
        await expect(alertMessage).toBeVisible()
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Get all notes via UI and API @UI_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {   
            user_email: body.user_email,
            user_id: body.user_id,  
            user_name: body.user_name,
            user_password: body.user_password,
            user_token: body.user_token
        }
        const arrayTitle = [faker.word.words(3), faker.word.words(3), faker.word.words(3), faker.word.words(3)]
        const arrayDescription = [faker.word.words(5), faker.word.words(5), faker.word.words(5), faker.word.words(5)] 
        const arrayCategory = [faker.helpers.arrayElement(['Home', 'Work', 'Personal']), 'Home', 'Work', 'Personal'] 
        for (let k = 0; k < 4; k++) {
            await page.goto('app')
            await page.click('button:has-text("+ Add Note")') 
            await page.locator('input[name="title"]').fill(arrayTitle[k])
            await page.locator('textarea[name="description"]').fill(arrayDescription[k])
            await page.locator('[name="category"]').selectOption(arrayCategory[k])
            await page.click('button:has-text("Create")') 
        } 
        await page.locator(':nth-child(5) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').check()
        const arrayIndex = [2, 3, 4, 5]
        const arrayColor = ['rgb(50, 140, 160)', 'rgb(92, 107, 192)', 'rgb(255, 145, 0)', 'rgba(40, 46, 41, 0.6)'] 
        for (let k = 0; k < 4; k++) {
            const titleIndex = page.locator(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > [data-testid="note-card-title"]')
            await expect(titleIndex).toContainText(arrayTitle[3-k])        
            await expect(titleIndex).toBeVisible()
            const note_updated = await page.locator(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-body > [data-testid="note-card-updated-at"]').innerText();
            const descriptionIndex = page.locator(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-body')
            await expect(descriptionIndex).toContainText(arrayDescription[3-k]+note_updated)        
            await expect(descriptionIndex).toBeVisible()
            const colorIndex = page.locator(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > [data-testid="note-card-title"]')
            await expect(colorIndex).toHaveCSS('background-color', arrayColor[k])
        } 
        await page.locator(':nth-child('+arrayIndex[3]+') > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').check()
        fs.writeFileSync(`tests/fixtures/testdata-${randomNumber}.json`,JSON.stringify({
            note_category_1: arrayCategory[0],
            note_description_1: arrayDescription[0],
            note_title_1: arrayTitle[0],
            note_category_2: arrayCategory[1],
            note_description_2: arrayDescription[1],
            note_title_2: arrayTitle[1],
            note_category_3: arrayCategory[2],
            note_description_3: arrayDescription[2],
            note_title_3: arrayTitle[2],
            note_category_4: arrayCategory[3],
            note_description_4: arrayDescription[3], 
            note_title_4: arrayTitle[3], 
            user_email: user.user_email,
            user_id: user.user_id,
            user_name: user.user_name,
            user_password: user.user_password,
            user_token: user.user_token    
        }), "utf8"); 
        await page.goto('app')
        await page.click('button:has-text("All")') 
        const completedNotes = page.locator('[data-testid="progress-info"]')
        await expect(completedNotes).toContainText('You have 1/4 notes completed in the all categories')        
        //reverse order so we will have all frames in the screen until end of test. 
        for (let k = 0; k < 4; k++) {
            const arrayIndex = [5, 4, 3, 2]
            await page.locator(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click()        
            await page.locator('[data-testid="note-delete-confirm"]').click()
        }
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber) 
    })

    test('Update an existing note via UI and API @UI_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        await createNoteViaApi(request, randomNumber)
        //goto() will show api created note
        await page.goto('app')
        await page.click('button:has-text("Edit")') 
        const note = {            
            title: faker.word.words(3),
            description: faker.word.words(5),
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        await page.locator('[name="category"]').selectOption(note.category)
        await page.locator('[data-testid="note-completed"]').check()
        await page.locator('input[name="title"]').fill(note.title)
        await page.locator('textarea[name="description"]').fill(note.description)
        await page.click('button:has-text("Save")') 
        const noteTitle = page.locator('[data-testid="note-card-title"]')
        await expect(noteTitle).toContainText(note.title)        
        await expect(noteTitle).toBeVisible()
        const noteDescription = page.locator('[data-testid="note-card-description"]')
        await expect(noteDescription).toContainText(note.description)        
        await expect(noteDescription).toBeVisible()
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber)     
    })
    
    test('Update an existing note via UI and API - Invalid title @UI_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        await createNoteViaApi(request, randomNumber)
        //goto() will show api created note
        await page.goto('app')
        await page.click('button:has-text("Edit")') 
        const note = {            
            description: faker.word.words(5),
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        await page.locator('[name="category"]').selectOption(note.category)
        await page.locator('[data-testid="note-completed"]').check()
        await page.locator('input[name="title"]').fill('e')
        await page.locator('textarea[name="description"]').fill(note.description)
        await page.click('button:has-text("Save")') 
        const alertMessage = page.locator(':nth-child(3) > .invalid-feedback')
        await expect(alertMessage).toContainText('Title should be between 4 and 100 characters')        
        await expect(alertMessage).toBeVisible()
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber)     
    })
    
    test('Update an existing note via UI and API - Invalid description @UI_AND_API @FULL @NEGATIVE', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        await createNoteViaApi(request, randomNumber)
        //goto() will show api created note
        await page.goto('app')
        await page.click('button:has-text("Edit")') 
        const note = {           
            title: faker.word.words(3), 
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        await page.locator('[name="category"]').selectOption(note.category)
        await page.locator('[data-testid="note-completed"]').check()
        await page.locator('input[name="title"]').fill(note.title)
        await page.locator('textarea[name="description"]').fill('e')
        await page.click('button:has-text("Save")') 
        const alertMessage = page.locator(':nth-child(4) > .invalid-feedback')
        await expect(alertMessage).toContainText('Description should be between 4 and 1000 characters')        
        await expect(alertMessage).toBeVisible()
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber)     
    })

    test('Update the completed status of a note via UI and API @UI_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        await createNoteViaApi(request, randomNumber)
        //goto() will show api created note
        await page.goto('app')
        await page.click('button:has-text("Edit")') 
        await page.getByTestId('note-completed').click()                
        await page.click('button:has-text("Save")') 
        const noteComplete = page.locator('[data-testid="toggle-note-switch"]')
        await expect(noteComplete).not.toBeChecked() 
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber)     
    })

    test('Delete a note via UI and API @UI_AND_API @BASIC @FULL', async ({ page, request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaUi(page, randomNumber)
        await createNoteViaApi(request, randomNumber)
        //goto() will show api created note
        await page.goto('app')
        await page.locator('[data-testid="note-delete"]').click()     
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const note = {
            note_title: body.note_title
        }
        const noteModal = page.locator('[class="modal-content"]')
        await expect(noteModal).toContainText(note.note_title)
        await page.locator('[data-testid="note-delete-confirm"]').click()        
        await deleteUserViaApi(request, randomNumber) 
        await deleteJsonFile(randomNumber)     
    })
    
})