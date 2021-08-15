const chai = require("chai");
const app = require("./../../app");
const { expect, should } = chai;
require("mocha");
const request = require("supertest").agent(app);
const faker = require("faker");

describe("Get Challenge by ID", () => {
  let loginCredentialsAdmin, loginCredentialsUser;
  let tokenAdmin, tokenUser;
  let challenge_cat;
  let challenge_info;
  let created_challenge_id;

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
    console.log("Create Time Done Successfully");

    describe("Delete Challenge", () => {
      it("Removing ...", () => {
        return request
          .delete(`/api/challenge/${created_challenge_id}`)
          .set({ authorization: tokenAdmin })
          .then((response) => {
            expect(response.status).to.equal(200);
            expect("Content-Type", /json/);
            expect(response.body)
              .be.a("object")
              .to.have.property("message")
              .to.equal("Challenge Removed Successfully");
          });
      });
    });

    // close server and clear cache
    server.close();
    delete require.cache[require.resolve("./../../server")];
    done();
  });

  describe("GET challenges By cat without credentials", () => {
    it("get without headers (Authorization)", () => {
      return request
        .get(`/api/challenge/reverse`)
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

  describe("Create Challenge", () => {
    it("Successfully challenge created", () => {
      return request
        .post("/api/challenge/create-challenge-v01")
        .set({ authorization: tokenAdmin })
        .send(challenge_info)
        .then((response) => {
          challenge_cat = response.body.category;
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

  describe("GET challenge with credentials", () => {
    describe("invalid params", () => {
      describe("Invalid Challenges caterogy", () => {
        it("invalid Cat (admin credentials)", () => {
          return request
            .get(`/api/challenge/category`)
            .set({ authorization: tokenAdmin })
            .then((response) => {
              expect(response.status).to.equal(400);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Invalid Challenge");
            });
        });

        it("invalid Cat (user credentials)", () => {
          return request
            .get(`/api/challenge/category`)
            .set({ authorization: tokenUser })
            .then((response) => {
              expect(response.status).to.equal(400);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Invalid Challenge");
            });
        });
      });

      describe("Challenge Cat not valid", () => {
        it("invalid cat challenge not exists (admin credentials)", () => {
          return request
            .get(`/api/challenge/category/${faker.name.findName()}`)
            .set({ authorization: tokenAdmin })
            .send()
            .then((response) => {
              expect(response.status).to.equal(400);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal(
                  "category must be one of [web, reverse, forensic, crypto, machines]"
                );
            });
        });

        it("invalid ID challenge not exists (user credentials)", () => {
          return request
            .get(`/api/challenge/category/${faker.name.findName()}`)
            .set({ authorization: tokenUser })
            .send()
            .then((response) => {
              expect(response.status).to.equal(400);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal(
                  "category must be one of [web, reverse, forensic, crypto, machines]"
                );
            });
        });
      });
    });

    describe("valid challenge Cat Params", () => {
      describe("GET The Challenges", () => {
        it("(admin credentials) get challenges", () => {
          return request
            .get(`/api/challenge/category/${challenge_cat}`)
            .set({ authorization: tokenAdmin })
            .send()
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body).to.be.instanceOf(Array);
            });
        });

        it("(user credentials) get challenge", () => {
          return request
            .get(`/api/challenge/category/${challenge_cat}`)
            .set({ authorization: tokenUser })
            .send()
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body).to.be.instanceOf(Array);
            });
        });
      });
    });
  });
});
