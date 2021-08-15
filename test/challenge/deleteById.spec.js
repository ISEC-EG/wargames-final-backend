const chai = require("chai");
const app = require("../../app");
const { expect, should } = chai;
require("mocha");
const request = require("supertest").agent(app);
const faker = require("faker");

describe("Remove Challenge by ID", () => {
  let loginCredentialsAdmin, loginCredentialsUser;
  let tokenAdmin, tokenUser;
  let created_challenge_id;
  let challenge_info;

  before(() => {
    server = require("../../server");
    loginCredentialsAdmin = {
      email: "super@isec.com",
      password: "@Isec2020@",
    };

    loginCredentialsUser = {
      email: "test@isec.com",
      password: "@Isec2020@",
    };

    challenge_info = {
      category: faker.random.arrayElement([
        "reverse",
        "web",
        "forensic",
        "crypto",
        "machines",
      ]),
      title: faker.name.title(),
      level: faker.datatype.number({ min: 1, max: 3 }),
      points: faker.datatype.number({ min: 300, max: 900 }),
      author: faker.name.firstName(),
      flag: `ASCWG{${faker.lorem.word()}}`,
    };
  });

  after((done) => {
    // close server and clear cache
    server.close();
    delete require.cache[require.resolve("./../../server")];
    done();
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

  describe("Create Challenge", () => {
    it("Successfully challenge created", () => {
      return request
        .post("/api/challenge/create-challenge-v01")
        .set({ authorization: tokenAdmin })
        .send(challenge_info)
        .then((response) => {
          created_challenge_id = response.body._id;
          expect(response.status).to.equal(200);
          expect("Content-Type", /json/);
          expect(response.body).be.a("object").to.have.property("_id");
          expect(response.body)
            .to.have.property("category")
            .to.equal(challenge_info.category);
          expect(response.body)
            .to.have.property("points")
            .to.equal(challenge_info.points);
        });
    });
  });

  describe("Delete challenge without credentials", () => {
    it("get without headers (Authorization)", () => {
      return request
        .delete(`/api/challenge/${created_challenge_id}`)
        .send()
        .then((response) => {
          expect(response.status).to.equal(401);
          expect("Content-Type", /json/);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not Authorized User not allowed to access");
        });
    });
  });

  describe("Delete challenge with invalid role credentials", () => {
    it("get without headers (Authorization)", () => {
      return request
        .delete(`/api/challenge/${created_challenge_id}`)
        .set({ authorization: tokenUser })
        .send()
        .then((response) => {
          expect(response.status).to.equal(401);
          expect("Content-Type", /json/);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not Authorized User not allowed to access");
        });
    });
  });

  describe("Delete challenge with credentials", () => {
    describe("invalid params", () => {
      describe("Invalid Challenge ID", () => {
        it("invalid ID", () => {
          return request
            .delete(`/api/challenge/56hh`)
            .set({ authorization: tokenAdmin })
            .then((response) => {
              expect(response.status).to.equal(400);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Invalid Challenge");
            });
        });
      });

      describe("Challenge not Exists", () => {
        it("invalid ID challenge not exists", () => {
          return request
            .delete(`/api/challenge/60cef7887fea8709805e0159`)
            .set({ authorization: tokenAdmin })
            .send()
            .then((response) => {
              expect(response.status).to.equal(404);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Challenge not found");
            });
        });
      });
    });

    describe("valid challenge ID Params", () => {
      describe("Remove The Challenge", () => {
        it("(admin credentials) get challenge", () => {
          return request
            .delete(`/api/challenge/${created_challenge_id}`)
            .set({ authorization: tokenAdmin })
            .send()
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Challenge Removed Successfully");
            });
        });
      });
    });
  });
});
