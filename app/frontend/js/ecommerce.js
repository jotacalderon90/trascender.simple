app.controller("ecommerceCtrl", function(trascender,$scope){
	this.ecommerce = new trascender({
		baseurl: "/ecommerce/transaction",
		default: function(){
			return {email: "", message: "", product: []};
		},
		start: function(){
			this.message.create = {
				on: "Solicitando carro de compra", 
				error: "Error al solicitar carro de compra", 
				success: "Carro de compra solicitado correctamente"
			};
			this.new();
			let cart = localStorage.getItem("cart");
			if(cart!=null && cart!=""){
				let products = (atob(cart)).split("||");
				for(var i=0;i<products.length;i++){
					let product = products[i].split("##");
					this.newdoc.product.push({
						id: product[0],
						title: product[1],
						price: parseInt(product[2]),
						cant: parseInt(product[3]),
						dcto: parseInt(product[4]),
						img: product[5]
					});
				}
			}
			this.newdoc.email = (user.doc && user.doc.email)?user.doc.email:"";
		},
		calculaterow: function(row){
			return row.price * row.cant;
		},
		calculatetotal: function(){
			if(this.newdoc!=null){
				var total = 0;
				for(var i=0;i<this.newdoc.product.length;i++){
					total += this.newdoc.product[i].price * this.newdoc.product[i].cant
				}
				return total;
			}else{
				return "null";
			}
		},
		validMail: function(data){
			let exp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(data!=undefined && data.trim()!="" && exp.test(data)){
				return true;
			}else{
				return false;
			}
		},
		beforeCreate: function(doc){
			
			if(!this.validMail(doc.email)){
				alert("Email inválido");
				return false;
			}
			
			try{
				doc["g-recaptcha-response"] = grecaptcha.getResponse();
			}catch(e){
				if(e.toString()!="ReferenceError: grecaptcha is not defined"){
					console.log(e);
				}
			}
			
			return true;
		},
		afterCreate: function(success, xhttp){
			if(success){
				localStorage.setItem("cart","");
				setTimeout(function(){ 
					window.location.href = "/";
				}, 3000);
			}else if(typeof xhttp.json.error=="string"){
				xhttp.json.error = {error: xhttp.json.error};
			}
			$scope.$digest(function(){});
		},
		remove: function(index){
			this.newdoc.product.splice(index,1);
			this.updateCart();
		},
		updateCart: function(){
			let cart = "";
			for(let i=0;i<this.newdoc.product.length;i++){
				cart += this.newdoc.product[i]._id + 
				"##" + this.newdoc.product[i].title + 
				"##" + this.newdoc.product[i].price + 
				"##" + this.newdoc.product[i].cant + 
				"##" + this.newdoc.product[i].dcto + 
				"##" + this.newdoc.product[i].img;
				if(cart+1<this.newdoc.product.length){
					cart += "||";
				}
			}
			localStorage.setItem("cart",btoa(cart));
		}
	});
});