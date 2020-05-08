"use strict";

let self = function(a){
	this.config = a.config;
	this.mongodb = a.mongodb;
	this.name = "comment";
}



//@route('/api/comment/total')
//@method(['get'])
self.prototype.total = async function(req,res){
	try{
		let query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
		let total = await this.mongodb.count(this.name,query);
		res.send({data: total});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/comment/collection')
//@method(['get'])
self.prototype.collection = async function(req,res){
	try{
		let query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
		let options = (req.method=="GET")?JSON.parse(req.query.options):(req.method=="POST")?req.body.options:{};
		let data = await this.mongodb.find(this.name,query,options);
		res.send({data: data});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/comment')
//@method(['post'])
//@roles(['user'])
self.prototype.create = async function(req,res){
	try{
		await this.mongodb.insertOne(this.name,req.body);
		res.send({data: true});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



module.exports = self;