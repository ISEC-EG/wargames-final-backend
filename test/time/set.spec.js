const chai = require("chai");
const app = require("./../../app");
const { expect, should } = chai;
require("mocha");
const request = require("supertest").agent(app);
const faker = require("faker");

let server;

describe("SET Warames Time", () => {
  let loginCredentialsAdmin, loginCredentialsUser;
  let tokenAdmin, tokenUser;
  let time_info;

  // before all
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

    time_info = {
      date: faker.date.between("2021-07-01", "2021-08-01"),
      hours: faker.datatype.number({ min: 1, max: 24 }),
    };
  });

  // before each one
  beforeEach(() => {});

  // after all
  after((done) => {
    console.log("Create Time Done Successfully");

    describe("Create The wargame date time and removing the test", () => {
      it("Successfully time created", () => {
        return request
          .post("/api/time/set")
          .set({ authorization: tokenAdmin })
          .send({
            date: "2021-07-30",
            hours: 15,
          })
          .then((response) => {
            expect(response.status).to.equal(200);
            expect("Content-Type", /json/);
            expect(response.body).be.a("object").to.have.property("hours");
            expect(response.body)
              .to.have.property("hours")
            expect(response.body).to.have.property("date");
          });
      });
    });

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

  describe("Create time without credentials", () => {
    let time_data;
    beforeEach(() => {
      time_data = {
        date: `${faker.date
          .between("2021-07-01", "2021-08-01")
          .getFullYear()}-${
          faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
        }-${faker.date.between("2021-07-01", "2021-08-01").getDate()}`,
        hours: faker.datatype.number({ min: 1, max: 24 }),
      };
    });
    it("create without headers (Authorization)", () => {
      return request
        .post("/api/time/set")
        .send(time_data)
        .then((response) => {
          expect(response.status).to.equal(401);
          expect("Content-Type", /json/);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not Authorized User not allowed to access");
        });
    });
  });

  describe("Create time with invalid credentials (user)", () => {
    let time_data;
    beforeEach(() => {
      time_data = {
        date: `${faker.date
          .between("2021-07-01", "2021-08-01")
          .getFullYear()}-${
          faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
        }-${faker.date.between("2021-07-01", "2021-08-01").getDate()}`,
        hours: faker.datatype.number({ min: 1, max: 24 }),
      };
    });
    it("User trying to create time", () => {
      return request
        .post("/api/time/set")
        .set({ authorization: tokenUser })
        .send(time_data)
        .then((response) => {
          expect(response.status).to.equal(401);
          expect("Content-Type", /json/);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not Authorized User not allowed to access");
        });
    });
  });

  describe("Time data Inputs Validation", () => {
    describe("Some inputs invalid or missing", () => {
      describe("Time date validation", () => {
        let without_date;
        let empty_date;
        let invalid_date;

        describe("Time date invalid", () => {
          beforeEach(() => {
            without_date = {
              hours: faker.datatype.number({ min: 1, max: 24 }),
            };

            empty_date = {
              date: ``,
              hours: faker.datatype.number({ min: 1, max: 24 }),
            };

            invalid_date = {
              date: `${faker.date
                .between("2021-07-01", "2021-08-01")
                .getFullYear()}-${
                faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
              }-sdsd`,
              hours: faker.datatype.number({ min: 1, max: 24 }),
            };
          });

          it("Time not Exists (required)", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(without_date)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("date is required");
              });
          });

          it("Time is empty", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(empty_date)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("date must be a valid date");
              });
          });

          it("Time invalid type", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(invalid_date)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("date must be a valid date");
              });
          });
        });
      });

      describe("Time hours validation", () => {
        let without_hours;
        let empty_hours;
        let invalid_hours_max, invalid_hours_min;

        describe("Time date invalid", () => {
          beforeEach(() => {
            without_hours = {
              date: `${faker.date
                .between("2021-07-01", "2021-08-01")
                .getFullYear()}-${
                faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
              }-${faker.date.between("2021-07-01", "2021-08-01").getDate()}`,
            };

            empty_hours = {
              date: `${faker.date
                .between("2021-07-01", "2021-08-01")
                .getFullYear()}-${
                faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
              }-${faker.date.between("2021-07-01", "2021-08-01").getDate()}`,
              hours: "",
            };

            invalid_hours_max = {
              date: `${faker.date
                .between("2021-07-01", "2021-08-01")
                .getFullYear()}-${
                faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
              }-${faker.date.between("2021-07-01", "2021-08-01").getDate()}`,
              hours: faker.datatype.number({ min: 150, max: 240 }),
            };

            invalid_hours_min = {
              date: `${faker.date
                .between("2021-07-01", "2021-08-01")
                .getFullYear()}-${
                faker.date.between("2021-07-01", "2021-08-01").getMonth() + 1
              }-${faker.date.between("2021-07-01", "2021-08-01").getDate()}`,
              hours: faker.datatype.number({ min: -20, max: -1 }),
            };
          });

          it("Hours not Exists (required)", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(without_hours)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("hours is required");
              });
          });

          it("Hours is empty", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(empty_hours)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("hours must be a number");
              });
          });

          it("Time invalid max", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(invalid_hours_max)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("hours must be less than or equal to 24");
              });
          });

          it("Time invalid min", () => {
            return request
              .post("/api/time/set")
              .set({ authorization: tokenAdmin })
              .send(invalid_hours_min)
              .then((response) => {
                expect(response.status).to.equal(400);
                expect("Content-Type", /json/);
                expect(response.body)
                  .to.have.property("message")
                  .to.equal("hours must be greater than or equal to 1");
              });
          });
        });
      });
    });

    describe("valid inputs", () => {
      describe("Create The wargame date time", () => {
        it("Successfully time created", () => {
          return request
            .post("/api/time/set")
            .set({ authorization: tokenAdmin })
            .send(time_info)
            .then((response) => {
              expect(response.status).to.equal(200);
              expect("Content-Type", /json/);
              expect(response.body).be.a("object").to.have.property("hours");
              expect(response.body)
                .to.have.property("hours")
                .to.equal(time_info.hours);
              expect(response.body).to.have.property("date");
            });
        });
      });
    });
  });
});
