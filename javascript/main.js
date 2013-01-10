var gamejs = require('gamejs');


// gamejs.preload([]);
SCALE = 32;
WIDTH = SCALE * 20;

/*==================GAME===================*/
function Game(){
// def __init__
	this.surface = gamejs.display.setMode([WIDTH, 3*SCALE]);
	this.font = new gamejs.font.Font('18px Sans-serif');
	this.delay = 1000; // delay before spawning each new block
	this.delay_end = 0;
	this.stage = 1;
	this.score = 0;
	this.scoreString = "";
	// choices for random block generation
	this.block_height = [1, 2];
	this.block_lane = [0, 1, 2];
	this.block_speed = [2, 3, 4, 5];
	this.block_color = ['rgb(255,0,61)', 'rgb(255,204,51)', 'rgb(204,255,51)', 'rgb(255,51,102)', 'rgb(245,0,61)', 'rgb(184,0,46)', 'rgb(255,51,204)'];
	// set up initial variables and crap
	this.date = new Date();
	this.ticks = 0;
	this.startTime = new Date().getTime();
}
// def draw
Game.prototype.draw = function() {
	this.surface.fill("#eeeeee");
	this.scoreString = Math.round(this.score);
	this.scoreString = this.scoreString.toString();
	this.scoreString = this.scoreString.split(".")[0];
}
// def randomLevel
Game.prototype.randomLevel = function() {
	// IF A BLOCK WAS JUST MADE, START THE TIMER TO MAKE A NEW BLOCK
	if (this.delay_end == 0) {
		this.delay_end = this.delay + this.ticks;
	}
	// IF THE DELAY IS UP, MAKE A BLOCK
	if (this.delay_end < this.ticks) {
		level.newBlock( this.block_height[Math.floor(Math.random()*(this.block_height.length))],
						this.block_lane[Math.floor(Math.random()*(this.block_lane.length))],
						this.block_speed[Math.floor(Math.random()*(this.block_speed.length))],
						this.block_color[Math.floor(Math.random()*(this.block_color.length))] );
		this.delay_end = 0;
	}
}
// def changeDelay
Game.prototype.changeDelay = function() {
	this.ticks = new Date().getTime();
	if (this.ticks > (100000 + this.startTime) && this.stage == 2) {
		this.delay = 300;
		// give the player a score bonus
		this.score += 500;
		this.stage = 3;
		console.log('STAGE 3');
	}
	if (this.ticks > (50000 + this.startTime) && this.stage == 1) {
		this.delay =  500;
		// give the player a score bonus
		this.score += 100;
		this.stage = 2;
		console.log('STAGE 2');
	}
}
// def reset
Game.prototype.reset = function() {
	this.delay = 1000;
	this.delay_end = 0;
	this.startTime = this.date.getTime();
	this.stage = 1;
	this.score = 0;
	player.health = 3;
}

/*==================PLAYER===================*/
function Player(SCALE) {
	this.scale = SCALE;
	this.x = 0;
	this.y = 1 * SCALE; // can be 0,1,2
	this.width = (1 * SCALE);
	this.height = (1 + SCALE);
	this.color = 'rgb(64,64,64)';
	this.lane = 1;
	// set player's starting health
	this.health = 3;
	// this.jump is true when jumping or returning after a jump
	this.jumping = false;
}

Player.prototype.move = function(lane) {
	if (lane >= 0 && lane <= 2) {
		this.y = lane * this.scale;
		this.lane = lane;
	}
}

Player.prototype.jump = function() {
	if (this.x <= 0 && this.jumping == true) {
		this.jumping = false;
	}else if (this.x != 0 && this.jumping == true) {
		this.x -= 4;
	}
}

Player.prototype.reset = function() {
	this.y = 1 * this.scale;
}

Player.prototype.hurt = function() {
	this.health -= 1;
}

Player.prototype.checkHealth = function() {
	if (this.health == 3) {
		this.color = 'rgb(64,64,64)';
	}else if (this.health == 2) {
		this.color = 'rgb(128,128,128)';
	}else if (this.health == 1) {
		this.color = 'rgb(194,194,194)';
	}else if (this.health == 0) {
		this.color = 'rgb(255,255,255)';
	}
}

Player.prototype.draw = function(surface) {
	gamejs.draw.rect(surface, this.color, new gamejs.Rect(this.x, this.y, this.width, this.height));
}
/*==================LEVEL===================*/
function Level(scale, width) {
	this.blocks = [];
	this.scale = scale;
	this.width = width;
}
// create a new block
Level.prototype.newBlock = function(height, lane, speed, color) {
	new_block = new Block(this.scale, this.width, height, speed, lane, color);
	this.blocks.push(new_block);
}
// move all blocks to the left
Level.prototype.move = function() {
	for (var i=0; i < this.blocks.length; i++) {
		this.blocks[i].x -= this.blocks[i].speed;
	}
}
// draw all blocks
Level.prototype.draw = function(surface) {
	for (var i=0; i < this.blocks.length; i++) {
		block = this.blocks[i];
		gamejs.draw.rect(surface, this.blocks[i].color, new gamejs.Rect(this.blocks[i].x, this.blocks[i].y, this.scale, this.blocks[i].height));
	}
}
// remove blocks as they move off the screen
Level.prototype.cleanup = function() {
	for (var i=0; i < this.blocks.length; i++) {
		block = this.blocks[i];
		if (block.x < (0 - this.scale)) {
			this.blocks.splice(i, 1);
		}
	}
}
// check for collision with player
Level.prototype.collision = function() {
	for (var i=0; i < this.blocks.length; i++) {
		block = this.blocks[i];
		
		for (var j=0; j < block.lane.length; j++) {
		
			if (player.lane == block.lane[j]) {
				if (block.x > player.x && block.x < (player.x + this.scale)) {
					player.hurt();
					this.blocks.splice(i, 1);
				}
			}
			
		}
		
	}
}

function Block(scale, width, height, speed, lane, color) {
	this.x = width;
	this.y = lane * scale;
	this.height = height * scale;
	this.speed = speed;
	this.lane = [lane];
	this.color = color;
	if (height == 2) {
		this.lane.push(lane+1);
	}
}

//MAIN PRE-LOOP
player = new Player(SCALE)
level = new Level(SCALE, WIDTH)
game = new Game();

running = false;

function main(){
	keys_up = [true, true, true];
	function tick(msDuration) {
		var events = gamejs.event.get();
		if (running == true) {
		//KEYPRESSES
		//PLAYER: CHANGE LANES
			events.forEach(function(event) {
				if (event.type === gamejs.event.KEY_DOWN) {
					if (event.key == gamejs.event.K_UP) {
						player.move(0);
						keys_up[0] = false;
					} else if (event.key === gamejs.event.K_DOWN) {
						player.move(2);
						keys_up[1] = false
					} else if (event.key == gamejs.event.K_SPACE) {
						keys_up[2] = false
					//RESTART THE GAME
					} else if (event.key == gamejs.event.K_r) {
						game.reset()
					} else if (event.key == gamejs.event.K_ESC) {
						running = false;
					}
				}
				if (event.type == gamejs.event.KEY_UP) {
					if (event.key == gamejs.event.K_UP) {
						keys_up[0] = true;
					}
					if (event.key == gamejs.event.K_DOWN) {
						keys_up[1] = true;
					}
					if (event.key == gamejs.event.K_SPACE) {
						keys_up[2] = true;
					}
				}
				if (keys_up[0] == true && keys_up[1] == true) {
					player.move(1);
				}

			});
		if (keys_up[2] == false) {
			player.x = SCALE * 2;
			player.jumping = true;
		}
		//PLAYER: OTHER
		player.jump()
		player.checkHealth()
		//LEVEL RELATED
		game.changeDelay()
		game.randomLevel()
		level.move()
		level.collision()
		level.cleanup()
		if (player.health == 0) {
			running = false;
		}
		//DRAW EVERYTHING!
		game.draw();
		level.draw(game.surface);
		player.draw(game.surface);
		game.surface.blit(game.font.render(game.scoreString), [1,1]);
		//TICK THE CLOCK!
		//clock.tick(60)
		//ADD TO SCORE
		game.score += 0.1;
		}else{
			events.forEach(function(event) {
				if (event.type === gamejs.event.KEY_DOWN) {
					if (event.key == gamejs.event.K_r) {
						keys_up = [true, true, true];
						game.reset();
						running = true;
					}
				}
			});
			game.surface.blit(game.font.render('     play again? (r)'), [1, SCALE]);
		}
		// DEBUGGING
		//console.log(quit);
	}
	gamejs.time.fpsCallback(tick, this, 60);
}
	
	
gamejs.ready(main);