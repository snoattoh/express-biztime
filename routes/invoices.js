const express = require('express');
const router = new express.Router();
const db = require("../db");
const ExpressError = require('../expressError');

/* GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]}*/

router.get("/", async (req, res, next) => { 
    try {
        const results = await db.query(
            `SELECT * FROM invoices`);
    
        return res.json({invoices: results.rows});
    }
    catch (err){
        return next(err);
    }
});

/*GET /invoices/[id]
Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}} */

router.get("/:id", async (req, res, next) => { 
    try {
        /* const results = await db.query(
               SELECT * FROM invoices
               LEFT JOIN companies
               ON companies.code = comp_code
               WHERE id =$1`, 
               [req.params.id]); 

        if(results.rows.length == 0) throw new ExpressError("invoice not found", 404);

        results.rows[0].company = {code: results.rows[0].compcode, name: results.rows[0].name, description, results.rows[0].description}
        delete results.rows[0].comp_code;

          the excercise makes it seem as though we run the queries seperately? and then connect them? So far it hasn't been discussed whether or not it's better to just run multiple queries, but I imagine it isn't. 
          for my own simplicity, I'm going to do seperate queries, that feels incorrect though.
        */
        const results = await db.query(
            `SELECT * FROM invoices
            WHERE id =$1`, 
            [req.params.id]); 
        
        if(results.rows.length == 0) throw new ExpressError("invoice not found", 404);
        
        const resultsTwo = await db.query(
            `SELECT * FROM companies
            WHERE code =$1`, 
            [results.rows[0].comp_code]); 

        
        if(resultsTwo.rows.length == 0) throw new ExpressError("company not found", 404);

        delete results.rows[0].comp_code;
        results.rows[0].company = resultsTwo.rows;

        return res.json({invoice: results.rows});

         }
    catch (err){
        return next(err);
    }
});

/* POST /invoices
Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

router.post("/", async (req, res, next) => { 
    try {
        const results = await db.query(
          `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
           [req.body.comp_code, req.body.amt]);

        return res.status(201).json({company: results.rows[0]});
    }
    catch (err){
        return next(err);
    }
});

/* PUT /invoices/[id]
Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

router.put("/:id", async (req, res, next) => { 
    try {
        const results = await db.query(
          `UPDATE invoices SET amt =$1
           WHERE code =$2
           RETURNING code, name, description`, 
           [req.body.amt, req.params.id]);

           if(results.rows.length == 0) throw new ExpressError("invoice not found", 404);
           
           return res.json({company: results.rows});
    }
    catch (err){
        return next(err);
    }
});

/*DELETE /invoices/[id]
Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}*/

router.delete("/:id", async (req, res, next) => { 
    try {
        const results = await db.query(
          `DELETE FROM invoices WHERE id = $1`, 
          [req.params.id]);
            
        if(results.rowCount != 0)  throw new ExpressError("invoice not found", 404);

        return res.json({status: "deleted"})
    }
    catch (err){
        return next(err);
    }
});


module.exports = router;