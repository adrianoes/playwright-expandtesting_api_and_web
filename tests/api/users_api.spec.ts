import {test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createUserViaApi, logInUserViaApi, deleteUserViaApi } from '../support/commands'
import fs from 'fs'


test.afterEach(async () => {
    fs.writeFileSync('tests/fixtures/testdata.json', (''), "utf8");
});

test.describe('/users_api', () => {   

    test('Creates a new user account via API', async ({ request }) => {
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
        fs.writeFileSync('tests/fixtures/testdata.json',JSON.stringify({
            user_email: user.user_email,
            user_id:responseBodyCU.data.id,
            user_name: user.user_name,                
            user_password: user.user_password            
        }), "utf8"); 
        await logInUserViaApi(request) 
        await deleteUserViaApi(request)
    })

    test('Log in as an existing user via API', async ({ request }) => {
        await createUserViaApi(request) 
        const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
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
        fs.writeFileSync('tests/fixtures/testdata.json',JSON.stringify({
            user_email: user.user_email,
            user_id: user.user_id,
            user_name: user.user_name,
            user_password: user.user_password,
            user_token: responseBodyLU.data.token
        }), "utf8"); 
        await deleteUserViaApi(request)
    })

    test('Retrieve user profile information via API', async ({ request }) =>{
        await createUserViaApi(request)
        await logInUserViaApi(request)
        const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
        const user = {
            user_email: body.user_email,
            user_id: body.user_id,
            user_name: body.user_name,
            user_password: body.user_password,
            user_token: body.user_token
        }
        const responseRU = await request.get(`api/users/profile`,{
            headers: { 'X-Auth-Token': user.user_token }
        });
        const responseBodyRU = await responseRU.json()
        expect(responseBodyRU.data.email).toEqual(user.user_email)
        expect(responseBodyRU.data.id).toEqual(user.user_id)
        expect(responseBodyRU.data.name).toEqual(user.user_name) 
        expect(responseBodyRU.message).toEqual('Profile successful')
        expect(responseRU.status()).toEqual(200)    
        console.log(responseBodyRU.message)         
        await deleteUserViaApi(request)
    }) 

    test('Update the user profile information via API', async ({ request }) =>{
        await createUserViaApi(request)
        await logInUserViaApi(request)
        const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
        const user = {
            user_email: body.user_email,
            user_id: body.user_id,
            user_name: body.user_name,
            user_password: body.user_password,
            user_token: body.user_token
        }      
        const updated_user = {  
            updated_user_company: faker.internet.userName(), 
            updated_user_phone: faker.string.numeric({ length: 12 }),         
            updated_user_name: faker.person.fullName()                
        }
        const responseUU = await request.patch(`api/users/profile`, {
            headers: { 'X-Auth-Token': user.user_token },
            data: {
                name: updated_user.updated_user_name,
                phone: updated_user.updated_user_phone,
                company: updated_user.updated_user_company
            }
        })
        const responseBodyUU = await responseUU.json()
        expect(responseBodyUU.data.company).toEqual(updated_user.updated_user_company)
        expect(responseBodyUU.data.email).toEqual(user.user_email)
        expect(responseBodyUU.data.id).toEqual(user.user_id)
        expect(responseBodyUU.data.name).toEqual(updated_user.updated_user_name)                
        expect(responseBodyUU.data.phone).toEqual(updated_user.updated_user_phone)
        expect(responseBodyUU.message).toEqual('Profile updated successful')
        expect(responseUU.status()).toEqual(200)                    
        console.log(responseBodyUU.message)         
        await deleteUserViaApi(request)
    })  

    test('Change a user\'s password via API', async ({ request }) =>{
        await createUserViaApi(request)
        await logInUserViaApi(request)
        const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
        const user = {
            user_password: body.user_password,
            user_token: body.user_token
        }    
        const updated_password = faker.internet.password({ length: 8 })
        const responseCP = await request.post(`api/users/change-password`, {
            headers: { 'X-Auth-Token': user.user_token },
            data: {
                currentPassword: user.user_password,
                newPassword: updated_password
            }
        })
        const responseBodyCP = await responseCP.json()
        expect(user.user_password).not.toEqual(updated_password)  
        expect(responseBodyCP.message).toEqual('The password was successfully updated')
        expect(responseCP.status()).toEqual(200)                    
        console.log(responseBodyCP.message)  
        await deleteUserViaApi(request)
    })  

    test('Log out a user via API', async ({ request }) => {
        await createUserViaApi(request) 
        await logInUserViaApi(request)
        const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
        const user_token = body.user_token
        const responseLOU = await request.delete(`api/users/logout`,{
            headers: { 'X-Auth-Token': user_token }
        })
        const responseBodyLOU = await responseLOU.json()
        expect(responseBodyLOU.message).toEqual('User has been successfully logged out')
        expect(responseLOU.status()).toEqual(200)
        console.log(responseBodyLOU.message)
        //When login out, token becomes invalid, so there is the need to log in again to delete the user.
        await logInUserViaApi(request)
        await deleteUserViaApi(request)
    })

    test('Delete user account via API', async ({ request }) => {
        await createUserViaApi(request) 
        await logInUserViaApi(request)
        const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
        const user_token = body.user_token
        const responseDU = await request.delete(`api/users/delete-account`,{
            headers: { 'X-Auth-Token': user_token }
        })
        const responseBodyDU = await responseDU.json()
        expect(responseBodyDU.message).toEqual('Account successfully deleted')
        expect(responseDU.status()).toEqual(200)
        console.log(responseBodyDU.message)
    })    
    
})


