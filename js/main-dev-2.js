var global={};
var app = app || { path: "" };
var mgs = mgs || {};
var noSleep;

global.size = {width: 1080, height: 610}; //landscape;
//global.size = {width: 610, height: 1080}; //portrait
global.center = {x: global.size.width / 2, y: global.size.height / 2};

const debugMode = false;

const betDenom = [1,2,5,10,20,50,100,200,500,1000];
let betDenomCounter = 0;


let balance = 700;
//let winAmount = 0;

let coinAnim;
let elem = {};
let sfx = {};

global.clickStatus = false;
global.autoStatus = false;

const gameConfig = {
    winRate : .6,
    loseType : ()=>{
        return Math.floor( Math.random() * 3 ); //0-rotten, 1-poop, 2-attack
    },
    selectedChickenIndex : 1,//0-2;
}

//400,550
const spoonPosition = [
    {x: 195 , y: 500 },
    {x: 440, y: 500 },
    {x: 685, y: 500 },
]

const defaultSfxMarker = [
    {name : 'betAmt', start : 0, duration : .2, config : { volume : .3 } },

    {name : 'click-sfx', start : 1, duration : .2, config : { volume : .3 } },
    {name : 'submit-sfx', start : 2, duration : .5, config : { volume : .3 } },
    {name : 'deselect-sfx', start : 3, duration : .5, config : { volume : .3 } },
    {name : 'error-sfx', start : 4, duration : .5, config : { volume : .3} },
    {name : 'coin-sfx', start : 5, duration : .7, config : { volume : .3 } },

    {name : 'win-sfx', start : 6, duration : 1.5, config : { volume : .3 } },
    {name : 'win-small-sfx', start : 8, duration : .5, config : { volume : .3 } },
    {name : 'tallyloop', start : 9, duration : .47, config : { volume : .3, loop: true } },
]

class OpeningScene extends Phaser.Scene{
    constructor(){
        super({
            key : 'OpeningScene',
            active : true,
        })
    }
    init(data){

    }
    preload(){
        this.load.setPath('asset/texture');
        this.load.atlas('story-bg','story-bg.png','story-bg.json');
        this.load.image('bg-opening-scene.png','bg-opening-scene.png');
        this.load.spine('farmer-spine', 'farmer.json', [ 'farmer.atlas' ], true);

        this.load.spine('bg-spine', 'bg.json', [ 'bg.atlas' ], true);
        this.load.spine('door-spine', 'door.json', [ 'door.atlas' ], true);
        this.load.spine('chick2', 'chick2.json', [ 'chick2.atlas' ], true);
        this.load.spine('chicken-spine2', 'chicken-spine.json', [ 'chicken-spine.atlas' ], true);

        this.load.audio('bgm','../audio/chicken-farm-bgm.mp3');
        this.load.audio('chicken-bgm','../audio/noisy-chicken-bg.mp3');
    }
    create(){
        this.sound.play('bgm',{ volume : .15 , loop: true });
        this.sound.play('chicken-bgm',{ volume : .3 , loop: true });

        //this.scene.sleep('MainScene');
        const bgSpine = this.add.spine(540,305,'bg-spine','idle',true).setVisible(true);
        const farmerSpine = this.add.spine(340,430,'farmer-spine','idle',true).setDepth(1).setVisible(true).setScale(.7);
        const doorSpine = this.add.spine(540,305,'door-spine').setDepth(2).setVisible(true);
        const chick2Spine = this.add.spine(540,305,'chick2','eat3',true).setDepth(2).setVisible(true);

        const bg2 = this.add.image(540,305,'bg-opening-scene.png').setVisible(false);
        const cage = this.add.image(1080-180,600-120,'story-bg','cage.png').setVisible(false).setScale(1.1).setDepth(4);

        const chickenMain = this.add.spine(900,545,'chicken-spine2','my-precious',true).setSkinByName('main').setScale(1.5).setDepth(5).setVisible(false);
        const chickenYellow = this.add.spine(590,545,'chicken-spine2','sleep',true).setSkinByName('yellow').setScale(1.5).setDepth(5).setVisible(false);
        const storyPanel = this.add.image(540,50,'story-bg','msg-story.png').setDepth(5).setScale(.9,.8);
        const skipBtn = this.add.image(70,580,'story-bg','btn-skip.png').setScale(.8).setDepth(10).setInteractive();
        skipBtn.on('pointerdown',()=>{
            this.scene.start('MainScene');
            this.scene.run('MuteGame');
        })

        farmerSpine.setMix('walk-flip','scratch',.3)

        let isOpeningScenePlaying = false;
        const playOpeningScene = ()=>{
            if(isOpeningScenePlaying)return console.warn("Waring: Opening Secen is Playing");
            isOpeningScenePlaying = true;

            chickenMain.setVisible(false);
            chickenYellow.setVisible(false);
            bg2.setVisible(false);
            cage.setVisible(false);
            bgSpine.setVisible(true);
            chick2Spine.setVisible(true);
            farmerSpine.setVisible(true).setPosition(340,430).setScale(.7).setDepth(1);
            doorSpine.setVisible(true);
            doorSpine.clearTracks();
            doorSpine.setToSetupPose();
            
            setTimeout(()=>{
                doorSpine.play('open',false);
                farmerSpine.play('walk-flip',true);
            },700);
            this.tweens.timeline({
                targets : farmerSpine,
                tweens : [
                    {
                        delay : 600,
                        duration : 1200,
                        scaleX : 1.2,
                        scaleY : 1.2,
                        y : 600, //600
                        onComplete : ()=>{
                            farmerSpine.setDepth(3);
                            //console.log('open')
                        }
                    },
                    {
                        duration : 3000,
                        scaleX : 2.5,
                        scaleY : 2.5,
                        x : 1500,
                        y : 800,
                    }
                ],
                onComplete : ()=>{
                    bgSpine.setVisible(false);
                    doorSpine.setVisible(false);
                    //farmerSpine.setVisible(false);
                    chick2Spine.setVisible(false);
                    
                    
                    //seconc scene
                    chickenMain.setVisible(true);
                    chickenYellow.setVisible(true);
                    bg2.setVisible(true);
                    cage.setVisible(true);
                    farmerSpine.setPosition(-150,305).setScale(1);
                    farmerSpine.play('walk-flip',true);
                    this.tweens.add({
                        targets : farmerSpine,
                        duration : 2500,
                        y : 720,
                        x : 220,
                        scaleX : 2.3,
                        scaleY : 2.3,
                        onComplete : ()=>{
                            farmerSpine.play('scratch',false);
                            farmerSpine.once('complete',()=>{
                                farmerSpine.play('after-scratch-idle',true);
                            })
                            isOpeningScenePlaying = false;
                            setTimeout(()=>{
                                this.scene.start('MainScene');
                                this.scene.run('MuteGame');
                            },5000)
                        }
                    })

                }
            })
        }
        playOpeningScene();
    }
    update(){

    }
}

class MainScene extends Phaser.Scene{
    constructor(){
        super({
            key : 'MainScene',
            active : false,
            visible : false,
            pack : {
                files : [
                    { type : 'image' , key : 'loading-page' , url : 'asset/texture/loading-page.jpg'},
                   //{ type : 'bitmapFont' , key : 'creepster', textureURL: 'asset/texture/creepster.png' , fontDataURL : 'asset/texture/creepster.xml' }
                    //{ type : 'spritesheet', key : 'balloonLoading' , url : 'asset/texture/bet-summary.png' , frameConfig : { frameWidth: 62, frameHeight: 84}  }
                    // { type: 'scenePlugin', key: 'SpinePlugin', url: 'js/SpinePluginDebug2.js', sceneKey: 'spine' }
                ]
            }
        })
    }
    init(data){
        
    }
    preload(){
        const loadingPage = this.add.image(global.center.x, global.center.y,'loading-page');
        const loadingBar = this.add.graphics();
        this.load.on('progress',(data)=>{
            loadingBar.clear();
            loadingBar.fillStyle(0xff731e,1);
            loadingBar.fillRect(40,573,1002*data,15);
        });
        this.load.on('complete',(data)=>{
            loadingBar.destroy();
            loadingPage.destroy();
        });
        

        this.load.setPath('asset/texture');
        this.load.spritesheet('bal-emit','bal-emit.png',{ frameWidth: 75, frameHeight : 34 });
        this.load.spritesheet('coin','coin.png',{ frameWidth: 75, frameHeight : 75 });
        this.load.spritesheet('toggle','fullscreenToggle.png',{ frameWidth: 143, frameHeight : 152 });
        this.load.spritesheet('fly.png','fly-sprite2.png',{ frameWidth: 36, frameHeight : 38 });
        
        //image
        this.load.atlas('main','main.png','main.json');
        this.load.atlas('main-bg','main-bg.png','main-bg.json');

        this.load.image('rays3.png','rays3.png');


        //bitmap
        this.load.bitmapFont('skarjan','skarjan.png','skarjan.xml');

        //audio
        this.load.audio('default-sfx','../audio/default-sfx.mp3');
        this.load.audio('chicken-sfx','../audio/chicken-sfx.mp3');

        

        //spine
        //this.load.spine('character-spine', 'character-spine.json', [ 'character-spine.atlas' ], true);
        this.load.spine('chicken-spine', 'chicken-spine.json', [ 'chicken-spine.atlas' ], true);
        this.load.spine('clouds', 'clouds.json', [ 'clouds.atlas' ], true);
        this.load.spine('chick-spine', 'chick.json', [ 'chick.atlas' ], true);
        this.load.spine('scoop', 'scoop.json', [ 'scoop.atlas' ], true);

        
    }
    create(){
        const chickenSfx = [
            {name : 'chicken-1-sfx', start : 0, duration : .6, config : { volume : 1 } },
            
            {name : 'chicken-2-sfx', start : 1, duration : 1, config : { volume : 1 } },
            {name : 'chicken-wings-sfx', start : 2, duration : 1, config : { volume : .7 } },
            {name : 'peck-sfx', start : 3, duration : 1, config : { volume : .7 } },
            {name : 'lose-3-sfx', start : 4, duration : .5, config : { volume : .4 } },
        ]

        const tallyloop = this.sound.add('default-sfx');
        tallyloop.addMarker( defaultSfxMarker[8] );
        //tallyloop.play('tallyloop');

        if(debugMode){
            const debugBtn = this.add.image(global.size.width-50,50,'toggle',0).setDepth(20).setScale(.5).setScrollFactor(0).setInteractive();
            debugBtn.on('pointerup',()=>{
                if(debugBtn.frame.name === 0){
                    
                    this.scale.startFullscreen();
                    debugBtn.setFrame(1);
                }else{
                    
                    this.scale.stopFullscreen();
                    debugBtn.setFrame(0);
                }
                
            },this)
        }
        
        //opening scene
        //const openingScene = this.add.container();
        
        //openingScene.add([ bgSpine, farmerSpine, doorSpine ]);
        //openingScene.setDepth(30).setVisible(false);

        const sky = this.add.image(540,0,'main-bg','sky.png').setOrigin(.5,0);
        const cloudsStatic = this.add.image(540,0,'main-bg','clouds-static.png').setOrigin(.5,0).setAlpha(.7);
        const clouds = this.add.spine(540,200,'clouds','idle',true).setSkinByName('day').setScale(.8).setInteractive();
        clouds.timeScale = .5;
        const fg = this.add.image(540,610,'main-bg','fg.png').setOrigin(.5,1);
        const fan = this.add.image(85,90,'main','propeller.png');
        this.tweens.add({
            targets : fan,
            duration : 4000,
            rotation : Phaser.Math.DegToRad( 359 ),
            repeat : -1,
        })

        const cage = this.add.image(540,350,'main-bg','cage.png').setScale(.85);
        const wire = this.add.image(540,310,'main','wire.png').setScale(.85).setDepth(6);

        const pointerGoup = this.add.group();
        for(let i = 0; i < 3; i++){
            const pointer = this.add.image( 295+(i * 245), 200,'main','pointer.png').setScale(.8);
            this.tweens.add({
                targets : pointer,
                duration : 500,
                y : 220,
                ease : 'Sine.easeInOut',
                repeat : -1,
                yoyo : true,
            })
            pointerGoup.addMultiple([ pointer ]);
        }
        pointerGoup.setDepth(6);
        
        const msgIntro = this.add.image(540,-100,'main','msg-intro.png').setDepth(6);
        this.tweens.add({
            targets : msgIntro,
            duration : 500,
            ease :"Back.easeOut",
            y : 100,
        })
       
        const chick2 = this.add.spine(40,400,'chick-spine','idle',true).setScale(-.4,.4);
        const chick4 = this.add.spine(1050,440,'chick-spine','eat2',true).setScale(.35);
        const chick3 = this.add.spine(120,480,'chick-spine','eat2',true).setScale(.5);
        const chick1 = this.add.spine(980,490,'chick-spine','eat2',true).setScale(.5);
        const chick5 = this.add.spine(1030,520,'chick-spine','eat2',true).setScale(-.5,.5);
        const chick6 = this.add.spine(350,520,'chick-spine','idle',true).setScale(-.45,.45);
        const chick7 = this.add.spine(720,560,'chick-spine','eat2',true).setScale(-.4,.4);

        const chickWalkTo = ({ chick, toPos = 'left', xDistance , duration })=>{
            if(chick === null || chick === {} || typeof chick === 'undefined' )return console.log('Error');
            const xPos = (toPos === 'left')? chick.x - xDistance : chick.x + xDistance;
            if( toPos === 'left'){
                chick.scaleX = Math.abs( chick.scaleX );
            }else{
                chick.scaleX = - Math.abs( chick.scaleX );
            }
            const walkSpeed = (duration && typeof duration==='number')?duration:Phaser.Math.Between(1700,2500);
            const xStart = chick.x;
            // console.log(chick);
            // console.log(xPos);
            chick.play('idle',true);
            const toTargetPos = this.tweens.add({
                targets : chick,
                duration : walkSpeed,
                x : xPos,
                onComplete : ()=>{
                    chick.play('eat2',false);
                    chick.once('complete',()=>{
                        chick.scaleX = -( chick.scaleX );
                        chick.play('walk',true);
                        toStartPos.play();
                    })
                },
                paused : true,
            });
            const toStartPos = this.tweens.add({
                targets : chick,
                duration : walkSpeed,
                x : xStart,
                onComplete : ()=>{
                    chick.play('eat2',false);
                    chick.once('complete',()=>{
                        chick.scaleX = -( chick.scaleX );
                        chick.play('walk',true);
                        toTargetPos.play();
                    })
                },
                paused : true,
            });
            setTimeout(()=>{
                chick.play('walk',true);
                toTargetPos.play()
            },Phaser.Math.Between(0,1500))
        }
        

        chickWalkTo({
            chick : chick4,
            toPos : 'left',
            xDistance : 90
        });
        chickWalkTo({
            chick : chick3,
            toPos : 'left',
            xDistance : 90
        });
        chickWalkTo({
            chick : chick2,
            toPos : 'right',
            xDistance : 60
        });
        chickWalkTo({
            chick : chick6,
            toPos : 'right',
            xDistance : 85
        });
        chickWalkTo({
            chick : chick5,
            toPos : 'left',
            xDistance : 45
        });


        const uiContainer = this.add.container();
        const minusBtn = this.add.image(46,570,'main','btn-minus.png').setScale(.9).setInteractive();
        const betAmtBg = this.add.image(165,570,'main','bet-amt-bg.png').setScale(.9);
        const betAmtDisplay = this.add.bitmapText(165,570,'skarjan',betDenom[betDenomCounter],35).setOrigin(.5);
        const addBtn = this.add.image(285,570,'main','btn-add.png').setScale(.9).setInteractive();
        const infoBtn = this.add.image(375,570,'main','btn-info.png').setScale(.9).setInteractive();
        const balBg = this.add.image(590,570,'main','bal-bg.png').setScale(.9);
        const balanceDisplay = new BalanceDisplay(this , 600 , 570, null ,balance , 5 , 30 ,  'skarjan' );
        const stopBtn = this.add.image(835,570,'main','btn-stop.png').setScale(.9).setVisible(false).setInteractive();
        const autoBtn = this.add.image(835,570,'main','btn-auto.png').setScale(.9).setInteractive();
        const submitBtn = this.add.image(990,570,'main','btn-submit.png').setScale(.9).setInteractive();
        uiContainer.add([minusBtn, betAmtBg, betAmtDisplay, addBtn,infoBtn,balBg,balanceDisplay.balanceAmt,stopBtn,autoBtn,submitBtn]);
        uiContainer.setDepth(5);

        const winAmountModal = this.add.container();
        const winAmtBg = this.add.image(540,250,'main','win-amt-bg.png');
        const winAmtDisplay = this.add.bitmapText(540,350,'skarjan',0,35).setOrigin(.5);
        const rays3 = this.add.image(540,200,'rays3.png').setBlendMode('SCREEN').setScale(.5).setVisible(false);
        const continueBtn = this.add.image(540,420,'main','btn-continue.png').setInteractive();
        const continueTimerDisplay = this.add.bitmapText(540,470,'skarjan',5,30).setDepth(11).setOrigin(.5).setVisible(false);
        let continueTimer = this.time.addEvent();
        const continueTimerCfg = {
            delay : 1000,
            startAt : 1000,
            repeat : 5,
            callback : (data)=>{
                //console.log( continueTimer.repeatCount );
                continueTimerDisplay.setText( continueTimer.repeatCount )
                if(continueTimer.repeatCount === 0 ){
                    readyProcess();
                }
            }
        }

        

        //this.time.addEvent()
        winAmountModal.add([ winAmtBg, rays3, winAmtDisplay,continueBtn]);
        winAmountModal.setDepth(10).setVisible(false);

        const msgContainer = this.add.container()
        const msgBg = this.add.image(540,350,'main','msg-bg.png');
        const msgHolder = this.add.image(540,365,'main','msg-poop.png');
        const msgAttack = this.add.image(540,180,'main','msg-attack.png').setVisible(false).setDepth(10);
        msgContainer.add([msgBg,msgHolder ]);
        msgContainer.setDepth(10).setVisible(false);

        const infoModal = this.add.container();
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000,.7);
        overlay.fillRect(0,0,1080,610);
        const info = this.add.image(540,280,'main','info.png');
        const closeBtn = this.add.image(670,120,'main','btn-close.png').setScale(.7).setInteractive();
        infoModal.add([ overlay, info, closeBtn ]);
        infoModal.setDepth(15).setVisible(false);
        closeBtn.on('pointerdown',()=>{
            this.sound.play('default-sfx',defaultSfxMarker[3])
            infoModal.setVisible(false);
        });
        infoBtn.on('pointerdown',()=>{
            //infoModal.setVisible(true);
            this.sound.play('default-sfx',defaultSfxMarker[1])
            infoModal.visible = !infoModal.visible
        })

        const noBalanceModal = this.add.container();
        const overlay2 = this.add.graphics();
        overlay2.fillStyle(0x000000,.7);
        overlay2.fillRect(0,0,1080,610);
        const noBalance = this.add.image(540,210,'main','no-balance.png');
        const noBalanceBtn = this.add.image(540,300,'main','btn-no-balance.png').setInteractive();
        noBalanceModal.add([overlay2,noBalance,noBalanceBtn ])
        noBalanceModal.setDepth(20).setVisible(false);
        noBalanceBtn.on('pointerdown',()=>{
            this.sound.play('default-sfx',defaultSfxMarker[3])
            noBalanceModal.setVisible(false);
        })

       
        this.tweens.add({
            targets : rays3,
            duration : 2000,
            rotation : Phaser.Math.DegToRad(360),
            repeat : -1,
        })

        coinAnim = this.anims.create({
            key : 'flip',
            frameRate : 30,
            repeat : -1,
            frames : this.anims.generateFrameNumbers( 'coin' ),
        })
        const coinParticle = this.add.particles('coin').setDepth(10);
        const coinEmitter = coinParticle.createEmitter({
            x : 540,
            y : 305,
            speed : { min: 400, max: 600 },//{ min: 300, max: 500 },
            lifespan : {min: 1000, max: 2500},
            frequency : -1,
            scale : .4,
            rotate : { min : 0, max: 360},
            particleClass : AnimatedParticle,
            gravityY : 800,
            angle : { min : 230, max : 320}
        })

        addBtn.on('pointerdown',()=>{
            if(global.clickStatus)return
            this.sound.play('default-sfx',defaultSfxMarker[0])
            addBet();
        })
        minusBtn.on('pointerdown',()=>{
            if(global.clickStatus)return
            this.sound.play('default-sfx',defaultSfxMarker[0])
            minusBet();
        })
        submitBtn.on('pointerdown',()=>{
            if(global.clickStatus || noBalanceModal.visible )return
            if(! checkBalance( parseInt(betAmtDisplay.text), parseInt(balanceDisplay.balanceAmt.text) ))return this.sound.play('default-sfx',defaultSfxMarker[4]), noBalanceModal.setVisible(true);
            this.sound.play('default-sfx',defaultSfxMarker[2])
            global.clickStatus = true;
            enableButtons(false);
            startProcess();
        })

        autoBtn.on('pointerdown',()=>{
            if(global.clickStatus || noBalanceModal.visible )return
            if(! checkBalance( parseInt(betAmtDisplay.text), parseInt(balanceDisplay.balanceAmt.text) ))return this.sound.play('default-sfx',defaultSfxMarker[4]), noBalanceModal.setVisible(true);
            this.sound.play('default-sfx',defaultSfxMarker[2])
            global.clickStatus = true;
            global.autoStatus = true;
            autoBtn.setVisible(false);
            stopBtn.setVisible(true);
            enableButtons(false);
            startProcess();
        })

        continueBtn.on('pointerdown',()=>{
            //readyProcess();
            this.sound.play('default-sfx',defaultSfxMarker[1])
            continueTimer.remove(true);
        });

        stopBtn.on('pointerdown',()=>{
            if(stopBtn.isTinted)return
            this.sound.play('default-sfx',defaultSfxMarker[3])
            global.autoStatus = false;
            stopBtn.setTint( Phaser.Display.Color.GetColor(100,100,100) );
        })

        const spoon = this.add.spine(440,500,'scoop','static',false).setDepth(1).setScale(.8);
        const eggPlaceholder = this.add.image(440,500,'main','poop.png').setOrigin(.5,1).setDepth(2).setVisible(false).setScale(.4);
        
        const sparkParticle = this.add.particles('main').setDepth(12);
        const sparkEmitter = sparkParticle.createEmitter({
            x : 500,
            y : 160,
            frame : ['spark.png'],
            lifespan : { min : 300, max : 600 },
            frequency : -1,
            speed : 0,
            scale : { start: 0, end: 1, ease: 'Quad.easeOut' },
            emitZone : {
                source : new Phaser.Geom.Rectangle(0,0,80,100)
            },
            //blendMode : "ADD"
        })
        sparkEmitter.setScale((p,k,t)=>{
            //console.log( p )
            //console.log( k )
            //console.log( t )
            return 1 - 2 * Math.abs(t - .5);
        })

        const flyGroup = this.add.container();
        const fly1 = this.add.sprite(30,0,'fly.png').setScale(.8);
        const fly2 = this.add.sprite(-50,30,'fly.png').setScale(.8).setFlipX(true);
        flyGroup.add([fly1,fly2]);
        flyGroup.setPosition(540,200).setDepth(12).setVisible(false).setScale(0);
        this.anims.create({
            key : 'fly',
            frames : this.anims.generateFrameNumbers('fly.png'),
            repeat : -1,
            frameRate : 90,
        })
        fly1.play('fly');
        fly2.play('fly');
        this.tweens.add({
            targets : fly1,
            duration : Phaser.Math.Between(200,600),
            y : fly1.y + 20,
            yoyo : true,
            repeat : -1
        })
        this.tweens.add({
            targets : fly2,
            duration : Phaser.Math.Between(200,600),
            y : fly2.y + 20,
            yoyo : true,
            repeat : -1
        })



        const chickenGroup = this.add.group();
        const chicken1 = this.add.spine(295,400,'chicken-spine','sit-idle',true).setSkinByName('white').setDepth(5);//.setInteractive();
        const chicken2 = this.add.spine(540,400,'chicken-spine','sit-idle',true).setSkinByName('brown').setDepth(5);
        const chicken3 = this.add.spine(785,400,'chicken-spine','sit-idle',true).setSkinByName('black').setDepth(5);
        chickenGroup.addMultiple([ chicken1, chicken2, chicken3 ]);
        chickenGroup.getChildren().forEach((chicken,i)=>{
            setTimeout(()=>{
                chicken.setAnimation(0,'sit-idle',true)
            },Phaser.Math.Between(0,800))
            chicken.setInteractive();
            chicken.on('pointerdown',()=>{
                if(global.clickStatus)return
                this.sound.play('default-sfx',defaultSfxMarker[1])
                hideIntroMsg();
                gameConfig.selectedChickenIndex = i;
                //console.log( gameConfig.selectedChickenIndex );
                this.sound.play('chicken-sfx', chickenSfx[0] );
                spoon.setPosition( spoonPosition[gameConfig.selectedChickenIndex].x , spoonPosition[gameConfig.selectedChickenIndex].y );
                spoon.play('wiggle',false);
                eggPlaceholder.setPosition( spoonPosition[gameConfig.selectedChickenIndex].x+45, spoonPosition[gameConfig.selectedChickenIndex].y -75);
            })
            chicken.setMix('sit-idle','attack',.3);
            chicken.setMix('sit-idle','dance2',.3);
        })

        const hideIntroMsg = ()=>{
            if(msgIntro.y < 0 )return
            this.tweens.add({
                targets : msgIntro,
                y : -100,
                ease : 'Back.easeOut',
                duration : 500,
            });
            pointerGoup.getChildren().forEach((pointer,i)=>{
                pointer.setVisible(false);
            })
        }

        const loseEgg = ()=>{
            let result;
            const loseType = gameConfig.loseType();
            switch(loseType){
                case 0 :
                    result = 'egg-rotten.png';
                    msgHolder.setFrame('msg-rot.png');
                    flyGroup.setVisible(true);
                break;
                case 1 : 
                    result = 'poop.png';
                    msgHolder.setFrame('msg-poop.png');
                    flyGroup.setVisible(true);
                break;
                default:
                    result = 'attack';
                    flyGroup.setVisible(false);
                    //msgHolder.setFrame('msg-poop.png');
                break
            }
            console.log( result );
            return result
        }

        const getEgg = (eggResult = 0 )=>{
            //if(global.clickStatus)return
            let eggTexture;
            switch(eggResult){
                case 1.5 :
                    if(Math.random < .5){
                        eggTexture = 'egg-white.png';
                    }else{
                        eggTexture = 'egg-brown.png';
                    }
                break;
                case 2 :
                    eggTexture = 'egg-double.png';
                break;
                case 3 :
                    eggTexture = 'egg-silver.png';
                break;
                case 4.5 :
                    eggTexture = 'egg-gold.png';
                break;
                default:
                    eggTexture = loseEgg();
                break;
            }

            //console.log( eggTexture );
            if(eggTexture !== 'attack' ){
                eggPlaceholder.setFrame(eggTexture).setPosition(spoon.x+45,spoon.y-75);
            }
            
            const _spoonPos = {
                x : spoon.x,
                y : spoon.y,
            }


            // global.clickStatus = true;
            //spoon.setDepth(1)
            eggPlaceholder.setVisible(false);
            const speed = 700;
            setTimeout(()=>{
                chickenGroup.getChildren()[gameConfig.selectedChickenIndex].setAnimation(0,'angry',false);
                //this.sound.play('chicken-wings-sfx',{volume : .5 });
                this.sound.play('chicken-sfx', chickenSfx[2] )
            },speed-100);
            spoon.play('bend',false);
            this.tweens.add({
                targets : [spoon,eggPlaceholder],
                x : chickenGroup.getChildren()[gameConfig.selectedChickenIndex].x,
                y : chickenGroup.getChildren()[gameConfig.selectedChickenIndex].y,
                duration : speed,
                ease : 'Back.easeIn',
                onComplete : ()=>{
                    chickenGroup.getChildren()[gameConfig.selectedChickenIndex].once('complete',(spine)=>{
                        chickenGroup.getChildren()[gameConfig.selectedChickenIndex].setAnimation(0,'sit-idle',true)
                    })
                    
                }
            })
            setTimeout(()=>{
                if(eggTexture === 'attack' ){
                    //attack
                    setTimeout(()=>{
                        msgAttack.setVisible(true);
                    },500)
                    chickenGroup.getChildren()[gameConfig.selectedChickenIndex].setAnimation(0,'attack',false);
                    chickenGroup.getChildren()[gameConfig.selectedChickenIndex].once('event',(a,e)=>{
                        //console.log(e);
                        if(e.data.name === 'peck'){
                            //this.sound.play('peck-sfx');
                            this.sound.play('chicken-sfx', chickenSfx[3] )
                        }
                    });
                    
                    eggPlaceholder.setVisible(false);
                }else{
                    chickenGroup.getChildren()[gameConfig.selectedChickenIndex].setAnimation(0,'stand-angry',false);
                    //this.sound.play('chicken-wings-sfx');
                    this.sound.play('chicken-sfx', chickenSfx[2] )
                    eggPlaceholder.setVisible(true);
                }
                
                chickenGroup.getChildren()[gameConfig.selectedChickenIndex].once('complete',(spine)=>{
                    chickenGroup.getChildren()[gameConfig.selectedChickenIndex].setAnimation(0,'sit-idle',true)
                })
                this.tweens.add({
                    targets : [spoon,eggPlaceholder],
                    delay : 1000,
                    x : _spoonPos.x,//spoonPosition[gameConfig.selectedChickenIndex].x,
                    y : _spoonPos.y,//spoonPosition[gameConfig.selectedChickenIndex].y,
                    duration : speed - 200,
                    ease : 'Sine.easeOut',
                    onComplete : ()=>{
                        resultCallback(eggResult);
                    }
                })
            },2000)
        }

        const enableButtons = (isEnabled = true )=>{
            if(isEnabled){
                minusBtn.setInteractive().clearTint();
                addBtn.setInteractive().clearTint();
                infoBtn.setInteractive().clearTint();
                submitBtn.setInteractive().clearTint();
                autoBtn.setInteractive().clearTint();
                stopBtn.setInteractive().clearTint();
            }else{
                minusBtn.setTint( Phaser.Display.Color.GetColor(100,100,100) ).removeInteractive();
                addBtn.setTint( Phaser.Display.Color.GetColor(100,100,100) ).removeInteractive();
                infoBtn.setTint( Phaser.Display.Color.GetColor(100,100,100) ).removeInteractive();
                submitBtn.setTint( Phaser.Display.Color.GetColor(100,100,100) ).removeInteractive();
                autoBtn.setTint( Phaser.Display.Color.GetColor(100,100,100) ).removeInteractive();
            }
        }
        

        const addBet = ()=>{
            betDenomCounter++;
            if(betDenomCounter > betDenom.length - 1){
                betDenomCounter = 0;
            }
            betAmtDisplay.setText( betDenom[betDenomCounter] );
        }
        const minusBet = ()=>{
            betDenomCounter--;
            if(betDenomCounter < 0 ){
                betDenomCounter = betDenom.length - 1 ;
            }
            betAmtDisplay.setText( betDenom[betDenomCounter] );
        }

        const resultCallback = ( odds )=>{
            if(odds > 0){
                winCallback(odds);
            }else{
                loseCallback();
            }
        }

        const winCallback = (odds)=>{
            const winAmount = parseInt(betAmtDisplay.text)*odds;
            
            winAmtDisplay.setText( 0 );
            winAmountModal.setVisible(true).setY(-400);
            if(global.autoStatus){
                continueBtn.setVisible(false);
                continueTimerDisplay.setText(3).setY( 410 );
            }else{
                continueBtn.setVisible(true);
                continueTimerDisplay.setText(5).setY( 470 );
            }
            this.tweens.add({
                targets : winAmountModal,
                duration : 600,
                ease : 'Back.easeOut',
                y : 0,
                onComplete : ()=>{
                    resultEggToWinDisplay(odds);
                    continueTimerDisplay.setVisible(true);
                    this.sound.play('default-sfx',defaultSfxMarker[6]);
                }
            })

            this.tweens.addCounter({
                delay : 1000,
                from : 0,
                to :winAmount,
                duration : 1000,
                onStart : ()=>{
                    tallyloop.play('tallyloop');
                },
                onUpdate : (data,val)=>{
                    winAmtDisplay.setText( val.value.toFixed(2) );
                },
                onComplete : ()=>{
                    tallyloop.stop();
                    if(odds === 4.5){
                        chickenGroup.getChildren().forEach((chicken,i)=>{
                            chicken.setAnimation(0,'dance2',true);
                        })
                    }
                    if(global.autoStatus){
                        continueTimer = this.time.addEvent({
                            delay : 1000,
                            startAt : 1000,
                            repeat : 3,
                            callback : (data)=>{
                                continueTimerDisplay.setText( continueTimer.repeatCount )
                                if(continueTimer.repeatCount === 0 ){
                                    readyProcess();
                                }
                            }
                        });
                    }else{
                        continueTimer = this.time.addEvent( continueTimerCfg );
                    }
                    balanceDisplay.updateBalance(balance+=winAmount,'add');
                }
            })

        }

        const resultEggToWinDisplay = (eggOdds)=>{
            const coinVolume = (eggOdds === 4.5 )?15:5;
            const hasSpark = (eggOdds === 4.5 || eggOdds === 3 )?true:false;
            eggPlaceholder.setDepth(11);
            this.tweens.add({
                targets : eggPlaceholder,
                duration : 400,
                ease : 'Sine.easeOut',
                scaleX : 1,
                scaleY : 1,
                y : 260,
                x : 535,
                onComplete : ()=>{
                    rays3.setVisible(true).setScale(0);
                    this.sound.play('default-sfx',defaultSfxMarker[5])
                    coinEmitter.explode(coinVolume,540,200);
                    if(hasSpark){
                        sparkEmitter.flow(300);
                    }
                    this.tweens.add({
                        targets : rays3,
                        scaleX : .5,
                        scaleY : .5,
                        duration : 500,
                        ease : 'Back.easeOut',
                        onComplete : ()=>{
                            
                        }
                    })
                }
            })
        }

        const loseCallback = ()=>{
            //chickenGroup.getChildren()[gameConfig.selectedChickenIndex].setAnimation(0,'attack',false);
            eggPlaceholder.setDepth(11);
            if(eggPlaceholder.visible){
                msgContainer.setVisible(true);
            }else{
                msgContainer.setVisible(false);
            }
            continueTimerDisplay.setText(3).setY( 410 ).setVisible(true);
            this.tweens.add({
                targets : eggPlaceholder,
                duration : 400,
                ease : 'Sine.easeOut',
                scaleX : 1,
                scaleY : 1,
                y : 320,
                x : 535,
                onComplete : ()=>{
                    //this.sound.play('lose-3-sfx',{ volume : .3 });
                    this.sound.play('chicken-sfx', chickenSfx[4] )
                }
            });

            flyGroup.setScale(0);
            this.tweens.add({
                targets : flyGroup,
                duration : 500,
                scaleX : 1,
                scaleY : 1,
                ease : 'Back.easeOut'
            })

            continueTimer = this.time.addEvent({
                delay : 1000,
                startAt : 1000,
                repeat : 3,
                callback : (data)=>{
                    continueTimerDisplay.setText( continueTimer.repeatCount )
                    if(continueTimer.repeatCount === 0 ){
                        readyProcess();
                    }
                }
            });
        }

        

        const autoProcess = ()=>{
            if(! checkBalance( parseInt(betAmtDisplay.text), parseInt(balanceDisplay.balanceAmt.text) )){
                noBalanceModal.setVisible(true);
                global.clickStatus = false;
                global.autoStatus = false;
                autoBtn.setVisible(true);
                stopBtn.setVisible(false);
                enableButtons(true);
                return
            }
            startProcess();
        }

        const readyProcess =()=>{
            continueTimerDisplay.setVisible(false);
            winAmountModal.setVisible(false);
            eggPlaceholder.setScale(.4).setVisible(false).setDepth(2);
            rays3.setVisible(false);
            msgContainer.setVisible(false);
            flyGroup.setVisible(false).setScale(0);
            msgAttack.setVisible(false);
            sparkEmitter.flow(-1);
            chickenGroup.getChildren().forEach((chicken,i)=>{
                chicken.setAnimation(0,'sit-idle',true)
                setTimeout(()=>{
                    chicken.setAnimation(0,'sit-idle',true)
                },Phaser.Math.Between(0,800))
            });
            
            if( global.autoStatus ){
                autoProcess();
            }else{
                global.clickStatus = false;
                enableButtons(true);
                autoBtn.setVisible(true);
                stopBtn.setVisible(false);
            }
        }

        const startProcess = async () => {
            try{
                balanceDisplay.updateBalance(balance-=parseInt(betAmtDisplay.text),'remove');
                hideIntroMsg();
                const result = await getResult();
                console.log( result );
                getEgg( result );
            }
            catch(error){
                console.log( error )
            }
        }

        // chicken1.on('pointerdown',()=>{
        //     //console.log('asd')
        // })

        this.input.keyboard.on('keydown',(key)=>{
            if(key.key === '1'){
                getEgg()
            }
            if(key.key === '2'){
                getEgg(false)
            }
            if(key.key === ' '){
                coinEmitter.explode(15,540,200);
                this.sound.play('default-sfx',defaultSfxMarker[5])
            }
            
        })
    }
    update(){

    }
}



function getResult(){
    return new Promise((resolve,reject)=>{
        let result = null;
        const winResult =  Math.random() < gameConfig.winRate ; // dummy win or result 
        console.log( (winResult)?'%c WIN ' : '%c LOSE ',(winResult)?'background: #35cb00; color: #111' : 'background: #e60505' );
        if( winResult ){
            const odds = [1.5,2,3,4.5];
            result = odds[ Math.floor( Math.random() * odds.length ) ];
        }else{
            result = 0;
        }

        setTimeout(()=>{
            if(typeof result === 'undefined' || typeof result === null ){
                reject("Error")
            }else{
                resolve( result )
            }
        },1000)
    })
}

function checkBalance(betAmt,balance){
    return betAmt <= balance;
}


function getLineAngle(p1X,p1Y,p2X,p2Y){
    // var p1 = {
    //     x: 20,
    //     y: 20
    // };
    // var p2 = {
    //     x: 40,
    //     y: 40
    // };

    // angle in radians
    var angleRadians = Math.atan2(p2Y - p1Y, p2X - p1X);

    // angle in degrees
    var angleDeg = Math.atan2(p2Y - p1Y, p2X - p1X) * 180 / Math.PI;

    return angleRadians
}




function getPrize(dto, success, error) {
    mgs.provider.placeorder(getDto(dto), function (result) {

        var winAmt = (result[8].length > 0) ? result[8][0][1] : 0,
            winStatus;
        
        if (winAmt > 0) winStatus = true;
        else winStatus = false;

        success({result: result[6], winStatus: winStatus, winAmt: winAmt});
        //success({result: '921',winStatus: false,winAmt: 3000}); //dummy data

    }, function (d) {
        //reset();
        error(d[0]);
    });   
}

function getDto(data) {
    var payload = '',
        numOrder = data.length,
        tmp = [];

    $.each(data, function() {
        var betCont = this.split(',');

        tmp.push('8,' + betCont[0] + ',' + (betCont[1] * 100) + '.');
    });

    payload = numOrder.toString() + '=' + tmp.join('');

    //"1=7,1,@amt.".replace("@amt", (data.amt * units[data.unit]))

    return dto = {
        p: 1700, // payout, fixed for minigame
        u: 1, // unit
        m: 1, // multiplier, fixed to 1
        g: 87, // gameId, fixed for slamdunk
        q: 1, // quantity
        s: -99, // seq, fixed value for mmc
        w: 0, // win stop
        b: 0, // double, deprecated param
        a: 1, // amt detail
        payload: payload
    };
}

function updateBalance(isWin) {
    if (global.normalMode) 
        notifyParent(['menuRefresh'], isWin);
}

function stopAutoplay() {
   
}

function notifyParent(data) {
    if (window.parent)
        window.parent.postMessage(data, "*");
}

var config = {
    type: Phaser.WEBGL,
    //type: Phaser.CANVAS,
    scale: {
        parent: 'container',
        autoCenter: Phaser.Scale.CENTER_BOTH, //Phaser.Scale.CENTER_HORIZONTALLY,
        mode:Phaser.Scale.FIT,
        width: global.size.width,
        height: global.size.height,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: debugMode,
        }
    },
    backgroundColor: '#111111', //'#1b1464'
    //scene: [ MainScene ,MuteGame, OpeningScene ],
    scene: [ OpeningScene, MainScene , MuteGame  ],
    plugins: {
        scene: [
                { key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' },
                // {
                //     plugin: window.PhaserMatterCollisionPlugin, // The plugin class
                //     key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
                //     mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
                // }
            ]
    },
};
var game = new Phaser.Game(config);

class AnimatedParticle extends Phaser.GameObjects.Particles.Particle {
    constructor (emitter) {
        super(emitter);

        this.t = 0;
        this.i = 0;
        this.rotation = 0;
    }

    update (delta, step, processors) {
        var result = super.update(delta, step, processors);

        this.t += delta; 

        this.rotation+=delta;

        if (this.t >= coinAnim.msPerFrame) {
            this.i++;

            if (this.i > 9) this.i = 0; // 9 frame count of sprite coin.png

            this.frame = coinAnim.frames[this.i].frame;
        
            this.t -= coinAnim.msPerFrame;
        }
        return result;
    }
}