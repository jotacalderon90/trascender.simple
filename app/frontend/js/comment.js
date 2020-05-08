app.controller("commentCtrl", function(trascender,$scope){
	 
	var self = this;
	
	if(typeof user!="undefined"){
		this.user = user;
	}
	
	this.comment = new trascender({
		increase: true,
		baseurl: "api/comment",
		default: function(){
			return {comment: ""};
		},
		start: function(){
			
			this.service_user = this.serviceCreate("GET","/api/user/:id");
			this.users = {};
			this.usersToLoad = [];
					
			this.new();
			this.query = {parent: _document._id};
			this.options.sort = {created: -1};
			this.getTotal();
			$(window).scroll(()=>{
				if(Math.round($(window).scrollTop() + $(window).height()) == Math.round($(document).height())) {
					if(this.obtained < this.cant){
						this.getCollection();
					}
				}
			});	
		},
		afterGetTotal: function(){
			if(this.obtained < this.cant){
				this.getCollection();
			}
		},
		beforeGetCollection: function(){ 
			this.usersToLoad = [];
			return true;
		},
		afterGetCollection: function(){
			this.loadUserInfo();
		},
		loadUserInfo: async function(){
			for(let i=0;i<this.usersToLoad.length;i++){
				if(self.user.doc==null){
					this.users[this.usersToLoad[i]] = {nickname: "Anónimo", thumb: "/media/img/user.png"};
				}else{
					this.users[this.usersToLoad[i]] = await this.service_user({id: this.usersToLoad[i]});
				}
			}
			$scope.$digest(function(){});
		},
		formatToClient: function(doc){
			if(!this.users[doc.author] && this.usersToLoad.indexOf(doc.author)==-1){
				this.usersToLoad.push(doc.author);
			}
			doc.datefromnow = moment(new Date(doc.created), "YYYYMMDD, h:mm:ss").fromNow();
			doc.datetitle = moment(new Date(doc.created)).format("dddd, DD MMMM YYYY, h:mm:ss");
			return doc;
		},
		formatToServer: function(doc){
			doc.author = self.user.doc._id;
			doc.parent = _document._id;
			doc.created = new Date();
			return doc;
		},
		beforeCreate: function(){
			return confirm("Confirme su comentario");
		}, 
		afterCreate: function(){
			this.new();
			this.coll = [];
			this.obtained = 0;
			this.getTotal();
		}
	});
	
	var self = this;
	
});