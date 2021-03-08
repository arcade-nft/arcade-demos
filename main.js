
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (Phaser$1) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Phaser__default = /*#__PURE__*/_interopDefaultLegacy(Phaser$1);

  var Globals = {
    PTM: 100,
  };

  class Ball {
    constructor(game, body, x, y) {
      this.startX = x;
      this.startY = y;

      game.physics.box2d.restitution = 0.1;

      this.body = new Phaser.Physics.Box2D.Body(game, null, x * Globals.PTM, y * Globals.PTM);
      this.body.setCircle(0.64 * Globals.PTM);
      this.body.bullet = true;
    }

    registerContactCallback(fixture, callback, ref) {
      this.body.setFixtureContactCallback(fixture, callback, ref);
    }

    reset() {
      this.body.x = this.startX * Globals.PTM;
      this.body.y = this.startY * Globals.PTM;
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.body.angularVelocity = 0;
    }
  }

  class Fixture$1 {
    constructor(game, body, vertices, type, restitution) {
      game.physics.box2d.restitution = restitution;

      if (type === 'loop') {
        this.body = body.addLoop(vertices);
      } else if (type === 'chain') {
        this.body = body.addChain(vertices);
      } else if (type === 'edge') {
        this.body = body.addEdge(vertices[0], vertices[1], vertices[2], vertices[3]);
      }
    }
  }

  class Circle {
    constructor(game, body, x, y, radius, restitution) {
      game.physics.box2d.restitution = restitution;

      this.body = body.addCircle(radius * Globals.PTM, x, y);
    }
  }

  const MOTOR_SPEED = 2;
  const MOTOR_TORQUE = 100;

  class Fixture {
    constructor(game, body, x, y, vertices) {
      game.physics.box2d.restitution = 0.1;

      this.body = new Phaser.Physics.Box2D.Body(game, null, x * Globals.PTM, y * Globals.PTM, 2);
      this.body.addPolygon(vertices);

      // bodyA, bodyB, ax, ay, bx, by, motorSpeed, motorTorque, motorEnabled, lowerLimit, upperLimit, limitEnabled
      this.joint = game.physics.box2d.revoluteJoint(body, this.body, x * Globals.PTM, y * Globals.PTM, 0, 0, MOTOR_SPEED, MOTOR_TORQUE, true, -25, 25, true);
    }
  }

  const BACKGROUND = '#124184';

  const BOUNDS_X = -400;
  const BOUNDS_Y = -525;
  const BOUNDS_WIDTH = 800;
  const BOUNDS_HEIGHT = 600;

  const PTM_RATIO = 500;
  const GRAVITY = 5000;
  const FRICTION = 0.1;

  const FLIPPER_SPEED = 20; // rad/s

  class Game extends Phaser__default['default'].State {
    init(config) {
      this.config = config;
      this.fixtures = [];
      this.circles = [];
    }

    create() {
      const {
        game,
        config: { outline, fixtures, circles, leftFlipper, rightFlipper, gutter, launcher },
      } = this;

      game.world.setBounds(BOUNDS_X, BOUNDS_Y, BOUNDS_WIDTH, BOUNDS_HEIGHT);

      game.stage.backgroundColor = BACKGROUND;

      game.physics.startSystem(Phaser__default['default'].Physics.BOX2D);
      game.physics.box2d.ptmRatio = PTM_RATIO;
      game.physics.box2d.gravity.y = GRAVITY;
      game.physics.box2d.friction = FRICTION;

      const body = new Phaser__default['default'].Physics.Box2D.Body(game, null, 0, 0, 0);
      body.addLoop(outline);

      for (let i = 0; i < fixtures.length; i++) {
        const { verticies, type, restitution } = fixtures[i];
        this.fixtures.push(new Fixture$1(game, body, verticies, type, restitution));
      }

      for (let i = 0; i < circles.length; i++) {
        const { position, radius, restitution } = circles[i];
        this.circles.push(new Circle(game, body, position.x, position.y, radius, restitution));
      }

      this.leftFlipper = new Fixture(game, body, leftFlipper.x, leftFlipper.y, leftFlipper.verticies);
      this.rightFlipper = new Fixture(game, body, rightFlipper.x, rightFlipper.y, rightFlipper.verticies);

      this.gutter = new Fixture$1(game, body, gutter.verticies, 'edge');
      this.gutter.body.SetSensor(true);

      this.ball = new Ball(game, body, 17.5016, -21.318);
      this.ball.registerContactCallback(this.gutter.body, this.onHitGutter, this);

      this.launcher = new Fixture$1(game, body, launcher.verticies, 'edge', 2);

      this.cursors = game.input.keyboard.createCursorKeys();
      game.input.mouse.capture = true;
    }

    onHitGutter(body1, body2, fixture1, fixture2, begin) {
      this.shouldReset = true;
    }

    reset() {}

    update() {
      if (this.shouldReset) {
        this.ball.reset();
        this.shouldReset = false;
      }

      if (this.cursors.left.isDown) {
        this.leftFlipper.joint.SetMotorSpeed(-FLIPPER_SPEED);
      } else {
        this.leftFlipper.joint.SetMotorSpeed(FLIPPER_SPEED);
      }

      if (this.cursors.right.isDown) {
        this.rightFlipper.joint.SetMotorSpeed(FLIPPER_SPEED);
      } else {
        this.rightFlipper.joint.SetMotorSpeed(-FLIPPER_SPEED);
      }
    }

    render() {
      const { game } = this;
      game.debug.box2dWorld();
      game.debug.text('Mouse X: ' + game.input.mousePointer.x, 20, 20);
      game.debug.text('Mouse Y: ' + game.input.mousePointer.y, 20, 40);
    }
  }

  var outline = [
  	1440,
  	-3186.59,
  	1376.96,
  	-3195.95,
  	1023.88,
  	-2194.34,
  	1345.45,
  	-1961.25,
  	1345.45,
  	-663.375,
  	638.684,
  	-480.341,
  	160.054,
  	-154.361,
  	150.206,
  	471.008,
  	-318.575,
  	470.023,
  	-319.559,
  	-153.376,
  	-800.158,
  	-480.341,
  	-1519.35,
  	-619.21,
  	-1518.23,
  	-1988.98,
  	-1147.38,
  	-2175.73,
  	-1429.31,
  	-3152.17,
  	-1500.1,
  	-3195.52,
  	-1492.51,
  	-3399.68,
  	-1438.82,
  	-3867.33,
  	-1309.07,
  	-4132.41,
  	-1112.22,
  	-4351.64,
  	-787.851,
  	-4540.67,
  	-389.666,
  	-4670.41,
  	139.843,
  	-4778.28,
  	655.92,
  	-4846.15,
  	872.006,
  	-4837.87,
  	1067.14,
  	-4792.27,
  	1236.26,
  	-4700.02,
  	1374.63,
  	-4584.71,
  	1480.34,
  	-4440.57,
  	1557.21,
  	-4271.45,
  	1601.65,
  	-3992.59,
  	1601.41,
  	-3712.19,
  	1604.11,
  	-2197.86,
  	1814.72,
  	-2234.37,
  	1848.77,
  	-2057.55,
  	1600,
  	-2003.04,
  	1600,
  	-171.408,
  	1442.93,
  	-169.434,
  	1439.5,
  	-663.941
  ];
  var fixtures = [
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			-825.819,
  			-746.541,
  			-771.419,
  			-853.487,
  			-1280,
  			-1120,
  			-1280,
  			-1759.99,
  			-1360,
  			-1759.99,
  			-1360,
  			-959.993
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			663.001,
  			-743.13,
  			614.862,
  			-855.893,
  			1119.91,
  			-1121.82,
  			1123.3,
  			-1760.68,
  			1200.08,
  			-1759.99,
  			1200.08,
  			-959.993
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "chain",
  		verticies: [
  			-1116.81,
  			-1753.55,
  			-1118.98,
  			-1277.67,
  			-878.975,
  			-1117.67
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "chain",
  		verticies: [
  			721.698,
  			-1128.55,
  			956.731,
  			-1282.32,
  			956.731,
  			-1762.32
  		]
  	},
  	{
  		restitution: 1,
  		type: "edge",
  		verticies: [
  			-1042.47,
  			-1763.21,
  			-826.297,
  			-1160.74
  		]
  	},
  	{
  		restitution: 1,
  		type: "edge",
  		verticies: [
  			883.433,
  			-1767.01,
  			669.858,
  			-1171.73
  		]
  	}
  ];
  var circles = [
  	{
  		position: {
  			x: 1406,
  			y: -3183.89
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -1320,
  			y: -1759.99
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -1078.86,
  			y: -1753.03
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -861.88,
  			y: -1152.05
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 918.723,
  			y: -1760.8
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 1160.08,
  			y: -1759.99
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 704.87,
  			y: -1161.38
  		},
  		radius: 0.35,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -1500.82,
  			y: -3132.63
  		},
  		radius: 1,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -866.447,
  			y: -3163.29
  		},
  		radius: 1,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 187.945,
  			y: -3415.55
  		},
  		radius: 1,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 614.227,
  			y: -3074.23
  		},
  		radius: 1,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 396.293,
  			y: -2242
  		},
  		radius: 1,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -446.686,
  			y: -3704.69
  		},
  		radius: 2.8,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 309.841,
  			y: -4133.62
  		},
  		radius: 2.8,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 995.658,
  			y: -3595.05
  		},
  		radius: 2.8,
  		restitution: 1
  	}
  ];
  var leftFlipper = {
  	x: -8,
  	y: -7.99956,
  	verticies: [
  		560,
  		32,
  		560,
  		-32,
  		0,
  		-64,
  		0,
  		64
  	]
  };
  var rightFlipper = {
  	x: 6.4,
  	y: -7.99956,
  	verticies: [
  		0,
  		64,
  		0,
  		-64,
  		-560,
  		-32,
  		-560,
  		32
  	]
  };
  var gutter = {
  	verticies: [
  		-480.857,
  		413.599,
  		293.837,
  		413.599
  	]
  };
  var launcher = {
  	verticies: [
  		1401.35,
  		-224.963,
  		1631.98,
  		-224.963
  	]
  };
  var layout = {
  	outline: outline,
  	fixtures: fixtures,
  	circles: circles,
  	leftFlipper: leftFlipper,
  	rightFlipper: rightFlipper,
  	gutter: gutter,
  	launcher: launcher
  };

  let game;

  const newGame = () => {
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'pinball');

    game.state.add('game', Game);

    game.state.start('game', false, false, layout);
  };

  newGame();

}(Phaser));
