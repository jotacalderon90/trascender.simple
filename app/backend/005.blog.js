"use strict";

let self = function(a){
	this.dir = a.dir;
	this.config = a.config;
	this.mongodb = a.mongodb;
	this.helper = a.helper;
	this.microservice = a.microservice;
}



//@route('/blog')
//@method(['get'])
self.prototype.renderCollection = async function(req,res){
	try{
		let data = await this.mongodb.find("blog",{},{limit: 10, sort: {created: -1}});
		res.render("blog/collection",{title: "Blog", rows: data});
	}catch(e){
		console.log(e);
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger"});
	}
}



//@route('/blog/new')
//@method(['get'])
self.prototype.new = async function(req,res){
	res.render("blog/form");
}



//@route('/blog/edit/:id')
//@method(['get'])
//@roles(['admin','BLOGUER'])
self.prototype.edit = async function(req,res){
	try{	
		let row = await this.mongodb.findOne("blog",req.params.id);
		res.render("blog/form",{row: row});
	}catch(e){
		console.log(e);
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger", config: this.config});
	}
	
}



//@route('/blog/categoria/:id')
//@method(['get'])
self.prototype.renderCollectionTag = async function(req,res){
	try{
		let data = await this.mongodb.find("blog",{tag: req.params.id},{limit: 10, sort: {created: -1}});
		res.render("blog/collection",{title: req.params.id.charAt(0).toUpperCase() + req.params.id.slice(1),rows: data});
	}catch(e){
		console.log(e);
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger"});
	}
}



//@route('/blog/:id')
//@method(['get'])
self.prototype.render_id = async function(req,res,next){
	let view = "blog/" + req.params.id;
	if(this.helper.exist(view)){
		res.render(view);
	}else{
		return next();
	}
}



//@route('/blog/:id')
//@method(['get'])
self.prototype.renderDocument = async function(req,res){
	try{	
		let data = await this.mongodb.find("blog",{uri:req.params.id});
		if(data.length!=1){
			throw("No se encontró el documento solicitado");
		}else{
			res.render("blog/document",{row: data[0]});
		}
	}catch(e){
		console.log(e);
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger", config: this.config});
	}
}



//@route('/api/blog/total')
//@method(['get','post'])
self.prototype.total = async function(req,res){
	try{
		let query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
		let total = await this.mongodb.count("blog",query);
		res.send({data: total});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog/collection')
//@method(['get','post'])
self.prototype.collection = async function(req,res){
	try{
		let query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
		let options = (req.method=="GET")?JSON.parse(req.query.options):(req.method=="POST")?req.body.options:{};
		let data = await this.mongodb.find("blog",query,options);
		res.send({data: data});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog')
//@method(['post'])
//@roles(['admin','BLOGUER'])
self.prototype.create = async function(req,res){
	try{
		req.body.user = req.user._id;
		req.body.created = new Date();
		req.body.img = "/media/img/logo.png";
		req.body.thumb = "/media/img/logo.png";
		
		await this.mongodb.insertOne("blog",req.body);
		this.microservice.noWait("post","/api/wall/blog",{title: req.body.title});
		
		res.send({data: true});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog/:id')
//@method(['get'])
self.prototype.read = async function(req,res){
	try{
		let row = await this.mongodb.findOne("blog",req.params.id);
		res.send({data: row});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog/:id')
//@method(['put'])
//@roles(['admin','BLOGUER'])
self.prototype.update = async function(req,res){
	try{
		req.body.user = req.user._id;
		req.body.updated = new Date();
		
		await this.mongodb.updateOne("blog",req.params.id,req.body);
		this.microservice.noWait("put","/api/wall/blog",{id: req.params.id});
		
		res.send({data: true});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog/:id')
//@method(['delete'])
//@roles(['admin','BLOGUER'])
self.prototype.delete = async function(req,res){
	try{
		let row = await this.mongodb.findOne("blog",req.params.id);
		await this.mongodb.deleteOne("blog",req.params.id);
		this.microservice.noWait("delete","/api/wall/blog",{title: row.title, author: req.user._id});
		res.send({data: true});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog/tag/collection')
//@method(['get'])
self.prototype.tag = async function(req,res){
	try{
		let data = await this.mongodb.distinct("blog","tag");
		res.send({data: data});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/blog/:id/image')
//@method(['post'])
//@roles(['admin','SELLER'])
self.prototype.upload = async function(req,res){
	try{
		if (!req.files || Object.keys(req.files).length != 1) {
			throw("no file");
		}
		let d = "/media/img/blog/" + req.params.id + ".jpg";
		await this.helper.upload_process(req.files.file, this.dir + "/app/frontend" + d);
		await this.mongodb.updateOne("blog",req.params.id,{$set: {img: d, thumb: d}});
		
		res.redirect("/blog/edit/" + req.params.id);
	}catch(e){
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger", config: this.config});
	}
}



module.exports = self;