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

describe("Registration", () => {
  let loginCredentialsAdmin, tokenAdmin;
  let name;
  let password;
  let email;
  let tempToken;
  let expiredTokenSession;
  let tempTokenNotExistsUser;
  let userNotVerified;
  let otp;
  let forgetToken;
  let expiredToken;
  before(() => {
    loginCredentialsAdmin = {
      email: "super@isec.com",
      password: "@Isec2020@",
    };

    userNotVerified = {
      email: "not-verified@isec.com",
      password: "@Isec2020@",
    };

    expiredToken =
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGI0ZjkwNzAyNmNkMzM5OTRmZTdhNzYiLCJlbWFpbCI6InlhbGxhcGxhY2VzaW5mb0BnbWFpbC5jb20iLCJpYXQiOjE2MjI0NzI5NjcsImV4cCI6MTYyMjQ3NjU2N30.TauDEy2QDAdaCzBjmZsb0Zswj-qMh8H2gxlqNwMWbNk";

    expiredTokenSession = jwt.sign(
      { _id: "111111", email: faker.internet.email(name) },
      config.tempTokenSecret,
      {
        algorithm: "HS256",
        expiresIn: `1s`,
      }
    );

    tempTokenInvalidID = jwt.sign(
      { _id: "111111", email: faker.internet.email(name) },
      config.tempTokenSecret,
      {
        algorithm: "HS256",
        expiresIn: `1h`,
      }
    );

    tempTokenUserNotFound = jwt.sign(
      { _id: mongoose.Types.ObjectId(), email: faker.internet.email(name) },
      config.tempTokenSecret,
      {
        algorithm: "HS256",
        expiresIn: `1h`,
      }
    );

    tempTokenAlradyVerified = jwt.sign(
      { _id: "60d07d4797113536cc9b10be", email: "test@isec.com" },
      config.tempTokenSecret,
      {
        algorithm: "HS256",
        expiresIn: `1h`,
      }
    );

    name = faker.name.firstName();
    email = faker.internet.email(name);
    country = faker.address.country();
    password = faker.internet.password(9, false) + "0I@";
    server = require("../../server");
  });

  after((done) => {
    console.log("Sign up Done Successfully");

    describe("Remove created team after testing", () => {
      describe("Delete Team", () => {
        it("Removing ...", () => {
          return request
            .delete(`/api/team/`)
            .set({ authorization: tokenAdmin })
            .send({ email: email })
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body)
                .be.a("object")
                .to.have.property("message")
                .to.equal("team Removed Successfully");
            });
        });
      });
    });

    // close server and clear cache
    server.close();
    delete require.cache[require.resolve("./../../server")];
    done();
  });
  describe("Testing User Signup POST api/team/signup.json", () => {
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
    });

    describe("Signup Validation Schema", () => {
      before(() => {});
      describe("Team name Validation", () => {
        let teamDataWithoutName,
          teamDataWithEmptyName,
          teamDataWithInvalidMinName,
          teamDataWithInvalidMaxName,
          teamDataWithInvalidName;

        before(() => {
          teamDataWithoutName = {
            email: faker.internet.email(name),
            password: password,
            country: country,
          };

          teamDataWithEmptyName = {
            name: "",
            email: faker.internet.email(name),
            password: password,
            country: country,
          };

          teamDataWithInvalidMinName = {
            name: faker.name.firstName().substr(0, 1),
            email: faker.internet.email(name),
            password: password,
            country: country,
          };

          teamDataWithInvalidMaxName = {
            name: faker.name.title() + faker.name.title(),
            email: faker.internet.email(name),
            password: password,
            country: country,
          };

          teamDataWithInvalidName = {
            name: faker.name.title() + "&&",
            email: faker.internet.email(name),
            password: password,
            country: country,
          };
        });

        it("Team name Required", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamDataWithoutName)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .be.a("object")
                .to.have.property("message")
                .to.equal("team name is required");
            });
        });

        it("Team name is empty filed", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamDataWithEmptyName)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("team name cannot be an empty field");
            });
        });

        it("team name min length 3", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamDataWithInvalidMinName)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal(
                  "team name should have a minimum length of 3 (letters & numbers)"
                );
            });
        });

        it("Team name max length 30", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamDataWithInvalidMaxName)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal(
                  "team name should have a maximum length of 30 (letters & numbers)"
                );
            });
        });

        it("Team name Invalid", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamDataWithInvalidName)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal(
                  "team name must be consists of letters & numbers only"
                );
            });
        });
      });

      describe("Team Email Validation", () => {
        let teamWithoutEmail, teamWithEmptyEmail, teamWithInvalidEmail;
        before(() => {
          // team email

          teamWithoutEmail = {
            name: faker.name.firstName(),
            password: password,
            country: country,
          };

          teamWithEmptyEmail = {
            name: faker.name.firstName(),
            email: "",
            password: password,
            country: country,
          };

          teamWithInvalidEmail = {
            name: faker.name.firstName(),
            email: faker.name.gender(),
            password: password,
            country: country,
          };
        });

        it("Team email Required", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithoutEmail)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("email is required");
            });
        });

        it("Team Email is empty filed", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithEmptyEmail)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("email cannot be an empty field");
            });
        });

        it("Team Email Invalid", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithInvalidEmail)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Invalid email");
            });
        });
      });

      describe("Team Password Validation", () => {
        let teamWithoutPassword, teamWithEmptyPassword, teamWithInvalidPassword;
        before(() => {
          // team name
          teamWithoutPassword = {
            name: faker.name.firstName(),
            email: faker.internet.email(name),
            country: country,
          };

          teamWithEmptyPassword = {
            name: faker.name.firstName(),
            email: faker.internet.email(name),
            password: "",
            country: country,
          };

          teamWithInvalidPassword = {
            name: faker.name.firstName(),
            email: faker.internet.email(name),
            password: faker.name.firstName(),
            country: country,
          };
        });

        it("Team password Required", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithoutPassword)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("password is required");
            });
        });

        it("Team password is empty filed", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithEmptyPassword)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("password cannot be an empty field");
            });
        });

        it("Team password Invalid", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithInvalidPassword)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal(
                  "password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character"
                );
            });
        });
      });

      describe("Team Country Validation", () => {
        let teamWithoutCountry, teamWithEmptyCountry, teamWithInvalidCountry;
        before(() => {
          // team name
          teamWithoutCountry = {
            name: faker.name.firstName(),
            email: faker.internet.email(name),
            password: password,
          };

          teamWithEmptyCountry = {
            name: faker.name.firstName(),
            email: faker.internet.email(name),
            password: password,
            country: "",
          };

          teamWithInvalidCountry = {
            name: faker.name.firstName(),
            email: faker.internet.email(name),
            password: password,
            country: "^&^",
          };
        });

        it("Team country Required", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithoutCountry)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("country is required");
            });
        });

        it("Team country is empty filed", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithEmptyCountry)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("country cannot be an empty field");
            });
        });

        it("Team country Invalid", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamWithInvalidCountry)
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("country must be only characters");
            });
        });
      });
    });

    describe("Signup Valid", () => {
      let teamData, teamNameUsed;
      let teamName = faker.name.firstName();

      before(() => {
        teamData = {
          name: teamName,
          email: email,
          password: password,
          country: country,
        };

        teamNameUsed = {
          name: teamName,
          email: faker.internet.email(country),
          password: password,
          country: country,
        };
      });

      describe("Register and send temp token", () => {
        it("Save User Data and Send temp token", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamData)
            .then((response) => {
              tempToken = response.body.temp;
              expect(response.status).to.equal(200);
              expect(response.body).to.have.property("temp");
            });
        });
      });

      describe("Register Email Already registered before", () => {
        it("Email Already used before", () => {
          return request
            .post("/api/team/signup.json")
            .send({
              name: faker.name.firstName(),
              email: email,
              password: password,
              country: country,
            })
            .then((response) => {
              expect(response.status).to.equal(409);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Email already registered before");
            });
        });
      });

      describe("Register Name Already registered before", () => {
        it("Name Already Used before", () => {
          return request
            .post("/api/team/signup.json")
            .send(teamNameUsed)
            .then((response) => {
              expect(response.status).to.equal(409);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Team name is used");
            });
        });
      });
    });
  });

  describe("Testing Send OTP POST api/team/verification-code.json", () => {
    describe("Without credentials", () => {
      it("create without headers (Authorization)", () => {
        return request
          .post("/api/team/verification-code.json")
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

    describe("With expired credentials", () => {
      it("create with expired headers (Authorization)", () => {
        return request
          .post("/api/team/verification-code.json")
          .set({ authorization: expiredTokenSession })
          .send()
          .then((response) => {
            expect(response.status).to.equal(401);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("OTP validation time expired");
          });
      });
    });

    describe("With credentials for not valid team id", () => {
      it("create with headers (Authorization) for not valid team id", () => {
        return request
          .post("/api/team/verification-code.json")
          .set({ authorization: tempTokenInvalidID })
          .send()
          .then((response) => {
            expect(response.status).to.equal(400);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Invalid Team Id");
          });
      });
    });

    describe("With credentials for not exists team", () => {
      it("create with headers (Authorization) for not exists team", () => {
        return request
          .post("/api/team/verification-code.json")
          .set({ authorization: tempTokenUserNotFound })
          .send()
          .then((response) => {
            expect(response.status).to.equal(401);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Team is not found");
          });
      });
    });

    describe("With credentials for team already verified", () => {
      it("create with headers (Authorization) team already verified", () => {
        return request
          .post("/api/team/verification-code.json")
          .set({ authorization: tempTokenAlradyVerified })
          .send()
          .then((response) => {
            expect(response.status).to.equal(409);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Team is already verified");
          });
      });
    });

    describe("Send OTP With credentials", () => {
      it("send otp", () => {
        return request
          .post("/api/team/verification-code.json")
          .set({ authorization: tempToken })
          .send()
          .then((response) => {
            expect(response.status).to.equal(200);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Please Check your Email");
          });
      });
    });

    describe("Send OTP Again in 1 minute(!) With credentials", () => {
      it("Waiting 5 minutes to send again", () => {
        return request
          .post("/api/team/verification-code.json")
          .set({ authorization: tempToken })
          .send()
          .then((response) => {
            expect(response.status).to.equal(400);
            expect("Content-Type", /json/);
            expect(response.body).to.have.property("message");
          });
      });
    });
  });

  describe("Testing GET OTP api/team/otp by super-admin first", () => {
    describe("GET OTP by email", () => {
      it("try to get otp", () => {
        return request
          .get("/api/team/otp")
          .set({ authorization: tokenAdmin })
          .send({ email: email }) // otp not valid for this verification
          .then((response) => {
            console.log(response.body);
            otp = response.body.otp;
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("otp").to.equal(otp);
          });
      });
    });
  });

  describe("Testing Verify OTP POST api/team/verify.json", () => {
    describe("Without credentials", () => {
      it("create without headers (Authorization)", () => {
        return request
          .post("/api/team/verify.json")
          .send({ otp: "818761" })
          .then((response) => {
            expect(response.status).to.equal(401);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Not authorized user");
          });
      });
    });

    describe("With expired credentials", () => {
      it("create with expired headers (Authorization)", () => {
        return request
          .post("/api/team/verify.json")
          .set({ authorization: expiredTokenSession })
          .send({ otp: "818761" })
          .then((response) => {
            expect(response.status).to.equal(401);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("OTP validation time expired");
          });
      });
    });

    describe("With credentials for not exists team", () => {
      it("create with headers (Authorization) for not exists team", () => {
        return request
          .post("/api/team/verify.json")
          .set({ authorization: tempTokenUserNotFound })
          .send({ otp: "818761" })
          .then((response) => {
            expect(response.status).to.equal(401);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Team is not found");
          });
      });
    });

    describe("OTP Validation", () => {
      describe("Without OTP", () => {
        it("try to verify otp without otp", () => {
          return request
            .post("/api/team/verify.json")
            .set({ authorization: tempToken })
            .send({})
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("code is required");
            });
        });
      });

      describe("With empty OTP", () => {
        it("try to verify otp with empty otp", () => {
          return request
            .post("/api/team/verify.json")
            .set({ authorization: tempToken })
            .send({ otp: "" })
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("code cannot be an empty field");
            });
        });
      });

      describe("With invalid OTP", () => {
        it("try to verify otp with invalid otp", () => {
          return request
            .post("/api/team/verify.json")
            .set({ authorization: tempToken })
            .send({ otp: "df5" })
            .then((response) => {
              expect(response.status).to.equal(400);
              expect(response.body)
                .to.have.property("message")
                .to.equal("invalid code");
            });
        });
      });
    });

    describe("With invalid OTP verification", () => {
      it("try to verify otp invalid otp", () => {
        return request
          .post("/api/team/verify.json")
          .set({ authorization: tempToken })
          .send({ otp: "123456" }) // otp not valid for this verification
          .then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Invalid code");
          });
      });
    });

    describe("With valid OTP", () => {
      it("try to verify otp invalid otp", () => {
        return request
          .post("/api/team/verify.json")
          .set({ authorization: tempToken })
          .send({ otp: otp })
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("verified").to.equal(true);
          });
      });
    });
  });

  describe("Testing Login after verifying POST api/team/login.json", () => {
    describe("Login Validation schema", () => {
      describe("Email Validation", () => {
        describe("Email Required", () => {
          it("email Required", () => {
            return request
              .post("/api/team/login.json")
              .send({
                password: password,
              })
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("email is required");
              });
          });
        });

        describe("Email not valid", () => {
          it("Email Invalid", () => {
            return request
              .post("/api/team/login.json")
              .send({
                email: faker.name.firstName(),
                password: password,
              })
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("Invalid email");
              });
          });
        });
      });

      describe("Password Validation", () => {
        describe("Password required", () => {
          it("Password Required", () => {
            return request
              .post("/api/team/login.json")
              .send({
                email: email,
              })
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("password is required");
              });
          });
        });
      });
    });

    describe("Login Valid schema", () => {
      describe("Email not Exists", () => {
        it("email not exists", () => {
          return request
            .post("/api/team/login.json")
            .send({
              email: faker.internet.email(faker.name.firstName()),
              password: password,
            })
            .then((response) => {
              expect(response.status).to.equal(401);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Invalid email or password");
            });
        });
      });
      describe("password not exists not valid", () => {
        it("Password not Valid", () => {
          return request
            .post("/api/team/login.json")
            .send({
              email: email,
              password: faker.internet.password(5, false),
            })
            .then((response) => {
              expect(response.status).to.equal(401);
              expect("Content-Type", /json/);
              expect(response.body)
                .to.have.property("message")
                .to.equal("Invalid email or password");
            });
        });
      });
    });

    describe("Team not verified yet", () => {
      it("User not verified", () => {
        return request
          .post("/api/team/login.json")
          .send(userNotVerified)
          .then((response) => {
            expect(response.status).to.equal(201);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Email  not verified please check email address");
          });
      });
    });

    describe("Login Successfully", () => {
      it("User Login successfully", () => {
        return request
          .post("/api/team/login.json")
          .send({
            email,
            password,
          })
          .then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body).not.to.be.empty;
            expect(response.body).to.have.property("token");
          });
      });
    });
  });

  describe("Testing Forget Password after Register and verify POST api/team/forget-password", () => {
    describe("Forget Password Validation schema", () => {
      describe("Email Validation", () => {
        describe("Email Required", () => {
          it("email Required", () => {
            return request
              .post("/api/team/forget-password")
              .send({})
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("email is required");
              });
          });
        });

        describe("Email not valid", () => {
          it("Email Invalid", () => {
            return request
              .post("/api/team/forget-password")
              .send({
                email: faker.name.firstName(),
                password: password,
              })
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("Invalid email");
              });
          });
        });

        describe("Email invalid", () => {
          it("Team Email Invalid", () => {
            return request
              .post("/api/team/forget-password")
              .send({ email: faker.name.gender() })
              .then((response) => {
                expect(response.status).to.equal(400);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("Invalid email");
              });
          });
        });
      });
    });

    describe("Forget Password Email not exists", () => {
      it("(Forget Password) not exists email of a team", () => {
        return request
          .post("/api/team/forget-password")
          .send({ email: faker.internet.email(faker.name.firstName()) })
          .then((response) => {
            expect(response.status).to.equal(409);
            expect("Content-Type", /json/);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Team not found, enter a valid email");
          });
      });
    });

    describe("Forget Password Successfully", () => {
      it("Forget Password successfully", () => {
        return request
          .post("/api/team/forget-password")
          .send({
            email,
          })
          .then((response) => {
            forgetToken = response.body.token;
            expect(response.status).to.equal(200);
            expect(response.body).not.to.be.empty;
            expect(response.body).to.have.property("token");
          });
      });
    });

    describe("Send Forget Password Again in 1 hour(!)", () => {
      it("Waiting 1 hour to send again", () => {
        return request
          .post("/api/team/forget-password")
          .send({ email })
          .then((response) => {
            expect(response.status).to.equal(409);
            expect("Content-Type", /json/);
            expect(response.body).to.have.property("message");
          });
      });
    });
  });

  describe("Testing Reset Password after forget POST api/team/reset-password", () => {
    describe("Reset Password Validation schema", () => {
      it("password Required", () => {
        return request
          .post("/api/team/reset-password")
          .set({ authorization: forgetToken })
          .send()
          .then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body)
              .to.have.property("message")
              .to.equal("password is required");
          });
      });

      it("password is empty", () => {
        return request
          .post("/api/team/reset-password")
          .set({ authorization: forgetToken })
          .send({ password: "" })
          .then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body)
              .to.have.property("message")
              .to.equal("password cannot be an empty field");
          });
      });

      it("password Invalid", () => {
        return request
          .post("/api/team/reset-password")
          .set({ authorization: forgetToken })
          .send({ password: "isec1" })
          .then((response) => {
            expect(response.status).to.equal(400);
            expect(response.body)
              .to.have.property("message")
              .to.equal(
                "password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character"
              );
          });
      });
    });

    describe("Reset Password Without headers", () => {
      it("without headers", () => {
        return request
          .post("/api/team/reset-password")
          .set({})
          .send({ password: password })
          .then((response) => {
            expect(response.status).to.equal(401);
            expect(response.body)
              .to.have.property("message")
              .to.equal("Not authorized user");
          });
      });

      it("with expired headers", () => {
        return request
          .post("/api/team/reset-password")
          .set({ authorization: expiredToken })
          .send({ password: "@Isec2020" })
          .then((response) => {
            console.log(response.body);
            expect(response.status).to.equal(401);
            expect(response.body)
              .to.have.property("message")
              .to.equal("OTP validation time expired");
          });
      });
    });

    describe('Reset Password successfully', () => {
      it('Reset successfully', () => {
        return request
          .post('/api/team/reset-password')
          .set({ authorization: forgetToken})
          .send({ password: password })
          .then(response => {
            console.log(response.body)
            expect(response.status).to.equal(200)
            expect(response.body)
              .to.have.property('message')
              .to.equal('Password reset successfully')
          })
      })
    })

  });
});
