var orbitData = {
    orbits: [
    {
        name: "D(3,4) - Three on a Celtic knot",
        numParticles: 3,
        length: 8.2,
        plotWindow:
        {
            xMin: -.4,
            xMax: .4,
            yMin: -.4,
            yMax: .4
        },
        x:
        {
            sin: [],
            cos: [1, .3238180542, 5, -.1057531661, 7, .1181080254, 11, .05891424178, 13, .009582915952, 17, .005258786816,
                19, -.02387350423, 23, -.0169563007, 25, -.00207258707, 29, -.00134016223, 31, .009498525272, 35, .007377325538,
                37, .0006978893305, 41, .0004821589855, 43, -.00465101986, 47, -.003762276431, 49, -.0002671995061,
                53, -.0001874000563, 55, .002522367698, 59, .002089407785]
        },
        y:
        {
            sin: [1, -.3238180542, 5, .1057531661, 7, .1181080254, 11, .05891424178, 13, -.009582915952, 17, -.005258786816,
                19, -.02387350423, 23, -.0169563007, 25, .00207258707, 29, .00134016223, 31, .009498525272, 35, .007377325538,
                37, -.0006978893305, 41, -.0004821589855, 43, -.00465101986, 47, -.003762276431, 49, .0002671995061,
                53, .0001874000563, 55, .002522367698, 59, .002089407785],
            cos: []
        },
        info:
        {
            header: "Three particles on a Celtic knot",
            description: "Symmetry type D(3,4) = three particles, and planar symmetry group D<sub>4</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;24. ",
            comment: ""
        }
    },
    {
        name: "D&#8242;(3,2) - The figure-8",
        numParticles: 3,
        length: 5.5,
        plotWindow:
        {
            xMin: -1.15,
            xMax: 1.15,
            yMin: -1.15,
            yMax: 1.15
        },
        x:
        {
            sin: [1, 1.095877906, 5, -.02527732956, 7, -.005849442954, 11, .000420998914, 13, .0001222406676],
            cos: []
        },
        y:
        {
            sin: [2, .3372830118, 4, .05571189024, 8, -.002990961071, 10, -.0008024248082, 14, 6775455765e-14, 16,
                2070102699e-14],
            cos: []
        },
        info:
        {
            header: "The Figure 8 choreography",
            description: "Symmetry type D&#8242;(3,2) = three particles, and planar symmetry group D<sub>2</sub>, leading to a dihedral symmetry group of the choreography of order 12",
            comment: "This was the original choreography discovered numerically by Moore (1993), and later, using variational arguments, by Chenciner and Montgomery (2000). This is an example of a choreography for which applying an order two rotation reverses the direction of motion, but there exists a reflection symmetry which does not."
        }
    },
    {
        name: "D(4,2) - The super-eight",
        numParticles: 4,
        length: 6.8,
        plotWindow:
        {
            xMin: -1.5,
            xMax: 1.5,
            yMin: -1.5,
            yMax: 1.5
        },
        x:
        {
            sin: [],
            cos: [1, .7687410527, -1, .6013509217, 3, .1280152696, -3, -.1040640502, 5, -.03138811004, -5, .03751653181,
                7, -.004785319913, -7, -.01791151272, 9, .0007824107011, -9, .009632782068, 11, .0009998198411, -11, -
                .005615763317, 13, -.0004618671965, -13, .003404681238, 15, 6260937462e-14]
        },
        y:
        {
            sin: [1, .7687410527, -1, .6013509217, 3, .1280152696, -3, -.1040640502, 5, -.03138811004, -5, .03751653181,
                7, -.004785319913, -7, -.01791151272, 9, .0007824107011, -9, .009632782068, 11, .0009998198411, -11, -
                .005615763317, 13, -.0004618671965, -13, .003404681238, 15, 6260937462e-14],
            cos: []
        },
        info:
        {
            header: "Super-8",
            description: "Symmetry type D(4,2) = four particles, and planar symmetry group D<sub>2</sub>, leading to a symmetry group of the choreography of order 16.",
            comment: "This was discovered by Gerver (2002) and is an example of a curve for which applying an order two rotation symmetry at any instant will always exchange pairs of particles (that is, it has a core of order&nbsp;2)."
        }
    },
    {
        name: "D(4,6) - Four on a 6-chain",
        numParticles: 4,
        length: 7.4,
        colors: [0, 1, 0, 1],
        plotWindow:
        {
            xMin: -.63,
            xMax: .63,
            yMin: -.63,
            yMax: .63
        },
        x:
        {
            sin: [],
            cos: [1, .3642207032, -5, -.249950974, 7, .05552025098, -11, .06784515105, 13, .01070836263, -17, .02983979151,
                19, -.002330788169, -23, -.01583527736, 25, -.001432809578, -29, -.009129825595, 31, .0005273571969, -
                35, .005605425763, 37, .0003258593342, -41, .003565070837, 43, -.0001434617298]
        },
        y:
        {
            sin: [1, .3642207032, -5, -.249950974, 7, .05552025098, -11, .06784515105, 13, .01070836263, -17, .02983979151,
                19, -.002330788169, -23, -.01583527736, 25, -.001432809578, -29, -.009129825595, 31, .0005273571969, -
                35, .005605425763, 37, .0003258593342, -41, .003565070837, 43, -.0001434617298],
            cos: []
        },
        info:
        {
            header: "Four particles on a 6-chain",
            description: "",
            comment: ""
        }
    },
    {
        name: "D(5,8) - Five on an 8-chain",
        numParticles: 5,
        length: 11.8,
        plotWindow:
        {
            xMin: -.62,
            xMax: .62,
            yMin: -.62,
            yMax: .62
        },
        x:
        {
            sin: [],
            cos: [1, .3935067602, 7, .2480336273, 9, -.03926278987, 17, .008649947758, 23, -.02552061473, 31, .007594124615]
        },
        y:
        {
            sin: [1, .3935067602, 7, -.2480336273, 9, -.03926278987, 17, .008649947758, 23, .02552061473, 31, -.007594124615],
            cos: []
        },
        info:
        {
            header: "Five particles on an 8-looped chain",
            description: "Symmetry type D(5,8) = five particles, and planar symmetry group D<sub>8</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;80.",
            comment: ""
        }
    },
    {
        name: "C(6,1) - No symmetry",
        numParticles: 6,
        length: 9.1,
        colors: [0, 1, 2, 3, 4, 5],
        plotWindow:
        {
            xMin: -1.65,
            xMax: 1.75,
            yMin: -1.7,
            yMax: 1.7
        },
        x:
        {
            sin: [1, -.7550946139, 2, .09566311896, 3, -.06222288074, 4, -.05692574636, 5, -.04406894338, 7, .002559046872,
                8, .001441222792, 9, .004526211957, 10, -.005332636768, 11, -.02262429005, 13, .0009855403007, 14, -
                .003086626135, 15, -.001901717624, 16, -.00570575774, 17, -.002111071339, 19, -.0006094957229, 20, -
                .0007306435328],
            cos: [1, -1.109962224, 2, .4245108806, 3, .1861867012, 4, .1077791693, 5, .04126235116, 7, .005478445066,
                8, .02511172309, 9, .01286401334, 10, .001024818894, 11, .007311536355, 13, -.008193477473, 14, .008394830071,
                15, .005588307047, 16, 4150289381e-14, 17, .0004014658717, 19, .0004442403941, 20, .0002751135899]
        },
        y:
        {
            sin: [1, .1290761392, 2, .2795692615, 3, .03066950237, 4, -.02816043296, 5, .09038665578, 7, -.05057211516,
                8, .04130329696, 9, .02368940768, 10, .007773099334, 11, .003248568014, 13, .001485916194, 14, .001701762733,
                15, .004124630872, 16, .0002364618875, 17, -.000242833944, 19, -.002959513409, 20, .002550656742],
            cos: [1, -.0568973801, 2, -.1306789081, 3, -.04191089847, 4, .005267005641, 5, .1393897003, 7, .009320504379,
                8, .003351111879, 9, .004080150913, 10, .01896049564, 11, .008003083991, 13, .0008604227482, 14, .001905444532,
                15, -.0008602334036, 16, .0008371023946, 17, .007774299909, 19, -.001666145432, 20, .001997432777]
        },
        info:
        {
            header: "Non-symmetrical curve with 6 particles",
            description: "Symmetry type C(6,1) = six particles, with no non-trivial planar symmetries, leading to a cyclic symmetry group of the choreography of order&nbsp;6",
            comment: "This is an example of a curve with no planar symmetries, discovered by Simó (2001) and whose symmetry group contains only rotations of the time circle."
        }
    },
    {
        name: "D(6,4) - Six on a square",
        numParticles: 6,
        length: 8.3,
        plotWindow:
        {
            xMin: -.9,
            xMax: .9,
            yMin: -.9,
            yMax: .9
        },
        x:
        {
            sin: [],
            cos: [1, .7669970506, -3, -.4219853175, 5, .0296658509, -7, -.04264587031, 9, .009045265376, -11, .01714290511,
                13, .001886973281, -15, .01620303782, 17, -7452482708e-14, -19, .004288198157, 21, -.0002709778138, -
                23, -.002437188935, 25, -5979004046e-14, -27, -.002906344259, 29, 743765573e-13, -31, -.0008946926102,
                33, 7477956811e-14, -35, .0005667191757, 37, 2318932946e-14, -39, .0007314257655]
        },
        y:
        {
            sin: [1, .7669970506, -3, -.4219853175, 5, .0296658509, -7, -.04264587031, 9, .009045265376, -11, .01714290511,
                13, .001886973281, -15, .01620303782, 17, -7452482708e-14, -19, .004288198157, 21, -.0002709778138, -
                23, -.002437188935, 25, -5979004046e-14, -27, -.002906344259, 29, 743765573e-13, -31, -.0008946926102,
                33, 7477956811e-14, -35, .0005667191757, 37, 2318932946e-14, -39, .0007314257655],
            cos: []
        },
        info:
        {
            header: "Six particles on a square",
            description: "Symmetry type D(6,4) = six particles, and planar symmetry group D<sub>4</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;48.",
            comment: "This is one of three choreographies shown here which have the same symmetry group, but lie in different connected components."
        }
    },
    {
        name: "D(6,4) - Six on a tensor sign",
        numParticles: 6,
        colors: [0, 1, 2, 3, 4, 5],
        length: 11.7,
        plotWindow:
        {
            xMin: -.84,
            xMax: .84,
            yMin: -.84,
            yMax: .84
        },
        x:
        {
            sin: [],
            cos: [1, .3375541151, -3, .4220849651, 5, -.1558280988, -7, .1102902798, 9, .01447231142, -11, .06447221245,
                13, .002229057005, -15, -.002684154272, 17, .007417419035, -19, -.02594656325, 21, -.001918903771, -
                23, -.01804124796, 25, -.0001209779637, -27, .0001613594422, 29, -.001202390464, -31, .009338064383,
                33, .0004710325442, -35, .006859671041, 37, -.0001076086104]
        },
        y:
        {
            sin: [1, .3375541151, -3, .4220849651, 5, -.1558280988, -7, .1102902798, 9, .01447231142, -11, .06447221245,
                13, .002229057005, -15, -.002684154272, 17, .007417419035, -19, -.02594656325, 21, -.001918903771, -
                23, -.01804124796, 25, -.0001209779637, -27, .0001613594422, 29, -.001202390464, -31, .009338064383,
                33, .0004710325442, -35, .006859671041, 37, -.0001076086104],
            cos: []
        },
        info:
        {
            header: "Six particles on a tensor sign",
            description: "Symmetry type D(6,4) = six particles, and planar symmetry group D<sub>4</sub>, leading to a symmetry group of the choreography of order&nbsp;48.",
            comment: "This is one of three choreographies shown here which have the same symmetry group, but lie in different connected components."
        }
    },
    {
        name: "D(6,4) - Six on cross",
        numParticles: 6,
        colors: [0, 1, 2, 3, 4, 5],
        length: 11.7,
        plotWindow:
        {
            xMin: -.7,
            xMax: .7,
            yMin: -.7,
            yMax: .7
        },
        x:
        {
            sin: [],
            cos: [1, .5020173065, -3, -.09456153969, 5, -.2122778043, -7, .1447704683, 9, -.0002859097727, -11, .06510500203,
                13, .01872093762, -15, -.0001152510132, 17, .01165954511, -19, -.02711000967, 21, .0007350990492, -
                23, -.01973351403, 25, -.003921472516, -27, 4199889109e-15, 29, -.002758609826, -31, .01179348348,
                33, -.0001370761822, -35, .009469083134, 37, .001261123323, -39, 375229597e-14, 41, .0008908942672, -
                43, -.006357237822, 45, 1510907998e-14, -47, -.005308253503, 49, -.0004742687281]
        },
        y:
        {
            sin: [1, .5020173065, -3, -.09456153969, 5, -.2122778043, -7, .1447704683, 9, -.0002859097727, -11, .06510500203,
                13, .01872093762, -15, -.0001152510132, 17, .01165954511, -19, -.02711000967, 21, .0007350990492, -
                23, -.01973351403, 25, -.003921472516, -27, 4199889109e-15, 29, -.002758609826, -31, .01179348348,
                33, -.0001370761822, -35, .009469083134, 37, .001261123323, -39, 375229597e-14, 41, .0008908942672, -
                43, -.006357237822, 45, 1510907998e-14, -47, -.005308253503, 49, -.0004742687281],
            cos: []
        },
        info:
        {
            header: "Six particles on a cross",
            description: "Symmetry type D(6,4) = six particles, and planar symmetry group D<sub>4</sub>, leading to a symmetry group of the choreography of order&nbsp;48.",
            comment: "This is one of three choreographies shown here which have the same symmetry group, but lie in different connected components."
        }
    },
    {
        name: "D(6,5) - Six on a 5-daisy",
        numParticles: 6,
        length: 8.1,
        plotWindow:
        {
            xMin: -1.05,
            xMax: .95,
            yMin: -1,
            yMax: 1
        },
        x:
        {
            sin: [],
            cos: [1, .6932058558, -4, -.306124454, -9, -.08357786498, 11, .00491379187, -14, -.03176112544, 16, .004737161529, -
                19, -.01006167085, 21, .003074044286, 26, .00142750095, -29, .004146451167, 31, .000486885508, -34,
                .005002080697, -39, .00415766228, 41, -.0002241949892, -44, .002658237721]
        },
        y:
        {
            sin: [1, .6932058558, -4, -.306124454, -9, -.08357786498, 11, .00491379187, -14, -.03176112544, 16, .004737161529, -
                19, -.01006167085, 21, .003074044286, 26, .00142750095, -29, .004146451167, 31, .000486885508, -34,
                .005002080697, -39, .00415766228, 41, -.0002241949892, -44, .002658237721],
            cos: []
        },
        info:
        {
            header: "Six particles on a 5-daisy",
            description: "",
            comment: ""
        }
    },
    {
        name: "D(6,5/2) - Six on a pentagram",
        numParticles: 6,
        length: 9.6,
        colors: [0, 1, 0, 1, 0, 1],
        plotWindow:
        {
            xMin: -.89,
            xMax: .95,
            yMin: -.92,
            yMax: .92
        },
        x:
        {
            sin: [],
            cos: [2, .4468616777, -3, -.4771728097, 7, -.007365138055, -8, -.04184471223, -13, -.008354164386, 17,
                .0008276011763, 22, .0003099240031, -23, .00196338389, 27, .0002204659775, -28, .001874481252, 32,
                7995119096e-14, -33, .00125671506]
        },
        y:
        {
            sin: [2, .4468616777, -3, -.4771728097, 7, -.007365138055, -8, -.04184471223, -13, -.008354164386, 17,
                .0008276011763, 22, .0003099240031, -23, .00196338389, 27, .0002204659775, -28, .001874481252, 32,
                7995119096e-14, -33, .00125671506],
            cos: []
        },
        info:
        {
            header: "Six particles on a pentagram",
            description: "",
            comment: ""
        }
    },
    {
        name: "D(6,5/2) - Six on a 5-flower",
        numParticles: 6,
        colors: [0, 1, 2, 0, 1, 2],
        length: 10.1,
        plotWindow:
        {
            xMin: -.84,
            xMax: .86,
            yMin: -.85,
            yMax: .85
        },
        x:
        {
            sin: [],
            cos: [2, .666017812, -3, .01903670154, 7, -.1706294667, -8, -.001754286285, -13, -.0002563251066, 17, -
                .004544328892]
        },
        y:
        {
            sin: [2, .666017812, -3, .01903670154, 7, -.1706294667, -8, -.001754286285, -13, -.0002563251066, 17, -
                .004544328892],
            cos: []
        },
        info:
        {
            header: "Six particles on a 5-flower",
            description: "",
            comment: ""
        }
    },
    {
        name: "D(6,7/2) - Six on a heptagram",
        numParticles: 6,
        length: 9.7,
        colors: [0, 1, 2, 0, 1, 2],
        plotWindow:
        {
            xMin: -.91,
            xMax: .93,
            yMin: -.92,
            yMax: .92
        },
        x:
        {
            sin: [],
            cos: [2, .6718030063, -5, .2117062813, 9, -.004498968884, -12, 0, 16, -.0006728660854, -19, .000513212546,
                23, .0001515002178]
        },
        y:
        {
            sin: [2, .6718030063, -5, .2117062813, 9, -.004498968884, -12, 0, 16, -.0006728660854, -19, .000513212546,
                23, .0001515002178],
            cos: []
        },
        info:
        {
            header: "Six particles on a heptagram",
            description: "Symmetry type D(6,7/2) = six particles, and planar symmetry group D<sub>7</sub>. The full symmetry group has order&nbsp;84.",
            comment: "This choreography is one of two examples in this set with the same symmetry group which lie in different connected components."
        }
    },
    {
        name: "D(6,7/2) - Six on a 7 petal flower",
        numParticles: 6,
        length: 12.2,
        plotWindow:
        {
            xMin: -.7,
            xMax: .7,
            yMin: -.7,
            yMax: .7
        },
        x:
        {
            sin: [],
            cos: [2, .3389259366, -5, .3604619342, 9, -.04442049316, -12, 0, 16, .0140692024, -19, -.02133896304,
                23, -.003686948927, -26, .011287677, 30, 0, -33, .0002029186983, 37, .0008789427699, -40, -.003981710049,
                44, -.0006116942612, -47, .002506622731]
        },
        y:
        {
            sin: [2, .3389259366, -5, .3604619342, 9, -.04442049316, -12, 0, 16, .0140692024, -19, -.02133896304,
                23, -.003686948927, -26, .011287677, 30, 0, -33, .0002029186983, 37, .0008789427699, -40, -.003981710049,
                44, -.0006116942612, -47, .002506622731],
            cos: []
        },
        info:
        {
            header: "Six particles on a 7-petal flower",
            description: "Symmetry type D(6,7/2) = six particles, and planar symmetry group D<sub>7</sub>. The full symmetry group has order&nbsp;84.",
            comment: "This choreography is one of two examples in this set with the same symmetry group which lie in different connected components."
        }
    },
    {
        name: "C&#8242;(7,2) - Seven on a butterfly",
        numParticles: 7,
        length: 10.1,
        plotWindow:
        {
            xMin: -1.25,
            xMax: 1.25,
            yMin: -1.25,
            yMax: 1.25
        },
        x:
        {
            sin: [2, .6698, 4, -.061516, 6, -.030726, 8, .013552],
            cos: [2, .33346, 4, -.17573, 6, .0045556, 8, -.016113]
        },
        y:
        {
            sin: [1, .71758, 3, .42748, 5, .093694],
            cos: [1, -.41438, 3, .21726, 5, -.080218]
        },
        info:
        {
            header: "Seven particles on a butterfly",
            description: "Symmetry type C&#8242;(7,2) = seven particles, and planar symmetry group C<sub>2</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;14.",
            comment: "The curve has reflectional symmetry in one direction, but no rotational symmetry. Notice that the reflection preserves the direction of motion on the curve."
        }
    },
    {
        name: "D&#8242;(7,2) - Figure 8",
        numParticles: 7,
        length: 8.9,
        plotWindow:
        {
            xMin: -1.8,
            xMax: 1.8,
            yMin: -1.8,
            yMax: 1.8
        },
        x:
        {
            sin: [1, 1.654924655, 3, -.0646563788, 5, .009983641036, 9, -.002227071912, 11, -.001801662511, 13, -.001070749384,
                15, -.000506342208, 17, -.0001997124901],
            cos: []
        },
        y:
        {
            sin: [2, .5909346805, 4, .03021664819, 6, .03337493534, 8, .008137225851, 10, .002881644999, 12, .0007370559483,
                16, -.0001650419513, 18, -.0001476340004],
            cos: []
        },
        info:
        {
            header: "Seven particles on a figure eight",
            description: "Symmetry type D&#8242;(7,2) = seven particles, and planar symmetry group D<sub>2</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;28.",
            comment: "The figure eight choreography has been shown to exist with many odd values of&nbsp;n."
        }
    },
    {
        name: "D&#8242;(7,2) - Bowtie",
        numParticles: 7,
        length: 9.4,
        colors: [0, 1, 2, 3, 4, 5, 6],
        plotWindow:
        {
            xMin: -1.15,
            xMax: 1.15,
            yMin: -1.15,
            yMax: 1.15
        },
        x:
        {
            sin: [1, 1.091365422, 3, .4414472756, 5, -.00365292443, 9, -.02548081852, 11, -.02138477718, 13, .004599397177,
                15, -.003243642377, 17, .007646278321],
            cos: []
        },
        y:
        {
            sin: [2, .6905451088, 4, -.1729103958, 6, .03337493534, 8, -.010122125371, 10, .01425627099, 12, .01933961549,
                16, .005359359294, 18, -.007081545609],
            cos: []
        },
        info:
        {
            header: "Seven particles on a bow-tie",
            description: "Symmetry type D&#8242;(7,2) = seven particles, and planar symmetry group D<sub>2</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;28.",
            comment: "This choreography has the same symmetry group as the figure eight, but lies in a different connected component."
        }
    },
    {
        name: "D(6,7/3) - Six on an atom",
        numParticles: 6,
        colors: [0, 1, 0, 1, 0, 1],
        length: 11.5,
        plotWindow:
        {
            xMin: -.73,
            xMax: .73,
            yMin: -.73,
            yMax: .73
        },
        x:
        {
            sin: [],
            cos: [3, .252731354, -4, .4422453614, 10, .006512223797, -11, -.01630697113, 17, .0005509055556, -18, 0,
                24, 0, -25, .001871253435, 31, 4278762892e-14, -32, -.001405577419, 38, -39033216e-12, -39, .0007443270428,
                45, 1017688347e-14, -46, -.0003142405462]
        },
        y:
        {
            sin: [3, .252731354, -4, .4422453614, 10, .006512223797, -11, -.01630697113, 17, .0005509055556, -18, 0,
                24, 0, -25, .001871253435, 31, 4278762892e-14, -32, -.001405577419, 38, -39033216e-12, -39, .0007443270428,
                45, 1017688347e-14, -46, -.0003142405462],
            cos: []
        },
        info:
        {
            header: "Six particles on a 7-atom",
            description: "Symmetry type D(6,7/3) = six particles, and planar symmetry group D<sub>7</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;84.",
            comment: ""
        }
    },
    {
        name: "D(8,3) - Moustache",
        numParticles: 8,
        length: 10.9,
        colors: [0, 1, 2, 3, 0, 1, 2, 3],
        plotWindow:
        {

            xMin: -1.6,
            xMax: 1.2,
            yMin: -1.4,
            yMax: 1.4
        },
        x:
        {
            sin: [],
            cos: [1, .5855002517, -2, -.6975795551, 4, -.2107867182, -5, -.1103782792, 7, .0299848468, 10, .02381910033, -
                11, .01161307123, 13, -.01728777475, -14, .003591482109, -17, .001786931865, 19, .00676758542, -20,
                .00151623536, 22, -.003455058244, -23, .0002430321881, 25, -.00128197031, -26, -4663491809e-14, 28,
                .002329249083, -29, .0001553222937]
        },
        y:
        {
            sin: [1, .5855002517, -2, -.6975795551, 4, -.2107867182, -5, -.1103782792, 7, .0299848468, 10, .02381910033, -
                11, .01161307123, 13, -.01728777475, -14, .003591482109, -17, .001786931865, 19, .00676758542, -20,
                .00151623536, 22, -.003455058244, -23, .0002430321881, 25, -.00128197031, -26, -4663491809e-14, 28,
                .002329249083, -29, .0001553222937],
            cos: []
        },
        info:
        {
            header: "Eight particles on a moustache",
            description: "Symmetry type D(8,3) = eight particles, and planar symmetry group D<sub>3</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;48.",
            comment: ""
        }
    },
    {
        name: "D(8,3) - Eight on a 3 petal flower",
        numParticles: 8,
        colors: [0, 1, 2, 3, 0, 1, 2, 3],
        length: 10.1,
        plotWindow:
        {
            xMin: -1.7,
            xMax: 1.3,
            yMin: -1.5,
            yMax: 1.5
        },
        x:
        {
            sin: [],
            cos: [1, .7656403736, -2, -.7386086907, 4, .07116602246, -5, .01543443541, 7, .0183934114, 10, .005789150532, -
                11, .004908743265, 13, .001346512866, -14, .004625955455, -17, .001556790043, 19, -.000347300935, -
                20, -7566709546e-14, 22, -.0003311623195, -23, -.0004827558138, 25, -.0002368609203, -26, -.0003673171202,
                28, -.0001437820548, -29, -.0001447969848]
        },
        y:
        {
            sin: [1, .7656403736, -2, -.7386086907, 4, .07116602246, -5, .01543443541, 7, .0183934114, 10, .005789150532, -
                11, .004908743265, 13, .001346512866, -14, .004625955455, -17, .001556790043, 19, -.000347300935, -
                20, -7566709546e-14, 22, -.0003311623195, -23, -.0004827558138, 25, -.0002368609203, -26, -.0003673171202,
                28, -.0001437820548, -29, -.0001447969848],
            cos: []
        },
        info:
        {
            header: "Eight particles on a 3-petal flower",
            description: "Symmetry type D(8,3) = eight particles, and planar symmetry group D<sub>3</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;48.",
            comment: "This is one of three choreographies given here with this symmetry group, which lie in different connected components."
        }
    },
    {
        name: "D(8,3) - Eight on 3-foil",
        numParticles: 8,
        length: 12.5,
        colors: [0, 1, 0, 1, 0, 1, 0, 1],
        plotWindow:
        {
            xMin: -1.1,
            xMax: 1.1,
            yMin: -1.1,
            yMax: 1.1
        },
        x:
        {
            sin: [],
            cos: [1, .5954570266, -2, -.1073055361, 4, -.4363298113, -5, -.009065054033, 7, -.1024344433, 10, -.01624485444, -
                11, -.0004165597797, 13, .0001680529934, -14, .0009220846361, -17, .001353047496, 19, .001022304836, -
                20, .0008352720423, 22, .003905679087, -23, .0004523099612, 25, .005448226233, -26, .0002555059424,
                28, .004648564484]
        },
        y:
        {
            sin: [1, .5954570266, -2, -.1073055361, 4, -.4363298113, -5, -.009065054033, 7, -.1024344433, 10, -.01624485444, -
                11, -.0004165597797, 13, .0001680529934, -14, .0009220846361, -17, .001353047496, 19, .001022304836, -
                20, .0008352720423, 22, .003905679087, -23, .0004523099612, 25, .005448226233, -26, .0002555059424,
                28, .004648564484],
            cos: []
        },
        info:
        {
            header: "Eight particles on a 3-foil",
            description: "Symmetry type D(8,3) = eight particles, and planar symmetry group D<sub>3</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;48.",
            comment: "This is one of three choreographies given here with this symmetry group, which lie in different connected components. This shape is similar to the trefoil, but has an extra layer of crossings inside the central region."
        }
    },
    {
        name: "D(8,3) - Eight on trefoil",
        numParticles: 8,
        length: 10.7,
        colors: [0, 1, 2, 3, 0, 1, 2, 3],
        plotWindow:
        {
            xMin: -1.4,
            xMax: 1.1,
            yMin: -1.25,
            yMax: 1.25
        },
        x:
        {
            sin: [],
            cos: [-1, .433097123, 2, -.838601555, -4, -.01611161518, 5, -.01460819706, -7, -.001665826568, -10, -.0005150074656,
                11, .002845040152, -13, -.000139643963, 14, .002961094992, 17, .001611629134]
        },
        y:
        {
            sin: [-1, .433097123, 2, -.838601555, -4, -.01611161518, 5, -.01460819706, -7, -.001665826568, -10, -.0005150074656,
                11, .002845040152, -13, -.000139643963, 14, .002961094992, 17, .001611629134],
            cos: []
        },
        info:
        {
            header: "Eight particles on a trefoil knot",
            description: "Symmetry type D(8,3) = eight particles, and planar symmetry group D<sub>3</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;48.",
            comment: "This is one of three choreographies given here with this symmetry group, which lie in different connected components."
        }
    },
    {
        name: "D(8,9/2) - Eight on a {9/2}-enneagram",
        numParticles: 8,
        length: 11.4,
        colors: [0, 1, 2, 3, 0, 1, 2, 3],
        plotWindow:
        {
            xMin: -1.05,
            xMax: 1.05,
            yMin: -1.05,
            yMax: 1.05
        },
        x:
        {
            sin: [],
            cos: [2, .7903901078, -7, .1700926013, 11, -.0008684892342, 20, -.0005169844835, -25, .0001199631619,
                29, 3494606269e-14, -34, -1885282369e-15, 38, 1200959094e-14, -43, -1342914084e-15, 47, -
                3165786479e-15, -52, 6.737328007e-8, -61, 5.131421153e-8, 65, 1.506910009e-7]
        },
        y:
        {
            sin: [2, .7903901078, -7, .1700926013, 11, -.0008684892342, 20, -.0005169844835, -25, .0001199631619,
                29, 3494606269e-14, -34, -1885282369e-15, 38, 1200959094e-14, -43, -1342914084e-15, 47, -
                3165786479e-15, -52, 6.737328007e-8, -61, 5.131421153e-8, 65, 1.506910009e-7],
            cos: []
        },
        info:
        {
            header: "Eight particles on a {9/2}-enneagram",
            description: "Symmetry type D(8,9/2) = eight particles, and planar symmetry group D<sub>9</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;144.",
            comment: "In this choreography, the eight particles move as if they were four binary pairs."
        }
    },
    {
        name: "D(8,9/4) - Eight on a {9/4} enneagram",
        numParticles: 8,
        length: 13,
        colors: [0, 1, 0, 1, 0, 1, 0, 1],
        plotWindow:
        {
            xMin: -.9,
            xMax: .9,
            yMin: -.9,
            yMax: .9
        },
        x:
        {
            sin: [],
            cos: [4, .423108347, -5, .3195216723, 13, -.02065156506, -14, .002146368791, 22, .003406550808, -23, -.0010513364,
                31, -.0007181003319, -41, 3152493699e-14, 49, .0001843985573, -50, -1248100811e-14, 58, -.000180792826, -
                59, 1731964787e-14, 67, .0001280941398]
        },
        y:
        {
            sin: [4, .423108347, -5, .3195216723, 13, -.02065156506, -14, .002146368791, 22, .003406550808, -23, -.0010513364,
                31, -.0007181003319, -41, 3152493699e-14, 49, .0001843985573, -50, -1248100811e-14, 58, -.000180792826, -
                59, 1731964787e-14, 67, .0001280941398],
            cos: []
        },
        info:
        {
            header: "Eight particles on a {9/4}-enneagram",
            description: "Symmetry type D(8,9/4) = eight particles, and planar symmetry group D<sub>9</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;144.",
            comment: ""
        }
    },
    {
        name: "D&#8242;(9,1) - Nine on a piece of ginger",
        numParticles: 9,
        length: 10.9,
        colors: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        plotWindow:
        {
            xMin: -1.55,
            xMax: 1.55,
            yMin: -1.55,
            yMax: 1.55
        },
        x:
        {
            sin: [1, 1.1283, 2, -.31224, 3, .41648, 4, .14838, 5, .073336, 6, .040019, 7, .010128, 8, .0024523, 10,
                .0092424, 11, -.0013352, 12, .0010912],
            cos: []
        },
        y:
        {
            sin: [1, -.60598, 2, .64057, 3, .30997, 4, -.057501, 5, -.094251, 6, -.034107, 7, -.021146, 8, .021866,
                10, .0028073, 11, -.015569, 12, -.0028514],
            cos: []
        },
        info:
        {
            header: "Nine particles on a piece of ginger",
            description: "Symmetry type D&#8242;(9,1) = nine particles, and a single rotational symmetry. Notice that the rotation by 180 degrees reverses the direction of motion.",
            comment: ""
        }
    },
    {
        name: "D(9,4) - Nine on a bear",
        numParticles: 9,
        colors: [0, 1, 2, 0, 1, 2, 0, 1, 2],
        length: 14.4,
        plotWindow:
        {
            xMin: -.85,
            xMax: .85,
            yMin: -.85,
            yMax: .85
        },
        x:
        {
            sin: [],
            cos: [1, .5798048546, -3, .07804870416, 5, -.3434430105, -7, .1083329957, -11, .06081926513, 13, .01984584357, -
                15, -.0008731944407, 17, .002928936536, -19, -.02816572417, 21, .003716565953, -23, -.02116817724,
                25, -.0008110307449, 29, -.000351131589, -31, .013357463, 33, .0009533834058, -35, .01078265244, 37,
                9248052645e-14, -39, -755599745e-14, 41, 7565047178e-14, -43, -.007238068821, -47, -.005993109494,
                49, -.0001679080273]
        },
        y:
        {
            sin: [1, .5798048546, -3, .07804870416, 5, -.3434430105, -7, .1083329957, -11, .06081926513, 13, .01984584357, -
                15, -.0008731944407, 17, .002928936536, -19, -.02816572417, 21, .003716565953, -23, -.02116817724,
                25, -.0008110307449, 29, -.000351131589, -31, .013357463, 33, .0009533834058, -35, .01078265244, 37,
                9248052645e-14, -39, -755599745e-14, 41, 7565047178e-14, -43, -.007238068821, -47, -.005993109494,
                49, -.0001679080273],
            cos: []
        },
        info:
        {
            header: "Nine particles on a bear",
            description: "Symmetry type D(9,4) = nine particles, and planar symmetry group D<sub>4</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;72.",
            comment: "This is one of two choreographies shown with this symmetry group, which lie in different connected components."
        }
    },
    {
        name: "D(9,4) - Nine on a doily",
        numParticles: 9,
        length: 13,
        colors: [0, 1, 2, 0, 1, 2, 0, 1, 2],
        plotWindow:
        {
            xMin: -.81,
            xMax: .81,
            yMin: -.81,
            yMax: .81
        },
        x:
        {
            sin: [],
            cos: [1, .6077524806, -3, -.1383177447, 5, -.2485514205, -7, .1161077234, -11, .08869779546, 13, .04373862487, -
                15, .01199658295, 17, .01647199505, -19, -.03324802231, 21, -.004019858897, -23, -.02788742811, 25, -
                .007931675424, 29, -.004322217233, -31, .01661362322, 33, .0004085448536, -35, .012054454, 37, .002588841845, -
                39, -.001379527946, 41, .00180295408, -43, -.008787233021, -47, -.006215773894, 49, -.001045082689]
        },
        y:
        {
            sin: [1, .6077524806, -3, -.1383177447, 5, -.2485514205, -7, .1161077234, -11, .08869779546, 13, .04373862487, -
                15, .01199658295, 17, .01647199505, -19, -.03324802231, 21, -.004019858897, -23, -.02788742811, 25, -
                .007931675424, 29, -.004322217233, -31, .01661362322, 33, .0004085448536, -35, .012054454, 37, .002588841845, -
                39, -.001379527946, 41, .00180295408, -43, -.008787233021, -47, -.006215773894, 49, -.001045082689],
            cos: []
        },
        info:
        {
            header: "Nine particles on a doily",
            description: "Symmetry type D(9,4) = nine particles, and planar symmetry group D<sub>4</sub>, leading to a dihedral symmetry group of the choreography of order&nbsp;72.",
            comment: "This is one of two choreographies shown with this symmetry group, which lie in different connected components."
        }
    },
    {
        name: "D(10,5/2) - 10 on a pentagram",
        colors: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        numParticles: 10,
        length: 12.3,
        plotWindow:
        {
            xMin: -1.27,
            xMax: 1.27,
            yMin: -1.27,
            yMax: 1.27
        },
        x:
        {
            sin: [],
            cos: [2, .71136, 3, -.48089, 7, .0655, 8, .052856, 12, .013293, 13, .025317, 17, .0012211, 18, -.0090739,
                22, 40296e-8, 23, -.0068906, 27, 73001e-8, 28, .0029054]
        },
        y:
        {
            sin: [2, .71136, 3, .48089, 7, .0655, 8, -.052856, 12, .013293, 13, -.025317, 17, .0012211, 18, .0090739,
                22, 40296e-8, 23, .0068906, 27, 73001e-8, 28, -.0029054],
            cos: []
        },
        info:
        {
            header: "Ten particles on a pentagram",
            description: "Symmetry type D(10,5/2) = ten particles, and planar symmetry group D<sub>5</sub>, leading to a symmetry group of the choreography of order&nbsp;100.",
            comment: ""
        }
    },
    {
        name: "D(10,8/3) - 10 on an octagram",
        colors: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        numParticles: 10,
        length: 13.2,
        plotWindow:
        {
            xMin: -.92,
            xMax: .92,
            yMin: -.92,
            yMax: .92
        },
        x:
        {
            sin: [],
            cos: [3, .6241426424, -5, .2843939666, 11, -.01448718416, -13, -.01115310411, 19, .0003101738557, -21, -
                .01001352249, 27, .0009369441432, -29, .003534199437]
        },
        y:
        {
            sin: [3, .6241426424, -5, .2843939666, 11, -.01448718416, -13, -.01115310411, 19, .0003101738557, -21, -
                .01001352249, 27, .0009369441432, -29, .003534199437],
            cos: []
        },
        info:
        {
            header: "Ten particles on an octagram",
            description: "",
            comment: ""
        }
    }]
};
