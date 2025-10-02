const express = require('express');
const route = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");




const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let result = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400 , result);
    }else{
        next();
    }
}


route.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

route.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

route.get("/:id", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/show.ejs", { listing });
}));

route.post(
  "/",validateListing,
  wrapAsync(async (req, res, next) => {
   
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

route.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id);
  res.render("listings/edit.ejs", { list });
}));

route.put("/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.editlisting);
  res.redirect("/listings");
}));

route.delete("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id, {});
  res.redirect("/listings");
}));


module.exports = route;