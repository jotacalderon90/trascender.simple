app.controller("wallCtrl", function(trascender,$scope){
	
	if(typeof user!="undefined"){
		this.user = user;
		this.user.setAdmin(["admin"]);
	}
	
	let i = {
		collection: function(){
			return new trascender({
				increase: true,
				baseurl: "api/wall",
				start: function(){
					window.title = document.getElementsByTagName("title")[0].innerHTML.trim();
					this.service_user = this.serviceCreate("GET","/api/user/:id");
					this.users = {};
					this.usersToLoad = [];
					this.query = (window.title!="Muro")?{tag: window.title}:{};
					this.getTag();
					this.isLoading = false;
					$(window).scroll(()=>{this.scrolling()});	
				},
				scrolling: function(){
					if(Math.round($(window).scrollTop() + $(window).height()) == Math.round($(document).height())) {
						if(!this.isLoading && this.obtained < this.cant){
							this.getCollection();
						}
					}
				},
				afterGetTag: function(){
					this.getTotal();
				},
				afterGetTotal: function(){
					this.getCollection();
				},
				beforeGetCollection: function(){
					this.options = {skip: this.obtained, limit: this.rowsByPage, sort: {created: -1}};
					this.collectionLog = this.addLog(this.message.collection.on);
					this.usersToLoad = [];
					return true;
				},
				afterGetCollection: function(){
					setTimeout(function(){
						$(".contentHTML").each(function(){
							$(this).html($(this).data("html"));
							$(this).removeClass("contentHTML");
						});
					}, 1000);
					this.loadUserInfo();
				},
				formatToClient: function(doc){
					if(!this.users[doc.author] && this.usersToLoad.indexOf(doc.author)==-1){
						this.usersToLoad.push(doc.author);
					}
					doc.dateFrom = moment(new Date(doc.created), "YYYYMMDD, h:mm:ss").fromNow();
					doc.dateDisplay = moment(new Date(doc.created)).format("dddd, DD MMMM YYYY, h:mm:ss");
					return doc;
				},
				loadUserInfo: async function(){
					for(let i=0;i<this.usersToLoad.length;i++){
						if(self.user.doc==null){
							this.users[this.usersToLoad[i]] = {nickname: "Anónimo", thumb: "http://www.free-icons-download.net/images/anonymous-icon-16523.png"};
						}else{
							this.users[this.usersToLoad[i]] = await this.service_user({id: this.usersToLoad[i]});
						}
					}
					$scope.$digest(function(){});
				}
			});
		},
		document: function(){
			return new trascender({
				baseurl: "api/wall",
				start: function(){
					CKEDITOR.replace("input_content");
				},
				afterChangeMode: function(action,doc){
					switch(action){
						case "new":
							CKEDITOR.instances["input_content"].setData("");
						break;
					}
				},
				beforeCreate: function(){
					return confirm("Confirme posteo");
				},
				formatToServer: function(doc){
					doc.content = CKEDITOR.instances["input_content"].getData();
					doc.tag = ["Muro"];
					return doc;
				},				
				afterCreate: function(s){
					if(s){
						location.reload();
					}else{
						alert("Error!");
						console.log(x);
					}
				},
				beforeDelete: function(){
					return confirm("Confirme eliminación");
				},			
				afterDelete: function(s,x){
					if(s){
						location.reload();
					}else{
						alert("Error!");
						console.log(x);
					}
				},
			});
		}
	}
	
	for(instance in instances.wall){
		this[instances.wall[instance]] = new i[instances.wall[instance]]();
	}
	
});