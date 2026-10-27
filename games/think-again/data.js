(function (root) {
  "use strict";
  const data = {
  "ui": {
    "title": {
      "en": "Think Again",
      "hu": "Gondold újra"
    },
    "eyebrow": {
      "en": "THE PLAYFUL SUPPLEMENT",
      "hu": "A JÁTÉKOS MELLÉKLET"
    },
    "subtitle": {
      "en": "A little paper. A different possibility.",
      "hu": "Egy kis papír. Egy másik lehetőség."
    },
    "intro": {
      "en": "Five little scenes. Take your time, try an idea, and see what moves.",
      "hu": "Öt kis jelenet. Nézz körül, próbálj ki egy ötletet, és figyeld meg, mi mozdul."
    },
    "start": {
      "en": "Open the sketchbook →",
      "hu": "Nyisd ki a vázlatfüzetet →"
    },
    "levels": {
      "en": "The sketchbook",
      "hu": "A vázlatfüzet"
    },
    "home": {
      "en": "← Title page",
      "hu": "← Címlap"
    },
    "how": {
      "en": "How to play",
      "hu": "Hogyan játsszak?"
    },
    "close": {
      "en": "Close",
      "hu": "Bezárás"
    },
    "guide": {
      "en": "Drag a piece, or select it then choose a destination. Tab explores every object. Arrow keys move or resize; Enter uses a control. Escape releases your selection.",
      "hu": "Húzz egy darabot, vagy jelöld ki, majd válassz helyet neki. A Tab minden tárgyat bejár. A nyilakkal mozgathatsz vagy méretezhetsz; az Enter működteti a vezérlőt. Az Escape megszünteti a kijelölést."
    },
    "legendInk": {
      "en": "Printed ink: part of the page",
      "hu": "Nyomtatott tinta: a lap része"
    },
    "legendLoose": {
      "en": "Raised edge: a loose piece or paper control",
      "hu": "Kiemelt szegély: különálló darab vagy papírvezérlő"
    },
    "hint": {
      "en": "A little hint",
      "hu": "Egy kis segítség"
    },
    "hints": {
      "en": "Hints",
      "hu": "Segítségek"
    },
    "allHints": {
      "en": "All three hints are open.",
      "hu": "Mindhárom segítség látható."
    },
    "reveal": {
      "en": "Show the solution",
      "hu": "Mutasd a megoldást"
    },
    "nextStep": {
      "en": "Show next step →",
      "hu": "Következő lépés →"
    },
    "solution": {
      "en": "The solution",
      "hu": "A megoldás"
    },
    "restart": {
      "en": "Restart this scene",
      "hu": "Jelenet újrakezdése"
    },
    "skip": {
      "en": "Skip this scene →",
      "hu": "Jelenet kihagyása →"
    },
    "next": {
      "en": "Next scene →",
      "hu": "Következő jelenet →"
    },
    "replay": {
      "en": "Replay the sketchbook",
      "hu": "Vázlatfüzet újrajátszása"
    },
    "finish": {
      "en": "Back to the sketchbook",
      "hu": "Vissza a vázlatfüzethez"
    },
    "done": {
      "en": "That did it!",
      "hu": "Sikerült!"
    },
    "complete": {
      "en": "A little pause, a new possibility.",
      "hu": "Egy kis szünet, egy új lehetőség."
    },
    "end": {
      "en": "The last page. You can revisit any scene, or open a fresh sketchbook.",
      "hu": "Az utolsó lap. Bármelyik jelenethez visszatérhetsz, vagy újrakezdheted a vázlatfüzetet."
    },
    "selected": {
      "en": "Selected",
      "hu": "Kijelölve"
    },
    "nothing": {
      "en": "Choose any object to explore.",
      "hu": "Válassz egy tárgyat a felfedezéshez."
    },
    "ink": {
      "en": "The paper wobbles. The printed ink stays put.",
      "hu": "A papír megremeg. A nyomtatott tinta a helyén marad."
    },
    "smallFrame": {
      "en": "A snug squeeze! The toy bounces back.",
      "hu": "Ez bizony szűk! A játék visszapattan."
    },
    "sleepy": {
      "en": "Zzz… The empty battery blinks.",
      "hu": "Zzz… A lemerült akkumulátor villog."
    },
    "harmless": {
      "en": "A little tap on the page. Try another idea.",
      "hu": "Egy kis koppintás a lapon. Próbálj ki egy másik ötletet."
    },
    "move": {
      "en": "Use the arrows or choose a spot on the page.",
      "hu": "Használd a nyilakat, vagy válassz egy helyet a lapon."
    },
    "resize": {
      "en": "Use the arrows or pull this corner.",
      "hu": "Használd a nyilakat, vagy húzd ezt a sarkot."
    },
    "folded": {
      "en": "The middle strip is tucked underneath. Use it again to unfold.",
      "hu": "A középső sáv a papír alá került. Újabb használattal kihajthatod."
    },
    "unfolded": {
      "en": "The paper opens out again.",
      "hu": "A papír újra kinyílik."
    },
    "controls": {
      "en": "Selected object controls",
      "hu": "A kijelölt tárgy vezérlői"
    },
    "up": {
      "en": "Up",
      "hu": "Fel"
    },
    "down": {
      "en": "Down",
      "hu": "Le"
    },
    "left": {
      "en": "Left",
      "hu": "Balra"
    },
    "right": {
      "en": "Right",
      "hu": "Jobbra"
    },
    "use": {
      "en": "Use",
      "hu": "Működtetés"
    },
    "release": {
      "en": "Release selection",
      "hu": "Kijelölés megszüntetése"
    },
    "scene": {
      "en": "Interactive paper scene",
      "hu": "Interaktív papírjelenet"
    },
    "scroll": {
      "en": "On a small screen, scroll the paper sideways. All objects also work with the controls below.",
      "hu": "Kis képernyőn oldalra görgetheted a papírt. Minden tárgy az alábbi vezérlőkkel is használható."
    },
    "musicPlay": {
      "en": "Play music",
      "hu": "Zene indítása"
    },
    "musicPause": {
      "en": "Pause music",
      "hu": "Zene szüneteltetése"
    },
    "volume": {
      "en": "Music volume",
      "hu": "Zene hangereje"
    },
    "musicMissing": {
      "en": "Music is unavailable. You can keep playing; press Play music to retry.",
      "hu": "A zene nem érhető el. A játék folytatható; újrapróbáláshoz nyomd meg a Zene indítása gombot."
    },
    "remembered": {
      "en": "Music choice remembered. Press Play music when ready.",
      "hu": "Megjegyeztük a zeneválasztást. Indítsd el a zenét, amikor szeretnéd."
    },
    "storage": {
      "en": "Only language, music choice and volume are remembered in this browser.",
      "hu": "Ez a böngésző csak a nyelvet, a zeneválasztást és a hangerőt jegyzi meg."
    },
    "storageMissing": {
      "en": "Preferences cannot be saved here. You can still play.",
      "hu": "A beállítások itt nem menthetők. A játék folytatható."
    },
    "credits": {
      "en": "Code and recording notices",
      "hu": "Kód- és felvételi licencek"
    },
    "skipLink": {
      "en": "Skip to the game",
      "hu": "Ugrás a játékhoz"
    },
    "finishSign": {
      "en": "FINISH",
      "hu": "CÉL"
    },
    "thinking": {
      "en": "THINKING…",
      "hu": "GONDOLKODOM…"
    },
    "harder": {
      "en": "THINK HARDER",
      "hu": "GONDOLKODJ JOBBAN"
    },
    "awake": {
      "en": "Oh! A flower.",
      "hu": "Ó! Egy virág."
    },
    "fold": {
      "en": "Fold / unfold",
      "hu": "Hajtás / kihajtás"
    },
    "shadowNote": {
      "en": "A doodle, not a physics simulation.",
      "hu": "Firkarajz, nem fizikai szimuláció."
    },
    "guideMark": {
      "en": "Fixed shadow guide",
      "hu": "Rögzített árnyékjelölés"
    }
  },
  "fiction": {
    "en": "All robots, claims, devices and outcomes are fictional puzzle scenes; no assessment or cognitive-benefit claim about real AI.",
    "hu": "Minden robot, állítás, eszköz és kimenetel kitalált fejtörőjelenet; nem értékeli a valódi mesterséges intelligenciát, és nem állít kognitív hasznot."
  },
  "levels": [
    {
      "id": "p01-frame",
      "title": {
        "en": "A little more room",
        "hu": "Egy kicsivel több helyet"
      },
      "objective": {
        "en": "Fit the toy elephant inside the frame.",
        "hu": "Férjen be a játékelefánt a keretbe."
      },
      "hints": [
        {
          "en": "The circular corners are controls, not decoration.",
          "hu": "A keret sarkain lévő körök fogantyúk."
        },
        {
          "en": "The elephant need not get smaller.",
          "hu": "Az elefántot nem kell kisebbé tenni."
        },
        {
          "en": "Pull a corner to enlarge the frame, then put the elephant inside.",
          "hu": "Húzd kifelé a keret egyik sarkát, majd tedd bele az elefántot."
        }
      ],
      "objects": [
        {
          "id": "elephant",
          "shape": "elephant",
          "x": 125,
          "y": 235,
          "w": 150,
          "h": 130,
          "label": {
            "en": "Toy elephant",
            "hu": "Játékelefánt"
          },
          "kind": "move"
        },
        {
          "id": "frame",
          "shape": "frame",
          "x": 465,
          "y": 220,
          "w": 95,
          "h": 115,
          "label": {
            "en": "Picture frame",
            "hu": "Képkeret"
          },
          "kind": "move"
        },
        {
          "id": "grip-nw",
          "shape": "grip",
          "x": 0,
          "y": 0,
          "w": 52,
          "h": 52,
          "label": {
            "en": "Top left grip",
            "hu": "Bal felső fogantyú"
          },
          "kind": "resize",
          "parent": "frame",
          "corner": "nw"
        },
        {
          "id": "grip-ne",
          "shape": "grip",
          "x": 0,
          "y": 0,
          "w": 52,
          "h": 52,
          "label": {
            "en": "Top right grip",
            "hu": "Jobb felső fogantyú"
          },
          "kind": "resize",
          "parent": "frame",
          "corner": "ne"
        },
        {
          "id": "grip-sw",
          "shape": "grip",
          "x": 0,
          "y": 0,
          "w": 52,
          "h": 52,
          "label": {
            "en": "Bottom left grip",
            "hu": "Bal alsó fogantyú"
          },
          "kind": "resize",
          "parent": "frame",
          "corner": "sw"
        },
        {
          "id": "grip-se",
          "shape": "grip",
          "x": 0,
          "y": 0,
          "w": 52,
          "h": 52,
          "label": {
            "en": "Bottom right grip",
            "hu": "Jobb alsó fogantyú"
          },
          "kind": "resize",
          "parent": "frame",
          "corner": "se"
        }
      ],
      "test": {
        "type": "contains",
        "objects": [
          "elephant",
          "frame"
        ],
        "tolerance": 10
      },
      "solution": [
        {
          "text": {
            "en": "Pull a circular corner to make more room.",
            "hu": "Húzd kifelé a kör alakú sarkot, hogy több hely legyen."
          },
          "action": {
            "type": "resize",
            "id": "grip-se",
            "x": 705,
            "y": 405
          }
        },
        {
          "text": {
            "en": "Move the toy into the opening. Moving the frame around the toy works too.",
            "hu": "Tedd a játékot a keret nyílásába. A keretet is a játék köré mozgathatod."
          },
          "action": {
            "type": "move",
            "id": "elephant",
            "x": 585,
            "y": 312.5
          }
        }
      ],
      "payoff": {
        "en": "A frame with room for an elephant.",
        "hu": "Egy keret, amelybe egy elefánt is belefér."
      }
    },
    {
      "id": "p06-snail",
      "title": {
        "en": "Almost there",
        "hu": "Mindjárt célba ér"
      },
      "objective": {
        "en": "Help the snail finish today.",
        "hu": "Segíts a csigának ma célba érni."
      },
      "hints": [
        {
          "en": "The sign is a loose piece.",
          "hu": "A tábla különálló darab."
        },
        {
          "en": "What if the finish came closer?",
          "hu": "Mi lenne, ha a cél jönne közelebb?"
        },
        {
          "en": "Move the finish sign beside the snail.",
          "hu": "Tedd a célt jelző táblát a csiga mellé."
        }
      ],
      "objects": [
        {
          "id": "path",
          "shape": "path",
          "x": 65,
          "y": 342,
          "w": 670,
          "h": 44,
          "label": {
            "en": "Dotted race path",
            "hu": "Pontozott versenypálya"
          },
          "kind": "ink"
        },
        {
          "id": "snail",
          "shape": "snail",
          "x": 125,
          "y": 278,
          "w": 140,
          "h": 88,
          "label": {
            "en": "Printed snail",
            "hu": "Nyomtatott csiga"
          },
          "kind": "ink"
        },
        {
          "id": "finish",
          "shape": "finish",
          "x": 645,
          "y": 235,
          "w": 100,
          "h": 130,
          "label": {
            "en": "Finish sign and handle",
            "hu": "Céltábla és fogantyú"
          },
          "kind": "move"
        }
      ],
      "test": {
        "type": "near",
        "objects": [
          "finish",
          "snail"
        ],
        "anchorA": [
          0.5,
          1
        ],
        "anchorB": [
          0.5,
          1
        ],
        "dx": 100,
        "dy": 40,
        "snap": false
      },
      "solution": [
        {
          "text": {
            "en": "Bring the finish sign to the snail, on the dotted path.",
            "hu": "Tedd a céltáblát a csigához, a pontozott pályára."
          },
          "action": {
            "type": "move",
            "id": "finish",
            "x": 195,
            "y": 301
          }
        }
      ],
      "payoff": {
        "en": "A very short race. A very happy snail.",
        "hu": "Nagyon rövid verseny. Nagyon boldog csiga."
      }
    },
    {
      "id": "p05-robot-power",
      "title": {
        "en": "Think harder?",
        "hu": "Gondolkodj jobban?"
      },
      "objective": {
        "en": "Wake the doodle robot.",
        "hu": "Ébreszd fel a firkarobotot."
      },
      "hints": [
        {
          "en": "Look away from the big button.",
          "hu": "Nézz a nagy gomb helyett máshová."
        },
        {
          "en": "The empty battery is a better clue.",
          "hu": "A lemerült akkumulátor jobb nyom."
        },
        {
          "en": "Plug the charging cable into the socket.",
          "hu": "Dugd a töltőkábelt a konnektorba."
        }
      ],
      "objects": [
        {
          "id": "desk",
          "shape": "desk",
          "x": 150,
          "y": 335,
          "w": 380,
          "h": 70,
          "label": {
            "en": "Drawing desk",
            "hu": "Rajzasztal"
          },
          "kind": "ink"
        },
        {
          "id": "robot",
          "shape": "robot",
          "x": 200,
          "y": 155,
          "w": 240,
          "h": 170,
          "label": {
            "en": "Doodle robot",
            "hu": "Firkarobot"
          },
          "kind": "ink"
        },
        {
          "id": "screen",
          "shape": "screen",
          "x": 240,
          "y": 172,
          "w": 160,
          "h": 48,
          "label": {
            "en": "Robot screen",
            "hu": "Robotképernyő"
          },
          "kind": "ink"
        },
        {
          "id": "harder",
          "shape": "harder",
          "x": 225,
          "y": 242,
          "w": 190,
          "h": 56,
          "label": {
            "en": "Think harder button",
            "hu": "Gondolkodj jobban gomb"
          },
          "kind": "use"
        },
        {
          "id": "battery",
          "shape": "battery",
          "x": 440,
          "y": 178,
          "w": 68,
          "h": 35,
          "label": {
            "en": "Empty battery",
            "hu": "Lemerült akkumulátor"
          },
          "kind": "ink"
        },
        {
          "id": "socket",
          "shape": "socket",
          "x": 655,
          "y": 245,
          "w": 80,
          "h": 86,
          "label": {
            "en": "Wall socket",
            "hu": "Konnektor"
          },
          "kind": "ink"
        },
        {
          "id": "plug",
          "shape": "plug",
          "x": 525,
          "y": 350,
          "w": 62,
          "h": 50,
          "label": {
            "en": "Charging plug",
            "hu": "Töltőcsatlakozó"
          },
          "kind": "move"
        },
        {
          "id": "flower",
          "shape": "flower",
          "x": 425,
          "y": 249,
          "w": 75,
          "h": 84,
          "label": {
            "en": "Flower on the drawing paper",
            "hu": "Virág a rajzlapon"
          },
          "kind": "ink"
        }
      ],
      "test": {
        "type": "near",
        "objects": [
          "plug",
          "socket"
        ],
        "anchorA": [
          0.5,
          0.5
        ],
        "anchorB": [
          0.5,
          0.5
        ],
        "dx": 62,
        "dy": 68,
        "snap": true
      },
      "solution": [
        {
          "text": {
            "en": "Put the charging plug in the matching socket.",
            "hu": "Dugd a töltőcsatlakozót a hozzá illő konnektorba."
          },
          "action": {
            "type": "move",
            "id": "plug",
            "x": 695,
            "y": 288
          }
        }
      ],
      "payoff": {
        "en": "Wide awake. Time to draw a flower.",
        "hu": "Már ébren van. Ideje virágot rajzolni."
      }
    },
    {
      "id": "p07-shadow",
      "title": {
        "en": "A very tall little tree",
        "hu": "Óriási kis fa"
      },
      "objective": {
        "en": "Give the little tree the longest shadow.",
        "hu": "Legyen a kis fának a leghosszabb árnyéka."
      },
      "hints": [
        {
          "en": "The tree can stay little.",
          "hu": "A fa kicsi maradhat."
        },
        {
          "en": "Try moving the light lower.",
          "hu": "Próbáld lejjebb vinni a fényt."
        },
        {
          "en": "Move the lamp towards the bottom of its arc until the little tree’s shadow passes the guide.",
          "hu": "Vidd a lámpát az íve alsó részéhez, amíg a kis fa árnyéka túlér a jelölésen."
        }
      ],
      "objects": [
        {
          "id": "little",
          "shape": "littleTree",
          "x": 275,
          "y": 230,
          "w": 100,
          "h": 130,
          "label": {
            "en": "Little tree",
            "hu": "Kis fa"
          },
          "kind": "ink"
        },
        {
          "id": "tall",
          "shape": "tallTree",
          "x": 590,
          "y": 180,
          "w": 120,
          "h": 180,
          "label": {
            "en": "Taller tree",
            "hu": "Magasabb fa"
          },
          "kind": "ink"
        },
        {
          "id": "guide",
          "shape": "guide",
          "x": 420,
          "y": 354,
          "w": 32,
          "h": 90,
          "label": {
            "en": "Fixed shadow guide",
            "hu": "Rögzített árnyékjelölés"
          },
          "kind": "ink"
        },
        {
          "id": "shadow",
          "shape": "shadow",
          "x": 325,
          "y": 359,
          "w": 40,
          "h": 28,
          "label": {
            "en": "Little tree shadow",
            "hu": "A kis fa árnyéka"
          },
          "kind": "ink"
        },
        {
          "id": "lamp",
          "shape": "lamp",
          "x": 0,
          "y": 0,
          "w": 76,
          "h": 76,
          "label": {
            "en": "Desk lamp on an arc",
            "hu": "Asztali lámpa az íven"
          },
          "kind": "arc",
          "arc": {
            "cx": 325,
            "cy": 190,
            "rx": 230,
            "ry": 125,
            "min": -1,
            "max": 1
          }
        }
      ],
      "test": {
        "type": "shadow",
        "objects": [
          "shadow",
          "guide",
          "lamp"
        ],
        "guideLength": 112,
        "base": 32,
        "gain": 210,
        "threshold": 0.62
      },
      "solution": [
        {
          "text": {
            "en": "Slide the lamp to either low end of its arc. Watch the little shadow pass the guide.",
            "hu": "Csúsztasd a lámpát az ív bármelyik alsó végére. Figyeld, ahogy a kis árnyék túlér a jelölésen."
          },
          "action": {
            "type": "arc",
            "id": "lamp",
            "value": 0.9
          }
        }
      ],
      "payoff": {
        "en": "A little tree. A wonderfully long shadow.",
        "hu": "Kicsi fa. Csodásan hosszú árnyék."
      }
    },
    {
      "id": "p19-cats",
      "title": {
        "en": "Closer on paper",
        "hu": "Közelebb papíron"
      },
      "objective": {
        "en": "Bring the cats side by side while keeping both pictures on the paper.",
        "hu": "Tedd egymás mellé a cicákat úgy, hogy mindkét kép a papíron maradjon."
      },
      "hints": [
        {
          "en": "The cats are printed on the paper.",
          "hu": "A cicák a papírra vannak nyomtatva."
        },
        {
          "en": "There are two fold lines between them.",
          "hu": "Két hajtásvonal van közöttük."
        },
        {
          "en": "Fold the middle strip underneath.",
          "hu": "Hajtsd a középső sávot a papír alá."
        }
      ],
      "objects": [
        {
          "id": "leftCat",
          "shape": "cat",
          "x": 210,
          "y": 220,
          "w": 90,
          "h": 130,
          "label": {
            "en": "Left printed cat",
            "hu": "Bal oldali nyomtatott cica"
          },
          "kind": "ink"
        },
        {
          "id": "rightCat",
          "shape": "cat",
          "x": 430,
          "y": 220,
          "w": 90,
          "h": 130,
          "label": {
            "en": "Right printed cat",
            "hu": "Jobb oldali nyomtatott cica"
          },
          "kind": "ink"
        },
        {
          "id": "strip",
          "shape": "strip",
          "x": 350,
          "y": 145,
          "w": 40,
          "h": 245,
          "label": {
            "en": "Middle strip with two fold lines",
            "hu": "Középső sáv két hajtásvonallal"
          },
          "kind": "fold"
        }
      ],
      "paper": {
        "x": 100,
        "y": 145,
        "w": 600,
        "h": 245,
        "creaseA": 350,
        "creaseB": 390
      },
      "test": {
        "type": "cats",
        "objects": [
          "leftCat",
          "rightCat",
          "strip"
        ],
        "maxGap": 50
      },
      "solution": [
        {
          "text": {
            "en": "Fold the middle strip underneath along both dotted lines. Both cats stay on top.",
            "hu": "Hajtsd a középső sávot a papír alá a két pontozott vonal mentén. Mindkét cica felül marad."
          },
          "action": {
            "type": "fold",
            "id": "strip",
            "direction": -1
          }
        }
      ],
      "payoff": {
        "en": "Two cats, sharing a little more paper.",
        "hu": "Két cica, egy kicsivel közelebb a papíron."
      }
    }
  ],
  "tracks": [
    {
      "src": "music/beautiful-interference.mp3",
      "title": "Beautiful Interference"
    },
    {
      "src": "music/csillagosveny.mp3",
      "title": "Csillagösvény"
    },
    {
      "src": "music/hangsulyvaltas.mp3",
      "title": "Hangsúlyváltás"
    }
  ]
};
  const order = ['p01-frame','p06-snail','p02-owl','p04-fish','p05-robot-power','p03-post','p10-boat','p16-server','p09-cups','p07-shadow','p15-sum','p11-count','p13-ribbon','p12-recipe','p17-balance','p08-arrows','p14-butterfly','p19-cats','p18-light','p20-poster'];
  const packs = typeof module === 'object' && module.exports ? ['a','b','c'].map(key=>require('./extra-'+key+'.js')) : Object.values(root.ThinkAgainPacks || {});
  data.levels.push(...packs.flatMap(pack=>pack.levels));
  data.levels.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
  data.levels.forEach((level,i)=>{ level.chapter=Math.floor(i/5)+1; });
  data.order=order;
  Object.assign(data.ui, {
    intro:{en:'Twenty little puzzles. The picture is part of the problem: try moving, turning or combining what you see.',hu:'Húsz kis fejtörő. A kép is a feladat része: próbáld mozgatni, forgatni vagy összekapcsolni, amit látsz.'},
    playGuide:{en:'Try the picture. Drag a piece, or tap it and then where you want it to go.',hu:'Próbálkozz a képen. Húzz egy darabot, vagy koppints rá, majd a kívánt helyére.'},
    allScenes:{en:'Choose a scene',hu:'Jelenet választása'},
    moreControls:{en:'Keyboard and movement controls',hu:'Billentyűzet és mozgatás'},
    zoomIn:{en:'Enlarge picture',hu:'Kép nagyítása'},
    zoomOut:{en:'Fit picture',hu:'Teljes kép'},
    sceneActions:{en:'Scene actions',hu:'A jelenet műveletei'},
    chapter:{en:'Chapter',hu:'Fejezet'},
    saved:{en:'Your place and settings stay in this browser.',hu:'A haladásod és beállításaid ebben a böngészőben maradnak.'},
    newStart:{en:'Start from the first page',hu:'Kezdés az első laptól'}
  });
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.ThinkAgainData = data;
})(typeof globalThis !== "undefined" ? globalThis : this);
