/* Fixed word search boards. */
(function (root) {
  const puzzles = [
  {
    "id": "hu-01",
    "lang": "hu",
    "difficulty": "easy",
    "title": "A piacon",
    "words": [
      {
        "id": "w1",
        "text": "ALMA",
        "path": [
          40,
          41,
          42,
          43
        ]
      },
      {
        "id": "w2",
        "text": "KÖRTE",
        "path": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "id": "w3",
        "text": "SZILVA",
        "path": [
          7,
          15,
          23,
          31,
          39
        ]
      },
      {
        "id": "w4",
        "text": "BARACK",
        "path": [
          20,
          28,
          36,
          44,
          52,
          60
        ]
      },
      {
        "id": "w5",
        "text": "SZŐLŐ",
        "path": [
          11,
          12,
          13,
          14
        ]
      },
      {
        "id": "w6",
        "text": "RÉPA",
        "path": [
          10,
          18,
          26,
          34
        ]
      },
      {
        "id": "w7",
        "text": "HAGYMA",
        "path": [
          0,
          8,
          16,
          24,
          32
        ]
      },
      {
        "id": "w8",
        "text": "KRUMPLI",
        "path": [
          1,
          9,
          17,
          25,
          33,
          41,
          49
        ]
      },
      {
        "id": "w9",
        "text": "UBORKA",
        "path": [
          56,
          57,
          58,
          59,
          60,
          61
        ]
      },
      {
        "id": "w10",
        "text": "PAPRIKA",
        "path": [
          33,
          34,
          35,
          36,
          37,
          38,
          39
        ]
      }
    ],
    "solution": "Friss ízek a kosárban",
    "width": 8,
    "height": 8,
    "cells": [
      "H",
      "K",
      "Ö",
      "R",
      "T",
      "E",
      "F",
      "SZ",
      "A",
      "R",
      "R",
      "SZ",
      "Ő",
      "L",
      "Ő",
      "I",
      "GY",
      "U",
      "É",
      "R",
      "B",
      "I",
      "S",
      "L",
      "M",
      "M",
      "P",
      "S",
      "A",
      "Í",
      "Z",
      "V",
      "A",
      "P",
      "A",
      "P",
      "R",
      "I",
      "K",
      "A",
      "A",
      "L",
      "M",
      "A",
      "A",
      "E",
      "K",
      "A",
      "K",
      "I",
      "O",
      "S",
      "C",
      "Á",
      "R",
      "B",
      "U",
      "B",
      "O",
      "R",
      "K",
      "A",
      "A",
      "N"
    ],
    "leftover": [
      6,
      19,
      21,
      22,
      27,
      29,
      30,
      45,
      46,
      47,
      48,
      50,
      51,
      53,
      54,
      55,
      62,
      63
    ],
    "signature": "ae6ed8351f48ff86fe682bfd7f5d0a6406452111ab18606623e77b6ff08e07ec"
  },
  {
    "id": "hu-02",
    "lang": "hu",
    "difficulty": "easy",
    "title": "Az erdő ösvényein",
    "words": [
      {
        "id": "w1",
        "text": "TÖLGY",
        "path": [
          28,
          29,
          30,
          31
        ]
      },
      {
        "id": "w2",
        "text": "BÜKK",
        "path": [
          12,
          13,
          14,
          15
        ]
      },
      {
        "id": "w3",
        "text": "FENYŐ",
        "path": [
          34,
          43,
          52,
          61
        ]
      },
      {
        "id": "w4",
        "text": "MOGYORÓ",
        "path": [
          1,
          2,
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "w5",
        "text": "GOMBA",
        "path": [
          17,
          26,
          35,
          44,
          53
        ]
      },
      {
        "id": "w6",
        "text": "MÓKUS",
        "path": [
          21,
          22,
          23,
          24,
          25
        ]
      },
      {
        "id": "w7",
        "text": "ŐZIKE",
        "path": [
          54,
          55,
          56,
          57,
          58
        ]
      },
      {
        "id": "w8",
        "text": "RÓKA",
        "path": [
          5,
          6,
          7,
          8
        ]
      },
      {
        "id": "w9",
        "text": "BAGOLY",
        "path": [
          36,
          37,
          38,
          39,
          40
        ]
      },
      {
        "id": "w10",
        "text": "ÖSVÉNY",
        "path": [
          48,
          49,
          50,
          51,
          52
        ]
      }
    ],
    "solution": "Csend vár a lombok alatt",
    "width": 9,
    "height": 7,
    "cells": [
      "CS",
      "M",
      "O",
      "GY",
      "O",
      "R",
      "Ó",
      "K",
      "A",
      "E",
      "N",
      "D",
      "B",
      "Ü",
      "K",
      "K",
      "V",
      "G",
      "Á",
      "R",
      "A",
      "M",
      "Ó",
      "K",
      "U",
      "S",
      "O",
      "L",
      "T",
      "Ö",
      "L",
      "GY",
      "O",
      "M",
      "F",
      "M",
      "B",
      "A",
      "G",
      "O",
      "LY",
      "B",
      "O",
      "E",
      "B",
      "K",
      "A",
      "L",
      "Ö",
      "S",
      "V",
      "É",
      "NY",
      "A",
      "Ő",
      "Z",
      "I",
      "K",
      "E",
      "A",
      "T",
      "Ő",
      "T"
    ],
    "leftover": [
      0,
      9,
      10,
      11,
      16,
      18,
      19,
      20,
      27,
      32,
      33,
      41,
      42,
      45,
      46,
      47,
      59,
      60,
      62
    ],
    "signature": "eb13e56fbeeb92c1fb86d4f98d7becfbf6f080e8e318060c343625824b2d25c6"
  },
  {
    "id": "hu-03",
    "lang": "hu",
    "difficulty": "easy",
    "title": "Iskolatáska",
    "words": [
      {
        "id": "w1",
        "text": "FÜZET",
        "path": [
          7,
          16,
          25,
          34,
          43
        ]
      },
      {
        "id": "w2",
        "text": "KÖNYV",
        "path": [
          18,
          27,
          36,
          45
        ]
      },
      {
        "id": "w3",
        "text": "CERUZA",
        "path": [
          1,
          10,
          19,
          28,
          37,
          46
        ]
      },
      {
        "id": "w4",
        "text": "RADÍR",
        "path": [
          17,
          26,
          35,
          44,
          53
        ]
      },
      {
        "id": "w5",
        "text": "VONALZÓ",
        "path": [
          6,
          15,
          24,
          33,
          42,
          51,
          60
        ]
      },
      {
        "id": "w6",
        "text": "TÁBLA",
        "path": [
          23,
          32,
          41,
          50,
          59
        ]
      },
      {
        "id": "w7",
        "text": "KRÉTA",
        "path": [
          18,
          19,
          20,
          21,
          22
        ]
      },
      {
        "id": "w8",
        "text": "TÁSKA",
        "path": [
          55,
          56,
          57,
          58,
          59
        ]
      },
      {
        "id": "w9",
        "text": "OLLÓ",
        "path": [
          2,
          3,
          4,
          5
        ]
      },
      {
        "id": "w10",
        "text": "ECSET",
        "path": [
          11,
          12,
          13,
          14
        ]
      }
    ],
    "solution": "Kezdődik a tanítás",
    "width": 9,
    "height": 7,
    "cells": [
      "K",
      "C",
      "O",
      "L",
      "L",
      "Ó",
      "V",
      "F",
      "E",
      "Z",
      "E",
      "E",
      "CS",
      "E",
      "T",
      "O",
      "Ü",
      "R",
      "K",
      "R",
      "É",
      "T",
      "A",
      "T",
      "N",
      "Z",
      "A",
      "Ö",
      "U",
      "D",
      "Ő",
      "D",
      "Á",
      "A",
      "E",
      "D",
      "NY",
      "Z",
      "I",
      "K",
      "A",
      "B",
      "L",
      "T",
      "Í",
      "V",
      "A",
      "T",
      "A",
      "N",
      "L",
      "Z",
      "Í",
      "R",
      "T",
      "T",
      "Á",
      "S",
      "K",
      "A",
      "Ó",
      "Á",
      "S"
    ],
    "leftover": [
      0,
      8,
      9,
      29,
      30,
      31,
      38,
      39,
      40,
      47,
      48,
      49,
      52,
      54,
      61,
      62
    ],
    "signature": "080a6db2dcd6ebb2a8369ffc566ed99fe4500bac02f7d064f69c24771e4bde19"
  },
  {
    "id": "hu-04",
    "lang": "hu",
    "difficulty": "medium",
    "title": "Süteményes délután",
    "words": [
      {
        "id": "w1",
        "text": "LISZT",
        "path": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "w2",
        "text": "VAJ",
        "path": [
          17,
          25,
          33
        ]
      },
      {
        "id": "w3",
        "text": "CUKOR",
        "path": [
          35,
          28,
          21,
          14,
          7
        ]
      },
      {
        "id": "w4",
        "text": "TOJÁS",
        "path": [
          0,
          9,
          18,
          27,
          36
        ]
      },
      {
        "id": "w5",
        "text": "TEJ",
        "path": [
          50,
          51,
          52
        ]
      },
      {
        "id": "w6",
        "text": "KAKAÓ",
        "path": [
          23,
          31,
          39,
          47,
          55
        ]
      },
      {
        "id": "w7",
        "text": "MÉZ",
        "path": [
          42,
          43,
          44
        ]
      },
      {
        "id": "w8",
        "text": "FAHÉJ",
        "path": [
          16,
          25,
          34,
          43,
          52
        ]
      },
      {
        "id": "w9",
        "text": "DIÓ",
        "path": [
          26,
          19,
          12
        ]
      },
      {
        "id": "w10",
        "text": "MAZSOLA",
        "path": [
          2,
          11,
          20,
          29,
          38,
          47
        ]
      }
    ],
    "solution": "Édes illat a konyhában",
    "width": 8,
    "height": 7,
    "cells": [
      "T",
      "É",
      "M",
      "L",
      "I",
      "SZ",
      "T",
      "R",
      "D",
      "O",
      "E",
      "A",
      "Ó",
      "S",
      "O",
      "I",
      "F",
      "V",
      "J",
      "I",
      "ZS",
      "K",
      "L",
      "K",
      "L",
      "A",
      "D",
      "Á",
      "U",
      "O",
      "A",
      "A",
      "T",
      "J",
      "H",
      "C",
      "S",
      "A",
      "L",
      "K",
      "K",
      "O",
      "M",
      "É",
      "Z",
      "NY",
      "H",
      "A",
      "Á",
      "B",
      "T",
      "E",
      "J",
      "A",
      "N",
      "Ó"
    ],
    "leftover": [
      1,
      8,
      10,
      13,
      15,
      22,
      24,
      30,
      32,
      37,
      40,
      41,
      45,
      46,
      48,
      49,
      53,
      54
    ],
    "signature": "cfac5193c6fc721acc727fa130a7efa0dcf58843fd3d92ec72f3bb0b40146f09"
  },
  {
    "id": "hu-05",
    "lang": "hu",
    "difficulty": "medium",
    "title": "A kertben",
    "words": [
      {
        "id": "w1",
        "text": "TULIPÁN",
        "path": [
          3,
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "id": "w2",
        "text": "RÓZSA",
        "path": [
          29,
          39,
          49,
          59
        ]
      },
      {
        "id": "w3",
        "text": "IBOLYA",
        "path": [
          50,
          51,
          52,
          53,
          54
        ]
      },
      {
        "id": "w4",
        "text": "ÁRVÁCSKA",
        "path": [
          40,
          41,
          42,
          43,
          44,
          45,
          46
        ]
      },
      {
        "id": "w5",
        "text": "KAPOR",
        "path": [
          25,
          26,
          27,
          28,
          29
        ]
      },
      {
        "id": "w6",
        "text": "PETREZSELYEM",
        "path": [
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19
        ]
      },
      {
        "id": "w7",
        "text": "LOCSOLÓ",
        "path": [
          63,
          64,
          65,
          66,
          67,
          68
        ]
      },
      {
        "id": "w8",
        "text": "ÁGYÁS",
        "path": [
          55,
          56,
          57,
          58
        ]
      },
      {
        "id": "w9",
        "text": "KAPA",
        "path": [
          32,
          33,
          34,
          35
        ]
      },
      {
        "id": "w10",
        "text": "ÁSÓ",
        "path": [
          57,
          48,
          39
        ]
      }
    ],
    "solution": "Virág nyílik a kertben",
    "width": 10,
    "height": 7,
    "cells": [
      "V",
      "I",
      "R",
      "T",
      "U",
      "L",
      "I",
      "P",
      "Á",
      "N",
      "P",
      "E",
      "T",
      "R",
      "E",
      "ZS",
      "E",
      "LY",
      "E",
      "M",
      "Á",
      "G",
      "NY",
      "Í",
      "L",
      "K",
      "A",
      "P",
      "O",
      "R",
      "I",
      "K",
      "K",
      "A",
      "P",
      "A",
      "A",
      "K",
      "E",
      "Ó",
      "Á",
      "R",
      "V",
      "Á",
      "CS",
      "K",
      "A",
      "R",
      "S",
      "ZS",
      "I",
      "B",
      "O",
      "LY",
      "A",
      "Á",
      "GY",
      "Á",
      "S",
      "A",
      "T",
      "B",
      "E",
      "L",
      "O",
      "CS",
      "O",
      "L",
      "Ó",
      "N"
    ],
    "leftover": [
      0,
      1,
      2,
      20,
      21,
      22,
      23,
      24,
      30,
      31,
      36,
      37,
      38,
      47,
      60,
      61,
      62,
      69
    ],
    "signature": "50ffaa418be3385cb0877e18174c297aa94c0f25c11d30b37740b954fcdd5cfb"
  },
  {
    "id": "hu-06",
    "lang": "hu",
    "difficulty": "medium",
    "title": "Vízparti nyár",
    "words": [
      {
        "id": "w1",
        "text": "HOMOK",
        "path": [
          33,
          34,
          35,
          36,
          37
        ]
      },
      {
        "id": "w2",
        "text": "KAGYLÓ",
        "path": [
          2,
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "w3",
        "text": "HULLÁM",
        "path": [
          50,
          51,
          52,
          53,
          54,
          55
        ]
      },
      {
        "id": "w4",
        "text": "CSÓNAK",
        "path": [
          57,
          58,
          59,
          60,
          61
        ]
      },
      {
        "id": "w5",
        "text": "VITORLA",
        "path": [
          12,
          20,
          28,
          36,
          44,
          52,
          60
        ]
      },
      {
        "id": "w6",
        "text": "NÁDAS",
        "path": [
          7,
          15,
          23,
          31,
          39
        ]
      },
      {
        "id": "w7",
        "text": "BÉKA",
        "path": [
          0,
          9,
          18,
          27
        ]
      },
      {
        "id": "w8",
        "text": "SIRÁLY",
        "path": [
          11,
          20,
          29,
          38,
          47
        ]
      },
      {
        "id": "w9",
        "text": "MATRAC",
        "path": [
          16,
          24,
          32,
          40,
          48,
          56
        ]
      },
      {
        "id": "w10",
        "text": "FÜRDŐ",
        "path": [
          42,
          43,
          44,
          45,
          46
        ]
      }
    ],
    "solution": "Lassan ring a csónak",
    "width": 8,
    "height": 8,
    "cells": [
      "B",
      "L",
      "K",
      "A",
      "GY",
      "L",
      "Ó",
      "N",
      "A",
      "É",
      "S",
      "S",
      "V",
      "S",
      "A",
      "Á",
      "M",
      "N",
      "K",
      "R",
      "I",
      "I",
      "N",
      "D",
      "A",
      "G",
      "A",
      "A",
      "T",
      "R",
      "CS",
      "A",
      "T",
      "H",
      "O",
      "M",
      "O",
      "K",
      "Á",
      "S",
      "R",
      "Ó",
      "F",
      "Ü",
      "R",
      "D",
      "Ő",
      "LY",
      "A",
      "N",
      "H",
      "U",
      "L",
      "L",
      "Á",
      "M",
      "C",
      "CS",
      "Ó",
      "N",
      "A",
      "K",
      "A",
      "K"
    ],
    "leftover": [
      1,
      8,
      10,
      13,
      14,
      17,
      19,
      21,
      22,
      25,
      26,
      30,
      41,
      49,
      62,
      63
    ],
    "signature": "bd7d606ae6e43f9eea87583b0af00824d10ca2301769cd3521c602b782057735"
  },
  {
    "id": "hu-07",
    "lang": "hu",
    "difficulty": "medium",
    "title": "Zenél a szoba",
    "words": [
      {
        "id": "w1",
        "text": "HEGEDŰ",
        "path": [
          62,
          53,
          44,
          35,
          26,
          17
        ]
      },
      {
        "id": "w2",
        "text": "ZONGORA",
        "path": [
          63,
          54,
          45,
          36,
          27,
          18,
          9
        ]
      },
      {
        "id": "w3",
        "text": "FUVOLA",
        "path": [
          61,
          52,
          43,
          34,
          25,
          16
        ]
      },
      {
        "id": "w4",
        "text": "GITÁR",
        "path": [
          20,
          21,
          22,
          23,
          24
        ]
      },
      {
        "id": "w5",
        "text": "DOB",
        "path": [
          30,
          40,
          50
        ]
      },
      {
        "id": "w6",
        "text": "HÁRFA",
        "path": [
          42,
          33,
          24,
          15,
          6
        ]
      },
      {
        "id": "w7",
        "text": "KOTTA",
        "path": [
          65,
          56,
          47,
          38,
          29
        ]
      },
      {
        "id": "w8",
        "text": "DALLAM",
        "path": [
          0,
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "id": "w9",
        "text": "RITMUS",
        "path": [
          18,
          28,
          38,
          48,
          58,
          68
        ]
      },
      {
        "id": "w10",
        "text": "ÉNEK",
        "path": [
          39,
          49,
          59,
          69
        ]
      }
    ],
    "solution": "Dallam száll az ablakból",
    "width": 10,
    "height": 7,
    "cells": [
      "D",
      "A",
      "L",
      "L",
      "A",
      "M",
      "A",
      "D",
      "A",
      "A",
      "L",
      "L",
      "A",
      "M",
      "SZ",
      "F",
      "A",
      "Ű",
      "R",
      "Á",
      "G",
      "I",
      "T",
      "Á",
      "R",
      "L",
      "D",
      "O",
      "I",
      "A",
      "D",
      "L",
      "L",
      "Á",
      "O",
      "E",
      "G",
      "A",
      "T",
      "É",
      "O",
      "Z",
      "H",
      "V",
      "G",
      "N",
      "A",
      "T",
      "M",
      "N",
      "B",
      "B",
      "U",
      "E",
      "O",
      "L",
      "O",
      "A",
      "U",
      "E",
      "K",
      "F",
      "H",
      "Z",
      "B",
      "K",
      "Ó",
      "L",
      "S",
      "K"
    ],
    "leftover": [
      7,
      8,
      10,
      11,
      12,
      13,
      14,
      19,
      31,
      32,
      37,
      41,
      46,
      51,
      55,
      57,
      60,
      64,
      66,
      67
    ],
    "signature": "a8844c12dbe26cfcee948118862b466f873f933d8b8896e87ccb4a8bfbfb5a51"
  },
  {
    "id": "hu-08",
    "lang": "hu",
    "difficulty": "hard",
    "title": "Téli kuckó",
    "words": [
      {
        "id": "w1",
        "text": "SAPKA",
        "path": [
          29,
          39,
          49,
          59,
          69
        ]
      },
      {
        "id": "w2",
        "text": "SÁL",
        "path": [
          66,
          56,
          46
        ]
      },
      {
        "id": "w3",
        "text": "KESZTYŰ",
        "path": [
          28,
          27,
          26,
          25,
          24
        ]
      },
      {
        "id": "w4",
        "text": "CSIZMA",
        "path": [
          54,
          53,
          52,
          51,
          50
        ]
      },
      {
        "id": "w5",
        "text": "KABÁT",
        "path": [
          59,
          58,
          57,
          56,
          55
        ]
      },
      {
        "id": "w6",
        "text": "HÓEMBER",
        "path": [
          18,
          17,
          16,
          15,
          14,
          13,
          12
        ]
      },
      {
        "id": "w7",
        "text": "SZÁNKÓ",
        "path": [
          65,
          64,
          63,
          62,
          61
        ]
      },
      {
        "id": "w8",
        "text": "KORCSOLYA",
        "path": [
          32,
          33,
          34,
          35,
          36,
          37,
          38
        ]
      },
      {
        "id": "w9",
        "text": "POKRÓC",
        "path": [
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "id": "w10",
        "text": "KANDALLÓ",
        "path": [
          41,
          42,
          43,
          44,
          45,
          46,
          47,
          48
        ]
      }
    ],
    "solution": "Jó meleg vár idebent",
    "width": 10,
    "height": 7,
    "cells": [
      "J",
      "Ó",
      "M",
      "E",
      "P",
      "O",
      "K",
      "R",
      "Ó",
      "C",
      "L",
      "E",
      "R",
      "E",
      "B",
      "M",
      "E",
      "Ó",
      "H",
      "G",
      "V",
      "Á",
      "R",
      "I",
      "Ű",
      "TY",
      "SZ",
      "E",
      "K",
      "S",
      "D",
      "E",
      "K",
      "O",
      "R",
      "CS",
      "O",
      "LY",
      "A",
      "A",
      "B",
      "K",
      "A",
      "N",
      "D",
      "A",
      "L",
      "L",
      "Ó",
      "P",
      "A",
      "M",
      "Z",
      "I",
      "CS",
      "T",
      "Á",
      "B",
      "A",
      "K",
      "E",
      "Ó",
      "K",
      "N",
      "Á",
      "SZ",
      "S",
      "N",
      "T",
      "A"
    ],
    "leftover": [
      0,
      1,
      2,
      3,
      10,
      11,
      19,
      20,
      21,
      22,
      23,
      30,
      31,
      40,
      60,
      67,
      68
    ],
    "signature": "c0fe735ff2e89514634cb5096f63d41ca5cdd00a7c375c02c219aac20e3d8454"
  },
  {
    "id": "hu-09",
    "lang": "hu",
    "difficulty": "hard",
    "title": "Műhelytitkok",
    "words": [
      {
        "id": "w1",
        "text": "KALAPÁCS",
        "path": [
          18,
          17,
          16,
          15,
          14,
          13,
          12
        ]
      },
      {
        "id": "w2",
        "text": "FOGÓ",
        "path": [
          1,
          2,
          3,
          4
        ]
      },
      {
        "id": "w3",
        "text": "FŰRÉSZ",
        "path": [
          0,
          10,
          20,
          30,
          40
        ]
      },
      {
        "id": "w4",
        "text": "GYALU",
        "path": [
          6,
          15,
          24,
          33
        ]
      },
      {
        "id": "w5",
        "text": "RESZELŐ",
        "path": [
          20,
          21,
          22,
          23,
          24,
          25
        ]
      },
      {
        "id": "w6",
        "text": "CSAVAR",
        "path": [
          48,
          47,
          46,
          45,
          44
        ]
      },
      {
        "id": "w7",
        "text": "ECSET",
        "path": [
          59,
          48,
          37,
          26
        ]
      },
      {
        "id": "w8",
        "text": "MÉRCE",
        "path": [
          9,
          19,
          29,
          39,
          49
        ]
      },
      {
        "id": "w9",
        "text": "RAGASZTÓ",
        "path": [
          58,
          57,
          56,
          55,
          54,
          53,
          52
        ]
      },
      {
        "id": "w10",
        "text": "LÉTRA",
        "path": [
          41,
          42,
          43,
          44,
          45
        ]
      }
    ],
    "solution": "Szorgos kéz alkot",
    "width": 10,
    "height": 6,
    "cells": [
      "F",
      "F",
      "O",
      "G",
      "Ó",
      "SZ",
      "GY",
      "O",
      "R",
      "M",
      "Ű",
      "G",
      "CS",
      "Á",
      "P",
      "A",
      "L",
      "A",
      "K",
      "É",
      "R",
      "E",
      "SZ",
      "E",
      "L",
      "Ő",
      "T",
      "O",
      "S",
      "R",
      "É",
      "K",
      "É",
      "U",
      "Z",
      "A",
      "L",
      "E",
      "K",
      "C",
      "SZ",
      "L",
      "É",
      "T",
      "R",
      "A",
      "V",
      "A",
      "CS",
      "E",
      "O",
      "T",
      "Ó",
      "T",
      "SZ",
      "A",
      "G",
      "A",
      "R",
      "E"
    ],
    "leftover": [
      5,
      7,
      8,
      11,
      27,
      28,
      31,
      32,
      34,
      35,
      36,
      38,
      50,
      51
    ],
    "signature": "b0509b7867dbee3c79a927772eb12e86457b9c0c5811eb42981a890a7311c8fe"
  },
  {
    "id": "hu-10",
    "lang": "hu",
    "difficulty": "hard",
    "title": "Csillagos este",
    "words": [
      {
        "id": "w1",
        "text": "HOLD",
        "path": [
          60,
          51,
          42,
          33
        ]
      },
      {
        "id": "w2",
        "text": "CSILLAG",
        "path": [
          39,
          38,
          37,
          36,
          35,
          34
        ]
      },
      {
        "id": "w3",
        "text": "BOLYGÓ",
        "path": [
          61,
          51,
          41,
          31,
          21
        ]
      },
      {
        "id": "w4",
        "text": "ÜSTÖKÖS",
        "path": [
          9,
          8,
          7,
          6,
          5,
          4,
          3
        ]
      },
      {
        "id": "w5",
        "text": "TELESZKÓP",
        "path": [
          27,
          26,
          25,
          24,
          23,
          22,
          21,
          20
        ]
      },
      {
        "id": "w6",
        "text": "RAKÉTA",
        "path": [
          18,
          17,
          16,
          15,
          14,
          13
        ]
      },
      {
        "id": "w7",
        "text": "ŰRHAJÓ",
        "path": [
          57,
          56,
          55,
          54,
          53,
          52
        ]
      },
      {
        "id": "w8",
        "text": "GALAXIS",
        "path": [
          49,
          48,
          47,
          46,
          45,
          44,
          43
        ]
      },
      {
        "id": "w9",
        "text": "METEOR",
        "path": [
          68,
          67,
          66,
          65,
          64,
          63
        ]
      },
      {
        "id": "w10",
        "text": "PÁLYA",
        "path": [
          10,
          11,
          12,
          13
        ]
      }
    ],
    "solution": "Fény ragyog az égen",
    "width": 10,
    "height": 7,
    "cells": [
      "F",
      "É",
      "NY",
      "S",
      "Ö",
      "K",
      "Ö",
      "T",
      "S",
      "Ü",
      "P",
      "Á",
      "LY",
      "A",
      "T",
      "É",
      "K",
      "A",
      "R",
      "R",
      "P",
      "Ó",
      "K",
      "SZ",
      "E",
      "L",
      "E",
      "T",
      "A",
      "GY",
      "O",
      "G",
      "G",
      "D",
      "G",
      "A",
      "L",
      "L",
      "I",
      "CS",
      "A",
      "LY",
      "L",
      "S",
      "I",
      "X",
      "A",
      "L",
      "A",
      "G",
      "Z",
      "O",
      "Ó",
      "J",
      "A",
      "H",
      "R",
      "Ű",
      "É",
      "G",
      "H",
      "B",
      "E",
      "R",
      "O",
      "E",
      "T",
      "E",
      "M",
      "N"
    ],
    "leftover": [
      0,
      1,
      2,
      19,
      28,
      29,
      30,
      32,
      40,
      50,
      58,
      59,
      62,
      69
    ],
    "signature": "46ae1955afb89e2c8be8f4d8eadc5f3fad684fe0c12c90e726ec8350152da23c"
  },
  {
    "id": "en-01",
    "lang": "en",
    "difficulty": "easy",
    "title": "A pot of tea",
    "words": [
      {
        "id": "w1",
        "text": "KETTLE",
        "path": [
          19,
          27,
          35,
          43,
          51,
          59
        ]
      },
      {
        "id": "w2",
        "text": "TEAPOT",
        "path": [
          26,
          27,
          28,
          29,
          30,
          31
        ]
      },
      {
        "id": "w3",
        "text": "BISCUIT",
        "path": [
          8,
          9,
          10,
          11,
          12,
          13,
          14
        ]
      },
      {
        "id": "w4",
        "text": "SAUCER",
        "path": [
          16,
          24,
          32,
          40,
          48,
          56
        ]
      },
      {
        "id": "w5",
        "text": "SPOON",
        "path": [
          21,
          29,
          37,
          45,
          53
        ]
      },
      {
        "id": "w6",
        "text": "MILK",
        "path": [
          1,
          9,
          17,
          25
        ]
      },
      {
        "id": "w7",
        "text": "SUGAR",
        "path": [
          4,
          12,
          20,
          28,
          36
        ]
      },
      {
        "id": "w8",
        "text": "LEMON",
        "path": [
          58,
          59,
          60,
          61,
          62
        ]
      },
      {
        "id": "w9",
        "text": "HONEY",
        "path": [
          22,
          30,
          38,
          46,
          54
        ]
      },
      {
        "id": "w10",
        "text": "MUG",
        "path": [
          41,
          49,
          57
        ]
      }
    ],
    "solution": "Time for a little break",
    "width": 8,
    "height": 8,
    "cells": [
      "T",
      "M",
      "I",
      "M",
      "S",
      "E",
      "F",
      "O",
      "B",
      "I",
      "S",
      "C",
      "U",
      "I",
      "T",
      "R",
      "S",
      "L",
      "A",
      "K",
      "G",
      "S",
      "H",
      "L",
      "A",
      "K",
      "T",
      "E",
      "A",
      "P",
      "O",
      "T",
      "U",
      "I",
      "T",
      "T",
      "R",
      "O",
      "N",
      "T",
      "C",
      "M",
      "L",
      "T",
      "E",
      "O",
      "E",
      "B",
      "E",
      "U",
      "R",
      "L",
      "E",
      "N",
      "Y",
      "A",
      "R",
      "G",
      "L",
      "E",
      "M",
      "O",
      "N",
      "K"
    ],
    "leftover": [
      0,
      2,
      3,
      5,
      6,
      7,
      15,
      18,
      23,
      33,
      34,
      39,
      42,
      44,
      47,
      50,
      52,
      55,
      63
    ],
    "signature": "d106380f47415037e74148df10d4fb183afad38fd037dd33f68a5091df7ed39b"
  },
  {
    "id": "en-02",
    "lang": "en",
    "difficulty": "easy",
    "title": "At the seaside",
    "words": [
      {
        "id": "w1",
        "text": "BEACH",
        "path": [
          27,
          28,
          29,
          30,
          31
        ]
      },
      {
        "id": "w2",
        "text": "SHELL",
        "path": [
          4,
          5,
          6,
          7,
          8
        ]
      },
      {
        "id": "w3",
        "text": "BUCKET",
        "path": [
          14,
          23,
          32,
          41,
          50,
          59
        ]
      },
      {
        "id": "w4",
        "text": "SPADE",
        "path": [
          26,
          35,
          44,
          53,
          62
        ]
      },
      {
        "id": "w5",
        "text": "TOWEL",
        "path": [
          1,
          10,
          19,
          28,
          37
        ]
      },
      {
        "id": "w6",
        "text": "WAVE",
        "path": [
          20,
          29,
          38,
          47
        ]
      },
      {
        "id": "w7",
        "text": "SAND",
        "path": [
          15,
          24,
          33,
          42
        ]
      },
      {
        "id": "w8",
        "text": "PIER",
        "path": [
          34,
          43,
          52,
          61
        ]
      },
      {
        "id": "w9",
        "text": "GULL",
        "path": [
          54,
          55,
          56,
          57
        ]
      },
      {
        "id": "w10",
        "text": "BOAT",
        "path": [
          9,
          10,
          11,
          12
        ]
      }
    ],
    "solution": "Footprints by the water",
    "width": 9,
    "height": 7,
    "cells": [
      "F",
      "T",
      "O",
      "O",
      "S",
      "H",
      "E",
      "L",
      "L",
      "B",
      "O",
      "A",
      "T",
      "T",
      "B",
      "S",
      "P",
      "R",
      "I",
      "W",
      "W",
      "N",
      "T",
      "U",
      "A",
      "S",
      "S",
      "B",
      "E",
      "A",
      "C",
      "H",
      "C",
      "N",
      "P",
      "P",
      "B",
      "L",
      "V",
      "Y",
      "T",
      "K",
      "D",
      "I",
      "A",
      "H",
      "E",
      "E",
      "W",
      "A",
      "E",
      "T",
      "E",
      "D",
      "G",
      "U",
      "L",
      "L",
      "E",
      "T",
      "R",
      "R",
      "E"
    ],
    "leftover": [
      0,
      2,
      3,
      13,
      16,
      17,
      18,
      21,
      22,
      25,
      36,
      39,
      40,
      45,
      46,
      48,
      49,
      51,
      58,
      60
    ],
    "signature": "fedb8832e59ed250d2363d31f092a6e6fb8bce1aacb14eb5e9fcab95320bd76b"
  },
  {
    "id": "en-03",
    "lang": "en",
    "difficulty": "easy",
    "title": "Rainy afternoon",
    "words": [
      {
        "id": "w1",
        "text": "PUDDLE",
        "path": [
          0,
          10,
          20,
          30,
          40,
          50
        ]
      },
      {
        "id": "w2",
        "text": "CLOUD",
        "path": [
          17,
          27,
          37,
          47,
          57
        ]
      },
      {
        "id": "w3",
        "text": "DRIZZLE",
        "path": [
          18,
          28,
          38,
          48,
          58,
          68,
          78
        ]
      },
      {
        "id": "w4",
        "text": "RAINCOAT",
        "path": [
          5,
          15,
          25,
          35,
          45,
          55,
          65,
          75
        ]
      },
      {
        "id": "w5",
        "text": "BOOTS",
        "path": [
          1,
          11,
          21,
          31,
          41
        ]
      },
      {
        "id": "w6",
        "text": "UMBRELLA",
        "path": [
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "id": "w7",
        "text": "WINDOW",
        "path": [
          51,
          52,
          53,
          54,
          55,
          56
        ]
      },
      {
        "id": "w8",
        "text": "THUNDER",
        "path": [
          19,
          29,
          39,
          49,
          59,
          69,
          79
        ]
      },
      {
        "id": "w9",
        "text": "GUTTER",
        "path": [
          72,
          73,
          74,
          75,
          76,
          77
        ]
      },
      {
        "id": "w10",
        "text": "SPLASH",
        "path": [
          62,
          63,
          64,
          65,
          66,
          67
        ]
      }
    ],
    "solution": "Listen to the raindrops",
    "width": 10,
    "height": 8,
    "cells": [
      "P",
      "B",
      "U",
      "M",
      "B",
      "R",
      "E",
      "L",
      "L",
      "A",
      "U",
      "O",
      "L",
      "I",
      "S",
      "A",
      "T",
      "C",
      "D",
      "T",
      "D",
      "O",
      "E",
      "N",
      "T",
      "I",
      "O",
      "L",
      "R",
      "H",
      "D",
      "T",
      "T",
      "H",
      "E",
      "N",
      "R",
      "O",
      "I",
      "U",
      "L",
      "S",
      "A",
      "I",
      "N",
      "C",
      "D",
      "U",
      "Z",
      "N",
      "E",
      "W",
      "I",
      "N",
      "D",
      "O",
      "W",
      "D",
      "Z",
      "D",
      "R",
      "O",
      "S",
      "P",
      "L",
      "A",
      "S",
      "H",
      "L",
      "E",
      "P",
      "S",
      "G",
      "U",
      "T",
      "T",
      "E",
      "R",
      "E",
      "R"
    ],
    "leftover": [
      12,
      13,
      14,
      16,
      22,
      23,
      24,
      26,
      32,
      33,
      34,
      36,
      42,
      43,
      44,
      46,
      60,
      61,
      70,
      71
    ],
    "signature": "90ff5a6d994d4f0449182b72a1312a1bd2c35aad5a83c38a774c2f80cdf405a0"
  },
  {
    "id": "en-04",
    "lang": "en",
    "difficulty": "medium",
    "title": "The bookshop",
    "words": [
      {
        "id": "w1",
        "text": "NOVEL",
        "path": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "id": "w2",
        "text": "POETRY",
        "path": [
          60,
          51,
          42,
          33,
          24,
          15
        ]
      },
      {
        "id": "w3",
        "text": "SHELF",
        "path": [
          18,
          28,
          38,
          48,
          58
        ]
      },
      {
        "id": "w4",
        "text": "COVER",
        "path": [
          17,
          27,
          37,
          47,
          57
        ]
      },
      {
        "id": "w5",
        "text": "AUTHOR",
        "path": [
          6,
          16,
          26,
          36,
          46,
          56
        ]
      },
      {
        "id": "w6",
        "text": "PAPER",
        "path": [
          20,
          21,
          22,
          23,
          24
        ]
      },
      {
        "id": "w7",
        "text": "STORY",
        "path": [
          11,
          12,
          13,
          14,
          15
        ]
      },
      {
        "id": "w8",
        "text": "CHAPTER",
        "path": [
          62,
          63,
          64,
          65,
          66,
          67,
          68
        ]
      },
      {
        "id": "w9",
        "text": "SPINE",
        "path": [
          19,
          29,
          39,
          49,
          59
        ]
      },
      {
        "id": "w10",
        "text": "FABLE",
        "path": [
          61,
          52,
          43,
          34,
          25
        ]
      }
    ],
    "solution": "Another world awaits",
    "width": 10,
    "height": 7,
    "cells": [
      "A",
      "N",
      "O",
      "V",
      "E",
      "L",
      "A",
      "N",
      "O",
      "T",
      "H",
      "S",
      "T",
      "O",
      "R",
      "Y",
      "U",
      "C",
      "S",
      "S",
      "P",
      "A",
      "P",
      "E",
      "R",
      "E",
      "T",
      "O",
      "H",
      "P",
      "E",
      "R",
      "W",
      "T",
      "L",
      "O",
      "H",
      "V",
      "E",
      "I",
      "R",
      "L",
      "E",
      "B",
      "D",
      "A",
      "O",
      "E",
      "L",
      "N",
      "W",
      "O",
      "A",
      "A",
      "I",
      "T",
      "R",
      "R",
      "F",
      "E",
      "P",
      "F",
      "C",
      "H",
      "A",
      "P",
      "T",
      "E",
      "R",
      "S"
    ],
    "leftover": [
      0,
      7,
      8,
      9,
      10,
      30,
      31,
      32,
      35,
      40,
      41,
      44,
      45,
      50,
      53,
      54,
      55,
      69
    ],
    "signature": "693235132adddb6eb347fc8cb2763321bc586963d7e4f885833c22173e300e2b"
  },
  {
    "id": "en-05",
    "lang": "en",
    "difficulty": "medium",
    "title": "Garden visitors",
    "words": [
      {
        "id": "w1",
        "text": "ROBIN",
        "path": [
          0,
          1,
          2,
          3,
          4
        ]
      },
      {
        "id": "w2",
        "text": "THRUSH",
        "path": [
          16,
          24,
          32,
          40,
          48,
          56
        ]
      },
      {
        "id": "w3",
        "text": "SPARROW",
        "path": [
          9,
          10,
          11,
          12,
          13,
          14,
          15
        ]
      },
      {
        "id": "w4",
        "text": "FINCH",
        "path": [
          25,
          34,
          43,
          52,
          61
        ]
      },
      {
        "id": "w5",
        "text": "WREN",
        "path": [
          33,
          41,
          49,
          57
        ]
      },
      {
        "id": "w6",
        "text": "BADGER",
        "path": [
          2,
          11,
          20,
          29,
          38,
          47
        ]
      },
      {
        "id": "w7",
        "text": "HEDGEHOG",
        "path": [
          56,
          49,
          42,
          35,
          28,
          21,
          14,
          7
        ]
      },
      {
        "id": "w8",
        "text": "MOTH",
        "path": [
          60,
          53,
          46,
          39
        ]
      },
      {
        "id": "w9",
        "text": "BEETLE",
        "path": [
          22,
          30,
          38,
          46,
          54,
          62
        ]
      },
      {
        "id": "w10",
        "text": "SNAIL",
        "path": [
          18,
          27,
          36,
          45,
          54
        ]
      }
    ],
    "solution": "Leave a corner wild",
    "width": 8,
    "height": 8,
    "cells": [
      "R",
      "O",
      "B",
      "I",
      "N",
      "L",
      "E",
      "G",
      "A",
      "S",
      "P",
      "A",
      "R",
      "R",
      "O",
      "W",
      "T",
      "V",
      "S",
      "E",
      "D",
      "H",
      "B",
      "A",
      "H",
      "F",
      "C",
      "N",
      "E",
      "G",
      "E",
      "O",
      "R",
      "W",
      "I",
      "G",
      "A",
      "R",
      "E",
      "H",
      "U",
      "R",
      "D",
      "N",
      "N",
      "I",
      "T",
      "R",
      "S",
      "E",
      "E",
      "R",
      "C",
      "O",
      "L",
      "W",
      "H",
      "N",
      "I",
      "L",
      "M",
      "H",
      "E",
      "D"
    ],
    "leftover": [
      5,
      6,
      8,
      17,
      19,
      23,
      26,
      31,
      37,
      44,
      50,
      51,
      55,
      58,
      59,
      63
    ],
    "signature": "0954b477fcedfa887aaf1a27228bbfabb0dae566f7b6f55ff67f9653dbad0f16"
  },
  {
    "id": "en-06",
    "lang": "en",
    "difficulty": "medium",
    "title": "Sunday baking",
    "words": [
      {
        "id": "w1",
        "text": "FLOUR",
        "path": [
          46,
          47,
          48,
          49,
          50
        ]
      },
      {
        "id": "w2",
        "text": "YEAST",
        "path": [
          45,
          37,
          29,
          21,
          13
        ]
      },
      {
        "id": "w3",
        "text": "BUTTER",
        "path": [
          0,
          10,
          20,
          30,
          40,
          50
        ]
      },
      {
        "id": "w4",
        "text": "RAISIN",
        "path": [
          6,
          15,
          24,
          33,
          42,
          51
        ]
      },
      {
        "id": "w5",
        "text": "DOUGH",
        "path": [
          58,
          59,
          60,
          61,
          62
        ]
      },
      {
        "id": "w6",
        "text": "OVEN",
        "path": [
          27,
          19,
          11,
          3
        ]
      },
      {
        "id": "w7",
        "text": "TIN",
        "path": [
          32,
          42,
          52
        ]
      },
      {
        "id": "w8",
        "text": "WHISK",
        "path": [
          4,
          14,
          24,
          34,
          44
        ]
      },
      {
        "id": "w9",
        "text": "BOWL",
        "path": [
          54,
          55,
          56,
          57
        ]
      },
      {
        "id": "w10",
        "text": "ICING",
        "path": [
          22,
          23,
          24,
          25,
          26
        ]
      }
    ],
    "solution": "Warm bread on the table",
    "width": 9,
    "height": 7,
    "cells": [
      "B",
      "W",
      "A",
      "N",
      "W",
      "R",
      "R",
      "M",
      "B",
      "R",
      "U",
      "E",
      "E",
      "T",
      "H",
      "A",
      "A",
      "D",
      "O",
      "V",
      "T",
      "S",
      "I",
      "C",
      "I",
      "N",
      "G",
      "O",
      "N",
      "A",
      "T",
      "T",
      "T",
      "S",
      "S",
      "H",
      "E",
      "E",
      "T",
      "A",
      "E",
      "B",
      "I",
      "L",
      "K",
      "Y",
      "F",
      "L",
      "O",
      "U",
      "R",
      "N",
      "N",
      "E",
      "B",
      "O",
      "W",
      "L",
      "D",
      "O",
      "U",
      "G",
      "H"
    ],
    "leftover": [
      1,
      2,
      5,
      7,
      8,
      9,
      12,
      16,
      17,
      18,
      28,
      31,
      35,
      36,
      38,
      39,
      41,
      43,
      53
    ],
    "signature": "eab6ddb30dc24ca337cddd0ff6208b5982ec3214f2d1688b44f7448e16e1b877"
  },
  {
    "id": "en-07",
    "lang": "en",
    "difficulty": "medium",
    "title": "On the railway",
    "words": [
      {
        "id": "w1",
        "text": "ENGINE",
        "path": [
          1,
          2,
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "w2",
        "text": "PLATFORM",
        "path": [
          72,
          73,
          74,
          75,
          76,
          77,
          78,
          79
        ]
      },
      {
        "id": "w3",
        "text": "TICKET",
        "path": [
          54,
          45,
          36,
          27,
          18,
          9
        ]
      },
      {
        "id": "w4",
        "text": "SIGNAL",
        "path": [
          44,
          45,
          46,
          47,
          48,
          49
        ]
      },
      {
        "id": "w5",
        "text": "TRACK",
        "path": [
          10,
          11,
          12,
          13,
          14
        ]
      },
      {
        "id": "w6",
        "text": "TUNNEL",
        "path": [
          10,
          20,
          30,
          40,
          50,
          60
        ]
      },
      {
        "id": "w7",
        "text": "BRIDGE",
        "path": [
          51,
          42,
          33,
          24,
          15,
          6
        ]
      },
      {
        "id": "w8",
        "text": "CARRIAGE",
        "path": [
          62,
          63,
          64,
          65,
          66,
          67,
          68,
          69
        ]
      },
      {
        "id": "w9",
        "text": "STATION",
        "path": [
          70,
          61,
          52,
          43,
          34,
          25,
          16
        ]
      },
      {
        "id": "w10",
        "text": "GUARD",
        "path": [
          55,
          56,
          57,
          58,
          59
        ]
      }
    ],
    "solution": "The journey begins here",
    "width": 10,
    "height": 8,
    "cells": [
      "T",
      "E",
      "N",
      "G",
      "I",
      "N",
      "E",
      "H",
      "E",
      "T",
      "T",
      "R",
      "A",
      "C",
      "K",
      "G",
      "N",
      "J",
      "E",
      "O",
      "U",
      "U",
      "R",
      "N",
      "D",
      "O",
      "E",
      "K",
      "Y",
      "B",
      "N",
      "E",
      "G",
      "I",
      "I",
      "I",
      "C",
      "N",
      "S",
      "H",
      "N",
      "E",
      "R",
      "T",
      "S",
      "I",
      "G",
      "N",
      "A",
      "L",
      "E",
      "B",
      "A",
      "R",
      "T",
      "G",
      "U",
      "A",
      "R",
      "D",
      "L",
      "T",
      "C",
      "A",
      "R",
      "R",
      "I",
      "A",
      "G",
      "E",
      "S",
      "E",
      "P",
      "L",
      "A",
      "T",
      "F",
      "O",
      "R",
      "M"
    ],
    "leftover": [
      0,
      7,
      8,
      17,
      19,
      21,
      22,
      23,
      26,
      28,
      29,
      31,
      32,
      35,
      37,
      38,
      39,
      41,
      53,
      71
    ],
    "signature": "595dee3aa4254fa9c73a1af96751784c6e9f3eb21e36b1df9ba275f1706372d4"
  },
  {
    "id": "en-08",
    "lang": "en",
    "difficulty": "hard",
    "title": "A country walk",
    "words": [
      {
        "id": "w1",
        "text": "MEADOW",
        "path": [
          46,
          45,
          44,
          43,
          42,
          41
        ]
      },
      {
        "id": "w2",
        "text": "STILE",
        "path": [
          15,
          23,
          31,
          39,
          47
        ]
      },
      {
        "id": "w3",
        "text": "HEDGE",
        "path": [
          59,
          51,
          43,
          35,
          27
        ]
      },
      {
        "id": "w4",
        "text": "FOOTPATH",
        "path": [
          4,
          12,
          20,
          28,
          36,
          44,
          52,
          60
        ]
      },
      {
        "id": "w5",
        "text": "BROOK",
        "path": [
          17,
          18,
          19,
          20,
          21
        ]
      },
      {
        "id": "w6",
        "text": "VALLEY",
        "path": [
          16,
          24,
          32,
          40,
          48,
          56
        ]
      },
      {
        "id": "w7",
        "text": "HILL",
        "path": [
          60,
          61,
          62,
          63
        ]
      },
      {
        "id": "w8",
        "text": "GATE",
        "path": [
          30,
          22,
          14,
          6
        ]
      },
      {
        "id": "w9",
        "text": "FERN",
        "path": [
          34,
          26,
          18,
          10
        ]
      },
      {
        "id": "w10",
        "text": "ACORN",
        "path": [
          2,
          11,
          20,
          29,
          38
        ]
      }
    ],
    "solution": "Take the winding path",
    "width": 8,
    "height": 8,
    "cells": [
      "T",
      "A",
      "A",
      "K",
      "F",
      "E",
      "E",
      "T",
      "H",
      "E",
      "N",
      "C",
      "O",
      "W",
      "T",
      "S",
      "V",
      "B",
      "R",
      "O",
      "O",
      "K",
      "A",
      "T",
      "A",
      "I",
      "E",
      "E",
      "T",
      "R",
      "G",
      "I",
      "L",
      "N",
      "F",
      "G",
      "P",
      "D",
      "N",
      "L",
      "L",
      "W",
      "O",
      "D",
      "A",
      "E",
      "M",
      "E",
      "E",
      "I",
      "N",
      "E",
      "T",
      "G",
      "P",
      "A",
      "Y",
      "T",
      "H",
      "H",
      "H",
      "I",
      "L",
      "L"
    ],
    "leftover": [
      0,
      1,
      3,
      5,
      7,
      8,
      9,
      13,
      25,
      33,
      37,
      49,
      50,
      53,
      54,
      55,
      57,
      58
    ],
    "signature": "6108e8b08f2c1d4c82bb43a5bcf9963ee965ee801e55f03ddfa3d7e259bbe0be"
  },
  {
    "id": "en-09",
    "lang": "en",
    "difficulty": "hard",
    "title": "The night sky",
    "words": [
      {
        "id": "w1",
        "text": "PLANET",
        "path": [
          51,
          41,
          31,
          21,
          11,
          1
        ]
      },
      {
        "id": "w2",
        "text": "COMET",
        "path": [
          19,
          29,
          39,
          49,
          59
        ]
      },
      {
        "id": "w3",
        "text": "ORBIT",
        "path": [
          5,
          4,
          3,
          2,
          1
        ]
      },
      {
        "id": "w4",
        "text": "GALAXY",
        "path": [
          6,
          16,
          26,
          36,
          46,
          56
        ]
      },
      {
        "id": "w5",
        "text": "NEBULA",
        "path": [
          10,
          11,
          12,
          13,
          14,
          15
        ]
      },
      {
        "id": "w6",
        "text": "SATURN",
        "path": [
          37,
          36,
          35,
          34,
          33,
          32
        ]
      },
      {
        "id": "w7",
        "text": "VENUS",
        "path": [
          8,
          18,
          28,
          38,
          48
        ]
      },
      {
        "id": "w8",
        "text": "MARS",
        "path": [
          27,
          36,
          45,
          54
        ]
      },
      {
        "id": "w9",
        "text": "MOON",
        "path": [
          40,
          30,
          20,
          10
        ]
      },
      {
        "id": "w10",
        "text": "STAR",
        "path": [
          58,
          47,
          36,
          25
        ]
      }
    ],
    "solution": "Look up and wonder",
    "width": 10,
    "height": 6,
    "cells": [
      "L",
      "T",
      "I",
      "B",
      "R",
      "O",
      "G",
      "O",
      "V",
      "O",
      "N",
      "E",
      "B",
      "U",
      "L",
      "A",
      "A",
      "K",
      "E",
      "C",
      "O",
      "N",
      "U",
      "P",
      "A",
      "R",
      "L",
      "M",
      "N",
      "O",
      "O",
      "A",
      "N",
      "R",
      "U",
      "T",
      "A",
      "S",
      "U",
      "M",
      "M",
      "L",
      "N",
      "D",
      "W",
      "R",
      "X",
      "T",
      "S",
      "E",
      "O",
      "P",
      "N",
      "D",
      "S",
      "E",
      "Y",
      "R",
      "S",
      "T"
    ],
    "leftover": [
      0,
      7,
      9,
      17,
      22,
      23,
      24,
      42,
      43,
      44,
      50,
      52,
      53,
      55,
      57
    ],
    "signature": "168e9238c69ddb059d9c276faf018ca9b78516008c3dd512bef02d529b2ce9f1"
  },
  {
    "id": "en-10",
    "lang": "en",
    "difficulty": "hard",
    "title": "The craft table",
    "words": [
      {
        "id": "w1",
        "text": "NEEDLE",
        "path": [
          69,
          68,
          67,
          66,
          65,
          64
        ]
      },
      {
        "id": "w2",
        "text": "THREAD",
        "path": [
          5,
          13,
          21,
          29,
          37,
          45
        ]
      },
      {
        "id": "w3",
        "text": "RIBBON",
        "path": [
          7,
          15,
          23,
          31,
          39,
          47
        ]
      },
      {
        "id": "w4",
        "text": "BUTTON",
        "path": [
          2,
          10,
          18,
          26,
          34,
          42
        ]
      },
      {
        "id": "w5",
        "text": "FABRIC",
        "path": [
          9,
          17,
          25,
          33,
          41,
          49
        ]
      },
      {
        "id": "w6",
        "text": "THIMBLE",
        "path": [
          63,
          62,
          61,
          60,
          59,
          58,
          57
        ]
      },
      {
        "id": "w7",
        "text": "SCISSORS",
        "path": [
          48,
          49,
          50,
          51,
          52,
          53,
          54,
          55
        ]
      },
      {
        "id": "w8",
        "text": "PATTERN",
        "path": [
          16,
          17,
          18,
          19,
          20,
          21,
          22
        ]
      },
      {
        "id": "w9",
        "text": "YARN",
        "path": [
          35,
          28,
          21,
          14
        ]
      },
      {
        "id": "w10",
        "text": "BEAD",
        "path": [
          23,
          30,
          37,
          44
        ]
      }
    ],
    "solution": "Make something by hand",
    "width": 8,
    "height": 9,
    "cells": [
      "M",
      "A",
      "B",
      "K",
      "E",
      "T",
      "S",
      "R",
      "O",
      "F",
      "U",
      "M",
      "E",
      "H",
      "N",
      "I",
      "P",
      "A",
      "T",
      "T",
      "E",
      "R",
      "N",
      "B",
      "T",
      "B",
      "T",
      "H",
      "A",
      "E",
      "E",
      "B",
      "I",
      "R",
      "O",
      "Y",
      "N",
      "A",
      "G",
      "O",
      "B",
      "I",
      "N",
      "Y",
      "D",
      "D",
      "H",
      "N",
      "S",
      "C",
      "I",
      "S",
      "S",
      "O",
      "R",
      "S",
      "A",
      "E",
      "L",
      "B",
      "M",
      "I",
      "H",
      "T",
      "E",
      "L",
      "D",
      "E",
      "E",
      "N",
      "N",
      "D"
    ],
    "leftover": [
      0,
      1,
      3,
      4,
      6,
      8,
      11,
      12,
      24,
      27,
      32,
      36,
      38,
      40,
      43,
      46,
      56,
      70,
      71
    ],
    "signature": "880b787098a3aac642ecfbbc1d2afa45c5da2b4518d2faab017b14db14aed712"
  }
];
  if (typeof module === "object" && module.exports) module.exports = puzzles;
  else root.WORDSEARCH_PUZZLES = puzzles;
})(typeof globalThis !== "undefined" ? globalThis : this);
