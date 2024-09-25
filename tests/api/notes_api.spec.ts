import {test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, logInUserViaApi, deleteUserViaApi, deleteNoteViaApi, createNoteViaApi, deleteJsonFile } from '../support/commands'
import fs from 'fs'

test.beforeAll(async () => {
    try {fs.unlinkSync(`tests/fixtures/testdata.json`)} catch(err) {throw err}
    //github actions was not finding /fixtures directory (Error: ENOENT: no such file or directory, open 'tests/fixtures/testdata-3042-959203-7852.json'). I believe because it was not part of original playwright structure or because it is empity after test execution. A solution found in stackoverflow was to keep a empity file there to help npm to recognize this directory.
    fs.writeFileSync(`tests/fixtures/testdata.json`,' ', "utf8"); 
});

test.describe('/notes_api', () => {  

    test('Creates a new note via API @API @BASIC @FULL', async ({ request }) => {
        //These first 4 lines code block are always repeating in the /notes suites. I ty to put them in a beforeEach block but they didn't work, because the second argument to bypass paralelism. When I find the time, I'll try to look for a better solution. 
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
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
        fs.writeFileSync(`tests/fixtures/testdata-${randomNumber}.json`,JSON.stringify({
            note_category: responseBodyCN.data.category,
            note_description: responseBodyCN.data.decription,
            note_id: responseBodyCN.data.id,
            note_title: responseBodyCN.data.title,
            user_token: user.user_token           
        }), "utf8"); 
        //This command will be kept for studying purpose only since there is already a deleteUserViaApi() to delete user right away.
        await deleteNoteViaApi(request, randomNumber)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    }) 

    test('Creates a new note via API - bad request @API @FULL @NEGATIVE', async ({ request }) => {
        //These first 4 lines code block are always repeating in the /notes suites. I ty to put them in a beforeEach block but they didn't work, because the second argument to bypass paralelism. When I find the time, I'll try to look for a better solution. 
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
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
                category: 'a',
                description: note.note_description,
                title: note.note_title 
            }
        })
        const responseBodyCN = await responseCN.json() 
        expect(responseBodyCN.message).toEqual('Category must be one of the categories: Home, Work, Personal')
        expect(responseBodyCN.status).toEqual(400)                
        console.log(responseBodyCN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    }) 

    test('Creates a new note via API - unauthorized request @API @FULL @NEGATIVE', async ({ request }) => {
        //These first 4 lines code block are always repeating in the /notes suites. I ty to put them in a beforeEach block but they didn't work, because the second argument to bypass paralelism. When I find the time, I'll try to look for a better solution. 
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_token: body.user_token
        }
        const note = {            
            note_title: faker.word.words(3),
            note_description: faker.word.words(5),
            note_category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        const responseCN = await request.post(`api/notes`, {
            headers: { 'X-Auth-Token': '@'+user.user_token },
            data: {
                category: note.note_category,
                description: note.note_description,
                title: note.note_title 
            }
        })
        const responseBodyCN = await responseCN.json() 
        expect(responseBodyCN.message).toEqual("Access token is not valid or has expired, you will need to login")
        expect(responseBodyCN.status).toEqual(401)                
        console.log(responseBodyCN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    }) 

    test('Get all notes via API @API @BASIC @FULL', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const arrayCategory = [faker.helpers.arrayElement(['Home', 'Work', 'Personal']), 'Home', 'Work', 'Personal']           
        const arrayCompleted = [false, false, false, true]  
        const arrayTitle = [faker.word.words(3), faker.word.words(3), faker.word.words(3), faker.word.words(3)]
        const arrayDescription = [faker.word.words(5), faker.word.words(5), faker.word.words(5), faker.word.words(5)] 
        const arrayNote_id = [0, 0, 0, 0]
        for (let k = 0; k < 4; k++) {
            const responseCNs = await request.post(`api/notes`, {
                headers: { 'X-Auth-Token': user.user_token },
                data: {
                    category: arrayCategory[k],
                    completed: arrayCompleted[k],
                    description: arrayDescription[k],
                    title: arrayTitle[k]
                }
            })
            const responseBodyCNs = await responseCNs.json()
            expect(responseBodyCNs.data.category).toEqual(arrayCategory[k])
            expect(responseBodyCNs.data.completed).toEqual(arrayCompleted[k])
            expect(responseBodyCNs.data.description).toEqual(arrayDescription[k])
            arrayNote_id[k] = responseBodyCNs.data.id  
            expect(responseBodyCNs.data.title).toEqual(arrayTitle[k])
            expect(responseBodyCNs.data.user_id).toEqual(user.user_id)  
            expect(responseBodyCNs.message).toEqual('Note successfully created')
            expect(responseBodyCNs.status).toBe(200)                
            console.log(responseBodyCNs.message)                
        } 
        for (let k = 0; k < 4; k++) {
            const responseGNs = await request.get(`api/notes`, {
                headers: { 'X-Auth-Token': user.user_token }
            })
            const responseBodyGNs = await responseGNs.json()
            expect(responseBodyGNs.data[k].category).toEqual(arrayCategory[3-k])
            expect(responseBodyGNs.data[k].completed).toEqual(arrayCompleted[3-k])
            expect(responseBodyGNs.data[k].description).toEqual(arrayDescription[3-k])
            expect(responseBodyGNs.data[k].id).toEqual(arrayNote_id[3-k])  
            expect(responseBodyGNs.data[k].title).toEqual(arrayTitle[3-k])
            expect(responseBodyGNs.data[k].user_id).toEqual(user.user_id)  
            expect(responseBodyGNs.message).toEqual('Notes successfully retrieved')
            expect(responseBodyGNs.status).toEqual(200)  
            console.log(responseBodyGNs.message)
        } 
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    }) 

    test('Get all notes via API - bad request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const arrayCategory = [faker.helpers.arrayElement(['Home', 'Work', 'Personal']), 'Home', 'Work', 'Personal']           
        const arrayCompleted = [false, false, false, true]  
        const arrayTitle = [faker.word.words(3), faker.word.words(3), faker.word.words(3), faker.word.words(3)]
        const arrayDescription = [faker.word.words(5), faker.word.words(5), faker.word.words(5), faker.word.words(5)] 
        const arrayNote_id = [0, 0, 0, 0]
        for (let k = 0; k < 4; k++) {
            const responseCNs = await request.post(`api/notes`, {
                headers: { 'X-Auth-Token': user.user_token },
                data: {
                    category: arrayCategory[k],
                    completed: arrayCompleted[k],
                    description: arrayDescription[k],
                    title: arrayTitle[k]
                }
            })
            const responseBodyCNs = await responseCNs.json()
            expect(responseBodyCNs.data.category).toEqual(arrayCategory[k])
            expect(responseBodyCNs.data.completed).toEqual(arrayCompleted[k])
            expect(responseBodyCNs.data.description).toEqual(arrayDescription[k])
            arrayNote_id[k] = responseBodyCNs.data.id  
            expect(responseBodyCNs.data.title).toEqual(arrayTitle[k])
            expect(responseBodyCNs.data.user_id).toEqual(user.user_id)  
            expect(responseBodyCNs.message).toEqual('Note successfully created')
            expect(responseBodyCNs.status).toBe(200)                
            console.log(responseBodyCNs.message)                
        } 
        for (let k = 0; k < 4; k++) {
            const responseGNs = await request.get(`api/notes`, {
                headers: { 
                    'X-Auth-Token': user.user_token,
                    'x-content-format': 'badRequest'
                },
            })
            const responseBodyGNs = await responseGNs.json() 
            expect(responseBodyGNs.message).toEqual("Invalid X-Content-Format header, Only application/json is supported.")
            expect(responseBodyGNs.status).toEqual(400)  
            console.log(responseBodyGNs.message)
        } 
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    }) 

    test('Get all notes via API - unauthorized request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const arrayCategory = [faker.helpers.arrayElement(['Home', 'Work', 'Personal']), 'Home', 'Work', 'Personal']           
        const arrayCompleted = [false, false, false, true]  
        const arrayTitle = [faker.word.words(3), faker.word.words(3), faker.word.words(3), faker.word.words(3)]
        const arrayDescription = [faker.word.words(5), faker.word.words(5), faker.word.words(5), faker.word.words(5)] 
        const arrayNote_id = [0, 0, 0, 0]
        for (let k = 0; k < 4; k++) {
            const responseCNs = await request.post(`api/notes`, {
                headers: { 'X-Auth-Token': user.user_token },
                data: {
                    category: arrayCategory[k],
                    completed: arrayCompleted[k],
                    description: arrayDescription[k],
                    title: arrayTitle[k]
                }
            })
            const responseBodyCNs = await responseCNs.json()
            expect(responseBodyCNs.data.category).toEqual(arrayCategory[k])
            expect(responseBodyCNs.data.completed).toEqual(arrayCompleted[k])
            expect(responseBodyCNs.data.description).toEqual(arrayDescription[k])
            arrayNote_id[k] = responseBodyCNs.data.id  
            expect(responseBodyCNs.data.title).toEqual(arrayTitle[k])
            expect(responseBodyCNs.data.user_id).toEqual(user.user_id)  
            expect(responseBodyCNs.message).toEqual('Note successfully created')
            expect(responseBodyCNs.status).toBe(200)                
            console.log(responseBodyCNs.message)                
        } 
        for (let k = 0; k < 4; k++) {
            const responseGNs = await request.get(`api/notes`, {
                headers: { 'X-Auth-Token': '@'+user.user_token },
            })
            const responseBodyGNs = await responseGNs.json() 
            expect(responseBodyGNs.message).toEqual("Access token is not valid or has expired, you will need to login")
            expect(responseBodyGNs.status).toEqual(401)  
            console.log(responseBodyGNs.message)
        } 
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    }) 

    test('Get note by ID via API @API @BASIC @FULL', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const responseGN = await request.get(`api/notes/${note.note_id}`,{
            headers: { 'X-Auth-Token': user.user_token }
        });
        const responseBodyGN = await responseGN.json()
        expect(responseBodyGN.data.category).toEqual(note.note_category)
        expect(responseBodyGN.data.description).toEqual(note.note_description)
        expect(responseBodyGN.data.id).toEqual(note.note_id)
        expect(responseBodyGN.data.title).toEqual(note.note_title)
        expect(responseBodyGN.data.user_id).toEqual(user.user_id)  
        expect(responseBodyGN.message).toEqual('Note successfully retrieved')
        expect(responseBodyGN.status).toEqual(200)  
        console.log(responseBodyGN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Get note by ID via API - bad request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const responseGN = await request.get(`api/notes/${note.note_id}`,{
            headers: { 
                'X-Auth-Token': user.user_token,
                'x-content-format': 'badRequest'
            },
        });
        const responseBodyGN = await responseGN.json()
        expect(responseBodyGN.message).toEqual("Invalid X-Content-Format header, Only application/json is supported.")
        expect(responseBodyGN.status).toEqual(400)  
        console.log(responseBodyGN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Get note by ID via API - unauthorized request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const responseGN = await request.get(`api/notes/${note.note_id}`,{
            headers: { 'X-Auth-Token': '@'+user.user_token },
        });
        const responseBodyGN = await responseGN.json()
        expect(responseBodyGN.message).toEqual("Access token is not valid or has expired, you will need to login")
        expect(responseBodyGN.status).toEqual(401)  
        console.log(responseBodyGN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Update an existing note via API @API @BASIC @FULL', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_completed: faker.helpers.arrayElement([true, false]),
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const updated_note = {
            note_description: faker.word.words(5),
            note_title: faker.word.words(3)
        }
        const responseUN = await request.put(`api/notes/${note.note_id}`, {
            headers: { 'X-Auth-Token': user.user_token },
            data: {
                category: note.note_category,
                completed: note.note_completed,
                description: updated_note.note_description,
                title: updated_note.note_title  
            }
        })
        const responseBodyUN = await responseUN.json()
        expect(responseBodyUN.data.category).toEqual(note.note_category)
        expect(responseBodyUN.data.completed).toEqual(note.note_completed)
        expect(responseBodyUN.data.description).toEqual(updated_note.note_description)
        expect(responseBodyUN.data.description).not.toEqual(note.note_description)
        expect(responseBodyUN.data.id).toEqual(note.note_id)  
        expect(responseBodyUN.data.title).toEqual(updated_note.note_title)
        expect(responseBodyUN.data.title).not.toEqual(note.note_title)
        expect(responseBodyUN.data.user_id).toEqual(user.user_id)  
        expect(responseBodyUN.message).toEqual("Note successfully Updated")
        expect(responseBodyUN.status).toEqual(200)
        console.log(responseBodyUN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Update an existing note via API - bad request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_completed: faker.helpers.arrayElement([true, false]),
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const updated_note = {
            note_description: faker.word.words(5),
            note_title: faker.word.words(3)
        }
        const responseUN = await request.put(`api/notes/${note.note_id}`, {
            headers: { 'X-Auth-Token': user.user_token },
            data: {
                category: 'a',
                completed: note.note_completed,
                description: updated_note.note_description,
                title: updated_note.note_title  
            }
        })
        const responseBodyUN = await responseUN.json() 
        expect(responseBodyUN.message).toEqual('Category must be one of the categories: Home, Work, Personal')
        expect(responseBodyUN.status).toEqual(400)
        console.log(responseBodyUN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Update an existing note via API - unauthorized request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_completed: faker.helpers.arrayElement([true, false]),
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const updated_note = {
            note_description: faker.word.words(5),
            note_title: faker.word.words(3)
        }
        const responseUN = await request.put(`api/notes/${note.note_id}`, {
            headers: { 'X-Auth-Token': '@'+user.user_token },
            data: {
                category: note.note_category,
                completed: note.note_completed,
                description: updated_note.note_description,
                title: updated_note.note_title  
            }
        })
        const responseBodyUN = await responseUN.json() 
        expect(responseBodyUN.message).toEqual("Access token is not valid or has expired, you will need to login")
        expect(responseBodyUN.status).toEqual(401)
        console.log(responseBodyUN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Update the completed status of a note via API @API @BASIC @FULL', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const updated_note_completed = false
        const responseUCSN = await request.patch(`api/notes/${note.note_id}`, {
            headers: { 'X-Auth-Token': user.user_token },
            data: {
                completed: false 
            }
        })
        const responseBodyUCSN = await responseUCSN.json()
        expect(responseBodyUCSN.data.category).toEqual(note.note_category)
        expect(responseBodyUCSN.data.completed).toEqual(updated_note_completed)
        expect(responseBodyUCSN.data.description).toEqual(note.note_description)
        expect(responseBodyUCSN.data.id).toEqual(note.note_id)  
        expect(responseBodyUCSN.data.title).toEqual(note.note_title)
        expect(responseBodyUCSN.data.user_id).toEqual(user.user_id)  
        expect(responseBodyUCSN.message).toEqual("Note successfully Updated")
        expect(responseBodyUCSN.status).toEqual(200)
        console.log(responseBodyUCSN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Update the completed status of a note via API - bad request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const updated_note_completed = false
        const responseUCSN = await request.patch(`api/notes/${note.note_id}`, {
            headers: { 'X-Auth-Token': user.user_token },
            data: {
                completed: 'a'
            }
        })
        const responseBodyUCSN = await responseUCSN.json() 
        expect(responseBodyUCSN.message).toEqual('Note completed status must be boolean')
        expect(responseBodyUCSN.status).toEqual(400)
        console.log(responseBodyUCSN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Update the completed status of a note via API - unauthorized request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const user = {
            user_id: body.user_id,
            user_token: body.user_token
        }
        const note = {
            note_category: body.note_category,
            note_description: body.note_description,
            note_id: body.note_id,
            note_title: body.note_title
        }
        const updated_note_completed = false
        const responseUCSN = await request.patch(`api/notes/${note.note_id}`, {
            headers: { 'X-Auth-Token': '@'+user.user_token },
            data: {
                completed: false 
            }
        })
        const responseBodyUCSN = await responseUCSN.json() 
        expect(responseBodyUCSN.message).toEqual("Access token is not valid or has expired, you will need to login")
        expect(responseBodyUCSN.status).toEqual(401)
        console.log(responseBodyUCSN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })

    test('Delete a note by ID via API @API @BASIC @FULL', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const note_id = body.note_id;
        const user_token = body.user_token
        const responseDN = await request.delete(`api/notes/${note_id}`,{
            headers: { 'X-Auth-Token': user_token }
        })
        const responseBodyDN = await responseDN.json()
        expect(responseBodyDN.message).toEqual('Note successfully deleted')
        expect(responseDN.status()).toEqual(200)
        console.log(responseBodyDN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })
    
    test('Delete a note by ID via API - bad request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const note_id = body.note_id;
        const user_token = body.user_token
        const responseDN = await request.delete(`api/notes/+${2+note_id}`,{
            headers: { 'X-Auth-Token': user_token }
        })
        const responseBodyDN = await responseDN.json()
        expect(responseBodyDN.message).toEqual('Note ID must be a valid ID')
        expect(responseDN.status()).toEqual(400)
        console.log(responseBodyDN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })
    
    test('Delete a note by ID via API - unauthorized request @API @FULL @NEGATIVE', async ({ request }) => {
        const randomNumber = faker.finance.creditCardNumber()          
        await createUserViaApi(request, randomNumber) 
        await logInUserViaApi(request, randomNumber) 
        await createNoteViaApi(request, randomNumber)
        const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${randomNumber}.json`, "utf8"))
        const note_id = body.note_id;
        const user_token = body.user_token
        const responseDN = await request.delete(`api/notes/${note_id}`,{
            headers: { 'X-Auth-Token': '@'+user_token },
        })
        const responseBodyDN = await responseDN.json()
        expect(responseBodyDN.message).toEqual("Access token is not valid or has expired, you will need to login")
        expect(responseDN.status()).toEqual(401)
        console.log(responseBodyDN.message)
        await deleteUserViaApi(request, randomNumber)
        await deleteJsonFile(randomNumber)
    })
    
})