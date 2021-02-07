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
        const results = await db.query(
            `SELECT * FROM invoices
            LEFT JOIN companies
            ON companies.code = comp_code
            WHERE id =$1`, 
            [req.params.id]);
            
        console.log(results.rows);

        // return results.rows.length != 0  ? res.json({company: results.rows}) : res.status(404).json({error:"company not found"}); I should probably use the ExpressError class properly
        if(results.rows.length == 0) throw new ExpressError("company not found", 404);
           
        return res.json({invoice: results.rows});

         }
    catch (err){
        return next(err);
    }
});


module.exports = router;