const express = require('express');
const router = new express.Router();
const db = require("../db");
const ExpressError = require('../expressError');

/* GET /companies
Returns list of companies, like {companies: [{code, name}, ...]}*/

router.get("/", async (req, res, next) => { 
    try {
        const results = await db.query(
            `SELECT * FROM companies`);
    
        return res.json({companies: results.rows});
    }
    catch (err){
        return next(err);
    }
});

/*GET /companies/[code]
Return obj of company: {company: {code, name, description}}

If the company given cannot be found, this should return a 404 status response. */

router.get("/:code", async (req, res, next) => { 
    try {
        const results = await db.query(
            `SELECT * FROM companies
            WHERE code =$1`, 
            [req.params.code]);
            
        console.log(results.rows);

        // return results.rows.length != 0  ? res.json({company: results.rows}) : res.status(404).json({error:"company not found"}); I should probably use the ExpressError class properly
        if(results.rows.length == 0) throw new ExpressError("company not found", 404);
           
        return res.json({company: results.rows});

         }
    catch (err){
        return next(err);
    }
});

/*POST /companies
Adds a company.

Needs to be given JSON like: {code, name, description}

Returns obj of new company: {company: {code, name, description}}*/

router.post("/", async (req, res, next) => { 
    try {
        const results = await db.query(
          `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3)
           RETURNING code, name, description`, 
           [req.body.code, req.body.name, req.body.description]);

        return res.status(201).json({company: results.rows[0]});
    }
    catch (err){
        return next(err);
    }
});

/*PUT /companies/[code]
Edit existing company.

Should return 404 if company cannot be found.

Needs to be given JSON like: {name, description}

Returns update company object: {company: {code, name, description}}*/

router.put("/:code", async (req, res, next) => { 
    try {
        const results = await db.query(
          `UPDATE companies SET name =$1, description=$2
           WHERE code =$3
           RETURNING code, name, description`, 
           [req.body.name, req.body.description, req.params.code]);

           if(results.rows.length == 0) throw new ExpressError("company not found", 404);
           
           return res.json({company: results.rows});
    }
    catch (err){
        return next(err);
    }
});

/*DELETE /companies/[code]
Deletes company.

Should return 404 if company cannot be found.

Returns {status: "deleted"}*/

router.delete("/:code", async (req, res, next) => { 
    try {
        const results = await db.query(
          `DELETE FROM companies WHERE code = $1`, 
          [req.params.code]);
            
        if(results.rowCount != 0)  throw new ExpressError("company not found", 404);

        return res.json({status: "deleted"})
    }
    catch (err){
        return next(err);
    }
});



module.exports = router;