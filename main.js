
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

  const BOUNDS_X = -400;
  const BOUNDS_Y = -525;
  const BOUNDS_WIDTH = 800;
  const BOUNDS_HEIGHT = 600;

  const PTM_RATIO = 500;
  const GRAVITY = 5000;
  const FRICTION = 0.1;

  const FLIPPER_SPEED = 20; // rad/s

  class Game extends Phaser__default['default'].State {
    preload() {
      this.load.image('background', './assets/background.jpg');
    }

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

      this.add.image(-400, -525, 'background');
      game.world.setBounds(BOUNDS_X, BOUNDS_Y, BOUNDS_WIDTH, BOUNDS_HEIGHT);

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
      game.debug.text('Mouse X: ' + (game.input.mousePointer.x - 400) * 10, 20, 20);
      game.debug.text('Mouse Y: ' + (game.input.mousePointer.y - 525) * 10, 20, 40);
      game.debug.box2dWorld();
    }
  }

  var outline = [
  	920.078125,
  	-4162.7734375,
  	966.484375,
  	-4180.3515625,
  	1136.3671875,
  	-4070.1171875,
  	1278.59375,
  	-3922.421875,
  	1374.21875,
  	-3719.140625,
  	1425.4296875,
  	-3386.9140625,
  	1450.9375,
  	-159.8828125,
  	1613.125,
  	-153.90625,
  	1613.2421875,
  	-1979.8046875,
  	1851.640625,
  	-2053.28125,
  	1823.359375,
  	-2213.4375,
  	1611.25,
  	-2183.1640625,
  	1607.03125,
  	-3594.21875,
  	1511.015625,
  	-3865.9375,
  	1400.546875,
  	-4129.7265625,
  	1236.2890625,
  	-4348.75,
  	943.3984375,
  	-4563.515625,
  	659.1796875,
  	-4707.421875,
  	352.3046875,
  	-4776.2109375,
  	38.2421875,
  	-4776.40625,
  	-343.4375,
  	-4725.234375,
  	-687.6953125,
  	-4581.015625,
  	-1007.5,
  	-4254.1796875,
  	-1212.890625,
  	-3919.140625,
  	-1336.6015625,
  	-3519.765625,
  	-1377.5390625,
  	-3140.3125,
  	-1316.9921875,
  	-2750.625,
  	-1206.484375,
  	-2396.484375,
  	-1151.640625,
  	-2155.546875,
  	-1498.2421875,
  	-1947.4609375,
  	-1514.140625,
  	-590.546875,
  	-799.140625,
  	-451.8359375,
  	-322.03125,
  	-119.9609375,
  	-302.4609375,
  	463.0078125,
  	162.5390625,
  	488.203125,
  	178.671875,
  	-127.890625,
  	651.2109375,
  	-454.0625,
  	1369.21875,
  	-658.59375,
  	1352.421875,
  	-1936.3671875,
  	1047.0703125,
  	-2182.5,
  	1113.515625,
  	-2492.890625,
  	1205.234375,
  	-2877.8515625,
  	1214.53125,
  	-3159.7265625,
  	1173.046875,
  	-3550.625,
  	1049.3359375,
  	-3905.078125,
  	901.9921875,
  	-4080.4296875,
  	914.1796875,
  	-4158.2421875
  ];
  var fixtures = [
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			-698.28125,
  			-4095.46875,
  			-876.9140625,
  			-3967.03125,
  			-996.09375,
  			-3749.0234375,
  			-1040.15625,
  			-3515.0390625,
  			-1077.03125,
  			-3185.15625,
  			-1052.2265625,
  			-2899.8828125,
  			-1016.953125,
  			-2784.9609375,
  			-962.65625,
  			-2705.9765625,
  			-854.1015625,
  			-2698.125,
  			-824.375,
  			-2754.84375,
  			-698.75,
  			-2814.53125,
  			-545.5078125,
  			-2823.7109375,
  			-530.7421875,
  			-2915.1171875,
  			-901.796875,
  			-3245.3515625,
  			-616.484375,
  			-3639.921875,
  			-612.6171875,
  			-3957.0703125,
  			-668.75,
  			-4070.6640625
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			553.4375,
  			-4095.46875,
  			479.453125,
  			-3994.7265625,
  			475.3125,
  			-3652.1875,
  			754.7265625,
  			-3255.703125,
  			362.421875,
  			-2913.359375,
  			388.9453125,
  			-2825.9765625,
  			495.9375,
  			-2823.90625,
  			657.578125,
  			-2754.6484375,
  			719.6484375,
  			-2681.8359375,
  			802.578125,
  			-2708.8671875,
  			877.5,
  			-2788.8671875,
  			921.484375,
  			-3064.453125,
  			913.59375,
  			-3387.03125,
  			861.6015625,
  			-3641.5625,
  			774.2578125,
  			-3863.59375,
  			596.4453125,
  			-4064.140625
  		]
  	},
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
  		type: "loop",
  		verticies: [
  			-230.46875,
  			-2557.890625,
  			-302.4609375,
  			-2394.9609375,
  			-290.8984375,
  			-2293.2421875,
  			-244.6875,
  			-2270.8203125,
  			-197.8515625,
  			-2309.53125,
  			-142.421875,
  			-2341.09375,
  			-101.09375,
  			-2343.4375,
  			-37.7734375,
  			-2313.515625,
  			20.1171875,
  			-2288.359375,
  			105.625,
  			-2322.03125,
  			118.4765625,
  			-2379.921875,
  			53.828125,
  			-2550.15625
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			-420.543212890625,
  			-4022.05078125,
  			-469.2779541015625,
  			-3995.5746459960938,
  			-477.3321533203125,
  			-3669.3670654296875,
  			-410.7904052734375,
  			-3636.7991638183594,
  			-381.180419921875,
  			-3672.940216064453,
  			-380.975341796875,
  			-3967.6339721679688,
  			-402.20916748046875,
  			-4001.1392211914062
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			-96.82525634765625,
  			-4013.96728515625,
  			-147.69805908203125,
  			-4000.758514404297,
  			-149.48455810546875,
  			-3866.093292236328,
  			-153.35052490234375,
  			-3667.2291564941406,
  			-104.76226806640625,
  			-3625.0839233398438,
  			-71.11053466796875,
  			-3666.9361877441406,
  			-57.60894775390625,
  			-3960.399932861328,
  			-74.97650146484375,
  			-3999.3234252929688
  		]
  	},
  	{
  		restitution: 0.1,
  		type: "loop",
  		verticies: [
  			202.17376708984375,
  			-4016.573944091797,
  			167.7606201171875,
  			-3992.001495361328,
  			154.99114990234375,
  			-3678.094940185547,
  			205.7177734375,
  			-3625.962677001953,
  			254.2181396484375,
  			-3672.3837280273438,
  			250.2935791015625,
  			-3976.5374755859375
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
  			x: -359.0625,
  			y: -3240.8984375
  		},
  		radius: 2.2,
  		restitution: 1
  	},
  	{
  		position: {
  			x: 180,
  			y: -3240.8984375
  		},
  		radius: 2.2,
  		restitution: 1
  	},
  	{
  		position: {
  			x: -88.0859375,
  			y: -2760
  		},
  		radius: 2.2,
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
