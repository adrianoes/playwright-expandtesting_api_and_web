import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { deleteJsonFile, logInUserViaUi, deleteUserViaUi, createUserViaUi, deleteNoteViaUi, createNoteViaUi } from '../support/commands'
import fs from 'fs'

test.beforeAll(async () => {
    try {fs.unlinkSync(`tests/fixtures/testdata.json`)} catch(err) {throw err}
    fs.writeFileSync(`tests/fixtures/testdata.json`,' ', "utf8"); 
});

test.beforeEach(async ({ page }) => {
    await page.goto('app')
});

test.describe('/notes_ui', () => {  

    test('Create a new note via UI', async ({ page }) => {
        //Playwright fails to recognize bypassParalelismNumber constant when it is inputed in beforeEach hook
        const bypassParalelismNumber = faker.finance.creditCardNumber()
        await createUserViaUi(page, bypassParalelismNumber)
        await logInUserViaUi(page, bypassParalelismNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
        const user = {
            user_email: body.user_email,
            user_id: body.user_id,
            user_name: body.user_name,
            user_password: body.user_password
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
        }), "utf8"); 
        // deleteNoteViaUi custom command has no use since we are able to delete the user account at once. However, we will keep it here for learning purposes. 
        await deleteNoteViaUi(page, bypassParalelismNumber)
        await deleteUserViaUi(page)
        await deleteJsonFile(bypassParalelismNumber)
    })

    test('Delete a note via UI', async ({ page }) => {
        const bypassParalelismNumber = faker.finance.creditCardNumber()
        await createUserViaUi(page, bypassParalelismNumber)
        await logInUserViaUi(page, bypassParalelismNumber)
        await createNoteViaUi(page, bypassParalelismNumber)
        await page.locator('[data-testid="note-delete"]').click()     
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
        const note = {
            note_title: body.note_title
        }
        const noteModal = page.locator('[class="modal-content"]')
        await expect(noteModal).toContainText(note.note_title)
        await page.locator('[data-testid="note-delete-confirm"]').click() 
        await deleteUserViaUi(page)
        await deleteJsonFile(bypassParalelismNumber)
    })

})