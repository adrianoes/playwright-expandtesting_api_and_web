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

export async function getFullFilledResponse(page: Page) {
    return page.waitForResponse('/notes/api/users/register')
}

// export async function logInUserViaUi(bypassParalelismNumber: string) {
//     const body = JSON.parse(fs.readFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`, "utf8"))
//     const user = {
//         user_email: body.user_email,
//         user_id: body.user_id,
//         user_name: body.user_name,
//         user_password: body.user_password
//     }
 
//     fs.writeFileSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`,JSON.stringify({
//         user_email: user.user_email,
//         user_id: user.user_id,
//         user_name: user.user_name,
//         user_password: user.user_password,
//         user_token: responseBodyLU.data.token
//     }), "utf8");
// }

export async function deleteJsonFile(bypassParalelismNumber: string) {
    try {fs.unlinkSync(`tests/fixtures/testdata-${bypassParalelismNumber}.json`)} catch(err) {throw err}
}





