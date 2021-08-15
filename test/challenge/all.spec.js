const chai = require("chai");
const app = require("./../../app");
const { expect, should } = chai;
require("mocha");
const request = require("supertest").agent(app);
const faker = require("faker");

describe("Get All Challenges", () => {
  let loginCredentialsAdmin, loginCredentialsUser;
  let tokenAdmin, tokenUser;

  before(() => {
    server = require("./../../server");
    loginCredentialsAdmin = {
      email: "super@isec.com",
      password: "@Isec2020@",
    };

    loginCredentialsUser = {
      email: "test@isec.com",
      password: "@Isec2020@",
    };
  });

  after((done) => {
    // close server and clear cache
    server.close();
    delete require.cache[require.resolve("./../../server")];
    done();
  });

  describe("GET all challenges without credentials", () => {
    it("get without headers (Authorization)", () => {
      return request
        .get(`/api/challenge/all`)
        .send()
        .then((response) => {
          expect(response.status).to.equal(401);
          expect("Content-Type", /json/);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not authorized user");
        });
    });
  });

  describe("Login First to generate token credentials", () => {
    it("Admin Login", () => {
      return request
        .post("/api/team/login.json")
        .send(loginCredentialsAdmin)
        .then((response) => {
          tokenAdmin = response.body.token;
          expect(response.status).to.equal(200);
          expect("Content-Type", /json/);
          expect(response.body).to.have.property("token");
          expect(response.body).to.have.property("verified").to.equal(true);
        });
    });

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

  describe("GET all challenges with credentials", () => {
    describe("All challenges", () => {
      describe("GET The Challenges", () => {
        it("(admin credentials) get challenges", () => {
          return request
            .get(`/api/challenge/all`)
            .set({ authorization: tokenAdmin })
            .send()
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body).be.a("Object").to.have.property("web");
              expect(response.body).be.a("Object").to.have.property("crypto");
              expect(response.body).be.a("Object").to.have.property("forensic");
            });
        });

        it("(user credentials) get challenges", () => {
          return request
            .get(`/api/challenge/all`)
            .set({ authorization: tokenUser })
            .send()
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body).be.a("Object").to.have.property("web");
              expect(response.body).be.a("Object").to.have.property("crypto");
              expect(response.body).be.a("Object").to.have.property("forensic");
            });
        });
      });
    });
  });
});
