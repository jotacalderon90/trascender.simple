"use strict";

let self = function(a,p){
	this.config = a.config;
	this.mongodb = a.mongodb;
}



//@route('/api/wall/blog')
//@method(['post','put','delete'])
self.prototype.wall_blog = async function(req,res){
	try{
		let doc = null;
		switch(req.method.toLowerCase()){
			case "post":
				doc = await this.mongodb.find("blog",{title: req.body.title});
				if(doc.length==1){
					doc = doc[0];
					await this.mongodb.insertOne("wall",{
						content: "<p>Creó una nueva publicación en el Blog: <small>" + doc.title + "</small></p>",
						url: "/blog/" + doc.uri,
						tag: (typeof doc.tag=="string")?doc.tag.split(","):doc.tag,
						author: doc.user,
						created: new Date()
					});
					res.send({data: true});
				}else{
					throw("document not found " + req.body.title);
				}
			break;
			case "put":
				doc = await this.mongodb.findOne("blog",req.body.id);
				if(doc){
					await this.mongodb.insertOne("wall",{
						content: "<p>Actualizó una publicación del Blog: <small>" + doc.title + "</small></p>",
						url: "/blog/" + doc.uri,
						tag: (typeof doc.tag=="string")?doc.tag.split(","):doc.tag,
						author: doc.user,
						created: new Date()
					});
					res.send({data: true});
				}else{
					throw("document not found " + req.body.id);
				}
			break;
			case "delete":
				await this.mongodb.insertOne("wall",{
					content: "<p>Eliminó una publicación del Blog: <small>" + req.body.title + "</small></p>",
					tag: ["Blog"],
					author: req.body.author,
					created: new Date()
				});
				res.send({data: true});
			break;
		}
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/wall')
//@method(['get'])
self.prototype.renderCollection = async function(req,res){
	try{
		let data = await this.mongodb.find("wall",{},{limit: 10, sort: {created: -1}});
		res.render("wall/collection",{title: "Muro", rows: data});
	}catch(e){
		console.log(e);
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger", config: this.config});
	}
}



//@route('/wall/categoria/:id')
//@method(['get'])
self.prototype.renderCollectionTag = async function(req,res){
	try{
		let data = await this.mongodb.find("wall",{tag: req.params.id},{limit: 10, sort: {created: -1}});
		res.render("wall/collection",{title: req.params.id.charAt(0).toUpperCase() + req.params.id.slice(1),rows: data});
	}catch(e){
		console.log(e);
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger", config: this.config});
	}
}



//@route('/api/wall/total')
//@method(['get'])
self.prototype.total = async function(req,res){
	try{
		let query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
		let total = await this.mongodb.count("wall",query);
		res.send({data: total});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/wall/collection')
//@method(['get'])
self.prototype.collection = async function(req,res){
	try{
		let query = (req.method=="GET")?JSON.parse(req.query.query):(req.method=="POST")?req.body.query:{};
		let options = (req.method=="GET")?JSON.parse(req.query.options):(req.method=="POST")?req.body.options:{};
		let data = await this.mongodb.find("wall",query,options);
		res.send({data: data});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/wall/tag/collection')
//@method(['get'])
self.prototype.tags = async function(req,res){
	try{
		let data = await this.mongodb.distinct("wall","tag");
		res.send({data: data});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/wall')
//@method(['post'])
//@roles(['admin'])
self.prototype.create = async function(req,res){
	try{
		req.body.author = req.user._id;
		req.body.created = new Date();
		await this.mongodb.insertOne("wall",req.body);
		res.send({data: true});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



//@route('/api/wall/:id')
//@method(['delete'])
//@roles(['admin'])
self.prototype.delete = async function(req,res){
	try{
		let row = await this.mongodb.findOne("wall",req.params.id);
		await this.mongodb.deleteOne("wall",req.params.id);
		res.send({data: true});
	}catch(e){
		res.send({data: null,error: e.toString()});
	}
}



module.exports = self;