const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishValidator(req,res,next) {
    const data = req.body.data;
    if(!data.name || data.name == "") {
        return next({status:400,message:"name"})
    }    
    if(!data.description || data.description == "") {
        return next({status: 400, message: "description"})
    }
    if(!data.image_url || data.image_url == "") {
        return next({status: 400,message: "image_url"})
    }
    if(!data.price || data.price == 0 || data.price < 0 || typeof data.price != "number") {
        return next({status:400, message: "price"})
    }
    next();
}
function dishExists(req,res,next) {
    let dishId = req.params.dishId;
    const dishExists = dishes.find((dish) => dish.id === dishId)
    if(!dishExists) {
        
        return next({status:404,message: `dish not found ${dishId}`})
    }
    res.locals.dish = dishExists;
         next()
    
}
const list  = (req,res,next) => {
    res.send({data: dishes});
}

const create = (req,res,next) => {
    let dish = req.body.data;
    let newId = nextId();
    
    let newDish = {...dish, id: newId}
    
    dishes.push(newDish)
    res.status(201).send({data:newDish})
}

const read = (req,res,next) => {
    let dish = res.locals.dish;
    res.send({data:dish});
}

const update = (req,res,next) => {
    let originalDish = res.locals.dish;
    let newDish = req.body.data;
    if(newDish.id && originalDish.id != newDish.id) {
       return next({status:400,message:`Dish id does not match route id. Dish: ${newDish.id}, Route: ${originalDish.id}`})
    }
    if(!newDish.id || newDish.id == "") {
        let newDishObject = {...newDish,id: originalDish.id}
        dishes[originalDish] = newDishObject
       return res.send({data: newDishObject})
    }
    if(originalDish != newDish ) {
        dishes[originalDish] = newDish;
        res.send({data: newDish})
    }
}

const destroy = (req,res,next) => {
    const {dishId} = req.params
    const foundDish = dishes.find(dish => dish.id === Number(dishId))
    if(!foundDish) {
        return next({status:405,message:"Dish not found"})
    }
    const index = dishes.indexOf(foundDish);
    dishes.splice(index,1);
    res.sendStatus(405)
}

module.exports = {
    list,
    create: [dishValidator,create],
    read: [dishExists,read],
    update: [dishExists,dishValidator,update],
    destroy
}