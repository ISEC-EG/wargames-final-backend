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

describe("Update password PATCH /api/team/update-password", () => {
  let loginCredentialsUser;
  let tokenUser;

  let token, tokenUserNotExists, passData;

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

    invalidToken =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cm4iOjg0ODQ5OTAxNCwiZXhwIjoxNjU0MDcwNDUxMDAwMDAwLCJpYXQiOjE2MjI1MzQ0NTEwMDAwMDAsIl9pZCI6IjYwYjRmZjY0MzRlYzc3MGFjNDVhYmFlOSIsInJvbGUiOiJ1c2VyIiwidV9pZCI6IjMwN2NlNjIwLTJhZjQtNWJmYy04ZGM4LTk0ZWQ3MWZiY2VhMyJ9.MxoEHCheEDoLWQTArs-5XwCbgRb5KaNC2uQUNS4khaWorRGDTAi03hxOy0F-7nDsl0CPpZTVHsTRZ3r7bzf2P-9LRU7JVUp1BjMJUbbffEHpPTD3IWQ9D2GjinciOoCgRSOCPm776N8DKwGrk9I8U2Nu5QA6NQyxTpDWOQunWPJZ4UjHb6MnAHqwx8ZM-cmGgA4LqucaDSwHhsheqrflrrbE9UOBWU6_5VJgIm1edYCE8aXNFcoZJ-7q95mMEkdHNRnjhixF8iEl2JJs0os_VB3-61KaATSKu1jnQysQgqbRQoZxno2tNSoyFf0-fu2Rzp46q7WjmeKzZ-vfXkx-7A";

    tokenUserNotExists =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cm4iOjgzOTMwMDI2MywiZXhwIjoxNjU0MDc1MDYyMDAwMDAwLCJpYXQiOjE2MjI1MzkwNjIwMDAwMDAsIl9pZCI6IjYwYjVmYjEwMmZiZTM1M2I5ODBjYjM0NiIsInJvbGUiOiJ1c2VyIiwidV9pZCI6ImFhYTA5ZWQxLWE0Y2YtNWViYy1iNDZlLTJmNzZlNjk4YWUyNCJ9.SgAcgUl0z7PZwROHoOLAC1o7vkv9YY909tEBuZ_XWSbtB1jPV3rxyAJFHfyAVNzujquKAUfBBnv8fSx9biMRiYAeoGrMwnuwl8Cgea4S_0tAoM4X-6ibdtnpB7d_2spSY_d2l1Sw6FkS-yyciRs7UwbYq8cu4u7Xf9KtEcqx5SWpjwl6Phr1E9I8IUCwhCtyHJdeLL9b0Y66nyN0S46jo4gGGCCZQSpjsMCqyMBkRJOu3EMcbS1IzYuVg81lsrqmtVdY4p0JZ9Z5exU9Meuwz1_HEwB2R97AYGeJNvHpryjG0QdDWhlyqtPqNp1Gy8xQx9JEU3ROUlwVJW_0MUh7cA";

    passData = {
      oldPassword: "@Isec2020",
      newPassword: "@Isec2021",
    };
  });

  after((done) => {
    console.log("Create Time Done Successfully");
    // close server and clear cache
    server.close();
    delete require.cache[require.resolve("./../../server")];
    done();
  });

  describe("Update without headers (token)", () => {
    it("Without token", () => {
      return request
        .patch("/api/team/update-password")
        .send(passData)
        .then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Not authorized user");
        });
    });
  });

  describe("Update with invalid headers (token)", () => {
    it("With invalid headers (token)", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: invalidToken })
        .send(passData)
        .then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body)
            .to.have.property("message")
            .to.equal("login session expired not found");
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

  describe("With token for team not exists", () => {
    it("Without token", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUserNotExists })
        .send(passData)
        .then((response) => {
          expect(response.status).to.equal(401);
          expect(response.body)
            .to.have.property("message")
            .to.equal("login session expired not found");
        });
    });
  });

  describe("Update password validation schema", () => {
    let emptyOldPass,
      emptyNewPass,
      withoutOldPass,
      withoutNewPass,
      invalidOldPass,
      invalidNewPass;
    before(() => {
      emptyOldPass = {
        oldPassword: "",
        newPassword: faker.internet.password(9, false) + "0I@",
      };

      emptyNewPass = {
        oldPassword: faker.internet.password(9, false) + "0I@",
        newPassword: "",
      };

      withoutOldPass = {
        newPassword: faker.internet.password(9, false) + "0I@",
      };

      withoutNewPass = {
        oldPassword: faker.internet.password(9, false) + "0I@",
      };

      invalidOldPass = {
        oldPassword: faker.internet.password(4, false),
        newPassword: faker.internet.password(9, false) + "0I@",
      };

      invalidNewPass = {
        oldPassword: faker.internet.password(9, false) + "0I@",
        newPassword: faker.internet.password(4, false),
      };
    });

    it("Without old password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send(withoutOldPass)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body)
            .to.have.property("message")
            .to.equal("old password is required");
        });
    });

    it("With empty old password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send(emptyOldPass)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body)
            .to.have.property("message")
            .to.equal("old password cannot be an empty field");
        });
    });

    it("With invalid old password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send(invalidOldPass)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body)
            .to.have.property("message")
            .to.equal("old password invalid");
        });
    });

    it("Without new password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send(withoutNewPass)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body)
            .to.have.property("message")
            .to.equal("new password is required");
        });
    });

    it("With empty new password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send(emptyNewPass)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body)
            .to.have.property("message")
            .to.equal("new password cannot be an empty field");
        });
    });

    it("With invalid new password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send(invalidNewPass)
        .then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body)
            .to.have.property("message")
            .to.equal(
              "new password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character"
            );
        });
    });
  });

  describe("Old password not correct", () => {
    it("old Password invalid", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send({
          oldPassword: faker.internet.password(9, false) + "0I@",
          newPassword: faker.internet.password(9, false) + "0I@",
        })
        .then((response) => {
          expect(response.status).to.equal(409);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Old password incorrect");
        });
    });
  });

  describe("new password equal old password", () => {
    it("new Password equal to old password", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send({
          oldPassword: loginCredentialsAdmin.password,
          newPassword: loginCredentialsAdmin.password,
        })
        .then((response) => {
          expect(response.status).to.equal(409);
          expect(response.body)
            .to.have.property("message")
            .to.equal("New password must not be the same as old password");
        });
    });
  });

  describe("Update password successfully", () => {
    it("Update Successfully", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send({
          oldPassword: "@Isec2020@",
          newPassword: "@Isec2021",
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Password Updated Successfully");
        });
    });
  });

  describe("Update password successfully again to previous password", () => {
    it("Update Successfully", () => {
      return request
        .patch("/api/team/update-password")
        .set({ authorization: tokenUser })
        .send({
          oldPassword: "@Isec2021",
          newPassword: "@Isec2020@",
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body)
            .to.have.property("message")
            .to.equal("Password Updated Successfully");
        });
    });
  });
});
