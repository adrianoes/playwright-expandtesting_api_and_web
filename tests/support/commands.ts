import { APIRequestContext, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import fs from 'fs'

export async function logInUserViaApi(request: APIRequestContext) {
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
  }

export async function deleteUserViaApi(request: APIRequestContext) {
    const body = JSON.parse(fs.readFileSync('tests/fixtures/testdata.json', "utf8"))
    const user_token = body.user_token
    const responseDU = await request.delete(`api/users/delete-account`,{
        headers: { 'X-Auth-Token': user_token }
    })
    const responseBodyDU = await responseDU.json()
    expect(responseBodyDU.message).toEqual('Account successfully deleted')
    expect(responseDU.status()).toEqual(200)
}

export async function createUserViaApi(request: APIRequestContext) {
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
}



