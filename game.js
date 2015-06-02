var Bubbles = {
	canvas: false,
	ctx: false,
	init: function() {
		console.log('Danke, dass Du Bubbles spielst!');
		Bubbles.canvas = document.getElementById('canvas');
		Bubbles.ctx = Bubbles.canvas.getContext('2d');
		Bubbles.resize();
		//Paul Irish Shim für requestAnimationFrame
		window.requestAnimFrame = (function(){
  			return  window.requestAnimationFrame       || 
          	window.webkitRequestAnimationFrame || 
          	window.mozRequestAnimationFrame    || 
          	window.oRequestAnimationFrame      || 
         	window.msRequestAnimationFrame     || 
          	function( callback ){
            window.setTimeout(callback, 1000 / 60);
          	};
		})();
		//unsere Assets laden
		console.log('Lade Spiel Ressourcen...');
 		Bubbles.assets.addRessource('assets/bubbles.png');
 		Bubbles.assets.addRessource('assets/start.png');
 		Bubbles.assets.addRessource('assets/bubble20.png');
 		Bubbles.assets.addRessource('assets/bubble50.png');
 		Bubbles.assets.addRessource('assets/bubble100.png');
		Bubbles.assets.download();
		//Spiel starten
		Bubbles.loop();
	},
	resize: function() {
		Bubbles.canvas.width = window.innerWidth;
		Bubbles.canvas.height = window.innerHeight;
	},
	input: {
		x: 0,
		y: 0,
		radius: 10,
		clicked: false,
		click: function(e) {
			e.preventDefault();
			Bubbles.input.x = e.x;
			Bubbles.input.y = e.y;
			Bubbles.input.clicked = true;
		}
	},
	loop: function() {
		//unsere update()-Funktion aufrufen
		Bubbles.update();
		//unsere render()-Funktion aufrufen
		Bubbles.render();
		//hier wiederholen wir die game loop
		requestAnimationFrame(Bubbles.loop);
	},
	render:function() {
		//den Bildschirm löschen und HIntergrund zeichnen
		Bubbles.draw.fillGradient('#2980b9','#429FDD');
		Bubbles.draw.fillRect(0,0,Bubbles.canvas.width,Bubbles.canvas.height);
		//entscheiden, welche Szene gerendert werden muss
		if(Bubbles.scenes.current == 'loading') {
			Bubbles.scenes.loading.render();
		}
		if(Bubbles.scenes.current == 'mainMenu') {
			Bubbles.scenes.mainMenu.render();
		}
		if(Bubbles.scenes.current == 'game') {
			Bubbles.scenes.game.render();
		}
	},
	update: function() {
		//entscheiden, welche Szene geupdatet werden muss
		if(Bubbles.scenes.current == 'loading') {
			Bubbles.scenes.loading.update();
		}
		if(Bubbles.scenes.current == 'mainMenu') {
			Bubbles.scenes.mainMenu.update();
		}
		if(Bubbles.scenes.current == 'game') {
			Bubbles.scenes.game.update();
		}
	},
	draw: {
		fillRect: function(x,y,width,height) {
			Bubbles.ctx.fillRect(x,y,width,height);
		},
		fillGradient: function(color1,color2) {
			//Achtung - nur top to bottom!
			var gradient = Bubbles.ctx.createLinearGradient(0,0,0,170);
			gradient.addColorStop(0,color1);
			gradient.addColorStop(1,color2);
			Bubbles.ctx.fillStyle = gradient;
		},
		drawImage: function(img,x,y) {
			Bubbles.ctx.drawImage(img,x,y);
		},
		text: function(text,x,y,size,color) {
			Bubbles.ctx.fillStyle = color;
			Bubbles.ctx.font = size + 'px Verdana';
			Bubbles.ctx.fillText(text,x,y);
		}
	},
	scenes: {
		current: 'loading',
		loading: {
			render: function() {
				Bubbles.draw.drawImage(document.getElementById('lade'),(Bubbles.canvas.width-400)/2,(Bubbles.canvas.height-41)/2);
			},
			update: function() {
				//wenn alle Ressourcen geladen sind, dann zeige das Hauptmenü
				if(Bubbles.assets.isDone() == true) {
					console.log('Alle Ressourcen geladen!');
					Bubbles.scenes.current = 'mainMenu';
				}
			}
		},
		mainMenu: {
			render: function() {
				//jetzt zeichnen wir das Hauptmenü! yeah!
				//die Überschrift
				Bubbles.draw.drawImage(Bubbles.assets.getAsset('assets/bubbles.png'),(Bubbles.canvas.width-369)/2,80);
				//den Start-Button
				Bubbles.draw.drawImage(Bubbles.assets.getAsset('assets/start.png'),(Bubbles.canvas.width-400)/2,200);
			},
			update: function() {
				//prüfen, ob der Start Button gedrückt wurde
				if(Bubbles.input.clicked == true) {
					//simple collision-detection
					if(Bubbles.collision(Bubbles.input,{x:(Bubbles.canvas.width-400)/2+200,y:404,radius:204})) {
						//Szene ändern
						//jetzt wird wirklich gespielt hier!
						Bubbles.scenes.current = 'game';
					}
					Bubbles.input.clicked = false;
				}
			}
		},
		game: {
			render: function() {
				//alle Blasen zeichnen
				for(var i = 0; i < Bubbles.entities.entities.length-1; i++) {
					var ent = Bubbles.entities.entities[i];
					Bubbles.draw.drawImage(Bubbles.assets.getAsset(ent.asset),ent.x-ent.radius,ent.y-ent.radius);
					//beim Zeichnen müssen wir den Versatz beachten!
				}
				//erreichte Punkte zeichnen
				var score = 'Score: ' + Bubbles.entities.score;
				Bubbles.draw.text(score,36,36,32,'#fff');
			},
			update: function() {
				//alle Blasen updaten
				for(var i = 0; i < Bubbles.entities.entities.length; i++) {
					Bubbles.entities.entities[i].update();
					//gucken´ob Blasen geklickt wurden
					if(Bubbles.input.clicked == true) {
						if(Bubbles.collision(Bubbles.input,Bubbles.entities.entities[i])) {
							//Blase löschen
							Bubbles.entities.entities[i].remove = true;
							//und hundert Punkte geben
							Bubbles.entities.score += 100;
						}
						Bubbles.input.clicked = false;
					}
					//gucken, ob wir die Blase löschen müssen?!
					if(Bubbles.entities.entities[i].remove == true) {
						Bubbles.entities.entities.splice(i,1);
						Bubbles.entities.onScreen -= 1;
					}
				}
				//jetzt gucken wir, ob wir neue Blasen malen müssen
				if(Bubbles.entities.onScreen <= Bubbles.entities.maxOnScreen && Bubbles.entities.ticks >= 80) {
					Bubbles.entities.add();
					Bubbles.entities.ticks = 0;
				}
				//Ticks updaten
				Bubbles.entities.ticks += 1;
			}
		}
	},
	entities: {
		ticks: 0, //ist hier einfach so gelandet
		score: 0, //noch so etwas hier
		entities: new Array(),
		maxOnScreen: 4,
		onScreen: 0,
		add: function() {
			var blase ={};
			//hier entscheiden wir uns erst einmal, welchen Typ von Blase wir erstellen wollen
			var typ = Math.floor((Math.random() * 3) + 1);
			if(typ == 1) {
				blase.radius = 10;
				blase.asset = 'assets/bubble20.png';
			}
			if(typ == 2) {
				blase.radius = 25;
				blase.asset = 'assets/bubble50.png';
			}
			if(typ == 3) {
				blase.radius = 50;
				blase.asset = 'assets/bubble100.png';
			}
			//die Blase an einer zufälligen x-Stelle außerhalb des Bildschirm erscheinen lassen
			blase.x = Math.floor((Math.random() * (Bubbles.canvas.width-100)) + 1) + 50;
			//mit den minus 100 und plus 50 stellen wir sicher, dass die Blase sichtbar ist und nicht außerhalb des Bildschirms! z.B. bei x=canvas.width
			//jetzt setzen wird das y noch auf den unsichtbaren Bereich
			blase.y = Bubbles.canvas.height + 110;
			//hier specihern wir, ob wir die Blase löschen müssen
			blase.remove = false;
			//unsere Blase bekommt jetzt noch eine eigene Update Funktion
			blase.update = function() {
				this.y -= 1;
				//wenn die Blase oberhalb des sichtbaren Bereiches ist, dann löschen wir sie wieder
				if(this.y <= -100) {
					this.remove = true;
					//außerdem müssen wir Punkte abziehen, wenn die Blase hier ankommt
					Bubbles.entities.score -= 20;
				}
			};
			//und der Rest
			blase.index = Bubbles.entities.entities.length; //Das brauchen wir nachher zum löschen der Blase!
		 	Bubbles.entities.onScreen += 1;
		 	Bubbles.entities.entities.push(blase);
		}
	},
	assets: {
		list: new Array(),
		cache: new Array(),
		done: 0,
		addRessource: function(url) {
			Bubbles.assets.list.push(url);
		},
		download: function() {
 			for(var i = 0; i <= Bubbles.assets.list.length - 1; i++) {
				var img = new Image();
				img.addEventListener('load',function() {
					//done count erhöhen
					Bubbles.assets.done++;
				},false);
				//kein Error-Handling -> müsste man mit addEventListener('error') hinzufügen
				var url = Bubbles.assets.list[i];
				img.src = url;
				Bubbles.assets.cache[url] = img;
			}
		},
		isDone: function() {
			if(Bubbles.assets.done == Bubbles.assets.list.length) {
				return true;
			}
			return false;
		},
		getAsset: function(url) {
			return Bubbles.assets.cache[url];
		}
	},
	collision: function(a,b) {
		//der Hintergrund dazu befindet sich hier: http://mathworld.wolfram.com/Circle-CircleIntersection.html !!!
		var distance_squared = ( ((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)));
		var radii_squared = (a.radius + b.radius) * (a.radius + b.radius);
		if(distance_squared < radii_squared) {
       		return true;
       	} 
       	else{
       		return false;
       	}
	}
};
window.addEventListener('load',Bubbles.init,false);
window.addEventListener('resize',Bubbles.resize,false);
window.addEventListener('mousedown',Bubbles.input.click,false);