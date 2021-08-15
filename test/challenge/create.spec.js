const chai = require("chai");
const app = require("../../app");
const { expect, should } = chai;
require("mocha");
const request = require("supertest").agent(app);
const faker = require("faker");

let server;

describe("Create Challenge by Superadmin", () => {
  let loginCredentialsAdmin, loginCredentialsUser;
  let tokenAdmin, tokenUser;
  let challenge_info;
  let created_challenge_id;

  // before all
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

  // before each one
  beforeEach(() => {});

  // after all
  after((done) => {
    console.log("Create Challenge Done Successfully");
    describe("Remove created challenge after testing", () => {
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
    });

    // close server and clear cache
    server.close();
    delete require.cache[require.resolve("./../../server")];
    done();
  });

  describe("Create challenge without credentials", () => {
    let challenge_data;
    beforeEach(() => {
      challenge_data = {
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
    it("create without headers (Authorization)", () => {
      return request
        .post("/api/challenge/create-challenge-v01")
        .send(challenge_data)
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

  describe("Create challenge with invalid credentials (user)", () => {
    let challenge_data;
    beforeEach(() => {
      challenge_data = {
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
    it("User trying to create challenge", () => {
      return request
        .post("/api/challenge/create-challenge-v01")
        .set({ authorization: tokenUser })
        .send(challenge_data)
        .then((response) => {
          expect(response.status).to.equal(401);
          expect("Content-Type", /json/);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not Authorized User not allowed to access");
        });
    });
  });

  describe("Challenge Inputs Validation", () => {
    describe("Some inputs invalid or missing", () => {
      describe("Category validation", () => {
        let without_category;
        let empty_category;
        let invalid_category;

        describe("Category invalid", () => {
          beforeEach(() => {
            without_category = {
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            empty_category = {
              category: "",
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            invalid_category = {
              category: faker.name.title().split(" ")[0],
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };
          });

          it("Category not Exists (required)", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(without_category)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("category is required");
              });
          });

          it("Category is empty", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(empty_category)
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

          it("Category invalid type", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_category)
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

      describe("Title validation", () => {
        let without_title;
        let empty_title;
        let invalid_title;

        describe("Title invalid", () => {
          beforeEach(() => {
            without_title = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            empty_title = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: "",
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            invalid_title = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.firstName() + "&^",
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };
          });

          it("Title not Exists (required)", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(without_title)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("title is required");
              });
          });

          it("Title is empty", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(empty_title)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("title cannot be an empty field");
              });
          });

          it("Title is invalid", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_title)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("title must be consists of letters & numbers only");
              });
          });
        });
      });

      describe("Level validation", () => {
        let without_level;
        let empty_level;
        let invalid_level;

        describe("Level invalid", () => {
          beforeEach(() => {
            without_level = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            empty_level = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              level: "",
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            invalid_level = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              level: faker.datatype.number({ min: 10, max: 30 }),
              points: faker.datatype.number({ min: 300, max: 900 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };
          });

          it("Level not Exists (required)", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(without_level)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("level is required");
              });
          });

          it("Level is empty", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(empty_level)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("level must be one of [1, 2, 3]");
              });
          });

          it("Level invalid type", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_level)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("level must be one of [1, 2, 3]");
              });
          });
        });
      });

      describe("Points validation", () => {
        let without_points;
        let empty_points;
        let invalid_points;
        let invalid_points_min;

        describe("Points invalid", () => {
          beforeEach(() => {
            without_points = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            empty_points = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: "",
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            invalid_points = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: faker.name.title(),
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            invalid_points_min = {
              category: faker.random.arrayElement([
                "reverse",
                "web",
                "forensic",
                "crypto",
                "machines",
              ]),
              title: faker.name.title(),
              level: faker.datatype.number({ min: 1, max: 3 }),
              points: -10,
              author: faker.name.firstName(),
              flag: `ASCWG{${faker.lorem.word()}}`,
            };
          });

          it("Points not Exists (required)", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(without_points)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("points is required");
              });
          });

          it("Points is empty", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(empty_points)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("points must be valid number and not empty");
              });
          });

          it("Points invalid type", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_points)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("points must be valid number and not empty");
              });
          });

          it("Points invalid with mines", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_points_min)
              .then((response) => {
                console.log(response.body.message);
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("points should be minimum 1");
              });
          });
        });
      });

      describe("Author validation", () => {
        let without_author;
        let empty_author;
        let invalid_author;

        describe("Author invalid", () => {
          beforeEach(() => {
            without_author = {
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
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            empty_author = {
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
              author: "",
              flag: `ASCWG{${faker.lorem.word()}}`,
            };

            invalid_author = {
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
              author: "&^&^*",
              flag: `ASCWG{${faker.lorem.word()}}`,
            };
          });

          it("Author not Exists (required)", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(without_author)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("author is required");
              });
          });

          it("Author is empty", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(empty_author)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("author cannot be an empty field");
              });
          });

          it("Author invalid type", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_author)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal(
                    "author must be consists of letters & numbers only"
                  );
              });
          });
        });
      });

      describe("Flag validation", () => {
        let without_flag;
        let empty_flag;
        let invalid_flag;

        describe("Flag invalid", () => {
          beforeEach(() => {
            without_flag = {
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
            };

            empty_flag = {
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
              flag: ``,
            };

            invalid_flag = {
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
              flag: `{${faker.lorem.word()}}`,
            };
          });

          it("Flag not Exists (required)", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(without_flag)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("flag is required");
              });
          });

          it("Flag is empty", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(empty_flag)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("flag cannot be an empty field");
              });
          });

          it("Flag invalid type", () => {
            return request
              .post("/api/challenge/create-challenge-v01")
              .set({ authorization: tokenAdmin })
              .send(invalid_flag)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("flag must start with ASCWG");
              });
          });
        });
      });
    });

    describe("valid inputs", () => {
      let dublicate_title_challenge;
      describe("Create The Challenge", () => {
        it("Successfully challenge created", () => {
          return request
            .post("/api/challenge/create-challenge-v01")
            .set({ authorization: tokenAdmin })
            .send(challenge_info)
            .then((response) => {
              created_challenge_id = response.body._id;
              dublicate_title_challenge = challenge_info;
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

        it("Failed dulicate challenge title created before", () => {
          return request
            .post("/api/challenge/create-challenge-v01")
            .set({ authorization: tokenAdmin })
            .send(dublicate_title_challenge)
            .then((response) => {
              expect(response.status).to.equal(409);
              expect("Content-Type", /json/);
              expect(response.body)
                .be.a("object")
                .to.have.property("message")
                .to.equal("Title already exists use another one");
            });
        });
      });
    });
  });
});
