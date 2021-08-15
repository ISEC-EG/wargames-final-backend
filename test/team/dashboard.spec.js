const chai = require("chai");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../../app");
const { expect, should } = chai;
require("mocha");
const request = require("supertest").agent(app);
const faker = require("faker");

const config = require("../../config");

let server;

describe('GET team profile GET /api/team/  && GET /api/team/:id', () => {
    let loginCredentialsUser;
    let tokenUser;
    let teamName;
    let teamNameUser = 'Not verified';

    let expiredTokenSession, tokenUserNotExists, invalidToken;

    let invalid


    before((done) => {
        let name = faker.name.firstName();
        server = require("./../../server");

        loginCredentialsUser = {
            email: "test@isec.com",
            password: "@Isec2020@",
        };

        invalidToken =
            "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cm4iOjg0ODQ5OTAxNCwiZXhwIjoxNjU0MDcwNDUxMDAwMDAwLCJpYXQiOjE2MjI1MzQ0NTEwMDAwMDAsIl9pZCI6IjYwYjRmZjY0MzRlYzc3MGFjNDVhYmFlOSIsInJvbGUiOiJ1c2VyIiwidV9pZCI6IjMwN2NlNjIwLTJhZjQtNWJmYy04ZGM4LTk0ZWQ3MWZiY2VhMyJ9.MxoEHCheEDoLWQTArs-5XwCbgRb5KaNC2uQUNS4khaWorRGDTAi03hxOy0F-7nDsl0CPpZTVHsTRZ3r7bzf2P-9LRU7JVUp1BjMJUbbffEHpPTD3IWQ9D2GjinciOoCgRSOCPm776N8DKwGrk9I8U2Nu5QA6NQyxTpDWOQunWPJZ4UjHb6MnAHqwx8ZM-cmGgA4LqucaDSwHhsheqrflrrbE9UOBWU6_5VJgIm1edYCE8aXNFcoZJ-7q95mMEkdHNRnjhixF8iEl2JJs0os_VB3-61KaATSKu1jnQysQgqbRQoZxno2tNSoyFf0-fu2Rzp46q7WjmeKzZ-vfXkx-7A";


        expiredTokenSession = jwt.sign({ _id: "111111", email: faker.internet.email(name) }, config.PRIVATEKEY, {
            algorithm: "RS256",
            expiresIn: `1s`,
        });


        tokenUserNotExists = jwt.sign({ _id: mongoose.Types.ObjectId(), role: 'user', email: faker.internet.email(name) }, config.PRIVATEKEY, {
            algorithm: "RS256",
        });

        done();
    });

    after((done) => {
        console.log("Create Time Done Successfully");
        // close server and clear cache
        server.close();
        delete require.cache[require.resolve("./../../server")];
        done();
    });

    describe('GET Dashaord without headers (token)', () => {
        it('Without headers token', () => {
            return request.get('/api/team/dashboard').send().then(response => {
                expect(response.status).to.equal(401);
                expect(response.body).to.have.property('message').to.equal('Not authorized user');
            });
        });
    });

    describe('GET Dashaord with invalid headers (token)', () => {
        it('session not exists', () => {
            return request
                .get('/api/team/dshboard/')
                .set({
                    authorization: invalidToken,
                })
                .send(teamName)
                .then(response => {
                    expect(response.status).to.equal(401);
                    expect(response.body).to.have
                        .property('message')
                        .to.equal('login session expired not found');
                });
        });

        it('session expired', () => {
            return request
                .get('/api/team/dashboard')
                .set({
                    authorization: expiredTokenSession,
                })
                .send(teamName)
                .then(response => {
                    expect(response.status).to.equal(401);
                    expect(response.body).to.have
                        .property('message')
                        .to.equal('Not authorized user');
                });
        });
    });

    describe("Login First to generate token credentials", () => {
        it("User Login", () => {
            return request
                .post("/api/team/login.json")
                .send(loginCredentialsUser)
                .then((response) => {
                    tokenUser = response.body.token;
                    expect(response.status).to.equal(200);
                    expect("Content-Type", /json/);
                    expect(response.body).to.have.property("token");
                    expect(response.body).to.have.property("verified").to.equal(true);
                });
        });

    });

    describe('GET Dashaord successfully without pagination', () => {
        it('my profile', () => {
            return request
                .get('/api/team/dashboard')
                .set({ authorization: tokenUser })
                .send()
                .then(response => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('teams');
                });
        });
    });

    describe('GET Dashaord successfully with invalid pagination params', () => {
        describe('Invalid limit NO', () => {
            it('my profile', () => {
                return request
                    .get(`/api/team/dashboard?limitNo=${faker.name.firstName()}`)
                    .set({ authorization: tokenUser })
                    .send()
                    .then(response => {
                        expect(response.status).to.equal(400);
                        expect(response.body).to.have.property('message').to.equal("Enter a valid number");
                    });
            });
        })

        describe('Invalid PAGE NO', () => {
            it('my profile', () => {
                return request
                    .get(`/api/team/dashboard?pageNo=${faker.name.firstName()}`)
                    .set({ authorization: tokenUser })
                    .send()
                    .then(response => {
                        expect(response.status).to.equal(400);
                        expect(response.body).to.have.property('message').to.equal("Enter a valid number");
                    });
            });
        })


    });

    describe('GET Dashaord successfully with pagination', () => {
        it('my profile', () => {
            return request
                .get(`/api/team/dashboard?limitNo=10&pageNo=0`)
                .set({ authorization: tokenUser })
                .send()
                .then(response => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('teams');
                });
        });
    });
});
