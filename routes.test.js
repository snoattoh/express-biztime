process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

const companyRoutes = require('./routes/companies');
const invoiceRoutes = require('./routes/invoices');



let testCompanies = [];
let testInvoices = [];

beforeAll(async () => {

});

beforeEach(async () => {
    const result = await db.query(
    `INSERT INTO companies (code, name, description) 
    VALUES ($1, $2, $3)
    RETURNING code, name, description`, 
    ["buns", "Buns Inc", "Sells all kinds of buns."]);
    testCompany = result;
    testCompanies.push(result);
    
    const resultTwo = await db.query(
    `INSERT INTO companies (code, name, description) 
    VALUES ($1, $2, $3)
    RETURNING code, name, description`, 
    ["car", "Cars Inc", "Not a movie, just sell cars."]);
    
    testCompanies.push(resultTwo);

    const resultThree = await db.query(
    `INSERT INTO invoices (comp_code, amt) 
    VALUES ($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,  
    ["buns", 100]);

    testIndustry = resultThree;
    testIndustries.push(resultThree);

    const resultFour = await db.query(
    `INSERT INTO invoices (comp_code, amt) 
    VALUES ($1, $2)
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,  
    ["buns", 100]);

    testIndustries.push(resultFour);
});

/* GET /companies
Returns list of companies, like {companies: [{code, name}, ...]}*/

describe("GET /companies", () => {
    test("Gets a full list of companies (2)", async () => {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testCompanies]
        });
    });
});


/*GET /companies/[code]
Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response. */

describe("GET /companies/:code", () => {
    test("Get a single company", async () => {
        const response = await request(app).get(`/companies/buns`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            company: [testCompany]
        });
    });

    test("Responds with 404 if can't find company", async () => {
        const response = await request(app).get(`/companies/dinosaur`);
        expect(response.statusCode).toEqual(404);
      });
});

/*POST /companies
Adds a company.

Needs to be given JSON like: {code, name, description}

Returns obj of new company: {company: {code, name, description}}*/

describe("POST /companies/", () => {
    test("Adds a company", async () => {
        const response = await request(app).post(`/companies/buns`)
        .send({
            "code":"wells",
            "name":"Wellington Inc", 
            "description": "A well made company, really well made"
        });
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            company: {
                code:"wells",
                name:"Wellington Inc", 
                description: "A well made company, really well made"
            }
        });
    });
});

/*PUT /companies/[code]
Edit existing company.

Should return 404 if company cannot be found.

Needs to be given JSON like: {name, description}

Returns update company object: {company: {code, name, description}}*/

describe("PUT /companies/:code", () => {
    test("Edit an existing company", async () => {
        const response = await request(app)
        .put(`/companies/${testCompany.code}`)
        .send({
            "name":"Sellington Inc", 
            "description": "A sold company that's still really well made."
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            company: {
                code:testCompany.code,
                name:"Sellington Inc", 
                description: "A sold company that's still really well made."
            }
        });
    });
    test("Responds with 404 if can't find company", async () => {
        const response = await request(app)
        .patch(`/companies/lol`);
        expect(response.statusCode).toEqual(404);
});


/*DELETE /companies/[code]
Deletes company.

Should return 404 if company cannot be found.

Returns {status: "deleted"}*/

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
      const response = await request(app)
      .delete(`/companies/${testCompany.code}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({status: "deleted"});
    });
    test("Responds with 404 if can't find company", async () => {
        const response = await request(app)
        .delete(`/companies/lol`);
        expect(response.statusCode).toEqual(404);
});



/* GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]}*/

/*GET /invoices/[id]
Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}} */

/* POST /invoices
Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

/* PUT /invoices/[id]
Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

/*DELETE /invoices/[id]
Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}*/


afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM invoices");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });