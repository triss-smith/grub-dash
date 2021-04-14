const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderValidator(req,res,next) {
    const data = req.body.data;
    
    if(!data.deliverTo  || data.deliverTo == "") {
        return next({status:400,message:"deliverTo"})
    }
    if(!data.mobileNumber || data.mobileNumber == "") {
        return next({status:400,message:"mobileNumber"})
    }
    if(!data.dishes || data.dishes.length == 0 || !Array.isArray(data.dishes)) {
        return next({status:400,message:"dishes"})
    }
    data.dishes.forEach((dish,index) => {
        if(!dish.quantity || dish.quantity == "" || dish.quantity <= 0 || typeof dish.quantity != "number") {
           return next({status:400,message:`${index} quantity`})
        }
    })
    next()
}

function orderExists(req,res,next) {
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id === orderId)
    if(!foundOrder) {
        return next({status:404,message:`Order not found ${orderId}`})
    }
    res.locals.order = foundOrder;
    next()
}
const list = (req,res,next) => {
    res.send({data: orders})
}

const create = (req,res,next) => {
    const order = req.body.data;
    const id = nextId();
    const newOrder = {...order,id:id}
    orders.push(newOrder);
    res.status(201).send({data:newOrder})
}

const read = (req,res,next) => {
    const order = res.locals.order;
    res.send({data:order})
}

const update = (req,res,next) => {
    const statusPossible = ["pending", "preparing", "out-for-delivery", "delivered"]
    let originalOrder = res.locals.order;
    let newOrder = req.body.data;
    let index = orders.indexOf(originalOrder);
    if(!newOrder.status || newOrder.status == "" || !statusPossible.includes(newOrder.status)) {
        return next({status:400,message:"status missing"})
    }
    if(newOrder.id && originalOrder.id != newOrder.id) {
        return next({status:400,message: `Order id does not match the route id. Order: ${newOrder.id}, Route: ${originalOrder.id}`})
    }
    if(!newOrder.id || newOrder.id == "") {
        let newOrderObject = {...newOrder,id: originalOrder.id}
        orders[originalOrder] = newOrderObject;
        return res.send({data:newOrderObject})
    }
    if(originalOrder != newOrder) {
        orders[originalOrder] = newOrder;
        res.send({data:newOrder})
    }
}

const destroy = (req,res,next) => {
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id == orderId)
    const index = orders.indexOf(foundOrder);
    if(foundOrder.status == "pending") {
        console.log("pending")
    
    if(foundOrder){
    console.log("what")
    orders.splice(index,1);
    return res.sendStatus(204)
    }
    next({status:405})
}
else{
    next({status:400,message:"pending"})
}
}

module.exports = {
    list,
    create: [orderValidator, create],
    read: [orderExists,read],
    update: [orderExists,orderValidator,update],
    destroy: [orderExists,destroy]
}