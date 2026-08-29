/*
 * Jellyfin LyricMotion LyricG2P 6 — fully offline/on-device context romanizer.
 *
 * First-class Indian-script handlers use whole-word/whole-line context,
 * language-specific vowel/consonant rules, schwa logic, conjunct handling,
 * contextual nasals/voicing and compact lyric-pronunciation lexicons.
 * A generated ICU Any-Latin/Latin-ASCII table remains only as broad Unicode
 * fallback coverage for scripts without a dedicated pronunciation engine.
 * No provider lookup, remote API, model download or network request exists.
 * See THIRD_PARTY_NOTICES.md for the ICU/Unicode MIT notice.
 */
(function () {
    'use strict';

    const VERSION = '6.6.0';

    const ROMANIZATION_STYLE = Object.freeze({
        id: 'lyricmotion-song-ascii-1',
        longVowels: 'aa-ee-oo',
        academicDiacritics: false,
        aspiration: 'digraph',
        malayalamZha: 'zh',
        tamilZha: 'zh',
        preserveLatin: true,
        generatedCase: 'lower-native+sentence-case-recovered-english',
        goal: 'readable-singable-song-romanization'
    });
    const FALLBACK_ENTRY_COUNT = 60513;
    const FALLBACK_DATA = "374\t'\n37A\ti\n37E\t;\n386\tA\n388\tE\n389\tE\n38A\tI\n38C\tO\n38E\tY\n38F\tO\n390\ti\n391\tA\n392\tB\n393\tG\n394\tD\n395\tE\n396\tZ\n397\tE\n398\tTH\n399\tI\n39A\tK\n39B\tL\n39C\tM\n39D\tN\n39E\tX\n39F\tO\n3A0\tP\n3A1\tR\n3A3\tS\n3A4\tT\n3A5\tY\n3A6\tPH\n3A7\tCH\n3A8\tPS\n3A9\tO\n3AA\tI\n3AB\tY\n3AC\ta\n3AD\te\n3AE\te\n3AF\ti\n3B0\ty\n3B1\ta\n3B2\tb\n3B3\tg\n3B4\td\n3B5\te\n3B6\tz\n3B7\te\n3B8\tth\n3B9\ti\n3BA\tk\n3BB\tl\n3BC\tm\n3BD\tn\n3BE\tx\n3BF\to\n3C0\tp\n3C1\tr\n3C2\ts\n3C3\ts\n3C4\tt\n3C5\ty\n3C6\tph\n3C7\tch\n3C8\tps\n3C9\to\n3CA\ti\n3CB\ty\n3CC\to\n3CD\ty\n3CE\to\n3D0\tb\n3D1\tth\n3D2\tY\n3D3\tY\n3D4\tY\n3D5\tph\n3D6\tp\n3F0\tk\n3F1\tr\n3F2\ts\n3F3\tj\n3F4\tTH\n3F5\te\n3F7\tS\n3F8\ts\n3F9\tS\n3FA\tS\n3FB\ts\n400\tE\n401\tE\n402\tD\n403\tG\n404\tE\n405\tZ\n406\tI\n407\tI\n408\tJ\n409\tL\n40A\tN\n40B\tC\n40C\tK\n40D\tI\n40E\tU\n40F\tD\n410\tA\n411\tB\n412\tV\n413\tG\n414\tD\n415\tE\n416\tZ\n417\tZ\n418\tI\n419\tJ\n41A\tK\n41B\tL\n41C\tM\n41D\tN\n41E\tO\n41F\tP\n420\tR\n421\tS\n422\tT\n423\tU\n424\tF\n425\tH\n426\tC\n427\tC\n428\tS\n429\tS\n42A\t\"\n42B\tY\n42C\t'\n42D\tE\n42E\tU\n42F\tA\n430\ta\n431\tb\n432\tv\n433\tg\n434\td\n435\te\n436\tz\n437\tz\n438\ti\n439\tj\n43A\tk\n43B\tl\n43C\tm\n43D\tn\n43E\to\n43F\tp\n440\tr\n441\ts\n442\tt\n443\tu\n444\tf\n445\th\n446\tc\n447\tc\n448\ts\n449\ts\n44A\t\"\n44B\ty\n44C\t'\n44D\te\n44E\tu\n44F\ta\n450\te\n451\te\n452\td\n453\tg\n454\te\n455\tz\n456\ti\n457\ti\n458\tj\n459\tl\n45A\tn\n45B\tc\n45C\tk\n45D\ti\n45E\tu\n45F\td\n490\tG\n491\tg\n492\tG\n493\tg\n494\tG\n495\tg\n498\tZ\n499\tz\n49A\tK\n49B\tk\n4A2\tN\n4A3\tn\n4AE\tU\n4AF\tu\n4B0\tU\n4B1\tu\n4BA\tH\n4BB\th\n4C1\tZ\n4C2\tz\n4D0\tA\n4D1\ta\n4D2\tA\n4D3\ta\n4D4\tAE\n4D5\tae\n4D6\tE\n4D7\te\n4DC\tZ\n4DD\tz\n4DE\tZ\n4DF\tz\n4E2\tI\n4E3\ti\n4E4\tI\n4E5\ti\n4E6\tO\n4E7\to\n4E8\tO\n4E9\to\n4EC\tE\n4ED\te\n4EE\tU\n4EF\tu\n4F0\tU\n4F1\tu\n4F2\tU\n4F3\tu\n4F4\tC\n4F5\tc\n4F8\tY\n4F9\ty\n531\tA\n532\tB\n533\tG\n534\tD\n535\tE\n536\tZ\n537\tE\n539\tT'\n53A\tZ\n53B\tI\n53C\tL\n53D\tX\n53E\tC\n53F\tK\n540\tH\n541\tJ\n542\tG\n543\tC\n544\tM\n545\tY\n546\tN\n547\tS\n548\tO\n549\tC'\n54A\tP\n54B\tJ\n54C\tR\n54D\tS\n54E\tV\n54F\tT\n550\tR\n551\tC'\n552\tW\n553\tP'\n554\tK'\n555\tO\n556\tF\n55A\t'\n55D\t,\n55E\t?\n561\ta\n562\tb\n563\tg\n564\td\n565\te\n566\tz\n567\te\n569\tt'\n56A\tz\n56B\ti\n56C\tl\n56D\tx\n56E\tc\n56F\tk\n570\th\n571\tj\n572\tg\n573\tc\n574\tm\n575\ty\n576\tn\n577\ts\n578\to\n579\tc'\n57A\tp\n57B\tj\n57C\tr\n57D\ts\n57E\tv\n57F\tt\n580\tr\n581\tc'\n582\tw\n583\tp'\n584\tk'\n585\to\n586\tf\n587\tev\n5B0\te\n5B1\te\n5B2\ta\n5B3\to\n5B4\ti\n5B5\te\n5B6\te\n5B7\ta\n5B8\ta\n5B9\to\n5BB\tu\n5BE\t-\n5D0\t'\n5D1\tb\n5D2\tg\n5D3\td\n5D4\th\n5D5\tw\n5D6\tz\n5D7\th\n5D8\tt\n5D9\ty\n5DA\tk\n5DB\tk\n5DC\tl\n5DD\tm\n5DE\tm\n5DF\tn\n5E0\tn\n5E1\ts\n5E2\t'\n5E3\tp\n5E4\tp\n5E5\tz\n5E6\tz\n5E7\tq\n5E8\tr\n5E9\ts\n5EA\tt\n5F0\tww\n5F1\twy\n5F2\tyy\n5F3\t'\n5F4\t\"\n622\ta\n623\ta\n624\tw\n625\ta\n626\ty\n627\ta\n628\tb\n629\tt\n62A\tt\n62B\tth\n62C\tj\n62D\th\n62E\tkh\n62F\td\n630\tdh\n631\tr\n632\tz\n633\ts\n634\tsh\n635\ts\n636\td\n637\tt\n638\tz\n63A\tgh\n641\tf\n642\tq\n643\tk\n644\tl\n645\tm\n646\tn\n647\th\n648\tw\n649\ty\n64A\ty\n660\t0\n661\t1\n662\t2\n663\t3\n664\t4\n665\t5\n666\t6\n667\t7\n668\t8\n669\t9\n66A\t%\n66B\t,\n66C\t.\n675\ta\n676\tw\n678\ty\n679\tt\n67A\tth\n67B\tb\n67C\tt\n67D\tt\n67E\tp\n67F\tth\n680\tbh\n681\tdz\n683\tn\n684\tj\n685\tts\n686\tch\n687\tch\n688\td\n689\td\n68A\td\n68C\tdh\n68D\tdh\n68F\td\n691\tr\n693\tr\n696\tzh\n698\tzh\n699\tr\n69A\ts\n6A4\tv\n6A6\tph\n6A9\tk\n6AA\tk\n6AB\tg\n6AD\tng\n6AF\tg\n6B1\tn\n6B3\tg\n6BB\tn\n6BC\tn\n6C0\th\n6C1\th\n6C2\th\n6C3\th\n6CB\tv\n6CC\ty\n6CD\tay\n6D0\te\n6D2\tai\n6D3\tai\n6D4\t.\n6D5\th\n6F0\t0\n6F1\t1\n6F2\t2\n6F3\t3\n6F4\t4\n6F5\t5\n6F6\t6\n6F7\t7\n6F8\t8\n6F9\t9\n6FD\t&\n6FE\tmn\n70D\t*\n712\tb\n713\tg\n714\tg\n715\td\n716\tdr\n717\th\n718\tw\n719\tz\n71A\th\n71B\tt\n71C\tt\n71D\ty\n71E\tyh\n71F\tk\n720\tl\n721\tm\n722\tn\n723\ts\n724\ts\n726\tp\n727\tp\n728\ts\n729\tq\n72A\tr\n72B\tsh\n72C\tt\n730\ta\n731\ta\n732\ta\n733\to\n734\to\n735\ta\n736\te\n737\te\n738\te\n739\te\n73A\ti\n73B\ti\n73C\tu\n73D\tu\n73E\tu\n73F\to\n742\ti\n780\th\n781\ts\n782\tn\n783\tr\n784\tb\n785\tl\n786\tk\n787\t'\n788\tv\n789\tm\n78A\tf\n78B\td\n78C\tt\n78D\tl\n78E\tg\n78F\tn\n790\ts\n791\td\n792\tz\n793\tt\n794\ty\n795\tp\n796\tj\n797\tc\n798\ttt\n799\th\n79A\tkh\n79B\tdh\n79D\ts\n79E\ts\n79F\td\n7A0\tt\n7A3\tg\n7A4\tq\n7A6\ta\n7A7\ta\n7A8\ti\n7A9\ti\n7AA\tu\n7AB\tu\n7AC\te\n7AD\te\n7AE\to\n7AF\to\n901\tm\n902\tm\n903\th\n905\ta\n906\ta\n907\ti\n908\ti\n909\tu\n90A\tu\n90B\tr\n90C\tl\n90D\te\n90E\te\n90F\te\n910\tai\n911\to\n912\to\n913\to\n914\tau\n915\tka\n916\tkha\n917\tga\n918\tgha\n919\tna\n91A\tca\n91B\tcha\n91C\tja\n91D\tjha\n91E\tna\n91F\tta\n920\ttha\n921\tda\n922\tdha\n923\tna\n924\tta\n925\ttha\n926\tda\n927\tdha\n928\tna\n929\tna\n92A\tpa\n92B\tpha\n92C\tba\n92D\tbha\n92E\tma\n92F\tya\n930\tra\n931\tra\n932\tla\n933\tla\n934\tla\n935\tva\n936\tsa\n937\tsa\n938\tsa\n939\tha\n93E\ta\n93F\ti\n940\ti\n941\tu\n942\tu\n943\tr\n944\tr\n945\te\n946\te\n947\te\n948\tai\n949\to\n94A\to\n94B\to\n94C\tau\n950\t'om\n958\tqa\n959\tkha\n95A\tga\n95B\tza\n95C\tra\n95D\trha\n95E\tfa\n95F\tya\n960\tr\n961\tl\n962\tl\n963\tl\n966\t0\n967\t1\n968\t2\n969\t3\n96A\t4\n96B\t5\n96C\t6\n96D\t7\n96E\t8\n96F\t9\n970\t.\n972\tae\n981\tm\n982\tm\n983\th\n985\ta\n986\ta\n987\ti\n988\ti\n989\tu\n98A\tu\n98B\tr\n98C\tl\n98F\te\n990\tai\n993\to\n994\tau\n995\tka\n996\tkha\n997\tga\n998\tgha\n999\tna\n99A\tca\n99B\tcha\n99C\tja\n99D\tjha\n99E\tna\n99F\tta\n9A0\ttha\n9A1\tda\n9A2\tdha\n9A3\tna\n9A4\tta\n9A5\ttha\n9A6\tda\n9A7\tdha\n9A8\tna\n9AA\tpa\n9AB\tpha\n9AC\tba\n9AD\tbha\n9AE\tma\n9AF\tya\n9B0\tra\n9B2\tla\n9B6\tsa\n9B7\tsa\n9B8\tsa\n9B9\tha\n9BE\ta\n9BF\ti\n9C0\ti\n9C1\tu\n9C2\tu\n9C3\tr\n9C4\tr\n9C7\te\n9C8\tai\n9CB\to\n9CC\tau\n9CE\tt\n9DC\tra\n9DD\trha\n9DF\tya\n9E0\tr\n9E1\tl\n9E2\tl\n9E3\tl\n9E6\t0\n9E7\t1\n9E8\t2\n9E9\t3\n9EA\t4\n9EB\t5\n9EC\t6\n9ED\t7\n9EE\t8\n9EF\t9\n9F0\tra\n9F1\tra\nA01\tm\nA02\tm\nA05\ta\nA06\ta\nA07\ti\nA08\ti\nA09\tu\nA0A\tu\nA0F\te\nA10\tai\nA13\to\nA14\tau\nA15\tka\nA16\tkha\nA17\tga\nA18\tgha\nA19\tna\nA1A\tca\nA1B\tcha\nA1C\tja\nA1D\tjha\nA1E\tna\nA1F\tta\nA20\ttha\nA21\tda\nA22\tdha\nA23\tna\nA24\tta\nA25\ttha\nA26\tda\nA27\tdha\nA28\tna\nA2A\tpa\nA2B\tpha\nA2C\tba\nA2D\tbha\nA2E\tma\nA2F\tya\nA30\tra\nA32\tla\nA33\tla\nA35\tva\nA36\tsa\nA38\tsa\nA39\tha\nA3E\ta\nA3F\ti\nA40\ti\nA41\tu\nA42\tu\nA47\te\nA48\tai\nA4B\to\nA4C\tau\nA59\tkha\nA5A\tga\nA5B\tza\nA5C\tra\nA5E\tfa\nA66\t0\nA67\t1\nA68\t2\nA69\t3\nA6A\t4\nA6B\t5\nA6C\t6\nA6D\t7\nA6E\t8\nA6F\t9\nA81\tm\nA82\tm\nA83\th\nA85\ta\nA86\ta\nA87\ti\nA88\ti\nA89\tu\nA8A\tu\nA8B\tr\nA8C\tl\nA8D\te\nA8F\te\nA90\tai\nA91\to\nA93\to\nA94\tau\nA95\tka\nA96\tkha\nA97\tga\nA98\tgha\nA99\tna\nA9A\tca\nA9B\tcha\nA9C\tja\nA9D\tjha\nA9E\tna\nA9F\tta\nAA0\ttha\nAA1\tda\nAA2\tdha\nAA3\tna\nAA4\tta\nAA5\ttha\nAA6\tda\nAA7\tdha\nAA8\tna\nAAA\tpa\nAAB\tpha\nAAC\tba\nAAD\tbha\nAAE\tma\nAAF\tya\nAB0\tra\nAB2\tla\nAB3\tla\nAB5\tva\nAB6\tsa\nAB7\tsa\nAB8\tsa\nAB9\tha\nABE\ta\nABF\ti\nAC0\ti\nAC1\tu\nAC2\tu\nAC3\tr\nAC4\tr\nAC5\te\nAC7\te\nAC8\tai\nAC9\to\nACB\to\nACC\tau\nAD0\t'om\nAE0\tr\nAE1\tl\nAE6\t0\nAE7\t1\nAE8\t2\nAE9\t3\nAEA\t4\nAEB\t5\nAEC\t6\nAED\t7\nAEE\t8\nAEF\t9\nB01\tm\nB02\tm\nB03\th\nB05\ta\nB06\ta\nB07\ti\nB08\ti\nB09\tu\nB0A\tu\nB0B\tr\nB0C\tl\nB0F\te\nB10\tai\nB13\to\nB14\tau\nB15\tka\nB16\tkha\nB17\tga\nB18\tgha\nB19\tna\nB1A\tca\nB1B\tcha\nB1C\tja\nB1D\tjha\nB1E\tna\nB1F\tta\nB20\ttha\nB21\tda\nB22\tdha\nB23\tna\nB24\tta\nB25\ttha\nB26\tda\nB27\tdha\nB28\tna\nB2A\tpa\nB2B\tpha\nB2C\tba\nB2D\tbha\nB2E\tma\nB2F\tya\nB30\tra\nB32\tla\nB33\tla\nB35\tva\nB36\tsa\nB37\tsa\nB38\tsa\nB39\tha\nB3E\ta\nB3F\ti\nB40\ti\nB41\tu\nB42\tu\nB43\tr\nB47\te\nB48\tai\nB4B\to\nB4C\tau\nB5C\tra\nB5D\trha\nB5F\tya\nB60\tr\nB61\tl\nB66\t0\nB67\t1\nB68\t2\nB69\t3\nB6A\t4\nB6B\t5\nB6C\t6\nB6D\t7\nB6E\t8\nB6F\t9\nB71\twa\nB82\tm\nB83\th\nB85\ta\nB86\ta\nB87\ti\nB88\ti\nB89\tu\nB8A\tu\nB8E\te\nB8F\te\nB90\tai\nB92\to\nB93\to\nB94\tau\nB95\tka\nB99\tna\nB9A\tca\nB9C\tja\nB9E\tna\nB9F\tta\nBA3\tna\nBA4\tta\nBA8\tna\nBA9\tna\nBAA\tpa\nBAE\tma\nBAF\tya\nBB0\tra\nBB1\tra\nBB2\tla\nBB3\tla\nBB4\tla\nBB5\tva\nBB6\tsa\nBB7\tsa\nBB8\tsa\nBB9\tha\nBBE\ta\nBBF\ti\nBC0\ti\nBC1\tu\nBC2\tu\nBC6\te\nBC7\te\nBC8\tai\nBCA\to\nBCB\to\nBCC\tau\nBE6\t0\nBE7\t1\nBE8\t2\nBE9\t3\nBEA\t4\nBEB\t5\nBEC\t6\nBED\t7\nBEE\t8\nBEF\t9\nBF0\t10\nBF1\t100\nBF2\t1000\nC01\tm\nC02\tm\nC03\th\nC05\ta\nC06\ta\nC07\ti\nC08\ti\nC09\tu\nC0A\tu\nC0B\tr\nC0C\tl\nC0E\te\nC0F\te\nC10\tai\nC12\to\nC13\to\nC14\tau\nC15\tka\nC16\tkha\nC17\tga\nC18\tgha\nC19\tna\nC1A\tca\nC1B\tcha\nC1C\tja\nC1D\tjha\nC1E\tna\nC1F\tta\nC20\ttha\nC21\tda\nC22\tdha\nC23\tna\nC24\tta\nC25\ttha\nC26\tda\nC27\tdha\nC28\tna\nC2A\tpa\nC2B\tpha\nC2C\tba\nC2D\tbha\nC2E\tma\nC2F\tya\nC30\tra\nC31\tra\nC32\tla\nC33\tla\nC35\tva\nC36\tsa\nC37\tsa\nC38\tsa\nC39\tha\nC3E\ta\nC3F\ti\nC40\ti\nC41\tu\nC42\tu\nC43\tr\nC44\tr\nC46\te\nC47\te\nC48\tai\nC4A\to\nC4B\to\nC4C\tau\nC60\tr\nC61\tl\nC66\t0\nC67\t1\nC68\t2\nC69\t3\nC6A\t4\nC6B\t5\nC6C\t6\nC6D\t7\nC6E\t8\nC6F\t9\nC82\tm\nC83\th\nC85\ta\nC86\ta\nC87\ti\nC88\ti\nC89\tu\nC8A\tu\nC8B\tr\nC8C\tl\nC8E\te\nC8F\te\nC90\tai\nC92\to\nC93\to\nC94\tau\nC95\tka\nC96\tkha\nC97\tga\nC98\tgha\nC99\tna\nC9A\tca\nC9B\tcha\nC9C\tja\nC9D\tjha\nC9E\tna\nC9F\tta\nCA0\ttha\nCA1\tda\nCA2\tdha\nCA3\tna\nCA4\tta\nCA5\ttha\nCA6\tda\nCA7\tdha\nCA8\tna\nCAA\tpa\nCAB\tpha\nCAC\tba\nCAD\tbha\nCAE\tma\nCAF\tya\nCB0\tra\nCB1\tra\nCB2\tla\nCB3\tla\nCB5\tva\nCB6\tsa\nCB7\tsa\nCB8\tsa\nCB9\tha\nCBE\ta\nCBF\ti\nCC0\ti\nCC1\tu\nCC2\tu\nCC3\tr\nCC4\tr\nCC6\te\nCC7\te\nCC8\tai\nCCA\to\nCCB\to\nCCC\tau\nCDE\tla\nCE0\tr\nCE1\tl\nCE6\t0\nCE7\t1\nCE8\t2\nCE9\t3\nCEA\t4\nCEB\t5\nCEC\t6\nCED\t7\nCEE\t8\nCEF\t9\nD02\tm\nD03\th\nD05\ta\nD06\ta\nD07\ti\nD08\ti\nD09\tu\nD0A\tu\nD0B\tr\nD0C\tl\nD0E\te\nD0F\te\nD10\tai\nD12\to\nD13\to\nD14\tau\nD15\tka\nD16\tkha\nD17\tga\nD18\tgha\nD19\tna\nD1A\tca\nD1B\tcha\nD1C\tja\nD1D\tjha\nD1E\tna\nD1F\tta\nD20\ttha\nD21\tda\nD22\tdha\nD23\tna\nD24\tta\nD25\ttha\nD26\tda\nD27\tdha\nD28\tna\nD2A\tpa\nD2B\tpha\nD2C\tba\nD2D\tbha\nD2E\tma\nD2F\tya\nD30\tra\nD31\tra\nD32\tla\nD33\tla\nD34\tla\nD35\tva\nD36\tsa\nD37\tsa\nD38\tsa\nD39\tha\nD3E\ta\nD3F\ti\nD40\ti\nD41\tu\nD42\tu\nD43\tr\nD46\te\nD47\te\nD48\tai\nD4A\tea\nD4B\tea\nD4C\te\nD60\tr\nD61\tl\nD66\t0\nD67\t1\nD68\t2\nD69\t3\nD6A\t4\nD6B\t5\nD6C\t6\nD6D\t7\nD6E\t8\nD6F\t9\nD7A\tn\nD7B\tn\nD7C\tr\nD7D\tl\nD7E\tl\nE01\tk\nE02\tkh\nE03\tkh\nE04\tkh\nE05\tk'h\nE06\tkh\nE07\tng\nE08\tc\nE09\tch\nE0A\tch\nE0B\ts\nE0C\tch\nE0D\ty\nE0E\td\nE0F\tt\nE10\tth\nE11\tth\nE12\tt'h\nE13\tn\nE14\td\nE15\tt\nE16\tth\nE17\tth\nE18\tth\nE19\tn\nE1A\tb\nE1B\tp\nE1C\tph\nE1D\tf\nE1E\tph\nE1F\tf\nE20\tph\nE21\tm\nE22\ty\nE23\tr\nE24\tv\nE25\tl\nE26\tl\nE27\tw\nE28\ts\nE29\ts'\nE2A\ts\nE2B\th\nE2C\tl\nE2D\tx\nE2E\th\nE30\ta\nE31\ta\nE32\ta\nE33\ta\nE34\ti\nE35\ti\nE36\tu\nE37\tu\nE38\tu\nE39\tu\nE40\te\nE41\tae\nE42\to\nE43\ti\nE44\ti\nE45\ti\nE46\t<<\nE4E\t~\nE50\t0\nE51\t1\nE52\t2\nE53\t3\nE54\t4\nE55\t5\nE56\t6\nE57\t7\nE58\t8\nE59\t9\nE5A\t||\nE5B\t>>\n1000\tk\n1001\thk\n1002\tg\n1003\tgh\n1004\tng\n1005\thc\n1006\ts\n1007\tj\n1008\tjh\n1009\tny\n100A\tny\n100B\tt\n100C\tht\n100D\td\n100E\tdh\n100F\tn\n1010\tt\n1011\tht\n1012\td\n1013\tdh\n1014\tn\n1015\tp\n1016\thp\n1017\tb\n1018\tbh\n1019\tm\n101A\ty\n101B\tr\n101C\tl\n101D\tw\n101E\ts\n101F\th\n1020\tl\n1021\ta\n1023\ti\n1024\ti\n1025\tu\n1026\tu\n1027\te\n1029\tau\n102A\tau\n102B\tar\n102C\tar\n102D\ti\n102E\te\n102F\tu\n1030\tuu\n1031\tay\n1032\tell\n1036\tan\n103B\tya\n103C\tya\n103D\tw\n103E\tha\n103F\ts\n1040\t0\n1041\t1\n1042\t2\n1043\t3\n1044\t4\n1045\t5\n1046\t6\n1047\t7\n1048\t8\n1049\t9\n104A\t,\n104B\t.\n104F\teat\n10D0\ta\n10D1\tb\n10D2\tg\n10D3\td\n10D4\te\n10D5\tv\n10D6\tz\n10D7\tt\n10D8\ti\n10D9\tk'\n10DA\tl\n10DB\tm\n10DC\tn\n10DD\to\n10DE\tp'\n10DF\tzh\n10E0\tr\n10E1\ts\n10E2\tt'\n10E3\tu\n10E4\tp\n10E5\tk\n10E6\tgh\n10E7\tq'\n10E8\tsh\n10E9\tch\n10EA\tts\n10EB\tdz\n10EC\tts'\n10ED\tch'\n10EE\tkh\n10EF\tj\n10F0\th\n10F3\tui\n10F4\tq\n1100\tg\n1101\tkk\n1102\tn\n1103\td\n1104\ttt\n1105\tl\n1106\tm\n1107\tb\n1108\tpp\n1109\ts\n110A\tss\n110C\tj\n110D\tjj\n110E\tch\n110F\tk\n1110\tt\n1111\tp\n1112\th\n1161\ta\n1162\tae\n1163\tya\n1164\tyae\n1165\teo\n1166\te\n1167\tyeo\n1168\tye\n1169\to\n116A\twa\n116B\twae\n116C\toe\n116D\tyo\n116E\tu\n116F\two\n1170\twe\n1171\twi\n1172\tyu\n1173\teu\n1174\tui\n1175\ti\n11A8\tg\n11A9\tkk\n11AA\tgs\n11AB\tn\n11AC\tnj\n11AD\tnh\n11AE\td\n11AF\tl\n11B0\tlg\n11B1\tlm\n11B2\tlb\n11B3\tls\n11B4\tlt\n11B5\tlp\n11B6\tlh\n11B7\tm\n11B8\tb\n11B9\tbs\n11BA\ts\n11BB\tss\n11BC\tng\n11BD\tj\n11BE\tch\n11BF\tk\n11C0\tt\n11C1\tp\n11C2\th\n1200\tha\n1201\thu\n1202\thi\n1203\tha\n1204\the\n1205\th\n1206\tho\n1208\tla\n1209\tlu\n120A\tli\n120B\tla\n120C\tle\n120D\tl\n120E\tlo\n120F\tla\n1210\tha\n1211\thu\n1212\thi\n1213\tha\n1214\the\n1215\th\n1216\tho\n1217\tha\n1218\tma\n1219\tmu\n121A\tmi\n121B\tma\n121C\tme\n121D\tm\n121E\tmo\n121F\tma\n1220\tsa\n1221\tsu\n1222\tsi\n1223\tsa\n1224\tse\n1225\ts\n1226\tso\n1227\tsa\n1228\tra\n1229\tru\n122A\tri\n122B\tra\n122C\tre\n122D\tr\n122E\tro\n122F\tra\n1230\tsa\n1231\tsu\n1232\tsi\n1233\tsa\n1234\tse\n1235\ts\n1236\tso\n1237\tsa\n1238\tsa\n1239\tsu\n123A\tsi\n123B\tsa\n123C\tse\n123D\ts\n123E\tso\n123F\tsa\n1240\tqa\n1241\tqu\n1242\tqi\n1243\tqa\n1244\tqe\n1245\tq\n1246\tqo\n1248\tqa\n124A\tq\n124B\tqa\n124C\tqe\n124D\tqi\n1250\tqa\n1251\tqu\n1252\tqi\n1253\tqa\n1254\tqe\n1255\tq\n1256\tqo\n1258\tqa\n125A\tqi\n125B\tqa\n125C\tqe\n125D\tq\n1260\tba\n1261\tbu\n1262\tbi\n1263\tba\n1264\tbe\n1265\tb\n1266\tbo\n1267\tba\n1268\tva\n1269\tvu\n126A\tvi\n126B\tva\n126C\tve\n126D\tv\n126E\tvo\n126F\tva\n1270\tta\n1271\ttu\n1272\tti\n1273\tta\n1274\tte\n1275\tt\n1276\tto\n1277\tta\n1278\tca\n1279\tcu\n127A\tci\n127B\tca\n127C\tce\n127D\tc\n127E\tco\n127F\tca\n1280\tha\n1281\thu\n1282\thi\n1283\tha\n1284\the\n1285\th\n1286\tho\n1288\tha\n128A\thi\n128B\tha\n128C\the\n128D\th\n1290\tna\n1291\tnu\n1292\tni\n1293\tna\n1294\tne\n1295\tn\n1296\tno\n1297\tna\n1298\tna\n1299\tnu\n129A\tni\n129B\tna\n129C\tne\n129D\tn\n129E\tno\n129F\tna\n12A0\ta\n12A1\tu\n12A2\ti\n12A3\ta\n12A4\te\n12A6\to\n12A7\ta\n12A8\tka\n12A9\tku\n12AA\tki\n12AB\tka\n12AC\tke\n12AD\tk\n12AE\tko\n12B0\tka\n12B2\tki\n12B3\tka\n12B4\tke\n12B5\tk\n12B8\tka\n12B9\tku\n12BA\tki\n12BB\tka\n12BC\tke\n12BD\tk\n12BE\tko\n12C0\tka\n12C2\tki\n12C3\tka\n12C4\tke\n12C5\tk\n12C8\twa\n12C9\twu\n12CA\twi\n12CB\twa\n12CC\twe\n12CD\tw\n12CE\two\n12D0\ta\n12D1\tu\n12D2\ti\n12D3\ta\n12D4\te\n12D6\to\n12D8\tza\n12D9\tzu\n12DA\tzi\n12DB\tza\n12DC\tze\n12DD\tz\n12DE\tzo\n12DF\tza\n12E0\tza\n12E1\tzu\n12E2\tzi\n12E3\tza\n12E4\tze\n12E5\tz\n12E6\tzo\n12E7\tza\n12E8\tya\n12E9\tyu\n12EA\tyi\n12EB\tya\n12EC\tye\n12ED\ty\n12EE\tyo\n12F0\tda\n12F1\tdu\n12F2\tdi\n12F3\tda\n12F4\tde\n12F5\td\n12F6\tdo\n12F7\tda\n1300\tga\n1301\tgu\n1302\tgi\n1303\tga\n1304\tge\n1305\tg\n1306\tgo\n1307\tga\n1308\tga\n1309\tgu\n130A\tgi\n130B\tga\n130C\tge\n130D\tg\n130E\tgo\n1310\tga\n1312\tgi\n1313\tga\n1314\tge\n1315\tg\n1318\tna\n1319\tnu\n131A\tni\n131B\tna\n131C\tne\n131D\tn\n131E\tno\n131F\tna\n1320\tta\n1321\ttu\n1322\tti\n1323\tta\n1324\tte\n1325\tt\n1326\tto\n1327\tta\n1328\tca\n1329\tcu\n132A\tci\n132B\tca\n132C\tce\n132D\tc\n132E\tco\n132F\tca\n1330\tpa\n1331\tpu\n1332\tpi\n1333\tpa\n1334\tpe\n1335\tp\n1336\tpo\n1337\tpa\n1338\tsa\n1339\tsu\n133A\tsi\n133B\tsa\n133C\tse\n133D\ts\n133E\tso\n133F\tsa\n1340\tda\n1341\tdu\n1342\tdi\n1343\tda\n1344\tde\n1345\td\n1346\tdo\n1348\tfa\n1349\tfu\n134A\tfi\n134B\tfa\n134C\tfe\n134D\tf\n134E\tfo\n134F\tfa\n1350\tpa\n1351\tpu\n1352\tpi\n1353\tpa\n1354\tpe\n1355\tp\n1356\tpo\n1357\tpa\n1358\trya\n1359\tmya\n135A\tfya\n1361\t:\n1362\t.\n1363\t,\n1364\t;\n1365\t,\n1366\t:-\n1369\t1\n136A\t2\n136B\t3\n136C\t4\n136D\t5\n136E\t6\n136F\t7\n1370\t8\n1371\t9\n1372\t10\n1373\t20\n1374\t30\n1375\t40\n1376\t50\n1377\t60\n1378\t70\n1379\t80\n137A\t90\n137B\t100\n137C\t10,000\n1F00\ta\n1F01\tha\n1F02\ta\n1F03\tha\n1F04\ta\n1F05\tha\n1F06\ta\n1F07\tha\n1F08\tA\n1F09\tHA\n1F0A\tA\n1F0B\tHA\n1F0C\tA\n1F0D\tHA\n1F0E\tA\n1F0F\tHA\n1F10\te\n1F11\the\n1F12\te\n1F13\the\n1F14\te\n1F15\the\n1F18\tE\n1F19\tHE\n1F1A\tE\n1F1B\tHE\n1F1C\tE\n1F1D\tHE\n1F20\te\n1F21\the\n1F22\te\n1F23\the\n1F24\te\n1F25\the\n1F26\te\n1F27\the\n1F28\tE\n1F29\tHE\n1F2A\tE\n1F2B\tHE\n1F2C\tE\n1F2D\tHE\n1F2E\tE\n1F2F\tHE\n1F30\ti\n1F31\thi\n1F32\ti\n1F33\thi\n1F34\ti\n1F35\thi\n1F36\ti\n1F37\thi\n1F38\tI\n1F39\tHI\n1F3A\tI\n1F3B\tHI\n1F3C\tI\n1F3D\tHI\n1F3E\tI\n1F3F\tHI\n1F40\to\n1F41\tho\n1F42\to\n1F43\tho\n1F44\to\n1F45\tho\n1F48\tO\n1F49\tHO\n1F4A\tO\n1F4B\tHO\n1F4C\tO\n1F4D\tHO\n1F50\ty\n1F51\thy\n1F52\ty\n1F53\thy\n1F54\ty\n1F55\thy\n1F56\ty\n1F57\thy\n1F59\tHY\n1F5B\tHY\n1F5D\tHY\n1F5F\tHY\n1F60\to\n1F61\tho\n1F62\to\n1F63\tho\n1F64\to\n1F65\tho\n1F66\to\n1F67\tho\n1F68\tO\n1F69\tHO\n1F6A\tO\n1F6B\tHO\n1F6C\tO\n1F6D\tHO\n1F6E\tO\n1F6F\tHO\n1F70\ta\n1F71\ta\n1F72\te\n1F73\te\n1F74\te\n1F75\te\n1F76\ti\n1F77\ti\n1F78\to\n1F79\to\n1F7A\ty\n1F7B\ty\n1F7C\to\n1F7D\to\n1F80\tai\n1F81\thai\n1F82\tai\n1F83\thai\n1F84\tai\n1F85\thai\n1F86\tai\n1F87\thai\n1F88\tAI\n1F89\tHAI\n1F8A\tAI\n1F8B\tHAI\n1F8C\tAI\n1F8D\tHAI\n1F8E\tAI\n1F8F\tHAI\n1F90\tei\n1F91\thei\n1F92\tei\n1F93\thei\n1F94\tei\n1F95\thei\n1F96\tei\n1F97\thei\n1F98\tEI\n1F99\tHEI\n1F9A\tEI\n1F9B\tHEI\n1F9C\tEI\n1F9D\tHEI\n1F9E\tEI\n1F9F\tHEI\n1FA0\toi\n1FA1\thoi\n1FA2\toi\n1FA3\thoi\n1FA4\toi\n1FA5\thoi\n1FA6\toi\n1FA7\thoi\n1FA8\tOI\n1FA9\tHOI\n1FAA\tOI\n1FAB\tHOI\n1FAC\tOI\n1FAD\tHOI\n1FAE\tOI\n1FAF\tHOI\n1FB0\ta\n1FB1\ta\n1FB2\tai\n1FB3\tai\n1FB4\tai\n1FB6\ta\n1FB7\tai\n1FB8\tA\n1FB9\tA\n1FBA\tA\n1FBB\tA\n1FBC\tAI\n1FBE\ti\n1FC2\tei\n1FC3\tei\n1FC4\tei\n1FC6\te\n1FC7\tei\n1FC8\tE\n1FC9\tE\n1FCA\tE\n1FCB\tE\n1FCC\tEI\n1FD0\ti\n1FD1\ti\n1FD2\ti\n1FD3\ti\n1FD6\ti\n1FD7\ti\n1FD8\tI\n1FD9\tI\n1FDA\tI\n1FDB\tI\n1FE0\ty\n1FE1\ty\n1FE2\ty\n1FE3\ty\n1FE4\tr\n1FE5\trh\n1FE6\ty\n1FE7\ty\n1FE8\tY\n1FE9\tY\n1FEA\tY\n1FEB\tY\n1FEC\tRH\n1FEF\t`\n1FF2\toi\n1FF3\toi\n1FF4\toi\n1FF6\to\n1FF7\toi\n1FF8\tO\n1FF9\tO\n1FFA\tO\n1FFB\tO\n1FFC\tOI\n2010\t-\n2011\t-\n2012\t-\n2013\t-\n2014\t-\n2015\t-\n2016\t||\n2018\t'\n2019\t'\n201A\t,\n201B\t'\n201C\t\"\n201D\t\"\n201E\t,,\n201F\t\"\n2024\t.\n2025\t..\n2026\t...\n2032\t'\n2033\t\"\n2039\t<\n203A\t>\n203C\t!!\n2044\t/\n2045\t[\n2046\t]\n2047\t??\n2048\t?!\n2049\t!?\n204E\t*\n20A0\tCE\n20A2\tCr\n20A3\tFr.\n20A4\tL.\n20A7\tPts\n20B9\tRs\n20BA\tTL\n2100\ta/c\n2101\ta/s\n2102\tC\n2105\tc/o\n2106\tc/u\n210A\tg\n210B\tH\n210C\tx\n210D\tH\n210E\th\n2110\tI\n2111\tI\n2112\tL\n2113\tl\n2115\tN\n2116\tNo\n2117\t(P)\n2118\tP\n2119\tP\n211A\tQ\n211B\tR\n211C\tR\n211D\tR\n211E\tRx\n2121\tTEL\n2124\tZ\n2126\tO\n2128\tZ\n212A\tK\n212B\tA\n212C\tB\n212D\tC\n212F\te\n2130\tE\n2131\tF\n2133\tM\n2134\to\n2139\ti\n213B\tFAX\n2145\tD\n2146\td\n2147\te\n2148\ti\n2149\tj\n2150\t1/7\n2151\t1/9\n2152\t1/10\n2153\t1/3\n2154\t2/3\n2155\t1/5\n2156\t2/5\n2157\t3/5\n2158\t4/5\n2159\t1/6\n215A\t5/6\n215B\t1/8\n215C\t3/8\n215D\t5/8\n215E\t7/8\n215F\t1/\n2160\tI\n2161\tII\n2162\tIII\n2163\tIV\n2164\tV\n2165\tVI\n2166\tVII\n2167\tVIII\n2168\tIX\n2169\tX\n216A\tXI\n216B\tXII\n216C\tL\n216D\tC\n216E\tD\n216F\tM\n2170\ti\n2171\tii\n2172\tiii\n2173\tiv\n2174\tv\n2175\tvi\n2176\tvii\n2177\tviii\n2178\tix\n2179\tx\n217A\txi\n217B\txii\n217C\tl\n217D\tc\n217E\td\n217F\tm\n2189\t0/3\n2190\t<-\n2192\t->\n2194\t<->\n2212\t-\n2215\t/\n2216\t\\\n2223\t|\n2225\t||\n2260\t=\n226A\t<<\n226B\t>>\n226E\t<\n226F\t>\n2329\t<\n232A\t>\n2474\t(1)\n2475\t(2)\n2476\t(3)\n2477\t(4)\n2478\t(5)\n2479\t(6)\n247A\t(7)\n247B\t(8)\n247C\t(9)\n247D\t(10)\n247E\t(11)\n247F\t(12)\n2480\t(13)\n2481\t(14)\n2482\t(15)\n2483\t(16)\n2484\t(17)\n2485\t(18)\n2486\t(19)\n2487\t(20)\n2488\t1.\n2489\t2.\n248A\t3.\n248B\t4.\n248C\t5.\n248D\t6.\n248E\t7.\n248F\t8.\n2490\t9.\n2491\t10.\n2492\t11.\n2493\t12.\n2494\t13.\n2495\t14.\n2496\t15.\n2497\t16.\n2498\t17.\n2499\t18.\n249A\t19.\n249B\t20.\n2985\t((\n2986\t))\n2A74\t::=\n2A75\t==\n2A76\t===\n2D93\tna\n2D94\tni\n2D95\tne\n2D96\tn\n2E80\tyou\n2E81\tchang\n2E82\tya\n2E83\tyin\n2E84\tya\n2E85\tren\n2E86\tjiong\n2E88\tdao\n2E89\tdao\n2E8A\tbo\n2E8B\tjie\n2E8C\txiao\n2E8D\txiao\n2E8E\twu\n2E8F\twang\n2E90\twang\n2E91\twu\n2E92\tsi\n2E93\tyao\n2E94\tji\n2E95\tji\n2E96\txin\n2E97\txin\n2E98\tshou\n2E99\tpu\n2E9B\tri\n2E9C\tri\n2E9D\tyue\n2E9E\tdai\n2E9F\tmu\n2EA0\tmin\n2EA1\tshui\n2EA2\tshui\n2EA3\tbiao\n2EA4\tzhao\n2EA5\tzhao\n2EA6\tqiang\n2EA7\tniu\n2EA8\tquan\n2EAB\tmu\n2EAC\tshi\n2EAD\tshi\n2EAE\tshi\n2EAF\tsi\n2EB0\tsi\n2EB1\tgang\n2EB2\twang\n2EB4\twang\n2EB6\tren\n2EB7\tren\n2EB9\tlao\n2EBA\tyu\n2EBB\tyu\n2EBC\trou\n2EBD\tju\n2EBE\tcao\n2EBF\tcao\n2EC0\tcao\n2EC1\thu\n2EC2\tyi\n2EC3\txi\n2EC4\txi\n2EC5\tjian\n2EC8\tyan\n2EC9\tbei\n2ECB\tche\n2ECC\tchuo\n2ECD\tchuo\n2ECE\tchuo\n2ECF\tfu\n2ED0\tjin\n2ED1\tchang\n2ED2\tchang\n2ED3\tzhang\n2ED4\tmen\n2ED6\tfu\n2ED7\tyu\n2ED8\tqing\n2ED9\twei\n2EDA\tye\n2EDB\tfeng\n2EDC\tfei\n2EDD\tshi\n2EDF\tshi\n2EE0\tshi\n2EE2\tma\n2EE3\tgu\n2EE4\tgui\n2EE5\tyu\n2EE6\tniao\n2EE7\tlu\n2EE8\tmai\n2EE9\thuang\n2EEA\tmin\n2EEB\tqi\n2EEC\tqi\n2EED\tchi\n2EEE\tchi\n2EEF\tlong\n2EF0\tlong\n2EF1\tgui\n2EF2\tgui\n2EF3\tgui\n2F00\tyi\n2F01\tgun\n2F02\tzhu\n2F03\tpie\n2F04\tyi\n2F05\tjue\n2F06\ter\n2F07\ttou\n2F08\tren\n2F09\ter\n2F0A\tru\n2F0B\tba\n2F0C\tjiong\n2F0D\tmi\n2F0E\tbing\n2F0F\tji\n2F10\tqian\n2F11\tdao\n2F12\tli\n2F13\tbao\n2F14\tbi\n2F15\tfang\n2F16\txi\n2F17\tshi\n2F18\tbo\n2F19\tjie\n2F1A\tchang\n2F1B\tsi\n2F1C\tyou\n2F1D\tkou\n2F1E\twei\n2F1F\ttu\n2F20\tshi\n2F21\tzhi\n2F22\tsui\n2F23\txi\n2F24\tda\n2F25\tnu\n2F26\tzi\n2F27\tmian\n2F28\tcun\n2F29\txiao\n2F2A\twang\n2F2B\tshi\n2F2C\tche\n2F2D\tshan\n2F2E\tchuan\n2F2F\tgong\n2F30\tji\n2F31\tjin\n2F32\tgan\n2F33\tyao\n2F34\tguang\n2F35\tyin\n2F36\tgong\n2F37\tyi\n2F38\tgong\n2F39\tji\n2F3A\tshan\n2F3B\tchi\n2F3C\txin\n2F3D\tge\n2F3E\thu\n2F3F\tshou\n2F40\tzhi\n2F41\tpu\n2F42\twen\n2F43\tdou\n2F44\tjin\n2F45\tfang\n2F46\twu\n2F47\tri\n2F48\tyue\n2F49\tyue\n2F4A\tmu\n2F4B\tqian\n2F4C\tzhi\n2F4D\tdai\n2F4E\tshu\n2F4F\twu\n2F50\tbi\n2F51\tmao\n2F52\tshi\n2F53\tqi\n2F54\tshui\n2F55\thuo\n2F56\tzhao\n2F57\tfu\n2F58\tyao\n2F59\tpan\n2F5A\tpian\n2F5B\tya\n2F5C\tniu\n2F5D\tquan\n2F5E\txuan\n2F5F\tyu\n2F60\tgua\n2F61\twa\n2F62\tgan\n2F63\tsheng\n2F64\tyong\n2F65\ttian\n2F66\tpi\n2F67\tne\n2F68\tbo\n2F69\tbai\n2F6A\tpi\n2F6B\tmin\n2F6C\tmu\n2F6D\tmao\n2F6E\tshi\n2F6F\tshi\n2F70\tshi\n2F71\trou\n2F72\the\n2F73\txue\n2F74\tli\n2F75\tzhu\n2F76\tmi\n2F77\tmi\n2F78\tfou\n2F79\twang\n2F7A\tyang\n2F7B\tyu\n2F7C\tlao\n2F7D\ter\n2F7E\tlei\n2F7F\ter\n2F80\tyu\n2F81\trou\n2F82\tchen\n2F83\tzi\n2F84\tzhi\n2F85\tjiu\n2F86\tshe\n2F87\tchuan\n2F88\tzhou\n2F89\tgen\n2F8A\tse\n2F8B\tcao\n2F8C\thu\n2F8D\tchong\n2F8E\txue\n2F8F\txing\n2F90\tyi\n2F91\tya\n2F92\tjian\n2F93\tjiao\n2F94\tyan\n2F95\tgu\n2F96\tdou\n2F97\tshi\n2F98\tzhi\n2F99\tbei\n2F9A\tchi\n2F9B\tzou\n2F9C\tzu\n2F9D\tshen\n2F9E\tche\n2F9F\txin\n2FA0\tchen\n2FA1\tchuo\n2FA2\tyi\n2FA3\tyou\n2FA4\tbian\n2FA5\tli\n2FA6\tjin\n2FA7\tzhang\n2FA8\tmen\n2FA9\tfu\n2FAA\tli\n2FAB\tzhui\n2FAC\tyu\n2FAD\tqing\n2FAE\tfei\n2FAF\tmian\n2FB0\tge\n2FB1\twei\n2FB2\tjiu\n2FB3\tyin\n2FB4\tye\n2FB5\tfeng\n2FB6\tfei\n2FB7\tshi\n2FB8\tshou\n2FB9\txiang\n2FBA\tma\n2FBB\tgu\n2FBC\tgao\n2FBD\tbiao\n2FBE\tdou\n2FBF\tchang\n2FC0\tge\n2FC1\tgui\n2FC2\tyu\n2FC3\tniao\n2FC4\tlu\n2FC5\tlu\n2FC6\tmai\n2FC7\tma\n2FC8\thuang\n2FC9\tshu\n2FCA\thei\n2FCB\tzhi\n2FCC\tmian\n2FCD\tding\n2FCE\tgu\n2FCF\tshu\n2FD0\tbi\n2FD1\tqi\n2FD2\tchi\n2FD3\tlong\n2FD4\tgui\n2FD5\tyue\n3001\t,\n3002\t.\n3007\tling\n3008\t<\n3009\t>\n300A\t<<\n300B\t>>\n3014\t[\n3015\t]\n3018\t[\n3019\t]\n301A\t[\n301B\t]\n301D\t\"\n301E\t\"\n3038\tshi\n3039\tnian\n303A\tsa\n3041\t~a\n3042\ta\n3043\t~i\n3044\ti\n3045\t~u\n3046\tu\n3047\t~e\n3048\te\n3049\t~o\n304A\to\n304B\tka\n304C\tga\n304D\tki\n304E\tgi\n304F\tku\n3050\tgu\n3051\tke\n3052\tge\n3053\tko\n3054\tgo\n3055\tsa\n3056\tza\n3057\tshi\n3058\tji\n3059\tsu\n305A\tzu\n305B\tse\n305C\tze\n305D\tso\n305E\tzo\n305F\tta\n3060\tda\n3061\tchi\n3062\tdji\n3063\t~tsu\n3064\ttsu\n3065\tdzu\n3066\tte\n3067\tde\n3068\tto\n3069\tdo\n306A\tna\n306B\tni\n306C\tnu\n306D\tne\n306E\tno\n306F\tha\n3070\tba\n3071\tpa\n3072\thi\n3073\tbi\n3074\tpi\n3075\tfu\n3076\tbu\n3077\tpu\n3078\the\n3079\tbe\n307A\tpe\n307B\tho\n307C\tbo\n307D\tpo\n307E\tma\n307F\tmi\n3080\tmu\n3081\tme\n3082\tmo\n3083\t~ya\n3084\tya\n3085\t~yu\n3086\tyu\n3087\t~yo\n3088\tyo\n3089\tra\n308A\tri\n308B\tru\n308C\tre\n308D\tro\n308E\t~wa\n308F\twa\n3090\twi\n3091\twe\n3092\two\n3093\tn\n3094\tvu\n30A1\t~a\n30A2\ta\n30A3\t~i\n30A4\ti\n30A5\t~u\n30A6\tu\n30A7\t~e\n30A8\te\n30A9\t~o\n30AA\to\n30AB\tka\n30AC\tga\n30AD\tki\n30AE\tgi\n30AF\tku\n30B0\tgu\n30B1\tke\n30B2\tge\n30B3\tko\n30B4\tgo\n30B5\tsa\n30B6\tza\n30B7\tshi\n30B8\tji\n30B9\tsu\n30BA\tzu\n30BB\tse\n30BC\tze\n30BD\tso\n30BE\tzo\n30BF\tta\n30C0\tda\n30C1\tchi\n30C2\tdji\n30C3\t~tsu\n30C4\ttsu\n30C5\tdzu\n30C6\tte\n30C7\tde\n30C8\tto\n30C9\tdo\n30CA\tna\n30CB\tni\n30CC\tnu\n30CD\tne\n30CE\tno\n30CF\tha\n30D0\tba\n30D1\tpa\n30D2\thi\n30D3\tbi\n30D4\tpi\n30D5\tfu\n30D6\tbu\n30D7\tpu\n30D8\the\n30D9\tbe\n30DA\tpe\n30DB\tho\n30DC\tbo\n30DD\tpo\n30DE\tma\n30DF\tmi\n30E0\tmu\n30E1\tme\n30E2\tmo\n30E3\t~ya\n30E4\tya\n30E5\t~yu\n30E6\tyu\n30E7\t~yo\n30E8\tyo\n30E9\tra\n30EA\tri\n30EB\tru\n30EC\tre\n30ED\tro\n30EE\t~wa\n30EF\twa\n30F0\twi\n30F1\twe\n30F2\two\n30F3\tn\n30F4\tvu\n30F5\t~ka\n30F6\t~ke\n30F7\tva\n30F8\tvi\n30F9\tve\n30FA\tvo\n3105\tb\n3106\tp\n3107\tm1\n3108\tf\n3109\td\n310A\tt\n310B\tn1\n310C\tl\n310D\tg\n310E\tk\n310F\th\n3110\tj\n3111\tq\n3112\tx\n3113\tzhi1\n3114\tchi1\n3115\tshi1\n3116\tri1\n3117\tzi1\n3118\tci1\n3119\tsi1\n311A\ta1\n311B\to1\n311C\te1\n311D\teh1\n311E\tai1\n311F\tei1\n3120\tao1\n3121\tou1\n3122\tan1\n3123\ten1\n3124\tang1\n3125\teng1\n3126\ter1\n3127\tyi1\n3128\twu1\n3129\tyu1\n3131\tg\n3132\tkk\n3133\tgs\n3134\tn\n3135\tnj\n3136\tnh\n3137\td\n3138\ttt\n3139\tl\n313A\tlg\n313B\tlm\n313C\tlb\n313D\tls\n313E\tlt\n313F\tlp\n3141\tm\n3142\tb\n3143\tpp\n3145\ts\n3146\tss\n3148\tj\n3149\tjj\n314A\tch\n314B\tk\n314C\tt\n314D\tp\n314E\th\n314F\ta\n3150\tae\n3151\tya\n3152\tyae\n3153\teo\n3154\te\n3155\tyeo\n3156\tye\n3157\to\n3158\twa\n3159\twae\n315A\toe\n315B\tyo\n315C\tu\n315D\two\n315E\twe\n315F\twi\n3160\tyu\n3161\teu\n3162\tui\n3163\ti\n3200\t(g)\n3201\t(n)\n3202\t(d)\n3203\t(l)\n3204\t(m)\n3205\t(b)\n3206\t(s)\n3207\t()\n3208\t(j)\n3209\t(ch)\n320A\t(k)\n320B\t(t)\n320C\t(p)\n320D\t(h)\n320E\t(ga)\n320F\t(na)\n3210\t(da)\n3211\t(la)\n3212\t(ma)\n3213\t(ba)\n3214\t(sa)\n3215\t(a)\n3216\t(ja)\n3217\t(cha)\n3218\t(ka)\n3219\t(ta)\n321A\t(pa)\n321B\t(ha)\n321C\t(ju)\n3260\tg\n3261\tn\n3262\td\n3263\tl\n3264\tm\n3265\tb\n3266\ts\n3268\tj\n3269\tch\n326A\tk\n326B\tt\n326C\tp\n326D\th\n326E\tga\n326F\tna\n3270\tda\n3271\tla\n3272\tma\n3273\tba\n3274\tsa\n3275\ta\n3276\tja\n3277\tcha\n3278\tka\n3279\tta\n327A\tpa\n327B\tha\n3371\thPa\n3372\tda\n3373\tAU\n3374\tbar\n3375\toV\n3376\tpc\n3377\tdm\n337A\tIU\n3380\tpA\n3381\tnA\n3383\tmA\n3384\tkA\n3385\tKB\n3386\tMB\n3387\tGB\n3388\tcal\n3389\tkcal\n338A\tpF\n338B\tnF\n338E\tmg\n338F\tkg\n3390\tHz\n3391\tkHz\n3392\tMHz\n3393\tGHz\n3394\tTHz\n3399\tfm\n339A\tnm\n339C\tmm\n339D\tcm\n339E\tkm\n33A7\tm/s\n33A9\tPa\n33AA\tkPa\n33AB\tMPa\n33AC\tGPa\n33AD\trad\n33AE\trad/s\n33B0\tps\n33B1\tns\n33B3\tms\n33B4\tpV\n33B5\tnV\n33B7\tmV\n33B8\tkV\n33B9\tMV\n33BA\tpW\n33BB\tnW\n33BD\tmW\n33BE\tkW\n33BF\tMW\n33C2\ta.m.\n33C3\tBq\n33C4\tcc\n33C5\tcd\n33C6\tC/kg\n33C7\tCo.\n33C8\tdB\n33C9\tGy\n33CA\tha\n33CB\tHP\n33CC\tin\n33CD\tKK\n33CE\tKM\n33CF\tkt\n33D0\tlm\n33D1\tln\n33D2\tlog\n33D3\tlx\n33D4\tmb\n33D5\tmil\n33D6\tmol\n33D7\tpH\n33D8\tp.m.\n33D9\tPPM\n33DA\tPR\n33DB\tsr\n33DC\tSv\n33DD\tWb\n33DE\tV/m\n33DF\tA/m\n3400\tqiu\n3401\ttian\n3404\tkua\n3405\twu\n3406\tyin\n340C\tyi\n3416\txie\n341C\tchou\n3421\tnuo\n3424\tdan\n3428\txu\n3429\txing\n342B\txiong\n342C\tliu\n342D\tlin\n342E\txiang\n342F\tyong\n3430\txin\n3431\tzhen\n3432\tdai\n3433\twu\n3434\tpan\n3435\tru\n3437\tma\n3438\tqian\n3439\tyi\n343A\tyin\n343B\tnei\n343C\tcheng\n343D\tfeng\n3441\tzhuo\n3442\tfang\n3443\tao\n3444\twu\n3445\tzuo\n3447\tzhou\n3448\tdong\n3449\tsu\n344A\tyi\n344B\tqiong\n344C\tkuang\n344D\tlei\n344E\tnao\n344F\tzhu\n3450\tshu\n3454\txu\n3457\tshen\n3458\tjie\n3459\tdie\n345A\tnuo\n345B\tsu\n345C\tyi\n345D\tlong\n345E\tying\n345F\tbeng\n3463\tlan\n3464\tmiao\n3465\tyi\n3466\tli\n3467\tji\n3468\tyu\n3469\tluo\n346A\tchai\n346E\thun\n346F\txu\n3470\thui\n3471\trao\n3473\tzhou\n3475\than\n3476\txi\n3477\ttai\n3478\tyao\n3479\thui\n347A\tjun\n347B\tma\n347C\tlue\n347D\ttang\n347E\tyao\n347F\tzhao\n3480\tzhai\n3481\tyu\n3482\tzhuo\n3483\ter\n3484\tran\n3485\tqi\n3486\tchi\n3487\twu\n3488\than\n3489\ttang\n348A\tse\n348B\tsi\n348C\tqiong\n348D\tlei\n348E\tsa\n3491\tkui\n3492\tpu\n3493\tta\n3494\tshu\n3495\tyang\n3496\tou\n3497\ttai\n3499\tmian\n349A\tyin\n349B\tdiao\n349C\tyu\n349D\tmie\n349E\tjun\n349F\tniao\n34A0\txie\n34A1\tyou\n34A4\tche\n34A5\tfeng\n34A6\tlei\n34A7\tli\n34A9\tluo\n34AB\tji\n34B0\tquan\n34B2\tcai\n34B3\tliang\n34B4\tgu\n34B5\tmao\n34B7\tgua\n34B8\tsui\n34BB\tmao\n34BC\tman\n34BD\tquan\n34BE\tshi\n34BF\tli\n34C1\twang\n34C2\tkou\n34C3\tdu\n34C4\tzhen\n34C5\tting\n34C8\tbing\n34C9\thuo\n34CA\tdong\n34CB\tgong\n34CC\tcheng\n34CE\tqin\n34CF\tjiong\n34D0\tlu\n34D1\txing\n34D3\tnan\n34D4\txie\n34D6\tbi\n34D7\tjie\n34D8\tsu\n34DA\tgong\n34DC\tyou\n34DD\txing\n34DE\tqia\n34DF\tpi\n34E0\tdian\n34E1\tfu\n34E2\tluo\n34E3\tqia\n34E4\tqia\n34E5\ttang\n34E6\tbai\n34E7\tgan\n34E8\tci\n34E9\txuan\n34EA\tlang\n34ED\tshe\n34EE\tdiao\n34EF\tli\n34F0\thua\n34F1\ttou\n34F2\tpian\n34F3\tdi\n34F4\truan\n34F5\te\n34F6\tqie\n34F7\tyi\n34F8\tzhuo\n34F9\trui\n34FA\tjian\n34FC\tchi\n34FD\tchong\n34FE\txi\n3500\tlue\n3501\tdeng\n3502\tlin\n3503\tjue\n3504\tsu\n3505\txiao\n3506\tzan\n3509\tzhu\n350A\tzhan\n350B\tjian\n350C\tzou\n350D\tchua\n350E\txie\n350F\tli\n3511\tchi\n3512\txi\n3513\tjian\n3515\tji\n3517\tfei\n3518\tchu\n3519\tbeng\n351A\tjie\n351C\tba\n351D\tliang\n351E\tkuai\n3520\txia\n3521\tbie\n3522\tjue\n3523\tlei\n3524\txin\n3525\tbai\n3526\tyang\n3527\tlu\n3528\tbei\n3529\te\n352A\tlu\n352D\tche\n352E\tnuo\n352F\txuan\n3530\theng\n3531\tyu\n3533\tgui\n3534\tyi\n3535\txuan\n3536\tgong\n3537\tlou\n3538\tti\n3539\tle\n353A\tshi\n353C\tsun\n353D\tyao\n353E\txian\n353F\tzou\n3541\tque\n3542\tyin\n3543\txi\n3544\tzhi\n3545\tjia\n3546\thu\n3547\tla\n3548\tyi\n3549\tke\n354A\tfu\n354B\tqin\n354C\tai\n354E\tke\n354F\tchu\n3550\txie\n3551\tchu\n3552\twei\n3555\thuan\n3556\tsu\n3557\tyou\n3559\tjun\n355A\tzhao\n355B\txu\n355C\tshi\n355E\tshua\n355F\tkui\n3560\tshuang\n3561\the\n3562\tgai\n3563\tyan\n3564\tqiu\n3565\tshen\n3566\thua\n3567\txi\n3568\tfan\n3569\tpang\n356A\tdan\n356B\tfang\n356C\tgong\n356D\tao\n356E\tfu\n356F\tne\n3570\txue\n3571\tyou\n3572\thua\n3574\tchen\n3575\tguo\n3576\tn\n3577\thua\n3578\tli\n3579\tfa\n357A\txiao\n357B\tpou\n357D\tsi\n3580\tle\n3581\tlin\n3582\tyi\n3583\thou\n3585\txu\n3586\tqu\n3587\ter\n358A\txun\n358F\tnie\n3590\twei\n3591\txie\n3592\tti\n3593\thong\n3594\ttun\n3595\tnie\n3596\tnie\n3597\tyin\n3598\tzhen\n359E\twai\n359F\tshou\n35A0\tnuo\n35A1\tye\n35A2\tqi\n35A3\ttou\n35A4\than\n35A5\tjun\n35A6\tdong\n35A7\thun\n35A8\tlu\n35A9\tju\n35AA\thuo\n35AB\tling\n35AD\ttian\n35AE\tlun\n35B5\tge\n35B6\tyan\n35B7\tshi\n35B8\txue\n35B9\tpen\n35BA\tchun\n35BB\tniu\n35BC\tduo\n35BD\tze\n35BE\te\n35BF\txie\n35C0\tyou\n35C1\te\n35C2\tsheng\n35C3\twen\n35C4\tku\n35C5\thu\n35C6\tge\n35C7\txia\n35C8\tman\n35C9\tlue\n35CA\tji\n35CB\thou\n35CC\tzhi\n35CF\twai\n35D1\tbai\n35D2\tai\n35D3\tzhui\n35D4\tqian\n35D5\tgou\n35D6\tdan\n35D7\tbei\n35D8\tbo\n35D9\tchu\n35DA\tli\n35DB\txiao\n35DC\txiu\n35E2\thong\n35E3\tti\n35E4\tcu\n35E5\tkuo\n35E6\tlao\n35E7\tzhi\n35E8\txie\n35E9\txi\n35EB\tqie\n35EC\tzha\n35ED\txi\n35F0\tcong\n35F1\tji\n35F2\thuo\n35F3\tta\n35F4\tyan\n35F5\txu\n35F6\tpo\n35F7\tsai\n35FB\tguo\n35FC\tye\n35FD\txiang\n35FE\txue\n35FF\the\n3600\tzuo\n3601\tyi\n3602\tci\n3604\tleng\n3605\txian\n3606\ttai\n3607\trong\n3608\tyi\n3609\tzhi\n360A\txi\n360B\txian\n360C\tju\n360D\tji\n360E\than\n3610\tpao\n3611\tli\n3613\tlan\n3614\tsai\n3615\than\n3616\tyan\n3617\tqu\n3619\tyan\n361A\than\n361B\tkan\n361C\tchi\n361D\tnie\n361E\thuo\n3620\tbi\n3621\txia\n3622\tweng\n3623\txuan\n3624\twan\n3625\tyou\n3626\tqin\n3627\txu\n3628\tnie\n3629\tbi\n362A\thao\n362B\tjing\n362C\tao\n362D\tao\n3630\tzhen\n3631\ttan\n3632\tju\n3634\tzuo\n3635\tbu\n3636\tjie\n3637\tai\n3638\tzang\n3639\tci\n363A\tfa\n363F\tnie\n3640\tliu\n3641\tmei\n3642\tdui\n3643\tbang\n3644\tbi\n3645\tbao\n3647\tchu\n3648\txia\n3649\ttian\n364A\tchang\n364D\tduo\n364E\twei\n364F\tfu\n3650\tduo\n3651\tyu\n3652\tye\n3653\tkui\n3654\twei\n3655\tkuai\n3657\twei\n3658\tyao\n3659\tlong\n365A\txing\n365B\tbu\n365C\tchi\n365D\txie\n365E\tnie\n365F\tlang\n3660\tyi\n3661\tzong\n3662\tman\n3663\tzhang\n3664\txia\n3665\tgun\n3666\txie\n3668\tji\n3669\tliao\n366A\tyi\n366B\tji\n366C\tyin\n366E\tda\n366F\tyi\n3670\txie\n3671\thao\n3672\tyong\n3673\tkan\n3674\tchan\n3675\ttai\n3676\ttang\n3677\tzhi\n3678\tbao\n3679\tmeng\n367A\tkui\n367B\tchan\n367C\tlei\n367E\txi\n3680\txi\n3681\tqiao\n3682\tnang\n3683\tyun\n3685\tlong\n3686\tfu\n3687\tzong\n3689\tgu\n368A\tkai\n368B\tdiao\n368C\thua\n368D\tkui\n368F\tgao\n3690\ttao\n3692\tshan\n3693\tlai\n3694\tnie\n3695\tfu\n3696\tgao\n3697\tqie\n3698\tban\n3699\tjia\n369A\tkong\n369B\txi\n369C\tyu\n369D\tzhui\n369E\tshen\n369F\tchuo\n36A0\txiao\n36A1\tji\n36A2\tnu\n36A3\txiao\n36A4\tyi\n36A5\tyu\n36A6\tyi\n36A7\tyan\n36A8\tshen\n36A9\tran\n36AA\thao\n36AB\tsa\n36AC\tjun\n36AD\tyou\n36AF\txin\n36B0\tpei\n36B1\tqiu\n36B2\tchan\n36B4\tbu\n36B5\tdong\n36B6\tsi\n36B7\ter\n36B9\tmao\n36BA\tyun\n36BB\tji\n36BD\tqiao\n36BE\txiong\n36BF\tpao\n36C0\tchu\n36C1\tpeng\n36C2\tnuo\n36C3\tjie\n36C4\tyi\n36C5\ter\n36C6\tduo\n36CA\tduo\n36CD\tqie\n36CE\tlu\n36CF\tqiu\n36D0\tsou\n36D1\tcan\n36D2\tdou\n36D3\txi\n36D4\tfeng\n36D5\tyi\n36D6\tsuo\n36D7\tqie\n36D8\tpo\n36D9\txin\n36DA\ttong\n36DB\txin\n36DC\tyou\n36DD\tbei\n36DE\tlong\n36E3\tyun\n36E4\tli\n36E5\tta\n36E6\tlan\n36E7\tman\n36E8\tqiang\n36E9\tzhou\n36EA\tyan\n36EB\txi\n36EC\tlu\n36ED\txi\n36EE\tsao\n36EF\tfan\n36F1\twei\n36F2\tfa\n36F3\tyi\n36F4\tnao\n36F5\tcheng\n36F6\ttan\n36F7\tji\n36F8\tshu\n36F9\tpian\n36FA\tan\n36FB\tkua\n36FC\tcha\n36FE\txian\n36FF\tzhi\n3702\tfeng\n3703\tlian\n3704\txun\n3705\txu\n3706\tmi\n3707\thui\n3708\tmu\n3709\tyong\n370A\tzhan\n370B\tyi\n370C\tnou\n370D\ttang\n370E\txi\n370F\tyun\n3710\tshu\n3711\tfu\n3712\tyi\n3713\tda\n3715\tlian\n3716\tcao\n3717\tcan\n3718\tju\n3719\tlu\n371A\tsu\n371B\tnen\n371C\tao\n371D\tan\n371E\tqian\n3720\tcui\n3721\tcong\n3723\tran\n3724\tnian\n3725\tmai\n3726\txin\n3727\tyue\n3728\tnai\n3729\tao\n372A\tshen\n372B\tma\n372E\tlan\n372F\txi\n3730\tyue\n3731\tzhi\n3732\tweng\n3733\thuai\n3734\tmeng\n3735\tniao\n3736\twan\n3737\tmi\n3738\tnie\n3739\tqu\n373A\tzan\n373B\tlian\n373C\tzhi\n373D\tzi\n373E\thai\n373F\txu\n3740\thao\n3741\txuan\n3742\tzhi\n3743\tmian\n3744\tchun\n3745\tgou\n3747\tchun\n3748\tluan\n3749\tzhu\n374A\tshou\n374B\tliao\n374C\tjiu\n374D\txie\n374E\tding\n374F\tjie\n3750\trong\n3751\tmang\n3753\tke\n3754\tyao\n3755\tning\n3756\tyi\n3757\tlang\n3758\tyong\n3759\tyin\n375A\tyan\n375B\tsu\n375D\tlin\n375E\tya\n375F\tmao\n3760\tming\n3761\tzui\n3762\tyu\n3763\tyi\n3764\tgou\n3765\tmi\n3766\tjun\n3767\twen\n3769\tkang\n376A\tdian\n376B\tlong\n376D\txing\n376E\tcui\n376F\tqiao\n3770\tmian\n3771\tmeng\n3772\tqin\n3774\twan\n3775\tde\n3776\tai\n3778\tbian\n3779\tnou\n377A\tlian\n377B\tjin\n377C\tyu\n377D\tchui\n377E\tzuo\n377F\tbo\n3780\thui\n3781\tyao\n3782\ttui\n3783\tji\n3784\tan\n3785\tluo\n3786\tji\n3787\twei\n3788\tbo\n3789\tza\n378A\txu\n378B\tnian\n378C\tyun\n378E\tba\n378F\tzhe\n3790\tju\n3791\twei\n3792\txie\n3793\tqi\n3794\tyi\n3795\txie\n3796\tci\n3797\tqiu\n3798\tdu\n3799\tniao\n379A\tqi\n379B\tji\n379C\ttui\n379E\tsong\n379F\tdian\n37A0\tlao\n37A1\tzhan\n37A4\tyin\n37A5\tcen\n37A6\tji\n37A7\thui\n37A8\tzi\n37A9\tlan\n37AA\tnao\n37AB\tju\n37AC\tqin\n37AD\tdai\n37AF\tjie\n37B0\txu\n37B1\tcong\n37B2\tyong\n37B3\tdou\n37B4\tchi\n37B6\tmin\n37B7\thuang\n37B8\tsui\n37B9\tke\n37BA\tzu\n37BB\thao\n37BC\tcheng\n37BD\txue\n37BE\tni\n37BF\tchi\n37C0\tlian\n37C1\tan\n37C2\tmu\n37C3\tsi\n37C4\txiang\n37C5\tyang\n37C6\thua\n37C7\tcuo\n37C8\tqiu\n37C9\tlao\n37CA\tfu\n37CB\tdui\n37CC\tmang\n37CD\tlang\n37CE\ttuo\n37CF\than\n37D0\tmang\n37D1\tbo\n37D2\tqun\n37D3\tqi\n37D4\than\n37D6\tlong\n37D7\tbin\n37D8\ttiao\n37D9\tze\n37DA\tqi\n37DB\tzan\n37DC\tmi\n37DD\tpei\n37DE\tzhan\n37DF\txiang\n37E0\tgang\n37E2\tqi\n37E4\tlu\n37E5\tcen\n37E6\tyun\n37E7\te\n37E8\tduan\n37E9\tmin\n37EA\twei\n37EB\tquan\n37EC\tsou\n37ED\tmin\n37EE\ttu\n37F0\tming\n37F1\tyao\n37F2\tjue\n37F3\tli\n37F4\tkuai\n37F5\tgang\n37F6\tyuan\n37F7\tda\n37F9\tlao\n37FA\tlou\n37FB\tqian\n37FC\tao\n37FD\tbiao\n37FE\tyong\n37FF\tmang\n3800\tdao\n3802\tao\n3804\txi\n3805\tfu\n3806\tdan\n3807\tjiu\n3808\trun\n3809\ttong\n380A\tqu\n380B\te\n380C\tqi\n380D\tji\n380E\tji\n380F\thua\n3810\tjiao\n3811\tzui\n3812\tbiao\n3813\tmeng\n3814\tbai\n3815\twei\n3816\tyi\n3817\tao\n3818\tyu\n3819\thao\n381A\tdui\n381B\two\n381C\tni\n381D\tcuan\n381F\tli\n3820\tlu\n3821\tniao\n3822\thuai\n3823\tli\n3825\tlu\n3826\tfeng\n3827\tmi\n3828\tyu\n382A\tju\n382D\tzhan\n382E\tpeng\n382F\tyi\n3831\tji\n3832\tbi\n3834\tren\n3835\thuang\n3836\tfan\n3837\tge\n3838\tku\n3839\tjie\n383A\tsha\n383C\tsi\n383D\ttong\n383E\tyuan\n383F\tzi\n3840\tbi\n3841\tkua\n3842\tli\n3843\thuang\n3844\txun\n3845\tnuo\n3847\tzhe\n3848\twen\n3849\txian\n384A\tqia\n384B\tye\n384C\tmao\n384E\tshan\n384F\tshu\n3851\tqiao\n3852\tzhun\n3853\tkun\n3854\twu\n3855\tying\n3856\tchuang\n3857\tti\n3858\tlian\n3859\tbi\n385A\tgou\n385B\tmang\n385C\txie\n385D\tfeng\n385E\tlou\n385F\tzao\n3860\tzheng\n3861\tchu\n3862\tman\n3863\tlong\n3865\tyin\n3866\tpin\n3867\tzheng\n3868\tjian\n3869\tluan\n386A\tnie\n386B\tyi\n386D\tji\n386E\tji\n386F\tzhai\n3870\tyu\n3871\tjiu\n3872\thuan\n3873\tzhi\n3874\tla\n3875\tling\n3876\tzhi\n3877\tben\n3878\tzha\n3879\tju\n387A\tdan\n387B\tliao\n387C\tyi\n387D\tzhao\n387E\txian\n387F\tchi\n3880\tci\n3881\tchi\n3882\tyan\n3883\tlang\n3884\tdou\n3885\tlong\n3886\tchan\n3888\ttui\n3889\tcha\n388A\tai\n388B\tchi\n388D\tying\n388E\tzhe\n388F\ttou\n3891\ttui\n3892\tcha\n3893\tyao\n3894\tzong\n3896\tpan\n3897\tqiao\n3898\tlian\n3899\tqin\n389A\tlu\n389B\tyan\n389C\tkang\n389D\tsu\n389E\tyi\n389F\tchan\n38A0\tjiong\n38A1\tjiang\n38A3\tjing\n38A5\tdong\n38A7\tjuan\n38A8\than\n38A9\tdi\n38AC\thong\n38AE\tchi\n38AF\tdiao\n38B0\tbi\n38B2\txun\n38B3\tlu\n38B5\txie\n38B6\tbi\n38B8\tbi\n38BA\txian\n38BB\trui\n38BC\tbie\n38BD\ter\n38BE\tjuan\n38C0\tzhen\n38C1\tbei\n38C2\te\n38C3\tyu\n38C4\tqu\n38C5\tzan\n38C6\tmi\n38C7\tyi\n38C8\tsi\n38CC\tshan\n38CD\ttai\n38CE\tmu\n38CF\tjing\n38D0\tbian\n38D1\trong\n38D2\tceng\n38D3\tcan\n38D4\tding\n38D9\tdi\n38DA\ttong\n38DB\tta\n38DC\txing\n38DD\tsong\n38DE\tduo\n38DF\txi\n38E0\ttao\n38E2\tti\n38E3\tshan\n38E4\tjian\n38E5\tzhi\n38E6\twei\n38E7\tyin\n38EA\thuan\n38EB\tzhong\n38EC\tqi\n38ED\tzong\n38EF\txie\n38F0\txie\n38F1\tze\n38F2\twei\n38F5\tta\n38F6\tzhan\n38F7\tning\n38FA\txin\n38FB\tyi\n38FC\tren\n38FD\tshu\n38FE\tcha\n38FF\tzhuo\n3901\tmian\n3902\tji\n3903\tfang\n3904\tpei\n3905\tai\n3906\tfan\n3907\tao\n3908\tqin\n3909\tqia\n390A\txiao\n390B\tfen\n390C\tgan\n390D\tqiao\n390E\tge\n390F\ttong\n3910\tchan\n3911\tyou\n3912\tgao\n3913\tben\n3914\tfu\n3915\tchu\n3916\tzhu\n3918\tzhou\n391A\thang\n391B\tnin\n391C\tjue\n391D\tchong\n391E\tcha\n391F\tkong\n3920\tlie\n3921\tli\n3922\tyu\n3924\tyu\n3925\thai\n3926\tli\n3927\thou\n3928\tgong\n3929\tke\n392A\tyuan\n392B\tde\n392C\thui\n392D\tjiao\n392E\tguang\n392F\tjiong\n3930\tzuo\n3931\tfu\n3932\tqie\n3933\tbei\n3934\tche\n3935\tci\n3936\tmang\n3937\than\n3938\txi\n3939\tqiu\n393A\thuang\n393D\tchou\n393E\tsan\n393F\tyan\n3940\tzhi\n3941\tde\n3942\tte\n3943\tmen\n3944\tling\n3945\tshou\n3946\ttui\n3947\tcan\n3948\tdie\n3949\tche\n394A\tpeng\n394B\tyi\n394C\tju\n394D\tji\n394E\tlai\n394F\ttian\n3950\tyuan\n3952\tcai\n3953\tqi\n3954\tyu\n3955\tlian\n3956\tcong\n395A\tyu\n395B\tji\n395C\twei\n395D\tmi\n395E\tsui\n395F\txie\n3960\txu\n3961\tchi\n3962\tqiu\n3963\thui\n3965\tyu\n3966\tqie\n3967\tshun\n3968\tshui\n3969\tduo\n396A\tlou\n396C\tpang\n396D\ttai\n396E\tzhou\n396F\tyin\n3970\tsao\n3971\tfei\n3972\tchen\n3973\tyuan\n3974\tyi\n3975\thun\n3976\tse\n3977\tye\n3978\tmin\n3979\tfen\n397A\the\n397C\tyin\n397D\tce\n397E\tni\n397F\tao\n3980\tfeng\n3981\tlian\n3982\tchang\n3983\tchan\n3984\tma\n3985\tdie\n3986\thu\n3987\tlu\n3988\tai\n3989\tyi\n398A\thua\n398B\tzha\n398C\thu\n398D\te\n398E\thuo\n398F\tsun\n3990\tni\n3991\txian\n3992\tli\n3993\txian\n3994\tyan\n3995\tlong\n3996\tmen\n3997\tjin\n3998\tji\n399A\tbian\n399B\tyu\n399C\thuo\n399D\tmiao\n399E\tchou\n399F\tmai\n39A1\tle\n39A2\tjie\n39A3\twei\n39A4\tyi\n39A5\txuan\n39A6\txi\n39A7\tcan\n39A8\tlan\n39A9\tyin\n39AA\txie\n39AB\tza\n39AC\tluo\n39AD\tling\n39AE\tqian\n39AF\thuo\n39B0\tjian\n39B1\two\n39B4\tge\n39B5\tzhu\n39B6\tdie\n39B7\tyong\n39B8\tji\n39B9\tyang\n39BA\tru\n39BB\txi\n39BC\tshuang\n39BD\tyu\n39BE\tyi\n39BF\tqian\n39C0\tji\n39C1\tqu\n39C2\ttian\n39C3\tshou\n39C4\tqian\n39C5\tmu\n39C6\tjin\n39C7\tmao\n39C8\tyin\n39C9\tgai\n39CA\tpo\n39CB\txuan\n39CC\tmao\n39CD\tfang\n39CE\tya\n39CF\tgang\n39D0\tsong\n39D1\thui\n39D2\tyu\n39D3\tgua\n39D4\tguai\n39D5\tliu\n39D6\te\n39D7\tzi\n39D8\tzi\n39D9\tbi\n39DA\twa\n39DB\tlan\n39DC\tlie\n39DF\tkuai\n39E1\thai\n39E2\tyin\n39E3\tzhu\n39E4\tchong\n39E5\txian\n39E6\txuan\n39E8\tqiu\n39E9\tpei\n39EA\tgui\n39EB\ter\n39EC\tgong\n39ED\tqiong\n39EE\thu\n39EF\tlao\n39F0\tli\n39F1\tchen\n39F2\tsan\n39F3\tzhuo\n39F4\two\n39F5\tpou\n39F6\tkeng\n39F7\ttun\n39F8\tpeng\n39F9\tte\n39FA\tta\n39FB\tzhuo\n39FC\tbiao\n39FD\tgu\n39FE\thu\n3A00\tbing\n3A01\tzhi\n3A02\tdong\n3A03\tdui\n3A04\tzhou\n3A05\tnei\n3A06\tlin\n3A07\tpo\n3A08\tji\n3A09\tmin\n3A0A\twei\n3A0B\tche\n3A0C\tgou\n3A0D\tbang\n3A0E\tru\n3A0F\ttan\n3A10\tbu\n3A11\tzong\n3A12\tkui\n3A13\tlao\n3A14\than\n3A15\tying\n3A16\tzhi\n3A17\tjie\n3A18\txing\n3A19\txie\n3A1A\txun\n3A1B\tshan\n3A1C\tqian\n3A1D\txie\n3A1E\tsu\n3A1F\thai\n3A20\tmi\n3A21\thun\n3A22\tpi\n3A24\thui\n3A25\tna\n3A26\tsong\n3A27\tben\n3A28\tchou\n3A29\tjie\n3A2A\thuang\n3A2B\tlan\n3A2D\thu\n3A2E\tdou\n3A2F\thuo\n3A30\tgun\n3A31\tyao\n3A32\tce\n3A33\tgui\n3A34\tjian\n3A35\tjian\n3A36\tdao\n3A37\tjin\n3A38\tma\n3A39\thui\n3A3A\tmian\n3A3B\tcan\n3A3C\tlue\n3A3D\tpi\n3A3E\tyang\n3A3F\tju\n3A40\tju\n3A41\tque\n3A43\tqian\n3A44\tshai\n3A46\tjiu\n3A47\thuo\n3A48\tyun\n3A49\tda\n3A4A\txuan\n3A4B\txiao\n3A4C\tfei\n3A4D\tce\n3A4E\tye\n3A50\tden\n3A52\tqin\n3A53\thui\n3A54\ttun\n3A56\tqiang\n3A57\txi\n3A58\tni\n3A59\tsai\n3A5A\tmeng\n3A5B\ttuan\n3A5C\tlan\n3A5D\thao\n3A5E\tci\n3A5F\tzhai\n3A60\tao\n3A61\tluo\n3A62\tmie\n3A64\tfu\n3A66\txie\n3A67\tbo\n3A68\thui\n3A69\tqing\n3A6A\txie\n3A6D\tbo\n3A6E\tqian\n3A6F\tpo\n3A70\tjiao\n3A71\tjue\n3A72\tkun\n3A73\tsong\n3A74\tju\n3A75\te\n3A76\tnie\n3A77\tqian\n3A78\tdie\n3A79\tdie\n3A7B\tqi\n3A7C\tzhi\n3A7D\tqi\n3A7E\tzhui\n3A7F\tku\n3A80\tyu\n3A81\tqin\n3A82\tku\n3A83\the\n3A84\tfu\n3A85\tgeng\n3A86\tdi\n3A87\txian\n3A88\tgui\n3A89\the\n3A8A\tqun\n3A8B\than\n3A8C\ttong\n3A8D\tbo\n3A8E\tshan\n3A8F\tbi\n3A90\tlu\n3A91\tye\n3A92\tni\n3A93\tchuai\n3A94\tsan\n3A95\tdiao\n3A96\tlu\n3A97\ttou\n3A98\tlian\n3A99\tke\n3A9A\tsan\n3A9B\tzhen\n3A9C\tchuai\n3A9D\tlian\n3A9E\tmao\n3AA0\tqian\n3AA1\tkai\n3AA2\tshao\n3AA3\txiao\n3AA4\tbi\n3AA5\tzha\n3AA6\tyin\n3AA7\txi\n3AA8\tshan\n3AA9\tsu\n3AAA\tsa\n3AAB\trui\n3AAC\tchuo\n3AAD\tlu\n3AAE\tling\n3AAF\tcha\n3AB1\thuan\n3AB4\tjia\n3AB5\tban\n3AB6\thu\n3AB7\tdou\n3AB9\tlou\n3ABA\tju\n3ABB\tjuan\n3ABC\tke\n3ABD\tsuo\n3ABE\tluo\n3ABF\tzhe\n3AC0\tding\n3AC1\tduan\n3AC2\tzhu\n3AC3\tyan\n3AC4\tpang\n3AC5\tcha\n3ACA\tyi\n3ACD\tyou\n3ACE\thui\n3ACF\tyao\n3AD0\tyao\n3AD1\tzhi\n3AD2\tgong\n3AD3\tqi\n3AD4\tgen\n3AD7\thou\n3AD8\tmi\n3AD9\tfu\n3ADA\thu\n3ADB\tguang\n3ADC\ttan\n3ADD\tdi\n3ADF\tyan\n3AE2\tqu\n3AE4\tchang\n3AE5\tming\n3AE6\ttao\n3AE7\tbao\n3AE8\tan\n3AEB\txian\n3AEF\tmao\n3AF0\tlang\n3AF1\tnan\n3AF2\tbei\n3AF3\tchen\n3AF5\tfei\n3AF6\tzhou\n3AF7\tji\n3AF8\tjie\n3AF9\tshu\n3AFB\tkun\n3AFC\tdie\n3AFD\tlu\n3B02\tyu\n3B03\ttai\n3B04\tchan\n3B05\tman\n3B06\tmin\n3B07\thuan\n3B08\twen\n3B09\tnuan\n3B0A\thuan\n3B0B\thou\n3B0C\tjing\n3B0D\tbo\n3B0E\txian\n3B0F\tli\n3B10\tjin\n3B12\tmang\n3B13\tpiao\n3B14\thao\n3B15\tyang\n3B17\txian\n3B18\tsu\n3B19\twei\n3B1A\tche\n3B1B\txi\n3B1C\tjin\n3B1D\tceng\n3B1E\the\n3B1F\tfen\n3B20\tshai\n3B21\tling\n3B23\tdui\n3B24\tqi\n3B25\tpu\n3B26\tyue\n3B27\tbo\n3B29\thui\n3B2A\tdie\n3B2B\tyan\n3B2C\tju\n3B2D\tjiao\n3B2E\tnan\n3B2F\tlie\n3B30\tyu\n3B31\tti\n3B32\ttian\n3B33\twu\n3B34\thong\n3B35\txiao\n3B36\thao\n3B38\ttiao\n3B39\tzheng\n3B3B\thuang\n3B3C\tfu\n3B3F\ttun\n3B41\treng\n3B42\tjiao\n3B44\txin\n3B47\tyuan\n3B48\tjue\n3B49\thua\n3B4B\tbang\n3B4C\tmou\n3B4E\tgang\n3B4F\twei\n3B51\tmei\n3B52\tsi\n3B53\tbian\n3B54\tlu\n3B55\tqu\n3B58\tge\n3B59\tzhe\n3B5A\tlu\n3B5B\tpai\n3B5C\trong\n3B5D\tqiu\n3B5E\tlie\n3B5F\tgong\n3B60\txian\n3B61\txi\n3B62\txin\n3B64\tniao\n3B68\txie\n3B69\tlie\n3B6A\tfu\n3B6B\tcuo\n3B6C\tzhuo\n3B6D\tba\n3B6E\tzuo\n3B6F\tzhe\n3B70\tzui\n3B71\the\n3B72\tji\n3B74\tjian\n3B78\ttu\n3B79\txian\n3B7A\tyan\n3B7B\ttang\n3B7C\tta\n3B7D\tdi\n3B7E\tjue\n3B7F\tang\n3B80\than\n3B81\txiao\n3B82\tju\n3B83\twei\n3B84\tbang\n3B85\tzhui\n3B86\tnie\n3B87\ttian\n3B88\tnai\n3B8B\tyou\n3B8C\tmian\n3B8F\tnai\n3B90\tsheng\n3B91\tcha\n3B92\tyan\n3B93\tgen\n3B94\tchong\n3B95\truan\n3B96\tjia\n3B97\tqin\n3B98\tmao\n3B99\te\n3B9A\tli\n3B9B\tchi\n3B9C\tzang\n3B9D\the\n3B9E\tjie\n3B9F\tnian\n3BA1\tguan\n3BA2\thou\n3BA3\tgai\n3BA5\tben\n3BA6\tsuo\n3BA7\twu\n3BA8\tji\n3BA9\txi\n3BAA\tqiong\n3BAB\the\n3BAC\tweng\n3BAD\txian\n3BAE\tjie\n3BAF\thun\n3BB0\tpi\n3BB1\tshen\n3BB2\tchou\n3BB3\tzhen\n3BB5\tzhan\n3BB6\tshuo\n3BB7\tji\n3BB8\tsong\n3BB9\tzhi\n3BBA\tben\n3BBE\tlang\n3BBF\tbi\n3BC0\txuan\n3BC1\tpei\n3BC2\tdai\n3BC3\tqi\n3BC4\tzhi\n3BC5\tpi\n3BC6\tchan\n3BC7\tbi\n3BC8\tsu\n3BC9\thuo\n3BCA\then\n3BCB\tjiong\n3BCC\tchuan\n3BCD\tjiang\n3BCE\tnen\n3BCF\tgu\n3BD0\tfang\n3BD3\tta\n3BD4\tcui\n3BD5\txi\n3BD6\tde\n3BD7\txian\n3BD8\tkuan\n3BD9\tzhe\n3BDA\tta\n3BDB\thu\n3BDC\tcui\n3BDD\tlu\n3BDE\tjuan\n3BDF\tlu\n3BE0\tqian\n3BE1\tpao\n3BE2\tzhen\n3BE4\tli\n3BE5\tcao\n3BE6\tqi\n3BE9\tti\n3BEA\tling\n3BEB\tqu\n3BEC\tlian\n3BED\tlu\n3BEE\tshu\n3BEF\tgong\n3BF0\tzhe\n3BF1\tpao\n3BF2\tjin\n3BF3\tqing\n3BF6\tzong\n3BF7\tpu\n3BF8\tjin\n3BF9\tbiao\n3BFA\tjian\n3BFB\tgun\n3BFD\tbin\n3BFE\tzao\n3BFF\tlie\n3C00\tli\n3C01\tluo\n3C02\tshen\n3C03\tmian\n3C04\tjian\n3C05\tdi\n3C06\tbei\n3C08\tlian\n3C0A\txian\n3C0B\tpin\n3C0C\tque\n3C0D\tlong\n3C0E\tzui\n3C10\tjue\n3C11\tshan\n3C12\txue\n3C14\txie\n3C16\tlan\n3C17\tqi\n3C18\tyi\n3C19\tnuo\n3C1A\tli\n3C1B\tyue\n3C1D\tyi\n3C1E\tchi\n3C1F\tji\n3C20\thang\n3C21\txie\n3C22\tkeng\n3C23\tzi\n3C24\the\n3C25\txi\n3C26\tqu\n3C27\thai\n3C28\txia\n3C29\thai\n3C2A\tgui\n3C2B\tchan\n3C2C\txun\n3C2D\txu\n3C2E\tshen\n3C2F\tkou\n3C30\txia\n3C31\tsha\n3C32\tyu\n3C33\tya\n3C34\tpou\n3C35\tzu\n3C36\tyou\n3C37\tzi\n3C38\tlian\n3C39\txian\n3C3A\txia\n3C3B\tyi\n3C3C\tsha\n3C3D\tyan\n3C3E\tjiao\n3C3F\txi\n3C40\tchi\n3C41\tshi\n3C42\tkang\n3C43\tyin\n3C44\thei\n3C45\tyi\n3C46\txi\n3C47\tse\n3C48\tjin\n3C49\tye\n3C4A\tyou\n3C4B\tque\n3C4C\tye\n3C4D\tluan\n3C4E\tkun\n3C4F\tzheng\n3C54\txie\n3C56\tcui\n3C57\txiu\n3C58\tan\n3C59\txiu\n3C5A\tcan\n3C5B\tchuan\n3C5C\tzha\n3C5E\tyi\n3C5F\tpi\n3C60\tku\n3C61\tsheng\n3C62\tlang\n3C63\ttui\n3C64\txi\n3C65\tling\n3C66\tqi\n3C67\two\n3C68\tlian\n3C69\tdu\n3C6A\tmen\n3C6B\tlan\n3C6C\twei\n3C6D\tduan\n3C6E\tkuai\n3C6F\tai\n3C70\tzai\n3C71\thui\n3C72\tyi\n3C73\tmo\n3C74\tzi\n3C75\tfen\n3C76\tpeng\n3C78\tbi\n3C79\tli\n3C7A\tlu\n3C7B\tluo\n3C7C\thai\n3C7D\tzhen\n3C7E\tgai\n3C7F\tque\n3C80\tzhen\n3C81\tkong\n3C82\tcheng\n3C83\tjiu\n3C84\tjue\n3C85\tji\n3C86\tling\n3C88\tshao\n3C89\tque\n3C8A\trui\n3C8B\tchuo\n3C8C\tneng\n3C8D\tzhi\n3C8E\tlou\n3C8F\tpao\n3C92\tbao\n3C93\trong\n3C94\txian\n3C95\tlei\n3C96\txiao\n3C97\tfu\n3C98\tqu\n3C9A\tsha\n3C9B\tzhi\n3C9C\ttan\n3C9D\trong\n3C9E\tsu\n3C9F\tying\n3CA0\tmao\n3CA1\tnai\n3CA2\tbian\n3CA4\tshuai\n3CA5\ttang\n3CA6\than\n3CA7\tsao\n3CA8\trong\n3CAA\tdeng\n3CAB\tpu\n3CAC\tjiao\n3CAD\ttan\n3CAF\tran\n3CB0\tning\n3CB1\tlie\n3CB2\tdie\n3CB3\tdie\n3CB4\tzhong\n3CB6\tlu\n3CB7\tdan\n3CB8\txi\n3CB9\tgui\n3CBA\tji\n3CBB\tni\n3CBC\tyi\n3CBD\tnian\n3CBE\tyu\n3CBF\twang\n3CC0\tguo\n3CC1\tze\n3CC2\tyan\n3CC3\tcui\n3CC4\txian\n3CC5\tjiao\n3CC6\ttou\n3CC7\tfu\n3CC8\tpei\n3CCA\tyou\n3CCB\tqiu\n3CCC\tya\n3CCD\tbu\n3CCE\tbian\n3CCF\tshi\n3CD0\tzha\n3CD1\tyi\n3CD2\tbian\n3CD4\tdui\n3CD5\tlan\n3CD6\tyi\n3CD7\tchai\n3CD8\tchong\n3CD9\txuan\n3CDA\txu\n3CDB\tyu\n3CDC\txiu\n3CE0\tta\n3CE1\tguo\n3CE5\tlong\n3CE6\txie\n3CE7\tche\n3CE8\tjian\n3CE9\ttan\n3CEA\tpi\n3CEB\tzan\n3CEC\txuan\n3CED\txian\n3CEE\tniao\n3CF4\tmi\n3CF5\tji\n3CF6\tnou\n3CF7\thu\n3CF8\thua\n3CF9\twang\n3CFA\tyou\n3CFB\tze\n3CFC\tbi\n3CFD\tmi\n3CFE\tqiang\n3CFF\txie\n3D00\tfan\n3D01\tyi\n3D02\ttan\n3D03\tlei\n3D04\tyong\n3D06\tjin\n3D07\tshe\n3D08\tyin\n3D09\tji\n3D0B\tsu\n3D0E\tnai\n3D0F\twang\n3D10\tmian\n3D11\tsu\n3D12\tyi\n3D13\tshai\n3D14\tji\n3D15\tji\n3D16\tluo\n3D17\tyou\n3D18\tmao\n3D19\tzha\n3D1A\tsui\n3D1B\tzhi\n3D1C\tbian\n3D1D\tli\n3D25\tqiao\n3D26\tguan\n3D27\txi\n3D28\tzhen\n3D29\tyong\n3D2A\tnie\n3D2B\tjun\n3D2C\txie\n3D2D\tyao\n3D2E\txie\n3D2F\tzhi\n3D30\tneng\n3D32\tsi\n3D33\tlong\n3D34\tchen\n3D35\tmi\n3D36\tque\n3D37\tdan\n3D38\tshan\n3D3C\tsu\n3D3D\txie\n3D3E\tbo\n3D3F\tding\n3D40\tzu\n3D42\tshu\n3D43\tshe\n3D44\than\n3D45\ttan\n3D46\tgao\n3D4A\tna\n3D4B\tmi\n3D4C\txun\n3D4D\tmen\n3D4E\tjian\n3D4F\tcui\n3D50\tjue\n3D51\the\n3D52\tfei\n3D53\tshi\n3D54\tche\n3D55\tshen\n3D56\tnu\n3D57\tping\n3D58\tman\n3D5D\tyi\n3D5E\tchou\n3D60\tku\n3D61\tbao\n3D62\tlei\n3D63\tke\n3D64\tsha\n3D65\tmi\n3D66\tsui\n3D67\tge\n3D68\tpi\n3D69\tyi\n3D6A\txian\n3D6B\tni\n3D6C\tying\n3D6D\tzhu\n3D6E\tchun\n3D6F\tfeng\n3D70\txu\n3D71\tpiao\n3D72\twu\n3D73\tliao\n3D74\tcang\n3D75\tzou\n3D76\tzuo\n3D77\tbian\n3D78\tyao\n3D79\thuan\n3D7A\tpai\n3D7B\txiu\n3D7D\tlei\n3D7E\tqing\n3D7F\txiao\n3D80\tjiao\n3D81\tguo\n3D84\tyan\n3D85\txue\n3D86\tzhu\n3D87\theng\n3D88\tying\n3D89\txi\n3D8C\tlian\n3D8D\txian\n3D8E\thuan\n3D8F\tyin\n3D91\tlian\n3D92\tshan\n3D93\tcang\n3D94\tbei\n3D95\tjian\n3D96\tshu\n3D97\tfan\n3D98\tdian\n3D9A\tba\n3D9B\tyu\n3D9E\tnang\n3D9F\tlei\n3DA0\tyi\n3DA1\tdai\n3DA3\tchan\n3DA4\tchao\n3DA5\tgan\n3DA6\tjin\n3DA7\tnen\n3DAB\tliao\n3DAC\tmo\n3DAD\tyou\n3DAF\tliu\n3DB0\than\n3DB2\tyong\n3DB3\tjin\n3DB4\tchi\n3DB5\tren\n3DB6\tnong\n3DB9\thong\n3DBA\ttian\n3DBC\tai\n3DBD\tgua\n3DBE\tbiao\n3DBF\tbo\n3DC0\tqiong\n3DC2\tshu\n3DC3\tchui\n3DC4\thui\n3DC5\tchao\n3DC6\tfu\n3DC7\thui\n3DC8\te\n3DC9\twei\n3DCA\tfen\n3DCB\ttan\n3DCD\tlun\n3DCE\the\n3DCF\tyong\n3DD0\thui\n3DD2\tyu\n3DD3\tzong\n3DD4\tyan\n3DD5\tqiu\n3DD6\tzhao\n3DD7\tjiong\n3DD8\ttai\n3DDF\ttui\n3DE0\tlin\n3DE1\tjiong\n3DE2\tzha\n3DE3\txing\n3DE4\thu\n3DE6\txu\n3DEA\tcui\n3DEB\tqing\n3DEC\tmo\n3DEE\tzao\n3DEF\tbeng\n3DF0\tchi\n3DF3\tyan\n3DF4\tge\n3DF5\tmo\n3DF6\tbei\n3DF7\tjuan\n3DF8\tdie\n3DF9\tzhao\n3DFB\twu\n3DFC\tyan\n3DFE\tjue\n3DFF\txian\n3E00\ttai\n3E01\than\n3E03\tdian\n3E04\tji\n3E05\tjie\n3E06\tkao\n3E07\tzuan\n3E09\txie\n3E0A\tlai\n3E0B\tfan\n3E0C\thuo\n3E0D\txi\n3E0E\tnie\n3E0F\tmi\n3E10\tran\n3E11\tcuan\n3E12\tyin\n3E13\tmi\n3E15\tjue\n3E16\tqu\n3E17\ttong\n3E18\twan\n3E19\tzhe\n3E1A\tli\n3E1B\tshao\n3E1C\tkong\n3E1D\txian\n3E1E\tzhe\n3E1F\tzhi\n3E20\ttiao\n3E21\tshu\n3E22\tbei\n3E23\tye\n3E24\tpian\n3E25\tchan\n3E26\thu\n3E27\tken\n3E28\tjiu\n3E29\tan\n3E2A\tchun\n3E2B\tqian\n3E2C\tbei\n3E2D\tba\n3E2E\tfen\n3E2F\tke\n3E30\ttuo\n3E31\ttuo\n3E32\tzuo\n3E33\tling\n3E35\tgui\n3E36\tyan\n3E37\tshi\n3E38\thou\n3E39\tlie\n3E3A\tsha\n3E3B\tsi\n3E3D\tbei\n3E3E\tren\n3E3F\tdu\n3E40\tbo\n3E41\tliang\n3E42\tqian\n3E43\tfei\n3E44\tji\n3E45\tzong\n3E46\thui\n3E47\the\n3E48\tli\n3E49\tyuan\n3E4A\tyue\n3E4B\txiu\n3E4C\tchan\n3E4D\tdi\n3E4E\tlei\n3E4F\tjin\n3E50\tchong\n3E51\tsi\n3E52\tpu\n3E53\tyao\n3E54\tjiang\n3E55\thuan\n3E56\thuan\n3E57\ttao\n3E58\tru\n3E59\tweng\n3E5A\tying\n3E5B\trao\n3E5C\tyin\n3E5D\tshi\n3E5E\tyin\n3E5F\tjue\n3E60\ttun\n3E61\txuan\n3E62\tjia\n3E63\tzhong\n3E64\tqie\n3E65\tzhu\n3E66\tdiao\n3E68\tyou\n3E6B\tyi\n3E6C\tshi\n3E6D\tyi\n3E6E\tmo\n3E71\tque\n3E72\txiao\n3E73\twu\n3E74\tgeng\n3E75\tying\n3E76\tting\n3E77\tshi\n3E78\tni\n3E79\tgeng\n3E7A\tta\n3E7B\two\n3E7C\tju\n3E7D\tchan\n3E7E\tpiao\n3E7F\tzhuo\n3E80\thu\n3E81\tnao\n3E82\tyan\n3E83\tgou\n3E84\tyu\n3E85\thou\n3E87\tsi\n3E88\tchi\n3E89\thu\n3E8A\tyang\n3E8B\tweng\n3E8C\txian\n3E8D\tpin\n3E8E\trong\n3E8F\tlou\n3E90\tlao\n3E91\tshan\n3E92\txiao\n3E93\tze\n3E94\thai\n3E95\tfan\n3E96\than\n3E97\tchan\n3E98\tzhan\n3E9A\tta\n3E9B\tzhu\n3E9C\tnong\n3E9D\than\n3E9E\tyu\n3E9F\tzhuo\n3EA0\tyou\n3EA1\tli\n3EA2\thuo\n3EA3\txi\n3EA4\txian\n3EA5\tchan\n3EA6\tlian\n3EA8\tsi\n3EA9\tjiu\n3EAA\tpu\n3EAB\tqiu\n3EAC\tgong\n3EAD\tzi\n3EAE\tyu\n3EB1\treng\n3EB2\tniu\n3EB3\tmei\n3EB4\tba\n3EB5\tjiu\n3EB7\txu\n3EB8\tping\n3EB9\tbian\n3EBA\tmao\n3EBF\tyi\n3EC0\tyu\n3EC2\tping\n3EC3\tqu\n3EC4\tbao\n3EC5\thui\n3EC9\tbu\n3ECA\tmang\n3ECB\tla\n3ECC\ttu\n3ECD\twu\n3ECE\tli\n3ECF\tling\n3ED1\tji\n3ED2\tjun\n3ED3\tzou\n3ED4\tduo\n3ED5\tjue\n3ED6\tdai\n3ED7\tbei\n3EDD\tla\n3EDE\tbin\n3EDF\tsui\n3EE0\ttu\n3EE1\txue\n3EE7\tduo\n3EEA\tsui\n3EEB\tbi\n3EEC\ttu\n3EED\tse\n3EEE\tcan\n3EEF\ttu\n3EF0\tmian\n3EF1\tjin\n3EF2\tlu\n3EF5\tzhan\n3EF6\tbi\n3EF7\tji\n3EF8\tzen\n3EF9\txuan\n3EFA\tli\n3EFD\tsui\n3EFE\tyong\n3EFF\tshu\n3F02\te\n3F06\tying\n3F07\tqiong\n3F08\tluo\n3F09\tzhen\n3F0A\ttun\n3F0B\tgu\n3F0C\tyu\n3F0D\tlei\n3F0E\tbo\n3F0F\tnei\n3F10\tpian\n3F11\tlian\n3F12\ttang\n3F13\tlian\n3F14\twen\n3F15\tdang\n3F16\tli\n3F17\tting\n3F18\twa\n3F19\tzhou\n3F1A\tgang\n3F1B\txing\n3F1C\tang\n3F1D\tfan\n3F1E\tpeng\n3F1F\tbo\n3F20\ttuo\n3F21\tshu\n3F22\tyi\n3F23\tbo\n3F24\tqie\n3F25\ttou\n3F26\tgong\n3F27\ttong\n3F28\than\n3F29\tcheng\n3F2A\tjie\n3F2B\thuan\n3F2C\txing\n3F2D\tdian\n3F2E\tchai\n3F2F\tdong\n3F30\tpi\n3F31\truan\n3F32\tlie\n3F33\tsheng\n3F34\tou\n3F35\tdi\n3F36\tyu\n3F37\tchuan\n3F38\trong\n3F39\tkang\n3F3A\ttang\n3F3B\tcong\n3F3C\tpiao\n3F3D\tchuang\n3F3E\tlu\n3F3F\ttong\n3F40\tzheng\n3F41\tli\n3F42\tsa\n3F43\tpan\n3F44\tsi\n3F46\tdang\n3F47\thu\n3F48\tyi\n3F49\txian\n3F4A\txie\n3F4B\tluo\n3F4C\tliu\n3F4E\ttan\n3F4F\tgan\n3F51\ttan\n3F55\tyou\n3F56\tnan\n3F58\tgang\n3F59\tjun\n3F5A\tchi\n3F5B\tgou\n3F5C\twan\n3F5D\tli\n3F5E\tliu\n3F5F\tlie\n3F60\txia\n3F61\tbei\n3F62\tan\n3F63\tyu\n3F64\tju\n3F65\trou\n3F66\txun\n3F67\tzi\n3F68\tcuo\n3F69\tcan\n3F6A\tzeng\n3F6B\tyong\n3F6C\tfu\n3F6D\truan\n3F6F\txi\n3F70\tshu\n3F71\tjiao\n3F72\tjiao\n3F73\txu\n3F74\tzhang\n3F77\tshui\n3F78\tchen\n3F79\tfan\n3F7A\tji\n3F7B\tzhi\n3F7D\tgu\n3F7E\twu\n3F80\tqie\n3F81\tshu\n3F82\thai\n3F83\ttuo\n3F84\tdu\n3F85\tzi\n3F86\tran\n3F87\tmu\n3F88\tfu\n3F89\tling\n3F8A\tji\n3F8B\txiu\n3F8C\txuan\n3F8D\tnai\n3F8E\tya\n3F8F\tjie\n3F90\tli\n3F91\tda\n3F92\tru\n3F93\tyuan\n3F94\tlu\n3F95\tshen\n3F96\tli\n3F97\tliang\n3F98\tgeng\n3F99\txin\n3F9A\txie\n3F9B\tqin\n3F9C\tqie\n3F9D\tche\n3F9E\tyou\n3F9F\tbu\n3FA0\tkuang\n3FA1\tque\n3FA2\tai\n3FA3\tqin\n3FA4\tqiang\n3FA5\tchu\n3FA6\tpei\n3FA7\tkuo\n3FA8\tyi\n3FA9\tguai\n3FAA\tsheng\n3FAB\tpian\n3FAD\tzhou\n3FAE\thuang\n3FAF\thui\n3FB0\thu\n3FB1\tbei\n3FB4\tzha\n3FB5\tji\n3FB6\tgu\n3FB7\txi\n3FB8\tgao\n3FB9\tchai\n3FBA\tma\n3FBB\tzhu\n3FBC\ttui\n3FBD\tzhui\n3FBE\txian\n3FBF\tlang\n3FC3\tzhi\n3FC4\tai\n3FC5\txian\n3FC6\tguo\n3FC7\txi\n3FC9\ttui\n3FCA\tcan\n3FCB\tsao\n3FCC\txian\n3FCD\tjie\n3FCE\tfen\n3FCF\tqun\n3FD1\tyao\n3FD2\tdao\n3FD3\tjia\n3FD4\tlei\n3FD5\tyan\n3FD6\tlu\n3FD7\ttui\n3FD8\tying\n3FD9\tpi\n3FDA\tluo\n3FDB\tli\n3FDC\tbie\n3FDE\tmao\n3FDF\tbai\n3FE0\thuang\n3FE2\tyao\n3FE3\the\n3FE4\tchun\n3FE5\the\n3FE6\tning\n3FE7\tchou\n3FE8\tli\n3FE9\ttang\n3FEA\thuan\n3FEB\tbi\n3FEC\tba\n3FED\tche\n3FEE\tyang\n3FEF\tda\n3FF0\tao\n3FF1\txue\n3FF3\tzi\n3FF4\tda\n3FF5\tran\n3FF6\tbang\n3FF7\tcuo\n3FF8\twan\n3FF9\tta\n3FFA\tbao\n3FFB\tgan\n3FFC\tyan\n3FFD\txi\n3FFE\tzhu\n3FFF\tya\n4000\tfan\n4001\tyou\n4002\tan\n4003\ttui\n4004\tmeng\n4005\tshe\n4006\tjin\n4007\tgu\n4008\tji\n4009\tqiao\n400A\tjiao\n400B\tyan\n400C\txi\n400D\tkan\n400E\tmian\n400F\txuan\n4010\tshan\n4011\two\n4012\tqian\n4013\thuan\n4014\tren\n4015\tzhen\n4016\ttian\n4017\tjue\n4018\txie\n4019\tqi\n401A\tang\n401B\tmei\n401C\tgu\n401E\ttao\n401F\tfan\n4020\tju\n4021\tchan\n4022\tshun\n4023\tbi\n4024\tmao\n4025\tshuo\n4026\tgu\n4027\thong\n4028\thua\n4029\tluo\n402A\thang\n402B\tjia\n402C\tquan\n402D\tgai\n402E\thuang\n402F\tbu\n4030\tgu\n4031\tfeng\n4032\tmu\n4033\tai\n4034\tying\n4035\tshun\n4036\tliang\n4037\tjie\n4038\tchi\n4039\tjie\n403A\tchou\n403B\tping\n403C\tchen\n403D\tyan\n403E\tdu\n403F\tdi\n4041\tliang\n4042\txian\n4043\tbiao\n4044\txing\n4045\tmeng\n4046\tye\n4047\tmi\n4048\tqi\n4049\tqi\n404A\two\n404B\txie\n404C\tyu\n404D\tqia\n404E\tcheng\n404F\tyao\n4050\tying\n4051\tyang\n4052\tji\n4053\tzong\n4054\txuan\n4055\tmin\n4056\tlou\n4057\tkai\n4058\tyao\n4059\tyan\n405A\tsun\n405B\tgui\n405C\thuang\n405D\tying\n405E\tsheng\n405F\tcha\n4060\tlian\n4062\txuan\n4063\tchuan\n4064\tche\n4065\tni\n4066\tqu\n4067\tmiao\n4068\thuo\n4069\tyu\n406A\tzhan\n406B\thu\n406C\tceng\n406D\tbiao\n406E\tqian\n406F\txi\n4070\tjiang\n4071\tkou\n4072\tmai\n4073\tmang\n4074\tzhan\n4075\tbian\n4076\tji\n4077\tjue\n4078\tnang\n4079\tbi\n407A\tshi\n407B\tshuo\n407C\tmo\n407D\tlie\n407E\tmie\n407F\tmo\n4080\txi\n4081\tchan\n4082\tqu\n4083\tjiao\n4084\thuo\n4085\txian\n4086\txu\n4087\tniu\n4088\ttong\n4089\thou\n408A\tyu\n408C\tchong\n408D\tbo\n408E\tzuan\n408F\tdiao\n4090\tzhuo\n4091\tji\n4092\tqia\n4094\txing\n4095\thui\n4096\tshi\n4097\tku\n4099\tdui\n409A\tyao\n409B\tyu\n409C\tbang\n409D\tjie\n409E\tzhe\n409F\tjia\n40A0\tshi\n40A1\tdi\n40A2\tdong\n40A3\tci\n40A4\tfu\n40A5\tmin\n40A6\tzhen\n40A7\tzhen\n40A9\tyan\n40AA\tqiao\n40AB\thang\n40AC\tgong\n40AD\tqiao\n40AE\tlue\n40AF\tguai\n40B0\tla\n40B1\trui\n40B2\tfa\n40B3\tcuo\n40B4\tyan\n40B5\tgong\n40B6\tjie\n40B7\tguai\n40B8\tguo\n40B9\tsuo\n40BA\two\n40BB\tzheng\n40BC\tnie\n40BD\tdiao\n40BE\tlai\n40BF\tta\n40C0\tcui\n40C1\tya\n40C2\tgun\n40C5\tdi\n40C7\tmian\n40C8\tjie\n40C9\tmin\n40CA\tju\n40CB\tyu\n40CC\tzhen\n40CD\tzhao\n40CE\tzha\n40CF\txing\n40D1\tban\n40D2\the\n40D3\tgou\n40D4\thong\n40D5\tlao\n40D6\twu\n40D7\tbo\n40D8\tkeng\n40D9\tlu\n40DA\tcu\n40DB\tlian\n40DC\tyi\n40DD\tqiao\n40DE\tshu\n40E0\txuan\n40E1\tjin\n40E2\tqin\n40E3\thui\n40E4\tsu\n40E5\tchuang\n40E6\tdun\n40E7\tlong\n40E9\tnao\n40EA\ttan\n40EB\tdan\n40EC\twei\n40ED\tgan\n40EE\tda\n40EF\tli\n40F0\tca\n40F1\txian\n40F2\tpan\n40F3\tla\n40F4\tzhu\n40F5\tniao\n40F6\thuai\n40F7\tying\n40F8\txian\n40F9\tlan\n40FA\tmo\n40FB\tba\n40FD\tgui\n40FE\tbi\n40FF\tfu\n4100\thuo\n4101\tyi\n4102\tliu\n4103\tyang\n4104\tyin\n4105\tjuan\n4106\thuo\n4107\tcheng\n4108\tdou\n4109\te\n410B\tyan\n410C\tzhui\n410D\tzha\n410E\tqi\n410F\tyu\n4110\tquan\n4111\thuo\n4112\tnie\n4113\thuang\n4114\tju\n4115\tshe\n4118\tpeng\n4119\tming\n411A\tcao\n411B\tlou\n411C\tli\n411D\tchuang\n411F\tcui\n4120\tshan\n4121\tdan\n4122\tqi\n4124\tlai\n4125\tling\n4126\tliao\n4127\treng\n4128\tyu\n4129\tyi\n412A\tdiao\n412B\tqi\n412C\tyi\n412D\tnian\n412E\tfu\n412F\tjian\n4130\tya\n4131\tfang\n4132\trui\n4133\txian\n4136\tbi\n4137\tshi\n4138\tpo\n4139\tnian\n413A\tzhi\n413B\ttao\n413C\ttian\n413D\ttian\n413E\tru\n413F\tyi\n4140\tlie\n4141\tan\n4142\the\n4143\tqiong\n4144\tli\n4145\tgui\n4146\tzi\n4147\tsu\n4148\tyuan\n4149\tya\n414A\tcha\n414B\twan\n414C\tjuan\n414D\tting\n414E\tyou\n414F\thui\n4150\tjian\n4151\trui\n4152\tmang\n4153\tju\n4154\tzi\n4155\tju\n4156\tan\n4157\tsui\n4158\tlai\n4159\thun\n415A\tquan\n415B\tchang\n415C\tduo\n415D\tkong\n415E\tne\n415F\tcan\n4160\tti\n4161\txu\n4162\tjiu\n4163\thuang\n4164\tqi\n4165\tjie\n4166\tmao\n4167\tyan\n4169\tzhi\n416A\ttui\n416C\tai\n416D\tpang\n416E\tcang\n416F\ttang\n4170\ten\n4171\thun\n4172\tqi\n4173\tchu\n4174\tsuo\n4175\tzhuo\n4176\tnou\n4177\ttu\n4178\tshen\n4179\tlou\n417A\tbiao\n417B\tli\n417C\tman\n417D\txin\n417E\tcen\n417F\thuang\n4180\tmei\n4181\tgao\n4182\tlian\n4183\tdao\n4184\tzhan\n4185\tzi\n4188\tzhi\n4189\tba\n418A\tcui\n418B\tqiu\n418D\tlong\n418E\txian\n418F\tfei\n4190\tguo\n4191\tcheng\n4192\tjiu\n4193\te\n4194\tchong\n4195\tyue\n4196\thong\n4197\tyao\n4198\tya\n4199\tyao\n419A\ttong\n419B\tzha\n419C\tyou\n419D\txue\n419E\tyao\n419F\tke\n41A0\thuan\n41A1\tlang\n41A2\tyue\n41A3\tchen\n41A6\tshen\n41A8\tning\n41A9\tming\n41AA\thong\n41AB\tchuang\n41AC\tyun\n41AD\txuan\n41AE\tjin\n41AF\tzhuo\n41B0\tyu\n41B1\ttan\n41B2\tkang\n41B3\tqiong\n41B5\tcheng\n41B6\tjiu\n41B7\txue\n41B8\tzheng\n41B9\tchong\n41BA\tpan\n41BB\tqiao\n41BD\tqu\n41BE\tlan\n41BF\tyi\n41C0\trong\n41C1\tsi\n41C2\tqian\n41C3\tsi\n41C5\tfa\n41C7\tmeng\n41C8\thua\n41CB\thai\n41CC\tqiao\n41CD\tchu\n41CE\tque\n41CF\tdui\n41D0\tli\n41D1\tba\n41D2\tjie\n41D3\txu\n41D4\tluo\n41D6\tyun\n41D7\tzhong\n41D8\thu\n41D9\tyin\n41DA\tpo\n41DB\tzhi\n41DC\tqian\n41DE\tgan\n41DF\tjian\n41E0\tzhu\n41E1\tzhu\n41E2\tku\n41E3\tnie\n41E4\trui\n41E5\tze\n41E6\tang\n41E7\tzhi\n41E8\tgong\n41E9\tyi\n41EA\tchi\n41EB\tji\n41EC\tzhu\n41ED\tlao\n41EE\tren\n41EF\trong\n41F0\tzheng\n41F1\tna\n41F2\tce\n41F5\tyi\n41F6\tjue\n41F7\tbie\n41F8\tcheng\n41F9\tjun\n41FA\tdou\n41FB\twei\n41FC\tyi\n41FD\tzhe\n41FE\tyan\n4200\tsan\n4201\tlun\n4202\tping\n4203\tzhao\n4204\than\n4205\tyu\n4206\tdai\n4207\tzhao\n4208\tfei\n4209\tsha\n420A\tling\n420B\tta\n420C\tqu\n420D\tmang\n420E\tye\n420F\tbao\n4210\tgui\n4211\tgua\n4212\tnan\n4213\tge\n4215\tshi\n4216\tke\n4217\tsuo\n4218\tci\n4219\tzhou\n421A\ttai\n421B\tkuai\n421C\tqin\n421D\txu\n421E\tdu\n421F\tce\n4220\thuan\n4221\tcong\n4222\tsai\n4223\tzheng\n4224\tqian\n4225\tjin\n4226\tzong\n4227\twei\n422A\txi\n422B\tna\n422C\tpu\n422D\tsou\n422E\tju\n422F\tzhen\n4230\tshao\n4231\ttao\n4232\tban\n4233\tta\n4234\tqian\n4235\tweng\n4236\trong\n4237\tluo\n4238\thu\n4239\tsou\n423A\tzhong\n423B\tpu\n423C\tmie\n423D\tjin\n423E\tshao\n423F\tmi\n4240\tshu\n4241\tling\n4242\tlei\n4243\tjiang\n4244\tleng\n4245\tzhi\n4246\tdiao\n4248\tsan\n4249\tgu\n424A\tfan\n424B\tmei\n424C\tsui\n424D\tjian\n424E\ttang\n424F\txie\n4250\tku\n4251\twu\n4252\tfan\n4253\tluo\n4254\tcan\n4255\tceng\n4256\tling\n4257\tyi\n4258\tcong\n4259\tyun\n425A\tmeng\n425B\tyu\n425C\tzhi\n425D\tyi\n425E\tdan\n425F\thuo\n4260\twei\n4261\ttan\n4262\tse\n4263\txie\n4264\tsou\n4265\tsong\n4266\tqian\n4267\tliu\n4268\tyi\n426A\tlei\n426B\tli\n426C\tfei\n426D\tlie\n426E\tlin\n426F\txian\n4270\txiao\n4271\tou\n4272\tmi\n4273\txian\n4274\trang\n4275\tzhuan\n4276\tshuang\n4277\tyan\n4278\tbian\n4279\tling\n427A\thong\n427B\tqi\n427C\tliao\n427D\tban\n427E\tbi\n427F\thu\n4280\thu\n4282\tce\n4283\tpei\n4284\tqiong\n4285\tming\n4286\tjiu\n4287\tbu\n4288\tmei\n4289\tsan\n428A\twei\n428D\tli\n428E\tquan\n4290\thun\n4291\txiang\n4293\tshi\n4294\tying\n4296\tnan\n4297\thuang\n4298\tjiu\n4299\tyan\n429B\tsa\n429C\ttuan\n429D\txie\n429E\tzhe\n429F\tmen\n42A0\txi\n42A1\tman\n42A3\thuang\n42A4\ttan\n42A5\txiao\n42A6\tye\n42A7\tbi\n42A8\tluo\n42A9\tfan\n42AA\tli\n42AB\tcui\n42AC\tchua\n42AD\tdao\n42AE\tdi\n42AF\tkuang\n42B0\tchu\n42B1\txian\n42B2\tchan\n42B3\tmi\n42B4\tqian\n42B5\tqiu\n42B6\tzhen\n42BA\thu\n42BB\tgan\n42BC\tchi\n42BD\tguai\n42BE\tmu\n42BF\tbo\n42C0\thua\n42C1\tgeng\n42C2\tyao\n42C3\tmao\n42C4\twang\n42C8\tru\n42C9\txue\n42CA\tzheng\n42CB\tmin\n42CC\tjiang\n42CE\tzhan\n42CF\tzuo\n42D0\tyue\n42D1\tlie\n42D3\tzhou\n42D4\tbi\n42D5\tren\n42D6\tyu\n42D8\tchuo\n42D9\ter\n42DA\tyi\n42DB\tmi\n42DC\tqing\n42DE\twang\n42DF\tji\n42E0\tbu\n42E2\tbie\n42E3\tfan\n42E4\tyue\n42E5\tli\n42E6\tfan\n42E7\tqu\n42E8\tfu\n42E9\ter\n42EA\te\n42EB\tzheng\n42EC\ttian\n42ED\tyu\n42EE\tjin\n42EF\tqi\n42F0\tju\n42F1\tlai\n42F2\tche\n42F3\tbei\n42F4\tniu\n42F5\tyi\n42F6\txu\n42F7\tmou\n42F8\txun\n42F9\tfu\n42FB\tnin\n42FC\tting\n42FD\tbeng\n42FE\tzha\n42FF\twei\n4300\tke\n4301\tyao\n4302\tou\n4303\txiao\n4304\tgeng\n4305\ttang\n4306\tgui\n4307\thui\n4308\tta\n430A\tyao\n430B\tda\n430C\tqi\n430D\tjin\n430E\tlue\n430F\tmi\n4310\tmi\n4311\tjian\n4312\tlu\n4313\tfan\n4314\tou\n4315\tmi\n4316\tjie\n4317\tfu\n4318\tbie\n4319\thuang\n431A\tsu\n431B\tyao\n431C\tnie\n431D\tjin\n431E\tlian\n431F\tbo\n4320\tjian\n4321\tti\n4322\tling\n4323\tzuan\n4324\tshi\n4325\tyin\n4326\tdao\n4327\tchou\n4328\tca\n4329\tmie\n432A\tyan\n432B\tlan\n432C\tchong\n432D\tjiao\n432E\tshuang\n432F\tquan\n4330\tnie\n4331\tluo\n4333\tshi\n4334\tluo\n4335\tzhu\n4337\tchou\n4338\tjuan\n4339\tjiong\n433A\ter\n433B\tyi\n433C\trui\n433D\tcai\n433E\tren\n433F\tfu\n4340\tlan\n4341\tsui\n4342\tyu\n4343\tyou\n4344\tdian\n4345\tling\n4346\tzhu\n4347\tta\n4348\tping\n4349\tzhai\n434A\tjiao\n434B\tchui\n434C\tbu\n434D\tkou\n434E\tcun\n4350\than\n4351\than\n4352\tmou\n4353\thu\n4354\tgong\n4355\tdi\n4356\tfu\n4357\txuan\n4358\tmi\n4359\tmei\n435A\tlang\n435B\tgu\n435C\tzhao\n435D\tta\n435E\tyu\n435F\tzong\n4360\tli\n4361\tlu\n4362\twu\n4363\tlei\n4364\tji\n4365\tli\n4366\tli\n4368\tpo\n4369\tyang\n436A\twa\n436B\ttuo\n436C\tpeng\n436E\tzhao\n436F\tgui\n4371\txu\n4372\tnai\n4373\tque\n4374\twei\n4375\tzheng\n4376\tdong\n4377\twei\n4378\tbo\n437A\thuan\n437B\txuan\n437C\tzan\n437D\tli\n437E\tyan\n437F\thuang\n4380\txue\n4381\thu\n4382\tbao\n4383\tran\n4384\txiao\n4385\tpo\n4386\tliao\n4387\tzhou\n4388\tyi\n4389\txu\n438A\tluo\n438B\tkao\n438C\tchu\n438E\tna\n438F\than\n4390\tchao\n4391\tlu\n4392\tzhan\n4393\tta\n4394\tfu\n4395\thong\n4396\tzeng\n4397\tqiao\n4398\tsu\n4399\tpin\n439A\tguan\n439C\thun\n439D\tchu\n439F\ter\n43A0\ter\n43A1\truan\n43A2\tqi\n43A3\tsi\n43A4\tju\n43A6\tyan\n43A7\tbang\n43A8\tye\n43A9\tzi\n43AA\tne\n43AB\tchuang\n43AC\tba\n43AD\tcao\n43AE\tti\n43AF\than\n43B0\tzuo\n43B1\tba\n43B2\tzhe\n43B3\twa\n43B4\tgeng\n43B5\tbi\n43B6\ter\n43B7\tzhu\n43B8\twu\n43B9\twen\n43BA\tzhi\n43BB\tzhou\n43BC\tlu\n43BD\twen\n43BE\tgun\n43BF\tqiu\n43C0\tla\n43C1\tzai\n43C2\tsou\n43C3\tmian\n43C4\tdi\n43C5\tqi\n43C6\tcao\n43C7\tpiao\n43C8\tlian\n43C9\tshi\n43CA\tlong\n43CB\tsu\n43CC\tqi\n43CD\tyuan\n43CE\tfeng\n43CF\txu\n43D0\tjue\n43D1\tdi\n43D2\tpian\n43D3\tguan\n43D4\tniu\n43D5\tren\n43D6\tzhen\n43D7\tgai\n43D8\tpi\n43D9\ttan\n43DA\tchao\n43DB\tchun\n43DC\the\n43DD\tzhuan\n43DE\tmo\n43DF\tbie\n43E0\tqi\n43E1\tshi\n43E2\tbi\n43E3\tjue\n43E4\tsi\n43E6\tgua\n43E7\tna\n43E8\thui\n43E9\txi\n43EA\ter\n43EB\txiu\n43EC\tmou\n43EE\txi\n43EF\tzhi\n43F0\trun\n43F1\tju\n43F2\tti\n43F3\tzhe\n43F4\tshao\n43F5\tmeng\n43F6\tbi\n43F7\than\n43F8\tyu\n43F9\txian\n43FA\tpang\n43FB\tneng\n43FC\tcan\n43FD\tbu\n43FF\tqi\n4400\tji\n4401\tzhuo\n4402\tlu\n4403\tjun\n4404\txian\n4405\txi\n4406\tcai\n4407\twen\n4408\tzhi\n4409\tzi\n440A\tkun\n440B\tcong\n440C\ttian\n440D\tchu\n440E\tdi\n440F\tchun\n4410\tqiu\n4411\tzhe\n4412\tzha\n4413\trou\n4414\tbin\n4415\tji\n4416\txi\n4417\tzhu\n4418\tjue\n4419\tge\n441A\tji\n441B\tda\n441C\tchen\n441D\tsuo\n441E\truo\n441F\txiang\n4420\thuang\n4421\tqi\n4422\tzhu\n4423\tsun\n4424\tchai\n4425\tweng\n4426\tke\n4427\tkao\n4428\tgu\n4429\tgai\n442A\tfan\n442B\tcong\n442C\tcao\n442D\tzhi\n442E\tchan\n442F\tlei\n4430\txiu\n4431\tzhai\n4432\tzhe\n4433\tyu\n4434\tgui\n4435\tgong\n4436\tzan\n4437\tdan\n4438\thuo\n4439\tsou\n443A\ttan\n443B\tgu\n443C\txi\n443D\tman\n443E\tduo\n443F\tao\n4440\tpi\n4441\twu\n4442\tai\n4443\tmeng\n4444\tpi\n4445\tmeng\n4446\tyang\n4447\tzhi\n4448\tbo\n4449\tying\n444A\twei\n444B\trang\n444C\tlan\n444D\tyan\n444E\tchan\n444F\tquan\n4450\tzhen\n4451\tpu\n4453\ttai\n4454\tfei\n4455\tshu\n4457\tdang\n4458\tcuo\n4459\ttan\n445A\ttian\n445B\tchi\n445C\tta\n445D\tjia\n445E\tshun\n445F\thuang\n4460\tliao\n4463\tchen\n4464\tjin\n4465\te\n4466\tgou\n4467\tfu\n4468\tduo\n446A\te\n446B\tbeng\n446C\ttao\n446D\tdi\n446F\tdi\n4470\tbu\n4471\twan\n4472\tzhao\n4473\tlun\n4474\tqi\n4475\tmu\n4476\tqian\n4478\tzong\n4479\tsou\n447B\tyou\n447C\tzhou\n447D\tta\n447F\tsu\n4480\tbu\n4481\txi\n4482\tjiang\n4483\tcao\n4484\tfu\n4485\tteng\n4486\tche\n4487\tfu\n4488\tfei\n4489\twu\n448A\txi\n448B\tyang\n448C\tming\n448D\tpang\n448E\tmang\n448F\tseng\n4490\tmeng\n4491\tcao\n4492\ttiao\n4493\tkai\n4494\tbai\n4495\txiao\n4496\txin\n4497\tqi\n449A\tshao\n449B\thuan\n449C\tniu\n449D\txiao\n449E\tchen\n449F\tdan\n44A0\tfeng\n44A1\tyin\n44A2\tang\n44A3\tran\n44A4\tri\n44A5\tman\n44A6\tfan\n44A7\tqu\n44A8\tshi\n44A9\the\n44AA\tbian\n44AB\tdai\n44AC\tmo\n44AD\tdeng\n44B0\tkuang\n44B2\tcha\n44B3\tduo\n44B4\tyou\n44B5\thao\n44B7\tgua\n44B8\txue\n44B9\tlei\n44BA\tjin\n44BB\tqi\n44BC\tqu\n44BD\twang\n44BE\tyi\n44BF\tliao\n44C2\tyan\n44C3\tyi\n44C4\tyin\n44C5\tqi\n44C6\tzhe\n44C7\txi\n44C8\tyi\n44C9\tye\n44CA\twu\n44CB\tzhi\n44CC\tzhi\n44CD\than\n44CE\tchuo\n44CF\tfu\n44D0\tchun\n44D1\tping\n44D2\tkuai\n44D3\tchou\n44D5\ttuo\n44D6\tqiong\n44D7\tcong\n44D8\tgao\n44D9\tkua\n44DA\tqu\n44DB\tqu\n44DC\tzhi\n44DD\tmeng\n44DE\tli\n44DF\tzhou\n44E0\tta\n44E1\tzhi\n44E2\tgu\n44E3\tliang\n44E4\thu\n44E5\tla\n44E6\tdian\n44E7\tci\n44E8\tying\n44EB\tqi\n44EC\tzhuo\n44ED\tcha\n44EE\tmao\n44EF\tdu\n44F0\tyin\n44F1\tchai\n44F2\trui\n44F3\then\n44F4\truan\n44F5\tfu\n44F6\tlai\n44F7\txing\n44F8\tjian\n44F9\tyi\n44FA\tmei\n44FC\tmang\n44FD\tji\n44FE\tsuo\n44FF\than\n4501\tli\n4502\tzi\n4503\tzu\n4504\tyao\n4505\tge\n4506\tli\n4507\tqi\n4508\tgong\n4509\tli\n450A\tbing\n450B\tsuo\n450E\tsu\n450F\tchou\n4510\tjian\n4511\txie\n4512\tbei\n4513\txu\n4514\tjing\n4515\tpu\n4516\tling\n4517\txiang\n4518\tzuo\n4519\tdiao\n451A\tchun\n451B\tqing\n451C\tnan\n451D\tzhai\n451E\tlu\n451F\tyi\n4520\tshao\n4521\tyu\n4522\thua\n4523\tli\n4524\tpa\n4527\tli\n452A\tshuang\n452C\tyi\n452D\tning\n452E\tsi\n452F\tku\n4530\tfu\n4531\tyi\n4532\tdeng\n4533\tran\n4534\tce\n4536\tti\n4537\tqin\n4538\tbiao\n4539\tsui\n453A\twei\n453B\tdun\n453C\tse\n453D\tai\n453E\tqi\n453F\tzun\n4540\tkuan\n4541\tfei\n4543\tyin\n4545\tsao\n4546\tdou\n4547\thui\n4548\txie\n4549\tze\n454A\ttan\n454B\ttang\n454C\tzhi\n454D\tyi\n454E\tfu\n454F\te\n4551\tjun\n4552\tjia\n4553\tcha\n4554\txian\n4555\tman\n4557\tbi\n4558\tling\n4559\tjie\n455A\tkui\n455B\tjia\n455D\tcheng\n455E\tlang\n455F\txing\n4560\tfei\n4561\tlu\n4562\tzha\n4563\the\n4564\tji\n4565\tni\n4566\tying\n4567\txiao\n4568\tteng\n4569\tlao\n456A\tze\n456B\tkui\n456D\tqian\n456E\tju\n456F\tpiao\n4570\tfan\n4571\ttou\n4572\tlin\n4573\tmi\n4574\tzhuo\n4575\txie\n4576\thu\n4577\tmi\n4578\tjie\n4579\tza\n457A\tcong\n457B\tli\n457C\tran\n457D\tzhu\n457E\tyin\n457F\than\n4581\tyi\n4582\tluan\n4583\tyue\n4584\tran\n4585\tling\n4586\tniang\n4587\tyu\n4588\tnue\n458A\tyi\n458B\tnue\n458C\tyi\n458D\tqian\n458E\txia\n458F\tchu\n4590\tyin\n4591\tmi\n4592\txi\n4593\tna\n4594\tkan\n4595\tzu\n4596\txia\n4597\tyan\n4598\ttu\n4599\tti\n459A\twu\n459B\tsuo\n459C\tyin\n459D\tchong\n459E\tzhou\n459F\tmang\n45A0\tyuan\n45A1\tnu\n45A2\tmiao\n45A3\tzao\n45A4\twan\n45A5\tli\n45A6\tqu\n45A7\tna\n45A8\tshi\n45A9\tbi\n45AA\tzi\n45AB\tbang\n45AD\tjuan\n45AE\txiang\n45AF\tkui\n45B0\tpai\n45B1\tkuang\n45B2\txun\n45B3\tzha\n45B4\tyao\n45B5\tkun\n45B6\thui\n45B7\txi\n45B8\te\n45B9\tyang\n45BA\ttiao\n45BB\tyou\n45BC\tjue\n45BD\tli\n45BF\tli\n45C0\tcheng\n45C1\tji\n45C2\thu\n45C3\tzhan\n45C4\tfu\n45C5\tchang\n45C6\tguan\n45C7\tju\n45C8\tmeng\n45C9\tchang\n45CA\ttan\n45CB\tmou\n45CC\txing\n45CD\tli\n45CE\tyan\n45CF\tsou\n45D0\tshi\n45D1\tyi\n45D2\tbing\n45D3\tcong\n45D4\thou\n45D5\twan\n45D6\tdi\n45D7\tji\n45D8\tge\n45D9\than\n45DA\tbo\n45DB\txiu\n45DC\tliu\n45DD\tcan\n45DE\tcan\n45DF\tyi\n45E0\txuan\n45E1\tyan\n45E2\tzao\n45E3\than\n45E4\tyong\n45E5\tzong\n45E7\tkang\n45E8\tyu\n45E9\tqi\n45EA\tzhe\n45EB\tma\n45EE\tshuang\n45EF\tjin\n45F0\tguan\n45F1\tpu\n45F2\tlin\n45F4\tting\n45F5\tjiang\n45F6\tla\n45F7\tyi\n45F8\tyong\n45F9\tci\n45FA\tyan\n45FB\tjie\n45FC\txun\n45FD\twei\n45FE\txian\n45FF\tning\n4600\tfu\n4601\tge\n4603\tmo\n4604\tzhu\n4605\tnai\n4606\txian\n4607\twen\n4608\tli\n4609\tcan\n460A\tmie\n460B\tjian\n460C\tni\n460D\tchai\n460E\twan\n460F\txu\n4610\tnu\n4611\tmai\n4612\tzui\n4613\tkan\n4614\tka\n4615\thang\n4618\tyu\n4619\twei\n461A\tzhu\n461D\tyi\n461F\tdiao\n4620\tfu\n4621\tbi\n4622\tzhu\n4623\tzi\n4624\tshu\n4625\txia\n4626\tni\n4628\tjiao\n4629\txun\n462A\tchong\n462B\tnou\n462C\trong\n462D\tzhi\n462E\tsang\n4630\tshan\n4631\tyu\n4633\tjin\n4635\tlu\n4636\than\n4637\tbie\n4638\tyi\n4639\tzui\n463A\tzhan\n463B\tyu\n463C\twan\n463D\tni\n463E\tguan\n463F\tjue\n4640\tbeng\n4641\tcan\n4643\tduo\n4644\tqi\n4645\tyao\n4646\tkui\n4647\truan\n4648\thou\n4649\txun\n464A\txie\n464C\tkui\n464E\txie\n464F\tbo\n4650\tke\n4651\tcui\n4652\txu\n4653\tbai\n4654\tou\n4655\tzong\n4657\tti\n4658\tchu\n4659\tchi\n465A\tniao\n465B\tguan\n465C\tfeng\n465D\txie\n465E\tdeng\n465F\twei\n4660\tjue\n4661\tkui\n4662\tzeng\n4663\tsa\n4664\tduo\n4665\tling\n4666\tmeng\n4668\tguo\n4669\tmeng\n466A\tlong\n466C\tying\n466E\tguan\n466F\tcu\n4670\tli\n4671\tdu\n4673\tbiao\n4674\tqian\n4675\txi\n4677\tde\n4678\tde\n4679\txian\n467A\tlian\n467C\tshao\n467D\txie\n467E\tshi\n467F\twei\n4682\the\n4683\tyou\n4684\tlu\n4685\tlai\n4686\tying\n4687\tsheng\n4688\tjuan\n4689\tqi\n468A\tjian\n468B\tyun\n468D\tqi\n468F\tlin\n4690\tji\n4691\tmai\n4692\tchuang\n4693\tnian\n4694\tbin\n4695\tli\n4696\tling\n4697\tgang\n4698\tcheng\n4699\txuan\n469A\txian\n469B\thu\n469C\tbi\n469D\tzu\n469E\tdai\n469F\tdai\n46A0\thun\n46A1\tsai\n46A2\tche\n46A3\tti\n46A5\tnuo\n46A6\tzhi\n46A7\tliu\n46A8\tfei\n46A9\tjiao\n46AA\tguan\n46AB\txi\n46AC\tlin\n46AD\txuan\n46AE\treng\n46AF\ttao\n46B0\tpi\n46B1\txin\n46B2\tshan\n46B3\tzhi\n46B4\twa\n46B5\ttou\n46B6\ttian\n46B7\tyi\n46B8\txie\n46B9\tpi\n46BA\tyao\n46BB\tyao\n46BC\tnu\n46BD\thao\n46BE\tnin\n46BF\tyin\n46C0\tfan\n46C1\tnan\n46C2\tyao\n46C3\twan\n46C4\tyuan\n46C5\txia\n46C6\tzhou\n46C7\tyuan\n46C8\tshi\n46C9\tmian\n46CA\txi\n46CB\tji\n46CC\ttao\n46CD\tfei\n46CE\txue\n46CF\tni\n46D0\tci\n46D1\tmi\n46D2\tbian\n46D3\tjian\n46D4\tna\n46D5\tyu\n46D6\te\n46D7\tzhi\n46D8\tren\n46D9\txu\n46DA\tlue\n46DB\thui\n46DC\txun\n46DD\tnao\n46DE\than\n46DF\tjia\n46E0\tdou\n46E1\thua\n46E2\ttu\n46E3\tping\n46E4\tcu\n46E5\txi\n46E6\tsong\n46E7\tmi\n46E8\txin\n46E9\twu\n46EA\tqiong\n46EB\tzhang\n46EC\ttao\n46ED\txing\n46EE\tjiu\n46EF\tju\n46F0\thun\n46F1\tti\n46F2\tman\n46F3\tyan\n46F4\tji\n46F5\tshou\n46F6\tlei\n46F7\twan\n46F8\tche\n46F9\tcan\n46FA\tjie\n46FB\tyou\n46FC\thui\n46FD\tzha\n46FE\tsu\n46FF\tge\n4700\tnao\n4701\txi\n4703\tdui\n4704\tchi\n4705\twei\n4706\tzhe\n4707\tgun\n4708\tchao\n4709\tchi\n470A\tzao\n470B\thui\n470C\tluan\n470D\tliao\n470E\tlao\n470F\ttuo\n4710\thui\n4711\twu\n4712\tao\n4713\tshe\n4714\tsui\n4715\tmai\n4716\ttan\n4717\txin\n4718\tjing\n4719\tan\n471A\tta\n471B\tchan\n471C\twei\n471D\ttuan\n471E\tji\n471F\tchen\n4720\tche\n4721\tyu\n4722\txian\n4723\txin\n4727\tnao\n4729\tyan\n472A\tqiu\n472B\tjiang\n472C\tsong\n472D\tjun\n472E\tliao\n472F\tju\n4731\tman\n4732\tlie\n4734\tchu\n4735\tchi\n4736\txiang\n4737\tqin\n4738\tmei\n4739\tshu\n473A\tchai\n473B\tchi\n473C\tgu\n473D\tyu\n473E\tyin\n4740\tliu\n4741\tlao\n4742\tshu\n4743\tzhe\n4744\tshuang\n4745\thui\n4748\te\n474A\tsha\n474B\tzong\n474C\tjue\n474D\tjun\n474E\ttuan\n474F\tlou\n4750\twei\n4751\tchong\n4752\tzhu\n4753\tlie\n4755\tzhe\n4756\tzhao\n4758\tyi\n4759\tchu\n475A\tni\n475B\tbo\n475C\tsuan\n475D\tyi\n475E\thao\n475F\tya\n4760\thuan\n4761\tman\n4762\tman\n4763\tqu\n4764\tlao\n4765\thao\n4766\tzhong\n4767\tmin\n4768\txian\n4769\tzhen\n476A\tshu\n476B\tzuo\n476C\tzhu\n476D\tgou\n476E\txuan\n476F\tyi\n4770\tzhi\n4771\txie\n4772\tjin\n4773\tcan\n4775\tbu\n4776\tliang\n4777\tzhi\n4778\tji\n4779\twan\n477A\tguan\n477B\tju\n477C\tjing\n477D\tai\n477E\tfu\n477F\tgui\n4780\thou\n4781\tyan\n4782\truan\n4783\tzhi\n4784\tbiao\n4785\tyi\n4786\tsuo\n4787\tdie\n4788\tgui\n4789\tsheng\n478A\txun\n478B\tchen\n478C\tshe\n478D\tqing\n4790\tchun\n4791\thong\n4792\tdong\n4793\tcheng\n4794\twei\n4795\tru\n4796\tshu\n4797\tcai\n4798\tji\n4799\tza\n479A\tqi\n479B\tyan\n479C\tfu\n479D\tyu\n479E\tfu\n479F\tpo\n47A0\tzhi\n47A1\ttan\n47A2\tzuo\n47A3\tche\n47A4\tqu\n47A5\tyou\n47A6\the\n47A7\thou\n47A8\tgui\n47A9\te\n47AA\tjiang\n47AB\tyun\n47AC\ttou\n47AD\tcun\n47AE\ttu\n47AF\tfu\n47B0\tzuo\n47B1\thu\n47B3\tbo\n47B4\tzhao\n47B5\tjue\n47B6\ttang\n47B7\tjue\n47B8\tfu\n47B9\thuang\n47BA\tchun\n47BB\tyong\n47BC\tchui\n47BD\tsuo\n47BE\tchi\n47BF\tqian\n47C0\tcai\n47C1\txiao\n47C2\tman\n47C3\tcan\n47C4\tqi\n47C5\tjian\n47C6\tbi\n47C7\tji\n47C8\tzhi\n47C9\tzhu\n47CA\tqu\n47CB\tzhan\n47CC\tji\n47CD\tbian\n47CF\tli\n47D0\tli\n47D1\tyue\n47D2\tquan\n47D3\tcheng\n47D4\tfu\n47D5\tcha\n47D6\ttang\n47D7\tshi\n47D8\thang\n47D9\tqie\n47DA\tqi\n47DB\tbo\n47DC\tna\n47DD\ttou\n47DE\tchu\n47DF\tcu\n47E0\tyue\n47E1\tzhi\n47E2\tchen\n47E3\tchu\n47E4\tbi\n47E5\tmeng\n47E6\tba\n47E7\ttian\n47E8\tmin\n47E9\tlie\n47EA\tfeng\n47EB\tcheng\n47EC\tqiu\n47ED\ttiao\n47EE\tfu\n47EF\tkuo\n47F0\tjian\n47F4\tzhen\n47F5\tqiu\n47F6\tzuo\n47F7\tchi\n47F8\tkui\n47F9\tlie\n47FA\tbei\n47FB\tdu\n47FC\twu\n47FE\tzhuo\n47FF\tlu\n4800\ttang\n4802\tchu\n4803\tliang\n4804\ttian\n4805\tkun\n4806\tchang\n4807\tjue\n4808\ttu\n4809\thuan\n480A\tfei\n480B\tbi\n480D\txia\n480E\two\n480F\tji\n4810\tqu\n4811\tkui\n4812\thu\n4813\tqiu\n4814\tsui\n4815\tcai\n4817\tqiu\n4818\tpi\n4819\tpang\n481A\twa\n481B\tyao\n481C\trong\n481D\txun\n481E\tcu\n481F\tdie\n4820\tchi\n4821\tcuo\n4822\tmeng\n4823\txuan\n4824\tduo\n4825\tbie\n4826\tzhe\n4827\tchu\n4828\tchan\n4829\tgui\n482A\tduan\n482B\tzou\n482C\tdeng\n482D\tlai\n482E\tteng\n482F\tyue\n4830\tquan\n4831\tzhu\n4832\tling\n4833\tchen\n4834\tzhen\n4835\tfu\n4836\tshe\n4837\ttiao\n4838\tkua\n4839\tai\n483B\tqiong\n483C\tshu\n483D\thai\n483E\tshan\n483F\twai\n4840\tzhan\n4841\tlong\n4842\tjiu\n4843\tli\n4845\tchun\n4846\trong\n4847\tyue\n4848\tjue\n4849\tkang\n484A\tfan\n484B\tqi\n484C\thong\n484D\tfu\n484E\tlu\n484F\thong\n4850\ttuo\n4851\tmin\n4852\ttian\n4853\tjuan\n4854\tqi\n4855\tzheng\n4856\tqing\n4857\tgong\n4858\ttian\n4859\tlang\n485A\tmao\n485B\tyin\n485C\tlu\n485D\tyuan\n485E\tju\n485F\tpi\n4861\txie\n4862\tbian\n4863\thun\n4864\tzhu\n4865\trong\n4866\tsang\n4867\twu\n4868\tcha\n4869\tkeng\n486A\tshan\n486B\tpeng\n486C\tman\n486D\txiu\n486F\tcong\n4870\tkeng\n4871\tzhuan\n4872\tchan\n4873\tsi\n4874\tchong\n4875\tsui\n4876\tbei\n4877\tkai\n4879\tzhi\n487A\twei\n487B\tmin\n487C\tling\n487D\tzuan\n487E\tnie\n487F\tling\n4880\tqi\n4881\tyue\n4883\tyi\n4884\txi\n4885\tchen\n4887\trong\n4888\tchen\n4889\tnong\n488A\tyou\n488B\tji\n488C\tbo\n488D\tfang\n4890\tcu\n4891\tdi\n4892\tjiao\n4893\tyu\n4894\the\n4895\txu\n4896\tyu\n4897\tqu\n4899\tbai\n489A\tgeng\n489B\tjiong\n489D\tya\n489E\tshu\n489F\tyou\n48A0\tsong\n48A1\tye\n48A2\tcang\n48A3\tyao\n48A4\tshu\n48A5\tyan\n48A6\tshuai\n48A7\tliao\n48A8\tcong\n48A9\tyu\n48AA\tbo\n48AB\tsui\n48AD\tyan\n48AE\tlei\n48AF\tlin\n48B0\tti\n48B1\tdu\n48B2\tyue\n48B3\tji\n48B5\tyun\n48B8\tju\n48B9\tju\n48BA\tchu\n48BB\tchen\n48BC\tgong\n48BD\txiang\n48BE\txian\n48BF\tan\n48C0\tgui\n48C1\tyu\n48C2\tlei\n48C4\ttu\n48C5\tchen\n48C6\txing\n48C7\tqiu\n48C8\thang\n48CA\tdang\n48CB\tcai\n48CC\tdi\n48CD\tyan\n48CE\tzi\n48D0\tying\n48D1\tchan\n48D3\tli\n48D4\tsuo\n48D5\tma\n48D6\tma\n48D8\ttang\n48D9\tpei\n48DA\tlou\n48DB\tqi\n48DC\tcuo\n48DD\ttu\n48DE\te\n48DF\tcan\n48E0\tjie\n48E1\tyi\n48E2\tji\n48E3\tdang\n48E4\tjue\n48E5\tbi\n48E6\tlei\n48E7\tyi\n48E8\tchun\n48E9\tchun\n48EA\tpo\n48EB\tli\n48EC\tzai\n48ED\ttai\n48EE\tpo\n48EF\tcu\n48F0\tju\n48F1\txu\n48F2\tfan\n48F4\txu\n48F5\ter\n48F6\thuo\n48F7\tzhu\n48F8\tran\n48F9\tfa\n48FA\tjuan\n48FB\than\n48FC\tliang\n48FD\tzhi\n48FE\tmi\n48FF\tyu\n4901\tcen\n4902\tmei\n4903\tyin\n4904\tmian\n4905\ttu\n4906\tkui\n4909\tmi\n490A\trong\n490B\tyu\n490C\tqiang\n490D\tmi\n490E\tju\n490F\tpi\n4910\tjin\n4911\twang\n4912\tji\n4913\tmeng\n4914\tjian\n4915\txue\n4916\tbao\n4917\tgan\n4918\tchan\n4919\tli\n491A\tli\n491B\tqiu\n491C\tdun\n491D\tying\n491E\tyun\n491F\tchen\n4920\tzhi\n4921\tran\n4923\tlue\n4924\tkai\n4925\tgui\n4926\tyue\n4927\thui\n4928\tpi\n4929\tcha\n492A\tduo\n492B\tchan\n492C\tsha\n492D\tshi\n492E\tshe\n492F\txing\n4930\tying\n4931\tshi\n4932\tchi\n4933\tye\n4934\than\n4935\tfei\n4936\tye\n4937\tyan\n4938\tzuan\n4939\tsou\n493A\tjin\n493B\tduo\n493C\txian\n493D\tguan\n493E\ttao\n493F\tqie\n4940\tchan\n4941\than\n4942\tmeng\n4943\tyue\n4944\tcu\n4945\tqian\n4946\tjin\n4947\tshan\n4948\tmu\n4949\tyuan\n494B\tpeng\n494C\tzheng\n494D\tzhi\n494E\tchun\n494F\tyu\n4950\tmou\n4951\tmai\n4952\tjiang\n4953\tqi\n4954\tsu\n4955\tpie\n4956\ttian\n4957\tkuan\n4958\tcu\n4959\tsui\n495B\tjie\n495C\tjian\n495D\tao\n495E\tjiao\n495F\tye\n4961\tye\n4962\tlong\n4963\tzao\n4964\tbao\n4965\tlian\n4967\thuan\n4968\tlu\n4969\twei\n496A\txian\n496B\ttie\n496C\tbo\n496D\tzheng\n496E\tzhu\n496F\tbei\n4970\tmeng\n4971\txie\n4972\tou\n4973\tyou\n4975\txiao\n4976\tli\n4977\tzha\n4978\tmi\n497A\tye\n497D\tpo\n497E\txie\n4982\tshan\n4983\tzhuo\n4985\tshan\n4986\tjue\n4987\tji\n4988\tjie\n498A\tniao\n498B\tao\n498C\tchu\n498D\twu\n498E\tguan\n498F\txie\n4990\tting\n4991\txue\n4992\tdang\n4993\tzhan\n4994\ttan\n4995\tpeng\n4996\txie\n4997\txu\n4998\txian\n4999\tsi\n499A\tkua\n499B\tzheng\n499C\twu\n499D\thuo\n499E\trun\n499F\tchuai\n49A0\tdu\n49A1\thuan\n49A2\tkuo\n49A3\tfu\n49A4\tchuai\n49A5\txian\n49A6\tqin\n49A7\tqie\n49A8\tlan\n49AA\tya\n49AB\tying\n49AC\tque\n49AD\thang\n49AE\tchun\n49AF\tzhi\n49B1\twei\n49B2\tyan\n49B3\txiang\n49B4\tyi\n49B5\tni\n49B6\tzheng\n49B7\tchuai\n49B9\tshi\n49BA\tding\n49BB\tzi\n49BC\tjue\n49BD\txu\n49BE\tyuan\n49C1\txu\n49C2\tdao\n49C3\ttian\n49C4\tge\n49C5\tyi\n49C6\thong\n49C7\tyi\n49C9\tli\n49CA\tku\n49CB\txian\n49CC\tsui\n49CD\txi\n49CE\txuan\n49D1\tdi\n49D2\tlai\n49D3\tzhou\n49D4\tnian\n49D5\tcheng\n49D6\tjian\n49D7\tbi\n49D8\tzhuan\n49D9\tling\n49DA\thao\n49DB\tbang\n49DC\ttang\n49DD\tchi\n49DE\tma\n49DF\txian\n49E0\tshuan\n49E1\tyong\n49E2\tqu\n49E4\tpu\n49E5\thui\n49E6\twei\n49E7\tyi\n49E8\tye\n49EA\tche\n49EB\thao\n49EC\tbin\n49EE\txian\n49EF\tchan\n49F0\thun\n49F2\than\n49F3\tci\n49F4\tzhi\n49F5\tqi\n49F6\tkui\n49F7\trou\n49F9\tying\n49FA\txiong\n49FC\thu\n49FD\tcui\n49FF\tque\n4A00\tdi\n4A01\twu\n4A02\tqiu\n4A04\tyan\n4A05\tliao\n4A06\tbi\n4A08\tbin\n4A0A\tyuan\n4A0B\tnue\n4A0C\tbao\n4A0D\tying\n4A0E\thong\n4A0F\tci\n4A10\tqia\n4A11\tti\n4A12\tyu\n4A13\tlei\n4A14\tbao\n4A16\tji\n4A17\tfu\n4A18\txian\n4A19\tcen\n4A1A\thu\n4A1B\tse\n4A1C\tbeng\n4A1D\tqing\n4A1E\tyu\n4A1F\twa\n4A20\tai\n4A21\than\n4A22\tdan\n4A23\tge\n4A24\tdi\n4A25\thuo\n4A26\tpang\n4A28\tzhui\n4A29\tling\n4A2A\tmai\n4A2B\tmai\n4A2C\tlian\n4A2D\txiao\n4A2E\txue\n4A2F\tzhen\n4A30\tpo\n4A31\tfu\n4A32\tnou\n4A33\txi\n4A34\tdui\n4A35\tdan\n4A36\tyun\n4A37\txian\n4A38\tyin\n4A39\tshu\n4A3A\tdui\n4A3B\tbeng\n4A3C\thu\n4A3D\tfei\n4A3E\tfei\n4A3F\tza\n4A40\tbei\n4A41\tfei\n4A42\txian\n4A43\tshi\n4A44\tmian\n4A45\tzhan\n4A46\tzhan\n4A47\tzhan\n4A48\thui\n4A49\tfu\n4A4A\twan\n4A4B\tmo\n4A4C\tqiao\n4A4D\tliao\n4A4F\tmie\n4A50\thu\n4A51\thong\n4A52\tyu\n4A53\tqi\n4A54\tduo\n4A55\tang\n4A57\tba\n4A58\tdi\n4A59\txuan\n4A5A\tdi\n4A5B\tbi\n4A5C\tzhou\n4A5D\tpao\n4A5E\ttie\n4A5F\tyi\n4A61\tjia\n4A62\tzhi\n4A63\ttu\n4A64\txie\n4A65\tdan\n4A66\ttiao\n4A67\txie\n4A68\tchang\n4A69\tyuan\n4A6A\tguan\n4A6B\tliang\n4A6C\tbeng\n4A6E\tlu\n4A6F\tji\n4A70\txuan\n4A71\tshu\n4A72\tdu\n4A73\tsou\n4A74\thu\n4A75\tyun\n4A76\tchan\n4A77\tbang\n4A78\trong\n4A79\te\n4A7A\tweng\n4A7B\tba\n4A7C\tfeng\n4A7D\tyu\n4A7E\tzhe\n4A7F\tfen\n4A80\tguan\n4A81\tbu\n4A82\tge\n4A83\tdun\n4A84\thuang\n4A85\tdu\n4A86\tti\n4A87\tbo\n4A88\tqian\n4A89\tlie\n4A8A\tlong\n4A8B\twei\n4A8C\tzhan\n4A8D\tlan\n4A8E\tsui\n4A8F\tna\n4A90\tbi\n4A91\ttuo\n4A92\tzhu\n4A93\tdie\n4A94\tbu\n4A95\tju\n4A96\tpo\n4A97\txia\n4A98\twei\n4A99\tpo\n4A9A\tda\n4A9B\tfan\n4A9C\tchan\n4A9D\thu\n4A9E\tza\n4AA4\tfan\n4AA5\txie\n4AA6\thong\n4AA7\tchi\n4AA8\tbao\n4AA9\tyin\n4AAB\tjing\n4AAC\tbo\n4AAD\truan\n4AAE\tchou\n4AAF\tying\n4AB0\tyi\n4AB1\tgai\n4AB2\tkun\n4AB3\tyun\n4AB4\tzhen\n4AB5\tya\n4AB6\tju\n4AB7\thou\n4AB8\tmin\n4AB9\tbai\n4ABA\tge\n4ABB\tbian\n4ABC\tzhuo\n4ABD\thao\n4ABE\tzhen\n4ABF\tsheng\n4AC0\tgen\n4AC1\tbi\n4AC2\tduo\n4AC3\tchun\n4AC4\tchua\n4AC5\tsan\n4AC6\tcheng\n4AC7\tran\n4AC8\tchen\n4AC9\tmao\n4ACA\tpei\n4ACB\twei\n4ACC\tpi\n4ACD\tfu\n4ACE\tzhuo\n4ACF\tqi\n4AD0\tlin\n4AD1\tyi\n4AD2\tmen\n4AD3\twu\n4AD4\tqi\n4AD5\tdie\n4AD6\tchen\n4AD7\txia\n4AD8\the\n4AD9\tsang\n4ADA\tgua\n4ADB\thou\n4ADC\tao\n4ADD\tfu\n4ADE\tqiao\n4ADF\thun\n4AE0\tpi\n4AE1\tyan\n4AE2\tsi\n4AE3\txi\n4AE4\tming\n4AE5\tkui\n4AE6\tge\n4AE8\tao\n4AE9\tsan\n4AEA\tshuang\n4AEB\tlou\n4AEC\tzhen\n4AED\thui\n4AEE\tchan\n4AF0\tlin\n4AF1\tna\n4AF2\than\n4AF3\tdu\n4AF4\tjin\n4AF5\tmian\n4AF6\tfan\n4AF7\te\n4AF8\tchao\n4AF9\thong\n4AFA\thong\n4AFB\tyu\n4AFC\txue\n4AFD\tpao\n4AFE\tbi\n4AFF\tchao\n4B00\tyou\n4B01\tyi\n4B02\txue\n4B03\tsa\n4B04\txu\n4B05\tli\n4B06\tli\n4B07\tyuan\n4B08\tdui\n4B09\thuo\n4B0A\tsha\n4B0B\tleng\n4B0C\tpou\n4B0D\thu\n4B0E\tguo\n4B0F\tbu\n4B10\trui\n4B11\twei\n4B12\tsou\n4B13\tan\n4B14\tyu\n4B15\txiang\n4B16\theng\n4B17\tyang\n4B18\txiao\n4B19\tyao\n4B1B\tbi\n4B1D\theng\n4B1E\ttao\n4B1F\tliu\n4B21\tzhu\n4B23\txi\n4B24\tzan\n4B25\tyi\n4B26\tdou\n4B27\tyuan\n4B28\tjiu\n4B2A\tbo\n4B2B\tti\n4B2C\tying\n4B2E\tyi\n4B2F\tnian\n4B30\tshao\n4B31\tben\n4B32\tgou\n4B33\tban\n4B34\tmo\n4B35\tgai\n4B36\ten\n4B37\tshe\n4B39\tzhi\n4B3A\tyang\n4B3B\tjian\n4B3C\tyuan\n4B3D\tshui\n4B3E\tti\n4B3F\twei\n4B40\txun\n4B41\tzhi\n4B42\tyi\n4B43\tren\n4B44\tshi\n4B45\thu\n4B46\tne\n4B47\tye\n4B48\tjian\n4B49\tsui\n4B4A\tying\n4B4B\tbao\n4B4C\thu\n4B4D\thu\n4B4E\tye\n4B50\tyang\n4B51\tlian\n4B52\txi\n4B53\ten\n4B54\tdui\n4B55\tzan\n4B56\tzhu\n4B57\tying\n4B58\tying\n4B59\tjin\n4B5A\tchuang\n4B5B\tdan\n4B5D\tkuai\n4B5E\tyi\n4B5F\tye\n4B60\tjian\n4B61\ten\n4B62\tning\n4B63\tci\n4B64\tqian\n4B65\txue\n4B66\tbo\n4B67\tmi\n4B68\tshui\n4B69\tmo\n4B6A\tliang\n4B6B\tqi\n4B6C\tqi\n4B6D\tshou\n4B6E\tfu\n4B6F\tbo\n4B70\tbeng\n4B71\tbie\n4B72\tyi\n4B73\twei\n4B74\thuan\n4B75\tfan\n4B76\tqi\n4B77\tmao\n4B78\tfu\n4B79\tang\n4B7A\tang\n4B7B\tfu\n4B7C\tqi\n4B7D\tqun\n4B7E\ttuo\n4B7F\tyi\n4B80\tbo\n4B81\tpian\n4B82\tba\n4B84\txuan\n4B87\tyu\n4B88\tchi\n4B89\tlu\n4B8A\tyi\n4B8B\tli\n4B8D\tniao\n4B8E\txi\n4B8F\twu\n4B91\tlei\n4B92\tpu\n4B93\tzhuo\n4B94\tzui\n4B95\tzhuo\n4B96\tchang\n4B97\tan\n4B98\ter\n4B99\tyu\n4B9A\tleng\n4B9B\tfu\n4B9C\tzha\n4B9D\thun\n4B9E\tchun\n4B9F\tsou\n4BA0\tbi\n4BA1\tbi\n4BA2\tzha\n4BA4\the\n4BA5\tli\n4BA7\than\n4BA8\tzai\n4BA9\tgu\n4BAA\tcheng\n4BAB\tlou\n4BAC\tmo\n4BAD\tmi\n4BAE\tmai\n4BAF\tao\n4BB0\tzhe\n4BB1\tzhu\n4BB2\thuang\n4BB3\tfan\n4BB4\tdeng\n4BB5\ttong\n4BB7\tdu\n4BB8\two\n4BB9\twei\n4BBA\tji\n4BBB\tchi\n4BBC\tlin\n4BBD\tbiao\n4BBE\tlong\n4BBF\tjian\n4BC0\tnie\n4BC1\tluo\n4BC2\tshen\n4BC4\tgua\n4BC5\tnie\n4BC6\tyi\n4BC7\tku\n4BC8\twan\n4BC9\twa\n4BCA\tqia\n4BCB\tbo\n4BCC\tkao\n4BCD\tling\n4BCE\tgan\n4BCF\tgua\n4BD0\thai\n4BD1\tkuang\n4BD2\theng\n4BD3\tkui\n4BD4\tze\n4BD5\tting\n4BD6\tlang\n4BD7\tbi\n4BD8\thuan\n4BD9\tpo\n4BDA\tyao\n4BDB\twan\n4BDC\tti\n4BDD\tsui\n4BDE\tkua\n4BDF\tdui\n4BE0\tao\n4BE1\tjian\n4BE2\tmo\n4BE3\tkui\n4BE4\tkuai\n4BE5\tan\n4BE6\tma\n4BE7\tqing\n4BE8\tqiao\n4BEA\tkao\n4BEB\thao\n4BEC\tduo\n4BED\txian\n4BEE\tnai\n4BEF\tsuo\n4BF0\tjie\n4BF1\tpi\n4BF2\tpa\n4BF3\tsong\n4BF4\tchang\n4BF5\tnie\n4BF6\tman\n4BF7\tsong\n4BF8\tci\n4BF9\txian\n4BFA\tkuo\n4BFC\tdi\n4BFD\tpou\n4BFE\ttiao\n4BFF\tzu\n4C00\two\n4C01\tfei\n4C02\tcai\n4C03\tpeng\n4C04\tsai\n4C06\trou\n4C07\tqi\n4C08\tcuo\n4C09\tpan\n4C0A\tbo\n4C0B\tman\n4C0C\tzong\n4C0D\tci\n4C0E\tkui\n4C0F\tji\n4C10\tlan\n4C12\tmeng\n4C13\tmian\n4C14\tpan\n4C15\tlu\n4C16\tzuan\n4C17\tjiu\n4C18\tliu\n4C19\tyi\n4C1A\twen\n4C1B\tli\n4C1C\tli\n4C1D\tzeng\n4C1E\tzhu\n4C1F\thun\n4C20\tshen\n4C21\tchi\n4C22\txing\n4C23\twang\n4C24\tdong\n4C25\thuo\n4C26\tpi\n4C27\thu\n4C28\tmei\n4C29\tche\n4C2A\tmei\n4C2B\tchao\n4C2C\tju\n4C2D\tnou\n4C2F\tyi\n4C30\tru\n4C31\tling\n4C32\tya\n4C34\tqi\n4C35\tzi\n4C37\tbang\n4C38\tgong\n4C39\tze\n4C3A\tjie\n4C3B\tyu\n4C3C\tqin\n4C3D\tbei\n4C3E\tba\n4C3F\ttuo\n4C40\tyang\n4C41\tqiao\n4C42\tyou\n4C43\tzhi\n4C44\tjie\n4C45\tmo\n4C46\tsheng\n4C47\tshan\n4C48\tqi\n4C49\tshan\n4C4A\tmi\n4C4B\tgong\n4C4C\tyi\n4C4D\tgeng\n4C4E\tgeng\n4C4F\ttou\n4C50\tfu\n4C51\txue\n4C52\tye\n4C53\tting\n4C54\ttiao\n4C55\tmou\n4C56\tliu\n4C57\tcan\n4C58\tli\n4C59\tshu\n4C5A\tlu\n4C5B\thuo\n4C5C\tcuo\n4C5D\tpai\n4C5E\tliu\n4C5F\tju\n4C60\tzhan\n4C61\tju\n4C62\tzheng\n4C63\tzu\n4C64\txian\n4C65\tzhi\n4C68\tla\n4C6B\tla\n4C6C\txu\n4C6D\tgeng\n4C6E\te\n4C6F\tmu\n4C70\tzhong\n4C71\tti\n4C72\tyuan\n4C73\tzhan\n4C74\tgeng\n4C75\tweng\n4C76\tlang\n4C77\tyu\n4C78\tsou\n4C79\tzha\n4C7A\thai\n4C7B\thua\n4C7C\tzhan\n4C7D\tchang\n4C7E\tlou\n4C7F\tchan\n4C80\tzhi\n4C81\twei\n4C82\txuan\n4C83\tzao\n4C84\tmin\n4C85\tgui\n4C86\tsu\n4C89\tsi\n4C8A\tduo\n4C8B\tcen\n4C8C\tkuan\n4C8D\tteng\n4C8E\tnei\n4C8F\tlao\n4C90\tlu\n4C91\tyi\n4C92\txie\n4C93\tyan\n4C94\tqing\n4C95\tpu\n4C96\tchou\n4C97\txian\n4C98\tguan\n4C99\tjie\n4C9A\tlai\n4C9B\tmeng\n4C9C\tye\n4C9D\tchang\n4C9E\tli\n4C9F\tyin\n4CA0\tchun\n4CA1\tqiu\n4CA2\tteng\n4CA3\tyu\n4CA6\tdai\n4CA7\tdu\n4CA8\thong\n4CAA\txi\n4CAC\tqi\n4CAE\tyuan\n4CAF\tji\n4CB0\tyun\n4CB1\tfang\n4CB2\tgong\n4CB3\thang\n4CB4\tzhen\n4CB5\tque\n4CB8\tjie\n4CB9\tpi\n4CBA\tgan\n4CBB\txuan\n4CBC\tsheng\n4CBD\tshi\n4CBE\tqiao\n4CBF\tci\n4CC0\tdie\n4CC1\tbo\n4CC2\tdiao\n4CC3\twan\n4CC4\tci\n4CC5\tzhi\n4CC6\tbai\n4CC7\twu\n4CC8\tbao\n4CC9\tdan\n4CCA\tba\n4CCB\ttong\n4CCD\tgong\n4CCE\tjiu\n4CCF\tgui\n4CD0\tci\n4CD1\tyou\n4CD2\tyuan\n4CD3\tlao\n4CD4\tju\n4CD5\tfu\n4CD6\tnie\n4CD7\te\n4CD8\te\n4CD9\txing\n4CDA\tkan\n4CDB\tyan\n4CDC\ttu\n4CDD\tpou\n4CDE\tbeng\n4CDF\tming\n4CE0\tshui\n4CE1\tyan\n4CE2\tqi\n4CE3\tyuan\n4CE4\tbie\n4CE6\txuan\n4CE7\thou\n4CE8\thuang\n4CE9\tyao\n4CEA\tjuan\n4CEB\tkui\n4CEC\te\n4CED\tji\n4CEE\tmo\n4CEF\tchong\n4CF0\tbao\n4CF1\twu\n4CF2\tzhen\n4CF3\txu\n4CF4\tta\n4CF5\tchi\n4CF6\txi\n4CF7\tcong\n4CF8\tma\n4CF9\tkou\n4CFA\tyan\n4CFB\tcan\n4CFD\the\n4CFE\tdeng\n4CFF\tran\n4D00\ttong\n4D01\tyu\n4D02\txiang\n4D03\tnao\n4D04\tshun\n4D05\tfen\n4D06\tpu\n4D07\tling\n4D08\tao\n4D09\thuan\n4D0A\tyi\n4D0B\thuan\n4D0C\tmeng\n4D0D\tying\n4D0E\tlei\n4D0F\tyan\n4D10\tbao\n4D11\tdie\n4D12\tling\n4D13\tshi\n4D14\tjiao\n4D15\tlie\n4D16\tjing\n4D17\tju\n4D18\tti\n4D19\tpi\n4D1A\tgang\n4D1B\txiao\n4D1C\twai\n4D1D\tchuai\n4D1E\tdi\n4D1F\thuan\n4D20\tyao\n4D21\tli\n4D22\tmi\n4D23\thu\n4D24\tsheng\n4D25\tjia\n4D26\tyin\n4D27\twei\n4D29\tpiao\n4D2A\tlu\n4D2B\tling\n4D2C\tyi\n4D2D\tcai\n4D2E\tshan\n4D2F\thu\n4D30\tshu\n4D31\ttuo\n4D32\tmo\n4D33\thua\n4D34\ttie\n4D35\tbing\n4D36\tpeng\n4D37\thun\n4D38\tfu\n4D39\tguo\n4D3A\tbu\n4D3B\tli\n4D3C\tchan\n4D3D\tpi\n4D3E\tcuo\n4D3F\tmeng\n4D40\tsuo\n4D41\tqiang\n4D42\tzhi\n4D43\tkuang\n4D44\tbi\n4D45\tao\n4D46\tmeng\n4D47\txian\n4D48\tku\n4D49\ttou\n4D4A\ttuan\n4D4B\twei\n4D4C\txian\n4D4E\ttuan\n4D4F\tlao\n4D50\tchan\n4D51\tni\n4D52\tni\n4D53\tli\n4D54\tdong\n4D55\tju\n4D56\tqian\n4D57\tbo\n4D58\tshai\n4D59\tzha\n4D5A\ttao\n4D5B\tqian\n4D5C\tnong\n4D5D\tyi\n4D5E\tjing\n4D5F\tgan\n4D60\tdi\n4D61\tjian\n4D62\tmei\n4D63\tda\n4D64\tjian\n4D65\tyu\n4D66\txie\n4D67\tzai\n4D68\tmang\n4D69\tli\n4D6A\tgun\n4D6B\txun\n4D6C\tta\n4D6D\tzhe\n4D6E\tyang\n4D6F\ttuan\n4D70\tshang\n4D71\txi\n4D72\tqiao\n4D73\twei\n4D74\tying\n4D75\tchua\n4D76\tqu\n4D77\twa\n4D79\tzhi\n4D7A\tting\n4D7B\tgu\n4D7C\tshang\n4D7D\tca\n4D7E\tfu\n4D7F\ttie\n4D80\tta\n4D81\tta\n4D82\tzhuo\n4D83\than\n4D84\tping\n4D85\the\n4D86\tzhui\n4D87\tzhou\n4D88\tbo\n4D89\tliu\n4D8A\tnu\n4D8B\txi\n4D8C\tpao\n4D8D\tdi\n4D8E\the\n4D8F\tti\n4D90\twai\n4D91\tti\n4D92\tqi\n4D93\tji\n4D94\tchi\n4D95\tba\n4D96\tjin\n4D97\tke\n4D98\tli\n4D99\tju\n4D9A\tqu\n4D9B\tla\n4D9C\tgu\n4D9D\tqia\n4D9E\tqi\n4D9F\txian\n4DA0\tjian\n4DA1\tshi\n4DA2\tjian\n4DA3\tai\n4DA4\thua\n4DA5\tzha\n4DA6\tze\n4DA7\tyao\n4DA8\tzhan\n4DA9\tji\n4DAA\tcha\n4DAB\tyan\n4DAC\tjian\n4DAE\tyan\n4DB0\tjiao\n4DB1\ttong\n4DB2\tnan\n4DB3\tyue\n4DB5\tchi\n4DB7\tjiao\n4DB8\tyao\n4DB9\tzuo\n4E00\tyi\n4E01\tding\n4E02\tkao\n4E03\tqi\n4E04\tshang\n4E05\txia\n4E06\than\n4E07\twan\n4E08\tzhang\n4E09\tsan\n4E0A\tshang\n4E0B\txia\n4E0C\tji\n4E0D\tbu\n4E0E\tyu\n4E0F\tmian\n4E10\tgai\n4E11\tchou\n4E12\tchou\n4E13\tzhuan\n4E14\tqie\n4E15\tpi\n4E16\tshi\n4E17\tshi\n4E18\tqiu\n4E19\tbing\n4E1A\tye\n4E1B\tcong\n4E1C\tdong\n4E1D\tsi\n4E1E\tcheng\n4E1F\tdiu\n4E20\tqiu\n4E21\tliang\n4E22\tdiu\n4E23\tyou\n4E24\tliang\n4E25\tyan\n4E26\tbing\n4E27\tsang\n4E28\tgun\n4E29\tjiu\n4E2A\tge\n4E2B\tya\n4E2C\tqiang\n4E2D\tzhong\n4E2E\tji\n4E2F\tjie\n4E30\tfeng\n4E31\tguan\n4E32\tchuan\n4E33\tchan\n4E34\tlin\n4E35\tzhuo\n4E36\tzhu\n4E37\tba\n4E38\twan\n4E39\tdan\n4E3A\twei\n4E3B\tzhu\n4E3C\tjing\n4E3D\tli\n4E3E\tju\n4E3F\tpie\n4E40\tfu\n4E41\tyi\n4E42\tyi\n4E43\tnai\n4E44\twu\n4E45\tjiu\n4E46\tjiu\n4E47\ttuo\n4E48\tme\n4E49\tyi\n4E4A\tyi\n4E4B\tzhi\n4E4C\twu\n4E4D\tzha\n4E4E\thu\n4E4F\tfa\n4E50\tle\n4E51\tyin\n4E52\tping\n4E53\tpang\n4E54\tqiao\n4E55\thu\n4E56\tguai\n4E57\tcheng\n4E58\tcheng\n4E59\tyi\n4E5A\tyin\n4E5B\tya\n4E5C\tmie\n4E5D\tjiu\n4E5E\tqi\n4E5F\tye\n4E60\txi\n4E61\txiang\n4E62\tgai\n4E63\tjiu\n4E64\txia\n4E65\thu\n4E66\tshu\n4E67\tdou\n4E68\tshi\n4E69\tji\n4E6A\tnang\n4E6B\tjia\n4E6C\tju\n4E6D\tshi\n4E6E\tmao\n4E6F\thu\n4E70\tmai\n4E71\tluan\n4E72\tzi\n4E73\tru\n4E74\txue\n4E75\tyan\n4E76\tfu\n4E77\tsha\n4E78\tna\n4E79\tgan\n4E7A\tsuo\n4E7B\tyu\n4E7C\tcui\n4E7D\tzhe\n4E7E\tqian\n4E7F\tzhi\n4E80\tgui\n4E81\tgan\n4E82\tluan\n4E83\tlin\n4E84\tyi\n4E85\tjue\n4E86\tle\n4E87\tma\n4E88\tyu\n4E89\tzheng\n4E8A\tshi\n4E8B\tshi\n4E8C\ter\n4E8D\tchu\n4E8E\tyu\n4E8F\tkui\n4E90\tyu\n4E91\tyun\n4E92\thu\n4E93\tqi\n4E94\twu\n4E95\tjing\n4E96\tsi\n4E97\tsui\n4E98\tgen\n4E99\tgen\n4E9A\tya\n4E9B\txie\n4E9C\tya\n4E9D\tqi\n4E9E\tya\n4E9F\tji\n4EA0\ttou\n4EA1\twang\n4EA2\tkang\n4EA3\tda\n4EA4\tjiao\n4EA5\thai\n4EA6\tyi\n4EA7\tchan\n4EA8\theng\n4EA9\tmu\n4EAA\tye\n4EAB\txiang\n4EAC\tjing\n4EAD\tting\n4EAE\tliang\n4EAF\txiang\n4EB0\tjing\n4EB1\tye\n4EB2\tqin\n4EB3\tbo\n4EB4\tyou\n4EB5\txie\n4EB6\tdan\n4EB7\tlian\n4EB8\tduo\n4EB9\twei\n4EBA\tren\n4EBB\tren\n4EBC\tji\n4EBD\tji\n4EBE\twang\n4EBF\tyi\n4EC0\tshen\n4EC1\tren\n4EC2\tle\n4EC3\tding\n4EC4\tze\n4EC5\tjin\n4EC6\tpu\n4EC7\tchou\n4EC8\tba\n4EC9\tzhang\n4ECA\tjin\n4ECB\tjie\n4ECC\tbing\n4ECD\treng\n4ECE\tcong\n4ECF\tfo\n4ED0\tsan\n4ED1\tlun\n4ED2\tbing\n4ED3\tcang\n4ED4\tzi\n4ED5\tshi\n4ED6\tta\n4ED7\tzhang\n4ED8\tfu\n4ED9\txian\n4EDA\txian\n4EDB\ttuo\n4EDC\thong\n4EDD\ttong\n4EDE\tren\n4EDF\tqian\n4EE0\tgan\n4EE1\tge\n4EE2\tbo\n4EE3\tdai\n4EE4\tling\n4EE5\tyi\n4EE6\tchao\n4EE7\tchang\n4EE8\tsa\n4EE9\tchang\n4EEA\tyi\n4EEB\tmu\n4EEC\tmen\n4EED\tren\n4EEE\tfan\n4EEF\tchao\n4EF0\tyang\n4EF1\tqian\n4EF2\tzhong\n4EF3\tpi\n4EF4\two\n4EF5\twu\n4EF6\tjian\n4EF7\tjia\n4EF8\tyao\n4EF9\tfeng\n4EFA\tcang\n4EFB\tren\n4EFC\twang\n4EFD\tfen\n4EFE\tdi\n4EFF\tfang\n4F00\tzhong\n4F01\tqi\n4F02\tpei\n4F03\tyu\n4F04\tdiao\n4F05\tdun\n4F06\twu\n4F07\tyi\n4F08\txin\n4F09\tkang\n4F0A\tyi\n4F0B\tji\n4F0C\tai\n4F0D\twu\n4F0E\tji\n4F0F\tfu\n4F10\tfa\n4F11\txiu\n4F12\tjin\n4F13\tpi\n4F14\tdan\n4F15\tfu\n4F16\ttang\n4F17\tzhong\n4F18\tyou\n4F19\thuo\n4F1A\thui\n4F1B\tyu\n4F1C\tcui\n4F1D\tyun\n4F1E\tsan\n4F1F\twei\n4F20\tchuan\n4F21\tche\n4F22\tya\n4F23\tqian\n4F24\tshang\n4F25\tchang\n4F26\tlun\n4F27\tcang\n4F28\txun\n4F29\txin\n4F2A\twei\n4F2B\tzhu\n4F2C\tze\n4F2D\txian\n4F2E\tnu\n4F2F\tbo\n4F30\tgu\n4F31\tni\n4F32\tni\n4F33\txie\n4F34\tban\n4F35\txu\n4F36\tling\n4F37\tzhou\n4F38\tshen\n4F39\tqu\n4F3A\tci\n4F3B\tbeng\n4F3C\tsi\n4F3D\tjia\n4F3E\tpi\n4F3F\tyi\n4F40\tsi\n4F41\tyi\n4F42\tzheng\n4F43\tdian\n4F44\than\n4F45\tmai\n4F46\tdan\n4F47\tzhu\n4F48\tbu\n4F49\tqu\n4F4A\tbi\n4F4B\tzhao\n4F4C\tci\n4F4D\twei\n4F4E\tdi\n4F4F\tzhu\n4F50\tzuo\n4F51\tyou\n4F52\tyang\n4F53\tti\n4F54\tzhan\n4F55\the\n4F56\tbi\n4F57\ttuo\n4F58\tshe\n4F59\tyu\n4F5A\tyi\n4F5B\tfu\n4F5C\tzuo\n4F5D\tgou\n4F5E\tning\n4F5F\ttong\n4F60\tni\n4F61\txian\n4F62\tqu\n4F63\tyong\n4F64\twa\n4F65\tqian\n4F66\tshi\n4F67\tka\n4F68\tbao\n4F69\tpei\n4F6A\thui\n4F6B\the\n4F6C\tlao\n4F6D\txiang\n4F6E\tge\n4F6F\tyang\n4F70\tbai\n4F71\tfa\n4F72\tming\n4F73\tjia\n4F74\tnai\n4F75\tbing\n4F76\tji\n4F77\then\n4F78\thuo\n4F79\tgui\n4F7A\tquan\n4F7B\ttiao\n4F7C\tjiao\n4F7D\tci\n4F7E\tyi\n4F7F\tshi\n4F80\txing\n4F81\tshen\n4F82\ttuo\n4F83\tkan\n4F84\tzhi\n4F85\tgai\n4F86\tlai\n4F87\tyi\n4F88\tchi\n4F89\tkua\n4F8A\tguang\n4F8B\tli\n4F8C\tyin\n4F8D\tshi\n4F8E\tmi\n4F8F\tzhu\n4F90\txu\n4F91\tyou\n4F92\tan\n4F93\tlu\n4F94\tmou\n4F95\ter\n4F96\tlun\n4F97\tdong\n4F98\tcha\n4F99\tchi\n4F9A\txun\n4F9B\tgong\n4F9C\tzhou\n4F9D\tyi\n4F9E\tru\n4F9F\tcun\n4FA0\txia\n4FA1\tsi\n4FA2\tdai\n4FA3\tlu\n4FA4\tta\n4FA5\tjiao\n4FA6\tzhen\n4FA7\tce\n4FA8\tqiao\n4FA9\tkuai\n4FAA\tchai\n4FAB\tning\n4FAC\tnong\n4FAD\tjin\n4FAE\twu\n4FAF\thou\n4FB0\tjiong\n4FB1\tcheng\n4FB2\tzhen\n4FB3\tzuo\n4FB4\tchou\n4FB5\tqin\n4FB6\tlu\n4FB7\tju\n4FB8\tshu\n4FB9\tting\n4FBA\tshen\n4FBB\ttui\n4FBC\tbo\n4FBD\tnan\n4FBE\txiao\n4FBF\tbian\n4FC0\ttui\n4FC1\tyu\n4FC2\txi\n4FC3\tcu\n4FC4\te\n4FC5\tqiu\n4FC6\txu\n4FC7\tguang\n4FC8\tku\n4FC9\twu\n4FCA\tjun\n4FCB\tyi\n4FCC\tfu\n4FCD\tliang\n4FCE\tzu\n4FCF\tqiao\n4FD0\tli\n4FD1\tyong\n4FD2\thun\n4FD3\tjing\n4FD4\tqian\n4FD5\tsan\n4FD6\tpei\n4FD7\tsu\n4FD8\tfu\n4FD9\txi\n4FDA\tli\n4FDB\tfu\n4FDC\tping\n4FDD\tbao\n4FDE\tyu\n4FDF\tqi\n4FE0\txia\n4FE1\txin\n4FE2\txiu\n4FE3\tyu\n4FE4\tdi\n4FE5\tche\n4FE6\tchou\n4FE7\tzhi\n4FE8\tyan\n4FE9\tlia\n4FEA\tli\n4FEB\tlai\n4FEC\tsi\n4FED\tjian\n4FEE\txiu\n4FEF\tfu\n4FF0\thuo\n4FF1\tju\n4FF2\txiao\n4FF3\tpai\n4FF4\tjian\n4FF5\tbiao\n4FF6\tchu\n4FF7\tfei\n4FF8\tfeng\n4FF9\tya\n4FFA\tan\n4FFB\tbei\n4FFC\tyu\n4FFD\txin\n4FFE\tbi\n4FFF\thu\n5000\tchang\n5001\tzhi\n5002\tbing\n5003\tjiu\n5004\tyao\n5005\tcui\n5006\tlia\n5007\twan\n5008\tlai\n5009\tcang\n500A\tzong\n500B\tge\n500C\tguan\n500D\tbei\n500E\ttian\n500F\tshu\n5010\tshu\n5011\tmen\n5012\tdao\n5013\ttan\n5014\tjue\n5015\tchui\n5016\txing\n5017\tpeng\n5018\ttang\n5019\thou\n501A\tyi\n501B\tqi\n501C\tti\n501D\tgan\n501E\tjing\n501F\tjie\n5020\tsui\n5021\tchang\n5022\tjie\n5023\tfang\n5024\tzhi\n5025\tkong\n5026\tjuan\n5027\tzong\n5028\tju\n5029\tqian\n502A\tni\n502B\tlun\n502C\tzhuo\n502D\two\n502E\tluo\n502F\tsong\n5030\tleng\n5031\thun\n5032\tdong\n5033\tzi\n5034\tben\n5035\twu\n5036\tju\n5037\tnai\n5038\tcai\n5039\tjian\n503A\tzhai\n503B\tye\n503C\tzhi\n503D\tsha\n503E\tqing\n503F\tning\n5040\tying\n5041\tcheng\n5042\tqian\n5043\tyan\n5044\truan\n5045\tzhong\n5046\tchun\n5047\tjia\n5048\tji\n5049\twei\n504A\tyu\n504B\tbing\n504C\truo\n504D\tti\n504E\twei\n504F\tpian\n5050\tyan\n5051\tfeng\n5052\ttang\n5053\two\n5054\te\n5055\txie\n5056\tche\n5057\tsheng\n5058\tkan\n5059\tdi\n505A\tzuo\n505B\tcha\n505C\tting\n505D\tbei\n505E\txie\n505F\thuang\n5060\tyao\n5061\tzhan\n5062\tchou\n5063\tyan\n5064\tyou\n5065\tjian\n5066\txu\n5067\tzha\n5068\tci\n5069\tfu\n506A\tbi\n506B\tzhi\n506C\tzong\n506D\tmian\n506E\tji\n506F\tyi\n5070\txie\n5071\txun\n5072\tcai\n5073\tduan\n5074\tce\n5075\tzhen\n5076\tou\n5077\ttou\n5078\ttou\n5079\tbei\n507A\tza\n507B\tlou\n507C\tjie\n507D\twei\n507E\tfen\n507F\tchang\n5080\tkui\n5081\tsou\n5082\tzhi\n5083\tsu\n5084\txia\n5085\tfu\n5086\tyuan\n5087\trong\n5088\tli\n5089\tnu\n508A\tyun\n508B\tjiang\n508C\tma\n508D\tbang\n508E\tdian\n508F\ttang\n5090\thao\n5091\tjie\n5092\txi\n5093\tshan\n5094\tqian\n5095\tjue\n5096\tcang\n5097\tchu\n5098\tsan\n5099\tbei\n509A\txiao\n509B\tyong\n509C\tyao\n509D\ttan\n509E\tsuo\n509F\tyang\n50A0\tfa\n50A1\tbing\n50A2\tjia\n50A3\tdai\n50A4\tzai\n50A5\ttang\n50A6\tgu\n50A7\tbin\n50A8\tchu\n50A9\tnuo\n50AA\tcan\n50AB\tlei\n50AC\tcui\n50AD\tyong\n50AE\tzao\n50AF\tzong\n50B0\tbeng\n50B1\tsong\n50B2\tao\n50B3\tchuan\n50B4\tyu\n50B5\tzhai\n50B6\tzu\n50B7\tshang\n50B8\tchuang\n50B9\tjing\n50BA\tchi\n50BB\tsha\n50BC\than\n50BD\tzhang\n50BE\tqing\n50BF\tyan\n50C0\tdi\n50C1\txie\n50C2\tlou\n50C3\tbei\n50C4\tpiao\n50C5\tjin\n50C6\tlian\n50C7\tlu\n50C8\tman\n50C9\tqian\n50CA\txian\n50CB\ttan\n50CC\tying\n50CD\tdong\n50CE\tzhuan\n50CF\txiang\n50D0\tshan\n50D1\tqiao\n50D2\tjiong\n50D3\ttui\n50D4\tzun\n50D5\tpu\n50D6\txi\n50D7\tlao\n50D8\tchang\n50D9\tguang\n50DA\tliao\n50DB\tqi\n50DC\tcheng\n50DD\tchan\n50DE\twei\n50DF\tji\n50E0\tbo\n50E1\thui\n50E2\tchuan\n50E3\ttie\n50E4\tdan\n50E5\tjiao\n50E6\tjiu\n50E7\tseng\n50E8\tfen\n50E9\txian\n50EA\tju\n50EB\te\n50EC\tjiao\n50ED\tjian\n50EE\ttong\n50EF\tlin\n50F0\tbo\n50F1\tgu\n50F2\txian\n50F3\tsu\n50F4\txian\n50F5\tjiang\n50F6\tmin\n50F7\tye\n50F8\tjin\n50F9\tjia\n50FA\tqiao\n50FB\tpi\n50FC\tfeng\n50FD\tzhou\n50FE\tai\n50FF\tsai\n5100\tyi\n5101\tjun\n5102\tnong\n5103\tchan\n5104\tyi\n5105\tdang\n5106\tjing\n5107\txuan\n5108\tkuai\n5109\tjian\n510A\tchu\n510B\tdan\n510C\tjiao\n510D\tsha\n510E\tzai\n510F\tcan\n5110\tbin\n5111\tan\n5112\tru\n5113\ttai\n5114\tchou\n5115\tchai\n5116\tlan\n5117\tni\n5118\tjin\n5119\tqian\n511A\tmeng\n511B\twu\n511C\tning\n511D\tqiong\n511E\tni\n511F\tchang\n5120\tlie\n5121\tlei\n5122\tlu\n5123\tkuang\n5124\tbao\n5125\tyu\n5126\tbiao\n5127\tzan\n5128\tzhi\n5129\tsi\n512A\tyou\n512B\thao\n512C\tqing\n512D\tchen\n512E\tli\n512F\tteng\n5130\twei\n5131\tlong\n5132\tchu\n5133\tchan\n5134\trang\n5135\tshu\n5136\thui\n5137\tli\n5138\tluo\n5139\tzan\n513A\tnuo\n513B\ttang\n513C\tyan\n513D\tlei\n513E\tnang\n513F\ter\n5140\twu\n5141\tyun\n5142\tzan\n5143\tyuan\n5144\txiong\n5145\tchong\n5146\tzhao\n5147\txiong\n5148\txian\n5149\tguang\n514A\tdui\n514B\tke\n514C\tdui\n514D\tmian\n514E\ttu\n514F\tchang\n5150\ter\n5151\tdui\n5152\ter\n5153\tjin\n5154\ttu\n5155\tsi\n5156\tyan\n5157\tyan\n5158\tshi\n515A\tdang\n515B\tqian\n515C\tdou\n515D\tfen\n515E\tmao\n515F\tshen\n5160\tdou\n5162\tjing\n5163\tli\n5164\thuang\n5165\tru\n5166\twang\n5167\tnei\n5168\tquan\n5169\tliang\n516A\tyu\n516B\tba\n516C\tgong\n516D\tliu\n516E\txi\n516F\than\n5170\tlan\n5171\tgong\n5172\ttian\n5173\tguan\n5174\txing\n5175\tbing\n5176\tqi\n5177\tju\n5178\tdian\n5179\tzi\n517A\tfen\n517B\tyang\n517C\tjian\n517D\tshou\n517E\tji\n517F\tyi\n5180\tji\n5181\tchan\n5182\tjiong\n5183\tmao\n5184\tran\n5185\tnei\n5186\tyuan\n5187\tmao\n5188\tgang\n5189\tran\n518A\tce\n518B\tjiong\n518C\tce\n518D\tzai\n518E\tgua\n518F\tjiong\n5190\tmao\n5191\tzhou\n5192\tmao\n5193\tgou\n5194\txu\n5195\tmian\n5196\tmi\n5197\trong\n5198\tyin\n5199\txie\n519A\tkan\n519B\tjun\n519C\tnong\n519D\tyi\n519E\tmi\n519F\tshi\n51A0\tguan\n51A1\tmeng\n51A2\tzhong\n51A3\tju\n51A4\tyuan\n51A5\tming\n51A6\tkou\n51A7\tlin\n51A8\tfu\n51A9\txie\n51AA\tmi\n51AB\tbing\n51AC\tdong\n51AD\ttai\n51AE\tgang\n51AF\tfeng\n51B0\tbing\n51B1\thu\n51B2\tchong\n51B3\tjue\n51B4\thu\n51B5\tkuang\n51B6\tye\n51B7\tleng\n51B8\tpan\n51B9\tfu\n51BA\tmin\n51BB\tdong\n51BC\txian\n51BD\tlie\n51BE\tqia\n51BF\tjian\n51C0\tjing\n51C1\tsou\n51C2\tmei\n51C3\ttu\n51C4\tqi\n51C5\tgu\n51C6\tzhun\n51C7\tsong\n51C8\tjing\n51C9\tliang\n51CA\tqing\n51CB\tdiao\n51CC\tling\n51CD\tdong\n51CE\tgan\n51CF\tjian\n51D0\tyin\n51D1\tcou\n51D2\tai\n51D3\tli\n51D4\tchuang\n51D5\tming\n51D6\tzhun\n51D7\tcui\n51D8\tsi\n51D9\tduo\n51DA\tjin\n51DB\tlin\n51DC\tlin\n51DD\tning\n51DE\txi\n51DF\tdu\n51E0\tji\n51E1\tfan\n51E2\tfan\n51E3\tfan\n51E4\tfeng\n51E5\tju\n51E6\tchu\n51E7\tzheng\n51E8\tfeng\n51E9\tmu\n51EA\tzhi\n51EB\tfu\n51EC\tfeng\n51ED\tping\n51EE\tfeng\n51EF\tkai\n51F0\thuang\n51F1\tkai\n51F2\tgan\n51F3\tdeng\n51F4\tping\n51F5\tqian\n51F6\txiong\n51F7\tkuai\n51F8\ttu\n51F9\tao\n51FA\tchu\n51FB\tji\n51FC\tdang\n51FD\than\n51FE\than\n51FF\tzao\n5200\tdao\n5201\tdiao\n5202\tdao\n5203\tren\n5204\tren\n5205\tchuang\n5206\tfen\n5207\tqie\n5208\tyi\n5209\tji\n520A\tkan\n520B\tqian\n520C\tcun\n520D\tchu\n520E\twen\n520F\tji\n5210\tdan\n5211\txing\n5212\thua\n5213\twan\n5214\tjue\n5215\tli\n5216\tyue\n5217\tlie\n5218\tliu\n5219\tze\n521A\tgang\n521B\tchuang\n521C\tfu\n521D\tchu\n521E\tqu\n521F\tdiao\n5220\tshan\n5221\tmin\n5222\tling\n5223\tzhong\n5224\tpan\n5225\tbie\n5226\tjie\n5227\tjie\n5228\tpao\n5229\tli\n522A\tshan\n522B\tbie\n522C\tchan\n522D\tjing\n522E\tgua\n522F\tgeng\n5230\tdao\n5231\tchuang\n5232\tkui\n5233\tku\n5234\tduo\n5235\ter\n5236\tzhi\n5237\tshua\n5238\tquan\n5239\tsha\n523A\tci\n523B\tke\n523C\tjie\n523D\tgui\n523E\tci\n523F\tgui\n5240\tkai\n5241\tduo\n5242\tji\n5243\tti\n5244\tjing\n5245\tlou\n5246\tluo\n5247\tze\n5248\tyuan\n5249\tcuo\n524A\txue\n524B\tkei\n524C\tla\n524D\tqian\n524E\tsha\n524F\tchuang\n5250\tgua\n5251\tjian\n5252\tcuo\n5253\tli\n5254\tti\n5255\tfei\n5256\tpou\n5257\tchan\n5258\tqi\n5259\tchuang\n525A\tzi\n525B\tgang\n525C\twan\n525D\tbo\n525E\tji\n525F\tduo\n5260\tqing\n5261\tshan\n5262\tdu\n5263\tjian\n5264\tji\n5265\tbo\n5266\tyan\n5267\tju\n5268\thuo\n5269\tsheng\n526A\tjian\n526B\tduo\n526C\tduan\n526D\twu\n526E\tgua\n526F\tfu\n5270\tsheng\n5271\tjian\n5272\tge\n5273\tda\n5274\tkai\n5275\tchuang\n5276\tchuan\n5277\tchan\n5278\ttuan\n5279\tlu\n527A\tli\n527B\tpeng\n527C\tshan\n527D\tpiao\n527E\tkou\n527F\tjiao\n5280\tgua\n5281\tqiao\n5282\tjue\n5283\thua\n5284\tzha\n5285\tzhuo\n5286\tlian\n5287\tju\n5288\tpi\n5289\tliu\n528A\tgui\n528B\tjiao\n528C\tgui\n528D\tjian\n528E\tjian\n528F\ttang\n5290\thuo\n5291\tji\n5292\tjian\n5293\tyi\n5294\tjian\n5295\tzhi\n5296\tchan\n5297\tjian\n5298\tmo\n5299\tli\n529A\tzhu\n529B\tli\n529C\tya\n529D\tquan\n529E\tban\n529F\tgong\n52A0\tjia\n52A1\twu\n52A2\tmai\n52A3\tlie\n52A4\tjin\n52A5\tkeng\n52A6\txie\n52A7\tzhi\n52A8\tdong\n52A9\tzhu\n52AA\tnu\n52AB\tjie\n52AC\tqu\n52AD\tshao\n52AE\tyi\n52AF\tzhu\n52B0\tmo\n52B1\tli\n52B2\tjin\n52B3\tlao\n52B4\tlao\n52B5\tjuan\n52B6\tkou\n52B7\tyang\n52B8\twa\n52B9\txiao\n52BA\tmou\n52BB\tkuang\n52BC\tjie\n52BD\tlie\n52BE\the\n52BF\tshi\n52C0\tke\n52C1\tjin\n52C2\tgao\n52C3\tbo\n52C4\tmin\n52C5\tchi\n52C6\tlang\n52C7\tyong\n52C8\tyong\n52C9\tmian\n52CA\tke\n52CB\txun\n52CC\tjuan\n52CD\tqing\n52CE\tlu\n52CF\tbu\n52D0\tmeng\n52D1\tchi\n52D2\tlei\n52D3\tkai\n52D4\tmian\n52D5\tdong\n52D6\txu\n52D7\txu\n52D8\tkan\n52D9\twu\n52DA\tyi\n52DB\txun\n52DC\tweng\n52DD\tsheng\n52DE\tlao\n52DF\tmu\n52E0\tlu\n52E1\tpiao\n52E2\tshi\n52E3\tji\n52E4\tqin\n52E5\tjiang\n52E6\tchao\n52E7\tquan\n52E8\txiang\n52E9\tyi\n52EA\tjue\n52EB\tfan\n52EC\tjuan\n52ED\ttong\n52EE\tju\n52EF\tdan\n52F0\txie\n52F1\tmai\n52F2\txun\n52F3\txun\n52F4\tlu\n52F5\tli\n52F6\tche\n52F7\trang\n52F8\tquan\n52F9\tbao\n52FA\tshao\n52FB\tyun\n52FC\tjiu\n52FD\tbao\n52FE\tgou\n52FF\twu\n5300\tyun\n5301\twen\n5302\txiong\n5303\tgai\n5304\tgai\n5305\tbao\n5306\tcong\n5307\tyi\n5308\txiong\n5309\tpeng\n530A\tju\n530B\ttao\n530C\tge\n530D\tpu\n530E\te\n530F\tpao\n5310\tfu\n5311\tgong\n5312\tda\n5313\tjiu\n5314\tgong\n5315\tbi\n5316\thua\n5317\tbei\n5318\tnao\n5319\tshi\n531A\tfang\n531B\tjiu\n531C\tyi\n531D\tza\n531E\tjiang\n531F\tkang\n5320\tjiang\n5321\tkuang\n5322\thu\n5323\txia\n5324\tqu\n5325\tfan\n5326\tgui\n5327\tqie\n5328\tzang\n5329\tkuang\n532A\tfei\n532B\thu\n532C\tyu\n532D\tgui\n532E\tkui\n532F\thui\n5330\tdan\n5331\tgui\n5332\tlian\n5333\tlian\n5334\tsuan\n5335\tdu\n5336\tjiu\n5337\tjue\n5338\txi\n5339\tpi\n533A\tqu\n533B\tyi\n533C\tke\n533D\tyan\n533E\tbian\n533F\tni\n5340\tqu\n5341\tshi\n5342\txun\n5343\tqian\n5344\tnian\n5345\tsa\n5346\tzu\n5347\tsheng\n5348\twu\n5349\thui\n534A\tban\n534B\tshi\n534C\txi\n534D\twan\n534E\thua\n534F\txie\n5350\twan\n5351\tbei\n5352\tzu\n5353\tzhuo\n5354\txie\n5355\tdan\n5356\tmai\n5357\tnan\n5358\tdan\n5359\tji\n535A\tbo\n535B\tshuai\n535C\tbo\n535D\tkuang\n535E\tbian\n535F\tbu\n5360\tzhan\n5361\tka\n5362\tlu\n5363\tyou\n5364\tlu\n5365\txi\n5366\tgua\n5367\two\n5368\txie\n5369\tjie\n536A\tjie\n536B\twei\n536C\tang\n536D\tqiong\n536E\tzhi\n536F\tmao\n5370\tyin\n5371\twei\n5372\tshao\n5373\tji\n5374\tque\n5375\tluan\n5376\tchi\n5377\tjuan\n5378\txie\n5379\txu\n537A\tjin\n537B\tque\n537C\twu\n537D\tji\n537E\te\n537F\tqing\n5380\txi\n5381\tsan\n5382\tchang\n5383\twei\n5384\te\n5385\tting\n5386\tli\n5387\tzhe\n5388\than\n5389\tli\n538A\tya\n538B\tya\n538C\tyan\n538D\tshe\n538E\tdi\n538F\tzha\n5390\tpang\n5391\tya\n5392\tqie\n5393\tya\n5394\tzhi\n5395\tce\n5396\tmang\n5397\tti\n5398\tli\n5399\tshe\n539A\thou\n539B\tting\n539C\tzui\n539D\tcuo\n539E\tfei\n539F\tyuan\n53A0\tce\n53A1\tyuan\n53A2\txiang\n53A3\tyan\n53A4\tli\n53A5\tjue\n53A6\tsha\n53A7\tdian\n53A8\tchu\n53A9\tjiu\n53AA\tjin\n53AB\tao\n53AC\tgui\n53AD\tyan\n53AE\tsi\n53AF\tli\n53B0\tchang\n53B1\tlan\n53B2\tli\n53B3\tyan\n53B4\tyan\n53B5\tyuan\n53B6\tsi\n53B7\tgong\n53B8\tlin\n53B9\trou\n53BA\tqu\n53BB\tqu\n53BC\ter\n53BD\tlei\n53BE\tdu\n53BF\txian\n53C0\tzhuan\n53C1\tsan\n53C2\tcan\n53C3\tcan\n53C4\tcan\n53C5\tcan\n53C6\tai\n53C7\tdai\n53C8\tyou\n53C9\tcha\n53CA\tji\n53CB\tyou\n53CC\tshuang\n53CD\tfan\n53CE\tshou\n53CF\tguai\n53D0\tba\n53D1\tfa\n53D2\truo\n53D3\tshi\n53D4\tshu\n53D5\tzhuo\n53D6\tqu\n53D7\tshou\n53D8\tbian\n53D9\txu\n53DA\txia\n53DB\tpan\n53DC\tsou\n53DD\tji\n53DE\twei\n53DF\tsou\n53E0\tdie\n53E1\trui\n53E2\tcong\n53E3\tkou\n53E4\tgu\n53E5\tju\n53E6\tling\n53E7\tgua\n53E8\tdao\n53E9\tkou\n53EA\tzhi\n53EB\tjiao\n53EC\tzhao\n53ED\tba\n53EE\tding\n53EF\tke\n53F0\ttai\n53F1\tchi\n53F2\tshi\n53F3\tyou\n53F4\tqiu\n53F5\tpo\n53F6\tye\n53F7\thao\n53F8\tsi\n53F9\ttan\n53FA\tchi\n53FB\tle\n53FC\tdiao\n53FD\tji\n53FE\tliao\n53FF\thong\n5400\tmie\n5401\txu\n5402\tmang\n5403\tchi\n5404\tge\n5405\txuan\n5406\tyao\n5407\tzi\n5408\the\n5409\tji\n540A\tdiao\n540B\tcun\n540C\ttong\n540D\tming\n540E\thou\n540F\tli\n5410\ttu\n5411\txiang\n5412\tzha\n5413\txia\n5414\tye\n5415\tlu\n5416\ta\n5417\tma\n5418\tou\n5419\thuo\n541A\tyi\n541B\tjun\n541C\tchou\n541D\tlin\n541E\ttun\n541F\tyin\n5420\tfei\n5421\tbi\n5422\tqin\n5423\tqin\n5424\tjie\n5425\tbu\n5426\tfou\n5427\tba\n5428\tdun\n5429\tfen\n542A\te\n542B\than\n542C\tting\n542D\tkeng\n542E\tshun\n542F\tqi\n5430\thong\n5431\tzhi\n5432\tyin\n5433\twu\n5434\twu\n5435\tchao\n5436\tna\n5437\txue\n5438\txi\n5439\tchui\n543A\tdou\n543B\twen\n543C\thou\n543D\thong\n543E\twu\n543F\tgao\n5440\tya\n5441\tjun\n5442\tlu\n5443\te\n5444\tge\n5445\tmei\n5446\tdai\n5447\tmen\n5448\tcheng\n5449\twu\n544A\tgao\n544B\tfu\n544C\tjiao\n544D\thong\n544E\tchi\n544F\tsheng\n5450\tna\n5451\ttun\n5452\tfu\n5453\tyi\n5454\tdai\n5455\tou\n5456\tli\n5457\tbei\n5458\tyuan\n5459\tguo\n545A\twen\n545B\tqiang\n545C\twu\n545D\te\n545E\tshi\n545F\tjuan\n5460\tpen\n5461\twen\n5462\tne\n5463\tm\n5464\tling\n5465\tran\n5466\tyou\n5467\tdi\n5468\tzhou\n5469\tshi\n546A\tzhou\n546B\ttie\n546C\txi\n546D\tyi\n546E\tqi\n546F\tping\n5470\tzi\n5471\tgu\n5472\tci\n5473\twei\n5474\txu\n5475\the\n5476\tnao\n5477\txia\n5478\tpei\n5479\tyi\n547A\txiao\n547B\tshen\n547C\thu\n547D\tming\n547E\tda\n547F\tqu\n5480\tju\n5481\than\n5482\tza\n5483\ttuo\n5484\tduo\n5485\tpou\n5486\tpao\n5487\tbi\n5488\tfu\n5489\tyang\n548A\the\n548B\tza\n548C\the\n548D\thai\n548E\tjiu\n548F\tyong\n5490\tfu\n5491\tda\n5492\tzhou\n5493\twa\n5494\tka\n5495\tgu\n5496\tka\n5497\tzuo\n5498\tbu\n5499\tlong\n549A\tdong\n549B\tning\n549C\tta\n549D\tsi\n549E\txian\n549F\thuo\n54A0\tqi\n54A1\ter\n54A2\te\n54A3\tguang\n54A4\tzha\n54A5\txi\n54A6\tyi\n54A7\tlie\n54A8\tzi\n54A9\tmie\n54AA\tmi\n54AB\tzhi\n54AC\tyao\n54AD\tji\n54AE\tzhou\n54AF\tge\n54B0\tshu\n54B1\tzan\n54B2\txiao\n54B3\thai\n54B4\thui\n54B5\tkua\n54B6\thuai\n54B7\ttao\n54B8\txian\n54B9\te\n54BA\txuan\n54BB\txiu\n54BC\tguo\n54BD\tyan\n54BE\tlao\n54BF\tyi\n54C0\tai\n54C1\tpin\n54C2\tshen\n54C3\ttong\n54C4\thong\n54C5\txiong\n54C6\tduo\n54C7\twa\n54C8\tha\n54C9\tzai\n54CA\tyou\n54CB\tdie\n54CC\tpai\n54CD\txiang\n54CE\tai\n54CF\tgen\n54D0\tkuang\n54D1\tya\n54D2\tda\n54D3\txiao\n54D4\tbi\n54D5\thui\n54D6\tnian\n54D7\thua\n54D8\txing\n54D9\tkuai\n54DA\tduo\n54DB\tfen\n54DC\tji\n54DD\tnong\n54DE\tmou\n54DF\tyo\n54E0\thao\n54E1\tyuan\n54E2\tlong\n54E3\tpou\n54E4\tmang\n54E5\tge\n54E6\to\n54E7\tchi\n54E8\tshao\n54E9\tli\n54EA\tna\n54EB\tzu\n54EC\the\n54ED\tku\n54EE\txiao\n54EF\txian\n54F0\tlao\n54F1\tbo\n54F2\tzhe\n54F3\tzha\n54F4\tliang\n54F5\tba\n54F6\tmie\n54F7\tlie\n54F8\tsui\n54F9\tfu\n54FA\tbu\n54FB\than\n54FC\theng\n54FD\tgeng\n54FE\tshuo\n54FF\tge\n5500\tyou\n5501\tyan\n5502\tgu\n5503\tgu\n5504\tbei\n5505\than\n5506\tsuo\n5507\tchun\n5508\tyi\n5509\tai\n550A\tjia\n550B\ttu\n550C\txian\n550D\twan\n550E\tli\n550F\txi\n5510\ttang\n5511\tzuo\n5512\tqiu\n5513\tche\n5514\twu\n5515\tzao\n5516\tya\n5517\tdou\n5518\tqi\n5519\tdi\n551A\tqin\n551B\tmai\n551C\tmo\n551D\thong\n551E\tdou\n551F\tqu\n5520\tlao\n5521\tliang\n5522\tsuo\n5523\tzao\n5524\thuan\n5525\tlang\n5526\tsha\n5527\tji\n5528\tzu\n5529\two\n552A\tfeng\n552B\tjin\n552C\thu\n552D\tqi\n552E\tshou\n552F\twei\n5530\tshua\n5531\tchang\n5532\ter\n5533\tli\n5534\tqiang\n5535\tan\n5536\tze\n5537\tyo\n5538\tnian\n5539\tyu\n553A\ttian\n553B\tlai\n553C\tsha\n553D\txi\n553E\ttuo\n553F\thu\n5540\tai\n5541\tzhao\n5542\tnou\n5543\tken\n5544\tzhuo\n5545\tzhuo\n5546\tshang\n5547\tdi\n5548\theng\n5549\tlin\n554A\ta\n554B\tcai\n554C\txiang\n554D\ttun\n554E\twu\n554F\twen\n5550\tcui\n5551\tsha\n5552\tgu\n5553\tqi\n5554\tqi\n5555\ttao\n5556\tdan\n5557\tdan\n5558\tye\n5559\tzi\n555A\tbi\n555B\tcui\n555C\tchuai\n555D\the\n555E\tya\n555F\tqi\n5560\tzhe\n5561\tfei\n5562\tliang\n5563\txian\n5564\tpi\n5565\tsha\n5566\tla\n5567\tze\n5568\tying\n5569\tgua\n556A\tpa\n556B\tzhe\n556C\tse\n556D\tzhuan\n556E\tnie\n556F\tguo\n5570\tluo\n5571\tyan\n5572\tdi\n5573\tquan\n5574\tchan\n5575\tbo\n5576\tding\n5577\tlang\n5578\txiao\n5579\tju\n557A\ttang\n557B\tchi\n557C\tti\n557D\tan\n557E\tjiu\n557F\tdan\n5580\tka\n5581\tyong\n5582\twei\n5583\tnan\n5584\tshan\n5585\tyu\n5586\tzhe\n5587\tla\n5588\tjie\n5589\thou\n558A\than\n558B\tdie\n558C\tzhou\n558D\tchai\n558E\twai\n558F\tnuo\n5590\tyu\n5591\tyin\n5592\tza\n5593\tyao\n5594\to\n5595\tmian\n5596\thu\n5597\tyun\n5598\tchuan\n5599\thui\n559A\thuan\n559B\thuan\n559C\txi\n559D\the\n559E\tji\n559F\tkui\n55A0\tzhong\n55A1\twei\n55A2\tsha\n55A3\txu\n55A4\thuang\n55A5\tduo\n55A6\tnie\n55A7\txuan\n55A8\tliang\n55A9\tyu\n55AA\tsang\n55AB\tchi\n55AC\tqiao\n55AD\tyan\n55AE\tdan\n55AF\tpen\n55B0\tcan\n55B1\tli\n55B2\tyo\n55B3\tzha\n55B4\twei\n55B5\tmiao\n55B6\tying\n55B7\tpen\n55B8\tbu\n55B9\tkui\n55BA\txi\n55BB\tyu\n55BC\tjie\n55BD\tlou\n55BE\tku\n55BF\tzao\n55C0\thu\n55C1\tti\n55C2\tyao\n55C3\the\n55C4\tsha\n55C5\txiu\n55C6\tqiang\n55C7\tse\n55C8\tyong\n55C9\tsu\n55CA\thong\n55CB\txie\n55CC\tai\n55CD\tsuo\n55CE\tma\n55CF\tcha\n55D0\thai\n55D1\tke\n55D2\tda\n55D3\tsang\n55D4\tchen\n55D5\tru\n55D6\tsou\n55D7\twa\n55D8\tji\n55D9\tpang\n55DA\twu\n55DB\tqian\n55DC\tshi\n55DD\tge\n55DE\tzi\n55DF\tjie\n55E0\tlao\n55E1\tweng\n55E2\twa\n55E3\tsi\n55E4\tchi\n55E5\thao\n55E6\tsuo\n55E8\thai\n55E9\tsuo\n55EA\tqin\n55EB\tnie\n55EC\the\n55ED\tzhi\n55EE\tsai\n55EF\tng\n55F0\tge\n55F1\tna\n55F2\tdia\n55F3\tai\n55F4\tqiang\n55F5\ttong\n55F6\tbi\n55F7\tao\n55F8\tao\n55F9\tlian\n55FA\tzui\n55FB\tzhe\n55FC\tmo\n55FD\tsou\n55FE\tsou\n55FF\ttan\n5600\tdi\n5601\tqi\n5602\tjiao\n5603\tchong\n5604\tjiao\n5605\tkai\n5606\ttan\n5607\tshan\n5608\tcao\n5609\tjia\n560A\tai\n560B\txiao\n560C\tpiao\n560D\tlou\n560E\tga\n560F\tgu\n5610\txiao\n5611\thu\n5612\thui\n5613\tguo\n5614\tou\n5615\txian\n5616\tze\n5617\tchang\n5618\txu\n5619\tpo\n561A\tde\n561B\tma\n561C\tma\n561D\thu\n561E\tlei\n561F\tdu\n5620\tga\n5621\ttang\n5622\tye\n5623\tbeng\n5624\tying\n5625\tsai\n5626\tjiao\n5627\tmi\n5628\txiao\n5629\thua\n562A\tmai\n562B\tran\n562C\tzuo\n562D\tpeng\n562E\tlao\n562F\txiao\n5630\tji\n5631\tzhu\n5632\tchao\n5633\tkui\n5634\tzui\n5635\txiao\n5636\tsi\n5637\thao\n5638\tfu\n5639\tliao\n563A\tqiao\n563B\txi\n563C\tchu\n563D\tchan\n563E\tdan\n563F\thei\n5640\txun\n5641\te\n5642\tzun\n5643\tfan\n5644\tchi\n5645\thui\n5646\tzan\n5647\tchuang\n5648\tcu\n5649\tdan\n564A\tyu\n564B\ttun\n564C\tceng\n564D\tjiao\n564E\tye\n564F\txi\n5650\tqi\n5651\thao\n5652\tlian\n5653\txu\n5654\tdeng\n5655\thui\n5656\tyin\n5657\tpu\n5658\tjue\n5659\tqin\n565A\txun\n565B\tnie\n565C\tlu\n565D\tsi\n565E\tyan\n565F\tying\n5660\tda\n5661\tzhan\n5662\to\n5663\tzhou\n5664\tjin\n5665\tnong\n5666\thui\n5667\txie\n5668\tqi\n5669\te\n566A\tzao\n566B\tyi\n566C\tshi\n566D\tjiao\n566E\tyuan\n566F\tai\n5670\tyong\n5671\txue\n5672\tkuai\n5673\tyu\n5674\tpen\n5675\tdao\n5676\tga\n5677\thm\n5678\tdun\n5679\tdang\n567A\txin\n567B\tsai\n567C\tpi\n567D\tpi\n567E\tyin\n567F\tzui\n5680\tning\n5681\tdi\n5682\tlan\n5683\tta\n5684\thuo\n5685\tru\n5686\thao\n5687\txia\n5688\tye\n5689\tduo\n568A\tpi\n568B\tchou\n568C\tji\n568D\tjin\n568E\thao\n568F\tti\n5690\tchang\n5691\txun\n5692\tme\n5693\tca\n5694\tti\n5695\tlu\n5696\thui\n5697\tbo\n5698\tyou\n5699\tnie\n569A\tyin\n569B\thu\n569C\tme\n569D\thong\n569E\tzhe\n569F\tli\n56A0\tliu\n56A1\thai\n56A2\tnang\n56A3\txiao\n56A4\tmo\n56A5\tyan\n56A6\tli\n56A7\tlu\n56A8\tlong\n56A9\tmo\n56AA\tdan\n56AB\tchen\n56AC\tpin\n56AD\tpi\n56AE\txiang\n56AF\thuo\n56B0\tmo\n56B1\txi\n56B2\tduo\n56B3\tku\n56B4\tyan\n56B5\tchan\n56B6\tying\n56B7\trang\n56B8\tdian\n56B9\tla\n56BA\tta\n56BB\txiao\n56BC\tjue\n56BD\tchuo\n56BE\thuan\n56BF\thuo\n56C0\tzhuan\n56C1\tnie\n56C2\txiao\n56C3\tca\n56C4\tli\n56C5\tchan\n56C6\tchai\n56C7\tli\n56C8\tyi\n56C9\tluo\n56CA\tnang\n56CB\tza\n56CC\tsu\n56CD\txi\n56CE\tzen\n56CF\tjian\n56D0\tza\n56D1\tzhu\n56D2\tlan\n56D3\tnie\n56D4\tnang\n56D5\tlan\n56D6\tlo\n56D7\twei\n56D8\thui\n56D9\tyin\n56DA\tqiu\n56DB\tsi\n56DC\tnin\n56DD\tjian\n56DE\thui\n56DF\txin\n56E0\tyin\n56E1\tnan\n56E2\ttuan\n56E3\ttuan\n56E4\tdun\n56E5\tkang\n56E6\tyuan\n56E7\tjiong\n56E8\tpian\n56E9\tyun\n56EA\tcong\n56EB\thu\n56EC\thui\n56ED\tyuan\n56EE\te\n56EF\tguo\n56F0\tkun\n56F1\tcong\n56F2\ttong\n56F3\ttu\n56F4\twei\n56F5\tlun\n56F6\tguo\n56F7\tqun\n56F8\tri\n56F9\tling\n56FA\tgu\n56FB\tguo\n56FC\ttai\n56FD\tguo\n56FE\ttu\n56FF\tyou\n5700\tguo\n5701\tyin\n5702\thun\n5703\tpu\n5704\tyu\n5705\than\n5706\tyuan\n5707\tlun\n5708\tquan\n5709\tyu\n570A\tqing\n570B\tguo\n570C\tchui\n570D\twei\n570E\tyuan\n570F\tquan\n5710\tku\n5711\tpu\n5712\tyuan\n5713\tyuan\n5714\tya\n5715\ttu\n5716\ttu\n5717\ttu\n5718\ttuan\n5719\tlue\n571A\thui\n571B\tyi\n571C\thuan\n571D\tluan\n571E\tluan\n571F\ttu\n5720\tya\n5721\ttu\n5722\tting\n5723\tsheng\n5724\tpu\n5725\tlu\n5726\tkuai\n5727\tya\n5728\tzai\n5729\twei\n572A\tge\n572B\ttuo\n572C\twu\n572D\tgui\n572E\tpi\n572F\tyi\n5730\tde\n5731\tqian\n5732\tqian\n5733\tzhen\n5734\tzhuo\n5735\tdang\n5736\tqia\n5737\txia\n5738\tshan\n5739\tkuang\n573A\tchang\n573B\tqi\n573C\tnie\n573D\tmo\n573E\tji\n573F\tjia\n5740\tzhi\n5741\tzhi\n5742\tban\n5743\txun\n5744\tyi\n5745\tqin\n5746\tmei\n5747\tjun\n5748\trong\n5749\ttun\n574A\tfang\n574B\tben\n574C\tben\n574D\ttan\n574E\tkan\n574F\thuai\n5750\tzuo\n5751\tkeng\n5752\tbi\n5753\tjing\n5754\tdi\n5755\tjing\n5756\tji\n5757\tkuai\n5758\tdi\n5759\tjing\n575A\tjian\n575B\ttan\n575C\tli\n575D\tba\n575E\twu\n575F\tfen\n5760\tzhui\n5761\tpo\n5762\tban\n5763\ttang\n5764\tkun\n5765\tqu\n5766\ttan\n5767\tzhi\n5768\ttuo\n5769\tgan\n576A\tping\n576B\tdian\n576C\tgua\n576D\tni\n576E\ttai\n576F\tpi\n5770\tjiong\n5771\tyang\n5772\tfo\n5773\tao\n5774\tlu\n5775\tqiu\n5776\tmu\n5777\tke\n5778\tgou\n5779\txue\n577A\tba\n577B\tdi\n577C\tche\n577D\tling\n577E\tzhu\n577F\tfu\n5780\thu\n5781\tzhi\n5782\tchui\n5783\tla\n5784\tlong\n5785\tlong\n5786\tlu\n5787\tao\n5788\tdai\n5789\tpao\n578A\tmin\n578B\txing\n578C\tdong\n578D\tji\n578E\the\n578F\tlu\n5790\tci\n5791\tchi\n5792\tlei\n5793\tgai\n5794\tyin\n5795\thou\n5796\tdui\n5797\tzhao\n5798\tfu\n5799\tguang\n579A\tyao\n579B\tduo\n579C\tduo\n579D\tgui\n579E\tcha\n579F\tyang\n57A0\tyin\n57A1\tfa\n57A2\tgou\n57A3\tyuan\n57A4\tdie\n57A5\txie\n57A6\tken\n57A7\tshang\n57A8\tshou\n57A9\te\n57AA\tbing\n57AB\tdian\n57AC\thong\n57AD\tya\n57AE\tkua\n57AF\tda\n57B0\tka\n57B1\tdang\n57B2\tkai\n57B3\thang\n57B4\tnao\n57B5\tan\n57B6\txing\n57B7\txian\n57B8\tyuan\n57B9\tbang\n57BA\tfu\n57BB\tba\n57BC\tyi\n57BD\tyin\n57BE\than\n57BF\txu\n57C0\tchui\n57C1\tqin\n57C2\tgeng\n57C3\tai\n57C4\tbeng\n57C5\tfang\n57C6\tque\n57C7\tyong\n57C8\tjun\n57C9\tjia\n57CA\tdi\n57CB\tmai\n57CC\tlang\n57CD\tjuan\n57CE\tcheng\n57CF\tshan\n57D0\tjin\n57D1\tzhe\n57D2\tlie\n57D3\tlie\n57D4\tbu\n57D5\tcheng\n57D6\thua\n57D7\tbu\n57D8\tshi\n57D9\txun\n57DA\tguo\n57DB\tjiong\n57DC\tye\n57DD\tnian\n57DE\tdi\n57DF\tyu\n57E0\tbu\n57E1\tya\n57E2\tquan\n57E3\tsui\n57E4\tpi\n57E5\tqing\n57E6\twan\n57E7\tju\n57E8\tlun\n57E9\tzheng\n57EA\tkong\n57EB\ttang\n57EC\tdong\n57ED\tdai\n57EE\ttan\n57EF\tan\n57F0\tcai\n57F1\tchu\n57F2\tbeng\n57F3\tkan\n57F4\tzhi\n57F5\tduo\n57F6\tyi\n57F7\tzhi\n57F8\tyi\n57F9\tpei\n57FA\tji\n57FB\tzhun\n57FC\tqi\n57FD\tsao\n57FE\tju\n57FF\tni\n5800\tku\n5801\tke\n5802\ttang\n5803\tkun\n5804\tni\n5805\tjian\n5806\tdui\n5807\tjin\n5808\tgang\n5809\tyu\n580A\te\n580B\tpeng\n580C\tgu\n580D\ttu\n580E\tleng\n580F\tfang\n5810\tya\n5811\tqian\n5812\tkun\n5813\tan\n5814\tshen\n5815\tduo\n5816\tnao\n5817\ttu\n5818\tcheng\n5819\tyin\n581A\thun\n581B\tbi\n581C\tlian\n581D\tguo\n581E\tdie\n581F\tzhuan\n5820\thou\n5821\tbao\n5822\tbao\n5823\tyu\n5824\tdi\n5825\tmao\n5826\tjie\n5827\truan\n5828\te\n5829\tgeng\n582A\tkan\n582B\tzong\n582C\tyu\n582D\thuang\n582E\te\n582F\tyao\n5830\tyan\n5831\tbao\n5832\tji\n5833\tmei\n5834\tchang\n5835\tdu\n5836\ttuo\n5837\tyin\n5838\tfeng\n5839\tzhong\n583A\tjie\n583B\tjin\n583C\theng\n583D\tgang\n583E\tchun\n583F\tjian\n5840\tping\n5841\tlei\n5842\txiang\n5843\thuang\n5844\tleng\n5845\tduan\n5846\twan\n5847\txuan\n5848\tji\n5849\tji\n584A\tkuai\n584B\tying\n584C\tta\n584D\tcheng\n584E\tyong\n584F\tkai\n5850\tsu\n5851\tsu\n5852\tshi\n5853\tmi\n5854\tta\n5855\tweng\n5856\tcheng\n5857\ttu\n5858\ttang\n5859\tque\n585A\tzhong\n585B\tli\n585C\tzhong\n585D\tbang\n585E\tsai\n585F\tzang\n5860\tdui\n5861\ttian\n5862\twu\n5863\tzheng\n5864\txun\n5865\tge\n5866\tzhen\n5867\tai\n5868\tgong\n5869\tyan\n586A\tkan\n586B\ttian\n586C\tyuan\n586D\twen\n586E\txie\n586F\tliu\n5870\thai\n5871\tlang\n5872\tchang\n5873\tpeng\n5874\tbeng\n5875\tchen\n5876\tlu\n5877\tlu\n5878\tou\n5879\tqian\n587A\tmei\n587B\tmo\n587C\tzhuan\n587D\tshuang\n587E\tshu\n587F\tlou\n5880\tchi\n5881\tman\n5882\tbiao\n5883\tjing\n5884\tce\n5885\tshu\n5886\tzhi\n5887\tzhang\n5888\tkan\n5889\tyong\n588A\tdian\n588B\tchen\n588C\tzhi\n588D\txi\n588E\tguo\n588F\tqiang\n5890\tjin\n5891\tdi\n5892\tshang\n5893\tmu\n5894\tcui\n5895\tyan\n5896\tta\n5897\tzeng\n5898\tqian\n5899\tqiang\n589A\tliang\n589B\twei\n589C\tzhui\n589D\tqiao\n589E\tzeng\n589F\txu\n58A0\tshan\n58A1\tshan\n58A2\tba\n58A3\tpu\n58A4\tkuai\n58A5\tdong\n58A6\tfan\n58A7\tque\n58A8\tmo\n58A9\tdun\n58AA\tdun\n58AB\tzun\n58AC\tdi\n58AD\tsheng\n58AE\tduo\n58AF\tduo\n58B0\ttan\n58B1\tdeng\n58B2\tmu\n58B3\tfen\n58B4\thuang\n58B5\ttan\n58B6\tda\n58B7\tye\n58B8\tzhu\n58B9\tjian\n58BA\tao\n58BB\tqiang\n58BC\tji\n58BD\tqiao\n58BE\tken\n58BF\tyi\n58C0\tpi\n58C1\tbi\n58C2\tdian\n58C3\tjiang\n58C4\tye\n58C5\tyong\n58C6\txue\n58C7\ttan\n58C8\tlan\n58C9\tju\n58CA\thuai\n58CB\tdang\n58CC\trang\n58CD\tqian\n58CE\txun\n58CF\txian\n58D0\txi\n58D1\the\n58D2\tai\n58D3\tya\n58D4\tdao\n58D5\thao\n58D6\truan\n58D7\tjin\n58D8\tlei\n58D9\tkuang\n58DA\tlu\n58DB\tyan\n58DC\ttan\n58DD\twei\n58DE\thuai\n58DF\tlong\n58E0\tlong\n58E1\trui\n58E2\tli\n58E3\tlin\n58E4\trang\n58E5\tchan\n58E6\txun\n58E7\tyan\n58E8\tlei\n58E9\tba\n58EA\twan\n58EB\tshi\n58EC\tren\n58ED\tsan\n58EE\tzhuang\n58EF\tzhuang\n58F0\tsheng\n58F1\tyi\n58F2\tmai\n58F3\tke\n58F4\tzhu\n58F5\tzhuang\n58F6\thu\n58F7\thu\n58F8\tkun\n58F9\tyi\n58FA\thu\n58FB\txu\n58FC\tkun\n58FD\tshou\n58FE\tmang\n58FF\tzun\n5900\tshou\n5901\tyi\n5902\tzhi\n5903\tgu\n5904\tchu\n5905\tjiang\n5906\tfeng\n5907\tbei\n5908\tzhai\n5909\tbian\n590A\tsui\n590B\tqun\n590C\tling\n590D\tfu\n590E\tcuo\n590F\txia\n5910\txiong\n5911\txie\n5912\tnao\n5913\txia\n5914\tkui\n5915\txi\n5916\twai\n5917\tyuan\n5918\tmao\n5919\tsu\n591A\tduo\n591B\tduo\n591C\tye\n591D\tqing\n591E\twai\n591F\tgou\n5920\tgou\n5921\tqi\n5922\tmeng\n5923\tmeng\n5924\tyin\n5925\thuo\n5926\tchen\n5927\tda\n5928\tze\n5929\ttian\n592A\ttai\n592B\tfu\n592C\tguai\n592D\tyao\n592E\tyang\n592F\thang\n5930\tgao\n5931\tshi\n5932\ttao\n5933\ttai\n5934\ttou\n5935\tyan\n5936\tbi\n5937\tyi\n5938\tkua\n5939\tjia\n593A\tduo\n593B\thua\n593C\tkuang\n593D\tyun\n593E\tjia\n593F\tba\n5940\ten\n5941\tlian\n5942\thuan\n5943\tdi\n5944\tyan\n5945\tpao\n5946\tjuan\n5947\tqi\n5948\tnai\n5949\tfeng\n594A\txie\n594B\tfen\n594C\tdian\n594D\tquan\n594E\tkui\n594F\tzou\n5950\thuan\n5951\tqi\n5952\tkai\n5953\tzha\n5954\tben\n5955\tyi\n5956\tjiang\n5957\ttao\n5958\tzang\n5959\tben\n595A\txi\n595B\thuang\n595C\tfei\n595D\tdiao\n595E\txun\n595F\tbeng\n5960\tdian\n5961\tao\n5962\tshe\n5963\tweng\n5964\tha\n5965\tao\n5966\twu\n5967\tao\n5968\tjiang\n5969\tlian\n596A\tduo\n596B\tyun\n596C\tjiang\n596D\tshi\n596E\tfen\n596F\thuo\n5970\tbi\n5971\tluan\n5972\tduo\n5973\tnu\n5974\tnu\n5975\tding\n5976\tnai\n5977\tqian\n5978\tjian\n5979\tta\n597A\tjiu\n597B\tnuan\n597C\tcha\n597D\thao\n597E\txian\n597F\tfan\n5980\tji\n5981\tshuo\n5982\tru\n5983\tfei\n5984\twang\n5985\thong\n5986\tzhuang\n5987\tfu\n5988\tma\n5989\tdan\n598A\tren\n598B\tfu\n598C\tjing\n598D\tyan\n598E\thai\n598F\twen\n5990\tzhong\n5991\tpa\n5992\tdu\n5993\tji\n5994\tkeng\n5995\tzhong\n5996\tyao\n5997\tjin\n5998\tyun\n5999\tmiao\n599A\tfou\n599B\tchi\n599C\tyue\n599D\tzhuang\n599E\tniu\n599F\tyan\n59A0\tna\n59A1\txin\n59A2\tfen\n59A3\tbi\n59A4\tyu\n59A5\ttuo\n59A6\tfeng\n59A7\tyuan\n59A8\tfang\n59A9\twu\n59AA\tyu\n59AB\tgui\n59AC\tdu\n59AD\tba\n59AE\tni\n59AF\tzhou\n59B0\tzhuo\n59B1\tzhao\n59B2\tda\n59B3\tnai\n59B4\tyuan\n59B5\ttou\n59B6\txian\n59B7\tzhi\n59B8\te\n59B9\tmei\n59BA\tmo\n59BB\tqi\n59BC\tbi\n59BD\tshen\n59BE\tqie\n59BF\te\n59C0\the\n59C1\txu\n59C2\tfa\n59C3\tzheng\n59C4\tmin\n59C5\tban\n59C6\tmu\n59C7\tfu\n59C8\tling\n59C9\tzi\n59CA\tzi\n59CB\tshi\n59CC\tran\n59CD\tshan\n59CE\tyang\n59CF\tman\n59D0\tjie\n59D1\tgu\n59D2\tsi\n59D3\txing\n59D4\twei\n59D5\tzi\n59D6\tju\n59D7\tshan\n59D8\tpin\n59D9\tren\n59DA\tyao\n59DB\tdong\n59DC\tjiang\n59DD\tshu\n59DE\tji\n59DF\tgai\n59E0\txiang\n59E1\thua\n59E2\tjuan\n59E3\tjiao\n59E4\tgou\n59E5\tlao\n59E6\tjian\n59E7\tjian\n59E8\tyi\n59E9\tnian\n59EA\tzhi\n59EB\tji\n59EC\tji\n59ED\txian\n59EE\theng\n59EF\tguang\n59F0\tjun\n59F1\tkua\n59F2\tyan\n59F3\tming\n59F4\tlie\n59F5\tpei\n59F6\te\n59F7\tyou\n59F8\tyan\n59F9\tcha\n59FA\tshen\n59FB\tyin\n59FC\tshi\n59FD\tgui\n59FE\tquan\n59FF\tzi\n5A00\tsong\n5A01\twei\n5A02\thong\n5A03\twa\n5A04\tlou\n5A05\tya\n5A06\trao\n5A07\tjiao\n5A08\tluan\n5A09\tping\n5A0A\txian\n5A0B\tshao\n5A0C\tli\n5A0D\tcheng\n5A0E\txie\n5A0F\tmang\n5A10\tfu\n5A11\tsuo\n5A12\tmei\n5A13\twei\n5A14\tke\n5A15\tchuo\n5A16\tchuo\n5A17\tting\n5A18\tniang\n5A19\txing\n5A1A\tnan\n5A1B\tyu\n5A1C\tna\n5A1D\tpou\n5A1E\tnei\n5A1F\tjuan\n5A20\tshen\n5A21\tzhi\n5A22\than\n5A23\tdi\n5A24\tzhuang\n5A25\te\n5A26\tpin\n5A27\ttui\n5A28\txian\n5A29\tmian\n5A2A\twu\n5A2B\tyan\n5A2C\twu\n5A2D\tai\n5A2E\tyan\n5A2F\tyu\n5A30\tsi\n5A31\tyu\n5A32\twa\n5A33\tli\n5A34\txian\n5A35\tju\n5A36\tqu\n5A37\tzhui\n5A38\tqi\n5A39\txian\n5A3A\tzhuo\n5A3B\tdong\n5A3C\tchang\n5A3D\tlu\n5A3E\tai\n5A3F\te\n5A40\te\n5A41\tlou\n5A42\tmian\n5A43\tcong\n5A44\tpou\n5A45\tju\n5A46\tpo\n5A47\tcai\n5A48\tling\n5A49\twan\n5A4A\tbiao\n5A4B\txiao\n5A4C\tshu\n5A4D\tqi\n5A4E\thui\n5A4F\tfan\n5A50\two\n5A51\trui\n5A52\ttan\n5A53\tfei\n5A54\tfei\n5A55\tjie\n5A56\ttian\n5A57\tni\n5A58\tquan\n5A59\tjing\n5A5A\thun\n5A5B\tjing\n5A5C\tqian\n5A5D\tdian\n5A5E\txing\n5A5F\thu\n5A60\twan\n5A61\tlai\n5A62\tbi\n5A63\tyin\n5A64\tzhou\n5A65\tchuo\n5A66\tfu\n5A67\tjing\n5A68\tlun\n5A69\tan\n5A6A\tlan\n5A6B\tkun\n5A6C\tyin\n5A6D\tya\n5A6E\tju\n5A6F\tli\n5A70\tdian\n5A71\txian\n5A72\thua\n5A73\thua\n5A74\tying\n5A75\tchan\n5A76\tshen\n5A77\tting\n5A78\tdang\n5A79\tyao\n5A7A\twu\n5A7B\tnan\n5A7C\truo\n5A7D\tjia\n5A7E\ttou\n5A7F\txu\n5A80\tyu\n5A81\twei\n5A82\tdi\n5A83\trou\n5A84\tmei\n5A85\tdan\n5A86\truan\n5A87\tqin\n5A88\thui\n5A89\two\n5A8A\tqian\n5A8B\tchun\n5A8C\tmiao\n5A8D\tfu\n5A8E\tjie\n5A8F\tduan\n5A90\tyi\n5A91\tzhong\n5A92\tmei\n5A93\thuang\n5A94\tmian\n5A95\tan\n5A96\tying\n5A97\txuan\n5A98\tjie\n5A99\twei\n5A9A\tmei\n5A9B\tyuan\n5A9C\tzheng\n5A9D\tqiu\n5A9E\tshi\n5A9F\txie\n5AA0\ttuo\n5AA1\tlian\n5AA2\tmao\n5AA3\tran\n5AA4\tsi\n5AA5\tpian\n5AA6\twei\n5AA7\twa\n5AA8\tcu\n5AA9\thu\n5AAA\tao\n5AAB\tjie\n5AAC\tbao\n5AAD\txu\n5AAE\ttou\n5AAF\tgui\n5AB0\tchu\n5AB1\tyao\n5AB2\tpi\n5AB3\txi\n5AB4\tyuan\n5AB5\tying\n5AB6\trong\n5AB7\tru\n5AB8\tchi\n5AB9\tliu\n5ABA\tmei\n5ABB\tpan\n5ABC\tao\n5ABD\tma\n5ABE\tgou\n5ABF\tkui\n5AC0\tqin\n5AC1\tjia\n5AC2\tsao\n5AC3\tzhen\n5AC4\tyuan\n5AC5\tjie\n5AC6\trong\n5AC7\tming\n5AC8\tying\n5AC9\tji\n5ACA\tsu\n5ACB\tniao\n5ACC\txian\n5ACD\ttao\n5ACE\tpang\n5ACF\tlang\n5AD0\tnao\n5AD1\tbao\n5AD2\tai\n5AD3\tpi\n5AD4\tpin\n5AD5\tyi\n5AD6\tpiao\n5AD7\tyu\n5AD8\tlei\n5AD9\txuan\n5ADA\tman\n5ADB\tyi\n5ADC\tzhang\n5ADD\tkang\n5ADE\tyong\n5ADF\tni\n5AE0\tli\n5AE1\tdi\n5AE2\tgui\n5AE3\tyan\n5AE4\tjin\n5AE5\tzhuan\n5AE6\tchang\n5AE7\tze\n5AE8\than\n5AE9\tnen\n5AEA\tlao\n5AEB\tmo\n5AEC\tzhe\n5AED\thu\n5AEE\thu\n5AEF\tao\n5AF0\tnen\n5AF1\tqiang\n5AF2\tma\n5AF3\tpie\n5AF4\tgu\n5AF5\twu\n5AF6\tqiao\n5AF7\ttuo\n5AF8\tzhan\n5AF9\tmiao\n5AFA\txian\n5AFB\txian\n5AFC\tmo\n5AFD\tliao\n5AFE\tlian\n5AFF\thua\n5B00\tgui\n5B01\tdeng\n5B02\tzhi\n5B03\txu\n5B04\tyi\n5B05\thua\n5B06\txi\n5B07\tkui\n5B08\trao\n5B09\txi\n5B0A\tyan\n5B0B\tchan\n5B0C\tjiao\n5B0D\tmei\n5B0E\tfan\n5B0F\tfan\n5B10\txian\n5B11\tyi\n5B12\thui\n5B13\tjiao\n5B14\tfu\n5B15\tshi\n5B16\tbi\n5B17\tshan\n5B18\tsui\n5B19\tqiang\n5B1A\tlian\n5B1B\thuan\n5B1C\txin\n5B1D\tniao\n5B1E\tdong\n5B1F\tyi\n5B20\tcan\n5B21\tai\n5B22\tniang\n5B23\tning\n5B24\tma\n5B25\ttiao\n5B26\tchou\n5B27\tjin\n5B28\tci\n5B29\tyu\n5B2A\tpin\n5B2B\trong\n5B2C\tru\n5B2D\tnai\n5B2E\tyan\n5B2F\ttai\n5B30\tying\n5B31\tqian\n5B32\tniao\n5B33\tyue\n5B34\tying\n5B35\tmian\n5B36\tbi\n5B37\tmo\n5B38\tshen\n5B39\txing\n5B3A\tni\n5B3B\tdu\n5B3C\tliu\n5B3D\tyuan\n5B3E\tlan\n5B3F\tyan\n5B40\tshuang\n5B41\tling\n5B42\tjiao\n5B43\tniang\n5B44\tlan\n5B45\txian\n5B46\tying\n5B47\tshuang\n5B48\thui\n5B49\tquan\n5B4A\tmi\n5B4B\tli\n5B4C\tluan\n5B4D\tyan\n5B4E\tzhu\n5B4F\tlan\n5B50\tzi\n5B51\tjie\n5B52\tjue\n5B53\tjue\n5B54\tkong\n5B55\tyun\n5B56\tma\n5B57\tzi\n5B58\tcun\n5B59\tsun\n5B5A\tfu\n5B5B\tbei\n5B5C\tzi\n5B5D\txiao\n5B5E\txin\n5B5F\tmeng\n5B60\tsi\n5B61\ttai\n5B62\tbao\n5B63\tji\n5B64\tgu\n5B65\tnu\n5B66\txue\n5B67\tyou\n5B68\tzhuan\n5B69\thai\n5B6A\tluan\n5B6B\tsun\n5B6C\tnao\n5B6D\tmie\n5B6E\tcong\n5B6F\tqian\n5B70\tshu\n5B71\tchan\n5B72\tya\n5B73\tzi\n5B74\tni\n5B75\tfu\n5B76\tzi\n5B77\tli\n5B78\txue\n5B79\tbo\n5B7A\tru\n5B7B\tnai\n5B7C\tnie\n5B7D\tnie\n5B7E\tying\n5B7F\tluan\n5B80\tmian\n5B81\tning\n5B82\trong\n5B83\tta\n5B84\tgui\n5B85\tzhai\n5B86\tqiong\n5B87\tyu\n5B88\tshou\n5B89\tan\n5B8A\ttu\n5B8B\tsong\n5B8C\twan\n5B8D\trou\n5B8E\tyao\n5B8F\thong\n5B90\tyi\n5B91\tjing\n5B92\tzhun\n5B93\tmi\n5B94\tzhu\n5B95\tdang\n5B96\thong\n5B97\tzong\n5B98\tguan\n5B99\tzhou\n5B9A\tding\n5B9B\twan\n5B9C\tyi\n5B9D\tbao\n5B9E\tshi\n5B9F\tshi\n5BA0\tchong\n5BA1\tshen\n5BA2\tke\n5BA3\txuan\n5BA4\tshi\n5BA5\tyou\n5BA6\thuan\n5BA7\tyi\n5BA8\ttiao\n5BA9\tshi\n5BAA\txian\n5BAB\tgong\n5BAC\tcheng\n5BAD\tqun\n5BAE\tgong\n5BAF\txiao\n5BB0\tzai\n5BB1\tzha\n5BB2\tbao\n5BB3\thai\n5BB4\tyan\n5BB5\txiao\n5BB6\tjia\n5BB7\tshen\n5BB8\tchen\n5BB9\trong\n5BBA\thuang\n5BBB\tmi\n5BBC\tkou\n5BBD\tkuan\n5BBE\tbin\n5BBF\tsu\n5BC0\tcai\n5BC1\tzan\n5BC2\tji\n5BC3\tyuan\n5BC4\tji\n5BC5\tyin\n5BC6\tmi\n5BC7\tkou\n5BC8\tqing\n5BC9\the\n5BCA\tzhen\n5BCB\tjian\n5BCC\tfu\n5BCD\tning\n5BCE\tbing\n5BCF\thuan\n5BD0\tmei\n5BD1\tqin\n5BD2\than\n5BD3\tyu\n5BD4\tshi\n5BD5\tning\n5BD6\tjin\n5BD7\tning\n5BD8\tzhi\n5BD9\tyu\n5BDA\tbao\n5BDB\tkuan\n5BDC\tning\n5BDD\tqin\n5BDE\tmo\n5BDF\tcha\n5BE0\tju\n5BE1\tgua\n5BE2\tqin\n5BE3\thu\n5BE4\twu\n5BE5\tliao\n5BE6\tshi\n5BE7\tning\n5BE8\tzhai\n5BE9\tshen\n5BEA\twei\n5BEB\txie\n5BEC\tkuan\n5BED\thui\n5BEE\tliao\n5BEF\tjun\n5BF0\thuan\n5BF1\tyi\n5BF2\tyi\n5BF3\tbao\n5BF4\tqin\n5BF5\tchong\n5BF6\tbao\n5BF7\tfeng\n5BF8\tcun\n5BF9\tdui\n5BFA\tsi\n5BFB\txun\n5BFC\tdao\n5BFD\tlu\n5BFE\tdui\n5BFF\tshou\n5C00\tpo\n5C01\tfeng\n5C02\tzhuan\n5C03\tfu\n5C04\tshe\n5C05\tke\n5C06\tjiang\n5C07\tjiang\n5C08\tzhuan\n5C09\twei\n5C0A\tzun\n5C0B\txun\n5C0C\tshu\n5C0D\tdui\n5C0E\tdao\n5C0F\txiao\n5C10\tjie\n5C11\tshao\n5C12\ter\n5C13\ter\n5C14\ter\n5C15\tga\n5C16\tjian\n5C17\tshu\n5C18\tchen\n5C19\tshang\n5C1A\tshang\n5C1B\tmo\n5C1C\tga\n5C1D\tchang\n5C1E\tliao\n5C1F\txian\n5C20\txian\n5C21\tkun\n5C22\twang\n5C23\twang\n5C24\tyou\n5C25\tliao\n5C26\tliao\n5C27\tyao\n5C28\tmang\n5C29\twang\n5C2A\twang\n5C2B\twang\n5C2C\tga\n5C2D\tyao\n5C2E\tduo\n5C2F\tkui\n5C30\tzhong\n5C31\tjiu\n5C32\tgan\n5C33\tgu\n5C34\tgan\n5C35\ttui\n5C36\tgan\n5C37\tgan\n5C38\tshi\n5C39\tyin\n5C3A\tchi\n5C3B\tkao\n5C3C\tni\n5C3D\tjin\n5C3E\twei\n5C3F\tniao\n5C40\tju\n5C41\tpi\n5C42\tceng\n5C43\txi\n5C44\tbi\n5C45\tju\n5C46\tjie\n5C47\ttian\n5C48\tqu\n5C49\tti\n5C4A\tjie\n5C4B\twu\n5C4C\tdiao\n5C4D\tshi\n5C4E\tshi\n5C4F\tping\n5C50\tji\n5C51\txie\n5C52\tzhen\n5C53\txie\n5C54\tni\n5C55\tzhan\n5C56\txi\n5C57\twei\n5C58\tman\n5C59\te\n5C5A\tlou\n5C5B\tping\n5C5C\tti\n5C5D\tfei\n5C5E\tshu\n5C5F\txie\n5C60\ttu\n5C61\tlu\n5C62\tlu\n5C63\txi\n5C64\tceng\n5C65\tlu\n5C66\tju\n5C67\txie\n5C68\tju\n5C69\tjue\n5C6A\tliao\n5C6B\tjue\n5C6C\tshu\n5C6D\txi\n5C6E\tche\n5C6F\ttun\n5C70\tni\n5C71\tshan\n5C72\twa\n5C73\txian\n5C74\tli\n5C75\te\n5C76\thui\n5C77\thui\n5C78\tlong\n5C79\tyi\n5C7A\tqi\n5C7B\tren\n5C7C\twu\n5C7D\than\n5C7E\tshen\n5C7F\tyu\n5C80\tchu\n5C81\tsui\n5C82\tqi\n5C83\tren\n5C84\tyue\n5C85\tban\n5C86\tyao\n5C87\tang\n5C88\tya\n5C89\twu\n5C8A\tjie\n5C8B\te\n5C8C\tji\n5C8D\tqian\n5C8E\tfen\n5C8F\twan\n5C90\tqi\n5C91\tcen\n5C92\tqian\n5C93\tqi\n5C94\tcha\n5C95\tjie\n5C96\tqu\n5C97\tgang\n5C98\txian\n5C99\tao\n5C9A\tlan\n5C9B\tdao\n5C9C\tba\n5C9D\tzuo\n5C9E\tzuo\n5C9F\tyang\n5CA0\tju\n5CA1\tgang\n5CA2\tke\n5CA3\tgou\n5CA4\txue\n5CA5\tpo\n5CA6\tli\n5CA7\ttiao\n5CA8\tqu\n5CA9\tyan\n5CAA\tfu\n5CAB\txiu\n5CAC\tjia\n5CAD\tling\n5CAE\ttuo\n5CAF\tpi\n5CB0\tao\n5CB1\tdai\n5CB2\tkuang\n5CB3\tyue\n5CB4\tqu\n5CB5\thu\n5CB6\tpo\n5CB7\tmin\n5CB8\tan\n5CB9\ttiao\n5CBA\tling\n5CBB\tchi\n5CBC\tping\n5CBD\tdong\n5CBE\than\n5CBF\tkui\n5CC0\txiu\n5CC1\tmao\n5CC2\ttong\n5CC3\txue\n5CC4\tyi\n5CC5\tbian\n5CC6\the\n5CC7\tba\n5CC8\tluo\n5CC9\te\n5CCA\tfu\n5CCB\txun\n5CCC\tdie\n5CCD\tlu\n5CCE\ten\n5CCF\ter\n5CD0\tgai\n5CD1\tquan\n5CD2\tdong\n5CD3\tyi\n5CD4\tmu\n5CD5\tshi\n5CD6\tan\n5CD7\twei\n5CD8\thuan\n5CD9\tzhi\n5CDA\tmi\n5CDB\tlie\n5CDC\tji\n5CDD\ttong\n5CDE\twei\n5CDF\tyou\n5CE0\tqia\n5CE1\txia\n5CE2\tli\n5CE3\tyao\n5CE4\tjiao\n5CE5\tzheng\n5CE6\tluan\n5CE7\tjiao\n5CE8\te\n5CE9\te\n5CEA\tyu\n5CEB\txie\n5CEC\tbu\n5CED\tqiao\n5CEE\tqun\n5CEF\tfeng\n5CF0\tfeng\n5CF1\tnao\n5CF2\tli\n5CF3\tyou\n5CF4\txian\n5CF5\trong\n5CF6\tdao\n5CF7\tshen\n5CF8\tcheng\n5CF9\ttu\n5CFA\tgeng\n5CFB\tjun\n5CFC\tgao\n5CFD\txia\n5CFE\tyin\n5CFF\twu\n5D00\tlang\n5D01\tkan\n5D02\tlao\n5D03\tlai\n5D04\txian\n5D05\tque\n5D06\tkong\n5D07\tchong\n5D08\tchong\n5D09\tta\n5D0A\tlin\n5D0B\thua\n5D0C\tju\n5D0D\tlai\n5D0E\tqi\n5D0F\tmin\n5D10\tkun\n5D11\tkun\n5D12\tzu\n5D13\tgu\n5D14\tcui\n5D15\tya\n5D16\tya\n5D17\tgang\n5D18\tlun\n5D19\tlun\n5D1A\tleng\n5D1B\tjue\n5D1C\tduo\n5D1D\tzheng\n5D1E\tguo\n5D1F\tyin\n5D20\tdong\n5D21\than\n5D22\tzheng\n5D23\twei\n5D24\txiao\n5D25\tpi\n5D26\tyan\n5D27\tsong\n5D28\tjie\n5D29\tbeng\n5D2A\tzu\n5D2B\tku\n5D2C\tdong\n5D2D\tzhan\n5D2E\tgu\n5D2F\tyin\n5D30\tzi\n5D31\tze\n5D32\thuang\n5D33\tyu\n5D34\twai\n5D35\tyang\n5D36\tfeng\n5D37\tqiu\n5D38\tyang\n5D39\tti\n5D3A\tyi\n5D3B\tzhi\n5D3C\tshi\n5D3D\tzai\n5D3E\tyao\n5D3F\te\n5D40\tzhu\n5D41\tkan\n5D42\tlu\n5D43\tyan\n5D44\tmei\n5D45\than\n5D46\tji\n5D47\tji\n5D48\thuan\n5D49\tting\n5D4A\tsheng\n5D4B\tmei\n5D4C\tqian\n5D4D\twu\n5D4E\tyu\n5D4F\tzong\n5D50\tlan\n5D51\tke\n5D52\tyan\n5D53\tyan\n5D54\twei\n5D55\tzong\n5D56\tcha\n5D57\tsui\n5D58\trong\n5D59\tke\n5D5A\tqin\n5D5B\tyu\n5D5C\tqi\n5D5D\tlou\n5D5E\ttu\n5D5F\tdui\n5D60\txi\n5D61\tweng\n5D62\tcang\n5D63\tdang\n5D64\trong\n5D65\tjie\n5D66\tkai\n5D67\tliu\n5D68\twu\n5D69\tsong\n5D6A\tqiao\n5D6B\tzi\n5D6C\twei\n5D6D\tbeng\n5D6E\tdian\n5D6F\tcuo\n5D70\tqian\n5D71\tyong\n5D72\tnie\n5D73\tcuo\n5D74\tji\n5D75\tshi\n5D76\truo\n5D77\tsong\n5D78\tzong\n5D79\tjiang\n5D7A\tliao\n5D7B\tkang\n5D7C\tchan\n5D7D\tdie\n5D7E\tcen\n5D7F\tding\n5D80\ttu\n5D81\tlou\n5D82\tzhang\n5D83\tzhan\n5D84\tzhan\n5D85\tao\n5D86\tcao\n5D87\tqu\n5D88\tqiang\n5D89\tcui\n5D8A\tzui\n5D8B\tdao\n5D8C\tdao\n5D8D\txi\n5D8E\tyu\n5D8F\tpei\n5D90\tlong\n5D91\txiang\n5D92\tceng\n5D93\tbo\n5D94\tqin\n5D95\tjiao\n5D96\tyan\n5D97\tlao\n5D98\tzhan\n5D99\tlin\n5D9A\tliao\n5D9B\tliao\n5D9C\tjin\n5D9D\tdeng\n5D9E\tduo\n5D9F\tzun\n5DA0\tjiao\n5DA1\tgui\n5DA2\tyao\n5DA3\tjiao\n5DA4\tyao\n5DA5\tjue\n5DA6\tshan\n5DA7\tyi\n5DA8\txue\n5DA9\tnao\n5DAA\tye\n5DAB\tye\n5DAC\tyi\n5DAD\tnie\n5DAE\txian\n5DAF\tji\n5DB0\txie\n5DB1\tke\n5DB2\txi\n5DB3\tdi\n5DB4\tao\n5DB5\tzui\n5DB6\twei\n5DB7\tyi\n5DB8\trong\n5DB9\tdao\n5DBA\tling\n5DBB\tjie\n5DBC\tyu\n5DBD\tyue\n5DBE\tyin\n5DBF\tru\n5DC0\tjie\n5DC1\tli\n5DC2\tgui\n5DC3\tlong\n5DC4\tlong\n5DC5\tdian\n5DC6\trong\n5DC7\txi\n5DC8\tju\n5DC9\tchan\n5DCA\tying\n5DCB\tkui\n5DCC\tyan\n5DCD\twei\n5DCE\tnao\n5DCF\tquan\n5DD0\tchao\n5DD1\tcuan\n5DD2\tluan\n5DD3\tdian\n5DD4\tdian\n5DD5\tnie\n5DD6\tyan\n5DD7\tyan\n5DD8\tyan\n5DD9\tkui\n5DDA\tyan\n5DDB\tchuan\n5DDC\tkuai\n5DDD\tchuan\n5DDE\tzhou\n5DDF\thuang\n5DE0\tjing\n5DE1\txun\n5DE2\tchao\n5DE3\tchao\n5DE4\tlie\n5DE5\tgong\n5DE6\tzuo\n5DE7\tqiao\n5DE8\tju\n5DE9\tgong\n5DEA\tju\n5DEB\twu\n5DEC\tpu\n5DED\tpu\n5DEE\tcha\n5DEF\tqiu\n5DF0\tqiu\n5DF1\tji\n5DF2\tyi\n5DF3\tsi\n5DF4\tba\n5DF5\tzhi\n5DF6\tzhao\n5DF7\txiang\n5DF8\tyi\n5DF9\tjin\n5DFA\txun\n5DFB\tjuan\n5DFC\tba\n5DFD\txun\n5DFE\tjin\n5DFF\tfu\n5E00\tza\n5E01\tbi\n5E02\tshi\n5E03\tbu\n5E04\tding\n5E05\tshuai\n5E06\tfan\n5E07\tnie\n5E08\tshi\n5E09\tfen\n5E0A\tpa\n5E0B\tzhi\n5E0C\txi\n5E0D\thu\n5E0E\tdan\n5E0F\twei\n5E10\tzhang\n5E11\ttang\n5E12\tdai\n5E13\tmo\n5E14\tpei\n5E15\tpa\n5E16\ttie\n5E17\tbo\n5E18\tlian\n5E19\tzhi\n5E1A\tzhou\n5E1B\tbo\n5E1C\tzhi\n5E1D\tdi\n5E1E\tmo\n5E1F\tyi\n5E20\tyi\n5E21\tping\n5E22\tqia\n5E23\tjuan\n5E24\tru\n5E25\tshuai\n5E26\tdai\n5E27\tzhen\n5E28\tshui\n5E29\tqiao\n5E2A\tzhen\n5E2B\tshi\n5E2C\tqun\n5E2D\txi\n5E2E\tbang\n5E2F\tdai\n5E30\tgui\n5E31\tchou\n5E32\tping\n5E33\tzhang\n5E34\tsan\n5E35\twan\n5E36\tdai\n5E37\twei\n5E38\tchang\n5E39\tsha\n5E3A\tqi\n5E3B\tze\n5E3C\tguo\n5E3D\tmao\n5E3E\tdu\n5E3F\thou\n5E40\tzheng\n5E41\txu\n5E42\tmi\n5E43\twei\n5E44\two\n5E45\tfu\n5E46\tyi\n5E47\tbang\n5E48\tping\n5E49\tdie\n5E4A\tgong\n5E4B\tpan\n5E4C\thuang\n5E4D\ttao\n5E4E\tmi\n5E4F\tjia\n5E50\tteng\n5E51\thui\n5E52\tzhong\n5E53\tshan\n5E54\tman\n5E55\tmu\n5E56\tbiao\n5E57\tguo\n5E58\tze\n5E59\tmu\n5E5A\tbang\n5E5B\tzhang\n5E5C\tjing\n5E5D\tchan\n5E5E\tfu\n5E5F\tzhi\n5E60\thu\n5E61\tfan\n5E62\tchuang\n5E63\tbi\n5E64\tbi\n5E65\tzhang\n5E66\tmi\n5E67\tqiao\n5E68\tchan\n5E69\tfen\n5E6A\tmeng\n5E6B\tbang\n5E6C\tchou\n5E6D\tmie\n5E6E\tchu\n5E6F\tjie\n5E70\txian\n5E71\tlan\n5E72\tgan\n5E73\tping\n5E74\tnian\n5E75\tjian\n5E76\tbing\n5E77\tbing\n5E78\txing\n5E79\tgan\n5E7A\tyao\n5E7B\thuan\n5E7C\tyou\n5E7D\tyou\n5E7E\tji\n5E7F\tguang\n5E80\tpi\n5E81\tting\n5E82\tze\n5E83\tguang\n5E84\tzhuang\n5E85\tmo\n5E86\tqing\n5E87\tbi\n5E88\tqin\n5E89\tdun\n5E8A\tchuang\n5E8B\tgui\n5E8C\tya\n5E8D\tbai\n5E8E\tjie\n5E8F\txu\n5E90\tlu\n5E91\twu\n5E92\tzhuang\n5E93\tku\n5E94\tying\n5E95\tdi\n5E96\tpao\n5E97\tdian\n5E98\tya\n5E99\tmiao\n5E9A\tgeng\n5E9B\tci\n5E9C\tfu\n5E9D\ttong\n5E9E\tpang\n5E9F\tfei\n5EA0\txiang\n5EA1\tyi\n5EA2\tzhi\n5EA3\ttiao\n5EA4\tzhi\n5EA5\txiu\n5EA6\tdu\n5EA7\tzuo\n5EA8\txiao\n5EA9\ttu\n5EAA\tgui\n5EAB\tku\n5EAC\tmang\n5EAD\tting\n5EAE\tyou\n5EAF\tbu\n5EB0\tbing\n5EB1\tcheng\n5EB2\tlai\n5EB3\tbi\n5EB4\tji\n5EB5\tan\n5EB6\tshu\n5EB7\tkang\n5EB8\tyong\n5EB9\ttuo\n5EBA\tsong\n5EBB\tshu\n5EBC\tqing\n5EBD\tyu\n5EBE\tyu\n5EBF\tmiao\n5EC0\tsou\n5EC1\tce\n5EC2\txiang\n5EC3\tfei\n5EC4\tjiu\n5EC5\te\n5EC6\twei\n5EC7\tliu\n5EC8\tsha\n5EC9\tlian\n5ECA\tlang\n5ECB\tsou\n5ECC\tzhi\n5ECD\tbu\n5ECE\tqing\n5ECF\tjiu\n5ED0\tjiu\n5ED1\tjin\n5ED2\tao\n5ED3\tkuo\n5ED4\tlou\n5ED5\tyin\n5ED6\tliao\n5ED7\tdai\n5ED8\tlu\n5ED9\tyi\n5EDA\tchu\n5EDB\tchan\n5EDC\ttu\n5EDD\tsi\n5EDE\txin\n5EDF\tmiao\n5EE0\tchang\n5EE1\twu\n5EE2\tfei\n5EE3\tguang\n5EE4\tku\n5EE5\tkuai\n5EE6\tbi\n5EE7\tqiang\n5EE8\txie\n5EE9\tlin\n5EEA\tlin\n5EEB\tliao\n5EEC\tlu\n5EED\tji\n5EEE\tying\n5EEF\txian\n5EF0\tting\n5EF1\tyong\n5EF2\tli\n5EF3\tting\n5EF4\tyin\n5EF5\txun\n5EF6\tyan\n5EF7\tting\n5EF8\tdi\n5EF9\tpai\n5EFA\tjian\n5EFB\thui\n5EFC\tnai\n5EFD\thui\n5EFE\tgong\n5EFF\tnian\n5F00\tkai\n5F01\tbian\n5F02\tyi\n5F03\tqi\n5F04\tnong\n5F05\tfen\n5F06\tju\n5F07\tyan\n5F08\tyi\n5F09\tzang\n5F0A\tbi\n5F0B\tyi\n5F0C\tyi\n5F0D\ter\n5F0E\tsan\n5F0F\tshi\n5F10\ter\n5F11\tshi\n5F12\tshi\n5F13\tgong\n5F14\tdiao\n5F15\tyin\n5F16\thu\n5F17\tfu\n5F18\thong\n5F19\twu\n5F1A\ttui\n5F1B\tchi\n5F1C\tjiang\n5F1D\tba\n5F1E\tshen\n5F1F\tdi\n5F20\tzhang\n5F21\tjue\n5F22\ttao\n5F23\tfu\n5F24\tdi\n5F25\tmi\n5F26\txian\n5F27\thu\n5F28\tchao\n5F29\tnu\n5F2A\tjing\n5F2B\tzhen\n5F2C\tyi\n5F2D\tmi\n5F2E\tquan\n5F2F\twan\n5F30\tshao\n5F31\truo\n5F32\txuan\n5F33\tjing\n5F34\tdiao\n5F35\tzhang\n5F36\tjiang\n5F37\tqiang\n5F38\tpeng\n5F39\tdan\n5F3A\tqiang\n5F3B\tbi\n5F3C\tbi\n5F3D\tshe\n5F3E\tdan\n5F3F\tjian\n5F40\tgou\n5F41\tge\n5F42\tfa\n5F43\tbi\n5F44\tkou\n5F45\tjian\n5F46\tbie\n5F47\txiao\n5F48\tdan\n5F49\tguo\n5F4A\tjiang\n5F4B\thong\n5F4C\tmi\n5F4D\tguo\n5F4E\twan\n5F4F\tjue\n5F50\tji\n5F51\tji\n5F52\tgui\n5F53\tdang\n5F54\tlu\n5F55\tlu\n5F56\ttuan\n5F57\thui\n5F58\tzhi\n5F59\thui\n5F5A\thui\n5F5B\tyi\n5F5C\tyi\n5F5D\tyi\n5F5E\tyi\n5F5F\tyue\n5F60\tyue\n5F61\tshan\n5F62\txing\n5F63\twen\n5F64\ttong\n5F65\tyan\n5F66\tyan\n5F67\tyu\n5F68\tchi\n5F69\tcai\n5F6A\tbiao\n5F6B\tdiao\n5F6C\tbin\n5F6D\tpeng\n5F6E\tyong\n5F6F\tpiao\n5F70\tzhang\n5F71\tying\n5F72\tchi\n5F73\tchi\n5F74\tzhuo\n5F75\ttuo\n5F76\tji\n5F77\tpang\n5F78\tzhong\n5F79\tyi\n5F7A\twang\n5F7B\tche\n5F7C\tbi\n5F7D\tdi\n5F7E\tling\n5F7F\tfu\n5F80\twang\n5F81\tzheng\n5F82\tcu\n5F83\twang\n5F84\tjing\n5F85\tdai\n5F86\txi\n5F87\txun\n5F88\then\n5F89\tyang\n5F8A\thuai\n5F8B\tlu\n5F8C\thou\n5F8D\twang\n5F8E\tcheng\n5F8F\tzhi\n5F90\txu\n5F91\tjing\n5F92\ttu\n5F93\tcong\n5F94\tzhi\n5F95\tlai\n5F96\tcong\n5F97\tde\n5F98\tpai\n5F99\txi\n5F9A\tdong\n5F9B\tji\n5F9C\tchang\n5F9D\tzhi\n5F9E\tcong\n5F9F\tzhou\n5FA0\tlai\n5FA1\tyu\n5FA2\txie\n5FA3\tjie\n5FA4\tjian\n5FA5\tshi\n5FA6\tjia\n5FA7\tbian\n5FA8\thuang\n5FA9\tfu\n5FAA\txun\n5FAB\twei\n5FAC\tpang\n5FAD\tyao\n5FAE\twei\n5FAF\txi\n5FB0\tzheng\n5FB1\tpiao\n5FB2\tti\n5FB3\tde\n5FB4\tzheng\n5FB5\tzhi\n5FB6\tbie\n5FB7\tde\n5FB8\tchong\n5FB9\tche\n5FBA\tjiao\n5FBB\thui\n5FBC\tjiao\n5FBD\thui\n5FBE\tmei\n5FBF\tlong\n5FC0\txiang\n5FC1\tbao\n5FC2\tqu\n5FC3\txin\n5FC4\txin\n5FC5\tbi\n5FC6\tyi\n5FC7\tle\n5FC8\tren\n5FC9\tdao\n5FCA\tding\n5FCB\tgai\n5FCC\tji\n5FCD\tren\n5FCE\tren\n5FCF\tchan\n5FD0\ttan\n5FD1\tte\n5FD2\tte\n5FD3\tgan\n5FD4\tqi\n5FD5\tshi\n5FD6\tcun\n5FD7\tzhi\n5FD8\twang\n5FD9\tmang\n5FDA\txi\n5FDB\tfan\n5FDC\tying\n5FDD\ttian\n5FDE\tmin\n5FDF\twen\n5FE0\tzhong\n5FE1\tchong\n5FE2\twu\n5FE3\tji\n5FE4\twu\n5FE5\txi\n5FE6\tjia\n5FE7\tyou\n5FE8\twan\n5FE9\tcong\n5FEA\tsong\n5FEB\tkuai\n5FEC\tyu\n5FED\tbian\n5FEE\tzhi\n5FEF\tqi\n5FF0\tcui\n5FF1\tchen\n5FF2\ttai\n5FF3\ttun\n5FF4\tqian\n5FF5\tnian\n5FF6\thun\n5FF7\txiong\n5FF8\tniu\n5FF9\tkuang\n5FFA\txian\n5FFB\txin\n5FFC\tkang\n5FFD\thu\n5FFE\tkai\n5FFF\tfen\n6000\thuai\n6001\ttai\n6002\tsong\n6003\twu\n6004\tou\n6005\tchang\n6006\tchuang\n6007\tju\n6008\tyi\n6009\tbao\n600A\tchao\n600B\tmin\n600C\tpei\n600D\tzuo\n600E\tzen\n600F\tyang\n6010\tju\n6011\tban\n6012\tnu\n6013\tnao\n6014\tzheng\n6015\tpa\n6016\tbu\n6017\ttie\n6018\thu\n6019\thu\n601A\tju\n601B\tda\n601C\tlian\n601D\tsi\n601E\tchou\n601F\tdi\n6020\tdai\n6021\tyi\n6022\ttu\n6023\tyou\n6024\tfu\n6025\tji\n6026\tpeng\n6027\txing\n6028\tyuan\n6029\tni\n602A\tguai\n602B\tfu\n602C\txi\n602D\tbi\n602E\tyou\n602F\tqie\n6030\txuan\n6031\tcong\n6032\tbing\n6033\thuang\n6034\txu\n6035\tchu\n6036\tbi\n6037\tshu\n6038\txi\n6039\ttan\n603A\tyong\n603B\tzong\n603C\tdui\n603D\tmo\n603E\tzhi\n603F\tyi\n6040\tshi\n6041\tnen\n6042\txun\n6043\tshi\n6044\txi\n6045\tlao\n6046\theng\n6047\tkuang\n6048\tmou\n6049\tzhi\n604A\txie\n604B\tlian\n604C\ttiao\n604D\thuang\n604E\tdie\n604F\thao\n6050\tkong\n6051\tgui\n6052\theng\n6053\txi\n6054\tjiao\n6055\tshu\n6056\tsi\n6057\thu\n6058\tqiu\n6059\tyang\n605A\thui\n605B\thui\n605C\tchi\n605D\tjia\n605E\tyi\n605F\txiong\n6060\tguai\n6061\tlin\n6062\thui\n6063\tzi\n6064\txu\n6065\tchi\n6066\tshang\n6067\tnu\n6068\then\n6069\ten\n606A\tke\n606B\tdong\n606C\ttian\n606D\tgong\n606E\tquan\n606F\txi\n6070\tqia\n6071\tyue\n6072\tpeng\n6073\tken\n6074\tde\n6075\thui\n6076\te\n6077\txiao\n6078\ttong\n6079\tyan\n607A\tkai\n607B\tce\n607C\tnao\n607D\tyun\n607E\tmang\n607F\tyong\n6080\tyong\n6081\tyuan\n6082\tpi\n6083\tkun\n6084\tqiao\n6085\tyue\n6086\tyu\n6087\ttu\n6088\tjie\n6089\txi\n608A\tzhe\n608B\tlin\n608C\tti\n608D\than\n608E\thao\n608F\tqie\n6090\tti\n6091\tbu\n6092\tyi\n6093\tqian\n6094\thui\n6095\txi\n6096\tbei\n6097\tman\n6098\tyi\n6099\theng\n609A\tsong\n609B\tquan\n609C\tcheng\n609D\tkui\n609E\twu\n609F\twu\n60A0\tyou\n60A1\tli\n60A2\tliang\n60A3\thuan\n60A4\tcong\n60A5\tyi\n60A6\tyue\n60A7\tli\n60A8\tnin\n60A9\tnao\n60AA\te\n60AB\tque\n60AC\txuan\n60AD\tqian\n60AE\twu\n60AF\tmin\n60B0\tcong\n60B1\tfei\n60B2\tbei\n60B3\tde\n60B4\tcui\n60B5\tchang\n60B6\tmen\n60B7\tli\n60B8\tji\n60B9\tguan\n60BA\tguan\n60BB\txing\n60BC\tdao\n60BD\tqi\n60BE\tkong\n60BF\ttian\n60C0\tlun\n60C1\txi\n60C2\tkan\n60C3\tgun\n60C4\tni\n60C5\tqing\n60C6\tchou\n60C7\tdun\n60C8\tguo\n60C9\tzhan\n60CA\tjing\n60CB\twan\n60CC\tyuan\n60CD\tjin\n60CE\tji\n60CF\tlan\n60D0\tyu\n60D1\thuo\n60D2\the\n60D3\tquan\n60D4\ttan\n60D5\tti\n60D6\tti\n60D7\tnie\n60D8\twang\n60D9\tchuo\n60DA\thu\n60DB\thun\n60DC\txi\n60DD\tchang\n60DE\txin\n60DF\twei\n60E0\thui\n60E1\te\n60E2\tsuo\n60E3\tzong\n60E4\tjian\n60E5\tyong\n60E6\tdian\n60E7\tju\n60E8\tcan\n60E9\tcheng\n60EA\tde\n60EB\tbei\n60EC\tqie\n60ED\tcan\n60EE\tdan\n60EF\tguan\n60F0\tduo\n60F1\tnao\n60F2\tyun\n60F3\txiang\n60F4\tzhui\n60F5\tdie\n60F6\thuang\n60F7\tchun\n60F8\tqiong\n60F9\tre\n60FA\txing\n60FB\tce\n60FC\tbian\n60FD\tmin\n60FE\tzong\n60FF\tti\n6100\tqiao\n6101\tchou\n6102\tbei\n6103\txuan\n6104\twei\n6105\tge\n6106\tqian\n6107\twei\n6108\tyu\n6109\tyu\n610A\tbi\n610B\txuan\n610C\thuan\n610D\tmin\n610E\tbi\n610F\tyi\n6110\tmian\n6111\tyong\n6112\tkai\n6113\tdang\n6114\tyin\n6115\te\n6116\tchen\n6117\tmao\n6118\tqia\n6119\tke\n611A\tyu\n611B\tai\n611C\tqie\n611D\tyan\n611E\tnuo\n611F\tgan\n6120\tyun\n6121\tzong\n6122\tsai\n6123\tleng\n6124\tfen\n6125\tying\n6126\tkui\n6127\tkui\n6128\tque\n6129\tgong\n612A\tyun\n612B\tsu\n612C\tsu\n612D\tqi\n612E\tyao\n612F\tsong\n6130\thuang\n6131\tji\n6132\tgu\n6133\tju\n6134\tchuang\n6135\tni\n6136\txie\n6137\tkai\n6138\tzheng\n6139\tyong\n613A\tcao\n613B\txun\n613C\tshen\n613D\tbo\n613E\tkai\n613F\tyuan\n6140\txi\n6141\thun\n6142\tyong\n6143\tyang\n6144\tli\n6145\tsao\n6146\ttao\n6147\tyin\n6148\tci\n6149\txu\n614A\tqian\n614B\ttai\n614C\thuang\n614D\tyun\n614E\tshen\n614F\tming\n6150\tgong\n6151\tshe\n6152\tcong\n6153\tpiao\n6154\tmu\n6155\tmu\n6156\tguo\n6157\tchi\n6158\tcan\n6159\tcan\n615A\tcan\n615B\tcui\n615C\tmin\n615D\tte\n615E\tzhang\n615F\ttong\n6160\tao\n6161\tshuang\n6162\tman\n6163\tguan\n6164\tque\n6165\tzao\n6166\tjiu\n6167\thui\n6168\tkai\n6169\tlian\n616A\tou\n616B\tsong\n616C\tqin\n616D\tyin\n616E\tlu\n616F\tshang\n6170\twei\n6171\ttuan\n6172\tman\n6173\tqian\n6174\tshe\n6175\tyong\n6176\tqing\n6177\tkang\n6178\tdi\n6179\tzhi\n617A\tlou\n617B\tjuan\n617C\tqi\n617D\tqi\n617E\tyu\n617F\tping\n6180\tliao\n6181\tcong\n6182\tyou\n6183\tchong\n6184\tzhi\n6185\ttong\n6186\tcheng\n6187\tqi\n6188\tqu\n6189\tpeng\n618A\tbei\n618B\tbie\n618C\tqiong\n618D\tjiao\n618E\tzeng\n618F\tchi\n6190\tlian\n6191\tping\n6192\tkui\n6193\thui\n6194\tqiao\n6195\tcheng\n6196\tyin\n6197\tyin\n6198\txi\n6199\txi\n619A\tdan\n619B\ttan\n619C\tduo\n619D\tdui\n619E\tdui\n619F\tsu\n61A0\tjue\n61A1\tce\n61A2\txiao\n61A3\tfan\n61A4\tfen\n61A5\tlao\n61A6\tlao\n61A7\tchong\n61A8\than\n61A9\tqi\n61AA\txian\n61AB\tmin\n61AC\tjing\n61AD\tliao\n61AE\twu\n61AF\tcan\n61B0\tjue\n61B1\tcu\n61B2\txian\n61B3\ttan\n61B4\tsheng\n61B5\tpi\n61B6\tyi\n61B7\tchu\n61B8\txian\n61B9\tnao\n61BA\tdan\n61BB\ttan\n61BC\tjing\n61BD\tsong\n61BE\than\n61BF\tjiao\n61C0\twei\n61C1\txuan\n61C2\tdong\n61C3\tqin\n61C4\tqin\n61C5\tju\n61C6\tcao\n61C7\tken\n61C8\txie\n61C9\tying\n61CA\tao\n61CB\tmao\n61CC\tyi\n61CD\tlin\n61CE\tse\n61CF\tjun\n61D0\thuai\n61D1\tmen\n61D2\tlan\n61D3\tai\n61D4\tlin\n61D5\tyan\n61D6\tkuo\n61D7\txia\n61D8\tchi\n61D9\tyu\n61DA\tyin\n61DB\tdai\n61DC\tmeng\n61DD\tai\n61DE\tmeng\n61DF\tdui\n61E0\tqi\n61E1\tmo\n61E2\tlan\n61E3\tmen\n61E4\tchou\n61E5\tzhi\n61E6\tnuo\n61E7\tnuo\n61E8\tyan\n61E9\tyang\n61EA\tbo\n61EB\tzhi\n61EC\tkuang\n61ED\tkuang\n61EE\tyou\n61EF\tfu\n61F0\tliu\n61F1\tmie\n61F2\tcheng\n61F3\thui\n61F4\tchan\n61F5\tmeng\n61F6\tlan\n61F7\thuai\n61F8\txuan\n61F9\trang\n61FA\tchan\n61FB\tji\n61FC\tju\n61FD\thuan\n61FE\tshe\n61FF\tyi\n6200\tlian\n6201\tnan\n6202\tmi\n6203\ttang\n6204\tjue\n6205\tgang\n6206\tgang\n6207\tzhuang\n6208\tge\n6209\tyue\n620A\twu\n620B\tjian\n620C\txu\n620D\tshu\n620E\trong\n620F\txi\n6210\tcheng\n6211\two\n6212\tjie\n6213\tge\n6214\tjian\n6215\tqiang\n6216\thuo\n6217\tqiang\n6218\tzhan\n6219\tdong\n621A\tqi\n621B\tjia\n621C\tdie\n621D\tzei\n621E\tjia\n621F\tji\n6220\tzhi\n6221\tkan\n6222\tji\n6223\tkui\n6224\tgai\n6225\tdeng\n6226\tzhan\n6227\tqiang\n6228\tge\n6229\tjian\n622A\tjie\n622B\tyu\n622C\tjian\n622D\tyan\n622E\tlu\n622F\thu\n6230\tzhan\n6231\txi\n6232\txi\n6233\tchuo\n6234\tdai\n6235\tqu\n6236\thu\n6237\thu\n6238\thu\n6239\te\n623A\tshi\n623B\tti\n623C\tmao\n623D\thu\n623E\tli\n623F\tfang\n6240\tsuo\n6241\tbian\n6242\tdian\n6243\tjiong\n6244\tshang\n6245\tyi\n6246\tyi\n6247\tshan\n6248\thu\n6249\tfei\n624A\tyan\n624B\tshou\n624C\tshou\n624D\tcai\n624E\tzha\n624F\tqiu\n6250\tle\n6251\tpu\n6252\tba\n6253\tda\n6254\treng\n6255\tfan\n6256\tru\n6257\tzai\n6258\ttuo\n6259\tzhang\n625A\tdiao\n625B\tkang\n625C\tyu\n625D\tku\n625E\than\n625F\tshen\n6260\tcha\n6261\ttuo\n6262\tgu\n6263\tkou\n6264\twu\n6265\tden\n6266\tqian\n6267\tzhi\n6268\tren\n6269\tkuo\n626A\tmen\n626B\tsao\n626C\tyang\n626D\tniu\n626E\tban\n626F\tche\n6270\trao\n6271\txi\n6272\tqian\n6273\tban\n6274\tjia\n6275\tyu\n6276\tfu\n6277\tao\n6278\txi\n6279\tpi\n627A\tzhi\n627B\tzhi\n627C\te\n627D\tden\n627E\tzhao\n627F\tcheng\n6280\tji\n6281\tyan\n6282\tkuang\n6283\tbian\n6284\tchao\n6285\tju\n6286\twen\n6287\thu\n6288\tyue\n6289\tjue\n628A\tba\n628B\tqin\n628C\tdan\n628D\tzheng\n628E\tyun\n628F\twan\n6290\tne\n6291\tyi\n6292\tshu\n6293\tzhua\n6294\tpou\n6295\ttou\n6296\tdou\n6297\tkang\n6298\tzhe\n6299\tpou\n629A\tfu\n629B\tpao\n629C\tba\n629D\tao\n629E\tze\n629F\ttuan\n62A0\tkou\n62A1\tlun\n62A2\tqiang\n62A3\tyun\n62A4\thu\n62A5\tbao\n62A6\tbing\n62A7\tzhi\n62A8\tpeng\n62A9\tnan\n62AA\tbu\n62AB\tpi\n62AC\ttai\n62AD\tyao\n62AE\tzhen\n62AF\tzha\n62B0\tyang\n62B1\tbao\n62B2\the\n62B3\tni\n62B4\tye\n62B5\tdi\n62B6\tchi\n62B7\tpi\n62B8\tjia\n62B9\tmo\n62BA\tmei\n62BB\tchen\n62BC\tya\n62BD\tchou\n62BE\tqu\n62BF\tmin\n62C0\tchu\n62C1\tjia\n62C2\tfu\n62C3\tzha\n62C4\tzhu\n62C5\tdan\n62C6\tchai\n62C7\tmu\n62C8\tnian\n62C9\tla\n62CA\tfu\n62CB\tpao\n62CC\tban\n62CD\tpai\n62CE\tlin\n62CF\tna\n62D0\tguai\n62D1\tqian\n62D2\tju\n62D3\tta\n62D4\tba\n62D5\ttuo\n62D6\ttuo\n62D7\tao\n62D8\tju\n62D9\tzhuo\n62DA\tpan\n62DB\tzhao\n62DC\tbai\n62DD\tbai\n62DE\tdi\n62DF\tni\n62E0\tju\n62E1\tkuo\n62E2\tlong\n62E3\tjian\n62E4\tqia\n62E5\tyong\n62E6\tlan\n62E7\tning\n62E8\tbo\n62E9\tze\n62EA\tqian\n62EB\then\n62EC\tkuo\n62ED\tshi\n62EE\tjie\n62EF\tzheng\n62F0\tnin\n62F1\tgong\n62F2\tgong\n62F3\tquan\n62F4\tshuan\n62F5\tcun\n62F6\tza\n62F7\tkao\n62F8\tyi\n62F9\txie\n62FA\tce\n62FB\thui\n62FC\tpin\n62FD\tzhuai\n62FE\tshi\n62FF\tna\n6300\tbai\n6301\tchi\n6302\tgua\n6303\tzhi\n6304\tkuo\n6305\tduo\n6306\tduo\n6307\tzhi\n6308\tqie\n6309\tan\n630A\tnong\n630B\tzhen\n630C\tge\n630D\tjiao\n630E\tkua\n630F\tdong\n6310\tna\n6311\ttiao\n6312\tlie\n6313\tzha\n6314\tlu\n6315\tdie\n6316\twa\n6317\tjue\n6318\tlie\n6319\tju\n631A\tzhi\n631B\tluan\n631C\tya\n631D\two\n631E\tta\n631F\txie\n6320\tnao\n6321\tdang\n6322\tjiao\n6323\tzheng\n6324\tji\n6325\thui\n6326\txian\n6327\tyu\n6328\tai\n6329\ttuo\n632A\tnuo\n632B\tcuo\n632C\tbo\n632D\tgeng\n632E\tti\n632F\tzhen\n6330\tcheng\n6331\tsa\n6332\tsa\n6333\tkeng\n6334\tmei\n6335\tnong\n6336\tju\n6337\tpeng\n6338\tjian\n6339\tyi\n633A\tting\n633B\tshan\n633C\trua\n633D\twan\n633E\txie\n633F\tcha\n6340\tfeng\n6341\tjiao\n6342\twu\n6343\tjun\n6344\tjiu\n6345\ttong\n6346\tkun\n6347\thuo\n6348\ttu\n6349\tzhuo\n634A\tpou\n634B\tlu\n634C\tba\n634D\than\n634E\tshao\n634F\tnie\n6350\tjuan\n6351\tze\n6352\tshu\n6353\tye\n6354\tjue\n6355\tbu\n6356\twan\n6357\tbu\n6358\tzun\n6359\tye\n635A\tzhai\n635B\tlu\n635C\tsou\n635D\ttuo\n635E\tlao\n635F\tsun\n6360\tbang\n6361\tjian\n6362\thuan\n6363\tdao\n6364\twei\n6365\twan\n6366\tqin\n6367\tpeng\n6368\tshe\n6369\tlie\n636A\tmin\n636B\tmen\n636C\tfu\n636D\tbai\n636E\tju\n636F\tdao\n6370\two\n6371\tai\n6372\tjuan\n6373\tyue\n6374\tzong\n6375\tchen\n6376\tchui\n6377\tjie\n6378\ttu\n6379\tben\n637A\tna\n637B\tnian\n637C\truo\n637D\tzuo\n637E\two\n637F\tqi\n6380\txian\n6381\tcheng\n6382\tdian\n6383\tsao\n6384\tlun\n6385\tqing\n6386\tgang\n6387\tduo\n6388\tshou\n6389\tdiao\n638A\tpou\n638B\tdi\n638C\tzhang\n638D\thun\n638E\tji\n638F\ttao\n6390\tqia\n6391\tqi\n6392\tpai\n6393\tshu\n6394\tqian\n6395\tling\n6396\tye\n6397\tya\n6398\tjue\n6399\tzheng\n639A\tliang\n639B\tgua\n639C\tyi\n639D\thuo\n639E\tyan\n639F\tzheng\n63A0\tlue\n63A1\tcai\n63A2\ttan\n63A3\tche\n63A4\tbing\n63A5\tjie\n63A6\tti\n63A7\tkong\n63A8\ttui\n63A9\tyan\n63AA\tcuo\n63AB\tzhou\n63AC\tju\n63AD\ttian\n63AE\tqian\n63AF\tken\n63B0\tbai\n63B1\tpa\n63B2\tjie\n63B3\tlu\n63B4\tguai\n63B5\tming\n63B6\tjie\n63B7\tzhi\n63B8\tdan\n63B9\tmeng\n63BA\tchan\n63BB\tsao\n63BC\tguan\n63BD\tpeng\n63BE\tyuan\n63BF\tnuo\n63C0\tjian\n63C1\tzheng\n63C2\tjiu\n63C3\tjian\n63C4\tyu\n63C5\tyan\n63C6\tkui\n63C7\tnan\n63C8\thong\n63C9\trou\n63CA\tpi\n63CB\twei\n63CC\tsai\n63CD\tzou\n63CE\txuan\n63CF\tmiao\n63D0\tti\n63D1\tnie\n63D2\tcha\n63D3\tshi\n63D4\tzong\n63D5\tzhen\n63D6\tyi\n63D7\txun\n63D8\tyong\n63D9\tbian\n63DA\tyang\n63DB\thuan\n63DC\tyan\n63DD\tzan\n63DE\tan\n63DF\txu\n63E0\tya\n63E1\two\n63E2\tke\n63E3\tchuai\n63E4\tji\n63E5\tti\n63E6\tla\n63E7\tla\n63E8\tchen\n63E9\tkai\n63EA\tjiu\n63EB\tjiu\n63EC\ttu\n63ED\tjie\n63EE\thui\n63EF\tgen\n63F0\tchong\n63F1\txiao\n63F2\tdie\n63F3\txie\n63F4\tyuan\n63F5\tqian\n63F6\tye\n63F7\tcha\n63F8\tzha\n63F9\tbei\n63FA\tyao\n63FB\twei\n63FC\tbeng\n63FD\tlan\n63FE\twen\n63FF\tqin\n6400\tchan\n6401\tge\n6402\tlou\n6403\tzong\n6404\tgen\n6405\tjiao\n6406\tgou\n6407\tqin\n6408\trong\n6409\tque\n640A\tchou\n640B\tchuai\n640C\tzhan\n640D\tsun\n640E\tsun\n640F\tbo\n6410\tchu\n6411\trong\n6412\tbang\n6413\tcuo\n6414\tsao\n6415\tke\n6416\tyao\n6417\tdao\n6418\tzhi\n6419\tnu\n641A\tla\n641B\tjian\n641C\tsou\n641D\tqiu\n641E\tgao\n641F\txian\n6420\tshuo\n6421\tsang\n6422\tjin\n6423\tmie\n6424\te\n6425\tchui\n6426\tnuo\n6427\tshan\n6428\tta\n6429\tzha\n642A\ttang\n642B\tpan\n642C\tban\n642D\tda\n642E\tli\n642F\ttao\n6430\thu\n6431\tzhi\n6432\twa\n6433\thua\n6434\tqian\n6435\twen\n6436\tqiang\n6437\ttian\n6438\tzhen\n6439\te\n643A\txie\n643B\tnuo\n643C\tquan\n643D\tcha\n643E\tzha\n643F\tge\n6440\twu\n6441\ten\n6442\tshe\n6443\tkang\n6444\tshe\n6445\tshu\n6446\tbai\n6447\tyao\n6448\tbin\n6449\tsou\n644A\ttan\n644B\tsa\n644C\tchan\n644D\tsuo\n644E\tjiu\n644F\tchong\n6450\tchuang\n6451\tguai\n6452\tbing\n6453\tfeng\n6454\tshuai\n6455\tdi\n6456\tqi\n6457\tsou\n6458\tzhai\n6459\tlian\n645A\tcheng\n645B\tchi\n645C\tguan\n645D\tlu\n645E\tluo\n645F\tlou\n6460\tzong\n6461\tgai\n6462\thu\n6463\tzha\n6464\tchuang\n6465\ttang\n6466\thua\n6467\tcui\n6468\tnai\n6469\tmo\n646A\tjiang\n646B\tgui\n646C\tying\n646D\tzhi\n646E\tao\n646F\tzhi\n6470\tnie\n6471\tman\n6472\tchan\n6473\tkou\n6474\tchu\n6475\tshe\n6476\ttuan\n6477\tjiao\n6478\tmo\n6479\tmo\n647A\tzhe\n647B\tcan\n647C\tkeng\n647D\tbiao\n647E\tjiang\n647F\tyao\n6480\tgou\n6481\tqian\n6482\tliao\n6483\tji\n6484\tying\n6485\tjue\n6486\tpie\n6487\tpie\n6488\tlao\n6489\tdun\n648A\txian\n648B\truan\n648C\tgui\n648D\tzan\n648E\tyi\n648F\txian\n6490\tcheng\n6491\tcheng\n6492\tsa\n6493\tnao\n6494\thong\n6495\tsi\n6496\than\n6497\tguang\n6498\tda\n6499\tzun\n649A\tnian\n649B\tlin\n649C\tzheng\n649D\thui\n649E\tzhuang\n649F\tjiao\n64A0\tji\n64A1\tcao\n64A2\tdan\n64A3\tdan\n64A4\tche\n64A5\tbo\n64A6\tche\n64A7\tjue\n64A8\tfu\n64A9\tliao\n64AA\tben\n64AB\tfu\n64AC\tqiao\n64AD\tbo\n64AE\tcuo\n64AF\tzhuo\n64B0\tzhuan\n64B1\twei\n64B2\tpu\n64B3\tqin\n64B4\tdun\n64B5\tnian\n64B6\thua\n64B7\txie\n64B8\tlu\n64B9\tjiao\n64BA\tcuan\n64BB\tta\n64BC\than\n64BD\tqiao\n64BE\two\n64BF\tjian\n64C0\tgan\n64C1\tyong\n64C2\tlei\n64C3\tnang\n64C4\tlu\n64C5\tshan\n64C6\tzhuo\n64C7\tze\n64C8\tpu\n64C9\tchuo\n64CA\tji\n64CB\tdang\n64CC\tse\n64CD\tcao\n64CE\tqing\n64CF\tqing\n64D0\thuan\n64D1\tjie\n64D2\tqin\n64D3\tkuai\n64D4\tdan\n64D5\txie\n64D6\tka\n64D7\tpi\n64D8\tbo\n64D9\tao\n64DA\tju\n64DB\tye\n64DC\te\n64DD\tmeng\n64DE\tsou\n64DF\tmi\n64E0\tji\n64E1\ttai\n64E2\tzhuo\n64E3\tdao\n64E4\txing\n64E5\tlan\n64E6\tca\n64E7\tju\n64E8\tye\n64E9\tru\n64EA\tye\n64EB\tye\n64EC\tni\n64ED\two\n64EE\tjie\n64EF\tbin\n64F0\tning\n64F1\tge\n64F2\tzhi\n64F3\tzhi\n64F4\tkuo\n64F5\tmo\n64F6\tjian\n64F7\txie\n64F8\tlie\n64F9\ttan\n64FA\tbai\n64FB\tsou\n64FC\tlu\n64FD\tlue\n64FE\trao\n64FF\tti\n6500\tpan\n6501\tyang\n6502\tlei\n6503\tca\n6504\tshu\n6505\tzan\n6506\tnian\n6507\txian\n6508\tjun\n6509\thuo\n650A\tli\n650B\tla\n650C\thuan\n650D\tying\n650E\tlu\n650F\tlong\n6510\tqian\n6511\tqian\n6512\tzan\n6513\tqian\n6514\tlan\n6515\txian\n6516\tying\n6517\tmei\n6518\trang\n6519\tchan\n651A\tweng\n651B\tcuan\n651C\txie\n651D\tshe\n651E\tluo\n651F\tjun\n6520\tmi\n6521\tchi\n6522\tzan\n6523\tluan\n6524\ttan\n6525\tzuan\n6526\tli\n6527\tdian\n6528\twa\n6529\tdang\n652A\tjiao\n652B\tjue\n652C\tlan\n652D\tli\n652E\tnang\n652F\tzhi\n6530\tgui\n6531\tgui\n6532\tqi\n6533\txun\n6534\tpu\n6535\tpu\n6536\tshou\n6537\tkao\n6538\tyou\n6539\tgai\n653A\tyi\n653B\tgong\n653C\tgan\n653D\tban\n653E\tfang\n653F\tzheng\n6540\tpo\n6541\tdian\n6542\tkou\n6543\tmin\n6544\twu\n6545\tgu\n6546\the\n6547\tce\n6548\txiao\n6549\tmi\n654A\tchu\n654B\tge\n654C\tdi\n654D\txu\n654E\tjiao\n654F\tmin\n6550\tchen\n6551\tjiu\n6552\tshen\n6553\tduo\n6554\tyu\n6555\tchi\n6556\tao\n6557\tbai\n6558\txu\n6559\tjiao\n655A\tduo\n655B\tlian\n655C\tnie\n655D\tbi\n655E\tchang\n655F\tdian\n6560\tduo\n6561\tyi\n6562\tgan\n6563\tsan\n6564\tke\n6565\tyan\n6566\tdun\n6567\tji\n6568\ttou\n6569\txiao\n656A\tduo\n656B\tjiao\n656C\tjing\n656D\tyang\n656E\txia\n656F\tmin\n6570\tshu\n6571\tai\n6572\tqiao\n6573\tai\n6574\tzheng\n6575\tdi\n6576\tzhen\n6577\tfu\n6578\tshu\n6579\tliao\n657A\tqu\n657B\txiong\n657C\tyi\n657D\tjiao\n657E\tshan\n657F\tjiao\n6580\tzhuo\n6581\tyi\n6582\tlian\n6583\tbi\n6584\tli\n6585\txiao\n6586\txiao\n6587\twen\n6588\txue\n6589\tqi\n658A\tqi\n658B\tzhai\n658C\tbin\n658D\tjue\n658E\tzhai\n658F\tlang\n6590\tfei\n6591\tban\n6592\tban\n6593\tlan\n6594\tyu\n6595\tlan\n6596\twei\n6597\tdou\n6598\tsheng\n6599\tliao\n659A\tjia\n659B\thu\n659C\txie\n659D\tjia\n659E\tyu\n659F\tzhen\n65A0\tjiao\n65A1\two\n65A2\ttiao\n65A3\tdou\n65A4\tjin\n65A5\tchi\n65A6\tyin\n65A7\tfu\n65A8\tqiang\n65A9\tzhan\n65AA\tqu\n65AB\tzhuo\n65AC\tzhan\n65AD\tduan\n65AE\tcuo\n65AF\tsi\n65B0\txin\n65B1\tzhuo\n65B2\tzhuo\n65B3\tqin\n65B4\tlin\n65B5\tzhuo\n65B6\tchu\n65B7\tduan\n65B8\tzhu\n65B9\tfang\n65BA\tchan\n65BB\thang\n65BC\tyu\n65BD\tshi\n65BE\tpei\n65BF\tyou\n65C0\tmei\n65C1\tpang\n65C2\tqi\n65C3\tzhan\n65C4\tmao\n65C5\tlu\n65C6\tpei\n65C7\tpi\n65C8\tliu\n65C9\tfu\n65CA\tfang\n65CB\txuan\n65CC\tjing\n65CD\tjing\n65CE\tni\n65CF\tzu\n65D0\tzhao\n65D1\tyi\n65D2\tliu\n65D3\tshao\n65D4\tjian\n65D5\tyu\n65D6\tyi\n65D7\tqi\n65D8\tzhi\n65D9\tfan\n65DA\tpiao\n65DB\tfan\n65DC\tzhan\n65DD\tkuai\n65DE\tsui\n65DF\tyu\n65E0\twu\n65E1\tji\n65E2\tji\n65E3\tji\n65E4\thuo\n65E5\tri\n65E6\tdan\n65E7\tjiu\n65E8\tzhi\n65E9\tzao\n65EA\txie\n65EB\ttiao\n65EC\txun\n65ED\txu\n65EE\tga\n65EF\tla\n65F0\tgan\n65F1\than\n65F2\ttai\n65F3\tdi\n65F4\txu\n65F5\tchan\n65F6\tshi\n65F7\tkuang\n65F8\tyang\n65F9\tshi\n65FA\twang\n65FB\tmin\n65FC\tmin\n65FD\ttun\n65FE\tchun\n65FF\twu\n6600\tyun\n6601\tbei\n6602\tang\n6603\tze\n6604\tban\n6605\tjie\n6606\tkun\n6607\tsheng\n6608\thu\n6609\tfang\n660A\thao\n660B\tgui\n660C\tchang\n660D\txuan\n660E\tming\n660F\thun\n6610\tfen\n6611\tqin\n6612\thu\n6613\tyi\n6614\txi\n6615\txin\n6616\tyan\n6617\tze\n6618\tfang\n6619\ttan\n661A\tshen\n661B\tju\n661C\tyang\n661D\tzan\n661E\tbing\n661F\txing\n6620\tying\n6621\txuan\n6622\tpo\n6623\tzhen\n6624\tling\n6625\tchun\n6626\thao\n6627\tmei\n6628\tzuo\n6629\tmo\n662A\tbian\n662B\txu\n662C\thun\n662D\tzhao\n662E\tzong\n662F\tshi\n6630\tshi\n6631\tyu\n6632\tfei\n6633\tdie\n6634\tmao\n6635\tni\n6636\tchang\n6637\twen\n6638\tdong\n6639\tai\n663A\tbing\n663B\tang\n663C\tzhou\n663D\tlong\n663E\txian\n663F\tkuang\n6640\ttiao\n6641\tchao\n6642\tshi\n6643\thuang\n6644\thuang\n6645\txuan\n6646\tkui\n6647\txu\n6648\tjiao\n6649\tjin\n664A\tzhi\n664B\tjin\n664C\tshang\n664D\ttong\n664E\thong\n664F\tyan\n6650\tgai\n6651\txiang\n6652\tshai\n6653\txiao\n6654\tye\n6655\tyun\n6656\thui\n6657\than\n6658\than\n6659\tjun\n665A\twan\n665B\txian\n665C\tkun\n665D\tzhou\n665E\txi\n665F\tcheng\n6660\tsheng\n6661\tbu\n6662\tzhe\n6663\tzhe\n6664\twu\n6665\twan\n6666\thui\n6667\thao\n6668\tchen\n6669\twan\n666A\ttian\n666B\tzhuo\n666C\tzui\n666D\tzhou\n666E\tpu\n666F\tjing\n6670\txi\n6671\tshan\n6672\tni\n6673\txi\n6674\tqing\n6675\tqi\n6676\tjing\n6677\tgui\n6678\tzheng\n6679\tyi\n667A\tzhi\n667B\tan\n667C\twan\n667D\tlin\n667E\tliang\n667F\tchang\n6680\twang\n6681\txiao\n6682\tzan\n6683\tfei\n6684\txuan\n6685\tgeng\n6686\tyi\n6687\txia\n6688\tyun\n6689\thui\n668A\txu\n668B\tmin\n668C\tkui\n668D\tye\n668E\tying\n668F\tshu\n6690\twei\n6691\tshu\n6692\tqing\n6693\tmao\n6694\tnan\n6695\tjian\n6696\tnuan\n6697\tan\n6698\tyang\n6699\tchun\n669A\tyao\n669B\tsuo\n669C\tpu\n669D\tming\n669E\tjiao\n669F\tkai\n66A0\tgao\n66A1\tweng\n66A2\tchang\n66A3\tqi\n66A4\thao\n66A5\tyan\n66A6\tli\n66A7\tai\n66A8\tji\n66A9\tji\n66AA\tmen\n66AB\tzan\n66AC\txie\n66AD\thao\n66AE\tmu\n66AF\tmo\n66B0\tcong\n66B1\tni\n66B2\tzhang\n66B3\thui\n66B4\tbao\n66B5\than\n66B6\txuan\n66B7\tchuan\n66B8\tliao\n66B9\txian\n66BA\ttan\n66BB\tjing\n66BC\tpie\n66BD\tlin\n66BE\ttun\n66BF\txi\n66C0\tyi\n66C1\tji\n66C2\thuang\n66C3\tdai\n66C4\tye\n66C5\tye\n66C6\tli\n66C7\ttan\n66C8\ttong\n66C9\txiao\n66CA\tfei\n66CB\tshen\n66CC\tzhao\n66CD\thao\n66CE\tyi\n66CF\txiang\n66D0\txing\n66D1\tshen\n66D2\tjiao\n66D3\tbao\n66D4\tjing\n66D5\tyan\n66D6\tai\n66D7\tye\n66D8\tru\n66D9\tshu\n66DA\tmeng\n66DB\txun\n66DC\tyao\n66DD\tpu\n66DE\tli\n66DF\tchen\n66E0\tkuang\n66E1\tdie\n66E2\tliao\n66E3\tyan\n66E4\thuo\n66E5\tlu\n66E6\txi\n66E7\trong\n66E8\tlong\n66E9\tnang\n66EA\tluo\n66EB\tluan\n66EC\tshai\n66ED\ttang\n66EE\tyan\n66EF\tzhu\n66F0\tyue\n66F1\tyue\n66F2\tqu\n66F3\tye\n66F4\tgeng\n66F5\tye\n66F6\thu\n66F7\the\n66F8\tshu\n66F9\tcao\n66FA\tcao\n66FB\tsheng\n66FC\tman\n66FD\tceng\n66FE\tceng\n66FF\tti\n6700\tzui\n6701\tcan\n6702\txu\n6703\thui\n6704\tyin\n6705\tqie\n6706\tfen\n6707\tpi\n6708\tyue\n6709\tyou\n670A\truan\n670B\tpeng\n670C\tfen\n670D\tfu\n670E\tling\n670F\tfei\n6710\tqu\n6711\tti\n6712\tnu\n6713\ttiao\n6714\tshuo\n6715\tzhen\n6716\tlang\n6717\tlang\n6718\tzui\n6719\tming\n671A\thuang\n671B\twang\n671C\ttun\n671D\tchao\n671E\tji\n671F\tqi\n6720\tying\n6721\tzong\n6722\twang\n6723\ttong\n6724\tlang\n6725\tlao\n6726\tmeng\n6727\tlong\n6728\tmu\n6729\tdeng\n672A\twei\n672B\tmo\n672C\tben\n672D\tzha\n672E\tshu\n672F\tshu\n6730\tmu\n6731\tzhu\n6732\tren\n6733\tba\n6734\tpu\n6735\tduo\n6736\tduo\n6737\tdao\n6738\tli\n6739\tgui\n673A\tji\n673B\tjiu\n673C\tbi\n673D\txiu\n673E\tcheng\n673F\tci\n6740\tsha\n6741\tru\n6742\tza\n6743\tquan\n6744\tqian\n6745\tyu\n6746\tgan\n6747\twu\n6748\tcha\n6749\tshan\n674A\txun\n674B\tfan\n674C\twu\n674D\tzi\n674E\tli\n674F\txing\n6750\tcai\n6751\tcun\n6752\tren\n6753\tbiao\n6754\ttuo\n6755\tdi\n6756\tzhang\n6757\tmang\n6758\tchi\n6759\tyi\n675A\tgai\n675B\tgong\n675C\tdu\n675D\tli\n675E\tqi\n675F\tshu\n6760\tgang\n6761\ttiao\n6762\tjie\n6763\tmian\n6764\twan\n6765\tlai\n6766\tjiu\n6767\tmang\n6768\tyang\n6769\tma\n676A\tmiao\n676B\tsi\n676C\tyuan\n676D\thang\n676E\tfei\n676F\tbei\n6770\tjie\n6771\tdong\n6772\tgao\n6773\tyao\n6774\txian\n6775\tchu\n6776\tchun\n6777\tpa\n6778\tshu\n6779\thua\n677A\txin\n677B\tchou\n677C\tzhu\n677D\tchou\n677E\tsong\n677F\tban\n6780\tsong\n6781\tji\n6782\two\n6783\tjin\n6784\tgou\n6785\tji\n6786\tmao\n6787\tpi\n6788\tbi\n6789\twang\n678A\tang\n678B\tfang\n678C\tfen\n678D\tyi\n678E\tfu\n678F\tnan\n6790\txi\n6791\thu\n6792\tya\n6793\tdou\n6794\txin\n6795\tzhen\n6796\tyao\n6797\tlin\n6798\trui\n6799\te\n679A\tmei\n679B\tzhao\n679C\tguo\n679D\tzhi\n679E\tcong\n679F\tyun\n67A0\thua\n67A1\tsheng\n67A2\tshu\n67A3\tzao\n67A4\tdi\n67A5\tli\n67A6\tlu\n67A7\tjian\n67A8\tcheng\n67A9\tsong\n67AA\tqiang\n67AB\tfeng\n67AC\tzhan\n67AD\txiao\n67AE\txian\n67AF\tku\n67B0\tping\n67B1\ttai\n67B2\txi\n67B3\tzhi\n67B4\tguai\n67B5\txiao\n67B6\tjia\n67B7\tjia\n67B8\tgou\n67B9\tbao\n67BA\tmo\n67BB\tyi\n67BC\tye\n67BD\tye\n67BE\tshi\n67BF\tnie\n67C0\tbi\n67C1\ttuo\n67C2\tyi\n67C3\tling\n67C4\tbing\n67C5\tni\n67C6\tla\n67C7\the\n67C8\tban\n67C9\tfan\n67CA\tzhong\n67CB\tdai\n67CC\tci\n67CD\tyang\n67CE\tfu\n67CF\tbai\n67D0\tmou\n67D1\tgan\n67D2\tqi\n67D3\tran\n67D4\trou\n67D5\tmao\n67D6\tshao\n67D7\tsong\n67D8\tzhe\n67D9\txia\n67DA\tyou\n67DB\tshen\n67DC\tgui\n67DD\ttuo\n67DE\tzha\n67DF\tnan\n67E0\tning\n67E1\tyong\n67E2\tdi\n67E3\tzhi\n67E4\tzha\n67E5\tcha\n67E6\tdan\n67E7\tgu\n67E8\tbu\n67E9\tjiu\n67EA\tao\n67EB\tfu\n67EC\tjian\n67ED\tba\n67EE\tduo\n67EF\tke\n67F0\tnai\n67F1\tzhu\n67F2\tbi\n67F3\tliu\n67F4\tchai\n67F5\tshan\n67F6\tsi\n67F7\tzhu\n67F8\tpei\n67F9\tshi\n67FA\tguai\n67FB\tzha\n67FC\tyao\n67FD\tcheng\n67FE\tjiu\n67FF\tshi\n6800\tzhi\n6801\tliu\n6802\tmei\n6803\tli\n6804\trong\n6805\tzha\n6806\tzao\n6807\tbiao\n6808\tzhan\n6809\tzhi\n680A\tlong\n680B\tdong\n680C\tlu\n680D\tsheng\n680E\tli\n680F\tlan\n6810\tyong\n6811\tshu\n6812\txun\n6813\tshuan\n6814\tqi\n6815\tzhen\n6816\tqi\n6817\tli\n6818\tyi\n6819\txiang\n681A\tzhen\n681B\tli\n681C\tse\n681D\tgua\n681E\tkan\n681F\tben\n6820\tren\n6821\txiao\n6822\tbai\n6823\tren\n6824\tbing\n6825\tzi\n6826\tchou\n6827\tyi\n6828\tci\n6829\txu\n682A\tzhu\n682B\tjian\n682C\tzui\n682D\ter\n682E\ter\n682F\tyou\n6830\tfa\n6831\tgong\n6832\tkao\n6833\tlao\n6834\tzhan\n6835\tlie\n6836\tyin\n6837\tyang\n6838\the\n6839\tgen\n683A\tyi\n683B\tshi\n683C\tge\n683D\tzai\n683E\tluan\n683F\tfu\n6840\tjie\n6841\theng\n6842\tgui\n6843\ttao\n6844\tguang\n6845\twei\n6846\tkuang\n6847\tru\n6848\tan\n6849\tan\n684A\tjuan\n684B\tyi\n684C\tzhuo\n684D\tku\n684E\tzhi\n684F\tqiong\n6850\ttong\n6851\tsang\n6852\tsang\n6853\thuan\n6854\tjie\n6855\tjiu\n6856\txue\n6857\tduo\n6858\tzhui\n6859\tyu\n685A\tzan\n685C\tying\n685D\tjie\n685E\tliu\n685F\tzhan\n6860\tya\n6861\trao\n6862\tzhen\n6863\tdang\n6864\tqi\n6865\tqiao\n6866\thua\n6867\tgui\n6868\tjiang\n6869\tzhuang\n686A\txun\n686B\tsuo\n686C\tsha\n686D\tzhen\n686E\tbei\n686F\tting\n6870\tkuo\n6871\tjing\n6872\tpo\n6873\tben\n6874\tfu\n6875\trui\n6876\ttong\n6877\tjue\n6878\txi\n6879\tlang\n687A\tliu\n687B\tfeng\n687C\tqi\n687D\twen\n687E\tjun\n687F\tgan\n6880\tsu\n6881\tliang\n6882\tqiu\n6883\tting\n6884\tyou\n6885\tmei\n6886\tbang\n6887\tlong\n6888\tpeng\n6889\tzhuang\n688A\tdi\n688B\txuan\n688C\ttu\n688D\tzao\n688E\tao\n688F\tgu\n6890\tbi\n6891\tdi\n6892\than\n6893\tzi\n6894\tzhi\n6895\tren\n6896\tbei\n6897\tgeng\n6898\tjian\n6899\thuan\n689A\twan\n689B\tnuo\n689C\tjia\n689D\ttiao\n689E\tji\n689F\txiao\n68A0\tlu\n68A1\thun\n68A2\tshao\n68A3\tchen\n68A4\tfen\n68A5\tsong\n68A6\tmeng\n68A7\twu\n68A8\tli\n68A9\tli\n68AA\tdou\n68AB\tqin\n68AC\tying\n68AD\tsuo\n68AE\tju\n68AF\tti\n68B0\txie\n68B1\tkun\n68B2\tzhuo\n68B3\tshu\n68B4\tchan\n68B5\tfan\n68B6\twei\n68B7\tjing\n68B8\tli\n68B9\tbin\n68BA\txia\n68BB\tfo\n68BC\ttao\n68BD\tzhi\n68BE\tlai\n68BF\tlian\n68C0\tjian\n68C1\tzhuo\n68C2\tling\n68C3\tli\n68C4\tqi\n68C5\tbing\n68C6\tlun\n68C7\tcong\n68C8\tqian\n68C9\tmian\n68CA\tqi\n68CB\tqi\n68CC\tcai\n68CD\tgun\n68CE\tchan\n68CF\tde\n68D0\tfei\n68D1\tpai\n68D2\tbang\n68D3\tbei\n68D4\thun\n68D5\tzong\n68D6\tcheng\n68D7\tzao\n68D8\tji\n68D9\tli\n68DA\tpeng\n68DB\tyu\n68DC\tyu\n68DD\tgu\n68DE\tjun\n68DF\tdong\n68E0\ttang\n68E1\tgang\n68E2\twang\n68E3\tdi\n68E4\tcuo\n68E5\tfan\n68E6\tcheng\n68E7\tzhan\n68E8\tqi\n68E9\tyuan\n68EA\tyan\n68EB\tyu\n68EC\tquan\n68ED\tyi\n68EE\tsen\n68EF\tren\n68F0\tchui\n68F1\tleng\n68F2\tqi\n68F3\tzhuo\n68F4\tfu\n68F5\tke\n68F6\tlai\n68F7\tzou\n68F8\tzou\n68F9\tzhao\n68FA\tguan\n68FB\tfen\n68FC\tfen\n68FD\tshen\n68FE\tqing\n68FF\tni\n6900\twan\n6901\tguo\n6902\tlu\n6903\thao\n6904\tjie\n6905\tyi\n6906\tchou\n6907\tju\n6908\tju\n6909\tcheng\n690A\tzuo\n690B\tliang\n690C\tqiang\n690D\tzhi\n690E\tzhui\n690F\tya\n6910\tju\n6911\tbei\n6912\tjiao\n6913\tzhuo\n6914\tzi\n6915\tbin\n6916\tpeng\n6917\tding\n6918\tchu\n6919\tchang\n691A\tmen\n691B\thua\n691C\tjian\n691D\tgui\n691E\txi\n691F\tdu\n6920\tqian\n6921\tdao\n6922\tgui\n6923\tdian\n6924\tluo\n6925\tzhi\n6926\tquan\n6927\tming\n6928\tfu\n6929\tgeng\n692A\tpeng\n692B\tshan\n692C\tyi\n692D\ttuo\n692E\tsen\n692F\tduo\n6930\tye\n6931\tfu\n6932\twei\n6933\twei\n6934\tduan\n6935\tjia\n6936\tzong\n6937\tjian\n6938\tyi\n6939\tshen\n693A\txi\n693B\tyan\n693C\tyan\n693D\tchuan\n693E\tjian\n693F\tchun\n6940\tyu\n6941\the\n6942\tzha\n6943\two\n6944\tpian\n6945\tbi\n6946\tyao\n6947\thuo\n6948\txu\n6949\truo\n694A\tyang\n694B\tla\n694C\tyan\n694D\tben\n694E\thui\n694F\tkui\n6950\tjie\n6951\tkui\n6952\tsi\n6953\tfeng\n6954\txie\n6955\ttuo\n6956\tzhi\n6957\tjian\n6958\tmu\n6959\tmao\n695A\tchu\n695B\thu\n695C\thu\n695D\tlian\n695E\tleng\n695F\tting\n6960\tnan\n6961\tyu\n6962\tyou\n6963\tmei\n6964\tsong\n6965\txuan\n6966\txuan\n6967\tyang\n6968\tzhen\n6969\tpian\n696A\tdie\n696B\tji\n696C\tjie\n696D\tye\n696E\tchu\n696F\tdun\n6970\tyu\n6971\tzou\n6972\twei\n6973\tmei\n6974\tti\n6975\tji\n6976\tjie\n6977\tkai\n6978\tqiu\n6979\tying\n697A\trou\n697B\thuang\n697C\tlou\n697D\tle\n697E\tquan\n697F\txiang\n6980\tpin\n6981\tshi\n6982\tgai\n6983\ttan\n6984\tlan\n6985\twen\n6986\tyu\n6987\tchen\n6988\tlu\n6989\tju\n698A\tshen\n698B\tchu\n698C\tbi\n698D\txie\n698E\tjia\n698F\tyi\n6990\tzhan\n6991\tfu\n6992\tnuo\n6993\tmi\n6994\tlang\n6995\trong\n6996\tgu\n6997\tjian\n6998\tju\n6999\tta\n699A\tyao\n699B\tzhen\n699C\tbang\n699D\tsha\n699E\tyuan\n699F\tzi\n69A0\tming\n69A1\tsu\n69A2\tjia\n69A3\tyao\n69A4\tjie\n69A5\thuang\n69A6\tgan\n69A7\tfei\n69A8\tzha\n69A9\tqian\n69AA\tma\n69AB\tsun\n69AC\tyuan\n69AD\txie\n69AE\trong\n69AF\tshi\n69B0\tzhi\n69B1\tcui\n69B2\twen\n69B3\tting\n69B4\tliu\n69B5\trong\n69B6\ttang\n69B7\tque\n69B8\tzhai\n69B9\tsi\n69BA\tsheng\n69BB\tta\n69BC\tke\n69BD\txi\n69BE\tgu\n69BF\tqi\n69C0\tgao\n69C1\tgao\n69C2\tsun\n69C3\tpan\n69C4\ttao\n69C5\tge\n69C6\tchun\n69C7\tdian\n69C8\tnou\n69C9\tji\n69CA\tshuo\n69CB\tgou\n69CC\tchui\n69CD\tqiang\n69CE\tcha\n69CF\tqian\n69D0\thuai\n69D1\tmei\n69D2\txu\n69D3\tgang\n69D4\tgao\n69D5\tzhuo\n69D6\ttuo\n69D7\tqiao\n69D8\tyang\n69D9\tdian\n69DA\tjia\n69DB\tkan\n69DC\tzui\n69DD\tdao\n69DE\tlong\n69DF\tbin\n69E0\tzhu\n69E1\tsang\n69E2\txi\n69E3\tji\n69E4\tlian\n69E5\thui\n69E6\tyong\n69E7\tqian\n69E8\tguo\n69E9\tgai\n69EA\tgai\n69EB\ttuan\n69EC\thua\n69ED\tqi\n69EE\tsen\n69EF\tcui\n69F0\tpeng\n69F1\tyou\n69F2\thu\n69F3\tjiang\n69F4\thu\n69F5\thuan\n69F6\tgui\n69F7\tnie\n69F8\tyi\n69F9\tgao\n69FA\tkang\n69FB\tgui\n69FC\tgui\n69FD\tcao\n69FE\tman\n69FF\tjin\n6A00\tdi\n6A01\tzhuang\n6A02\tle\n6A03\tlang\n6A04\tchen\n6A05\tcong\n6A06\tli\n6A07\txiu\n6A08\tqing\n6A09\tshuang\n6A0A\tfan\n6A0B\ttong\n6A0C\tguan\n6A0D\tze\n6A0E\tsu\n6A0F\tlei\n6A10\tlu\n6A11\tliang\n6A12\tmi\n6A13\tlou\n6A14\tchao\n6A15\tsu\n6A16\tke\n6A17\tchu\n6A18\ttang\n6A19\tbiao\n6A1A\tlu\n6A1B\tjiu\n6A1C\tzhe\n6A1D\tzha\n6A1E\tshu\n6A1F\tzhang\n6A20\tman\n6A21\tmo\n6A22\tniao\n6A23\tyang\n6A24\ttiao\n6A25\tpeng\n6A26\tzhu\n6A27\tsha\n6A28\txi\n6A29\tquan\n6A2A\theng\n6A2B\tjian\n6A2C\tcong\n6A2D\tji\n6A2E\tyan\n6A2F\tqiang\n6A30\txue\n6A31\tying\n6A32\ter\n6A33\txun\n6A34\tzhi\n6A35\tqiao\n6A36\tzui\n6A37\tcong\n6A38\tpu\n6A39\tshu\n6A3A\thua\n6A3B\tkui\n6A3C\tzhen\n6A3D\tzun\n6A3E\tyue\n6A3F\tshan\n6A40\txi\n6A41\tchun\n6A42\tdian\n6A43\tfa\n6A44\tgan\n6A45\tmo\n6A46\twu\n6A47\tqiao\n6A48\trao\n6A49\tlin\n6A4A\tliu\n6A4B\tqiao\n6A4C\txian\n6A4D\trun\n6A4E\tfan\n6A4F\tzhan\n6A50\ttuo\n6A51\tliao\n6A52\tyun\n6A53\tshun\n6A54\tdun\n6A55\tcheng\n6A56\ttang\n6A57\tmeng\n6A58\tju\n6A59\tcheng\n6A5A\tsu\n6A5B\tjue\n6A5C\tjue\n6A5D\tdian\n6A5E\thui\n6A5F\tji\n6A60\tnuo\n6A61\txiang\n6A62\ttuo\n6A63\tning\n6A64\trui\n6A65\tzhu\n6A66\ttong\n6A67\tzeng\n6A68\tfen\n6A69\tqiong\n6A6A\tran\n6A6B\theng\n6A6C\tqian\n6A6D\tgu\n6A6E\tliu\n6A6F\tlao\n6A70\tgao\n6A71\tchu\n6A72\txi\n6A73\tsheng\n6A74\tzi\n6A75\tsan\n6A76\tji\n6A77\tdou\n6A78\tjing\n6A79\tlu\n6A7A\tjian\n6A7B\tchu\n6A7C\tyuan\n6A7D\tta\n6A7E\tshu\n6A7F\tjiang\n6A80\ttan\n6A81\tlin\n6A82\tnong\n6A83\tyin\n6A84\txi\n6A85\thui\n6A86\tshan\n6A87\tzui\n6A88\txuan\n6A89\tcheng\n6A8A\tgan\n6A8B\tju\n6A8C\tzui\n6A8D\tyi\n6A8E\tqin\n6A8F\tpu\n6A90\tyan\n6A91\tlei\n6A92\tfeng\n6A93\thui\n6A94\tdang\n6A95\tji\n6A96\tsui\n6A97\tbo\n6A98\tping\n6A99\tcheng\n6A9A\tchu\n6A9B\tzhua\n6A9C\tgui\n6A9D\tji\n6A9E\tjie\n6A9F\tjia\n6AA0\tqing\n6AA1\tzhai\n6AA2\tjian\n6AA3\tqiang\n6AA4\tdao\n6AA5\tyi\n6AA6\tbiao\n6AA7\tsong\n6AA8\tshe\n6AA9\tlin\n6AAA\tli\n6AAB\tcha\n6AAC\tmeng\n6AAD\tyin\n6AAE\ttao\n6AAF\ttai\n6AB0\tmian\n6AB1\tqi\n6AB2\ttuan\n6AB3\tbin\n6AB4\thuo\n6AB5\tji\n6AB6\tqian\n6AB7\tni\n6AB8\tning\n6AB9\tyi\n6ABA\tgao\n6ABB\tkan\n6ABC\tyin\n6ABD\tnou\n6ABE\tqing\n6ABF\tyan\n6AC0\tqi\n6AC1\tmi\n6AC2\tzhao\n6AC3\tgui\n6AC4\tchun\n6AC5\tji\n6AC6\tkui\n6AC7\tpo\n6AC8\tdeng\n6AC9\tchu\n6ACA\tge\n6ACB\tmian\n6ACC\tyou\n6ACD\tzhi\n6ACE\thuang\n6ACF\tqian\n6AD0\tlei\n6AD1\tlei\n6AD2\tsa\n6AD3\tlu\n6AD4\tli\n6AD5\tcuan\n6AD6\tlu\n6AD7\tmie\n6AD8\thui\n6AD9\tou\n6ADA\tlu\n6ADB\tzhi\n6ADC\tgao\n6ADD\tdu\n6ADE\tyuan\n6ADF\tli\n6AE0\tfei\n6AE1\tzhuo\n6AE2\tsou\n6AE3\tlian\n6AE4\tjiang\n6AE5\tchu\n6AE6\tqing\n6AE7\tzhu\n6AE8\tlu\n6AE9\tyan\n6AEA\tli\n6AEB\tzhu\n6AEC\tchen\n6AED\tjie\n6AEE\te\n6AEF\tsu\n6AF0\thuai\n6AF1\tnie\n6AF2\tyu\n6AF3\tlong\n6AF4\tlai\n6AF5\tjiao\n6AF6\txian\n6AF7\tgui\n6AF8\tju\n6AF9\txiao\n6AFA\tling\n6AFB\tying\n6AFC\tjian\n6AFD\tyin\n6AFE\tyou\n6AFF\tying\n6B00\txiang\n6B01\tnong\n6B02\tbo\n6B03\tchan\n6B04\tlan\n6B05\tju\n6B06\tshuang\n6B07\tshe\n6B08\twei\n6B09\tcong\n6B0A\tquan\n6B0B\tqu\n6B0C\tcang\n6B0D\tjiu\n6B0E\tyu\n6B0F\tluo\n6B10\tli\n6B11\tcuan\n6B12\tluan\n6B13\tdang\n6B14\tjue\n6B15\tyan\n6B16\tlan\n6B17\tlan\n6B18\tzhu\n6B19\tlei\n6B1A\tli\n6B1B\tba\n6B1C\tnang\n6B1D\tyu\n6B1E\tling\n6B1F\tguang\n6B20\tqian\n6B21\tci\n6B22\thuan\n6B23\txin\n6B24\tyu\n6B25\tyi\n6B26\tqian\n6B27\tou\n6B28\txu\n6B29\tchao\n6B2A\tchu\n6B2B\tqi\n6B2C\tkai\n6B2D\tyi\n6B2E\tjue\n6B2F\txi\n6B30\txu\n6B31\the\n6B32\tyu\n6B33\tkui\n6B34\tlang\n6B35\tkuan\n6B36\tshuo\n6B37\txi\n6B38\tai\n6B39\tqi\n6B3A\tqi\n6B3B\txu\n6B3C\tchi\n6B3D\tqin\n6B3E\tkuan\n6B3F\tkan\n6B40\tkuan\n6B41\tkan\n6B42\tchuan\n6B43\tsha\n6B44\tgua\n6B45\tyin\n6B46\txin\n6B47\txie\n6B48\tyu\n6B49\tqian\n6B4A\txiao\n6B4B\tye\n6B4C\tge\n6B4D\twu\n6B4E\ttan\n6B4F\tjin\n6B50\tou\n6B51\thu\n6B52\tti\n6B53\thuan\n6B54\txu\n6B55\tpen\n6B56\txi\n6B57\txiao\n6B58\tchua\n6B59\tshe\n6B5A\tshan\n6B5B\than\n6B5C\tchu\n6B5D\tyi\n6B5E\te\n6B5F\tyu\n6B60\tchuo\n6B61\thuan\n6B62\tzhi\n6B63\tzheng\n6B64\tci\n6B65\tbu\n6B66\twu\n6B67\tqi\n6B68\tbu\n6B69\tbu\n6B6A\twai\n6B6B\tju\n6B6C\tqian\n6B6D\tchi\n6B6E\tse\n6B6F\tchi\n6B70\tse\n6B71\tzhong\n6B72\tsui\n6B73\tsui\n6B74\tli\n6B75\tze\n6B76\tyu\n6B77\tli\n6B78\tgui\n6B79\tdai\n6B7A\te\n6B7B\tsi\n6B7C\tjian\n6B7D\tzhe\n6B7E\tmo\n6B7F\tmo\n6B80\tyao\n6B81\tmo\n6B82\tcu\n6B83\tyang\n6B84\ttian\n6B85\tsheng\n6B86\tdai\n6B87\tshang\n6B88\txu\n6B89\txun\n6B8A\tshu\n6B8B\tcan\n6B8C\tjue\n6B8D\tpiao\n6B8E\tqia\n6B8F\tqiu\n6B90\tsu\n6B91\tqing\n6B92\tyun\n6B93\tlian\n6B94\tyi\n6B95\tfou\n6B96\tzhi\n6B97\tye\n6B98\tcan\n6B99\thun\n6B9A\tdan\n6B9B\tji\n6B9C\tdie\n6B9D\tzhen\n6B9E\tyun\n6B9F\twen\n6BA0\tchou\n6BA1\tbin\n6BA2\tti\n6BA3\tjin\n6BA4\tshang\n6BA5\tyin\n6BA6\tdiao\n6BA7\tjiu\n6BA8\thui\n6BA9\tcuan\n6BAA\tyi\n6BAB\tdan\n6BAC\tdu\n6BAD\tjiang\n6BAE\tlian\n6BAF\tbin\n6BB0\tdu\n6BB1\tjian\n6BB2\tjian\n6BB3\tshu\n6BB4\tou\n6BB5\tduan\n6BB6\tzhu\n6BB7\tyin\n6BB8\tqing\n6BB9\tyi\n6BBA\tsha\n6BBB\tqiao\n6BBC\tke\n6BBD\txiao\n6BBE\txun\n6BBF\tdian\n6BC0\thui\n6BC1\thui\n6BC2\tgu\n6BC3\tqiao\n6BC4\tji\n6BC5\tyi\n6BC6\tou\n6BC7\thui\n6BC8\tduan\n6BC9\tyi\n6BCA\txiao\n6BCB\twu\n6BCC\tguan\n6BCD\tmu\n6BCE\tmei\n6BCF\tmei\n6BD0\tai\n6BD1\tjie\n6BD2\tdu\n6BD3\tyu\n6BD4\tbi\n6BD5\tbi\n6BD6\tbi\n6BD7\tpi\n6BD8\tpi\n6BD9\tbi\n6BDA\tchan\n6BDB\tmao\n6BDC\thao\n6BDD\tcai\n6BDE\tpi\n6BDF\tlie\n6BE0\tjia\n6BE1\tzhan\n6BE2\tsai\n6BE3\tmu\n6BE4\ttuo\n6BE5\txun\n6BE6\ter\n6BE7\trong\n6BE8\txian\n6BE9\tju\n6BEA\tmu\n6BEB\thao\n6BEC\tqiu\n6BED\tdou\n6BEE\tsha\n6BEF\ttan\n6BF0\tpei\n6BF1\tju\n6BF2\tduo\n6BF3\tcui\n6BF4\tbi\n6BF5\tsan\n6BF6\tsan\n6BF7\tmao\n6BF8\tsai\n6BF9\tshu\n6BFA\tshu\n6BFB\ttuo\n6BFC\the\n6BFD\tjian\n6BFE\tta\n6BFF\tsan\n6C00\tlu\n6C01\tmu\n6C02\tmao\n6C03\ttong\n6C04\trong\n6C05\tchang\n6C06\tpu\n6C07\tlu\n6C08\tzhan\n6C09\tsao\n6C0A\tzhan\n6C0B\tmeng\n6C0C\tlu\n6C0D\tqu\n6C0E\tdie\n6C0F\tshi\n6C10\tdi\n6C11\tmin\n6C12\tjue\n6C13\tmang\n6C14\tqi\n6C15\tpie\n6C16\tnai\n6C17\tqi\n6C18\tdao\n6C19\txian\n6C1A\tchuan\n6C1B\tfen\n6C1C\tyang\n6C1D\tnei\n6C1E\tbin\n6C1F\tfu\n6C20\tshen\n6C21\tdong\n6C22\tqing\n6C23\tqi\n6C24\tyin\n6C25\txi\n6C26\thai\n6C27\tyang\n6C28\tan\n6C29\tya\n6C2A\tke\n6C2B\tqing\n6C2C\tya\n6C2D\tdong\n6C2E\tdan\n6C2F\tlu\n6C30\tqing\n6C31\tyang\n6C32\tyun\n6C33\tyun\n6C34\tshui\n6C35\tshui\n6C36\tzheng\n6C37\tbing\n6C38\tyong\n6C39\tdang\n6C3A\tshui\n6C3B\tle\n6C3C\tni\n6C3D\ttun\n6C3E\tfan\n6C3F\tjiu\n6C40\tting\n6C41\tzhi\n6C42\tqiu\n6C43\tbin\n6C44\tze\n6C45\tmian\n6C46\tcuan\n6C47\thui\n6C48\tdiao\n6C49\than\n6C4A\tcha\n6C4B\tzhuo\n6C4C\tchuan\n6C4D\twan\n6C4E\tfan\n6C4F\tda\n6C50\txi\n6C51\ttuo\n6C52\tmang\n6C53\tqiu\n6C54\tqi\n6C55\tshan\n6C56\tpin\n6C57\than\n6C58\tqian\n6C59\twu\n6C5A\twu\n6C5B\txun\n6C5C\tsi\n6C5D\tru\n6C5E\tgong\n6C5F\tjiang\n6C60\tchi\n6C61\twu\n6C62\ttu\n6C63\tjiu\n6C64\ttang\n6C65\tzhi\n6C66\tzhi\n6C67\tqian\n6C68\tmi\n6C69\tgu\n6C6A\twang\n6C6B\tjing\n6C6C\tjing\n6C6D\trui\n6C6E\tjun\n6C6F\thong\n6C70\ttai\n6C71\tquan\n6C72\tji\n6C73\tbian\n6C74\tbian\n6C75\tgan\n6C76\twen\n6C77\tzhong\n6C78\tfang\n6C79\txiong\n6C7A\tjue\n6C7B\thu\n6C7C\tniu\n6C7D\tqi\n6C7E\tfen\n6C7F\txu\n6C80\txu\n6C81\tqin\n6C82\tyi\n6C83\two\n6C84\tyun\n6C85\tyuan\n6C86\thang\n6C87\tyan\n6C88\tshen\n6C89\tchen\n6C8A\tdan\n6C8B\tyou\n6C8C\tdun\n6C8D\thu\n6C8E\thuo\n6C8F\tqi\n6C90\tmu\n6C91\tnu\n6C92\tmei\n6C93\tda\n6C94\tmian\n6C95\tmi\n6C96\tchong\n6C97\tpang\n6C98\tbi\n6C99\tsha\n6C9A\tzhi\n6C9B\tpei\n6C9C\tpan\n6C9D\tzhui\n6C9E\tza\n6C9F\tgou\n6CA0\tliu\n6CA1\tmei\n6CA2\tze\n6CA3\tfeng\n6CA4\tou\n6CA5\tli\n6CA6\tlun\n6CA7\tcang\n6CA8\tfeng\n6CA9\twei\n6CAA\thu\n6CAB\tmo\n6CAC\tmei\n6CAD\tshu\n6CAE\tju\n6CAF\tza\n6CB0\ttuo\n6CB1\ttuo\n6CB2\ttuo\n6CB3\the\n6CB4\tli\n6CB5\tmi\n6CB6\tyi\n6CB7\tfa\n6CB8\tfei\n6CB9\tyou\n6CBA\ttian\n6CBB\tzhi\n6CBC\tzhao\n6CBD\tgu\n6CBE\tzhan\n6CBF\tyan\n6CC0\tsi\n6CC1\tkuang\n6CC2\tjiong\n6CC3\tju\n6CC4\txie\n6CC5\tqiu\n6CC6\tyi\n6CC7\tjia\n6CC8\tzhong\n6CC9\tquan\n6CCA\tpo\n6CCB\thui\n6CCC\tmi\n6CCD\tben\n6CCE\tze\n6CCF\tzhu\n6CD0\tle\n6CD1\tyou\n6CD2\tgu\n6CD3\thong\n6CD4\tgan\n6CD5\tfa\n6CD6\tmao\n6CD7\tsi\n6CD8\thu\n6CD9\tping\n6CDA\tci\n6CDB\tfan\n6CDC\tzhi\n6CDD\tsu\n6CDE\tning\n6CDF\tcheng\n6CE0\tling\n6CE1\tpao\n6CE2\tbo\n6CE3\tqi\n6CE4\tsi\n6CE5\tni\n6CE6\tju\n6CE7\tsa\n6CE8\tzhu\n6CE9\tsheng\n6CEA\tlei\n6CEB\txuan\n6CEC\tjue\n6CED\tfu\n6CEE\tpan\n6CEF\tmin\n6CF0\ttai\n6CF1\tyang\n6CF2\tji\n6CF3\tyong\n6CF4\tguan\n6CF5\tbeng\n6CF6\txue\n6CF7\tlong\n6CF8\tlu\n6CF9\tdan\n6CFA\tluo\n6CFB\txie\n6CFC\tpo\n6CFD\tze\n6CFE\tjing\n6CFF\tyin\n6D00\tpan\n6D01\tjie\n6D02\tye\n6D03\thui\n6D04\thui\n6D05\tzai\n6D06\tcheng\n6D07\tyin\n6D08\twei\n6D09\thou\n6D0A\tjian\n6D0B\tyang\n6D0C\tlie\n6D0D\tsi\n6D0E\tji\n6D0F\ter\n6D10\txing\n6D11\tfu\n6D12\tsa\n6D13\tqi\n6D14\tzhi\n6D15\tyin\n6D16\twu\n6D17\txi\n6D18\tkao\n6D19\tzhu\n6D1A\tjiang\n6D1B\tluo\n6D1C\tluo\n6D1D\tan\n6D1E\tdong\n6D1F\tti\n6D20\tmou\n6D21\tlei\n6D22\tyi\n6D23\tmi\n6D24\tquan\n6D25\tjin\n6D26\tpo\n6D27\twei\n6D28\txiao\n6D29\txie\n6D2A\thong\n6D2B\txu\n6D2C\tsu\n6D2D\tkuang\n6D2E\ttao\n6D2F\tqie\n6D30\tju\n6D31\ter\n6D32\tzhou\n6D33\tru\n6D34\tping\n6D35\txun\n6D36\txiong\n6D37\tzhi\n6D38\tguang\n6D39\thuan\n6D3A\tming\n6D3B\thuo\n6D3C\twa\n6D3D\tqia\n6D3E\tpai\n6D3F\twu\n6D40\tqu\n6D41\tliu\n6D42\tyi\n6D43\tjia\n6D44\tjing\n6D45\tqian\n6D46\tjiang\n6D47\tjiao\n6D48\tzhen\n6D49\tshi\n6D4A\tzhuo\n6D4B\tce\n6D4C\tfa\n6D4D\thui\n6D4E\tji\n6D4F\tliu\n6D50\tchan\n6D51\thun\n6D52\thu\n6D53\tnong\n6D54\txun\n6D55\tjin\n6D56\tlie\n6D57\tqiu\n6D58\twei\n6D59\tzhe\n6D5A\tjun\n6D5B\than\n6D5C\tbang\n6D5D\tmang\n6D5E\tzhuo\n6D5F\tyou\n6D60\txi\n6D61\tbo\n6D62\tdou\n6D63\thuan\n6D64\thong\n6D65\tyi\n6D66\tpu\n6D67\tying\n6D68\tlan\n6D69\thao\n6D6A\tlang\n6D6B\than\n6D6C\tli\n6D6D\tgeng\n6D6E\tfu\n6D6F\twu\n6D70\tlian\n6D71\tchun\n6D72\tfeng\n6D73\tyi\n6D74\tyu\n6D75\ttong\n6D76\tlao\n6D77\thai\n6D78\tjin\n6D79\tjia\n6D7A\tchong\n6D7B\tjiong\n6D7C\tmei\n6D7D\tsui\n6D7E\tcheng\n6D7F\tpei\n6D80\txian\n6D81\tshen\n6D82\ttu\n6D83\tkun\n6D84\tping\n6D85\tnie\n6D86\than\n6D87\tjing\n6D88\txiao\n6D89\tshe\n6D8A\tnian\n6D8B\ttu\n6D8C\tyong\n6D8D\txiao\n6D8E\txian\n6D8F\tting\n6D90\te\n6D91\tsu\n6D92\ttun\n6D93\tjuan\n6D94\tcen\n6D95\tti\n6D96\tli\n6D97\tshui\n6D98\tsi\n6D99\tlei\n6D9A\tshui\n6D9B\ttao\n6D9C\tdu\n6D9D\tlao\n6D9E\tlai\n6D9F\tlian\n6DA0\twei\n6DA1\two\n6DA2\tyun\n6DA3\thuan\n6DA4\tdi\n6DA5\theng\n6DA6\trun\n6DA7\tjian\n6DA8\tzhang\n6DA9\tse\n6DAA\tfu\n6DAB\tguan\n6DAC\txing\n6DAD\tshou\n6DAE\tshuan\n6DAF\tya\n6DB0\tchuo\n6DB1\tzhang\n6DB2\tye\n6DB3\tkong\n6DB4\two\n6DB5\than\n6DB6\ttuo\n6DB7\tdong\n6DB8\the\n6DB9\two\n6DBA\tju\n6DBB\tshe\n6DBC\tliang\n6DBD\thun\n6DBE\tta\n6DBF\tzhuo\n6DC0\tdian\n6DC1\tqie\n6DC2\tde\n6DC3\tjuan\n6DC4\tzi\n6DC5\txi\n6DC6\txiao\n6DC7\tqi\n6DC8\tgu\n6DC9\tguo\n6DCA\tyan\n6DCB\tlin\n6DCC\ttang\n6DCD\tzhou\n6DCE\tpeng\n6DCF\thao\n6DD0\tchang\n6DD1\tshu\n6DD2\tqi\n6DD3\tfang\n6DD4\tzhi\n6DD5\tlu\n6DD6\tnao\n6DD7\tju\n6DD8\ttao\n6DD9\tcong\n6DDA\tlei\n6DDB\tzhe\n6DDC\tpeng\n6DDD\tfei\n6DDE\tsong\n6DDF\ttian\n6DE0\tpi\n6DE1\tdan\n6DE2\tyu\n6DE3\tni\n6DE4\tyu\n6DE5\tlu\n6DE6\tgan\n6DE7\tmi\n6DE8\tjing\n6DE9\tling\n6DEA\tlun\n6DEB\tyin\n6DEC\tcui\n6DED\tqu\n6DEE\thuai\n6DEF\tyu\n6DF0\tnian\n6DF1\tshen\n6DF2\tbiao\n6DF3\tchun\n6DF4\thu\n6DF5\tyuan\n6DF6\tlai\n6DF7\thun\n6DF8\tqing\n6DF9\tyan\n6DFA\tqian\n6DFB\ttian\n6DFC\tmiao\n6DFD\tzhi\n6DFE\tyin\n6DFF\tbo\n6E00\tben\n6E01\tyuan\n6E02\twen\n6E03\truo\n6E04\tfei\n6E05\tqing\n6E06\tyuan\n6E07\tke\n6E08\tji\n6E09\tshe\n6E0A\tyuan\n6E0B\tse\n6E0C\tlu\n6E0D\tzi\n6E0E\tdu\n6E0F\tyi\n6E10\tjian\n6E11\tmian\n6E12\tpai\n6E13\txi\n6E14\tyu\n6E15\tyuan\n6E16\tshen\n6E17\tshen\n6E18\trou\n6E19\thuan\n6E1A\tzhu\n6E1B\tjian\n6E1C\tnuan\n6E1D\tyu\n6E1E\tqiu\n6E1F\tting\n6E20\tqu\n6E21\tdu\n6E22\tfan\n6E23\tzha\n6E24\tbo\n6E25\two\n6E26\two\n6E27\tdi\n6E28\twei\n6E29\twen\n6E2A\tru\n6E2B\txie\n6E2C\tce\n6E2D\twei\n6E2E\the\n6E2F\tgang\n6E30\tyan\n6E31\thong\n6E32\txuan\n6E33\tmi\n6E34\tke\n6E35\tmao\n6E36\tying\n6E37\tyan\n6E38\tyou\n6E39\thong\n6E3A\tmiao\n6E3B\tsheng\n6E3C\tmei\n6E3D\tzai\n6E3E\thun\n6E3F\tnai\n6E40\tgui\n6E41\tchi\n6E42\te\n6E43\tpai\n6E44\tmei\n6E45\tlian\n6E46\tqi\n6E47\tqi\n6E48\tmei\n6E49\ttian\n6E4A\tcou\n6E4B\twei\n6E4C\tcan\n6E4D\ttuan\n6E4E\tmian\n6E4F\thui\n6E50\tmo\n6E51\txu\n6E52\tji\n6E53\tpen\n6E54\tjian\n6E55\tjian\n6E56\thu\n6E57\tfeng\n6E58\txiang\n6E59\tyi\n6E5A\tyin\n6E5B\tzhan\n6E5C\tshi\n6E5D\tjie\n6E5E\tcheng\n6E5F\thuang\n6E60\ttan\n6E61\tyu\n6E62\tbi\n6E63\tmin\n6E64\tshi\n6E65\ttu\n6E66\tsheng\n6E67\tyong\n6E68\tju\n6E69\tdong\n6E6A\ttuan\n6E6B\tjiao\n6E6C\tjiao\n6E6D\tqiu\n6E6E\tyan\n6E6F\ttang\n6E70\tlong\n6E71\thuo\n6E72\tyuan\n6E73\tnan\n6E74\tban\n6E75\tyou\n6E76\tquan\n6E77\tzhuang\n6E78\tliang\n6E79\tchan\n6E7A\txian\n6E7B\tchun\n6E7C\tnie\n6E7D\tzi\n6E7E\twan\n6E7F\tshi\n6E80\tman\n6E81\tying\n6E82\tla\n6E83\tkui\n6E84\tfeng\n6E85\tjian\n6E86\txu\n6E87\tlou\n6E88\twei\n6E89\tgai\n6E8A\tbo\n6E8B\tying\n6E8C\tpo\n6E8D\tjin\n6E8E\tyan\n6E8F\ttang\n6E90\tyuan\n6E91\tsuo\n6E92\tyuan\n6E93\tlian\n6E94\tyao\n6E95\tmeng\n6E96\tzhun\n6E97\tcheng\n6E98\tke\n6E99\ttai\n6E9A\tda\n6E9B\twa\n6E9C\tliu\n6E9D\tgou\n6E9E\tsao\n6E9F\tming\n6EA0\tzha\n6EA1\tshi\n6EA2\tyi\n6EA3\tlun\n6EA4\tma\n6EA5\tpu\n6EA6\twei\n6EA7\tli\n6EA8\tzai\n6EA9\twu\n6EAA\txi\n6EAB\twen\n6EAC\tqiang\n6EAD\tze\n6EAE\tshi\n6EAF\tsu\n6EB0\tai\n6EB1\tqin\n6EB2\tsou\n6EB3\tyun\n6EB4\txiu\n6EB5\tyin\n6EB6\trong\n6EB7\thun\n6EB8\tsu\n6EB9\tsuo\n6EBA\tni\n6EBB\tta\n6EBC\tshi\n6EBD\tru\n6EBE\tai\n6EBF\tpan\n6EC0\tchu\n6EC1\tchu\n6EC2\tpang\n6EC3\tweng\n6EC4\tcang\n6EC5\tmie\n6EC6\tge\n6EC7\tdian\n6EC8\thao\n6EC9\thuang\n6ECA\txi\n6ECB\tzi\n6ECC\tdi\n6ECD\tzhi\n6ECE\txing\n6ECF\tfu\n6ED0\tjie\n6ED1\thua\n6ED2\tge\n6ED3\tzi\n6ED4\ttao\n6ED5\tteng\n6ED6\tsui\n6ED7\tbi\n6ED8\tjiao\n6ED9\thui\n6EDA\tgun\n6EDB\tyin\n6EDC\tgao\n6EDD\tlong\n6EDE\tzhi\n6EDF\tyan\n6EE0\tshe\n6EE1\tman\n6EE2\tying\n6EE3\tchun\n6EE4\tlu\n6EE5\tlan\n6EE6\tluan\n6EE7\tyao\n6EE8\tbin\n6EE9\ttan\n6EEA\tyu\n6EEB\txiu\n6EEC\thu\n6EED\tbi\n6EEE\tbiao\n6EEF\tzhi\n6EF0\tjiang\n6EF1\tkou\n6EF2\tshen\n6EF3\tshang\n6EF4\tdi\n6EF5\tmi\n6EF6\tao\n6EF7\tlu\n6EF8\thu\n6EF9\thu\n6EFA\tyou\n6EFB\tchan\n6EFC\tfan\n6EFD\tyong\n6EFE\tgun\n6EFF\tman\n6F00\tqing\n6F01\tyu\n6F02\tpiao\n6F03\tji\n6F04\tya\n6F05\tchao\n6F06\tqi\n6F07\txi\n6F08\tji\n6F09\tlu\n6F0A\tlou\n6F0B\tlong\n6F0C\tjin\n6F0D\tguo\n6F0E\tcong\n6F0F\tlou\n6F10\tzhi\n6F11\tgai\n6F12\tqiang\n6F13\tli\n6F14\tyan\n6F15\tcao\n6F16\tjiao\n6F17\tcong\n6F18\tchun\n6F19\ttuan\n6F1A\tou\n6F1B\tteng\n6F1C\tye\n6F1D\txi\n6F1E\tmi\n6F1F\ttang\n6F20\tmo\n6F21\tshang\n6F22\than\n6F23\tlian\n6F24\tlan\n6F25\twa\n6F26\tchi\n6F27\tgan\n6F28\tfeng\n6F29\txuan\n6F2A\tyi\n6F2B\tman\n6F2C\tzi\n6F2D\tmang\n6F2E\tkang\n6F2F\tluo\n6F30\tpeng\n6F31\tshu\n6F32\tzhang\n6F33\tzhang\n6F34\tchong\n6F35\txu\n6F36\thuan\n6F37\thuo\n6F38\tjian\n6F39\tyan\n6F3A\tshuang\n6F3B\tliao\n6F3C\tcui\n6F3D\tti\n6F3E\tyang\n6F3F\tjiang\n6F40\tcong\n6F41\tying\n6F42\thong\n6F43\txiu\n6F44\tshu\n6F45\tguan\n6F46\tying\n6F47\txiao\n6F48\tzong\n6F49\tkun\n6F4A\txu\n6F4B\tlian\n6F4C\tzhi\n6F4D\twei\n6F4E\tpi\n6F4F\tyu\n6F50\tjiao\n6F51\tpo\n6F52\tdang\n6F53\thui\n6F54\tjie\n6F55\twu\n6F56\tpa\n6F57\tji\n6F58\tpan\n6F59\twei\n6F5A\tsu\n6F5B\tqian\n6F5C\tqian\n6F5D\txi\n6F5E\tlu\n6F5F\txi\n6F60\txun\n6F61\tdun\n6F62\thuang\n6F63\tmin\n6F64\trun\n6F65\tsu\n6F66\tliao\n6F67\tzhen\n6F68\tcong\n6F69\tyi\n6F6A\tzhe\n6F6B\twan\n6F6C\tshan\n6F6D\ttan\n6F6E\tchao\n6F6F\txun\n6F70\tkui\n6F71\tye\n6F72\tshao\n6F73\ttu\n6F74\tzhu\n6F75\tsa\n6F76\thei\n6F77\tbi\n6F78\tshan\n6F79\tchan\n6F7A\tchan\n6F7B\tshu\n6F7C\ttong\n6F7D\tpu\n6F7E\tlin\n6F7F\twei\n6F80\tse\n6F81\tse\n6F82\tcheng\n6F83\tjiong\n6F84\tcheng\n6F85\thua\n6F86\tjiao\n6F87\tlao\n6F88\tche\n6F89\tgan\n6F8A\tcun\n6F8B\thong\n6F8C\tsi\n6F8D\tshu\n6F8E\tpeng\n6F8F\than\n6F90\tyun\n6F91\tliu\n6F92\thong\n6F93\tfu\n6F94\thao\n6F95\the\n6F96\txian\n6F97\tjian\n6F98\tshan\n6F99\txi\n6F9A\tyu\n6F9B\tlu\n6F9C\tlan\n6F9D\tning\n6F9E\tyu\n6F9F\tlin\n6FA0\tmian\n6FA1\tzao\n6FA2\tdang\n6FA3\thuan\n6FA4\tze\n6FA5\txie\n6FA6\tyu\n6FA7\tli\n6FA8\tshi\n6FA9\txue\n6FAA\tling\n6FAB\twan\n6FAC\tzi\n6FAD\tyong\n6FAE\thui\n6FAF\tcan\n6FB0\tlian\n6FB1\tdian\n6FB2\tye\n6FB3\tao\n6FB4\thuan\n6FB5\tzhen\n6FB6\tchan\n6FB7\tman\n6FB8\tdan\n6FB9\tdan\n6FBA\tyi\n6FBB\tsui\n6FBC\tpi\n6FBD\tju\n6FBE\tta\n6FBF\tqin\n6FC0\tji\n6FC1\tzhuo\n6FC2\tlian\n6FC3\tnong\n6FC4\tguo\n6FC5\tjin\n6FC6\tfen\n6FC7\tse\n6FC8\tji\n6FC9\tsui\n6FCA\thui\n6FCB\tchu\n6FCC\tta\n6FCD\tsong\n6FCE\tding\n6FCF\tse\n6FD0\tzhu\n6FD1\tlai\n6FD2\tbin\n6FD3\tlian\n6FD4\tmi\n6FD5\tshi\n6FD6\tshu\n6FD7\tmi\n6FD8\tning\n6FD9\tying\n6FDA\tying\n6FDB\tmeng\n6FDC\tjin\n6FDD\tqi\n6FDE\tbi\n6FDF\tji\n6FE0\thao\n6FE1\tru\n6FE2\tcui\n6FE3\two\n6FE4\ttao\n6FE5\tyin\n6FE6\tyin\n6FE7\tdui\n6FE8\tci\n6FE9\thuo\n6FEA\tqing\n6FEB\tlan\n6FEC\tjun\n6FED\tai\n6FEE\tpu\n6FEF\tzhuo\n6FF0\twei\n6FF1\tbin\n6FF2\tgu\n6FF3\tqian\n6FF4\tying\n6FF5\tbin\n6FF6\tkuo\n6FF7\tfei\n6FF8\tcang\n6FF9\tme\n6FFA\tjian\n6FFB\twei\n6FFC\tluo\n6FFD\tzan\n6FFE\tlu\n6FFF\tli\n7000\tyou\n7001\tyang\n7002\tlu\n7003\tsi\n7004\tzhi\n7005\tying\n7006\tdu\n7007\twang\n7008\thui\n7009\txie\n700A\tpan\n700B\tshen\n700C\tbiao\n700D\tchan\n700E\tmo\n700F\tliu\n7010\tjian\n7011\tpu\n7012\tse\n7013\tcheng\n7014\tgu\n7015\tbin\n7016\thuo\n7017\txian\n7018\tlu\n7019\tqin\n701A\than\n701B\tying\n701C\trong\n701D\tli\n701E\tjing\n701F\txiao\n7020\tying\n7021\tsui\n7022\twei\n7023\txie\n7024\thuai\n7025\txue\n7026\tzhu\n7027\tlong\n7028\tlai\n7029\tdui\n702A\tfan\n702B\thu\n702C\tlai\n702D\tshu\n702E\tling\n702F\tying\n7030\tmi\n7031\tji\n7032\tlian\n7033\tjian\n7034\tying\n7035\tfen\n7036\tlin\n7037\tyi\n7038\tjian\n7039\tyue\n703A\tchan\n703B\tdai\n703C\trang\n703D\tjian\n703E\tlan\n703F\tfan\n7040\tshuang\n7041\tyuan\n7042\tzhuo\n7043\tfeng\n7044\tshe\n7045\tlei\n7046\tlan\n7047\tcong\n7048\tqu\n7049\tyong\n704A\tqian\n704B\tfa\n704C\tguan\n704D\tjue\n704E\tyan\n704F\thao\n7050\tying\n7051\tsa\n7052\tzan\n7053\tluan\n7054\tyan\n7055\tli\n7056\tmi\n7057\tshan\n7058\ttan\n7059\tdang\n705A\tjiao\n705B\tchan\n705C\tying\n705D\thao\n705E\tba\n705F\tzhu\n7060\tlan\n7061\tlan\n7062\tnang\n7063\twan\n7064\tluan\n7065\txun\n7066\txian\n7067\tyan\n7068\tgan\n7069\tyan\n706A\tyu\n706B\thuo\n706C\tbiao\n706D\tmie\n706E\tguang\n706F\tdeng\n7070\thui\n7071\txiao\n7072\txiao\n7073\thui\n7074\thong\n7075\tling\n7076\tzao\n7077\tzhuan\n7078\tjiu\n7079\tzha\n707A\txie\n707B\tchi\n707C\tzhuo\n707D\tzai\n707E\tzai\n707F\tcan\n7080\tyang\n7081\tqi\n7082\tzhong\n7083\tfen\n7084\tniu\n7085\tjiong\n7086\twen\n7087\tpu\n7088\tyi\n7089\tlu\n708A\tchui\n708B\tpi\n708C\tkai\n708D\tpan\n708E\tyan\n708F\tkai\n7090\tpang\n7091\tmu\n7092\tchao\n7093\tliao\n7094\tque\n7095\tkang\n7096\tdun\n7097\tguang\n7098\txin\n7099\tzhi\n709A\tguang\n709B\tguang\n709C\twei\n709D\tqiang\n709E\tbian\n709F\tda\n70A0\txia\n70A1\tzheng\n70A2\tzhu\n70A3\tke\n70A4\tzhao\n70A5\tfu\n70A6\tba\n70A7\txie\n70A8\txie\n70A9\tling\n70AA\tzhuo\n70AB\txuan\n70AC\tju\n70AD\ttan\n70AE\tpao\n70AF\tjiong\n70B0\tpao\n70B1\ttai\n70B2\ttai\n70B3\tbing\n70B4\tyang\n70B5\ttong\n70B6\tshan\n70B7\tzhu\n70B8\tzha\n70B9\tdian\n70BA\twei\n70BB\tshi\n70BC\tlian\n70BD\tchi\n70BE\thuang\n70BF\tzhou\n70C0\thu\n70C1\tshuo\n70C2\tlan\n70C3\tting\n70C4\tjiao\n70C5\txu\n70C6\theng\n70C7\tquan\n70C8\tlie\n70C9\thuan\n70CA\tyang\n70CB\txiu\n70CC\txiu\n70CD\txian\n70CE\tyin\n70CF\twu\n70D0\tzhou\n70D1\tyao\n70D2\tshi\n70D3\twei\n70D4\ttong\n70D5\tmie\n70D6\tzai\n70D7\tkai\n70D8\thong\n70D9\tlao\n70DA\txia\n70DB\tzhu\n70DC\txuan\n70DD\tzheng\n70DE\tpo\n70DF\tyan\n70E0\thui\n70E1\tguang\n70E2\tche\n70E3\thui\n70E4\tkao\n70E5\tju\n70E6\tfan\n70E7\tshao\n70E8\tye\n70E9\thui\n70EB\ttang\n70EC\tjin\n70ED\tre\n70EE\tlie\n70EF\txi\n70F0\tfu\n70F1\tjiong\n70F2\txie\n70F3\tpu\n70F4\tting\n70F5\tzhuo\n70F6\tting\n70F7\twan\n70F8\thai\n70F9\tpeng\n70FA\tlang\n70FB\tyan\n70FC\txu\n70FD\tfeng\n70FE\tchi\n70FF\trong\n7100\thu\n7101\txi\n7102\tshu\n7103\the\n7104\txun\n7105\tku\n7106\tjuan\n7107\txiao\n7108\txi\n7109\tyan\n710A\than\n710B\tzhuang\n710C\tjun\n710D\tdi\n710E\txie\n710F\tji\n7110\twu\n7111\tyan\n7112\tlu\n7113\than\n7114\tyan\n7115\thuan\n7116\tmen\n7117\tju\n7118\ttao\n7119\tbei\n711A\tfen\n711B\tlin\n711C\tkun\n711D\thun\n711E\ttun\n711F\txi\n7120\tcui\n7121\twu\n7122\thong\n7123\tchao\n7124\tfu\n7125\two\n7126\tjiao\n7127\tcong\n7128\tfeng\n7129\tping\n712A\tqiong\n712B\truo\n712C\txi\n712D\tqiong\n712E\txin\n712F\tchao\n7130\tyan\n7131\tyan\n7132\tyi\n7133\tjue\n7134\tyu\n7135\tgang\n7136\tran\n7137\tpi\n7138\txiong\n7139\tgang\n713A\tsheng\n713B\tchang\n713C\tshao\n713D\txiong\n713E\tnian\n713F\tgeng\n7140\twei\n7141\tchen\n7142\the\n7143\tkui\n7144\tzhong\n7145\tduan\n7146\txia\n7147\thui\n7148\tfeng\n7149\tlian\n714A\txuan\n714B\txing\n714C\thuang\n714D\tjiao\n714E\tjian\n714F\tbi\n7150\tying\n7151\tzhu\n7152\twei\n7153\ttuan\n7154\tshan\n7155\txi\n7156\tnuan\n7157\tnuan\n7158\tchan\n7159\tyan\n715A\tjiong\n715B\tjiong\n715C\tyu\n715D\tmei\n715E\tsha\n715F\twei\n7160\tzha\n7161\tjin\n7162\tqiong\n7163\trou\n7164\tmei\n7165\thuan\n7166\txu\n7167\tzhao\n7168\twei\n7169\tfan\n716A\tqiu\n716B\tsui\n716C\tyang\n716D\tlie\n716E\tzhu\n716F\tjie\n7170\tzao\n7171\tgua\n7172\tbao\n7173\thu\n7174\tyun\n7175\tnan\n7176\tshi\n7177\tliang\n7178\tbian\n7179\tgou\n717A\ttui\n717B\ttang\n717C\tchao\n717D\tshan\n717E\ten\n717F\tbo\n7180\thuang\n7181\txie\n7182\txi\n7183\twu\n7184\txi\n7185\tyun\n7186\the\n7187\the\n7188\txi\n7189\tyun\n718A\txiong\n718B\tnai\n718C\tshan\n718D\tqiong\n718E\tyao\n718F\txun\n7190\tmi\n7191\tlian\n7192\tying\n7193\twu\n7194\trong\n7195\tgong\n7196\tyan\n7197\tqiang\n7198\tliu\n7199\txi\n719A\tbi\n719B\tbiao\n719C\tcong\n719D\tlu\n719E\tjian\n719F\tshu\n71A0\tyi\n71A1\tlou\n71A2\tpeng\n71A3\tsui\n71A4\tyi\n71A5\tteng\n71A6\tjue\n71A7\tzong\n71A8\tyun\n71A9\thu\n71AA\tyi\n71AB\tzhi\n71AC\tao\n71AD\twei\n71AE\tliu\n71AF\than\n71B0\tou\n71B1\tre\n71B2\tjiong\n71B3\tman\n71B4\tkun\n71B5\tshang\n71B6\tcuan\n71B7\tzeng\n71B8\tjian\n71B9\txi\n71BA\txi\n71BB\txi\n71BC\tyi\n71BD\txiao\n71BE\tchi\n71BF\thuang\n71C0\tchan\n71C1\tye\n71C2\ttan\n71C3\tran\n71C4\tyan\n71C5\txun\n71C6\tqiao\n71C7\tjun\n71C8\tdeng\n71C9\tdun\n71CA\tshen\n71CB\tjiao\n71CC\tfen\n71CD\tsi\n71CE\tliao\n71CF\tyu\n71D0\tlin\n71D1\ttong\n71D2\tshao\n71D3\tfen\n71D4\tfan\n71D5\tyan\n71D6\txun\n71D7\tlan\n71D8\tmei\n71D9\ttang\n71DA\tyi\n71DB\tjiong\n71DC\tmen\n71DD\tjing\n71DE\tjiao\n71DF\tying\n71E0\tyu\n71E1\tyi\n71E2\txue\n71E3\tlan\n71E4\ttai\n71E5\tzao\n71E6\tcan\n71E7\tsui\n71E8\txi\n71E9\tque\n71EA\tzong\n71EB\tlian\n71EC\thui\n71ED\tzhu\n71EE\txie\n71EF\tling\n71F0\twei\n71F1\tyi\n71F2\txie\n71F3\tzhao\n71F4\thui\n71F5\tda\n71F6\tnong\n71F7\tlan\n71F8\tru\n71F9\txian\n71FA\the\n71FB\txun\n71FC\tjin\n71FD\tchou\n71FE\tdao\n71FF\tyao\n7200\the\n7201\tlan\n7202\tbiao\n7203\trong\n7204\tli\n7205\tmo\n7206\tbao\n7207\truo\n7208\tlu\n7209\tla\n720A\tao\n720B\txun\n720C\tkuang\n720D\tshuo\n720E\tliao\n720F\tli\n7210\tlu\n7211\tjue\n7212\tliao\n7213\tyan\n7214\txi\n7215\txie\n7216\tlong\n7217\tye\n7218\tcan\n7219\trang\n721A\tyue\n721B\tlan\n721C\tcong\n721D\tjue\n721E\tchong\n721F\tguan\n7220\tju\n7221\tche\n7222\tmi\n7223\ttang\n7224\tlan\n7225\tzhu\n7226\tlan\n7227\tling\n7228\tcuan\n7229\tyu\n722A\tzhao\n722B\tzhao\n722C\tpa\n722D\tzheng\n722E\tpao\n722F\tcheng\n7230\tyuan\n7231\tai\n7232\twei\n7233\than\n7234\tjue\n7235\tjue\n7236\tfu\n7237\tye\n7238\tba\n7239\tdie\n723A\tye\n723B\tyao\n723C\tzu\n723D\tshuang\n723E\ter\n723F\tpan\n7240\tchuang\n7241\tke\n7242\tzang\n7243\tdie\n7244\tqiang\n7245\tyong\n7246\tqiang\n7247\tpian\n7248\tban\n7249\tpan\n724A\tchao\n724B\tjian\n724C\tpai\n724D\tdu\n724E\tchuang\n724F\tyu\n7250\tzha\n7251\tbian\n7252\tdie\n7253\tbang\n7254\tbo\n7255\tchuang\n7256\tyou\n7257\tyou\n7258\tdu\n7259\tya\n725A\tcheng\n725B\tniu\n725C\tniu\n725D\tpin\n725E\tjiu\n725F\tmou\n7260\tta\n7261\tmu\n7262\tlao\n7263\tren\n7264\tmang\n7265\tfang\n7266\tmao\n7267\tmu\n7268\tgang\n7269\twu\n726A\tyan\n726B\tge\n726C\tbei\n726D\tsi\n726E\tjian\n726F\tgu\n7270\tyou\n7271\tge\n7272\tsheng\n7273\tmu\n7274\tdi\n7275\tqian\n7276\tquan\n7277\tquan\n7278\tzi\n7279\tte\n727A\txi\n727B\tmang\n727C\tkeng\n727D\tqian\n727E\twu\n727F\tgu\n7280\txi\n7281\tli\n7282\tli\n7283\tpou\n7284\tji\n7285\tgang\n7286\tzhi\n7287\tben\n7288\tquan\n7289\tchun\n728A\tdu\n728B\tju\n728C\tjia\n728D\tjian\n728E\tfeng\n728F\tpian\n7290\tke\n7291\tju\n7292\tkao\n7293\tchu\n7294\txi\n7295\tbei\n7296\tluo\n7297\tjie\n7298\tma\n7299\tsan\n729A\twei\n729B\tmao\n729C\tdun\n729D\ttong\n729E\tqiao\n729F\tjiang\n72A0\txi\n72A1\tli\n72A2\tdu\n72A3\tlie\n72A4\tpai\n72A5\tpiao\n72A6\tbo\n72A7\txi\n72A8\tchou\n72A9\twei\n72AA\tkui\n72AB\tchou\n72AC\tquan\n72AD\tquan\n72AE\tba\n72AF\tfan\n72B0\tqiu\n72B1\tji\n72B2\tchai\n72B3\tzhuo\n72B4\tan\n72B5\tge\n72B6\tzhuang\n72B7\tguang\n72B8\tma\n72B9\tyou\n72BA\tkang\n72BB\tbo\n72BC\thou\n72BD\tya\n72BE\tyin\n72BF\thuan\n72C0\tzhuang\n72C1\tyun\n72C2\tkuang\n72C3\tniu\n72C4\tdi\n72C5\tkuang\n72C6\tzhong\n72C7\tmu\n72C8\tbei\n72C9\tpi\n72CA\tju\n72CB\tyi\n72CC\tsheng\n72CD\tpao\n72CE\txia\n72CF\ttuo\n72D0\thu\n72D1\tling\n72D2\tfei\n72D3\tpi\n72D4\tni\n72D5\tyao\n72D6\tyou\n72D7\tgou\n72D8\txue\n72D9\tju\n72DA\tdan\n72DB\tbo\n72DC\tku\n72DD\txian\n72DE\tning\n72DF\thuan\n72E0\then\n72E1\tjiao\n72E2\the\n72E3\tzhao\n72E4\tji\n72E5\txun\n72E6\tshan\n72E7\tta\n72E8\trong\n72E9\tshou\n72EA\ttong\n72EB\tlao\n72EC\tdu\n72ED\txia\n72EE\tshi\n72EF\tkuai\n72F0\tzheng\n72F1\tyu\n72F2\tsun\n72F3\tyu\n72F4\tbi\n72F5\tmang\n72F6\txi\n72F7\tjuan\n72F8\tli\n72F9\txia\n72FA\tyin\n72FB\tsuan\n72FC\tlang\n72FD\tbei\n72FE\tzhi\n72FF\tyan\n7300\tsha\n7301\tli\n7302\than\n7303\txian\n7304\tjing\n7305\tpai\n7306\tfei\n7307\txiao\n7308\tbai\n7309\tqi\n730A\tni\n730B\tbiao\n730C\tyin\n730D\tlai\n730E\tlie\n730F\tjian\n7310\tqiang\n7311\tkun\n7312\tyan\n7313\tguo\n7314\tzong\n7315\tmi\n7316\tchang\n7317\tyi\n7318\tzhi\n7319\tzheng\n731A\tya\n731B\tmeng\n731C\tcai\n731D\tcu\n731E\tshe\n731F\tlie\n7320\tdian\n7321\tluo\n7322\thu\n7323\tzong\n7324\tgui\n7325\twei\n7326\tfeng\n7327\two\n7328\tyuan\n7329\txing\n732A\tzhu\n732B\tmao\n732C\twei\n732D\tchuan\n732E\txian\n732F\ttuan\n7330\tya\n7331\tnao\n7332\txie\n7333\tjia\n7334\thou\n7335\tbian\n7336\tyou\n7337\tyou\n7338\tmei\n7339\tcha\n733A\tyao\n733B\tsun\n733C\tbo\n733D\tming\n733E\thua\n733F\tyuan\n7340\tsou\n7341\tma\n7342\tyuan\n7343\tdai\n7344\tyu\n7345\tshi\n7346\thao\n7347\tqiang\n7348\tyi\n7349\tzhen\n734A\tcang\n734B\thao\n734C\tman\n734D\tjing\n734E\tjiang\n734F\tmo\n7350\tzhang\n7351\tchan\n7352\tao\n7353\tao\n7354\thao\n7355\tcui\n7356\tben\n7357\tjue\n7358\tbi\n7359\tbi\n735A\thuang\n735B\tpu\n735C\tlin\n735D\txu\n735E\ttong\n735F\tyao\n7360\tliao\n7361\tshuo\n7362\txiao\n7363\tshou\n7364\tdun\n7365\tjiao\n7366\tge\n7367\tjuan\n7368\tdu\n7369\thui\n736A\tkuai\n736B\txian\n736C\txie\n736D\tta\n736E\txian\n736F\txun\n7370\tning\n7371\tbian\n7372\thuo\n7373\tnou\n7374\tmeng\n7375\tlie\n7376\tnao\n7377\tguang\n7378\tshou\n7379\tlu\n737A\tta\n737B\txian\n737C\tmi\n737D\trang\n737E\thuan\n737F\tnao\n7380\tluo\n7381\txian\n7382\tqi\n7383\tjue\n7384\txuan\n7385\tmiao\n7386\tzi\n7387\tlu\n7388\tlu\n7389\tyu\n738A\tsu\n738B\twang\n738C\tqiu\n738D\tga\n738E\tding\n738F\tle\n7390\tba\n7391\tji\n7392\thong\n7393\tdi\n7394\tchuan\n7395\tgan\n7396\tjiu\n7397\tyu\n7398\tqi\n7399\tyu\n739A\tyang\n739B\tma\n739C\thong\n739D\twu\n739E\tfu\n739F\twen\n73A0\tjie\n73A1\tya\n73A2\tbin\n73A3\tbian\n73A4\tbang\n73A5\tyue\n73A6\tjue\n73A7\tmen\n73A8\tjue\n73A9\twan\n73AA\tjian\n73AB\tmei\n73AC\tdan\n73AD\tpin\n73AE\twei\n73AF\thuan\n73B0\txian\n73B1\tqiang\n73B2\tling\n73B3\tdai\n73B4\tyi\n73B5\tan\n73B6\tping\n73B7\tdian\n73B8\tfu\n73B9\txuan\n73BA\txi\n73BB\tbo\n73BC\tci\n73BD\tgou\n73BE\tjia\n73BF\tshao\n73C0\tpo\n73C1\tci\n73C2\tke\n73C3\tran\n73C4\tsheng\n73C5\tshen\n73C6\tyi\n73C7\tzu\n73C8\tjia\n73C9\tmin\n73CA\tshan\n73CB\tliu\n73CC\tbi\n73CD\tzhen\n73CE\tzhen\n73CF\tjue\n73D0\tfa\n73D1\tlong\n73D2\tjin\n73D3\tjiao\n73D4\tjian\n73D5\tli\n73D6\tguang\n73D7\txian\n73D8\tzhou\n73D9\tgong\n73DA\tyan\n73DB\txiu\n73DC\tyang\n73DD\txu\n73DE\tluo\n73DF\tsu\n73E0\tzhu\n73E1\tqin\n73E2\tyin\n73E3\txun\n73E4\tbao\n73E5\ter\n73E6\txiang\n73E7\tyao\n73E8\txia\n73E9\theng\n73EA\tgui\n73EB\tchong\n73EC\txu\n73ED\tban\n73EE\tpei\n73EF\tlao\n73F0\tdang\n73F1\tying\n73F2\thun\n73F3\twen\n73F4\te\n73F5\tcheng\n73F6\tdi\n73F7\twu\n73F8\twu\n73F9\tcheng\n73FA\tjun\n73FB\tmei\n73FC\tbei\n73FD\tting\n73FE\txian\n73FF\tchu\n7400\than\n7401\txuan\n7402\tyan\n7403\tqiu\n7404\txuan\n7405\tlang\n7406\tli\n7407\txiu\n7408\tfu\n7409\tliu\n740A\tya\n740B\txi\n740C\tling\n740D\tli\n740E\tjin\n740F\tlian\n7410\tsuo\n7411\tsuo\n7412\tfeng\n7413\twan\n7414\tdian\n7415\tpin\n7416\tzhan\n7417\tse\n7418\tmin\n7419\tyu\n741A\tju\n741B\tchen\n741C\tlai\n741D\tmin\n741E\tsheng\n741F\twei\n7420\ttian\n7421\tchu\n7422\tzuo\n7423\tbeng\n7424\tcheng\n7425\thu\n7426\tqi\n7427\te\n7428\tkun\n7429\tchang\n742A\tqi\n742B\tbeng\n742C\twan\n742D\tlu\n742E\tcong\n742F\tguan\n7430\tyan\n7431\tdiao\n7432\tbei\n7433\tlin\n7434\tqin\n7435\tpi\n7436\tpa\n7437\tque\n7438\tzhuo\n7439\tqin\n743A\tfa\n743B\tjin\n743C\tqiong\n743D\tdu\n743E\tjie\n743F\thun\n7440\tyu\n7441\tmao\n7442\tmei\n7443\tchun\n7444\txuan\n7445\tti\n7446\txing\n7447\tdai\n7448\trou\n7449\tmin\n744A\tjian\n744B\twei\n744C\truan\n744D\thuan\n744E\txie\n744F\tchuan\n7450\tjian\n7451\tzhuan\n7452\tchang\n7453\tlian\n7454\tquan\n7455\txia\n7456\tduan\n7457\tyuan\n7458\tya\n7459\tnao\n745A\thu\n745B\tying\n745C\tyu\n745D\thuang\n745E\trui\n745F\tse\n7460\tliu\n7461\tshi\n7462\trong\n7463\tsuo\n7464\tyao\n7465\twen\n7466\twu\n7467\tzhen\n7468\tjin\n7469\tying\n746A\tma\n746B\ttao\n746C\tliu\n746D\ttang\n746E\tli\n746F\tlang\n7470\tgui\n7471\ttian\n7472\tqiang\n7473\tcuo\n7474\tjue\n7475\tzhao\n7476\tyao\n7477\tai\n7478\tbin\n7479\tshu\n747A\tchang\n747B\tkun\n747C\tzhuan\n747D\tcong\n747E\tjin\n747F\tyi\n7480\tcui\n7481\tcong\n7482\tqi\n7483\tli\n7484\tjing\n7485\tsuo\n7486\tqiu\n7487\txuan\n7488\tao\n7489\tlian\n748A\tmen\n748B\tzhang\n748C\tyin\n748D\tye\n748E\tying\n748F\twei\n7490\tlu\n7491\twu\n7492\tdeng\n7493\txiu\n7494\tzeng\n7495\txun\n7496\tqu\n7497\tdang\n7498\tlin\n7499\tliao\n749A\tqiong\n749B\tsu\n749C\thuang\n749D\tgui\n749E\tpu\n749F\tjing\n74A0\tfan\n74A1\tjin\n74A2\tliu\n74A3\tji\n74A4\thui\n74A5\tjing\n74A6\tai\n74A7\tbi\n74A8\tcan\n74A9\tqu\n74AA\tzao\n74AB\tdang\n74AC\tjiao\n74AD\tgun\n74AE\ttan\n74AF\thui\n74B0\thuan\n74B1\tse\n74B2\tsui\n74B3\ttian\n74B4\tchu\n74B5\tyu\n74B6\tjin\n74B7\tlu\n74B8\tbin\n74B9\tshu\n74BA\twen\n74BB\tzui\n74BC\tlan\n74BD\txi\n74BE\tzi\n74BF\txuan\n74C0\truan\n74C1\two\n74C2\tgai\n74C3\tlei\n74C4\tdu\n74C5\tli\n74C6\tzhi\n74C7\trou\n74C8\tli\n74C9\tzan\n74CA\tqiong\n74CB\tti\n74CC\tgui\n74CD\tsui\n74CE\tla\n74CF\tlong\n74D0\tlu\n74D1\tli\n74D2\tzan\n74D3\tlan\n74D4\tying\n74D5\tmi\n74D6\txiang\n74D7\tqiong\n74D8\tguan\n74D9\tdao\n74DA\tzan\n74DB\thuan\n74DC\tgua\n74DD\tbo\n74DE\tdie\n74DF\tbo\n74E0\thu\n74E1\tzhi\n74E2\tpiao\n74E3\tban\n74E4\trang\n74E5\tli\n74E6\twa\n74E8\txiang\n74E9\tqian\n74EA\tban\n74EB\tpen\n74EC\tfang\n74ED\tdan\n74EE\tweng\n74EF\tou\n74F2\twa\n74F3\thu\n74F4\tling\n74F5\tyi\n74F6\tping\n74F7\tci\n74F8\tbai\n74F9\tjuan\n74FA\tchang\n74FB\tchi\n74FD\tdang\n74FE\tmeng\n74FF\tbu\n7500\tzhui\n7501\tping\n7502\tbian\n7503\tzhou\n7504\tzhen\n7506\tci\n7507\tying\n7508\tqi\n7509\txian\n750A\tlou\n750B\tdi\n750C\tou\n750D\tmeng\n750E\tzhuan\n750F\tbeng\n7510\tlin\n7511\tzeng\n7512\twu\n7513\tpi\n7514\tdan\n7515\tweng\n7516\tying\n7517\tyan\n7518\tgan\n7519\tdai\n751A\tshen\n751B\ttian\n751C\ttian\n751D\than\n751E\tchang\n751F\tsheng\n7520\tqing\n7521\tshen\n7522\tchan\n7523\tchan\n7524\trui\n7525\tsheng\n7526\tsu\n7527\tshen\n7528\tyong\n7529\tshuai\n752A\tlu\n752B\tfu\n752C\tyong\n752D\tbeng\n752E\tfeng\n752F\tning\n7530\ttian\n7531\tyou\n7532\tjia\n7533\tshen\n7534\tzha\n7535\tdian\n7536\tfu\n7537\tnan\n7538\tdian\n7539\tping\n753A\tting\n753B\thua\n753C\tting\n753D\tzhen\n753E\tzai\n753F\tmeng\n7540\tbi\n7541\tbi\n7542\tliu\n7543\txun\n7544\tliu\n7545\tchang\n7546\tmu\n7547\tyun\n7548\tfan\n7549\tfu\n754A\tgeng\n754B\ttian\n754C\tjie\n754D\tjie\n754E\tquan\n754F\twei\n7550\tfu\n7551\ttian\n7552\tmu\n7553\tduo\n7554\tpan\n7555\tjiang\n7556\twa\n7557\tda\n7558\tnan\n7559\tliu\n755A\tben\n755B\tzhen\n755C\tchu\n755D\tmu\n755E\tmu\n755F\tce\n7560\ttian\n7561\tgai\n7562\tbi\n7563\tda\n7564\tzhi\n7565\tlue\n7566\tqi\n7567\tlue\n7568\tpan\n7569\tyi\n756A\tfan\n756B\thua\n756C\tshe\n756D\tyu\n756E\tmu\n756F\tjun\n7570\tyi\n7571\tliu\n7572\tshe\n7573\tdie\n7574\tchou\n7575\thua\n7576\tdang\n7577\tzhui\n7578\tji\n7579\twan\n757A\tjiang\n757B\tcheng\n757C\tchang\n757D\ttun\n757E\tlei\n757F\tji\n7580\tcha\n7581\tliu\n7582\tdie\n7583\ttuan\n7584\tlin\n7585\tjiang\n7586\tjiang\n7587\tchou\n7588\tpi\n7589\tdie\n758A\tdie\n758B\tpi\n758C\tjie\n758D\tdan\n758E\tshu\n758F\tshu\n7590\tzhi\n7591\tyi\n7592\tne\n7593\tnai\n7594\tding\n7595\tbi\n7596\tjie\n7597\tliao\n7598\tgang\n7599\tge\n759A\tjiu\n759B\tzhou\n759C\txia\n759D\tshan\n759E\txu\n759F\tnue\n75A0\tli\n75A1\tyang\n75A2\tchen\n75A3\tyou\n75A4\tba\n75A5\tjie\n75A6\tjue\n75A7\tqi\n75A8\txia\n75A9\tcui\n75AA\tbi\n75AB\tyi\n75AC\tli\n75AD\tzong\n75AE\tchuang\n75AF\tfeng\n75B0\tzhu\n75B1\tpao\n75B2\tpi\n75B3\tgan\n75B4\tke\n75B5\tci\n75B6\txue\n75B7\tzhi\n75B8\tdan\n75B9\tzhen\n75BA\tfa\n75BB\tzhi\n75BC\tteng\n75BD\tju\n75BE\tji\n75BF\tfei\n75C0\tju\n75C1\tshan\n75C2\tjia\n75C3\txuan\n75C4\tzha\n75C5\tbing\n75C6\tnie\n75C7\tzheng\n75C8\tyong\n75C9\tjing\n75CA\tquan\n75CB\tteng\n75CC\ttong\n75CD\tyi\n75CE\tjie\n75CF\twei\n75D0\thui\n75D1\ttan\n75D2\tyang\n75D3\tchi\n75D4\tzhi\n75D5\then\n75D6\tya\n75D7\tmei\n75D8\tdou\n75D9\tjing\n75DA\txiao\n75DB\ttong\n75DC\ttu\n75DD\tmang\n75DE\tpi\n75DF\txiao\n75E0\tsuan\n75E1\tfu\n75E2\tli\n75E3\tzhi\n75E4\tcuo\n75E5\tduo\n75E6\twu\n75E7\tsha\n75E8\tlao\n75E9\tshou\n75EA\thuan\n75EB\txian\n75EC\tyi\n75ED\tbeng\n75EE\tzhang\n75EF\tguan\n75F0\ttan\n75F1\tfei\n75F2\tma\n75F3\tlin\n75F4\tchi\n75F5\tji\n75F6\ttian\n75F7\tan\n75F8\tchi\n75F9\tbi\n75FA\tbi\n75FB\tmin\n75FC\tgu\n75FD\tdui\n75FE\te\n75FF\twei\n7600\tyu\n7601\tcui\n7602\tya\n7603\tzhu\n7604\tcu\n7605\tdan\n7606\tshen\n7607\tzhong\n7608\tchi\n7609\tyu\n760A\thou\n760B\tfeng\n760C\tla\n760D\tyang\n760E\tchen\n760F\ttu\n7610\tyu\n7611\tguo\n7612\twen\n7613\thuan\n7614\tku\n7615\tjia\n7616\tyin\n7617\tyi\n7618\tlou\n7619\tsao\n761A\tjue\n761B\tchi\n761C\txi\n761D\tguan\n761E\tyi\n761F\twen\n7620\tji\n7621\tchuang\n7622\tban\n7623\thui\n7624\tliu\n7625\tchai\n7626\tshou\n7627\tnue\n7628\tdian\n7629\tda\n762A\tbie\n762B\ttan\n762C\tzhang\n762D\tbiao\n762E\tshen\n762F\tcu\n7630\tluo\n7631\tyi\n7632\tzong\n7633\tchou\n7634\tzhang\n7635\tzhai\n7636\tsou\n7637\tse\n7638\tque\n7639\tdiao\n763A\tlou\n763B\tlou\n763C\tmo\n763D\tqin\n763E\tyin\n763F\tying\n7640\thuang\n7641\tfu\n7642\tliao\n7643\tlong\n7644\tqiao\n7645\tliu\n7646\tlao\n7647\txian\n7648\tfei\n7649\tdan\n764A\tyin\n764B\the\n764C\tai\n764D\tban\n764E\txian\n764F\tguan\n7650\tgui\n7651\tnong\n7652\tyu\n7653\twei\n7654\tyi\n7655\tyong\n7656\tpi\n7657\tlei\n7658\tli\n7659\tshu\n765A\tdan\n765B\tlin\n765C\tdian\n765D\tlin\n765E\tlai\n765F\tbie\n7660\tji\n7661\tchi\n7662\tyang\n7663\txuan\n7664\tjie\n7665\tzheng\n7666\tme\n7667\tli\n7668\thuo\n7669\tlai\n766A\tji\n766B\tdian\n766C\txuan\n766D\tying\n766E\tyin\n766F\tqu\n7670\tyong\n7671\ttan\n7672\tdian\n7673\tluo\n7674\tluan\n7675\tluan\n7676\tbo\n7677\tbo\n7678\tgui\n7679\tba\n767A\tfa\n767B\tdeng\n767C\tfa\n767D\tbai\n767E\tbai\n767F\tbie\n7680\tji\n7681\tzao\n7682\tzao\n7683\tmao\n7684\tde\n7685\tpa\n7686\tjie\n7687\thuang\n7688\tgui\n7689\tci\n768A\tling\n768B\tgao\n768C\tmo\n768D\tji\n768E\tjiao\n768F\tpeng\n7690\tgao\n7691\tai\n7692\te\n7693\thao\n7694\than\n7695\tbi\n7696\twan\n7697\tchou\n7698\tqian\n7699\txi\n769A\tai\n769B\txiao\n769C\thao\n769D\thuang\n769E\thao\n769F\tze\n76A0\tcui\n76A1\thao\n76A2\txiao\n76A3\tye\n76A4\tpo\n76A5\thao\n76A6\tjiao\n76A7\tai\n76A8\txing\n76A9\thuang\n76AA\tli\n76AB\tpiao\n76AC\the\n76AD\tjiao\n76AE\tpi\n76AF\tgan\n76B0\tpao\n76B1\tzhou\n76B2\tjun\n76B3\tqiu\n76B4\tcun\n76B5\tque\n76B6\tzha\n76B7\tgu\n76B8\tjun\n76B9\tjun\n76BA\tzhou\n76BB\tzha\n76BC\tgu\n76BD\tzhao\n76BE\tdu\n76BF\tmin\n76C0\tqi\n76C1\tying\n76C2\tyu\n76C3\tbei\n76C4\tzhao\n76C5\tzhong\n76C6\tpen\n76C7\the\n76C8\tying\n76C9\the\n76CA\tyi\n76CB\tbo\n76CC\twan\n76CD\the\n76CE\tang\n76CF\tzhan\n76D0\tyan\n76D1\tjian\n76D2\the\n76D3\tyu\n76D4\tkui\n76D5\tfan\n76D6\tgai\n76D7\tdao\n76D8\tpan\n76D9\tfu\n76DA\tqiu\n76DB\tsheng\n76DC\tdao\n76DD\tlu\n76DE\tzhan\n76DF\tmeng\n76E0\tli\n76E1\tjin\n76E2\txu\n76E3\tjian\n76E4\tpan\n76E5\tguan\n76E6\tan\n76E7\tlu\n76E8\txu\n76E9\tzhou\n76EA\tdang\n76EB\tan\n76EC\tgu\n76ED\tli\n76EE\tmu\n76EF\tding\n76F0\tgan\n76F1\txu\n76F2\tmang\n76F3\twang\n76F4\tzhi\n76F5\tqi\n76F6\tyuan\n76F7\ttian\n76F8\txiang\n76F9\tdun\n76FA\txin\n76FB\txi\n76FC\tpan\n76FD\tfeng\n76FE\tdun\n76FF\tmin\n7700\tming\n7701\tsheng\n7702\tshi\n7703\tyun\n7704\tmian\n7705\tpan\n7706\tfang\n7707\tmiao\n7708\tdan\n7709\tmei\n770A\tmao\n770B\tkan\n770C\txian\n770D\tkou\n770E\tshi\n770F\tyang\n7710\tzheng\n7711\tyao\n7712\tshen\n7713\thuo\n7714\tda\n7715\tzhen\n7716\tkuang\n7717\tju\n7718\tshen\n7719\tyi\n771A\tsheng\n771B\tmei\n771C\tmo\n771D\tzhu\n771E\tzhen\n771F\tzhen\n7720\tmian\n7721\tshi\n7722\tyuan\n7723\tdie\n7724\tni\n7725\tzi\n7726\tzi\n7727\tchao\n7728\tzha\n7729\txuan\n772A\tbing\n772B\tmi\n772C\tlong\n772D\tsui\n772E\ttong\n772F\tmi\n7730\tdie\n7731\tdi\n7732\tne\n7733\tming\n7734\txuan\n7735\tchi\n7736\tkuang\n7737\tjuan\n7738\tmou\n7739\tzhen\n773A\ttiao\n773B\tyang\n773C\tyan\n773D\tmo\n773E\tzhong\n773F\tmo\n7740\tzhe\n7741\tzheng\n7742\tmei\n7743\tsuo\n7744\tshao\n7745\than\n7746\thuan\n7747\tdi\n7748\tcheng\n7749\tcuo\n774A\tjuan\n774B\te\n774C\tman\n774D\txian\n774E\txi\n774F\tkun\n7750\tlai\n7751\tjian\n7752\tshan\n7753\ttian\n7754\tgun\n7755\twan\n7756\tleng\n7757\tshi\n7758\tqiong\n7759\tlie\n775A\tya\n775B\tjing\n775C\tzheng\n775D\tli\n775E\tlai\n775F\tsui\n7760\tjuan\n7761\tshui\n7762\tsui\n7763\tdu\n7764\tbi\n7765\tpi\n7766\tmu\n7767\thun\n7768\tni\n7769\tlu\n776A\tyi\n776B\tjie\n776C\tcai\n776D\tzhou\n776E\tyu\n776F\thun\n7770\tma\n7771\txia\n7772\txing\n7773\thui\n7774\tgun\n7775\tzai\n7776\tchun\n7777\tjian\n7778\tmei\n7779\tdu\n777A\thou\n777B\txuan\n777C\ttian\n777D\tkui\n777E\tgao\n777F\trui\n7780\tmao\n7781\txu\n7782\tfa\n7783\two\n7784\tmiao\n7785\tchou\n7786\tkui\n7787\tmi\n7788\tweng\n7789\tkou\n778A\tdang\n778B\tchen\n778C\tke\n778D\tsou\n778E\txia\n778F\tqiong\n7790\tmo\n7791\tming\n7792\tman\n7793\tfen\n7794\tze\n7795\tzhang\n7796\tyi\n7797\tdiao\n7798\tkou\n7799\tmo\n779A\tshun\n779B\tcong\n779C\tlou\n779D\tchi\n779E\tman\n779F\tpiao\n77A0\tcheng\n77A1\tgui\n77A2\tmeng\n77A3\twan\n77A4\trun\n77A5\tpie\n77A6\txi\n77A7\tqiao\n77A8\tpu\n77A9\tzhu\n77AA\tdeng\n77AB\tshen\n77AC\tshun\n77AD\tliao\n77AE\tche\n77AF\txian\n77B0\tkan\n77B1\tye\n77B2\txu\n77B3\ttong\n77B4\tmou\n77B5\tlin\n77B6\tgui\n77B7\tjian\n77B8\tye\n77B9\tai\n77BA\thui\n77BB\tzhan\n77BC\tjian\n77BD\tgu\n77BE\tzhao\n77BF\tqu\n77C0\tmei\n77C1\tchou\n77C2\tsao\n77C3\tning\n77C4\txun\n77C5\tyao\n77C6\thuo\n77C7\tmeng\n77C8\tmian\n77C9\tpin\n77CA\tmian\n77CB\tlei\n77CC\tkuang\n77CD\tjue\n77CE\txuan\n77CF\tmian\n77D0\thuo\n77D1\tlu\n77D2\tmeng\n77D3\tlong\n77D4\tguan\n77D5\tman\n77D6\txi\n77D7\tchu\n77D8\ttang\n77D9\tkan\n77DA\tzhu\n77DB\tmao\n77DC\tjin\n77DD\tjin\n77DE\tyu\n77DF\tshuo\n77E0\tze\n77E1\tjue\n77E2\tshi\n77E3\tyi\n77E4\tshen\n77E5\tzhi\n77E6\thou\n77E7\tshen\n77E8\tying\n77E9\tju\n77EA\tzhou\n77EB\tjiao\n77EC\tcuo\n77ED\tduan\n77EE\tai\n77EF\tjiao\n77F0\tzeng\n77F1\tyue\n77F2\tba\n77F3\tshi\n77F4\tding\n77F5\tqi\n77F6\tji\n77F7\tzi\n77F8\tgan\n77F9\twu\n77FA\tzhe\n77FB\tku\n77FC\tgang\n77FD\txi\n77FE\tfan\n77FF\tkuang\n7800\tdang\n7801\tma\n7802\tsha\n7803\tdan\n7804\tjue\n7805\tli\n7806\tfu\n7807\tmin\n7808\te\n7809\thua\n780A\tkang\n780B\tzhi\n780C\tqi\n780D\tkan\n780E\tjie\n780F\tbin\n7810\te\n7811\tya\n7812\tpi\n7813\tzhe\n7814\tyan\n7815\tsui\n7816\tzhuan\n7817\tche\n7818\tdun\n7819\twa\n781A\tyan\n781B\tjin\n781C\tfeng\n781D\tfa\n781E\tmo\n781F\tzha\n7820\tju\n7821\tyu\n7822\tke\n7823\ttuo\n7824\ttuo\n7825\tdi\n7826\tzhai\n7827\tzhen\n7828\te\n7829\tfu\n782A\tmu\n782B\tzhu\n782C\tla\n782D\tbian\n782E\tnu\n782F\tping\n7830\tpeng\n7831\tling\n7832\tpao\n7833\tle\n7834\tpo\n7835\tbo\n7836\tpo\n7837\tshen\n7838\tza\n7839\tai\n783A\tli\n783B\tlong\n783C\ttong\n783D\tyong\n783E\tli\n783F\tkuang\n7840\tchu\n7841\tkeng\n7842\tquan\n7843\tzhu\n7844\tkuang\n7845\tgui\n7846\te\n7847\tnao\n7848\tqia\n7849\tlu\n784A\thui\n784B\tai\n784C\tge\n784D\tyin\n784E\txing\n784F\tyan\n7850\tdong\n7851\tpeng\n7852\txi\n7853\tlao\n7854\thong\n7855\tshuo\n7856\txia\n7857\tqiao\n7858\tqing\n7859\twei\n785A\tqiao\n785B\tyi\n785C\tkeng\n785D\txiao\n785E\tque\n785F\tchan\n7860\tlang\n7861\thong\n7862\tyu\n7863\txiao\n7864\txia\n7865\tmang\n7866\tluo\n7867\tyong\n7868\tche\n7869\tche\n786A\two\n786B\tliu\n786C\tying\n786D\tmang\n786E\tque\n786F\tyan\n7870\tsha\n7871\tkun\n7872\tyu\n7873\tchi\n7874\thua\n7875\tlu\n7876\tchen\n7877\tjian\n7878\tnue\n7879\tsong\n787A\tzhuo\n787B\tkeng\n787C\tpeng\n787D\tyan\n787E\tzhui\n787F\tkong\n7880\tcheng\n7881\tqi\n7882\tzong\n7883\tqing\n7884\tlin\n7885\tjun\n7886\tbo\n7887\tding\n7888\thun\n7889\tdiao\n788A\tjian\n788B\the\n788C\tlu\n788D\tai\n788E\tsui\n788F\tque\n7890\tleng\n7891\tbei\n7892\tyin\n7893\tdui\n7894\twu\n7895\tqi\n7896\tlun\n7897\twan\n7898\tdian\n7899\tnao\n789A\tbei\n789B\tqi\n789C\tchen\n789D\truan\n789E\tyan\n789F\tdie\n78A0\tding\n78A1\tzhou\n78A2\ttuo\n78A3\tjie\n78A4\tying\n78A5\tbian\n78A6\tke\n78A7\tbi\n78A8\twei\n78A9\tshuo\n78AA\tzhen\n78AB\tduan\n78AC\txia\n78AD\tdang\n78AE\tti\n78AF\tnao\n78B0\tpeng\n78B1\tjian\n78B2\tdi\n78B3\ttan\n78B4\tcha\n78B5\ttian\n78B6\tqi\n78B7\tdun\n78B8\tfeng\n78B9\txuan\n78BA\tque\n78BB\tque\n78BC\tma\n78BD\tgong\n78BE\tnian\n78BF\tsu\n78C0\te\n78C1\tci\n78C2\tliu\n78C3\tsi\n78C4\ttang\n78C5\tbang\n78C6\thua\n78C7\tpi\n78C8\twei\n78C9\tsang\n78CA\tlei\n78CB\tcuo\n78CC\ttian\n78CD\txia\n78CE\txi\n78CF\tlian\n78D0\tpan\n78D1\twei\n78D2\tyun\n78D3\tdui\n78D4\tzhe\n78D5\tke\n78D6\tla\n78D7\tzhuan\n78D8\tyao\n78D9\tgun\n78DA\tzhuan\n78DB\tchan\n78DC\tqi\n78DD\tao\n78DE\tpeng\n78DF\tliu\n78E0\tlu\n78E1\tkan\n78E2\tchuang\n78E3\tchen\n78E4\tyin\n78E5\tlei\n78E6\tbiao\n78E7\tqi\n78E8\tmo\n78E9\tqi\n78EA\tcui\n78EB\tzong\n78EC\tqing\n78ED\tchuo\n78EE\tlun\n78EF\tji\n78F0\tshan\n78F1\tlao\n78F2\tqu\n78F3\tzeng\n78F4\tdeng\n78F5\tjian\n78F6\txi\n78F7\tlin\n78F8\tding\n78F9\ttan\n78FA\thuang\n78FB\tpan\n78FC\tza\n78FD\tqiao\n78FE\tdi\n78FF\tli\n7900\tjian\n7901\tjiao\n7902\txi\n7903\tzhang\n7904\tqiao\n7905\tdun\n7906\tjian\n7907\tyu\n7908\tzhui\n7909\the\n790A\tke\n790B\tze\n790C\tlei\n790D\tjie\n790E\tchu\n790F\tye\n7910\tque\n7911\tdang\n7912\tyi\n7913\tjiang\n7914\tpi\n7915\tpi\n7916\tyu\n7917\tpin\n7918\te\n7919\tai\n791A\tke\n791B\tjian\n791C\tyu\n791D\truan\n791E\tmeng\n791F\tpao\n7920\tci\n7921\tbo\n7922\tyang\n7923\tma\n7924\tca\n7925\txian\n7926\tkuang\n7927\tlei\n7928\tlei\n7929\tzhi\n792A\tli\n792B\tli\n792C\tfan\n792D\tque\n792E\tpao\n792F\tying\n7930\tli\n7931\tlong\n7932\tlong\n7933\tmo\n7934\tbo\n7935\tshuang\n7936\tguan\n7937\tlan\n7938\tca\n7939\tyan\n793A\tshi\n793B\tshi\n793C\tli\n793D\treng\n793E\tshe\n793F\tyue\n7940\tsi\n7941\tqi\n7942\tta\n7943\tma\n7944\txie\n7945\tyao\n7946\txian\n7947\tqi\n7948\tqi\n7949\tzhi\n794A\tbeng\n794B\tdui\n794C\tzhong\n794D\tren\n794E\tyi\n794F\tshi\n7950\tyou\n7951\tzhi\n7952\ttiao\n7953\tfu\n7954\tfu\n7955\tmi\n7956\tzu\n7957\tzhi\n7958\tsuan\n7959\tmei\n795A\tzuo\n795B\tqu\n795C\thu\n795D\tzhu\n795E\tshen\n795F\tsui\n7960\tci\n7961\tchai\n7962\tmi\n7963\tlu\n7964\tyu\n7965\txiang\n7966\twu\n7967\ttiao\n7968\tpiao\n7969\tzhu\n796A\tgui\n796B\txia\n796C\tzhi\n796D\tji\n796E\tgao\n796F\tzhen\n7970\tgao\n7971\tshui\n7972\tjin\n7973\tshen\n7974\tgai\n7975\tkun\n7976\tdi\n7977\tdao\n7978\thuo\n7979\ttao\n797A\tqi\n797B\tgu\n797C\tguan\n797D\tzui\n797E\tling\n797F\tlu\n7980\tbing\n7981\tjin\n7982\tdao\n7983\tzhi\n7984\tlu\n7985\tchan\n7986\tbi\n7987\tzhe\n7988\thui\n7989\tyou\n798A\txi\n798B\tyin\n798C\tzi\n798D\thuo\n798E\tzhen\n798F\tfu\n7990\tyuan\n7991\twu\n7992\txian\n7993\tyang\n7994\tzhi\n7995\tyi\n7996\tmei\n7997\tsi\n7998\tdi\n7999\tbei\n799A\tzhuo\n799B\tzhen\n799C\tyong\n799D\tji\n799E\tgao\n799F\ttang\n79A0\tsi\n79A1\tma\n79A2\tta\n79A3\tfu\n79A4\txuan\n79A5\tqi\n79A6\tyu\n79A7\txi\n79A8\tji\n79A9\tsi\n79AA\tchan\n79AB\tdan\n79AC\tgui\n79AD\tsui\n79AE\tli\n79AF\tnong\n79B0\tmi\n79B1\tdao\n79B2\tli\n79B3\trang\n79B4\tyue\n79B5\tti\n79B6\tzan\n79B7\tlei\n79B8\trou\n79B9\tyu\n79BA\tyu\n79BB\tli\n79BC\txie\n79BD\tqin\n79BE\the\n79BF\ttu\n79C0\txiu\n79C1\tsi\n79C2\tren\n79C3\ttu\n79C4\tzi\n79C5\tcha\n79C6\tgan\n79C7\tyi\n79C8\txian\n79C9\tbing\n79CA\tnian\n79CB\tqiu\n79CC\tqiu\n79CD\tzhong\n79CE\tfen\n79CF\thao\n79D0\tyun\n79D1\tke\n79D2\tmiao\n79D3\tzhi\n79D4\tjing\n79D5\tbi\n79D6\tzhi\n79D7\tyu\n79D8\tmi\n79D9\tku\n79DA\tban\n79DB\tpi\n79DC\tni\n79DD\tli\n79DE\tyou\n79DF\tzu\n79E0\tpi\n79E1\tbo\n79E2\tling\n79E3\tmo\n79E4\tcheng\n79E5\tnian\n79E6\tqin\n79E7\tyang\n79E8\tzuo\n79E9\tzhi\n79EA\tzhi\n79EB\tshu\n79EC\tju\n79ED\tzi\n79EE\thuo\n79EF\tji\n79F0\tcheng\n79F1\ttong\n79F2\tzhi\n79F3\thuo\n79F4\the\n79F5\tyin\n79F6\tzi\n79F7\tzhi\n79F8\tjie\n79F9\tren\n79FA\tdu\n79FB\tyi\n79FC\tzhu\n79FD\thui\n79FE\tnong\n79FF\tfu\n7A00\txi\n7A01\tgao\n7A02\tlang\n7A03\tfu\n7A04\txun\n7A05\tshui\n7A06\tlu\n7A07\tkun\n7A08\tgan\n7A09\tjing\n7A0A\tti\n7A0B\tcheng\n7A0C\ttu\n7A0D\tshao\n7A0E\tshui\n7A0F\tya\n7A10\tlun\n7A11\tlu\n7A12\tgu\n7A13\tzuo\n7A14\tren\n7A15\tzhun\n7A16\tbang\n7A17\tbai\n7A18\tji\n7A19\tzhi\n7A1A\tzhi\n7A1B\tkun\n7A1C\tleng\n7A1D\tpeng\n7A1E\tke\n7A1F\tbing\n7A20\tchou\n7A21\tzui\n7A22\tyu\n7A23\tsu\n7A24\tlue\n7A25\txiang\n7A26\tyi\n7A27\txi\n7A28\tbian\n7A29\tji\n7A2A\tfu\n7A2B\tpi\n7A2C\tnuo\n7A2D\tjie\n7A2E\tzhong\n7A2F\tzong\n7A30\txu\n7A31\tcheng\n7A32\tdao\n7A33\twen\n7A34\txian\n7A35\tzi\n7A36\tyu\n7A37\tji\n7A38\txu\n7A39\tzhen\n7A3A\tzhi\n7A3B\tdao\n7A3C\tjia\n7A3D\tji\n7A3E\tgao\n7A3F\tgao\n7A40\tgu\n7A41\trong\n7A42\tsui\n7A43\trong\n7A44\tji\n7A45\tkang\n7A46\tmu\n7A47\tcan\n7A48\tmei\n7A49\tzhi\n7A4A\tji\n7A4B\tlu\n7A4C\tsu\n7A4D\tji\n7A4E\tying\n7A4F\twen\n7A50\tqiu\n7A51\tse\n7A52\the\n7A53\tyi\n7A54\thuang\n7A55\tqie\n7A56\tji\n7A57\tsui\n7A58\txiao\n7A59\tpu\n7A5A\tjiao\n7A5B\tzhuo\n7A5C\ttong\n7A5D\tzui\n7A5E\tlu\n7A5F\tsui\n7A60\tnong\n7A61\tse\n7A62\thui\n7A63\trang\n7A64\tnuo\n7A65\tyu\n7A66\tpin\n7A67\tji\n7A68\ttui\n7A69\twen\n7A6A\tcheng\n7A6B\thuo\n7A6C\tkuang\n7A6D\tlu\n7A6E\tbiao\n7A6F\tse\n7A70\trang\n7A71\tzhuo\n7A72\tli\n7A73\tcuan\n7A74\txue\n7A75\twa\n7A76\tjiu\n7A77\tqiong\n7A78\txi\n7A79\tqiong\n7A7A\tkong\n7A7B\tyu\n7A7C\tshen\n7A7D\tjing\n7A7E\tyao\n7A7F\tchuan\n7A80\tzhun\n7A81\ttu\n7A82\tlao\n7A83\tqie\n7A84\tzhai\n7A85\tyao\n7A86\tbian\n7A87\tbao\n7A88\tyao\n7A89\tbing\n7A8A\twa\n7A8B\tzhu\n7A8C\tjiao\n7A8D\tqiao\n7A8E\tdiao\n7A8F\twu\n7A90\tgui\n7A91\tyao\n7A92\tzhi\n7A93\tchuang\n7A94\tyao\n7A95\ttiao\n7A96\tjiao\n7A97\tchuang\n7A98\tjiong\n7A99\txiao\n7A9A\tcheng\n7A9B\tkou\n7A9C\tcuan\n7A9D\two\n7A9E\tdan\n7A9F\tku\n7AA0\tke\n7AA1\tzhuo\n7AA2\txu\n7AA3\tsu\n7AA4\tguan\n7AA5\tkui\n7AA6\tdou\n7AA7\tzhuo\n7AA8\tyin\n7AA9\two\n7AAA\twa\n7AAB\tya\n7AAC\tyu\n7AAD\tju\n7AAE\tqiong\n7AAF\tyao\n7AB0\tyao\n7AB1\ttiao\n7AB2\tchao\n7AB3\tyu\n7AB4\ttian\n7AB5\tdiao\n7AB6\tju\n7AB7\tliao\n7AB8\txi\n7AB9\twu\n7ABA\tkui\n7ABB\tchuang\n7ABC\tzhao\n7ABD\tkuan\n7ABE\tkuan\n7ABF\tlong\n7AC0\tcheng\n7AC1\tcui\n7AC2\tliao\n7AC3\tzao\n7AC4\tcuan\n7AC5\tqiao\n7AC6\tqiong\n7AC7\tdou\n7AC8\tzao\n7AC9\tlong\n7ACA\tqie\n7ACB\tli\n7ACC\tchu\n7ACD\tshi\n7ACE\tfu\n7ACF\tqian\n7AD0\tchu\n7AD1\thong\n7AD2\tqi\n7AD3\thao\n7AD4\tsheng\n7AD5\tfen\n7AD6\tshu\n7AD7\tmiao\n7AD8\tqu\n7AD9\tzhan\n7ADA\tzhu\n7ADB\tling\n7ADC\tlong\n7ADD\tbing\n7ADE\tjing\n7ADF\tjing\n7AE0\tzhang\n7AE1\tbai\n7AE2\tsi\n7AE3\tjun\n7AE4\thong\n7AE5\ttong\n7AE6\tsong\n7AE7\tjing\n7AE8\tdiao\n7AE9\tyi\n7AEA\tshu\n7AEB\tjing\n7AEC\tqu\n7AED\tjie\n7AEE\tping\n7AEF\tduan\n7AF0\tli\n7AF1\tzhuan\n7AF2\tceng\n7AF3\tdeng\n7AF4\tcun\n7AF5\twai\n7AF6\tjing\n7AF7\tkan\n7AF8\tjing\n7AF9\tzhu\n7AFA\tzhu\n7AFB\tle\n7AFC\tpeng\n7AFD\tyu\n7AFE\tchi\n7AFF\tgan\n7B00\tmang\n7B01\tzhu\n7B02\twan\n7B03\tdu\n7B04\tji\n7B05\tjiao\n7B06\tba\n7B07\tsuan\n7B08\tji\n7B09\tqin\n7B0A\tzhao\n7B0B\tsun\n7B0C\tya\n7B0D\tzhui\n7B0E\tyuan\n7B0F\thu\n7B10\thang\n7B11\txiao\n7B12\tcen\n7B13\tbi\n7B14\tbi\n7B15\tjian\n7B16\tyi\n7B17\tdong\n7B18\tshan\n7B19\tsheng\n7B1A\tda\n7B1B\tdi\n7B1C\tzhu\n7B1D\tna\n7B1E\tchi\n7B1F\tgu\n7B20\tli\n7B21\tqie\n7B22\tmin\n7B23\tbao\n7B24\ttiao\n7B25\tsi\n7B26\tfu\n7B27\tce\n7B28\tben\n7B29\tfa\n7B2A\tda\n7B2B\tzi\n7B2C\tdi\n7B2D\tling\n7B2E\tze\n7B2F\tnu\n7B30\tfu\n7B31\tgou\n7B32\tfan\n7B33\tjia\n7B34\tgan\n7B35\tfan\n7B36\tshi\n7B37\tmao\n7B38\tpo\n7B39\tti\n7B3A\tjian\n7B3B\tqiong\n7B3C\tlong\n7B3D\tmin\n7B3E\tbian\n7B3F\tluo\n7B40\tgui\n7B41\tqu\n7B42\tchi\n7B43\tyin\n7B44\tyao\n7B45\txian\n7B46\tbi\n7B47\tqiong\n7B48\tkuo\n7B49\tdeng\n7B4A\txiao\n7B4B\tjin\n7B4C\tquan\n7B4D\tsun\n7B4E\tru\n7B4F\tfa\n7B50\tkuang\n7B51\tzhu\n7B52\ttong\n7B53\tji\n7B54\tda\n7B55\thang\n7B56\tce\n7B57\tzhong\n7B58\tkou\n7B59\tlai\n7B5A\tbi\n7B5B\tshai\n7B5C\tdang\n7B5D\tzheng\n7B5E\tce\n7B5F\tfu\n7B60\tyun\n7B61\ttu\n7B62\tpa\n7B63\tli\n7B64\tlang\n7B65\tju\n7B66\tguan\n7B67\tjian\n7B68\than\n7B69\ttong\n7B6A\txia\n7B6B\tzhi\n7B6C\tcheng\n7B6D\tsuan\n7B6E\tshi\n7B6F\tzhu\n7B70\tzuo\n7B71\txiao\n7B72\tshao\n7B73\tting\n7B74\tce\n7B75\tyan\n7B76\tgao\n7B77\tkuai\n7B78\tgan\n7B79\tchou\n7B7A\tkuang\n7B7B\tgang\n7B7C\tyun\n7B7D\tou\n7B7E\tqian\n7B7F\txiao\n7B80\tjian\n7B81\tpou\n7B82\tlai\n7B83\tzou\n7B84\tbi\n7B85\tbi\n7B86\tbi\n7B87\tge\n7B88\ttai\n7B89\tguai\n7B8A\tyu\n7B8B\tjian\n7B8C\tdao\n7B8D\tgu\n7B8E\tchi\n7B8F\tzheng\n7B90\tqing\n7B91\tsha\n7B92\tzhou\n7B93\tlu\n7B94\tbo\n7B95\tji\n7B96\tlin\n7B97\tsuan\n7B98\tjun\n7B99\tfu\n7B9A\tzha\n7B9B\tgu\n7B9C\tkong\n7B9D\tqian\n7B9E\tqian\n7B9F\tjun\n7BA0\tchui\n7BA1\tguan\n7BA2\tyuan\n7BA3\tce\n7BA4\tzu\n7BA5\tbo\n7BA6\tze\n7BA7\tqie\n7BA8\ttuo\n7BA9\tluo\n7BAA\tdan\n7BAB\txiao\n7BAC\truo\n7BAD\tjian\n7BAE\txuan\n7BAF\tbian\n7BB0\tsun\n7BB1\txiang\n7BB2\txian\n7BB3\tping\n7BB4\tzhen\n7BB5\txing\n7BB6\thu\n7BB7\tyi\n7BB8\tzhu\n7BB9\tyue\n7BBA\tchun\n7BBB\tlu\n7BBC\twu\n7BBD\tdong\n7BBE\tshuo\n7BBF\tji\n7BC0\tjie\n7BC1\thuang\n7BC2\txing\n7BC3\tmei\n7BC4\tfan\n7BC5\tchuan\n7BC6\tzhuan\n7BC7\tpian\n7BC8\tfeng\n7BC9\tzhu\n7BCA\thuang\n7BCB\tqie\n7BCC\thou\n7BCD\tqiu\n7BCE\tmiao\n7BCF\tqian\n7BD0\tgu\n7BD1\tkui\n7BD2\tshi\n7BD3\tlou\n7BD4\tyun\n7BD5\the\n7BD6\ttang\n7BD7\tyue\n7BD8\tchou\n7BD9\tgao\n7BDA\tfei\n7BDB\truo\n7BDC\tzheng\n7BDD\tgou\n7BDE\tnie\n7BDF\tqian\n7BE0\txiao\n7BE1\tcuan\n7BE2\tlong\n7BE3\tpeng\n7BE4\tdu\n7BE5\tli\n7BE6\tbi\n7BE7\tzhuo\n7BE8\tchu\n7BE9\tshai\n7BEA\tchi\n7BEB\tzhu\n7BEC\tqiang\n7BED\tlong\n7BEE\tlan\n7BEF\tjian\n7BF0\tbu\n7BF1\tli\n7BF2\thui\n7BF3\tbi\n7BF4\tdi\n7BF5\tcong\n7BF6\tyan\n7BF7\tpeng\n7BF8\tcan\n7BF9\tzhuan\n7BFA\tpi\n7BFB\tpiao\n7BFC\tdou\n7BFD\tyu\n7BFE\tmie\n7BFF\ttuan\n7C00\tze\n7C01\tshai\n7C02\tgui\n7C03\tyi\n7C04\thu\n7C05\tchan\n7C06\tkou\n7C07\tcu\n7C08\tping\n7C09\tzao\n7C0A\tji\n7C0B\tgui\n7C0C\tsu\n7C0D\tlou\n7C0E\tce\n7C0F\tlu\n7C10\tnian\n7C11\tsuo\n7C12\tcuan\n7C13\tdiao\n7C14\tsuo\n7C15\tle\n7C16\tduan\n7C17\tzhu\n7C18\txiao\n7C19\tbo\n7C1A\tmi\n7C1B\tshai\n7C1C\tdang\n7C1D\tliao\n7C1E\tdan\n7C1F\tdian\n7C20\tfu\n7C21\tjian\n7C22\tmin\n7C23\tkui\n7C24\tdai\n7C25\tjiao\n7C26\tdeng\n7C27\thuang\n7C28\tsun\n7C29\tlao\n7C2A\tzan\n7C2B\txiao\n7C2C\tlu\n7C2D\tshi\n7C2E\tzan\n7C2F\tqi\n7C30\tpai\n7C31\tqi\n7C32\tpai\n7C33\tgan\n7C34\tju\n7C35\tlu\n7C36\tlu\n7C37\tyan\n7C38\tbo\n7C39\tdang\n7C3A\tsai\n7C3B\tzhua\n7C3C\tgou\n7C3D\tqian\n7C3E\tlian\n7C3F\tbu\n7C40\tzhou\n7C41\tlai\n7C42\tshi\n7C43\tlan\n7C44\tkui\n7C45\tyu\n7C46\tyue\n7C47\thao\n7C48\tzhen\n7C49\ttai\n7C4A\tti\n7C4B\tnie\n7C4C\tchou\n7C4D\tji\n7C4E\tyi\n7C4F\tqi\n7C50\tteng\n7C51\tzhuan\n7C52\tzhou\n7C53\tfan\n7C54\tsou\n7C55\tzhou\n7C56\tqian\n7C57\tzhuo\n7C58\tteng\n7C59\tlu\n7C5A\tlu\n7C5B\tjian\n7C5C\ttuo\n7C5D\tying\n7C5E\tyu\n7C5F\tlai\n7C60\tlong\n7C61\tqie\n7C62\tlian\n7C63\tlan\n7C64\tqian\n7C65\tyue\n7C66\tzhong\n7C67\tqu\n7C68\tlian\n7C69\tbian\n7C6A\tduan\n7C6B\tzuan\n7C6C\tli\n7C6D\tsi\n7C6E\tluo\n7C6F\tying\n7C70\tyue\n7C71\tzhuo\n7C72\tyu\n7C73\tmi\n7C74\tdi\n7C75\tfan\n7C76\tshen\n7C77\tzhe\n7C78\tshen\n7C79\tnu\n7C7A\the\n7C7B\tlei\n7C7C\txian\n7C7D\tzi\n7C7E\tni\n7C7F\tcun\n7C80\tzhang\n7C81\tqian\n7C82\tzhai\n7C83\tbi\n7C84\tban\n7C85\twu\n7C86\tsha\n7C87\tkang\n7C88\trou\n7C89\tfen\n7C8A\tbi\n7C8B\tcui\n7C8C\tyin\n7C8D\tzhe\n7C8E\tmi\n7C8F\ttai\n7C90\thu\n7C91\tba\n7C92\tli\n7C93\tgan\n7C94\tju\n7C95\tpo\n7C96\tmo\n7C97\tcu\n7C98\tzhan\n7C99\tzhou\n7C9A\tchi\n7C9B\tsu\n7C9C\ttiao\n7C9D\tli\n7C9E\txi\n7C9F\tsu\n7CA0\thong\n7CA1\ttong\n7CA2\tzi\n7CA3\tce\n7CA4\tyue\n7CA5\tzhou\n7CA6\tlin\n7CA7\tzhuang\n7CA8\tbai\n7CA9\tlao\n7CAA\tfen\n7CAB\ter\n7CAC\tqu\n7CAD\the\n7CAE\tliang\n7CAF\txian\n7CB0\tfu\n7CB1\tliang\n7CB2\tcan\n7CB3\tjing\n7CB4\tli\n7CB5\tyue\n7CB6\tlu\n7CB7\tju\n7CB8\tqi\n7CB9\tcui\n7CBA\tbai\n7CBB\tzhang\n7CBC\tlin\n7CBD\tzong\n7CBE\tjing\n7CBF\tguo\n7CC0\thua\n7CC1\tsan\n7CC2\tsan\n7CC3\ttang\n7CC4\tbian\n7CC5\trou\n7CC6\tmian\n7CC7\thou\n7CC8\txu\n7CC9\tzong\n7CCA\thu\n7CCB\tjian\n7CCC\tzan\n7CCD\tci\n7CCE\tli\n7CCF\txie\n7CD0\tfu\n7CD1\tnuo\n7CD2\tbei\n7CD3\tgu\n7CD4\txiu\n7CD5\tgao\n7CD6\ttang\n7CD7\tqiu\n7CD8\tjia\n7CD9\tcao\n7CDA\tzhuang\n7CDB\ttang\n7CDC\tmi\n7CDD\tsan\n7CDE\tfen\n7CDF\tzao\n7CE0\tkang\n7CE1\tjiang\n7CE2\tmo\n7CE3\tsan\n7CE4\tsan\n7CE5\tnuo\n7CE6\txi\n7CE7\tliang\n7CE8\tjiang\n7CE9\tkuai\n7CEA\tbo\n7CEB\thuan\n7CEC\tshu\n7CED\tzong\n7CEE\txian\n7CEF\tnuo\n7CF0\ttuan\n7CF1\tnie\n7CF2\tli\n7CF3\tzuo\n7CF4\tdi\n7CF5\tnie\n7CF6\ttiao\n7CF7\tlan\n7CF8\tmi\n7CF9\tsi\n7CFA\tjiu\n7CFB\txi\n7CFC\tgong\n7CFD\tzheng\n7CFE\tjiu\n7CFF\tyou\n7D00\tji\n7D01\tcha\n7D02\tzhou\n7D03\txun\n7D04\tyue\n7D05\thong\n7D06\tyu\n7D07\the\n7D08\twan\n7D09\tren\n7D0A\twen\n7D0B\twen\n7D0C\tqiu\n7D0D\tna\n7D0E\tzi\n7D0F\ttou\n7D10\tniu\n7D11\tfou\n7D12\tji\n7D13\tshu\n7D14\tchun\n7D15\tpi\n7D16\tzhen\n7D17\tsha\n7D18\thong\n7D19\tzhi\n7D1A\tji\n7D1B\tfen\n7D1C\tyun\n7D1D\tren\n7D1E\tdan\n7D1F\tjin\n7D20\tsu\n7D21\tfang\n7D22\tsuo\n7D23\tcui\n7D24\tjiu\n7D25\tza\n7D26\tba\n7D27\tjin\n7D28\tfu\n7D29\tzhi\n7D2A\tqi\n7D2B\tzi\n7D2C\tchou\n7D2D\thong\n7D2E\tza\n7D2F\tlei\n7D30\txi\n7D31\tfu\n7D32\txie\n7D33\tshen\n7D34\tbo\n7D35\tzhu\n7D36\tqu\n7D37\tling\n7D38\tzhu\n7D39\tshao\n7D3A\tgan\n7D3B\tyang\n7D3C\tfu\n7D3D\ttuo\n7D3E\tzhen\n7D3F\tdai\n7D40\tchu\n7D41\tshi\n7D42\tzhong\n7D43\txian\n7D44\tzu\n7D45\tjiong\n7D46\tban\n7D47\tqu\n7D48\tmo\n7D49\tshu\n7D4A\tzui\n7D4B\tkuang\n7D4C\tjing\n7D4D\tren\n7D4E\thang\n7D4F\txie\n7D50\tjie\n7D51\tzhu\n7D52\tchou\n7D53\tgua\n7D54\tbai\n7D55\tjue\n7D56\tkuang\n7D57\thu\n7D58\tci\n7D59\thuan\n7D5A\tgeng\n7D5B\ttao\n7D5C\tjie\n7D5D\tku\n7D5E\tjiao\n7D5F\tquan\n7D60\tgai\n7D61\tluo\n7D62\txuan\n7D63\tbeng\n7D64\txian\n7D65\tfu\n7D66\tgei\n7D67\tdong\n7D68\trong\n7D69\ttiao\n7D6A\tyin\n7D6B\tlei\n7D6C\txie\n7D6D\tjuan\n7D6E\txu\n7D6F\tgai\n7D70\tdie\n7D71\ttong\n7D72\tsi\n7D73\tjiang\n7D74\txiang\n7D75\thui\n7D76\tjue\n7D77\tzhi\n7D78\tjian\n7D79\tjuan\n7D7A\tchi\n7D7B\tmian\n7D7C\tzhen\n7D7D\tlu\n7D7E\tcheng\n7D7F\tqiu\n7D80\tshu\n7D81\tbang\n7D82\ttong\n7D83\txiao\n7D84\thuan\n7D85\tqin\n7D86\tgeng\n7D87\txiu\n7D88\tti\n7D89\ttou\n7D8A\txie\n7D8B\thong\n7D8C\txi\n7D8D\tfu\n7D8E\tting\n7D8F\tsui\n7D90\tdui\n7D91\tkun\n7D92\tfu\n7D93\tjing\n7D94\thu\n7D95\tzhi\n7D96\tyan\n7D97\tjiong\n7D98\tfeng\n7D99\tji\n7D9A\txu\n7D9B\tren\n7D9C\tzong\n7D9D\tchen\n7D9E\tduo\n7D9F\tli\n7DA0\tlu\n7DA1\tliang\n7DA2\tchou\n7DA3\tquan\n7DA4\tshao\n7DA5\tqi\n7DA6\tqi\n7DA7\tzhun\n7DA8\tqi\n7DA9\twan\n7DAA\tqian\n7DAB\txian\n7DAC\tshou\n7DAD\twei\n7DAE\tqing\n7DAF\ttao\n7DB0\twan\n7DB1\tgang\n7DB2\twang\n7DB3\tbeng\n7DB4\tzhui\n7DB5\tcai\n7DB6\tguo\n7DB7\tcui\n7DB8\tlun\n7DB9\tliu\n7DBA\tqi\n7DBB\tzhan\n7DBC\tbi\n7DBD\tchuo\n7DBE\tling\n7DBF\tmian\n7DC0\tqi\n7DC1\tqie\n7DC2\ttian\n7DC3\tzong\n7DC4\tgun\n7DC5\tzou\n7DC6\txi\n7DC7\tzi\n7DC8\txing\n7DC9\tliang\n7DCA\tjin\n7DCB\tfei\n7DCC\trui\n7DCD\tmin\n7DCE\tyu\n7DCF\tzong\n7DD0\tfan\n7DD1\tlu\n7DD2\txu\n7DD3\tying\n7DD4\tshang\n7DD5\tqi\n7DD6\txu\n7DD7\txiang\n7DD8\tjian\n7DD9\tke\n7DDA\txian\n7DDB\truan\n7DDC\tmian\n7DDD\tji\n7DDE\tduan\n7DDF\tchong\n7DE0\tdi\n7DE1\tmin\n7DE2\tmiao\n7DE3\tyuan\n7DE4\txie\n7DE5\tbao\n7DE6\tsi\n7DE7\tqiu\n7DE8\tbian\n7DE9\thuan\n7DEA\tgeng\n7DEB\tcong\n7DEC\tmian\n7DED\twei\n7DEE\tfu\n7DEF\twei\n7DF0\ttou\n7DF1\tgou\n7DF2\tmiao\n7DF3\txie\n7DF4\tlian\n7DF5\tzong\n7DF6\tbian\n7DF7\tyun\n7DF8\tyin\n7DF9\tti\n7DFA\tgua\n7DFB\tzhi\n7DFC\tyun\n7DFD\tcheng\n7DFE\tchan\n7DFF\tdai\n7E00\txia\n7E01\tyuan\n7E02\tzong\n7E03\txu\n7E04\tsheng\n7E05\twei\n7E06\tgeng\n7E07\txuan\n7E08\tying\n7E09\tjin\n7E0A\tyi\n7E0B\tzhui\n7E0C\tni\n7E0D\tbang\n7E0E\tgu\n7E0F\tpan\n7E10\tzhou\n7E11\tjian\n7E12\tci\n7E13\tquan\n7E14\tshuang\n7E15\tyun\n7E16\txia\n7E17\tcui\n7E18\txi\n7E19\trong\n7E1A\ttao\n7E1B\tfu\n7E1C\tyun\n7E1D\tchen\n7E1E\tgao\n7E1F\tru\n7E20\thu\n7E21\tzai\n7E22\tteng\n7E23\txian\n7E24\tsu\n7E25\tzhen\n7E26\tzong\n7E27\ttao\n7E28\thuang\n7E29\tcai\n7E2A\tbi\n7E2B\tfeng\n7E2C\tcu\n7E2D\tli\n7E2E\tsuo\n7E2F\tyan\n7E30\txi\n7E31\tzong\n7E32\tlei\n7E33\tjuan\n7E34\tqian\n7E35\tman\n7E36\tzhi\n7E37\tlu\n7E38\tmu\n7E39\tpiao\n7E3A\tlian\n7E3B\tmi\n7E3C\txuan\n7E3D\tzong\n7E3E\tji\n7E3F\tshan\n7E40\tsui\n7E41\tfan\n7E42\tlu\n7E43\tbeng\n7E44\tyi\n7E45\tsao\n7E46\tmou\n7E47\tyao\n7E48\tqiang\n7E49\thun\n7E4A\txian\n7E4B\tji\n7E4C\tsha\n7E4D\txiu\n7E4E\tran\n7E4F\txuan\n7E50\tsui\n7E51\tqiao\n7E52\tzeng\n7E53\tzuo\n7E54\tzhi\n7E55\tshan\n7E56\tsan\n7E57\tlin\n7E58\tyu\n7E59\tfan\n7E5A\tliao\n7E5B\tchuo\n7E5C\tzun\n7E5D\tjian\n7E5E\trao\n7E5F\tchan\n7E60\trui\n7E61\txiu\n7E62\thui\n7E63\thua\n7E64\tzuan\n7E65\txi\n7E66\tqiang\n7E67\tyun\n7E68\tda\n7E69\tsheng\n7E6A\thui\n7E6B\txi\n7E6C\tse\n7E6D\tjian\n7E6E\tjiang\n7E6F\thuan\n7E70\tzao\n7E71\tcong\n7E72\txie\n7E73\tjiao\n7E74\tbi\n7E75\tdan\n7E76\tyi\n7E77\tnong\n7E78\tsui\n7E79\tyi\n7E7A\tshai\n7E7B\txu\n7E7C\tji\n7E7D\tbin\n7E7E\tqian\n7E7F\tlan\n7E80\tpu\n7E81\txun\n7E82\tzuan\n7E83\tqi\n7E84\tpeng\n7E85\tyao\n7E86\tmo\n7E87\tlei\n7E88\txie\n7E89\tzuan\n7E8A\tkuang\n7E8B\tyou\n7E8C\txu\n7E8D\tlei\n7E8E\txian\n7E8F\tchan\n7E90\tjiao\n7E91\tlu\n7E92\tchan\n7E93\tying\n7E94\tcai\n7E95\trang\n7E96\txian\n7E97\tzui\n7E98\tzuan\n7E99\tluo\n7E9A\tli\n7E9B\tdao\n7E9C\tlan\n7E9D\tlei\n7E9E\tlian\n7E9F\tsi\n7EA0\tjiu\n7EA1\tyu\n7EA2\thong\n7EA3\tzhou\n7EA4\txian\n7EA5\the\n7EA6\tyue\n7EA7\tji\n7EA8\twan\n7EA9\tkuang\n7EAA\tji\n7EAB\tren\n7EAC\twei\n7EAD\tyun\n7EAE\thong\n7EAF\tchun\n7EB0\tpi\n7EB1\tsha\n7EB2\tgang\n7EB3\tna\n7EB4\tren\n7EB5\tzong\n7EB6\tlun\n7EB7\tfen\n7EB8\tzhi\n7EB9\twen\n7EBA\tfang\n7EBB\tzhu\n7EBC\tzhen\n7EBD\tniu\n7EBE\tshu\n7EBF\txian\n7EC0\tgan\n7EC1\txie\n7EC2\tfu\n7EC3\tlian\n7EC4\tzu\n7EC5\tshen\n7EC6\txi\n7EC7\tzhi\n7EC8\tzhong\n7EC9\tzhou\n7ECA\tban\n7ECB\tfu\n7ECC\tchu\n7ECD\tshao\n7ECE\tyi\n7ECF\tjing\n7ED0\tdai\n7ED1\tbang\n7ED2\trong\n7ED3\tjie\n7ED4\tku\n7ED5\trao\n7ED6\tdie\n7ED7\thang\n7ED8\thui\n7ED9\tgei\n7EDA\txuan\n7EDB\tjiang\n7EDC\tluo\n7EDD\tjue\n7EDE\tjiao\n7EDF\ttong\n7EE0\tgeng\n7EE1\txiao\n7EE2\tjuan\n7EE3\txiu\n7EE4\txi\n7EE5\tsui\n7EE6\ttao\n7EE7\tji\n7EE8\tti\n7EE9\tji\n7EEA\txu\n7EEB\tling\n7EEC\tying\n7EED\txu\n7EEE\tqi\n7EEF\tfei\n7EF0\tchuo\n7EF1\tshang\n7EF2\tgun\n7EF3\tsheng\n7EF4\twei\n7EF5\tmian\n7EF6\tshou\n7EF7\tbeng\n7EF8\tchou\n7EF9\ttao\n7EFA\tliu\n7EFB\tquan\n7EFC\tzong\n7EFD\tzhan\n7EFE\twan\n7EFF\tlu\n7F00\tzhui\n7F01\tzi\n7F02\tke\n7F03\txiang\n7F04\tjian\n7F05\tmian\n7F06\tlan\n7F07\tti\n7F08\tmiao\n7F09\tji\n7F0A\tyun\n7F0B\thui\n7F0C\tsi\n7F0D\tduo\n7F0E\tduan\n7F0F\tbian\n7F10\txian\n7F11\tgou\n7F12\tzhui\n7F13\thuan\n7F14\tdi\n7F15\tlu\n7F16\tbian\n7F17\tmin\n7F18\tyuan\n7F19\tjin\n7F1A\tfu\n7F1B\tru\n7F1C\tzhen\n7F1D\tfeng\n7F1E\tcui\n7F1F\tgao\n7F20\tchan\n7F21\tli\n7F22\tyi\n7F23\tjian\n7F24\tbin\n7F25\tpiao\n7F26\tman\n7F27\tlei\n7F28\tying\n7F29\tsuo\n7F2A\tmou\n7F2B\tsao\n7F2C\txie\n7F2D\tliao\n7F2E\tshan\n7F2F\tzeng\n7F30\tjiang\n7F31\tqian\n7F32\tqiao\n7F33\thuan\n7F34\tjiao\n7F35\tzuan\n7F36\tfou\n7F37\txie\n7F38\tgang\n7F39\tfou\n7F3A\tque\n7F3B\tfou\n7F3C\tqi\n7F3D\tbo\n7F3E\tping\n7F3F\txiang\n7F40\tzhao\n7F41\tgang\n7F42\tying\n7F43\tying\n7F44\tqing\n7F45\txia\n7F46\tguan\n7F47\tzun\n7F48\ttan\n7F49\tcheng\n7F4A\tqi\n7F4B\tweng\n7F4C\tying\n7F4D\tlei\n7F4E\ttan\n7F4F\tlu\n7F50\tguan\n7F51\twang\n7F52\twang\n7F53\tgang\n7F54\twang\n7F55\than\n7F56\tluo\n7F57\tluo\n7F58\tfu\n7F59\tshen\n7F5A\tfa\n7F5B\tgu\n7F5C\tzhu\n7F5D\tju\n7F5E\tmao\n7F5F\tgu\n7F60\tmin\n7F61\tgang\n7F62\tba\n7F63\tgua\n7F64\tti\n7F65\tjuan\n7F66\tfu\n7F67\tshen\n7F68\tyan\n7F69\tzhao\n7F6A\tzui\n7F6B\tgua\n7F6C\tzhuo\n7F6D\tyu\n7F6E\tzhi\n7F6F\tan\n7F70\tfa\n7F71\tlan\n7F72\tshu\n7F73\tsi\n7F74\tpi\n7F75\tma\n7F76\tliu\n7F77\tba\n7F78\tfa\n7F79\tli\n7F7A\tchao\n7F7B\twei\n7F7C\tbi\n7F7D\tji\n7F7E\tzeng\n7F7F\tchong\n7F80\tliu\n7F81\tji\n7F82\tjuan\n7F83\tmi\n7F84\tzhao\n7F85\tluo\n7F86\tpi\n7F87\tji\n7F88\tji\n7F89\tluan\n7F8A\tyang\n7F8B\tmi\n7F8C\tqiang\n7F8D\tda\n7F8E\tmei\n7F8F\tyang\n7F90\tyou\n7F91\tyou\n7F92\tfen\n7F93\tba\n7F94\tgao\n7F95\tyang\n7F96\tgu\n7F97\tqiang\n7F98\tzang\n7F99\tgao\n7F9A\tling\n7F9B\tyi\n7F9C\tzhu\n7F9D\tdi\n7F9E\txiu\n7F9F\tqiang\n7FA0\tyi\n7FA1\txian\n7FA2\trong\n7FA3\tqun\n7FA4\tqun\n7FA5\tqiang\n7FA6\thuan\n7FA7\tsuo\n7FA8\txian\n7FA9\tyi\n7FAA\tyang\n7FAB\tqiang\n7FAC\tqian\n7FAD\tyu\n7FAE\tgeng\n7FAF\tjie\n7FB0\ttang\n7FB1\tyuan\n7FB2\txi\n7FB3\tfan\n7FB4\tshan\n7FB5\tfen\n7FB6\tshan\n7FB7\tlian\n7FB8\tlei\n7FB9\tgeng\n7FBA\tnou\n7FBB\tqiang\n7FBC\tchan\n7FBD\tyu\n7FBE\tgong\n7FBF\tyi\n7FC0\tchong\n7FC1\tweng\n7FC2\tfen\n7FC3\thong\n7FC4\tchi\n7FC5\tchi\n7FC6\tcui\n7FC7\tfu\n7FC8\txia\n7FC9\tben\n7FCA\tyi\n7FCB\tla\n7FCC\tyi\n7FCD\tpi\n7FCE\tling\n7FCF\tliu\n7FD0\tzhi\n7FD1\tqu\n7FD2\txi\n7FD3\txie\n7FD4\txiang\n7FD5\txi\n7FD6\txi\n7FD7\tke\n7FD8\tqiao\n7FD9\thui\n7FDA\thui\n7FDB\txiao\n7FDC\tsha\n7FDD\thong\n7FDE\tjiang\n7FDF\tdi\n7FE0\tcui\n7FE1\tfei\n7FE2\tdao\n7FE3\tsha\n7FE4\tchi\n7FE5\tzhu\n7FE6\tjian\n7FE7\txuan\n7FE8\tchi\n7FE9\tpian\n7FEA\tzong\n7FEB\twan\n7FEC\thui\n7FED\thou\n7FEE\the\n7FEF\the\n7FF0\than\n7FF1\tao\n7FF2\tpiao\n7FF3\tyi\n7FF4\tlian\n7FF5\thou\n7FF6\tao\n7FF7\tlin\n7FF8\tpen\n7FF9\tqiao\n7FFA\tao\n7FFB\tfan\n7FFC\tyi\n7FFD\thui\n7FFE\txuan\n7FFF\tdao\n8000\tyao\n8001\tlao\n8002\tlao\n8003\tkao\n8004\tmao\n8005\tzhe\n8006\tqi\n8007\tgou\n8008\tgou\n8009\tgou\n800A\tdie\n800B\tdie\n800C\ter\n800D\tshua\n800E\truan\n800F\tnai\n8010\tnai\n8011\tduan\n8012\tlei\n8013\tting\n8014\tzi\n8015\tgeng\n8016\tchao\n8017\thao\n8018\tyun\n8019\tba\n801A\tpi\n801B\tyi\n801C\tsi\n801D\tqu\n801E\tjia\n801F\tju\n8020\thuo\n8021\tchu\n8022\tlao\n8023\tlun\n8024\tji\n8025\ttang\n8026\tou\n8027\tlou\n8028\tnou\n8029\tjiang\n802A\tpang\n802B\tzha\n802C\tlou\n802D\tji\n802E\tlao\n802F\thuo\n8030\tyou\n8031\tmo\n8032\thuai\n8033\ter\n8034\tyi\n8035\tding\n8036\tye\n8037\tda\n8038\tsong\n8039\tqin\n803A\tyun\n803B\tchi\n803C\tdan\n803D\tdan\n803E\thong\n803F\tgeng\n8040\tzhi\n8041\tpan\n8042\tnie\n8043\tdan\n8044\tzhen\n8045\tche\n8046\tling\n8047\tzheng\n8048\tyou\n8049\twa\n804A\tliao\n804B\tlong\n804C\tzhi\n804D\tning\n804E\ttiao\n804F\ter\n8050\tya\n8051\ttie\n8052\tguo\n8053\txu\n8054\tlian\n8055\thao\n8056\tsheng\n8057\tlie\n8058\tpin\n8059\tjing\n805A\tju\n805B\tbi\n805C\tdi\n805D\tguo\n805E\twen\n805F\txu\n8060\tping\n8061\tcong\n8062\tding\n8063\tni\n8064\tting\n8065\tju\n8066\tcong\n8067\tkui\n8068\tlian\n8069\tkui\n806A\tcong\n806B\tlian\n806C\tweng\n806D\tkui\n806E\tlian\n806F\tlian\n8070\tcong\n8071\tao\n8072\tsheng\n8073\tsong\n8074\tting\n8075\tkui\n8076\tnie\n8077\tzhi\n8078\tdan\n8079\tning\n807A\tqie\n807B\tni\n807C\tting\n807D\tting\n807E\tlong\n807F\tyu\n8080\tyu\n8081\tzhao\n8082\tsi\n8083\tsu\n8084\tyi\n8085\tsu\n8086\tsi\n8087\tzhao\n8088\tzhao\n8089\trou\n808A\tyi\n808B\tlei\n808C\tji\n808D\tqiu\n808E\tken\n808F\tcao\n8090\tge\n8091\tbo\n8092\thuan\n8093\thuang\n8094\tchi\n8095\tren\n8096\txiao\n8097\tru\n8098\tzhou\n8099\tyuan\n809A\tdu\n809B\tgang\n809C\trong\n809D\tgan\n809E\tcha\n809F\two\n80A0\tchang\n80A1\tgu\n80A2\tzhi\n80A3\than\n80A4\tfu\n80A5\tfei\n80A6\tfen\n80A7\tpei\n80A8\tpang\n80A9\tjian\n80AA\tfang\n80AB\tzhun\n80AC\tyou\n80AD\tna\n80AE\tang\n80AF\tken\n80B0\tran\n80B1\tgong\n80B2\tyu\n80B3\twen\n80B4\tyao\n80B5\tqi\n80B6\tpi\n80B7\tqian\n80B8\txi\n80B9\txi\n80BA\tfei\n80BB\tken\n80BC\tjing\n80BD\ttai\n80BE\tshen\n80BF\tzhong\n80C0\tzhang\n80C1\txie\n80C2\tshen\n80C3\twei\n80C4\tzhou\n80C5\tdie\n80C6\tdan\n80C7\tfei\n80C8\tba\n80C9\tbo\n80CA\tqu\n80CB\ttian\n80CC\tbei\n80CD\tgua\n80CE\ttai\n80CF\tzi\n80D0\tfei\n80D1\tzhi\n80D2\tni\n80D3\tping\n80D4\tzi\n80D5\tfu\n80D6\tpang\n80D7\tzhen\n80D8\txian\n80D9\tzuo\n80DA\tpei\n80DB\tjia\n80DC\tsheng\n80DD\tzhi\n80DE\tbao\n80DF\tmu\n80E0\tqu\n80E1\thu\n80E2\tke\n80E3\tchi\n80E4\tyin\n80E5\txu\n80E6\tyang\n80E7\tlong\n80E8\tdong\n80E9\tka\n80EA\tlu\n80EB\tjing\n80EC\tnu\n80ED\tyan\n80EE\tpang\n80EF\tkua\n80F0\tyi\n80F1\tguang\n80F2\thai\n80F3\tge\n80F4\tdong\n80F5\tchi\n80F6\tjiao\n80F7\txiong\n80F8\txiong\n80F9\ter\n80FA\tan\n80FB\theng\n80FC\tpian\n80FD\tneng\n80FE\tzi\n80FF\tgui\n8100\tcheng\n8101\ttiao\n8102\tzhi\n8103\tcui\n8104\tmei\n8105\txie\n8106\tcui\n8107\txie\n8108\tmai\n8109\tmai\n810A\tji\n810B\txie\n810C\tnin\n810D\tkuai\n810E\tsa\n810F\tzang\n8110\tqi\n8111\tnao\n8112\tmi\n8113\tnong\n8114\tluan\n8115\twan\n8116\tbo\n8117\twen\n8118\twan\n8119\txiu\n811A\tjiao\n811B\tjing\n811C\tyou\n811D\theng\n811E\tcuo\n811F\tlie\n8120\tshan\n8121\tting\n8122\tmei\n8123\tchun\n8124\tshen\n8125\tqian\n8126\tde\n8127\tjuan\n8128\tcu\n8129\txiu\n812A\txin\n812B\ttuo\n812C\tpao\n812D\tcheng\n812E\tnei\n812F\tpu\n8130\tdou\n8131\ttuo\n8132\tniao\n8133\tnao\n8134\tpi\n8135\tgu\n8136\tluo\n8137\tli\n8138\tlian\n8139\tzhang\n813A\tcui\n813B\tjie\n813C\tliang\n813D\tshui\n813E\tpi\n813F\tbiao\n8140\tlun\n8141\tpian\n8142\tlei\n8143\tkui\n8144\tchui\n8145\tdan\n8146\ttian\n8147\tnei\n8148\tjing\n8149\tnai\n814A\tla\n814B\tye\n814C\tyan\n814D\tren\n814E\tshen\n814F\tchuo\n8150\tfu\n8151\tfu\n8152\tju\n8153\tfei\n8154\tqiang\n8155\twan\n8156\tdong\n8157\tpi\n8158\tguo\n8159\tzong\n815A\tding\n815B\two\n815C\tmei\n815D\tni\n815E\tzhuan\n815F\tchi\n8160\tcou\n8161\tluo\n8162\tou\n8163\tdi\n8164\tan\n8165\txing\n8166\tnao\n8167\tshu\n8168\tshuan\n8169\tnan\n816A\tyun\n816B\tzhong\n816C\trou\n816D\te\n816E\tsai\n816F\ttu\n8170\tyao\n8171\tjian\n8172\twei\n8173\tjiao\n8174\tyu\n8175\tjia\n8176\tduan\n8177\tbi\n8178\tchang\n8179\tfu\n817A\txian\n817B\tni\n817C\tmian\n817D\twa\n817E\tteng\n817F\ttui\n8180\tbang\n8181\tqian\n8182\tlu\n8183\twa\n8184\tshou\n8185\ttang\n8186\tsu\n8187\tzhui\n8188\tge\n8189\tyi\n818A\tbo\n818B\tliao\n818C\tji\n818D\tpi\n818E\txie\n818F\tgao\n8190\tlu\n8191\tbin\n8192\tou\n8193\tchang\n8194\tlu\n8195\tguo\n8196\tpang\n8197\tchuai\n8198\tbiao\n8199\tjiang\n819A\tfu\n819B\ttang\n819C\tmo\n819D\txi\n819E\tzhuan\n819F\tlu\n81A0\tjiao\n81A1\tying\n81A2\tlu\n81A3\tzhi\n81A4\txue\n81A5\tcun\n81A6\tlin\n81A7\ttong\n81A8\tpeng\n81A9\tni\n81AA\tchuai\n81AB\tliao\n81AC\tcui\n81AD\tgui\n81AE\txiao\n81AF\tteng\n81B0\tfan\n81B1\tzhi\n81B2\tjiao\n81B3\tshan\n81B4\thu\n81B5\tcui\n81B6\trun\n81B7\txiang\n81B8\tsui\n81B9\tfen\n81BA\tying\n81BB\tshan\n81BC\tzhua\n81BD\tdan\n81BE\tkuai\n81BF\tnong\n81C0\ttun\n81C1\tlian\n81C2\tbi\n81C3\tyong\n81C4\tjue\n81C5\tchu\n81C6\tyi\n81C7\tjuan\n81C8\tla\n81C9\tlian\n81CA\tsao\n81CB\ttun\n81CC\tgu\n81CD\tqi\n81CE\tcui\n81CF\tbin\n81D0\txun\n81D1\tnao\n81D2\two\n81D3\tzang\n81D4\txian\n81D5\tbiao\n81D6\txing\n81D7\tkuan\n81D8\tla\n81D9\tyan\n81DA\tlu\n81DB\thuo\n81DC\tza\n81DD\tluo\n81DE\tqu\n81DF\tzang\n81E0\tluan\n81E1\tni\n81E2\tza\n81E3\tchen\n81E4\tqian\n81E5\two\n81E6\tguang\n81E7\tzang\n81E8\tlin\n81E9\tguang\n81EA\tzi\n81EB\tjiao\n81EC\tnie\n81ED\tchou\n81EE\tji\n81EF\tgao\n81F0\tchou\n81F1\tmian\n81F2\tnie\n81F3\tzhi\n81F4\tzhi\n81F5\tge\n81F6\tjian\n81F7\tdie\n81F8\tzhi\n81F9\txiu\n81FA\ttai\n81FB\tzhen\n81FC\tjiu\n81FD\txian\n81FE\tyu\n81FF\tcha\n8200\tyao\n8201\tyu\n8202\tchong\n8203\txi\n8204\txi\n8205\tjiu\n8206\tyu\n8207\tyu\n8208\txing\n8209\tju\n820A\tjiu\n820B\txin\n820C\tshe\n820D\tshe\n820E\tshe\n820F\tjiu\n8210\tshi\n8211\ttan\n8212\tshu\n8213\tshi\n8214\ttian\n8215\ttan\n8216\tpu\n8217\tpu\n8218\tguan\n8219\thua\n821A\ttian\n821B\tchuan\n821C\tshun\n821D\txia\n821E\twu\n821F\tzhou\n8220\tdao\n8221\tchuan\n8222\tshan\n8223\tyi\n8224\tfan\n8225\tpa\n8226\ttai\n8227\tfan\n8228\tban\n8229\tchuan\n822A\thang\n822B\tfang\n822C\tban\n822D\tbi\n822E\tlu\n822F\tzhong\n8230\tjian\n8231\tcang\n8232\tling\n8233\tzhu\n8234\tze\n8235\tduo\n8236\tbo\n8237\txian\n8238\tge\n8239\tchuan\n823A\txia\n823B\tlu\n823C\tqiong\n823D\tpang\n823E\txi\n823F\tkua\n8240\tfu\n8241\tzao\n8242\tfeng\n8243\tli\n8244\tshao\n8245\tyu\n8246\tlang\n8247\tting\n8248\tyu\n8249\twei\n824A\tbo\n824B\tmeng\n824C\tnian\n824D\tju\n824E\thuang\n824F\tshou\n8250\tke\n8251\tbian\n8252\tmu\n8253\tdie\n8254\tdao\n8255\tbang\n8256\tcha\n8257\tyi\n8258\tsou\n8259\tcang\n825A\tcao\n825B\tlou\n825C\tdai\n825D\txue\n825E\tyao\n825F\tchong\n8260\tdeng\n8261\tdang\n8262\tqiang\n8263\tlu\n8264\tyi\n8265\tji\n8266\tjian\n8267\thuo\n8268\tmeng\n8269\tqi\n826A\tlu\n826B\tlu\n826C\tchan\n826D\tshuang\n826E\tgen\n826F\tliang\n8270\tjian\n8271\tjian\n8272\tse\n8273\tyan\n8274\tfu\n8275\tping\n8276\tyan\n8277\tyan\n8278\tcao\n8279\tcao\n827A\tyi\n827B\tle\n827C\tting\n827D\tjiao\n827E\tai\n827F\tnai\n8280\ttiao\n8281\tjiao\n8282\tjie\n8283\tpeng\n8284\twan\n8285\tyi\n8286\tchai\n8287\tmian\n8288\tmi\n8289\tgan\n828A\tqian\n828B\tyu\n828C\tyu\n828D\tshao\n828E\txiong\n828F\tdu\n8290\thu\n8291\tqi\n8292\tmang\n8293\tzi\n8294\thui\n8295\tsui\n8296\tzhi\n8297\txiang\n8298\tbi\n8299\tfu\n829A\ttun\n829B\twei\n829C\twu\n829D\tzhi\n829E\tqi\n829F\tshan\n82A0\twen\n82A1\tqian\n82A2\tren\n82A3\tfu\n82A4\tkou\n82A5\tjie\n82A6\tlu\n82A7\txu\n82A8\tji\n82A9\tqin\n82AA\tqi\n82AB\tyan\n82AC\tfen\n82AD\tba\n82AE\trui\n82AF\txin\n82B0\tji\n82B1\thua\n82B2\thua\n82B3\tfang\n82B4\twu\n82B5\tjue\n82B6\tgou\n82B7\tzhi\n82B8\tyun\n82B9\tqin\n82BA\tao\n82BB\tchu\n82BC\tmao\n82BD\tya\n82BE\tfei\n82BF\treng\n82C0\thang\n82C1\tcong\n82C2\tyin\n82C3\tyou\n82C4\tbian\n82C5\tyi\n82C6\tqie\n82C7\twei\n82C8\tli\n82C9\tpi\n82CA\te\n82CB\txian\n82CC\tchang\n82CD\tcang\n82CE\tzhu\n82CF\tsu\n82D0\tti\n82D1\tyuan\n82D2\tran\n82D3\tling\n82D4\ttai\n82D5\tshao\n82D6\tdi\n82D7\tmiao\n82D8\tqing\n82D9\tli\n82DA\tyong\n82DB\tke\n82DC\tmu\n82DD\tbei\n82DE\tbao\n82DF\tgou\n82E0\tmin\n82E1\tyi\n82E2\tyi\n82E3\tju\n82E4\tpie\n82E5\truo\n82E6\tku\n82E7\tning\n82E8\tni\n82E9\tbo\n82EA\tbing\n82EB\tshan\n82EC\txiu\n82ED\tyao\n82EE\txian\n82EF\tben\n82F0\thong\n82F1\tying\n82F2\tzha\n82F3\tdong\n82F4\tju\n82F5\tdie\n82F6\tnie\n82F7\tgan\n82F8\thu\n82F9\tping\n82FA\tmei\n82FB\tfu\n82FC\tsheng\n82FD\tgu\n82FE\tbi\n82FF\twei\n8300\tfu\n8301\tzhuo\n8302\tmao\n8303\tfan\n8304\tjia\n8305\tmao\n8306\tmao\n8307\tba\n8308\tci\n8309\tmo\n830A\tzi\n830B\tdi\n830C\tchi\n830D\tji\n830E\tjing\n830F\tlong\n8310\tcong\n8311\tniao\n8312\tyuan\n8313\txue\n8314\tying\n8315\tqiong\n8316\tge\n8317\tming\n8318\tli\n8319\trong\n831A\tyin\n831B\tgen\n831C\tqian\n831D\tchai\n831E\tchen\n831F\tyu\n8320\thao\n8321\tzi\n8322\tlie\n8323\twu\n8324\tji\n8325\tgui\n8326\tci\n8327\tjian\n8328\tci\n8329\tgou\n832A\tguang\n832B\tmang\n832C\tcha\n832D\tjiao\n832E\tjiao\n832F\tfu\n8330\tyu\n8331\tzhu\n8332\tzi\n8333\tjiang\n8334\thui\n8335\tyin\n8336\tcha\n8337\tfa\n8338\trong\n8339\tru\n833A\tchong\n833B\tmang\n833C\ttong\n833D\tzhong\n833E\tqian\n833F\tzhu\n8340\txun\n8341\thuan\n8342\tfu\n8343\tquan\n8344\tgai\n8345\tda\n8346\tjing\n8347\txing\n8348\tchuan\n8349\tcao\n834A\tjing\n834B\ter\n834C\tan\n834D\tqiao\n834E\tchi\n834F\tren\n8350\tjian\n8351\tti\n8352\thuang\n8353\tping\n8354\tli\n8355\tjin\n8356\tlao\n8357\tshu\n8358\tzhuang\n8359\tda\n835A\tjia\n835B\trao\n835C\tbi\n835D\tce\n835E\tqiao\n835F\thui\n8360\tji\n8361\tdang\n8362\tzi\n8363\trong\n8364\thun\n8365\txing\n8366\tluo\n8367\tying\n8368\txun\n8369\tjin\n836A\tsun\n836B\tyin\n836C\tmai\n836D\thong\n836E\tzhou\n836F\tyao\n8370\tdu\n8371\twei\n8372\tli\n8373\tdou\n8374\tfu\n8375\tren\n8376\tyin\n8377\the\n8378\tbi\n8379\tbu\n837A\tyun\n837B\tdi\n837C\ttu\n837D\tsui\n837E\tsui\n837F\tcheng\n8380\tchen\n8381\twu\n8382\tbie\n8383\txi\n8384\tgeng\n8385\tli\n8386\tpu\n8387\tzhu\n8388\tmo\n8389\tli\n838A\tzhuang\n838B\tzuo\n838C\ttuo\n838D\tqiu\n838E\tsha\n838F\tsuo\n8390\tchen\n8391\tpeng\n8392\tju\n8393\tmei\n8394\tmeng\n8395\txing\n8396\tjing\n8397\tche\n8398\tshen\n8399\tjun\n839A\tyan\n839B\tting\n839C\tyou\n839D\tcuo\n839E\tguan\n839F\than\n83A0\tyou\n83A1\tcuo\n83A2\tjia\n83A3\twang\n83A4\tsu\n83A5\tniu\n83A6\tshao\n83A7\txian\n83A8\tlang\n83A9\tfu\n83AA\te\n83AB\tmo\n83AC\twen\n83AD\tjie\n83AE\tnan\n83AF\tmu\n83B0\tkan\n83B1\tlai\n83B2\tlian\n83B3\tshi\n83B4\two\n83B5\ttu\n83B6\txian\n83B7\thuo\n83B8\tyou\n83B9\tying\n83BA\tying\n83BB\tgong\n83BC\tchun\n83BD\tmang\n83BE\tmang\n83BF\tci\n83C0\twan\n83C1\tjing\n83C2\tdi\n83C3\tqu\n83C4\tdong\n83C5\tjian\n83C6\tzou\n83C7\tgu\n83C8\tla\n83C9\tlu\n83CA\tju\n83CB\twei\n83CC\tjun\n83CD\tnie\n83CE\tkun\n83CF\the\n83D0\tpu\n83D1\tzai\n83D2\tgao\n83D3\tguo\n83D4\tfu\n83D5\tlun\n83D6\tchang\n83D7\tchou\n83D8\tsong\n83D9\tchui\n83DA\tzhan\n83DB\tmen\n83DC\tcai\n83DD\tba\n83DE\tli\n83DF\ttu\n83E0\tbo\n83E1\than\n83E2\tbao\n83E3\tqin\n83E4\tjuan\n83E5\txi\n83E6\tqin\n83E7\tdi\n83E8\tjie\n83E9\tpu\n83EA\tdang\n83EB\tjin\n83EC\tqiao\n83ED\ttai\n83EE\tgeng\n83EF\thua\n83F0\tgu\n83F1\tling\n83F2\tfei\n83F3\tqin\n83F4\tan\n83F5\twang\n83F6\tbeng\n83F7\tzhou\n83F8\tyan\n83F9\tzu\n83FA\tjian\n83FB\tlin\n83FC\ttan\n83FD\tshu\n83FE\ttian\n83FF\tdao\n8400\thu\n8401\tqi\n8402\the\n8403\tcui\n8404\ttao\n8405\tchun\n8406\tbi\n8407\tchang\n8408\thuan\n8409\tfei\n840A\tlai\n840B\tqi\n840C\tmeng\n840D\tping\n840E\twei\n840F\tdan\n8410\tsha\n8411\thuan\n8412\tyan\n8413\tyi\n8414\ttiao\n8415\tqi\n8416\twan\n8417\tce\n8418\tnai\n8419\tzhen\n841A\ttuo\n841B\tjiu\n841C\ttie\n841D\tluo\n841E\tbi\n841F\tyi\n8420\tpan\n8421\tbo\n8422\tpao\n8423\tding\n8424\tying\n8425\tying\n8426\tying\n8427\txiao\n8428\tsa\n8429\tqiu\n842A\tke\n842B\txiang\n842C\twan\n842D\tyu\n842E\tyu\n842F\tfu\n8430\tlian\n8431\txuan\n8432\txuan\n8433\tnan\n8434\tce\n8435\two\n8436\tchun\n8437\txiao\n8438\tyu\n8439\tbian\n843A\tmao\n843B\tan\n843C\te\n843D\tluo\n843E\tying\n843F\tkuo\n8440\tkuo\n8441\tjiang\n8442\tmian\n8443\tzuo\n8444\tzuo\n8445\tzu\n8446\tbao\n8447\trou\n8448\txi\n8449\tye\n844A\tan\n844B\tqu\n844C\tjian\n844D\tfu\n844E\tlu\n844F\tjing\n8450\tpen\n8451\tfeng\n8452\thong\n8453\thong\n8454\thou\n8455\tyan\n8456\ttu\n8457\tzhu\n8458\tzi\n8459\txiang\n845A\tren\n845B\tge\n845C\tqia\n845D\tqing\n845E\tmi\n845F\thuang\n8460\tshen\n8461\tpu\n8462\tgai\n8463\tdong\n8464\tzhou\n8465\tjian\n8466\twei\n8467\tbo\n8468\twei\n8469\tpa\n846A\tji\n846B\thu\n846C\tzang\n846D\tjia\n846E\tduan\n846F\tyao\n8470\tjun\n8471\tcong\n8472\tquan\n8473\twei\n8474\tzhen\n8475\tkui\n8476\tting\n8477\thun\n8478\txi\n8479\tshi\n847A\tqi\n847B\tlan\n847C\tzong\n847D\tyao\n847E\tyuan\n847F\tmei\n8480\tyun\n8481\tshu\n8482\tdi\n8483\tzhuan\n8484\tguan\n8485\tran\n8486\txue\n8487\tchan\n8488\tkai\n8489\tkui\n848A\thua\n848B\tjiang\n848C\tlou\n848D\twei\n848E\tpai\n848F\tyou\n8490\tsou\n8491\tyin\n8492\tshi\n8493\tchun\n8494\tshi\n8495\tyun\n8496\tzhen\n8497\tlang\n8498\tru\n8499\tmeng\n849A\tli\n849B\tque\n849C\tsuan\n849D\tyuan\n849E\tli\n849F\tju\n84A0\txi\n84A1\tbang\n84A2\tchu\n84A3\txu\n84A4\ttu\n84A5\tliu\n84A6\thuo\n84A7\tdian\n84A8\tqian\n84A9\tzu\n84AA\tpo\n84AB\tcuo\n84AC\tyuan\n84AD\tchu\n84AE\tyu\n84AF\tkuai\n84B0\tpan\n84B1\tpu\n84B2\tpu\n84B3\tna\n84B4\tshuo\n84B5\txi\n84B6\tfen\n84B7\tyun\n84B8\tzheng\n84B9\tjian\n84BA\tji\n84BB\truo\n84BC\tcang\n84BD\ten\n84BE\tmi\n84BF\thao\n84C0\tsun\n84C1\tzhen\n84C2\tming\n84C3\tsou\n84C4\txu\n84C5\tliu\n84C6\txi\n84C7\tgu\n84C8\tlang\n84C9\trong\n84CA\tweng\n84CB\tgai\n84CC\tcuo\n84CD\tshi\n84CE\ttang\n84CF\tluo\n84D0\tru\n84D1\tsuo\n84D2\txuan\n84D3\tbei\n84D4\tyao\n84D5\tgui\n84D6\tbi\n84D7\tzong\n84D8\tgun\n84D9\tzuo\n84DA\ttiao\n84DB\tce\n84DC\tpei\n84DD\tlan\n84DE\tdan\n84DF\tji\n84E0\tli\n84E1\tshen\n84E2\tlang\n84E3\tyu\n84E4\tling\n84E5\tying\n84E6\tmo\n84E7\tdiao\n84E8\ttiao\n84E9\tmao\n84EA\ttong\n84EB\tchu\n84EC\tpeng\n84ED\tan\n84EE\tlian\n84EF\tcong\n84F0\txi\n84F1\tping\n84F2\tqiu\n84F3\tjin\n84F4\tchun\n84F5\tjie\n84F6\twei\n84F7\ttui\n84F8\tcao\n84F9\tyu\n84FA\tyi\n84FB\tzi\n84FC\tliao\n84FD\tbi\n84FE\tlu\n84FF\txu\n8500\tbu\n8501\tzhang\n8502\tlei\n8503\tqiang\n8504\tman\n8505\tyan\n8506\tling\n8507\tji\n8508\tpiao\n8509\tgun\n850A\than\n850B\tdi\n850C\tsu\n850D\tlu\n850E\tshe\n850F\tshang\n8510\tdi\n8511\tmie\n8512\txun\n8513\tman\n8514\tbo\n8515\tdi\n8516\tcuo\n8517\tzhe\n8518\tshen\n8519\txuan\n851A\twei\n851B\thu\n851C\tao\n851D\tmi\n851E\tlou\n851F\tcu\n8520\tzhong\n8521\tcai\n8522\tpo\n8523\tjiang\n8524\tmi\n8525\tcong\n8526\tniao\n8527\thui\n8528\tjuan\n8529\tyin\n852A\tjian\n852B\tnian\n852C\tshu\n852D\tyin\n852E\tguo\n852F\tchen\n8530\thu\n8531\tsha\n8532\tkou\n8533\tqian\n8534\tma\n8535\tzang\n8536\tze\n8537\tqiang\n8538\tdou\n8539\tlian\n853A\tlin\n853B\tkou\n853C\tai\n853D\tbi\n853E\tli\n853F\twei\n8540\tji\n8541\tqian\n8542\tsheng\n8543\tbo\n8544\tmeng\n8545\tou\n8546\tchan\n8547\tdian\n8548\txun\n8549\tjiao\n854A\trui\n854B\trui\n854C\tlei\n854D\tyu\n854E\tqiao\n854F\tchu\n8550\thua\n8551\tjian\n8552\tmai\n8553\tyun\n8554\tbao\n8555\tyou\n8556\tqu\n8557\tlu\n8558\trao\n8559\thui\n855A\te\n855B\tti\n855C\tfei\n855D\tjue\n855E\tzui\n855F\tfa\n8560\tru\n8561\tfen\n8562\tkui\n8563\tshun\n8564\trui\n8565\tya\n8566\txu\n8567\tfu\n8568\tjue\n8569\tdang\n856A\twu\n856B\tdong\n856C\tsi\n856D\txiao\n856E\txi\n856F\tlong\n8570\twen\n8571\tshao\n8572\tqi\n8573\tjian\n8574\tyun\n8575\tsun\n8576\tling\n8577\tyu\n8578\txia\n8579\tweng\n857A\tji\n857B\thong\n857C\tsi\n857D\tnong\n857E\tlei\n857F\txuan\n8580\tyun\n8581\tao\n8582\txi\n8583\thao\n8584\tbao\n8585\thao\n8586\tai\n8587\twei\n8588\thui\n8589\thui\n858A\tji\n858B\tci\n858C\txiang\n858D\twan\n858E\tmie\n858F\tyi\n8590\tleng\n8591\tjiang\n8592\tcan\n8593\tshen\n8594\tqiang\n8595\tlian\n8596\tke\n8597\tyuan\n8598\tda\n8599\tti\n859A\ttang\n859B\txue\n859C\tbi\n859D\tzhan\n859E\tsun\n859F\txian\n85A0\tfan\n85A1\tding\n85A2\txie\n85A3\tgu\n85A4\txie\n85A5\tshu\n85A6\tjian\n85A7\thao\n85A8\thong\n85A9\tsa\n85AA\txin\n85AB\txun\n85AC\tyao\n85AD\tbai\n85AE\tsou\n85AF\tshu\n85B0\txun\n85B1\tdui\n85B2\tpin\n85B3\twei\n85B4\tning\n85B5\tchou\n85B6\tmai\n85B7\tru\n85B8\tpiao\n85B9\ttai\n85BA\tji\n85BB\tzao\n85BC\tchen\n85BD\tzhen\n85BE\ter\n85BF\tni\n85C0\tying\n85C1\tgao\n85C2\tcong\n85C3\txiao\n85C4\tqi\n85C5\tfa\n85C6\tjian\n85C7\txu\n85C8\tkui\n85C9\tji\n85CA\tbian\n85CB\tdiao\n85CC\tmi\n85CD\tlan\n85CE\tjin\n85CF\tcang\n85D0\tmiao\n85D1\tqiong\n85D2\tqie\n85D3\txian\n85D4\tliao\n85D5\tou\n85D6\txian\n85D7\tsu\n85D8\tlu\n85D9\tyi\n85DA\txu\n85DB\txie\n85DC\tli\n85DD\tyi\n85DE\tla\n85DF\tlei\n85E0\tjiao\n85E1\tdi\n85E2\tzhi\n85E3\tbei\n85E4\tteng\n85E5\tyao\n85E6\tmo\n85E7\thuan\n85E8\tbiao\n85E9\tfan\n85EA\tsou\n85EB\ttan\n85EC\ttui\n85ED\tqiong\n85EE\tqiao\n85EF\twei\n85F0\tliu\n85F1\thui\n85F2\tou\n85F3\tgao\n85F4\tyun\n85F5\tbao\n85F6\tli\n85F7\tshu\n85F8\tchu\n85F9\tai\n85FA\tlin\n85FB\tzao\n85FC\txuan\n85FD\tqin\n85FE\tlai\n85FF\thuo\n8600\ttuo\n8601\twu\n8602\trui\n8603\trui\n8604\tqi\n8605\theng\n8606\tlu\n8607\tsu\n8608\ttui\n8609\tmeng\n860A\tyun\n860B\tping\n860C\tyu\n860D\txun\n860E\tji\n860F\tjiong\n8610\txuan\n8611\tmo\n8612\tqiu\n8613\tsu\n8614\tjiong\n8615\tpeng\n8616\tnie\n8617\tbo\n8618\trang\n8619\tyi\n861A\txian\n861B\tyu\n861C\tju\n861D\tlian\n861E\tlian\n861F\tyin\n8620\tqiang\n8621\tying\n8622\tlong\n8623\ttou\n8624\thua\n8625\tyue\n8626\tling\n8627\tqu\n8628\tyao\n8629\tfan\n862A\tmei\n862B\than\n862C\tkui\n862D\tlan\n862E\tji\n862F\tdang\n8630\tman\n8631\tlei\n8632\tlei\n8633\thui\n8634\tfeng\n8635\tzhi\n8636\twei\n8637\tkui\n8638\tzhan\n8639\thuai\n863A\tli\n863B\tji\n863C\tmi\n863D\tlei\n863E\thuai\n863F\tluo\n8640\tji\n8641\tkui\n8642\tlu\n8643\tjian\n8644\tsa\n8645\tteng\n8646\tlei\n8647\tquan\n8648\txiao\n8649\tyi\n864A\tluan\n864B\tmen\n864C\tbie\n864D\thu\n864E\thu\n864F\tlu\n8650\tnue\n8651\tlu\n8652\tsi\n8653\txiao\n8654\tqian\n8655\tchu\n8656\thu\n8657\txu\n8658\tcuo\n8659\tfu\n865A\txu\n865B\txu\n865C\tlu\n865D\thu\n865E\tyu\n865F\thao\n8660\tjiao\n8661\tju\n8662\tguo\n8663\tbao\n8664\tyan\n8665\tzhan\n8666\tzhan\n8667\tkui\n8668\tbin\n8669\txi\n866A\tshu\n866B\tchong\n866C\tqiu\n866D\tdiao\n866E\tji\n866F\tqiu\n8670\tding\n8671\tshi\n8672\txia\n8673\tjue\n8674\tzhe\n8675\tshe\n8676\tyu\n8677\than\n8678\tzi\n8679\thong\n867A\thui\n867B\tmeng\n867C\tge\n867D\tsui\n867E\txia\n867F\tchai\n8680\tshi\n8681\tyi\n8682\tma\n8683\txiang\n8684\tfang\n8685\te\n8686\tba\n8687\tchi\n8688\tqian\n8689\twen\n868A\twen\n868B\trui\n868C\tbang\n868D\tpi\n868E\tyue\n868F\tyue\n8690\tjun\n8691\tqi\n8692\ttong\n8693\tyin\n8694\tqi\n8695\tcan\n8696\tyuan\n8697\tjue\n8698\thui\n8699\tqin\n869A\tqi\n869B\tzhong\n869C\tya\n869D\thao\n869E\tmu\n869F\twang\n86A0\tfen\n86A1\tfen\n86A2\thang\n86A3\tgong\n86A4\tzao\n86A5\tfu\n86A6\tran\n86A7\tjie\n86A8\tfu\n86A9\tchi\n86AA\tdou\n86AB\tbao\n86AC\txian\n86AD\tni\n86AE\tdai\n86AF\tqiu\n86B0\tyou\n86B1\tzha\n86B2\tping\n86B3\tchi\n86B4\tyou\n86B5\the\n86B6\than\n86B7\tju\n86B8\tli\n86B9\tfu\n86BA\tran\n86BB\tzha\n86BC\tgou\n86BD\tpi\n86BE\tpi\n86BF\txian\n86C0\tzhu\n86C1\tdiao\n86C2\tbie\n86C3\tbing\n86C4\tgu\n86C5\tzhan\n86C6\tqu\n86C7\tshe\n86C8\ttie\n86C9\tling\n86CA\tgu\n86CB\tdan\n86CC\tgu\n86CD\tying\n86CE\tli\n86CF\tcheng\n86D0\tqu\n86D1\tmou\n86D2\tge\n86D3\tci\n86D4\thui\n86D5\thui\n86D6\tmang\n86D7\tfu\n86D8\tyang\n86D9\twa\n86DA\tlie\n86DB\tzhu\n86DC\tyi\n86DD\txian\n86DE\tkuo\n86DF\tjiao\n86E0\tli\n86E1\tyi\n86E2\tping\n86E3\tqi\n86E4\tha\n86E5\tshe\n86E6\tyi\n86E7\twang\n86E8\tmo\n86E9\tqiong\n86EA\tqie\n86EB\tgui\n86EC\tqiong\n86ED\tzhi\n86EE\tman\n86EF\tlao\n86F0\tzhe\n86F1\tjia\n86F2\tnao\n86F3\tsi\n86F4\tqi\n86F5\txing\n86F6\tjie\n86F7\tqiu\n86F8\tshao\n86F9\tyong\n86FA\tjia\n86FB\ttui\n86FC\tche\n86FD\tbei\n86FE\te\n86FF\than\n8700\tshu\n8701\txuan\n8702\tfeng\n8703\tshen\n8704\tshen\n8705\tfu\n8706\txian\n8707\tzhe\n8708\twu\n8709\tfu\n870A\tli\n870B\tlang\n870C\tbi\n870D\tchu\n870E\tyuan\n870F\tyou\n8710\tjie\n8711\tdan\n8712\tyan\n8713\tting\n8714\tdian\n8715\ttui\n8716\thui\n8717\two\n8718\tzhi\n8719\tsong\n871A\tfei\n871B\tju\n871C\tmi\n871D\tqi\n871E\tqi\n871F\tyu\n8720\tjun\n8721\tla\n8722\tmeng\n8723\tqiang\n8724\tsi\n8725\txi\n8726\tlun\n8727\tli\n8728\tdie\n8729\ttiao\n872A\ttao\n872B\tkun\n872C\than\n872D\than\n872E\tyu\n872F\tbang\n8730\tfei\n8731\tpi\n8732\twei\n8733\tdun\n8734\tyi\n8735\tyuan\n8736\tsuo\n8737\tquan\n8738\tqian\n8739\trui\n873A\tni\n873B\tqing\n873C\twei\n873D\tliang\n873E\tguo\n873F\twan\n8740\tdong\n8741\te\n8742\tban\n8743\tdi\n8744\twang\n8745\tcan\n8746\tyang\n8747\tying\n8748\tguo\n8749\tchan\n874A\tding\n874B\tla\n874C\tke\n874D\tjie\n874E\txie\n874F\tting\n8750\tmao\n8751\txu\n8752\tmian\n8753\tyu\n8754\tjie\n8755\tshi\n8756\txuan\n8757\thuang\n8758\tyan\n8759\tbian\n875A\trou\n875B\twei\n875C\tfu\n875D\tyuan\n875E\tmei\n875F\twei\n8760\tfu\n8761\tru\n8762\txie\n8763\tyou\n8764\tqiu\n8765\tmao\n8766\txia\n8767\tying\n8768\tshi\n8769\tchong\n876A\ttang\n876B\tzhu\n876C\tzong\n876D\tti\n876E\tfu\n876F\tyuan\n8770\tkui\n8771\tmeng\n8772\tla\n8773\tdu\n8774\thu\n8775\tqiu\n8776\tdie\n8777\tli\n8778\two\n8779\tyun\n877A\tqu\n877B\tnan\n877C\tlou\n877D\tchun\n877E\trong\n877F\tying\n8780\tjiang\n8781\tban\n8782\tlang\n8783\tpang\n8784\tsi\n8785\txi\n8786\tci\n8787\txi\n8788\tyuan\n8789\tweng\n878A\tlian\n878B\tsou\n878C\tban\n878D\trong\n878E\trong\n878F\tji\n8790\twu\n8791\txiu\n8792\than\n8793\tqin\n8794\tyi\n8795\tbi\n8796\thua\n8797\ttang\n8798\tyi\n8799\tdu\n879A\tnai\n879B\the\n879C\thu\n879D\tgui\n879E\tma\n879F\tming\n87A0\tyi\n87A1\twen\n87A2\tying\n87A3\tteng\n87A4\tzhong\n87A5\tcang\n87A6\tsao\n87A7\tqi\n87A8\tman\n87A9\ttiao\n87AA\tshang\n87AB\tshi\n87AC\tcao\n87AD\tchi\n87AE\tdi\n87AF\tao\n87B0\tlu\n87B1\twei\n87B2\tzhi\n87B3\ttang\n87B4\tchen\n87B5\tpiao\n87B6\tqu\n87B7\tpi\n87B8\tyu\n87B9\tjian\n87BA\tluo\n87BB\tlou\n87BC\tqin\n87BD\tzhong\n87BE\tyin\n87BF\tjiang\n87C0\tshuai\n87C1\twen\n87C2\txiao\n87C3\twan\n87C4\tzhe\n87C5\tzhe\n87C6\tma\n87C7\tma\n87C8\tguo\n87C9\tliu\n87CA\tmao\n87CB\txi\n87CC\tcong\n87CD\tli\n87CE\tman\n87CF\txiao\n87D0\tchang\n87D1\tzhang\n87D2\tmang\n87D3\txiang\n87D4\tmo\n87D5\tzui\n87D6\tsi\n87D7\tqiu\n87D8\tte\n87D9\tzhi\n87DA\tpeng\n87DB\tpeng\n87DC\tjiao\n87DD\tqu\n87DE\tbie\n87DF\tliao\n87E0\tpan\n87E1\tgui\n87E2\txi\n87E3\tji\n87E4\tzhuan\n87E5\thuang\n87E6\tfei\n87E7\tlao\n87E8\tjue\n87E9\tjue\n87EA\thui\n87EB\tyin\n87EC\tchan\n87ED\tjiao\n87EE\tshan\n87EF\tnao\n87F0\txiao\n87F1\twu\n87F2\tchong\n87F3\txun\n87F4\tsi\n87F5\tchu\n87F6\tcheng\n87F7\tdang\n87F8\tli\n87F9\txie\n87FA\tshan\n87FB\tyi\n87FC\tjing\n87FD\tda\n87FE\tchan\n87FF\tqi\n8800\tci\n8801\txiang\n8802\tshe\n8803\tluo\n8804\tqin\n8805\tying\n8806\tchai\n8807\tli\n8808\tzei\n8809\txuan\n880A\tlian\n880B\tzhu\n880C\tze\n880D\txie\n880E\tmang\n880F\txie\n8810\tqi\n8811\trong\n8812\tjian\n8813\tmeng\n8814\thao\n8815\tru\n8816\thuo\n8817\tzhuo\n8818\tjie\n8819\tpin\n881A\the\n881B\tmie\n881C\tfan\n881D\tlei\n881E\tjie\n881F\tla\n8820\tmin\n8821\tli\n8822\tchun\n8823\tli\n8824\tqiu\n8825\tnie\n8826\tlu\n8827\tdu\n8828\txiao\n8829\tzhu\n882A\tlong\n882B\tli\n882C\tlong\n882D\tfeng\n882E\tye\n882F\tpi\n8830\tnang\n8831\tgu\n8832\tjuan\n8833\tying\n8834\tshu\n8835\txi\n8836\tcan\n8837\tqu\n8838\tquan\n8839\tdu\n883A\tcan\n883B\tman\n883C\tqu\n883D\tjie\n883E\tzhu\n883F\tzhuo\n8840\txue\n8841\thuang\n8842\tnu\n8843\tpei\n8844\tnu\n8845\txin\n8846\tzhong\n8847\tmai\n8848\ter\n8849\tka\n884A\tmie\n884B\txi\n884C\txing\n884D\tyan\n884E\tkan\n884F\tyuan\n8850\tqu\n8851\tling\n8852\txuan\n8853\tshu\n8854\txian\n8855\ttong\n8856\txiang\n8857\tjie\n8858\txian\n8859\tya\n885A\thu\n885B\twei\n885C\tdao\n885D\tchong\n885E\twei\n885F\tdao\n8860\tzhun\n8861\theng\n8862\tqu\n8863\tyi\n8864\tyi\n8865\tbu\n8866\tgan\n8867\tyu\n8868\tbiao\n8869\tcha\n886A\tyi\n886B\tshan\n886C\tchen\n886D\tfu\n886E\tgun\n886F\tfen\n8870\tshuai\n8871\tjie\n8872\tna\n8873\tzhong\n8874\tdan\n8875\tyi\n8876\tzhong\n8877\tzhong\n8878\tjie\n8879\tzhi\n887A\txie\n887B\tran\n887C\tzhi\n887D\tren\n887E\tqin\n887F\tjin\n8880\tjun\n8881\tyuan\n8882\tmei\n8883\tchai\n8884\tao\n8885\tniao\n8886\thui\n8887\tran\n8888\tjia\n8889\ttuo\n888A\tling\n888B\tdai\n888C\tbao\n888D\tpao\n888E\tyao\n888F\tzuo\n8890\tbi\n8891\tshao\n8892\ttan\n8893\tju\n8894\the\n8895\txue\n8896\txiu\n8897\tzhen\n8898\tyi\n8899\tpa\n889A\tbo\n889B\tdi\n889C\twa\n889D\tfu\n889E\tgun\n889F\tzhi\n88A0\tzhi\n88A1\tran\n88A2\tpan\n88A3\tyi\n88A4\tmao\n88A5\ttuo\n88A6\tna\n88A7\tgou\n88A8\txuan\n88A9\tzhe\n88AA\tqu\n88AB\tbei\n88AC\tyu\n88AD\txi\n88AE\tmi\n88AF\tbo\n88B0\tbo\n88B1\tfu\n88B2\tchi\n88B3\tchi\n88B4\tku\n88B5\tren\n88B6\tjiang\n88B7\tqia\n88B8\tjian\n88B9\tbo\n88BA\tjie\n88BB\ter\n88BC\tge\n88BD\tru\n88BE\tzhu\n88BF\tgui\n88C0\tyin\n88C1\tcai\n88C2\tlie\n88C3\tka\n88C4\txing\n88C5\tzhuang\n88C6\tdang\n88C7\txu\n88C8\tkun\n88C9\tken\n88CA\tniao\n88CB\tshu\n88CC\tjia\n88CD\tkun\n88CE\tcheng\n88CF\tli\n88D0\tjuan\n88D1\tshen\n88D2\tpou\n88D3\tge\n88D4\tyi\n88D5\tyu\n88D6\tzhen\n88D7\tliu\n88D8\tqiu\n88D9\tqun\n88DA\tji\n88DB\tyi\n88DC\tbu\n88DD\tzhuang\n88DE\tshui\n88DF\tsha\n88E0\tqun\n88E1\tli\n88E2\tlian\n88E3\tlian\n88E4\tku\n88E5\tjian\n88E6\tfou\n88E7\tchan\n88E8\tbi\n88E9\tkun\n88EA\ttao\n88EB\tyuan\n88EC\tling\n88ED\tchi\n88EE\tchang\n88EF\tchou\n88F0\tduo\n88F1\tbiao\n88F2\tliang\n88F3\tshang\n88F4\tpei\n88F5\tpei\n88F6\tfei\n88F7\tyuan\n88F8\tluo\n88F9\tguo\n88FA\tyan\n88FB\tdu\n88FC\tti\n88FD\tzhi\n88FE\tju\n88FF\tyi\n8900\tqi\n8901\tguo\n8902\tgua\n8903\tken\n8904\tqi\n8905\tti\n8906\tti\n8907\tfu\n8908\tchong\n8909\txie\n890A\tbian\n890B\tdie\n890C\tkun\n890D\tduan\n890E\txiu\n890F\txiu\n8910\the\n8911\tyuan\n8912\tbao\n8913\tbao\n8914\tfu\n8915\tyu\n8916\ttuan\n8917\tyan\n8918\thui\n8919\tbei\n891A\tchu\n891B\tlu\n891C\tpao\n891D\tdan\n891E\tyun\n891F\tta\n8920\tgou\n8921\tda\n8922\thuai\n8923\trong\n8924\tyuan\n8925\tru\n8926\tnai\n8927\tjiong\n8928\tsuo\n8929\tban\n892A\ttui\n892B\tchi\n892C\tsang\n892D\tniao\n892E\tying\n892F\tjie\n8930\tqian\n8931\thuai\n8932\tku\n8933\tlian\n8934\tlan\n8935\tli\n8936\tzhe\n8937\tshi\n8938\tlu\n8939\tyi\n893A\tdie\n893B\txie\n893C\txian\n893D\twei\n893E\tbiao\n893F\tcao\n8940\tji\n8941\tqiang\n8942\tsen\n8943\tbao\n8944\txiang\n8945\tbi\n8946\tfu\n8947\tjian\n8948\tzhuan\n8949\tjian\n894A\tcui\n894B\tji\n894C\tdan\n894D\tza\n894E\tfan\n894F\tbo\n8950\txiang\n8951\txin\n8952\tbie\n8953\trao\n8954\tman\n8955\tlan\n8956\tao\n8957\tze\n8958\tgui\n8959\tcao\n895A\tsui\n895B\tnong\n895C\tchan\n895D\tlian\n895E\tbi\n895F\tjin\n8960\tdang\n8961\tshu\n8962\ttan\n8963\tbi\n8964\tlan\n8965\tfu\n8966\tru\n8967\tzhi\n8968\tdui\n8969\tshu\n896A\twa\n896B\tshi\n896C\tbai\n896D\txie\n896E\tbo\n896F\tchen\n8970\tlai\n8971\tlong\n8972\txi\n8973\txian\n8974\tlan\n8975\tzhe\n8976\tdai\n8977\tju\n8978\tzan\n8979\tshi\n897A\tjian\n897B\tpan\n897C\tyi\n897D\tlan\n897E\tya\n897F\txi\n8980\txi\n8981\tyao\n8982\tfeng\n8983\ttan\n8984\tfu\n8985\tfiao\n8986\tfu\n8987\tba\n8988\the\n8989\tji\n898A\tji\n898B\tjian\n898C\tguan\n898D\tbian\n898E\tyan\n898F\tgui\n8990\tjue\n8991\tpian\n8992\tmao\n8993\tmi\n8994\tmi\n8995\tmie\n8996\tshi\n8997\tsi\n8998\tchan\n8999\tluo\n899A\tjue\n899B\tmi\n899C\ttiao\n899D\tlian\n899E\tyao\n899F\tzhi\n89A0\tjun\n89A1\txi\n89A2\tshan\n89A3\twei\n89A4\txi\n89A5\ttian\n89A6\tyu\n89A7\tlan\n89A8\te\n89A9\tdu\n89AA\tqin\n89AB\tpang\n89AC\tji\n89AD\tming\n89AE\tying\n89AF\tgou\n89B0\tqu\n89B1\tzhan\n89B2\tjin\n89B3\tguan\n89B4\tdeng\n89B5\tjian\n89B6\tluo\n89B7\tqu\n89B8\tjian\n89B9\twei\n89BA\tjue\n89BB\tqu\n89BC\tluo\n89BD\tlan\n89BE\tshen\n89BF\tdi\n89C0\tguan\n89C1\tjian\n89C2\tguan\n89C3\tyan\n89C4\tgui\n89C5\tmi\n89C6\tshi\n89C7\tchan\n89C8\tlan\n89C9\tjue\n89CA\tji\n89CB\txi\n89CC\tdi\n89CD\ttian\n89CE\tyu\n89CF\tgou\n89D0\tjin\n89D1\tqu\n89D2\tjiao\n89D3\tqiu\n89D4\tjin\n89D5\tcu\n89D6\tjue\n89D7\tzhi\n89D8\tchao\n89D9\tji\n89DA\tgu\n89DB\tdan\n89DC\tzi\n89DD\tdi\n89DE\tshang\n89DF\thua\n89E0\tquan\n89E1\tge\n89E2\tshi\n89E3\tjie\n89E4\tgui\n89E5\tgong\n89E6\tchu\n89E7\tjie\n89E8\thun\n89E9\tqiu\n89EA\txing\n89EB\tsu\n89EC\tni\n89ED\tji\n89EE\tlu\n89EF\tzhi\n89F0\tzha\n89F1\tbi\n89F2\txing\n89F3\thu\n89F4\tshang\n89F5\tgong\n89F6\tzhi\n89F7\txue\n89F8\tchu\n89F9\txi\n89FA\tyi\n89FB\tli\n89FC\tjue\n89FD\txi\n89FE\tyan\n89FF\txi\n8A00\tyan\n8A01\tyan\n8A02\tding\n8A03\tfu\n8A04\tqiu\n8A05\tqiu\n8A06\tjiao\n8A07\thong\n8A08\tji\n8A09\tfan\n8A0A\txun\n8A0B\tdiao\n8A0C\thong\n8A0D\tchai\n8A0E\ttao\n8A0F\txu\n8A10\tjie\n8A11\tyi\n8A12\tren\n8A13\txun\n8A14\tyin\n8A15\tshan\n8A16\tqi\n8A17\ttuo\n8A18\tji\n8A19\txun\n8A1A\tyin\n8A1B\te\n8A1C\tfen\n8A1D\tya\n8A1E\tyao\n8A1F\tsong\n8A20\tshen\n8A21\tyin\n8A22\txin\n8A23\tjue\n8A24\txiao\n8A25\tne\n8A26\tchen\n8A27\tyou\n8A28\tzhi\n8A29\txiong\n8A2A\tfang\n8A2B\txin\n8A2C\tchao\n8A2D\tshe\n8A2E\tyan\n8A2F\tsa\n8A30\tzhun\n8A31\txu\n8A32\tyi\n8A33\tyi\n8A34\tsu\n8A35\tchi\n8A36\the\n8A37\tshen\n8A38\the\n8A39\txu\n8A3A\tzhen\n8A3B\tzhu\n8A3C\tzheng\n8A3D\tgou\n8A3E\tzi\n8A3F\tzi\n8A40\tzhan\n8A41\tgu\n8A42\tfu\n8A43\tjian\n8A44\tdie\n8A45\tling\n8A46\tdi\n8A47\tyang\n8A48\tli\n8A49\tnao\n8A4A\tpan\n8A4B\tzhou\n8A4C\tgan\n8A4D\tyi\n8A4E\tju\n8A4F\tyao\n8A50\tzha\n8A51\tyi\n8A52\tyi\n8A53\tqu\n8A54\tzhao\n8A55\tping\n8A56\tbi\n8A57\txiong\n8A58\tqu\n8A59\tba\n8A5A\tda\n8A5B\tzu\n8A5C\ttao\n8A5D\tzhu\n8A5E\tci\n8A5F\tzhe\n8A60\tyong\n8A61\txu\n8A62\txun\n8A63\tyi\n8A64\thuang\n8A65\the\n8A66\tshi\n8A67\tcha\n8A68\txiao\n8A69\tshi\n8A6A\then\n8A6B\tcha\n8A6C\tgou\n8A6D\tgui\n8A6E\tquan\n8A6F\thui\n8A70\tjie\n8A71\thua\n8A72\tgai\n8A73\txiang\n8A74\twei\n8A75\tshen\n8A76\tzhou\n8A77\ttong\n8A78\tmi\n8A79\tzhan\n8A7A\tming\n8A7B\te\n8A7C\thui\n8A7D\tyan\n8A7E\txiong\n8A7F\tgua\n8A80\ter\n8A81\tbing\n8A82\ttiao\n8A83\tyi\n8A84\tlei\n8A85\tzhu\n8A86\tkuang\n8A87\tkua\n8A88\twu\n8A89\tyu\n8A8A\tteng\n8A8B\tji\n8A8C\tzhi\n8A8D\tren\n8A8E\tcu\n8A8F\tlang\n8A90\te\n8A91\tkuang\n8A92\tei\n8A93\tshi\n8A94\tting\n8A95\tdan\n8A96\tbei\n8A97\tchan\n8A98\tyou\n8A99\tkeng\n8A9A\tqiao\n8A9B\tqin\n8A9C\tshua\n8A9D\tan\n8A9E\tyu\n8A9F\txiao\n8AA0\tcheng\n8AA1\tjie\n8AA2\txian\n8AA3\twu\n8AA4\twu\n8AA5\tgao\n8AA6\tsong\n8AA7\tbu\n8AA8\thui\n8AA9\tjing\n8AAA\tshuo\n8AAB\tzhen\n8AAC\tshuo\n8AAD\tdu\n8AAE\thua\n8AAF\tchang\n8AB0\tshui\n8AB1\tjie\n8AB2\tke\n8AB3\tqu\n8AB4\tcong\n8AB5\txiao\n8AB6\tsui\n8AB7\twang\n8AB8\txian\n8AB9\tfei\n8ABA\tchi\n8ABB\tta\n8ABC\tyi\n8ABD\tni\n8ABE\tyin\n8ABF\tdiao\n8AC0\tpi\n8AC1\tzhuo\n8AC2\tchan\n8AC3\tchen\n8AC4\tzhun\n8AC5\tji\n8AC6\tqi\n8AC7\ttan\n8AC8\tzhui\n8AC9\twei\n8ACA\tju\n8ACB\tqing\n8ACC\tdong\n8ACD\tzheng\n8ACE\tze\n8ACF\tzou\n8AD0\tqian\n8AD1\tzhuo\n8AD2\tliang\n8AD3\tjian\n8AD4\tchu\n8AD5\thao\n8AD6\tlun\n8AD7\tshen\n8AD8\tbiao\n8AD9\thua\n8ADA\tpian\n8ADB\tyu\n8ADC\tdie\n8ADD\txu\n8ADE\tpian\n8ADF\tshi\n8AE0\txuan\n8AE1\tshi\n8AE2\thun\n8AE3\thua\n8AE4\te\n8AE5\tzhong\n8AE6\tdi\n8AE7\txie\n8AE8\tfu\n8AE9\tpu\n8AEA\tting\n8AEB\tjian\n8AEC\tqi\n8AED\tyu\n8AEE\tzi\n8AEF\tzhuan\n8AF0\txi\n8AF1\thui\n8AF2\tyin\n8AF3\tan\n8AF4\txian\n8AF5\tnan\n8AF6\tchen\n8AF7\tfeng\n8AF8\tzhu\n8AF9\tyang\n8AFA\tyan\n8AFB\thuang\n8AFC\txuan\n8AFD\tge\n8AFE\tnuo\n8AFF\tqi\n8B00\tmou\n8B01\tye\n8B02\twei\n8B03\txing\n8B04\tteng\n8B05\tzhou\n8B06\tshan\n8B07\tjian\n8B08\tpo\n8B09\tkui\n8B0A\thuang\n8B0B\thuo\n8B0C\tge\n8B0D\tying\n8B0E\tmi\n8B0F\txiao\n8B10\tmi\n8B11\txi\n8B12\tqiang\n8B13\tchen\n8B14\txue\n8B15\tti\n8B16\tsu\n8B17\tbang\n8B18\tchi\n8B19\tqian\n8B1A\tshi\n8B1B\tjiang\n8B1C\tyuan\n8B1D\txie\n8B1E\the\n8B1F\ttao\n8B20\tyao\n8B21\tyao\n8B22\tlu\n8B23\tyu\n8B24\tbiao\n8B25\tcong\n8B26\tqing\n8B27\tli\n8B28\tmo\n8B29\tmo\n8B2A\tshang\n8B2B\tzhe\n8B2C\tmiu\n8B2D\tjian\n8B2E\tze\n8B2F\tjie\n8B30\tlian\n8B31\tlou\n8B32\tcan\n8B33\tou\n8B34\tgun\n8B35\txi\n8B36\tzhuo\n8B37\tao\n8B38\tao\n8B39\tjin\n8B3A\tzhe\n8B3B\tyi\n8B3C\thu\n8B3D\tjiang\n8B3E\tman\n8B3F\tchao\n8B40\than\n8B41\thua\n8B42\tchan\n8B43\txu\n8B44\tzeng\n8B45\tse\n8B46\txi\n8B47\tzha\n8B48\tdui\n8B49\tzheng\n8B4A\tnao\n8B4B\tlan\n8B4C\te\n8B4D\tying\n8B4E\tjue\n8B4F\tji\n8B50\tzun\n8B51\tjiao\n8B52\tbo\n8B53\thui\n8B54\tzhuan\n8B55\twu\n8B56\tzen\n8B57\tzha\n8B58\tshi\n8B59\tqiao\n8B5A\ttan\n8B5B\tzen\n8B5C\tpu\n8B5D\tsheng\n8B5E\txuan\n8B5F\tzao\n8B60\ttan\n8B61\tdang\n8B62\tsui\n8B63\txian\n8B64\tji\n8B65\tjiao\n8B66\tjing\n8B67\tzhan\n8B68\tnang\n8B69\tyi\n8B6A\tai\n8B6B\tzhan\n8B6C\tpi\n8B6D\thui\n8B6E\thua\n8B6F\tyi\n8B70\tyi\n8B71\tshan\n8B72\trang\n8B73\tnou\n8B74\tqian\n8B75\tdui\n8B76\tta\n8B77\thu\n8B78\tzhou\n8B79\thao\n8B7A\tai\n8B7B\tying\n8B7C\tjian\n8B7D\tyu\n8B7E\tjian\n8B7F\thui\n8B80\tdu\n8B81\tzhe\n8B82\txuan\n8B83\tzan\n8B84\tlei\n8B85\tshen\n8B86\twei\n8B87\tchan\n8B88\tli\n8B89\tyi\n8B8A\tbian\n8B8B\tzhe\n8B8C\tyan\n8B8D\te\n8B8E\tchou\n8B8F\twei\n8B90\tchou\n8B91\tyao\n8B92\tchan\n8B93\trang\n8B94\tyin\n8B95\tlan\n8B96\tchen\n8B97\txie\n8B98\tnie\n8B99\thuan\n8B9A\tzan\n8B9B\tyi\n8B9C\tdang\n8B9D\tzhan\n8B9E\tyan\n8B9F\tdu\n8BA0\tyan\n8BA1\tji\n8BA2\tding\n8BA3\tfu\n8BA4\tren\n8BA5\tji\n8BA6\tjie\n8BA7\thong\n8BA8\ttao\n8BA9\trang\n8BAA\tshan\n8BAB\tqi\n8BAC\ttuo\n8BAD\txun\n8BAE\tyi\n8BAF\txun\n8BB0\tji\n8BB1\tren\n8BB2\tjiang\n8BB3\thui\n8BB4\tou\n8BB5\tju\n8BB6\tya\n8BB7\tne\n8BB8\txu\n8BB9\te\n8BBA\tlun\n8BBB\txiong\n8BBC\tsong\n8BBD\tfeng\n8BBE\tshe\n8BBF\tfang\n8BC0\tjue\n8BC1\tzheng\n8BC2\tgu\n8BC3\the\n8BC4\tping\n8BC5\tzu\n8BC6\tshi\n8BC7\txiong\n8BC8\tzha\n8BC9\tsu\n8BCA\tzhen\n8BCB\tdi\n8BCC\tzhou\n8BCD\tci\n8BCE\tqu\n8BCF\tzhao\n8BD0\tbi\n8BD1\tyi\n8BD2\tyi\n8BD3\tkuang\n8BD4\tlei\n8BD5\tshi\n8BD6\tgua\n8BD7\tshi\n8BD8\tjie\n8BD9\thui\n8BDA\tcheng\n8BDB\tzhu\n8BDC\tshen\n8BDD\thua\n8BDE\tdan\n8BDF\tgou\n8BE0\tquan\n8BE1\tgui\n8BE2\txun\n8BE3\tyi\n8BE4\tzheng\n8BE5\tgai\n8BE6\txiang\n8BE7\tcha\n8BE8\thun\n8BE9\txu\n8BEA\tzhou\n8BEB\tjie\n8BEC\twu\n8BED\tyu\n8BEE\tqiao\n8BEF\twu\n8BF0\tgao\n8BF1\tyou\n8BF2\thui\n8BF3\tkuang\n8BF4\tshuo\n8BF5\tsong\n8BF6\tei\n8BF7\tqing\n8BF8\tzhu\n8BF9\tzou\n8BFA\tnuo\n8BFB\tdu\n8BFC\tzhuo\n8BFD\tfei\n8BFE\tke\n8BFF\twei\n8C00\tyu\n8C01\tshei\n8C02\tshen\n8C03\tdiao\n8C04\tchan\n8C05\tliang\n8C06\tzhun\n8C07\tsui\n8C08\ttan\n8C09\tshen\n8C0A\tyi\n8C0B\tmou\n8C0C\tchen\n8C0D\tdie\n8C0E\thuang\n8C0F\tjian\n8C10\txie\n8C11\txue\n8C12\tye\n8C13\twei\n8C14\te\n8C15\tyu\n8C16\txuan\n8C17\tchan\n8C18\tzi\n8C19\tan\n8C1A\tyan\n8C1B\tdi\n8C1C\tmi\n8C1D\tpian\n8C1E\txu\n8C1F\tmo\n8C20\tdang\n8C21\tsu\n8C22\txie\n8C23\tyao\n8C24\tbang\n8C25\tshi\n8C26\tqian\n8C27\tmi\n8C28\tjin\n8C29\tman\n8C2A\tzhe\n8C2B\tjian\n8C2C\tmiu\n8C2D\ttan\n8C2E\tzen\n8C2F\tqiao\n8C30\tlan\n8C31\tpu\n8C32\tjue\n8C33\tyan\n8C34\tqian\n8C35\tzhan\n8C36\tchen\n8C37\tgu\n8C38\tqian\n8C39\thong\n8C3A\txia\n8C3B\tji\n8C3C\thong\n8C3D\than\n8C3E\thong\n8C3F\txi\n8C40\txi\n8C41\thuo\n8C42\tliao\n8C43\than\n8C44\tdu\n8C45\tlong\n8C46\tdou\n8C47\tjiang\n8C48\tqi\n8C49\tchi\n8C4A\tli\n8C4B\tdeng\n8C4C\twan\n8C4D\tbi\n8C4E\tshu\n8C4F\txian\n8C50\tfeng\n8C51\tzhi\n8C52\tzhi\n8C53\tyan\n8C54\tyan\n8C55\tshi\n8C56\tchu\n8C57\thui\n8C58\ttun\n8C59\tyi\n8C5A\ttun\n8C5B\tyi\n8C5C\tjian\n8C5D\tba\n8C5E\thou\n8C5F\te\n8C60\tchu\n8C61\txiang\n8C62\thuan\n8C63\tjian\n8C64\tken\n8C65\tgai\n8C66\tju\n8C67\tfu\n8C68\txi\n8C69\tbin\n8C6A\thao\n8C6B\tyu\n8C6C\tzhu\n8C6D\tjia\n8C6E\tfen\n8C6F\txi\n8C70\tbo\n8C71\twen\n8C72\thuan\n8C73\tbin\n8C74\tdi\n8C75\tzong\n8C76\tfen\n8C77\tyi\n8C78\tzhi\n8C79\tbao\n8C7A\tchai\n8C7B\tan\n8C7C\tpi\n8C7D\tna\n8C7E\tpi\n8C7F\tgou\n8C80\tna\n8C81\tyou\n8C82\tdiao\n8C83\tmo\n8C84\tsi\n8C85\txiu\n8C86\thuan\n8C87\tkun\n8C88\the\n8C89\thao\n8C8A\tmo\n8C8B\tan\n8C8C\tmao\n8C8D\tli\n8C8E\tni\n8C8F\tbi\n8C90\tyu\n8C91\tjia\n8C92\ttuan\n8C93\tmao\n8C94\tpi\n8C95\txi\n8C96\tyi\n8C97\tju\n8C98\tmo\n8C99\tchu\n8C9A\ttan\n8C9B\thuan\n8C9C\tjue\n8C9D\tbei\n8C9E\tzhen\n8C9F\tyuan\n8CA0\tfu\n8CA1\tcai\n8CA2\tgong\n8CA3\tte\n8CA4\tyi\n8CA5\thang\n8CA6\twan\n8CA7\tpin\n8CA8\thuo\n8CA9\tfan\n8CAA\ttan\n8CAB\tguan\n8CAC\tze\n8CAD\tzhi\n8CAE\ter\n8CAF\tzhu\n8CB0\tshi\n8CB1\tbi\n8CB2\tzi\n8CB3\ter\n8CB4\tgui\n8CB5\tpian\n8CB6\tbian\n8CB7\tmai\n8CB8\tdai\n8CB9\tsheng\n8CBA\tkuang\n8CBB\tfei\n8CBC\ttie\n8CBD\tyi\n8CBE\tchi\n8CBF\tmao\n8CC0\the\n8CC1\tbi\n8CC2\tlu\n8CC3\tlin\n8CC4\thui\n8CC5\tgai\n8CC6\tpian\n8CC7\tzi\n8CC8\tjia\n8CC9\txu\n8CCA\tzei\n8CCB\tjiao\n8CCC\tgai\n8CCD\tzang\n8CCE\tjian\n8CCF\tying\n8CD0\txun\n8CD1\tzhen\n8CD2\tshe\n8CD3\tbin\n8CD4\tbin\n8CD5\tqiu\n8CD6\tshe\n8CD7\tchuan\n8CD8\tzang\n8CD9\tzhou\n8CDA\tlai\n8CDB\tzan\n8CDC\tci\n8CDD\tchen\n8CDE\tshang\n8CDF\ttian\n8CE0\tpei\n8CE1\tgeng\n8CE2\txian\n8CE3\tmai\n8CE4\tjian\n8CE5\tsui\n8CE6\tfu\n8CE7\ttan\n8CE8\tcong\n8CE9\tcong\n8CEA\tzhi\n8CEB\tji\n8CEC\tzhang\n8CED\tdu\n8CEE\tjin\n8CEF\txiong\n8CF0\tchun\n8CF1\tyun\n8CF2\tbao\n8CF3\tzai\n8CF4\tlai\n8CF5\tfeng\n8CF6\tcang\n8CF7\tji\n8CF8\tsheng\n8CF9\tyi\n8CFA\tzhuan\n8CFB\tfu\n8CFC\tgou\n8CFD\tsai\n8CFE\tze\n8CFF\tliao\n8D00\tyi\n8D01\tbai\n8D02\tchen\n8D03\twan\n8D04\tzhi\n8D05\tzhui\n8D06\tbiao\n8D07\tyun\n8D08\tzeng\n8D09\tdan\n8D0A\tzan\n8D0B\tyan\n8D0C\tpu\n8D0D\tshan\n8D0E\twan\n8D0F\tying\n8D10\tjin\n8D11\tgan\n8D12\txian\n8D13\tzang\n8D14\tbi\n8D15\tdu\n8D16\tshu\n8D17\tyan\n8D18\tshang\n8D19\txuan\n8D1A\tlong\n8D1B\tgan\n8D1C\tzang\n8D1D\tbei\n8D1E\tzhen\n8D1F\tfu\n8D20\tyuan\n8D21\tgong\n8D22\tcai\n8D23\tze\n8D24\txian\n8D25\tbai\n8D26\tzhang\n8D27\thuo\n8D28\tzhi\n8D29\tfan\n8D2A\ttan\n8D2B\tpin\n8D2C\tbian\n8D2D\tgou\n8D2E\tzhu\n8D2F\tguan\n8D30\ter\n8D31\tjian\n8D32\tben\n8D33\tshi\n8D34\ttie\n8D35\tgui\n8D36\tkuang\n8D37\tdai\n8D38\tmao\n8D39\tfei\n8D3A\the\n8D3B\tyi\n8D3C\tzei\n8D3D\tzhi\n8D3E\tjia\n8D3F\thui\n8D40\tzi\n8D41\tlin\n8D42\tlu\n8D43\tzang\n8D44\tzi\n8D45\tgai\n8D46\tjin\n8D47\tqiu\n8D48\tzhen\n8D49\tlai\n8D4A\tshe\n8D4B\tfu\n8D4C\tdu\n8D4D\tji\n8D4E\tshu\n8D4F\tshang\n8D50\tci\n8D51\tbi\n8D52\tzhou\n8D53\tgeng\n8D54\tpei\n8D55\tdan\n8D56\tlai\n8D57\tfeng\n8D58\tzhui\n8D59\tfu\n8D5A\tzhuan\n8D5B\tsai\n8D5C\tze\n8D5D\tyan\n8D5E\tzan\n8D5F\tyun\n8D60\tzeng\n8D61\tshan\n8D62\tying\n8D63\tgan\n8D64\tchi\n8D65\txi\n8D66\tshe\n8D67\tnan\n8D68\ttong\n8D69\txi\n8D6A\tcheng\n8D6B\the\n8D6C\tcheng\n8D6D\tzhe\n8D6E\txia\n8D6F\ttang\n8D70\tzou\n8D71\tzou\n8D72\tli\n8D73\tjiu\n8D74\tfu\n8D75\tzhao\n8D76\tgan\n8D77\tqi\n8D78\tshan\n8D79\tqiong\n8D7A\tyin\n8D7B\txian\n8D7C\tzi\n8D7D\tjue\n8D7E\tqin\n8D7F\tchi\n8D80\tci\n8D81\tchen\n8D82\tchen\n8D83\tdie\n8D84\tju\n8D85\tchao\n8D86\tdi\n8D87\txi\n8D88\tzhan\n8D89\tjue\n8D8A\tyue\n8D8B\tqu\n8D8C\tji\n8D8D\tchi\n8D8E\tchu\n8D8F\tgua\n8D90\txue\n8D91\tzi\n8D92\ttiao\n8D93\tduo\n8D94\tlie\n8D95\tgan\n8D96\tsuo\n8D97\tcu\n8D98\txi\n8D99\tzhao\n8D9A\tsu\n8D9B\tyin\n8D9C\tju\n8D9D\tjian\n8D9E\tque\n8D9F\ttang\n8DA0\tchuo\n8DA1\tcui\n8DA2\tlu\n8DA3\tqu\n8DA4\tdang\n8DA5\tqiu\n8DA6\tzi\n8DA7\tti\n8DA8\tqu\n8DA9\tchi\n8DAA\thuang\n8DAB\tqiao\n8DAC\tqiao\n8DAD\tjiao\n8DAE\tzao\n8DAF\tti\n8DB0\ter\n8DB1\tzan\n8DB2\tzan\n8DB3\tzu\n8DB4\tpa\n8DB5\tbao\n8DB6\tku\n8DB7\tke\n8DB8\tdun\n8DB9\tjue\n8DBA\tfu\n8DBB\tchen\n8DBC\tjian\n8DBD\tfang\n8DBE\tzhi\n8DBF\tta\n8DC0\tyue\n8DC1\tba\n8DC2\tqi\n8DC3\tyue\n8DC4\tqiang\n8DC5\ttuo\n8DC6\ttai\n8DC7\tyi\n8DC8\tnian\n8DC9\tling\n8DCA\tmei\n8DCB\tba\n8DCC\tdie\n8DCD\tku\n8DCE\ttuo\n8DCF\tjia\n8DD0\tci\n8DD1\tpao\n8DD2\tqia\n8DD3\tzhu\n8DD4\tju\n8DD5\tdian\n8DD6\tzhi\n8DD7\tfu\n8DD8\tpan\n8DD9\tju\n8DDA\tshan\n8DDB\tbo\n8DDC\tni\n8DDD\tju\n8DDE\tli\n8DDF\tgen\n8DE0\tyi\n8DE1\tji\n8DE2\tduo\n8DE3\txian\n8DE4\tjiao\n8DE5\tduo\n8DE6\tzhu\n8DE7\tquan\n8DE8\tkua\n8DE9\tzhuai\n8DEA\tgui\n8DEB\tqiong\n8DEC\tkui\n8DED\txiang\n8DEE\tchi\n8DEF\tlu\n8DF0\tpian\n8DF1\tzhi\n8DF2\tjia\n8DF3\ttiao\n8DF4\tcai\n8DF5\tjian\n8DF6\tda\n8DF7\tqiao\n8DF8\tbi\n8DF9\txian\n8DFA\tduo\n8DFB\tji\n8DFC\tju\n8DFD\tji\n8DFE\tshu\n8DFF\ttu\n8E00\tchu\n8E01\tjing\n8E02\tnie\n8E03\txiao\n8E04\tbu\n8E05\txue\n8E06\tcun\n8E07\tmu\n8E08\tshu\n8E09\tliang\n8E0A\tyong\n8E0B\tjiao\n8E0C\tchou\n8E0D\tqiao\n8E0E\tmou\n8E0F\tta\n8E10\tjian\n8E11\tqi\n8E12\two\n8E13\twei\n8E14\tchuo\n8E15\tjie\n8E16\tji\n8E17\tnie\n8E18\tju\n8E19\tnie\n8E1A\tlun\n8E1B\tlu\n8E1C\tleng\n8E1D\thuai\n8E1E\tju\n8E1F\tchi\n8E20\twan\n8E21\tquan\n8E22\tti\n8E23\tbo\n8E24\tzu\n8E25\tqie\n8E26\tyi\n8E27\tcu\n8E28\tzong\n8E29\tcai\n8E2A\tzong\n8E2B\tpeng\n8E2C\tzhi\n8E2D\tzheng\n8E2E\tdian\n8E2F\tzhi\n8E30\tyu\n8E31\tduo\n8E32\tdun\n8E33\tchuan\n8E34\tyong\n8E35\tzhong\n8E36\tdi\n8E37\tzha\n8E38\tchen\n8E39\tchuai\n8E3A\tjian\n8E3B\tgua\n8E3C\ttang\n8E3D\tju\n8E3E\tfu\n8E3F\tzu\n8E40\tdie\n8E41\tpian\n8E42\trou\n8E43\tnuo\n8E44\tti\n8E45\tcha\n8E46\ttui\n8E47\tjian\n8E48\tdao\n8E49\tcuo\n8E4A\tqi\n8E4B\tta\n8E4C\tqiang\n8E4D\tnian\n8E4E\tdian\n8E4F\tti\n8E50\tji\n8E51\tnie\n8E52\tpan\n8E53\tliu\n8E54\tzan\n8E55\tbi\n8E56\tchong\n8E57\tlu\n8E58\tliao\n8E59\tcu\n8E5A\ttang\n8E5B\tdai\n8E5C\tsu\n8E5D\txi\n8E5E\tkui\n8E5F\tji\n8E60\tzhi\n8E61\tqiang\n8E62\tdi\n8E63\tpan\n8E64\tzong\n8E65\tlian\n8E66\tbeng\n8E67\tzao\n8E68\tnian\n8E69\tbie\n8E6A\ttui\n8E6B\tju\n8E6C\tdeng\n8E6D\tceng\n8E6E\txian\n8E6F\tfan\n8E70\tchu\n8E71\tzhong\n8E72\tdun\n8E73\tbo\n8E74\tcu\n8E75\tcu\n8E76\tjue\n8E77\tjue\n8E78\tlin\n8E79\tta\n8E7A\tqiao\n8E7B\tjue\n8E7C\tpu\n8E7D\tliao\n8E7E\tdun\n8E7F\tcuan\n8E80\tguan\n8E81\tzao\n8E82\tda\n8E83\tbi\n8E84\tbi\n8E85\tzhu\n8E86\tju\n8E87\tchu\n8E88\tqiao\n8E89\tdun\n8E8A\tchou\n8E8B\tji\n8E8C\twu\n8E8D\tyue\n8E8E\tnian\n8E8F\tlin\n8E90\tlie\n8E91\tzhi\n8E92\tli\n8E93\tzhi\n8E94\tchan\n8E95\tchu\n8E96\tduan\n8E97\twei\n8E98\tlong\n8E99\tlin\n8E9A\txian\n8E9B\twei\n8E9C\tzuan\n8E9D\tlan\n8E9E\txie\n8E9F\trang\n8EA0\tsa\n8EA1\tnie\n8EA2\tta\n8EA3\tqu\n8EA4\tji\n8EA5\tcuan\n8EA6\tcuo\n8EA7\txi\n8EA8\tkui\n8EA9\tjue\n8EAA\tlin\n8EAB\tshen\n8EAC\tgong\n8EAD\tdan\n8EAE\tfen\n8EAF\tqu\n8EB0\tti\n8EB1\tduo\n8EB2\tduo\n8EB3\tgong\n8EB4\tlang\n8EB5\tren\n8EB6\tluo\n8EB7\tai\n8EB8\tji\n8EB9\tju\n8EBA\ttang\n8EBB\tkong\n8EBC\tlao\n8EBD\tyan\n8EBE\tmei\n8EBF\tkang\n8EC0\tqu\n8EC1\tlou\n8EC2\tlao\n8EC3\tduo\n8EC4\tzhi\n8EC5\tyan\n8EC6\tti\n8EC7\tdao\n8EC8\tying\n8EC9\tyu\n8ECA\tche\n8ECB\tya\n8ECC\tgui\n8ECD\tjun\n8ECE\twei\n8ECF\tyue\n8ED0\txin\n8ED1\tdai\n8ED2\txuan\n8ED3\tfan\n8ED4\tren\n8ED5\tshan\n8ED6\tkuang\n8ED7\tshu\n8ED8\ttun\n8ED9\tchen\n8EDA\tdai\n8EDB\te\n8EDC\tna\n8EDD\tqi\n8EDE\tmao\n8EDF\truan\n8EE0\tkuang\n8EE1\tqian\n8EE2\tzhuan\n8EE3\thong\n8EE4\thu\n8EE5\tqu\n8EE6\tkuang\n8EE7\tdi\n8EE8\tling\n8EE9\tdai\n8EEA\tao\n8EEB\tzhen\n8EEC\tfan\n8EED\tkuang\n8EEE\tyang\n8EEF\tpeng\n8EF0\tbei\n8EF1\tgu\n8EF2\tgu\n8EF3\tpao\n8EF4\tzhu\n8EF5\trong\n8EF6\te\n8EF7\tba\n8EF8\tzhou\n8EF9\tzhi\n8EFA\tyao\n8EFB\tke\n8EFC\tyi\n8EFD\tzhi\n8EFE\tshi\n8EFF\tping\n8F00\ter\n8F01\tgong\n8F02\tju\n8F03\tjiao\n8F04\tguang\n8F05\tlu\n8F06\tkai\n8F07\tquan\n8F08\tzhou\n8F09\tzai\n8F0A\tzhi\n8F0B\tshe\n8F0C\tliang\n8F0D\tyu\n8F0E\tshao\n8F0F\tyou\n8F10\twan\n8F11\tyin\n8F12\tzhe\n8F13\twan\n8F14\tfu\n8F15\tqing\n8F16\tzhou\n8F17\tni\n8F18\tleng\n8F19\tzhe\n8F1A\tzhan\n8F1B\tliang\n8F1C\tzi\n8F1D\thui\n8F1E\twang\n8F1F\tchuo\n8F20\tguo\n8F21\tkan\n8F22\tyi\n8F23\tpeng\n8F24\tqian\n8F25\tgun\n8F26\tnian\n8F27\tping\n8F28\tguan\n8F29\tbei\n8F2A\tlun\n8F2B\tpai\n8F2C\tliang\n8F2D\truan\n8F2E\trou\n8F2F\tji\n8F30\tyang\n8F31\txian\n8F32\tchuan\n8F33\tcou\n8F34\tchun\n8F35\tge\n8F36\tyou\n8F37\thong\n8F38\tshu\n8F39\tfu\n8F3A\tzi\n8F3B\tfu\n8F3C\twen\n8F3D\tben\n8F3E\tzhan\n8F3F\tyu\n8F40\twen\n8F41\ttao\n8F42\tgu\n8F43\tzhen\n8F44\txia\n8F45\tyuan\n8F46\tlu\n8F47\tjiao\n8F48\tchao\n8F49\tzhuan\n8F4A\twei\n8F4B\thun\n8F4C\txue\n8F4D\tzhe\n8F4E\tjiao\n8F4F\tzhan\n8F50\tbu\n8F51\tlao\n8F52\tfen\n8F53\tfan\n8F54\tlin\n8F55\tge\n8F56\tse\n8F57\tkan\n8F58\thuan\n8F59\tyi\n8F5A\tji\n8F5B\tzhui\n8F5C\ter\n8F5D\tyu\n8F5E\tjian\n8F5F\thong\n8F60\tlei\n8F61\tpei\n8F62\tli\n8F63\tli\n8F64\tlu\n8F65\tlin\n8F66\tche\n8F67\tya\n8F68\tgui\n8F69\txuan\n8F6A\tdai\n8F6B\tren\n8F6C\tzhuan\n8F6D\te\n8F6E\tlun\n8F6F\truan\n8F70\thong\n8F71\tgu\n8F72\tke\n8F73\tlu\n8F74\tzhou\n8F75\tzhi\n8F76\tyi\n8F77\thu\n8F78\tzhen\n8F79\tli\n8F7A\tyao\n8F7B\tqing\n8F7C\tshi\n8F7D\tzai\n8F7E\tzhi\n8F7F\tjiao\n8F80\tzhou\n8F81\tquan\n8F82\tlu\n8F83\tjiao\n8F84\tzhe\n8F85\tfu\n8F86\tliang\n8F87\tnian\n8F88\tbei\n8F89\thui\n8F8A\tgun\n8F8B\twang\n8F8C\tliang\n8F8D\tchuo\n8F8E\tzi\n8F8F\tcou\n8F90\tfu\n8F91\tji\n8F92\twen\n8F93\tshu\n8F94\tpei\n8F95\tyuan\n8F96\txia\n8F97\tzhan\n8F98\tlu\n8F99\tzhe\n8F9A\tlin\n8F9B\txin\n8F9C\tgu\n8F9D\tci\n8F9E\tci\n8F9F\tpi\n8FA0\tzui\n8FA1\tbian\n8FA2\tla\n8FA3\tla\n8FA4\tci\n8FA5\txue\n8FA6\tban\n8FA7\tbian\n8FA8\tbian\n8FA9\tbian\n8FAA\txue\n8FAB\tbian\n8FAC\tban\n8FAD\tci\n8FAE\tbian\n8FAF\tbian\n8FB0\tchen\n8FB1\tru\n8FB2\tnong\n8FB3\tnong\n8FB4\tchan\n8FB5\tchuo\n8FB6\tchuo\n8FB7\tyi\n8FB8\treng\n8FB9\tbian\n8FBA\tbian\n8FBB\tshi\n8FBC\tyu\n8FBD\tliao\n8FBE\tda\n8FBF\tchan\n8FC0\tgan\n8FC1\tqian\n8FC2\tyu\n8FC3\tyu\n8FC4\tqi\n8FC5\txun\n8FC6\tyi\n8FC7\tguo\n8FC8\tmai\n8FC9\tqi\n8FCA\tza\n8FCB\twang\n8FCC\ttu\n8FCD\tzhun\n8FCE\tying\n8FCF\tda\n8FD0\tyun\n8FD1\tjin\n8FD2\thang\n8FD3\tya\n8FD4\tfan\n8FD5\twu\n8FD6\tda\n8FD7\te\n8FD8\thai\n8FD9\tzhe\n8FDA\tda\n8FDB\tjin\n8FDC\tyuan\n8FDD\twei\n8FDE\tlian\n8FDF\tchi\n8FE0\tche\n8FE1\tni\n8FE2\ttiao\n8FE3\tzhi\n8FE4\tyi\n8FE5\tjiong\n8FE6\tjia\n8FE7\tchen\n8FE8\tdai\n8FE9\ter\n8FEA\tdi\n8FEB\tpo\n8FEC\tzhu\n8FED\tdie\n8FEE\tze\n8FEF\ttao\n8FF0\tshu\n8FF1\ttuo\n8FF2\tqu\n8FF3\tjing\n8FF4\thui\n8FF5\tdong\n8FF6\tyou\n8FF7\tmi\n8FF8\tbeng\n8FF9\tji\n8FFA\tnai\n8FFB\tyi\n8FFC\tjie\n8FFD\tzhui\n8FFE\tlie\n8FFF\txun\n9000\ttui\n9001\tsong\n9002\tshi\n9003\ttao\n9004\tpang\n9005\thou\n9006\tni\n9007\tdun\n9008\tjiong\n9009\txuan\n900A\txun\n900B\tbu\n900C\tyou\n900D\txiao\n900E\tqiu\n900F\ttou\n9010\tzhu\n9011\tqiu\n9012\tdi\n9013\tdi\n9014\ttu\n9015\tjing\n9016\tti\n9017\tdou\n9018\tyi\n9019\tzhe\n901A\ttong\n901B\tguang\n901C\twu\n901D\tshi\n901E\tcheng\n901F\tsu\n9020\tzao\n9021\tqun\n9022\tfeng\n9023\tlian\n9024\tsuo\n9025\thui\n9026\tli\n9027\tgu\n9028\tlai\n9029\tben\n902A\tcuo\n902B\tjue\n902C\tbeng\n902D\thuan\n902E\tdai\n902F\tlu\n9030\tyou\n9031\tzhou\n9032\tjin\n9033\tyu\n9034\tchuo\n9035\tkui\n9036\twei\n9037\tti\n9038\tyi\n9039\tda\n903A\tyuan\n903B\tluo\n903C\tbi\n903D\tnuo\n903E\tyu\n903F\tdang\n9040\tsui\n9041\tdun\n9042\tsui\n9043\tyan\n9044\tchuan\n9045\tchi\n9046\tti\n9047\tyu\n9048\tshi\n9049\tzhen\n904A\tyou\n904B\tyun\n904C\te\n904D\tbian\n904E\tguo\n904F\te\n9050\txia\n9051\thuang\n9052\tqiu\n9053\tdao\n9054\tda\n9055\twei\n9056\tnan\n9057\tyi\n9058\tgou\n9059\tyao\n905A\tchou\n905B\tliu\n905C\txun\n905D\tta\n905E\tdi\n905F\tchi\n9060\tyuan\n9061\tsu\n9062\tta\n9063\tqian\n9064\tma\n9065\tyao\n9066\tguan\n9067\tzhang\n9068\tao\n9069\tshi\n906A\tca\n906B\tchi\n906C\tsu\n906D\tzao\n906E\tzhe\n906F\tdun\n9070\tdi\n9071\tlou\n9072\tchi\n9073\tcuo\n9074\tlin\n9075\tzun\n9076\trao\n9077\tqian\n9078\txuan\n9079\tyu\n907A\tyi\n907B\te\n907C\tliao\n907D\tju\n907E\tshi\n907F\tbi\n9080\tyao\n9081\tmai\n9082\txie\n9083\tsui\n9084\thai\n9085\tzhan\n9086\tteng\n9087\ter\n9088\tmiao\n9089\tbian\n908A\tbian\n908B\tla\n908C\tli\n908D\tyuan\n908E\tyao\n908F\tluo\n9090\tli\n9091\tyi\n9092\tting\n9093\tdeng\n9094\tqi\n9095\tyong\n9096\tshan\n9097\than\n9098\tyu\n9099\tmang\n909A\tru\n909B\tqiong\n909C\txi\n909D\tkuang\n909E\tfu\n909F\tkang\n90A0\tbin\n90A1\tfang\n90A2\txing\n90A3\tna\n90A4\txin\n90A5\tshen\n90A6\tbang\n90A7\tyuan\n90A8\tcun\n90A9\thuo\n90AA\txie\n90AB\tbang\n90AC\twu\n90AD\tju\n90AE\tyou\n90AF\than\n90B0\ttai\n90B1\tqiu\n90B2\tbi\n90B3\tpi\n90B4\tbing\n90B5\tshao\n90B6\tbei\n90B7\twa\n90B8\tdi\n90B9\tzou\n90BA\tye\n90BB\tlin\n90BC\tkuang\n90BD\tgui\n90BE\tzhu\n90BF\tshi\n90C0\tku\n90C1\tyu\n90C2\tgai\n90C3\the\n90C4\tqie\n90C5\tzhi\n90C6\tji\n90C7\thuan\n90C8\thou\n90C9\txing\n90CA\tjiao\n90CB\txi\n90CC\tgui\n90CD\tnuo\n90CE\tlang\n90CF\tjia\n90D0\tkuai\n90D1\tzheng\n90D2\tlang\n90D3\tyun\n90D4\tyan\n90D5\tcheng\n90D6\tdou\n90D7\txi\n90D8\tlu\n90D9\tfu\n90DA\twu\n90DB\tfu\n90DC\tgao\n90DD\thao\n90DE\tlang\n90DF\tjia\n90E0\tgeng\n90E1\tjun\n90E2\tying\n90E3\tbo\n90E4\txi\n90E5\tbei\n90E6\tli\n90E7\tyun\n90E8\tbu\n90E9\txiao\n90EA\tqi\n90EB\tpi\n90EC\tqing\n90ED\tguo\n90EE\tzhou\n90EF\ttan\n90F0\tzou\n90F1\tping\n90F2\tlai\n90F3\tni\n90F4\tchen\n90F5\tyou\n90F6\tbu\n90F7\txiang\n90F8\tdan\n90F9\tju\n90FA\tyong\n90FB\tqiao\n90FC\tyi\n90FD\tdou\n90FE\tyan\n90FF\tmei\n9100\truo\n9101\tbei\n9102\te\n9103\tshu\n9104\tjuan\n9105\tyu\n9106\tyun\n9107\thou\n9108\tkui\n9109\txiang\n910A\txiang\n910B\tsou\n910C\ttang\n910D\tming\n910E\txi\n910F\tru\n9110\tchu\n9111\tzi\n9112\tzou\n9113\tye\n9114\twu\n9115\txiang\n9116\tyun\n9117\thao\n9118\tyong\n9119\tbi\n911A\tmao\n911B\tchao\n911C\tfu\n911D\tliao\n911E\tyin\n911F\tzhuan\n9120\thu\n9121\tqiao\n9122\tyan\n9123\tzhang\n9124\tman\n9125\tqiao\n9126\txu\n9127\tdeng\n9128\tbi\n9129\txun\n912A\tbi\n912B\tzeng\n912C\twei\n912D\tzheng\n912E\tmao\n912F\tshan\n9130\tlin\n9131\tpo\n9132\tdan\n9133\tmeng\n9134\tye\n9135\tcao\n9136\tkuai\n9137\tfeng\n9138\tmeng\n9139\tzou\n913A\tkuang\n913B\tlian\n913C\tzan\n913D\tchan\n913E\tyou\n913F\tji\n9140\tyan\n9141\tchan\n9142\tzan\n9143\tling\n9144\thuan\n9145\txi\n9146\tfeng\n9147\tzan\n9148\tli\n9149\tyou\n914A\tding\n914B\tqiu\n914C\tzhuo\n914D\tpei\n914E\tzhou\n914F\tyi\n9150\tgan\n9151\tyu\n9152\tjiu\n9153\tyan\n9154\tzui\n9155\tmao\n9156\tzhen\n9157\txu\n9158\tdou\n9159\tzhen\n915A\tfen\n915B\tyuan\n915C\tfu\n915D\tyun\n915E\ttai\n915F\ttian\n9160\tqia\n9161\ttuo\n9162\tzuo\n9163\than\n9164\tgu\n9165\tsu\n9166\tpo\n9167\tchou\n9168\tzai\n9169\tming\n916A\tlao\n916B\tchuo\n916C\tchou\n916D\tyou\n916E\ttong\n916F\tzhi\n9170\txian\n9171\tjiang\n9172\tcheng\n9173\tyin\n9174\ttu\n9175\tjiao\n9176\tmei\n9177\tku\n9178\tsuan\n9179\tlei\n917A\tpu\n917B\tzui\n917C\thai\n917D\tyan\n917E\tshi\n917F\tniang\n9180\twei\n9181\tlu\n9182\tlan\n9183\tyan\n9184\ttao\n9185\tpei\n9186\tzhan\n9187\tchun\n9188\ttan\n9189\tzui\n918A\tzhui\n918B\tcu\n918C\tkun\n918D\tti\n918E\txian\n918F\tdu\n9190\thu\n9191\txu\n9192\txing\n9193\ttan\n9194\tqiu\n9195\tchun\n9196\tyun\n9197\tpo\n9198\tke\n9199\tsou\n919A\tmi\n919B\tquan\n919C\tchou\n919D\tcuo\n919E\tyun\n919F\tyong\n91A0\tang\n91A1\tzha\n91A2\thai\n91A3\ttang\n91A4\tjiang\n91A5\tpiao\n91A6\tchen\n91A7\tyu\n91A8\tli\n91A9\tzao\n91AA\tlao\n91AB\tyi\n91AC\tjiang\n91AD\tbu\n91AE\tjiao\n91AF\txi\n91B0\ttan\n91B1\tfa\n91B2\tnong\n91B3\tyi\n91B4\tli\n91B5\tju\n91B6\tyan\n91B7\tyi\n91B8\tniang\n91B9\tru\n91BA\txun\n91BB\tchou\n91BC\tyan\n91BD\tling\n91BE\tmi\n91BF\tmi\n91C0\tniang\n91C1\txin\n91C2\tjiao\n91C3\tshai\n91C4\tmi\n91C5\tyan\n91C6\tbian\n91C7\tcai\n91C8\tshi\n91C9\tyou\n91CA\tshi\n91CB\tshi\n91CC\tli\n91CD\tzhong\n91CE\tye\n91CF\tliang\n91D0\txi\n91D1\tjin\n91D2\tjin\n91D3\tga\n91D4\tyi\n91D5\tliao\n91D6\tdao\n91D7\tzhao\n91D8\tding\n91D9\tpo\n91DA\tqiu\n91DB\tba\n91DC\tfu\n91DD\tzhen\n91DE\tzhi\n91DF\tba\n91E0\tluan\n91E1\tfu\n91E2\tnai\n91E3\tdiao\n91E4\tshan\n91E5\tqiao\n91E6\tkou\n91E7\tchuan\n91E8\tzi\n91E9\tfan\n91EA\thua\n91EB\thua\n91EC\than\n91ED\tgang\n91EE\tqi\n91EF\tmang\n91F0\tri\n91F1\tdi\n91F2\tsi\n91F3\txi\n91F4\tyi\n91F5\tchai\n91F6\tshi\n91F7\ttu\n91F8\txi\n91F9\tnu\n91FA\tqian\n91FB\tqiu\n91FC\tjian\n91FD\tpi\n91FE\tye\n91FF\tjin\n9200\tba\n9201\tfang\n9202\tchen\n9203\txing\n9204\tdou\n9205\tyue\n9206\tqian\n9207\tfu\n9208\tbu\n9209\tna\n920A\txin\n920B\te\n920C\tjue\n920D\tdun\n920E\tgou\n920F\tyin\n9210\tqian\n9211\tban\n9212\tsa\n9213\tren\n9214\tchao\n9215\tniu\n9216\tfen\n9217\tyun\n9218\tyi\n9219\tqin\n921A\tpi\n921B\tguo\n921C\thong\n921D\tyin\n921E\tjun\n921F\tdiao\n9220\tyi\n9221\tzhong\n9222\txi\n9223\tgai\n9224\tri\n9225\thuo\n9226\ttai\n9227\tkang\n9228\tyuan\n9229\tlu\n922A\te\n922B\tqin\n922C\tduo\n922D\tzi\n922E\tni\n922F\ttu\n9230\tshi\n9231\tmin\n9232\tgu\n9233\tke\n9234\tling\n9235\tbing\n9236\tsi\n9237\tgu\n9238\tbo\n9239\tpi\n923A\tyu\n923B\tsi\n923C\tzuo\n923D\tbu\n923E\tyou\n923F\ttian\n9240\tjia\n9241\tzhen\n9242\tshi\n9243\tshi\n9244\tzhi\n9245\tju\n9246\tchan\n9247\tshi\n9248\tshi\n9249\txuan\n924A\tzhao\n924B\tbao\n924C\the\n924D\tbi\n924E\tsheng\n924F\tchu\n9250\tshi\n9251\tbo\n9252\tzhu\n9253\tchi\n9254\tza\n9255\tpo\n9256\ttong\n9257\tqian\n9258\tfu\n9259\tzhai\n925A\tmao\n925B\tqian\n925C\tfu\n925D\tli\n925E\tyue\n925F\tpi\n9260\tyang\n9261\tban\n9262\tbo\n9263\tjie\n9264\tgou\n9265\tshu\n9266\tzheng\n9267\tmu\n9268\txi\n9269\txi\n926A\tdi\n926B\tjia\n926C\tmu\n926D\ttan\n926E\thuan\n926F\tyi\n9270\tsi\n9271\tkuang\n9272\tka\n9273\tbei\n9274\tjian\n9275\ttong\n9276\txing\n9277\thong\n9278\tjiao\n9279\tchi\n927A\ter\n927B\tge\n927C\tbing\n927D\tshi\n927E\tmou\n927F\tjia\n9280\tyin\n9281\tjun\n9282\tzhou\n9283\tchong\n9284\txiang\n9285\ttong\n9286\tmo\n9287\tlei\n9288\tji\n9289\tyu\n928A\txu\n928B\tren\n928C\tzun\n928D\tzhi\n928E\tqiong\n928F\tshan\n9290\tchi\n9291\txian\n9292\txing\n9293\tquan\n9294\tpi\n9295\ttie\n9296\tzhu\n9297\txiang\n9298\tming\n9299\tkua\n929A\tyao\n929B\txian\n929C\txian\n929D\txiu\n929E\tjun\n929F\tcha\n92A0\tlao\n92A1\tji\n92A2\tpi\n92A3\tru\n92A4\tmi\n92A5\tyi\n92A6\tyin\n92A7\tguang\n92A8\tan\n92A9\tdiu\n92AA\tyou\n92AB\tse\n92AC\tkao\n92AD\tqian\n92AE\tluan\n92AF\tsi\n92B0\tai\n92B1\tdiao\n92B2\than\n92B3\trui\n92B4\tshi\n92B5\tkeng\n92B6\tqiu\n92B7\txiao\n92B8\tzhe\n92B9\txiu\n92BA\tzang\n92BB\tti\n92BC\tcuo\n92BD\tgua\n92BE\thong\n92BF\tzhong\n92C0\ttou\n92C1\tlu\n92C2\tmei\n92C3\tlang\n92C4\twan\n92C5\txin\n92C6\tyun\n92C7\tbei\n92C8\twu\n92C9\tsu\n92CA\tyu\n92CB\tchan\n92CC\tding\n92CD\tbo\n92CE\than\n92CF\tjia\n92D0\thong\n92D1\tcuan\n92D2\tfeng\n92D3\tchan\n92D4\twan\n92D5\tzhi\n92D6\tsi\n92D7\txuan\n92D8\thua\n92D9\tyu\n92DA\ttiao\n92DB\tkuang\n92DC\tzhuo\n92DD\tlue\n92DE\txing\n92DF\tqin\n92E0\tshen\n92E1\than\n92E2\tlue\n92E3\tye\n92E4\tchu\n92E5\tzeng\n92E6\tju\n92E7\txian\n92E8\te\n92E9\tmang\n92EA\tpu\n92EB\tli\n92EC\tpan\n92ED\trui\n92EE\tcheng\n92EF\tgao\n92F0\tli\n92F1\tte\n92F2\tbing\n92F3\tzhu\n92F4\tzhen\n92F5\ttu\n92F6\tliu\n92F7\tzui\n92F8\tju\n92F9\tchang\n92FA\tyuan\n92FB\tjian\n92FC\tgang\n92FD\tdiao\n92FE\ttao\n92FF\tchang\n9300\tlun\n9301\tguo\n9302\tling\n9303\tpi\n9304\tlu\n9305\tli\n9306\tqiang\n9307\tpou\n9308\tjuan\n9309\tmin\n930A\tzui\n930B\tpeng\n930C\tan\n930D\tpi\n930E\txian\n930F\tya\n9310\tzhui\n9311\tlei\n9312\ta\n9313\tkong\n9314\tta\n9315\tkun\n9316\tdu\n9317\tnei\n9318\tchui\n9319\tzi\n931A\tzheng\n931B\tben\n931C\tnie\n931D\tzong\n931E\tchun\n931F\ttan\n9320\tding\n9321\tqi\n9322\tqian\n9323\tzhui\n9324\tji\n9325\tyu\n9326\tjin\n9327\tguan\n9328\tmao\n9329\tchang\n932A\ttian\n932B\txi\n932C\tlian\n932D\ttao\n932E\tgu\n932F\tcuo\n9330\tshu\n9331\tzhen\n9332\tlu\n9333\tmeng\n9334\tlu\n9335\thua\n9336\tbiao\n9337\tga\n9338\tlai\n9339\tken\n933A\tfang\n933B\twu\n933C\tnai\n933D\twan\n933E\tzan\n933F\thu\n9340\tde\n9341\txian\n9342\tpian\n9343\thuo\n9344\tliang\n9345\tfa\n9346\tmen\n9347\tkai\n9348\tying\n9349\tdi\n934A\tlian\n934B\tguo\n934C\txian\n934D\tdu\n934E\ttu\n934F\twei\n9350\tzong\n9351\tfu\n9352\trou\n9353\tji\n9354\te\n9355\tjun\n9356\tchen\n9357\tti\n9358\tzha\n9359\thu\n935A\tyang\n935B\tduan\n935C\txia\n935D\tyu\n935E\tkeng\n935F\tsheng\n9360\thuang\n9361\twei\n9362\tfu\n9363\tzhao\n9364\tcha\n9365\tqie\n9366\tshi\n9367\thong\n9368\tkui\n9369\ttian\n936A\tmou\n936B\tqiao\n936C\tqiao\n936D\thou\n936E\ttou\n936F\tcong\n9370\thuan\n9371\tye\n9372\tmin\n9373\tjian\n9374\tduan\n9375\tjian\n9376\tsong\n9377\tkui\n9378\thu\n9379\txuan\n937A\tzhe\n937B\tjie\n937C\tzhen\n937D\tbian\n937E\tzhong\n937F\tzi\n9380\txiu\n9381\tye\n9382\tmei\n9383\tpai\n9384\tai\n9385\tjie\n9386\tqian\n9387\tmei\n9388\tsuo\n9389\tda\n938A\tbang\n938B\txia\n938C\tlian\n938D\tsuo\n938E\tkai\n938F\tliu\n9390\tyao\n9391\tye\n9392\tnou\n9393\tweng\n9394\trong\n9395\ttang\n9396\tsuo\n9397\tqiang\n9398\tli\n9399\tshuo\n939A\tchui\n939B\tbo\n939C\tpan\n939D\tda\n939E\tbi\n939F\tsang\n93A0\tgang\n93A1\tzi\n93A2\twu\n93A3\tying\n93A4\thuang\n93A5\ttiao\n93A6\tliu\n93A7\tkai\n93A8\tsun\n93A9\tsha\n93AA\tsou\n93AB\twan\n93AC\thao\n93AD\tzhen\n93AE\tzhen\n93AF\tlang\n93B0\tyi\n93B1\tyuan\n93B2\ttang\n93B3\tnie\n93B4\txi\n93B5\tjia\n93B6\tge\n93B7\tma\n93B8\tjuan\n93B9\tsong\n93BA\tzu\n93BB\tsuo\n93BC\txia\n93BD\tfeng\n93BE\twen\n93BF\tna\n93C0\tlu\n93C1\tsuo\n93C2\tou\n93C3\tzu\n93C4\ttuan\n93C5\txiu\n93C6\tguan\n93C7\txuan\n93C8\tlian\n93C9\tshou\n93CA\tao\n93CB\tman\n93CC\tmo\n93CD\tluo\n93CE\tbi\n93CF\twei\n93D0\tliu\n93D1\tdi\n93D2\tsan\n93D3\tzong\n93D4\tyi\n93D5\tlu\n93D6\tao\n93D7\tkeng\n93D8\tqiang\n93D9\tcui\n93DA\tqi\n93DB\tchang\n93DC\ttang\n93DD\tman\n93DE\tyong\n93DF\tchan\n93E0\tfeng\n93E1\tjing\n93E2\tbiao\n93E3\tshu\n93E4\tlou\n93E5\txiu\n93E6\tcong\n93E7\tlong\n93E8\tzan\n93E9\tjian\n93EA\tcao\n93EB\tli\n93EC\txia\n93ED\txi\n93EE\tkang\n93EF\tshuang\n93F0\tbeng\n93F1\tzhang\n93F2\tqian\n93F3\tcheng\n93F4\tlu\n93F5\thua\n93F6\tji\n93F7\tpu\n93F8\thui\n93F9\tqiang\n93FA\tpo\n93FB\tlin\n93FC\tse\n93FD\txiu\n93FE\tsan\n93FF\tcheng\n9400\tkui\n9401\tsi\n9402\tliu\n9403\tnao\n9404\thuang\n9405\tpie\n9406\tsui\n9407\tfan\n9408\tqiao\n9409\tquan\n940A\tyang\n940B\ttang\n940C\txiang\n940D\tjue\n940E\tjiao\n940F\tzun\n9410\tliao\n9411\tqie\n9412\tlao\n9413\tdui\n9414\txin\n9415\tzan\n9416\tji\n9417\tjian\n9418\tzhong\n9419\tdeng\n941A\tya\n941B\tying\n941C\tdui\n941D\tjue\n941E\tnou\n941F\tzan\n9420\tpu\n9421\ttie\n9422\tfan\n9423\tcheng\n9424\tding\n9425\tshan\n9426\tkai\n9427\tjian\n9428\tfei\n9429\tsui\n942A\tlu\n942B\tjuan\n942C\thui\n942D\tyu\n942E\tlian\n942F\tzhuo\n9430\tqiao\n9431\tjian\n9432\tzhuo\n9433\tlei\n9434\tbi\n9435\ttie\n9436\thuan\n9437\tye\n9438\tduo\n9439\tguo\n943A\tdang\n943B\tju\n943C\tfen\n943D\tda\n943E\tbei\n943F\tyi\n9440\tai\n9441\tzong\n9442\txun\n9443\tdiao\n9444\tzhu\n9445\theng\n9446\tzhui\n9447\tji\n9448\tnie\n9449\the\n944A\thuo\n944B\tqing\n944C\tbin\n944D\tying\n944E\tkui\n944F\tning\n9450\txu\n9451\tjian\n9452\tjian\n9453\tqian\n9454\tcha\n9455\tzhi\n9456\tmie\n9457\tli\n9458\tlei\n9459\tji\n945A\tzuan\n945B\tkuang\n945C\tshang\n945D\tpeng\n945E\tla\n945F\tdu\n9460\tshuo\n9461\tchuo\n9462\tlu\n9463\tbiao\n9464\tbao\n9465\tlu\n9466\txian\n9467\tkuan\n9468\tlong\n9469\te\n946A\tlu\n946B\txin\n946C\tjian\n946D\tlan\n946E\tbo\n946F\tjian\n9470\tyao\n9471\tchan\n9472\txiang\n9473\tjian\n9474\txi\n9475\tguan\n9476\tcang\n9477\tnie\n9478\tlei\n9479\tcuan\n947A\tqu\n947B\tpan\n947C\tluo\n947D\tzuan\n947E\tluan\n947F\tzao\n9480\tnie\n9481\tjue\n9482\ttang\n9483\tzhu\n9484\tlan\n9485\tjin\n9486\tga\n9487\tyi\n9488\tzhen\n9489\tding\n948A\tzhao\n948B\tpo\n948C\tliao\n948D\ttu\n948E\tqian\n948F\tchuan\n9490\tshan\n9491\tsa\n9492\tfan\n9493\tdiao\n9494\tmen\n9495\tnu\n9496\tyang\n9497\tchai\n9498\txing\n9499\tgai\n949A\tbu\n949B\ttai\n949C\tju\n949D\tdun\n949E\tchao\n949F\tzhong\n94A0\tna\n94A1\tbei\n94A2\tgang\n94A3\tban\n94A4\tqian\n94A5\tyao\n94A6\tqin\n94A7\tjun\n94A8\twu\n94A9\tgou\n94AA\tkang\n94AB\tfang\n94AC\thuo\n94AD\tdou\n94AE\tniu\n94AF\tba\n94B0\tyu\n94B1\tqian\n94B2\tzheng\n94B3\tqian\n94B4\tgu\n94B5\tbo\n94B6\tke\n94B7\tpo\n94B8\tbu\n94B9\tbo\n94BA\tyue\n94BB\tzuan\n94BC\tmu\n94BD\ttan\n94BE\tjia\n94BF\tdian\n94C0\tyou\n94C1\ttie\n94C2\tbo\n94C3\tling\n94C4\tshuo\n94C5\tqian\n94C6\tmao\n94C7\tbao\n94C8\tshi\n94C9\txuan\n94CA\tta\n94CB\tbi\n94CC\tni\n94CD\tpi\n94CE\tduo\n94CF\txing\n94D0\tkao\n94D1\tlao\n94D2\ter\n94D3\tmang\n94D4\tya\n94D5\tyou\n94D6\tcheng\n94D7\tjia\n94D8\tye\n94D9\tnao\n94DA\tzhi\n94DB\tdang\n94DC\ttong\n94DD\tlu\n94DE\tdiao\n94DF\tyin\n94E0\tkai\n94E1\tzha\n94E2\tzhu\n94E3\txi\n94E4\tting\n94E5\tdiu\n94E6\txian\n94E7\thua\n94E8\tquan\n94E9\tsha\n94EA\tha\n94EB\tdiao\n94EC\tge\n94ED\tming\n94EE\tzheng\n94EF\tse\n94F0\tjiao\n94F1\tyi\n94F2\tchan\n94F3\tchong\n94F4\ttang\n94F5\tan\n94F6\tyin\n94F7\tru\n94F8\tzhu\n94F9\tlao\n94FA\tpu\n94FB\twu\n94FC\tlai\n94FD\tte\n94FE\tlian\n94FF\tkeng\n9500\txiao\n9501\tsuo\n9502\tli\n9503\tzeng\n9504\tchu\n9505\tguo\n9506\tgao\n9507\te\n9508\txiu\n9509\tcuo\n950A\tlue\n950B\tfeng\n950C\txin\n950D\tliu\n950E\tkai\n950F\tjian\n9510\trui\n9511\tti\n9512\tlang\n9513\tqin\n9514\tju\n9515\ta\n9516\tqiang\n9517\tzhe\n9518\tnuo\n9519\tcuo\n951A\tmao\n951B\tben\n951C\tqi\n951D\tde\n951E\tke\n951F\tkun\n9520\tchang\n9521\txi\n9522\tgu\n9523\tluo\n9524\tchui\n9525\tzhui\n9526\tjin\n9527\tzhi\n9528\txian\n9529\tjuan\n952A\thuo\n952B\tpei\n952C\ttan\n952D\tding\n952E\tjian\n952F\tju\n9530\tmeng\n9531\tzi\n9532\tqie\n9533\tying\n9534\tkai\n9535\tqiang\n9536\tsi\n9537\te\n9538\tcha\n9539\tqiao\n953A\tzhong\n953B\tduan\n953C\tsou\n953D\thuang\n953E\thuan\n953F\tai\n9540\tdu\n9541\tmei\n9542\tlou\n9543\tzi\n9544\tfei\n9545\tmei\n9546\tmo\n9547\tzhen\n9548\tbo\n9549\tge\n954A\tnie\n954B\ttang\n954C\tjuan\n954D\tnie\n954E\tna\n954F\tliu\n9550\tgao\n9551\tbang\n9552\tyi\n9553\tjia\n9554\tbin\n9555\trong\n9556\tbiao\n9557\ttang\n9558\tman\n9559\tluo\n955A\tbeng\n955B\tyong\n955C\tjing\n955D\tdi\n955E\tzu\n955F\txuan\n9560\tliu\n9561\tchan\n9562\tjue\n9563\tliao\n9564\tpu\n9565\tlu\n9566\tdun\n9567\tlan\n9568\tpu\n9569\tcuan\n956A\tqiang\n956B\tdeng\n956C\thuo\n956D\tlei\n956E\thuan\n956F\tzhuo\n9570\tlian\n9571\tyi\n9572\tcha\n9573\tbiao\n9574\tla\n9575\tchan\n9576\txiang\n9577\tzhang\n9578\tchang\n9579\tjiu\n957A\tao\n957B\tdie\n957C\tqu\n957D\tliao\n957E\tmi\n957F\tzhang\n9580\tmen\n9581\tma\n9582\tshuan\n9583\tshan\n9584\thuo\n9585\tmen\n9586\tyan\n9587\tbi\n9588\than\n9589\tbi\n958A\tshan\n958B\tkai\n958C\tkang\n958D\tbeng\n958E\thong\n958F\trun\n9590\tsan\n9591\txian\n9592\txian\n9593\tjian\n9594\tmin\n9595\txia\n9596\tshui\n9597\tdou\n9598\tzha\n9599\tnao\n959A\tzhan\n959B\tpeng\n959C\txia\n959D\tling\n959E\tbian\n959F\tbi\n95A0\trun\n95A1\tai\n95A2\tguan\n95A3\tge\n95A4\tge\n95A5\tfa\n95A6\tchu\n95A7\thong\n95A8\tgui\n95A9\tmin\n95AA\tse\n95AB\tkun\n95AC\tlang\n95AD\tlu\n95AE\tting\n95AF\tsha\n95B0\tju\n95B1\tyue\n95B2\tyue\n95B3\tchan\n95B4\tqu\n95B5\tlin\n95B6\tchang\n95B7\tshai\n95B8\tkun\n95B9\tyan\n95BA\twen\n95BB\tyan\n95BC\te\n95BD\thun\n95BE\tyu\n95BF\twen\n95C0\thong\n95C1\tbao\n95C2\thong\n95C3\tqu\n95C4\tyao\n95C5\twen\n95C6\tban\n95C7\tan\n95C8\twei\n95C9\tyin\n95CA\tkuo\n95CB\tque\n95CC\tlan\n95CD\tdu\n95CE\tquan\n95CF\tfeng\n95D0\ttian\n95D1\tnie\n95D2\tta\n95D3\tkai\n95D4\the\n95D5\tque\n95D6\tchuang\n95D7\tguan\n95D8\tdou\n95D9\tqi\n95DA\tkui\n95DB\ttang\n95DC\tguan\n95DD\tpiao\n95DE\tkan\n95DF\txi\n95E0\thui\n95E1\tchan\n95E2\tpi\n95E3\tdang\n95E4\thuan\n95E5\tta\n95E6\twen\n95E7\tta\n95E8\tmen\n95E9\tshuan\n95EA\tshan\n95EB\tyan\n95EC\than\n95ED\tbi\n95EE\twen\n95EF\tchuang\n95F0\trun\n95F1\twei\n95F2\txian\n95F3\thong\n95F4\tjian\n95F5\tmin\n95F6\tkang\n95F7\tmen\n95F8\tzha\n95F9\tnao\n95FA\tgui\n95FB\twen\n95FC\tta\n95FD\tmin\n95FE\tlu\n95FF\tkai\n9600\tfa\n9601\tge\n9602\the\n9603\tkun\n9604\tjiu\n9605\tyue\n9606\tlang\n9607\tdu\n9608\tyu\n9609\tyan\n960A\tchang\n960B\txi\n960C\twen\n960D\thun\n960E\tyan\n960F\tyan\n9610\tchan\n9611\tlan\n9612\tqu\n9613\thui\n9614\tkuo\n9615\tque\n9616\the\n9617\ttian\n9618\tta\n9619\tque\n961A\tkan\n961B\thuan\n961C\tfu\n961D\tfu\n961E\tle\n961F\tdui\n9620\txin\n9621\tqian\n9622\twu\n9623\tgai\n9624\tzhi\n9625\tyin\n9626\tyang\n9627\tdou\n9628\te\n9629\tsheng\n962A\tban\n962B\tpei\n962C\tkeng\n962D\tyun\n962E\truan\n962F\tzhi\n9630\tpi\n9631\tjing\n9632\tfang\n9633\tyang\n9634\tyin\n9635\tzhen\n9636\tjie\n9637\tcheng\n9638\te\n9639\tqu\n963A\tdi\n963B\tzu\n963C\tzuo\n963D\tdian\n963E\tling\n963F\ta\n9640\ttuo\n9641\ttuo\n9642\tpi\n9643\tbing\n9644\tfu\n9645\tji\n9646\tlu\n9647\tlong\n9648\tchen\n9649\txing\n964A\tduo\n964B\tlou\n964C\tmo\n964D\tjiang\n964E\tshu\n964F\tduo\n9650\txian\n9651\ter\n9652\tgui\n9653\tyu\n9654\tgai\n9655\tshan\n9656\tjun\n9657\tqiao\n9658\txing\n9659\tchun\n965A\tfu\n965B\tbi\n965C\txia\n965D\tshan\n965E\tsheng\n965F\tzhi\n9660\tpu\n9661\tdou\n9662\tyuan\n9663\tzhen\n9664\tchu\n9665\txian\n9666\tdao\n9667\tnie\n9668\tyun\n9669\txian\n966A\tpei\n966B\tfei\n966C\tzou\n966D\tyi\n966E\tdui\n966F\tlun\n9670\tyin\n9671\tju\n9672\tchui\n9673\tchen\n9674\tpi\n9675\tling\n9676\ttao\n9677\txian\n9678\tlu\n9679\tsheng\n967A\txian\n967B\tyin\n967C\tzhu\n967D\tyang\n967E\treng\n967F\txia\n9680\tchong\n9681\tyan\n9682\tyin\n9683\tshu\n9684\tdi\n9685\tyu\n9686\tlong\n9687\twei\n9688\twei\n9689\tnie\n968A\tdui\n968B\tsui\n968C\tan\n968D\thuang\n968E\tjie\n968F\tsui\n9690\tyin\n9691\tgai\n9692\tyan\n9693\thui\n9694\tge\n9695\tyun\n9696\twu\n9697\twei\n9698\tai\n9699\txi\n969A\ttang\n969B\tji\n969C\tzhang\n969D\tdao\n969E\tao\n969F\txi\n96A0\tyin\n96A1\tsa\n96A2\trao\n96A3\tlin\n96A4\ttui\n96A5\tdeng\n96A6\tjiao\n96A7\tsui\n96A8\tsui\n96A9\tao\n96AA\txian\n96AB\tfen\n96AC\tni\n96AD\ter\n96AE\tji\n96AF\tdao\n96B0\txi\n96B1\tyin\n96B2\tzhi\n96B3\thui\n96B4\tlong\n96B5\txi\n96B6\tli\n96B7\tli\n96B8\tli\n96B9\tzhui\n96BA\the\n96BB\tzhi\n96BC\tsun\n96BD\tjuan\n96BE\tnan\n96BF\tyi\n96C0\tque\n96C1\tyan\n96C2\tqin\n96C3\tqian\n96C4\txiong\n96C5\tya\n96C6\tji\n96C7\tgu\n96C8\thuan\n96C9\tzhi\n96CA\tgou\n96CB\tjuan\n96CC\tci\n96CD\tyong\n96CE\tju\n96CF\tchu\n96D0\thu\n96D1\tza\n96D2\tluo\n96D3\tyu\n96D4\tchou\n96D5\tdiao\n96D6\tsui\n96D7\than\n96D8\two\n96D9\tshuang\n96DA\tguan\n96DB\tchu\n96DC\tza\n96DD\tyong\n96DE\tji\n96DF\txi\n96E0\tchou\n96E1\tliu\n96E2\tli\n96E3\tnan\n96E4\txue\n96E5\tza\n96E6\tji\n96E7\tji\n96E8\tyu\n96E9\tyu\n96EA\txue\n96EB\tna\n96EC\tfou\n96ED\tse\n96EE\tmu\n96EF\twen\n96F0\tfen\n96F1\tpang\n96F2\tyun\n96F3\tli\n96F4\tchi\n96F5\tyang\n96F6\tling\n96F7\tlei\n96F8\tan\n96F9\tbao\n96FA\twu\n96FB\tdian\n96FC\tdang\n96FD\thu\n96FE\twu\n96FF\tdiao\n9700\txu\n9701\tji\n9702\tmu\n9703\tchen\n9704\txiao\n9705\tzha\n9706\tting\n9707\tzhen\n9708\tpei\n9709\tmei\n970A\tling\n970B\tqi\n970C\tzhou\n970D\thuo\n970E\tsha\n970F\tfei\n9710\thong\n9711\tzhan\n9712\tyin\n9713\tni\n9714\tzhu\n9715\ttun\n9716\tlin\n9717\tling\n9718\tdong\n9719\tying\n971A\twu\n971B\tling\n971C\tshuang\n971D\tling\n971E\txia\n971F\thong\n9720\tyin\n9721\tmai\n9722\tmai\n9723\tyun\n9724\tliu\n9725\tmeng\n9726\tbin\n9727\twu\n9728\twei\n9729\tkuo\n972A\tyin\n972B\txi\n972C\tyi\n972D\tai\n972E\tdan\n972F\tteng\n9730\txian\n9731\tyu\n9732\tlu\n9733\tlong\n9734\tdai\n9735\tji\n9736\tpang\n9737\tyang\n9738\tba\n9739\tpi\n973A\twei\n973B\tfeng\n973C\txi\n973D\tji\n973E\tmai\n973F\tmeng\n9740\tmeng\n9741\tlei\n9742\tli\n9743\thuo\n9744\tai\n9745\tfei\n9746\tdai\n9747\tlong\n9748\tling\n9749\tai\n974A\tfeng\n974B\tli\n974C\tbao\n974D\the\n974E\the\n974F\the\n9750\tbing\n9751\tqing\n9752\tqing\n9753\tjing\n9754\ttian\n9755\tzhen\n9756\tjing\n9757\tcheng\n9758\tqing\n9759\tjing\n975A\tjing\n975B\tdian\n975C\tjing\n975D\ttian\n975E\tfei\n975F\tfei\n9760\tkao\n9761\tmi\n9762\tmian\n9763\tmian\n9764\tbao\n9765\tye\n9766\ttian\n9767\thui\n9768\tye\n9769\tge\n976A\tding\n976B\tcha\n976C\tqian\n976D\tren\n976E\tdi\n976F\tdu\n9770\twu\n9771\tren\n9772\tqin\n9773\tjin\n9774\txue\n9775\tniu\n9776\tba\n9777\tyin\n9778\tsa\n9779\tna\n977A\tmo\n977B\tzu\n977C\tda\n977D\tban\n977E\tyi\n977F\tyao\n9780\ttao\n9781\tbei\n9782\tjie\n9783\thong\n9784\tpao\n9785\tyang\n9786\tbing\n9787\tyin\n9788\tge\n9789\ttao\n978A\tjie\n978B\txie\n978C\tan\n978D\tan\n978E\then\n978F\tgong\n9790\tqia\n9791\tda\n9792\tqiao\n9793\tting\n9794\tman\n9795\tying\n9796\tsui\n9797\ttiao\n9798\tqiao\n9799\txuan\n979A\tkong\n979B\tbeng\n979C\tta\n979D\tshang\n979E\tbing\n979F\tkuo\n97A0\tju\n97A1\tla\n97A2\txie\n97A3\trou\n97A4\tbang\n97A5\teng\n97A6\tqiu\n97A7\tqiu\n97A8\the\n97A9\tqiao\n97AA\tmu\n97AB\tju\n97AC\tjian\n97AD\tbian\n97AE\tdi\n97AF\tjian\n97B0\twen\n97B1\ttao\n97B2\tgou\n97B3\tta\n97B4\tbei\n97B5\txie\n97B6\tpan\n97B7\tge\n97B8\tbi\n97B9\tkuo\n97BA\ttang\n97BB\tlou\n97BC\tgui\n97BD\tqiao\n97BE\txue\n97BF\tji\n97C0\tjian\n97C1\tjiang\n97C2\tchan\n97C3\tda\n97C4\thu\n97C5\txian\n97C6\tqian\n97C7\tdu\n97C8\twa\n97C9\tjian\n97CA\tlan\n97CB\twei\n97CC\tren\n97CD\tfu\n97CE\tmei\n97CF\tquan\n97D0\tge\n97D1\twei\n97D2\tqiao\n97D3\than\n97D4\tchang\n97D5\tkuo\n97D6\trou\n97D7\tyun\n97D8\tshe\n97D9\twei\n97DA\tge\n97DB\tbai\n97DC\ttao\n97DD\tgou\n97DE\tyun\n97DF\tgao\n97E0\tbi\n97E1\twei\n97E2\tsui\n97E3\tdu\n97E4\twa\n97E5\tdu\n97E6\twei\n97E7\tren\n97E8\tfu\n97E9\than\n97EA\twei\n97EB\tyun\n97EC\ttao\n97ED\tjiu\n97EE\tjiu\n97EF\txian\n97F0\txie\n97F1\txian\n97F2\tji\n97F3\tyin\n97F4\tza\n97F5\tyun\n97F6\tshao\n97F7\tle\n97F8\tpeng\n97F9\thuang\n97FA\tying\n97FB\tyun\n97FC\tpeng\n97FD\tan\n97FE\tyin\n97FF\txiang\n9800\thu\n9801\tye\n9802\tding\n9803\tqing\n9804\tkui\n9805\txiang\n9806\tshun\n9807\than\n9808\txu\n9809\tyi\n980A\txu\n980B\te\n980C\tsong\n980D\tkui\n980E\tqi\n980F\thang\n9810\tyu\n9811\twan\n9812\tban\n9813\tdun\n9814\tdi\n9815\tdan\n9816\tpan\n9817\tpo\n9818\tling\n9819\tche\n981A\tjing\n981B\tlei\n981C\the\n981D\tqiao\n981E\te\n981F\te\n9820\twei\n9821\txie\n9822\tkuo\n9823\tshen\n9824\tyi\n9825\tyi\n9826\thai\n9827\tdui\n9828\tyu\n9829\tping\n982A\tlei\n982B\tfu\n982C\tjia\n982D\ttou\n982E\thui\n982F\tkui\n9830\tjia\n9831\tluo\n9832\tting\n9833\tcheng\n9834\tying\n9835\tyun\n9836\thu\n9837\than\n9838\tjing\n9839\ttui\n983A\ttui\n983B\tpin\n983C\tlai\n983D\ttui\n983E\tzi\n983F\tzi\n9840\tchui\n9841\tding\n9842\tlai\n9843\ttan\n9844\than\n9845\tqian\n9846\tke\n9847\tcui\n9848\txuan\n9849\tqin\n984A\tyi\n984B\tsai\n984C\tti\n984D\te\n984E\te\n984F\tyan\n9850\twen\n9851\tkan\n9852\tyong\n9853\tzhuan\n9854\tyan\n9855\txian\n9856\txin\n9857\tyi\n9858\tyuan\n9859\tsang\n985A\tdian\n985B\tdian\n985C\tjiang\n985D\tkui\n985E\tlei\n985F\tlao\n9860\tpiao\n9861\twai\n9862\tman\n9863\tcu\n9864\tyao\n9865\thao\n9866\tqiao\n9867\tgu\n9868\txun\n9869\tyan\n986A\thui\n986B\tchan\n986C\tru\n986D\tmeng\n986E\tbin\n986F\txian\n9870\tpin\n9871\tlu\n9872\tlan\n9873\tnie\n9874\tquan\n9875\tye\n9876\tding\n9877\tqing\n9878\than\n9879\txiang\n987A\tshun\n987B\txu\n987C\txu\n987D\twan\n987E\tgu\n987F\tdun\n9880\tqi\n9881\tban\n9882\tsong\n9883\thang\n9884\tyu\n9885\tlu\n9886\tling\n9887\tpo\n9888\tjing\n9889\tjie\n988A\tjia\n988B\tting\n988C\the\n988D\tying\n988E\tjiong\n988F\tke\n9890\tyi\n9891\tpin\n9892\thui\n9893\ttui\n9894\than\n9895\tying\n9896\tying\n9897\tke\n9898\tti\n9899\tyong\n989A\te\n989B\tzhuan\n989C\tyan\n989D\te\n989E\tnie\n989F\tman\n98A0\tdian\n98A1\tsang\n98A2\thao\n98A3\tlei\n98A4\tchan\n98A5\tru\n98A6\tpin\n98A7\tquan\n98A8\tfeng\n98A9\tbiao\n98AA\tgua\n98AB\tfu\n98AC\txia\n98AD\tzhan\n98AE\tbiao\n98AF\tsa\n98B0\tba\n98B1\ttai\n98B2\tlie\n98B3\tgua\n98B4\txuan\n98B5\tshao\n98B6\tju\n98B7\tbiao\n98B8\tsi\n98B9\twei\n98BA\tyang\n98BB\tyao\n98BC\tsou\n98BD\tkai\n98BE\tsou\n98BF\tfan\n98C0\tliu\n98C1\txi\n98C2\tliu\n98C3\tpiao\n98C4\tpiao\n98C5\tliu\n98C6\tbiao\n98C7\tbiao\n98C8\tbiao\n98C9\tliao\n98CA\tbiao\n98CB\tse\n98CC\tfeng\n98CD\txiu\n98CE\tfeng\n98CF\tyang\n98D0\tzhan\n98D1\tbiao\n98D2\tsa\n98D3\tju\n98D4\tsi\n98D5\tsou\n98D6\tyao\n98D7\tliu\n98D8\tpiao\n98D9\tbiao\n98DA\tbiao\n98DB\tfei\n98DC\tfan\n98DD\tfei\n98DE\tfei\n98DF\tshi\n98E0\tshi\n98E1\tcan\n98E2\tji\n98E3\tding\n98E4\tsi\n98E5\ttuo\n98E6\tzhan\n98E7\tsun\n98E8\txiang\n98E9\ttun\n98EA\tren\n98EB\tyu\n98EC\tjuan\n98ED\tchi\n98EE\tyin\n98EF\tfan\n98F0\tfan\n98F1\tsun\n98F2\tyin\n98F3\ttou\n98F4\tyi\n98F5\tzuo\n98F6\tbi\n98F7\tjie\n98F8\ttao\n98F9\tbao\n98FA\tci\n98FB\ttie\n98FC\tsi\n98FD\tbao\n98FE\tshi\n98FF\tduo\n9900\thai\n9901\tren\n9902\ttian\n9903\tjiao\n9904\tjia\n9905\tbing\n9906\tyao\n9907\ttong\n9908\tci\n9909\txiang\n990A\tyang\n990B\tjuan\n990C\ter\n990D\tyan\n990E\tle\n990F\txi\n9910\tcan\n9911\tbo\n9912\tnei\n9913\te\n9914\tbu\n9915\tjun\n9916\tdou\n9917\tsu\n9918\tyu\n9919\tshi\n991A\tyao\n991B\thun\n991C\tguo\n991D\tshi\n991E\tjian\n991F\tzhui\n9920\tbing\n9921\txian\n9922\tbu\n9923\tye\n9924\ttan\n9925\tfei\n9926\tzhang\n9927\twei\n9928\tguan\n9929\te\n992A\tnuan\n992B\tyun\n992C\thu\n992D\thuang\n992E\ttie\n992F\thui\n9930\tjian\n9931\thou\n9932\tai\n9933\ttang\n9934\tfen\n9935\twei\n9936\tgu\n9937\tcha\n9938\tsong\n9939\ttang\n993A\tbo\n993B\tgao\n993C\txi\n993D\tkui\n993E\tliu\n993F\tsou\n9940\ttao\n9941\tye\n9942\twen\n9943\tmo\n9944\ttang\n9945\tman\n9946\tbi\n9947\tyu\n9948\txiu\n9949\tjin\n994A\tsan\n994B\tkui\n994C\tzhuan\n994D\tshan\n994E\tchi\n994F\tdan\n9950\tyi\n9951\tji\n9952\trao\n9953\tcheng\n9954\tyong\n9955\ttao\n9956\twei\n9957\txiang\n9958\tzhan\n9959\tfen\n995A\thai\n995B\tmeng\n995C\tyan\n995D\tmo\n995E\tchan\n995F\txiang\n9960\tluo\n9961\tzan\n9962\tnang\n9963\tshi\n9964\tding\n9965\tji\n9966\ttuo\n9967\txing\n9968\ttun\n9969\txi\n996A\tren\n996B\tyu\n996C\tchi\n996D\tfan\n996E\tyin\n996F\tjian\n9970\tshi\n9971\tbao\n9972\tsi\n9973\tduo\n9974\tyi\n9975\ter\n9976\trao\n9977\txiang\n9978\the\n9979\tle\n997A\tjiao\n997B\txi\n997C\tbing\n997D\tbo\n997E\tdou\n997F\te\n9980\tyu\n9981\tnei\n9982\tjun\n9983\tguo\n9984\thun\n9985\txian\n9986\tguan\n9987\tcha\n9988\tkui\n9989\tgu\n998A\tsou\n998B\tchan\n998C\tye\n998D\tmo\n998E\tbo\n998F\tliu\n9990\txiu\n9991\tjin\n9992\tman\n9993\tsan\n9994\tzhuan\n9995\tnang\n9996\tshou\n9997\tkui\n9998\tguo\n9999\txiang\n999A\tfen\n999B\tbo\n999C\tni\n999D\tbi\n999E\tbo\n999F\ttu\n99A0\than\n99A1\tfei\n99A2\tjian\n99A3\tan\n99A4\tai\n99A5\tfu\n99A6\txian\n99A7\tyun\n99A8\txin\n99A9\tfen\n99AA\tpin\n99AB\txin\n99AC\tma\n99AD\tyu\n99AE\tfeng\n99AF\than\n99B0\tdi\n99B1\ttuo\n99B2\tzhe\n99B3\tchi\n99B4\txun\n99B5\tzhu\n99B6\tzhi\n99B7\tpei\n99B8\txin\n99B9\tri\n99BA\tsa\n99BB\tyun\n99BC\twen\n99BD\tzhi\n99BE\tdan\n99BF\tlu\n99C0\tyou\n99C1\tbo\n99C2\tbao\n99C3\tjue\n99C4\ttuo\n99C5\tyi\n99C6\tqu\n99C7\twen\n99C8\tqu\n99C9\tjiong\n99CA\tpo\n99CB\tzhao\n99CC\tyuan\n99CD\tpei\n99CE\tzhou\n99CF\tju\n99D0\tzhu\n99D1\tnu\n99D2\tju\n99D3\tpi\n99D4\tzang\n99D5\tjia\n99D6\tling\n99D7\tzhen\n99D8\ttai\n99D9\tfu\n99DA\tyang\n99DB\tshi\n99DC\tbi\n99DD\ttuo\n99DE\ttuo\n99DF\tsi\n99E0\tliu\n99E1\tma\n99E2\tpian\n99E3\ttao\n99E4\tzhi\n99E5\trong\n99E6\tteng\n99E7\tdong\n99E8\txun\n99E9\tquan\n99EA\tshen\n99EB\tjiong\n99EC\ter\n99ED\thai\n99EE\tbo\n99EF\tzhu\n99F0\tyin\n99F1\tluo\n99F2\tzhou\n99F3\tdan\n99F4\thai\n99F5\tliu\n99F6\tju\n99F7\tsong\n99F8\tqin\n99F9\tmang\n99FA\tlang\n99FB\than\n99FC\ttu\n99FD\txuan\n99FE\ttui\n99FF\tjun\n9A00\te\n9A01\tcheng\n9A02\txing\n9A03\tai\n9A04\tlu\n9A05\tzhui\n9A06\tzhou\n9A07\tshe\n9A08\tpian\n9A09\tkun\n9A0A\ttao\n9A0B\tlai\n9A0C\tzong\n9A0D\tke\n9A0E\tqi\n9A0F\tqi\n9A10\tyan\n9A11\tfei\n9A12\tsao\n9A13\tyan\n9A14\tge\n9A15\tyao\n9A16\twu\n9A17\tpian\n9A18\tcong\n9A19\tpian\n9A1A\tqian\n9A1B\tfei\n9A1C\thuang\n9A1D\tqian\n9A1E\thuo\n9A1F\tyu\n9A20\tti\n9A21\tquan\n9A22\txia\n9A23\tzong\n9A24\tkui\n9A25\trou\n9A26\tsi\n9A27\tgua\n9A28\ttuo\n9A29\tgui\n9A2A\tsou\n9A2B\tqian\n9A2C\tcheng\n9A2D\tzhi\n9A2E\tliu\n9A2F\tpeng\n9A30\tteng\n9A31\txi\n9A32\tcao\n9A33\tdu\n9A34\tyan\n9A35\tyuan\n9A36\tzou\n9A37\tsao\n9A38\tshan\n9A39\tqi\n9A3A\tzhi\n9A3B\tshuang\n9A3C\tlu\n9A3D\txi\n9A3E\tluo\n9A3F\tzhang\n9A40\tmo\n9A41\tao\n9A42\tcan\n9A43\tbiao\n9A44\tcong\n9A45\tqu\n9A46\tbi\n9A47\tzhi\n9A48\tyu\n9A49\txu\n9A4A\thua\n9A4B\tbo\n9A4C\tsu\n9A4D\txiao\n9A4E\tlin\n9A4F\tzhan\n9A50\tdun\n9A51\tliu\n9A52\ttuo\n9A53\tceng\n9A54\tdian\n9A55\tjiao\n9A56\ttie\n9A57\tyan\n9A58\tluo\n9A59\tzhan\n9A5A\tjing\n9A5B\tyi\n9A5C\tye\n9A5D\ttuo\n9A5E\tpin\n9A5F\tzhou\n9A60\tyan\n9A61\tlong\n9A62\tlu\n9A63\tteng\n9A64\txiang\n9A65\tji\n9A66\tshuang\n9A67\tju\n9A68\txi\n9A69\thuan\n9A6A\tli\n9A6B\tbiao\n9A6C\tma\n9A6D\tyu\n9A6E\ttuo\n9A6F\txun\n9A70\tchi\n9A71\tqu\n9A72\tri\n9A73\tbo\n9A74\tlu\n9A75\tzang\n9A76\tshi\n9A77\tsi\n9A78\tfu\n9A79\tju\n9A7A\tzou\n9A7B\tzhu\n9A7C\ttuo\n9A7D\tnu\n9A7E\tjia\n9A7F\tyi\n9A80\tdai\n9A81\txiao\n9A82\tma\n9A83\tyin\n9A84\tjiao\n9A85\thua\n9A86\tluo\n9A87\thai\n9A88\tpian\n9A89\tbiao\n9A8A\tli\n9A8B\tcheng\n9A8C\tyan\n9A8D\txing\n9A8E\tqin\n9A8F\tjun\n9A90\tqi\n9A91\tqi\n9A92\tke\n9A93\tzhui\n9A94\tzong\n9A95\tsu\n9A96\tcan\n9A97\tpian\n9A98\tzhi\n9A99\tkui\n9A9A\tsao\n9A9B\twu\n9A9C\tao\n9A9D\tliu\n9A9E\tqian\n9A9F\tshan\n9AA0\tbiao\n9AA1\tluo\n9AA2\tcong\n9AA3\tchan\n9AA4\tzhou\n9AA5\tji\n9AA6\tshuang\n9AA7\txiang\n9AA8\tgu\n9AA9\twei\n9AAA\twei\n9AAB\twei\n9AAC\tyu\n9AAD\tgan\n9AAE\tyi\n9AAF\tang\n9AB0\ttou\n9AB1\tjie\n9AB2\tbao\n9AB3\tbei\n9AB4\tci\n9AB5\tti\n9AB6\tdi\n9AB7\tku\n9AB8\thai\n9AB9\tqiao\n9ABA\thou\n9ABB\tkua\n9ABC\tge\n9ABD\ttui\n9ABE\tgeng\n9ABF\tpian\n9AC0\tbi\n9AC1\tke\n9AC2\tqia\n9AC3\tyu\n9AC4\tsui\n9AC5\tlou\n9AC6\tbo\n9AC7\txiao\n9AC8\tbang\n9AC9\tbo\n9ACA\tci\n9ACB\tkuan\n9ACC\tbin\n9ACD\tmo\n9ACE\tliao\n9ACF\tlou\n9AD0\txiao\n9AD1\tdu\n9AD2\tzang\n9AD3\tsui\n9AD4\tti\n9AD5\tbin\n9AD6\tkuan\n9AD7\tlu\n9AD8\tgao\n9AD9\tgao\n9ADA\tqiao\n9ADB\tkao\n9ADC\tqiao\n9ADD\tlao\n9ADE\tsao\n9ADF\tbiao\n9AE0\tkun\n9AE1\tkun\n9AE2\tdi\n9AE3\tfang\n9AE4\txiu\n9AE5\tran\n9AE6\tmao\n9AE7\tdan\n9AE8\tkun\n9AE9\tbin\n9AEA\tfa\n9AEB\ttiao\n9AEC\tpi\n9AED\tzi\n9AEE\tfa\n9AEF\tran\n9AF0\tti\n9AF1\tbao\n9AF2\tbi\n9AF3\tmao\n9AF4\tfu\n9AF5\ter\n9AF6\trong\n9AF7\tqu\n9AF8\tgong\n9AF9\txiu\n9AFA\tkuo\n9AFB\tji\n9AFC\tpeng\n9AFD\tzhua\n9AFE\tshao\n9AFF\tsuo\n9B00\tti\n9B01\tli\n9B02\tbin\n9B03\tzong\n9B04\tdi\n9B05\tpeng\n9B06\tsong\n9B07\tzheng\n9B08\tquan\n9B09\tzong\n9B0A\tshun\n9B0B\tjian\n9B0C\ttuo\n9B0D\thu\n9B0E\tla\n9B0F\tjiu\n9B10\tqi\n9B11\tlian\n9B12\tzhen\n9B13\tbin\n9B14\tpeng\n9B15\tma\n9B16\tsan\n9B17\tman\n9B18\tman\n9B19\tseng\n9B1A\txu\n9B1B\tlie\n9B1C\tqian\n9B1D\tqian\n9B1E\tnang\n9B1F\thuan\n9B20\tkuo\n9B21\tning\n9B22\tbin\n9B23\tlie\n9B24\trang\n9B25\tdou\n9B26\tdou\n9B27\tnao\n9B28\thong\n9B29\txi\n9B2A\tdou\n9B2B\than\n9B2C\tdou\n9B2D\tdou\n9B2E\tjiu\n9B2F\tchang\n9B30\tyu\n9B31\tyu\n9B32\tge\n9B33\tyan\n9B34\tfu\n9B35\tqin\n9B36\tgui\n9B37\tzong\n9B38\tliu\n9B39\tgui\n9B3A\tshang\n9B3B\tyu\n9B3C\tgui\n9B3D\tmei\n9B3E\tji\n9B3F\tqi\n9B40\tga\n9B41\tkui\n9B42\thun\n9B43\tba\n9B44\tpo\n9B45\tmei\n9B46\txu\n9B47\tyan\n9B48\txiao\n9B49\tliang\n9B4A\tyu\n9B4B\ttui\n9B4C\tqi\n9B4D\twang\n9B4E\tliang\n9B4F\twei\n9B50\tgan\n9B51\tchi\n9B52\tpiao\n9B53\tbi\n9B54\tmo\n9B55\tji\n9B56\txu\n9B57\tchou\n9B58\tyan\n9B59\tzhan\n9B5A\tyu\n9B5B\tdao\n9B5C\tren\n9B5D\tjie\n9B5E\tba\n9B5F\thong\n9B60\ttuo\n9B61\tdiao\n9B62\tji\n9B63\txu\n9B64\te\n9B65\te\n9B66\tsha\n9B67\thang\n9B68\ttun\n9B69\tmo\n9B6A\tjie\n9B6B\tshen\n9B6C\tban\n9B6D\tyuan\n9B6E\tpi\n9B6F\tlu\n9B70\twen\n9B71\thu\n9B72\tlu\n9B73\tza\n9B74\tfang\n9B75\tfen\n9B76\tna\n9B77\tyou\n9B78\tpian\n9B79\tmo\n9B7A\the\n9B7B\txia\n9B7C\tqu\n9B7D\than\n9B7E\tpi\n9B7F\tling\n9B80\ttuo\n9B81\tbo\n9B82\tqiu\n9B83\tping\n9B84\tfu\n9B85\tbi\n9B86\tci\n9B87\twei\n9B88\tju\n9B89\tdiao\n9B8A\tba\n9B8B\tyou\n9B8C\tgun\n9B8D\tpi\n9B8E\tnian\n9B8F\txing\n9B90\ttai\n9B91\tbao\n9B92\tfu\n9B93\tzha\n9B94\tju\n9B95\tgu\n9B96\tshi\n9B97\tdong\n9B98\tdai\n9B99\tta\n9B9A\tjie\n9B9B\tshu\n9B9C\thou\n9B9D\txiang\n9B9E\ter\n9B9F\tan\n9BA0\twei\n9BA1\tzhao\n9BA2\tzhu\n9BA3\tyin\n9BA4\tlie\n9BA5\tluo\n9BA6\ttong\n9BA7\tti\n9BA8\tyi\n9BA9\tbing\n9BAA\twei\n9BAB\tjiao\n9BAC\tku\n9BAD\tgui\n9BAE\txian\n9BAF\tge\n9BB0\thui\n9BB1\tlao\n9BB2\tfu\n9BB3\tkao\n9BB4\txiu\n9BB5\tduo\n9BB6\tjun\n9BB7\tti\n9BB8\tmian\n9BB9\tshao\n9BBA\tzha\n9BBB\tsuo\n9BBC\tqin\n9BBD\tyu\n9BBE\tnei\n9BBF\tzhe\n9BC0\tgun\n9BC1\tgeng\n9BC2\tsu\n9BC3\twu\n9BC4\tqiu\n9BC5\tshan\n9BC6\tpu\n9BC7\thuan\n9BC8\ttiao\n9BC9\tli\n9BCA\tsha\n9BCB\tsha\n9BCC\tkao\n9BCD\tmeng\n9BCE\tcheng\n9BCF\tli\n9BD0\tzou\n9BD1\txi\n9BD2\tyong\n9BD3\tshen\n9BD4\tzi\n9BD5\tqi\n9BD6\tzheng\n9BD7\txiang\n9BD8\tnei\n9BD9\tchun\n9BDA\tji\n9BDB\tdiao\n9BDC\tqie\n9BDD\tgu\n9BDE\tzhou\n9BDF\tdong\n9BE0\tlai\n9BE1\tfei\n9BE2\tni\n9BE3\tyi\n9BE4\tkun\n9BE5\tlu\n9BE6\tjiu\n9BE7\tchang\n9BE8\tjing\n9BE9\tlun\n9BEA\tling\n9BEB\tzou\n9BEC\tli\n9BED\tmeng\n9BEE\tzong\n9BEF\tzhi\n9BF0\tnian\n9BF1\thu\n9BF2\tyu\n9BF3\tdi\n9BF4\tshi\n9BF5\tshen\n9BF6\thuan\n9BF7\tti\n9BF8\thou\n9BF9\txing\n9BFA\tzhu\n9BFB\tla\n9BFC\tzong\n9BFD\tzei\n9BFE\tbian\n9BFF\tbian\n9C00\thuan\n9C01\tquan\n9C02\tzei\n9C03\twei\n9C04\twei\n9C05\tyu\n9C06\tchun\n9C07\trou\n9C08\tdie\n9C09\thuang\n9C0A\tlian\n9C0B\tyan\n9C0C\tqiu\n9C0D\tqiu\n9C0E\tjian\n9C0F\tbi\n9C10\te\n9C11\tyang\n9C12\tfu\n9C13\tsai\n9C14\tgan\n9C15\txia\n9C16\ttuo\n9C17\thu\n9C18\tshi\n9C19\truo\n9C1A\txuan\n9C1B\twen\n9C1C\tqian\n9C1D\thao\n9C1E\twu\n9C1F\tfang\n9C20\tsao\n9C21\tliu\n9C22\tma\n9C23\tshi\n9C24\tshi\n9C25\tguan\n9C26\tzi\n9C27\tteng\n9C28\tta\n9C29\tyao\n9C2A\te\n9C2B\tyong\n9C2C\tqian\n9C2D\tqi\n9C2E\twen\n9C2F\truo\n9C30\tshen\n9C31\tlian\n9C32\tao\n9C33\tle\n9C34\thui\n9C35\tmin\n9C36\tji\n9C37\ttiao\n9C38\tqu\n9C39\tjian\n9C3A\tshen\n9C3B\tman\n9C3C\txi\n9C3D\tqiu\n9C3E\tbiao\n9C3F\tji\n9C40\tji\n9C41\tzhu\n9C42\tjiang\n9C43\txiu\n9C44\tzhuan\n9C45\tyong\n9C46\tzhang\n9C47\tkang\n9C48\txue\n9C49\tbie\n9C4A\tyu\n9C4B\tqu\n9C4C\txiang\n9C4D\tbo\n9C4E\tjiao\n9C4F\txun\n9C50\tsu\n9C51\thuang\n9C52\tzun\n9C53\tshan\n9C54\tshan\n9C55\tfan\n9C56\tgui\n9C57\tlin\n9C58\txun\n9C59\tmiao\n9C5A\txi\n9C5B\tzeng\n9C5C\txiang\n9C5D\tfen\n9C5E\tguan\n9C5F\thou\n9C60\tkuai\n9C61\tzei\n9C62\tsao\n9C63\tzhan\n9C64\tgan\n9C65\tgui\n9C66\tying\n9C67\tli\n9C68\tchang\n9C69\tlei\n9C6A\tshu\n9C6B\tai\n9C6C\tru\n9C6D\tji\n9C6E\txu\n9C6F\thu\n9C70\tshu\n9C71\tli\n9C72\tlie\n9C73\tli\n9C74\tmie\n9C75\tzhen\n9C76\txiang\n9C77\te\n9C78\tlu\n9C79\tguan\n9C7A\tli\n9C7B\txian\n9C7C\tyu\n9C7D\tdao\n9C7E\tji\n9C7F\tyou\n9C80\ttun\n9C81\tlu\n9C82\tfang\n9C83\tba\n9C84\the\n9C85\tba\n9C86\tping\n9C87\tnian\n9C88\tlu\n9C89\tyou\n9C8A\tzha\n9C8B\tfu\n9C8C\tbo\n9C8D\tbao\n9C8E\thou\n9C8F\tpi\n9C90\ttai\n9C91\tgui\n9C92\tjie\n9C93\tkao\n9C94\twei\n9C95\ter\n9C96\ttong\n9C97\tzei\n9C98\thou\n9C99\tkuai\n9C9A\tji\n9C9B\tjiao\n9C9C\txian\n9C9D\tzha\n9C9E\txiang\n9C9F\txun\n9CA0\tgeng\n9CA1\tli\n9CA2\tlian\n9CA3\tjian\n9CA4\tli\n9CA5\tshi\n9CA6\ttiao\n9CA7\tgun\n9CA8\tsha\n9CA9\thuan\n9CAA\tjun\n9CAB\tji\n9CAC\tyong\n9CAD\tqing\n9CAE\tling\n9CAF\tqi\n9CB0\tzou\n9CB1\tfei\n9CB2\tkun\n9CB3\tchang\n9CB4\tgu\n9CB5\tni\n9CB6\tnian\n9CB7\tdiao\n9CB8\tjing\n9CB9\tshen\n9CBA\tshi\n9CBB\tzi\n9CBC\tfen\n9CBD\tdie\n9CBE\tbi\n9CBF\tchang\n9CC0\tti\n9CC1\twen\n9CC2\twei\n9CC3\tsai\n9CC4\te\n9CC5\tqiu\n9CC6\tfu\n9CC7\thuang\n9CC8\tquan\n9CC9\tjiang\n9CCA\tbian\n9CCB\tsao\n9CCC\tao\n9CCD\tqi\n9CCE\tta\n9CCF\tguan\n9CD0\tyao\n9CD1\tpang\n9CD2\tjian\n9CD3\tle\n9CD4\tbiao\n9CD5\txue\n9CD6\tbie\n9CD7\tman\n9CD8\tmin\n9CD9\tyong\n9CDA\twei\n9CDB\txi\n9CDC\tgui\n9CDD\tshan\n9CDE\tlin\n9CDF\tzun\n9CE0\thu\n9CE1\tgan\n9CE2\tli\n9CE3\tzhan\n9CE4\tguan\n9CE5\tniao\n9CE6\tyi\n9CE7\tfu\n9CE8\tli\n9CE9\tjiu\n9CEA\tbu\n9CEB\tyan\n9CEC\tfu\n9CED\tdiao\n9CEE\tji\n9CEF\tfeng\n9CF0\tru\n9CF1\tgan\n9CF2\tshi\n9CF3\tfeng\n9CF4\tming\n9CF5\tbao\n9CF6\tyuan\n9CF7\tzhi\n9CF8\thu\n9CF9\tqin\n9CFA\tfu\n9CFB\tban\n9CFC\twen\n9CFD\tjian\n9CFE\tshi\n9CFF\tyu\n9D00\tfou\n9D01\tyao\n9D02\tjue\n9D03\tjue\n9D04\tpi\n9D05\thuan\n9D06\tzhen\n9D07\tbao\n9D08\tyan\n9D09\tya\n9D0A\tzheng\n9D0B\tfang\n9D0C\tfeng\n9D0D\twen\n9D0E\tou\n9D0F\tdai\n9D10\tge\n9D11\tru\n9D12\tling\n9D13\tmie\n9D14\tfu\n9D15\ttuo\n9D16\tmin\n9D17\tli\n9D18\tbian\n9D19\tzhi\n9D1A\tge\n9D1B\tyuan\n9D1C\tci\n9D1D\tqu\n9D1E\txiao\n9D1F\tchi\n9D20\tdan\n9D21\tju\n9D22\tyao\n9D23\tgu\n9D24\tzhong\n9D25\tyu\n9D26\tyang\n9D27\tyu\n9D28\tya\n9D29\ttie\n9D2A\tyu\n9D2B\ttian\n9D2C\tying\n9D2D\tdui\n9D2E\twu\n9D2F\ter\n9D30\tgua\n9D31\tai\n9D32\tzhi\n9D33\tyan\n9D34\theng\n9D35\txiao\n9D36\tjia\n9D37\tlie\n9D38\tzhu\n9D39\tyang\n9D3A\tti\n9D3B\thong\n9D3C\tluo\n9D3D\tru\n9D3E\tmou\n9D3F\tge\n9D40\tren\n9D41\tjiao\n9D42\txiu\n9D43\tzhou\n9D44\tchi\n9D45\tluo\n9D46\theng\n9D47\tnian\n9D48\te\n9D49\tluan\n9D4A\tjia\n9D4B\tji\n9D4C\ttu\n9D4D\thuan\n9D4E\ttuo\n9D4F\tbu\n9D50\twu\n9D51\tjuan\n9D52\tyu\n9D53\tbo\n9D54\tjun\n9D55\tjun\n9D56\tbi\n9D57\txi\n9D58\tjun\n9D59\tju\n9D5A\ttu\n9D5B\tjing\n9D5C\tti\n9D5D\te\n9D5E\te\n9D5F\tkuang\n9D60\thu\n9D61\twu\n9D62\tshen\n9D63\tlai\n9D64\tjiao\n9D65\tpan\n9D66\tlu\n9D67\tpi\n9D68\tshu\n9D69\tfu\n9D6A\tan\n9D6B\tzhuo\n9D6C\tpeng\n9D6D\tqin\n9D6E\tqian\n9D6F\tbei\n9D70\tdiao\n9D71\tlu\n9D72\tque\n9D73\tjian\n9D74\tju\n9D75\ttu\n9D76\tya\n9D77\tyuan\n9D78\tqi\n9D79\tli\n9D7A\tye\n9D7B\tzhui\n9D7C\tkong\n9D7D\tduo\n9D7E\tkun\n9D7F\tsheng\n9D80\tqi\n9D81\tjing\n9D82\tyi\n9D83\tyi\n9D84\tjing\n9D85\tzi\n9D86\tlai\n9D87\tdong\n9D88\tqi\n9D89\tchun\n9D8A\tgeng\n9D8B\tju\n9D8C\tjue\n9D8D\tyi\n9D8E\tzun\n9D8F\tji\n9D90\tshu\n9D91\tying\n9D92\tchi\n9D93\tmiao\n9D94\trou\n9D95\tan\n9D96\tqiu\n9D97\tti\n9D98\thu\n9D99\tti\n9D9A\te\n9D9B\tjie\n9D9C\tmao\n9D9D\tfu\n9D9E\tchun\n9D9F\ttu\n9DA0\tyan\n9DA1\the\n9DA2\tyuan\n9DA3\tpian\n9DA4\tkun\n9DA5\tmei\n9DA6\thu\n9DA7\tying\n9DA8\tchuan\n9DA9\twu\n9DAA\tju\n9DAB\tdong\n9DAC\tcang\n9DAD\tfang\n9DAE\the\n9DAF\tying\n9DB0\tyuan\n9DB1\txian\n9DB2\tweng\n9DB3\tshi\n9DB4\the\n9DB5\tchu\n9DB6\ttang\n9DB7\txia\n9DB8\truo\n9DB9\tliu\n9DBA\tji\n9DBB\tgu\n9DBC\tjian\n9DBD\tsun\n9DBE\than\n9DBF\tci\n9DC0\tci\n9DC1\tyi\n9DC2\tyao\n9DC3\tyan\n9DC4\tji\n9DC5\tli\n9DC6\ttian\n9DC7\tkou\n9DC8\tti\n9DC9\tti\n9DCA\tyi\n9DCB\ttu\n9DCC\tma\n9DCD\txiao\n9DCE\tgao\n9DCF\ttian\n9DD0\tchen\n9DD1\tji\n9DD2\ttuan\n9DD3\tzhe\n9DD4\tao\n9DD5\tyao\n9DD6\tyi\n9DD7\tou\n9DD8\tchi\n9DD9\tzhi\n9DDA\tliu\n9DDB\tyong\n9DDC\tlu\n9DDD\tbi\n9DDE\tshuang\n9DDF\tzhuo\n9DE0\tyu\n9DE1\twu\n9DE2\tjue\n9DE3\tyin\n9DE4\tti\n9DE5\tsi\n9DE6\tjiao\n9DE7\tyi\n9DE8\thua\n9DE9\tbi\n9DEA\tying\n9DEB\tsu\n9DEC\thuang\n9DED\tfan\n9DEE\tjiao\n9DEF\tliao\n9DF0\tyan\n9DF1\tgao\n9DF2\tjiu\n9DF3\txian\n9DF4\txian\n9DF5\ttu\n9DF6\tmai\n9DF7\tzun\n9DF8\tyu\n9DF9\tying\n9DFA\tlu\n9DFB\ttuan\n9DFC\txian\n9DFD\txue\n9DFE\tyi\n9DFF\tpi\n9E00\tshu\n9E01\tluo\n9E02\txi\n9E03\tyi\n9E04\tji\n9E05\tze\n9E06\tyu\n9E07\tzhan\n9E08\tye\n9E09\tyang\n9E0A\tpi\n9E0B\tning\n9E0C\thu\n9E0D\tmi\n9E0E\tying\n9E0F\tmeng\n9E10\tdi\n9E11\tyue\n9E12\tyu\n9E13\tlei\n9E14\tbu\n9E15\tlu\n9E16\the\n9E17\tlong\n9E18\tshuang\n9E19\tyue\n9E1A\tying\n9E1B\tguan\n9E1C\tqu\n9E1D\tli\n9E1E\tluan\n9E1F\tniao\n9E20\tjiu\n9E21\tji\n9E22\tyuan\n9E23\tming\n9E24\tshi\n9E25\tou\n9E26\tya\n9E27\tcang\n9E28\tbao\n9E29\tzhen\n9E2A\tgu\n9E2B\tdong\n9E2C\tlu\n9E2D\tya\n9E2E\txiao\n9E2F\tyang\n9E30\tling\n9E31\tchi\n9E32\tqu\n9E33\tyuan\n9E34\txue\n9E35\ttuo\n9E36\tsi\n9E37\tzhi\n9E38\ter\n9E39\tgua\n9E3A\txiu\n9E3B\theng\n9E3C\tzhou\n9E3D\tge\n9E3E\tluan\n9E3F\thong\n9E40\twu\n9E41\tbo\n9E42\tli\n9E43\tjuan\n9E44\tgu\n9E45\te\n9E46\tyu\n9E47\txian\n9E48\tti\n9E49\twu\n9E4A\tque\n9E4B\tmiao\n9E4C\tan\n9E4D\tkun\n9E4E\tbei\n9E4F\tpeng\n9E50\tqian\n9E51\tchun\n9E52\tgeng\n9E53\tyuan\n9E54\tsu\n9E55\thu\n9E56\the\n9E57\te\n9E58\tgu\n9E59\tqiu\n9E5A\tci\n9E5B\tmei\n9E5C\twu\n9E5D\tyi\n9E5E\tyao\n9E5F\tweng\n9E60\tliu\n9E61\tji\n9E62\tyi\n9E63\tjian\n9E64\the\n9E65\tyi\n9E66\tying\n9E67\tzhe\n9E68\tliu\n9E69\tliao\n9E6A\tjiao\n9E6B\tjiu\n9E6C\tyu\n9E6D\tlu\n9E6E\thuan\n9E6F\tzhan\n9E70\tying\n9E71\thu\n9E72\tmeng\n9E73\tguan\n9E74\tshuang\n9E75\tlu\n9E76\tjin\n9E77\tling\n9E78\tjian\n9E79\txian\n9E7A\tcuo\n9E7B\tjian\n9E7C\tjian\n9E7D\tyan\n9E7E\tcuo\n9E7F\tlu\n9E80\tyou\n9E81\tcu\n9E82\tji\n9E83\tpao\n9E84\tcu\n9E85\tpao\n9E86\tzhu\n9E87\tjun\n9E88\tzhu\n9E89\tjian\n9E8A\tmi\n9E8B\tmi\n9E8C\tyu\n9E8D\tliu\n9E8E\tchen\n9E8F\tjun\n9E90\tlin\n9E91\tni\n9E92\tqi\n9E93\tlu\n9E94\tjiu\n9E95\tjun\n9E96\tjing\n9E97\tli\n9E98\txiang\n9E99\txian\n9E9A\tjia\n9E9B\tmi\n9E9C\tli\n9E9D\tshe\n9E9E\tzhang\n9E9F\tlin\n9EA0\tjing\n9EA1\tqi\n9EA2\tling\n9EA3\tyan\n9EA4\tcu\n9EA5\tmai\n9EA6\tmai\n9EA7\the\n9EA8\tchao\n9EA9\tfu\n9EAA\tmian\n9EAB\tmian\n9EAC\tfu\n9EAD\tpao\n9EAE\tqu\n9EAF\tqu\n9EB0\tmou\n9EB1\tfu\n9EB2\txian\n9EB3\tlai\n9EB4\tqu\n9EB5\tmian\n9EB6\tchi\n9EB7\tfeng\n9EB8\tfu\n9EB9\tqu\n9EBA\tmian\n9EBB\tma\n9EBC\tme\n9EBD\tmo\n9EBE\thui\n9EBF\tmo\n9EC0\tzou\n9EC1\tnun\n9EC2\tfen\n9EC3\thuang\n9EC4\thuang\n9EC5\tjin\n9EC6\tguang\n9EC7\ttian\n9EC8\ttou\n9EC9\thong\n9ECA\thua\n9ECB\tkuang\n9ECC\thong\n9ECD\tshu\n9ECE\tli\n9ECF\tnian\n9ED0\tchi\n9ED1\thei\n9ED2\thei\n9ED3\tyi\n9ED4\tqian\n9ED5\tdan\n9ED6\txi\n9ED7\ttun\n9ED8\tmo\n9ED9\tmo\n9EDA\tqian\n9EDB\tdai\n9EDC\tchu\n9EDD\tyou\n9EDE\tdian\n9EDF\tyi\n9EE0\txia\n9EE1\tyan\n9EE2\tqu\n9EE3\tmei\n9EE4\tyan\n9EE5\tqing\n9EE6\tyue\n9EE7\tli\n9EE8\tdang\n9EE9\tdu\n9EEA\tcan\n9EEB\tyan\n9EEC\tyan\n9EED\tyan\n9EEE\tdan\n9EEF\tan\n9EF0\tzhen\n9EF1\tdai\n9EF2\tcan\n9EF3\tyi\n9EF4\tmei\n9EF5\tzhan\n9EF6\tyan\n9EF7\tdu\n9EF8\tlu\n9EF9\tzhi\n9EFA\tfen\n9EFB\tfu\n9EFC\tfu\n9EFD\tmian\n9EFE\tmin\n9EFF\tyuan\n9F00\tcu\n9F01\tqu\n9F02\tchao\n9F03\twa\n9F04\tzhu\n9F05\tzhi\n9F06\tmeng\n9F07\tao\n9F08\tbie\n9F09\ttuo\n9F0A\tbi\n9F0B\tyuan\n9F0C\tchao\n9F0D\ttuo\n9F0E\tding\n9F0F\tmi\n9F10\tnai\n9F11\tding\n9F12\tzi\n9F13\tgu\n9F14\tgu\n9F15\tdong\n9F16\tfen\n9F17\ttao\n9F18\tyuan\n9F19\tpi\n9F1A\tchang\n9F1B\tgao\n9F1C\tqi\n9F1D\tyuan\n9F1E\ttang\n9F1F\tteng\n9F20\tshu\n9F21\tshu\n9F22\tfen\n9F23\tfei\n9F24\twen\n9F25\tba\n9F26\tdiao\n9F27\ttuo\n9F28\tzhong\n9F29\tqu\n9F2A\tsheng\n9F2B\tshi\n9F2C\tyou\n9F2D\tshi\n9F2E\tting\n9F2F\twu\n9F30\tju\n9F31\tjing\n9F32\thun\n9F33\tju\n9F34\tyan\n9F35\ttu\n9F36\tsi\n9F37\txi\n9F38\txian\n9F39\tyan\n9F3A\tlei\n9F3B\tbi\n9F3C\tyao\n9F3D\tqiu\n9F3E\than\n9F3F\twu\n9F40\twu\n9F41\thou\n9F42\txie\n9F43\te\n9F44\tzha\n9F45\txiu\n9F46\tweng\n9F47\tzha\n9F48\tnong\n9F49\tnang\n9F4A\tqi\n9F4B\tzhai\n9F4C\tji\n9F4D\tzi\n9F4E\tji\n9F4F\tji\n9F50\tqi\n9F51\tji\n9F52\tchi\n9F53\tchen\n9F54\tchen\n9F55\the\n9F56\tya\n9F57\tyin\n9F58\txie\n9F59\tbao\n9F5A\tze\n9F5B\txie\n9F5C\tchai\n9F5D\tchi\n9F5E\tyan\n9F5F\tju\n9F60\ttiao\n9F61\tling\n9F62\tling\n9F63\tchu\n9F64\tquan\n9F65\txie\n9F66\tken\n9F67\tnie\n9F68\tjiu\n9F69\tyao\n9F6A\tchuo\n9F6B\tyun\n9F6C\tyu\n9F6D\tchu\n9F6E\tyi\n9F6F\tni\n9F70\tze\n9F71\tzou\n9F72\tqu\n9F73\tyun\n9F74\tyan\n9F75\tou\n9F76\te\n9F77\two\n9F78\tyi\n9F79\tci\n9F7A\tzou\n9F7B\tdian\n9F7C\tchu\n9F7D\tjin\n9F7E\tya\n9F7F\tchi\n9F80\tchen\n9F81\the\n9F82\tyin\n9F83\tju\n9F84\tling\n9F85\tbao\n9F86\ttiao\n9F87\tzi\n9F88\tyin\n9F89\tyu\n9F8A\tchuo\n9F8B\tqu\n9F8C\two\n9F8D\tlong\n9F8E\tpang\n9F8F\tgong\n9F90\tpang\n9F91\tyan\n9F92\tlong\n9F93\tlong\n9F94\tgong\n9F95\tkan\n9F96\tda\n9F97\tling\n9F98\tda\n9F99\tlong\n9F9A\tgong\n9F9B\tkan\n9F9C\tgui\n9F9D\tqiu\n9F9E\tbie\n9F9F\tgui\n9FA0\tyue\n9FA1\tchui\n9FA2\the\n9FA3\tjue\n9FA4\txie\n9FA5\tyu\n9FAA\tzhan\n9FAC\twang\n9FB0\tzou\n9FB5\tshou\n9FBB\tluan\n9FC3\tshan\n9FC4\tliang\n9FC7\tzheng\n9FCC\tliang\n9FCD\tgang\n9FCE\tta\n9FCF\tmai\n9FD4\tge\n9FD5\tdan\n9FEB\tao\n9FEC\ttian\n9FED\tni\n9FF0\than\n9FF1\tba\n9FF2\tlao\n9FF3\ttuo\n9FF4\tdong\n9FF5\tzhi\n9FF6\tlang\n9FF7\tan\n9FF8\ttuo\n9FF9\tmi\n9FFA\tmai\n9FFB\tbu\n9FFC\tjia\n9FFE\tlang\n9FFF\txing\nAC00\tga\nAC01\tgag\nAC02\tgakk\nAC03\tgags\nAC04\tgan\nAC05\tganj\nAC06\tganh\nAC07\tgad\nAC08\tgal\nAC09\tgalg\nAC0A\tgalm\nAC0B\tgalb\nAC0C\tgals\nAC0D\tgalt\nAC0E\tgalp\nAC0F\tgalh\nAC10\tgam\nAC11\tgab\nAC12\tgabs\nAC13\tgas\nAC14\tgass\nAC15\tgang\nAC16\tgaj\nAC17\tgach\nAC18\tgak\nAC19\tgat\nAC1A\tgap\nAC1B\tgah\nAC1C\tgae\nAC1D\tgaeg\nAC1E\tgaekk\nAC1F\tgaegs\nAC20\tgaen\nAC21\tgaenj\nAC22\tgaenh\nAC23\tgaed\nAC24\tgael\nAC25\tgaelg\nAC26\tgaelm\nAC27\tgaelb\nAC28\tgaels\nAC29\tgaelt\nAC2A\tgaelp\nAC2B\tgaelh\nAC2C\tgaem\nAC2D\tgaeb\nAC2E\tgaebs\nAC2F\tgaes\nAC30\tgaess\nAC31\tgaeng\nAC32\tgaej\nAC33\tgaech\nAC34\tgaek\nAC35\tgaet\nAC36\tgaep\nAC37\tgaeh\nAC38\tgya\nAC39\tgyag\nAC3A\tgyakk\nAC3B\tgyags\nAC3C\tgyan\nAC3D\tgyanj\nAC3E\tgyanh\nAC3F\tgyad\nAC40\tgyal\nAC41\tgyalg\nAC42\tgyalm\nAC43\tgyalb\nAC44\tgyals\nAC45\tgyalt\nAC46\tgyalp\nAC47\tgyalh\nAC48\tgyam\nAC49\tgyab\nAC4A\tgyabs\nAC4B\tgyas\nAC4C\tgyass\nAC4D\tgyang\nAC4E\tgyaj\nAC4F\tgyach\nAC50\tgyak\nAC51\tgyat\nAC52\tgyap\nAC53\tgyah\nAC54\tgyae\nAC55\tgyaeg\nAC56\tgyaekk\nAC57\tgyaegs\nAC58\tgyaen\nAC59\tgyaenj\nAC5A\tgyaenh\nAC5B\tgyaed\nAC5C\tgyael\nAC5D\tgyaelg\nAC5E\tgyaelm\nAC5F\tgyaelb\nAC60\tgyaels\nAC61\tgyaelt\nAC62\tgyaelp\nAC63\tgyaelh\nAC64\tgyaem\nAC65\tgyaeb\nAC66\tgyaebs\nAC67\tgyaes\nAC68\tgyaess\nAC69\tgyaeng\nAC6A\tgyaej\nAC6B\tgyaech\nAC6C\tgyaek\nAC6D\tgyaet\nAC6E\tgyaep\nAC6F\tgyaeh\nAC70\tgeo\nAC71\tgeog\nAC72\tgeokk\nAC73\tgeogs\nAC74\tgeon\nAC75\tgeonj\nAC76\tgeonh\nAC77\tgeod\nAC78\tgeol\nAC79\tgeolg\nAC7A\tgeolm\nAC7B\tgeolb\nAC7C\tgeols\nAC7D\tgeolt\nAC7E\tgeolp\nAC7F\tgeolh\nAC80\tgeom\nAC81\tgeob\nAC82\tgeobs\nAC83\tgeos\nAC84\tgeoss\nAC85\tgeong\nAC86\tgeoj\nAC87\tgeoch\nAC88\tgeok\nAC89\tgeot\nAC8A\tgeop\nAC8B\tgeoh\nAC8C\tge\nAC8D\tgeg\nAC8E\tgekk\nAC8F\tgegs\nAC90\tgen\nAC91\tgenj\nAC92\tgenh\nAC93\tged\nAC94\tgel\nAC95\tgelg\nAC96\tgelm\nAC97\tgelb\nAC98\tgels\nAC99\tgelt\nAC9A\tgelp\nAC9B\tgelh\nAC9C\tgem\nAC9D\tgeb\nAC9E\tgebs\nAC9F\tges\nACA0\tgess\nACA1\tgeng\nACA2\tgej\nACA3\tgech\nACA4\tgek\nACA5\tget\nACA6\tgep\nACA7\tgeh\nACA8\tgyeo\nACA9\tgyeog\nACAA\tgyeokk\nACAB\tgyeogs\nACAC\tgyeon\nACAD\tgyeonj\nACAE\tgyeonh\nACAF\tgyeod\nACB0\tgyeol\nACB1\tgyeolg\nACB2\tgyeolm\nACB3\tgyeolb\nACB4\tgyeols\nACB5\tgyeolt\nACB6\tgyeolp\nACB7\tgyeolh\nACB8\tgyeom\nACB9\tgyeob\nACBA\tgyeobs\nACBB\tgyeos\nACBC\tgyeoss\nACBD\tgyeong\nACBE\tgyeoj\nACBF\tgyeoch\nACC0\tgyeok\nACC1\tgyeot\nACC2\tgyeop\nACC3\tgyeoh\nACC4\tgye\nACC5\tgyeg\nACC6\tgyekk\nACC7\tgyegs\nACC8\tgyen\nACC9\tgyenj\nACCA\tgyenh\nACCB\tgyed\nACCC\tgyel\nACCD\tgyelg\nACCE\tgyelm\nACCF\tgyelb\nACD0\tgyels\nACD1\tgyelt\nACD2\tgyelp\nACD3\tgyelh\nACD4\tgyem\nACD5\tgyeb\nACD6\tgyebs\nACD7\tgyes\nACD8\tgyess\nACD9\tgyeng\nACDA\tgyej\nACDB\tgyech\nACDC\tgyek\nACDD\tgyet\nACDE\tgyep\nACDF\tgyeh\nACE0\tgo\nACE1\tgog\nACE2\tgokk\nACE3\tgogs\nACE4\tgon\nACE5\tgonj\nACE6\tgonh\nACE7\tgod\nACE8\tgol\nACE9\tgolg\nACEA\tgolm\nACEB\tgolb\nACEC\tgols\nACED\tgolt\nACEE\tgolp\nACEF\tgolh\nACF0\tgom\nACF1\tgob\nACF2\tgobs\nACF3\tgos\nACF4\tgoss\nACF5\tgong\nACF6\tgoj\nACF7\tgoch\nACF8\tgok\nACF9\tgot\nACFA\tgop\nACFB\tgoh\nACFC\tgwa\nACFD\tgwag\nACFE\tgwakk\nACFF\tgwags\nAD00\tgwan\nAD01\tgwanj\nAD02\tgwanh\nAD03\tgwad\nAD04\tgwal\nAD05\tgwalg\nAD06\tgwalm\nAD07\tgwalb\nAD08\tgwals\nAD09\tgwalt\nAD0A\tgwalp\nAD0B\tgwalh\nAD0C\tgwam\nAD0D\tgwab\nAD0E\tgwabs\nAD0F\tgwas\nAD10\tgwass\nAD11\tgwang\nAD12\tgwaj\nAD13\tgwach\nAD14\tgwak\nAD15\tgwat\nAD16\tgwap\nAD17\tgwah\nAD18\tgwae\nAD19\tgwaeg\nAD1A\tgwaekk\nAD1B\tgwaegs\nAD1C\tgwaen\nAD1D\tgwaenj\nAD1E\tgwaenh\nAD1F\tgwaed\nAD20\tgwael\nAD21\tgwaelg\nAD22\tgwaelm\nAD23\tgwaelb\nAD24\tgwaels\nAD25\tgwaelt\nAD26\tgwaelp\nAD27\tgwaelh\nAD28\tgwaem\nAD29\tgwaeb\nAD2A\tgwaebs\nAD2B\tgwaes\nAD2C\tgwaess\nAD2D\tgwaeng\nAD2E\tgwaej\nAD2F\tgwaech\nAD30\tgwaek\nAD31\tgwaet\nAD32\tgwaep\nAD33\tgwaeh\nAD34\tgoe\nAD35\tgoeg\nAD36\tgoekk\nAD37\tgoegs\nAD38\tgoen\nAD39\tgoenj\nAD3A\tgoenh\nAD3B\tgoed\nAD3C\tgoel\nAD3D\tgoelg\nAD3E\tgoelm\nAD3F\tgoelb\nAD40\tgoels\nAD41\tgoelt\nAD42\tgoelp\nAD43\tgoelh\nAD44\tgoem\nAD45\tgoeb\nAD46\tgoebs\nAD47\tgoes\nAD48\tgoess\nAD49\tgoeng\nAD4A\tgoej\nAD4B\tgoech\nAD4C\tgoek\nAD4D\tgoet\nAD4E\tgoep\nAD4F\tgoeh\nAD50\tgyo\nAD51\tgyog\nAD52\tgyokk\nAD53\tgyogs\nAD54\tgyon\nAD55\tgyonj\nAD56\tgyonh\nAD57\tgyod\nAD58\tgyol\nAD59\tgyolg\nAD5A\tgyolm\nAD5B\tgyolb\nAD5C\tgyols\nAD5D\tgyolt\nAD5E\tgyolp\nAD5F\tgyolh\nAD60\tgyom\nAD61\tgyob\nAD62\tgyobs\nAD63\tgyos\nAD64\tgyoss\nAD65\tgyong\nAD66\tgyoj\nAD67\tgyoch\nAD68\tgyok\nAD69\tgyot\nAD6A\tgyop\nAD6B\tgyoh\nAD6C\tgu\nAD6D\tgug\nAD6E\tgukk\nAD6F\tgugs\nAD70\tgun\nAD71\tgunj\nAD72\tgunh\nAD73\tgud\nAD74\tgul\nAD75\tgulg\nAD76\tgulm\nAD77\tgulb\nAD78\tguls\nAD79\tgult\nAD7A\tgulp\nAD7B\tgulh\nAD7C\tgum\nAD7D\tgub\nAD7E\tgubs\nAD7F\tgus\nAD80\tguss\nAD81\tgung\nAD82\tguj\nAD83\tguch\nAD84\tguk\nAD85\tgut\nAD86\tgup\nAD87\tguh\nAD88\tgwo\nAD89\tgwog\nAD8A\tgwokk\nAD8B\tgwogs\nAD8C\tgwon\nAD8D\tgwonj\nAD8E\tgwonh\nAD8F\tgwod\nAD90\tgwol\nAD91\tgwolg\nAD92\tgwolm\nAD93\tgwolb\nAD94\tgwols\nAD95\tgwolt\nAD96\tgwolp\nAD97\tgwolh\nAD98\tgwom\nAD99\tgwob\nAD9A\tgwobs\nAD9B\tgwos\nAD9C\tgwoss\nAD9D\tgwong\nAD9E\tgwoj\nAD9F\tgwoch\nADA0\tgwok\nADA1\tgwot\nADA2\tgwop\nADA3\tgwoh\nADA4\tgwe\nADA5\tgweg\nADA6\tgwekk\nADA7\tgwegs\nADA8\tgwen\nADA9\tgwenj\nADAA\tgwenh\nADAB\tgwed\nADAC\tgwel\nADAD\tgwelg\nADAE\tgwelm\nADAF\tgwelb\nADB0\tgwels\nADB1\tgwelt\nADB2\tgwelp\nADB3\tgwelh\nADB4\tgwem\nADB5\tgweb\nADB6\tgwebs\nADB7\tgwes\nADB8\tgwess\nADB9\tgweng\nADBA\tgwej\nADBB\tgwech\nADBC\tgwek\nADBD\tgwet\nADBE\tgwep\nADBF\tgweh\nADC0\tgwi\nADC1\tgwig\nADC2\tgwikk\nADC3\tgwigs\nADC4\tgwin\nADC5\tgwinj\nADC6\tgwinh\nADC7\tgwid\nADC8\tgwil\nADC9\tgwilg\nADCA\tgwilm\nADCB\tgwilb\nADCC\tgwils\nADCD\tgwilt\nADCE\tgwilp\nADCF\tgwilh\nADD0\tgwim\nADD1\tgwib\nADD2\tgwibs\nADD3\tgwis\nADD4\tgwiss\nADD5\tgwing\nADD6\tgwij\nADD7\tgwich\nADD8\tgwik\nADD9\tgwit\nADDA\tgwip\nADDB\tgwih\nADDC\tgyu\nADDD\tgyug\nADDE\tgyukk\nADDF\tgyugs\nADE0\tgyun\nADE1\tgyunj\nADE2\tgyunh\nADE3\tgyud\nADE4\tgyul\nADE5\tgyulg\nADE6\tgyulm\nADE7\tgyulb\nADE8\tgyuls\nADE9\tgyult\nADEA\tgyulp\nADEB\tgyulh\nADEC\tgyum\nADED\tgyub\nADEE\tgyubs\nADEF\tgyus\nADF0\tgyuss\nADF1\tgyung\nADF2\tgyuj\nADF3\tgyuch\nADF4\tgyuk\nADF5\tgyut\nADF6\tgyup\nADF7\tgyuh\nADF8\tgeu\nADF9\tgeug\nADFA\tgeukk\nADFB\tgeugs\nADFC\tgeun\nADFD\tgeunj\nADFE\tgeunh\nADFF\tgeud\nAE00\tgeul\nAE01\tgeulg\nAE02\tgeulm\nAE03\tgeulb\nAE04\tgeuls\nAE05\tgeult\nAE06\tgeulp\nAE07\tgeulh\nAE08\tgeum\nAE09\tgeub\nAE0A\tgeubs\nAE0B\tgeus\nAE0C\tgeuss\nAE0D\tgeung\nAE0E\tgeuj\nAE0F\tgeuch\nAE10\tgeuk\nAE11\tgeut\nAE12\tgeup\nAE13\tgeuh\nAE14\tgui\nAE15\tguig\nAE16\tguikk\nAE17\tguigs\nAE18\tguin\nAE19\tguinj\nAE1A\tguinh\nAE1B\tguid\nAE1C\tguil\nAE1D\tguilg\nAE1E\tguilm\nAE1F\tguilb\nAE20\tguils\nAE21\tguilt\nAE22\tguilp\nAE23\tguilh\nAE24\tguim\nAE25\tguib\nAE26\tguibs\nAE27\tguis\nAE28\tguiss\nAE29\tguing\nAE2A\tguij\nAE2B\tguich\nAE2C\tguik\nAE2D\tguit\nAE2E\tguip\nAE2F\tguih\nAE30\tgi\nAE31\tgig\nAE32\tgikk\nAE33\tgigs\nAE34\tgin\nAE35\tginj\nAE36\tginh\nAE37\tgid\nAE38\tgil\nAE39\tgilg\nAE3A\tgilm\nAE3B\tgilb\nAE3C\tgils\nAE3D\tgilt\nAE3E\tgilp\nAE3F\tgilh\nAE40\tgim\nAE41\tgib\nAE42\tgibs\nAE43\tgis\nAE44\tgiss\nAE45\tging\nAE46\tgij\nAE47\tgich\nAE48\tgik\nAE49\tgit\nAE4A\tgip\nAE4B\tgih\nAE4C\tkka\nAE4D\tkkag\nAE4E\tkkakk\nAE4F\tkkags\nAE50\tkkan\nAE51\tkkanj\nAE52\tkkanh\nAE53\tkkad\nAE54\tkkal\nAE55\tkkalg\nAE56\tkkalm\nAE57\tkkalb\nAE58\tkkals\nAE59\tkkalt\nAE5A\tkkalp\nAE5B\tkkalh\nAE5C\tkkam\nAE5D\tkkab\nAE5E\tkkabs\nAE5F\tkkas\nAE60\tkkass\nAE61\tkkang\nAE62\tkkaj\nAE63\tkkach\nAE64\tkkak\nAE65\tkkat\nAE66\tkkap\nAE67\tkkah\nAE68\tkkae\nAE69\tkkaeg\nAE6A\tkkaekk\nAE6B\tkkaegs\nAE6C\tkkaen\nAE6D\tkkaenj\nAE6E\tkkaenh\nAE6F\tkkaed\nAE70\tkkael\nAE71\tkkaelg\nAE72\tkkaelm\nAE73\tkkaelb\nAE74\tkkaels\nAE75\tkkaelt\nAE76\tkkaelp\nAE77\tkkaelh\nAE78\tkkaem\nAE79\tkkaeb\nAE7A\tkkaebs\nAE7B\tkkaes\nAE7C\tkkaess\nAE7D\tkkaeng\nAE7E\tkkaej\nAE7F\tkkaech\nAE80\tkkaek\nAE81\tkkaet\nAE82\tkkaep\nAE83\tkkaeh\nAE84\tkkya\nAE85\tkkyag\nAE86\tkkyakk\nAE87\tkkyags\nAE88\tkkyan\nAE89\tkkyanj\nAE8A\tkkyanh\nAE8B\tkkyad\nAE8C\tkkyal\nAE8D\tkkyalg\nAE8E\tkkyalm\nAE8F\tkkyalb\nAE90\tkkyals\nAE91\tkkyalt\nAE92\tkkyalp\nAE93\tkkyalh\nAE94\tkkyam\nAE95\tkkyab\nAE96\tkkyabs\nAE97\tkkyas\nAE98\tkkyass\nAE99\tkkyang\nAE9A\tkkyaj\nAE9B\tkkyach\nAE9C\tkkyak\nAE9D\tkkyat\nAE9E\tkkyap\nAE9F\tkkyah\nAEA0\tkkyae\nAEA1\tkkyaeg\nAEA2\tkkyaekk\nAEA3\tkkyaegs\nAEA4\tkkyaen\nAEA5\tkkyaenj\nAEA6\tkkyaenh\nAEA7\tkkyaed\nAEA8\tkkyael\nAEA9\tkkyaelg\nAEAA\tkkyaelm\nAEAB\tkkyaelb\nAEAC\tkkyaels\nAEAD\tkkyaelt\nAEAE\tkkyaelp\nAEAF\tkkyaelh\nAEB0\tkkyaem\nAEB1\tkkyaeb\nAEB2\tkkyaebs\nAEB3\tkkyaes\nAEB4\tkkyaess\nAEB5\tkkyaeng\nAEB6\tkkyaej\nAEB7\tkkyaech\nAEB8\tkkyaek\nAEB9\tkkyaet\nAEBA\tkkyaep\nAEBB\tkkyaeh\nAEBC\tkkeo\nAEBD\tkkeog\nAEBE\tkkeokk\nAEBF\tkkeogs\nAEC0\tkkeon\nAEC1\tkkeonj\nAEC2\tkkeonh\nAEC3\tkkeod\nAEC4\tkkeol\nAEC5\tkkeolg\nAEC6\tkkeolm\nAEC7\tkkeolb\nAEC8\tkkeols\nAEC9\tkkeolt\nAECA\tkkeolp\nAECB\tkkeolh\nAECC\tkkeom\nAECD\tkkeob\nAECE\tkkeobs\nAECF\tkkeos\nAED0\tkkeoss\nAED1\tkkeong\nAED2\tkkeoj\nAED3\tkkeoch\nAED4\tkkeok\nAED5\tkkeot\nAED6\tkkeop\nAED7\tkkeoh\nAED8\tkke\nAED9\tkkeg\nAEDA\tkkekk\nAEDB\tkkegs\nAEDC\tkken\nAEDD\tkkenj\nAEDE\tkkenh\nAEDF\tkked\nAEE0\tkkel\nAEE1\tkkelg\nAEE2\tkkelm\nAEE3\tkkelb\nAEE4\tkkels\nAEE5\tkkelt\nAEE6\tkkelp\nAEE7\tkkelh\nAEE8\tkkem\nAEE9\tkkeb\nAEEA\tkkebs\nAEEB\tkkes\nAEEC\tkkess\nAEED\tkkeng\nAEEE\tkkej\nAEEF\tkkech\nAEF0\tkkek\nAEF1\tkket\nAEF2\tkkep\nAEF3\tkkeh\nAEF4\tkkyeo\nAEF5\tkkyeog\nAEF6\tkkyeokk\nAEF7\tkkyeogs\nAEF8\tkkyeon\nAEF9\tkkyeonj\nAEFA\tkkyeonh\nAEFB\tkkyeod\nAEFC\tkkyeol\nAEFD\tkkyeolg\nAEFE\tkkyeolm\nAEFF\tkkyeolb\nAF00\tkkyeols\nAF01\tkkyeolt\nAF02\tkkyeolp\nAF03\tkkyeolh\nAF04\tkkyeom\nAF05\tkkyeob\nAF06\tkkyeobs\nAF07\tkkyeos\nAF08\tkkyeoss\nAF09\tkkyeong\nAF0A\tkkyeoj\nAF0B\tkkyeoch\nAF0C\tkkyeok\nAF0D\tkkyeot\nAF0E\tkkyeop\nAF0F\tkkyeoh\nAF10\tkkye\nAF11\tkkyeg\nAF12\tkkyekk\nAF13\tkkyegs\nAF14\tkkyen\nAF15\tkkyenj\nAF16\tkkyenh\nAF17\tkkyed\nAF18\tkkyel\nAF19\tkkyelg\nAF1A\tkkyelm\nAF1B\tkkyelb\nAF1C\tkkyels\nAF1D\tkkyelt\nAF1E\tkkyelp\nAF1F\tkkyelh\nAF20\tkkyem\nAF21\tkkyeb\nAF22\tkkyebs\nAF23\tkkyes\nAF24\tkkyess\nAF25\tkkyeng\nAF26\tkkyej\nAF27\tkkyech\nAF28\tkkyek\nAF29\tkkyet\nAF2A\tkkyep\nAF2B\tkkyeh\nAF2C\tkko\nAF2D\tkkog\nAF2E\tkkokk\nAF2F\tkkogs\nAF30\tkkon\nAF31\tkkonj\nAF32\tkkonh\nAF33\tkkod\nAF34\tkkol\nAF35\tkkolg\nAF36\tkkolm\nAF37\tkkolb\nAF38\tkkols\nAF39\tkkolt\nAF3A\tkkolp\nAF3B\tkkolh\nAF3C\tkkom\nAF3D\tkkob\nAF3E\tkkobs\nAF3F\tkkos\nAF40\tkkoss\nAF41\tkkong\nAF42\tkkoj\nAF43\tkkoch\nAF44\tkkok\nAF45\tkkot\nAF46\tkkop\nAF47\tkkoh\nAF48\tkkwa\nAF49\tkkwag\nAF4A\tkkwakk\nAF4B\tkkwags\nAF4C\tkkwan\nAF4D\tkkwanj\nAF4E\tkkwanh\nAF4F\tkkwad\nAF50\tkkwal\nAF51\tkkwalg\nAF52\tkkwalm\nAF53\tkkwalb\nAF54\tkkwals\nAF55\tkkwalt\nAF56\tkkwalp\nAF57\tkkwalh\nAF58\tkkwam\nAF59\tkkwab\nAF5A\tkkwabs\nAF5B\tkkwas\nAF5C\tkkwass\nAF5D\tkkwang\nAF5E\tkkwaj\nAF5F\tkkwach\nAF60\tkkwak\nAF61\tkkwat\nAF62\tkkwap\nAF63\tkkwah\nAF64\tkkwae\nAF65\tkkwaeg\nAF66\tkkwaekk\nAF67\tkkwaegs\nAF68\tkkwaen\nAF69\tkkwaenj\nAF6A\tkkwaenh\nAF6B\tkkwaed\nAF6C\tkkwael\nAF6D\tkkwaelg\nAF6E\tkkwaelm\nAF6F\tkkwaelb\nAF70\tkkwaels\nAF71\tkkwaelt\nAF72\tkkwaelp\nAF73\tkkwaelh\nAF74\tkkwaem\nAF75\tkkwaeb\nAF76\tkkwaebs\nAF77\tkkwaes\nAF78\tkkwaess\nAF79\tkkwaeng\nAF7A\tkkwaej\nAF7B\tkkwaech\nAF7C\tkkwaek\nAF7D\tkkwaet\nAF7E\tkkwaep\nAF7F\tkkwaeh\nAF80\tkkoe\nAF81\tkkoeg\nAF82\tkkoekk\nAF83\tkkoegs\nAF84\tkkoen\nAF85\tkkoenj\nAF86\tkkoenh\nAF87\tkkoed\nAF88\tkkoel\nAF89\tkkoelg\nAF8A\tkkoelm\nAF8B\tkkoelb\nAF8C\tkkoels\nAF8D\tkkoelt\nAF8E\tkkoelp\nAF8F\tkkoelh\nAF90\tkkoem\nAF91\tkkoeb\nAF92\tkkoebs\nAF93\tkkoes\nAF94\tkkoess\nAF95\tkkoeng\nAF96\tkkoej\nAF97\tkkoech\nAF98\tkkoek\nAF99\tkkoet\nAF9A\tkkoep\nAF9B\tkkoeh\nAF9C\tkkyo\nAF9D\tkkyog\nAF9E\tkkyokk\nAF9F\tkkyogs\nAFA0\tkkyon\nAFA1\tkkyonj\nAFA2\tkkyonh\nAFA3\tkkyod\nAFA4\tkkyol\nAFA5\tkkyolg\nAFA6\tkkyolm\nAFA7\tkkyolb\nAFA8\tkkyols\nAFA9\tkkyolt\nAFAA\tkkyolp\nAFAB\tkkyolh\nAFAC\tkkyom\nAFAD\tkkyob\nAFAE\tkkyobs\nAFAF\tkkyos\nAFB0\tkkyoss\nAFB1\tkkyong\nAFB2\tkkyoj\nAFB3\tkkyoch\nAFB4\tkkyok\nAFB5\tkkyot\nAFB6\tkkyop\nAFB7\tkkyoh\nAFB8\tkku\nAFB9\tkkug\nAFBA\tkkukk\nAFBB\tkkugs\nAFBC\tkkun\nAFBD\tkkunj\nAFBE\tkkunh\nAFBF\tkkud\nAFC0\tkkul\nAFC1\tkkulg\nAFC2\tkkulm\nAFC3\tkkulb\nAFC4\tkkuls\nAFC5\tkkult\nAFC6\tkkulp\nAFC7\tkkulh\nAFC8\tkkum\nAFC9\tkkub\nAFCA\tkkubs\nAFCB\tkkus\nAFCC\tkkuss\nAFCD\tkkung\nAFCE\tkkuj\nAFCF\tkkuch\nAFD0\tkkuk\nAFD1\tkkut\nAFD2\tkkup\nAFD3\tkkuh\nAFD4\tkkwo\nAFD5\tkkwog\nAFD6\tkkwokk\nAFD7\tkkwogs\nAFD8\tkkwon\nAFD9\tkkwonj\nAFDA\tkkwonh\nAFDB\tkkwod\nAFDC\tkkwol\nAFDD\tkkwolg\nAFDE\tkkwolm\nAFDF\tkkwolb\nAFE0\tkkwols\nAFE1\tkkwolt\nAFE2\tkkwolp\nAFE3\tkkwolh\nAFE4\tkkwom\nAFE5\tkkwob\nAFE6\tkkwobs\nAFE7\tkkwos\nAFE8\tkkwoss\nAFE9\tkkwong\nAFEA\tkkwoj\nAFEB\tkkwoch\nAFEC\tkkwok\nAFED\tkkwot\nAFEE\tkkwop\nAFEF\tkkwoh\nAFF0\tkkwe\nAFF1\tkkweg\nAFF2\tkkwekk\nAFF3\tkkwegs\nAFF4\tkkwen\nAFF5\tkkwenj\nAFF6\tkkwenh\nAFF7\tkkwed\nAFF8\tkkwel\nAFF9\tkkwelg\nAFFA\tkkwelm\nAFFB\tkkwelb\nAFFC\tkkwels\nAFFD\tkkwelt\nAFFE\tkkwelp\nAFFF\tkkwelh\nB000\tkkwem\nB001\tkkweb\nB002\tkkwebs\nB003\tkkwes\nB004\tkkwess\nB005\tkkweng\nB006\tkkwej\nB007\tkkwech\nB008\tkkwek\nB009\tkkwet\nB00A\tkkwep\nB00B\tkkweh\nB00C\tkkwi\nB00D\tkkwig\nB00E\tkkwikk\nB00F\tkkwigs\nB010\tkkwin\nB011\tkkwinj\nB012\tkkwinh\nB013\tkkwid\nB014\tkkwil\nB015\tkkwilg\nB016\tkkwilm\nB017\tkkwilb\nB018\tkkwils\nB019\tkkwilt\nB01A\tkkwilp\nB01B\tkkwilh\nB01C\tkkwim\nB01D\tkkwib\nB01E\tkkwibs\nB01F\tkkwis\nB020\tkkwiss\nB021\tkkwing\nB022\tkkwij\nB023\tkkwich\nB024\tkkwik\nB025\tkkwit\nB026\tkkwip\nB027\tkkwih\nB028\tkkyu\nB029\tkkyug\nB02A\tkkyukk\nB02B\tkkyugs\nB02C\tkkyun\nB02D\tkkyunj\nB02E\tkkyunh\nB02F\tkkyud\nB030\tkkyul\nB031\tkkyulg\nB032\tkkyulm\nB033\tkkyulb\nB034\tkkyuls\nB035\tkkyult\nB036\tkkyulp\nB037\tkkyulh\nB038\tkkyum\nB039\tkkyub\nB03A\tkkyubs\nB03B\tkkyus\nB03C\tkkyuss\nB03D\tkkyung\nB03E\tkkyuj\nB03F\tkkyuch\nB040\tkkyuk\nB041\tkkyut\nB042\tkkyup\nB043\tkkyuh\nB044\tkkeu\nB045\tkkeug\nB046\tkkeukk\nB047\tkkeugs\nB048\tkkeun\nB049\tkkeunj\nB04A\tkkeunh\nB04B\tkkeud\nB04C\tkkeul\nB04D\tkkeulg\nB04E\tkkeulm\nB04F\tkkeulb\nB050\tkkeuls\nB051\tkkeult\nB052\tkkeulp\nB053\tkkeulh\nB054\tkkeum\nB055\tkkeub\nB056\tkkeubs\nB057\tkkeus\nB058\tkkeuss\nB059\tkkeung\nB05A\tkkeuj\nB05B\tkkeuch\nB05C\tkkeuk\nB05D\tkkeut\nB05E\tkkeup\nB05F\tkkeuh\nB060\tkkui\nB061\tkkuig\nB062\tkkuikk\nB063\tkkuigs\nB064\tkkuin\nB065\tkkuinj\nB066\tkkuinh\nB067\tkkuid\nB068\tkkuil\nB069\tkkuilg\nB06A\tkkuilm\nB06B\tkkuilb\nB06C\tkkuils\nB06D\tkkuilt\nB06E\tkkuilp\nB06F\tkkuilh\nB070\tkkuim\nB071\tkkuib\nB072\tkkuibs\nB073\tkkuis\nB074\tkkuiss\nB075\tkkuing\nB076\tkkuij\nB077\tkkuich\nB078\tkkuik\nB079\tkkuit\nB07A\tkkuip\nB07B\tkkuih\nB07C\tkki\nB07D\tkkig\nB07E\tkkikk\nB07F\tkkigs\nB080\tkkin\nB081\tkkinj\nB082\tkkinh\nB083\tkkid\nB084\tkkil\nB085\tkkilg\nB086\tkkilm\nB087\tkkilb\nB088\tkkils\nB089\tkkilt\nB08A\tkkilp\nB08B\tkkilh\nB08C\tkkim\nB08D\tkkib\nB08E\tkkibs\nB08F\tkkis\nB090\tkkiss\nB091\tkking\nB092\tkkij\nB093\tkkich\nB094\tkkik\nB095\tkkit\nB096\tkkip\nB097\tkkih\nB098\tna\nB099\tnag\nB09A\tnakk\nB09B\tnags\nB09C\tnan\nB09D\tnanj\nB09E\tnanh\nB09F\tnad\nB0A0\tnal\nB0A1\tnalg\nB0A2\tnalm\nB0A3\tnalb\nB0A4\tnals\nB0A5\tnalt\nB0A6\tnalp\nB0A7\tnalh\nB0A8\tnam\nB0A9\tnab\nB0AA\tnabs\nB0AB\tnas\nB0AC\tnass\nB0AD\tnang\nB0AE\tnaj\nB0AF\tnach\nB0B0\tnak\nB0B1\tnat\nB0B2\tnap\nB0B3\tnah\nB0B4\tnae\nB0B5\tnaeg\nB0B6\tnaekk\nB0B7\tnaegs\nB0B8\tnaen\nB0B9\tnaenj\nB0BA\tnaenh\nB0BB\tnaed\nB0BC\tnael\nB0BD\tnaelg\nB0BE\tnaelm\nB0BF\tnaelb\nB0C0\tnaels\nB0C1\tnaelt\nB0C2\tnaelp\nB0C3\tnaelh\nB0C4\tnaem\nB0C5\tnaeb\nB0C6\tnaebs\nB0C7\tnaes\nB0C8\tnaess\nB0C9\tnaeng\nB0CA\tnaej\nB0CB\tnaech\nB0CC\tnaek\nB0CD\tnaet\nB0CE\tnaep\nB0CF\tnaeh\nB0D0\tnya\nB0D1\tnyag\nB0D2\tnyakk\nB0D3\tnyags\nB0D4\tnyan\nB0D5\tnyanj\nB0D6\tnyanh\nB0D7\tnyad\nB0D8\tnyal\nB0D9\tnyalg\nB0DA\tnyalm\nB0DB\tnyalb\nB0DC\tnyals\nB0DD\tnyalt\nB0DE\tnyalp\nB0DF\tnyalh\nB0E0\tnyam\nB0E1\tnyab\nB0E2\tnyabs\nB0E3\tnyas\nB0E4\tnyass\nB0E5\tnyang\nB0E6\tnyaj\nB0E7\tnyach\nB0E8\tnyak\nB0E9\tnyat\nB0EA\tnyap\nB0EB\tnyah\nB0EC\tnyae\nB0ED\tnyaeg\nB0EE\tnyaekk\nB0EF\tnyaegs\nB0F0\tnyaen\nB0F1\tnyaenj\nB0F2\tnyaenh\nB0F3\tnyaed\nB0F4\tnyael\nB0F5\tnyaelg\nB0F6\tnyaelm\nB0F7\tnyaelb\nB0F8\tnyaels\nB0F9\tnyaelt\nB0FA\tnyaelp\nB0FB\tnyaelh\nB0FC\tnyaem\nB0FD\tnyaeb\nB0FE\tnyaebs\nB0FF\tnyaes\nB100\tnyaess\nB101\tnyaeng\nB102\tnyaej\nB103\tnyaech\nB104\tnyaek\nB105\tnyaet\nB106\tnyaep\nB107\tnyaeh\nB108\tneo\nB109\tneog\nB10A\tneokk\nB10B\tneogs\nB10C\tneon\nB10D\tneonj\nB10E\tneonh\nB10F\tneod\nB110\tneol\nB111\tneolg\nB112\tneolm\nB113\tneolb\nB114\tneols\nB115\tneolt\nB116\tneolp\nB117\tneolh\nB118\tneom\nB119\tneob\nB11A\tneobs\nB11B\tneos\nB11C\tneoss\nB11D\tneong\nB11E\tneoj\nB11F\tneoch\nB120\tneok\nB121\tneot\nB122\tneop\nB123\tneoh\nB124\tne\nB125\tneg\nB126\tnekk\nB127\tnegs\nB128\tnen\nB129\tnenj\nB12A\tnenh\nB12B\tned\nB12C\tnel\nB12D\tnelg\nB12E\tnelm\nB12F\tnelb\nB130\tnels\nB131\tnelt\nB132\tnelp\nB133\tnelh\nB134\tnem\nB135\tneb\nB136\tnebs\nB137\tnes\nB138\tness\nB139\tneng\nB13A\tnej\nB13B\tnech\nB13C\tnek\nB13D\tnet\nB13E\tnep\nB13F\tneh\nB140\tnyeo\nB141\tnyeog\nB142\tnyeokk\nB143\tnyeogs\nB144\tnyeon\nB145\tnyeonj\nB146\tnyeonh\nB147\tnyeod\nB148\tnyeol\nB149\tnyeolg\nB14A\tnyeolm\nB14B\tnyeolb\nB14C\tnyeols\nB14D\tnyeolt\nB14E\tnyeolp\nB14F\tnyeolh\nB150\tnyeom\nB151\tnyeob\nB152\tnyeobs\nB153\tnyeos\nB154\tnyeoss\nB155\tnyeong\nB156\tnyeoj\nB157\tnyeoch\nB158\tnyeok\nB159\tnyeot\nB15A\tnyeop\nB15B\tnyeoh\nB15C\tnye\nB15D\tnyeg\nB15E\tnyekk\nB15F\tnyegs\nB160\tnyen\nB161\tnyenj\nB162\tnyenh\nB163\tnyed\nB164\tnyel\nB165\tnyelg\nB166\tnyelm\nB167\tnyelb\nB168\tnyels\nB169\tnyelt\nB16A\tnyelp\nB16B\tnyelh\nB16C\tnyem\nB16D\tnyeb\nB16E\tnyebs\nB16F\tnyes\nB170\tnyess\nB171\tnyeng\nB172\tnyej\nB173\tnyech\nB174\tnyek\nB175\tnyet\nB176\tnyep\nB177\tnyeh\nB178\tno\nB179\tnog\nB17A\tnokk\nB17B\tnogs\nB17C\tnon\nB17D\tnonj\nB17E\tnonh\nB17F\tnod\nB180\tnol\nB181\tnolg\nB182\tnolm\nB183\tnolb\nB184\tnols\nB185\tnolt\nB186\tnolp\nB187\tnolh\nB188\tnom\nB189\tnob\nB18A\tnobs\nB18B\tnos\nB18C\tnoss\nB18D\tnong\nB18E\tnoj\nB18F\tnoch\nB190\tnok\nB191\tnot\nB192\tnop\nB193\tnoh\nB194\tnwa\nB195\tnwag\nB196\tnwakk\nB197\tnwags\nB198\tnwan\nB199\tnwanj\nB19A\tnwanh\nB19B\tnwad\nB19C\tnwal\nB19D\tnwalg\nB19E\tnwalm\nB19F\tnwalb\nB1A0\tnwals\nB1A1\tnwalt\nB1A2\tnwalp\nB1A3\tnwalh\nB1A4\tnwam\nB1A5\tnwab\nB1A6\tnwabs\nB1A7\tnwas\nB1A8\tnwass\nB1A9\tnwang\nB1AA\tnwaj\nB1AB\tnwach\nB1AC\tnwak\nB1AD\tnwat\nB1AE\tnwap\nB1AF\tnwah\nB1B0\tnwae\nB1B1\tnwaeg\nB1B2\tnwaekk\nB1B3\tnwaegs\nB1B4\tnwaen\nB1B5\tnwaenj\nB1B6\tnwaenh\nB1B7\tnwaed\nB1B8\tnwael\nB1B9\tnwaelg\nB1BA\tnwaelm\nB1BB\tnwaelb\nB1BC\tnwaels\nB1BD\tnwaelt\nB1BE\tnwaelp\nB1BF\tnwaelh\nB1C0\tnwaem\nB1C1\tnwaeb\nB1C2\tnwaebs\nB1C3\tnwaes\nB1C4\tnwaess\nB1C5\tnwaeng\nB1C6\tnwaej\nB1C7\tnwaech\nB1C8\tnwaek\nB1C9\tnwaet\nB1CA\tnwaep\nB1CB\tnwaeh\nB1CC\tnoe\nB1CD\tnoeg\nB1CE\tnoekk\nB1CF\tnoegs\nB1D0\tnoen\nB1D1\tnoenj\nB1D2\tnoenh\nB1D3\tnoed\nB1D4\tnoel\nB1D5\tnoelg\nB1D6\tnoelm\nB1D7\tnoelb\nB1D8\tnoels\nB1D9\tnoelt\nB1DA\tnoelp\nB1DB\tnoelh\nB1DC\tnoem\nB1DD\tnoeb\nB1DE\tnoebs\nB1DF\tnoes\nB1E0\tnoess\nB1E1\tnoeng\nB1E2\tnoej\nB1E3\tnoech\nB1E4\tnoek\nB1E5\tnoet\nB1E6\tnoep\nB1E7\tnoeh\nB1E8\tnyo\nB1E9\tnyog\nB1EA\tnyokk\nB1EB\tnyogs\nB1EC\tnyon\nB1ED\tnyonj\nB1EE\tnyonh\nB1EF\tnyod\nB1F0\tnyol\nB1F1\tnyolg\nB1F2\tnyolm\nB1F3\tnyolb\nB1F4\tnyols\nB1F5\tnyolt\nB1F6\tnyolp\nB1F7\tnyolh\nB1F8\tnyom\nB1F9\tnyob\nB1FA\tnyobs\nB1FB\tnyos\nB1FC\tnyoss\nB1FD\tnyong\nB1FE\tnyoj\nB1FF\tnyoch\nB200\tnyok\nB201\tnyot\nB202\tnyop\nB203\tnyoh\nB204\tnu\nB205\tnug\nB206\tnukk\nB207\tnugs\nB208\tnun\nB209\tnunj\nB20A\tnunh\nB20B\tnud\nB20C\tnul\nB20D\tnulg\nB20E\tnulm\nB20F\tnulb\nB210\tnuls\nB211\tnult\nB212\tnulp\nB213\tnulh\nB214\tnum\nB215\tnub\nB216\tnubs\nB217\tnus\nB218\tnuss\nB219\tnung\nB21A\tnuj\nB21B\tnuch\nB21C\tnuk\nB21D\tnut\nB21E\tnup\nB21F\tnuh\nB220\tnwo\nB221\tnwog\nB222\tnwokk\nB223\tnwogs\nB224\tnwon\nB225\tnwonj\nB226\tnwonh\nB227\tnwod\nB228\tnwol\nB229\tnwolg\nB22A\tnwolm\nB22B\tnwolb\nB22C\tnwols\nB22D\tnwolt\nB22E\tnwolp\nB22F\tnwolh\nB230\tnwom\nB231\tnwob\nB232\tnwobs\nB233\tnwos\nB234\tnwoss\nB235\tnwong\nB236\tnwoj\nB237\tnwoch\nB238\tnwok\nB239\tnwot\nB23A\tnwop\nB23B\tnwoh\nB23C\tnwe\nB23D\tnweg\nB23E\tnwekk\nB23F\tnwegs\nB240\tnwen\nB241\tnwenj\nB242\tnwenh\nB243\tnwed\nB244\tnwel\nB245\tnwelg\nB246\tnwelm\nB247\tnwelb\nB248\tnwels\nB249\tnwelt\nB24A\tnwelp\nB24B\tnwelh\nB24C\tnwem\nB24D\tnweb\nB24E\tnwebs\nB24F\tnwes\nB250\tnwess\nB251\tnweng\nB252\tnwej\nB253\tnwech\nB254\tnwek\nB255\tnwet\nB256\tnwep\nB257\tnweh\nB258\tnwi\nB259\tnwig\nB25A\tnwikk\nB25B\tnwigs\nB25C\tnwin\nB25D\tnwinj\nB25E\tnwinh\nB25F\tnwid\nB260\tnwil\nB261\tnwilg\nB262\tnwilm\nB263\tnwilb\nB264\tnwils\nB265\tnwilt\nB266\tnwilp\nB267\tnwilh\nB268\tnwim\nB269\tnwib\nB26A\tnwibs\nB26B\tnwis\nB26C\tnwiss\nB26D\tnwing\nB26E\tnwij\nB26F\tnwich\nB270\tnwik\nB271\tnwit\nB272\tnwip\nB273\tnwih\nB274\tnyu\nB275\tnyug\nB276\tnyukk\nB277\tnyugs\nB278\tnyun\nB279\tnyunj\nB27A\tnyunh\nB27B\tnyud\nB27C\tnyul\nB27D\tnyulg\nB27E\tnyulm\nB27F\tnyulb\nB280\tnyuls\nB281\tnyult\nB282\tnyulp\nB283\tnyulh\nB284\tnyum\nB285\tnyub\nB286\tnyubs\nB287\tnyus\nB288\tnyuss\nB289\tnyung\nB28A\tnyuj\nB28B\tnyuch\nB28C\tnyuk\nB28D\tnyut\nB28E\tnyup\nB28F\tnyuh\nB290\tneu\nB291\tneug\nB292\tneukk\nB293\tneugs\nB294\tneun\nB295\tneunj\nB296\tneunh\nB297\tneud\nB298\tneul\nB299\tneulg\nB29A\tneulm\nB29B\tneulb\nB29C\tneuls\nB29D\tneult\nB29E\tneulp\nB29F\tneulh\nB2A0\tneum\nB2A1\tneub\nB2A2\tneubs\nB2A3\tneus\nB2A4\tneuss\nB2A5\tneung\nB2A6\tneuj\nB2A7\tneuch\nB2A8\tneuk\nB2A9\tneut\nB2AA\tneup\nB2AB\tneuh\nB2AC\tnui\nB2AD\tnuig\nB2AE\tnuikk\nB2AF\tnuigs\nB2B0\tnuin\nB2B1\tnuinj\nB2B2\tnuinh\nB2B3\tnuid\nB2B4\tnuil\nB2B5\tnuilg\nB2B6\tnuilm\nB2B7\tnuilb\nB2B8\tnuils\nB2B9\tnuilt\nB2BA\tnuilp\nB2BB\tnuilh\nB2BC\tnuim\nB2BD\tnuib\nB2BE\tnuibs\nB2BF\tnuis\nB2C0\tnuiss\nB2C1\tnuing\nB2C2\tnuij\nB2C3\tnuich\nB2C4\tnuik\nB2C5\tnuit\nB2C6\tnuip\nB2C7\tnuih\nB2C8\tni\nB2C9\tnig\nB2CA\tnikk\nB2CB\tnigs\nB2CC\tnin\nB2CD\tninj\nB2CE\tninh\nB2CF\tnid\nB2D0\tnil\nB2D1\tnilg\nB2D2\tnilm\nB2D3\tnilb\nB2D4\tnils\nB2D5\tnilt\nB2D6\tnilp\nB2D7\tnilh\nB2D8\tnim\nB2D9\tnib\nB2DA\tnibs\nB2DB\tnis\nB2DC\tniss\nB2DD\tning\nB2DE\tnij\nB2DF\tnich\nB2E0\tnik\nB2E1\tnit\nB2E2\tnip\nB2E3\tnih\nB2E4\tda\nB2E5\tdag\nB2E6\tdakk\nB2E7\tdags\nB2E8\tdan\nB2E9\tdanj\nB2EA\tdanh\nB2EB\tdad\nB2EC\tdal\nB2ED\tdalg\nB2EE\tdalm\nB2EF\tdalb\nB2F0\tdals\nB2F1\tdalt\nB2F2\tdalp\nB2F3\tdalh\nB2F4\tdam\nB2F5\tdab\nB2F6\tdabs\nB2F7\tdas\nB2F8\tdass\nB2F9\tdang\nB2FA\tdaj\nB2FB\tdach\nB2FC\tdak\nB2FD\tdat\nB2FE\tdap\nB2FF\tdah\nB300\tdae\nB301\tdaeg\nB302\tdaekk\nB303\tdaegs\nB304\tdaen\nB305\tdaenj\nB306\tdaenh\nB307\tdaed\nB308\tdael\nB309\tdaelg\nB30A\tdaelm\nB30B\tdaelb\nB30C\tdaels\nB30D\tdaelt\nB30E\tdaelp\nB30F\tdaelh\nB310\tdaem\nB311\tdaeb\nB312\tdaebs\nB313\tdaes\nB314\tdaess\nB315\tdaeng\nB316\tdaej\nB317\tdaech\nB318\tdaek\nB319\tdaet\nB31A\tdaep\nB31B\tdaeh\nB31C\tdya\nB31D\tdyag\nB31E\tdyakk\nB31F\tdyags\nB320\tdyan\nB321\tdyanj\nB322\tdyanh\nB323\tdyad\nB324\tdyal\nB325\tdyalg\nB326\tdyalm\nB327\tdyalb\nB328\tdyals\nB329\tdyalt\nB32A\tdyalp\nB32B\tdyalh\nB32C\tdyam\nB32D\tdyab\nB32E\tdyabs\nB32F\tdyas\nB330\tdyass\nB331\tdyang\nB332\tdyaj\nB333\tdyach\nB334\tdyak\nB335\tdyat\nB336\tdyap\nB337\tdyah\nB338\tdyae\nB339\tdyaeg\nB33A\tdyaekk\nB33B\tdyaegs\nB33C\tdyaen\nB33D\tdyaenj\nB33E\tdyaenh\nB33F\tdyaed\nB340\tdyael\nB341\tdyaelg\nB342\tdyaelm\nB343\tdyaelb\nB344\tdyaels\nB345\tdyaelt\nB346\tdyaelp\nB347\tdyaelh\nB348\tdyaem\nB349\tdyaeb\nB34A\tdyaebs\nB34B\tdyaes\nB34C\tdyaess\nB34D\tdyaeng\nB34E\tdyaej\nB34F\tdyaech\nB350\tdyaek\nB351\tdyaet\nB352\tdyaep\nB353\tdyaeh\nB354\tdeo\nB355\tdeog\nB356\tdeokk\nB357\tdeogs\nB358\tdeon\nB359\tdeonj\nB35A\tdeonh\nB35B\tdeod\nB35C\tdeol\nB35D\tdeolg\nB35E\tdeolm\nB35F\tdeolb\nB360\tdeols\nB361\tdeolt\nB362\tdeolp\nB363\tdeolh\nB364\tdeom\nB365\tdeob\nB366\tdeobs\nB367\tdeos\nB368\tdeoss\nB369\tdeong\nB36A\tdeoj\nB36B\tdeoch\nB36C\tdeok\nB36D\tdeot\nB36E\tdeop\nB36F\tdeoh\nB370\tde\nB371\tdeg\nB372\tdekk\nB373\tdegs\nB374\tden\nB375\tdenj\nB376\tdenh\nB377\tded\nB378\tdel\nB379\tdelg\nB37A\tdelm\nB37B\tdelb\nB37C\tdels\nB37D\tdelt\nB37E\tdelp\nB37F\tdelh\nB380\tdem\nB381\tdeb\nB382\tdebs\nB383\tdes\nB384\tdess\nB385\tdeng\nB386\tdej\nB387\tdech\nB388\tdek\nB389\tdet\nB38A\tdep\nB38B\tdeh\nB38C\tdyeo\nB38D\tdyeog\nB38E\tdyeokk\nB38F\tdyeogs\nB390\tdyeon\nB391\tdyeonj\nB392\tdyeonh\nB393\tdyeod\nB394\tdyeol\nB395\tdyeolg\nB396\tdyeolm\nB397\tdyeolb\nB398\tdyeols\nB399\tdyeolt\nB39A\tdyeolp\nB39B\tdyeolh\nB39C\tdyeom\nB39D\tdyeob\nB39E\tdyeobs\nB39F\tdyeos\nB3A0\tdyeoss\nB3A1\tdyeong\nB3A2\tdyeoj\nB3A3\tdyeoch\nB3A4\tdyeok\nB3A5\tdyeot\nB3A6\tdyeop\nB3A7\tdyeoh\nB3A8\tdye\nB3A9\tdyeg\nB3AA\tdyekk\nB3AB\tdyegs\nB3AC\tdyen\nB3AD\tdyenj\nB3AE\tdyenh\nB3AF\tdyed\nB3B0\tdyel\nB3B1\tdyelg\nB3B2\tdyelm\nB3B3\tdyelb\nB3B4\tdyels\nB3B5\tdyelt\nB3B6\tdyelp\nB3B7\tdyelh\nB3B8\tdyem\nB3B9\tdyeb\nB3BA\tdyebs\nB3BB\tdyes\nB3BC\tdyess\nB3BD\tdyeng\nB3BE\tdyej\nB3BF\tdyech\nB3C0\tdyek\nB3C1\tdyet\nB3C2\tdyep\nB3C3\tdyeh\nB3C4\tdo\nB3C5\tdog\nB3C6\tdokk\nB3C7\tdogs\nB3C8\tdon\nB3C9\tdonj\nB3CA\tdonh\nB3CB\tdod\nB3CC\tdol\nB3CD\tdolg\nB3CE\tdolm\nB3CF\tdolb\nB3D0\tdols\nB3D1\tdolt\nB3D2\tdolp\nB3D3\tdolh\nB3D4\tdom\nB3D5\tdob\nB3D6\tdobs\nB3D7\tdos\nB3D8\tdoss\nB3D9\tdong\nB3DA\tdoj\nB3DB\tdoch\nB3DC\tdok\nB3DD\tdot\nB3DE\tdop\nB3DF\tdoh\nB3E0\tdwa\nB3E1\tdwag\nB3E2\tdwakk\nB3E3\tdwags\nB3E4\tdwan\nB3E5\tdwanj\nB3E6\tdwanh\nB3E7\tdwad\nB3E8\tdwal\nB3E9\tdwalg\nB3EA\tdwalm\nB3EB\tdwalb\nB3EC\tdwals\nB3ED\tdwalt\nB3EE\tdwalp\nB3EF\tdwalh\nB3F0\tdwam\nB3F1\tdwab\nB3F2\tdwabs\nB3F3\tdwas\nB3F4\tdwass\nB3F5\tdwang\nB3F6\tdwaj\nB3F7\tdwach\nB3F8\tdwak\nB3F9\tdwat\nB3FA\tdwap\nB3FB\tdwah\nB3FC\tdwae\nB3FD\tdwaeg\nB3FE\tdwaekk\nB3FF\tdwaegs\nB400\tdwaen\nB401\tdwaenj\nB402\tdwaenh\nB403\tdwaed\nB404\tdwael\nB405\tdwaelg\nB406\tdwaelm\nB407\tdwaelb\nB408\tdwaels\nB409\tdwaelt\nB40A\tdwaelp\nB40B\tdwaelh\nB40C\tdwaem\nB40D\tdwaeb\nB40E\tdwaebs\nB40F\tdwaes\nB410\tdwaess\nB411\tdwaeng\nB412\tdwaej\nB413\tdwaech\nB414\tdwaek\nB415\tdwaet\nB416\tdwaep\nB417\tdwaeh\nB418\tdoe\nB419\tdoeg\nB41A\tdoekk\nB41B\tdoegs\nB41C\tdoen\nB41D\tdoenj\nB41E\tdoenh\nB41F\tdoed\nB420\tdoel\nB421\tdoelg\nB422\tdoelm\nB423\tdoelb\nB424\tdoels\nB425\tdoelt\nB426\tdoelp\nB427\tdoelh\nB428\tdoem\nB429\tdoeb\nB42A\tdoebs\nB42B\tdoes\nB42C\tdoess\nB42D\tdoeng\nB42E\tdoej\nB42F\tdoech\nB430\tdoek\nB431\tdoet\nB432\tdoep\nB433\tdoeh\nB434\tdyo\nB435\tdyog\nB436\tdyokk\nB437\tdyogs\nB438\tdyon\nB439\tdyonj\nB43A\tdyonh\nB43B\tdyod\nB43C\tdyol\nB43D\tdyolg\nB43E\tdyolm\nB43F\tdyolb\nB440\tdyols\nB441\tdyolt\nB442\tdyolp\nB443\tdyolh\nB444\tdyom\nB445\tdyob\nB446\tdyobs\nB447\tdyos\nB448\tdyoss\nB449\tdyong\nB44A\tdyoj\nB44B\tdyoch\nB44C\tdyok\nB44D\tdyot\nB44E\tdyop\nB44F\tdyoh\nB450\tdu\nB451\tdug\nB452\tdukk\nB453\tdugs\nB454\tdun\nB455\tdunj\nB456\tdunh\nB457\tdud\nB458\tdul\nB459\tdulg\nB45A\tdulm\nB45B\tdulb\nB45C\tduls\nB45D\tdult\nB45E\tdulp\nB45F\tdulh\nB460\tdum\nB461\tdub\nB462\tdubs\nB463\tdus\nB464\tduss\nB465\tdung\nB466\tduj\nB467\tduch\nB468\tduk\nB469\tdut\nB46A\tdup\nB46B\tduh\nB46C\tdwo\nB46D\tdwog\nB46E\tdwokk\nB46F\tdwogs\nB470\tdwon\nB471\tdwonj\nB472\tdwonh\nB473\tdwod\nB474\tdwol\nB475\tdwolg\nB476\tdwolm\nB477\tdwolb\nB478\tdwols\nB479\tdwolt\nB47A\tdwolp\nB47B\tdwolh\nB47C\tdwom\nB47D\tdwob\nB47E\tdwobs\nB47F\tdwos\nB480\tdwoss\nB481\tdwong\nB482\tdwoj\nB483\tdwoch\nB484\tdwok\nB485\tdwot\nB486\tdwop\nB487\tdwoh\nB488\tdwe\nB489\tdweg\nB48A\tdwekk\nB48B\tdwegs\nB48C\tdwen\nB48D\tdwenj\nB48E\tdwenh\nB48F\tdwed\nB490\tdwel\nB491\tdwelg\nB492\tdwelm\nB493\tdwelb\nB494\tdwels\nB495\tdwelt\nB496\tdwelp\nB497\tdwelh\nB498\tdwem\nB499\tdweb\nB49A\tdwebs\nB49B\tdwes\nB49C\tdwess\nB49D\tdweng\nB49E\tdwej\nB49F\tdwech\nB4A0\tdwek\nB4A1\tdwet\nB4A2\tdwep\nB4A3\tdweh\nB4A4\tdwi\nB4A5\tdwig\nB4A6\tdwikk\nB4A7\tdwigs\nB4A8\tdwin\nB4A9\tdwinj\nB4AA\tdwinh\nB4AB\tdwid\nB4AC\tdwil\nB4AD\tdwilg\nB4AE\tdwilm\nB4AF\tdwilb\nB4B0\tdwils\nB4B1\tdwilt\nB4B2\tdwilp\nB4B3\tdwilh\nB4B4\tdwim\nB4B5\tdwib\nB4B6\tdwibs\nB4B7\tdwis\nB4B8\tdwiss\nB4B9\tdwing\nB4BA\tdwij\nB4BB\tdwich\nB4BC\tdwik\nB4BD\tdwit\nB4BE\tdwip\nB4BF\tdwih\nB4C0\tdyu\nB4C1\tdyug\nB4C2\tdyukk\nB4C3\tdyugs\nB4C4\tdyun\nB4C5\tdyunj\nB4C6\tdyunh\nB4C7\tdyud\nB4C8\tdyul\nB4C9\tdyulg\nB4CA\tdyulm\nB4CB\tdyulb\nB4CC\tdyuls\nB4CD\tdyult\nB4CE\tdyulp\nB4CF\tdyulh\nB4D0\tdyum\nB4D1\tdyub\nB4D2\tdyubs\nB4D3\tdyus\nB4D4\tdyuss\nB4D5\tdyung\nB4D6\tdyuj\nB4D7\tdyuch\nB4D8\tdyuk\nB4D9\tdyut\nB4DA\tdyup\nB4DB\tdyuh\nB4DC\tdeu\nB4DD\tdeug\nB4DE\tdeukk\nB4DF\tdeugs\nB4E0\tdeun\nB4E1\tdeunj\nB4E2\tdeunh\nB4E3\tdeud\nB4E4\tdeul\nB4E5\tdeulg\nB4E6\tdeulm\nB4E7\tdeulb\nB4E8\tdeuls\nB4E9\tdeult\nB4EA\tdeulp\nB4EB\tdeulh\nB4EC\tdeum\nB4ED\tdeub\nB4EE\tdeubs\nB4EF\tdeus\nB4F0\tdeuss\nB4F1\tdeung\nB4F2\tdeuj\nB4F3\tdeuch\nB4F4\tdeuk\nB4F5\tdeut\nB4F6\tdeup\nB4F7\tdeuh\nB4F8\tdui\nB4F9\tduig\nB4FA\tduikk\nB4FB\tduigs\nB4FC\tduin\nB4FD\tduinj\nB4FE\tduinh\nB4FF\tduid\nB500\tduil\nB501\tduilg\nB502\tduilm\nB503\tduilb\nB504\tduils\nB505\tduilt\nB506\tduilp\nB507\tduilh\nB508\tduim\nB509\tduib\nB50A\tduibs\nB50B\tduis\nB50C\tduiss\nB50D\tduing\nB50E\tduij\nB50F\tduich\nB510\tduik\nB511\tduit\nB512\tduip\nB513\tduih\nB514\tdi\nB515\tdig\nB516\tdikk\nB517\tdigs\nB518\tdin\nB519\tdinj\nB51A\tdinh\nB51B\tdid\nB51C\tdil\nB51D\tdilg\nB51E\tdilm\nB51F\tdilb\nB520\tdils\nB521\tdilt\nB522\tdilp\nB523\tdilh\nB524\tdim\nB525\tdib\nB526\tdibs\nB527\tdis\nB528\tdiss\nB529\tding\nB52A\tdij\nB52B\tdich\nB52C\tdik\nB52D\tdit\nB52E\tdip\nB52F\tdih\nB530\ttta\nB531\tttag\nB532\tttakk\nB533\tttags\nB534\tttan\nB535\tttanj\nB536\tttanh\nB537\tttad\nB538\tttal\nB539\tttalg\nB53A\tttalm\nB53B\tttalb\nB53C\tttals\nB53D\tttalt\nB53E\tttalp\nB53F\tttalh\nB540\tttam\nB541\tttab\nB542\tttabs\nB543\tttas\nB544\tttass\nB545\tttang\nB546\tttaj\nB547\tttach\nB548\tttak\nB549\tttat\nB54A\tttap\nB54B\tttah\nB54C\tttae\nB54D\tttaeg\nB54E\tttaekk\nB54F\tttaegs\nB550\tttaen\nB551\tttaenj\nB552\tttaenh\nB553\tttaed\nB554\tttael\nB555\tttaelg\nB556\tttaelm\nB557\tttaelb\nB558\tttaels\nB559\tttaelt\nB55A\tttaelp\nB55B\tttaelh\nB55C\tttaem\nB55D\tttaeb\nB55E\tttaebs\nB55F\tttaes\nB560\tttaess\nB561\tttaeng\nB562\tttaej\nB563\tttaech\nB564\tttaek\nB565\tttaet\nB566\tttaep\nB567\tttaeh\nB568\tttya\nB569\tttyag\nB56A\tttyakk\nB56B\tttyags\nB56C\tttyan\nB56D\tttyanj\nB56E\tttyanh\nB56F\tttyad\nB570\tttyal\nB571\tttyalg\nB572\tttyalm\nB573\tttyalb\nB574\tttyals\nB575\tttyalt\nB576\tttyalp\nB577\tttyalh\nB578\tttyam\nB579\tttyab\nB57A\tttyabs\nB57B\tttyas\nB57C\tttyass\nB57D\tttyang\nB57E\tttyaj\nB57F\tttyach\nB580\tttyak\nB581\tttyat\nB582\tttyap\nB583\tttyah\nB584\tttyae\nB585\tttyaeg\nB586\tttyaekk\nB587\tttyaegs\nB588\tttyaen\nB589\tttyaenj\nB58A\tttyaenh\nB58B\tttyaed\nB58C\tttyael\nB58D\tttyaelg\nB58E\tttyaelm\nB58F\tttyaelb\nB590\tttyaels\nB591\tttyaelt\nB592\tttyaelp\nB593\tttyaelh\nB594\tttyaem\nB595\tttyaeb\nB596\tttyaebs\nB597\tttyaes\nB598\tttyaess\nB599\tttyaeng\nB59A\tttyaej\nB59B\tttyaech\nB59C\tttyaek\nB59D\tttyaet\nB59E\tttyaep\nB59F\tttyaeh\nB5A0\ttteo\nB5A1\ttteog\nB5A2\ttteokk\nB5A3\ttteogs\nB5A4\ttteon\nB5A5\ttteonj\nB5A6\ttteonh\nB5A7\ttteod\nB5A8\ttteol\nB5A9\ttteolg\nB5AA\ttteolm\nB5AB\ttteolb\nB5AC\ttteols\nB5AD\ttteolt\nB5AE\ttteolp\nB5AF\ttteolh\nB5B0\ttteom\nB5B1\ttteob\nB5B2\ttteobs\nB5B3\ttteos\nB5B4\ttteoss\nB5B5\ttteong\nB5B6\ttteoj\nB5B7\ttteoch\nB5B8\ttteok\nB5B9\ttteot\nB5BA\ttteop\nB5BB\ttteoh\nB5BC\ttte\nB5BD\ttteg\nB5BE\tttekk\nB5BF\tttegs\nB5C0\ttten\nB5C1\tttenj\nB5C2\tttenh\nB5C3\ttted\nB5C4\tttel\nB5C5\tttelg\nB5C6\tttelm\nB5C7\tttelb\nB5C8\tttels\nB5C9\tttelt\nB5CA\tttelp\nB5CB\tttelh\nB5CC\tttem\nB5CD\ttteb\nB5CE\tttebs\nB5CF\tttes\nB5D0\tttess\nB5D1\ttteng\nB5D2\tttej\nB5D3\tttech\nB5D4\tttek\nB5D5\tttet\nB5D6\tttep\nB5D7\ttteh\nB5D8\tttyeo\nB5D9\tttyeog\nB5DA\tttyeokk\nB5DB\tttyeogs\nB5DC\tttyeon\nB5DD\tttyeonj\nB5DE\tttyeonh\nB5DF\tttyeod\nB5E0\tttyeol\nB5E1\tttyeolg\nB5E2\tttyeolm\nB5E3\tttyeolb\nB5E4\tttyeols\nB5E5\tttyeolt\nB5E6\tttyeolp\nB5E7\tttyeolh\nB5E8\tttyeom\nB5E9\tttyeob\nB5EA\tttyeobs\nB5EB\tttyeos\nB5EC\tttyeoss\nB5ED\tttyeong\nB5EE\tttyeoj\nB5EF\tttyeoch\nB5F0\tttyeok\nB5F1\tttyeot\nB5F2\tttyeop\nB5F3\tttyeoh\nB5F4\tttye\nB5F5\tttyeg\nB5F6\tttyekk\nB5F7\tttyegs\nB5F8\tttyen\nB5F9\tttyenj\nB5FA\tttyenh\nB5FB\tttyed\nB5FC\tttyel\nB5FD\tttyelg\nB5FE\tttyelm\nB5FF\tttyelb\nB600\tttyels\nB601\tttyelt\nB602\tttyelp\nB603\tttyelh\nB604\tttyem\nB605\tttyeb\nB606\tttyebs\nB607\tttyes\nB608\tttyess\nB609\tttyeng\nB60A\tttyej\nB60B\tttyech\nB60C\tttyek\nB60D\tttyet\nB60E\tttyep\nB60F\tttyeh\nB610\ttto\nB611\tttog\nB612\tttokk\nB613\tttogs\nB614\ttton\nB615\tttonj\nB616\tttonh\nB617\tttod\nB618\tttol\nB619\tttolg\nB61A\tttolm\nB61B\tttolb\nB61C\tttols\nB61D\tttolt\nB61E\tttolp\nB61F\tttolh\nB620\tttom\nB621\tttob\nB622\tttobs\nB623\tttos\nB624\tttoss\nB625\tttong\nB626\tttoj\nB627\tttoch\nB628\tttok\nB629\tttot\nB62A\tttop\nB62B\tttoh\nB62C\tttwa\nB62D\tttwag\nB62E\tttwakk\nB62F\tttwags\nB630\tttwan\nB631\tttwanj\nB632\tttwanh\nB633\tttwad\nB634\tttwal\nB635\tttwalg\nB636\tttwalm\nB637\tttwalb\nB638\tttwals\nB639\tttwalt\nB63A\tttwalp\nB63B\tttwalh\nB63C\tttwam\nB63D\tttwab\nB63E\tttwabs\nB63F\tttwas\nB640\tttwass\nB641\tttwang\nB642\tttwaj\nB643\tttwach\nB644\tttwak\nB645\tttwat\nB646\tttwap\nB647\tttwah\nB648\tttwae\nB649\tttwaeg\nB64A\tttwaekk\nB64B\tttwaegs\nB64C\tttwaen\nB64D\tttwaenj\nB64E\tttwaenh\nB64F\tttwaed\nB650\tttwael\nB651\tttwaelg\nB652\tttwaelm\nB653\tttwaelb\nB654\tttwaels\nB655\tttwaelt\nB656\tttwaelp\nB657\tttwaelh\nB658\tttwaem\nB659\tttwaeb\nB65A\tttwaebs\nB65B\tttwaes\nB65C\tttwaess\nB65D\tttwaeng\nB65E\tttwaej\nB65F\tttwaech\nB660\tttwaek\nB661\tttwaet\nB662\tttwaep\nB663\tttwaeh\nB664\tttoe\nB665\tttoeg\nB666\tttoekk\nB667\tttoegs\nB668\tttoen\nB669\tttoenj\nB66A\tttoenh\nB66B\tttoed\nB66C\tttoel\nB66D\tttoelg\nB66E\tttoelm\nB66F\tttoelb\nB670\tttoels\nB671\tttoelt\nB672\tttoelp\nB673\tttoelh\nB674\tttoem\nB675\tttoeb\nB676\tttoebs\nB677\tttoes\nB678\tttoess\nB679\tttoeng\nB67A\tttoej\nB67B\tttoech\nB67C\tttoek\nB67D\tttoet\nB67E\tttoep\nB67F\tttoeh\nB680\tttyo\nB681\tttyog\nB682\tttyokk\nB683\tttyogs\nB684\tttyon\nB685\tttyonj\nB686\tttyonh\nB687\tttyod\nB688\tttyol\nB689\tttyolg\nB68A\tttyolm\nB68B\tttyolb\nB68C\tttyols\nB68D\tttyolt\nB68E\tttyolp\nB68F\tttyolh\nB690\tttyom\nB691\tttyob\nB692\tttyobs\nB693\tttyos\nB694\tttyoss\nB695\tttyong\nB696\tttyoj\nB697\tttyoch\nB698\tttyok\nB699\tttyot\nB69A\tttyop\nB69B\tttyoh\nB69C\tttu\nB69D\tttug\nB69E\tttukk\nB69F\tttugs\nB6A0\tttun\nB6A1\tttunj\nB6A2\tttunh\nB6A3\tttud\nB6A4\tttul\nB6A5\tttulg\nB6A6\tttulm\nB6A7\tttulb\nB6A8\tttuls\nB6A9\tttult\nB6AA\tttulp\nB6AB\tttulh\nB6AC\tttum\nB6AD\tttub\nB6AE\tttubs\nB6AF\tttus\nB6B0\tttuss\nB6B1\tttung\nB6B2\tttuj\nB6B3\tttuch\nB6B4\tttuk\nB6B5\tttut\nB6B6\tttup\nB6B7\tttuh\nB6B8\tttwo\nB6B9\tttwog\nB6BA\tttwokk\nB6BB\tttwogs\nB6BC\tttwon\nB6BD\tttwonj\nB6BE\tttwonh\nB6BF\tttwod\nB6C0\tttwol\nB6C1\tttwolg\nB6C2\tttwolm\nB6C3\tttwolb\nB6C4\tttwols\nB6C5\tttwolt\nB6C6\tttwolp\nB6C7\tttwolh\nB6C8\tttwom\nB6C9\tttwob\nB6CA\tttwobs\nB6CB\tttwos\nB6CC\tttwoss\nB6CD\tttwong\nB6CE\tttwoj\nB6CF\tttwoch\nB6D0\tttwok\nB6D1\tttwot\nB6D2\tttwop\nB6D3\tttwoh\nB6D4\tttwe\nB6D5\tttweg\nB6D6\tttwekk\nB6D7\tttwegs\nB6D8\tttwen\nB6D9\tttwenj\nB6DA\tttwenh\nB6DB\tttwed\nB6DC\tttwel\nB6DD\tttwelg\nB6DE\tttwelm\nB6DF\tttwelb\nB6E0\tttwels\nB6E1\tttwelt\nB6E2\tttwelp\nB6E3\tttwelh\nB6E4\tttwem\nB6E5\tttweb\nB6E6\tttwebs\nB6E7\tttwes\nB6E8\tttwess\nB6E9\tttweng\nB6EA\tttwej\nB6EB\tttwech\nB6EC\tttwek\nB6ED\tttwet\nB6EE\tttwep\nB6EF\tttweh\nB6F0\tttwi\nB6F1\tttwig\nB6F2\tttwikk\nB6F3\tttwigs\nB6F4\tttwin\nB6F5\tttwinj\nB6F6\tttwinh\nB6F7\tttwid\nB6F8\tttwil\nB6F9\tttwilg\nB6FA\tttwilm\nB6FB\tttwilb\nB6FC\tttwils\nB6FD\tttwilt\nB6FE\tttwilp\nB6FF\tttwilh\nB700\tttwim\nB701\tttwib\nB702\tttwibs\nB703\tttwis\nB704\tttwiss\nB705\tttwing\nB706\tttwij\nB707\tttwich\nB708\tttwik\nB709\tttwit\nB70A\tttwip\nB70B\tttwih\nB70C\tttyu\nB70D\tttyug\nB70E\tttyukk\nB70F\tttyugs\nB710\tttyun\nB711\tttyunj\nB712\tttyunh\nB713\tttyud\nB714\tttyul\nB715\tttyulg\nB716\tttyulm\nB717\tttyulb\nB718\tttyuls\nB719\tttyult\nB71A\tttyulp\nB71B\tttyulh\nB71C\tttyum\nB71D\tttyub\nB71E\tttyubs\nB71F\tttyus\nB720\tttyuss\nB721\tttyung\nB722\tttyuj\nB723\tttyuch\nB724\tttyuk\nB725\tttyut\nB726\tttyup\nB727\tttyuh\nB728\ttteu\nB729\ttteug\nB72A\ttteukk\nB72B\ttteugs\nB72C\ttteun\nB72D\ttteunj\nB72E\ttteunh\nB72F\ttteud\nB730\ttteul\nB731\ttteulg\nB732\ttteulm\nB733\ttteulb\nB734\ttteuls\nB735\ttteult\nB736\ttteulp\nB737\ttteulh\nB738\ttteum\nB739\ttteub\nB73A\ttteubs\nB73B\ttteus\nB73C\ttteuss\nB73D\ttteung\nB73E\ttteuj\nB73F\ttteuch\nB740\ttteuk\nB741\ttteut\nB742\ttteup\nB743\ttteuh\nB744\tttui\nB745\tttuig\nB746\tttuikk\nB747\tttuigs\nB748\tttuin\nB749\tttuinj\nB74A\tttuinh\nB74B\tttuid\nB74C\tttuil\nB74D\tttuilg\nB74E\tttuilm\nB74F\tttuilb\nB750\tttuils\nB751\tttuilt\nB752\tttuilp\nB753\tttuilh\nB754\tttuim\nB755\tttuib\nB756\tttuibs\nB757\tttuis\nB758\tttuiss\nB759\tttuing\nB75A\tttuij\nB75B\tttuich\nB75C\tttuik\nB75D\tttuit\nB75E\tttuip\nB75F\tttuih\nB760\ttti\nB761\tttig\nB762\tttikk\nB763\tttigs\nB764\tttin\nB765\tttinj\nB766\tttinh\nB767\tttid\nB768\tttil\nB769\tttilg\nB76A\tttilm\nB76B\tttilb\nB76C\tttils\nB76D\tttilt\nB76E\tttilp\nB76F\tttilh\nB770\tttim\nB771\tttib\nB772\tttibs\nB773\tttis\nB774\tttiss\nB775\ttting\nB776\tttij\nB777\tttich\nB778\tttik\nB779\tttit\nB77A\tttip\nB77B\tttih\nB77C\tla\nB77D\tlag\nB77E\tlakk\nB77F\tlags\nB780\tlan\nB781\tlanj\nB782\tlanh\nB783\tlad\nB784\tlal\nB785\tlalg\nB786\tlalm\nB787\tlalb\nB788\tlals\nB789\tlalt\nB78A\tlalp\nB78B\tlalh\nB78C\tlam\nB78D\tlab\nB78E\tlabs\nB78F\tlas\nB790\tlass\nB791\tlang\nB792\tlaj\nB793\tlach\nB794\tlak\nB795\tlat\nB796\tlap\nB797\tlah\nB798\tlae\nB799\tlaeg\nB79A\tlaekk\nB79B\tlaegs\nB79C\tlaen\nB79D\tlaenj\nB79E\tlaenh\nB79F\tlaed\nB7A0\tlael\nB7A1\tlaelg\nB7A2\tlaelm\nB7A3\tlaelb\nB7A4\tlaels\nB7A5\tlaelt\nB7A6\tlaelp\nB7A7\tlaelh\nB7A8\tlaem\nB7A9\tlaeb\nB7AA\tlaebs\nB7AB\tlaes\nB7AC\tlaess\nB7AD\tlaeng\nB7AE\tlaej\nB7AF\tlaech\nB7B0\tlaek\nB7B1\tlaet\nB7B2\tlaep\nB7B3\tlaeh\nB7B4\tlya\nB7B5\tlyag\nB7B6\tlyakk\nB7B7\tlyags\nB7B8\tlyan\nB7B9\tlyanj\nB7BA\tlyanh\nB7BB\tlyad\nB7BC\tlyal\nB7BD\tlyalg\nB7BE\tlyalm\nB7BF\tlyalb\nB7C0\tlyals\nB7C1\tlyalt\nB7C2\tlyalp\nB7C3\tlyalh\nB7C4\tlyam\nB7C5\tlyab\nB7C6\tlyabs\nB7C7\tlyas\nB7C8\tlyass\nB7C9\tlyang\nB7CA\tlyaj\nB7CB\tlyach\nB7CC\tlyak\nB7CD\tlyat\nB7CE\tlyap\nB7CF\tlyah\nB7D0\tlyae\nB7D1\tlyaeg\nB7D2\tlyaekk\nB7D3\tlyaegs\nB7D4\tlyaen\nB7D5\tlyaenj\nB7D6\tlyaenh\nB7D7\tlyaed\nB7D8\tlyael\nB7D9\tlyaelg\nB7DA\tlyaelm\nB7DB\tlyaelb\nB7DC\tlyaels\nB7DD\tlyaelt\nB7DE\tlyaelp\nB7DF\tlyaelh\nB7E0\tlyaem\nB7E1\tlyaeb\nB7E2\tlyaebs\nB7E3\tlyaes\nB7E4\tlyaess\nB7E5\tlyaeng\nB7E6\tlyaej\nB7E7\tlyaech\nB7E8\tlyaek\nB7E9\tlyaet\nB7EA\tlyaep\nB7EB\tlyaeh\nB7EC\tleo\nB7ED\tleog\nB7EE\tleokk\nB7EF\tleogs\nB7F0\tleon\nB7F1\tleonj\nB7F2\tleonh\nB7F3\tleod\nB7F4\tleol\nB7F5\tleolg\nB7F6\tleolm\nB7F7\tleolb\nB7F8\tleols\nB7F9\tleolt\nB7FA\tleolp\nB7FB\tleolh\nB7FC\tleom\nB7FD\tleob\nB7FE\tleobs\nB7FF\tleos\nB800\tleoss\nB801\tleong\nB802\tleoj\nB803\tleoch\nB804\tleok\nB805\tleot\nB806\tleop\nB807\tleoh\nB808\tle\nB809\tleg\nB80A\tlekk\nB80B\tlegs\nB80C\tlen\nB80D\tlenj\nB80E\tlenh\nB80F\tled\nB810\tlel\nB811\tlelg\nB812\tlelm\nB813\tlelb\nB814\tlels\nB815\tlelt\nB816\tlelp\nB817\tlelh\nB818\tlem\nB819\tleb\nB81A\tlebs\nB81B\tles\nB81C\tless\nB81D\tleng\nB81E\tlej\nB81F\tlech\nB820\tlek\nB821\tlet\nB822\tlep\nB823\tleh\nB824\tlyeo\nB825\tlyeog\nB826\tlyeokk\nB827\tlyeogs\nB828\tlyeon\nB829\tlyeonj\nB82A\tlyeonh\nB82B\tlyeod\nB82C\tlyeol\nB82D\tlyeolg\nB82E\tlyeolm\nB82F\tlyeolb\nB830\tlyeols\nB831\tlyeolt\nB832\tlyeolp\nB833\tlyeolh\nB834\tlyeom\nB835\tlyeob\nB836\tlyeobs\nB837\tlyeos\nB838\tlyeoss\nB839\tlyeong\nB83A\tlyeoj\nB83B\tlyeoch\nB83C\tlyeok\nB83D\tlyeot\nB83E\tlyeop\nB83F\tlyeoh\nB840\tlye\nB841\tlyeg\nB842\tlyekk\nB843\tlyegs\nB844\tlyen\nB845\tlyenj\nB846\tlyenh\nB847\tlyed\nB848\tlyel\nB849\tlyelg\nB84A\tlyelm\nB84B\tlyelb\nB84C\tlyels\nB84D\tlyelt\nB84E\tlyelp\nB84F\tlyelh\nB850\tlyem\nB851\tlyeb\nB852\tlyebs\nB853\tlyes\nB854\tlyess\nB855\tlyeng\nB856\tlyej\nB857\tlyech\nB858\tlyek\nB859\tlyet\nB85A\tlyep\nB85B\tlyeh\nB85C\tlo\nB85D\tlog\nB85E\tlokk\nB85F\tlogs\nB860\tlon\nB861\tlonj\nB862\tlonh\nB863\tlod\nB864\tlol\nB865\tlolg\nB866\tlolm\nB867\tlolb\nB868\tlols\nB869\tlolt\nB86A\tlolp\nB86B\tlolh\nB86C\tlom\nB86D\tlob\nB86E\tlobs\nB86F\tlos\nB870\tloss\nB871\tlong\nB872\tloj\nB873\tloch\nB874\tlok\nB875\tlot\nB876\tlop\nB877\tloh\nB878\tlwa\nB879\tlwag\nB87A\tlwakk\nB87B\tlwags\nB87C\tlwan\nB87D\tlwanj\nB87E\tlwanh\nB87F\tlwad\nB880\tlwal\nB881\tlwalg\nB882\tlwalm\nB883\tlwalb\nB884\tlwals\nB885\tlwalt\nB886\tlwalp\nB887\tlwalh\nB888\tlwam\nB889\tlwab\nB88A\tlwabs\nB88B\tlwas\nB88C\tlwass\nB88D\tlwang\nB88E\tlwaj\nB88F\tlwach\nB890\tlwak\nB891\tlwat\nB892\tlwap\nB893\tlwah\nB894\tlwae\nB895\tlwaeg\nB896\tlwaekk\nB897\tlwaegs\nB898\tlwaen\nB899\tlwaenj\nB89A\tlwaenh\nB89B\tlwaed\nB89C\tlwael\nB89D\tlwaelg\nB89E\tlwaelm\nB89F\tlwaelb\nB8A0\tlwaels\nB8A1\tlwaelt\nB8A2\tlwaelp\nB8A3\tlwaelh\nB8A4\tlwaem\nB8A5\tlwaeb\nB8A6\tlwaebs\nB8A7\tlwaes\nB8A8\tlwaess\nB8A9\tlwaeng\nB8AA\tlwaej\nB8AB\tlwaech\nB8AC\tlwaek\nB8AD\tlwaet\nB8AE\tlwaep\nB8AF\tlwaeh\nB8B0\tloe\nB8B1\tloeg\nB8B2\tloekk\nB8B3\tloegs\nB8B4\tloen\nB8B5\tloenj\nB8B6\tloenh\nB8B7\tloed\nB8B8\tloel\nB8B9\tloelg\nB8BA\tloelm\nB8BB\tloelb\nB8BC\tloels\nB8BD\tloelt\nB8BE\tloelp\nB8BF\tloelh\nB8C0\tloem\nB8C1\tloeb\nB8C2\tloebs\nB8C3\tloes\nB8C4\tloess\nB8C5\tloeng\nB8C6\tloej\nB8C7\tloech\nB8C8\tloek\nB8C9\tloet\nB8CA\tloep\nB8CB\tloeh\nB8CC\tlyo\nB8CD\tlyog\nB8CE\tlyokk\nB8CF\tlyogs\nB8D0\tlyon\nB8D1\tlyonj\nB8D2\tlyonh\nB8D3\tlyod\nB8D4\tlyol\nB8D5\tlyolg\nB8D6\tlyolm\nB8D7\tlyolb\nB8D8\tlyols\nB8D9\tlyolt\nB8DA\tlyolp\nB8DB\tlyolh\nB8DC\tlyom\nB8DD\tlyob\nB8DE\tlyobs\nB8DF\tlyos\nB8E0\tlyoss\nB8E1\tlyong\nB8E2\tlyoj\nB8E3\tlyoch\nB8E4\tlyok\nB8E5\tlyot\nB8E6\tlyop\nB8E7\tlyoh\nB8E8\tlu\nB8E9\tlug\nB8EA\tlukk\nB8EB\tlugs\nB8EC\tlun\nB8ED\tlunj\nB8EE\tlunh\nB8EF\tlud\nB8F0\tlul\nB8F1\tlulg\nB8F2\tlulm\nB8F3\tlulb\nB8F4\tluls\nB8F5\tlult\nB8F6\tlulp\nB8F7\tlulh\nB8F8\tlum\nB8F9\tlub\nB8FA\tlubs\nB8FB\tlus\nB8FC\tluss\nB8FD\tlung\nB8FE\tluj\nB8FF\tluch\nB900\tluk\nB901\tlut\nB902\tlup\nB903\tluh\nB904\tlwo\nB905\tlwog\nB906\tlwokk\nB907\tlwogs\nB908\tlwon\nB909\tlwonj\nB90A\tlwonh\nB90B\tlwod\nB90C\tlwol\nB90D\tlwolg\nB90E\tlwolm\nB90F\tlwolb\nB910\tlwols\nB911\tlwolt\nB912\tlwolp\nB913\tlwolh\nB914\tlwom\nB915\tlwob\nB916\tlwobs\nB917\tlwos\nB918\tlwoss\nB919\tlwong\nB91A\tlwoj\nB91B\tlwoch\nB91C\tlwok\nB91D\tlwot\nB91E\tlwop\nB91F\tlwoh\nB920\tlwe\nB921\tlweg\nB922\tlwekk\nB923\tlwegs\nB924\tlwen\nB925\tlwenj\nB926\tlwenh\nB927\tlwed\nB928\tlwel\nB929\tlwelg\nB92A\tlwelm\nB92B\tlwelb\nB92C\tlwels\nB92D\tlwelt\nB92E\tlwelp\nB92F\tlwelh\nB930\tlwem\nB931\tlweb\nB932\tlwebs\nB933\tlwes\nB934\tlwess\nB935\tlweng\nB936\tlwej\nB937\tlwech\nB938\tlwek\nB939\tlwet\nB93A\tlwep\nB93B\tlweh\nB93C\tlwi\nB93D\tlwig\nB93E\tlwikk\nB93F\tlwigs\nB940\tlwin\nB941\tlwinj\nB942\tlwinh\nB943\tlwid\nB944\tlwil\nB945\tlwilg\nB946\tlwilm\nB947\tlwilb\nB948\tlwils\nB949\tlwilt\nB94A\tlwilp\nB94B\tlwilh\nB94C\tlwim\nB94D\tlwib\nB94E\tlwibs\nB94F\tlwis\nB950\tlwiss\nB951\tlwing\nB952\tlwij\nB953\tlwich\nB954\tlwik\nB955\tlwit\nB956\tlwip\nB957\tlwih\nB958\tlyu\nB959\tlyug\nB95A\tlyukk\nB95B\tlyugs\nB95C\tlyun\nB95D\tlyunj\nB95E\tlyunh\nB95F\tlyud\nB960\tlyul\nB961\tlyulg\nB962\tlyulm\nB963\tlyulb\nB964\tlyuls\nB965\tlyult\nB966\tlyulp\nB967\tlyulh\nB968\tlyum\nB969\tlyub\nB96A\tlyubs\nB96B\tlyus\nB96C\tlyuss\nB96D\tlyung\nB96E\tlyuj\nB96F\tlyuch\nB970\tlyuk\nB971\tlyut\nB972\tlyup\nB973\tlyuh\nB974\tleu\nB975\tleug\nB976\tleukk\nB977\tleugs\nB978\tleun\nB979\tleunj\nB97A\tleunh\nB97B\tleud\nB97C\tleul\nB97D\tleulg\nB97E\tleulm\nB97F\tleulb\nB980\tleuls\nB981\tleult\nB982\tleulp\nB983\tleulh\nB984\tleum\nB985\tleub\nB986\tleubs\nB987\tleus\nB988\tleuss\nB989\tleung\nB98A\tleuj\nB98B\tleuch\nB98C\tleuk\nB98D\tleut\nB98E\tleup\nB98F\tleuh\nB990\tlui\nB991\tluig\nB992\tluikk\nB993\tluigs\nB994\tluin\nB995\tluinj\nB996\tluinh\nB997\tluid\nB998\tluil\nB999\tluilg\nB99A\tluilm\nB99B\tluilb\nB99C\tluils\nB99D\tluilt\nB99E\tluilp\nB99F\tluilh\nB9A0\tluim\nB9A1\tluib\nB9A2\tluibs\nB9A3\tluis\nB9A4\tluiss\nB9A5\tluing\nB9A6\tluij\nB9A7\tluich\nB9A8\tluik\nB9A9\tluit\nB9AA\tluip\nB9AB\tluih\nB9AC\tli\nB9AD\tlig\nB9AE\tlikk\nB9AF\tligs\nB9B0\tlin\nB9B1\tlinj\nB9B2\tlinh\nB9B3\tlid\nB9B4\tlil\nB9B5\tlilg\nB9B6\tlilm\nB9B7\tlilb\nB9B8\tlils\nB9B9\tlilt\nB9BA\tlilp\nB9BB\tlilh\nB9BC\tlim\nB9BD\tlib\nB9BE\tlibs\nB9BF\tlis\nB9C0\tliss\nB9C1\tling\nB9C2\tlij\nB9C3\tlich\nB9C4\tlik\nB9C5\tlit\nB9C6\tlip\nB9C7\tlih\nB9C8\tma\nB9C9\tmag\nB9CA\tmakk\nB9CB\tmags\nB9CC\tman\nB9CD\tmanj\nB9CE\tmanh\nB9CF\tmad\nB9D0\tmal\nB9D1\tmalg\nB9D2\tmalm\nB9D3\tmalb\nB9D4\tmals\nB9D5\tmalt\nB9D6\tmalp\nB9D7\tmalh\nB9D8\tmam\nB9D9\tmab\nB9DA\tmabs\nB9DB\tmas\nB9DC\tmass\nB9DD\tmang\nB9DE\tmaj\nB9DF\tmach\nB9E0\tmak\nB9E1\tmat\nB9E2\tmap\nB9E3\tmah\nB9E4\tmae\nB9E5\tmaeg\nB9E6\tmaekk\nB9E7\tmaegs\nB9E8\tmaen\nB9E9\tmaenj\nB9EA\tmaenh\nB9EB\tmaed\nB9EC\tmael\nB9ED\tmaelg\nB9EE\tmaelm\nB9EF\tmaelb\nB9F0\tmaels\nB9F1\tmaelt\nB9F2\tmaelp\nB9F3\tmaelh\nB9F4\tmaem\nB9F5\tmaeb\nB9F6\tmaebs\nB9F7\tmaes\nB9F8\tmaess\nB9F9\tmaeng\nB9FA\tmaej\nB9FB\tmaech\nB9FC\tmaek\nB9FD\tmaet\nB9FE\tmaep\nB9FF\tmaeh\nBA00\tmya\nBA01\tmyag\nBA02\tmyakk\nBA03\tmyags\nBA04\tmyan\nBA05\tmyanj\nBA06\tmyanh\nBA07\tmyad\nBA08\tmyal\nBA09\tmyalg\nBA0A\tmyalm\nBA0B\tmyalb\nBA0C\tmyals\nBA0D\tmyalt\nBA0E\tmyalp\nBA0F\tmyalh\nBA10\tmyam\nBA11\tmyab\nBA12\tmyabs\nBA13\tmyas\nBA14\tmyass\nBA15\tmyang\nBA16\tmyaj\nBA17\tmyach\nBA18\tmyak\nBA19\tmyat\nBA1A\tmyap\nBA1B\tmyah\nBA1C\tmyae\nBA1D\tmyaeg\nBA1E\tmyaekk\nBA1F\tmyaegs\nBA20\tmyaen\nBA21\tmyaenj\nBA22\tmyaenh\nBA23\tmyaed\nBA24\tmyael\nBA25\tmyaelg\nBA26\tmyaelm\nBA27\tmyaelb\nBA28\tmyaels\nBA29\tmyaelt\nBA2A\tmyaelp\nBA2B\tmyaelh\nBA2C\tmyaem\nBA2D\tmyaeb\nBA2E\tmyaebs\nBA2F\tmyaes\nBA30\tmyaess\nBA31\tmyaeng\nBA32\tmyaej\nBA33\tmyaech\nBA34\tmyaek\nBA35\tmyaet\nBA36\tmyaep\nBA37\tmyaeh\nBA38\tmeo\nBA39\tmeog\nBA3A\tmeokk\nBA3B\tmeogs\nBA3C\tmeon\nBA3D\tmeonj\nBA3E\tmeonh\nBA3F\tmeod\nBA40\tmeol\nBA41\tmeolg\nBA42\tmeolm\nBA43\tmeolb\nBA44\tmeols\nBA45\tmeolt\nBA46\tmeolp\nBA47\tmeolh\nBA48\tmeom\nBA49\tmeob\nBA4A\tmeobs\nBA4B\tmeos\nBA4C\tmeoss\nBA4D\tmeong\nBA4E\tmeoj\nBA4F\tmeoch\nBA50\tmeok\nBA51\tmeot\nBA52\tmeop\nBA53\tmeoh\nBA54\tme\nBA55\tmeg\nBA56\tmekk\nBA57\tmegs\nBA58\tmen\nBA59\tmenj\nBA5A\tmenh\nBA5B\tmed\nBA5C\tmel\nBA5D\tmelg\nBA5E\tmelm\nBA5F\tmelb\nBA60\tmels\nBA61\tmelt\nBA62\tmelp\nBA63\tmelh\nBA64\tmem\nBA65\tmeb\nBA66\tmebs\nBA67\tmes\nBA68\tmess\nBA69\tmeng\nBA6A\tmej\nBA6B\tmech\nBA6C\tmek\nBA6D\tmet\nBA6E\tmep\nBA6F\tmeh\nBA70\tmyeo\nBA71\tmyeog\nBA72\tmyeokk\nBA73\tmyeogs\nBA74\tmyeon\nBA75\tmyeonj\nBA76\tmyeonh\nBA77\tmyeod\nBA78\tmyeol\nBA79\tmyeolg\nBA7A\tmyeolm\nBA7B\tmyeolb\nBA7C\tmyeols\nBA7D\tmyeolt\nBA7E\tmyeolp\nBA7F\tmyeolh\nBA80\tmyeom\nBA81\tmyeob\nBA82\tmyeobs\nBA83\tmyeos\nBA84\tmyeoss\nBA85\tmyeong\nBA86\tmyeoj\nBA87\tmyeoch\nBA88\tmyeok\nBA89\tmyeot\nBA8A\tmyeop\nBA8B\tmyeoh\nBA8C\tmye\nBA8D\tmyeg\nBA8E\tmyekk\nBA8F\tmyegs\nBA90\tmyen\nBA91\tmyenj\nBA92\tmyenh\nBA93\tmyed\nBA94\tmyel\nBA95\tmyelg\nBA96\tmyelm\nBA97\tmyelb\nBA98\tmyels\nBA99\tmyelt\nBA9A\tmyelp\nBA9B\tmyelh\nBA9C\tmyem\nBA9D\tmyeb\nBA9E\tmyebs\nBA9F\tmyes\nBAA0\tmyess\nBAA1\tmyeng\nBAA2\tmyej\nBAA3\tmyech\nBAA4\tmyek\nBAA5\tmyet\nBAA6\tmyep\nBAA7\tmyeh\nBAA8\tmo\nBAA9\tmog\nBAAA\tmokk\nBAAB\tmogs\nBAAC\tmon\nBAAD\tmonj\nBAAE\tmonh\nBAAF\tmod\nBAB0\tmol\nBAB1\tmolg\nBAB2\tmolm\nBAB3\tmolb\nBAB4\tmols\nBAB5\tmolt\nBAB6\tmolp\nBAB7\tmolh\nBAB8\tmom\nBAB9\tmob\nBABA\tmobs\nBABB\tmos\nBABC\tmoss\nBABD\tmong\nBABE\tmoj\nBABF\tmoch\nBAC0\tmok\nBAC1\tmot\nBAC2\tmop\nBAC3\tmoh\nBAC4\tmwa\nBAC5\tmwag\nBAC6\tmwakk\nBAC7\tmwags\nBAC8\tmwan\nBAC9\tmwanj\nBACA\tmwanh\nBACB\tmwad\nBACC\tmwal\nBACD\tmwalg\nBACE\tmwalm\nBACF\tmwalb\nBAD0\tmwals\nBAD1\tmwalt\nBAD2\tmwalp\nBAD3\tmwalh\nBAD4\tmwam\nBAD5\tmwab\nBAD6\tmwabs\nBAD7\tmwas\nBAD8\tmwass\nBAD9\tmwang\nBADA\tmwaj\nBADB\tmwach\nBADC\tmwak\nBADD\tmwat\nBADE\tmwap\nBADF\tmwah\nBAE0\tmwae\nBAE1\tmwaeg\nBAE2\tmwaekk\nBAE3\tmwaegs\nBAE4\tmwaen\nBAE5\tmwaenj\nBAE6\tmwaenh\nBAE7\tmwaed\nBAE8\tmwael\nBAE9\tmwaelg\nBAEA\tmwaelm\nBAEB\tmwaelb\nBAEC\tmwaels\nBAED\tmwaelt\nBAEE\tmwaelp\nBAEF\tmwaelh\nBAF0\tmwaem\nBAF1\tmwaeb\nBAF2\tmwaebs\nBAF3\tmwaes\nBAF4\tmwaess\nBAF5\tmwaeng\nBAF6\tmwaej\nBAF7\tmwaech\nBAF8\tmwaek\nBAF9\tmwaet\nBAFA\tmwaep\nBAFB\tmwaeh\nBAFC\tmoe\nBAFD\tmoeg\nBAFE\tmoekk\nBAFF\tmoegs\nBB00\tmoen\nBB01\tmoenj\nBB02\tmoenh\nBB03\tmoed\nBB04\tmoel\nBB05\tmoelg\nBB06\tmoelm\nBB07\tmoelb\nBB08\tmoels\nBB09\tmoelt\nBB0A\tmoelp\nBB0B\tmoelh\nBB0C\tmoem\nBB0D\tmoeb\nBB0E\tmoebs\nBB0F\tmoes\nBB10\tmoess\nBB11\tmoeng\nBB12\tmoej\nBB13\tmoech\nBB14\tmoek\nBB15\tmoet\nBB16\tmoep\nBB17\tmoeh\nBB18\tmyo\nBB19\tmyog\nBB1A\tmyokk\nBB1B\tmyogs\nBB1C\tmyon\nBB1D\tmyonj\nBB1E\tmyonh\nBB1F\tmyod\nBB20\tmyol\nBB21\tmyolg\nBB22\tmyolm\nBB23\tmyolb\nBB24\tmyols\nBB25\tmyolt\nBB26\tmyolp\nBB27\tmyolh\nBB28\tmyom\nBB29\tmyob\nBB2A\tmyobs\nBB2B\tmyos\nBB2C\tmyoss\nBB2D\tmyong\nBB2E\tmyoj\nBB2F\tmyoch\nBB30\tmyok\nBB31\tmyot\nBB32\tmyop\nBB33\tmyoh\nBB34\tmu\nBB35\tmug\nBB36\tmukk\nBB37\tmugs\nBB38\tmun\nBB39\tmunj\nBB3A\tmunh\nBB3B\tmud\nBB3C\tmul\nBB3D\tmulg\nBB3E\tmulm\nBB3F\tmulb\nBB40\tmuls\nBB41\tmult\nBB42\tmulp\nBB43\tmulh\nBB44\tmum\nBB45\tmub\nBB46\tmubs\nBB47\tmus\nBB48\tmuss\nBB49\tmung\nBB4A\tmuj\nBB4B\tmuch\nBB4C\tmuk\nBB4D\tmut\nBB4E\tmup\nBB4F\tmuh\nBB50\tmwo\nBB51\tmwog\nBB52\tmwokk\nBB53\tmwogs\nBB54\tmwon\nBB55\tmwonj\nBB56\tmwonh\nBB57\tmwod\nBB58\tmwol\nBB59\tmwolg\nBB5A\tmwolm\nBB5B\tmwolb\nBB5C\tmwols\nBB5D\tmwolt\nBB5E\tmwolp\nBB5F\tmwolh\nBB60\tmwom\nBB61\tmwob\nBB62\tmwobs\nBB63\tmwos\nBB64\tmwoss\nBB65\tmwong\nBB66\tmwoj\nBB67\tmwoch\nBB68\tmwok\nBB69\tmwot\nBB6A\tmwop\nBB6B\tmwoh\nBB6C\tmwe\nBB6D\tmweg\nBB6E\tmwekk\nBB6F\tmwegs\nBB70\tmwen\nBB71\tmwenj\nBB72\tmwenh\nBB73\tmwed\nBB74\tmwel\nBB75\tmwelg\nBB76\tmwelm\nBB77\tmwelb\nBB78\tmwels\nBB79\tmwelt\nBB7A\tmwelp\nBB7B\tmwelh\nBB7C\tmwem\nBB7D\tmweb\nBB7E\tmwebs\nBB7F\tmwes\nBB80\tmwess\nBB81\tmweng\nBB82\tmwej\nBB83\tmwech\nBB84\tmwek\nBB85\tmwet\nBB86\tmwep\nBB87\tmweh\nBB88\tmwi\nBB89\tmwig\nBB8A\tmwikk\nBB8B\tmwigs\nBB8C\tmwin\nBB8D\tmwinj\nBB8E\tmwinh\nBB8F\tmwid\nBB90\tmwil\nBB91\tmwilg\nBB92\tmwilm\nBB93\tmwilb\nBB94\tmwils\nBB95\tmwilt\nBB96\tmwilp\nBB97\tmwilh\nBB98\tmwim\nBB99\tmwib\nBB9A\tmwibs\nBB9B\tmwis\nBB9C\tmwiss\nBB9D\tmwing\nBB9E\tmwij\nBB9F\tmwich\nBBA0\tmwik\nBBA1\tmwit\nBBA2\tmwip\nBBA3\tmwih\nBBA4\tmyu\nBBA5\tmyug\nBBA6\tmyukk\nBBA7\tmyugs\nBBA8\tmyun\nBBA9\tmyunj\nBBAA\tmyunh\nBBAB\tmyud\nBBAC\tmyul\nBBAD\tmyulg\nBBAE\tmyulm\nBBAF\tmyulb\nBBB0\tmyuls\nBBB1\tmyult\nBBB2\tmyulp\nBBB3\tmyulh\nBBB4\tmyum\nBBB5\tmyub\nBBB6\tmyubs\nBBB7\tmyus\nBBB8\tmyuss\nBBB9\tmyung\nBBBA\tmyuj\nBBBB\tmyuch\nBBBC\tmyuk\nBBBD\tmyut\nBBBE\tmyup\nBBBF\tmyuh\nBBC0\tmeu\nBBC1\tmeug\nBBC2\tmeukk\nBBC3\tmeugs\nBBC4\tmeun\nBBC5\tmeunj\nBBC6\tmeunh\nBBC7\tmeud\nBBC8\tmeul\nBBC9\tmeulg\nBBCA\tmeulm\nBBCB\tmeulb\nBBCC\tmeuls\nBBCD\tmeult\nBBCE\tmeulp\nBBCF\tmeulh\nBBD0\tmeum\nBBD1\tmeub\nBBD2\tmeubs\nBBD3\tmeus\nBBD4\tmeuss\nBBD5\tmeung\nBBD6\tmeuj\nBBD7\tmeuch\nBBD8\tmeuk\nBBD9\tmeut\nBBDA\tmeup\nBBDB\tmeuh\nBBDC\tmui\nBBDD\tmuig\nBBDE\tmuikk\nBBDF\tmuigs\nBBE0\tmuin\nBBE1\tmuinj\nBBE2\tmuinh\nBBE3\tmuid\nBBE4\tmuil\nBBE5\tmuilg\nBBE6\tmuilm\nBBE7\tmuilb\nBBE8\tmuils\nBBE9\tmuilt\nBBEA\tmuilp\nBBEB\tmuilh\nBBEC\tmuim\nBBED\tmuib\nBBEE\tmuibs\nBBEF\tmuis\nBBF0\tmuiss\nBBF1\tmuing\nBBF2\tmuij\nBBF3\tmuich\nBBF4\tmuik\nBBF5\tmuit\nBBF6\tmuip\nBBF7\tmuih\nBBF8\tmi\nBBF9\tmig\nBBFA\tmikk\nBBFB\tmigs\nBBFC\tmin\nBBFD\tminj\nBBFE\tminh\nBBFF\tmid\nBC00\tmil\nBC01\tmilg\nBC02\tmilm\nBC03\tmilb\nBC04\tmils\nBC05\tmilt\nBC06\tmilp\nBC07\tmilh\nBC08\tmim\nBC09\tmib\nBC0A\tmibs\nBC0B\tmis\nBC0C\tmiss\nBC0D\tming\nBC0E\tmij\nBC0F\tmich\nBC10\tmik\nBC11\tmit\nBC12\tmip\nBC13\tmih\nBC14\tba\nBC15\tbag\nBC16\tbakk\nBC17\tbags\nBC18\tban\nBC19\tbanj\nBC1A\tbanh\nBC1B\tbad\nBC1C\tbal\nBC1D\tbalg\nBC1E\tbalm\nBC1F\tbalb\nBC20\tbals\nBC21\tbalt\nBC22\tbalp\nBC23\tbalh\nBC24\tbam\nBC25\tbab\nBC26\tbabs\nBC27\tbas\nBC28\tbass\nBC29\tbang\nBC2A\tbaj\nBC2B\tbach\nBC2C\tbak\nBC2D\tbat\nBC2E\tbap\nBC2F\tbah\nBC30\tbae\nBC31\tbaeg\nBC32\tbaekk\nBC33\tbaegs\nBC34\tbaen\nBC35\tbaenj\nBC36\tbaenh\nBC37\tbaed\nBC38\tbael\nBC39\tbaelg\nBC3A\tbaelm\nBC3B\tbaelb\nBC3C\tbaels\nBC3D\tbaelt\nBC3E\tbaelp\nBC3F\tbaelh\nBC40\tbaem\nBC41\tbaeb\nBC42\tbaebs\nBC43\tbaes\nBC44\tbaess\nBC45\tbaeng\nBC46\tbaej\nBC47\tbaech\nBC48\tbaek\nBC49\tbaet\nBC4A\tbaep\nBC4B\tbaeh\nBC4C\tbya\nBC4D\tbyag\nBC4E\tbyakk\nBC4F\tbyags\nBC50\tbyan\nBC51\tbyanj\nBC52\tbyanh\nBC53\tbyad\nBC54\tbyal\nBC55\tbyalg\nBC56\tbyalm\nBC57\tbyalb\nBC58\tbyals\nBC59\tbyalt\nBC5A\tbyalp\nBC5B\tbyalh\nBC5C\tbyam\nBC5D\tbyab\nBC5E\tbyabs\nBC5F\tbyas\nBC60\tbyass\nBC61\tbyang\nBC62\tbyaj\nBC63\tbyach\nBC64\tbyak\nBC65\tbyat\nBC66\tbyap\nBC67\tbyah\nBC68\tbyae\nBC69\tbyaeg\nBC6A\tbyaekk\nBC6B\tbyaegs\nBC6C\tbyaen\nBC6D\tbyaenj\nBC6E\tbyaenh\nBC6F\tbyaed\nBC70\tbyael\nBC71\tbyaelg\nBC72\tbyaelm\nBC73\tbyaelb\nBC74\tbyaels\nBC75\tbyaelt\nBC76\tbyaelp\nBC77\tbyaelh\nBC78\tbyaem\nBC79\tbyaeb\nBC7A\tbyaebs\nBC7B\tbyaes\nBC7C\tbyaess\nBC7D\tbyaeng\nBC7E\tbyaej\nBC7F\tbyaech\nBC80\tbyaek\nBC81\tbyaet\nBC82\tbyaep\nBC83\tbyaeh\nBC84\tbeo\nBC85\tbeog\nBC86\tbeokk\nBC87\tbeogs\nBC88\tbeon\nBC89\tbeonj\nBC8A\tbeonh\nBC8B\tbeod\nBC8C\tbeol\nBC8D\tbeolg\nBC8E\tbeolm\nBC8F\tbeolb\nBC90\tbeols\nBC91\tbeolt\nBC92\tbeolp\nBC93\tbeolh\nBC94\tbeom\nBC95\tbeob\nBC96\tbeobs\nBC97\tbeos\nBC98\tbeoss\nBC99\tbeong\nBC9A\tbeoj\nBC9B\tbeoch\nBC9C\tbeok\nBC9D\tbeot\nBC9E\tbeop\nBC9F\tbeoh\nBCA0\tbe\nBCA1\tbeg\nBCA2\tbekk\nBCA3\tbegs\nBCA4\tben\nBCA5\tbenj\nBCA6\tbenh\nBCA7\tbed\nBCA8\tbel\nBCA9\tbelg\nBCAA\tbelm\nBCAB\tbelb\nBCAC\tbels\nBCAD\tbelt\nBCAE\tbelp\nBCAF\tbelh\nBCB0\tbem\nBCB1\tbeb\nBCB2\tbebs\nBCB3\tbes\nBCB4\tbess\nBCB5\tbeng\nBCB6\tbej\nBCB7\tbech\nBCB8\tbek\nBCB9\tbet\nBCBA\tbep\nBCBB\tbeh\nBCBC\tbyeo\nBCBD\tbyeog\nBCBE\tbyeokk\nBCBF\tbyeogs\nBCC0\tbyeon\nBCC1\tbyeonj\nBCC2\tbyeonh\nBCC3\tbyeod\nBCC4\tbyeol\nBCC5\tbyeolg\nBCC6\tbyeolm\nBCC7\tbyeolb\nBCC8\tbyeols\nBCC9\tbyeolt\nBCCA\tbyeolp\nBCCB\tbyeolh\nBCCC\tbyeom\nBCCD\tbyeob\nBCCE\tbyeobs\nBCCF\tbyeos\nBCD0\tbyeoss\nBCD1\tbyeong\nBCD2\tbyeoj\nBCD3\tbyeoch\nBCD4\tbyeok\nBCD5\tbyeot\nBCD6\tbyeop\nBCD7\tbyeoh\nBCD8\tbye\nBCD9\tbyeg\nBCDA\tbyekk\nBCDB\tbyegs\nBCDC\tbyen\nBCDD\tbyenj\nBCDE\tbyenh\nBCDF\tbyed\nBCE0\tbyel\nBCE1\tbyelg\nBCE2\tbyelm\nBCE3\tbyelb\nBCE4\tbyels\nBCE5\tbyelt\nBCE6\tbyelp\nBCE7\tbyelh\nBCE8\tbyem\nBCE9\tbyeb\nBCEA\tbyebs\nBCEB\tbyes\nBCEC\tbyess\nBCED\tbyeng\nBCEE\tbyej\nBCEF\tbyech\nBCF0\tbyek\nBCF1\tbyet\nBCF2\tbyep\nBCF3\tbyeh\nBCF4\tbo\nBCF5\tbog\nBCF6\tbokk\nBCF7\tbogs\nBCF8\tbon\nBCF9\tbonj\nBCFA\tbonh\nBCFB\tbod\nBCFC\tbol\nBCFD\tbolg\nBCFE\tbolm\nBCFF\tbolb\nBD00\tbols\nBD01\tbolt\nBD02\tbolp\nBD03\tbolh\nBD04\tbom\nBD05\tbob\nBD06\tbobs\nBD07\tbos\nBD08\tboss\nBD09\tbong\nBD0A\tboj\nBD0B\tboch\nBD0C\tbok\nBD0D\tbot\nBD0E\tbop\nBD0F\tboh\nBD10\tbwa\nBD11\tbwag\nBD12\tbwakk\nBD13\tbwags\nBD14\tbwan\nBD15\tbwanj\nBD16\tbwanh\nBD17\tbwad\nBD18\tbwal\nBD19\tbwalg\nBD1A\tbwalm\nBD1B\tbwalb\nBD1C\tbwals\nBD1D\tbwalt\nBD1E\tbwalp\nBD1F\tbwalh\nBD20\tbwam\nBD21\tbwab\nBD22\tbwabs\nBD23\tbwas\nBD24\tbwass\nBD25\tbwang\nBD26\tbwaj\nBD27\tbwach\nBD28\tbwak\nBD29\tbwat\nBD2A\tbwap\nBD2B\tbwah\nBD2C\tbwae\nBD2D\tbwaeg\nBD2E\tbwaekk\nBD2F\tbwaegs\nBD30\tbwaen\nBD31\tbwaenj\nBD32\tbwaenh\nBD33\tbwaed\nBD34\tbwael\nBD35\tbwaelg\nBD36\tbwaelm\nBD37\tbwaelb\nBD38\tbwaels\nBD39\tbwaelt\nBD3A\tbwaelp\nBD3B\tbwaelh\nBD3C\tbwaem\nBD3D\tbwaeb\nBD3E\tbwaebs\nBD3F\tbwaes\nBD40\tbwaess\nBD41\tbwaeng\nBD42\tbwaej\nBD43\tbwaech\nBD44\tbwaek\nBD45\tbwaet\nBD46\tbwaep\nBD47\tbwaeh\nBD48\tboe\nBD49\tboeg\nBD4A\tboekk\nBD4B\tboegs\nBD4C\tboen\nBD4D\tboenj\nBD4E\tboenh\nBD4F\tboed\nBD50\tboel\nBD51\tboelg\nBD52\tboelm\nBD53\tboelb\nBD54\tboels\nBD55\tboelt\nBD56\tboelp\nBD57\tboelh\nBD58\tboem\nBD59\tboeb\nBD5A\tboebs\nBD5B\tboes\nBD5C\tboess\nBD5D\tboeng\nBD5E\tboej\nBD5F\tboech\nBD60\tboek\nBD61\tboet\nBD62\tboep\nBD63\tboeh\nBD64\tbyo\nBD65\tbyog\nBD66\tbyokk\nBD67\tbyogs\nBD68\tbyon\nBD69\tbyonj\nBD6A\tbyonh\nBD6B\tbyod\nBD6C\tbyol\nBD6D\tbyolg\nBD6E\tbyolm\nBD6F\tbyolb\nBD70\tbyols\nBD71\tbyolt\nBD72\tbyolp\nBD73\tbyolh\nBD74\tbyom\nBD75\tbyob\nBD76\tbyobs\nBD77\tbyos\nBD78\tbyoss\nBD79\tbyong\nBD7A\tbyoj\nBD7B\tbyoch\nBD7C\tbyok\nBD7D\tbyot\nBD7E\tbyop\nBD7F\tbyoh\nBD80\tbu\nBD81\tbug\nBD82\tbukk\nBD83\tbugs\nBD84\tbun\nBD85\tbunj\nBD86\tbunh\nBD87\tbud\nBD88\tbul\nBD89\tbulg\nBD8A\tbulm\nBD8B\tbulb\nBD8C\tbuls\nBD8D\tbult\nBD8E\tbulp\nBD8F\tbulh\nBD90\tbum\nBD91\tbub\nBD92\tbubs\nBD93\tbus\nBD94\tbuss\nBD95\tbung\nBD96\tbuj\nBD97\tbuch\nBD98\tbuk\nBD99\tbut\nBD9A\tbup\nBD9B\tbuh\nBD9C\tbwo\nBD9D\tbwog\nBD9E\tbwokk\nBD9F\tbwogs\nBDA0\tbwon\nBDA1\tbwonj\nBDA2\tbwonh\nBDA3\tbwod\nBDA4\tbwol\nBDA5\tbwolg\nBDA6\tbwolm\nBDA7\tbwolb\nBDA8\tbwols\nBDA9\tbwolt\nBDAA\tbwolp\nBDAB\tbwolh\nBDAC\tbwom\nBDAD\tbwob\nBDAE\tbwobs\nBDAF\tbwos\nBDB0\tbwoss\nBDB1\tbwong\nBDB2\tbwoj\nBDB3\tbwoch\nBDB4\tbwok\nBDB5\tbwot\nBDB6\tbwop\nBDB7\tbwoh\nBDB8\tbwe\nBDB9\tbweg\nBDBA\tbwekk\nBDBB\tbwegs\nBDBC\tbwen\nBDBD\tbwenj\nBDBE\tbwenh\nBDBF\tbwed\nBDC0\tbwel\nBDC1\tbwelg\nBDC2\tbwelm\nBDC3\tbwelb\nBDC4\tbwels\nBDC5\tbwelt\nBDC6\tbwelp\nBDC7\tbwelh\nBDC8\tbwem\nBDC9\tbweb\nBDCA\tbwebs\nBDCB\tbwes\nBDCC\tbwess\nBDCD\tbweng\nBDCE\tbwej\nBDCF\tbwech\nBDD0\tbwek\nBDD1\tbwet\nBDD2\tbwep\nBDD3\tbweh\nBDD4\tbwi\nBDD5\tbwig\nBDD6\tbwikk\nBDD7\tbwigs\nBDD8\tbwin\nBDD9\tbwinj\nBDDA\tbwinh\nBDDB\tbwid\nBDDC\tbwil\nBDDD\tbwilg\nBDDE\tbwilm\nBDDF\tbwilb\nBDE0\tbwils\nBDE1\tbwilt\nBDE2\tbwilp\nBDE3\tbwilh\nBDE4\tbwim\nBDE5\tbwib\nBDE6\tbwibs\nBDE7\tbwis\nBDE8\tbwiss\nBDE9\tbwing\nBDEA\tbwij\nBDEB\tbwich\nBDEC\tbwik\nBDED\tbwit\nBDEE\tbwip\nBDEF\tbwih\nBDF0\tbyu\nBDF1\tbyug\nBDF2\tbyukk\nBDF3\tbyugs\nBDF4\tbyun\nBDF5\tbyunj\nBDF6\tbyunh\nBDF7\tbyud\nBDF8\tbyul\nBDF9\tbyulg\nBDFA\tbyulm\nBDFB\tbyulb\nBDFC\tbyuls\nBDFD\tbyult\nBDFE\tbyulp\nBDFF\tbyulh\nBE00\tbyum\nBE01\tbyub\nBE02\tbyubs\nBE03\tbyus\nBE04\tbyuss\nBE05\tbyung\nBE06\tbyuj\nBE07\tbyuch\nBE08\tbyuk\nBE09\tbyut\nBE0A\tbyup\nBE0B\tbyuh\nBE0C\tbeu\nBE0D\tbeug\nBE0E\tbeukk\nBE0F\tbeugs\nBE10\tbeun\nBE11\tbeunj\nBE12\tbeunh\nBE13\tbeud\nBE14\tbeul\nBE15\tbeulg\nBE16\tbeulm\nBE17\tbeulb\nBE18\tbeuls\nBE19\tbeult\nBE1A\tbeulp\nBE1B\tbeulh\nBE1C\tbeum\nBE1D\tbeub\nBE1E\tbeubs\nBE1F\tbeus\nBE20\tbeuss\nBE21\tbeung\nBE22\tbeuj\nBE23\tbeuch\nBE24\tbeuk\nBE25\tbeut\nBE26\tbeup\nBE27\tbeuh\nBE28\tbui\nBE29\tbuig\nBE2A\tbuikk\nBE2B\tbuigs\nBE2C\tbuin\nBE2D\tbuinj\nBE2E\tbuinh\nBE2F\tbuid\nBE30\tbuil\nBE31\tbuilg\nBE32\tbuilm\nBE33\tbuilb\nBE34\tbuils\nBE35\tbuilt\nBE36\tbuilp\nBE37\tbuilh\nBE38\tbuim\nBE39\tbuib\nBE3A\tbuibs\nBE3B\tbuis\nBE3C\tbuiss\nBE3D\tbuing\nBE3E\tbuij\nBE3F\tbuich\nBE40\tbuik\nBE41\tbuit\nBE42\tbuip\nBE43\tbuih\nBE44\tbi\nBE45\tbig\nBE46\tbikk\nBE47\tbigs\nBE48\tbin\nBE49\tbinj\nBE4A\tbinh\nBE4B\tbid\nBE4C\tbil\nBE4D\tbilg\nBE4E\tbilm\nBE4F\tbilb\nBE50\tbils\nBE51\tbilt\nBE52\tbilp\nBE53\tbilh\nBE54\tbim\nBE55\tbib\nBE56\tbibs\nBE57\tbis\nBE58\tbiss\nBE59\tbing\nBE5A\tbij\nBE5B\tbich\nBE5C\tbik\nBE5D\tbit\nBE5E\tbip\nBE5F\tbih\nBE60\tppa\nBE61\tppag\nBE62\tppakk\nBE63\tppags\nBE64\tppan\nBE65\tppanj\nBE66\tppanh\nBE67\tppad\nBE68\tppal\nBE69\tppalg\nBE6A\tppalm\nBE6B\tppalb\nBE6C\tppals\nBE6D\tppalt\nBE6E\tppalp\nBE6F\tppalh\nBE70\tppam\nBE71\tppab\nBE72\tppabs\nBE73\tppas\nBE74\tppass\nBE75\tppang\nBE76\tppaj\nBE77\tppach\nBE78\tppak\nBE79\tppat\nBE7A\tppap\nBE7B\tppah\nBE7C\tppae\nBE7D\tppaeg\nBE7E\tppaekk\nBE7F\tppaegs\nBE80\tppaen\nBE81\tppaenj\nBE82\tppaenh\nBE83\tppaed\nBE84\tppael\nBE85\tppaelg\nBE86\tppaelm\nBE87\tppaelb\nBE88\tppaels\nBE89\tppaelt\nBE8A\tppaelp\nBE8B\tppaelh\nBE8C\tppaem\nBE8D\tppaeb\nBE8E\tppaebs\nBE8F\tppaes\nBE90\tppaess\nBE91\tppaeng\nBE92\tppaej\nBE93\tppaech\nBE94\tppaek\nBE95\tppaet\nBE96\tppaep\nBE97\tppaeh\nBE98\tppya\nBE99\tppyag\nBE9A\tppyakk\nBE9B\tppyags\nBE9C\tppyan\nBE9D\tppyanj\nBE9E\tppyanh\nBE9F\tppyad\nBEA0\tppyal\nBEA1\tppyalg\nBEA2\tppyalm\nBEA3\tppyalb\nBEA4\tppyals\nBEA5\tppyalt\nBEA6\tppyalp\nBEA7\tppyalh\nBEA8\tppyam\nBEA9\tppyab\nBEAA\tppyabs\nBEAB\tppyas\nBEAC\tppyass\nBEAD\tppyang\nBEAE\tppyaj\nBEAF\tppyach\nBEB0\tppyak\nBEB1\tppyat\nBEB2\tppyap\nBEB3\tppyah\nBEB4\tppyae\nBEB5\tppyaeg\nBEB6\tppyaekk\nBEB7\tppyaegs\nBEB8\tppyaen\nBEB9\tppyaenj\nBEBA\tppyaenh\nBEBB\tppyaed\nBEBC\tppyael\nBEBD\tppyaelg\nBEBE\tppyaelm\nBEBF\tppyaelb\nBEC0\tppyaels\nBEC1\tppyaelt\nBEC2\tppyaelp\nBEC3\tppyaelh\nBEC4\tppyaem\nBEC5\tppyaeb\nBEC6\tppyaebs\nBEC7\tppyaes\nBEC8\tppyaess\nBEC9\tppyaeng\nBECA\tppyaej\nBECB\tppyaech\nBECC\tppyaek\nBECD\tppyaet\nBECE\tppyaep\nBECF\tppyaeh\nBED0\tppeo\nBED1\tppeog\nBED2\tppeokk\nBED3\tppeogs\nBED4\tppeon\nBED5\tppeonj\nBED6\tppeonh\nBED7\tppeod\nBED8\tppeol\nBED9\tppeolg\nBEDA\tppeolm\nBEDB\tppeolb\nBEDC\tppeols\nBEDD\tppeolt\nBEDE\tppeolp\nBEDF\tppeolh\nBEE0\tppeom\nBEE1\tppeob\nBEE2\tppeobs\nBEE3\tppeos\nBEE4\tppeoss\nBEE5\tppeong\nBEE6\tppeoj\nBEE7\tppeoch\nBEE8\tppeok\nBEE9\tppeot\nBEEA\tppeop\nBEEB\tppeoh\nBEEC\tppe\nBEED\tppeg\nBEEE\tppekk\nBEEF\tppegs\nBEF0\tppen\nBEF1\tppenj\nBEF2\tppenh\nBEF3\tpped\nBEF4\tppel\nBEF5\tppelg\nBEF6\tppelm\nBEF7\tppelb\nBEF8\tppels\nBEF9\tppelt\nBEFA\tppelp\nBEFB\tppelh\nBEFC\tppem\nBEFD\tppeb\nBEFE\tppebs\nBEFF\tppes\nBF00\tppess\nBF01\tppeng\nBF02\tppej\nBF03\tppech\nBF04\tppek\nBF05\tppet\nBF06\tppep\nBF07\tppeh\nBF08\tppyeo\nBF09\tppyeog\nBF0A\tppyeokk\nBF0B\tppyeogs\nBF0C\tppyeon\nBF0D\tppyeonj\nBF0E\tppyeonh\nBF0F\tppyeod\nBF10\tppyeol\nBF11\tppyeolg\nBF12\tppyeolm\nBF13\tppyeolb\nBF14\tppyeols\nBF15\tppyeolt\nBF16\tppyeolp\nBF17\tppyeolh\nBF18\tppyeom\nBF19\tppyeob\nBF1A\tppyeobs\nBF1B\tppyeos\nBF1C\tppyeoss\nBF1D\tppyeong\nBF1E\tppyeoj\nBF1F\tppyeoch\nBF20\tppyeok\nBF21\tppyeot\nBF22\tppyeop\nBF23\tppyeoh\nBF24\tppye\nBF25\tppyeg\nBF26\tppyekk\nBF27\tppyegs\nBF28\tppyen\nBF29\tppyenj\nBF2A\tppyenh\nBF2B\tppyed\nBF2C\tppyel\nBF2D\tppyelg\nBF2E\tppyelm\nBF2F\tppyelb\nBF30\tppyels\nBF31\tppyelt\nBF32\tppyelp\nBF33\tppyelh\nBF34\tppyem\nBF35\tppyeb\nBF36\tppyebs\nBF37\tppyes\nBF38\tppyess\nBF39\tppyeng\nBF3A\tppyej\nBF3B\tppyech\nBF3C\tppyek\nBF3D\tppyet\nBF3E\tppyep\nBF3F\tppyeh\nBF40\tppo\nBF41\tppog\nBF42\tppokk\nBF43\tppogs\nBF44\tppon\nBF45\tpponj\nBF46\tpponh\nBF47\tppod\nBF48\tppol\nBF49\tppolg\nBF4A\tppolm\nBF4B\tppolb\nBF4C\tppols\nBF4D\tppolt\nBF4E\tppolp\nBF4F\tppolh\nBF50\tppom\nBF51\tppob\nBF52\tppobs\nBF53\tppos\nBF54\tpposs\nBF55\tppong\nBF56\tppoj\nBF57\tppoch\nBF58\tppok\nBF59\tppot\nBF5A\tppop\nBF5B\tppoh\nBF5C\tppwa\nBF5D\tppwag\nBF5E\tppwakk\nBF5F\tppwags\nBF60\tppwan\nBF61\tppwanj\nBF62\tppwanh\nBF63\tppwad\nBF64\tppwal\nBF65\tppwalg\nBF66\tppwalm\nBF67\tppwalb\nBF68\tppwals\nBF69\tppwalt\nBF6A\tppwalp\nBF6B\tppwalh\nBF6C\tppwam\nBF6D\tppwab\nBF6E\tppwabs\nBF6F\tppwas\nBF70\tppwass\nBF71\tppwang\nBF72\tppwaj\nBF73\tppwach\nBF74\tppwak\nBF75\tppwat\nBF76\tppwap\nBF77\tppwah\nBF78\tppwae\nBF79\tppwaeg\nBF7A\tppwaekk\nBF7B\tppwaegs\nBF7C\tppwaen\nBF7D\tppwaenj\nBF7E\tppwaenh\nBF7F\tppwaed\nBF80\tppwael\nBF81\tppwaelg\nBF82\tppwaelm\nBF83\tppwaelb\nBF84\tppwaels\nBF85\tppwaelt\nBF86\tppwaelp\nBF87\tppwaelh\nBF88\tppwaem\nBF89\tppwaeb\nBF8A\tppwaebs\nBF8B\tppwaes\nBF8C\tppwaess\nBF8D\tppwaeng\nBF8E\tppwaej\nBF8F\tppwaech\nBF90\tppwaek\nBF91\tppwaet\nBF92\tppwaep\nBF93\tppwaeh\nBF94\tppoe\nBF95\tppoeg\nBF96\tppoekk\nBF97\tppoegs\nBF98\tppoen\nBF99\tppoenj\nBF9A\tppoenh\nBF9B\tppoed\nBF9C\tppoel\nBF9D\tppoelg\nBF9E\tppoelm\nBF9F\tppoelb\nBFA0\tppoels\nBFA1\tppoelt\nBFA2\tppoelp\nBFA3\tppoelh\nBFA4\tppoem\nBFA5\tppoeb\nBFA6\tppoebs\nBFA7\tppoes\nBFA8\tppoess\nBFA9\tppoeng\nBFAA\tppoej\nBFAB\tppoech\nBFAC\tppoek\nBFAD\tppoet\nBFAE\tppoep\nBFAF\tppoeh\nBFB0\tppyo\nBFB1\tppyog\nBFB2\tppyokk\nBFB3\tppyogs\nBFB4\tppyon\nBFB5\tppyonj\nBFB6\tppyonh\nBFB7\tppyod\nBFB8\tppyol\nBFB9\tppyolg\nBFBA\tppyolm\nBFBB\tppyolb\nBFBC\tppyols\nBFBD\tppyolt\nBFBE\tppyolp\nBFBF\tppyolh\nBFC0\tppyom\nBFC1\tppyob\nBFC2\tppyobs\nBFC3\tppyos\nBFC4\tppyoss\nBFC5\tppyong\nBFC6\tppyoj\nBFC7\tppyoch\nBFC8\tppyok\nBFC9\tppyot\nBFCA\tppyop\nBFCB\tppyoh\nBFCC\tppu\nBFCD\tppug\nBFCE\tppukk\nBFCF\tppugs\nBFD0\tppun\nBFD1\tppunj\nBFD2\tppunh\nBFD3\tppud\nBFD4\tppul\nBFD5\tppulg\nBFD6\tppulm\nBFD7\tppulb\nBFD8\tppuls\nBFD9\tppult\nBFDA\tppulp\nBFDB\tppulh\nBFDC\tppum\nBFDD\tppub\nBFDE\tppubs\nBFDF\tppus\nBFE0\tppuss\nBFE1\tppung\nBFE2\tppuj\nBFE3\tppuch\nBFE4\tppuk\nBFE5\tpput\nBFE6\tppup\nBFE7\tppuh\nBFE8\tppwo\nBFE9\tppwog\nBFEA\tppwokk\nBFEB\tppwogs\nBFEC\tppwon\nBFED\tppwonj\nBFEE\tppwonh\nBFEF\tppwod\nBFF0\tppwol\nBFF1\tppwolg\nBFF2\tppwolm\nBFF3\tppwolb\nBFF4\tppwols\nBFF5\tppwolt\nBFF6\tppwolp\nBFF7\tppwolh\nBFF8\tppwom\nBFF9\tppwob\nBFFA\tppwobs\nBFFB\tppwos\nBFFC\tppwoss\nBFFD\tppwong\nBFFE\tppwoj\nBFFF\tppwoch\nC000\tppwok\nC001\tppwot\nC002\tppwop\nC003\tppwoh\nC004\tppwe\nC005\tppweg\nC006\tppwekk\nC007\tppwegs\nC008\tppwen\nC009\tppwenj\nC00A\tppwenh\nC00B\tppwed\nC00C\tppwel\nC00D\tppwelg\nC00E\tppwelm\nC00F\tppwelb\nC010\tppwels\nC011\tppwelt\nC012\tppwelp\nC013\tppwelh\nC014\tppwem\nC015\tppweb\nC016\tppwebs\nC017\tppwes\nC018\tppwess\nC019\tppweng\nC01A\tppwej\nC01B\tppwech\nC01C\tppwek\nC01D\tppwet\nC01E\tppwep\nC01F\tppweh\nC020\tppwi\nC021\tppwig\nC022\tppwikk\nC023\tppwigs\nC024\tppwin\nC025\tppwinj\nC026\tppwinh\nC027\tppwid\nC028\tppwil\nC029\tppwilg\nC02A\tppwilm\nC02B\tppwilb\nC02C\tppwils\nC02D\tppwilt\nC02E\tppwilp\nC02F\tppwilh\nC030\tppwim\nC031\tppwib\nC032\tppwibs\nC033\tppwis\nC034\tppwiss\nC035\tppwing\nC036\tppwij\nC037\tppwich\nC038\tppwik\nC039\tppwit\nC03A\tppwip\nC03B\tppwih\nC03C\tppyu\nC03D\tppyug\nC03E\tppyukk\nC03F\tppyugs\nC040\tppyun\nC041\tppyunj\nC042\tppyunh\nC043\tppyud\nC044\tppyul\nC045\tppyulg\nC046\tppyulm\nC047\tppyulb\nC048\tppyuls\nC049\tppyult\nC04A\tppyulp\nC04B\tppyulh\nC04C\tppyum\nC04D\tppyub\nC04E\tppyubs\nC04F\tppyus\nC050\tppyuss\nC051\tppyung\nC052\tppyuj\nC053\tppyuch\nC054\tppyuk\nC055\tppyut\nC056\tppyup\nC057\tppyuh\nC058\tppeu\nC059\tppeug\nC05A\tppeukk\nC05B\tppeugs\nC05C\tppeun\nC05D\tppeunj\nC05E\tppeunh\nC05F\tppeud\nC060\tppeul\nC061\tppeulg\nC062\tppeulm\nC063\tppeulb\nC064\tppeuls\nC065\tppeult\nC066\tppeulp\nC067\tppeulh\nC068\tppeum\nC069\tppeub\nC06A\tppeubs\nC06B\tppeus\nC06C\tppeuss\nC06D\tppeung\nC06E\tppeuj\nC06F\tppeuch\nC070\tppeuk\nC071\tppeut\nC072\tppeup\nC073\tppeuh\nC074\tppui\nC075\tppuig\nC076\tppuikk\nC077\tppuigs\nC078\tppuin\nC079\tppuinj\nC07A\tppuinh\nC07B\tppuid\nC07C\tppuil\nC07D\tppuilg\nC07E\tppuilm\nC07F\tppuilb\nC080\tppuils\nC081\tppuilt\nC082\tppuilp\nC083\tppuilh\nC084\tppuim\nC085\tppuib\nC086\tppuibs\nC087\tppuis\nC088\tppuiss\nC089\tppuing\nC08A\tppuij\nC08B\tppuich\nC08C\tppuik\nC08D\tppuit\nC08E\tppuip\nC08F\tppuih\nC090\tppi\nC091\tppig\nC092\tppikk\nC093\tppigs\nC094\tppin\nC095\tppinj\nC096\tppinh\nC097\tppid\nC098\tppil\nC099\tppilg\nC09A\tppilm\nC09B\tppilb\nC09C\tppils\nC09D\tppilt\nC09E\tppilp\nC09F\tppilh\nC0A0\tppim\nC0A1\tppib\nC0A2\tppibs\nC0A3\tppis\nC0A4\tppiss\nC0A5\tpping\nC0A6\tppij\nC0A7\tppich\nC0A8\tppik\nC0A9\tppit\nC0AA\tppip\nC0AB\tppih\nC0AC\tsa\nC0AD\tsag\nC0AE\tsakk\nC0AF\tsags\nC0B0\tsan\nC0B1\tsanj\nC0B2\tsanh\nC0B3\tsad\nC0B4\tsal\nC0B5\tsalg\nC0B6\tsalm\nC0B7\tsalb\nC0B8\tsals\nC0B9\tsalt\nC0BA\tsalp\nC0BB\tsalh\nC0BC\tsam\nC0BD\tsab\nC0BE\tsabs\nC0BF\tsas\nC0C0\tsass\nC0C1\tsang\nC0C2\tsaj\nC0C3\tsach\nC0C4\tsak\nC0C5\tsat\nC0C6\tsap\nC0C7\tsah\nC0C8\tsae\nC0C9\tsaeg\nC0CA\tsaekk\nC0CB\tsaegs\nC0CC\tsaen\nC0CD\tsaenj\nC0CE\tsaenh\nC0CF\tsaed\nC0D0\tsael\nC0D1\tsaelg\nC0D2\tsaelm\nC0D3\tsaelb\nC0D4\tsaels\nC0D5\tsaelt\nC0D6\tsaelp\nC0D7\tsaelh\nC0D8\tsaem\nC0D9\tsaeb\nC0DA\tsaebs\nC0DB\tsaes\nC0DC\tsaess\nC0DD\tsaeng\nC0DE\tsaej\nC0DF\tsaech\nC0E0\tsaek\nC0E1\tsaet\nC0E2\tsaep\nC0E3\tsaeh\nC0E4\tsya\nC0E5\tsyag\nC0E6\tsyakk\nC0E7\tsyags\nC0E8\tsyan\nC0E9\tsyanj\nC0EA\tsyanh\nC0EB\tsyad\nC0EC\tsyal\nC0ED\tsyalg\nC0EE\tsyalm\nC0EF\tsyalb\nC0F0\tsyals\nC0F1\tsyalt\nC0F2\tsyalp\nC0F3\tsyalh\nC0F4\tsyam\nC0F5\tsyab\nC0F6\tsyabs\nC0F7\tsyas\nC0F8\tsyass\nC0F9\tsyang\nC0FA\tsyaj\nC0FB\tsyach\nC0FC\tsyak\nC0FD\tsyat\nC0FE\tsyap\nC0FF\tsyah\nC100\tsyae\nC101\tsyaeg\nC102\tsyaekk\nC103\tsyaegs\nC104\tsyaen\nC105\tsyaenj\nC106\tsyaenh\nC107\tsyaed\nC108\tsyael\nC109\tsyaelg\nC10A\tsyaelm\nC10B\tsyaelb\nC10C\tsyaels\nC10D\tsyaelt\nC10E\tsyaelp\nC10F\tsyaelh\nC110\tsyaem\nC111\tsyaeb\nC112\tsyaebs\nC113\tsyaes\nC114\tsyaess\nC115\tsyaeng\nC116\tsyaej\nC117\tsyaech\nC118\tsyaek\nC119\tsyaet\nC11A\tsyaep\nC11B\tsyaeh\nC11C\tseo\nC11D\tseog\nC11E\tseokk\nC11F\tseogs\nC120\tseon\nC121\tseonj\nC122\tseonh\nC123\tseod\nC124\tseol\nC125\tseolg\nC126\tseolm\nC127\tseolb\nC128\tseols\nC129\tseolt\nC12A\tseolp\nC12B\tseolh\nC12C\tseom\nC12D\tseob\nC12E\tseobs\nC12F\tseos\nC130\tseoss\nC131\tseong\nC132\tseoj\nC133\tseoch\nC134\tseok\nC135\tseot\nC136\tseop\nC137\tseoh\nC138\tse\nC139\tseg\nC13A\tsekk\nC13B\tsegs\nC13C\tsen\nC13D\tsenj\nC13E\tsenh\nC13F\tsed\nC140\tsel\nC141\tselg\nC142\tselm\nC143\tselb\nC144\tsels\nC145\tselt\nC146\tselp\nC147\tselh\nC148\tsem\nC149\tseb\nC14A\tsebs\nC14B\tses\nC14C\tsess\nC14D\tseng\nC14E\tsej\nC14F\tsech\nC150\tsek\nC151\tset\nC152\tsep\nC153\tseh\nC154\tsyeo\nC155\tsyeog\nC156\tsyeokk\nC157\tsyeogs\nC158\tsyeon\nC159\tsyeonj\nC15A\tsyeonh\nC15B\tsyeod\nC15C\tsyeol\nC15D\tsyeolg\nC15E\tsyeolm\nC15F\tsyeolb\nC160\tsyeols\nC161\tsyeolt\nC162\tsyeolp\nC163\tsyeolh\nC164\tsyeom\nC165\tsyeob\nC166\tsyeobs\nC167\tsyeos\nC168\tsyeoss\nC169\tsyeong\nC16A\tsyeoj\nC16B\tsyeoch\nC16C\tsyeok\nC16D\tsyeot\nC16E\tsyeop\nC16F\tsyeoh\nC170\tsye\nC171\tsyeg\nC172\tsyekk\nC173\tsyegs\nC174\tsyen\nC175\tsyenj\nC176\tsyenh\nC177\tsyed\nC178\tsyel\nC179\tsyelg\nC17A\tsyelm\nC17B\tsyelb\nC17C\tsyels\nC17D\tsyelt\nC17E\tsyelp\nC17F\tsyelh\nC180\tsyem\nC181\tsyeb\nC182\tsyebs\nC183\tsyes\nC184\tsyess\nC185\tsyeng\nC186\tsyej\nC187\tsyech\nC188\tsyek\nC189\tsyet\nC18A\tsyep\nC18B\tsyeh\nC18C\tso\nC18D\tsog\nC18E\tsokk\nC18F\tsogs\nC190\tson\nC191\tsonj\nC192\tsonh\nC193\tsod\nC194\tsol\nC195\tsolg\nC196\tsolm\nC197\tsolb\nC198\tsols\nC199\tsolt\nC19A\tsolp\nC19B\tsolh\nC19C\tsom\nC19D\tsob\nC19E\tsobs\nC19F\tsos\nC1A0\tsoss\nC1A1\tsong\nC1A2\tsoj\nC1A3\tsoch\nC1A4\tsok\nC1A5\tsot\nC1A6\tsop\nC1A7\tsoh\nC1A8\tswa\nC1A9\tswag\nC1AA\tswakk\nC1AB\tswags\nC1AC\tswan\nC1AD\tswanj\nC1AE\tswanh\nC1AF\tswad\nC1B0\tswal\nC1B1\tswalg\nC1B2\tswalm\nC1B3\tswalb\nC1B4\tswals\nC1B5\tswalt\nC1B6\tswalp\nC1B7\tswalh\nC1B8\tswam\nC1B9\tswab\nC1BA\tswabs\nC1BB\tswas\nC1BC\tswass\nC1BD\tswang\nC1BE\tswaj\nC1BF\tswach\nC1C0\tswak\nC1C1\tswat\nC1C2\tswap\nC1C3\tswah\nC1C4\tswae\nC1C5\tswaeg\nC1C6\tswaekk\nC1C7\tswaegs\nC1C8\tswaen\nC1C9\tswaenj\nC1CA\tswaenh\nC1CB\tswaed\nC1CC\tswael\nC1CD\tswaelg\nC1CE\tswaelm\nC1CF\tswaelb\nC1D0\tswaels\nC1D1\tswaelt\nC1D2\tswaelp\nC1D3\tswaelh\nC1D4\tswaem\nC1D5\tswaeb\nC1D6\tswaebs\nC1D7\tswaes\nC1D8\tswaess\nC1D9\tswaeng\nC1DA\tswaej\nC1DB\tswaech\nC1DC\tswaek\nC1DD\tswaet\nC1DE\tswaep\nC1DF\tswaeh\nC1E0\tsoe\nC1E1\tsoeg\nC1E2\tsoekk\nC1E3\tsoegs\nC1E4\tsoen\nC1E5\tsoenj\nC1E6\tsoenh\nC1E7\tsoed\nC1E8\tsoel\nC1E9\tsoelg\nC1EA\tsoelm\nC1EB\tsoelb\nC1EC\tsoels\nC1ED\tsoelt\nC1EE\tsoelp\nC1EF\tsoelh\nC1F0\tsoem\nC1F1\tsoeb\nC1F2\tsoebs\nC1F3\tsoes\nC1F4\tsoess\nC1F5\tsoeng\nC1F6\tsoej\nC1F7\tsoech\nC1F8\tsoek\nC1F9\tsoet\nC1FA\tsoep\nC1FB\tsoeh\nC1FC\tsyo\nC1FD\tsyog\nC1FE\tsyokk\nC1FF\tsyogs\nC200\tsyon\nC201\tsyonj\nC202\tsyonh\nC203\tsyod\nC204\tsyol\nC205\tsyolg\nC206\tsyolm\nC207\tsyolb\nC208\tsyols\nC209\tsyolt\nC20A\tsyolp\nC20B\tsyolh\nC20C\tsyom\nC20D\tsyob\nC20E\tsyobs\nC20F\tsyos\nC210\tsyoss\nC211\tsyong\nC212\tsyoj\nC213\tsyoch\nC214\tsyok\nC215\tsyot\nC216\tsyop\nC217\tsyoh\nC218\tsu\nC219\tsug\nC21A\tsukk\nC21B\tsugs\nC21C\tsun\nC21D\tsunj\nC21E\tsunh\nC21F\tsud\nC220\tsul\nC221\tsulg\nC222\tsulm\nC223\tsulb\nC224\tsuls\nC225\tsult\nC226\tsulp\nC227\tsulh\nC228\tsum\nC229\tsub\nC22A\tsubs\nC22B\tsus\nC22C\tsuss\nC22D\tsung\nC22E\tsuj\nC22F\tsuch\nC230\tsuk\nC231\tsut\nC232\tsup\nC233\tsuh\nC234\tswo\nC235\tswog\nC236\tswokk\nC237\tswogs\nC238\tswon\nC239\tswonj\nC23A\tswonh\nC23B\tswod\nC23C\tswol\nC23D\tswolg\nC23E\tswolm\nC23F\tswolb\nC240\tswols\nC241\tswolt\nC242\tswolp\nC243\tswolh\nC244\tswom\nC245\tswob\nC246\tswobs\nC247\tswos\nC248\tswoss\nC249\tswong\nC24A\tswoj\nC24B\tswoch\nC24C\tswok\nC24D\tswot\nC24E\tswop\nC24F\tswoh\nC250\tswe\nC251\tsweg\nC252\tswekk\nC253\tswegs\nC254\tswen\nC255\tswenj\nC256\tswenh\nC257\tswed\nC258\tswel\nC259\tswelg\nC25A\tswelm\nC25B\tswelb\nC25C\tswels\nC25D\tswelt\nC25E\tswelp\nC25F\tswelh\nC260\tswem\nC261\tsweb\nC262\tswebs\nC263\tswes\nC264\tswess\nC265\tsweng\nC266\tswej\nC267\tswech\nC268\tswek\nC269\tswet\nC26A\tswep\nC26B\tsweh\nC26C\tswi\nC26D\tswig\nC26E\tswikk\nC26F\tswigs\nC270\tswin\nC271\tswinj\nC272\tswinh\nC273\tswid\nC274\tswil\nC275\tswilg\nC276\tswilm\nC277\tswilb\nC278\tswils\nC279\tswilt\nC27A\tswilp\nC27B\tswilh\nC27C\tswim\nC27D\tswib\nC27E\tswibs\nC27F\tswis\nC280\tswiss\nC281\tswing\nC282\tswij\nC283\tswich\nC284\tswik\nC285\tswit\nC286\tswip\nC287\tswih\nC288\tsyu\nC289\tsyug\nC28A\tsyukk\nC28B\tsyugs\nC28C\tsyun\nC28D\tsyunj\nC28E\tsyunh\nC28F\tsyud\nC290\tsyul\nC291\tsyulg\nC292\tsyulm\nC293\tsyulb\nC294\tsyuls\nC295\tsyult\nC296\tsyulp\nC297\tsyulh\nC298\tsyum\nC299\tsyub\nC29A\tsyubs\nC29B\tsyus\nC29C\tsyuss\nC29D\tsyung\nC29E\tsyuj\nC29F\tsyuch\nC2A0\tsyuk\nC2A1\tsyut\nC2A2\tsyup\nC2A3\tsyuh\nC2A4\tseu\nC2A5\tseug\nC2A6\tseukk\nC2A7\tseugs\nC2A8\tseun\nC2A9\tseunj\nC2AA\tseunh\nC2AB\tseud\nC2AC\tseul\nC2AD\tseulg\nC2AE\tseulm\nC2AF\tseulb\nC2B0\tseuls\nC2B1\tseult\nC2B2\tseulp\nC2B3\tseulh\nC2B4\tseum\nC2B5\tseub\nC2B6\tseubs\nC2B7\tseus\nC2B8\tseuss\nC2B9\tseung\nC2BA\tseuj\nC2BB\tseuch\nC2BC\tseuk\nC2BD\tseut\nC2BE\tseup\nC2BF\tseuh\nC2C0\tsui\nC2C1\tsuig\nC2C2\tsuikk\nC2C3\tsuigs\nC2C4\tsuin\nC2C5\tsuinj\nC2C6\tsuinh\nC2C7\tsuid\nC2C8\tsuil\nC2C9\tsuilg\nC2CA\tsuilm\nC2CB\tsuilb\nC2CC\tsuils\nC2CD\tsuilt\nC2CE\tsuilp\nC2CF\tsuilh\nC2D0\tsuim\nC2D1\tsuib\nC2D2\tsuibs\nC2D3\tsuis\nC2D4\tsuiss\nC2D5\tsuing\nC2D6\tsuij\nC2D7\tsuich\nC2D8\tsuik\nC2D9\tsuit\nC2DA\tsuip\nC2DB\tsuih\nC2DC\tsi\nC2DD\tsig\nC2DE\tsikk\nC2DF\tsigs\nC2E0\tsin\nC2E1\tsinj\nC2E2\tsinh\nC2E3\tsid\nC2E4\tsil\nC2E5\tsilg\nC2E6\tsilm\nC2E7\tsilb\nC2E8\tsils\nC2E9\tsilt\nC2EA\tsilp\nC2EB\tsilh\nC2EC\tsim\nC2ED\tsib\nC2EE\tsibs\nC2EF\tsis\nC2F0\tsiss\nC2F1\tsing\nC2F2\tsij\nC2F3\tsich\nC2F4\tsik\nC2F5\tsit\nC2F6\tsip\nC2F7\tsih\nC2F8\tssa\nC2F9\tssag\nC2FA\tssakk\nC2FB\tssags\nC2FC\tssan\nC2FD\tssanj\nC2FE\tssanh\nC2FF\tssad\nC300\tssal\nC301\tssalg\nC302\tssalm\nC303\tssalb\nC304\tssals\nC305\tssalt\nC306\tssalp\nC307\tssalh\nC308\tssam\nC309\tssab\nC30A\tssabs\nC30B\tssas\nC30C\tssass\nC30D\tssang\nC30E\tssaj\nC30F\tssach\nC310\tssak\nC311\tssat\nC312\tssap\nC313\tssah\nC314\tssae\nC315\tssaeg\nC316\tssaekk\nC317\tssaegs\nC318\tssaen\nC319\tssaenj\nC31A\tssaenh\nC31B\tssaed\nC31C\tssael\nC31D\tssaelg\nC31E\tssaelm\nC31F\tssaelb\nC320\tssaels\nC321\tssaelt\nC322\tssaelp\nC323\tssaelh\nC324\tssaem\nC325\tssaeb\nC326\tssaebs\nC327\tssaes\nC328\tssaess\nC329\tssaeng\nC32A\tssaej\nC32B\tssaech\nC32C\tssaek\nC32D\tssaet\nC32E\tssaep\nC32F\tssaeh\nC330\tssya\nC331\tssyag\nC332\tssyakk\nC333\tssyags\nC334\tssyan\nC335\tssyanj\nC336\tssyanh\nC337\tssyad\nC338\tssyal\nC339\tssyalg\nC33A\tssyalm\nC33B\tssyalb\nC33C\tssyals\nC33D\tssyalt\nC33E\tssyalp\nC33F\tssyalh\nC340\tssyam\nC341\tssyab\nC342\tssyabs\nC343\tssyas\nC344\tssyass\nC345\tssyang\nC346\tssyaj\nC347\tssyach\nC348\tssyak\nC349\tssyat\nC34A\tssyap\nC34B\tssyah\nC34C\tssyae\nC34D\tssyaeg\nC34E\tssyaekk\nC34F\tssyaegs\nC350\tssyaen\nC351\tssyaenj\nC352\tssyaenh\nC353\tssyaed\nC354\tssyael\nC355\tssyaelg\nC356\tssyaelm\nC357\tssyaelb\nC358\tssyaels\nC359\tssyaelt\nC35A\tssyaelp\nC35B\tssyaelh\nC35C\tssyaem\nC35D\tssyaeb\nC35E\tssyaebs\nC35F\tssyaes\nC360\tssyaess\nC361\tssyaeng\nC362\tssyaej\nC363\tssyaech\nC364\tssyaek\nC365\tssyaet\nC366\tssyaep\nC367\tssyaeh\nC368\tsseo\nC369\tsseog\nC36A\tsseokk\nC36B\tsseogs\nC36C\tsseon\nC36D\tsseonj\nC36E\tsseonh\nC36F\tsseod\nC370\tsseol\nC371\tsseolg\nC372\tsseolm\nC373\tsseolb\nC374\tsseols\nC375\tsseolt\nC376\tsseolp\nC377\tsseolh\nC378\tsseom\nC379\tsseob\nC37A\tsseobs\nC37B\tsseos\nC37C\tsseoss\nC37D\tsseong\nC37E\tsseoj\nC37F\tsseoch\nC380\tsseok\nC381\tsseot\nC382\tsseop\nC383\tsseoh\nC384\tsse\nC385\tsseg\nC386\tssekk\nC387\tssegs\nC388\tssen\nC389\tssenj\nC38A\tssenh\nC38B\tssed\nC38C\tssel\nC38D\tsselg\nC38E\tsselm\nC38F\tsselb\nC390\tssels\nC391\tsselt\nC392\tsselp\nC393\tsselh\nC394\tssem\nC395\tsseb\nC396\tssebs\nC397\tsses\nC398\tssess\nC399\tsseng\nC39A\tssej\nC39B\tssech\nC39C\tssek\nC39D\tsset\nC39E\tssep\nC39F\tsseh\nC3A0\tssyeo\nC3A1\tssyeog\nC3A2\tssyeokk\nC3A3\tssyeogs\nC3A4\tssyeon\nC3A5\tssyeonj\nC3A6\tssyeonh\nC3A7\tssyeod\nC3A8\tssyeol\nC3A9\tssyeolg\nC3AA\tssyeolm\nC3AB\tssyeolb\nC3AC\tssyeols\nC3AD\tssyeolt\nC3AE\tssyeolp\nC3AF\tssyeolh\nC3B0\tssyeom\nC3B1\tssyeob\nC3B2\tssyeobs\nC3B3\tssyeos\nC3B4\tssyeoss\nC3B5\tssyeong\nC3B6\tssyeoj\nC3B7\tssyeoch\nC3B8\tssyeok\nC3B9\tssyeot\nC3BA\tssyeop\nC3BB\tssyeoh\nC3BC\tssye\nC3BD\tssyeg\nC3BE\tssyekk\nC3BF\tssyegs\nC3C0\tssyen\nC3C1\tssyenj\nC3C2\tssyenh\nC3C3\tssyed\nC3C4\tssyel\nC3C5\tssyelg\nC3C6\tssyelm\nC3C7\tssyelb\nC3C8\tssyels\nC3C9\tssyelt\nC3CA\tssyelp\nC3CB\tssyelh\nC3CC\tssyem\nC3CD\tssyeb\nC3CE\tssyebs\nC3CF\tssyes\nC3D0\tssyess\nC3D1\tssyeng\nC3D2\tssyej\nC3D3\tssyech\nC3D4\tssyek\nC3D5\tssyet\nC3D6\tssyep\nC3D7\tssyeh\nC3D8\tsso\nC3D9\tssog\nC3DA\tssokk\nC3DB\tssogs\nC3DC\tsson\nC3DD\tssonj\nC3DE\tssonh\nC3DF\tssod\nC3E0\tssol\nC3E1\tssolg\nC3E2\tssolm\nC3E3\tssolb\nC3E4\tssols\nC3E5\tssolt\nC3E6\tssolp\nC3E7\tssolh\nC3E8\tssom\nC3E9\tssob\nC3EA\tssobs\nC3EB\tssos\nC3EC\tssoss\nC3ED\tssong\nC3EE\tssoj\nC3EF\tssoch\nC3F0\tssok\nC3F1\tssot\nC3F2\tssop\nC3F3\tssoh\nC3F4\tsswa\nC3F5\tsswag\nC3F6\tsswakk\nC3F7\tsswags\nC3F8\tsswan\nC3F9\tsswanj\nC3FA\tsswanh\nC3FB\tsswad\nC3FC\tsswal\nC3FD\tsswalg\nC3FE\tsswalm\nC3FF\tsswalb\nC400\tsswals\nC401\tsswalt\nC402\tsswalp\nC403\tsswalh\nC404\tsswam\nC405\tsswab\nC406\tsswabs\nC407\tsswas\nC408\tsswass\nC409\tsswang\nC40A\tsswaj\nC40B\tsswach\nC40C\tsswak\nC40D\tsswat\nC40E\tsswap\nC40F\tsswah\nC410\tsswae\nC411\tsswaeg\nC412\tsswaekk\nC413\tsswaegs\nC414\tsswaen\nC415\tsswaenj\nC416\tsswaenh\nC417\tsswaed\nC418\tsswael\nC419\tsswaelg\nC41A\tsswaelm\nC41B\tsswaelb\nC41C\tsswaels\nC41D\tsswaelt\nC41E\tsswaelp\nC41F\tsswaelh\nC420\tsswaem\nC421\tsswaeb\nC422\tsswaebs\nC423\tsswaes\nC424\tsswaess\nC425\tsswaeng\nC426\tsswaej\nC427\tsswaech\nC428\tsswaek\nC429\tsswaet\nC42A\tsswaep\nC42B\tsswaeh\nC42C\tssoe\nC42D\tssoeg\nC42E\tssoekk\nC42F\tssoegs\nC430\tssoen\nC431\tssoenj\nC432\tssoenh\nC433\tssoed\nC434\tssoel\nC435\tssoelg\nC436\tssoelm\nC437\tssoelb\nC438\tssoels\nC439\tssoelt\nC43A\tssoelp\nC43B\tssoelh\nC43C\tssoem\nC43D\tssoeb\nC43E\tssoebs\nC43F\tssoes\nC440\tssoess\nC441\tssoeng\nC442\tssoej\nC443\tssoech\nC444\tssoek\nC445\tssoet\nC446\tssoep\nC447\tssoeh\nC448\tssyo\nC449\tssyog\nC44A\tssyokk\nC44B\tssyogs\nC44C\tssyon\nC44D\tssyonj\nC44E\tssyonh\nC44F\tssyod\nC450\tssyol\nC451\tssyolg\nC452\tssyolm\nC453\tssyolb\nC454\tssyols\nC455\tssyolt\nC456\tssyolp\nC457\tssyolh\nC458\tssyom\nC459\tssyob\nC45A\tssyobs\nC45B\tssyos\nC45C\tssyoss\nC45D\tssyong\nC45E\tssyoj\nC45F\tssyoch\nC460\tssyok\nC461\tssyot\nC462\tssyop\nC463\tssyoh\nC464\tssu\nC465\tssug\nC466\tssukk\nC467\tssugs\nC468\tssun\nC469\tssunj\nC46A\tssunh\nC46B\tssud\nC46C\tssul\nC46D\tssulg\nC46E\tssulm\nC46F\tssulb\nC470\tssuls\nC471\tssult\nC472\tssulp\nC473\tssulh\nC474\tssum\nC475\tssub\nC476\tssubs\nC477\tssus\nC478\tssuss\nC479\tssung\nC47A\tssuj\nC47B\tssuch\nC47C\tssuk\nC47D\tssut\nC47E\tssup\nC47F\tssuh\nC480\tsswo\nC481\tsswog\nC482\tsswokk\nC483\tsswogs\nC484\tsswon\nC485\tsswonj\nC486\tsswonh\nC487\tsswod\nC488\tsswol\nC489\tsswolg\nC48A\tsswolm\nC48B\tsswolb\nC48C\tsswols\nC48D\tsswolt\nC48E\tsswolp\nC48F\tsswolh\nC490\tsswom\nC491\tsswob\nC492\tsswobs\nC493\tsswos\nC494\tsswoss\nC495\tsswong\nC496\tsswoj\nC497\tsswoch\nC498\tsswok\nC499\tsswot\nC49A\tsswop\nC49B\tsswoh\nC49C\tsswe\nC49D\tssweg\nC49E\tsswekk\nC49F\tsswegs\nC4A0\tsswen\nC4A1\tsswenj\nC4A2\tsswenh\nC4A3\tsswed\nC4A4\tsswel\nC4A5\tsswelg\nC4A6\tsswelm\nC4A7\tsswelb\nC4A8\tsswels\nC4A9\tsswelt\nC4AA\tsswelp\nC4AB\tsswelh\nC4AC\tsswem\nC4AD\tssweb\nC4AE\tsswebs\nC4AF\tsswes\nC4B0\tsswess\nC4B1\tssweng\nC4B2\tsswej\nC4B3\tsswech\nC4B4\tsswek\nC4B5\tsswet\nC4B6\tsswep\nC4B7\tssweh\nC4B8\tsswi\nC4B9\tsswig\nC4BA\tsswikk\nC4BB\tsswigs\nC4BC\tsswin\nC4BD\tsswinj\nC4BE\tsswinh\nC4BF\tsswid\nC4C0\tsswil\nC4C1\tsswilg\nC4C2\tsswilm\nC4C3\tsswilb\nC4C4\tsswils\nC4C5\tsswilt\nC4C6\tsswilp\nC4C7\tsswilh\nC4C8\tsswim\nC4C9\tsswib\nC4CA\tsswibs\nC4CB\tsswis\nC4CC\tsswiss\nC4CD\tsswing\nC4CE\tsswij\nC4CF\tsswich\nC4D0\tsswik\nC4D1\tsswit\nC4D2\tsswip\nC4D3\tsswih\nC4D4\tssyu\nC4D5\tssyug\nC4D6\tssyukk\nC4D7\tssyugs\nC4D8\tssyun\nC4D9\tssyunj\nC4DA\tssyunh\nC4DB\tssyud\nC4DC\tssyul\nC4DD\tssyulg\nC4DE\tssyulm\nC4DF\tssyulb\nC4E0\tssyuls\nC4E1\tssyult\nC4E2\tssyulp\nC4E3\tssyulh\nC4E4\tssyum\nC4E5\tssyub\nC4E6\tssyubs\nC4E7\tssyus\nC4E8\tssyuss\nC4E9\tssyung\nC4EA\tssyuj\nC4EB\tssyuch\nC4EC\tssyuk\nC4ED\tssyut\nC4EE\tssyup\nC4EF\tssyuh\nC4F0\tsseu\nC4F1\tsseug\nC4F2\tsseukk\nC4F3\tsseugs\nC4F4\tsseun\nC4F5\tsseunj\nC4F6\tsseunh\nC4F7\tsseud\nC4F8\tsseul\nC4F9\tsseulg\nC4FA\tsseulm\nC4FB\tsseulb\nC4FC\tsseuls\nC4FD\tsseult\nC4FE\tsseulp\nC4FF\tsseulh\nC500\tsseum\nC501\tsseub\nC502\tsseubs\nC503\tsseus\nC504\tsseuss\nC505\tsseung\nC506\tsseuj\nC507\tsseuch\nC508\tsseuk\nC509\tsseut\nC50A\tsseup\nC50B\tsseuh\nC50C\tssui\nC50D\tssuig\nC50E\tssuikk\nC50F\tssuigs\nC510\tssuin\nC511\tssuinj\nC512\tssuinh\nC513\tssuid\nC514\tssuil\nC515\tssuilg\nC516\tssuilm\nC517\tssuilb\nC518\tssuils\nC519\tssuilt\nC51A\tssuilp\nC51B\tssuilh\nC51C\tssuim\nC51D\tssuib\nC51E\tssuibs\nC51F\tssuis\nC520\tssuiss\nC521\tssuing\nC522\tssuij\nC523\tssuich\nC524\tssuik\nC525\tssuit\nC526\tssuip\nC527\tssuih\nC528\tssi\nC529\tssig\nC52A\tssikk\nC52B\tssigs\nC52C\tssin\nC52D\tssinj\nC52E\tssinh\nC52F\tssid\nC530\tssil\nC531\tssilg\nC532\tssilm\nC533\tssilb\nC534\tssils\nC535\tssilt\nC536\tssilp\nC537\tssilh\nC538\tssim\nC539\tssib\nC53A\tssibs\nC53B\tssis\nC53C\tssiss\nC53D\tssing\nC53E\tssij\nC53F\tssich\nC540\tssik\nC541\tssit\nC542\tssip\nC543\tssih\nC544\ta\nC545\tag\nC546\takk\nC547\tags\nC548\tan\nC549\tanj\nC54A\tanh\nC54B\tad\nC54C\tal\nC54D\talg\nC54E\talm\nC54F\talb\nC550\tals\nC551\talt\nC552\talp\nC553\talh\nC554\tam\nC555\tab\nC556\tabs\nC557\tas\nC558\tass\nC559\tang\nC55A\taj\nC55B\tach\nC55C\tak\nC55D\tat\nC55E\tap\nC55F\tah\nC560\tae\nC561\taeg\nC562\taekk\nC563\taegs\nC564\taen\nC565\taenj\nC566\taenh\nC567\taed\nC568\tael\nC569\taelg\nC56A\taelm\nC56B\taelb\nC56C\taels\nC56D\taelt\nC56E\taelp\nC56F\taelh\nC570\taem\nC571\taeb\nC572\taebs\nC573\taes\nC574\taess\nC575\taeng\nC576\taej\nC577\taech\nC578\taek\nC579\taet\nC57A\taep\nC57B\taeh\nC57C\tya\nC57D\tyag\nC57E\tyakk\nC57F\tyags\nC580\tyan\nC581\tyanj\nC582\tyanh\nC583\tyad\nC584\tyal\nC585\tyalg\nC586\tyalm\nC587\tyalb\nC588\tyals\nC589\tyalt\nC58A\tyalp\nC58B\tyalh\nC58C\tyam\nC58D\tyab\nC58E\tyabs\nC58F\tyas\nC590\tyass\nC591\tyang\nC592\tyaj\nC593\tyach\nC594\tyak\nC595\tyat\nC596\tyap\nC597\tyah\nC598\tyae\nC599\tyaeg\nC59A\tyaekk\nC59B\tyaegs\nC59C\tyaen\nC59D\tyaenj\nC59E\tyaenh\nC59F\tyaed\nC5A0\tyael\nC5A1\tyaelg\nC5A2\tyaelm\nC5A3\tyaelb\nC5A4\tyaels\nC5A5\tyaelt\nC5A6\tyaelp\nC5A7\tyaelh\nC5A8\tyaem\nC5A9\tyaeb\nC5AA\tyaebs\nC5AB\tyaes\nC5AC\tyaess\nC5AD\tyaeng\nC5AE\tyaej\nC5AF\tyaech\nC5B0\tyaek\nC5B1\tyaet\nC5B2\tyaep\nC5B3\tyaeh\nC5B4\teo\nC5B5\teog\nC5B6\teokk\nC5B7\teogs\nC5B8\teon\nC5B9\teonj\nC5BA\teonh\nC5BB\teod\nC5BC\teol\nC5BD\teolg\nC5BE\teolm\nC5BF\teolb\nC5C0\teols\nC5C1\teolt\nC5C2\teolp\nC5C3\teolh\nC5C4\teom\nC5C5\teob\nC5C6\teobs\nC5C7\teos\nC5C8\teoss\nC5C9\teong\nC5CA\teoj\nC5CB\teoch\nC5CC\teok\nC5CD\teot\nC5CE\teop\nC5CF\teoh\nC5D0\te\nC5D1\teg\nC5D2\tekk\nC5D3\tegs\nC5D4\ten\nC5D5\tenj\nC5D6\tenh\nC5D7\ted\nC5D8\tel\nC5D9\telg\nC5DA\telm\nC5DB\telb\nC5DC\tels\nC5DD\telt\nC5DE\telp\nC5DF\telh\nC5E0\tem\nC5E1\teb\nC5E2\tebs\nC5E3\tes\nC5E4\tess\nC5E5\teng\nC5E6\tej\nC5E7\tech\nC5E8\tek\nC5E9\tet\nC5EA\tep\nC5EB\teh\nC5EC\tyeo\nC5ED\tyeog\nC5EE\tyeokk\nC5EF\tyeogs\nC5F0\tyeon\nC5F1\tyeonj\nC5F2\tyeonh\nC5F3\tyeod\nC5F4\tyeol\nC5F5\tyeolg\nC5F6\tyeolm\nC5F7\tyeolb\nC5F8\tyeols\nC5F9\tyeolt\nC5FA\tyeolp\nC5FB\tyeolh\nC5FC\tyeom\nC5FD\tyeob\nC5FE\tyeobs\nC5FF\tyeos\nC600\tyeoss\nC601\tyeong\nC602\tyeoj\nC603\tyeoch\nC604\tyeok\nC605\tyeot\nC606\tyeop\nC607\tyeoh\nC608\tye\nC609\tyeg\nC60A\tyekk\nC60B\tyegs\nC60C\tyen\nC60D\tyenj\nC60E\tyenh\nC60F\tyed\nC610\tyel\nC611\tyelg\nC612\tyelm\nC613\tyelb\nC614\tyels\nC615\tyelt\nC616\tyelp\nC617\tyelh\nC618\tyem\nC619\tyeb\nC61A\tyebs\nC61B\tyes\nC61C\tyess\nC61D\tyeng\nC61E\tyej\nC61F\tyech\nC620\tyek\nC621\tyet\nC622\tyep\nC623\tyeh\nC624\to\nC625\tog\nC626\tokk\nC627\togs\nC628\ton\nC629\tonj\nC62A\tonh\nC62B\tod\nC62C\tol\nC62D\tolg\nC62E\tolm\nC62F\tolb\nC630\tols\nC631\tolt\nC632\tolp\nC633\tolh\nC634\tom\nC635\tob\nC636\tobs\nC637\tos\nC638\toss\nC639\tong\nC63A\toj\nC63B\toch\nC63C\tok\nC63D\tot\nC63E\top\nC63F\toh\nC640\twa\nC641\twag\nC642\twakk\nC643\twags\nC644\twan\nC645\twanj\nC646\twanh\nC647\twad\nC648\twal\nC649\twalg\nC64A\twalm\nC64B\twalb\nC64C\twals\nC64D\twalt\nC64E\twalp\nC64F\twalh\nC650\twam\nC651\twab\nC652\twabs\nC653\twas\nC654\twass\nC655\twang\nC656\twaj\nC657\twach\nC658\twak\nC659\twat\nC65A\twap\nC65B\twah\nC65C\twae\nC65D\twaeg\nC65E\twaekk\nC65F\twaegs\nC660\twaen\nC661\twaenj\nC662\twaenh\nC663\twaed\nC664\twael\nC665\twaelg\nC666\twaelm\nC667\twaelb\nC668\twaels\nC669\twaelt\nC66A\twaelp\nC66B\twaelh\nC66C\twaem\nC66D\twaeb\nC66E\twaebs\nC66F\twaes\nC670\twaess\nC671\twaeng\nC672\twaej\nC673\twaech\nC674\twaek\nC675\twaet\nC676\twaep\nC677\twaeh\nC678\toe\nC679\toeg\nC67A\toekk\nC67B\toegs\nC67C\toen\nC67D\toenj\nC67E\toenh\nC67F\toed\nC680\toel\nC681\toelg\nC682\toelm\nC683\toelb\nC684\toels\nC685\toelt\nC686\toelp\nC687\toelh\nC688\toem\nC689\toeb\nC68A\toebs\nC68B\toes\nC68C\toess\nC68D\toeng\nC68E\toej\nC68F\toech\nC690\toek\nC691\toet\nC692\toep\nC693\toeh\nC694\tyo\nC695\tyog\nC696\tyokk\nC697\tyogs\nC698\tyon\nC699\tyonj\nC69A\tyonh\nC69B\tyod\nC69C\tyol\nC69D\tyolg\nC69E\tyolm\nC69F\tyolb\nC6A0\tyols\nC6A1\tyolt\nC6A2\tyolp\nC6A3\tyolh\nC6A4\tyom\nC6A5\tyob\nC6A6\tyobs\nC6A7\tyos\nC6A8\tyoss\nC6A9\tyong\nC6AA\tyoj\nC6AB\tyoch\nC6AC\tyok\nC6AD\tyot\nC6AE\tyop\nC6AF\tyoh\nC6B0\tu\nC6B1\tug\nC6B2\tukk\nC6B3\tugs\nC6B4\tun\nC6B5\tunj\nC6B6\tunh\nC6B7\tud\nC6B8\tul\nC6B9\tulg\nC6BA\tulm\nC6BB\tulb\nC6BC\tuls\nC6BD\tult\nC6BE\tulp\nC6BF\tulh\nC6C0\tum\nC6C1\tub\nC6C2\tubs\nC6C3\tus\nC6C4\tuss\nC6C5\tung\nC6C6\tuj\nC6C7\tuch\nC6C8\tuk\nC6C9\tut\nC6CA\tup\nC6CB\tuh\nC6CC\two\nC6CD\twog\nC6CE\twokk\nC6CF\twogs\nC6D0\twon\nC6D1\twonj\nC6D2\twonh\nC6D3\twod\nC6D4\twol\nC6D5\twolg\nC6D6\twolm\nC6D7\twolb\nC6D8\twols\nC6D9\twolt\nC6DA\twolp\nC6DB\twolh\nC6DC\twom\nC6DD\twob\nC6DE\twobs\nC6DF\twos\nC6E0\twoss\nC6E1\twong\nC6E2\twoj\nC6E3\twoch\nC6E4\twok\nC6E5\twot\nC6E6\twop\nC6E7\twoh\nC6E8\twe\nC6E9\tweg\nC6EA\twekk\nC6EB\twegs\nC6EC\twen\nC6ED\twenj\nC6EE\twenh\nC6EF\twed\nC6F0\twel\nC6F1\twelg\nC6F2\twelm\nC6F3\twelb\nC6F4\twels\nC6F5\twelt\nC6F6\twelp\nC6F7\twelh\nC6F8\twem\nC6F9\tweb\nC6FA\twebs\nC6FB\twes\nC6FC\twess\nC6FD\tweng\nC6FE\twej\nC6FF\twech\nC700\twek\nC701\twet\nC702\twep\nC703\tweh\nC704\twi\nC705\twig\nC706\twikk\nC707\twigs\nC708\twin\nC709\twinj\nC70A\twinh\nC70B\twid\nC70C\twil\nC70D\twilg\nC70E\twilm\nC70F\twilb\nC710\twils\nC711\twilt\nC712\twilp\nC713\twilh\nC714\twim\nC715\twib\nC716\twibs\nC717\twis\nC718\twiss\nC719\twing\nC71A\twij\nC71B\twich\nC71C\twik\nC71D\twit\nC71E\twip\nC71F\twih\nC720\tyu\nC721\tyug\nC722\tyukk\nC723\tyugs\nC724\tyun\nC725\tyunj\nC726\tyunh\nC727\tyud\nC728\tyul\nC729\tyulg\nC72A\tyulm\nC72B\tyulb\nC72C\tyuls\nC72D\tyult\nC72E\tyulp\nC72F\tyulh\nC730\tyum\nC731\tyub\nC732\tyubs\nC733\tyus\nC734\tyuss\nC735\tyung\nC736\tyuj\nC737\tyuch\nC738\tyuk\nC739\tyut\nC73A\tyup\nC73B\tyuh\nC73C\teu\nC73D\teug\nC73E\teukk\nC73F\teugs\nC740\teun\nC741\teunj\nC742\teunh\nC743\teud\nC744\teul\nC745\teulg\nC746\teulm\nC747\teulb\nC748\teuls\nC749\teult\nC74A\teulp\nC74B\teulh\nC74C\teum\nC74D\teub\nC74E\teubs\nC74F\teus\nC750\teuss\nC751\teung\nC752\teuj\nC753\teuch\nC754\teuk\nC755\teut\nC756\teup\nC757\teuh\nC758\tui\nC759\tuig\nC75A\tuikk\nC75B\tuigs\nC75C\tuin\nC75D\tuinj\nC75E\tuinh\nC75F\tuid\nC760\tuil\nC761\tuilg\nC762\tuilm\nC763\tuilb\nC764\tuils\nC765\tuilt\nC766\tuilp\nC767\tuilh\nC768\tuim\nC769\tuib\nC76A\tuibs\nC76B\tuis\nC76C\tuiss\nC76D\tuing\nC76E\tuij\nC76F\tuich\nC770\tuik\nC771\tuit\nC772\tuip\nC773\tuih\nC774\ti\nC775\tig\nC776\tikk\nC777\tigs\nC778\tin\nC779\tinj\nC77A\tinh\nC77B\tid\nC77C\til\nC77D\tilg\nC77E\tilm\nC77F\tilb\nC780\tils\nC781\tilt\nC782\tilp\nC783\tilh\nC784\tim\nC785\tib\nC786\tibs\nC787\tis\nC788\tiss\nC789\ting\nC78A\tij\nC78B\tich\nC78C\tik\nC78D\tit\nC78E\tip\nC78F\tih\nC790\tja\nC791\tjag\nC792\tjakk\nC793\tjags\nC794\tjan\nC795\tjanj\nC796\tjanh\nC797\tjad\nC798\tjal\nC799\tjalg\nC79A\tjalm\nC79B\tjalb\nC79C\tjals\nC79D\tjalt\nC79E\tjalp\nC79F\tjalh\nC7A0\tjam\nC7A1\tjab\nC7A2\tjabs\nC7A3\tjas\nC7A4\tjass\nC7A5\tjang\nC7A6\tjaj\nC7A7\tjach\nC7A8\tjak\nC7A9\tjat\nC7AA\tjap\nC7AB\tjah\nC7AC\tjae\nC7AD\tjaeg\nC7AE\tjaekk\nC7AF\tjaegs\nC7B0\tjaen\nC7B1\tjaenj\nC7B2\tjaenh\nC7B3\tjaed\nC7B4\tjael\nC7B5\tjaelg\nC7B6\tjaelm\nC7B7\tjaelb\nC7B8\tjaels\nC7B9\tjaelt\nC7BA\tjaelp\nC7BB\tjaelh\nC7BC\tjaem\nC7BD\tjaeb\nC7BE\tjaebs\nC7BF\tjaes\nC7C0\tjaess\nC7C1\tjaeng\nC7C2\tjaej\nC7C3\tjaech\nC7C4\tjaek\nC7C5\tjaet\nC7C6\tjaep\nC7C7\tjaeh\nC7C8\tjya\nC7C9\tjyag\nC7CA\tjyakk\nC7CB\tjyags\nC7CC\tjyan\nC7CD\tjyanj\nC7CE\tjyanh\nC7CF\tjyad\nC7D0\tjyal\nC7D1\tjyalg\nC7D2\tjyalm\nC7D3\tjyalb\nC7D4\tjyals\nC7D5\tjyalt\nC7D6\tjyalp\nC7D7\tjyalh\nC7D8\tjyam\nC7D9\tjyab\nC7DA\tjyabs\nC7DB\tjyas\nC7DC\tjyass\nC7DD\tjyang\nC7DE\tjyaj\nC7DF\tjyach\nC7E0\tjyak\nC7E1\tjyat\nC7E2\tjyap\nC7E3\tjyah\nC7E4\tjyae\nC7E5\tjyaeg\nC7E6\tjyaekk\nC7E7\tjyaegs\nC7E8\tjyaen\nC7E9\tjyaenj\nC7EA\tjyaenh\nC7EB\tjyaed\nC7EC\tjyael\nC7ED\tjyaelg\nC7EE\tjyaelm\nC7EF\tjyaelb\nC7F0\tjyaels\nC7F1\tjyaelt\nC7F2\tjyaelp\nC7F3\tjyaelh\nC7F4\tjyaem\nC7F5\tjyaeb\nC7F6\tjyaebs\nC7F7\tjyaes\nC7F8\tjyaess\nC7F9\tjyaeng\nC7FA\tjyaej\nC7FB\tjyaech\nC7FC\tjyaek\nC7FD\tjyaet\nC7FE\tjyaep\nC7FF\tjyaeh\nC800\tjeo\nC801\tjeog\nC802\tjeokk\nC803\tjeogs\nC804\tjeon\nC805\tjeonj\nC806\tjeonh\nC807\tjeod\nC808\tjeol\nC809\tjeolg\nC80A\tjeolm\nC80B\tjeolb\nC80C\tjeols\nC80D\tjeolt\nC80E\tjeolp\nC80F\tjeolh\nC810\tjeom\nC811\tjeob\nC812\tjeobs\nC813\tjeos\nC814\tjeoss\nC815\tjeong\nC816\tjeoj\nC817\tjeoch\nC818\tjeok\nC819\tjeot\nC81A\tjeop\nC81B\tjeoh\nC81C\tje\nC81D\tjeg\nC81E\tjekk\nC81F\tjegs\nC820\tjen\nC821\tjenj\nC822\tjenh\nC823\tjed\nC824\tjel\nC825\tjelg\nC826\tjelm\nC827\tjelb\nC828\tjels\nC829\tjelt\nC82A\tjelp\nC82B\tjelh\nC82C\tjem\nC82D\tjeb\nC82E\tjebs\nC82F\tjes\nC830\tjess\nC831\tjeng\nC832\tjej\nC833\tjech\nC834\tjek\nC835\tjet\nC836\tjep\nC837\tjeh\nC838\tjyeo\nC839\tjyeog\nC83A\tjyeokk\nC83B\tjyeogs\nC83C\tjyeon\nC83D\tjyeonj\nC83E\tjyeonh\nC83F\tjyeod\nC840\tjyeol\nC841\tjyeolg\nC842\tjyeolm\nC843\tjyeolb\nC844\tjyeols\nC845\tjyeolt\nC846\tjyeolp\nC847\tjyeolh\nC848\tjyeom\nC849\tjyeob\nC84A\tjyeobs\nC84B\tjyeos\nC84C\tjyeoss\nC84D\tjyeong\nC84E\tjyeoj\nC84F\tjyeoch\nC850\tjyeok\nC851\tjyeot\nC852\tjyeop\nC853\tjyeoh\nC854\tjye\nC855\tjyeg\nC856\tjyekk\nC857\tjyegs\nC858\tjyen\nC859\tjyenj\nC85A\tjyenh\nC85B\tjyed\nC85C\tjyel\nC85D\tjyelg\nC85E\tjyelm\nC85F\tjyelb\nC860\tjyels\nC861\tjyelt\nC862\tjyelp\nC863\tjyelh\nC864\tjyem\nC865\tjyeb\nC866\tjyebs\nC867\tjyes\nC868\tjyess\nC869\tjyeng\nC86A\tjyej\nC86B\tjyech\nC86C\tjyek\nC86D\tjyet\nC86E\tjyep\nC86F\tjyeh\nC870\tjo\nC871\tjog\nC872\tjokk\nC873\tjogs\nC874\tjon\nC875\tjonj\nC876\tjonh\nC877\tjod\nC878\tjol\nC879\tjolg\nC87A\tjolm\nC87B\tjolb\nC87C\tjols\nC87D\tjolt\nC87E\tjolp\nC87F\tjolh\nC880\tjom\nC881\tjob\nC882\tjobs\nC883\tjos\nC884\tjoss\nC885\tjong\nC886\tjoj\nC887\tjoch\nC888\tjok\nC889\tjot\nC88A\tjop\nC88B\tjoh\nC88C\tjwa\nC88D\tjwag\nC88E\tjwakk\nC88F\tjwags\nC890\tjwan\nC891\tjwanj\nC892\tjwanh\nC893\tjwad\nC894\tjwal\nC895\tjwalg\nC896\tjwalm\nC897\tjwalb\nC898\tjwals\nC899\tjwalt\nC89A\tjwalp\nC89B\tjwalh\nC89C\tjwam\nC89D\tjwab\nC89E\tjwabs\nC89F\tjwas\nC8A0\tjwass\nC8A1\tjwang\nC8A2\tjwaj\nC8A3\tjwach\nC8A4\tjwak\nC8A5\tjwat\nC8A6\tjwap\nC8A7\tjwah\nC8A8\tjwae\nC8A9\tjwaeg\nC8AA\tjwaekk\nC8AB\tjwaegs\nC8AC\tjwaen\nC8AD\tjwaenj\nC8AE\tjwaenh\nC8AF\tjwaed\nC8B0\tjwael\nC8B1\tjwaelg\nC8B2\tjwaelm\nC8B3\tjwaelb\nC8B4\tjwaels\nC8B5\tjwaelt\nC8B6\tjwaelp\nC8B7\tjwaelh\nC8B8\tjwaem\nC8B9\tjwaeb\nC8BA\tjwaebs\nC8BB\tjwaes\nC8BC\tjwaess\nC8BD\tjwaeng\nC8BE\tjwaej\nC8BF\tjwaech\nC8C0\tjwaek\nC8C1\tjwaet\nC8C2\tjwaep\nC8C3\tjwaeh\nC8C4\tjoe\nC8C5\tjoeg\nC8C6\tjoekk\nC8C7\tjoegs\nC8C8\tjoen\nC8C9\tjoenj\nC8CA\tjoenh\nC8CB\tjoed\nC8CC\tjoel\nC8CD\tjoelg\nC8CE\tjoelm\nC8CF\tjoelb\nC8D0\tjoels\nC8D1\tjoelt\nC8D2\tjoelp\nC8D3\tjoelh\nC8D4\tjoem\nC8D5\tjoeb\nC8D6\tjoebs\nC8D7\tjoes\nC8D8\tjoess\nC8D9\tjoeng\nC8DA\tjoej\nC8DB\tjoech\nC8DC\tjoek\nC8DD\tjoet\nC8DE\tjoep\nC8DF\tjoeh\nC8E0\tjyo\nC8E1\tjyog\nC8E2\tjyokk\nC8E3\tjyogs\nC8E4\tjyon\nC8E5\tjyonj\nC8E6\tjyonh\nC8E7\tjyod\nC8E8\tjyol\nC8E9\tjyolg\nC8EA\tjyolm\nC8EB\tjyolb\nC8EC\tjyols\nC8ED\tjyolt\nC8EE\tjyolp\nC8EF\tjyolh\nC8F0\tjyom\nC8F1\tjyob\nC8F2\tjyobs\nC8F3\tjyos\nC8F4\tjyoss\nC8F5\tjyong\nC8F6\tjyoj\nC8F7\tjyoch\nC8F8\tjyok\nC8F9\tjyot\nC8FA\tjyop\nC8FB\tjyoh\nC8FC\tju\nC8FD\tjug\nC8FE\tjukk\nC8FF\tjugs\nC900\tjun\nC901\tjunj\nC902\tjunh\nC903\tjud\nC904\tjul\nC905\tjulg\nC906\tjulm\nC907\tjulb\nC908\tjuls\nC909\tjult\nC90A\tjulp\nC90B\tjulh\nC90C\tjum\nC90D\tjub\nC90E\tjubs\nC90F\tjus\nC910\tjuss\nC911\tjung\nC912\tjuj\nC913\tjuch\nC914\tjuk\nC915\tjut\nC916\tjup\nC917\tjuh\nC918\tjwo\nC919\tjwog\nC91A\tjwokk\nC91B\tjwogs\nC91C\tjwon\nC91D\tjwonj\nC91E\tjwonh\nC91F\tjwod\nC920\tjwol\nC921\tjwolg\nC922\tjwolm\nC923\tjwolb\nC924\tjwols\nC925\tjwolt\nC926\tjwolp\nC927\tjwolh\nC928\tjwom\nC929\tjwob\nC92A\tjwobs\nC92B\tjwos\nC92C\tjwoss\nC92D\tjwong\nC92E\tjwoj\nC92F\tjwoch\nC930\tjwok\nC931\tjwot\nC932\tjwop\nC933\tjwoh\nC934\tjwe\nC935\tjweg\nC936\tjwekk\nC937\tjwegs\nC938\tjwen\nC939\tjwenj\nC93A\tjwenh\nC93B\tjwed\nC93C\tjwel\nC93D\tjwelg\nC93E\tjwelm\nC93F\tjwelb\nC940\tjwels\nC941\tjwelt\nC942\tjwelp\nC943\tjwelh\nC944\tjwem\nC945\tjweb\nC946\tjwebs\nC947\tjwes\nC948\tjwess\nC949\tjweng\nC94A\tjwej\nC94B\tjwech\nC94C\tjwek\nC94D\tjwet\nC94E\tjwep\nC94F\tjweh\nC950\tjwi\nC951\tjwig\nC952\tjwikk\nC953\tjwigs\nC954\tjwin\nC955\tjwinj\nC956\tjwinh\nC957\tjwid\nC958\tjwil\nC959\tjwilg\nC95A\tjwilm\nC95B\tjwilb\nC95C\tjwils\nC95D\tjwilt\nC95E\tjwilp\nC95F\tjwilh\nC960\tjwim\nC961\tjwib\nC962\tjwibs\nC963\tjwis\nC964\tjwiss\nC965\tjwing\nC966\tjwij\nC967\tjwich\nC968\tjwik\nC969\tjwit\nC96A\tjwip\nC96B\tjwih\nC96C\tjyu\nC96D\tjyug\nC96E\tjyukk\nC96F\tjyugs\nC970\tjyun\nC971\tjyunj\nC972\tjyunh\nC973\tjyud\nC974\tjyul\nC975\tjyulg\nC976\tjyulm\nC977\tjyulb\nC978\tjyuls\nC979\tjyult\nC97A\tjyulp\nC97B\tjyulh\nC97C\tjyum\nC97D\tjyub\nC97E\tjyubs\nC97F\tjyus\nC980\tjyuss\nC981\tjyung\nC982\tjyuj\nC983\tjyuch\nC984\tjyuk\nC985\tjyut\nC986\tjyup\nC987\tjyuh\nC988\tjeu\nC989\tjeug\nC98A\tjeukk\nC98B\tjeugs\nC98C\tjeun\nC98D\tjeunj\nC98E\tjeunh\nC98F\tjeud\nC990\tjeul\nC991\tjeulg\nC992\tjeulm\nC993\tjeulb\nC994\tjeuls\nC995\tjeult\nC996\tjeulp\nC997\tjeulh\nC998\tjeum\nC999\tjeub\nC99A\tjeubs\nC99B\tjeus\nC99C\tjeuss\nC99D\tjeung\nC99E\tjeuj\nC99F\tjeuch\nC9A0\tjeuk\nC9A1\tjeut\nC9A2\tjeup\nC9A3\tjeuh\nC9A4\tjui\nC9A5\tjuig\nC9A6\tjuikk\nC9A7\tjuigs\nC9A8\tjuin\nC9A9\tjuinj\nC9AA\tjuinh\nC9AB\tjuid\nC9AC\tjuil\nC9AD\tjuilg\nC9AE\tjuilm\nC9AF\tjuilb\nC9B0\tjuils\nC9B1\tjuilt\nC9B2\tjuilp\nC9B3\tjuilh\nC9B4\tjuim\nC9B5\tjuib\nC9B6\tjuibs\nC9B7\tjuis\nC9B8\tjuiss\nC9B9\tjuing\nC9BA\tjuij\nC9BB\tjuich\nC9BC\tjuik\nC9BD\tjuit\nC9BE\tjuip\nC9BF\tjuih\nC9C0\tji\nC9C1\tjig\nC9C2\tjikk\nC9C3\tjigs\nC9C4\tjin\nC9C5\tjinj\nC9C6\tjinh\nC9C7\tjid\nC9C8\tjil\nC9C9\tjilg\nC9CA\tjilm\nC9CB\tjilb\nC9CC\tjils\nC9CD\tjilt\nC9CE\tjilp\nC9CF\tjilh\nC9D0\tjim\nC9D1\tjib\nC9D2\tjibs\nC9D3\tjis\nC9D4\tjiss\nC9D5\tjing\nC9D6\tjij\nC9D7\tjich\nC9D8\tjik\nC9D9\tjit\nC9DA\tjip\nC9DB\tjih\nC9DC\tjja\nC9DD\tjjag\nC9DE\tjjakk\nC9DF\tjjags\nC9E0\tjjan\nC9E1\tjjanj\nC9E2\tjjanh\nC9E3\tjjad\nC9E4\tjjal\nC9E5\tjjalg\nC9E6\tjjalm\nC9E7\tjjalb\nC9E8\tjjals\nC9E9\tjjalt\nC9EA\tjjalp\nC9EB\tjjalh\nC9EC\tjjam\nC9ED\tjjab\nC9EE\tjjabs\nC9EF\tjjas\nC9F0\tjjass\nC9F1\tjjang\nC9F2\tjjaj\nC9F3\tjjach\nC9F4\tjjak\nC9F5\tjjat\nC9F6\tjjap\nC9F7\tjjah\nC9F8\tjjae\nC9F9\tjjaeg\nC9FA\tjjaekk\nC9FB\tjjaegs\nC9FC\tjjaen\nC9FD\tjjaenj\nC9FE\tjjaenh\nC9FF\tjjaed\nCA00\tjjael\nCA01\tjjaelg\nCA02\tjjaelm\nCA03\tjjaelb\nCA04\tjjaels\nCA05\tjjaelt\nCA06\tjjaelp\nCA07\tjjaelh\nCA08\tjjaem\nCA09\tjjaeb\nCA0A\tjjaebs\nCA0B\tjjaes\nCA0C\tjjaess\nCA0D\tjjaeng\nCA0E\tjjaej\nCA0F\tjjaech\nCA10\tjjaek\nCA11\tjjaet\nCA12\tjjaep\nCA13\tjjaeh\nCA14\tjjya\nCA15\tjjyag\nCA16\tjjyakk\nCA17\tjjyags\nCA18\tjjyan\nCA19\tjjyanj\nCA1A\tjjyanh\nCA1B\tjjyad\nCA1C\tjjyal\nCA1D\tjjyalg\nCA1E\tjjyalm\nCA1F\tjjyalb\nCA20\tjjyals\nCA21\tjjyalt\nCA22\tjjyalp\nCA23\tjjyalh\nCA24\tjjyam\nCA25\tjjyab\nCA26\tjjyabs\nCA27\tjjyas\nCA28\tjjyass\nCA29\tjjyang\nCA2A\tjjyaj\nCA2B\tjjyach\nCA2C\tjjyak\nCA2D\tjjyat\nCA2E\tjjyap\nCA2F\tjjyah\nCA30\tjjyae\nCA31\tjjyaeg\nCA32\tjjyaekk\nCA33\tjjyaegs\nCA34\tjjyaen\nCA35\tjjyaenj\nCA36\tjjyaenh\nCA37\tjjyaed\nCA38\tjjyael\nCA39\tjjyaelg\nCA3A\tjjyaelm\nCA3B\tjjyaelb\nCA3C\tjjyaels\nCA3D\tjjyaelt\nCA3E\tjjyaelp\nCA3F\tjjyaelh\nCA40\tjjyaem\nCA41\tjjyaeb\nCA42\tjjyaebs\nCA43\tjjyaes\nCA44\tjjyaess\nCA45\tjjyaeng\nCA46\tjjyaej\nCA47\tjjyaech\nCA48\tjjyaek\nCA49\tjjyaet\nCA4A\tjjyaep\nCA4B\tjjyaeh\nCA4C\tjjeo\nCA4D\tjjeog\nCA4E\tjjeokk\nCA4F\tjjeogs\nCA50\tjjeon\nCA51\tjjeonj\nCA52\tjjeonh\nCA53\tjjeod\nCA54\tjjeol\nCA55\tjjeolg\nCA56\tjjeolm\nCA57\tjjeolb\nCA58\tjjeols\nCA59\tjjeolt\nCA5A\tjjeolp\nCA5B\tjjeolh\nCA5C\tjjeom\nCA5D\tjjeob\nCA5E\tjjeobs\nCA5F\tjjeos\nCA60\tjjeoss\nCA61\tjjeong\nCA62\tjjeoj\nCA63\tjjeoch\nCA64\tjjeok\nCA65\tjjeot\nCA66\tjjeop\nCA67\tjjeoh\nCA68\tjje\nCA69\tjjeg\nCA6A\tjjekk\nCA6B\tjjegs\nCA6C\tjjen\nCA6D\tjjenj\nCA6E\tjjenh\nCA6F\tjjed\nCA70\tjjel\nCA71\tjjelg\nCA72\tjjelm\nCA73\tjjelb\nCA74\tjjels\nCA75\tjjelt\nCA76\tjjelp\nCA77\tjjelh\nCA78\tjjem\nCA79\tjjeb\nCA7A\tjjebs\nCA7B\tjjes\nCA7C\tjjess\nCA7D\tjjeng\nCA7E\tjjej\nCA7F\tjjech\nCA80\tjjek\nCA81\tjjet\nCA82\tjjep\nCA83\tjjeh\nCA84\tjjyeo\nCA85\tjjyeog\nCA86\tjjyeokk\nCA87\tjjyeogs\nCA88\tjjyeon\nCA89\tjjyeonj\nCA8A\tjjyeonh\nCA8B\tjjyeod\nCA8C\tjjyeol\nCA8D\tjjyeolg\nCA8E\tjjyeolm\nCA8F\tjjyeolb\nCA90\tjjyeols\nCA91\tjjyeolt\nCA92\tjjyeolp\nCA93\tjjyeolh\nCA94\tjjyeom\nCA95\tjjyeob\nCA96\tjjyeobs\nCA97\tjjyeos\nCA98\tjjyeoss\nCA99\tjjyeong\nCA9A\tjjyeoj\nCA9B\tjjyeoch\nCA9C\tjjyeok\nCA9D\tjjyeot\nCA9E\tjjyeop\nCA9F\tjjyeoh\nCAA0\tjjye\nCAA1\tjjyeg\nCAA2\tjjyekk\nCAA3\tjjyegs\nCAA4\tjjyen\nCAA5\tjjyenj\nCAA6\tjjyenh\nCAA7\tjjyed\nCAA8\tjjyel\nCAA9\tjjyelg\nCAAA\tjjyelm\nCAAB\tjjyelb\nCAAC\tjjyels\nCAAD\tjjyelt\nCAAE\tjjyelp\nCAAF\tjjyelh\nCAB0\tjjyem\nCAB1\tjjyeb\nCAB2\tjjyebs\nCAB3\tjjyes\nCAB4\tjjyess\nCAB5\tjjyeng\nCAB6\tjjyej\nCAB7\tjjyech\nCAB8\tjjyek\nCAB9\tjjyet\nCABA\tjjyep\nCABB\tjjyeh\nCABC\tjjo\nCABD\tjjog\nCABE\tjjokk\nCABF\tjjogs\nCAC0\tjjon\nCAC1\tjjonj\nCAC2\tjjonh\nCAC3\tjjod\nCAC4\tjjol\nCAC5\tjjolg\nCAC6\tjjolm\nCAC7\tjjolb\nCAC8\tjjols\nCAC9\tjjolt\nCACA\tjjolp\nCACB\tjjolh\nCACC\tjjom\nCACD\tjjob\nCACE\tjjobs\nCACF\tjjos\nCAD0\tjjoss\nCAD1\tjjong\nCAD2\tjjoj\nCAD3\tjjoch\nCAD4\tjjok\nCAD5\tjjot\nCAD6\tjjop\nCAD7\tjjoh\nCAD8\tjjwa\nCAD9\tjjwag\nCADA\tjjwakk\nCADB\tjjwags\nCADC\tjjwan\nCADD\tjjwanj\nCADE\tjjwanh\nCADF\tjjwad\nCAE0\tjjwal\nCAE1\tjjwalg\nCAE2\tjjwalm\nCAE3\tjjwalb\nCAE4\tjjwals\nCAE5\tjjwalt\nCAE6\tjjwalp\nCAE7\tjjwalh\nCAE8\tjjwam\nCAE9\tjjwab\nCAEA\tjjwabs\nCAEB\tjjwas\nCAEC\tjjwass\nCAED\tjjwang\nCAEE\tjjwaj\nCAEF\tjjwach\nCAF0\tjjwak\nCAF1\tjjwat\nCAF2\tjjwap\nCAF3\tjjwah\nCAF4\tjjwae\nCAF5\tjjwaeg\nCAF6\tjjwaekk\nCAF7\tjjwaegs\nCAF8\tjjwaen\nCAF9\tjjwaenj\nCAFA\tjjwaenh\nCAFB\tjjwaed\nCAFC\tjjwael\nCAFD\tjjwaelg\nCAFE\tjjwaelm\nCAFF\tjjwaelb\nCB00\tjjwaels\nCB01\tjjwaelt\nCB02\tjjwaelp\nCB03\tjjwaelh\nCB04\tjjwaem\nCB05\tjjwaeb\nCB06\tjjwaebs\nCB07\tjjwaes\nCB08\tjjwaess\nCB09\tjjwaeng\nCB0A\tjjwaej\nCB0B\tjjwaech\nCB0C\tjjwaek\nCB0D\tjjwaet\nCB0E\tjjwaep\nCB0F\tjjwaeh\nCB10\tjjoe\nCB11\tjjoeg\nCB12\tjjoekk\nCB13\tjjoegs\nCB14\tjjoen\nCB15\tjjoenj\nCB16\tjjoenh\nCB17\tjjoed\nCB18\tjjoel\nCB19\tjjoelg\nCB1A\tjjoelm\nCB1B\tjjoelb\nCB1C\tjjoels\nCB1D\tjjoelt\nCB1E\tjjoelp\nCB1F\tjjoelh\nCB20\tjjoem\nCB21\tjjoeb\nCB22\tjjoebs\nCB23\tjjoes\nCB24\tjjoess\nCB25\tjjoeng\nCB26\tjjoej\nCB27\tjjoech\nCB28\tjjoek\nCB29\tjjoet\nCB2A\tjjoep\nCB2B\tjjoeh\nCB2C\tjjyo\nCB2D\tjjyog\nCB2E\tjjyokk\nCB2F\tjjyogs\nCB30\tjjyon\nCB31\tjjyonj\nCB32\tjjyonh\nCB33\tjjyod\nCB34\tjjyol\nCB35\tjjyolg\nCB36\tjjyolm\nCB37\tjjyolb\nCB38\tjjyols\nCB39\tjjyolt\nCB3A\tjjyolp\nCB3B\tjjyolh\nCB3C\tjjyom\nCB3D\tjjyob\nCB3E\tjjyobs\nCB3F\tjjyos\nCB40\tjjyoss\nCB41\tjjyong\nCB42\tjjyoj\nCB43\tjjyoch\nCB44\tjjyok\nCB45\tjjyot\nCB46\tjjyop\nCB47\tjjyoh\nCB48\tjju\nCB49\tjjug\nCB4A\tjjukk\nCB4B\tjjugs\nCB4C\tjjun\nCB4D\tjjunj\nCB4E\tjjunh\nCB4F\tjjud\nCB50\tjjul\nCB51\tjjulg\nCB52\tjjulm\nCB53\tjjulb\nCB54\tjjuls\nCB55\tjjult\nCB56\tjjulp\nCB57\tjjulh\nCB58\tjjum\nCB59\tjjub\nCB5A\tjjubs\nCB5B\tjjus\nCB5C\tjjuss\nCB5D\tjjung\nCB5E\tjjuj\nCB5F\tjjuch\nCB60\tjjuk\nCB61\tjjut\nCB62\tjjup\nCB63\tjjuh\nCB64\tjjwo\nCB65\tjjwog\nCB66\tjjwokk\nCB67\tjjwogs\nCB68\tjjwon\nCB69\tjjwonj\nCB6A\tjjwonh\nCB6B\tjjwod\nCB6C\tjjwol\nCB6D\tjjwolg\nCB6E\tjjwolm\nCB6F\tjjwolb\nCB70\tjjwols\nCB71\tjjwolt\nCB72\tjjwolp\nCB73\tjjwolh\nCB74\tjjwom\nCB75\tjjwob\nCB76\tjjwobs\nCB77\tjjwos\nCB78\tjjwoss\nCB79\tjjwong\nCB7A\tjjwoj\nCB7B\tjjwoch\nCB7C\tjjwok\nCB7D\tjjwot\nCB7E\tjjwop\nCB7F\tjjwoh\nCB80\tjjwe\nCB81\tjjweg\nCB82\tjjwekk\nCB83\tjjwegs\nCB84\tjjwen\nCB85\tjjwenj\nCB86\tjjwenh\nCB87\tjjwed\nCB88\tjjwel\nCB89\tjjwelg\nCB8A\tjjwelm\nCB8B\tjjwelb\nCB8C\tjjwels\nCB8D\tjjwelt\nCB8E\tjjwelp\nCB8F\tjjwelh\nCB90\tjjwem\nCB91\tjjweb\nCB92\tjjwebs\nCB93\tjjwes\nCB94\tjjwess\nCB95\tjjweng\nCB96\tjjwej\nCB97\tjjwech\nCB98\tjjwek\nCB99\tjjwet\nCB9A\tjjwep\nCB9B\tjjweh\nCB9C\tjjwi\nCB9D\tjjwig\nCB9E\tjjwikk\nCB9F\tjjwigs\nCBA0\tjjwin\nCBA1\tjjwinj\nCBA2\tjjwinh\nCBA3\tjjwid\nCBA4\tjjwil\nCBA5\tjjwilg\nCBA6\tjjwilm\nCBA7\tjjwilb\nCBA8\tjjwils\nCBA9\tjjwilt\nCBAA\tjjwilp\nCBAB\tjjwilh\nCBAC\tjjwim\nCBAD\tjjwib\nCBAE\tjjwibs\nCBAF\tjjwis\nCBB0\tjjwiss\nCBB1\tjjwing\nCBB2\tjjwij\nCBB3\tjjwich\nCBB4\tjjwik\nCBB5\tjjwit\nCBB6\tjjwip\nCBB7\tjjwih\nCBB8\tjjyu\nCBB9\tjjyug\nCBBA\tjjyukk\nCBBB\tjjyugs\nCBBC\tjjyun\nCBBD\tjjyunj\nCBBE\tjjyunh\nCBBF\tjjyud\nCBC0\tjjyul\nCBC1\tjjyulg\nCBC2\tjjyulm\nCBC3\tjjyulb\nCBC4\tjjyuls\nCBC5\tjjyult\nCBC6\tjjyulp\nCBC7\tjjyulh\nCBC8\tjjyum\nCBC9\tjjyub\nCBCA\tjjyubs\nCBCB\tjjyus\nCBCC\tjjyuss\nCBCD\tjjyung\nCBCE\tjjyuj\nCBCF\tjjyuch\nCBD0\tjjyuk\nCBD1\tjjyut\nCBD2\tjjyup\nCBD3\tjjyuh\nCBD4\tjjeu\nCBD5\tjjeug\nCBD6\tjjeukk\nCBD7\tjjeugs\nCBD8\tjjeun\nCBD9\tjjeunj\nCBDA\tjjeunh\nCBDB\tjjeud\nCBDC\tjjeul\nCBDD\tjjeulg\nCBDE\tjjeulm\nCBDF\tjjeulb\nCBE0\tjjeuls\nCBE1\tjjeult\nCBE2\tjjeulp\nCBE3\tjjeulh\nCBE4\tjjeum\nCBE5\tjjeub\nCBE6\tjjeubs\nCBE7\tjjeus\nCBE8\tjjeuss\nCBE9\tjjeung\nCBEA\tjjeuj\nCBEB\tjjeuch\nCBEC\tjjeuk\nCBED\tjjeut\nCBEE\tjjeup\nCBEF\tjjeuh\nCBF0\tjjui\nCBF1\tjjuig\nCBF2\tjjuikk\nCBF3\tjjuigs\nCBF4\tjjuin\nCBF5\tjjuinj\nCBF6\tjjuinh\nCBF7\tjjuid\nCBF8\tjjuil\nCBF9\tjjuilg\nCBFA\tjjuilm\nCBFB\tjjuilb\nCBFC\tjjuils\nCBFD\tjjuilt\nCBFE\tjjuilp\nCBFF\tjjuilh\nCC00\tjjuim\nCC01\tjjuib\nCC02\tjjuibs\nCC03\tjjuis\nCC04\tjjuiss\nCC05\tjjuing\nCC06\tjjuij\nCC07\tjjuich\nCC08\tjjuik\nCC09\tjjuit\nCC0A\tjjuip\nCC0B\tjjuih\nCC0C\tjji\nCC0D\tjjig\nCC0E\tjjikk\nCC0F\tjjigs\nCC10\tjjin\nCC11\tjjinj\nCC12\tjjinh\nCC13\tjjid\nCC14\tjjil\nCC15\tjjilg\nCC16\tjjilm\nCC17\tjjilb\nCC18\tjjils\nCC19\tjjilt\nCC1A\tjjilp\nCC1B\tjjilh\nCC1C\tjjim\nCC1D\tjjib\nCC1E\tjjibs\nCC1F\tjjis\nCC20\tjjiss\nCC21\tjjing\nCC22\tjjij\nCC23\tjjich\nCC24\tjjik\nCC25\tjjit\nCC26\tjjip\nCC27\tjjih\nCC28\tcha\nCC29\tchag\nCC2A\tchakk\nCC2B\tchags\nCC2C\tchan\nCC2D\tchanj\nCC2E\tchanh\nCC2F\tchad\nCC30\tchal\nCC31\tchalg\nCC32\tchalm\nCC33\tchalb\nCC34\tchals\nCC35\tchalt\nCC36\tchalp\nCC37\tchalh\nCC38\tcham\nCC39\tchab\nCC3A\tchabs\nCC3B\tchas\nCC3C\tchass\nCC3D\tchang\nCC3E\tchaj\nCC3F\tchach\nCC40\tchak\nCC41\tchat\nCC42\tchap\nCC43\tchah\nCC44\tchae\nCC45\tchaeg\nCC46\tchaekk\nCC47\tchaegs\nCC48\tchaen\nCC49\tchaenj\nCC4A\tchaenh\nCC4B\tchaed\nCC4C\tchael\nCC4D\tchaelg\nCC4E\tchaelm\nCC4F\tchaelb\nCC50\tchaels\nCC51\tchaelt\nCC52\tchaelp\nCC53\tchaelh\nCC54\tchaem\nCC55\tchaeb\nCC56\tchaebs\nCC57\tchaes\nCC58\tchaess\nCC59\tchaeng\nCC5A\tchaej\nCC5B\tchaech\nCC5C\tchaek\nCC5D\tchaet\nCC5E\tchaep\nCC5F\tchaeh\nCC60\tchya\nCC61\tchyag\nCC62\tchyakk\nCC63\tchyags\nCC64\tchyan\nCC65\tchyanj\nCC66\tchyanh\nCC67\tchyad\nCC68\tchyal\nCC69\tchyalg\nCC6A\tchyalm\nCC6B\tchyalb\nCC6C\tchyals\nCC6D\tchyalt\nCC6E\tchyalp\nCC6F\tchyalh\nCC70\tchyam\nCC71\tchyab\nCC72\tchyabs\nCC73\tchyas\nCC74\tchyass\nCC75\tchyang\nCC76\tchyaj\nCC77\tchyach\nCC78\tchyak\nCC79\tchyat\nCC7A\tchyap\nCC7B\tchyah\nCC7C\tchyae\nCC7D\tchyaeg\nCC7E\tchyaekk\nCC7F\tchyaegs\nCC80\tchyaen\nCC81\tchyaenj\nCC82\tchyaenh\nCC83\tchyaed\nCC84\tchyael\nCC85\tchyaelg\nCC86\tchyaelm\nCC87\tchyaelb\nCC88\tchyaels\nCC89\tchyaelt\nCC8A\tchyaelp\nCC8B\tchyaelh\nCC8C\tchyaem\nCC8D\tchyaeb\nCC8E\tchyaebs\nCC8F\tchyaes\nCC90\tchyaess\nCC91\tchyaeng\nCC92\tchyaej\nCC93\tchyaech\nCC94\tchyaek\nCC95\tchyaet\nCC96\tchyaep\nCC97\tchyaeh\nCC98\tcheo\nCC99\tcheog\nCC9A\tcheokk\nCC9B\tcheogs\nCC9C\tcheon\nCC9D\tcheonj\nCC9E\tcheonh\nCC9F\tcheod\nCCA0\tcheol\nCCA1\tcheolg\nCCA2\tcheolm\nCCA3\tcheolb\nCCA4\tcheols\nCCA5\tcheolt\nCCA6\tcheolp\nCCA7\tcheolh\nCCA8\tcheom\nCCA9\tcheob\nCCAA\tcheobs\nCCAB\tcheos\nCCAC\tcheoss\nCCAD\tcheong\nCCAE\tcheoj\nCCAF\tcheoch\nCCB0\tcheok\nCCB1\tcheot\nCCB2\tcheop\nCCB3\tcheoh\nCCB4\tche\nCCB5\tcheg\nCCB6\tchekk\nCCB7\tchegs\nCCB8\tchen\nCCB9\tchenj\nCCBA\tchenh\nCCBB\tched\nCCBC\tchel\nCCBD\tchelg\nCCBE\tchelm\nCCBF\tchelb\nCCC0\tchels\nCCC1\tchelt\nCCC2\tchelp\nCCC3\tchelh\nCCC4\tchem\nCCC5\tcheb\nCCC6\tchebs\nCCC7\tches\nCCC8\tchess\nCCC9\tcheng\nCCCA\tchej\nCCCB\tchech\nCCCC\tchek\nCCCD\tchet\nCCCE\tchep\nCCCF\tcheh\nCCD0\tchyeo\nCCD1\tchyeog\nCCD2\tchyeokk\nCCD3\tchyeogs\nCCD4\tchyeon\nCCD5\tchyeonj\nCCD6\tchyeonh\nCCD7\tchyeod\nCCD8\tchyeol\nCCD9\tchyeolg\nCCDA\tchyeolm\nCCDB\tchyeolb\nCCDC\tchyeols\nCCDD\tchyeolt\nCCDE\tchyeolp\nCCDF\tchyeolh\nCCE0\tchyeom\nCCE1\tchyeob\nCCE2\tchyeobs\nCCE3\tchyeos\nCCE4\tchyeoss\nCCE5\tchyeong\nCCE6\tchyeoj\nCCE7\tchyeoch\nCCE8\tchyeok\nCCE9\tchyeot\nCCEA\tchyeop\nCCEB\tchyeoh\nCCEC\tchye\nCCED\tchyeg\nCCEE\tchyekk\nCCEF\tchyegs\nCCF0\tchyen\nCCF1\tchyenj\nCCF2\tchyenh\nCCF3\tchyed\nCCF4\tchyel\nCCF5\tchyelg\nCCF6\tchyelm\nCCF7\tchyelb\nCCF8\tchyels\nCCF9\tchyelt\nCCFA\tchyelp\nCCFB\tchyelh\nCCFC\tchyem\nCCFD\tchyeb\nCCFE\tchyebs\nCCFF\tchyes\nCD00\tchyess\nCD01\tchyeng\nCD02\tchyej\nCD03\tchyech\nCD04\tchyek\nCD05\tchyet\nCD06\tchyep\nCD07\tchyeh\nCD08\tcho\nCD09\tchog\nCD0A\tchokk\nCD0B\tchogs\nCD0C\tchon\nCD0D\tchonj\nCD0E\tchonh\nCD0F\tchod\nCD10\tchol\nCD11\tcholg\nCD12\tcholm\nCD13\tcholb\nCD14\tchols\nCD15\tcholt\nCD16\tcholp\nCD17\tcholh\nCD18\tchom\nCD19\tchob\nCD1A\tchobs\nCD1B\tchos\nCD1C\tchoss\nCD1D\tchong\nCD1E\tchoj\nCD1F\tchoch\nCD20\tchok\nCD21\tchot\nCD22\tchop\nCD23\tchoh\nCD24\tchwa\nCD25\tchwag\nCD26\tchwakk\nCD27\tchwags\nCD28\tchwan\nCD29\tchwanj\nCD2A\tchwanh\nCD2B\tchwad\nCD2C\tchwal\nCD2D\tchwalg\nCD2E\tchwalm\nCD2F\tchwalb\nCD30\tchwals\nCD31\tchwalt\nCD32\tchwalp\nCD33\tchwalh\nCD34\tchwam\nCD35\tchwab\nCD36\tchwabs\nCD37\tchwas\nCD38\tchwass\nCD39\tchwang\nCD3A\tchwaj\nCD3B\tchwach\nCD3C\tchwak\nCD3D\tchwat\nCD3E\tchwap\nCD3F\tchwah\nCD40\tchwae\nCD41\tchwaeg\nCD42\tchwaekk\nCD43\tchwaegs\nCD44\tchwaen\nCD45\tchwaenj\nCD46\tchwaenh\nCD47\tchwaed\nCD48\tchwael\nCD49\tchwaelg\nCD4A\tchwaelm\nCD4B\tchwaelb\nCD4C\tchwaels\nCD4D\tchwaelt\nCD4E\tchwaelp\nCD4F\tchwaelh\nCD50\tchwaem\nCD51\tchwaeb\nCD52\tchwaebs\nCD53\tchwaes\nCD54\tchwaess\nCD55\tchwaeng\nCD56\tchwaej\nCD57\tchwaech\nCD58\tchwaek\nCD59\tchwaet\nCD5A\tchwaep\nCD5B\tchwaeh\nCD5C\tchoe\nCD5D\tchoeg\nCD5E\tchoekk\nCD5F\tchoegs\nCD60\tchoen\nCD61\tchoenj\nCD62\tchoenh\nCD63\tchoed\nCD64\tchoel\nCD65\tchoelg\nCD66\tchoelm\nCD67\tchoelb\nCD68\tchoels\nCD69\tchoelt\nCD6A\tchoelp\nCD6B\tchoelh\nCD6C\tchoem\nCD6D\tchoeb\nCD6E\tchoebs\nCD6F\tchoes\nCD70\tchoess\nCD71\tchoeng\nCD72\tchoej\nCD73\tchoech\nCD74\tchoek\nCD75\tchoet\nCD76\tchoep\nCD77\tchoeh\nCD78\tchyo\nCD79\tchyog\nCD7A\tchyokk\nCD7B\tchyogs\nCD7C\tchyon\nCD7D\tchyonj\nCD7E\tchyonh\nCD7F\tchyod\nCD80\tchyol\nCD81\tchyolg\nCD82\tchyolm\nCD83\tchyolb\nCD84\tchyols\nCD85\tchyolt\nCD86\tchyolp\nCD87\tchyolh\nCD88\tchyom\nCD89\tchyob\nCD8A\tchyobs\nCD8B\tchyos\nCD8C\tchyoss\nCD8D\tchyong\nCD8E\tchyoj\nCD8F\tchyoch\nCD90\tchyok\nCD91\tchyot\nCD92\tchyop\nCD93\tchyoh\nCD94\tchu\nCD95\tchug\nCD96\tchukk\nCD97\tchugs\nCD98\tchun\nCD99\tchunj\nCD9A\tchunh\nCD9B\tchud\nCD9C\tchul\nCD9D\tchulg\nCD9E\tchulm\nCD9F\tchulb\nCDA0\tchuls\nCDA1\tchult\nCDA2\tchulp\nCDA3\tchulh\nCDA4\tchum\nCDA5\tchub\nCDA6\tchubs\nCDA7\tchus\nCDA8\tchuss\nCDA9\tchung\nCDAA\tchuj\nCDAB\tchuch\nCDAC\tchuk\nCDAD\tchut\nCDAE\tchup\nCDAF\tchuh\nCDB0\tchwo\nCDB1\tchwog\nCDB2\tchwokk\nCDB3\tchwogs\nCDB4\tchwon\nCDB5\tchwonj\nCDB6\tchwonh\nCDB7\tchwod\nCDB8\tchwol\nCDB9\tchwolg\nCDBA\tchwolm\nCDBB\tchwolb\nCDBC\tchwols\nCDBD\tchwolt\nCDBE\tchwolp\nCDBF\tchwolh\nCDC0\tchwom\nCDC1\tchwob\nCDC2\tchwobs\nCDC3\tchwos\nCDC4\tchwoss\nCDC5\tchwong\nCDC6\tchwoj\nCDC7\tchwoch\nCDC8\tchwok\nCDC9\tchwot\nCDCA\tchwop\nCDCB\tchwoh\nCDCC\tchwe\nCDCD\tchweg\nCDCE\tchwekk\nCDCF\tchwegs\nCDD0\tchwen\nCDD1\tchwenj\nCDD2\tchwenh\nCDD3\tchwed\nCDD4\tchwel\nCDD5\tchwelg\nCDD6\tchwelm\nCDD7\tchwelb\nCDD8\tchwels\nCDD9\tchwelt\nCDDA\tchwelp\nCDDB\tchwelh\nCDDC\tchwem\nCDDD\tchweb\nCDDE\tchwebs\nCDDF\tchwes\nCDE0\tchwess\nCDE1\tchweng\nCDE2\tchwej\nCDE3\tchwech\nCDE4\tchwek\nCDE5\tchwet\nCDE6\tchwep\nCDE7\tchweh\nCDE8\tchwi\nCDE9\tchwig\nCDEA\tchwikk\nCDEB\tchwigs\nCDEC\tchwin\nCDED\tchwinj\nCDEE\tchwinh\nCDEF\tchwid\nCDF0\tchwil\nCDF1\tchwilg\nCDF2\tchwilm\nCDF3\tchwilb\nCDF4\tchwils\nCDF5\tchwilt\nCDF6\tchwilp\nCDF7\tchwilh\nCDF8\tchwim\nCDF9\tchwib\nCDFA\tchwibs\nCDFB\tchwis\nCDFC\tchwiss\nCDFD\tchwing\nCDFE\tchwij\nCDFF\tchwich\nCE00\tchwik\nCE01\tchwit\nCE02\tchwip\nCE03\tchwih\nCE04\tchyu\nCE05\tchyug\nCE06\tchyukk\nCE07\tchyugs\nCE08\tchyun\nCE09\tchyunj\nCE0A\tchyunh\nCE0B\tchyud\nCE0C\tchyul\nCE0D\tchyulg\nCE0E\tchyulm\nCE0F\tchyulb\nCE10\tchyuls\nCE11\tchyult\nCE12\tchyulp\nCE13\tchyulh\nCE14\tchyum\nCE15\tchyub\nCE16\tchyubs\nCE17\tchyus\nCE18\tchyuss\nCE19\tchyung\nCE1A\tchyuj\nCE1B\tchyuch\nCE1C\tchyuk\nCE1D\tchyut\nCE1E\tchyup\nCE1F\tchyuh\nCE20\tcheu\nCE21\tcheug\nCE22\tcheukk\nCE23\tcheugs\nCE24\tcheun\nCE25\tcheunj\nCE26\tcheunh\nCE27\tcheud\nCE28\tcheul\nCE29\tcheulg\nCE2A\tcheulm\nCE2B\tcheulb\nCE2C\tcheuls\nCE2D\tcheult\nCE2E\tcheulp\nCE2F\tcheulh\nCE30\tcheum\nCE31\tcheub\nCE32\tcheubs\nCE33\tcheus\nCE34\tcheuss\nCE35\tcheung\nCE36\tcheuj\nCE37\tcheuch\nCE38\tcheuk\nCE39\tcheut\nCE3A\tcheup\nCE3B\tcheuh\nCE3C\tchui\nCE3D\tchuig\nCE3E\tchuikk\nCE3F\tchuigs\nCE40\tchuin\nCE41\tchuinj\nCE42\tchuinh\nCE43\tchuid\nCE44\tchuil\nCE45\tchuilg\nCE46\tchuilm\nCE47\tchuilb\nCE48\tchuils\nCE49\tchuilt\nCE4A\tchuilp\nCE4B\tchuilh\nCE4C\tchuim\nCE4D\tchuib\nCE4E\tchuibs\nCE4F\tchuis\nCE50\tchuiss\nCE51\tchuing\nCE52\tchuij\nCE53\tchuich\nCE54\tchuik\nCE55\tchuit\nCE56\tchuip\nCE57\tchuih\nCE58\tchi\nCE59\tchig\nCE5A\tchikk\nCE5B\tchigs\nCE5C\tchin\nCE5D\tchinj\nCE5E\tchinh\nCE5F\tchid\nCE60\tchil\nCE61\tchilg\nCE62\tchilm\nCE63\tchilb\nCE64\tchils\nCE65\tchilt\nCE66\tchilp\nCE67\tchilh\nCE68\tchim\nCE69\tchib\nCE6A\tchibs\nCE6B\tchis\nCE6C\tchiss\nCE6D\tching\nCE6E\tchij\nCE6F\tchich\nCE70\tchik\nCE71\tchit\nCE72\tchip\nCE73\tchih\nCE74\tka\nCE75\tkag\nCE76\tkakk\nCE77\tkags\nCE78\tkan\nCE79\tkanj\nCE7A\tkanh\nCE7B\tkad\nCE7C\tkal\nCE7D\tkalg\nCE7E\tkalm\nCE7F\tkalb\nCE80\tkals\nCE81\tkalt\nCE82\tkalp\nCE83\tkalh\nCE84\tkam\nCE85\tkab\nCE86\tkabs\nCE87\tkas\nCE88\tkass\nCE89\tkang\nCE8A\tkaj\nCE8B\tkach\nCE8C\tkak\nCE8D\tkat\nCE8E\tkap\nCE8F\tkah\nCE90\tkae\nCE91\tkaeg\nCE92\tkaekk\nCE93\tkaegs\nCE94\tkaen\nCE95\tkaenj\nCE96\tkaenh\nCE97\tkaed\nCE98\tkael\nCE99\tkaelg\nCE9A\tkaelm\nCE9B\tkaelb\nCE9C\tkaels\nCE9D\tkaelt\nCE9E\tkaelp\nCE9F\tkaelh\nCEA0\tkaem\nCEA1\tkaeb\nCEA2\tkaebs\nCEA3\tkaes\nCEA4\tkaess\nCEA5\tkaeng\nCEA6\tkaej\nCEA7\tkaech\nCEA8\tkaek\nCEA9\tkaet\nCEAA\tkaep\nCEAB\tkaeh\nCEAC\tkya\nCEAD\tkyag\nCEAE\tkyakk\nCEAF\tkyags\nCEB0\tkyan\nCEB1\tkyanj\nCEB2\tkyanh\nCEB3\tkyad\nCEB4\tkyal\nCEB5\tkyalg\nCEB6\tkyalm\nCEB7\tkyalb\nCEB8\tkyals\nCEB9\tkyalt\nCEBA\tkyalp\nCEBB\tkyalh\nCEBC\tkyam\nCEBD\tkyab\nCEBE\tkyabs\nCEBF\tkyas\nCEC0\tkyass\nCEC1\tkyang\nCEC2\tkyaj\nCEC3\tkyach\nCEC4\tkyak\nCEC5\tkyat\nCEC6\tkyap\nCEC7\tkyah\nCEC8\tkyae\nCEC9\tkyaeg\nCECA\tkyaekk\nCECB\tkyaegs\nCECC\tkyaen\nCECD\tkyaenj\nCECE\tkyaenh\nCECF\tkyaed\nCED0\tkyael\nCED1\tkyaelg\nCED2\tkyaelm\nCED3\tkyaelb\nCED4\tkyaels\nCED5\tkyaelt\nCED6\tkyaelp\nCED7\tkyaelh\nCED8\tkyaem\nCED9\tkyaeb\nCEDA\tkyaebs\nCEDB\tkyaes\nCEDC\tkyaess\nCEDD\tkyaeng\nCEDE\tkyaej\nCEDF\tkyaech\nCEE0\tkyaek\nCEE1\tkyaet\nCEE2\tkyaep\nCEE3\tkyaeh\nCEE4\tkeo\nCEE5\tkeog\nCEE6\tkeokk\nCEE7\tkeogs\nCEE8\tkeon\nCEE9\tkeonj\nCEEA\tkeonh\nCEEB\tkeod\nCEEC\tkeol\nCEED\tkeolg\nCEEE\tkeolm\nCEEF\tkeolb\nCEF0\tkeols\nCEF1\tkeolt\nCEF2\tkeolp\nCEF3\tkeolh\nCEF4\tkeom\nCEF5\tkeob\nCEF6\tkeobs\nCEF7\tkeos\nCEF8\tkeoss\nCEF9\tkeong\nCEFA\tkeoj\nCEFB\tkeoch\nCEFC\tkeok\nCEFD\tkeot\nCEFE\tkeop\nCEFF\tkeoh\nCF00\tke\nCF01\tkeg\nCF02\tkekk\nCF03\tkegs\nCF04\tken\nCF05\tkenj\nCF06\tkenh\nCF07\tked\nCF08\tkel\nCF09\tkelg\nCF0A\tkelm\nCF0B\tkelb\nCF0C\tkels\nCF0D\tkelt\nCF0E\tkelp\nCF0F\tkelh\nCF10\tkem\nCF11\tkeb\nCF12\tkebs\nCF13\tkes\nCF14\tkess\nCF15\tkeng\nCF16\tkej\nCF17\tkech\nCF18\tkek\nCF19\tket\nCF1A\tkep\nCF1B\tkeh\nCF1C\tkyeo\nCF1D\tkyeog\nCF1E\tkyeokk\nCF1F\tkyeogs\nCF20\tkyeon\nCF21\tkyeonj\nCF22\tkyeonh\nCF23\tkyeod\nCF24\tkyeol\nCF25\tkyeolg\nCF26\tkyeolm\nCF27\tkyeolb\nCF28\tkyeols\nCF29\tkyeolt\nCF2A\tkyeolp\nCF2B\tkyeolh\nCF2C\tkyeom\nCF2D\tkyeob\nCF2E\tkyeobs\nCF2F\tkyeos\nCF30\tkyeoss\nCF31\tkyeong\nCF32\tkyeoj\nCF33\tkyeoch\nCF34\tkyeok\nCF35\tkyeot\nCF36\tkyeop\nCF37\tkyeoh\nCF38\tkye\nCF39\tkyeg\nCF3A\tkyekk\nCF3B\tkyegs\nCF3C\tkyen\nCF3D\tkyenj\nCF3E\tkyenh\nCF3F\tkyed\nCF40\tkyel\nCF41\tkyelg\nCF42\tkyelm\nCF43\tkyelb\nCF44\tkyels\nCF45\tkyelt\nCF46\tkyelp\nCF47\tkyelh\nCF48\tkyem\nCF49\tkyeb\nCF4A\tkyebs\nCF4B\tkyes\nCF4C\tkyess\nCF4D\tkyeng\nCF4E\tkyej\nCF4F\tkyech\nCF50\tkyek\nCF51\tkyet\nCF52\tkyep\nCF53\tkyeh\nCF54\tko\nCF55\tkog\nCF56\tkokk\nCF57\tkogs\nCF58\tkon\nCF59\tkonj\nCF5A\tkonh\nCF5B\tkod\nCF5C\tkol\nCF5D\tkolg\nCF5E\tkolm\nCF5F\tkolb\nCF60\tkols\nCF61\tkolt\nCF62\tkolp\nCF63\tkolh\nCF64\tkom\nCF65\tkob\nCF66\tkobs\nCF67\tkos\nCF68\tkoss\nCF69\tkong\nCF6A\tkoj\nCF6B\tkoch\nCF6C\tkok\nCF6D\tkot\nCF6E\tkop\nCF6F\tkoh\nCF70\tkwa\nCF71\tkwag\nCF72\tkwakk\nCF73\tkwags\nCF74\tkwan\nCF75\tkwanj\nCF76\tkwanh\nCF77\tkwad\nCF78\tkwal\nCF79\tkwalg\nCF7A\tkwalm\nCF7B\tkwalb\nCF7C\tkwals\nCF7D\tkwalt\nCF7E\tkwalp\nCF7F\tkwalh\nCF80\tkwam\nCF81\tkwab\nCF82\tkwabs\nCF83\tkwas\nCF84\tkwass\nCF85\tkwang\nCF86\tkwaj\nCF87\tkwach\nCF88\tkwak\nCF89\tkwat\nCF8A\tkwap\nCF8B\tkwah\nCF8C\tkwae\nCF8D\tkwaeg\nCF8E\tkwaekk\nCF8F\tkwaegs\nCF90\tkwaen\nCF91\tkwaenj\nCF92\tkwaenh\nCF93\tkwaed\nCF94\tkwael\nCF95\tkwaelg\nCF96\tkwaelm\nCF97\tkwaelb\nCF98\tkwaels\nCF99\tkwaelt\nCF9A\tkwaelp\nCF9B\tkwaelh\nCF9C\tkwaem\nCF9D\tkwaeb\nCF9E\tkwaebs\nCF9F\tkwaes\nCFA0\tkwaess\nCFA1\tkwaeng\nCFA2\tkwaej\nCFA3\tkwaech\nCFA4\tkwaek\nCFA5\tkwaet\nCFA6\tkwaep\nCFA7\tkwaeh\nCFA8\tkoe\nCFA9\tkoeg\nCFAA\tkoekk\nCFAB\tkoegs\nCFAC\tkoen\nCFAD\tkoenj\nCFAE\tkoenh\nCFAF\tkoed\nCFB0\tkoel\nCFB1\tkoelg\nCFB2\tkoelm\nCFB3\tkoelb\nCFB4\tkoels\nCFB5\tkoelt\nCFB6\tkoelp\nCFB7\tkoelh\nCFB8\tkoem\nCFB9\tkoeb\nCFBA\tkoebs\nCFBB\tkoes\nCFBC\tkoess\nCFBD\tkoeng\nCFBE\tkoej\nCFBF\tkoech\nCFC0\tkoek\nCFC1\tkoet\nCFC2\tkoep\nCFC3\tkoeh\nCFC4\tkyo\nCFC5\tkyog\nCFC6\tkyokk\nCFC7\tkyogs\nCFC8\tkyon\nCFC9\tkyonj\nCFCA\tkyonh\nCFCB\tkyod\nCFCC\tkyol\nCFCD\tkyolg\nCFCE\tkyolm\nCFCF\tkyolb\nCFD0\tkyols\nCFD1\tkyolt\nCFD2\tkyolp\nCFD3\tkyolh\nCFD4\tkyom\nCFD5\tkyob\nCFD6\tkyobs\nCFD7\tkyos\nCFD8\tkyoss\nCFD9\tkyong\nCFDA\tkyoj\nCFDB\tkyoch\nCFDC\tkyok\nCFDD\tkyot\nCFDE\tkyop\nCFDF\tkyoh\nCFE0\tku\nCFE1\tkug\nCFE2\tkukk\nCFE3\tkugs\nCFE4\tkun\nCFE5\tkunj\nCFE6\tkunh\nCFE7\tkud\nCFE8\tkul\nCFE9\tkulg\nCFEA\tkulm\nCFEB\tkulb\nCFEC\tkuls\nCFED\tkult\nCFEE\tkulp\nCFEF\tkulh\nCFF0\tkum\nCFF1\tkub\nCFF2\tkubs\nCFF3\tkus\nCFF4\tkuss\nCFF5\tkung\nCFF6\tkuj\nCFF7\tkuch\nCFF8\tkuk\nCFF9\tkut\nCFFA\tkup\nCFFB\tkuh\nCFFC\tkwo\nCFFD\tkwog\nCFFE\tkwokk\nCFFF\tkwogs\nD000\tkwon\nD001\tkwonj\nD002\tkwonh\nD003\tkwod\nD004\tkwol\nD005\tkwolg\nD006\tkwolm\nD007\tkwolb\nD008\tkwols\nD009\tkwolt\nD00A\tkwolp\nD00B\tkwolh\nD00C\tkwom\nD00D\tkwob\nD00E\tkwobs\nD00F\tkwos\nD010\tkwoss\nD011\tkwong\nD012\tkwoj\nD013\tkwoch\nD014\tkwok\nD015\tkwot\nD016\tkwop\nD017\tkwoh\nD018\tkwe\nD019\tkweg\nD01A\tkwekk\nD01B\tkwegs\nD01C\tkwen\nD01D\tkwenj\nD01E\tkwenh\nD01F\tkwed\nD020\tkwel\nD021\tkwelg\nD022\tkwelm\nD023\tkwelb\nD024\tkwels\nD025\tkwelt\nD026\tkwelp\nD027\tkwelh\nD028\tkwem\nD029\tkweb\nD02A\tkwebs\nD02B\tkwes\nD02C\tkwess\nD02D\tkweng\nD02E\tkwej\nD02F\tkwech\nD030\tkwek\nD031\tkwet\nD032\tkwep\nD033\tkweh\nD034\tkwi\nD035\tkwig\nD036\tkwikk\nD037\tkwigs\nD038\tkwin\nD039\tkwinj\nD03A\tkwinh\nD03B\tkwid\nD03C\tkwil\nD03D\tkwilg\nD03E\tkwilm\nD03F\tkwilb\nD040\tkwils\nD041\tkwilt\nD042\tkwilp\nD043\tkwilh\nD044\tkwim\nD045\tkwib\nD046\tkwibs\nD047\tkwis\nD048\tkwiss\nD049\tkwing\nD04A\tkwij\nD04B\tkwich\nD04C\tkwik\nD04D\tkwit\nD04E\tkwip\nD04F\tkwih\nD050\tkyu\nD051\tkyug\nD052\tkyukk\nD053\tkyugs\nD054\tkyun\nD055\tkyunj\nD056\tkyunh\nD057\tkyud\nD058\tkyul\nD059\tkyulg\nD05A\tkyulm\nD05B\tkyulb\nD05C\tkyuls\nD05D\tkyult\nD05E\tkyulp\nD05F\tkyulh\nD060\tkyum\nD061\tkyub\nD062\tkyubs\nD063\tkyus\nD064\tkyuss\nD065\tkyung\nD066\tkyuj\nD067\tkyuch\nD068\tkyuk\nD069\tkyut\nD06A\tkyup\nD06B\tkyuh\nD06C\tkeu\nD06D\tkeug\nD06E\tkeukk\nD06F\tkeugs\nD070\tkeun\nD071\tkeunj\nD072\tkeunh\nD073\tkeud\nD074\tkeul\nD075\tkeulg\nD076\tkeulm\nD077\tkeulb\nD078\tkeuls\nD079\tkeult\nD07A\tkeulp\nD07B\tkeulh\nD07C\tkeum\nD07D\tkeub\nD07E\tkeubs\nD07F\tkeus\nD080\tkeuss\nD081\tkeung\nD082\tkeuj\nD083\tkeuch\nD084\tkeuk\nD085\tkeut\nD086\tkeup\nD087\tkeuh\nD088\tkui\nD089\tkuig\nD08A\tkuikk\nD08B\tkuigs\nD08C\tkuin\nD08D\tkuinj\nD08E\tkuinh\nD08F\tkuid\nD090\tkuil\nD091\tkuilg\nD092\tkuilm\nD093\tkuilb\nD094\tkuils\nD095\tkuilt\nD096\tkuilp\nD097\tkuilh\nD098\tkuim\nD099\tkuib\nD09A\tkuibs\nD09B\tkuis\nD09C\tkuiss\nD09D\tkuing\nD09E\tkuij\nD09F\tkuich\nD0A0\tkuik\nD0A1\tkuit\nD0A2\tkuip\nD0A3\tkuih\nD0A4\tki\nD0A5\tkig\nD0A6\tkikk\nD0A7\tkigs\nD0A8\tkin\nD0A9\tkinj\nD0AA\tkinh\nD0AB\tkid\nD0AC\tkil\nD0AD\tkilg\nD0AE\tkilm\nD0AF\tkilb\nD0B0\tkils\nD0B1\tkilt\nD0B2\tkilp\nD0B3\tkilh\nD0B4\tkim\nD0B5\tkib\nD0B6\tkibs\nD0B7\tkis\nD0B8\tkiss\nD0B9\tking\nD0BA\tkij\nD0BB\tkich\nD0BC\tkik\nD0BD\tkit\nD0BE\tkip\nD0BF\tkih\nD0C0\tta\nD0C1\ttag\nD0C2\ttakk\nD0C3\ttags\nD0C4\ttan\nD0C5\ttanj\nD0C6\ttanh\nD0C7\ttad\nD0C8\ttal\nD0C9\ttalg\nD0CA\ttalm\nD0CB\ttalb\nD0CC\ttals\nD0CD\ttalt\nD0CE\ttalp\nD0CF\ttalh\nD0D0\ttam\nD0D1\ttab\nD0D2\ttabs\nD0D3\ttas\nD0D4\ttass\nD0D5\ttang\nD0D6\ttaj\nD0D7\ttach\nD0D8\ttak\nD0D9\ttat\nD0DA\ttap\nD0DB\ttah\nD0DC\ttae\nD0DD\ttaeg\nD0DE\ttaekk\nD0DF\ttaegs\nD0E0\ttaen\nD0E1\ttaenj\nD0E2\ttaenh\nD0E3\ttaed\nD0E4\ttael\nD0E5\ttaelg\nD0E6\ttaelm\nD0E7\ttaelb\nD0E8\ttaels\nD0E9\ttaelt\nD0EA\ttaelp\nD0EB\ttaelh\nD0EC\ttaem\nD0ED\ttaeb\nD0EE\ttaebs\nD0EF\ttaes\nD0F0\ttaess\nD0F1\ttaeng\nD0F2\ttaej\nD0F3\ttaech\nD0F4\ttaek\nD0F5\ttaet\nD0F6\ttaep\nD0F7\ttaeh\nD0F8\ttya\nD0F9\ttyag\nD0FA\ttyakk\nD0FB\ttyags\nD0FC\ttyan\nD0FD\ttyanj\nD0FE\ttyanh\nD0FF\ttyad\nD100\ttyal\nD101\ttyalg\nD102\ttyalm\nD103\ttyalb\nD104\ttyals\nD105\ttyalt\nD106\ttyalp\nD107\ttyalh\nD108\ttyam\nD109\ttyab\nD10A\ttyabs\nD10B\ttyas\nD10C\ttyass\nD10D\ttyang\nD10E\ttyaj\nD10F\ttyach\nD110\ttyak\nD111\ttyat\nD112\ttyap\nD113\ttyah\nD114\ttyae\nD115\ttyaeg\nD116\ttyaekk\nD117\ttyaegs\nD118\ttyaen\nD119\ttyaenj\nD11A\ttyaenh\nD11B\ttyaed\nD11C\ttyael\nD11D\ttyaelg\nD11E\ttyaelm\nD11F\ttyaelb\nD120\ttyaels\nD121\ttyaelt\nD122\ttyaelp\nD123\ttyaelh\nD124\ttyaem\nD125\ttyaeb\nD126\ttyaebs\nD127\ttyaes\nD128\ttyaess\nD129\ttyaeng\nD12A\ttyaej\nD12B\ttyaech\nD12C\ttyaek\nD12D\ttyaet\nD12E\ttyaep\nD12F\ttyaeh\nD130\tteo\nD131\tteog\nD132\tteokk\nD133\tteogs\nD134\tteon\nD135\tteonj\nD136\tteonh\nD137\tteod\nD138\tteol\nD139\tteolg\nD13A\tteolm\nD13B\tteolb\nD13C\tteols\nD13D\tteolt\nD13E\tteolp\nD13F\tteolh\nD140\tteom\nD141\tteob\nD142\tteobs\nD143\tteos\nD144\tteoss\nD145\tteong\nD146\tteoj\nD147\tteoch\nD148\tteok\nD149\tteot\nD14A\tteop\nD14B\tteoh\nD14C\tte\nD14D\tteg\nD14E\ttekk\nD14F\ttegs\nD150\tten\nD151\ttenj\nD152\ttenh\nD153\tted\nD154\ttel\nD155\ttelg\nD156\ttelm\nD157\ttelb\nD158\ttels\nD159\ttelt\nD15A\ttelp\nD15B\ttelh\nD15C\ttem\nD15D\tteb\nD15E\ttebs\nD15F\ttes\nD160\ttess\nD161\tteng\nD162\ttej\nD163\ttech\nD164\ttek\nD165\ttet\nD166\ttep\nD167\tteh\nD168\ttyeo\nD169\ttyeog\nD16A\ttyeokk\nD16B\ttyeogs\nD16C\ttyeon\nD16D\ttyeonj\nD16E\ttyeonh\nD16F\ttyeod\nD170\ttyeol\nD171\ttyeolg\nD172\ttyeolm\nD173\ttyeolb\nD174\ttyeols\nD175\ttyeolt\nD176\ttyeolp\nD177\ttyeolh\nD178\ttyeom\nD179\ttyeob\nD17A\ttyeobs\nD17B\ttyeos\nD17C\ttyeoss\nD17D\ttyeong\nD17E\ttyeoj\nD17F\ttyeoch\nD180\ttyeok\nD181\ttyeot\nD182\ttyeop\nD183\ttyeoh\nD184\ttye\nD185\ttyeg\nD186\ttyekk\nD187\ttyegs\nD188\ttyen\nD189\ttyenj\nD18A\ttyenh\nD18B\ttyed\nD18C\ttyel\nD18D\ttyelg\nD18E\ttyelm\nD18F\ttyelb\nD190\ttyels\nD191\ttyelt\nD192\ttyelp\nD193\ttyelh\nD194\ttyem\nD195\ttyeb\nD196\ttyebs\nD197\ttyes\nD198\ttyess\nD199\ttyeng\nD19A\ttyej\nD19B\ttyech\nD19C\ttyek\nD19D\ttyet\nD19E\ttyep\nD19F\ttyeh\nD1A0\tto\nD1A1\ttog\nD1A2\ttokk\nD1A3\ttogs\nD1A4\tton\nD1A5\ttonj\nD1A6\ttonh\nD1A7\ttod\nD1A8\ttol\nD1A9\ttolg\nD1AA\ttolm\nD1AB\ttolb\nD1AC\ttols\nD1AD\ttolt\nD1AE\ttolp\nD1AF\ttolh\nD1B0\ttom\nD1B1\ttob\nD1B2\ttobs\nD1B3\ttos\nD1B4\ttoss\nD1B5\ttong\nD1B6\ttoj\nD1B7\ttoch\nD1B8\ttok\nD1B9\ttot\nD1BA\ttop\nD1BB\ttoh\nD1BC\ttwa\nD1BD\ttwag\nD1BE\ttwakk\nD1BF\ttwags\nD1C0\ttwan\nD1C1\ttwanj\nD1C2\ttwanh\nD1C3\ttwad\nD1C4\ttwal\nD1C5\ttwalg\nD1C6\ttwalm\nD1C7\ttwalb\nD1C8\ttwals\nD1C9\ttwalt\nD1CA\ttwalp\nD1CB\ttwalh\nD1CC\ttwam\nD1CD\ttwab\nD1CE\ttwabs\nD1CF\ttwas\nD1D0\ttwass\nD1D1\ttwang\nD1D2\ttwaj\nD1D3\ttwach\nD1D4\ttwak\nD1D5\ttwat\nD1D6\ttwap\nD1D7\ttwah\nD1D8\ttwae\nD1D9\ttwaeg\nD1DA\ttwaekk\nD1DB\ttwaegs\nD1DC\ttwaen\nD1DD\ttwaenj\nD1DE\ttwaenh\nD1DF\ttwaed\nD1E0\ttwael\nD1E1\ttwaelg\nD1E2\ttwaelm\nD1E3\ttwaelb\nD1E4\ttwaels\nD1E5\ttwaelt\nD1E6\ttwaelp\nD1E7\ttwaelh\nD1E8\ttwaem\nD1E9\ttwaeb\nD1EA\ttwaebs\nD1EB\ttwaes\nD1EC\ttwaess\nD1ED\ttwaeng\nD1EE\ttwaej\nD1EF\ttwaech\nD1F0\ttwaek\nD1F1\ttwaet\nD1F2\ttwaep\nD1F3\ttwaeh\nD1F4\ttoe\nD1F5\ttoeg\nD1F6\ttoekk\nD1F7\ttoegs\nD1F8\ttoen\nD1F9\ttoenj\nD1FA\ttoenh\nD1FB\ttoed\nD1FC\ttoel\nD1FD\ttoelg\nD1FE\ttoelm\nD1FF\ttoelb\nD200\ttoels\nD201\ttoelt\nD202\ttoelp\nD203\ttoelh\nD204\ttoem\nD205\ttoeb\nD206\ttoebs\nD207\ttoes\nD208\ttoess\nD209\ttoeng\nD20A\ttoej\nD20B\ttoech\nD20C\ttoek\nD20D\ttoet\nD20E\ttoep\nD20F\ttoeh\nD210\ttyo\nD211\ttyog\nD212\ttyokk\nD213\ttyogs\nD214\ttyon\nD215\ttyonj\nD216\ttyonh\nD217\ttyod\nD218\ttyol\nD219\ttyolg\nD21A\ttyolm\nD21B\ttyolb\nD21C\ttyols\nD21D\ttyolt\nD21E\ttyolp\nD21F\ttyolh\nD220\ttyom\nD221\ttyob\nD222\ttyobs\nD223\ttyos\nD224\ttyoss\nD225\ttyong\nD226\ttyoj\nD227\ttyoch\nD228\ttyok\nD229\ttyot\nD22A\ttyop\nD22B\ttyoh\nD22C\ttu\nD22D\ttug\nD22E\ttukk\nD22F\ttugs\nD230\ttun\nD231\ttunj\nD232\ttunh\nD233\ttud\nD234\ttul\nD235\ttulg\nD236\ttulm\nD237\ttulb\nD238\ttuls\nD239\ttult\nD23A\ttulp\nD23B\ttulh\nD23C\ttum\nD23D\ttub\nD23E\ttubs\nD23F\ttus\nD240\ttuss\nD241\ttung\nD242\ttuj\nD243\ttuch\nD244\ttuk\nD245\ttut\nD246\ttup\nD247\ttuh\nD248\ttwo\nD249\ttwog\nD24A\ttwokk\nD24B\ttwogs\nD24C\ttwon\nD24D\ttwonj\nD24E\ttwonh\nD24F\ttwod\nD250\ttwol\nD251\ttwolg\nD252\ttwolm\nD253\ttwolb\nD254\ttwols\nD255\ttwolt\nD256\ttwolp\nD257\ttwolh\nD258\ttwom\nD259\ttwob\nD25A\ttwobs\nD25B\ttwos\nD25C\ttwoss\nD25D\ttwong\nD25E\ttwoj\nD25F\ttwoch\nD260\ttwok\nD261\ttwot\nD262\ttwop\nD263\ttwoh\nD264\ttwe\nD265\ttweg\nD266\ttwekk\nD267\ttwegs\nD268\ttwen\nD269\ttwenj\nD26A\ttwenh\nD26B\ttwed\nD26C\ttwel\nD26D\ttwelg\nD26E\ttwelm\nD26F\ttwelb\nD270\ttwels\nD271\ttwelt\nD272\ttwelp\nD273\ttwelh\nD274\ttwem\nD275\ttweb\nD276\ttwebs\nD277\ttwes\nD278\ttwess\nD279\ttweng\nD27A\ttwej\nD27B\ttwech\nD27C\ttwek\nD27D\ttwet\nD27E\ttwep\nD27F\ttweh\nD280\ttwi\nD281\ttwig\nD282\ttwikk\nD283\ttwigs\nD284\ttwin\nD285\ttwinj\nD286\ttwinh\nD287\ttwid\nD288\ttwil\nD289\ttwilg\nD28A\ttwilm\nD28B\ttwilb\nD28C\ttwils\nD28D\ttwilt\nD28E\ttwilp\nD28F\ttwilh\nD290\ttwim\nD291\ttwib\nD292\ttwibs\nD293\ttwis\nD294\ttwiss\nD295\ttwing\nD296\ttwij\nD297\ttwich\nD298\ttwik\nD299\ttwit\nD29A\ttwip\nD29B\ttwih\nD29C\ttyu\nD29D\ttyug\nD29E\ttyukk\nD29F\ttyugs\nD2A0\ttyun\nD2A1\ttyunj\nD2A2\ttyunh\nD2A3\ttyud\nD2A4\ttyul\nD2A5\ttyulg\nD2A6\ttyulm\nD2A7\ttyulb\nD2A8\ttyuls\nD2A9\ttyult\nD2AA\ttyulp\nD2AB\ttyulh\nD2AC\ttyum\nD2AD\ttyub\nD2AE\ttyubs\nD2AF\ttyus\nD2B0\ttyuss\nD2B1\ttyung\nD2B2\ttyuj\nD2B3\ttyuch\nD2B4\ttyuk\nD2B5\ttyut\nD2B6\ttyup\nD2B7\ttyuh\nD2B8\tteu\nD2B9\tteug\nD2BA\tteukk\nD2BB\tteugs\nD2BC\tteun\nD2BD\tteunj\nD2BE\tteunh\nD2BF\tteud\nD2C0\tteul\nD2C1\tteulg\nD2C2\tteulm\nD2C3\tteulb\nD2C4\tteuls\nD2C5\tteult\nD2C6\tteulp\nD2C7\tteulh\nD2C8\tteum\nD2C9\tteub\nD2CA\tteubs\nD2CB\tteus\nD2CC\tteuss\nD2CD\tteung\nD2CE\tteuj\nD2CF\tteuch\nD2D0\tteuk\nD2D1\tteut\nD2D2\tteup\nD2D3\tteuh\nD2D4\ttui\nD2D5\ttuig\nD2D6\ttuikk\nD2D7\ttuigs\nD2D8\ttuin\nD2D9\ttuinj\nD2DA\ttuinh\nD2DB\ttuid\nD2DC\ttuil\nD2DD\ttuilg\nD2DE\ttuilm\nD2DF\ttuilb\nD2E0\ttuils\nD2E1\ttuilt\nD2E2\ttuilp\nD2E3\ttuilh\nD2E4\ttuim\nD2E5\ttuib\nD2E6\ttuibs\nD2E7\ttuis\nD2E8\ttuiss\nD2E9\ttuing\nD2EA\ttuij\nD2EB\ttuich\nD2EC\ttuik\nD2ED\ttuit\nD2EE\ttuip\nD2EF\ttuih\nD2F0\tti\nD2F1\ttig\nD2F2\ttikk\nD2F3\ttigs\nD2F4\ttin\nD2F5\ttinj\nD2F6\ttinh\nD2F7\ttid\nD2F8\ttil\nD2F9\ttilg\nD2FA\ttilm\nD2FB\ttilb\nD2FC\ttils\nD2FD\ttilt\nD2FE\ttilp\nD2FF\ttilh\nD300\ttim\nD301\ttib\nD302\ttibs\nD303\ttis\nD304\ttiss\nD305\tting\nD306\ttij\nD307\ttich\nD308\ttik\nD309\ttit\nD30A\ttip\nD30B\ttih\nD30C\tpa\nD30D\tpag\nD30E\tpakk\nD30F\tpags\nD310\tpan\nD311\tpanj\nD312\tpanh\nD313\tpad\nD314\tpal\nD315\tpalg\nD316\tpalm\nD317\tpalb\nD318\tpals\nD319\tpalt\nD31A\tpalp\nD31B\tpalh\nD31C\tpam\nD31D\tpab\nD31E\tpabs\nD31F\tpas\nD320\tpass\nD321\tpang\nD322\tpaj\nD323\tpach\nD324\tpak\nD325\tpat\nD326\tpap\nD327\tpah\nD328\tpae\nD329\tpaeg\nD32A\tpaekk\nD32B\tpaegs\nD32C\tpaen\nD32D\tpaenj\nD32E\tpaenh\nD32F\tpaed\nD330\tpael\nD331\tpaelg\nD332\tpaelm\nD333\tpaelb\nD334\tpaels\nD335\tpaelt\nD336\tpaelp\nD337\tpaelh\nD338\tpaem\nD339\tpaeb\nD33A\tpaebs\nD33B\tpaes\nD33C\tpaess\nD33D\tpaeng\nD33E\tpaej\nD33F\tpaech\nD340\tpaek\nD341\tpaet\nD342\tpaep\nD343\tpaeh\nD344\tpya\nD345\tpyag\nD346\tpyakk\nD347\tpyags\nD348\tpyan\nD349\tpyanj\nD34A\tpyanh\nD34B\tpyad\nD34C\tpyal\nD34D\tpyalg\nD34E\tpyalm\nD34F\tpyalb\nD350\tpyals\nD351\tpyalt\nD352\tpyalp\nD353\tpyalh\nD354\tpyam\nD355\tpyab\nD356\tpyabs\nD357\tpyas\nD358\tpyass\nD359\tpyang\nD35A\tpyaj\nD35B\tpyach\nD35C\tpyak\nD35D\tpyat\nD35E\tpyap\nD35F\tpyah\nD360\tpyae\nD361\tpyaeg\nD362\tpyaekk\nD363\tpyaegs\nD364\tpyaen\nD365\tpyaenj\nD366\tpyaenh\nD367\tpyaed\nD368\tpyael\nD369\tpyaelg\nD36A\tpyaelm\nD36B\tpyaelb\nD36C\tpyaels\nD36D\tpyaelt\nD36E\tpyaelp\nD36F\tpyaelh\nD370\tpyaem\nD371\tpyaeb\nD372\tpyaebs\nD373\tpyaes\nD374\tpyaess\nD375\tpyaeng\nD376\tpyaej\nD377\tpyaech\nD378\tpyaek\nD379\tpyaet\nD37A\tpyaep\nD37B\tpyaeh\nD37C\tpeo\nD37D\tpeog\nD37E\tpeokk\nD37F\tpeogs\nD380\tpeon\nD381\tpeonj\nD382\tpeonh\nD383\tpeod\nD384\tpeol\nD385\tpeolg\nD386\tpeolm\nD387\tpeolb\nD388\tpeols\nD389\tpeolt\nD38A\tpeolp\nD38B\tpeolh\nD38C\tpeom\nD38D\tpeob\nD38E\tpeobs\nD38F\tpeos\nD390\tpeoss\nD391\tpeong\nD392\tpeoj\nD393\tpeoch\nD394\tpeok\nD395\tpeot\nD396\tpeop\nD397\tpeoh\nD398\tpe\nD399\tpeg\nD39A\tpekk\nD39B\tpegs\nD39C\tpen\nD39D\tpenj\nD39E\tpenh\nD39F\tped\nD3A0\tpel\nD3A1\tpelg\nD3A2\tpelm\nD3A3\tpelb\nD3A4\tpels\nD3A5\tpelt\nD3A6\tpelp\nD3A7\tpelh\nD3A8\tpem\nD3A9\tpeb\nD3AA\tpebs\nD3AB\tpes\nD3AC\tpess\nD3AD\tpeng\nD3AE\tpej\nD3AF\tpech\nD3B0\tpek\nD3B1\tpet\nD3B2\tpep\nD3B3\tpeh\nD3B4\tpyeo\nD3B5\tpyeog\nD3B6\tpyeokk\nD3B7\tpyeogs\nD3B8\tpyeon\nD3B9\tpyeonj\nD3BA\tpyeonh\nD3BB\tpyeod\nD3BC\tpyeol\nD3BD\tpyeolg\nD3BE\tpyeolm\nD3BF\tpyeolb\nD3C0\tpyeols\nD3C1\tpyeolt\nD3C2\tpyeolp\nD3C3\tpyeolh\nD3C4\tpyeom\nD3C5\tpyeob\nD3C6\tpyeobs\nD3C7\tpyeos\nD3C8\tpyeoss\nD3C9\tpyeong\nD3CA\tpyeoj\nD3CB\tpyeoch\nD3CC\tpyeok\nD3CD\tpyeot\nD3CE\tpyeop\nD3CF\tpyeoh\nD3D0\tpye\nD3D1\tpyeg\nD3D2\tpyekk\nD3D3\tpyegs\nD3D4\tpyen\nD3D5\tpyenj\nD3D6\tpyenh\nD3D7\tpyed\nD3D8\tpyel\nD3D9\tpyelg\nD3DA\tpyelm\nD3DB\tpyelb\nD3DC\tpyels\nD3DD\tpyelt\nD3DE\tpyelp\nD3DF\tpyelh\nD3E0\tpyem\nD3E1\tpyeb\nD3E2\tpyebs\nD3E3\tpyes\nD3E4\tpyess\nD3E5\tpyeng\nD3E6\tpyej\nD3E7\tpyech\nD3E8\tpyek\nD3E9\tpyet\nD3EA\tpyep\nD3EB\tpyeh\nD3EC\tpo\nD3ED\tpog\nD3EE\tpokk\nD3EF\tpogs\nD3F0\tpon\nD3F1\tponj\nD3F2\tponh\nD3F3\tpod\nD3F4\tpol\nD3F5\tpolg\nD3F6\tpolm\nD3F7\tpolb\nD3F8\tpols\nD3F9\tpolt\nD3FA\tpolp\nD3FB\tpolh\nD3FC\tpom\nD3FD\tpob\nD3FE\tpobs\nD3FF\tpos\nD400\tposs\nD401\tpong\nD402\tpoj\nD403\tpoch\nD404\tpok\nD405\tpot\nD406\tpop\nD407\tpoh\nD408\tpwa\nD409\tpwag\nD40A\tpwakk\nD40B\tpwags\nD40C\tpwan\nD40D\tpwanj\nD40E\tpwanh\nD40F\tpwad\nD410\tpwal\nD411\tpwalg\nD412\tpwalm\nD413\tpwalb\nD414\tpwals\nD415\tpwalt\nD416\tpwalp\nD417\tpwalh\nD418\tpwam\nD419\tpwab\nD41A\tpwabs\nD41B\tpwas\nD41C\tpwass\nD41D\tpwang\nD41E\tpwaj\nD41F\tpwach\nD420\tpwak\nD421\tpwat\nD422\tpwap\nD423\tpwah\nD424\tpwae\nD425\tpwaeg\nD426\tpwaekk\nD427\tpwaegs\nD428\tpwaen\nD429\tpwaenj\nD42A\tpwaenh\nD42B\tpwaed\nD42C\tpwael\nD42D\tpwaelg\nD42E\tpwaelm\nD42F\tpwaelb\nD430\tpwaels\nD431\tpwaelt\nD432\tpwaelp\nD433\tpwaelh\nD434\tpwaem\nD435\tpwaeb\nD436\tpwaebs\nD437\tpwaes\nD438\tpwaess\nD439\tpwaeng\nD43A\tpwaej\nD43B\tpwaech\nD43C\tpwaek\nD43D\tpwaet\nD43E\tpwaep\nD43F\tpwaeh\nD440\tpoe\nD441\tpoeg\nD442\tpoekk\nD443\tpoegs\nD444\tpoen\nD445\tpoenj\nD446\tpoenh\nD447\tpoed\nD448\tpoel\nD449\tpoelg\nD44A\tpoelm\nD44B\tpoelb\nD44C\tpoels\nD44D\tpoelt\nD44E\tpoelp\nD44F\tpoelh\nD450\tpoem\nD451\tpoeb\nD452\tpoebs\nD453\tpoes\nD454\tpoess\nD455\tpoeng\nD456\tpoej\nD457\tpoech\nD458\tpoek\nD459\tpoet\nD45A\tpoep\nD45B\tpoeh\nD45C\tpyo\nD45D\tpyog\nD45E\tpyokk\nD45F\tpyogs\nD460\tpyon\nD461\tpyonj\nD462\tpyonh\nD463\tpyod\nD464\tpyol\nD465\tpyolg\nD466\tpyolm\nD467\tpyolb\nD468\tpyols\nD469\tpyolt\nD46A\tpyolp\nD46B\tpyolh\nD46C\tpyom\nD46D\tpyob\nD46E\tpyobs\nD46F\tpyos\nD470\tpyoss\nD471\tpyong\nD472\tpyoj\nD473\tpyoch\nD474\tpyok\nD475\tpyot\nD476\tpyop\nD477\tpyoh\nD478\tpu\nD479\tpug\nD47A\tpukk\nD47B\tpugs\nD47C\tpun\nD47D\tpunj\nD47E\tpunh\nD47F\tpud\nD480\tpul\nD481\tpulg\nD482\tpulm\nD483\tpulb\nD484\tpuls\nD485\tpult\nD486\tpulp\nD487\tpulh\nD488\tpum\nD489\tpub\nD48A\tpubs\nD48B\tpus\nD48C\tpuss\nD48D\tpung\nD48E\tpuj\nD48F\tpuch\nD490\tpuk\nD491\tput\nD492\tpup\nD493\tpuh\nD494\tpwo\nD495\tpwog\nD496\tpwokk\nD497\tpwogs\nD498\tpwon\nD499\tpwonj\nD49A\tpwonh\nD49B\tpwod\nD49C\tpwol\nD49D\tpwolg\nD49E\tpwolm\nD49F\tpwolb\nD4A0\tpwols\nD4A1\tpwolt\nD4A2\tpwolp\nD4A3\tpwolh\nD4A4\tpwom\nD4A5\tpwob\nD4A6\tpwobs\nD4A7\tpwos\nD4A8\tpwoss\nD4A9\tpwong\nD4AA\tpwoj\nD4AB\tpwoch\nD4AC\tpwok\nD4AD\tpwot\nD4AE\tpwop\nD4AF\tpwoh\nD4B0\tpwe\nD4B1\tpweg\nD4B2\tpwekk\nD4B3\tpwegs\nD4B4\tpwen\nD4B5\tpwenj\nD4B6\tpwenh\nD4B7\tpwed\nD4B8\tpwel\nD4B9\tpwelg\nD4BA\tpwelm\nD4BB\tpwelb\nD4BC\tpwels\nD4BD\tpwelt\nD4BE\tpwelp\nD4BF\tpwelh\nD4C0\tpwem\nD4C1\tpweb\nD4C2\tpwebs\nD4C3\tpwes\nD4C4\tpwess\nD4C5\tpweng\nD4C6\tpwej\nD4C7\tpwech\nD4C8\tpwek\nD4C9\tpwet\nD4CA\tpwep\nD4CB\tpweh\nD4CC\tpwi\nD4CD\tpwig\nD4CE\tpwikk\nD4CF\tpwigs\nD4D0\tpwin\nD4D1\tpwinj\nD4D2\tpwinh\nD4D3\tpwid\nD4D4\tpwil\nD4D5\tpwilg\nD4D6\tpwilm\nD4D7\tpwilb\nD4D8\tpwils\nD4D9\tpwilt\nD4DA\tpwilp\nD4DB\tpwilh\nD4DC\tpwim\nD4DD\tpwib\nD4DE\tpwibs\nD4DF\tpwis\nD4E0\tpwiss\nD4E1\tpwing\nD4E2\tpwij\nD4E3\tpwich\nD4E4\tpwik\nD4E5\tpwit\nD4E6\tpwip\nD4E7\tpwih\nD4E8\tpyu\nD4E9\tpyug\nD4EA\tpyukk\nD4EB\tpyugs\nD4EC\tpyun\nD4ED\tpyunj\nD4EE\tpyunh\nD4EF\tpyud\nD4F0\tpyul\nD4F1\tpyulg\nD4F2\tpyulm\nD4F3\tpyulb\nD4F4\tpyuls\nD4F5\tpyult\nD4F6\tpyulp\nD4F7\tpyulh\nD4F8\tpyum\nD4F9\tpyub\nD4FA\tpyubs\nD4FB\tpyus\nD4FC\tpyuss\nD4FD\tpyung\nD4FE\tpyuj\nD4FF\tpyuch\nD500\tpyuk\nD501\tpyut\nD502\tpyup\nD503\tpyuh\nD504\tpeu\nD505\tpeug\nD506\tpeukk\nD507\tpeugs\nD508\tpeun\nD509\tpeunj\nD50A\tpeunh\nD50B\tpeud\nD50C\tpeul\nD50D\tpeulg\nD50E\tpeulm\nD50F\tpeulb\nD510\tpeuls\nD511\tpeult\nD512\tpeulp\nD513\tpeulh\nD514\tpeum\nD515\tpeub\nD516\tpeubs\nD517\tpeus\nD518\tpeuss\nD519\tpeung\nD51A\tpeuj\nD51B\tpeuch\nD51C\tpeuk\nD51D\tpeut\nD51E\tpeup\nD51F\tpeuh\nD520\tpui\nD521\tpuig\nD522\tpuikk\nD523\tpuigs\nD524\tpuin\nD525\tpuinj\nD526\tpuinh\nD527\tpuid\nD528\tpuil\nD529\tpuilg\nD52A\tpuilm\nD52B\tpuilb\nD52C\tpuils\nD52D\tpuilt\nD52E\tpuilp\nD52F\tpuilh\nD530\tpuim\nD531\tpuib\nD532\tpuibs\nD533\tpuis\nD534\tpuiss\nD535\tpuing\nD536\tpuij\nD537\tpuich\nD538\tpuik\nD539\tpuit\nD53A\tpuip\nD53B\tpuih\nD53C\tpi\nD53D\tpig\nD53E\tpikk\nD53F\tpigs\nD540\tpin\nD541\tpinj\nD542\tpinh\nD543\tpid\nD544\tpil\nD545\tpilg\nD546\tpilm\nD547\tpilb\nD548\tpils\nD549\tpilt\nD54A\tpilp\nD54B\tpilh\nD54C\tpim\nD54D\tpib\nD54E\tpibs\nD54F\tpis\nD550\tpiss\nD551\tping\nD552\tpij\nD553\tpich\nD554\tpik\nD555\tpit\nD556\tpip\nD557\tpih\nD558\tha\nD559\thag\nD55A\thakk\nD55B\thags\nD55C\than\nD55D\thanj\nD55E\thanh\nD55F\thad\nD560\thal\nD561\thalg\nD562\thalm\nD563\thalb\nD564\thals\nD565\thalt\nD566\thalp\nD567\thalh\nD568\tham\nD569\thab\nD56A\thabs\nD56B\thas\nD56C\thass\nD56D\thang\nD56E\thaj\nD56F\thach\nD570\thak\nD571\that\nD572\thap\nD573\thah\nD574\thae\nD575\thaeg\nD576\thaekk\nD577\thaegs\nD578\thaen\nD579\thaenj\nD57A\thaenh\nD57B\thaed\nD57C\thael\nD57D\thaelg\nD57E\thaelm\nD57F\thaelb\nD580\thaels\nD581\thaelt\nD582\thaelp\nD583\thaelh\nD584\thaem\nD585\thaeb\nD586\thaebs\nD587\thaes\nD588\thaess\nD589\thaeng\nD58A\thaej\nD58B\thaech\nD58C\thaek\nD58D\thaet\nD58E\thaep\nD58F\thaeh\nD590\thya\nD591\thyag\nD592\thyakk\nD593\thyags\nD594\thyan\nD595\thyanj\nD596\thyanh\nD597\thyad\nD598\thyal\nD599\thyalg\nD59A\thyalm\nD59B\thyalb\nD59C\thyals\nD59D\thyalt\nD59E\thyalp\nD59F\thyalh\nD5A0\thyam\nD5A1\thyab\nD5A2\thyabs\nD5A3\thyas\nD5A4\thyass\nD5A5\thyang\nD5A6\thyaj\nD5A7\thyach\nD5A8\thyak\nD5A9\thyat\nD5AA\thyap\nD5AB\thyah\nD5AC\thyae\nD5AD\thyaeg\nD5AE\thyaekk\nD5AF\thyaegs\nD5B0\thyaen\nD5B1\thyaenj\nD5B2\thyaenh\nD5B3\thyaed\nD5B4\thyael\nD5B5\thyaelg\nD5B6\thyaelm\nD5B7\thyaelb\nD5B8\thyaels\nD5B9\thyaelt\nD5BA\thyaelp\nD5BB\thyaelh\nD5BC\thyaem\nD5BD\thyaeb\nD5BE\thyaebs\nD5BF\thyaes\nD5C0\thyaess\nD5C1\thyaeng\nD5C2\thyaej\nD5C3\thyaech\nD5C4\thyaek\nD5C5\thyaet\nD5C6\thyaep\nD5C7\thyaeh\nD5C8\theo\nD5C9\theog\nD5CA\theokk\nD5CB\theogs\nD5CC\theon\nD5CD\theonj\nD5CE\theonh\nD5CF\theod\nD5D0\theol\nD5D1\theolg\nD5D2\theolm\nD5D3\theolb\nD5D4\theols\nD5D5\theolt\nD5D6\theolp\nD5D7\theolh\nD5D8\theom\nD5D9\theob\nD5DA\theobs\nD5DB\theos\nD5DC\theoss\nD5DD\theong\nD5DE\theoj\nD5DF\theoch\nD5E0\theok\nD5E1\theot\nD5E2\theop\nD5E3\theoh\nD5E4\the\nD5E5\theg\nD5E6\thekk\nD5E7\thegs\nD5E8\then\nD5E9\thenj\nD5EA\thenh\nD5EB\thed\nD5EC\thel\nD5ED\thelg\nD5EE\thelm\nD5EF\thelb\nD5F0\thels\nD5F1\thelt\nD5F2\thelp\nD5F3\thelh\nD5F4\them\nD5F5\theb\nD5F6\thebs\nD5F7\thes\nD5F8\thess\nD5F9\theng\nD5FA\thej\nD5FB\thech\nD5FC\thek\nD5FD\thet\nD5FE\thep\nD5FF\theh\nD600\thyeo\nD601\thyeog\nD602\thyeokk\nD603\thyeogs\nD604\thyeon\nD605\thyeonj\nD606\thyeonh\nD607\thyeod\nD608\thyeol\nD609\thyeolg\nD60A\thyeolm\nD60B\thyeolb\nD60C\thyeols\nD60D\thyeolt\nD60E\thyeolp\nD60F\thyeolh\nD610\thyeom\nD611\thyeob\nD612\thyeobs\nD613\thyeos\nD614\thyeoss\nD615\thyeong\nD616\thyeoj\nD617\thyeoch\nD618\thyeok\nD619\thyeot\nD61A\thyeop\nD61B\thyeoh\nD61C\thye\nD61D\thyeg\nD61E\thyekk\nD61F\thyegs\nD620\thyen\nD621\thyenj\nD622\thyenh\nD623\thyed\nD624\thyel\nD625\thyelg\nD626\thyelm\nD627\thyelb\nD628\thyels\nD629\thyelt\nD62A\thyelp\nD62B\thyelh\nD62C\thyem\nD62D\thyeb\nD62E\thyebs\nD62F\thyes\nD630\thyess\nD631\thyeng\nD632\thyej\nD633\thyech\nD634\thyek\nD635\thyet\nD636\thyep\nD637\thyeh\nD638\tho\nD639\thog\nD63A\thokk\nD63B\thogs\nD63C\thon\nD63D\thonj\nD63E\thonh\nD63F\thod\nD640\thol\nD641\tholg\nD642\tholm\nD643\tholb\nD644\thols\nD645\tholt\nD646\tholp\nD647\tholh\nD648\thom\nD649\thob\nD64A\thobs\nD64B\thos\nD64C\thoss\nD64D\thong\nD64E\thoj\nD64F\thoch\nD650\thok\nD651\thot\nD652\thop\nD653\thoh\nD654\thwa\nD655\thwag\nD656\thwakk\nD657\thwags\nD658\thwan\nD659\thwanj\nD65A\thwanh\nD65B\thwad\nD65C\thwal\nD65D\thwalg\nD65E\thwalm\nD65F\thwalb\nD660\thwals\nD661\thwalt\nD662\thwalp\nD663\thwalh\nD664\thwam\nD665\thwab\nD666\thwabs\nD667\thwas\nD668\thwass\nD669\thwang\nD66A\thwaj\nD66B\thwach\nD66C\thwak\nD66D\thwat\nD66E\thwap\nD66F\thwah\nD670\thwae\nD671\thwaeg\nD672\thwaekk\nD673\thwaegs\nD674\thwaen\nD675\thwaenj\nD676\thwaenh\nD677\thwaed\nD678\thwael\nD679\thwaelg\nD67A\thwaelm\nD67B\thwaelb\nD67C\thwaels\nD67D\thwaelt\nD67E\thwaelp\nD67F\thwaelh\nD680\thwaem\nD681\thwaeb\nD682\thwaebs\nD683\thwaes\nD684\thwaess\nD685\thwaeng\nD686\thwaej\nD687\thwaech\nD688\thwaek\nD689\thwaet\nD68A\thwaep\nD68B\thwaeh\nD68C\thoe\nD68D\thoeg\nD68E\thoekk\nD68F\thoegs\nD690\thoen\nD691\thoenj\nD692\thoenh\nD693\thoed\nD694\thoel\nD695\thoelg\nD696\thoelm\nD697\thoelb\nD698\thoels\nD699\thoelt\nD69A\thoelp\nD69B\thoelh\nD69C\thoem\nD69D\thoeb\nD69E\thoebs\nD69F\thoes\nD6A0\thoess\nD6A1\thoeng\nD6A2\thoej\nD6A3\thoech\nD6A4\thoek\nD6A5\thoet\nD6A6\thoep\nD6A7\thoeh\nD6A8\thyo\nD6A9\thyog\nD6AA\thyokk\nD6AB\thyogs\nD6AC\thyon\nD6AD\thyonj\nD6AE\thyonh\nD6AF\thyod\nD6B0\thyol\nD6B1\thyolg\nD6B2\thyolm\nD6B3\thyolb\nD6B4\thyols\nD6B5\thyolt\nD6B6\thyolp\nD6B7\thyolh\nD6B8\thyom\nD6B9\thyob\nD6BA\thyobs\nD6BB\thyos\nD6BC\thyoss\nD6BD\thyong\nD6BE\thyoj\nD6BF\thyoch\nD6C0\thyok\nD6C1\thyot\nD6C2\thyop\nD6C3\thyoh\nD6C4\thu\nD6C5\thug\nD6C6\thukk\nD6C7\thugs\nD6C8\thun\nD6C9\thunj\nD6CA\thunh\nD6CB\thud\nD6CC\thul\nD6CD\thulg\nD6CE\thulm\nD6CF\thulb\nD6D0\thuls\nD6D1\thult\nD6D2\thulp\nD6D3\thulh\nD6D4\thum\nD6D5\thub\nD6D6\thubs\nD6D7\thus\nD6D8\thuss\nD6D9\thung\nD6DA\thuj\nD6DB\thuch\nD6DC\thuk\nD6DD\thut\nD6DE\thup\nD6DF\thuh\nD6E0\thwo\nD6E1\thwog\nD6E2\thwokk\nD6E3\thwogs\nD6E4\thwon\nD6E5\thwonj\nD6E6\thwonh\nD6E7\thwod\nD6E8\thwol\nD6E9\thwolg\nD6EA\thwolm\nD6EB\thwolb\nD6EC\thwols\nD6ED\thwolt\nD6EE\thwolp\nD6EF\thwolh\nD6F0\thwom\nD6F1\thwob\nD6F2\thwobs\nD6F3\thwos\nD6F4\thwoss\nD6F5\thwong\nD6F6\thwoj\nD6F7\thwoch\nD6F8\thwok\nD6F9\thwot\nD6FA\thwop\nD6FB\thwoh\nD6FC\thwe\nD6FD\thweg\nD6FE\thwekk\nD6FF\thwegs\nD700\thwen\nD701\thwenj\nD702\thwenh\nD703\thwed\nD704\thwel\nD705\thwelg\nD706\thwelm\nD707\thwelb\nD708\thwels\nD709\thwelt\nD70A\thwelp\nD70B\thwelh\nD70C\thwem\nD70D\thweb\nD70E\thwebs\nD70F\thwes\nD710\thwess\nD711\thweng\nD712\thwej\nD713\thwech\nD714\thwek\nD715\thwet\nD716\thwep\nD717\thweh\nD718\thwi\nD719\thwig\nD71A\thwikk\nD71B\thwigs\nD71C\thwin\nD71D\thwinj\nD71E\thwinh\nD71F\thwid\nD720\thwil\nD721\thwilg\nD722\thwilm\nD723\thwilb\nD724\thwils\nD725\thwilt\nD726\thwilp\nD727\thwilh\nD728\thwim\nD729\thwib\nD72A\thwibs\nD72B\thwis\nD72C\thwiss\nD72D\thwing\nD72E\thwij\nD72F\thwich\nD730\thwik\nD731\thwit\nD732\thwip\nD733\thwih\nD734\thyu\nD735\thyug\nD736\thyukk\nD737\thyugs\nD738\thyun\nD739\thyunj\nD73A\thyunh\nD73B\thyud\nD73C\thyul\nD73D\thyulg\nD73E\thyulm\nD73F\thyulb\nD740\thyuls\nD741\thyult\nD742\thyulp\nD743\thyulh\nD744\thyum\nD745\thyub\nD746\thyubs\nD747\thyus\nD748\thyuss\nD749\thyung\nD74A\thyuj\nD74B\thyuch\nD74C\thyuk\nD74D\thyut\nD74E\thyup\nD74F\thyuh\nD750\theu\nD751\theug\nD752\theukk\nD753\theugs\nD754\theun\nD755\theunj\nD756\theunh\nD757\theud\nD758\theul\nD759\theulg\nD75A\theulm\nD75B\theulb\nD75C\theuls\nD75D\theult\nD75E\theulp\nD75F\theulh\nD760\theum\nD761\theub\nD762\theubs\nD763\theus\nD764\theuss\nD765\theung\nD766\theuj\nD767\theuch\nD768\theuk\nD769\theut\nD76A\theup\nD76B\theuh\nD76C\thui\nD76D\thuig\nD76E\thuikk\nD76F\thuigs\nD770\thuin\nD771\thuinj\nD772\thuinh\nD773\thuid\nD774\thuil\nD775\thuilg\nD776\thuilm\nD777\thuilb\nD778\thuils\nD779\thuilt\nD77A\thuilp\nD77B\thuilh\nD77C\thuim\nD77D\thuib\nD77E\thuibs\nD77F\thuis\nD780\thuiss\nD781\thuing\nD782\thuij\nD783\thuich\nD784\thuik\nD785\thuit\nD786\thuip\nD787\thuih\nD788\thi\nD789\thig\nD78A\thikk\nD78B\thigs\nD78C\thin\nD78D\thinj\nD78E\thinh\nD78F\thid\nD790\thil\nD791\thilg\nD792\thilm\nD793\thilb\nD794\thils\nD795\thilt\nD796\thilp\nD797\thilh\nD798\thim\nD799\thib\nD79A\thibs\nD79B\this\nD79C\thiss\nD79D\thing\nD79E\thij\nD79F\thich\nD7A0\thik\nD7A1\thit\nD7A2\thip\nD7A3\thih\nF900\tqi\nF901\tgeng\nF902\tche\nF903\tjia\nF904\thua\nF905\tchuan\nF906\tju\nF907\tgui\nF908\tgui\nF909\tqi\nF90A\tjin\nF90B\tla\nF90C\tnai\nF90D\tlan\nF90E\tlai\nF90F\tluo\nF910\tluo\nF911\tluo\nF912\tluo\nF913\tluo\nF914\tle\nF915\tluo\nF916\tlao\nF917\tluo\nF918\tluo\nF919\tlao\nF91A\tluo\nF91B\tluan\nF91C\tluan\nF91D\tlan\nF91E\tlan\nF91F\tlan\nF920\tluan\nF921\tlan\nF922\tlan\nF923\tlan\nF924\tlan\nF925\tla\nF926\tla\nF927\tla\nF928\tlang\nF929\tlang\nF92A\tlang\nF92B\tlang\nF92C\tlang\nF92D\tlai\nF92E\tleng\nF92F\tlao\nF930\tlu\nF931\tlu\nF932\tlu\nF933\tlu\nF934\tlao\nF935\tlu\nF936\tlu\nF937\tlu\nF938\tlu\nF939\tlu\nF93A\tlu\nF93B\tlu\nF93C\tlu\nF93D\tlu\nF93E\tlu\nF93F\tlu\nF940\tlu\nF941\tlun\nF942\tlong\nF943\tnong\nF944\tlong\nF945\tlong\nF946\tlao\nF947\tlei\nF948\tlu\nF949\tlei\nF94A\tlei\nF94B\tlu\nF94C\tlou\nF94D\tlei\nF94E\tlou\nF94F\tlei\nF950\tlu\nF951\tlou\nF952\tlei\nF953\tlei\nF954\tlin\nF955\tling\nF956\tleng\nF957\tling\nF958\tling\nF959\tling\nF95A\tdu\nF95B\tna\nF95C\tle\nF95D\tnuo\nF95E\tdan\nF95F\tning\nF960\tnu\nF961\tlu\nF962\tyi\nF963\tbei\nF964\tpan\nF965\tbian\nF966\tfu\nF967\tbu\nF968\tmi\nF969\tshu\nF96A\tsuo\nF96B\tcan\nF96C\tsai\nF96D\tsheng\nF96E\tye\nF96F\tshuo\nF970\tsha\nF971\tchen\nF972\tshen\nF973\tshi\nF974\truo\nF975\tlue\nF976\tlue\nF977\tliang\nF978\tliang\nF979\tliang\nF97A\tliang\nF97B\tliang\nF97C\tliang\nF97D\tliang\nF97E\tliang\nF97F\tli\nF980\tlu\nF981\tnu\nF982\tlu\nF983\tlu\nF984\tlu\nF985\tli\nF986\tlu\nF987\tli\nF988\tli\nF989\tli\nF98A\tli\nF98B\tli\nF98C\tli\nF98D\tli\nF98E\tnian\nF98F\tlian\nF990\tlian\nF991\tnian\nF992\tlian\nF993\tlian\nF994\tlian\nF995\tnian\nF996\tlian\nF997\tlian\nF998\tnian\nF999\tlian\nF99A\tlian\nF99B\tlian\nF99C\tlie\nF99D\tlie\nF99E\tyan\nF99F\tlie\nF9A0\tlie\nF9A1\tshuo\nF9A2\tlian\nF9A3\tnian\nF9A4\tnian\nF9A5\tlian\nF9A6\tlian\nF9A7\tlie\nF9A8\tling\nF9A9\tling\nF9AA\tning\nF9AB\tling\nF9AC\tlian\nF9AD\tling\nF9AE\tying\nF9AF\tling\nF9B0\tling\nF9B1\tling\nF9B2\tling\nF9B3\tling\nF9B4\tling\nF9B5\tli\nF9B6\tli\nF9B7\tli\nF9B8\tli\nF9B9\te\nF9BA\tle\nF9BB\tliao\nF9BC\tliao\nF9BD\tniao\nF9BE\tliao\nF9BF\tle\nF9C0\tliao\nF9C1\tliao\nF9C2\tliao\nF9C3\tliao\nF9C4\tlong\nF9C5\tyun\nF9C6\truan\nF9C7\tliu\nF9C8\tchou\nF9C9\tliu\nF9CA\tliu\nF9CB\tliu\nF9CC\tliu\nF9CD\tliu\nF9CE\tliu\nF9CF\tniu\nF9D0\tlei\nF9D1\tliu\nF9D2\tlu\nF9D3\tlu\nF9D4\tlun\nF9D5\tlun\nF9D6\tlun\nF9D7\tlun\nF9D8\tlu\nF9D9\tli\nF9DA\tli\nF9DB\tlu\nF9DC\tlong\nF9DD\tli\nF9DE\tli\nF9DF\tlu\nF9E0\tyi\nF9E1\tli\nF9E2\tli\nF9E3\tni\nF9E4\tli\nF9E5\tli\nF9E6\tli\nF9E7\tli\nF9E8\tli\nF9E9\tli\nF9EA\tli\nF9EB\tni\nF9EC\tni\nF9ED\tlin\nF9EE\tlin\nF9EF\tlin\nF9F0\tlin\nF9F1\tlin\nF9F2\tlin\nF9F3\tlin\nF9F4\tlin\nF9F5\tlin\nF9F6\tlin\nF9F7\tli\nF9F8\tli\nF9F9\tli\nF9FA\tzhuang\nF9FB\tzhi\nF9FC\tshi\nF9FD\tshen\nF9FE\tcha\nF9FF\tci\nFA00\tqie\nFA01\tdu\nFA02\tta\nFA03\ttang\nFA04\tzhai\nFA05\tdong\nFA06\tbao\nFA07\tfu\nFA08\txing\nFA09\tjiang\nFA0A\tjian\nFA0B\tkuo\nFA0C\twu\nFA0D\thu\nFA10\tzhong\nFA12\tqing\nFA15\txi\nFA16\tzhu\nFA17\tyi\nFA18\tli\nFA19\tshen\nFA1A\txiang\nFA1B\tfu\nFA1C\tjing\nFA1D\tjing\nFA1E\tyu\nFA20\tqiu\nFA22\tzhu\nFA25\tyi\nFA26\tdou\nFA2A\tfan\nFA2B\tsi\nFA2C\tguan\nFA2D\the\nFA2E\tlang\nFA2F\tli\nFA30\twu\nFA31\tseng\nFA32\tmian\nFA33\tmian\nFA34\tqin\nFA35\tbei\nFA36\the\nFA37\ttan\nFA38\tqi\nFA39\tping\nFA3A\tmo\nFA3B\tceng\nFA3C\tche\nFA3D\thui\nFA3E\tkai\nFA3F\tzeng\nFA40\tcheng\nFA41\tmin\nFA42\tji\nFA43\tshu\nFA44\tmei\nFA45\thai\nFA46\tzhu\nFA47\than\nFA48\tzhu\nFA49\tzhao\nFA4A\tzuo\nFA4B\tbei\nFA4C\tshe\nFA4D\tzhi\nFA4E\tqi\nFA4F\tyou\nFA50\tzu\nFA51\tzhu\nFA52\thuo\nFA53\tzhen\nFA54\tgu\nFA55\ttu\nFA56\tjie\nFA57\tlian\nFA58\tjin\nFA59\tfan\nFA5A\tshu\nFA5B\tzhe\nFA5C\tchou\nFA5D\tcao\nFA5E\tcao\nFA5F\tzhu\nFA60\the\nFA61\tshi\nFA62\tye\nFA63\tjin\nFA64\tbin\nFA65\tzeng\nFA66\tchuo\nFA67\tyi\nFA68\tnan\nFA69\txiang\nFA6A\tpin\nFA6B\thui\nFA6D\tguan\nFA70\tbing\nFA71\tkuang\nFA72\tquan\nFA73\txing\nFA74\tchong\nFA75\tji\nFA76\tyong\nFA77\tshao\nFA78\the\nFA79\ttao\nFA7A\thui\nFA7B\twa\nFA7C\tzhong\nFA7D\tfen\nFA7E\tyan\nFA7F\tben\nFA80\tbi\nFA81\tci\nFA82\tao\nFA83\tyi\nFA84\tcai\nFA85\tyao\nFA86\twang\nFA87\tshen\nFA88\tyu\nFA89\tzeng\nFA8A\tao\nFA8B\tcheng\nFA8C\tdai\nFA8D\tyu\nFA8E\tsou\nFA8F\tbing\nFA90\tao\nFA91\tqing\nFA92\tlang\nFA93\twang\nFA94\tzhang\nFA95\tdai\nFA96\tsha\nFA97\tliu\nFA98\tyin\nFA99\tzi\nFA9A\than\nFA9B\tjing\nFA9C\tzhu\nFA9D\tqiao\nFA9E\tjue\nFA9F\tfan\nFAA0\tzhu\nFAA1\ttian\nFAA2\tci\nFAA3\thua\nFAA4\tguan\nFAA5\twen\nFAA6\tyi\nFAA7\tsheng\nFAA8\tzhi\nFAA9\tjuan\nFAAA\tzhe\nFAAB\ttian\nFAAC\ttiao\nFAAD\tjie\nFAAE\tlei\nFAAF\ttao\nFAB0\tlian\nFAB1\tping\nFAB2\tzhe\nFAB3\thuang\nFAB4\thua\nFAB5\tyun\nFAB6\tqiang\nFAB7\tfu\nFAB8\tshi\nFAB9\tdiao\nFABA\tzhu\nFABB\tqing\nFABC\tye\nFABD\tnuo\nFABE\tyu\nFABF\tjin\nFAC0\tbian\nFAC1\tzeng\nFAC2\tshu\nFAC3\tchi\nFAC4\tsou\nFAC5\txing\nFAC6\tzhu\nFAC7\tnan\nFAC8\tjing\nFAC9\tbai\nFACA\txiang\nFACB\te\nFACC\tpin\nFACD\tzhen\nFACE\tgui\nFAD2\the\nFAD3\txie\nFAD4\tjie\nFAD6\tqian\nFAD7\tbeng\nFAD8\te\nFAD9\tpang\nFB1D\tyi\nFB1F\tyya\nFB20\t'\nFB21\t'\nFB22\td\nFB23\th\nFB24\tk\nFB25\tl\nFB26\tm\nFB27\tr\nFB28\tt\nFB29\t+\nFB2A\ts\nFB2B\ts\nFB2C\ts\nFB2D\ts\nFB2E\t'a\nFB2F\t'a\nFB30\t'\nFB31\tb\nFB32\tg\nFB33\td\nFB34\th\nFB35\tw\nFB36\tz\nFB38\tt\nFB39\ty\nFB3A\tk\nFB3B\tk\nFB3C\tl\nFB3E\tm\nFB40\tn\nFB41\ts\nFB43\tp\nFB44\tp\nFB46\tz\nFB47\tq\nFB48\tr\nFB49\ts\nFB4A\tt\nFB4B\two\nFB4C\tb\nFB4D\tk\nFB4E\tp\nFB4F\t'l\nFB52\tb\nFB53\tb\nFB54\tb\nFB55\tb\nFB56\tp\nFB57\tp\nFB58\tp\nFB59\tp\nFB5A\tbh\nFB5B\tbh\nFB5C\tbh\nFB5D\tbh\nFB5E\tth\nFB5F\tth\nFB60\tth\nFB61\tth\nFB62\tth\nFB63\tth\nFB64\tth\nFB65\tth\nFB66\tt\nFB67\tt\nFB68\tt\nFB69\tt\nFB6A\tv\nFB6B\tv\nFB6C\tv\nFB6D\tv\nFB6E\tph\nFB6F\tph\nFB70\tph\nFB71\tph\nFB72\tj\nFB73\tj\nFB74\tj\nFB75\tj\nFB76\tn\nFB77\tn\nFB78\tn\nFB79\tn\nFB7A\tch\nFB7B\tch\nFB7C\tch\nFB7D\tch\nFB7E\tch\nFB7F\tch\nFB80\tch\nFB81\tch\nFB82\tdh\nFB83\tdh\nFB84\tdh\nFB85\tdh\nFB88\td\nFB89\td\nFB8A\tzh\nFB8B\tzh\nFB8C\tr\nFB8D\tr\nFB8E\tk\nFB8F\tk\nFB90\tk\nFB91\tk\nFB92\tg\nFB93\tg\nFB94\tg\nFB95\tg\nFB96\tg\nFB97\tg\nFB98\tg\nFB99\tg\nFB9A\tn\nFB9B\tn\nFB9C\tn\nFB9D\tn\nFBA0\tn\nFBA1\tn\nFBA2\tn\nFBA3\tn\nFBA4\th\nFBA5\th\nFBA6\th\nFBA7\th\nFBA8\th\nFBA9\th\nFBAE\tai\nFBAF\tai\nFBB0\tai\nFBB1\tai\nFBD3\tng\nFBD4\tng\nFBD5\tng\nFBD6\tng\nFBDE\tv\nFBDF\tv\nFBE4\te\nFBE5\te\nFBE6\te\nFBE7\te\nFBE8\ty\nFBE9\ty\nFBEA\tya\nFBEB\tya\nFBEC\tyh\nFBED\tyh\nFBEE\tyw\nFBEF\tyw\nFBF0\ty\nFBF1\ty\nFBF2\ty\nFBF3\ty\nFBF4\ty\nFBF5\ty\nFBF6\tye\nFBF7\tye\nFBF8\tye\nFBF9\tyy\nFBFA\tyy\nFBFB\tyy\nFBFC\ty\nFBFD\ty\nFBFE\ty\nFBFF\ty\nFC00\tyj\nFC01\tyh\nFC02\tym\nFC03\tyy\nFC04\tyy\nFC05\tbj\nFC06\tbh\nFC07\tbkh\nFC08\tbm\nFC09\tby\nFC0A\tby\nFC0B\ttj\nFC0C\tth\nFC0D\ttkh\nFC0E\ttm\nFC0F\tty\nFC10\tty\nFC11\tthj\nFC12\tthm\nFC13\tthy\nFC14\tthy\nFC15\tjh\nFC16\tjm\nFC17\thj\nFC18\thm\nFC19\tkhj\nFC1A\tkhh\nFC1B\tkhm\nFC1C\tsj\nFC1D\tsh\nFC1E\tskh\nFC1F\tsm\nFC20\tsh\nFC21\tsm\nFC22\tdj\nFC23\tdh\nFC24\tdkh\nFC25\tdm\nFC26\tth\nFC27\ttm\nFC28\tzm\nFC29\tj\nFC2A\tm\nFC2B\tghj\nFC2C\tghm\nFC2D\tfj\nFC2E\tfh\nFC2F\tfkh\nFC30\tfm\nFC31\tfy\nFC32\tfy\nFC33\tqh\nFC34\tqm\nFC35\tqy\nFC36\tqy\nFC37\tka\nFC38\tkj\nFC39\tkh\nFC3A\tkkh\nFC3B\tkl\nFC3C\tkm\nFC3D\tky\nFC3E\tky\nFC3F\tlj\nFC40\tlh\nFC41\tlkh\nFC42\tlm\nFC43\tly\nFC44\tly\nFC45\tmj\nFC46\tmh\nFC47\tmkh\nFC48\tmm\nFC49\tmy\nFC4A\tmy\nFC4B\tnj\nFC4C\tnh\nFC4D\tnkh\nFC4E\tnm\nFC4F\tny\nFC50\tny\nFC51\thj\nFC52\thm\nFC53\thy\nFC54\thy\nFC55\tyj\nFC56\tyh\nFC57\tykh\nFC58\tym\nFC59\tyy\nFC5A\tyy\nFC5B\tdh\nFC5C\tr\nFC5D\ty\nFC5E\tu\nFC5F\ti\nFC60\ta\nFC61\tu\nFC62\ti\nFC64\tyr\nFC65\tyz\nFC66\tym\nFC67\tyn\nFC68\tyy\nFC69\tyy\nFC6A\tbr\nFC6B\tbz\nFC6C\tbm\nFC6D\tbn\nFC6E\tby\nFC6F\tby\nFC70\ttr\nFC71\ttz\nFC72\ttm\nFC73\ttn\nFC74\tty\nFC75\tty\nFC76\tthr\nFC77\tthz\nFC78\tthm\nFC79\tthn\nFC7A\tthy\nFC7B\tthy\nFC7C\tfy\nFC7D\tfy\nFC7E\tqy\nFC7F\tqy\nFC80\tka\nFC81\tkl\nFC82\tkm\nFC83\tky\nFC84\tky\nFC85\tlm\nFC86\tly\nFC87\tly\nFC88\tma\nFC89\tmm\nFC8A\tnr\nFC8B\tnz\nFC8C\tnm\nFC8D\tnn\nFC8E\tny\nFC8F\tny\nFC90\ty\nFC91\tyr\nFC92\tyz\nFC93\tym\nFC94\tyn\nFC95\tyy\nFC96\tyy\nFC97\tyj\nFC98\tyh\nFC99\tykh\nFC9A\tym\nFC9B\tyh\nFC9C\tbj\nFC9D\tbh\nFC9E\tbkh\nFC9F\tbm\nFCA0\tbh\nFCA1\ttj\nFCA2\tth\nFCA3\ttkh\nFCA4\ttm\nFCA5\tth\nFCA6\tthm\nFCA7\tjh\nFCA8\tjm\nFCA9\thj\nFCAA\thm\nFCAB\tkhj\nFCAC\tkhm\nFCAD\tsj\nFCAE\tsh\nFCAF\tskh\nFCB0\tsm\nFCB1\tsh\nFCB2\tskh\nFCB3\tsm\nFCB4\tdj\nFCB5\tdh\nFCB6\tdkh\nFCB7\tdm\nFCB8\tth\nFCB9\tzm\nFCBA\tj\nFCBB\tm\nFCBC\tghj\nFCBD\tghm\nFCBE\tfj\nFCBF\tfh\nFCC0\tfkh\nFCC1\tfm\nFCC2\tqh\nFCC3\tqm\nFCC4\tkj\nFCC5\tkh\nFCC6\tkkh\nFCC7\tkl\nFCC8\tkm\nFCC9\tlj\nFCCA\tlh\nFCCB\tlkh\nFCCC\tlm\nFCCD\tlh\nFCCE\tmj\nFCCF\tmh\nFCD0\tmkh\nFCD1\tmm\nFCD2\tnj\nFCD3\tnh\nFCD4\tnkh\nFCD5\tnm\nFCD6\tnh\nFCD7\thj\nFCD8\thm\nFCD9\th\nFCDA\tyj\nFCDB\tyh\nFCDC\tykh\nFCDD\tym\nFCDE\tyh\nFCDF\tym\nFCE0\tyh\nFCE1\tbm\nFCE2\tbh\nFCE3\ttm\nFCE4\tth\nFCE5\tthm\nFCE6\tthh\nFCE7\tsm\nFCE8\tsh\nFCE9\tshm\nFCEA\tshh\nFCEB\tkl\nFCEC\tkm\nFCED\tlm\nFCEE\tnm\nFCEF\tnh\nFCF0\tym\nFCF1\tyh\nFCF2\ta\nFCF3\tu\nFCF4\ti\nFCF5\tty\nFCF6\tty\nFCF7\ty\nFCF8\ty\nFCF9\tghy\nFCFA\tghy\nFCFB\tsy\nFCFC\tsy\nFCFD\tshy\nFCFE\tshy\nFCFF\thy\nFD00\thy\nFD01\tjy\nFD02\tjy\nFD03\tkhy\nFD04\tkhy\nFD05\tsy\nFD06\tsy\nFD07\tdy\nFD08\tdy\nFD09\tshj\nFD0A\tshh\nFD0B\tshkh\nFD0C\tshm\nFD0D\tshr\nFD0E\tsr\nFD0F\tsr\nFD10\tdr\nFD11\tty\nFD12\tty\nFD13\ty\nFD14\ty\nFD15\tghy\nFD16\tghy\nFD17\tsy\nFD18\tsy\nFD19\tshy\nFD1A\tshy\nFD1B\thy\nFD1C\thy\nFD1D\tjy\nFD1E\tjy\nFD1F\tkhy\nFD20\tkhy\nFD21\tsy\nFD22\tsy\nFD23\tdy\nFD24\tdy\nFD25\tshj\nFD26\tshh\nFD27\tshkh\nFD28\tshm\nFD29\tshr\nFD2A\tsr\nFD2B\tsr\nFD2C\tdr\nFD2D\tshj\nFD2E\tshh\nFD2F\tshkh\nFD30\tshm\nFD31\tsh\nFD32\tshh\nFD33\ttm\nFD34\tsj\nFD35\tsh\nFD36\tskh\nFD37\tshj\nFD38\tshh\nFD39\tshkh\nFD3A\ttm\nFD3B\tzm\nFD3C\taa\nFD3D\taa\nFD50\ttjm\nFD51\tthj\nFD52\tthj\nFD53\tthm\nFD54\ttkhm\nFD55\ttmj\nFD56\ttmh\nFD57\ttmkh\nFD58\tjmh\nFD59\tjmh\nFD5A\thmy\nFD5B\thmy\nFD5C\tshj\nFD5D\tsjh\nFD5E\tsjy\nFD5F\tsmh\nFD60\tsmh\nFD61\tsmj\nFD62\tsmm\nFD63\tsmm\nFD64\tshh\nFD65\tshh\nFD66\tsmm\nFD67\tshhm\nFD68\tshhm\nFD69\tshjy\nFD6A\tshmkh\nFD6B\tshmkh\nFD6C\tshmm\nFD6D\tshmm\nFD6E\tdhy\nFD6F\tdkhm\nFD70\tdkhm\nFD71\ttmh\nFD72\ttmh\nFD73\ttmm\nFD74\ttmy\nFD75\tjm\nFD76\tmm\nFD77\tmm\nFD78\tmy\nFD79\tghmm\nFD7A\tghmy\nFD7B\tghmy\nFD7C\tfkhm\nFD7D\tfkhm\nFD7E\tqmh\nFD7F\tqmm\nFD80\tlhm\nFD81\tlhy\nFD82\tlhy\nFD83\tljj\nFD84\tljj\nFD85\tlkhm\nFD86\tlkhm\nFD87\tlmh\nFD88\tlmh\nFD89\tmhj\nFD8A\tmhm\nFD8B\tmhy\nFD8C\tmjh\nFD8D\tmjm\nFD8E\tmkhj\nFD8F\tmkhm\nFD92\tmjkh\nFD93\thmj\nFD94\thmm\nFD95\tnhm\nFD96\tnhy\nFD97\tnjm\nFD98\tnjm\nFD99\tnjy\nFD9A\tnmy\nFD9B\tnmy\nFD9C\tymm\nFD9D\tymm\nFD9E\tbkhy\nFD9F\ttjy\nFDA0\ttjy\nFDA1\ttkhy\nFDA2\ttkhy\nFDA3\ttmy\nFDA4\ttmy\nFDA5\tjmy\nFDA6\tjhy\nFDA7\tjmy\nFDA8\tskhy\nFDA9\tshy\nFDAA\tshhy\nFDAB\tdhy\nFDAC\tljy\nFDAD\tlmy\nFDAE\tyhy\nFDAF\tyjy\nFDB0\tymy\nFDB1\tmmy\nFDB2\tqmy\nFDB3\tnhy\nFDB4\tqmh\nFDB5\tlhm\nFDB6\tmy\nFDB7\tkmy\nFDB8\tnjh\nFDB9\tmkhy\nFDBA\tljm\nFDBB\tkmm\nFDBC\tljm\nFDBD\tnjh\nFDBE\tjhy\nFDBF\thjy\nFDC0\tmjy\nFDC1\tfmy\nFDC2\tbhy\nFDC3\tkmm\nFDC4\tjm\nFDC5\tsmm\nFDC6\tskhy\nFDC7\tnjy\nFDF0\tslai\nFDF1\tqlai\nFDF2\tallh\nFDF3\takbr\nFDF4\tmhmd\nFDF5\tslm\nFDF6\trswl\nFDF7\tlyh\nFDF8\twslm\nFDF9\tsly\nFDFA\tsly allh lyh wslm\nFDFB\tjl jlalh\nFDFC\tryal\nFE10\t,\nFE11\t,\nFE12\t.\nFE13\t:\nFE14\t;\nFE15\t!\nFE16\t?\nFE19\t...\nFE30\t..\nFE31\t-\nFE32\t-\nFE35\t(\nFE36\t)\nFE37\t{\nFE38\t}\nFE39\t[\nFE3A\t]\nFE3D\t<<\nFE3E\t>>\nFE3F\t<\nFE40\t>\nFE47\t[\nFE48\t]\nFE50\t,\nFE51\t,\nFE52\t.\nFE54\t;\nFE55\t:\nFE56\t?\nFE57\t!\nFE58\t-\nFE59\t(\nFE5A\t)\nFE5B\t{\nFE5C\t}\nFE5D\t[\nFE5E\t]\nFE5F\t#\nFE60\t&\nFE61\t*\nFE62\t+\nFE63\t-\nFE64\t<\nFE65\t>\nFE66\t=\nFE68\t\\\nFE69\t$\nFE6A\t%\nFE6B\t@\nFE70\ta\nFE71\ta\nFE72\tu\nFE74\ti\nFE76\ta\nFE77\ta\nFE78\tu\nFE79\tu\nFE7A\ti\nFE7B\ti\nFE81\ta\nFE82\ta\nFE83\ta\nFE84\ta\nFE85\tw\nFE86\tw\nFE87\ta\nFE88\ta\nFE89\ty\nFE8A\ty\nFE8B\ty\nFE8C\ty\nFE8D\ta\nFE8E\ta\nFE8F\tb\nFE90\tb\nFE91\tb\nFE92\tb\nFE93\tt\nFE94\tt\nFE95\tt\nFE96\tt\nFE97\tt\nFE98\tt\nFE99\tth\nFE9A\tth\nFE9B\tth\nFE9C\tth\nFE9D\tj\nFE9E\tj\nFE9F\tj\nFEA0\tj\nFEA1\th\nFEA2\th\nFEA3\th\nFEA4\th\nFEA5\tkh\nFEA6\tkh\nFEA7\tkh\nFEA8\tkh\nFEA9\td\nFEAA\td\nFEAB\tdh\nFEAC\tdh\nFEAD\tr\nFEAE\tr\nFEAF\tz\nFEB0\tz\nFEB1\ts\nFEB2\ts\nFEB3\ts\nFEB4\ts\nFEB5\tsh\nFEB6\tsh\nFEB7\tsh\nFEB8\tsh\nFEB9\ts\nFEBA\ts\nFEBB\ts\nFEBC\ts\nFEBD\td\nFEBE\td\nFEBF\td\nFEC0\td\nFEC1\tt\nFEC2\tt\nFEC3\tt\nFEC4\tt\nFEC5\tz\nFEC6\tz\nFEC7\tz\nFEC8\tz\nFECD\tgh\nFECE\tgh\nFECF\tgh\nFED0\tgh\nFED1\tf\nFED2\tf\nFED3\tf\nFED4\tf\nFED5\tq\nFED6\tq\nFED7\tq\nFED8\tq\nFED9\tk\nFEDA\tk\nFEDB\tk\nFEDC\tk\nFEDD\tl\nFEDE\tl\nFEDF\tl\nFEE0\tl\nFEE1\tm\nFEE2\tm\nFEE3\tm\nFEE4\tm\nFEE5\tn\nFEE6\tn\nFEE7\tn\nFEE8\tn\nFEE9\th\nFEEA\th\nFEEB\th\nFEEC\th\nFEED\tw\nFEEE\tw\nFEEF\ty\nFEF0\ty\nFEF1\ty\nFEF2\ty\nFEF3\ty\nFEF4\ty\nFEF5\tla\nFEF6\tla\nFEF7\tla\nFEF8\tla\nFEF9\tla\nFEFA\tla\nFEFB\tla\nFEFC\tla\nFF01\t!\nFF02\t\"\nFF03\t#\nFF04\t$\nFF05\t%\nFF06\t&\nFF07\t'\nFF08\t(\nFF09\t)\nFF0A\t*\nFF0B\t+\nFF0C\t,\nFF0D\t-\nFF0E\t.\nFF0F\t/\nFF10\t0\nFF11\t1\nFF12\t2\nFF13\t3\nFF14\t4\nFF15\t5\nFF16\t6\nFF17\t7\nFF18\t8\nFF19\t9\nFF1A\t:\nFF1B\t;\nFF1C\t<\nFF1D\t=\nFF1E\t>\nFF1F\t?\nFF20\t@\nFF3B\t[\nFF3C\t\\\nFF3D\t]\nFF3E\t^\nFF3F\t_\nFF40\t`\nFF5B\t{\nFF5C\t|\nFF5D\t}\nFF5E\t~\nFF5F\t((\nFF60\t))\nFF61\t.\nFF64\t,\nFF66\two\nFF67\t~a\nFF68\t~i\nFF69\t~u\nFF6A\t~e\nFF6B\t~o\nFF6C\t~ya\nFF6D\t~yu\nFF6E\t~yo\nFF6F\t~tsu\nFF71\ta\nFF72\ti\nFF73\tu\nFF74\te\nFF75\to\nFF76\tka\nFF77\tki\nFF78\tku\nFF79\tke\nFF7A\tko\nFF7B\tsa\nFF7C\tshi\nFF7D\tsu\nFF7E\tse\nFF7F\tso\nFF80\tta\nFF81\tchi\nFF82\ttsu\nFF83\tte\nFF84\tto\nFF85\tna\nFF86\tni\nFF87\tnu\nFF88\tne\nFF89\tno\nFF8A\tha\nFF8B\thi\nFF8C\tfu\nFF8D\the\nFF8E\tho\nFF8F\tma\nFF90\tmi\nFF91\tmu\nFF92\tme\nFF93\tmo\nFF94\tya\nFF95\tyu\nFF96\tyo\nFF97\tra\nFF98\tri\nFF99\tru\nFF9A\tre\nFF9B\tro\nFF9C\twa\nFF9D\tn\nFFA1\tg\nFFA2\tkk\nFFA3\tgs\nFFA4\tn\nFFA5\tnj\nFFA6\tnh\nFFA7\td\nFFA8\ttt\nFFA9\tl\nFFAA\tlg\nFFAB\tlm\nFFAC\tlb\nFFAD\tls\nFFAE\tlt\nFFAF\tlp\nFFB1\tm\nFFB2\tb\nFFB3\tpp\nFFB5\ts\nFFB6\tss\nFFB8\tj\nFFB9\tjj\nFFBA\tch\nFFBB\tk\nFFBC\tt\nFFBD\tp\nFFBE\th\nFFC2\ta\nFFC3\tae\nFFC4\tya\nFFC5\tyae\nFFC6\teo\nFFC7\te\nFFCA\tyeo\nFFCB\tye\nFFCC\to\nFFCD\twa\nFFCE\twae\nFFCF\toe\nFFD2\tyo\nFFD3\tu\nFFD4\two\nFFD5\twe\nFFD6\twi\nFFD7\tyu\nFFDA\teu\nFFDB\tui\nFFDC\ti\nFFE9\t<-\nFFEB\t->\n1EE00\ta\n1EE01\tb\n1EE02\tj\n1EE03\td\n1EE05\tw\n1EE06\tz\n1EE07\th\n1EE08\tt\n1EE09\ty\n1EE0A\tk\n1EE0B\tl\n1EE0C\tm\n1EE0D\tn\n1EE0E\ts\n1EE10\tf\n1EE11\ts\n1EE12\tq\n1EE13\tr\n1EE14\tsh\n1EE15\tt\n1EE16\tth\n1EE17\tkh\n1EE18\tdh\n1EE19\td\n1EE1A\tz\n1EE1B\tgh\n1EE21\tb\n1EE22\tj\n1EE24\th\n1EE27\th\n1EE29\ty\n1EE2A\tk\n1EE2B\tl\n1EE2C\tm\n1EE2D\tn\n1EE2E\ts\n1EE30\tf\n1EE31\ts\n1EE32\tq\n1EE34\tsh\n1EE35\tt\n1EE36\tth\n1EE37\tkh\n1EE39\td\n1EE3B\tgh\n1EE42\tj\n1EE47\th\n1EE49\ty\n1EE4B\tl\n1EE4D\tn\n1EE4E\ts\n1EE51\ts\n1EE52\tq\n1EE54\tsh\n1EE57\tkh\n1EE59\td\n1EE5B\tgh\n1EE61\tb\n1EE62\tj\n1EE64\th\n1EE67\th\n1EE68\tt\n1EE69\ty\n1EE6A\tk\n1EE6C\tm\n1EE6D\tn\n1EE6E\ts\n1EE70\tf\n1EE71\ts\n1EE72\tq\n1EE74\tsh\n1EE75\tt\n1EE76\tth\n1EE77\tkh\n1EE79\td\n1EE7A\tz\n1EE7B\tgh\n1EE80\ta\n1EE81\tb\n1EE82\tj\n1EE83\td\n1EE84\th\n1EE85\tw\n1EE86\tz\n1EE87\th\n1EE88\tt\n1EE89\ty\n1EE8B\tl\n1EE8C\tm\n1EE8D\tn\n1EE8E\ts\n1EE90\tf\n1EE91\ts\n1EE92\tq\n1EE93\tr\n1EE94\tsh\n1EE95\tt\n1EE96\tth\n1EE97\tkh\n1EE98\tdh\n1EE99\td\n1EE9A\tz\n1EE9B\tgh\n1EEA1\tb\n1EEA2\tj\n1EEA3\td\n1EEA5\tw\n1EEA6\tz\n1EEA7\th\n1EEA8\tt\n1EEA9\ty\n1EEAB\tl\n1EEAC\tm\n1EEAD\tn\n1EEAE\ts\n1EEB0\tf\n1EEB1\ts\n1EEB2\tq\n1EEB3\tr\n1EEB4\tsh\n1EEB5\tt\n1EEB6\tth\n1EEB7\tkh\n1EEB8\tdh\n1EEB9\td\n1EEBA\tz\n1EEBB\tgh\n1F100\t0.\n1F101\t0,\n1F102\t1,\n1F103\t2,\n1F104\t3,\n1F105\t4,\n1F106\t5,\n1F107\t6,\n1F108\t7,\n1F109\t8,\n1F10A\t9,\n1F110\t(A)\n1F111\t(B)\n1F112\t(C)\n1F113\t(D)\n1F114\t(E)\n1F115\t(F)\n1F116\t(G)\n1F117\t(H)\n1F118\t(I)\n1F119\t(J)\n1F11A\t(K)\n1F11B\t(L)\n1F11C\t(M)\n1F11D\t(N)\n1F11E\t(O)\n1F11F\t(P)\n1F120\t(Q)\n1F121\t(R)\n1F122\t(S)\n1F123\t(T)\n1F124\t(U)\n1F125\t(V)\n1F126\t(W)\n1F127\t(X)\n1F128\t(Y)\n1F129\t(Z)\n20000\the\n20001\tqi\n20003\tqie\n20005\thai\n20009\tqiu\n2000A\tcao\n2000D\tshi\n20013\tsi\n20014\tjue\n2001B\tyu\n2001D\tkong\n20022\tzi\n20026\txing\n20031\tmou\n20037\tji\n20038\tye\n20039\tjun\n2003C\tqian\n2003D\tlu\n20041\tdou\n20049\tchu\n20057\tshi\n20060\tqie\n20065\tga\n2006D\tqi\n20077\tchan\n20084\thuan\n20086\tyi\n20087\tzuo\n20088\tjie\n20091\tzou\n20094\tzi\n2009D\tza\n2009F\tjin\n200A2\tpai\n200A4\tdui\n200A5\tcong\n200A7\tshen\n200B8\thuang\n200CA\tyin\n200CC\tgun\n200D3\tyang\n200D6\tjiu\n200EB\tshen\n200FA\tjiu\n20105\tye\n20109\tdong\n2010C\tjue\n2010D\tjie\n2010F\tdiao\n20111\tjue\n20112\tchui\n20116\tling\n2011A\tting\n20123\tgen\n2012E\tya\n20131\tyi\n2013F\twei\n20142\tjie\n2014C\tyi\n20157\tdie\n2015A\tqi\n20164\txi\n2016C\tbao\n20171\txie\n20179\tzhang\n2018C\tyong\n20190\txu\n20199\tdie\n2019B\tdan\n2019F\twei\n201A3\tgua\n201A9\tfan\n201AE\tmo\n201B1\txi\n201B2\tyan\n201B5\tni\n201B6\tdan\n201CB\tdan\n201CF\ttao\n201D0\tyu\n201D2\tgong\n201D7\tkua\n201D8\tchu\n201EF\tqu\n201F1\tmo\n201F3\tshi\n201F5\tgan\n201F7\tsheng\n201F9\tjing\n20201\ttuo\n20205\tshou\n2020A\tnie\n20224\tyun\n20225\tgua\n2022C\txiao\n2022D\tlao\n20230\tdan\n20231\tsuo\n20235\tmang\n20236\tyi\n20238\tte\n2023A\tbi\n20242\tta\n20257\tluo\n20262\txi\n20263\thun\n20264\tda\n20267\tju\n20269\tdu\n2026C\tan\n20289\tmei\n2028C\tran\n2028E\tai\n2028F\tyu\n20292\tjian\n20294\tqi\n2029F\tmin\n202A3\tzhou\n202A4\tzhi\n202A5\tzhong\n202A6\tnao\n202A7\tbing\n202A9\tzhuan\n202AA\tshu\n202AB\txun\n202AC\tjue\n202AD\tqian\n202B0\tgua\n202B2\ttu\n202B6\tying\n202B7\tzhi\n202BE\tkui\n202C6\tchen\n202D6\tlian\n202D7\tya\n202DC\tguo\n202DD\tmiao\n202DE\tshe\n202DF\tyu\n202E1\tsi\n202E2\tsou\n202E4\tzhi\n202E7\tqie\n202E9\tfu\n202EC\tju\n202ED\tbei\n202EF\tbi\n202F2\tsuo\n202F5\tqian\n202F6\tming\n202F7\tchan\n202FA\tsao\n202FB\tji\n20315\tgong\n20316\tqiong\n2031A\trong\n2031E\tsou\n2031F\tsou\n20320\tyao\n2032A\tchou\n2032D\tshuai\n2032E\tzhe\n2032F\tli\n20330\tgai\n20331\tsui\n20332\tzhan\n20334\tzhuang\n2033D\tfu\n20343\tji\n20344\tdou\n20357\thui\n2035A\tjian\n2035B\tyan\n2035C\tzhi\n20368\tmei\n20369\tyao\n2036A\tdi\n2036B\tyi\n2036F\tbie\n20372\tqu\n20373\tyi\n20375\tyang\n20379\tzha\n2037D\tsha\n20399\tlai\n203AE\tjue\n203B0\tqi\n203B3\tyu\n203B6\tzai\n203B7\tsa\n203B8\tse\n203BB\tdun\n203BF\tjie\n203C0\tke\n203C3\tyue\n203C7\tjian\n203C8\tyao\n203D3\txian\n203D5\txiao\n203D6\tqiao\n203DA\tyu\n203DB\tqu\n203E1\txian\n203E2\tluo\n203E4\tguang\n203E7\tcheng\n203E8\tchuang\n203E9\tyi\n203EB\tzheng\n203ED\tzong\n203EE\tdui\n203F0\tzhai\n203FF\tfei\n20400\tyi\n20401\tmeng\n20408\tbian\n20409\tjie\n2040A\tshu\n2040B\tliao\n2040C\tbi\n2040D\tsu\n20411\tdi\n20421\tbei\n20422\twen\n20427\tmeng\n20429\tchan\n20435\tdao\n2043A\tpin\n2043B\tjian\n2043C\tlin\n2043D\tgui\n2043E\tqi\n2043F\thong\n20443\tji\n20444\txie\n20445\tzheng\n20446\tchan\n20450\tyao\n20451\tchan\n20458\tdian\n20459\tchong\n2045A\tnei\n2045B\tnei\n2045E\tzhai\n2045F\tbian\n20461\tchan\n2046A\txiao\n2046F\tcu\n20470\txin\n20471\tjing\n20472\tqian\n20474\tqing\n20479\tgu\n20484\twu\n2049C\tyuan\n2049D\tbing\n204A2\twan\n204B0\tniao\n204B5\tlian\n204B8\trao\n204BE\tfan\n204BF\tdi\n204CA\thui\n204CB\tyi\n204CC\txian\n204D6\tlan\n204D7\tfu\n204D9\txiong\n204DC\tliang\n204DD\ttao\n204DE\tji\n204E2\tjie\n204E3\tzha\n204E4\tshi\n204EA\tqi\n204EB\tbian\n204ED\tlan\n204EE\tlin\n204F6\tzhi\n204F7\tbi\n204F8\tsheng\n204FD\tsheng\n204FF\tqin\n20502\tbiao\n20503\txi\n20509\tjuan\n2050B\tji\n2050D\txi\n2050E\tqin\n20511\thai\n20515\tlun\n20520\tyue\n20528\tlian\n2052F\tban\n20532\theng\n20536\tqi\n2053A\tqian\n2053B\tzheng\n2053C\tmao\n20541\tcong\n20544\tna\n2054A\tting\n2054C\tzong\n20555\tjiong\n20556\tzhao\n2055F\tnian\n20560\tcheng\n20563\tqia\n20566\tyu\n20567\tjiao\n2056D\tzhao\n20573\tdi\n20574\tjiu\n20578\tsui\n2057B\tyao\n2057F\twang\n20582\tliao\n20584\ttong\n20586\tmeng\n2058B\tyou\n20593\tsi\n2059B\tlou\n2059F\tyin\n205A5\tchong\n205AB\tgan\n205AC\tjiu\n205B6\tqin\n205B7\tjiong\n205B9\txie\n205C2\the\n205C6\ttao\n205C8\tqiu\n205C9\txie\n205CA\tjing\n205CB\tnian\n205CC\tjing\n205CF\tji\n205D8\ttian\n205DA\tcui\n205DB\tdie\n205DD\tqing\n205E5\tping\n205E6\tping\n205E8\tdie\n205E9\tlou\n205F3\tlian\n205F4\than\n205F5\tpang\n205F6\ttang\n205FA\tyi\n205FB\txuan\n205FC\tsuo\n205FD\tliu\n205FE\tshuang\n205FF\tshen\n20601\tbu\n20602\tsou\n20605\tqin\n20606\tshen\n2060A\tnong\n2060B\tting\n2060C\tjiang\n20615\txi\n20616\tzhi\n2061D\tlai\n2061E\tli\n2061F\tli\n20622\the\n20623\tjiao\n20625\tyan\n20627\tshu\n2062A\tshi\n20631\tzhen\n20633\tyou\n2063A\tsuo\n2063B\twu\n20641\tchang\n20642\tcong\n20646\tju\n2064E\tshu\n20654\tjiu\n20655\twei\n2065E\thuo\n20664\tjie\n2066C\tzao\n20676\tou\n2067C\tgua\n20683\thao\n20684\tli\n20685\tzhi\n20686\txian\n20689\tbu\n2068A\tchang\n20693\tyun\n20694\the\n2069C\ttao\n206A0\tbiao\n206A5\tdiao\n206A7\ter\n206A8\tjiu\n206AD\tdi\n206AE\tyi\n206AF\tkun\n206B1\tzhe\n206B3\tkuo\n206B4\tzhou\n206B5\tju\n206B9\tshan\n206BA\tsha\n206BB\tdiao\n206BC\tban\n206BD\tji\n206C0\tzhong\n206C3\tyi\n206C5\tkou\n206C6\twu\n206CA\tge\n206CB\tba\n206CE\tgou\n206D1\txian\n206D2\tgua\n206D3\tliu\n206D4\tchi\n206D5\tguai\n206D6\tchuan\n206D8\tli\n206D9\tcu\n206DA\tshua\n206E1\tbi\n206E5\tbing\n206E6\tli\n206E9\tjiu\n206EA\ttiao\n206EB\tduo\n206ED\tyan\n206EE\tquan\n206F1\tlie\n206F3\tke\n206F5\tgen\n206F6\tzhen\n206F8\tfen\n20701\tyi\n20703\tjiu\n20704\txu\n20705\tjiao\n20708\tlu\n20709\tjiu\n2070B\tchou\n2070E\txian\n20710\tkuai\n20711\tdui\n20716\tluo\n20717\txi\n20718\tqin\n20719\tbu\n20724\tqia\n20731\tpi\n20732\tya\n20733\tbeng\n20734\tguo\n20735\tgua\n20739\tju\n2073C\tqia\n2073E\tjue\n20744\tli\n20750\thua\n20751\tjiao\n20758\tqia\n2075A\tzha\n2075B\tqia\n2075D\tzhe\n2075E\tcha\n2075F\tying\n20762\tyan\n20764\tchong\n20768\tchi\n2076A\twan\n2076C\tsou\n20772\tkan\n20773\tyuan\n2077D\tchou\n2077F\tsuo\n20780\ttu\n20783\tzhe\n20784\tti\n20786\twu\n20788\tda\n20789\tli\n2078A\tcha\n20795\trong\n20796\tgong\n20797\tque\n20799\tli\n2079E\ttao\n207A4\tli\n207A7\tmi\n207A9\tchi\n207AC\tgun\n207AD\tlou\n207AE\tchuang\n207AF\tsuo\n207B0\tjiao\n207B1\tjin\n207B5\tfa\n207B6\tzhai\n207BE\tjin\n207BF\tcui\n207C2\tceng\n207C3\tzun\n207C5\tzhao\n207C8\tpie\n207C9\tzhan\n207CA\txi\n207CB\tyao\n207CC\tfu\n207CD\tchong\n207D3\tcui\n207D7\tgua\n207E3\tji\n207E6\tse\n207E7\tzhan\n207E8\tling\n207E9\tse\n207EA\tye\n207F0\tju\n207F6\ttu\n207FA\tru\n207FB\tze\n207FC\thuan\n20801\txian\n20803\tqian\n20804\tzhao\n2080B\tcan\n2080E\tkuo\n2080F\tli\n20810\trou\n20814\tdu\n20817\tlie\n2081C\tying\n2081D\tli\n20820\tdu\n20822\tling\n2082A\twan\n2082F\tdie\n20833\tjiu\n20835\tli\n20836\tku\n20837\tkeng\n20839\tzhen\n20840\the\n20842\tbi\n20844\tpi\n2084A\thang\n20851\tzhuo\n20852\tdui\n20854\tyi\n2085C\tke\n2085D\tyi\n2085E\tmo\n20860\tchi\n20861\tcan\n20863\tgeng\n20864\tke\n20865\tshi\n2086D\tling\n2086E\tbeng\n20871\tduan\n20876\tjuan\n20877\tnao\n20878\tzi\n2087B\tzong\n20883\ttang\n20886\txia\n20887\than\n2088C\tlue\n2088D\tqian\n20893\tmo\n20894\tou\n20895\thao\n20899\tzha\n2089A\tjuan\n2089B\tcong\n208A0\tli\n208A1\tzha\n208A2\tyou\n208A3\tdian\n208A4\tjue\n208A5\tbei\n208A9\tyao\n208AA\tpie\n208B1\tjin\n208B2\tkai\n208B3\tse\n208B4\tyang\n208B5\tjin\n208B9\tke\n208C4\tchan\n208C7\tnian\n208C9\twan\n208CA\tlu\n208D0\tyun\n208D1\tyao\n208D2\tbao\n208D5\tjun\n208D6\txuan\n208D8\tzhou\n208E0\tkui\n208EA\tqu\n208EB\tshao\n208EC\tsun\n208F0\tdu\n208F2\tkuai\n208F3\tpao\n208FA\tbao\n208FE\tfu\n208FF\tjiu\n20900\tran\n20904\tju\n2090A\tqiong\n2090D\tzhou\n2090E\thua\n2090F\tbao\n20915\tyi\n20917\tyi\n20918\tyi\n2091D\tmao\n20926\truan\n2092B\tci\n2092E\than\n20930\tcong\n20934\txi\n20939\tquan\n2093A\ttiao\n2093C\tdiao\n2093E\than\n20947\tye\n2094D\te\n2094E\twei\n20950\tcang\n20951\tdiao\n20955\te\n20956\tdi\n20958\tsuan\n20959\tquan\n2095C\te\n2095D\tou\n2095E\txuan\n20962\twu\n20966\tyi\n20968\tmou\n20970\thu\n20974\than\n2097F\tshi\n20983\tsa\n20988\tbi\n2098A\than\n2098B\tjing\n2098C\txi\n2098E\tqin\n2098F\tcuo\n20990\tci\n20992\tban\n20997\tdui\n2099C\txi\n209A7\tzhi\n209A8\tluan\n209AA\thu\n209AB\tji\n209AC\tguai\n209B2\tpang\n209C0\tzhu\n209C5\tbi\n209C7\tyu\n209D2\tqi\n209D5\the\n209D6\tchu\n209D9\tshao\n209DA\tchi\n209DB\tbo\n209DF\treng\n209E0\tyou\n209E4\tnai\n209E9\thui\n209EA\ttiao\n209EB\tban\n209F0\txu\n209F4\tyou\n209F5\tchi\n209FF\theng\n20A03\twai\n20A06\txie\n20A0A\tjue\n20A0C\tsui\n20A0D\tqing\n20A0E\tzhuan\n20A15\tji\n20A18\tbi\n20A1A\txi\n20A20\tji\n20A22\tjun\n20A25\tliao\n20A26\tyou\n20A2D\tju\n20A32\tyue\n20A35\tbang\n20A38\tpi\n20A3B\tze\n20A3E\tyi\n20A3F\tdi\n20A42\tqie\n20A44\tsuo\n20A46\tci\n20A48\tzhu\n20A49\tyue\n20A4F\tjiao\n20A54\tshi\n20A57\tyi\n20A58\txia\n20A60\tyuan\n20A65\tguo\n20A67\tke\n20A6A\tcui\n20A6B\tyi\n20A75\tli\n20A77\tdian\n20A7A\txi\n20A7F\tbi\n20A82\tbian\n20A83\tmei\n20A84\tli\n20A87\tsou\n20A90\tliu\n20A91\tgui\n20A92\tke\n20A97\tyi\n20A99\txi\n20A9A\tyin\n20A9F\tke\n20AA3\tshe\n20AA7\two\n20AAE\tpi\n20AB6\tyue\n20AB7\thong\n20ABA\tli\n20ABB\tfu\n20AC3\tjue\n20AC4\txian\n20AC9\tdian\n20ACC\tli\n20AD3\ttu\n20AD8\tjian\n20ADB\tbai\n20ADC\tdi\n20ADD\tzhang\n20AE3\tyu\n20AE8\tdui\n20AED\tcan\n20AEE\ttu\n20AF6\ttan\n20AF7\tji\n20AF8\tqi\n20AF9\tshan\n20AFA\tnian\n20B06\tguan\n20B08\tbi\n20B0B\txing\n20B13\tzhen\n20B19\tsa\n20B1B\tmo\n20B1D\tfu\n20B22\ttao\n20B23\tbang\n20B24\tyi\n20B2A\tbiao\n20B2C\txi\n20B2E\tjie\n20B36\tjin\n20B3E\tqian\n20B48\tsi\n20B49\tjing\n20B4B\tchi\n20B57\tjing\n20B65\tsui\n20B6F\tzha\n20B70\tli\n20B74\tzhuo\n20B79\tbian\n20B7F\ttun\n20B83\tbi\n20B86\tfei\n20B8A\tde\n20B8C\tzhu\n20B91\tju\n20B99\tyi\n20B9C\tya\n20B9F\tchi\n20BA0\tgua\n20BA1\tzhi\n20BA8\treng\n20BAB\tyou\n20BAD\tbo\n20BAF\tji\n20BB0\tpin\n20BB3\tying\n20BB4\tyang\n20BB5\tmang\n20BBD\tlong\n20BBE\tn\n20BBF\tsa\n20BC0\tchuan\n20BC2\tci\n20BC3\twu\n20BC4\tren\n20BC8\tdai\n20BC9\tji\n20BCB\tyi\n20BCD\tran\n20BD0\thuo\n20BD1\tgua\n20BD3\tzhe\n20BD4\tpi\n20BD7\tza\n20BD8\tban\n20BD9\tjie\n20BDC\thou\n20BDF\txian\n20BE0\thui\n20BE9\tzha\n20BEA\tdai\n20BEB\tge\n20BED\tpi\n20BEF\tpian\n20BF0\tshi\n20BF1\tliang\n20BF2\tyue\n20BF3\thu\n20BF4\tbian\n20BF7\treng\n20BF9\treng\n20C04\tyi\n20C05\tzhi\n20C07\tjin\n20C08\tweng\n20C09\tchao\n20C0B\tqiu\n20C0D\tzhu\n20C0F\tzha\n20C10\tpo\n20C11\tan\n20C13\the\n20C15\tchu\n20C16\tyan\n20C1A\tshi\n20C1B\thu\n20C1C\te\n20C34\tshi\n20C37\tlu\n20C39\ttuo\n20C3A\tdai\n20C3B\twai\n20C3C\tpo\n20C3D\trong\n20C3E\tju\n20C40\tbo\n20C50\tyu\n20C51\tdou\n20C53\tgui\n20C54\tshou\n20C57\tsuo\n20C58\tni\n20C59\tzhou\n20C5A\tlong\n20C5B\tbing\n20C5C\tzun\n20C5D\tye\n20C5E\tran\n20C60\tling\n20C61\tsa\n20C64\tlei\n20C65\te\n20C67\tzhong\n20C68\tji\n20C6B\te\n20C6F\tzuo\n20C72\tna\n20C73\tyun\n20C8A\txie\n20C8B\tzui\n20C8C\tshu\n20C8D\tdiu\n20C8E\tfa\n20C8F\tren\n20C91\tbang\n20C92\than\n20C93\thong\n20C94\tyi\n20C96\tyi\n20C99\tke\n20C9A\tyi\n20C9B\thui\n20C9C\tzheng\n20CAE\tjing\n20CB1\tge\n20CB4\tnou\n20CB5\tqie\n20CB7\tdie\n20CB9\tji\n20CBA\tyi\n20CBB\tyi\n20CBD\tfu\n20CBE\tshuo\n20CBF\tshuo\n20CC0\tyong\n20CC1\tken\n20CC2\thua\n20CC3\thong\n20CC7\the\n20CCA\the\n20CCB\tqian\n20CCC\tqia\n20CCE\tsi\n20CD0\tbang\n20CDE\tjue\n20CEC\tjing\n20CED\tke\n20CF3\tai\n20CF4\tlou\n20CF6\ttu\n20CF9\tchuang\n20CFC\tsong\n20CFD\tcheng\n20CFF\twei\n20D02\tnu\n20D04\tjiu\n20D07\tbin\n20D21\txiao\n20D22\tsheng\n20D23\thou\n20D26\tzhu\n20D28\tguan\n20D29\tji\n20D2B\tji\n20D2D\txi\n20D2F\tshe\n20D30\tou\n20D31\thu\n20D32\tta\n20D33\txiao\n20D35\tzao\n20D38\tbo\n20D39\tqi\n20D3A\twa\n20D3B\ttuo\n20D3C\tdao\n20D3E\tna\n20D60\tzhai\n20D63\tya\n20D66\twu\n20D67\tzhen\n20D68\tde\n20D69\the\n20D6B\tang\n20D6C\tpi\n20D6D\tse\n20D6E\tfen\n20D6F\tgua\n20D73\tpo\n20D77\txuan\n20D78\than\n20D79\tgang\n20D7A\tba\n20D7B\tzong\n20D7C\tmeng\n20D7E\thuo\n20DA7\tdian\n20DA8\txi\n20DAB\tda\n20DAC\tnang\n20DB0\tdiao\n20DB1\tluo\n20DB2\tke\n20DB7\tyi\n20DB8\tjue\n20DB9\the\n20DBB\tji\n20DBE\the\n20DBF\tnie\n20DC0\trun\n20DC1\tqian\n20DC2\tdai\n20DC3\tshao\n20DC4\tke\n20DC5\tzhu\n20DC7\tshi\n20DC8\tlu\n20DC9\tjia\n20DCA\tpian\n20DCB\thou\n20DCC\tji\n20DCD\tta\n20DCE\tchou\n20DCF\two\n20DD0\tjing\n20DD1\tpo\n20DD2\tzhai\n20DD3\txin\n20DD6\tbian\n20DD9\txu\n20DDE\tgu\n20DDF\tjie\n20DE2\txian\n20DF8\te\n20DFA\tbo\n20DFB\tpiao\n20DFF\tza\n20E01\tpai\n20E02\ttu\n20E04\tying\n20E2E\txiang\n20E31\tnuo\n20E32\tge\n20E33\tbo\n20E34\txie\n20E38\tzhen\n20E39\tyu\n20E3A\tni\n20E40\txun\n20E41\twa\n20E43\tang\n20E44\than\n20E45\thong\n20E46\tdan\n20E48\tnuo\n20E4A\tcao\n20E4B\tji\n20E4C\tneng\n20E4D\tyong\n20E4E\txiao\n20E50\tchua\n20E51\tyao\n20E53\tge\n20E54\ttang\n20E55\tbao\n20E56\tchan\n20E58\txu\n20E5B\thai\n20E5D\tchou\n20E5F\tjian\n20E60\tzuo\n20E64\twei\n20E65\tda\n20E66\tpi\n20E90\thuan\n20E92\txi\n20E94\tpen\n20E95\tliu\n20E96\tmu\n20E97\tmie\n20E98\tlang\n20E99\ttui\n20E9A\tban\n20E9D\tge\n20E9F\tku\n20EA2\tjia\n20EA3\tbo\n20ECD\thuan\n20ECF\tzu\n20ED0\tluo\n20ED7\tli\n20ED9\the\n20EDA\tmo\n20EDC\tshui\n20EDD\tshen\n20EDE\tkang\n20EDF\tchi\n20EE0\tling\n20EE1\tluo\n20EE4\tyan\n20EE5\tzhao\n20EE6\tchua\n20EE7\tgu\n20EE8\tqin\n20EEA\ttan\n20EEB\tfen\n20EEC\ttu\n20EF1\tling\n20EF4\tlang\n20F16\tlan\n20F17\tzan\n20F18\twu\n20F1D\tli\n20F1E\ta\n20F1F\tlue\n20F20\tzhi\n20F21\tchou\n20F22\tjiang\n20F24\tjian\n20F29\tlun\n20F2A\tyi\n20F2C\tshang\n20F3B\tji\n20F5C\tyi\n20F5D\tnin\n20F61\thui\n20F63\tzha\n20F66\than\n20F68\tyin\n20F69\tbi\n20F6A\tan\n20F6B\txia\n20F6C\tni\n20F70\tdi\n20F71\tjian\n20F72\tpan\n20F75\tyu\n20F76\tchuai\n20F77\tza\n20F79\tcha\n20F7B\tzhe\n20F7C\tse\n20F7E\tpen\n20F7F\tgu\n20F80\tzhe\n20F86\tli\n20F87\tdou\n20F89\tchou\n20F8B\tzui\n20F8C\tpo\n20F8F\tshe\n20F90\tlong\n20FA2\tshu\n20FA4\tjin\n20FA5\tling\n20FA8\tkang\n20FA9\tla\n20FAB\txu\n20FAC\tjin\n20FAE\tchuan\n20FB2\tyue\n20FC6\tmai\n20FC7\txie\n20FC8\tjiu\n20FC9\tji\n20FCB\tyue\n20FCF\tjian\n20FD1\than\n20FD3\tsa\n20FD4\thui\n20FD5\tqiao\n20FD7\tse\n20FD8\tzui\n20FDB\tlu\n20FDC\thua\n20FDD\tchu\n20FDE\tshan\n20FDF\two\n20FE0\tji\n20FE1\tzhuo\n20FE2\txian\n20FE3\tyi\n20FE4\tguo\n20FE5\tkui\n21011\tzhou\n21014\tlu\n21016\tbo\n21017\tshi\n21018\tying\n21019\tku\n21039\tzhi\n2103A\txie\n2103D\tye\n2103E\te\n2103F\tlu\n21040\than\n21041\tye\n21046\tluo\n21047\tchuo\n21048\tfan\n21049\tzhi\n2104A\tying\n2104B\twen\n2104C\twa\n2104D\tai\n2104E\tyu\n21051\thua\n21053\tlie\n21054\tjing\n21055\tza\n21067\tzang\n21068\tdui\n2106A\tji\n2106E\two\n21070\tji\n21071\txi\n21073\tzhan\n21074\ttuan\n2108A\tyu\n2108F\tlie\n21092\tzhi\n21093\tshi\n21095\tlao\n21096\tlai\n21097\twei\n21098\tpao\n21099\tchi\n2109A\tying\n2109B\tdou\n2109D\tdou\n2109F\tbao\n210A0\tqie\n210A1\tshu\n210A3\tzhi\n210A9\tlie\n210AB\tpeng\n210AD\tzhe\n210BF\tou\n210C2\txie\n210C3\tji\n210C4\tlai\n210C5\tying\n210C6\tceng\n210D6\tle\n210DD\tlun\n210E1\tlong\n210E2\txi\n210E6\tlin\n210E9\tgui\n210F3\txing\n210F7\tli\n210F8\tci\n21107\tqing\n21111\tjian\n21112\tdao\n21113\tjian\n21114\tqing\n21115\txie\n21116\tying\n2111F\tha\n21121\tzhe\n21122\tshe\n21123\tmi\n21124\thuan\n21131\tcu\n21132\tru\n21133\tsa\n21134\thuo\n21135\tyi\n21137\tdi\n21139\tluan\n2113B\tyi\n21142\tbo\n21143\tpang\n21144\ttan\n21145\te\n21146\tzang\n21147\tcong\n21153\tzhai\n21155\txi\n21156\tmang\n21158\tla\n21159\tyun\n21161\te\n21165\tdie\n2116D\tguan\n21171\thuan\n21175\tshi\n21176\tjian\n21179\tzhan\n2117A\tji\n2117B\thuan\n21185\twan\n21186\tluo\n2118F\tdou\n21195\tlian\n211A3\tnie\n211A4\tnan\n211A5\tjiu\n211A6\tyue\n211A9\tyao\n211AA\tchuang\n211AE\tcan\n211AF\tli\n211B0\tdun\n211B1\tnan\n211B2\tnan\n211B8\tri\n211BD\tyue\n211C0\tyou\n211C2\tyin\n211C4\tguo\n211C8\tdang\n211D1\tzhen\n211D2\tmi\n211D3\tdie\n211D6\tzhen\n211DA\tkua\n211DC\than\n211DD\tsong\n211DE\the\n211DF\tji\n211E0\tzhe\n211E4\tbing\n211E6\twei\n211E7\ttou\n211E9\ttu\n211EC\tgang\n211ED\tlou\n211EE\tquan\n211EF\thun\n211F0\tzhuan\n211F1\tque\n211F3\thong\n211F5\tdang\n211F6\the\n211F7\ttai\n211F8\tguai\n211FA\tyu\n211FC\tya\n211FF\twan\n21200\tqun\n21205\tjue\n21206\tou\n21209\tquan\n2120A\tzhi\n2120D\tling\n2120E\twu\n2120F\txin\n21210\tda\n21212\tyuan\n21213\tyuan\n21217\tmo\n21219\tyou\n2121B\twan\n2121E\twu\n21220\tzhang\n21223\txuan\n21226\trao\n21227\tgun\n21228\tyu\n2122E\txia\n2122F\tbian\n21230\tyou\n21232\tyin\n21234\txuan\n21235\tyou\n21236\tlei\n2123C\tting\n2123F\tzhen\n21244\tzai\n21245\tga\n21246\tla\n21249\tque\n2124E\tju\n21250\tchun\n21251\tda\n21252\ttun\n21253\tai\n21257\tzi\n2125A\thuang\n2125B\tyi\n21269\tbao\n2126A\tchi\n2126D\tri\n21274\tlu\n21277\tjie\n21278\tshi\n2127A\tzuan\n21281\tyi\n21284\tfen\n21285\tfen\n21289\tmo\n2128D\tshu\n21291\txi\n2129B\tao\n2129D\tpi\n2129E\tping\n2129F\tpo\n212A0\tjia\n212A1\tzhou\n212A3\tqiu\n212A7\tyou\n212A8\ttan\n212AB\trong\n212AD\tmi\n212B6\tyi\n212B8\trong\n212BB\tlie\n212BC\tqiong\n212D9\thui\n212DA\tji\n212DF\tgao\n212E4\tjin\n212E7\tyou\n212E8\tcha\n212E9\tde\n212EA\tyin\n212EC\tyu\n212ED\tbei\n212EF\tbo\n21314\tqiao\n2131A\tcha\n2131C\txin\n2131E\tchi\n21323\tzao\n21324\tkui\n21326\tfei\n21329\tta\n2132A\tguai\n2132D\tduo\n21332\tgui\n21334\tzhi\n2134C\tchan\n2134D\tnao\n21350\thu\n21352\ttao\n21361\tyi\n21364\tnie\n21365\tzhai\n21366\thuan\n21368\tdu\n2136A\tqi\n2136B\tce\n2136E\tchui\n21372\tda\n21376\tzhi\n21377\tgeng\n2137B\tweng\n21389\tdu\n2138D\tchi\n21391\tan\n21392\tkuo\n21394\two\n21398\tying\n2139A\tpian\n213AB\tzha\n213AC\tzhua\n213AE\tsu\n213B3\tni\n213BA\tzhu\n213BB\tchan\n213BE\tbeng\n213BF\tni\n213C0\tzhi\n213C1\thui\n213D8\txia\n213DA\tzhi\n213DB\txi\n213DE\tjiang\n213E9\tdui\n213EA\tfu\n213ED\tjiao\n213EE\tchao\n213EF\tbai\n213F5\tlie\n213FC\tao\n2140B\tzao\n2140C\tchu\n2140F\ttuo\n21412\thao\n21413\tkang\n21414\tyin\n21416\txian\n2141D\tfu\n2141E\tbie\n21420\tkui\n21424\tqie\n21425\tsa\n2143F\tda\n21440\tye\n21444\tzhang\n21446\tliang\n21448\tdui\n2144D\tlao\n2144E\txun\n21458\tzhi\n2145A\tku\n2145E\tsui\n2145F\two\n21463\tku\n2146F\tjian\n21476\tjiang\n2147B\tzhui\n2147D\tshuang\n2147E\tyu\n21481\tsa\n21483\tyu\n21484\tlan\n2148A\tyu\n2148C\tqian\n2148D\tju\n2148F\tlie\n21492\tshu\n21493\txian\n21496\tgai\n214A2\ttai\n214A7\ttian\n214AF\tmeng\n214B1\tdi\n214B3\tmian\n214BE\thui\n214C9\tduo\n214CD\tlie\n214D2\tlai\n214D3\tyin\n214D4\tlan\n214D6\tjiao\n214D8\thuo\n214E3\tguo\n214E6\tzhan\n214ED\tmi\n214F0\tkui\n214F7\tduo\n214FF\tyin\n21507\tlei\n21515\tgong\n2151B\tting\n2151C\tyao\n2151E\twang\n21523\tjie\n21528\txiu\n2152A\tshu\n21531\twei\n21534\tyu\n21541\tzhan\n21549\tang\n2154F\tsang\n21550\tchou\n21552\tkua\n21556\tju\n21557\thai\n21562\tmian\n21567\thang\n2156A\tchou\n2156E\tling\n21570\tzong\n21589\tkun\n2158C\tzhong\n2158E\tzhao\n21590\tdie\n21591\tgou\n21592\tyun\n21593\tdan\n21594\tnuo\n2159B\tbing\n2159D\tran\n2159E\tchan\n215A2\trong\n215A3\tyin\n215A4\tchan\n215A7\tzhi\n215AA\tguai\n215AB\tnuo\n215AC\tshen\n215AF\tsu\n215B2\two\n215B3\tchi\n215BA\tmie\n215BB\tzhi\n215BE\tqi\n215C1\tgou\n215C6\tlou\n215C8\tzi\n215CD\tdang\n215CF\txian\n215D1\trou\n215D7\tpeng\n215DE\txi\n215E2\tkua\n215E4\tgui\n215E5\tchun\n215E6\tjie\n215F2\tjie\n215F3\txi\n215F5\tku\n215F7\tgu\n215F8\tzha\n215F9\tfan\n215FC\txie\n2160D\thuan\n2160F\tniao\n21610\txi\n2161B\tcu\n2161D\tgun\n21621\txi\n21627\tqia\n2162A\tmang\n2162D\tzhe\n21630\tjuan\n21634\tbie\n21640\tbie\n21645\tquan\n2164B\txi\n2164E\tjiao\n21650\tquan\n21651\tzhi\n21652\ttian\n21653\tkai\n21658\tsan\n2165B\tzi\n21663\tjie\n2166A\tbie\n2166C\tdou\n2166D\tzui\n21676\tyan\n21681\tbi\n21685\tkuai\n21687\tyan\n21688\twei\n2168A\thuan\n2168C\thao\n21691\tgong\n21694\tmeng\n21697\tlei\n21699\tdi\n2169B\tbing\n2169C\thuan\n2169F\twa\n216A0\tjue\n216A8\tchi\n216AD\tba\n216AE\tjiu\n216B7\tdi\n216B9\tzhang\n216BB\tda\n216BC\tshi\n216BD\thao\n216CC\tye\n216D7\tbi\n216D8\tpi\n216D9\tyao\n216DC\tdi\n216DD\tcan\n216DE\tpin\n216DF\tyue\n216E0\tqie\n216E1\tpi\n216F5\ttuo\n216F6\txie\n216FD\tye\n21700\tfan\n21701\tgua\n21702\thu\n21703\tru\n21709\tran\n2170A\tfou\n2170B\thuang\n2171A\tru\n21722\tmao\n21725\tdui\n21726\thui\n21727\txi\n21728\txiu\n2172B\tran\n2172C\tyi\n2172F\tzhe\n21731\tji\n21732\tgao\n21733\tyou\n21735\tpu\n21748\tchu\n21749\tcu\n2174A\tzhe\n2174B\tniao\n2174D\tqie\n21750\tcha\n21752\tniao\n21753\tsui\n21759\tcha\n2175A\tcheng\n2175B\tyao\n2175C\tdu\n2175D\twang\n2175F\tnian\n21760\tmi\n21766\tnou\n21767\txi\n21769\tyao\n2176B\tchan\n2178B\tcan\n21798\txie\n21799\tmie\n2179A\tkeng\n2179C\tcu\n2179E\tsheng\n2179F\tpan\n217A0\thu\n217A2\tke\n217A3\txian\n217A5\thou\n217A6\tqiong\n217A7\tzong\n217AA\tfu\n217AB\tnai\n217AD\tni\n217AF\tku\n217BE\tnen\n217CD\tge\n217D1\thou\n217D3\tai\n217D5\tshi\n217DE\txiu\n217DF\tcong\n217E0\tjiao\n217E2\tzha\n217E3\txiao\n217E4\tlian\n217E5\tqu\n217E8\tshan\n217E9\txie\n217EB\tgong\n217EC\tmie\n217ED\tchai\n217EF\ten\n217F3\tdou\n21806\tkou\n2180A\ttiao\n2180B\tshi\n2180F\tsang\n21812\tguan\n21816\thao\n21817\tzhi\n21818\tyang\n21819\ttong\n2181A\tbi\n2181C\tmo\n2181E\tfu\n2181F\tzhu\n21825\tqiang\n21839\tzhi\n2183C\tsou\n2183F\tniao\n21840\tjuan\n21842\tyang\n21844\thuang\n21848\tbeng\n21849\tmo\n2184A\tchao\n2184E\tlu\n2184F\tshao\n21850\tbu\n21851\tzeng\n21852\tsi\n21854\tzui\n21855\tyue\n21856\tzan\n21857\tluan\n21865\tqu\n2187A\tmiao\n21880\tzhuan\n21888\tdang\n2188A\tyuan\n21892\tju\n21895\thui\n21896\tqi\n21898\tyun\n2189A\tman\n2189C\tmo\n218B1\tpiao\n218B3\tjin\n218B9\tyao\n218C0\tchi\n218C1\tni\n218C2\tsou\n218C8\tshu\n218CB\tpiao\n218D4\than\n218E0\tyao\n218E2\tnei\n218EA\tshi\n218EC\tyuan\n218EE\tcai\n218EF\tjie\n218F9\txie\n218FD\tyan\n218FE\txiao\n2190B\txie\n2190C\tli\n2190E\tfan\n21917\tzhu\n21919\tna\n2191B\tzhuan\n2191E\tkui\n21922\tluo\n2192B\tqia\n21936\twan\n2193D\tshu\n2193F\tcheng\n21941\tyi\n21946\thao\n21948\tjiao\n2194B\thui\n2194D\txiao\n2194E\tci\n2195E\tji\n21966\tni\n21967\tnai\n21968\tni\n21969\tti\n21976\tju\n21978\tming\n2197D\tli\n2197F\tzhong\n21981\txu\n21983\tqiong\n21984\tfu\n21986\tbin\n2198A\tji\n2198D\tqi\n2198E\txi\n21994\tdeng\n21995\ter\n2199B\tshu\n2199C\ttong\n2199D\txiao\n2199F\tpi\n219A8\tdan\n219AA\tji\n219B3\txiao\n219B7\tcong\n219BB\tbin\n219BC\trong\n219CD\tmian\n219D2\tmian\n219D4\tshu\n219D5\txiao\n219D6\tbao\n219D7\twa\n219D9\tpao\n219E3\tgai\n219E5\thu\n219E6\theng\n219E8\tzhu\n219E9\tguai\n219ED\tgui\n219F9\tdai\n219FC\tbin\n219FD\thuang\n21A00\tcha\n21A04\txia\n21A05\tju\n21A07\tyao\n21A16\tfen\n21A17\tzao\n21A1B\tfeng\n21A22\tju\n21A23\tyu\n21A29\thun\n21A32\tjie\n21A33\txiong\n21A35\tnai\n21A3B\tnou\n21A3D\tsheng\n21A3F\tyu\n21A42\thuan\n21A43\tgeng\n21A44\twan\n21A46\ttuo\n21A47\tqiao\n21A58\tyin\n21A5A\tjia\n21A61\tsuo\n21A63\tjie\n21A64\txi\n21A65\tweng\n21A69\tmang\n21A76\tyang\n21A78\tyao\n21A7D\tmang\n21A7E\tou\n21A81\tan\n21A85\tlou\n21A91\te\n21A92\tzi\n21A97\te\n21A99\tan\n21A9E\thuo\n21AA0\tceng\n21AB0\txiong\n21AB1\tji\n21AB3\tzuo\n21AB5\tqi\n21ABA\tzheng\n21AC0\tji\n21AC1\tqi\n21AC2\tjuan\n21AC3\tning\n21ADF\tse\n21AE5\the\n21AE6\trong\n21AE7\tqin\n21AEC\tju\n21AEF\tli\n21AF5\tshi\n21AF8\tni\n21AF9\txian\n21AFA\tfu\n21AFD\tru\n21B01\txiong\n21B02\tgui\n21B04\tji\n21B06\tmeng\n21B07\tfu\n21B09\tsai\n21B0A\tyu\n21B0B\tjiao\n21B0C\tmeng\n21B0D\tlong\n21B0E\tqiang\n21B10\tmi\n21B13\tyi\n21B15\tlong\n21B16\than\n21B17\tni\n21B18\tlao\n21B19\tseng\n21B1C\tlin\n21B1E\tyu\n21B25\tnuo\n21B2B\twu\n21B2F\tbian\n21B32\tbian\n21B33\txuan\n21B35\tjian\n21B38\tbian\n21B42\tde\n21B47\tzhuan\n21B4B\trong\n21B50\tshuan\n21B58\tjia\n21B5B\thui\n21B5E\tzhan\n21B62\tbai\n21B63\tlie\n21B65\txie\n21B6D\tjian\n21B6E\tshou\n21B73\tkao\n21B77\tguan\n21B78\tluan\n21B7E\tnou\n21B7F\tchang\n21B8E\tliang\n21B99\tnai\n21B9A\tru\n21B9E\tzhi\n21BA6\tcao\n21BB0\tli\n21BBB\tlan\n21BBF\tchan\n21BC1\twang\n21BC4\tli\n21BC7\twu\n21BC8\tpao\n21BC9\tyou\n21BCB\tgan\n21BCF\tan\n21BD0\txiu\n21BD1\tshui\n21BD2\trui\n21BD8\tban\n21BD9\tyou\n21BE2\thuo\n21BE5\thui\n21BE8\tzuo\n21BE9\txiao\n21BEB\tmian\n21BF0\tga\n21BF1\tyuan\n21BF3\tbo\n21BF4\tchao\n21BF5\ttui\n21BF7\tbo\n21BFD\tga\n21BFF\ttiao\n21C00\tna\n21C05\thu\n21C06\tnie\n21C0B\thui\n21C0C\tlou\n21C0E\tti\n21C10\tqiao\n21C11\tqiao\n21C12\tzhong\n21C16\tdi\n21C1A\tlin\n21C1D\tquan\n21C1E\tzhuan\n21C20\tlei\n21C22\txie\n21C25\tren\n21C28\tdang\n21C2A\tdu\n21C2B\tnian\n21C2F\tshi\n21C32\txian\n21C39\tzhi\n21C3D\tai\n21C3E\tci\n21C3F\tpu\n21C41\tshi\n21C45\tqu\n21C46\tshu\n21C47\tdian\n21C49\txiao\n21C4A\tshui\n21C4C\thuan\n21C50\tyi\n21C51\tjuan\n21C54\tzhi\n21C5C\tzhao\n21C63\txu\n21C6F\tlong\n21C71\tzhu\n21C73\tsuo\n21C77\tdie\n21C7A\tqu\n21C7C\tke\n21C7D\thu\n21C7E\tju\n21C80\tqing\n21C8D\tbing\n21C95\tti\n21C97\tjue\n21C9A\tqiu\n21CA3\tjiang\n21CAA\tyun\n21CAD\tmei\n21CAE\tpi\n21CB0\tqu\n21CBC\tmi\n21CBF\tti\n21CC2\tkai\n21CC4\tbi\n21CC6\tqu\n21CCF\ttiao\n21CD1\tchu\n21CD8\tju\n21CDA\txi\n21CDE\tlin\n21CED\tchi\n21CEE\tji\n21CF4\tlu\n21CF8\tli\n21CFE\tjue\n21D05\tzhu\n21D06\tlu\n21D0E\tnie\n21D14\tquan\n21D2D\tya\n21D2F\te\n21D31\thu\n21D40\tmang\n21D49\twu\n21D4C\tcha\n21D51\tqin\n21D52\tjie\n21D53\thong\n21D55\tdan\n21D56\ten\n21D57\tze\n21D58\thu\n21D59\tang\n21D5A\tjie\n21D5B\tfu\n21D5C\tyong\n21D5D\tzong\n21D5E\tfeng\n21D6C\tmu\n21D76\tse\n21D77\tcong\n21D7B\tkang\n21D82\tyao\n21D83\tai\n21D84\tbao\n21D86\tpo\n21D88\tshi\n21D89\tfan\n21D8B\tju\n21D8C\tpi\n21D8E\twei\n21D8F\tku\n21D90\tqie\n21D91\tgan\n21DA2\tkuang\n21DA3\tsui\n21DA4\tbeng\n21DA5\tjia\n21DA6\tya\n21DAA\tkan\n21DAB\tnie\n21DAD\txing\n21DAF\txi\n21DB1\tlin\n21DB2\tduo\n21DB4\tchan\n21DC8\tshi\n21DCB\tdui\n21DCD\tjiang\n21DCE\tyu\n21DCF\tlu\n21DD0\ten\n21DD3\tgu\n21DD5\twei\n21DD6\tche\n21DD7\thuan\n21DD8\tbie\n21DDB\than\n21DDC\ttui\n21DDD\tna\n21DDE\tqi\n21DE0\ttou\n21DE1\tyuan\n21DE2\twang\n21DE4\twu\n21DE5\tgao\n21DE8\tkeng\n21DEA\tyi\n21DF8\txiao\n21DFA\tgui\n21DFB\tya\n21DFC\tsui\n21DFD\tsong\n21DFF\tzhuo\n21E02\ttu\n21E03\txian\n21E08\tze\n21E09\tli\n21E0C\tzhu\n21E0E\tjie\n21E11\tti\n21E14\txie\n21E15\tqiong\n21E17\tya\n21E18\tju\n21E1B\tyin\n21E1C\tzhi\n21E1E\tkan\n21E1F\tzi\n21E21\tke\n21E23\tnie\n21E24\tqiang\n21E25\twan\n21E26\tze\n21E28\tju\n21E2A\tzi\n21E44\tya\n21E47\tlin\n21E49\tqi\n21E4E\thui\n21E53\tqi\n21E55\tyang\n21E56\tsui\n21E58\tqi\n21E59\tgui\n21E62\tqin\n21E63\te\n21E65\tzuo\n21E68\tze\n21E69\tqi\n21E6A\tji\n21E6C\ttuo\n21E6D\tdie\n21E6F\thui\n21E70\tmao\n21E72\txu\n21E75\thou\n21E76\tyan\n21E77\txiang\n21E78\tcong\n21E79\thu\n21E7C\tan\n21E7E\tbing\n21E83\tqiang\n21E87\tduo\n21E90\tzhu\n21E91\tdie\n21E92\tyou\n21E93\tqi\n21E94\tshi\n21E95\txun\n21E96\tyou\n21E97\tkan\n21E98\tqiao\n21E9B\tqiang\n21E9C\tpen\n21E9F\tquan\n21EA1\tying\n21EA7\tsha\n21EAB\ttao\n21EAD\thong\n21EAE\tpi\n21EAF\tyao\n21EB4\ttu\n21EB5\tchai\n21EB7\txia\n21EB8\tqi\n21EBA\tqiong\n21EBD\tjin\n21EC8\tzhen\n21ECC\tzhu\n21ECE\txi\n21ED0\tweng\n21ED1\tzhong\n21ED5\tsui\n21ED8\tke\n21ED9\tkuo\n21EDA\tkang\n21EDD\tchao\n21EDE\tbi\n21EDF\tmo\n21EE0\tzhu\n21EE1\than\n21EE2\tyu\n21EE3\tyi\n21EE4\tma\n21EE7\tqi\n21EE8\tgun\n21EE9\tman\n21EEA\tliao\n21EEB\tlin\n21EEC\tzu\n21EED\tlei\n21EEE\thu\n21EEF\tchuang\n21EF0\tqi\n21EF1\tlei\n21F01\tchi\n21F03\tpo\n21F04\tdie\n21F0A\tlei\n21F0E\tyi\n21F13\tdian\n21F16\tdun\n21F17\tgao\n21F18\thu\n21F1A\txiao\n21F1B\tga\n21F1C\tpeng\n21F2C\tshen\n21F31\twei\n21F3B\tdui\n21F3C\tchao\n21F3D\tyin\n21F3E\tkuai\n21F3F\tku\n21F41\tzui\n21F42\tgu\n21F45\tyun\n21F46\tzhi\n21F49\tji\n21F4A\tcheng\n21F56\txie\n21F57\txian\n21F5B\tzui\n21F5C\tan\n21F5D\thao\n21F60\tpo\n21F62\tdi\n21F63\tye\n21F67\tnao\n21F71\tjie\n21F72\tbang\n21F73\tlan\n21F74\tcang\n21F76\tbi\n21F7B\tzhan\n21F7C\tqi\n21F82\tnao\n21F85\tlu\n21F87\tkuang\n21F89\tmo\n21F8B\tlei\n21F8C\tpao\n21F92\tli\n21F93\tceng\n21F95\tdang\n21F96\tlei\n21F99\te\n21F9B\tbeng\n21F9C\tjue\n21FA5\txuan\n21FA6\tnie\n21FA8\thai\n21FAE\txian\n21FB0\tjian\n21FB1\tmi\n21FB2\tnie\n21FBB\tcang\n21FBC\tsong\n21FBD\tzeng\n21FBE\tyi\n21FC2\tchong\n21FC4\tcang\n21FC9\tlei\n21FCA\tnuo\n21FCB\tli\n21FCE\tli\n21FCF\tluo\n21FD3\ttang\n21FD6\tnie\n21FD7\tnie\n21FD9\tji\n21FDB\tlei\n21FDD\tnang\n21FE0\tlin\n21FE1\tling\n21FE4\txian\n21FE5\tyu\n21FE7\tzai\n21FE8\tquan\n21FE9\tlie\n21FEF\tyu\n21FF0\thuang\n21FFA\tnao\n21FFC\txun\n21FFE\tju\n21FFF\thuo\n22001\tyi\n2200A\txi\n2200B\tse\n2200C\tjiao\n2200D\tyong\n22015\tshi\n22016\tjing\n22017\twan\n22018\tye\n22019\tjiu\n2201C\tgong\n22021\thui\n2202A\ter\n22035\than\n2203C\tfu\n22040\tfu\n22041\tzhuo\n22042\tji\n2204F\tbang\n22052\tqi\n22053\tshi\n22055\tdiao\n22056\tpei\n22057\txian\n22058\tsan\n2205D\tchang\n2205E\tyue\n22060\tgong\n22062\twu\n22064\tfen\n22067\tchan\n22069\tnei\n2206A\tjue\n2206C\tzhao\n2206E\tqian\n22071\tao\n22076\twang\n22077\tzhong\n22079\thuang\n2207B\tbu\n2207C\tzhu\n2207D\tbi\n2207E\tchao\n2207F\tzheng\n22080\tfu\n22081\tkou\n22083\tzuo\n22084\txuan\n22086\tfu\n2208A\tyao\n2208D\tbo\n2208F\tbei\n22090\txie\n22091\tshi\n22092\tyi\n22094\thong\n22095\tcui\n22097\tyi\n22098\tzhuan\n2209D\tchi\n220A4\tpo\n220A8\tyin\n220B1\tyuan\n220B6\tjiong\n220B9\tmao\n220BA\tqian\n220BC\tyi\n220C0\twu\n220CD\tbei\n220CE\thuo\n220CF\tcong\n220D0\tkong\n220D5\tta\n220D7\than\n220D8\tqian\n220DC\tzhi\n220E2\tse\n220E5\tqian\n220E6\tguo\n220E9\tgun\n220EC\tjian\n220ED\tzhong\n220EE\tmian\n220EF\tgui\n220F0\tshi\n220F1\tmou\n220F2\te\n220F3\tba\n220F4\tla\n220F8\tzhou\n220FA\tji\n22100\tzao\n22104\tzha\n22105\tyi\n22107\tgou\n2210A\tgui\n2210B\tying\n2210C\tshai\n2210D\the\n2210E\tbang\n2210F\tmo\n22110\tmeng\n22113\twu\n22114\tdai\n22117\tjiong\n2211C\than\n2211F\ttong\n22120\tkou\n22121\tli\n22122\tzhi\n22123\thui\n22124\tzan\n22126\tdiao\n22127\tcu\n22131\tzhi\n22133\tkua\n22135\txiang\n22136\thua\n22137\tliao\n22138\tcui\n22139\tqiao\n2213A\tjiao\n2213C\txu\n2213D\ter\n2213F\ttuo\n22140\ttan\n22141\tzhi\n22148\tnao\n22149\tmao\n2214A\tdi\n2214B\tceng\n2214E\tjiao\n2214F\tlian\n22151\tsha\n22152\tdan\n22155\tsui\n22156\tlian\n22157\tguo\n2215A\tbiao\n2215C\tci\n2215D\tdian\n2215E\tlu\n2215F\tni\n22160\tyan\n22161\tlan\n22164\tgai\n22165\tchu\n22169\tbi\n2216A\tzu\n2216B\thui\n2216D\tlai\n2216E\txian\n2216F\tfen\n22170\the\n22179\tyao\n2217A\tzhan\n2217C\tnei\n2217E\tluo\n22180\tyuan\n22182\tneng\n22189\tren\n2219C\tge\n2219E\tjian\n2219F\tping\n221A3\tbie\n221A6\tjian\n221A9\tbing\n221AF\tmi\n221B0\thu\n221B4\tdiao\n221B6\tyou\n221B7\tyao\n221B8\tbeng\n221BA\tchen\n221BB\tji\n221BD\tyao\n221C7\tguan\n221C8\tyan\n221D5\tchi\n221D7\tsha\n221D8\tyan\n221D9\tyi\n221DA\tyi\n221DB\tche\n221DE\than\n221DF\thuang\n221E4\tshui\n221E5\tsui\n221E6\tren\n221E7\ttan\n221E8\tzhi\n221EA\tfan\n221EB\tfeng\n221F0\ttan\n221F2\tmi\n221F3\tpi\n221F4\tbu\n221F5\tna\n221F6\ttian\n221F7\tba\n221F8\tyi\n22202\tyan\n22204\ttiao\n22206\tyao\n22207\tshen\n22208\tke\n22209\ttong\n2220B\txuan\n22213\tyou\n22215\tbai\n22219\txia\n2221A\tlu\n2221B\tkun\n2221C\tzang\n2221D\tqiu\n22220\tcu\n22221\tzui\n22222\tlou\n22224\txia\n2222F\tshen\n22232\tpu\n22234\tjing\n22235\tqiang\n22236\tyi\n22238\tnie\n22239\tdui\n2223B\tjie\n2223C\tsui\n2223D\tzhan\n2223E\tcou\n22241\tbeng\n22242\tguan\n22243\tshe\n22245\tjin\n22246\tdi\n22251\tdan\n22253\tnai\n22255\tnou\n22257\tji\n22258\tyan\n2225A\tnou\n2225C\tdu\n2225D\twei\n2225E\tpian\n22262\thu\n22264\tjia\n22265\tye\n22266\tjun\n22267\tlan\n22268\tla\n22269\tyin\n2226D\ttui\n22275\tnao\n2227A\tzu\n2227F\tma\n22280\tsi\n22281\tzhi\n22284\thui\n22285\tzhui\n22287\thui\n2228D\tchu\n2228F\tche\n22292\txiu\n22293\tlan\n22295\tcong\n22296\tshen\n22297\tmo\n22298\tyi\n22299\tyao\n2229A\txi\n2229B\tzui\n2229C\tbing\n222A7\tyu\n222A9\tlu\n222AE\ttui\n222AF\twei\n222B1\tfen\n222B2\tshen\n222BB\tliao\n222C2\tshu\n222C3\tdan\n222C4\tjuan\n222C5\tyu\n222C6\txin\n222C7\tyao\n222C8\tsu\n222D2\thuo\n222D4\tqian\n222DA\tma\n222DD\tkai\n222E1\tlu\n222E3\tyou\n222EE\txian\n222F9\twu\n222FB\tyin\n222FC\txi\n222FF\tzhai\n22300\txie\n22304\tqu\n22308\tli\n2230D\tqian\n22314\tling\n22315\tluan\n2231A\tchan\n22326\tzheng\n22328\tyan\n22332\tyin\n22333\tkui\n22337\tqu\n22339\tfu\n2233B\tyu\n22341\tqi\n22346\tqi\n22347\tji\n22348\tyuan\n2234E\tgao\n2234F\tjuan\n22351\tqi\n22353\tgai\n22355\tquan\n2235A\twei\n22367\tzhi\n2236B\tjian\n2236D\tsi\n22370\tyi\n22371\tqian\n2237C\tli\n2237F\tzang\n22380\tyi\n22382\tcai\n22383\tyi\n22384\tge\n22386\tdie\n22388\tzhi\n22389\tyi\n2238B\tzai\n2238C\tdai\n2238E\tsu\n22394\tjie\n22395\tchen\n22396\tqu\n22398\than\n22399\txian\n223A0\tquan\n223A1\tjie\n223A5\tjuan\n223AA\tdan\n223AD\tjin\n223B4\tbing\n223B5\thu\n223B9\tjue\n223BB\tyu\n223C3\tli\n223C4\tqiang\n223C5\tshui\n223C6\tku\n223C8\tzhen\n223CD\tfu\n223CE\tshen\n223D2\tchui\n223D5\ttong\n223D7\tyi\n223D9\tyang\n223DC\ttuo\n223DD\tzhou\n223DE\tji\n223E4\txun\n223E6\tshen\n223E7\txuan\n223ED\tliu\n223EE\tyuan\n223EF\thu\n223F0\tzheng\n223F3\tpeng\n223F7\tjue\n22402\tzhi\n22403\tpian\n22404\tyuan\n22406\tjian\n2240A\tpang\n2240E\tzhuan\n22410\txian\n22412\tbeng\n22414\tcong\n22416\tmo\n2241A\tguo\n2241E\tcheng\n2241F\tqiao\n22426\tbi\n22429\tqiang\n2242B\tzhou\n22432\tfan\n22433\tbie\n2243E\tbo\n2243F\trong\n22445\tding\n22446\tquan\n22447\tjiu\n22448\tyao\n22453\txia\n22456\tzao\n2245D\tdan\n2245F\twu\n22460\ttuo\n22462\thu\n22467\txi\n2246C\tlai\n2246E\tfei\n22479\thu\n22486\txian\n22489\tshan\n2248D\tfei\n22490\tcuo\n22492\tfu\n22494\tchu\n2249D\tdiu\n2249E\tlan\n224A9\txi\n224AF\tbiao\n224B0\tyu\n224B1\tsui\n224B2\txi\n224B7\tpou\n224B9\tshan\n224BE\tjiao\n224C0\tyi\n224C3\twan\n224C4\tji\n224C6\twan\n224C7\ttui\n224CB\tang\n224CD\ttian\n224CE\tchi\n224D2\tran\n224D4\tsa\n224D5\tyin\n224D6\tpi\n224D7\tci\n224D8\ttong\n224D9\tyin\n224DC\tge\n224DD\ttiao\n224DE\tzheng\n224DF\tzhou\n224E1\tyi\n224E2\tkua\n224E3\tsong\n224E7\tdi\n224EC\txie\n224EE\txiao\n224EF\tguang\n224F0\ttuo\n224F1\tfeng\n224F2\twu\n224F5\txiu\n224FF\tyou\n22501\tling\n22502\tyan\n22505\tdong\n22506\tqi\n22507\ttao\n22508\than\n2250A\tchi\n2250B\tsong\n22511\tquan\n22514\than\n2251F\trou\n22520\tqi\n22521\tkai\n22522\tyu\n22523\tcha\n22524\tcheng\n22525\tyu\n22527\tbing\n22529\tcong\n2252A\tzhu\n2252C\tyu\n22531\tjue\n22532\tliu\n22533\tsao\n22534\tyu\n22545\tshuai\n2254B\tyuan\n2254E\tzhang\n22551\tshuai\n22553\tchu\n22554\tzhang\n22555\tsan\n22556\txian\n22558\tcui\n22559\tmeng\n2255A\tdi\n2255E\tzhi\n2255F\tao\n22566\txiu\n22568\tpian\n2256A\tjiao\n2256B\tkuan\n2256C\tsa\n2256D\txian\n2256E\tzha\n2256F\tdian\n22577\tyi\n2257A\thui\n2257B\tshan\n22584\tchong\n22585\tyi\n22586\txie\n22587\tzhi\n22588\ttiao\n2258A\tping\n2258B\txian\n2258E\txian\n2258F\tsu\n22591\tcuan\n22597\tsong\n2259B\thei\n2259D\txian\n2259F\tyou\n225A1\tyu\n225A4\ttai\n225A6\tjue\n225A7\tnang\n225A9\tdian\n225AB\tyi\n225AC\tbi\n225B3\txu\n225B4\tyi\n225B5\tru\n225B7\tgong\n225BA\tyi\n225BF\tzhi\n225C0\txin\n225C2\tji\n225C4\txia\n225C8\tzhao\n225C9\tne\n225CA\txie\n225CE\tyi\n225D3\tyu\n225EB\tfu\n225ED\tshe\n225EF\tyuan\n225F0\tfan\n225F2\tfu\n225F3\twu\n225F4\txi\n225F5\thong\n225F9\tji\n225FA\tchang\n225FF\tmo\n22600\tpei\n22603\tmu\n22604\tqiu\n22605\tmao\n22607\tda\n22609\txia\n2260A\tshen\n2260B\tte\n2260C\thong\n2260D\tbi\n22619\tlong\n2261D\tni\n2261F\tqiao\n22627\truan\n22638\tjiang\n22639\tcha\n2263A\tmi\n2263D\tyi\n2263F\tsuo\n22641\twu\n22642\txuan\n22645\txi\n22647\tyi\n22650\tnao\n22651\tmai\n22652\txiao\n22653\twei\n2266E\tkan\n22671\tlong\n22672\tlu\n22673\tzhuang\n2267A\tzhi\n2267C\txing\n2267E\tgeng\n2267F\tjin\n22680\txian\n22681\tji\n22682\tcuo\n22684\tlao\n22685\tfen\n22686\tju\n2268B\tmiao\n2268C\txia\n22691\tsu\n226A8\tzhi\n226AA\thu\n226AB\tkou\n226AD\tsuo\n226AE\tni\n226BA\tteng\n226BB\tzhu\n226C1\tda\n226C3\tqiu\n226C4\tya\n226C6\txian\n226C9\tnei\n226CD\tzhi\n226CE\tbie\n226D2\tchong\n226D3\tlan\n226D4\tdong\n226D5\tqun\n226D6\txiang\n226D8\txiao\n226D9\twan\n226DA\tru\n226DB\twang\n226DC\tni\n226DE\tbai\n226DF\tya\n226E5\tsi\n226E6\tyin\n226E8\tyu\n226EE\tli\n226EF\thuo\n22717\tbang\n22723\txi\n22725\tjiu\n22728\txie\n22729\tqian\n2272A\tnuo\n2272B\txing\n2272C\tduo\n2272D\tji\n2272E\twu\n2272F\tmu\n22730\tyan\n22731\tqi\n22732\tna\n22733\tchi\n22734\thou\n22736\tsao\n22738\tnao\n2273B\tcheng\n2273C\tcheng\n2273D\tkui\n2273F\tjia\n22740\ttu\n22741\thong\n22742\tdu\n22745\txia\n22746\tzhong\n22747\thuo\n22748\tchong\n22749\tda\n2274C\tmao\n2274D\tyao\n22753\tjuan\n2276C\tshi\n2276F\tyin\n22773\tgu\n22774\twu\n22778\tguo\n22779\tti\n2277B\thu\n22787\tre\n22789\tyi\n2278B\ttun\n2278F\tqiong\n22790\thai\n22792\tqi\n22795\thuo\n22796\tti\n22797\tpi\n2279A\tgeng\n2279C\txie\n2279E\tmi\n2279F\tgao\n227A0\tta\n227A1\txiang\n227A3\tshu\n227A6\tfu\n227AC\tzhuan\n227AD\tliu\n227C5\tyou\n227CA\tcheng\n227CB\tdui\n227E2\tli\n227E3\tyang\n227E4\tli\n227E7\tlu\n227E8\tmu\n227E9\tsui\n227EA\tai\n227ED\tkou\n227EF\tzhe\n227F0\tai\n227F1\tteng\n227F3\tlu\n227F4\ttui\n227F5\tbi\n227FC\tmeng\n227FE\thui\n227FF\thuan\n2281B\tkuo\n2281D\txin\n22821\tsao\n2282B\tshu\n2282C\tque\n2282D\tba\n2282E\ttui\n22832\tfu\n22833\tbie\n22835\ttang\n22837\txiang\n22839\tsi\n2283A\tbo\n2283C\tmai\n2283D\tdang\n2283F\tgui\n22840\thei\n22841\txi\n22842\tdang\n22843\tyi\n22845\tbi\n22847\tgu\n22848\tcui\n22849\tse\n2284D\tge\n2284E\tyu\n2284F\tna\n22851\tli\n22852\tzhi\n22870\tzhao\n22874\tji\n22875\truan\n22879\tchong\n22882\tjie\n2288C\tchang\n2288D\tzhe\n22892\tsu\n22893\tyong\n22896\tqi\n22897\tzhuo\n2289A\tkai\n2289C\tye\n2289E\tqi\n228B9\txiong\n228C9\tyi\n228CA\tchou\n228CE\ttuan\n228CF\tai\n228D0\tpin\n228D3\tlie\n228D4\tmian\n228D5\tai\n228D7\tmo\n228D8\twei\n228D9\tying\n228DA\tni\n228DE\tbo\n228E0\tliu\n228F3\trui\n228F5\tchu\n228FB\tlu\n228FC\tcha\n228FF\tchu\n22901\tsao\n22902\tli\n22904\tsong\n22906\tli\n2290B\txi\n2290D\tyan\n2290E\tcuo\n22910\tliu\n22918\tmeng\n2291A\tzhan\n22924\tzhuang\n22927\tmiao\n22929\tli\n2292B\tju\n2292F\txie\n22930\txie\n22931\tlong\n22932\tlong\n22942\tteng\n22943\tzhu\n2294B\tchan\n2294C\txian\n2294F\tying\n22950\tpei\n22958\txie\n2295A\tjiao\n2295E\tchong\n22973\the\n2297D\ttun\n22985\thong\n22988\tman\n2298A\tjin\n2298C\tqu\n2298D\tdou\n2298E\tqiu\n2298F\tzai\n22991\tsheng\n22992\tzai\n22995\tyi\n2299A\thua\n2299F\tkan\n229B0\tyue\n229B1\tni\n229B2\tsi\n229B4\two\n229B8\tcan\n229BA\tjian\n229BC\tmie\n229BD\tshao\n229BF\trong\n229C0\tgan\n229C5\tqiang\n229C7\tshu\n229C8\tzhuo\n229CF\tshi\n229D0\tzhan\n229D1\tti\n229D6\tzha\n229D7\tzhan\n229DD\tfen\n229DE\tmie\n229E0\tze\n229E4\tzhi\n229E5\tqian\n229E6\than\n229E7\tge\n229EE\tcan\n229F0\tguo\n229F1\tjiao\n229F3\tyong\n229F4\tao\n229FB\tzha\n229FD\txi\n22A01\txu\n22A02\twu\n22A0F\tjue\n22A10\tji\n22A12\tchi\n22A14\twan\n22A16\tmie\n22A17\tzei\n22A1C\tjie\n22A1D\tshi\n22A1F\txi\n22A21\te\n22A25\thu\n22A26\thu\n22A28\tli\n22A2B\tchu\n22A2E\tyi\n22A2F\tmao\n22A30\txu\n22A31\tzhong\n22A33\tyi\n22A3A\tliao\n22A3F\tjian\n22A40\tjian\n22A41\tju\n22A44\tzhu\n22A48\twu\n22A4F\tke\n22A50\tke\n22A51\tli\n22A52\tbi\n22A53\tge\n22A55\txu\n22A56\tsha\n22A57\tling\n22A58\tke\n22A5E\tbo\n22A5F\tbian\n22A60\tshuan\n22A61\tqi\n22A62\tshan\n22A66\tji\n22A68\tqiao\n22A6E\tyi\n22A6F\tjue\n22A70\tzhang\n22A72\txin\n22A77\ttuo\n22A78\thai\n22A79\txia\n22A7B\ttuo\n22A7C\tyi\n22A83\tcu\n22A87\tjiang\n22A88\tnan\n22A8B\tpeng\n22A8D\tjie\n22A8E\txue\n22A8F\thu\n22A93\tju\n22AA5\tyou\n22AA6\tnu\n22AA7\tye\n22AAA\tyin\n22AAC\tkong\n22AB6\txiao\n22AB7\txiang\n22ABC\tnao\n22ABE\tzhang\n22AD0\tjie\n22AD3\tnu\n22AD4\tshan\n22AD8\tlu\n22AE2\tjia\n22AE7\tzhou\n22AE8\trong\n22AEB\tlu\n22AEC\tsa\n22AED\tnu\n22AEF\tbo\n22AF0\tzhe\n22AF2\tqin\n22AF4\tci\n22AF5\tzu\n22AF7\two\n22AF8\twu\n22AFB\tnie\n22AFF\txian\n22B00\thong\n22B0D\tye\n22B2B\tting\n22B2C\tjin\n22B31\tjie\n22B32\the\n22B33\ttu\n22B34\tzhe\n22B35\tpin\n22B36\tjin\n22B37\tnan\n22B3C\tdun\n22B3E\txi\n22B3F\txie\n22B41\txi\n22B42\tlao\n22B43\tduan\n22B44\tji\n22B45\tcha\n22B46\tchou\n22B48\tgang\n22B4E\txiang\n22B4F\tdao\n22B65\tbian\n22B66\txiao\n22B67\txin\n22B81\tyu\n22B82\txian\n22B83\tli\n22B84\tqian\n22B87\tmei\n22B89\tqiao\n22B8A\tya\n22B8C\tqia\n22B8D\tqiong\n22B8F\tbang\n22B90\tzheng\n22B9A\tze\n22B9B\tshuan\n22B9E\tsao\n22BC5\tlu\n22BC9\txie\n22BCB\tfu\n22BCC\tzhai\n22BE9\tze\n22BEB\tduan\n22BED\tdeng\n22BEE\tyu\n22BF0\tlu\n22BF2\twan\n22BF3\txue\n22BF4\tjiao\n22BF5\tyue\n22BF6\tzhi\n22BF7\twei\n22BF9\tge\n22BFA\tju\n22BFC\tyan\n22BFD\tcuo\n22BFE\tmao\n22C06\tfu\n22C07\tai\n22C0A\txuan\n22C0C\tgang\n22C0D\tan\n22C12\tji\n22C18\tpi\n22C19\tzhi\n22C1C\tnuo\n22C3F\tpan\n22C41\tyi\n22C44\tjie\n22C46\tzi\n22C48\tjia\n22C49\twai\n22C4C\tjia\n22C5F\tchan\n22C61\tsuo\n22C62\tsuo\n22C63\tji\n22C64\tsong\n22C66\tti\n22C67\tpi\n22C68\tpo\n22C6E\tmi\n22C74\tye\n22C76\tqin\n22C77\tjin\n22C7A\tjue\n22C7D\tyuan\n22C7E\truan\n22C94\tban\n22CB0\tbin\n22CB4\twei\n22CB5\tzao\n22CB6\tqie\n22CB7\tsou\n22CB8\tlu\n22CBC\tdie\n22CBD\tchuai\n22CBE\tbi\n22CBF\tzhu\n22CC0\tma\n22CC1\tfei\n22CC2\tpie\n22CC3\tyin\n22CC4\txuan\n22CC6\tao\n22CC7\tzhuo\n22CC8\tzu\n22CCB\tbi\n22CD1\tlang\n22CD3\tti\n22CD9\ttiao\n22CDA\tjian\n22CDF\ttong\n22CFD\tduo\n22CFE\tdong\n22D02\tbian\n22D20\tzhi\n22D22\tfen\n22D26\tkang\n22D27\tzhi\n22D28\tzhai\n22D29\tbi\n22D2A\tkuan\n22D2C\tban\n22D2D\tjue\n22D2E\tqu\n22D30\tqi\n22D31\tlei\n22D32\txie\n22D33\ttang\n22D3C\tsou\n22D3E\tbei\n22D47\tyang\n22D48\tjian\n22D65\tzao\n22D6E\tlu\n22D80\tzhuai\n22D83\tfan\n22D85\tshe\n22D87\tqiong\n22D89\tpo\n22D8B\ttie\n22D8C\tsha\n22D8D\tza\n22D91\tniao\n22D92\tguai\n22D93\tcui\n22DA1\tqiao\n22DA3\tdie\n22DB3\tpin\n22DB4\tci\n22DB6\tbang\n22DCD\tyin\n22DD1\txian\n22DD4\tyi\n22DD5\tmiao\n22DD6\tduan\n22DD7\tzhou\n22DD9\tkong\n22DE2\tzhang\n22DF6\tliu\n22DF8\tzhi\n22DF9\tchan\n22DFA\tdu\n22DFB\tyuan\n22DFE\tsuo\n22DFF\tjie\n22E00\tli\n22E01\tgong\n22E0C\tbang\n22E17\tguo\n22E18\tliao\n22E19\tshen\n22E23\tniao\n22E25\tcuan\n22E26\twei\n22E28\ttuo\n22E2B\tsu\n22E2D\tlong\n22E33\txiao\n22E34\tyan\n22E43\tqing\n22E4D\txi\n22E4F\tyu\n22E51\tzheng\n22E52\txie\n22E53\tchai\n22E54\tfen\n22E56\tguo\n22E58\tjing\n22E59\tlan\n22E5A\txian\n22E5D\tling\n22E6E\tlei\n22E72\tjun\n22E73\txiao\n22E7C\tza\n22E84\tguan\n22E85\tqie\n22E86\tluo\n22E87\tyao\n22E88\tluan\n22E89\tta\n22E91\tluo\n22E9E\tba\n22E9F\tchan\n22EA1\tzhuo\n22EAB\ttiao\n22EAF\twan\n22EB0\tling\n22EB4\tyu\n22EB5\tqi\n22EB7\tqi\n22EBC\tji\n22EBD\tbo\n22EBF\tshi\n22EC0\tfu\n22EC2\tgui\n22EC5\tdian\n22EC7\thao\n22EC9\tgai\n22ECB\tqi\n22ED3\tcheng\n22ED4\thui\n22ED7\txia\n22ED8\tshi\n22ED9\tzhi\n22EDA\tqi\n22EDC\thai\n22EDF\tjiao\n22EE0\tli\n22EE2\tliao\n22EE4\tqiao\n22EE8\tsa\n22EEA\tqi\n22EEB\tshi\n22EEE\tjie\n22EF5\tbei\n22EF6\tbian\n22EF7\tba\n22EF8\tjun\n22EF9\tpi\n22EFC\tdan\n22EFF\ttang\n22F00\tkui\n22F01\tku\n22F03\tkou\n22F09\tshi\n22F0A\tshi\n22F0B\tji\n22F0C\tbao\n22F10\tke\n22F11\tkuang\n22F16\tmin\n22F19\tliao\n22F1A\te\n22F1B\tge\n22F1F\twang\n22F20\tduo\n22F23\tqia\n22F24\thua\n22F26\thong\n22F29\tpeng\n22F2B\tjiao\n22F30\tqu\n22F31\tzi\n22F32\tzhou\n22F33\tkuang\n22F35\tsha\n22F37\tji\n22F38\twei\n22F39\tpu\n22F3A\txue\n22F3C\tshao\n22F42\tlang\n22F43\tzhi\n22F44\tting\n22F47\tda\n22F55\tyang\n22F56\tjin\n22F57\tzhi\n22F5A\tzhuo\n22F5C\tza\n22F5D\tchan\n22F62\tmao\n22F66\tkong\n22F67\tzhou\n22F68\thu\n22F69\tpeng\n22F6D\tjiu\n22F78\tchuo\n22F79\tmin\n22F7E\txiao\n22F80\tdu\n22F81\twei\n22F83\tcan\n22F84\tyu\n22F85\tdu\n22F86\tkai\n22F87\tpi\n22F8A\tcheng\n22F8E\tchun\n22F90\tshao\n22F91\tyan\n22F92\tkuai\n22F94\tyue\n22FA6\tqi\n22FA7\tzheng\n22FA9\tke\n22FAA\tqi\n22FAB\tzhi\n22FAC\tlu\n22FB1\tpi\n22FB2\tnuo\n22FB3\tpao\n22FBA\tfei\n22FBF\twen\n22FC2\tmeng\n22FC8\tshan\n22FCC\txiong\n22FCE\tduo\n22FCF\tbiao\n22FDA\tyou\n22FDC\tman\n22FDE\tliao\n22FE1\txie\n22FE2\tluan\n22FE3\tqiao\n22FE4\tdeng\n22FE6\tcheng\n22FE7\tcheng\n22FED\tchuo\n22FF8\tce\n23000\tlei\n23001\tzhan\n23002\tli\n23003\tlian\n23004\tqun\n2300D\tchen\n2300F\tcheng\n23010\tgu\n23012\tzong\n23013\tchou\n23014\tchuan\n2301C\tlei\n2301D\tshuo\n2301E\tlu\n23023\tfu\n23025\tli\n23027\tsan\n2302B\tsan\n2302F\tsa\n23033\tnie\n23036\tzuan\n23037\tli\n2303B\tshu\n2303E\tfu\n23049\tbi\n2304D\tdao\n23052\tshi\n23056\tgan\n23057\ttan\n2305C\tman\n2305F\tli\n23062\tbi\n23066\tpan\n23068\tyou\n2306D\tjiu\n2306F\tguo\n23070\tliao\n23073\two\n23074\tqia\n23075\tdou\n23077\tlie\n23079\tjiao\n2307B\tlie\n23081\ttiao\n23084\tguo\n23086\tpang\n23087\tqiao\n23089\tdi\n2308A\tyun\n23092\tle\n23096\tsi\n23097\txin\n2309C\txin\n2309D\txiang\n2309E\tluo\n230A4\tbeng\n230A5\ttiao\n230AC\txiao\n230AE\tdou\n230B3\tdang\n230B4\tting\n230B5\tzhuan\n230BB\tou\n230BD\two\n230C1\tzhu\n230C4\txin\n230C5\truan\n230C8\tzhuo\n230C9\tdang\n230CD\tcui\n230D1\tzhuo\n230D7\tcong\n230D8\tchan\n230DD\tyang\n230E7\tyan\n230F3\tyan\n230F5\tzhen\n230FD\tnuo\n230FE\tyan\n23105\tfang\n23109\tyan\n2310A\tyu\n2310D\tti\n2310E\tfu\n2310F\tben\n23111\tyan\n23113\thui\n23119\thuang\n2311C\tgui\n2311D\tyan\n2311F\thu\n23120\tbiao\n23127\tsui\n2312E\tzi\n2312F\tji\n23130\te\n23131\tji\n23132\tkui\n23134\tliang\n23138\thuo\n2313A\twei\n2313B\tzhuo\n2313F\tting\n23143\tzai\n23144\tyou\n23149\tren\n2314D\tmian\n2315A\tna\n2315D\ttu\n2315F\tdan\n23161\tjue\n23164\txu\n23165\tdi\n23170\txiang\n23177\txiong\n2317A\tyou\n2317B\tgua\n2317E\txi\n23188\the\n2318D\tding\n23190\tlu\n23192\txu\n23194\tzhou\n23195\txian\n23196\thuang\n23197\tcha\n23198\tshi\n23199\tgan\n2319A\tnuo\n2319B\tan\n2319F\txie\n231A7\thao\n231B2\tqin\n231B3\tgeng\n231B4\tshan\n231B5\tfu\n231BD\tze\n231C7\tdan\n231D6\tdian\n231D7\tshen\n231D9\tzu\n231E2\tbie\n231E6\tchui\n231E7\tzhe\n231E8\tdai\n231EB\two\n231EC\tqiong\n231F0\tlin\n231F2\thun\n231F3\tji\n23205\tcao\n2320A\tmu\n2320D\tdie\n2320E\twei\n23220\tbian\n23221\tti\n23223\tying\n23225\ttu\n23236\tgeng\n23244\tchi\n23245\tcou\n23246\tti\n23252\thuo\n23253\tqi\n23254\tsao\n23255\tsang\n23256\txuan\n23257\tang\n23258\tnai\n2325A\tyang\n2325B\tshu\n2325C\tsha\n23261\tting\n23269\tya\n2326A\thuang\n2326E\tbin\n2327C\tai\n2327E\tou\n2327F\tcao\n23281\tao\n23283\tmao\n23294\tmeng\n23296\ttian\n2329D\tsang\n2329E\txu\n2329F\tkan\n232A7\tlang\n232B6\tbie\n232B7\tcong\n232BA\txian\n232C4\ttun\n232C9\tyu\n232CA\tdan\n232CB\tying\n232CD\tzhao\n232CF\tpu\n232D8\thui\n232DE\tai\n232DF\tmo\n232E2\tjing\n232E3\tlan\n232F2\tlie\n232F3\tpiao\n232F5\tbo\n232F6\tqiong\n232F9\tbi\n232FF\tyong\n23305\tli\n2330D\tnie\n2330F\tde\n23313\thuan\n23317\tyue\n2331A\tchun\n2331C\tli\n2331E\tzhang\n2331F\tling\n23320\tchun\n23327\tce\n23328\txun\n2332C\tju\n2332D\thui\n2333E\ttong\n23346\tning\n23347\tju\n2334F\tcha\n23356\tzao\n2335B\tyu\n2335F\tken\n23366\tkuang\n23367\tfei\n2336F\tyun\n23370\tqian\n23374\tquan\n23378\tpo\n2337A\tpei\n23384\tgeng\n23385\tyi\n23386\tluo\n23391\tkuan\n23393\txuan\n23394\tnian\n2339A\thu\n2339B\tju\n233A9\tye\n233AE\txi\n233B1\tyue\n233B2\ttang\n233B3\tpin\n233B4\tdun\n233B5\tbei\n233B8\tliao\n233C0\tyong\n233CE\tya\n233D1\tjiao\n233D4\tkun\n233D6\tzhen\n233D7\tshu\n233DA\tshi\n233DE\tyou\n233DF\tpai\n233E0\txiao\n233E1\tji\n233E2\ttuan\n233F6\tqi\n233F7\the\n233FA\tkong\n23402\tye\n23403\tchi\n2340A\tkao\n2340B\tyue\n2340E\twa\n2340F\tnian\n23411\tci\n23413\tyi\n23415\tjing\n23424\tjiu\n2342B\tyang\n2342C\tli\n2342E\tdai\n2342F\tchong\n23435\tyi\n2343A\than\n2343F\tyi\n23441\tchong\n23442\thu\n23443\tzhua\n2345D\ttuan\n23466\tqiong\n23467\tduo\n23478\ttong\n23479\txian\n2347F\tfu\n23482\tdian\n23483\txi\n23484\txie\n23485\tzhen\n23486\tqiao\n23487\ttu\n2348C\thuo\n23497\the\n234B7\than\n234B8\tkuang\n234B9\tsuo\n234BB\tshou\n234BC\ttiao\n234C0\tzhen\n234C3\tnei\n234C5\tqian\n234C6\tyin\n234C8\tliang\n234C9\tsha\n234CA\tzi\n234CB\tpi\n234CC\tgao\n234CF\tjin\n234D0\tyou\n234D2\tshan\n234D4\tmi\n234D5\tou\n234D7\thu\n234DB\tyou\n234DD\tmeng\n234FF\tlao\n23510\tzhi\n23513\tbi\n23517\tshen\n23518\tqi\n23519\txian\n2351A\tpan\n2351B\tkang\n2352B\tshuan\n2352C\tpi\n2352E\tzai\n2352F\tzhu\n23531\tsou\n23532\tjiong\n23535\tchan\n23536\tfan\n23537\txiao\n23538\tyin\n23539\thou\n2353A\tmao\n2353B\ttu\n2353C\tgan\n2353D\tji\n23541\tyi\n23543\tyu\n23544\tjiong\n23545\tpao\n23547\txiao\n23549\tgou\n2354C\tgou\n2354D\tsun\n2354E\txian\n2354F\tzhuan\n23572\tgen\n2357E\tchou\n23584\tqiao\n23585\tti\n23586\tyun\n23589\tshan\n2358A\tlie\n2358C\tzhi\n23590\tpai\n235A3\tju\n235A4\tlai\n235A8\tzi\n235AA\tqu\n235AB\tgu\n235AC\tjue\n235AD\tzhi\n235AE\tang\n235AF\tqin\n235B0\tpi\n235B1\tzui\n235B3\tqian\n235B5\tcuo\n235B7\tji\n235B8\tti\n235B9\tru\n235BB\thai\n235BC\txun\n235BE\tbei\n235BF\tzhi\n235C1\tdun\n235CA\tman\n235CB\tdang\n235D0\treng\n235F2\tgan\n235F5\tgang\n235F6\tta\n235F8\ttuo\n235F9\tyang\n235FA\tku\n235FB\tzhi\n23610\tli\n23616\tjian\n23617\tni\n23618\tshen\n23619\tbang\n2361A\tshuai\n2361B\tdou\n2361D\tqian\n2361E\than\n2361F\tqia\n23620\tgan\n23623\tchun\n23624\tcha\n23625\tbi\n23626\tyi\n23627\tfu\n23628\te\n2362A\tlao\n2362B\thao\n2362C\tli\n23631\tte\n23632\tshen\n23634\tyin\n23637\tjian\n2363B\tcha\n23657\tnie\n23658\tcou\n2365B\tyi\n2365F\ttang\n23662\tjuan\n23670\tchi\n23671\tgou\n23674\tjie\n23675\tzhe\n23676\thu\n23677\tmang\n2367B\tzou\n2367C\tsi\n2367F\tfei\n23680\tzi\n23681\tzi\n23683\tjie\n23684\tsi\n23686\tchun\n23687\tpao\n2368B\tye\n2368C\tdi\n2368E\tlei\n2368F\txu\n23690\tru\n23692\tpa\n23693\tjuan\n23694\txi\n23695\tye\n23696\tan\n23698\tyi\n23699\tjian\n2369A\tzhu\n2369C\tsong\n2369D\two\n2369F\tse\n236A0\tzhi\n236A1\tbi\n236A2\tzhuan\n236A6\tjiang\n236A7\thao\n236A9\tchi\n236AA\tdun\n236D3\tbo\n236D4\tji\n236D5\tchua\n236D7\tluo\n236DA\trui\n236EB\thu\n236F1\tdan\n236F4\than\n236F5\tque\n236F6\tsha\n236F7\tzhan\n236F8\tze\n236F9\tchuan\n236FA\tqi\n236FB\tdie\n236FD\tzha\n236FE\ttou\n23701\tci\n23702\tsa\n23704\tluo\n23707\tji\n23722\tluo\n23723\tqin\n23727\tqiong\n23728\tjuan\n2372C\tai\n2372D\tjian\n23739\tti\n2373A\twen\n2373D\tqiao\n23741\tpai\n23742\thun\n23745\tai\n23747\tshuo\n23748\tlian\n23749\tdui\n2374B\tta\n2374C\tjin\n2374D\tbi\n2374E\tyan\n2374F\tgao\n23750\tpiao\n23751\tyu\n23752\tshe\n23755\tjian\n23757\thu\n2375A\tlie\n2375C\tbian\n2375D\tsu\n2375E\tjiao\n23778\tzhui\n2377D\than\n23787\tdun\n23790\txie\n23791\tmeng\n23792\tfu\n23793\tlu\n23794\ttan\n23797\tliu\n23798\txian\n23799\tsang\n2379C\tcou\n2379D\tzhuang\n2379F\tchen\n237B0\tlian\n237B4\tli\n237C0\tpeng\n237C1\ttuo\n237C4\ttuo\n237C6\tliao\n237C7\txiao\n237C8\tchui\n237C9\thuai\n237CA\tniao\n237CB\tqian\n237CC\tli\n237CF\tpao\n237D0\ttiao\n237D1\tliu\n237D2\twu\n237E4\tying\n237E6\tzha\n237F0\tyu\n237F2\txian\n237F3\txuan\n237F4\tshuan\n237F5\txi\n237F8\tmei\n237F9\tsen\n237FA\tlian\n237FC\tjiu\n237FD\tlao\n2380E\txiao\n2380F\tzou\n2381A\tliu\n2381C\tzhao\n2381E\tzhe\n23820\tlei\n2382D\tduan\n23837\tjian\n23838\tshuan\n23839\tzuo\n2383A\tqie\n2383C\tlao\n23849\tyu\n2384A\tyi\n2384B\tni\n2384E\tcen\n23855\tyan\n23857\truan\n2385E\tyan\n2385F\tdie\n23860\tmian\n23867\tlei\n23869\twan\n23870\tna\n23876\tyan\n2387A\tlei\n2387D\tsha\n2387E\thu\n23881\txi\n23882\txi\n23884\tyou\n23885\than\n23887\thai\n23889\twa\n2388A\txu\n2388B\tpi\n2388C\ttan\n2388D\txi\n2388E\txi\n2388F\tbin\n23890\tqin\n23891\txi\n23892\tyu\n23893\txi\n23895\tci\n23896\tqian\n23897\txia\n2389A\twa\n2389B\te\n2389C\tyou\n2389D\txing\n2389E\tni\n2389F\than\n238A0\tbi\n238A1\tsheng\n238A4\tzhan\n238A5\tdian\n238A6\tyu\n238A8\tou\n238AA\tgui\n238AB\twang\n238AC\tqian\n238AD\tyi\n238B0\tzu\n238B2\tqian\n238B3\tding\n238B4\tkeng\n238B6\tchu\n238B7\tyi\n238BA\than\n238BB\tkuan\n238C8\tdian\n238C9\txi\n238CA\tzi\n238CB\tling\n238CC\tzi\n238CE\tyu\n238CF\thun\n238D1\tsi\n238D2\tkan\n238DA\tan\n238DC\tyou\n238DD\tji\n238DE\thun\n238DF\tqia\n238E0\thou\n238E1\thou\n238E3\tdian\n238E9\txie\n238ED\tshe\n238EE\tsha\n238F2\txie\n238F3\tyao\n238F4\tda\n238F6\txie\n238F7\tchi\n238F8\tyou\n238F9\the\n238FA\tsha\n238FF\ttai\n23901\tzhu\n23903\tai\n23907\tque\n23908\tze\n2390A\tla\n2390B\tlou\n2390C\tchuai\n2390E\tyou\n23916\tti\n23918\tshi\n23921\txiao\n23922\txi\n23928\thuo\n23929\tchi\n2392A\tyi\n2392F\tshu\n23930\tyue\n23931\tchan\n23932\te\n23933\txi\n23934\txi\n23935\tying\n23936\tzu\n23937\tza\n2393A\tza\n23942\tta\n23943\twan\n23947\txin\n2394A\twang\n2394B\tfu\n23950\tlu\n2395E\tjian\n23961\tyan\n23963\tbi\n23964\tken\n23965\tguan\n23968\tzi\n2396E\tkui\n2396F\tzhou\n23970\tzhi\n23973\ttu\n23977\tta\n23979\tchu\n2397A\tcheng\n2397B\tcheng\n2397C\tzhu\n2397E\tda\n23987\tbi\n23989\tjia\n2398C\tyi\n2398F\tyue\n23990\tgang\n23996\tgan\n2399C\tqiao\n239A0\tchu\n239A1\tchu\n239A2\tbi\n239A6\tgui\n239A9\tgu\n239AA\tbing\n239AB\tyin\n239AC\tzhui\n239AD\tgu\n239AF\tli\n239B5\te\n239B6\tdai\n239BC\tcan\n239C2\tti\n239C3\tdu\n239C4\tyi\n239C8\tdie\n239CA\tniu\n239CC\txue\n239CD\tne\n239CE\tgui\n239CF\tkao\n239D2\tchuan\n239D6\tzha\n239D7\tyou\n239D9\tbai\n239DA\tshi\n239DB\tdian\n239DC\tpa\n239DD\tqiu\n239E1\txue\n239E3\tmo\n239E4\tke\n239E5\tyou\n239E6\tjiao\n239E7\tbo\n239EC\txiu\n239F2\tmi\n239F3\tluo\n239F5\txue\n239F7\tduo\n239F9\ter\n239FA\tshan\n239FC\tkui\n239FD\tnao\n239FE\tmian\n239FF\tli\n23A00\tluan\n23A02\tdie\n23A04\tqia\n23A05\tlei\n23A07\tmao\n23A09\theng\n23A0A\tche\n23A0B\tzhi\n23A0D\tgu\n23A0E\tcuo\n23A13\twu\n23A14\ttao\n23A17\txi\n23A18\tyao\n23A19\twei\n23A1B\tzu\n23A1C\tma\n23A1D\tyu\n23A1E\tpeng\n23A1F\tyi\n23A20\tqin\n23A21\tyue\n23A22\tjue\n23A23\tjiang\n23A24\txu\n23A25\tbeng\n23A2A\tluo\n23A2B\tzhui\n23A32\tdu\n23A33\txiang\n23A36\thui\n23A3A\tgu\n23A3B\tkao\n23A3C\tti\n23A3E\txing\n23A3F\thun\n23A40\tbian\n23A44\tke\n23A45\tkao\n23A48\tcuo\n23A4F\tlu\n23A51\tzui\n23A52\tzao\n23A53\tjiao\n23A54\tguan\n23A59\tyan\n23A5A\ter\n23A5C\tqing\n23A5F\tdeng\n23A60\tsi\n23A61\tsui\n23A62\tliao\n23A67\tshan\n23A69\tbi\n23A6A\twei\n23A6B\tye\n23A6D\tzhai\n23A6F\tye\n23A70\tdiao\n23A71\tai\n23A74\tjiang\n23A77\tsu\n23A79\thuai\n23A7A\tyu\n23A7D\trang\n23A80\tdian\n23A81\tzuan\n23A82\tban\n23A84\tqin\n23A87\tjia\n23A89\tpi\n23A8C\ttou\n23A90\tchou\n23A95\tgui\n23AA0\tji\n23AA8\txue\n23AAA\tdian\n23AAD\tbian\n23AAE\tzai\n23AAF\ttong\n23AB6\tshan\n23AB8\tgu\n23AB9\tque\n23AC0\tgu\n23AC8\thu\n23AC9\tkuai\n23ACC\tgou\n23ACE\tsu\n23AD0\tchou\n23AD2\tkeng\n23AD4\tdu\n23AD9\tyi\n23ADC\tdao\n23ADD\tqiang\n23AE3\tlong\n23AE5\tli\n23AE7\tli\n23AE8\tqing\n23AEA\twei\n23AEC\tmou\n23AF1\tqi\n23AF3\tjiang\n23AF4\txie\n23AF9\tdai\n23AFB\tlou\n23B02\tguan\n23B06\tpei\n23B09\tpi\n23B0B\tjuan\n23B0D\tbei\n23B0E\tjue\n23B0F\tjuan\n23B10\tshi\n23B15\txie\n23B18\trui\n23B19\tjing\n23B1A\tpo\n23B1B\tsan\n23B20\tji\n23B29\tfen\n23B2A\tbei\n23B2B\tjie\n23B2C\tsa\n23B2E\tpi\n23B34\tdi\n23B35\tmao\n23B36\tba\n23B37\tba\n23B38\ttiao\n23B39\tling\n23B3A\tsheng\n23B3B\tzhen\n23B3C\tpi\n23B3D\twu\n23B3F\tze\n23B40\tbao\n23B47\tlu\n23B56\thao\n23B57\tdou\n23B58\tfu\n23B59\tni\n23B5D\tge\n23B60\tru\n23B61\txian\n23B64\tbi\n23B6E\tmao\n23B72\trong\n23B73\tqiu\n23B77\tbo\n23B79\thao\n23B7A\tnao\n23B7B\tyan\n23B83\tpao\n23B84\tsui\n23B86\ttuo\n23B88\tqu\n23B89\tli\n23B8A\tde\n23B8C\tjie\n23B8D\tjie\n23B8E\tgun\n23B8F\tjian\n23B90\tbi\n23BA0\tsan\n23BA1\tbang\n23BA2\tchun\n23BA6\tnai\n23BA7\tbang\n23BAA\trong\n23BAB\tjia\n23BAC\tsou\n23BB0\tde\n23BBE\txian\n23BBF\tzhan\n23BC0\tmao\n23BC3\tzi\n23BC5\tji\n23BC6\tqi\n23BCB\tru\n23BCC\tsuo\n23BCD\trong\n23BCE\twu\n23BCF\trong\n23BD0\trong\n23BDA\tta\n23BDC\tsou\n23BE3\tmen\n23BE4\tli\n23BE7\tcui\n23BE8\tzong\n23BE9\tmen\n23BEA\txi\n23BEC\tmang\n23BED\tnie\n23BEF\tsui\n23BF1\tpei\n23BF4\tbi\n23BF5\tdi\n23BF6\tsan\n23BF8\tqu\n23BF9\tqiao\n23BFB\tfen\n23BFC\tsu\n23C03\txu\n23C07\trong\n23C08\tji\n23C0B\tqu\n23C0C\tlie\n23C15\tsao\n23C18\tkun\n23C1A\tcui\n23C1B\tye\n23C1C\tbing\n23C1E\tjie\n23C20\tqu\n23C21\tqu\n23C25\tmeng\n23C26\tran\n23C28\tbin\n23C29\tchao\n23C2C\tdu\n23C36\trang\n23C37\txian\n23C3A\ttao\n23C3B\tqu\n23C3C\tnie\n23C3F\tshu\n23C40\tlu\n23C42\tkun\n23C48\tmin\n23C49\tmin\n23C4D\tdan\n23C50\tyin\n23C53\txiao\n23C57\tji\n23C5C\tyin\n23C5D\tdong\n23C66\tfen\n23C67\tzhong\n23C6B\tgu\n23C71\tcha\n23C73\tliu\n23C76\tbu\n23C7A\tpa\n23C7B\tsi\n23C7C\tdao\n23C7D\tzhen\n23C80\tshan\n23C82\tchuai\n23C84\tjiu\n23C8A\tke\n23C8B\tchi\n23C91\thu\n23C92\tli\n23C93\tsha\n23C96\tpai\n23C97\twei\n23C98\twu\n23C9C\tying\n23CA1\tsha\n23CA2\tdi\n23CA5\tdan\n23CB1\ttu\n23CB2\the\n23CB3\tpo\n23CB5\tzhi\n23CB6\tniu\n23CB7\tni\n23CBD\trong\n23CBE\tguai\n23CC0\tzhi\n23CC3\tji\n23CC6\tping\n23CDC\tfan\n23CDF\tjie\n23CE0\thai\n23CE4\tzhan\n23CE6\txi\n23CE9\tzi\n23CEC\txi\n23CED\tpiao\n23CF0\tben\n23CF2\tjian\n23D13\tjian\n23D16\tza\n23D1E\tben\n23D1F\tmao\n23D22\tzao\n23D23\tzhuang\n23D25\tkuang\n23D28\tbi\n23D2A\tpai\n23D3C\tmao\n23D3D\ttan\n23D5E\ttun\n23D5F\tluo\n23D62\ttan\n23D71\tan\n23D77\than\n23D78\tzhu\n23D7A\tduo\n23D7B\tduo\n23D7C\tgan\n23D86\tqiong\n23D88\twang\n23D8A\tmo\n23D8B\tzhe\n23D8C\twen\n23D8D\tzhuang\n23D8F\tjie\n23D90\tpao\n23D98\tsu\n23D9D\tju\n23DA0\tqi\n23DA1\tcan\n23DA3\ttuan\n23DA4\tsha\n23DA6\ttuo\n23DA9\thua\n23DAB\tyi\n23DE0\tmin\n23DE1\tzhong\n23DE5\tshuo\n23DE9\tyi\n23DEA\twang\n23DEB\tao\n23DF6\tsu\n23DFE\tgui\n23DFF\ttuo\n23E00\thui\n23E03\txu\n23E04\tzan\n23E06\tzi\n23E07\tbian\n23E09\tda\n23E0A\tyin\n23E0B\tquan\n23E0E\thuai\n23E0F\tna\n23E10\tza\n23E12\tti\n23E18\tyi\n23E19\ttan\n23E1A\tshe\n23E1B\tshuo\n23E1D\txing\n23E20\tyou\n23E23\tfen\n23E47\tke\n23E4B\tfu\n23E52\tmin\n23E5A\tpi\n23E5C\tji\n23E5D\tqiao\n23E5E\tzhong\n23E5F\tgan\n23E60\tyuan\n23E61\tchi\n23E65\tqian\n23E67\tzuo\n23E69\txie\n23E6A\tmao\n23E6C\thu\n23E6E\tpi\n23E6F\txun\n23E71\txia\n23E72\tti\n23E75\tna\n23E76\tchua\n23E80\twu\n23EAC\thuang\n23EAD\txue\n23EAE\ttao\n23EB0\tqiao\n23EB3\tjiao\n23EBC\tdang\n23EBD\tbai\n23ECD\tdang\n23ECE\tkou\n23ED0\tju\n23ED1\tsha\n23ED2\tjing\n23ED5\tmo\n23ED6\tnou\n23ED8\tshuo\n23EDA\tshu\n23EDB\tzhuang\n23EDC\tfu\n23EDF\tzang\n23EE0\txie\n23EE1\tlang\n23EE2\ttong\n23EE9\tzhe\n23EEC\tcan\n23EEE\tyue\n23EF1\tzhou\n23F1A\ttan\n23F1E\tyan\n23F1F\tlu\n23F20\tyan\n23F26\tze\n23F27\tshuai\n23F45\tguo\n23F46\tzhu\n23F48\tru\n23F49\tru\n23F4C\tkan\n23F4D\tji\n23F4E\tgao\n23F52\txie\n23F55\tou\n23F56\tjian\n23F5A\tzhi\n23F5B\tzha\n23F5D\thong\n23F5F\tkuan\n23F61\tbo\n23F64\tse\n23F65\tan\n23F66\tjian\n23F68\tteng\n23F6B\tsong\n23F6D\tmeng\n23F6E\tyin\n23F6F\ttan\n23F70\tguo\n23F73\truan\n23F74\twei\n23F77\tsi\n23F8D\tlian\n23FA4\tqi\n23FA6\tzhang\n23FC5\tdong\n23FC6\tfu\n23FC7\tshen\n23FC8\tsu\n23FC9\tyi\n23FCA\tlian\n23FCC\the\n23FCE\tzhen\n23FD0\tze\n23FD2\tcui\n23FD3\tcui\n23FDD\tfeng\n23FDE\tli\n23FDF\tkou\n23FE3\txiao\n23FE4\tyou\n24003\thao\n24009\than\n2400A\tken\n2401D\tyu\n24023\thuan\n24024\tsuo\n24026\tla\n24028\tdou\n24029\tjian\n2402A\tpo\n2402B\tbian\n24030\txue\n24032\tbian\n24037\twei\n24061\tdan\n24062\tjie\n24063\tbai\n24065\tnian\n24066\txian\n24067\tse\n2406A\thua\n2406B\tchua\n2406E\tou\n2406F\tlie\n24070\tdi\n24071\tcai\n24073\tzha\n24075\tlu\n24079\thuo\n2407C\tli\n2407D\tying\n2407F\twei\n24080\tbi\n24081\tguo\n24083\tpi\n24086\tbiao\n240A0\tyan\n240A4\tzhuan\n240B2\thong\n240B6\tlin\n240B7\te\n240B9\tyin\n240BA\tlan\n240BC\tyao\n240BF\txuan\n240C0\tli\n240E8\tlan\n240E9\tling\n240EA\txi\n240EB\thong\n240ED\tjiao\n240EE\tzhuo\n240F2\tzhi\n240F5\tbo\n240F6\tteng\n240F7\tan\n240FA\txun\n240FB\tlei\n240FC\tzang\n240FD\thui\n2410E\txi\n2410F\thong\n24111\tfan\n24112\tjian\n24113\tcong\n24114\tza\n24116\tca\n24118\tyou\n2411B\tdui\n2411C\tpan\n24125\tta\n24127\tpan\n2412B\tfan\n2412C\txi\n24136\tyao\n24137\tluo\n2413A\tbian\n2413C\tjin\n2413D\tli\n2414A\tyan\n2414B\tdou\n2414E\tman\n24150\tgong\n24151\trang\n24152\tcan\n24163\tmen\n24171\tgu\n24172\tshuan\n24178\tyan\n24179\tbi\n24180\tbiao\n24181\tcheng\n24182\tkui\n24184\thuo\n2418D\tchi\n2418F\two\n24191\tcou\n24192\tzhi\n24199\tshui\n2419C\tgua\n2419D\tpu\n2419E\txu\n2419F\tsi\n241A1\twu\n241A2\tlun\n241AE\tfu\n241B0\tshi\n241B3\thui\n241B4\thuang\n241B5\tpa\n241BC\tzhu\n241BE\tyi\n241C3\tli\n241C4\tshan\n241DC\tmin\n241DE\tge\n241E0\thu\n241ED\tlong\n241EF\ten\n241F0\tfa\n241F3\txu\n241F4\tyi\n241FE\tying\n24214\tchi\n24219\tyi\n24225\tdi\n24226\thui\n24227\the\n24229\tzha\n24236\tyun\n24237\txian\n2424C\txian\n2424D\tlao\n2424E\tshao\n2424F\tshi\n24250\tzhuo\n24264\tbie\n24265\tjiu\n24266\two\n24267\tjiao\n24268\tfu\n2426A\txiang\n2426B\tkai\n242B2\tnao\n242B4\thuo\n242B5\tji\n242B6\tla\n242BB\tfou\n242BC\tshan\n242BD\tliao\n242BE\tmie\n242BF\tche\n242C2\tmo\n242CF\tlou\n242E8\tduo\n242EB\tnao\n242ED\tji\n242F0\tzhu\n24302\tsu\n24303\tduo\n24307\tjiong\n2430A\tzai\n2430B\thui\n2430C\tying\n2430D\thu\n2430E\tlin\n2430F\tweng\n24310\than\n24314\tnan\n24337\txi\n24339\tgan\n2433E\the\n2433F\tji\n24340\txiang\n24341\tsha\n24350\ttui\n24352\tzhao\n24353\tshu\n24355\tyou\n24356\tjian\n2435C\tzao\n24360\tre\n24364\tzhang\n2437D\truo\n24384\tyan\n2438B\tcui\n24397\tji\n24398\tshang\n243A3\te\n243A4\tlao\n243A5\ttan\n243A7\tzhu\n243AD\tlin\n243AF\tzeng\n243B1\tjuan\n243B2\thu\n243BB\txiao\n243D7\tshen\n243D8\thuo\n243DC\tkui\n243F1\tchu\n243F2\tzhou\n243F6\tao\n243F8\tzhuo\n243FD\txing\n243FF\tmie\n24400\thu\n24414\ttan\n24419\tbi\n24423\tding\n24429\tkai\n2442B\tbiao\n24430\thuo\n24431\tlie\n24432\tcuan\n24443\txian\n24444\tre\n24453\tyue\n24455\txun\n24457\tliao\n24463\tsha\n24466\tshi\n2446A\txie\n24473\txiao\n24477\tye\n24478\tlan\n24479\tyi\n2447F\tlian\n24494\tbo\n24495\tcao\n2449D\tyao\n244A6\tlian\n244BB\tta\n244D1\tji\n244D4\txi\n244D5\tzhi\n244DA\txi\n244DD\tyue\n244E4\txian\n244E6\tzhuo\n244EF\tzhang\n244F5\tzu\n244F7\tna\n244FE\tdao\n244FF\tlie\n24500\tna\n24509\tpao\n2450B\tju\n24514\tluan\n24516\tluo\n24519\tshua\n2451A\tshang\n2451D\tluo\n2451F\tfen\n24523\tbao\n24528\tli\n2452B\txiong\n24536\tdang\n24540\tcheng\n24544\tzhang\n24547\tsou\n2454A\tshen\n24552\tge\n24558\tyu\n2455A\thui\n2455B\tche\n2455D\tjiao\n2455E\tzhu\n2455F\tshu\n24562\txiao\n24566\tning\n2456D\tjiang\n2456F\tjiang\n24577\tdiao\n2457D\tqiang\n2457E\tqiu\n24580\tfeng\n24586\tzhan\n24587\tke\n24592\tdie\n24593\tze\n24596\tguang\n24597\tse\n24598\tfen\n2459B\tjiang\n2459D\tyan\n2459E\tzhi\n245A2\tli\n245A6\tling\n245AA\tyi\n245AC\tqu\n245AD\tpan\n245AE\tgou\n245B0\tjia\n245B1\the\n245B3\tpeng\n245B5\tju\n245B7\tche\n245BA\tlie\n245BB\tshi\n245BC\tpo\n245BD\txiang\n245BF\tpi\n245C0\tluo\n245C1\tcu\n245C3\tyu\n245C7\tkong\n245C8\txie\n245CD\twan\n245CE\tyan\n245CF\tpei\n245D3\tcheng\n245D8\tti\n245D9\tche\n245DA\tbi\n245DB\tlian\n245DC\tjia\n245DE\tting\n245E2\tti\n245E8\tdie\n245EA\tshu\n245EB\tli\n245EC\tlu\n245ED\txia\n245EF\tcui\n245F3\tbo\n245F4\ttui\n245F5\tpu\n245F7\tlin\n245F8\tfen\n245FA\tbo\n245FB\tchan\n245FE\tdang\n245FF\ttai\n24600\tdao\n24603\tli\n24605\tya\n24606\tya\n24607\tzhan\n2460A\tyi\n2460C\tqi\n24614\thu\n24616\tting\n24618\tkou\n2461B\tchun\n2461C\tyou\n2461D\tfen\n2461F\tnuo\n24620\ttian\n24621\tjin\n24622\tpi\n24623\tchen\n24624\tpi\n24626\tjie\n24627\tgui\n24632\tzhuang\n24635\thu\n24636\tchou\n24637\tshu\n24638\ttao\n24639\tpi\n2463A\trong\n2463B\trong\n2463D\thou\n2463E\tpeng\n24645\tbai\n24647\txia\n2464B\tqin\n2464C\tni\n2464E\ttao\n2464F\tqu\n24652\txie\n24654\tzhao\n24655\thua\n24656\txin\n24658\tshou\n2465B\ttu\n2465D\tliang\n2465E\tbi\n2465F\tchu\n24661\txing\n24663\txin\n24664\tfu\n24669\tjie\n2466D\tfu\n2466F\tlao\n24670\tte\n24671\tshe\n24674\tchao\n24675\tchui\n2467C\tran\n2467D\thou\n2467E\tbeng\n24680\tcai\n24685\tmu\n24689\txu\n2468A\tdie\n2468D\tchan\n2468E\tyu\n2468F\tzhong\n24693\tli\n24694\tshou\n2469A\tdu\n2469C\tmao\n2469D\thuang\n2469F\ttao\n246A1\tdu\n246A2\tti\n246A3\tsheng\n246A4\tmei\n246A8\tzhen\n246A9\tqin\n246AA\tpi\n246AB\ttang\n246AC\tcang\n246AD\tyao\n246AF\txiu\n246B0\tbang\n246B1\tgu\n246B5\tbu\n246BC\tgou\n246BD\tbo\n246C1\twen\n246C4\tji\n246CA\tla\n246CD\tcui\n246CE\tmin\n246CF\tcu\n246D0\tou\n246D1\tyong\n246D6\tmao\n246D7\tke\n246D8\tmang\n246D9\tding\n246DA\thuan\n246DB\tduo\n246DC\tjiang\n246DD\tsu\n246E2\tceng\n246E3\tta\n246E5\thuang\n246E6\tjue\n246E7\txun\n246EA\txiong\n246EC\tmi\n246ED\tqun\n246EE\tlao\n246F1\tzhi\n246F2\twei\n246F7\tse\n246FB\tzang\n24701\tan\n24702\twei\n24704\thuai\n24707\tzhan\n24709\tying\n2470A\tge\n2470B\thui\n2470D\tquan\n24713\tlie\n24714\tju\n24715\tba\n24716\tlei\n24718\tman\n24719\tling\n2471C\tli\n2471D\tji\n24721\thui\n24722\txin\n24723\tshi\n24724\tzhe\n24727\tbo\n2472B\tcha\n2472F\tcha\n24730\tjing\n24731\tba\n24732\tbei\n24735\tyan\n24737\thu\n24739\tyu\n2473B\tbi\n2473C\tchuan\n2473E\tji\n24742\tmu\n24744\tmao\n24745\tzhong\n24747\tye\n24748\tdou\n24749\tye\n2474D\tri\n2474E\tyin\n24750\thao\n24752\tna\n24753\ttie\n24754\tfu\n24755\tmu\n24756\tzai\n24758\thu\n2475A\tchen\n2475B\ttuo\n2475E\tchu\n2475F\tfu\n24762\tze\n24767\tbao\n2476C\tdi\n2476D\tcai\n2476E\tlu\n2476F\tpo\n24770\tda\n24771\tye\n24773\tyi\n24777\txiang\n24778\tbi\n24779\tzhu\n2477B\tyi\n2477D\tlu\n2477F\tkuang\n24782\tzhi\n24783\thui\n24787\twa\n24788\tdi\n24789\tshu\n2478A\tlie\n2478B\tzao\n2478C\tzhi\n2478D\tnao\n24797\tchai\n2479A\txiao\n2479B\tzang\n2479E\tyu\n2479F\tdou\n247A0\tcha\n247A1\txie\n247A2\tyang\n247A4\txian\n247A5\tbao\n247AE\tzhai\n247B0\tqiu\n247B2\thu\n247B3\tzai\n247B4\tjue\n247B6\than\n247BF\tan\n247C0\tzao\n247C3\tsha\n247C5\txian\n247C6\tchi\n247C7\tyan\n247C9\tan\n247CD\tzhe\n247CE\tjue\n247D1\tli\n247D3\tle\n247D6\tcai\n247D8\tlu\n247DA\tjia\n247DD\txia\n247DE\txiao\n247DF\tyan\n247E0\txu\n247E2\tdun\n247E3\tying\n247E4\thui\n247E5\tti\n247E6\tnou\n247E7\txi\n247EA\ttu\n247F7\twai\n247F8\tchen\n247FC\thong\n247FE\tti\n247FF\txuan\n24800\tza\n24807\tge\n2480B\tlou\n2480C\tchai\n2480D\tpan\n2480E\tji\n24810\tta\n24813\txi\n24816\txiao\n24818\tsao\n24819\tjia\n2481A\tsu\n2481B\thuang\n2481D\tcuo\n2481F\tta\n24820\tshuai\n2482A\tfu\n2482B\tli\n2482D\tshe\n2482F\ttang\n24836\tdian\n2483A\tbi\n2483C\tgou\n2483D\tcu\n2483F\tqian\n24842\tlei\n24843\tsu\n24846\tzong\n24847\thao\n2484F\tchi\n24850\tcao\n24853\two\n24854\txiao\n24855\tlie\n24856\tyan\n2485D\tbi\n2485F\thuan\n24861\txi\n24862\tchi\n24863\txu\n24864\tnao\n24865\tyan\n24867\txie\n24868\tzha\n2486A\tsui\n2486C\txi\n2486D\tbeng\n2486E\tran\n2486F\tshuo\n24870\tban\n24871\tgui\n24872\tkai\n24873\tchen\n24876\txu\n2487E\te\n2487F\tli\n24880\txi\n24881\thuan\n24882\tsu\n24884\tchang\n2488A\tlu\n2488B\tyan\n2488E\tdang\n2488F\tdan\n24890\tyang\n24892\tzhai\n24893\tju\n24895\tduo\n24896\tsao\n24897\tlai\n24898\tsu\n2489F\tze\n248A3\tbi\n248A6\tyin\n248A8\thao\n248AA\tlie\n248AD\thao\n248AE\tyang\n248B4\tshuo\n248B5\tai\n248B6\tqiong\n248B9\tlei\n248BA\txie\n248BC\tshi\n248C3\tlu\n248C5\tque\n248C6\tlian\n248CC\txiao\n248CE\tying\n248D1\txie\n248D8\tling\n248D9\tyou\n248DE\tdang\n248DF\tlan\n248E0\txiao\n248E8\tyi\n248EC\twu\n248EE\tyi\n248EF\ttuo\n248F0\tbu\n248F2\txin\n248F5\tsi\n248F6\tjin\n248F8\tba\n248F9\tfa\n248FB\tmo\n248FC\truo\n2490A\tda\n2490B\tji\n24910\tsu\n24911\tqiong\n24912\tba\n24926\ttian\n24927\tyou\n24929\ttuo\n2492B\twai\n2492C\tyou\n2492E\tdong\n24931\txi\n24932\tkong\n24936\tqiong\n24937\tdui\n24938\tduo\n2493A\tyi\n24952\txi\n24953\tqin\n24954\tsu\n24957\tliu\n24959\twan\n2496D\tche\n2496E\tzhu\n24970\tmao\n24977\tquan\n2497D\tyu\n2497F\tyi\n24980\tmi\n24983\tlai\n24984\tzhi\n249A4\tni\n249A6\tban\n249AA\tdong\n249AE\tzhi\n249D5\tyi\n249D8\tling\n249D9\tyu\n249DA\tcong\n249DB\tdi\n249DC\tzhi\n249E0\truan\n249E3\tjian\n249E9\twan\n249EB\tjin\n249ED\tpang\n24A0D\tlu\n24A0E\tqu\n24A10\txi\n24A11\tda\n24A16\thu\n24A17\tluo\n24A19\tle\n24A36\tgong\n24A3B\tling\n24A42\tlao\n24A44\tzhuan\n24A68\tzao\n24A69\thao\n24A6A\txiang\n24A6D\thao\n24A6E\tli\n24A71\tdian\n24A72\tge\n24A7D\thuan\n24A84\te\n24A86\txia\n24A8B\tjian\n24A8C\tqi\n24A8D\txia\n24A8E\tyou\n24AA1\tzheng\n24AAA\tzhuan\n24AAE\tchan\n24AC9\txie\n24AD5\tnao\n24ADD\tji\n24ADE\ttian\n24AE3\tyan\n24AE7\thao\n24AE8\txin\n24AE9\tling\n24AEB\tban\n24AEC\tbeng\n24AF1\tgou\n24AF2\tling\n24AF5\tkuo\n24AF6\tqia\n24AF7\tjiao\n24AF9\ten\n24AFA\tyao\n24AFB\tdu\n24B01\thuo\n24B02\tdu\n24B03\tpei\n24B0C\tyuan\n24B0F\tlou\n24B10\txing\n24B13\tlian\n24B14\tyao\n24B15\txi\n24B16\tyao\n24B18\txi\n24B1B\tlu\n24B1D\tyan\n24B20\tquan\n24B25\trang\n24B26\twa\n24B27\tzu\n24B28\tfan\n24B29\tyi\n24B2A\tdu\n24B2B\tsui\n24B2D\tpi\n24B2F\than\n24B31\txu\n24B33\tgong\n24B35\tdi\n24B37\tna\n24B3E\tduo\n24B3F\twa\n24B42\tnie\n24B48\tdiao\n24B49\thuang\n24B4C\tti\n24B4D\tfan\n24B51\twu\n24B52\tang\n24B54\tping\n24B59\than\n24B5B\tgang\n24B5C\tli\n24B5E\tdun\n24B5F\tfu\n24B60\tna\n24B62\tcei\n24B67\tjie\n24B69\tqing\n24B6B\tying\n24B6C\txiang\n24B71\thu\n24B74\tsu\n24B7B\tge\n24B7C\te\n24B7D\txu\n24B86\txi\n24B8A\tkang\n24B8B\tguo\n24B8C\tjie\n24B8D\tchuan\n24B8E\tlei\n24B8F\theng\n24B90\tzun\n24B95\tpie\n24B98\tdeng\n24B99\txi\n24B9A\tlei\n24B9C\tshan\n24BA7\tlu\n24BA9\tdui\n24BAA\tjun\n24BAD\tchan\n24BAF\txie\n24BB0\twa\n24BB1\tzhe\n24BB3\tzhuan\n24BB7\tliu\n24BB8\tlei\n24BBC\tdai\n24BBD\tgan\n24BC4\tshi\n24BC7\tyan\n24BCC\tgan\n24BD0\tyan\n24BD6\tsui\n24BDA\tzhong\n24BDC\tshi\n24BE1\tsheng\n24BE5\tchan\n24BF7\thuang\n24BF8\tyin\n24BFB\tmeng\n24C02\trang\n24C05\txiang\n24C08\tbei\n24C0C\tchuan\n24C11\tpu\n24C19\tke\n24C1A\tla\n24C1D\tquan\n24C1F\thang\n24C20\tchi\n24C21\tmang\n24C26\tzha\n24C2A\tfen\n24C2C\tchao\n24C33\tjing\n24C43\tlie\n24C45\tna\n24C46\tna\n24C47\ttong\n24C4B\tran\n24C4C\tzu\n24C4D\tpi\n24C4E\tyou\n24C50\tshu\n24C5B\tlie\n24C5C\tshou\n24C5D\ttuan\n24C5F\tgao\n24C60\tshao\n24C61\ttuo\n24C63\tnan\n24C67\ttuo\n24C68\tgong\n24C69\tdiao\n24C74\tmeng\n24C75\tbang\n24C77\txie\n24C78\tsi\n24C79\tting\n24C7A\tgui\n24C7D\tfu\n24C7E\tgui\n24C89\tgui\n24C91\tzhu\n24C93\tlai\n24C95\tlun\n24C96\ttian\n24C97\tran\n24C9A\tdong\n24CA8\tjuan\n24CA9\tyan\n24CAC\truan\n24CAD\tdan\n24CB0\tmao\n24CB6\tluan\n24CB8\txu\n24CBA\txi\n24CC2\tma\n24CC3\tqi\n24CC5\tcha\n24CC8\tshang\n24CC9\than\n24CCA\tping\n24CCE\tji\n24CD3\tli\n24CD5\tyu\n24CD6\tban\n24CD8\tteng\n24CDD\tchou\n24CE0\tchou\n24CE4\tqi\n24CE5\txi\n24CE6\tbei\n24CEA\tye\n24CED\tguang\n24CEF\tzhu\n24CF3\tlei\n24CF4\tlei\n24CF5\tcha\n24D00\tguang\n24D0D\tdie\n24D13\tya\n24D18\tnie\n24D19\tshu\n24D1B\tzhi\n24D1F\tzhi\n24D22\tzhi\n24D23\tpi\n24D25\tjiu\n24D26\tjiu\n24D27\tyi\n24D28\tyou\n24D2A\tjiu\n24D2F\thuan\n24D31\tdu\n24D3B\ttao\n24D3C\tqie\n24D3D\tqin\n24D3E\txin\n24D3F\tchan\n24D40\tji\n24D42\tqin\n24D4A\tdu\n24D4B\tzhi\n24D4E\tou\n24D50\twu\n24D52\twen\n24D58\tbi\n24D5B\tbei\n24D5D\tmu\n24D5E\tjin\n24D5F\ttao\n24D60\tliao\n24D65\tcao\n24D66\tzha\n24D6C\tchi\n24D6D\tya\n24D6E\tkui\n24D6F\tyin\n24D78\tlong\n24D79\tqia\n24D7B\thang\n24D7C\tshang\n24D7D\thai\n24D7E\tcha\n24D80\tjiao\n24D81\tlao\n24D88\txi\n24D8A\tgui\n24D8B\tbo\n24D93\tzhi\n24D95\ttun\n24D96\tfu\n24D98\thu\n24D9A\tnie\n24D9B\tyi\n24D9C\tzhuang\n24DA0\tcha\n24DA4\tsuan\n24DA7\tyun\n24DAE\tdu\n24DB0\txi\n24DB1\tchuan\n24DB2\txing\n24DB3\tjiao\n24DB4\tshen\n24DC0\twang\n24DC1\tbei\n24DC2\tfei\n24DC3\tjian\n24DC4\tquan\n24DC5\tyi\n24DC6\tdong\n24DC7\txu\n24DC8\tna\n24DC9\tji\n24DCC\tzhen\n24DCD\tqi\n24DCE\tdui\n24DCF\tyin\n24DD1\tjiu\n24DD2\tpi\n24DD3\txin\n24DD4\tlun\n24DD5\tcai\n24DD6\tling\n24DD7\tbie\n24DD8\tdao\n24DD9\tde\n24DDF\tla\n24DE1\txi\n24DE2\tju\n24DE4\txiao\n24DE6\tjing\n24DF9\twai\n24DFB\tnao\n24DFC\txiang\n24DFD\tque\n24DFE\tqie\n24DFF\ttu\n24E00\txu\n24E01\thui\n24E05\tmin\n24E06\twei\n24E08\tyou\n24E09\ttui\n24E0A\tdai\n24E0E\tke\n24E0F\tna\n24E11\tfu\n24E12\tyu\n24E13\tzhi\n24E15\than\n24E16\tai\n24E17\tfu\n24E21\tyang\n24E24\tshi\n24E26\tchan\n24E2A\tchi\n24E2B\tyun\n24E2C\tshuai\n24E2E\tsu\n24E2F\tsang\n24E31\te\n24E32\tzheng\n24E33\tai\n24E34\tsuo\n24E35\tbu\n24E37\tqun\n24E38\tyi\n24E39\tyan\n24E3B\tna\n24E3C\twu\n24E47\tli\n24E48\tli\n24E4A\txi\n24E4B\tjue\n24E4C\tshi\n24E4E\tya\n24E5B\tchen\n24E5C\tying\n24E5D\tbi\n24E5E\tche\n24E61\tzha\n24E62\ttuo\n24E63\thu\n24E64\tteng\n24E65\tying\n24E66\tbi\n24E67\tning\n24E68\tlian\n24E69\txin\n24E6A\tyu\n24E72\tbei\n24E74\tmo\n24E75\tdui\n24E77\tdao\n24E78\tqi\n24E7A\tkai\n24E80\tshuai\n24E83\txiao\n24E84\tzhong\n24E85\tzhui\n24E87\tbian\n24E89\twei\n24E8A\txi\n24E8C\tdeng\n24E8E\txie\n24E8F\tpan\n24E90\tnie\n24E93\tbie\n24E94\tshe\n24E95\tfei\n24E96\tmin\n24E97\tqi\n24EAA\tshan\n24EAB\tsuo\n24EB7\tji\n24EBA\tdan\n24EBB\tjuan\n24EBC\tlu\n24EBE\tao\n24EC2\tyi\n24EC3\tshu\n24EC4\tsui\n24EC5\twei\n24EC6\twan\n24EC7\tchu\n24ECA\ttui\n24ECC\two\n24ED6\tbi\n24ED8\tyin\n24ED9\thuo\n24EDC\tkai\n24EDD\tning\n24EE2\tai\n24EE4\tli\n24EE6\tzhai\n24EF1\tlu\n24EF6\tbian\n24EF7\tpan\n24EFF\tgui\n24F00\tsu\n24F01\tmeng\n24F02\txian\n24F03\tlong\n24F05\tqi\n24F0B\tchan\n24F0C\tyi\n24F0D\thang\n24F0F\tlian\n24F10\tguan\n24F12\twei\n24F17\tjue\n24F18\tlei\n24F19\tluan\n24F1A\tli\n24F1C\tpi\n24F22\thuan\n24F2E\tgui\n24F33\tju\n24F36\tdeng\n24F3A\tfei\n24F41\tzhi\n24F43\tmei\n24F45\thuan\n24F49\tpa\n24F4A\tbi\n24F4C\tpo\n24F53\ter\n24F55\thuan\n24F63\tchang\n24F65\tluo\n24F66\tfou\n24F6F\tchou\n24F71\tzu\n24F72\tnan\n24F73\txiao\n24F79\tbai\n24F7A\tlu\n24F7C\tluo\n24F7F\tnian\n24F80\tze\n24F84\tzhu\n24F85\thu\n24F88\thui\n24F89\ttang\n24F8A\tchou\n24F91\thuang\n24F92\tdou\n24F9B\tmiao\n24F9D\tbo\n24FA0\tdi\n24FA2\tdeng\n24FA3\tpu\n24FA5\tsong\n24FA6\tchou\n24FAB\tyao\n24FAC\tmeng\n24FAD\tlong\n24FB2\tlian\n24FB5\tbie\n24FBA\tlu\n24FBF\tse\n24FC0\tzuo\n24FC4\tcun\n24FC5\tling\n24FC6\tzheng\n24FC7\tpi\n24FC8\tbao\n24FCB\tque\n24FCE\tpi\n24FCF\tnan\n24FD0\tpi\n24FD1\tbo\n24FD2\tbei\n24FD3\tfa\n24FD5\tmin\n24FD6\tmo\n24FD7\twa\n24FD8\tzhao\n24FD9\tzhi\n24FDA\tcu\n24FDF\txun\n24FE0\tji\n24FE1\tgui\n24FE3\tcheng\n24FE7\than\n24FE8\txiao\n24FE9\tque\n24FEB\tchuo\n24FED\tfu\n24FF2\tfu\n24FF3\tqin\n24FF4\tlu\n24FF5\tque\n24FF6\tdian\n24FF7\tqian\n24FFC\tchang\n24FFD\tta\n24FFE\tbei\n25001\tdu\n25002\tbeng\n25003\thou\n25008\tzha\n25009\tzha\n2500E\tque\n2500F\tma\n25010\than\n25013\tliu\n25014\tlu\n25016\tzi\n25018\tpi\n25019\tzhou\n2501B\tzao\n2501D\tniu\n25020\thui\n25023\txue\n25025\tla\n2502B\tnou\n2502C\tyan\n2502D\tran\n2502E\tnao\n25030\tla\n25031\tguang\n25032\tdu\n25035\tlu\n25039\tjian\n2503A\txie\n2503B\tqi\n2503E\txiang\n25041\tguo\n25042\tjie\n25043\tmang\n25046\txia\n25047\tkui\n2504E\tyong\n25050\thai\n25051\tmi\n25052\tyao\n25055\twen\n2505F\tli\n25060\tjuan\n25061\twu\n25062\tqiao\n2506E\tdiao\n2506F\tchu\n25072\tsuo\n25075\tchong\n25078\tquan\n25079\tshe\n25081\tyan\n25082\tmeng\n25083\tju\n2508B\ttu\n25092\tnong\n25093\tmo\n25099\tfen\n250A2\tao\n250A3\tguo\n250A4\thu\n250A5\tcan\n250A6\tdun\n250A7\thai\n250A8\tjiao\n250B0\tgu\n250B5\tjin\n250B8\tyang\n250C0\tcha\n250CC\thui\n250D4\tqu\n250D5\tke\n250DF\tqing\n250E0\tyi\n250E3\tkai\n250E4\tjiao\n250E7\tchou\n250E8\tbu\n250E9\tgen\n250EA\tjiao\n250EB\tzhi\n250EE\twen\n250F0\tbin\n250F4\txiong\n250F5\tfan\n250F8\tyi\n250F9\tchuan\n250FA\tyao\n250FD\tyang\n250FE\tdu\n250FF\tyan\n25101\tmeng\n25107\tchi\n25108\tmu\n25109\tjiao\n2510B\tnu\n2510D\tguo\n2510E\txue\n25111\tfu\n25112\txue\n25113\tfu\n25114\tpei\n25115\tmo\n25116\txi\n25117\two\n25118\tshan\n2511B\txi\n2511C\tqi\n2511D\tmian\n25126\tdan\n25128\tchou\n25131\tfei\n25132\tmie\n25134\txue\n25135\txu\n25136\tsi\n25137\tju\n25138\tmao\n25139\tbao\n2513B\tyi\n2513C\tgua\n2513D\tni\n2513F\tyi\n25141\tzuo\n25144\tnu\n25151\tdian\n25152\tfan\n25153\tyi\n25154\tshi\n25157\tcu\n25158\tzhen\n2515E\tshi\n2515F\tjiao\n25160\thou\n25161\ter\n25166\tlei\n25167\txue\n25168\tgeng\n2516A\tshou\n2516C\tjuan\n25174\tjie\n25175\twei\n25177\tshou\n25178\tjing\n2517A\txu\n2517B\tchong\n25185\tjiang\n25186\tmou\n25189\tyu\n2518C\tjue\n25191\tting\n25194\txiao\n25196\tdou\n25198\tguo\n25199\tmang\n2519A\twang\n2519B\txu\n2519C\twang\n2519D\tsuo\n2519E\tjuan\n2519F\tyue\n251A1\than\n251A3\tshen\n251A5\txie\n251A6\tliu\n251A7\trun\n251AF\tbi\n251B2\tnao\n251B6\twan\n251B7\tjiu\n251B8\tque\n251C4\tni\n251C6\tmi\n251C7\tsuo\n251C9\tqiang\n251CC\than\n251CD\tzhuo\n251CE\tmi\n251CF\txu\n251D1\tlang\n251D2\tjie\n251D3\tding\n251D4\tchang\n251D5\tzhi\n251D6\tfei\n251D7\tjia\n251D8\tjun\n251D9\thuo\n251DA\tqi\n251DB\tju\n251DC\tzhun\n251DE\tdian\n251DF\tjiao\n251E0\tya\n251E2\tzhan\n251ED\tzhi\n251EF\tmai\n251F0\thu\n251F1\txie\n251F2\tshi\n251F3\tgui\n251FF\txu\n25202\tji\n25204\tchuang\n25206\tmao\n25207\truan\n25208\txu\n25209\thuan\n2520A\tsha\n2520B\tju\n2520F\tkuang\n25211\thou\n25212\tguan\n25213\tgua\n25215\tmi\n25216\tdie\n25217\tbi\n25218\tliang\n25219\tla\n2521A\tshan\n2521B\tlu\n2521C\txi\n2521F\tsou\n2522C\tou\n2522E\tleng\n25237\tku\n25238\tgui\n2523B\txi\n2523C\tpan\n2523D\tse\n2523E\tjue\n2523F\thong\n25240\tguan\n25241\tju\n25243\tnai\n25244\thua\n25245\tge\n25246\tli\n25247\tgou\n25248\tti\n2524A\tma\n2524B\tteng\n2524C\tda\n25250\tqi\n25251\tyu\n25252\tjiao\n25253\tmie\n25254\tgeng\n25255\tmeng\n25256\twei\n25258\tti\n25259\tqi\n2525C\tchen\n2525D\tdou\n2525F\tpan\n25270\than\n25274\tmi\n25275\tma\n25276\tlu\n25277\tqi\n25278\tkeng\n2527A\tdie\n2527B\tqi\n2527C\tjiao\n2527D\tkang\n2527E\tqiao\n2527F\tmi\n25280\tshan\n25287\tjian\n25288\tli\n25289\tke\n2528A\txu\n25291\tman\n25292\tfeng\n25293\tchan\n25294\thui\n252A7\tkou\n252AA\twei\n252AB\tguan\n252AC\tji\n252AD\tzun\n252AE\thuo\n252AF\txie\n252B4\tsui\n252B6\truan\n252B8\tte\n252BC\tzheng\n252BD\tkun\n252BE\txiang\n252BF\tmian\n252C1\txi\n252CC\tsa\n252D9\te\n252DA\tmie\n252DB\tzhu\n252DC\tzou\n252DD\tmeng\n252DF\txi\n252E1\ttang\n252E3\tjia\n252E4\tchang\n252E5\tji\n252EE\tzhuo\n252FF\the\n25300\tcha\n25301\tqi\n25302\tmian\n25303\tzhen\n25304\tku\n25305\tye\n25306\tzhou\n25308\tjian\n2530A\tpan\n2530D\thui\n2530F\tming\n25310\tliu\n25318\tshui\n2531A\tmai\n2531B\tli\n2531E\tshuo\n2531F\tyi\n25324\tli\n25328\txie\n25329\tte\n2532A\txiu\n2532D\txuan\n2532E\tli\n2532F\tmeng\n25330\twei\n25331\tmeng\n2533A\tyao\n2533B\tlan\n2533C\tling\n2533D\tying\n2533E\tying\n2533F\tli\n25340\tjian\n25341\tgui\n25345\tguan\n25346\txie\n25349\tshe\n2534B\tzui\n25353\tkan\n25354\tlei\n2535A\tbian\n2535D\tshu\n2535E\tnu\n2535F\txu\n25363\thao\n25368\tgui\n2536A\tzhai\n2536B\tlang\n2536C\tcuan\n2536D\tzhi\n2536E\tfeng\n2536F\tqin\n25371\tze\n25372\tna\n25373\tniu\n25374\tyi\n25377\tcong\n25378\tshi\n25379\tjian\n2537A\tzong\n2537B\tyan\n2537C\tying\n25380\truan\n25382\trong\n25383\txi\n25385\tguan\n25386\tkai\n25388\twu\n2538A\tqin\n2538B\tcong\n2538D\tze\n2538E\txie\n25390\tyu\n25391\tzan\n25392\tchuang\n25393\tli\n25394\tli\n25395\txu\n25396\tmi\n25397\txu\n25398\truan\n2539B\tgui\n2539C\trong\n2539D\tzuan\n2539F\tmao\n253A1\tqin\n253A2\tcuan\n253A3\tcuan\n253A4\tcuan\n253AE\twu\n253B0\tfa\n253B1\tba\n253B8\tqia\n253B9\tzhi\n253BA\ttiao\n253C4\tzhi\n253C5\tzhi\n253C7\thuan\n253C8\tchou\n253CA\tzhi\n253CE\tying\n253D2\twu\n253D3\tbei\n253D5\thong\n253D6\tshen\n253D8\tjue\n253D9\tkui\n253DC\tyi\n253DD\tya\n253E0\tbi\n253E4\tkua\n253E5\tqian\n253E8\tzhao\n253EA\tkai\n253EB\tshang\n253EE\tan\n253EF\tzhe\n253F0\tzhi\n253F7\tzhi\n253F9\tjiao\n25400\tsi\n25401\tpu\n25402\tou\n2540A\tzhuo\n25411\tying\n25413\thuan\n25415\tya\n25418\tshi\n25419\tpa\n2541A\tpu\n2541E\tmang\n2541F\tchai\n25429\tyun\n2542C\tgu\n25439\tdan\n2543B\tnao\n2543D\tzhe\n2543F\thu\n25445\tkeng\n25447\tdie\n25448\tting\n2544B\tguai\n2544E\tqiong\n2544F\tshi\n25450\tjia\n25451\tao\n25452\tna\n25453\tpin\n25454\tjia\n25461\tzhe\n25462\tbu\n25463\two\n25465\tcha\n2546A\tnao\n2546B\tkan\n2546F\tdu\n25470\tguai\n25471\tqiong\n25473\trong\n25474\tyi\n25475\tdui\n25476\tlei\n25478\tzhou\n25479\tkua\n2547A\te\n2547B\txian\n2547C\tdian\n2547D\tnuo\n2547E\te\n2547F\tyong\n25480\twu\n25481\tkeng\n25493\tzhi\n25497\tzhi\n25498\txun\n2549B\tzheng\n2549E\tyang\n254A0\thuo\n254A1\tji\n254A2\tnao\n254A7\tya\n254A8\tlu\n254AB\tfu\n254AC\tsan\n254AD\tchu\n254AE\twei\n254B0\tfu\n254B1\tkeng\n254B2\tsi\n254B3\tkang\n254B5\tyi\n254B6\thua\n254BE\tyu\n254C3\tli\n254C6\tlin\n254C7\tdu\n254C8\te\n254CC\tqiang\n254CD\tdu\n254D0\tjie\n254D1\tchuo\n254D2\txian\n254D6\tgao\n254EC\tdao\n254F0\thong\n254FB\tzong\n254FE\tqi\n254FF\ttuo\n25500\thong\n25501\tpi\n25502\tgeng\n25504\tnie\n25507\tkong\n2550A\tzhi\n25511\txiao\n25521\tshe\n25522\tyu\n25523\tjiang\n25529\tqi\n2552A\tchen\n2552B\tsang\n2552D\tsuo\n2552E\tqian\n2552F\thui\n25531\tshan\n25532\te\n2553B\tqiu\n2553D\tke\n25540\tweng\n25541\tzi\n25542\tji\n25547\tda\n25549\tcuo\n2554D\tlou\n2554E\tkang\n2554F\tkuo\n25550\tdi\n25551\tqie\n25553\tmo\n25556\tguo\n25557\thong\n25558\tchao\n25559\thei\n25562\tcao\n25563\tzhe\n25564\tke\n25566\tgun\n25570\txu\n25571\tpeng\n25572\tjue\n25575\tgan\n25576\tsi\n25578\tsui\n25579\tque\n2557B\twu\n2557C\tyan\n2557D\tpeng\n2557E\txiao\n2557F\tpan\n2558D\tla\n25597\tbeng\n25598\tzhen\n25599\tji\n2559C\tjin\n2559D\tlian\n2559E\tken\n255A0\tzhou\n255A8\tzao\n255AA\tle\n255AB\tqi\n255AC\tbing\n255B5\tyin\n255B6\tpin\n255BB\tsou\n255BC\tlu\n255BE\tdi\n255BF\tdu\n255C0\tliao\n255C1\tzhuo\n255CA\tchang\n255D2\tchen\n255D3\tta\n255D9\tque\n255DA\tdao\n255DD\trang\n255DF\tpo\n255E6\tzhong\n255E7\txie\n255EA\tjiang\n255EB\tqu\n255EC\tlei\n255ED\tca\n255EE\tque\n255F5\txiang\n255F6\tlei\n255FA\tlan\n255FD\tlan\n255FF\tla\n25601\tla\n25604\tyu\n2560A\tjiao\n2560B\tqin\n2560C\tji\n2560F\tgan\n25612\tyi\n25620\tyi\n25621\tzhi\n25624\tbiao\n25625\tsheng\n25626\tjiu\n2562B\the\n2562C\tfu\n2562E\tju\n25640\tzuo\n25641\tyi\n25646\txian\n25647\tyi\n25649\tsi\n2564B\tchui\n2564E\tmo\n25661\tzhan\n25663\txun\n25666\tru\n25668\thuo\n2566C\tshao\n25670\tshou\n2567E\tyou\n2567F\tyu\n25682\tjun\n25689\tzi\n2568A\tlu\n2569A\tchi\n2569B\tkun\n256A0\tzhun\n256A6\thou\n256A9\txu\n256BE\tzong\n256BF\tying\n256C2\tzhu\n256C5\tliu\n256D1\tnu\n256D8\tbi\n256DA\tchi\n256DC\tzu\n256DD\tfeng\n256DE\tlu\n256DF\tpu\n256E5\tzhuan\n256E7\tzhe\n256E8\tshi\n256E9\tyu\n256EA\tlu\n256EB\tliang\n256EF\tjue\n256F0\tliao\n256F1\tbeng\n25703\tyi\n25704\tguan\n2570C\tao\n2570F\tgui\n25710\tmin\n25712\tyan\n25713\tlan\n25716\tbo\n25719\tzan\n2571A\tyou\n25725\tyi\n25726\tni\n2572C\tni\n2572D\tguo\n2572E\tjun\n25730\tshi\n25732\txian\n25734\tqian\n25735\tque\n25736\tkui\n25740\tshe\n25742\thuo\n25744\twan\n2574A\tfei\n2574B\tfei\n2574C\tji\n2574D\tyu\n25751\tzhi\n25752\tgua\n25754\tjie\n25755\tmang\n25756\the\n25758\tyou\n2575F\tdu\n25760\tsi\n25762\tli\n25765\tjie\n25766\tniu\n25767\tba\n25768\tyu\n2576E\tzhi\n25778\the\n25779\tke\n2577E\tdu\n2577F\tjia\n25781\tchen\n25783\tchui\n25784\the\n25785\tzhai\n2578A\tmei\n2578D\the\n2578E\tzi\n2578F\tzhu\n25792\ttuo\n25798\tzun\n2579A\tru\n2579B\tduo\n2579C\tjiang\n257A6\tjia\n257A7\theng\n257A9\tbeng\n257AA\tmo\n257AF\tzu\n257B2\tbie\n257B4\tku\n257B5\tjia\n257BA\tzhuo\n257BC\txiu\n257C2\tlai\n257C3\the\n257C5\tqiao\n257CD\tfei\n257CE\tsheng\n257D2\tzhui\n257D3\tkuan\n257D4\tze\n257D5\txian\n257D7\tbi\n257D8\tyi\n257DA\tchang\n257EA\tmao\n257F6\twan\n257FD\twu\n257FE\tku\n257FF\two\n25800\txing\n25801\tke\n25803\tjiu\n25804\tduan\n25805\thuan\n25808\tzhi\n25809\tce\n2580A\trou\n2580B\tji\n2580D\tye\n2581B\tjing\n2581C\tyang\n25821\tzong\n25829\tcan\n25831\tsi\n25832\tli\n25833\tgu\n25834\tchang\n25836\tfei\n25837\tliu\n25839\tjie\n2583A\tyun\n2583D\tzhi\n25840\tchou\n25841\tbie\n25852\tji\n2585C\tluo\n2585D\tjian\n2585F\tchuang\n25860\tshuang\n25862\tlu\n25863\tjun\n25864\tjiao\n25866\tti\n25867\tzha\n2586A\tyi\n2586C\tcong\n2586D\tnei\n2586E\tjia\n25874\tji\n2587D\tai\n25887\tjian\n2588A\tben\n2588C\tfan\n2588D\tsui\n2588E\tzun\n2588F\tdian\n25890\tgao\n25891\tgao\n25892\tlao\n25894\tzhuo\n258A2\ttui\n258A6\tbi\n258A7\tju\n258AE\thua\n258B2\tcheng\n258B6\tkuai\n258B7\tdang\n258B8\tge\n258B9\txie\n258BB\tjie\n258BD\tcan\n258C6\tzu\n258C8\tpu\n258CB\tshu\n258CC\tbu\n258D7\tning\n258D8\tyan\n258D9\tzhou\n258DB\tmeng\n258DD\tbian\n258DF\txiang\n258E4\tlu\n258E5\tli\n258E9\tji\n258EB\tmie\n258EC\tlei\n258EE\tzhi\n258EF\tyou\n258F0\tbian\n258F8\tmu\n258FA\tran\n25902\tniao\n2590A\tquan\n2590B\tzhe\n25910\tlei\n25917\tdang\n25918\tjue\n2591C\tling\n2591E\tling\n2591F\tyan\n25923\tyao\n25924\tzhen\n25925\tqi\n25926\tai\n25928\tnu\n25929\tmang\n25931\tkan\n25933\tjiu\n25934\tyan\n25935\tmian\n25937\tyin\n25938\twan\n25939\tyao\n2593A\twa\n2593B\tpi\n2593C\tsui\n25945\tkong\n25948\thong\n2594A\tming\n2594B\tling\n2594C\tyi\n2594D\tshen\n2594F\tzuo\n2595B\ttu\n2595D\tyong\n2595F\twa\n25960\tgui\n25961\thong\n25965\tshi\n25967\txiong\n25969\ta\n25971\tcheng\n25973\tkeng\n25974\tyi\n25975\tyang\n25976\tting\n25977\tdou\n25978\tcha\n25979\tliu\n2597D\tqiu\n2597E\txuan\n2597F\tshen\n25980\tkuan\n25981\ttong\n25983\tqian\n25985\tchou\n2598A\twen\n2598C\tlong\n2598D\tan\n25994\tkan\n25996\tyao\n25998\tfu\n2599C\tbeng\n2599D\tlan\n2599E\tqia\n2599F\tdian\n259A2\tjiao\n259A3\tgui\n259A5\txiong\n259A8\tke\n259B6\txian\n259B7\twong\n259C2\tgong\n259C6\tou\n259C7\tke\n259CB\tku\n259D1\ttian\n259D2\tgou\n259D3\tma\n259D5\tliu\n259D9\twei\n259DA\twen\n259E1\tgong\n259E3\ttu\n259E4\tning\n259E7\tmi\n259EB\tlang\n259EC\tqian\n259ED\tman\n259EE\tzhe\n259F0\thua\n259F1\tyong\n259F2\tjin\n259F4\tmei\n259F7\tfu\n259FB\tqu\n25A0C\tliu\n25A0D\tfu\n25A0E\tdan\n25A10\tgong\n25A12\tcui\n25A15\txing\n25A1C\ttu\n25A1D\tshou\n25A2A\tqiong\n25A33\trong\n25A3B\tli\n25A3F\tji\n25A40\ttuo\n25A4C\ttong\n25A52\ttan\n25A54\tling\n25A56\tyi\n25A57\truan\n25A59\tpa\n25A5D\tca\n25A61\tyue\n25A62\tque\n25A63\tzhu\n25A64\thai\n25A71\tfa\n25A72\thai\n25A7A\tlie\n25A80\tbu\n25A81\tping\n25A82\tlie\n25A8A\tkui\n25A8B\tfu\n25A8C\ttian\n25A8D\two\n25A8F\tju\n25A98\tzhen\n25A9A\tfu\n25AA2\tlong\n25AA6\txi\n25AA7\ttian\n25AAB\tji\n25AAF\tyao\n25AB1\tcu\n25AB4\tpang\n25AB5\tqie\n25ABB\tlong\n25ABC\tji\n25AC2\ttong\n25AC3\tyi\n25AC5\tchang\n25ACB\tgong\n25ACE\tdong\n25AD6\txiang\n25AD9\tting\n25ADB\tzhuan\n25ADC\tyi\n25ADD\tyi\n25ADE\tzi\n25ADF\tqi\n25AE2\tcha\n25AEC\tdun\n25AEF\tchong\n25AF0\tlu\n25AF1\tdun\n25AF3\tfang\n25AF4\tshi\n25AF5\tti\n25AF6\tji\n25AF7\tqiu\n25AF8\tshui\n25AF9\tchen\n25AFC\thuang\n25AFD\tshi\n25B00\tyun\n25B06\tlong\n25B08\tman\n25B09\tgou\n25B0D\txian\n25B0E\tmo\n25B10\tshen\n25B12\tpo\n25B13\tyao\n25B14\tqu\n25B15\tran\n25B19\tju\n25B1C\tyin\n25B1D\tbai\n25B1E\tnie\n25B20\tchou\n25B2A\trong\n25B2B\tchuan\n25B2C\tnie\n25B2D\tli\n25B2E\tjiang\n25B2F\tkao\n25B30\tce\n25B31\tchong\n25B32\tzhua\n25B33\tzi\n25B34\tyang\n25B3C\twen\n25B4B\tji\n25B4C\tji\n25B50\tlu\n25B51\tqiu\n25B52\tdun\n25B53\tbao\n25B54\tchan\n25B56\tbo\n25B58\tchi\n25B59\tzhe\n25B5A\tmang\n25B5C\tji\n25B5D\tmiao\n25B5E\tyuan\n25B60\twu\n25B61\tzhi\n25B62\tping\n25B65\tchong\n25B6B\tmi\n25B6C\tfei\n25B6D\tcuo\n25B6E\tmeng\n25B8D\tyin\n25B8E\tmang\n25B8F\tdian\n25B90\tdiao\n25B92\tqian\n25B95\thang\n25B96\tzhi\n25B97\tju\n25B98\tnian\n25B9C\tmi\n25B9D\tgu\n25BA3\tzhua\n25BA4\tnie\n25BA5\tzhuo\n25BA7\tye\n25BA8\tcong\n25BAA\txu\n25BAC\txi\n25BAF\tbo\n25BBE\tcan\n25BC3\tyan\n25BD1\tjin\n25BD4\tju\n25BD5\tdang\n25BD6\tdu\n25BD8\tye\n25BD9\tjing\n25BDA\tke\n25BDB\tluo\n25BDC\twei\n25BDD\ttu\n25BDE\tyou\n25BDF\tpai\n25BE1\tpi\n25BE2\tding\n25BE4\twei\n25BE5\tche\n25BE6\tjian\n25BE8\tsi\n25BE9\tzhuo\n25BEA\tsou\n25BEC\truan\n25BEE\tyu\n25BF3\te\n25BF6\tku\n25BF8\tzhu\n25BFE\txia\n25C1B\tfu\n25C1C\ttao\n25C1D\txi\n25C1E\tchou\n25C1F\tyuan\n25C20\tlu\n25C21\tce\n25C22\tshan\n25C23\tliu\n25C25\txi\n25C26\tji\n25C27\tyi\n25C28\ttan\n25C2A\thu\n25C2D\tcuo\n25C2E\tge\n25C30\tshi\n25C31\tsao\n25C32\thong\n25C33\txian\n25C36\txia\n25C3B\tmu\n25C3C\tsuo\n25C3E\tzhai\n25C40\tfu\n25C41\tse\n25C42\tnu\n25C43\tyi\n25C67\tqin\n25C68\tqing\n25C75\thui\n25C76\tshuang\n25C77\tdan\n25C78\tou\n25C79\tmo\n25C7A\tqian\n25C7B\tchi\n25C7C\tpai\n25C7D\tjuan\n25C80\tchao\n25C81\tlie\n25C82\tbing\n25C83\tkou\n25C84\tdan\n25C85\tchou\n25C86\ttong\n25C87\tdan\n25C88\tman\n25C89\thu\n25C8A\tliao\n25C8B\txian\n25C8D\tcao\n25C8E\tlu\n25C8F\tchuan\n25C90\twu\n25C91\tman\n25C95\tzi\n25C97\tdu\n25C9A\tshuang\n25C9B\tfu\n25C9C\tju\n25C9D\tzhou\n25C9F\tdiao\n25CA0\twang\n25CA1\tchuang\n25CA2\tqian\n25CA3\ttui\n25CA5\tlian\n25CA6\tbiao\n25CA7\tli\n25CAA\tli\n25CC6\tbi\n25CC7\tfu\n25CC8\tcui\n25CC9\tdu\n25CCB\tzan\n25CCC\tlong\n25CCD\txun\n25CCE\tqiong\n25CCF\tji\n25CD0\tqian\n25CD2\tjian\n25CD3\tshao\n25CD4\tduo\n25CD5\tshu\n25CD6\tbu\n25CD7\txu\n25CD8\tdong\n25CDA\tran\n25CDC\tyang\n25CDD\trui\n25CDE\tlin\n25CDF\tjian\n25CE0\tdi\n25CE1\tfen\n25CE2\tdian\n25CE3\tzui\n25CE5\tning\n25CEA\tsuan\n25CEB\ttian\n25CEC\tan\n25CEF\tce\n25CF0\tding\n25CF1\tshen\n25CF2\tdu\n25CF3\tti\n25CF4\tjiao\n25CF5\tzui\n25CF6\tzhang\n25CF7\tjian\n25CF8\tdan\n25CF9\tdan\n25CFA\tsong\n25D10\tzhan\n25D11\tting\n25D12\tzhi\n25D15\tyou\n25D16\tpai\n25D21\tli\n25D24\tqian\n25D26\tsui\n25D27\tju\n25D28\tai\n25D29\tge\n25D2A\tju\n25D2B\ttun\n25D2C\tbi\n25D2D\tqia\n25D2E\tbo\n25D2F\thui\n25D31\tjian\n25D34\tgou\n25D35\tsuan\n25D3A\tci\n25D3B\tqiang\n25D3F\tyan\n25D4F\tdian\n25D52\tmie\n25D5C\tpo\n25D5D\tling\n25D5E\tjie\n25D5F\tzhu\n25D60\tgu\n25D63\tduan\n25D64\tzhao\n25D66\tshao\n25D67\tqin\n25D68\tmi\n25D6A\tping\n25D6B\tcong\n25D6C\tchou\n25D6F\tsa\n25D76\ttian\n25D85\tliu\n25D86\tlu\n25D87\tlu\n25D88\tzou\n25D8C\tlu\n25D8D\thuan\n25D8F\ttiao\n25D90\ttui\n25D91\tqiang\n25D92\tlin\n25D93\tbei\n25D94\tpao\n25D95\tzhan\n25D97\tli\n25D9B\tti\n25D9C\thu\n25DA2\tlie\n25DB5\thui\n25DB6\tqu\n25DB7\txuan\n25DB9\tjing\n25DBA\tdie\n25DBB\tsui\n25DBD\twei\n25DBF\tyan\n25DC0\tyan\n25DC1\tban\n25DC3\tjiang\n25DC4\tni\n25DC5\tli\n25DC6\thu\n25DC7\tqi\n25DC8\tzhong\n25DD1\tbi\n25DD4\tyu\n25DD5\tdie\n25DD6\tlin\n25DD7\tli\n25DD8\tzhuo\n25DD9\tji\n25DDA\tju\n25DDC\tfeng\n25DDE\tyu\n25DE8\tlie\n25DE9\tza\n25DEA\tqian\n25DEB\tjie\n25DEC\tguan\n25DEE\tzhuo\n25DF1\tfu\n25DF9\tse\n25DFC\tcu\n25E03\thui\n25E08\tdang\n25E09\tlong\n25E0A\tyi\n25E17\tsa\n25E18\tyue\n25E1A\tdi\n25E21\tgan\n25E22\tzan\n25E23\tshan\n25E24\tyu\n25E25\tbo\n25E27\tding\n25E28\tfan\n25E2A\tyu\n25E2C\tshen\n25E32\tgong\n25E34\tmie\n25E35\ttun\n25E38\tlie\n25E41\tzha\n25E42\tpei\n25E44\tmi\n25E46\tming\n25E47\tfan\n25E49\tna\n25E4A\tsi\n25E4B\tyi\n25E4C\tjia\n25E4D\tzhu\n25E53\tban\n25E54\tyu\n25E56\tpo\n25E5A\thuan\n25E5B\tcan\n25E5C\tjiao\n25E60\ttan\n25E69\tzhi\n25E6B\tmi\n25E6C\tkao\n25E71\tyao\n25E72\tdui\n25E73\tquan\n25E74\tbu\n25E75\tchu\n25E76\tqiao\n25E77\tliu\n25E78\tbo\n25E7A\tkang\n25E7B\tfen\n25E85\tdao\n25E89\tdou\n25E8A\tge\n25E99\tling\n25E9A\txi\n25E9C\tni\n25E9D\tzhou\n25E9E\tzhou\n25EA3\tchou\n25EB4\tnian\n25EB5\tji\n25EB7\tqu\n25EC4\tkai\n25EC7\txian\n25EC9\the\n25ECB\tlin\n25ECD\tzi\n25ED1\tou\n25ED2\tcu\n25ED7\tcha\n25EDD\tzhong\n25EDE\tbu\n25EE4\tchou\n25EE5\txi\n25EE6\tsa\n25EE7\txian\n25EE8\tse\n25EE9\tmian\n25EEB\tfan\n25EEC\tzhi\n25EEE\tcui\n25EF4\txia\n25EFE\tnuo\n25EFF\tli\n25F00\tzu\n25F02\tcui\n25F03\tze\n25F05\tli\n25F18\tqi\n25F1A\tzhuo\n25F1B\tcui\n25F1C\tpu\n25F1E\tfan\n25F1F\ttan\n25F29\tzi\n25F2A\tzu\n25F2B\tzhou\n25F2C\trong\n25F2D\tlin\n25F2E\ttan\n25F36\tshi\n25F3A\tcui\n25F3B\tzi\n25F3C\tfu\n25F41\txiao\n25F48\tfeng\n25F4F\txian\n25F50\tjian\n25F52\tfen\n25F57\tli\n25F58\tmo\n25F5F\tyou\n25F65\thuo\n25F67\tqu\n25F6C\tniang\n25F70\tmi\n25F73\tqi\n25F76\the\n25F78\tlian\n25F7F\tzuo\n25F82\tling\n25F85\tzhu\n25F87\tniao\n25F8A\tji\n25F8B\treng\n25F8C\tjie\n25F8D\tgan\n25F90\tyi\n25F93\tzhou\n25F95\twu\n25F9A\tgeng\n25F9B\tcu\n25F9D\tmie\n25FA1\txun\n25FA3\tzhi\n25FA4\txiao\n25FA7\tfu\n25FA8\thu\n25FAC\tdi\n25FAE\tjue\n25FAF\tdiao\n25FB9\tshou\n25FBC\twang\n25FC3\tna\n25FC4\tdi\n25FC5\tshi\n25FC6\tci\n25FC7\tshu\n25FC9\twa\n25FCA\tche\n25FCB\tfan\n25FCD\tgu\n25FCE\tyuan\n25FD1\tguan\n25FDA\tqie\n25FDC\tzhan\n25FDD\tdai\n25FDE\tshe\n25FE6\tzhou\n25FE7\txiang\n25FE8\tming\n25FE9\tzi\n25FEA\thuang\n25FEB\tmi\n25FED\txi\n25FEE\tzhi\n25FEF\tpai\n25FF0\tduo\n25FF4\tci\n25FF5\tmou\n25FF7\tchao\n25FF9\tyi\n25FFA\tgou\n26007\tjing\n26013\tzeng\n26014\tping\n26015\tye\n26016\tjie\n26018\tpi\n2601B\tsha\n2601C\tzhuang\n2601D\tjiong\n26020\tliu\n26021\tyu\n26023\tju\n26028\tnuo\n26038\tmao\n26044\tchen\n26046\tzhuan\n26047\tnian\n26048\tkong\n26049\tjie\n2604A\thua\n2604D\txin\n2604E\tzuo\n2604F\tyan\n26050\tjue\n26055\thu\n26056\tzhou\n26057\tshe\n26059\tyan\n2605B\txie\n2605C\tdie\n2605F\tchen\n26072\tjian\n26073\tji\n26076\tchuo\n26077\thong\n26080\tda\n26084\tkai\n26085\txing\n26086\thui\n26087\tjian\n26088\tzhou\n26089\tzha\n2608A\tfu\n2608B\tchi\n2608C\tbeng\n2608D\tnuo\n26091\tji\n26092\tqian\n26094\twan\n26095\tou\n26096\tbi\n26097\tshuo\n260A0\tjing\n260A1\tye\n260C4\tfei\n260C7\tli\n260CA\tli\n260CB\tpi\n260D2\tsui\n260D3\tliu\n260D4\the\n260D5\thun\n260D6\ttan\n260D7\tshuo\n260D8\tzhi\n260D9\tbo\n260DD\txi\n260E1\tpo\n260E2\tqun\n260E4\tmu\n260FD\tyong\n26102\tdai\n2610A\tqi\n2610B\tdiao\n2610C\tnie\n2610D\tshuang\n2610F\tshao\n26110\tkun\n26111\tsui\n26113\tdou\n26114\tdie\n2611C\tgong\n2612F\tzhuan\n26130\tguo\n2613C\txu\n2613D\tqu\n26140\txun\n26143\tjiao\n26144\tzhe\n26146\tdian\n26147\tsang\n26148\tbeng\n2614A\tsuo\n2614B\tqian\n2614F\txu\n26151\txun\n26154\tmo\n26175\tsui\n26176\tla\n26177\tzhu\n26178\tzhou\n2617A\tli\n2617C\tdan\n2617D\tju\n2617F\tyun\n26180\tchan\n26181\tluo\n26184\tse\n26186\tlian\n26188\tzuan\n2618B\tlai\n2618C\tshuang\n2618D\tqie\n26198\tdou\n2619E\twu\n2619F\tmeng\n261A1\tji\n261A4\tchi\n261A6\tni\n261B8\tyao\n261BB\tla\n261BE\tlu\n261C0\tsui\n261C1\tfu\n261C4\tlei\n261C5\twei\n261CE\tcong\n261D4\tli\n261D6\tpin\n261D8\tjun\n261D9\tju\n261DB\tla\n261E7\tji\n261EA\tmie\n261EC\tyao\n261ED\tbian\n261F1\tcong\n261F2\tsi\n261F5\tsi\n261F8\the\n26203\tnang\n26205\tdie\n26208\tche\n26209\tyun\n2620B\txiu\n2620C\tshu\n2620E\tchan\n2620F\tmin\n26210\tlian\n26211\tyin\n26212\txing\n26213\twei\n26214\tgu\n26215\ttou\n26216\tta\n26217\tfei\n26218\tda\n26219\tnie\n2621A\tcu\n2621B\tzuo\n2621C\tjie\n2621D\txuan\n2621E\tbo\n2621F\tjin\n26220\tyin\n26221\txu\n26223\tyu\n26224\txiong\n26226\tqi\n26227\tbei\n26228\txing\n26229\tgong\n2622C\tzui\n26230\tjie\n26232\tkai\n26235\txing\n26236\tbei\n26237\tshu\n26238\tyu\n2623A\tzhou\n2623B\tzhan\n26242\tzhong\n26246\tcha\n26248\tchui\n26249\tliu\n2624E\tsui\n26250\tzhu\n26259\tbian\n2625D\txin\n2625F\tya\n26262\tling\n26267\tya\n2626C\tting\n26279\tdi\n26281\tpi\n26282\thu\n26283\tcen\n2628A\ttian\n2628B\tmou\n2628C\tjuan\n2628E\tmou\n26290\tju\n26291\tliu\n26293\tling\n26297\tliu\n26298\thu\n262A6\tfu\n262A7\thu\n262AA\te\n262AB\tgong\n262AC\tgu\n262B1\tgua\n262B9\tlue\n262BB\tfan\n262BC\tlu\n262BD\tmeng\n262BE\tfu\n262BF\tliu\n262C5\txie\n262C6\tgu\n262C8\txian\n262C9\tbo\n262CB\tji\n262D3\tquan\n262D4\tlu\n262DE\tshuo\n262E1\tmou\n262E2\tyu\n262E3\than\n262E9\tyue\n262EA\tdan\n262EF\tyu\n262F0\tjian\n262F3\tgang\n262FF\tcao\n26300\tshen\n26301\tliu\n26306\tjiao\n26309\tsu\n2630A\tsu\n2630B\tzhong\n26312\tliao\n26314\txuan\n26315\tlu\n26317\tji\n2631A\tyan\n2631F\tlu\n26321\tmin\n26322\tti\n26326\thuan\n26329\tyi\n2632A\ttan\n2632C\twu\n26330\tji\n26337\tdu\n26338\tkun\n2633A\tjun\n2633F\tshi\n26340\tnan\n26341\tpo\n26344\tshu\n26345\tquan\n2634C\tren\n2634F\tfen\n26352\tta\n26353\ttun\n26355\tyang\n26360\tli\n26366\tduo\n26367\tci\n26369\tgu\n2636A\tfen\n2636D\trou\n26371\tgao\n26372\txiang\n26374\txiang\n26375\thou\n26377\ttao\n26378\tshan\n26379\tyang\n2637A\tzi\n2637C\tyuan\n26384\tsu\n26387\tchuan\n26388\txiang\n2638A\tban\n2638C\tman\n2638E\tfu\n2638F\tla\n26390\tli\n26392\tjie\n26393\tyou\n26398\tyu\n2639A\tchi\n2639C\tchuan\n2639D\tyi\n2639E\tshan\n263A2\tji\n263A3\tyan\n263A6\twu\n263A7\tchun\n263A8\tmang\n263AD\tfu\n263AE\tjia\n263AF\tgou\n263B0\tgu\n263B1\tjia\n263B5\txian\n263B7\tjin\n263B8\tzi\n263B9\tlou\n263BC\tgou\n263C0\tren\n263C2\tshan\n263C5\tjue\n263C6\ttong\n263C7\tyou\n263D4\tjian\n263D5\tdu\n263D7\thu\n263DB\tsao\n263DC\tyu\n263E2\tmai\n263E4\tzhi\n263E5\tyan\n263E6\tgao\n263E8\thuai\n263EE\tquan\n263F1\tyang\n263F3\tzui\n263F7\txiao\n263F8\tyi\n263F9\tyan\n263FA\thong\n263FB\tyu\n263FF\tchi\n26401\tchi\n26404\thang\n26405\tse\n26406\tpa\n26407\tta\n26408\tfen\n26409\tchi\n2640C\thong\n2640D\txue\n26416\tzhi\n2641B\tqu\n26420\txi\n26421\tfu\n26423\tshu\n26424\thai\n26426\tpo\n26428\tci\n26430\tchai\n26433\thong\n26438\tpao\n26439\tshen\n2643A\txiao\n2643D\txuan\n2643E\tci\n2643F\tting\n26440\tpo\n26447\tta\n26448\tcha\n2644B\tzu\n2644C\thuo\n2644D\txu\n2644E\tyan\n2644F\tchai\n26451\ttuo\n26458\txian\n26459\txuan\n2645A\thou\n2645B\thuan\n2645C\tge\n2645D\tchong\n2645E\tbi\n2645F\thong\n26460\thong\n26461\tchi\n26463\tcha\n2646F\tzha\n26471\tzhai\n26472\tta\n26475\tpo\n26476\tta\n26478\tyou\n26479\tfu\n2647A\tci\n2647B\tda\n2647C\tta\n2647E\tliu\n26481\tci\n26483\thong\n26485\than\n26486\tla\n26488\tshi\n2648D\ttong\n2648E\thui\n2648F\the\n26490\tpie\n26491\tyu\n2649C\txian\n2649D\than\n2649F\tpo\n264A6\tla\n264A7\thuo\n264B0\ttai\n264B4\tlao\n264B6\tshu\n264BA\tdao\n264BB\tdian\n264C8\txiong\n264CB\twang\n264CD\tche\n264CE\tnai\n264D0\tjue\n264D3\ter\n264D4\ter\n264D5\tnu\n264D6\tnu\n264DD\tzhuan\n264E2\tnuo\n264E4\tlie\n264E5\tlei\n264E7\tba\n264EC\tcheng\n264EF\tgui\n264F0\tquan\n264F1\tge\n264F3\tgong\n264F4\tshao\n264F9\tlai\n264FA\tzheng\n264FB\tyi\n264FC\tgun\n264FD\twei\n264FE\tlun\n26502\tshi\n26503\tying\n26504\tsheng\n26505\ttu\n26506\tbi\n26508\tze\n26509\tzhong\n2650B\trong\n2650C\tqi\n2650D\tfu\n2650E\tce\n26513\tli\n26514\tman\n26516\tlian\n26517\tbiao\n2651B\tchuang\n2651C\tyi\n26520\tpai\n26525\tyi\n26526\tkuai\n26529\tbiao\n2652B\tchi\n2652C\tqu\n2652D\tmo\n2652E\tzhe\n2652F\tsha\n26530\tsha\n26537\tyao\n26538\tgong\n26539\tnai\n2653C\txie\n2653F\ttian\n26546\tye\n26549\tsha\n2654F\tsao\n26552\tdian\n26553\txu\n26559\tqu\n26560\thong\n26561\tsheng\n26562\tting\n26570\tduo\n26575\tliao\n26577\thong\n26578\tli\n2657A\txiang\n2657D\tshen\n26580\tfu\n26588\tyan\n26589\twang\n2658A\tqi\n2658B\tduo\n2658D\thua\n2658E\tqian\n26590\txie\n2659D\tci\n2659E\tsheng\n265A2\ter\n265A4\txing\n265A6\ttui\n265A7\tyan\n265A9\tlie\n265AC\tmi\n265B8\tzong\n265BA\tzi\n265BC\thu\n265BD\tying\n265BE\tlian\n265BF\tda\n265C0\ttian\n265C1\ttian\n265CB\trong\n265CD\tai\n265D0\tai\n265D1\tzhe\n265D2\tguo\n265D3\tlu\n265D4\tzhao\n265D5\tmi\n265D6\tliao\n265D7\tzhe\n265DB\tqu\n265DC\tcong\n265DF\tting\n265E1\ttan\n265E2\tzhan\n265E3\thu\n265E5\tpie\n265E7\tda\n265E8\trong\n265EE\tnao\n265F3\tnang\n265F4\tdang\n265F5\tjiao\n265FB\tju\n265FC\ter\n2660A\tli\n2660C\tguo\n2660D\twai\n26612\tnie\n26614\tjin\n26629\tpi\n2662A\tchi\n26632\tpi\n26633\tyi\n26634\tdu\n26635\twa\n26636\txun\n26638\tqi\n26639\tshan\n2663C\txu\n2663F\the\n26640\tpan\n26642\tpei\n26644\txiong\n26646\tchi\n26647\ttan\n26648\tzui\n26649\tzuan\n2664A\tqi\n2664B\tdu\n26659\tshui\n2665C\tna\n2665D\txi\n26667\tchao\n26668\tyi\n2666B\tzheng\n2666E\tju\n2666F\tdai\n26671\tsan\n26674\tzhu\n26675\twan\n26676\tgu\n26678\tsan\n26679\tban\n2667A\tjia\n2667B\tmai\n26688\ttuo\n2668A\tqi\n2668F\tzhuang\n26690\ttuo\n26693\tping\n2669D\tpeng\n2669E\tkuang\n2669F\tyi\n266A1\txie\n266A2\tyue\n266A3\then\n266A5\thou\n266A6\tzheng\n266A7\tchun\n266A8\tshi\n266A9\twa\n266AB\txie\n266B8\tgeng\n266C5\te\n266CF\tku\n266D0\tna\n266D3\tju\n266D4\txuan\n266D5\tqu\n266D6\tche\n266D7\tlu\n266D8\the\n266D9\tsheng\n266DA\tnan\n266DC\the\n266DD\tcha\n266DE\tyan\n266DF\tgeng\n266E0\tnie\n266E2\tguo\n266E3\tyan\n266E4\tguan\n266E7\tzhi\n266E8\tlao\n266EF\tdu\n266F0\tqi\n266F1\tqu\n266F2\tjue\n26701\tfeng\n26703\txu\n26704\ttui\n26706\than\n26707\tku\n2670A\tshen\n2670B\tzhi\n2670D\tpang\n2670E\tzheng\n2670F\tli\n26710\twan\n26712\tfan\n26713\txin\n26716\tya\n2671B\tju\n2671C\tshen\n2672D\tmang\n2672F\ttun\n26730\tzhuo\n26731\txi\n26732\tyin\n26733\tjing\n26734\ttun\n26737\tgeng\n26738\tji\n2674F\tzhuan\n26752\ttie\n26754\tzhi\n26756\tji\n2675A\tying\n2675B\twei\n2675D\thuan\n2675E\tting\n2675F\tchan\n26762\tkui\n26763\tqia\n26764\tban\n26765\tcha\n26766\ttuo\n26767\tnan\n26768\tjie\n2676A\tyan\n2676C\ttu\n2676E\twen\n26770\tcong\n26773\txu\n26774\tyin\n26777\tbeng\n2677C\tlu\n26781\tzai\n26782\tda\n26786\tnie\n26787\tju\n26788\thou\n2678C\tgeng\n26795\thou\n26796\tkan\n26797\tgong\n26799\thui\n2679A\txie\n2679D\txi\n2679E\than\n2679F\tmi\n267A1\tweng\n267A2\thun\n267A3\tsao\n267A4\txin\n267A5\tzhe\n267A6\thuo\n267A8\tgong\n267AB\tsai\n267AC\tjin\n267AD\twa\n267B1\tdui\n267B2\tchi\n267BD\txi\n267C2\tmi\n267C3\tzang\n267C4\tsang\n267D3\ttun\n267D4\tzhi\n267D5\twen\n267D8\tyin\n267D9\ttun\n267DB\tchong\n267DC\tze\n267DE\txiao\n267DF\tmo\n267E0\tcu\n267E3\tbian\n267E4\txiu\n267E7\tyi\n267EE\thuang\n267F0\tzha\n267F1\tsuo\n267F2\thun\n267F3\tju\n26801\tcu\n26804\tji\n26805\txun\n26806\tsun\n26807\tceng\n26809\tyi\n2680E\tbiao\n26812\tjue\n26813\tli\n26816\tpao\n2681B\tza\n2681C\tye\n2681E\tbi\n2681F\tzhe\n26820\tzhe\n26822\tjiu\n26823\tzhe\n26826\tshu\n2682A\txi\n26837\txu\n26838\tnai\n26839\txian\n2683A\tgun\n2683B\twei\n2683E\tji\n2683F\tsa\n26842\tdong\n26843\tnuo\n26844\tdu\n26845\tzheng\n26846\tku\n26849\tming\n26855\tbao\n26856\thui\n26859\tzong\n26868\tsan\n2686A\tteng\n2686B\tyi\n2686D\tyu\n26871\tyao\n26872\tning\n26874\tchou\n26875\thun\n26877\tdui\n26879\tqi\n2687A\tying\n2687B\tbing\n2687C\tning\n2687D\thuang\n26886\tying\n2688A\tbao\n2688E\tguang\n2688F\tlei\n26890\tzun\n26899\tchan\n268A3\tjian\n268A7\tmeng\n268A9\txiao\n268AF\txin\n268B1\tli\n268BA\tqiao\n268BF\twei\n268C0\tna\n268C2\tpang\n268C4\tlei\n268C7\tluo\n268CB\tluan\n268CD\tgeng\n268CF\tluan\n268D2\tqu\n268D6\tluo\n268D8\tnang\n268DB\tluo\n268DC\tyue\n268E2\tshui\n268E5\tmi\n268E6\twang\n268E7\tce\n268E8\tjian\n268E9\twang\n268EF\tjia\n268F4\thuan\n268F8\tlian\n268F9\tzi\n268FA\tbai\n268FB\tshou\n268FE\twan\n26902\tshu\n26907\tgui\n26908\txi\n2690A\tru\n2690B\tyao\n2690E\tgao\n26915\tyue\n26918\tyong\n26919\twa\n2691A\tbo\n2691F\txin\n26922\tpi\n26923\tbo\n26926\thai\n26927\tzhai\n26928\two\n2692A\tye\n2692B\tbi\n2692C\thai\n26938\tchi\n2693B\tzhi\n2693D\tni\n26941\twu\n26942\tai\n26948\tai\n26949\tyu\n2694A\tchi\n2694D\tjing\n2694E\tzhi\n2694F\tzhi\n26950\tzhi\n26951\tju\n26956\than\n2695A\tping\n2695D\tyao\n26963\tyou\n26964\tping\n26966\tmo\n2696C\tzuo\n2696D\tpo\n2696F\txue\n26970\tkuang\n26971\tyi\n26972\tpo\n2697B\tzhui\n26983\tni\n26984\tqiu\n26985\tcou\n2698C\tyao\n26991\tfen\n26995\txia\n26997\tjiang\n26998\tcha\n2699B\txiao\n2699C\tcha\n269A2\tcheng\n269A3\tcui\n269A7\tqiong\n269A9\tyu\n269AB\tyu\n269AF\twen\n269B1\tcha\n269B2\tyu\n269B9\tzuo\n269BA\tdao\n269BD\tjuan\n269BE\tdao\n269BF\tying\n269C1\tfeng\n269C5\tweng\n269C8\tjin\n269C9\tqi\n269CB\tqin\n269CD\tkuo\n269CF\ttan\n269D0\txian\n269D2\ttian\n269D4\tkuo\n269D6\ttian\n269D8\thu\n269D9\tzhu\n269DA\tzhan\n269DB\tta\n269DD\ttian\n269DE\tta\n269DF\tta\n269E0\thua\n269E1\tyan\n269E2\ttie\n269E4\ttie\n269E5\tta\n269EC\thuai\n269EE\tjia\n269EF\tqi\n269F1\tta\n269F4\ttan\n269F5\thua\n269F8\tzhuan\n269F9\thua\n269FC\tlan\n26A06\tzun\n26A07\tyi\n26A08\tfu\n26A09\twu\n26A0B\tfu\n26A0D\tding\n26A0E\tta\n26A16\tchao\n26A19\tri\n26A1A\tquan\n26A1C\tge\n26A21\tfu\n26A22\tdi\n26A23\tdiao\n26A24\tyong\n26A26\tjia\n26A29\tlong\n26A2C\tyong\n26A2D\tpi\n26A2F\thuo\n26A30\tqiong\n26A32\tfan\n26A33\twu\n26A34\ttong\n26A35\thang\n26A38\ttan\n26A3E\theng\n26A44\ttiao\n26A48\tzhou\n26A4B\tbai\n26A4C\txie\n26A4D\tdao\n26A4F\tjin\n26A55\thu\n26A56\tbei\n26A58\tding\n26A5C\tnuo\n26A5D\twei\n26A5E\tyu\n26A60\txing\n26A61\tfu\n26A62\txian\n26A63\tqi\n26A64\ttu\n26A67\tji\n26A69\tying\n26A6B\tdeng\n26A6C\twei\n26A6D\txi\n26A6F\tpai\n26A71\tsheng\n26A72\tyou\n26A74\tai\n26A75\tjian\n26A77\tgou\n26A78\truo\n26A7C\tgong\n26A7F\tsha\n26A80\ttang\n26A87\tlu\n26A88\tao\n26A8A\tqi\n26A8B\txiu\n26A8D\tdai\n26A91\tfa\n26A92\twei\n26A94\tdun\n26A95\tliao\n26A96\tfan\n26A97\thuang\n26A98\tjue\n26A99\tta\n26A9A\tzun\n26A9B\trao\n26A9C\tcan\n26A9D\tteng\n26AA0\thua\n26AA1\txu\n26AA3\tzhan\n26AA7\tgan\n26AAA\tpeng\n26AAB\tcan\n26AAC\txie\n26AAD\tda\n26AB1\tji\n26AB6\tli\n26AB9\tpan\n26ABD\tlong\n26ABE\tli\n26ABF\txi\n26AC0\tteng\n26AC3\tling\n26AC8\tli\n26AC9\tran\n26ACA\tling\n26ACE\tgun\n26AD4\tpo\n26AD5\tmo\n26AD6\tpai\n26AD9\tba\n26AE1\tqi\n26AE4\tyan\n26AEA\twa\n26AEB\tang\n26AED\tming\n26AEE\tmin\n26AEF\txun\n26AF0\tmeng\n26AF3\tguai\n26AF6\tjiao\n26AFB\tgai\n26B01\tcai\n26B02\twu\n26B03\tzhe\n26B04\tren\n26B05\tkou\n26B14\tzhao\n26B15\tzhong\n26B16\tqiu\n26B17\tguo\n26B18\tgong\n26B19\tpu\n26B1A\thu\n26B1B\tmian\n26B1E\ttian\n26B23\twang\n26B38\tzhu\n26B39\tda\n26B3A\txiong\n26B3B\tna\n26B3E\tjuan\n26B41\tnian\n26B48\thu\n26B49\tsha\n26B5C\tzhi\n26B5F\tta\n26B61\tsi\n26B65\tyi\n26B6D\tqiong\n26B6E\tzhi\n26B6F\tlu\n26B70\tru\n26B72\tqi\n26B73\tyu\n26B74\tzhou\n26B75\tyang\n26B76\txian\n26B77\tmou\n26B78\tchou\n26B79\thui\n26B7A\tjiu\n26B7B\tjiu\n26B7C\tpiao\n26B81\tjiao\n26B83\tguai\n26B85\tmo\n26B90\txi\n26B91\tpu\n26BAF\tji\n26BB6\twen\n26BB7\tbei\n26BB8\tyi\n26BB9\tfu\n26BBA\tsi\n26BBB\tjuan\n26BBC\tji\n26BBE\tni\n26BC0\tben\n26BC5\txu\n26BC8\tqin\n26BC9\tbo\n26BCC\twang\n26BCD\tzhe\n26BCF\two\n26BD0\tshao\n26BD1\tzao\n26BD2\tyang\n26BD5\tsong\n26BD6\tnie\n26BDB\tbi\n26BE3\tcu\n26BE4\tqiang\n26BEA\txiao\n26BEB\tzhi\n26BEC\tshe\n26BEF\tzhi\n26BF0\tpeng\n26C0F\tdiao\n26C16\two\n26C18\tzhi\n26C19\tbi\n26C1B\tfen\n26C21\tna\n26C25\tbang\n26C2A\tqiu\n26C2B\tni\n26C2C\tbo\n26C2D\tdun\n26C2F\tshi\n26C30\txu\n26C31\tchang\n26C32\txu\n26C33\tye\n26C34\tmi\n26C38\txin\n26C39\tzhuo\n26C3A\tfu\n26C3D\tpi\n26C3E\txue\n26C40\tyu\n26C41\txian\n26C42\tyu\n26C43\tyu\n26C45\tju\n26C46\tta\n26C47\tkong\n26C4A\tzheng\n26C4B\tmeng\n26C4C\tgang\n26C52\tmu\n26C53\txi\n26C54\tbi\n26C56\tfu\n26C5C\txiao\n26C60\tjiu\n26C63\tgou\n26C70\tchi\n26C71\tjiu\n26C72\tjiu\n26C75\tsha\n26C77\tfei\n26CAB\tfu\n26CAF\twan\n26CB0\txu\n26CB1\tbo\n26CC1\thao\n26CC3\txie\n26CC4\tpian\n26CC5\tyu\n26CC7\ttian\n26CC8\tpi\n26CCA\tshi\n26CCB\tkuai\n26CCC\tji\n26CCF\tzha\n26CD0\tnai\n26CD1\tmou\n26CD3\tfu\n26CD4\tdu\n26CD7\tsheng\n26CD8\tcha\n26CDA\tchi\n26CDB\tgui\n26CDC\tmin\n26CDD\ttang\n26CDE\tbai\n26CDF\tqiang\n26CE1\tzhuo\n26CE2\twei\n26CE3\txun\n26CE5\tmiao\n26CE6\tzai\n26CE7\tyou\n26CE9\tyou\n26CEB\tshan\n26CEC\the\n26CED\tlu\n26CEE\tzhi\n26CF2\tjing\n26CF3\tzhen\n26CF6\tmeng\n26CF7\tyou\n26CF9\two\n26CFA\tba\n26CFD\tjuan\n26CFE\tru\n26CFF\tcou\n26D00\tzhi\n26D07\tqiong\n26D09\thu\n26D0A\tyang\n26D0C\tjun\n26D0D\tshe\n26D0E\tkou\n26D11\tqian\n26D14\tmeng\n26D1A\ttiao\n26D50\tnie\n26D5F\tchi\n26D61\txiong\n26D63\thun\n26D66\tdi\n26D67\tlang\n26D69\tzao\n26D6A\tce\n26D6B\tsuo\n26D6C\tzu\n26D6D\tsui\n26D6F\txia\n26D71\txie\n26D74\tjie\n26D75\tyou\n26D77\tgou\n26D78\tgeng\n26D7C\tjun\n26D7D\thuang\n26D7E\tji\n26D7F\tpou\n26D80\twu\n26D82\tyi\n26D85\tnai\n26D87\trong\n26D88\tnan\n26D8A\tping\n26D8B\tshan\n26D8C\tdiao\n26D8D\tji\n26D8E\thua\n26D8F\tdui\n26D90\tkong\n26D91\tta\n26D93\thong\n26D95\tshu\n26D99\theng\n26D9A\tfen\n26DB2\tkou\n26DD9\tnian\n26DDD\tchu\n26DE6\tqiang\n26DF2\txi\n26DF3\thu\n26DF4\tsong\n26DF5\two\n26DF7\thai\n26DF8\tru\n26DF9\tmeng\n26DFB\tsan\n26DFD\twu\n26DFF\tyou\n26E01\ttan\n26E02\tshen\n26E06\tqi\n26E08\tguo\n26E09\tqia\n26E0A\txian\n26E0F\tsui\n26E10\tlu\n26E13\tqi\n26E14\tdiao\n26E17\tqi\n26E18\tjia\n26E19\tyou\n26E1A\txi\n26E1B\tchao\n26E21\tmi\n26E22\tlou\n26E23\tbi\n26E2A\tpei\n26E2E\tzhen\n26E2F\tshen\n26E30\tchan\n26E31\tfu\n26E36\tqu\n26E37\tsi\n26E3A\tzui\n26E6B\tzhao\n26E7D\tpi\n26E80\tcou\n26E86\tgao\n26E87\tdu\n26E89\tfu\n26E8A\tguan\n26E8B\tsao\n26E8C\tsou\n26E8D\tjian\n26E8E\tpou\n26E90\tcan\n26E91\tbeng\n26E92\tmou\n26E93\tzhao\n26E94\txiao\n26E96\tju\n26E97\tshu\n26E98\tjian\n26E99\tli\n26E9B\tchuan\n26E9C\tlao\n26E9E\the\n26E9F\thu\n26EA0\tgu\n26EA1\tzhang\n26EA2\tjie\n26EA3\txiang\n26EA5\tdu\n26EA6\than\n26EA7\tjia\n26EA8\txiang\n26EA9\tji\n26EAA\tshu\n26EAB\tlang\n26EAC\tji\n26EAD\tshan\n26EB0\ttao\n26EB1\tzi\n26EB2\tshuan\n26EB4\tji\n26EB5\tchu\n26EB6\tji\n26EB7\tshen\n26EB8\tlin\n26EB9\tliao\n26EBB\tsan\n26EBD\tan\n26EBE\truan\n26EC0\tti\n26EC1\tdan\n26EC3\thuan\n26EC5\tsa\n26ED5\tyin\n26F06\trui\n26F07\twu\n26F08\tju\n26F09\thuan\n26F0A\tleng\n26F0B\tlu\n26F0E\ttan\n26F0F\tzeng\n26F13\tqian\n26F17\txi\n26F21\tci\n26F22\tshe\n26F27\tsa\n26F2A\tmao\n26F2B\tqu\n26F2D\tbo\n26F2E\tgan\n26F30\tqie\n26F31\tjuan\n26F32\tdang\n26F33\tchang\n26F34\tyang\n26F35\the\n26F37\tji\n26F39\tbing\n26F3B\tmei\n26F3F\tdun\n26F40\tao\n26F41\tjing\n26F42\tlu\n26F43\tmian\n26F44\tdian\n26F45\the\n26F47\tjian\n26F4A\thua\n26F4B\tgou\n26F4E\tlu\n26F4F\tfu\n26F50\thui\n26F52\tzei\n26F54\tjin\n26F55\tsi\n26F56\tqun\n26F5C\tdan\n26F5E\twan\n26F5F\tbian\n26F64\tjia\n26F6B\tdan\n26F6C\tjiu\n26F6D\txian\n26F6E\tbo\n26F8F\txia\n26F91\tbiao\n26F95\tpo\n26F98\tsao\n26F99\tbei\n26F9A\tsha\n26F9B\twei\n26F9D\tcang\n26F9E\tlu\n26FA9\tdan\n26FAB\tgu\n26FAC\tza\n26FAD\tbang\n26FAE\tgan\n26FB1\tchao\n26FB2\tji\n26FB3\tlie\n26FB5\tqiong\n26FB6\tjian\n26FB7\tlu\n26FB8\tduan\n26FB9\tsuan\n26FBA\tyao\n26FBB\tyin\n26FBD\tta\n26FBE\tyao\n26FBF\tjing\n26FC0\tchu\n26FC1\tfu\n26FC2\tyuan\n26FC3\tshao\n26FC5\tbing\n26FC6\tdang\n26FC7\tshi\n26FCA\tlu\n26FCB\tqie\n26FCC\tluo\n26FCD\tpo\n26FCF\tmeng\n26FD0\tjie\n26FD3\tji\n26FD6\tlu\n27004\tchang\n27005\tmie\n27006\tmeng\n27007\tjian\n2700A\tcai\n2700C\tsu\n27014\the\n27015\tsa\n27017\tzi\n27018\tkeng\n27019\tgeng\n2701A\tsi\n27020\tti\n27021\tzhan\n27022\txie\n27023\tshui\n27024\tchi\n27025\tyou\n27026\tlu\n27027\tmeng\n27028\tlie\n27029\tsi\n2702C\txi\n2702D\tfan\n2702E\tfu\n2702F\tshen\n27030\tti\n27031\tchai\n27032\tyue\n27034\tfu\n27035\tjian\n27036\tdi\n27039\tzhe\n2703A\txie\n2703B\tdan\n2703F\tzhi\n27043\txu\n27048\tnie\n27049\tfan\n2704A\tmeng\n2704B\tmin\n2707E\tlou\n2707F\tdu\n27081\tzhan\n27082\tjian\n27083\than\n27084\tdan\n27085\tsen\n27086\tjian\n27087\ttan\n27088\tjiao\n27089\tpo\n2708B\tping\n2708D\tzhuan\n2708F\tliao\n27090\tzi\n27092\tzhuo\n27094\thu\n27099\txi\n2709B\tmeng\n2709C\tju\n2709D\tmie\n2709E\txian\n270A0\tkui\n270A1\tmeng\n270A2\tjian\n270A6\tnou\n270A8\tdi\n270A9\tsao\n270CF\tchu\n270D0\tzhi\n270D1\tqian\n270D2\tlu\n270D4\tzhuo\n270D8\tzuo\n270D9\than\n270DA\tsui\n270DB\tgou\n270DD\tchou\n270DE\tji\n270DF\tyi\n270E0\tyu\n270E8\tnou\n270E9\tni\n270EA\truo\n270EE\tlin\n270F1\tning\n2710D\tqiao\n2710E\tyao\n2710F\tfu\n27110\tshuang\n27111\tkui\n27112\tqu\n27113\tdong\n27114\tshu\n2711A\tli\n2711B\tju\n2711C\trui\n27120\tzha\n27124\txiao\n27138\tmen\n27139\tshi\n2713A\tdian\n2713B\tli\n2713C\tdeng\n2713D\tzan\n2713F\tluo\n27140\tcan\n27143\tao\n27146\tjian\n27148\tdiao\n2714B\tying\n27156\tyi\n27157\tdang\n27158\tnou\n2715A\tyue\n2716E\tli\n2716F\tli\n27170\thu\n27172\tyou\n2717A\tnang\n27182\tchen\n27189\tfeng\n2718A\tbie\n2718F\tman\n27190\tgan\n27191\thuo\n27193\tcu\n27195\tyou\n27198\tyou\n2719C\txu\n271A1\txu\n271A2\thu\n271A3\tlu\n271A5\txia\n271A6\tyi\n271AE\thu\n271AF\thu\n271B0\tzi\n271B7\tgong\n271B8\ttui\n271B9\twu\n271BA\tling\n271BB\tgu\n271BC\tzhong\n271C4\tlu\n271C8\tzu\n271CC\ttong\n271CD\txia\n271CE\the\n271D3\tyue\n271D9\tnan\n271DA\tbo\n271DB\thu\n271DC\tqi\n271DD\tshu\n271DE\tqiang\n271DF\tzhou\n271E0\tyao\n271E1\tgu\n271E5\tban\n271E6\tkan\n271EE\the\n271EF\tji\n271F0\thu\n271F1\tyan\n271F6\tchun\n271F7\tding\n271F8\tqiu\n271F9\thou\n271FC\thao\n271FF\tzu\n27201\txian\n27204\txia\n27205\txi\n27208\tse\n2720C\tge\n2720D\txi\n27211\tge\n27214\tlu\n27216\tge\n27217\tke\n27219\tshou\n2721A\tzhu\n2721C\tteng\n2721D\tya\n2721E\tni\n27226\tluo\n27227\tsui\n2722A\tchan\n2722D\twu\n2722F\tyu\n27239\tzao\n2723B\tyi\n2723C\txi\n2723D\thong\n2723E\tquan\n2723F\twang\n27240\tchi\n27241\txi\n27242\ttian\n27243\tyun\n27245\tyi\n27246\tji\n27247\thui\n27248\tfou\n2724A\tfu\n2724D\tji\n2724E\txuan\n27250\tshuang\n27251\ttai\n27253\tdu\n27257\tyuan\n2725B\tdi\n2725E\tzhu\n2725F\ttai\n27261\trong\n27262\txue\n27263\tyu\n27264\tfan\n27265\tbei\n27267\tqu\n27269\tbu\n2726A\tjia\n2726B\tzha\n2726D\tnu\n2726E\tshe\n27272\tli\n27284\tgui\n27285\tguai\n27287\tdai\n2728F\tgai\n27292\tci\n27294\tyan\n27295\tsong\n27296\tshi\n27298\tku\n27299\tzhi\n2729A\ttong\n2729B\tqu\n2729C\te\n2729E\txing\n2729F\tru\n272A0\tyu\n272A3\tyi\n272A4\tyi\n272A5\txu\n272A6\tfou\n272A7\tge\n272AC\the\n272AD\tyin\n272AF\thong\n272B1\tduo\n272BD\txing\n272BE\tfan\n272C9\tqi\n272CA\tsha\n272CC\tdu\n272CD\tdi\n272CE\tli\n272CF\tyi\n272D0\txi\n272D1\tgeng\n272D2\ttong\n272D3\tkao\n272D4\thong\n272D5\tkun\n272D6\tnie\n272D7\tchi\n272D8\tti\n272DA\ttong\n272E0\tli\n272E1\tna\n272F1\tzhan\n272F2\tbei\n27301\ttiao\n27303\tza\n27304\te\n27305\tshou\n27306\tkong\n27307\tpeng\n27308\tfu\n27309\tlu\n2730A\txie\n2730B\txie\n2730C\txiu\n2730D\tlu\n2730E\ttian\n2730F\tta\n27310\tci\n27311\tqu\n27313\tfu\n27314\tzhi\n27316\txie\n27317\tzou\n27318\tfei\n27319\tmin\n2731A\txing\n2731D\ttong\n2731E\tqi\n27320\tpiao\n27322\tsui\n27323\ter\n27327\thu\n2733B\tsong\n2733D\tbie\n2733E\tding\n2733F\tban\n27340\tshi\n27341\txie\n27342\txiao\n27343\tfei\n27352\tchuan\n27353\tshuai\n27354\tyao\n27355\tjue\n27356\tsheng\n27358\tyou\n27359\tfan\n2735C\tkui\n2735D\tdi\n2735F\tmao\n27360\tjie\n27362\tyan\n27365\twei\n27368\tsang\n27369\tjie\n2736A\tyu\n2736B\twei\n2736C\te\n2736D\tquan\n2736E\tjiong\n2736F\tfeng\n27370\tlong\n27371\tdie\n27372\tpian\n27374\tlian\n27375\thu\n27376\tlu\n2737F\tdian\n27383\tcui\n27384\tmou\n27395\twang\n27396\tjuan\n27397\tke\n27398\tyan\n27399\tjiao\n273A1\tgong\n273A3\trong\n273A4\tsun\n273A5\tshan\n273A8\tchi\n273AA\tqi\n273AB\tsuo\n273AD\tye\n273AE\tzao\n273AF\tque\n273B0\tzhan\n273B1\tba\n273B2\tzu\n273B3\tsuo\n273B4\tzhe\n273B5\txi\n273B7\tchu\n273B8\tjiao\n273B9\tzui\n273BA\tge\n273BB\twu\n273BE\tlue\n273BF\tji\n273C2\txie\n273C3\txie\n273C6\tdou\n273CB\tqiu\n273D1\tping\n273D3\tliu\n273D6\tpin\n273D7\tci\n273E5\tjie\n273E7\thui\n273EB\tsha\n273F8\tzhi\n273F9\tai\n273FA\txu\n273FB\tbi\n273FD\tye\n273FE\tni\n273FF\tzhu\n27401\tsu\n27403\txie\n27404\tyu\n27405\tqu\n27408\tzu\n27409\tzhi\n2740A\tzhang\n2740B\tlue\n2740C\twei\n2740D\tchong\n2740E\tmi\n27410\tji\n27412\tsu\n27413\tye\n27414\txi\n27415\ttuan\n27416\tlian\n27417\txuan\n27419\twu\n2741F\tmao\n2742C\thong\n2742F\tlue\n27430\tdu\n27431\tcong\n27432\tchan\n27433\tlu\n27434\tsu\n27440\tlue\n27446\tzhong\n27447\tli\n27448\tfei\n2744A\tjing\n2744B\tkui\n2744C\tyi\n2744D\thua\n2744E\tcui\n2744F\tzhu\n27450\tyu\n27451\tbeng\n27452\ttun\n27453\tshu\n27454\tdai\n27455\twu\n27456\tci\n27457\tning\n27458\tdang\n27459\tzu\n2745A\than\n2745C\tpi\n2745D\tchuan\n27460\tdu\n27461\tpa\n27464\tzhu\n27466\txie\n27467\tzhe\n27468\tqie\n27469\txuan\n2746B\tsao\n27480\tbi\n27482\tfu\n27488\tli\n2748E\te\n27490\tye\n27491\tshu\n27493\tse\n27495\tqi\n27496\tguo\n27497\tse\n27499\tfu\n2749A\tmao\n2749C\tlei\n2749D\tzhan\n274A8\tchai\n274AD\twei\n274BD\tlei\n274BF\tzei\n274C0\tying\n274C1\tai\n274C2\txie\n274C4\tbi\n274CB\tchan\n274CE\tpi\n274CF\tcong\n274D0\tlie\n274D1\tqi\n274D3\tji\n274D4\tjing\n274D5\tdong\n274D6\tfei\n274D7\tyi\n274D8\ttuan\n274E8\tmeng\n274E9\tcan\n274EA\tya\n274F2\tyang\n274F4\tting\n274F8\tzhi\n274FA\txie\n274FB\tlu\n274FD\tli\n274FF\tmao\n27502\txia\n27505\tsou\n27516\tsu\n27517\txue\n2751D\tli\n2751E\tyuan\n27521\tzhan\n27523\tta\n27524\txuan\n27525\twei\n27526\tye\n27527\tpang\n27528\tmao\n27529\tti\n2752A\tpin\n2752C\tdu\n2752D\tqiu\n2752E\tyi\n27533\ttuo\n27534\tchai\n27537\tjin\n2753C\te\n27543\tchan\n27544\tying\n27545\tling\n27547\txian\n27549\tqi\n2754B\tyue\n2754C\tlue\n2754D\tying\n2754E\tqu\n27552\tfei\n27553\tzi\n27559\tqing\n2755D\tning\n2755E\twei\n2755F\tshuang\n27561\tfu\n27564\tmo\n27565\tmo\n27566\ttuo\n27567\tchai\n27568\tzang\n2756E\tli\n2756F\tli\n27571\txia\n27572\tjuan\n27574\tnan\n27575\tmi\n27578\thuang\n2757A\tshuang\n2757C\txu\n2757F\tfei\n27581\txie\n27586\tta\n27587\tyong\n27589\tzhan\n27591\tqiang\n27592\tnang\n27594\tlin\n27598\tluan\n27599\txian\n2759A\tfu\n2759C\tling\n275A0\tsao\n275A2\thui\n275A8\tting\n275AA\tqing\n275AC\thuang\n275AE\tan\n275B5\tman\n275B7\tni\n275BB\tguo\n275BC\tou\n275BF\txiang\n275C1\tjin\n275C6\tzheng\n275C8\tn\n275CB\tsan\n275CC\thu\n275CE\tzu\n275CF\thui\n275D2\tji\n275D6\tye\n275E6\txing\n275E9\tla\n275EA\tyu\n275EB\tjue\n275F1\tshu\n275F2\tzheng\n275F4\tyong\n275F6\tge\n275F8\tjian\n275F9\txin\n275FC\thui\n275FF\tshuai\n27602\tchong\n27603\thang\n27608\tliao\n2760D\tjiang\n2760F\tgong\n27611\tzhuo\n27617\tqi\n2761C\tqian\n2761E\tdou\n2761F\tpo\n27622\thu\n27625\tniu\n27627\tqi\n27628\tdiao\n27629\tdiao\n2762B\tli\n2762E\txiong\n2763D\tna\n2763F\tzheng\n27640\tla\n27641\tzhi\n27643\te\n27644\tbo\n27645\tpo\n27646\txu\n27647\tyong\n27648\tci\n27649\tli\n2764C\tpao\n2764F\txiu\n2765B\tpu\n2765D\tche\n2765E\tqi\n27661\tyi\n27663\tti\n27664\tduo\n27665\tlong\n27667\tjian\n2766D\tzhan\n2766E\tyuan\n27676\tyu\n27678\tgeng\n2767A\thou\n2767E\tqi\n27680\tmu\n27681\thuan\n27682\tlong\n27683\txi\n27684\te\n27685\tlang\n27686\tfei\n27687\twan\n27689\tcun\n2768B\tpeng\n2768F\tcuo\n27690\tweng\n276A1\tgao\n276A5\tcui\n276A8\tqi\n276A9\tli\n276AA\tqie\n276AB\tqian\n276AC\tkong\n276AD\tbeng\n276AF\tshou\n276B7\twei\n276C4\tshan\n276CF\tzi\n276D2\tti\n276D3\tqian\n276D4\tdu\n276D7\ttu\n276DA\twei\n276DE\thu\n276DF\txing\n276E1\tshan\n276E2\tzhi\n276E7\tchi\n276F8\tzhou\n276F9\tweng\n276FA\tchi\n276FB\tsuo\n276FC\txie\n276FE\tke\n27701\tshai\n27702\tshi\n27703\tshou\n27705\tjie\n27709\tgao\n2770A\tlu\n27714\txie\n2771A\tzhi\n2771E\tman\n27720\tshuai\n27721\tke\n27723\tdiao\n27724\tyi\n27726\tsu\n27727\tchuang\n2772D\tdu\n27731\tcui\n27732\ttuo\n27735\txie\n2773D\txuan\n27742\the\n27743\tjue\n27746\tti\n27747\tfei\n27749\tzhi\n2774A\tshi\n2774B\ttui\n2774E\tchong\n27750\tti\n27751\tzhan\n27752\theng\n27754\tqu\n27755\twei\n27757\tdun\n27758\tbao\n2775C\tliao\n2775D\tlai\n27764\tsi\n2776A\tbiao\n2776B\txie\n2776C\tbie\n2776E\tcong\n27772\tju\n27773\the\n27777\tkui\n27778\tyong\n27780\tshu\n2778D\tnie\n2778F\tyu\n27790\tzhuo\n27791\tmeng\n27792\thu\n27794\tke\n27795\tlie\n2779D\tjie\n2779E\txiong\n277A3\tyan\n277A9\tjie\n277AA\tla\n277AB\tshu\n277AC\tjie\n277AD\tlei\n277B0\tzu\n277B2\tshi\n277B8\twei\n277B9\tdu\n277BA\tsu\n277C3\txie\n277C4\trang\n277CC\tluo\n277D1\tqian\n277D8\tnang\n277D9\tling\n277DC\tji\n277E0\tming\n277E3\tgu\n277E8\txuan\n277EC\txu\n277F1\tbo\n277FC\twei\n27802\tku\n27806\twan\n27808\tcha\n2780A\tmao\n2780B\tke\n2780E\tci\n27812\txian\n27813\tmo\n2781A\thun\n2781B\tchan\n2781C\tshi\n2781D\tzhen\n2781E\te\n2781F\tmi\n27821\tshi\n27822\tqu\n27823\tshu\n27825\tci\n27826\tyan\n27829\thu\n2782A\tqi\n2782B\tzhi\n2782C\thuang\n27834\tzhi\n27836\tyou\n2783C\tgao\n2783D\tyao\n2783E\tpou\n27847\tyi\n27848\tcheng\n27849\tji\n2784B\tai\n2784D\tdong\n2784F\tsui\n27851\tjiu\n27858\tqi\n27859\tlian\n2785A\txuan\n2785C\tliao\n27861\tyun\n27862\txuan\n27863\tcou\n27864\tpian\n27866\tkui\n27868\tti\n27869\thuan\n2786A\tdan\n2786B\tgui\n2786C\tchen\n2786E\tshang\n2786F\tji\n27874\tlian\n27875\tkan\n27876\tsheng\n27878\tdou\n27879\tyou\n2787A\tqi\n2787C\txiao\n27882\tyi\n27883\tlou\n27886\tchuang\n2788B\tlao\n2788C\tgao\n27890\tzeng\n27892\twei\n27896\tjian\n2789B\tying\n2789C\tfan\n2789D\tli\n2789E\tqian\n278A2\tyao\n278A6\tkui\n278A7\twei\n278A9\tque\n278AC\txiao\n278AD\tque\n278B0\thu\n278B5\tduo\n278B6\tchu\n278B9\tshen\n278BC\tzhuo\n278BD\te\n278BE\tji\n278C1\ttan\n278C3\tpa\n278CB\tjie\n278CC\tqiao\n278D1\tqian\n278D2\tju\n278D5\tqiu\n278D6\ttuo\n278DA\tnuo\n278DB\tsi\n278DF\tyi\n278E1\tgu\n278E2\thun\n278E3\tpa\n278E4\tzi\n278E6\tjiao\n278E9\txi\n278EA\tshao\n278EC\tyi\n278ED\tzhi\n278F5\tlun\n278F7\tzhou\n278F8\tjue\n278F9\ttan\n278FA\tnuo\n278FB\tju\n278FC\thu\n278FE\tzhi\n27903\tbi\n2790D\tchi\n2790E\txuan\n2790F\tji\n27910\tgua\n27911\tju\n27912\two\n27913\ttuo\n27915\tqiu\n27916\twei\n27917\tduan\n27919\tshou\n2791B\tzhen\n2791C\tne\n2791F\txi\n27920\tzhe\n27921\tzhi\n27923\tna\n27924\txi\n27928\tjian\n2792E\tyao\n2792F\tguo\n27932\tdi\n27934\thuo\n27935\tjing\n2793C\tjue\n2793D\tyue\n27944\tji\n27945\txi\n27946\tsu\n27948\tjian\n2794A\tkun\n2794B\two\n2794C\tkuang\n2794D\tbiao\n2794E\tjue\n27951\tbi\n27953\tchan\n27955\tzi\n27956\tli\n2795A\tfo\n2795B\tqian\n2795C\tyan\n2795E\ttan\n2795F\tmo\n27963\tkou\n27964\txi\n2796E\thu\n2796F\thu\n27971\tfu\n27974\tyang\n27975\tguo\n27977\tren\n27978\tyin\n27979\tfeng\n2797A\tjun\n2797C\tyun\n2797F\txun\n27981\txi\n2798E\txia\n27991\thang\n2799A\thu\n2799D\thu\n2799E\tpu\n2799F\tfan\n279A4\tjia\n279A7\tyi\n279AD\ttuo\n279AE\tna\n279B8\tyin\n279B9\tyin\n279C3\tji\n279C4\twang\n279C5\tshi\n279C6\tdui\n279C7\tduo\n279C9\ttuo\n279CA\twa\n279CB\tli\n279CF\tre\n279D2\tci\n279D3\txu\n279D4\tzhou\n279D5\tzi\n279DC\twang\n279DD\tya\n279DF\tji\n279E0\tchao\n279E9\tji\n279F5\tshan\n279F6\ttu\n279F8\tbie\n279F9\txi\n279FA\tpi\n279FB\tzha\n279FE\thui\n27A00\tsuo\n27A02\the\n27A04\tyue\n27A06\twu\n27A08\tling\n27A0A\tzha\n27A0B\thua\n27A17\tchan\n27A1F\te\n27A21\tchen\n27A27\tsui\n27A29\ttian\n27A30\tzhi\n27A31\tti\n27A32\tao\n27A33\tzhuo\n27A34\tzi\n27A35\tke\n27A37\tse\n27A38\ttian\n27A39\tlu\n27A3E\tshan\n27A3F\tzha\n27A43\tchong\n27A45\tyan\n27A52\tmu\n27A53\thu\n27A5A\tchi\n27A5D\tsu\n27A63\tnao\n27A66\tji\n27A67\tduo\n27A68\thou\n27A6A\tcong\n27A6B\tzha\n27A6C\tyin\n27A6E\txiao\n27A70\tbian\n27A71\tbeng\n27A72\tla\n27A74\tchi\n27A76\tqia\n27A78\tan\n27A79\tshi\n27A7C\tchi\n27A85\tnu\n27A87\tji\n27A93\tou\n27A95\txia\n27A98\tchai\n27A9A\tai\n27A9D\tsheng\n27A9E\the\n27AA0\tji\n27AA1\tchi\n27AA2\txi\n27AA3\tzheng\n27AA6\tta\n27AA8\tma\n27AAB\tpi\n27AAE\txu\n27AAF\tqian\n27AB9\txia\n27ACA\tyu\n27AD1\tjie\n27AD2\txia\n27AD3\tlu\n27AD5\tqie\n27AD7\tcha\n27ADB\tyang\n27ADC\tji\n27ADD\tsha\n27ADE\tlou\n27AE0\tji\n27AE1\tzhi\n27AE2\twang\n27AE4\tbi\n27AE5\tan\n27AE6\tyi\n27AE7\tan\n27AEC\tli\n27AF9\txian\n27AFE\tjiu\n27AFF\ttan\n27B01\thao\n27B02\the\n27B05\tzha\n27B06\tzhan\n27B07\tyi\n27B08\txi\n27B0A\txi\n27B0B\tfa\n27B0C\tyan\n27B0F\tmu\n27B15\tgu\n27B1E\tyun\n27B24\tzhong\n27B26\tchan\n27B27\tchuang\n27B28\thui\n27B29\tza\n27B2A\tgun\n27B2B\tjian\n27B2C\tya\n27B30\txiang\n27B31\the\n27B43\tdan\n27B47\tmian\n27B48\tning\n27B4A\tmeng\n27B4C\tlie\n27B4D\tzhou\n27B4E\tpu\n27B4F\ttai\n27B53\tying\n27B54\tteng\n27B55\tguo\n27B5A\tqiang\n27B5C\tlu\n27B5D\tsa\n27B5E\tlie\n27B5F\tchi\n27B60\txie\n27B63\tguo\n27B64\tbao\n27B65\tluo\n27B66\tjuan\n27B6A\te\n27B73\the\n27B75\tmei\n27B78\txie\n27B79\tpin\n27B7B\than\n27B7C\tchen\n27B7D\tshan\n27B7E\thui\n27B86\tying\n27B88\tjian\n27B8D\tan\n27B91\tta\n27B92\tyi\n27B93\ttui\n27B97\tliu\n27B99\tzuo\n27B9B\tli\n27B9D\tpin\n27B9E\txue\n27BA0\tnen\n27BA1\tdou\n27BA4\tlan\n27BAA\tzhan\n27BAB\tjue\n27BAC\tzhen\n27BAD\tji\n27BAE\tqian\n27BB0\than\n27BB1\tfen\n27BB3\than\n27BB4\thong\n27BB5\the\n27BB6\thou\n27BBA\tzhan\n27BBB\tchou\n27BBC\ttai\n27BBD\tqian\n27BBF\tshe\n27BC0\tying\n27BC3\tqin\n27BC6\thuo\n27BC8\txi\n27BC9\the\n27BCA\txi\n27BCB\txia\n27BCC\thao\n27BCD\tlao\n27BCF\tli\n27BD2\tcheng\n27BD6\tjun\n27BD7\txi\n27BD8\than\n27BDE\tdou\n27BE0\tdou\n27BE1\twan\n27BE4\tdou\n27BE5\tzai\n27BE6\tjuan\n27BE8\tlou\n27BE9\tchu\n27BEB\tzheng\n27BEF\tqi\n27BF0\tkan\n27BF1\thuo\n27BF2\tlai\n27BFA\tgai\n27BFC\tshou\n27BFE\tdong\n27C03\tlou\n27C04\ttuan\n27C07\tyu\n27C08\twu\n27C0A\ttian\n27C0E\tlao\n27C12\tguo\n27C18\ttan\n27C19\tqi\n27C20\tlie\n27C21\tli\n27C23\txun\n27C28\tgeng\n27C29\tting\n27C2A\than\n27C2B\tchu\n27C2D\ttun\n27C2F\txiong\n27C30\tyou\n27C31\tmo\n27C32\tchi\n27C34\thu\n27C35\tdu\n27C37\tmu\n27C39\tna\n27C3B\tling\n27C3F\tai\n27C40\txian\n27C44\tkan\n27C45\tsi\n27C46\tsan\n27C4A\tyi\n27C4F\tyi\n27C50\txiao\n27C52\tzhi\n27C53\tdou\n27C58\tmai\n27C5C\tlun\n27C5D\tjue\n27C61\tqiang\n27C62\tling\n27C69\tpian\n27C6A\tcou\n27C6B\tduo\n27C6C\tyu\n27C70\tzhuo\n27C72\txi\n27C73\thuai\n27C74\tming\n27C75\ttang\n27C79\tpu\n27C7B\tmi\n27C7C\tman\n27C7E\tguai\n27C80\tqian\n27C82\tlin\n27C83\tmin\n27C84\twei\n27C85\tceng\n27C87\thu\n27C88\tsui\n27C8B\tju\n27C8C\tsha\n27C8D\tmeng\n27C97\twei\n27C98\txi\n27C99\tling\n27C9C\tbi\n27C9D\twei\n27CA1\tli\n27CA2\tzhe\n27CA4\tyong\n27CA5\thu\n27CA6\twan\n27CA7\tba\n27CA8\tjian\n27CAD\tzuo\n27CAE\tzhan\n27CAF\tbo\n27CB0\tqiu\n27CB1\tyang\n27CB4\tdong\n27CB5\tqu\n27CBA\tpi\n27CBB\tzhai\n27CBE\tshan\n27CBF\tgou\n27CC0\tbiao\n27CC1\tyi\n27CC2\tfu\n27CC4\txin\n27CC5\tshi\n27CC6\ttong\n27CC9\tding\n27CCC\ttu\n27CCD\txiao\n27CCE\twu\n27CCF\tpei\n27CD0\thui\n27CD5\tlai\n27CD9\tsi\n27CDA\tcui\n27CDB\tsha\n27CDC\tzhou\n27CDD\tzhao\n27CDE\twei\n27CDF\tlai\n27CE0\tbi\n27CE3\tdong\n27CE6\tnao\n27CE7\txie\n27CE8\trao\n27CE9\ttuan\n27CEA\twei\n27CEB\tyou\n27CEC\tmei\n27CED\tyuan\n27CEE\tzhong\n27CF6\tsou\n27CF8\tgu\n27CF9\tshao\n27CFB\tzhao\n27CFC\tpi\n27CFF\ttong\n27D01\tchi\n27D02\tpeng\n27D03\tchan\n27D04\tyong\n27D05\tshuang\n27D07\twu\n27D09\tpi\n27D0A\thuan\n27D0C\tfu\n27D0E\tbiao\n27D13\tnao\n27D15\tbiao\n27D16\twei\n27D17\tyong\n27D19\tnao\n27D1A\tguai\n27D20\tli\n27D22\txin\n27D23\tyan\n27D24\tpo\n27D25\tpei\n27D2A\tsuo\n27D2C\tren\n27D2D\tshan\n27D32\tsuo\n27D38\tdan\n27D3A\tmen\n27D43\tshou\n27D48\tgou\n27D4A\than\n27D4B\tshi\n27D4C\tyang\n27D4E\tgu\n27D5B\tke\n27D5E\tju\n27D60\tpai\n27D61\tce\n27D62\tbao\n27D63\txiong\n27D64\tcai\n27D67\tlin\n27D68\tai\n27D6C\tmi\n27D6D\tlai\n27D71\txiao\n27D73\tshe\n27D7B\thuo\n27D7C\tni\n27D84\tzheng\n27D86\tlin\n27D87\tzha\n27D8A\tyun\n27D8D\txu\n27D94\tcheng\n27D95\two\n27D96\txi\n27D99\tbei\n27D9C\tshang\n27DA0\tyu\n27DA1\tmi\n27DB2\tduan\n27DB5\tcha\n27DB6\tfan\n27DB7\tze\n27DB8\tcheng\n27DBA\tting\n27DC5\tyi\n27DCB\tyao\n27DCE\tku\n27DD0\tfen\n27DD1\txie\n27DD2\tcheng\n27DDB\tkui\n27DDF\tbin\n27DE1\tlou\n27DE5\tyi\n27DE6\tmi\n27DE7\txie\n27DF1\tgui\n27DF3\tluo\n27DF6\tshan\n27DFE\tju\n27DFF\tdu\n27E02\txian\n27E05\tzhi\n27E08\tbin\n27E15\tzhi\n27E16\tzhuan\n27E17\txue\n27E18\tlian\n27E19\tsui\n27E26\tlan\n27E27\tju\n27E28\tmian\n27E29\txun\n27E2A\tzhan\n27E2B\tgun\n27E32\tzhi\n27E3D\twei\n27E3E\tquan\n27E3F\tchai\n27E48\treng\n27E4A\tyue\n27E4C\tzi\n27E50\tluo\n27E51\tgui\n27E52\tmai\n27E53\tcheng\n27E54\tzhang\n27E55\tju\n27E56\ttian\n27E57\twan\n27E5B\tzhi\n27E5E\tnan\n27E63\than\n27E68\txi\n27E69\tlin\n27E6C\tyan\n27E6D\txu\n27E72\thu\n27E73\tgan\n27E74\txu\n27E76\txi\n27E7A\tcui\n27E7D\txi\n27E7E\thu\n27E85\tyan\n27E8E\tyi\n27E8F\tchi\n27E90\tjue\n27E92\tzu\n27E9C\tjiao\n27E9D\tyi\n27E9F\ttan\n27EA0\tchi\n27EA1\tba\n27EA2\ttou\n27EA3\tzong\n27EA4\tqiu\n27EA7\tchi\n27EA8\txi\n27EB0\tni\n27EB2\tcu\n27EB4\twu\n27EB6\tchu\n27EB7\tsu\n27EB8\tyong\n27EB9\tju\n27EBA\tba\n27EBC\tci\n27EBD\tdi\n27EBE\tpan\n27EBF\tchi\n27EC1\tqiu\n27EC3\tyan\n27ECD\tzhai\n27ED2\txian\n27ED3\tbeng\n27ED4\tkuang\n27ED5\tqi\n27ED6\tzhou\n27ED7\tju\n27ED8\tqie\n27ED9\tmo\n27EDA\tyuan\n27EDC\tgui\n27EDD\tzui\n27EE7\tqie\n27EF0\thu\n27EF1\tqiu\n27EF2\thai\n27EF3\tfu\n27EF4\tlang\n27EF5\tsha\n27EF6\txi\n27EF7\tbu\n27EF8\tshi\n27EF9\tyong\n27EFA\tguang\n27EFC\tnie\n27EFF\thou\n27F0A\tmi\n27F0E\te\n27F0F\txian\n27F10\tyun\n27F11\txu\n27F12\tqin\n27F13\tdong\n27F14\tleng\n27F15\tqi\n27F16\tlan\n27F17\tfu\n27F18\tqi\n27F19\tchong\n27F1C\tcu\n27F1F\tmo\n27F20\tbei\n27F24\tdao\n27F28\tjie\n27F29\tchong\n27F2A\tchi\n27F2B\tyu\n27F2C\tcui\n27F2D\tsu\n27F2E\tti\n27F2F\tshu\n27F30\tzha\n27F31\tfu\n27F33\tche\n27F34\tfo\n27F35\thou\n27F36\tzha\n27F44\tjie\n27F45\tzha\n27F46\tzhan\n27F49\tyan\n27F4A\thai\n27F4B\twu\n27F4C\thua\n27F4D\tdian\n27F4E\tyao\n27F4F\tsou\n27F50\tqian\n27F51\tji\n27F52\txiong\n27F53\tqi\n27F54\tjun\n27F56\thai\n27F5E\tyan\n27F5F\tjie\n27F60\tcui\n27F62\ttuan\n27F63\tzhang\n27F64\tpiao\n27F65\tlu\n27F66\tzhi\n27F67\tchu\n27F68\tmi\n27F69\tqiang\n27F6B\tlian\n27F72\tli\n27F75\tzong\n27F76\te\n27F77\tsu\n27F78\tjue\n27F7B\tju\n27F7C\ttan\n27F7D\tliao\n27F7E\tsan\n27F7F\tdong\n27F81\tza\n27F82\tzhi\n27F86\txuan\n27F87\tling\n27F8A\tdeng\n27F8D\tzhan\n27F8E\txuan\n27F8F\tqin\n27F90\tjiao\n27F91\tpi\n27F94\than\n27F9A\tyu\n27F9B\tguo\n27F9D\txun\n27FA0\txun\n27FA1\tchan\n27FA2\tjie\n27FA3\tju\n27FA4\tyan\n27FA5\tdu\n27FA7\thong\n27FA8\txian\n27FA9\txun\n27FAE\tling\n27FAF\tjie\n27FB0\tyi\n27FB1\tqu\n27FB2\tgan\n27FB3\tfeng\n27FB5\tjue\n27FB6\tqu\n27FBB\tjiu\n27FBD\tji\n27FBE\tji\n27FC5\txi\n27FC6\tpang\n27FC8\tkuang\n27FC9\tku\n27FCB\tku\n27FCC\tzha\n27FCF\tba\n27FD2\tchen\n27FD3\thu\n27FD4\tnu\n27FD5\te\n27FD6\txiong\n27FD7\tdun\n27FD8\tsheng\n27FD9\twan\n27FDA\tfen\n27FDB\tzong\n27FDD\txi\n27FDE\tzi\n27FE0\thu\n27FE5\tbie\n27FE7\ttuo\n27FE8\tban\n27FE9\tge\n27FEB\tke\n27FF2\tzhui\n27FF3\tfu\n27FF4\tmo\n27FF5\tjia\n27FF6\ttuo\n27FF7\tyu\n27FF9\tmu\n27FFA\tjue\n27FFB\tju\n27FFC\tgua\n27FFD\tpo\n28000\tni\n28001\tlong\n28004\twa\n28005\tyan\n28014\tchou\n28015\tkuang\n28016\thai\n28018\txiang\n28019\txi\n2801B\tcun\n2801C\ttong\n2801D\truo\n2801F\tduo\n28020\tche\n28024\tlei\n28025\tzi\n28027\tzheng\n28028\tzuo\n2802B\tkang\n2802C\tzai\n2802E\tyuan\n2802F\tqiong\n28033\tfa\n28034\txun\n28036\tji\n28038\tcha\n28040\tshu\n28041\txuan\n28042\txie\n28043\tti\n28044\than\n28045\txian\n28046\tshan\n28047\ttun\n28048\thang\n28049\tkun\n2804A\tcen\n2804B\tdou\n2804C\tnuo\n2804D\tyan\n2804E\tcheng\n2804F\tpu\n28050\tqi\n28051\tyue\n28052\tfu\n28057\tting\n2805F\two\n28060\tsheng\n28061\ttuo\n28074\ttan\n28076\tya\n28077\tzhi\n28078\tlu\n28079\tyan\n2807A\tju\n2807D\tde\n2807F\tchu\n28080\tzu\n28081\te\n28082\tzhi\n28083\tpeng\n28085\tbie\n28087\tdi\n28090\tlai\n28092\tye\n2809C\thao\n2809D\tpan\n2809E\ttan\n2809F\tkang\n280A0\txu\n280A1\tzou\n280A2\tji\n280A3\twu\n280A6\tchuan\n280A9\tpo\n280AA\tyan\n280AB\ttuo\n280AD\tdu\n280AF\tpian\n280B0\tchi\n280B1\thun\n280B2\tping\n280B4\tcong\n280B5\tzha\n280BA\twan\n280BF\twai\n280C3\te\n280C4\twei\n280C5\tbai\n280C7\tjiang\n280D3\tcha\n280D5\tchu\n280D6\tkua\n280D7\tteng\n280D8\tzou\n280D9\tli\n280DA\tta\n280DB\tsa\n280DE\tpan\n280DF\tpan\n280E3\tsao\n280E4\tqiao\n280ED\tzu\n280EF\tzhi\n280F0\tyan\n280F2\tjie\n280F3\tneng\n28104\tluan\n28105\tqu\n28107\tdeng\n28108\tliang\n28109\tchan\n2810A\tqie\n2810B\tlou\n2810C\tdie\n2810D\tcui\n28110\tji\n28113\tchao\n28114\tshuan\n28115\tzu\n28117\tkang\n2811A\tqiang\n2811B\tli\n2812E\tshuai\n2812F\tyu\n28130\tzhang\n28131\tlei\n28145\tpo\n2814A\tzhe\n2814B\txiao\n2814D\ttan\n2814E\tcui\n2814F\tlan\n28151\txu\n28152\tshu\n28153\tzha\n28154\tcan\n28157\tbi\n28158\tpeng\n2815B\tzhu\n2815D\tcheng\n28163\tqiao\n28164\tji\n2816A\tzhai\n2816C\tlan\n28181\ttian\n28182\tsa\n28183\tjin\n28184\tzhu\n28185\tduo\n28187\tcha\n28188\tjuan\n28189\ttang\n2818A\tbeng\n2818C\tfan\n2818D\tlie\n2818E\tzei\n2818F\tsui\n28199\tse\n281A7\tzhi\n281A8\ttui\n281AA\tqing\n281AC\tchuo\n281B0\tta\n281B1\tbing\n281B2\twen\n281B5\tpo\n281BD\tmo\n281BE\tca\n281C1\tkuang\n281C3\tcuo\n281C4\trao\n281C5\tbao\n281C6\tlai\n281CD\tnian\n281CE\tli\n281D5\tjiao\n281D6\tlu\n281D7\tli\n281D8\tlong\n281D9\tgui\n281DD\tchan\n281E4\txian\n281E6\tchan\n281E8\txie\n281E9\tzhan\n281EF\tshuang\n281FB\tmi\n281FC\tluan\n281FD\tluo\n28200\tdian\n28208\tdie\n2820A\twan\n2820B\tyue\n2820C\tluan\n2820E\tluan\n28213\tleng\n28215\twai\n28216\tdin\n28217\tnen\n28218\tshao\n28219\txie\n2821A\tpi\n28225\tmao\n28227\tyin\n28229\tbo\n2822B\tzhu\n2822E\tchong\n28236\tmu\n28237\ttuo\n28239\ttong\n2823A\tye\n28241\thuang\n28243\tren\n28245\tye\n2824B\ttuo\n28256\tzuan\n28257\tyu\n2825A\ta\n2825C\tzhou\n2825D\twan\n28261\tduo\n28262\tzhong\n28263\tha\n28264\thuang\n28265\tmian\n28269\tchun\n2826A\tqie\n2826B\tgong\n2826C\tting\n2826D\tmei\n28271\ttang\n28274\trong\n28277\trong\n28278\tqi\n28279\tguo\n2827D\txiang\n2827E\ttian\n28285\txiao\n28288\tzhan\n28289\tcui\n28294\tlan\n28298\tshen\n2829A\tlei\n2829B\tli\n2829D\tchan\n2829E\tnie\n2829F\tluan\n282A1\tting\n282A2\thui\n282A7\tgong\n282B0\tqi\n282B1\tyu\n282B3\txin\n282B8\tyue\n282B9\tba\n282BA\tdai\n282BB\tji\n282BC\txuan\n282BF\tjue\n282C0\tniu\n282C8\tdu\n282C9\tji\n282D0\tpa\n282D1\tgong\n282D2\tben\n282D4\tkeng\n282D5\tyang\n282D6\tliu\n282D7\tni\n282D8\tzha\n282D9\tyin\n282DA\tnian\n282DB\tpao\n282DD\tgong\n282DE\tbu\n282DF\the\n282E0\trong\n282E1\tgui\n282E5\tbi\n282E6\txi\n282E7\tju\n282E8\thun\n282E9\tbi\n282EB\ttiao\n282EC\tzheng\n282EE\thong\n282EF\tyi\n282F0\tci\n282F2\tbing\n282F7\tgong\n282FA\tfa\n282FD\tyang\n282FE\txu\n28301\thong\n28304\tzang\n28305\tchai\n28306\thong\n28308\ttian\n2830C\tzhi\n2830D\txing\n2830E\txu\n28311\tzhen\n28314\twan\n28318\tjun\n2831D\two\n28320\tlu\n28322\tzheng\n28323\trong\n28324\tcheng\n28325\tfu\n28327\te\n28328\ttao\n28329\ttang\n2832B\tjuan\n2832C\tchao\n2832D\tta\n2832E\tdi\n28330\tzong\n28333\tkeng\n28334\ttui\n28336\tkeng\n28345\trong\n28346\tyun\n28347\the\n28348\tzong\n28349\tcong\n2834A\tqiu\n2834E\tmu\n2834F\tduo\n28350\txu\n28351\tkeng\n28352\txian\n2835B\tdu\n2835C\tkan\n2835E\tying\n28362\tzi\n28367\thuang\n28369\tpeng\n2836B\tli\n2836D\tbo\n2836E\tge\n2836F\tju\n28370\tke\n28372\thu\n28373\tyao\n28374\ttang\n28376\tqiong\n28377\trong\n28378\tliu\n28379\thui\n2837A\tji\n28389\tzhi\n2838B\ttang\n2838C\tzhi\n2838D\tkang\n28394\tyang\n28396\ttang\n28397\thong\n2839B\tliang\n2839D\tcao\n283A1\tnai\n283A2\tzong\n283A4\tdeng\n283A6\tjiao\n283A7\tpeng\n283A9\tguang\n283AA\ter\n283AB\tjian\n283AC\tjiao\n283AD\tnuo\n283AE\tzao\n283B3\tpeng\n283B4\tdang\n283B6\tqu\n283B7\tlian\n283B8\tmu\n283B9\tlan\n283BE\tfen\n283C2\thun\n283C6\tkuang\n283C8\tyin\n283C9\tshuan\n283CA\tjian\n283D2\tluo\n283D4\tlu\n283DA\tge\n283DB\trang\n283DE\tpin\n283E0\tlong\n283E4\tzhen\n283E5\txian\n283E8\tlin\n283E9\tlian\n283EA\tshan\n283EB\tbo\n283EC\tli\n283F3\txie\n283F4\tge\n283F5\tmin\n283F6\tlian\n283F9\tjue\n283FA\tzhou\n283FF\tke\n28401\tdie\n28403\tzhe\n28405\tshu\n28406\tji\n28407\tlong\n28408\tguang\n28409\tzao\n2840A\txian\n2840B\tqian\n2840D\tshen\n28410\tyin\n28411\tjie\n28414\tshen\n28415\tshen\n28416\tsa\n2841B\txi\n28421\tku\n28423\tqu\n28425\tge\n28426\tban\n28428\tbi\n28429\tqian\n28430\tbin\n28431\tban\n28433\tzuo\n28434\tpi\n28436\thuo\n2843E\tban\n2844A\tnong\n2844C\tchen\n2844E\tpeng\n28451\tfu\n28452\ttu\n2845C\tpi\n2845D\tpo\n28460\tchi\n28463\txue\n28464\tqi\n28465\twu\n28468\tzhi\n28469\tdi\n2846A\tcong\n2846B\tyou\n28479\tcong\n2847C\tdi\n2847D\tzhuo\n2847F\tzou\n28480\tcong\n28483\tpan\n28484\tyan\n28485\tqi\n28486\trong\n28487\tjia\n28489\tzhi\n2848A\tqiu\n2848B\tyue\n2848D\tshi\n28491\thao\n28499\ttuo\n2849C\tbie\n2849E\tkan\n284A2\tchuo\n284A4\tci\n284A6\tyin\n284A7\tshi\n284A8\thai\n284A9\truan\n284AB\tyang\n284AC\tchi\n284AE\tci\n284B1\tgong\n284B2\tmi\n284B4\tji\n284BC\tgen\n284BD\tzao\n284C1\tbeng\n284C7\txin\n284C8\tkuo\n284CA\tdie\n284CD\tting\n284DA\tshui\n284DE\tdai\n284E6\tli\n284E8\tyong\n284E9\tjiao\n284EC\tta\n284ED\tqu\n284EE\tyin\n284EF\tyuan\n284F0\tjie\n284F2\tqian\n284F3\tyao\n284F4\tya\n284F7\tqing\n284FF\tpei\n28517\tjia\n28519\ttou\n2851B\tti\n28521\tdun\n28522\tchan\n28523\tjia\n28524\tchi\n28525\tjian\n28526\tshu\n2852F\tta\n28555\tzhi\n28557\tyuan\n2855A\thu\n2855C\tlie\n28560\tze\n28562\tchu\n28566\tqiu\n28567\tbeng\n28579\thuan\n2857A\tkua\n2857B\tsheng\n2857D\tjie\n2857F\twang\n28583\thu\n2858A\tze\n2858B\tzan\n2858C\tyang\n2858E\tchi\n2858F\tjiu\n2859A\tliao\n2859B\tyu\n285A0\tbian\n285A2\tkuang\n285AC\tchou\n285AD\tya\n285AE\tzhuo\n285B0\tqie\n285B1\txian\n285B3\tyuan\n285B4\twu\n285B5\tjiao\n285B6\txiang\n285B7\tsha\n285B9\tzhi\n285BC\tchong\n285BE\tbian\n285BF\twei\n285D3\tdao\n285DD\tyu\n285DE\ttui\n285E1\tchao\n285E5\thui\n285E6\tqian\n285E8\twei\n285F0\tyou\n285FC\tdi\n285FE\tda\n28601\tyou\n28602\tjiu\n28603\ttui\n28604\tzan\n28607\thui\n28609\tsha\n2860C\thuo\n28614\tyao\n28619\txian\n2861E\txian\n2862C\tdi\n2862E\tjiu\n28632\thui\n28634\tkao\n28635\tyou\n28638\tli\n2863C\tchuan\n2863E\tchi\n28640\thuo\n28642\tyou\n28644\tyue\n2864E\tta\n2864F\tzan\n28653\tnie\n28654\tzhu\n28661\txian\n28669\tshi\n2866B\tkou\n2866C\tqi\n2866D\ttu\n2866E\tfan\n2866F\tcun\n28672\ttun\n28673\tcha\n28674\tcai\n28675\txiang\n28676\tpei\n28677\tjing\n28678\tqi\n28679\tshao\n2867A\tniu\n2867B\tna\n2867D\tqin\n2868D\tbi\n28693\tbi\n28694\tbao\n28695\tbian\n28696\tzi\n28697\tna\n28698\twei\n28699\thao\n286A1\tjin\n286A3\tzheng\n286A7\tqie\n286AE\thao\n286AF\ttong\n286B0\tzao\n286B1\tsheng\n286B2\tcun\n286B3\thuang\n286B4\tru\n286B5\tzai\n286B6\tnian\n286BE\txian\n286C8\tquan\n286C9\tji\n286CA\tyin\n286CB\tli\n286CC\tmang\n286CD\tshao\n286CE\than\n286CF\tcuo\n286D0\tjun\n286D1\tji\n286D2\tbu\n286D3\tlong\n286D4\tfou\n286D5\tyou\n286D6\tkuai\n286DC\txiang\n286E1\tyun\n286E3\tqin\n286E4\thui\n286E5\tpu\n286EB\tli\n286EC\tpei\n286ED\tshu\n286EE\tju\n286EF\tyi\n286F0\tzheng\n286F1\tchong\n286F3\txi\n286F5\thu\n286F6\trou\n2870C\thuan\n2870D\tqiao\n2870E\tzhi\n2870F\tying\n28710\txi\n28711\tqiao\n28712\tji\n28713\tzheng\n28714\thuang\n28716\tyu\n28717\tzou\n28718\tmei\n2871C\tsheng\n28729\tquan\n28730\tjiang\n28731\the\n28733\ttong\n28734\the\n28735\twen\n28736\tyi\n28737\tpang\n2873A\tweng\n2873B\tqian\n2873C\tli\n2873D\tyi\n2873E\tchuang\n2873F\txu\n28740\twei\n28746\tge\n28748\tyu\n2874B\tzhai\n2874C\tgan\n2874D\tqian\n2874E\tkang\n2874F\tli\n28750\tshen\n28751\tguan\n28753\tpiao\n28755\tgai\n28756\tli\n28758\thu\n2875B\ttu\n2875C\tshun\n2875E\thu\n2875F\tli\n28762\tlou\n28766\tdang\n28768\tzuo\n28769\tshan\n2876B\tshe\n2876D\tfeng\n2876E\tju\n2876F\ttong\n28770\tjiao\n28771\tqiao\n28772\tgao\n28773\tzi\n28774\thuang\n28775\tshan\n28778\ttan\n2878C\ttuo\n2878E\tling\n28790\tcheng\n28791\tweng\n28792\tzuo\n28793\tyu\n28795\tzhu\n28797\tqun\n28798\txi\n28799\tqu\n2879B\tge\n287A2\tqi\n287A3\txu\n287A8\tgai\n287A9\tque\n287AA\tshou\n287AB\tmeng\n287B2\tshen\n287B6\tqiao\n287B7\tcan\n287BA\tli\n287BC\twan\n287BD\tlei\n287BE\txing\n287BF\tlang\n287C2\tshi\n287C3\tzheng\n287C4\tfan\n287CA\tzhi\n287CF\tyin\n287D1\tli\n287D6\tmo\n287D7\twei\n287D9\tying\n287DA\trang\n287E0\tquan\n287E5\tluo\n287F2\tdai\n287F4\tyin\n287F5\tbi\n287F6\tge\n287F8\twen\n287F9\tyan\n287FA\tmian\n287FC\tgang\n287FD\tqiu\n287FE\tzhi\n2880B\tgu\n2880C\ttong\n2880E\tling\n2880F\tti\n28810\tci\n28811\tyi\n28812\tfan\n28813\tpo\n28814\tbi\n28816\tbao\n2881F\tpeng\n28821\tsuan\n28824\tsong\n28825\twei\n28826\txiao\n28828\tji\n2882C\thao\n2882D\tyan\n28836\tyi\n28837\tzao\n28838\tying\n28839\tnan\n2883F\tza\n28841\ttian\n28842\txi\n28843\tjiao\n28844\tyan\n2884C\tnei\n2884D\ttan\n2884E\tyan\n2884F\ttian\n28850\tzhi\n28851\tchou\n28852\ttao\n28857\tzha\n28859\tdan\n2885E\tmian\n28861\twu\n28862\tyin\n28863\tyan\n28864\tlao\n28869\tpo\n2886B\thun\n2886C\thai\n2886D\tmu\n2886E\tcong\n28871\tku\n28872\tchou\n28874\tyou\n28878\tzhuo\n2887A\tkui\n2887B\tsou\n28882\tyin\n28885\tzui\n28886\tsang\n28887\tliu\n28888\than\n28889\twei\n2888A\tmeng\n2888B\thu\n2888C\tli\n2888E\tmi\n28890\tbang\n28891\tjian\n2889C\tque\n288A0\tmeng\n288A2\tmu\n288A3\thong\n288A4\thu\n288A5\tmi\n288A6\tshai\n288A9\tshang\n288AA\tchao\n288AC\tzhuo\n288AE\tzhi\n288AF\tnian\n288B5\tji\n288B8\tke\n288B9\tzheng\n288BF\tdan\n288C0\tliao\n288C1\tzhan\n288C2\tgong\n288C3\tlao\n288C4\thua\n288C5\tchuai\n288C7\tjian\n288C8\tkui\n288CD\tshe\n288D4\tchen\n288D5\ttan\n288D7\thu\n288D8\tmeng\n288D9\tpao\n288DA\tzhan\n288DB\tchang\n288DD\tgan\n288E0\tyi\n288E2\tsui\n288E6\txu\n288E7\tji\n288E8\tlan\n288EC\tyi\n288EF\tmi\n288F1\tmie\n288F5\tcuan\n288F8\tlan\n288FB\tyan\n288FE\tmi\n28902\tyong\n28903\tcang\n28904\tjian\n28907\tsou\n2890E\tyan\n28911\tjuan\n28915\te\n28918\tfen\n2891A\tfen\n28921\tguang\n28922\tmai\n28924\tlie\n28929\tchong\n2892B\tli\n28931\tzhi\n28934\txie\n28937\tchou\n28939\tji\n2893D\tpi\n28942\tjie\n28947\tzhou\n2894D\txiong\n28951\tkuang\n28959\tjing\n2895B\thu\n2895E\tqian\n28963\tcen\n28966\tqi\n28967\twan\n28968\tmao\n2896A\tdou\n28974\tkou\n28976\tdai\n28978\tnao\n2897A\thong\n28982\tlai\n28983\tduo\n28984\tqian\n28986\tyin\n28996\tlou\n28997\thui\n2899B\tfu\n2899C\tmao\n2899E\tzhou\n289A1\tyong\n289AD\tlao\n289AE\tji\n289AF\tyi\n289B0\tliu\n289B1\tcong\n289B3\tnan\n289C0\tdu\n289D0\ttun\n289D1\txiang\n289D5\tbian\n289D6\tchuang\n289D7\twu\n289D9\tju\n289E5\txie\n289E6\tpi\n289E7\tzhuo\n289E8\trui\n289EA\tsao\n289EB\tzi\n289ED\tzheng\n289EE\tmi\n289F0\tzu\n289F1\tqu\n289F3\tchi\n289F5\tzhi\n28A0F\tbo\n28A17\tquan\n28A18\tqian\n28A19\tya\n28A1A\tchao\n28A1B\the\n28A1C\tru\n28A20\tju\n28A21\twu\n28A2C\tchi\n28A2D\tkuang\n28A2F\tcou\n28A30\truan\n28A31\tkuo\n28A32\tchi\n28A33\tzu\n28A34\tjiao\n28A36\tyu\n28A37\ttu\n28A38\tmeng\n28A39\tda\n28A3A\tshuo\n28A65\tfeng\n28A66\tgou\n28A67\tdong\n28A68\tcha\n28A69\tmao\n28A6A\tchan\n28A6B\tbian\n28A6C\tyu\n28A6F\twan\n28A70\tzu\n28A72\tzi\n28A74\tchuan\n28A75\twan\n28A76\twa\n28A78\tquan\n28A7B\twan\n28A7D\txia\n28A84\tying\n28A85\tjian\n28A88\twei\n28A89\tti\n28A8A\tsao\n28A8C\tqi\n28A8D\tsha\n28A8E\tyu\n28A8F\tji\n28A90\tdou\n28A91\tchan\n28A92\ttuan\n28A95\tliu\n28A97\tzhui\n28AB3\truan\n28AB6\tyan\n28AB7\tgu\n28AB9\tli\n28ABA\tcha\n28ABE\tdi\n28ABF\tliu\n28AC0\tzhan\n28AC1\tpo\n28AD2\tlou\n28AD4\tzhi\n28B01\tlian\n28B05\tluo\n28B0D\tduo\n28B10\tjue\n28B11\tli\n28B12\tlan\n28B14\truan\n28B15\tgu\n28B16\tchan\n28B17\txu\n28B1A\tzhi\n28B41\txue\n28B42\tbo\n28B43\tcheng\n28B45\tzhu\n28B46\thei\n28B49\tban\n28B4E\txi\n28B53\tdie\n28B56\tzhan\n28B57\tguo\n28B5A\tbiao\n28B5B\tla\n28B7A\tjin\n28B82\tgai\n28B92\tmeng\n28B94\tyu\n28BAA\txi\n28BAC\tpiao\n28BAD\tsi\n28BB4\tdeng\n28BB8\tchuo\n28BB9\tdi\n28BBA\tji\n28BBB\tchan\n28BBF\tzhuo\n28BD3\tcai\n28BDE\tjiang\n28BF2\ttou\n28BFD\tli\n28C02\tqian\n28C06\tchuo\n28C0F\tta\n28C11\tdiao\n28C13\tjian\n28C1B\tzhi\n28C1C\tjue\n28C1E\tmo\n28C20\tluo\n28C26\tbao\n28C2D\tzuan\n28C35\tzhe\n28C38\tyu\n28C3B\tbao\n28C3E\tma\n28C3F\txi\n28C40\thu\n28C41\tyi\n28C42\te\n28C43\tgu\n28C44\ttu\n28C45\tzhen\n28C47\tqiu\n28C48\tsu\n28C49\tliang\n28C4A\tqu\n28C4B\tling\n28C4C\tguan\n28C4D\tlang\n28C4E\ttou\n28C4F\tda\n28C50\tlou\n28C51\thuang\n28C52\tshou\n28C53\tjiao\n28C54\tzun\n28C55\tgai\n28C56\twei\n28C59\tkun\n28C5A\tduan\n28C5B\tsong\n28C5C\tqi\n28C5D\tyang\n28C61\tshi\n28C63\tgai\n28C66\tdao\n28C67\tyao\n28C6B\tqian\n28C6D\tshao\n28C6E\tchang\n28C6F\tmiu\n28C71\tmo\n28C75\tnao\n28C78\tcong\n28C7A\tnie\n28C7B\tzhao\n28C7C\tcen\n28C7F\tsong\n28C80\tnie\n28C81\tci\n28C84\tjun\n28C86\tshao\n28C88\tzhu\n28C89\tduo\n28C8A\tan\n28C8B\tbi\n28C8E\tti\n28C90\tpi\n28C91\txia\n28C92\tqiu\n28C93\tsheng\n28C97\ttang\n28C9B\tman\n28C9C\tpian\n28C9E\tti\n28C9F\trong\n28CA7\tcong\n28CAA\tji\n28CAB\tfeng\n28CAC\twu\n28CAD\tjiao\n28CAE\tlao\n28CAF\tzeng\n28CB0\tpeng\n28CB1\tcan\n28CB3\tnong\n28CB5\tchan\n28CBE\tman\n28CBF\tgui\n28CC0\tniao\n28CC1\tchong\n28CC2\tchan\n28CC6\tnang\n28CC9\txia\n28CCA\tjiu\n28CCB\tji\n28CCC\tzhen\n28CD1\tting\n28CD4\tmen\n28CD5\tyue\n28CD7\tzhong\n28CD8\ttun\n28CD9\trui\n28CDA\txie\n28CDB\txi\n28CDD\tting\n28CDE\tniu\n28CE0\twang\n28CE1\tjian\n28CE3\tfen\n28CF2\tbian\n28CF7\tyi\n28CFA\tdie\n28CFB\tji\n28CFC\tgan\n28CFF\tjian\n28D00\tjiong\n28D06\tkai\n28D0A\tque\n28D0C\tnan\n28D0D\tmou\n28D0E\txu\n28D0F\tsong\n28D10\tshen\n28D11\tkuang\n28D12\tque\n28D13\twei\n28D17\tdie\n28D18\tnan\n28D1A\truo\n28D1B\tgong\n28D1C\tdou\n28D1E\tnian\n28D21\tchao\n28D22\the\n28D23\tyan\n28D29\ttu\n28D2A\tbu\n28D2C\thu\n28D2D\tyong\n28D2F\tshi\n28D30\tchu\n28D39\txiao\n28D3A\tmen\n28D3B\tli\n28D3C\tti\n28D3E\tjian\n28D42\tzhi\n28D43\tgua\n28D44\tguan\n28D46\tqi\n28D48\tfei\n28D49\tyu\n28D4A\tzhe\n28D4B\twei\n28D4C\te\n28D4D\tchan\n28D4E\txi\n28D50\tgu\n28D57\tque\n28D58\thui\n28D5A\txie\n28D5B\tying\n28D5D\tta\n28D5E\twai\n28D5F\tfu\n28D60\tjie\n28D61\tpi\n28D65\tsheng\n28D66\tyu\n28D67\tkua\n28D69\tpi\n28D6A\txie\n28D6B\tnue\n28D6C\txian\n28D6D\tjian\n28D6E\txu\n28D70\tbi\n28D74\tnan\n28D76\tliang\n28D78\tpian\n28D7C\tjing\n28D80\tta\n28D81\tyan\n28D82\tai\n28D85\txiao\n28D86\tqiang\n28D87\twu\n28D88\ttang\n28D8A\tjun\n28D90\tkuo\n28D97\tlang\n28D99\tneng\n28D9C\tdou\n28D9D\tshu\n28D9F\tjiao\n28DA0\tnie\n28DA2\tyu\n28DA8\tce\n28DAA\tjiao\n28DAC\thua\n28DAD\twen\n28DAE\tye\n28DAF\te\n28DB0\tguang\n28DB1\thua\n28DB2\tjiao\n28DBA\tlei\n28DBC\tshang\n28DBD\tyong\n28DBF\tdeng\n28DC0\tguan\n28DC1\tniu\n28DC3\tsui\n28DC4\txiang\n28DC6\tsa\n28DC7\tchang\n28DCE\trun\n28DD0\tyun\n28DD2\tfen\n28DD3\tjian\n28DD4\txu\n28DD8\txi\n28DD9\tshu\n28DE5\txie\n28DE6\tli\n28DE9\ttou\n28DEC\tmi\n28DED\tchan\n28DEE\thuo\n28DF1\tzhuan\n28DF2\tyue\n28DFB\tlan\n28DFD\tyan\n28DFE\tdang\n28DFF\txiang\n28E00\tyue\n28E01\tting\n28E02\tbeng\n28E03\tsan\n28E04\txian\n28E05\tdie\n28E06\tpi\n28E07\tpian\n28E09\tta\n28E0B\tjiao\n28E0C\tye\n28E0E\tyue\n28E10\treng\n28E11\tqiao\n28E12\tqi\n28E13\tdiao\n28E14\tqi\n28E17\than\n28E18\tyuan\n28E19\tyou\n28E1A\tji\n28E1B\tgai\n28E1C\thai\n28E1D\tshi\n28E1F\tqu\n28E29\twen\n28E2C\tzhen\n28E2D\tpo\n28E2E\tyan\n28E2F\tgu\n28E30\tju\n28E31\ttian\n28E37\te\n28E3A\tya\n28E3B\tlin\n28E3C\tbi\n28E40\tzi\n28E41\thong\n28E43\tduo\n28E45\tdui\n28E46\txuan\n28E48\tshan\n28E4A\tshan\n28E4B\tyao\n28E4C\tran\n28E54\ttuo\n28E57\tbing\n28E58\txu\n28E59\ttun\n28E5A\tcheng\n28E5C\tdou\n28E5D\tyi\n28E61\tche\n28E75\tjuan\n28E76\tji\n28E78\tzhao\n28E79\tbeng\n28E7B\ttian\n28E80\tpeng\n28E85\tfu\n28E96\ttuo\n28E98\txian\n28E99\tni\n28E9A\tlong\n28E9D\tzhuo\n28E9F\tzheng\n28EA0\tshun\n28EA1\tzong\n28EA2\tfeng\n28EA3\tduan\n28EA4\tpi\n28EA5\tyan\n28EA6\tsou\n28EA7\tqiu\n28EA8\te\n28EA9\tqian\n28EAB\tqian\n28EAD\tca\n28EAE\txun\n28EB5\tzhui\n28EB8\tmao\n28EB9\tjiao\n28EBF\tzhan\n28EC0\tpi\n28EC1\txi\n28EC2\tyan\n28EC3\tfei\n28EC4\tnie\n28EC6\tzhi\n28EC8\tsuo\n28ECA\tyi\n28ECC\tlei\n28ECD\txu\n28ECF\tyi\n28ED2\twei\n28ED5\tji\n28ED6\tchen\n28ED7\tdie\n28EE3\tyuan\n28EE5\txi\n28EE7\tliu\n28EE8\tsuo\n28EF1\tbeng\n28EF2\txia\n28EF3\tyan\n28EF5\tcui\n28EF7\tkang\n28EFA\tqing\n28EFB\tlou\n28EFC\tbi\n28F08\tzhan\n28F09\tcuan\n28F0A\twu\n28F0B\txu\n28F0C\tchen\n28F0D\thao\n28F0E\tjue\n28F10\tchen\n28F11\tcha\n28F12\tchan\n28F13\tzhi\n28F14\txun\n28F23\tge\n28F24\tchen\n28F25\tye\n28F2A\tchu\n28F2B\tqu\n28F2C\txie\n28F2E\tzhan\n28F2F\tken\n28F31\tjue\n28F3D\tqu\n28F3F\tmeng\n28F40\tye\n28F41\tzou\n28F42\tpu\n28F44\tshi\n28F49\tshu\n28F4A\tchan\n28F4D\tdu\n28F4F\tguo\n28F50\tlu\n28F51\tyan\n28F56\tniao\n28F57\tbin\n28F5F\ttui\n28F66\tni\n28F67\thuan\n28F68\tqian\n28F6F\txia\n28F72\tling\n28F77\tlian\n28F79\tyi\n28F7B\tli\n28F7C\tsi\n28F7F\tdai\n28F82\twei\n28F85\tci\n28F89\tjiu\n28F8A\thong\n28F8C\tyu\n28F8E\tkui\n28F92\thang\n28F93\tge\n28F94\tfang\n28F97\tkui\n28F9A\tgui\n28F9B\tchi\n28F9E\tjiu\n28FA1\tsui\n28FA4\tdie\n28FAC\tsui\n28FB0\tqin\n28FB4\tgui\n28FBB\tzhui\n28FBE\ttiao\n28FC1\tyue\n28FC7\tzui\n28FCF\twu\n28FD0\tcui\n28FDB\tzhi\n28FE0\tshui\n28FE2\tdong\n28FED\twei\n28FFF\tchong\n2900B\trun\n29016\tji\n2901C\tdiao\n2901E\tcang\n29020\tkou\n29023\twei\n29027\tcan\n2902A\tma\n2902B\tou\n29032\tsan\n29036\twei\n2903C\tsan\n2903F\tjin\n2904C\twei\n2905E\tcai\n2905F\tli\n2906F\tyue\n29074\tyun\n29077\tcheng\n2907A\tshan\n29082\thu\n29083\tshai\n29084\ttun\n29086\tfou\n29088\tqin\n29089\txu\n2908D\tchuan\n2908E\tfu\n29092\tyi\n29093\tdong\n29094\tfu\n29095\tfu\n29096\tze\n29097\tpu\n29099\tling\n2909D\tshai\n2909E\tpao\n290A2\tyin\n290A3\tluo\n290A4\thua\n290A5\tyin\n290A6\tbeng\n290A7\tyu\n290A8\tshe\n290AA\txie\n290AB\tchu\n290B4\tshe\n290B5\tdian\n290B9\tyi\n290BB\tche\n290BC\tgeng\n290BD\tlong\n290BE\tping\n290BF\tyun\n290C0\tyan\n290C1\tmo\n290C3\tsui\n290CB\tjing\n290CD\tsong\n290CE\tpang\n290D0\tya\n290D1\tse\n290D2\tduo\n290D5\tchuang\n290D6\txie\n290D8\ttuan\n290D9\tgong\n290DA\txuan\n290DC\tla\n290DE\tling\n290E0\tdai\n290E1\tzha\n290EC\tyin\n290ED\tsong\n290EF\tyu\n290F0\ttuo\n290F1\ttuo\n290F4\tba\n290F5\tran\n290F6\tbo\n290F7\tdai\n290F9\tzha\n290FA\thou\n290FE\thui\n29105\tlu\n2910A\tling\n2910B\tru\n29115\tdan\n29116\tmeng\n29117\txia\n29118\tweng\n29119\than\n2911A\tzi\n2911B\tzhen\n2911C\tse\n2911D\tcuo\n2911E\tli\n29120\tdian\n29121\tlian\n29122\tgou\n29126\tpeng\n2912A\tying\n2912C\thou\n2912E\tdui\n2912F\twu\n29137\tpiao\n29138\the\n2913A\tlong\n2913B\tmo\n2913C\tfei\n2913D\tlu\n2913E\tze\n2913F\tbo\n29140\tdian\n29141\tmang\n29143\tzhuang\n29144\tlu\n29145\tpang\n29146\tdui\n29147\tbu\n2914C\tchen\n2914D\tman\n29156\txi\n2915D\tan\n2915E\tzhong\n29160\tnan\n29161\ttuo\n29162\the\n29165\tdui\n29166\twan\n29167\tzhong\n29168\tcen\n29169\tli\n2916A\tshuang\n2916E\tcen\n29170\tsi\n29172\tdui\n29174\thun\n2917C\tjian\n2917D\tnong\n2917E\tdan\n2917F\tfu\n29180\thuo\n29181\thui\n29182\tci\n29184\tyong\n29185\tsa\n29186\tting\n2918E\tliu\n29191\tsuan\n29192\tling\n29193\tman\n29194\tdian\n29198\tpao\n2919A\tling\n2919D\tli\n2919F\tnou\n291A3\tlie\n291A4\tshan\n291A6\tfei\n291AB\tshan\n291AE\tling\n291AF\tzhan\n291B1\tbin\n291B2\tli\n291B5\tsi\n291B6\trang\n291B7\tjian\n291B8\tzhuo\n291BB\tling\n291BC\tling\n291BD\tmeng\n291BF\tshuang\n291C4\tling\n291C7\thun\n291CE\tling\n291CF\tjian\n291D0\tqu\n291D4\tnong\n291D5\tjing\n291D6\tchen\n291DC\tzhen\n291DD\tqing\n291DF\tqing\n291E0\te\n291E3\tse\n291E9\tbei\n291EB\tfei\n291EE\tfei\n291EF\tfei\n291F4\tfang\n291F5\tku\n291FA\tza\n291FB\thui\n291FD\tfei\n29201\tdui\n29206\tpa\n29207\tniu\n29208\tpang\n29209\tdan\n2920A\tdan\n2920B\tai\n2920D\ttian\n2920E\tchao\n2920F\tao\n29210\tmei\n29211\tnan\n29214\tbo\n29215\tyu\n29216\txian\n29217\tmai\n2921A\tping\n2921C\tdui\n2921E\tdao\n29221\txing\n29222\tni\n29223\than\n29224\tchu\n29225\tshua\n29226\tman\n2922C\twan\n2922D\tyi\n2922E\tdiao\n2922F\tyan\n29231\two\n29232\tsuan\n29234\tan\n29235\tlan\n29236\tnan\n29238\tqiu\n29239\tmian\n2923A\tnuo\n2923B\tcan\n2923C\tcan\n29240\tlan\n29241\ttian\n29242\tye\n29244\tnian\n29246\tshua\n2924B\tci\n2924D\tjian\n29250\tgan\n29254\tjian\n29255\tguo\n29257\tzhan\n29259\tluo\n2925C\tji\n2925D\tgui\n29261\tjia\n29262\tji\n29265\txuan\n29267\tfeng\n2926B\tbi\n2926C\tqi\n2926F\tyuan\n29270\tang\n29271\tdi\n29274\te\n29275\tfen\n29278\tju\n29279\tni\n2927A\ttuo\n2927C\tshen\n2927D\tfu\n2927E\txia\n2927F\tqu\n29280\tpo\n29281\twan\n29282\tling\n29283\tma\n29284\tzhou\n29285\tbao\n29287\tyu\n2928C\tbeng\n2928D\tmai\n2928F\tjia\n29291\tyang\n29293\tkua\n29294\tjiao\n29296\tbing\n2929A\tluo\n2929B\tgui\n2929C\tduo\n2929D\tzhi\n292A1\tzhen\n292A2\te\n292A3\tzhu\n292A4\tba\n292A8\tzhen\n292A9\tfeng\n292AA\tdou\n292AB\tnian\n292AC\tbu\n292AD\tdui\n292AE\tsha\n292AF\tse\n292B0\tbi\n292B4\tzhi\n292B5\tzhe\n292B6\tbu\n292BA\tjue\n292BB\txun\n292BF\txi\n292C1\tzhuo\n292C2\tbai\n292C3\tyao\n292C4\tchou\n292C5\tta\n292C6\tqian\n292C8\tnao\n292C9\tyu\n292CA\te\n292CB\tjian\n292CC\tyi\n292CD\txiao\n292CF\tnie\n292D2\tbing\n292D7\tguo\n292D8\txie\n292D9\tdiao\n292DC\tju\n292DD\tsuo\n292DE\tdie\n292DF\tfu\n292E0\tmian\n292E1\tshi\n292E2\txuan\n292E3\tti\n292E4\tyu\n292E7\txie\n292E8\tfu\n292E9\tzhi\n292EA\tni\n292EB\txuan\n292EC\tyang\n292EE\tfeng\n292EF\tzong\n292F0\tzhou\n292F1\txuan\n292F5\tzhu\n292F7\tla\n292F9\tying\n292FA\tgao\n292FB\tkuo\n292FD\te\n292FE\twei\n292FF\tmei\n29303\thuai\n29304\tchou\n29306\tsuo\n29307\tta\n29308\tsuo\n29309\tta\n2930A\txue\n2930C\tgong\n2930D\tjia\n2930F\tbo\n29310\tta\n29311\tyuan\n29318\tta\n2931D\tchui\n29320\txiong\n29321\the\n29322\tsuo\n29327\tmo\n29328\tchong\n29329\tsui\n2932A\tze\n2932B\tlu\n2932C\tzhang\n2932D\tluo\n2932E\txu\n2932F\tjian\n29330\tshan\n29332\txu\n2933E\tjiang\n29342\tbao\n29343\tmai\n29345\ttong\n29346\txi\n29349\trong\n2934B\tsheng\n2934C\tzhou\n2934E\tjian\n2934F\tfu\n29350\tdeng\n29353\tyong\n29354\tju\n29356\tyi\n29357\tbang\n29359\tse\n2935A\tsui\n2935C\tduo\n2935D\txie\n29361\thuan\n29365\tru\n29366\tni\n29367\tzhou\n29368\tgui\n2936A\tluo\n29372\tzhi\n29373\txu\n29375\tzhi\n29377\tjue\n29378\tju\n2937B\tyuan\n2937C\tlu\n2937F\tbo\n29382\trong\n29383\txie\n29389\txi\n2938A\tluo\n2938E\tge\n29391\tzuan\n29392\than\n29394\tjiao\n29395\tsa\n29396\tqin\n29397\tqun\n29398\tpao\n29399\tyue\n2939A\tche\n2939B\tfu\n2939C\tpei\n2939F\tmei\n293A2\ttao\n293A4\tken\n293A5\txi\n293AB\tduo\n293AD\tyi\n293B0\tsui\n293B2\txia\n293B3\tjuan\n293B5\twei\n293B7\tyi\n293B9\tyu\n293BB\tbai\n293BC\ttuo\n293BD\tta\n293BE\tpao\n293C2\tbing\n293C5\tyun\n293C6\tyun\n293C7\tduan\n293C8\truan\n293C9\twei\n293CF\twei\n293D0\tgui\n293D2\tda\n293D3\txia\n293D6\thun\n293D7\tjuan\n293D8\tsui\n293DA\tsui\n293DD\tlou\n293DE\tbai\n293DF\tyu\n293E0\tzheng\n293E1\tgui\n293E3\tkui\n293E4\tgao\n293E5\tdan\n293E9\txian\n293EA\tzhai\n293EB\tse\n293ED\tke\n293EE\tbu\n293EF\tbo\n293F2\tsui\n293F4\tyu\n293F5\tbu\n293F6\tjiu\n293F7\tjiu\n293F9\tjuan\n293FA\tjue\n293FC\tna\n293FD\tzhai\n293FE\ttao\n293FF\twei\n29400\txia\n29401\txie\n29405\tsa\n29406\tji\n29409\txie\n2940C\tdui\n2940D\tzi\n29418\tyuan\n29419\tqin\n2941A\tfu\n2941B\tpeng\n2941C\tpao\n2941E\tyin\n29420\thong\n29421\tzu\n29423\tgong\n29424\tdong\n29425\the\n29426\two\n29428\tpang\n2942B\tsu\n2942C\tkan\n2942D\tnie\n2942E\thao\n2942F\tfeng\n29430\te\n29431\tye\n29434\tting\n29435\tdong\n29436\tzhe\n29437\tsang\n2943B\tmo\n2943C\tsu\n2943E\tle\n29440\tpu\n29441\te\n29442\tzhuo\n29443\tye\n29447\txiang\n29448\tguang\n29449\tren\n2944A\tling\n2944D\tao\n29450\tchai\n29452\tduo\n29453\tqiong\n29454\tku\n29455\txu\n29456\thuan\n29457\tyao\n29458\tzhen\n29459\tting\n2945A\tbeng\n2945D\tang\n2945F\tkan\n29461\tku\n29462\tpei\n29463\tyou\n29464\tao\n29465\tmen\n29466\tmo\n2946C\tfu\n2946D\tqing\n2946E\tla\n2946F\tdou\n29470\ttan\n29473\tqian\n29474\tyao\n29475\twei\n29476\thu\n29477\tmo\n29478\the\n29479\txuan\n2947B\tbi\n2947C\tpo\n2947E\tdi\n29480\tzhen\n29482\tshi\n29483\tkan\n29484\tce\n29487\txu\n29488\tzhen\n2948A\tzhu\n2948F\thui\n29490\tchi\n29493\thong\n29494\tnou\n29495\tnie\n29496\tyan\n29498\tchong\n29499\tfu\n2949A\tguang\n2949B\tqi\n2949D\tgen\n2949E\tting\n294A2\ttan\n294A3\tqian\n294A6\tjiu\n294A7\txu\n294A8\tqi\n294AA\tzhen\n294AE\tqiu\n294B0\te\n294B3\thui\n294B4\thong\n294B5\tqing\n294B7\tche\n294BA\tfu\n294BC\thong\n294BD\txi\n294BE\twu\n294BF\tmang\n294C2\tti\n294C5\thong\n294D0\tbo\n294D2\tqin\n294D3\tgen\n294D6\tfu\n294D7\tkui\n294DD\tbie\n294DE\tjing\n294DF\tkan\n294E0\tgui\n294E2\tgao\n294E3\txu\n294E4\tan\n294E5\tyue\n294E6\twu\n294E7\tyi\n294E8\tjing\n294EA\tlu\n294EB\tquan\n294EC\ttui\n294EE\tji\n294FA\tjiong\n294FB\tjue\n294FC\tpie\n294FD\tkun\n29500\twai\n29501\thui\n29502\tdun\n29503\tyuan\n29504\tjie\n29506\tgui\n29507\tgao\n29508\tpo\n29509\tmen\n2950A\tzhuan\n2950B\thang\n29514\tyong\n29515\tqiu\n29517\tlei\n29518\tang\n29519\tpi\n2951A\tweng\n2951D\tqin\n2951F\tqin\n29520\tmie\n29521\tdou\n29522\tmi\n29523\tzhan\n29525\tqing\n29526\tyi\n2952E\tban\n29531\tjuan\n29533\tze\n29534\txu\n29535\tlan\n29536\tma\n29537\tma\n29538\tou\n29539\tbei\n2953B\tpou\n2953C\txu\n29540\tao\n29546\thong\n29549\thong\n2954A\tzhan\n2954C\tsen\n2954D\tgao\n2954F\tpo\n29550\tliao\n29555\twai\n29556\txuan\n2955C\tkui\n2955F\te\n29560\than\n29561\tse\n29564\tdan\n2956A\txuan\n2956C\te\n2956D\tgai\n2956F\tdao\n29571\tmeng\n29572\tyi\n29573\tning\n29575\tpin\n29579\tcang\n2957E\tyuan\n29580\te\n29581\tnie\n29584\tyin\n29587\tqiao\n29589\thong\n2958A\tling\n2958C\tchan\n2958D\tying\n29592\tguan\n29594\tniao\n29595\txu\n29596\ttan\n29597\tjin\n2959B\tpeng\n2959D\tliao\n295A0\tbei\n295A3\txin\n295A4\ttun\n295A5\tchao\n295A6\tgan\n295A8\thu\n295A9\twang\n295AC\tfu\n295AD\tpei\n295AF\tnao\n295B0\txun\n295B1\txue\n295B4\tliu\n295B5\tling\n295B6\txue\n295B7\tqu\n295B8\thao\n295B9\tyi\n295BA\than\n295BC\tfu\n295BD\tba\n295BE\tyi\n295C0\tbo\n295C4\thong\n295C5\tli\n295C9\tsa\n295CA\txi\n295CE\tshi\n295CF\tpiao\n295D0\thua\n295D1\tyi\n295D2\tbo\n295D3\tbo\n295D4\tnei\n295D5\tqiu\n295D8\twei\n295D9\tche\n295DA\tyou\n295DC\twei\n295DD\thui\n295DE\tsa\n295E1\ttao\n295E2\thong\n295E3\tsou\n295E4\than\n295E5\tpao\n295E7\tfang\n295E9\tliu\n295EA\tzhou\n295EB\tpi\n295ED\tli\n295F0\tchui\n295F1\txi\n295F2\tzheng\n295F4\tbeng\n295F5\tzheng\n295F6\tsui\n295F7\tyan\n295FC\tqing\n295FD\twu\n295FE\tliang\n29600\tzhao\n29601\tliang\n29605\tjie\n29607\thong\n29608\tyou\n2960A\tla\n2960B\thou\n2960D\tyuan\n2960E\thong\n2960F\tye\n29611\tying\n29612\txuan\n29613\tyou\n29618\tquan\n2961C\ttang\n2961D\tsuo\n2961F\tli\n29620\tsou\n29621\tli\n29624\tyu\n29627\tyi\n2962D\txiu\n2962E\tao\n2962F\ttuan\n29630\tsu\n29631\tshuai\n29633\tyu\n29635\tfeng\n29639\tsu\n2963A\ttui\n2963B\tyu\n2963C\tzheng\n2963D\tzheng\n2963F\ttao\n29644\tliu\n29646\tcheng\n29647\tsui\n29648\tsao\n2964F\tgu\n29650\tfeng\n29651\tlie\n29652\tpiao\n29656\tli\n29658\tlong\n29659\tchu\n2965A\txiao\n2965B\thong\n2965C\txie\n2965D\tshe\n29660\tlong\n29661\thou\n29662\txuan\n29663\tfeng\n29665\tba\n29666\tbo\n29667\ttao\n29668\tsu\n29669\tzhao\n2966A\tbiao\n2966B\tsou\n2966C\ttui\n2966D\tsuo\n2966E\txiao\n2966F\theng\n29670\tsao\n29672\tfei\n29677\tniu\n29678\tmang\n2967D\thuan\n2967E\tzhi\n29682\tyi\n29684\tyu\n29687\tyi\n29688\tyue\n29689\tchi\n29695\tyin\n29696\tniu\n29697\trong\n2969B\tna\n296A3\ttian\n296A5\tba\n296AA\ter\n296AB\tzheng\n296AC\te\n296AD\tpou\n296AE\tji\n296AF\tni\n296B1\tjiong\n296B2\tjia\n296B5\tgan\n296B9\tling\n296BB\tzui\n296BE\tbei\n296C5\tshu\n296C6\tyi\n296C7\tpai\n296CB\tnao\n296CC\tshi\n296CE\tman\n296CF\tshi\n296D1\tti\n296D8\tgong\n296DD\tlei\n296DE\tbao\n296DF\tyuan\n296E0\tzuo\n296E1\tlang\n296E2\txiu\n296E5\tzai\n296E6\tcheng\n296E7\tjian\n296E8\tmao\n296E9\tjia\n296EA\tyu\n296ED\tyu\n296EE\tyi\n296F2\tmang\n296F3\tzai\n296F5\tzhui\n296F6\tti\n296F9\txi\n296FA\tju\n296FB\tzan\n296FC\tlu\n296FD\ttao\n29700\tzhui\n29701\tling\n29703\tju\n29706\tji\n29707\tjuan\n2970A\tzi\n2970C\tyue\n2970D\tdong\n29712\tnang\n29716\tchong\n2971F\tang\n29723\tgeng\n29725\tbo\n29726\tding\n29727\twei\n2972C\tquan\n2972D\tke\n29730\tpi\n29731\tkan\n29732\tfu\n29733\tyong\n29735\ttuan\n29736\ttou\n29737\tyou\n29738\tyao\n2973A\tye\n2973D\tyan\n29748\txian\n2974A\tti\n2974C\tsui\n29750\tci\n29754\txu\n29755\twu\n29756\tcan\n29757\tyu\n2975A\tchan\n2975B\txia\n2975D\tkao\n2975E\tcang\n2975F\tcha\n29760\tqiu\n29763\tda\n29765\tsu\n29768\thua\n29777\twu\n29778\tyuan\n2977D\tjiang\n2977E\txiang\n2977F\tzhai\n29780\tsan\n29781\tmo\n29783\tshang\n29784\tcao\n29785\tsui\n29786\tchuang\n29787\tmi\n29788\tzhu\n29789\tchong\n2978A\tji\n2978B\tchong\n29799\tlian\n2979E\thai\n297A4\tdun\n297A5\txiang\n297A6\tcheng\n297A7\tshang\n297A8\tli\n297A9\thuang\n297AC\tdeng\n297AF\tliang\n297B6\tza\n297BA\thuo\n297BB\tlin\n297BE\tdu\n297BF\than\n297C0\tyong\n297C1\tyuan\n297C2\tguo\n297C3\tling\n297C5\tlian\n297C7\tao\n297C8\tdang\n297C9\tyi\n297CA\tnong\n297CB\tshan\n297CD\txin\n297D0\tda\n297D1\tyu\n297D2\tcan\n297D3\two\n297D4\tcha\n297D5\tbo\n297D7\tjian\n297DE\tmeng\n297DF\twei\n297E0\tmo\n297E5\tshui\n297E6\tjie\n297E7\tshuo\n297E8\thuo\n297EB\tchuo\n297ED\tlong\n297EE\thuai\n297F0\ttuo\n297F3\tyu\n297F6\tchan\n297F7\tyong\n297F8\thuo\n297FA\tlan\n297FF\tna\n29800\tba\n29801\tgan\n29802\tyi\n29803\tjia\n29805\tda\n29806\tding\n29807\txun\n29808\tren\n29809\tjuan\n2980A\ttuan\n2980B\txu\n2980C\tsong\n2980E\tcao\n2980F\tcheng\n29811\tding\n2981A\thai\n2981F\twu\n29826\tqi\n29828\tji\n2982E\tkui\n2982F\twei\n29836\tshou\n29837\tfu\n29839\ttuan\n2983B\tbie\n2983D\ttan\n2983E\thang\n2983F\tpie\n29843\tyu\n29844\ttan\n2984C\txiang\n2984E\txiu\n29853\tweng\n29854\thai\n29855\tpeng\n29856\tyi\n2985D\ttan\n2985F\tbie\n29860\txiang\n29863\tyi\n29866\tpiao\n29867\thuan\n29868\tmu\n29869\tba\n2986B\tfan\n2986F\tding\n29877\tfen\n2987A\tjie\n2987E\tsuo\n29884\twan\n29885\tge\n29888\tfen\n2988A\ttuo\n2988C\twen\n2988D\tgua\n2988E\tduo\n29890\tzhe\n29891\tci\n29892\tyao\n29894\tban\n29895\tbu\n29896\tmo\n29898\tpo\n2989B\tge\n2989E\tliu\n298A1\tran\n298A8\tgan\n298AA\thu\n298AB\tmou\n298AE\txiu\n298AF\thuang\n298B0\tfu\n298B1\thui\n298B3\tqu\n298B4\tjie\n298B5\ttuo\n298B6\tyu\n298B7\tmo\n298B8\tzhou\n298B9\tjiu\n298BB\tshu\n298BC\tkuang\n298BD\tqiong\n298BE\tlie\n298BF\tfu\n298CA\txu\n298D6\tlin\n298D8\tnie\n298DA\tpi\n298DC\tfu\n298DD\tbu\n298DE\tyi\n298E1\tbo\n298E3\te\n298E9\tzhe\n298EB\tli\n298EE\ttu\n298EF\tda\n298F1\tlu\n298F2\tyan\n298F3\tdong\n298F4\tqie\n298F5\twan\n298F6\tming\n298F7\tzui\n298F8\tfu\n298F9\tqu\n298FA\tben\n298FB\tao\n298FC\tqiang\n29901\tqun\n29908\tque\n29909\thua\n2990A\txian\n2990B\tkun\n2990F\tcui\n29912\tyi\n29916\tchi\n29917\tzong\n29918\tnao\n29919\tcheng\n2991A\tduan\n2991B\tyong\n2991C\tzhe\n2991E\ttan\n2991F\tyang\n29920\txie\n29921\txuan\n29923\tduan\n29924\tshua\n29925\txian\n29926\txian\n29929\te\n29932\tla\n29938\twei\n29939\tyou\n2993A\tyu\n2993D\tti\n2993F\tjin\n29941\ttang\n29942\tqi\n29944\tdian\n29945\ttao\n29946\tlu\n29947\tzhan\n29948\twen\n29949\tji\n2994A\tao\n2994B\tou\n2994C\tqia\n29950\tshi\n29951\tta\n29954\tmo\n29958\tyou\n29960\tzha\n29963\tyao\n2996B\tchong\n2996C\tli\n2996D\tyu\n2996E\tchan\n2996F\tyi\n29972\tchi\n29974\tli\n2997D\ttu\n2997F\tzu\n29982\txian\n29987\txi\n29989\tbie\n2998A\than\n2998B\tqi\n2998C\tsang\n2998E\tfei\n29990\tshan\n29998\thuan\n299A0\tbang\n299A1\tyu\n299A2\tyu\n299A4\tji\n299B1\tkuai\n299B2\tzong\n299B9\txian\n299BA\tmeng\n299C3\tli\n299C4\tzhi\n299C5\tfan\n299C6\tlie\n299C7\tcai\n299C8\tdu\n299C9\tguang\n299CA\txiong\n299CB\tli\n299CC\tqi\n299CF\tjue\n299D0\ttuo\n299D2\tju\n299D3\txiao\n299D8\tqu\n299DC\tzhuan\n299E1\tjue\n299E6\tjie\n299E8\tzhou\n299E9\txian\n299EA\tlong\n299EB\tyang\n299EC\tran\n299ED\tyi\n299EE\tlie\n299EF\tbo\n299F0\thun\n299F1\tji\n299F2\tdong\n299F3\tzhou\n299F4\tquan\n299F5\tjie\n299F8\tli\n299FA\tju\n299FB\twan\n299FC\tben\n299FF\tbi\n29A00\tge\n29A01\tchun\n29A03\tqian\n29A04\tsou\n29A05\twei\n29A06\tcheng\n29A07\tlou\n29A08\tyu\n29A09\tla\n29A0A\tqian\n29A0B\tdian\n29A0C\tta\n29A0D\tzhan\n29A0F\tfan\n29A10\tlie\n29A11\tting\n29A12\tji\n29A13\tqian\n29A14\thu\n29A17\tyu\n29A18\tqi\n29A19\tyu\n29A1A\twa\n29A1C\tba\n29A1D\tqi\n29A1E\tsa\n29A1F\tqiao\n29A20\tya\n29A21\txian\n29A28\tci\n29A29\tfan\n29A2B\tkun\n29A2C\tgun\n29A2D\tque\n29A2E\te\n29A2F\tqiong\n29A32\tma\n29A33\tku\n29A34\tyao\n29A37\tque\n29A38\tchu\n29A39\tjia\n29A3B\tzhu\n29A3D\tdui\n29A3E\twa\n29A40\tnao\n29A44\tyan\n29A45\ttong\n29A48\tkuai\n29A4B\txing\n29A4C\tgun\n29A4D\tping\n29A51\tyu\n29A52\the\n29A54\tzhuo\n29A57\tshe\n29A58\tyu\n29A5B\tji\n29A5D\tqiang\n29A5E\tshui\n29A5F\tchuo\n29A60\tzu\n29A61\tleng\n29A62\tni\n29A64\twa\n29A65\tzha\n29A67\tdan\n29A6E\tdu\n29A6F\tbian\n29A70\tjie\n29A71\tqia\n29A72\the\n29A73\tchong\n29A74\tyan\n29A76\tyan\n29A7A\tsong\n29A7B\tteng\n29A7C\tyao\n29A7E\tkao\n29A80\tzhui\n29A81\tgui\n29A82\tai\n29A83\thai\n29A88\tsuo\n29A89\txu\n29A8A\tbiao\n29A8C\tfeng\n29A8D\tqu\n29A8E\tmang\n29A90\tguo\n29A96\tbi\n29A97\tjue\n29A98\tchuang\n29A9B\tpu\n29A9F\tyi\n29AA2\tqian\n29AA3\tyi\n29AA4\te\n29AA5\tling\n29AA7\tbi\n29AAD\thuo\n29AAE\tmo\n29AB1\txun\n29AB4\tyan\n29AB8\tli\n29ABA\ttan\n29ABE\tluan\n29AC0\tkai\n29AC1\tmao\n29AC2\txiao\n29AC7\tai\n29ACA\tta\n29ACD\tmei\n29ACF\tguo\n29AD3\tgao\n29AD4\tnao\n29AD5\thao\n29AE0\tque\n29AE5\tcao\n29AE6\tsao\n29AEB\tpi\n29AF2\txie\n29AF3\txiao\n29AF4\tju\n29AF9\tcheng\n29AFA\tnao\n29B00\tnei\n29B0D\tmu\n29B0F\tshao\n29B11\tdian\n29B14\tling\n29B16\tzhen\n29B17\tyao\n29B19\tfu\n29B1A\tqian\n29B1B\tqiong\n29B1C\tju\n29B1D\tbing\n29B1E\tmao\n29B1F\tzha\n29B20\ttai\n29B24\tchong\n29B2B\tzhai\n29B2D\tshi\n29B2E\tyong\n29B30\tqiong\n29B31\tdao\n29B32\tti\n29B33\tzhui\n29B35\tyin\n29B37\tnao\n29B38\tbo\n29B39\tkuang\n29B3A\tzhi\n29B3B\tduo\n29B3C\tcong\n29B3D\tbao\n29B3E\tya\n29B47\tli\n29B4A\tju\n29B4B\twen\n29B4C\tlie\n29B4F\two\n29B50\tshi\n29B51\tniao\n29B52\tmang\n29B53\tjiu\n29B58\txiu\n29B5D\two\n29B5F\tdao\n29B61\txi\n29B62\tan\n29B63\tda\n29B64\tzong\n29B65\than\n29B66\tchui\n29B67\tbi\n29B69\tdong\n29B6B\tzhang\n29B6F\tya\n29B72\tdi\n29B73\thuo\n29B77\tmin\n29B79\tsan\n29B7A\tfu\n29B7C\tbao\n29B7D\tke\n29B7E\tmao\n29B7F\tre\n29B80\tzong\n29B81\tqia\n29B82\txia\n29B83\tsou\n29B84\txiu\n29B85\tna\n29B89\tman\n29B8E\tzha\n29B8F\tchan\n29B90\tshe\n29B91\two\n29B96\tai\n29B97\tbang\n29B98\thao\n29B9A\tsao\n29B9B\tsuo\n29B9C\tti\n29B9D\tya\n29B9F\tbing\n29BA0\trong\n29BAB\tsha\n29BAC\tweng\n29BAF\tao\n29BB1\tzhuang\n29BB3\tpiao\n29BB4\tsui\n29BB5\tyi\n29BB6\tsou\n29BB7\tdou\n29BB8\tsou\n29BB9\tluo\n29BC3\tfei\n29BC4\tzun\n29BC6\tnao\n29BC7\tdeng\n29BC8\tzhi\n29BC9\tcuo\n29BCA\tliao\n29BCB\tji\n29BCC\tbo\n29BCD\tcong\n29BCE\tcheng\n29BCF\tbu\n29BD1\tsan\n29BD2\tzan\n29BD8\tjiao\n29BDB\tyao\n29BDC\tlu\n29BDE\tcan\n29BE8\tni\n29BF0\tjie\n29BF1\tpu\n29BF2\tzhuang\n29BF3\tzan\n29BFA\tli\n29BFD\tla\n29C00\tchong\n29C03\tzhan\n29C0D\tbian\n29C0E\tweng\n29C13\thong\n29C17\tpin\n29C19\tse\n29C1E\tni\n29C1F\tfen\n29C20\txu\n29C22\tshi\n29C24\tju\n29C28\tjue\n29C2A\tyu\n29C2C\tguo\n29C2D\tguo\n29C2F\thu\n29C30\tjing\n29C32\tli\n29C33\txie\n29C34\ter\n29C35\tyuan\n29C36\thai\n29C39\tjing\n29C3B\tke\n29C3D\tzong\n29C3E\tfei\n29C40\tpeng\n29C41\tgeng\n29C43\tjian\n29C44\tni\n29C46\txian\n29C47\tli\n29C48\tchao\n29C4A\ter\n29C4B\tgeng\n29C4C\tyu\n29C4D\thu\n29C4E\tfei\n29C4F\tao\n29C53\ter\n29C58\tke\n29C59\tku\n29C5A\tbo\n29C5D\tye\n29C5E\tjiao\n29C66\tchao\n29C67\tgeng\n29C68\tru\n29C6A\tyue\n29C6C\tlin\n29C71\tyu\n29C72\tyue\n29C73\tzhai\n29C74\txiao\n29C77\tmie\n29C7B\tgui\n29C7C\tjiu\n29C7E\ttuo\n29C81\txi\n29C82\twei\n29C83\tzhuo\n29C84\twei\n29C85\tkui\n29C88\tmei\n29C8A\thao\n29C8B\thang\n29C8C\tfang\n29C8D\tniu\n29C8E\tyou\n29C8F\thua\n29C92\tlang\n29CA0\tzhu\n29CA1\tgui\n29CA2\tbi\n29CA3\tjia\n29CA4\ttiao\n29CA6\tlu\n29CA7\tkong\n29CA8\tzui\n29CA9\tling\n29CAA\tqi\n29CAC\tzhu\n29CB1\tgu\n29CB2\tzu\n29CB4\tyang\n29CB5\tsu\n29CB7\tkui\n29CB9\tchang\n29CBB\tyao\n29CBE\tyu\n29CC5\tshu\n29CC6\tlai\n29CC7\tyi\n29CC8\tdou\n29CCC\twu\n29CCD\tying\n29CCE\tfu\n29CCF\tzhuan\n29CD0\tfu\n29CD2\tsu\n29CD3\tli\n29CD4\tyao\n29CD5\ttui\n29CDD\tgui\n29CE1\tlu\n29CE2\tyan\n29CE3\tqi\n29CE4\tlang\n29CE5\tzhu\n29CE7\tgui\n29CE8\thu\n29CEF\tjing\n29CF2\tchi\n29CF5\tju\n29CF6\tzha\n29CF8\tmiao\n29D00\tzhu\n29D01\tgan\n29D02\txiong\n29D03\tji\n29D07\tshai\n29D08\tmei\n29D09\tyun\n29D0C\tgan\n29D0D\tshou\n29D10\tlu\n29D11\tyou\n29D12\tjiang\n29D13\tnuo\n29D18\tju\n29D19\tyou\n29D1C\tyi\n29D1D\tteng\n29D1E\twei\n29D1F\tche\n29D20\tlin\n29D21\tgu\n29D23\tli\n29D24\tliao\n29D27\tjiao\n29D28\tyang\n29D29\tbiao\n29D2A\tqi\n29D2E\tyi\n29D31\tbin\n29D32\tmeng\n29D33\tcha\n29D35\tgan\n29D39\tqu\n29D3A\tdi\n29D3B\tlei\n29D40\tling\n29D44\thuan\n29D45\tqu\n29D47\tluo\n29D49\tkui\n29D4D\tqiu\n29D4E\tyu\n29D4F\thua\n29D53\tlei\n29D55\tren\n29D56\txiao\n29D57\tsi\n29D5A\tdu\n29D5B\tbie\n29D60\tniu\n29D62\the\n29D63\tpei\n29D65\tfei\n29D66\tmu\n29D69\tfu\n29D6C\thu\n29D6D\twang\n29D6E\tsha\n29D70\tjiao\n29D71\twu\n29D79\tfu\n29D81\tbing\n29D82\tzhu\n29D84\tzhu\n29D85\tchi\n29D87\tshen\n29D88\thu\n29D89\tbu\n29D8E\tran\n29D96\tmu\n29D98\tli\n29D9B\tjia\n29D9E\tma\n29DA1\tmeng\n29DA2\tmou\n29DA3\tzhou\n29DA4\txian\n29DA5\thui\n29DA6\tguai\n29DA7\tjiu\n29DA9\tmu\n29DAB\tru\n29DAD\twu\n29DAF\tru\n29DB1\tzha\n29DC1\tnuo\n29DC2\txie\n29DC4\tjiang\n29DCB\tli\n29DCC\tshu\n29DCD\tyi\n29DCE\tdi\n29DCF\tqing\n29DD0\tju\n29DD3\tzhi\n29DD5\tlang\n29DD6\tbu\n29DD7\tkuang\n29DD8\tyi\n29DDA\tbo\n29DE7\tchi\n29DED\tjiang\n29DEF\two\n29DF0\txun\n29DF5\ttun\n29DF6\tmang\n29DF8\tfang\n29DF9\tzhuo\n29DFB\tqia\n29DFD\tta\n29DFE\tqi\n29E00\tpeng\n29E01\tbie\n29E02\tfen\n29E03\ttu\n29E04\thua\n29E07\te\n29E0B\te\n29E0E\tding\n29E10\tru\n29E16\te\n29E1E\tyan\n29E1F\tsi\n29E25\tying\n29E26\tni\n29E27\tni\n29E28\tyi\n29E39\tmi\n29E3E\tye\n29E3F\tpo\n29E40\tcou\n29E42\twei\n29E44\thai\n29E45\tying\n29E47\tting\n29E48\tzhi\n29E49\tfei\n29E4A\tyou\n29E4D\tkui\n29E4E\tan\n29E4F\tba\n29E51\than\n29E5E\tnan\n29E5F\tnai\n29E62\tjing\n29E65\twei\n29E71\tchu\n29E73\tsuo\n29E74\ttao\n29E75\tqi\n29E76\ttang\n29E77\twei\n29E78\tgan\n29E7A\tge\n29E7C\than\n29E7E\tna\n29E7F\tge\n29E84\tzheng\n29E97\tta\n29E9B\tsi\n29E9D\tni\n29E9E\tsang\n29EAB\txie\n29EAF\tzu\n29EB0\tyu\n29EB1\tni\n29EB2\tqi\n29EB5\tshen\n29EBC\tbu\n29ECB\tkun\n29ECC\tli\n29ECE\tgua\n29ED6\tyan\n29ED7\tbu\n29ED8\tjian\n29EDA\twu\n29EDB\tcen\n29EDC\tlin\n29EDD\tzhuan\n29EDF\thui\n29EE1\ttong\n29EE2\tzha\n29EE4\thei\n29EE7\tguo\n29EF1\tjing\n29EF5\tdie\n29EF7\tying\n29EFC\tzhi\n29F02\twei\n29F04\tji\n29F05\trong\n29F08\tao\n29F09\tdang\n29F0A\tluo\n29F0B\tye\n29F0C\twei\n29F12\tqiang\n29F19\tge\n29F1A\tji\n29F26\tzou\n29F28\tyi\n29F2B\tzha\n29F2D\tlie\n29F34\tye\n29F3C\tzhan\n29F40\tchou\n29F41\tbiao\n29F46\txu\n29F47\tyou\n29F4D\txie\n29F4E\twei\n29F4F\tli\n29F5B\tbo\n29F5C\tjian\n29F5D\tchan\n29F5E\tkun\n29F61\tqing\n29F67\tshuang\n29F68\txi\n29F69\tqu\n29F70\tluo\n29F73\tdang\n29F74\tnian\n29F75\tli\n29F77\tba\n29F79\te\n29F7A\tfu\n29F7B\tfu\n29F7C\thun\n29F7D\tzha\n29F7E\tan\n29F81\tqiu\n29F82\tchou\n29F83\tmian\n29F84\txun\n29F85\ttu\n29F86\tni\n29F87\thu\n29F88\tshu\n29F8A\txu\n29F8B\tzhong\n29F8C\tkang\n29F8E\tyou\n29F92\txiao\n29F93\txiao\n29F94\tci\n29F95\tchi\n29F97\tdiao\n29F98\tyi\n29F9A\tding\n29F9D\than\n29F9E\twan\n29FA0\tyi\n29FA1\tbao\n29FA2\tyi\n29FA7\txun\n29FAC\txiang\n29FB3\tbi\n29FB6\tjie\n29FB7\tge\n29FB8\tze\n29FBA\tzhen\n29FBB\thu\n29FBC\txi\n29FBD\txin\n29FBE\txiao\n29FBF\tfu\n29FC0\tzhong\n29FC2\tmao\n29FC3\txin\n29FC4\tqiang\n29FC8\tfen\n29FC9\tban\n29FCA\thuan\n29FD1\tjiao\n29FD3\tbao\n29FD4\tya\n29FD5\tyao\n29FDB\txi\n29FDD\tju\n29FDF\tqu\n29FE0\tyue\n29FE1\ttai\n29FE2\ttou\n29FE3\tmo\n29FE4\tzha\n29FE5\tqu\n29FE7\tfu\n29FE9\tqu\n29FEA\tchi\n29FEC\tyou\n29FF7\tti\n29FFA\twa\n29FFD\ttuo\n29FFF\tchu\n2A001\tge\n2A009\tge\n2A00A\tqu\n2A00F\tju\n2A012\tdie\n2A013\tyi\n2A014\tshi\n2A015\tyi\n2A017\tgui\n2A018\tjiang\n2A01A\tsong\n2A01B\tqiong\n2A01D\te\n2A01E\thuang\n2A01F\thui\n2A020\txun\n2A023\tju\n2A025\tzhai\n2A026\tchi\n2A027\tlao\n2A029\tqi\n2A02A\txiu\n2A02C\thui\n2A02D\ttong\n2A03A\tfu\n2A03D\txun\n2A03E\tjie\n2A03F\tmi\n2A040\tyu\n2A048\tzhuang\n2A049\tjiao\n2A04A\tzhi\n2A04B\tcheng\n2A04D\tjie\n2A04E\txiao\n2A04F\tchen\n2A050\tli\n2A051\tyue\n2A053\tzhi\n2A054\tlao\n2A055\two\n2A056\tqu\n2A058\twang\n2A05A\tyi\n2A05B\tyi\n2A05C\tlang\n2A05E\ttou\n2A05F\tan\n2A060\tjue\n2A061\tyan\n2A065\tju\n2A067\tzhen\n2A069\tzhi\n2A06A\tmang\n2A06E\txiu\n2A071\tchuang\n2A072\tchu\n2A078\tqiang\n2A079\tfei\n2A07A\tchang\n2A07C\tmian\n2A07D\tsu\n2A07E\tao\n2A080\tfu\n2A084\twei\n2A085\tzhi\n2A086\tmin\n2A087\tchang\n2A088\tyan\n2A089\tyu\n2A08B\tfu\n2A08C\tta\n2A08D\tji\n2A08F\tfei\n2A092\thu\n2A093\tju\n2A095\tyu\n2A09B\tqi\n2A09C\tmei\n2A09F\tbie\n2A0A0\tguo\n2A0A4\tming\n2A0A6\twan\n2A0A7\twan\n2A0B4\tjing\n2A0B5\tyu\n2A0B6\txian\n2A0B9\tchun\n2A0BA\tji\n2A0BC\txiang\n2A0BD\tpen\n2A0BE\tfu\n2A0C2\tliu\n2A0C4\tsai\n2A0C5\txue\n2A0C6\tzou\n2A0C8\tjie\n2A0CB\tzhan\n2A0CD\tyu\n2A0CE\tyu\n2A0CF\tmei\n2A0D0\tmiao\n2A0D1\tmao\n2A0D2\tduo\n2A0D3\tfu\n2A0DB\tjian\n2A0E6\tmiao\n2A0E8\tao\n2A0ED\tke\n2A0F6\thou\n2A0FA\tgou\n2A0FC\txi\n2A0FE\trong\n2A0FF\tge\n2A100\tpan\n2A101\tyuan\n2A102\txia\n2A105\tsha\n2A106\tpi\n2A108\tqing\n2A109\tyong\n2A10A\tqu\n2A10C\tgong\n2A10E\tge\n2A10F\txian\n2A111\tsu\n2A115\tban\n2A116\tqi\n2A117\thou\n2A11B\txi\n2A11D\twu\n2A12D\tqi\n2A12E\thu\n2A12F\tgui\n2A131\tdi\n2A132\tshang\n2A133\tmai\n2A134\tmin\n2A135\tji\n2A136\txi\n2A137\txian\n2A138\tji\n2A139\tchang\n2A13A\tkou\n2A13B\tchong\n2A142\tzhang\n2A143\tpiao\n2A144\tsu\n2A145\tlue\n2A146\tli\n2A147\tmeng\n2A148\tchong\n2A149\ttian\n2A14B\tling\n2A14D\tchi\n2A156\tchong\n2A159\tchi\n2A15D\tniao\n2A15F\tyong\n2A16E\tmi\n2A170\tshu\n2A172\txi\n2A174\te\n2A175\tzi\n2A178\tjie\n2A179\tji\n2A17A\thou\n2A17B\tsheng\n2A17C\tli\n2A17E\tqi\n2A180\tzhou\n2A181\tsi\n2A182\tqu\n2A18B\txie\n2A197\tsi\n2A19B\txu\n2A1A0\tfu\n2A1AF\tnong\n2A1B0\tya\n2A1B1\tliu\n2A1B2\tjia\n2A1B3\tgui\n2A1B4\tkui\n2A1B5\tchi\n2A1B6\tcan\n2A1B7\tchu\n2A1B9\tguo\n2A1BB\tdan\n2A1BF\tjian\n2A1C1\tdang\n2A1C2\thou\n2A1C4\tkou\n2A1C6\tchu\n2A1C7\tqian\n2A1C8\tai\n2A1CA\tpi\n2A1D1\txun\n2A1D2\tjing\n2A1D3\tmeng\n2A1D5\tbin\n2A1D6\tlan\n2A1D7\tgu\n2A1D8\tchou\n2A1DB\tyong\n2A1DC\tgua\n2A1DD\tyu\n2A1DE\tzhou\n2A1ED\tcai\n2A1EF\tliu\n2A1F0\tbu\n2A1F1\tluo\n2A1F2\tjie\n2A1F3\tzhen\n2A1F4\tmie\n2A1F5\tguang\n2A1F7\tjia\n2A1F9\tla\n2A200\tshou\n2A203\tguo\n2A206\tmeng\n2A207\tqian\n2A208\tlai\n2A20A\the\n2A20B\ttuan\n2A211\thui\n2A218\thong\n2A21C\tlu\n2A21F\tjia\n2A225\tgui\n2A228\tyi\n2A229\thuan\n2A230\tluo\n2A234\tjue\n2A238\tguan\n2A23B\tquan\n2A23C\tniao\n2A23F\tman\n2A242\tyun\n2A243\twen\n2A244\tchi\n2A245\tchi\n2A246\tzhi\n2A248\tci\n2A249\tzhuang\n2A24A\thua\n2A24B\tjie\n2A24C\tqu\n2A24D\ttu\n2A24E\tmin\n2A24F\tmei\n2A250\tyu\n2A251\tao\n2A252\tban\n2A254\tpi\n2A255\tzhen\n2A256\tlu\n2A257\tchi\n2A258\ttou\n2A25A\tjie\n2A25C\tzhan\n2A262\tjin\n2A263\tlu\n2A266\tjian\n2A267\ttan\n2A268\tchang\n2A26A\tci\n2A26D\twai\n2A26E\tcou\n2A26F\tkan\n2A271\tbian\n2A278\twen\n2A27B\tqian\n2A27F\tgan\n2A282\thui\n2A284\tgan\n2A286\tji\n2A287\tgan\n2A289\thuai\n2A28D\tsi\n2A290\tfu\n2A295\tpi\n2A297\tca\n2A29C\tben\n2A2A2\tshi\n2A2A5\thuan\n2A2A7\tgui\n2A2AA\tou\n2A2B3\tpao\n2A2B5\tying\n2A2B6\tting\n2A2B7\txiao\n2A2B9\tzhu\n2A2BB\tyu\n2A2C1\tjian\n2A2C4\tqu\n2A2C5\twan\n2A2C6\tkun\n2A2C7\tzhui\n2A2C9\tyu\n2A2CA\tguo\n2A2CB\tping\n2A2CC\tzui\n2A2CD\tzu\n2A2CF\tzhu\n2A2D0\tnuan\n2A2D1\tzhu\n2A2D6\tpiao\n2A2D7\tmi\n2A2DC\tbi\n2A2DD\tsu\n2A2E1\tpu\n2A2E2\tmi\n2A2EB\tye\n2A2EC\tyu\n2A2EE\tyu\n2A2F0\tzhu\n2A2F3\tling\n2A2FA\tnou\n2A2FE\tling\n2A300\tliao\n2A302\ttuo\n2A304\tbi\n2A305\tna\n2A306\tqu\n2A308\tpi\n2A309\tdou\n2A30A\tnie\n2A30B\ttun\n2A30D\tji\n2A30F\tling\n2A313\tku\n2A314\tsu\n2A318\ttou\n2A31E\tnai\n2A31F\tze\n2A322\ttong\n2A323\tge\n2A324\tdui\n2A327\tjie\n2A329\ttian\n2A32A\ttiao\n2A32B\tchi\n2A32C\tqu\n2A32E\tsha\n2A330\tbo\n2A331\tli\n2A333\tluo\n2A335\tliao\n2A336\tshu\n2A337\tdeng\n2A339\tchi\n2A33A\tmie\n2A33C\ttao\n2A33D\thun\n2A33F\tnie\n2A341\tjun\n2A342\thu\n2A344\tlu\n2A345\tye\n2A347\tmo\n2A348\tchao\n2A34C\tsuo\n2A34E\tke\n2A34F\tfu\n2A351\tchao\n2A354\tsuo\n2A357\tqiu\n2A35B\tsu\n2A35D\tyun\n2A35F\tsuo\n2A360\tku\n2A361\tbo\n2A363\tlou\n2A364\tmo\n2A366\tlian\n2A367\txuan\n2A368\tsuo\n2A369\tman\n2A36A\tbi\n2A372\tti\n2A374\tlian\n2A375\ttan\n2A376\tshan\n2A378\tqu\n2A379\tdu\n2A37A\thuan\n2A37B\tsao\n2A37F\tkuang\n2A383\tnie\n2A385\tnie\n2A386\tluo\n2A387\tzuo\n2A388\tyi\n2A389\txian\n2A38A\tchao\n2A38B\ttie\n2A38C\tlai\n2A392\tshuo\n2A394\tmi\n2A397\tmi\n2A39B\twan\n2A39D\tben\n2A39E\tqiang\n2A3A0\tmo\n2A3A3\tliu\n2A3A4\two\n2A3A6\tmei\n2A3A8\ttou\n2A3AB\tmu\n2A3AD\tmei\n2A3B2\tzuo\n2A3B4\ttun\n2A3B5\tkang\n2A3B6\ttun\n2A3BA\tche\n2A3BB\tzheng\n2A3BD\tchong\n2A3BE\ttian\n2A3C0\tzhi\n2A3C1\tchan\n2A3C2\tchan\n2A3C5\tqing\n2A3C6\ttun\n2A3C7\thui\n2A3C8\tque\n2A3C9\tzhan\n2A3CA\tjian\n2A3CB\tchan\n2A3CD\thuang\n2A3CF\thui\n2A3D0\tchi\n2A3D2\thuang\n2A3D3\theng\n2A3D4\tyun\n2A3D6\ttuan\n2A3D7\tbian\n2A3D9\thuang\n2A3DA\tyun\n2A3DF\tmo\n2A3E0\tgong\n2A3E2\tgong\n2A3E4\tgui\n2A3E6\tchan\n2A3E8\tque\n2A3E9\trui\n2A3EA\tkuang\n2A3EB\tpiao\n2A3EE\tru\n2A3F2\tniu\n2A3F3\thu\n2A3F4\tjin\n2A3F5\tni\n2A3F6\tbao\n2A3F8\tni\n2A3FA\tbi\n2A3FB\thu\n2A3FC\tli\n2A3FF\tzhu\n2A400\tna\n2A402\tquan\n2A403\tfeng\n2A404\tbi\n2A405\tli\n2A406\tbie\n2A407\tnian\n2A408\tdong\n2A40B\tlian\n2A40C\tni\n2A40D\tlian\n2A40E\tma\n2A40F\tzhe\n2A413\tjia\n2A414\tyi\n2A416\tlong\n2A418\tyi\n2A41D\tdai\n2A41E\tdu\n2A423\tyi\n2A425\ttai\n2A426\thang\n2A427\tshu\n2A42C\twan\n2A42E\tsu\n2A42F\tyao\n2A430\ter\n2A432\tzhen\n2A43A\tdou\n2A43B\tjian\n2A43F\tpang\n2A440\thui\n2A442\tcha\n2A443\tshan\n2A444\tlu\n2A445\twei\n2A446\tyu\n2A448\tyan\n2A449\twan\n2A44A\tqiao\n2A44B\tluo\n2A44C\tyu\n2A44F\ttu\n2A450\twei\n2A452\ttun\n2A455\thun\n2A456\tben\n2A457\tqie\n2A459\tjin\n2A45A\tlai\n2A45C\tzhi\n2A45D\tyu\n2A45F\tci\n2A466\tye\n2A467\tdie\n2A468\tcha\n2A469\tdian\n2A46A\tman\n2A46C\tdeng\n2A46D\twei\n2A46E\tnian\n2A46F\tlei\n2A470\tbing\n2A471\twu\n2A473\tzhen\n2A476\trou\n2A477\twai\n2A478\tmi\n2A479\tjie\n2A47B\thou\n2A47D\tzhai\n2A47E\tru\n2A47F\tzi\n2A480\tpan\n2A482\tmo\n2A484\tmi\n2A486\tqi\n2A487\tmo\n2A48A\tzhi\n2A48B\tban\n2A48D\tmie\n2A48F\tlu\n2A491\tqi\n2A492\tchong\n2A494\tli\n2A495\tyi\n2A498\tdeng\n2A499\tcuo\n2A49B\tdui\n2A49C\tma\n2A49D\tyan\n2A49F\tzeng\n2A4A0\tyan\n2A4A1\tdui\n2A4A2\tpu\n2A4A5\tyue\n2A4A9\thuo\n2A4AA\tmai\n2A4AB\tjian\n2A4AC\tnong\n2A4AD\tqin\n2A4AF\tqin\n2A4B2\tye\n2A4B4\ttai\n2A4B9\tjian\n2A4BC\tcha\n2A4BE\tdan\n2A4BF\tteng\n2A4C0\tli\n2A4C3\tniang\n2A4C4\tchan\n2A4C5\tzang\n2A4CA\tyu\n2A4CC\tzui\n2A4CD\tbian\n2A4D0\tchu\n2A4D8\tran\n2A4DA\tran\n2A4DB\tyang\n2A4DC\tbo\n2A4E1\tcu\n2A4EC\tmi\n2A4EE\tke\n2A4F0\tcu\n2A4F7\txi\n2A4F9\tma\n2A4FB\tshi\n2A4FC\tdian\n2A4FF\tshi\n2A502\tding\n2A503\tjiong\n2A505\tyuan\n2A506\tgan\n2A50A\thui\n2A50B\tji\n2A50D\tpeng\n2A50F\tdeng\n2A511\tbeng\n2A514\tpang\n2A515\tta\n2A517\tyuan\n2A518\tgao\n2A519\tyuan\n2A51F\tjia\n2A523\tkong\n2A526\tdong\n2A529\txian\n2A52A\tqi\n2A52C\tsang\n2A530\tyin\n2A533\tlong\n2A536\tteng\n2A537\tlong\n2A53A\tren\n2A53D\tyin\n2A53E\tping\n2A53F\tpu\n2A540\tyuan\n2A541\trong\n2A543\tfang\n2A547\thang\n2A548\tmi\n2A549\thu\n2A54A\tzi\n2A54C\tling\n2A54D\tjiong\n2A54E\trong\n2A552\tping\n2A553\tguang\n2A554\ter\n2A55D\tcu\n2A55E\tjun\n2A566\txiu\n2A568\ter\n2A569\tti\n2A56B\tyang\n2A56D\tai\n2A56E\thu\n2A56F\txi\n2A571\thu\n2A573\tsi\n2A574\tli\n2A576\tyi\n2A577\tgu\n2A579\ttang\n2A580\tque\n2A581\tzong\n2A582\tli\n2A584\tjiao\n2A587\tfan\n2A588\tpu\n2A589\tsi\n2A58B\tjie\n2A58C\tlu\n2A58D\tli\n2A58E\tchan\n2A590\tyao\n2A595\thui\n2A599\thou\n2A59A\tdian\n2A59B\tqiu\n2A59C\tjue\n2A59E\tpi\n2A5A2\tkui\n2A5A5\txi\n2A5A6\tti\n2A5A9\txu\n2A5AF\tbian\n2A5B2\the\n2A5B3\tlian\n2A5B6\tsu\n2A5B7\tliao\n2A5BC\tjin\n2A5C1\tli\n2A5C2\tchan\n2A5C5\tqi\n2A5C6\tqi\n2A5C9\tzi\n2A5CB\tzi\n2A5CD\tqi\n2A5CF\tqi\n2A5D0\tzi\n2A5D2\tzhai\n2A5D3\tzhai\n2A5D4\tpa\n2A5D6\tju\n2A5D9\tyan\n2A5DC\thang\n2A5DD\tna\n2A5E4\tyan\n2A5E6\tzhan\n2A5E7\tshi\n2A5E8\tzhi\n2A5ED\tzha\n2A5F4\trong\n2A5F5\tzha\n2A5F7\tyi\n2A5F8\tming\n2A5F9\tya\n2A5FB\tzhi\n2A5FD\tkuo\n2A5FE\txia\n2A600\tpian\n2A601\tta\n2A603\tyi\n2A606\txiu\n2A607\tzhai\n2A609\tduo\n2A60A\te\n2A60E\tyin\n2A610\te\n2A611\tsuan\n2A612\tan\n2A613\tcuo\n2A615\ttuo\n2A617\ttuo\n2A618\txia\n2A61B\tchuo\n2A61D\tsuan\n2A625\tji\n2A626\tqian\n2A627\tzu\n2A628\tzhai\n2A629\tyun\n2A62A\tzhan\n2A62C\tyi\n2A632\tya\n2A633\tyue\n2A639\the\n2A63A\tqia\n2A63E\tcha\n2A643\tou\n2A648\thu\n2A64A\tyan\n2A64C\tqie\n2A64D\tbo\n2A64E\tqiang\n2A64F\tjie\n2A65B\tni\n2A65E\tchan\n2A65F\tqin\n2A661\tzao\n2A664\tyin\n2A665\txie\n2A667\tqi\n2A668\tjian\n2A66B\txu\n2A66D\tzeng\n2A66F\te\n2A673\tzu\n2A674\tyi\n2A679\tzhi\n2A67A\tli\n2A67D\tli\n2A67E\tyin\n2A681\tlian\n2A683\tchan\n2A685\tjue\n2A687\tza\n2A68E\tzhai\n2A68F\tpian\n2A691\tlong\n2A693\tlong\n2A698\tlong\n2A69D\tlong\n2A6A0\tlong\n2A6A2\tmang\n2A6A5\tzhe\n2A6AC\tgan\n2A6AD\tgou\n2A6AE\tran\n2A6AF\tcu\n2A6B0\tjiao\n2A6B7\tbo\n2A6B9\tzhu\n2A6BA\tqiu\n2A6BB\tyang\n2A6C0\txiao\n2A6C2\thui\n2A6C3\tqu\n2A6C8\tling\n2A6CA\tyin\n2A6CE\tpi\n2A6D2\tlian\n2A70E\tqiao\n2A79D\tduo\n2A7CE\tjian\n2A7DD\tji\n2A800\tku\n2A80F\tyan\n2A81F\tzhen\n2A821\tsa\n2A833\tche\n2A835\tlun\n2A838\thu\n2A83D\tdang\n2A840\tqiao\n2A843\tmai\n2A848\tbai\n2A84B\tyan\n2A84F\tzhan\n2A85B\the\n2A85E\tkui\n2A87A\tlai\n2A88C\tlan\n2A892\tshu\n2A895\tchuo\n2A8A0\tlan\n2A8AE\tluan\n2A8C6\tdong\n2A8D2\thun\n2A8DD\tzao\n2A8FB\tlou\n2A917\tliao\n2A91A\tlin\n2A960\treng\n2A96B\tshuang\n2A970\tning\n2A97F\tdu\n2A9C0\tying\n2A9D8\tju\n2AA07\ttui\n2AA0A\tsong\n2AA17\tjue\n2AA27\tlun\n2AA29\tya\n2AA30\tqu\n2AA36\tshe\n2AA37\tyan\n2AA39\ttuo\n2AA47\tlou\n2AA4E\tying\n2AA58\tyan\n2AA5B\tnie\n2AA78\tfen\n2AA91\tqiao\n2AA9D\tyong\n2AA9E\tqiang\n2AAB4\tyi\n2AACC\tlong\n2AAE1\tli\n2AAF7\tchou\n2AAF8\tji\n2AAFA\txian\n2AB1A\tpin\n2AB5D\twei\n2AB62\tchuang\n2AB67\tmi\n2AB6F\tguai\n2AB75\tliang\n2AB7E\txian\n2AB83\tcan\n2AB8B\txiao\n2AB96\tjue\n2ABB6\tla\n2ABCB\tshan\n2AC36\tfei\n2AC65\tfen\n2AC77\tbei\n2AC8E\tji\n2AC94\tli\n2AC9B\tji\n2ACAE\tfei\n2ACCD\tshe\n2AD19\tcuan\n2AD2F\te\n2AD51\txiao\n2AD63\txi\n2AD71\tli\n2AD84\tshi\n2AD92\tluo\n2ADCD\tqing\n2ADFD\tzan\n2AE15\txi\n2AE29\thui\n2AE40\tyi\n2AE73\tzhu\n2AE79\tta\n2AEA3\tdao\n2AEAD\tqiao\n2AEB7\tcang\n2AEB9\tnu\n2AEBB\tnong\n2AEBD\tyin\n2AED0\tcong\n2AEE8\tdu\n2AEF2\tkun\n2AEFA\tgui\n2AF0B\tbi\n2AF47\tke\n2AF6A\tzhang\n2AF6D\tjian\n2AF6E\tlu\n2AF74\tshe\n2AF77\tyi\n2AF94\txu\n2AFA2\txian\n2AFA6\tlu\n2AFB8\tpin\n2AFCA\tya\n2AFEB\tpao\n2B00C\tshi\n2B013\tmin\n2B028\tjian\n2B02C\tchu\n2B02E\tdang\n2B042\tba\n2B05F\tzhuan\n2B061\tli\n2B072\twu\n2B073\twei\n2B077\tshuang\n2B083\tmin\n2B086\tgui\n2B088\tfei\n2B096\tai\n2B099\tsu\n2B0BF\tsa\n2B0D7\tjiu\n2B0DC\tkou\n2B119\tjiu\n2B11A\thu\n2B11B\tjin\n2B11C\tmao\n2B11D\tdiao\n2B11E\tbi\n2B11F\tshi\n2B120\thuan\n2B121\tdong\n2B122\tfu\n2B123\tnong\n2B124\tda\n2B125\tli\n2B126\tjie\n2B127\tyan\n2B128\tchi\n2B129\tfan\n2B12A\tsang\n2B12B\tli\n2B12C\txie\n2B12D\tfu\n2B12E\tting\n2B130\tbang\n2B131\tse\n2B132\tmu\n2B133\txi\n2B134\tlu\n2B135\tbeng\n2B136\tqiang\n2B137\tyi\n2B138\txun\n2B139\tzui\n2B145\tji\n2B157\tfen\n2B16D\tpin\n2B17C\tlian\n2B18F\tni\n2B1E6\tying\n2B1EA\tgang\n2B1ED\twei\n2B1F4\tchu\n2B1FD\tnong\n2B209\tjian\n2B20E\tqing\n2B21F\tchen\n2B230\tqia\n2B235\tjue\n2B241\tai\n2B244\tshu\n2B2AA\tchang\n2B2AE\tlu\n2B2B1\tjian\n2B2B8\tjiao\n2B2BB\txun\n2B2C7\txiao\n2B2CC\tte\n2B2D0\tgong\n2B2F2\tou\n2B2F7\tze\n2B2F9\trao\n2B2FB\tgui\n2B300\tji\n2B307\tzhe\n2B30B\tshu\n2B328\tluo\n2B32A\tmi\n2B32B\tlian\n2B32D\twei\n2B32F\tjiao\n2B350\tpin\n2B359\tyi\n2B35A\tyao\n2B35B\tfen\n2B35C\tqu\n2B35E\thu\n2B35F\tyi\n2B360\tyuan\n2B361\tyi\n2B362\tnao\n2B363\ttong\n2B364\tjiao\n2B365\ttiao\n2B366\tnang\n2B367\tchi\n2B368\tzhen\n2B369\thua\n2B36A\tji\n2B36B\tyan\n2B36C\twang\n2B36E\tqu\n2B36F\txian\n2B370\txi\n2B371\tzhuan\n2B372\txiao\n2B373\tzhong\n2B374\tlou\n2B375\tao\n2B376\tchi\n2B377\tkui\n2B378\tshan\n2B379\tjie\n2B37A\tsha\n2B37B\txi\n2B37C\tzhong\n2B37D\txuan\n2B37E\tning\n2B37F\tjian\n2B386\tzong\n2B38C\tju\n2B3A6\tlong\n2B3A7\tgou\n2B3A8\tlian\n2B3A9\tchen\n2B3AA\tchen\n2B3AB\tdan\n2B3AC\tgan\n2B3AD\tcheng\n2B3B1\tli\n2B3B3\tbi\n2B3BA\tcan\n2B3C3\tchang\n2B3C6\tbo\n2B3CB\tjue\n2B3CC\tlai\n2B3D0\tzan\n2B3D1\tluo\n2B3D5\tqing\n2B3E8\txian\n2B404\tyue\n2B405\tshan\n2B406\tkuai\n2B407\tna\n2B408\tba\n2B409\tling\n2B40A\tfan\n2B40B\tzhi\n2B40C\tping\n2B40D\ttian\n2B40E\tyi\n2B40F\tzhou\n2B410\tni\n2B411\tguan\n2B412\thong\n2B413\trou\n2B414\tke\n2B415\twei\n2B416\tjiao\n2B417\tbu\n2B418\tkan\n2B419\tlei\n2B437\tlou\n2B458\tzhuan\n2B461\tmeng\n2B477\tyan\n2B4B6\than\n2B4E5\tba\n2B4E6\tzi\n2B4E7\tfu\n2B4E8\tguo\n2B4E9\tcong\n2B4EA\tqian\n2B4EC\tza\n2B4ED\tyang\n2B4EE\tliu\n2B4EF\tji\n2B4F0\txu\n2B4F1\tqiao\n2B4F2\tjun\n2B4F4\tmou\n2B4F5\tshen\n2B4F6\txuan\n2B4F8\twan\n2B4F9\tji\n2B4FA\tlu\n2B4FB\tnie\n2B4FC\the\n2B4FD\tzong\n2B4FE\tyu\n2B500\tlian\n2B501\tfen\n2B502\tdi\n2B504\trou\n2B505\tsuo\n2B506\tbei\n2B507\tbi\n2B508\tshuo\n2B50A\txiu\n2B50B\tkuan\n2B50C\tsan\n2B50D\tfan\n2B50E\tjue\n2B50F\tchan\n2B511\tzhan\n2B514\txi\n2B516\tnong\n2B52D\tkai\n2B52F\tdou\n2B530\tbian\n2B531\tlan\n2B532\txiao\n2B534\tlin\n2B535\tzhi\n2B536\tnie\n2B565\tyun\n2B583\thui\n2B585\tlong\n2B587\txue\n2B591\tqin\n2B592\tbi\n2B593\tbing\n2B594\tbai\n2B595\tgou\n2B596\tzheng\n2B5AA\tku\n2B5AB\tzhen\n2B5AC\tzhen\n2B5AE\tyi\n2B5AF\tfu\n2B5B0\tduo\n2B5B1\tgen\n2B5B2\thun\n2B5B3\tyun\n2B5B4\tze\n2B5B5\tyue\n2B5B6\tqian\n2B5B8\tyuan\n2B5B9\tcu\n2B5BA\tfan\n2B5C7\tyu\n2B5C8\tbo\n2B5C9\tbeng\n2B5CA\tan\n2B5CB\tse\n2B5DA\tjian\n2B5DE\tzhan\n2B5DF\tyuan\n2B5E0\tzhang\n2B5E2\tzuo\n2B5E3\tbi\n2B5E4\tshi\n2B5E5\tyun\n2B5E6\tbu\n2B5E7\tsu\n2B5E8\tlang\n2B5E9\tluo\n2B5EA\twei\n2B5EB\thu\n2B5EC\tnuan\n2B5ED\twei\n2B5EE\thuang\n2B5EF\thou\n2B5F0\tdui\n2B5F1\tlian\n2B5F3\tjiang\n2B5F4\tzhan\n2B5F5\txiang\n2B61B\than\n2B61C\twen\n2B61D\tjue\n2B61E\ttuo\n2B61F\tpo\n2B620\tzhi\n2B621\tjiong\n2B623\than\n2B624\tai\n2B625\tkun\n2B626\ttao\n2B627\tlu\n2B628\tti\n2B629\thuang\n2B62A\tyuan\n2B62B\tyan\n2B62C\txi\n2B62D\tshuang\n2B62E\tzhe\n2B62F\tceng\n2B630\tzhan\n2B631\txi\n2B63D\tkuo\n2B688\txu\n2B689\thong\n2B68A\tyang\n2B68B\tzhuan\n2B68C\tsha\n2B68D\tfen\n2B68E\tbing\n2B68F\tqiao\n2B690\tyang\n2B691\tbi\n2B692\tfu\n2B693\tlie\n2B694\thui\n2B695\tshi\n2B696\tci\n2B697\tge\n2B699\tpu\n2B69A\tzhe\n2B69B\tduo\n2B69C\tgui\n2B69D\thua\n2B69E\tli\n2B6A1\tzhou\n2B6A2\tyan\n2B6A3\tbian\n2B6A4\tzi\n2B6A5\txia\n2B6A6\tyong\n2B6A7\tqiu\n2B6A8\tbu\n2B6AA\tyu\n2B6AB\tsao\n2B6AD\tlie\n2B6DA\tjian\n2B6DB\tzhi\n2B6DC\tfou\n2B6DD\thuan\n2B6DE\tjue\n2B6DF\tlong\n2B6E0\tzha\n2B6E1\tfu\n2B6E2\tning\n2B6E3\tyu\n2B6E4\tge\n2B6E5\tjia\n2B6E6\twu\n2B6E8\tpi\n2B6E9\tyan\n2B6EA\tru\n2B6EB\tyuan\n2B6EC\ttu\n2B6ED\tkuang\n2B6EE\tbie\n2B6EF\tfang\n2B6F0\tqi\n2B6F1\tzhuo\n2B6F2\tdiao\n2B6F3\tfu\n2B6F4\tti\n2B6F5\tjue\n2B6F6\tchi\n2B6F7\thu\n2B6F8\tti\n2B6FA\thou\n2B6FB\tduo\n2B6FC\tkui\n2B6FD\tli\n2B6FE\tchu\n2B700\tchen\n2B701\tbi\n2B702\tzhang\n2B703\tyin\n2B704\tzun\n2B705\thuan\n2B70A\twen\n2B711\tfeng\n2B712\ttuo\n2B714\tpi\n2B715\tku\n2B719\tying\n2B71F\tcu\n2B728\tba\n2B729\tnie\n2B72A\tyao\n2B72C\tze\n2B72D\tchu\n2B72E\tyan\n2B72F\tjie\n2B730\tya\n2B732\tlong\n2B733\tnan\n2B737\tshou\n2B738\thua\n2B748\thun\n2B74B\tshu\n2B766\tbei\n2B767\tshu\n2B768\thui\n2B769\tchou\n2B76A\tgong\n2B76B\tlai\n2B76C\tkui\n2B76D\tying\n2B76E\tlan\n2B775\tdao\n2B785\txun\n2B797\tmin\n2B79A\tzi\n2B79B\tzhu\n2B79D\tjue\n2B7A0\tling\n2B7A1\trong\n2B7A2\tzhi\n2B7A3\tchan\n2B7A5\tbei\n2B7A6\tzi\n2B7A7\tlao\n2B7A8\tlan\n2B7A9\tmen\n2B7B7\tkuai\n2B7C3\tren\n2B7C4\thong\n2B7C5\tliang\n2B7C6\tchong\n2B7D1\tling\n2B7D5\tji\n2B7DE\tzhi\n2B7DF\tpan\n2B7E0\tchan\n2B7E1\tcong\n2B7E2\ttan\n2B7E4\ttuo\n2B7E5\tkeng\n2B7E6\tsui\n2B7EB\tli\n2B7EC\tzhi\n2B7F2\tqiu\n2B7F3\tsi\n2B7F4\tfen\n2B7F5\tyun\n2B7F6\tshan\n2B7F7\tli\n2B7F8\tshi\n2B7F9\thong\n2B7FA\tkai\n2B7FB\tzhou\n2B7FC\tda\n2B7FD\tzu\n2B7FE\tzu\n2B7FF\tsuo\n2B800\tcu\n2B801\the\n2B802\tling\n2B805\tge\n2B806\tkui\n2B807\txun\n2B808\tbi\n2B80A\txuan\n2B80B\tlu\n2B80C\tbang\n2B80F\tmu\n2B810\than\n2B811\tsou\n2B812\tzhang\n2B81C\tni\n2B825\tlou\n2B826\tsuo\n2B851\tyin\n2B86C\two\n2B876\tdan\n2B892\tlong\n2B894\tgui\n2B898\tdui\n2B899\tdong\n2B8AA\tlian\n2B8AC\tlao\n2B8AD\twei\n2B8B8\tdan\n2B8B9\tchong\n2B8BA\tcan\n2B8C9\tlan\n2B8CA\tai\n2B8DB\tqian\n2B8EB\tsu\n2B938\tmao\n2B93D\tgan\n2B94D\tyan\n2B973\tli\n2B975\tli\n2B97A\tye\n2B97C\tya\n2B981\tsuo\n2B985\txiao\n2B989\tlou\n2B98C\tjue\n2B9A9\tliang\n2B9B3\tjue\n2B9EF\txie\n2B9FF\tdu\n2BA06\txia\n2BA55\thong\n2BA5A\tgang\n2BA5B\tcong\n2BA64\tye\n2BA65\thuo\n2BA69\tchu\n2BA6B\tye\n2BA6F\thai\n2BA7A\tjin\n2BA80\tguo\n2BA81\tlai\n2BA82\tyan\n2BA83\tli\n2BA84\tjian\n2BA98\tou\n2BA9A\tzan\n2BAA7\tjiao\n2BAAA\tzhi\n2BABA\tti\n2BABD\tjin\n2BAC7\te\n2BAE6\tdan\n2BAF5\tlu\n2BAFE\tpin\n2BB10\tsai\n2BB19\tgun\n2BB1F\tdie\n2BB5E\tzhuan\n2BB5F\tou\n2BB62\tlun\n2BB68\tba\n2BB6A\tqiao\n2BB6E\tce\n2BB6F\txun\n2BB72\tyan\n2BB7C\tlao\n2BB83\tshan\n2BB85\tchen\n2BB9C\tyin\n2BBAC\tjiang\n2BBD2\tnong\n2BBE5\thuo\n2BBF6\tyun\n2BC02\tduo\n2BC0D\twei\n2BC1B\txing\n2BC21\thua\n2BC22\thui\n2BC28\tmai\n2BC30\txian\n2BC39\tgui\n2BC55\tlan\n2BC7F\tqia\n2BC97\tzan\n2BCB8\tfeng\n2BCC3\tya\n2BD52\ttui\n2BD58\tbi\n2BD75\tyang\n2BD77\tli\n2BD78\tkeng\n2BD87\tdie\n2BD8A\tlan\n2BD95\trong\n2BDB2\tkeng\n2BDC5\tkun\n2BDC8\txu\n2BDC9\txian\n2BDCC\tlan\n2BDEC\tlai\n2BDEE\tyin\n2BDF7\txin\n2BDF9\tlou\n2BDFE\tying\n2BE29\tkou\n2BE6E\tyu\n2BE74\twei\n2BE7C\tdong\n2BE7D\tshang\n2BE81\tqie\n2BE82\tqie\n2BE86\thua\n2BE8A\tqi\n2BE8C\tgong\n2BE93\tmen\n2BE98\tlao\n2BEAA\tyang\n2BEB7\tnan\n2BEC1\txi\n2BF1B\tdiao\n2BF1D\tchou\n2BF23\tpie\n2BF24\tze\n2BF25\thai\n2BF27\thua\n2BF2B\tbi\n2BF2E\tnang\n2BF31\tkang\n2BF35\tlu\n2BF36\tsuo\n2BF40\tna\n2BF41\tlian\n2BF47\thuo\n2BF4A\tbo\n2BF4B\tluo\n2BF50\tjian\n2BF59\tkang\n2BF63\tjiang\n2BF65\tqian\n2BF67\tfei\n2BF6E\tdang\n2BF72\tniao\n2BF73\tbi\n2BF81\tyan\n2BF83\txiao\n2BFB2\tli\n2BFD7\tshu\n2C025\thuo\n2C029\twei\n2C02A\txian\n2C02E\tdui\n2C031\tkai\n2C037\tshang\n2C060\txiang\n2C075\tou\n2C07A\tya\n2C07D\tsun\n2C080\trun\n2C082\tluo\n2C085\tdan\n2C089\tsheng\n2C0A0\tmo\n2C0A9\tjia\n2C0AE\tsha\n2C0B0\tnong\n2C0C0\tgui\n2C0CA\tzhi\n2C0D8\ter\n2C0E6\tjian\n2C0EB\txian\n2C0EE\tfei\n2C0F2\tlin\n2C0F3\tyan\n2C129\tyin\n2C162\txia\n2C165\tgua\n2C16B\tpen\n2C19B\tnao\n2C1A6\tji\n2C1AE\tkou\n2C1BE\tmao\n2C1C3\tjian\n2C1C4\tbin\n2C1C7\tdie\n2C1D5\twan\n2C1D8\ttuan\n2C1D9\tbei\n2C1F0\tmen\n2C1F9\tguo\n2C201\tshan\n2C215\tfei\n2C21C\tying\n2C227\tse\n2C231\tpo\n2C23E\thua\n2C242\tfen\n2C247\tsha\n2C24B\twei\n2C260\tlan\n2C267\than\n2C27C\tou\n2C282\tchao\n2C288\txun\n2C289\tda\n2C28D\tchou\n2C28E\tgong\n2C296\tmei\n2C297\tjian\n2C2A4\tchan\n2C2A6\tshan\n2C2B5\ttang\n2C2B6\tlan\n2C2BA\twei\n2C2BE\tran\n2C2C3\tlian\n2C2CD\tlai\n2C317\the\n2C31D\tchu\n2C32E\tyao\n2C337\tshan\n2C359\tzhan\n2C35B\tli\n2C361\tdang\n2C364\txun\n2C386\tying\n2C391\tlan\n2C3A7\tcong\n2C3DC\tma\n2C3DF\tji\n2C3E6\tfei\n2C3EB\twen\n2C3EE\tguo\n2C3F7\tfen\n2C41A\thai\n2C420\tyang\n2C446\tgun\n2C447\tchang\n2C44D\tchou\n2C44F\tying\n2C452\tkou\n2C453\tye\n2C454\tzhong\n2C455\tgun\n2C457\tjian\n2C459\tmai\n2C461\tchou\n2C467\tmian\n2C486\tye\n2C487\tlan\n2C488\tque\n2C48D\tyun\n2C48E\tkeng\n2C494\tgeng\n2C495\tsu\n2C497\tlan\n2C498\txin\n2C4E0\tji\n2C4EB\tqiu\n2C4F1\tben\n2C4F8\tshai\n2C4FC\ttui\n2C52F\tou\n2C542\tlong\n2C544\tsi\n2C54A\tjian\n2C55B\tku\n2C566\tou\n2C56C\tling\n2C583\tzuan\n2C591\txian\n2C596\tchou\n2C598\tshi\n2C5A0\tlou\n2C5AE\txian\n2C613\txun\n2C614\tmie\n2C615\tqiu\n2C616\tjian\n2C618\tdan\n2C619\tyue\n2C61A\twa\n2C61B\tqu\n2C61C\tzhan\n2C61D\tzhen\n2C61E\tdiao\n2C61F\txian\n2C620\tgai\n2C621\tyin\n2C622\tkuang\n2C624\tlu\n2C625\tquan\n2C626\tpai\n2C627\tqi\n2C628\tzhi\n2C629\tting\n2C62A\tlian\n2C62B\thuan\n2C62C\tqian\n2C62D\tchen\n2C62E\tmi\n2C62F\tzhun\n2C630\truan\n2C631\tyao\n2C632\tzha\n2C633\txu\n2C635\tgeng\n2C636\tqiu\n2C637\tci\n2C638\tchi\n2C63A\ttao\n2C63B\txia\n2C63C\tsui\n2C63D\tzhi\n2C63E\tshuang\n2C641\tyan\n2C642\tyan\n2C643\tqian\n2C645\tzhu\n2C646\tfan\n2C647\tran\n2C648\tlin\n2C649\tdan\n2C64A\tmo\n2C64B\txiang\n2C64E\tlu\n2C65D\tbi\n2C66D\twei\n2C684\tsu\n2C6F8\tnie\n2C6F9\tdang\n2C6FC\tyu\n2C714\tda\n2C725\tlan\n2C727\tfa\n2C728\thui\n2C72C\tman\n2C72F\tliang\n2C738\thuai\n2C73E\txian\n2C73F\tguo\n2C741\tyu\n2C743\tlao\n2C74A\tsi\n2C74B\tjie\n2C760\tzei\n2C76F\tpin\n2C774\tran\n2C78B\tjian\n2C795\tlan\n2C798\ttui\n2C79F\tpin\n2C7A3\tsen\n2C7AB\than\n2C7C1\tyi\n2C7EA\txi\n2C7FA\tcong\n2C7FD\tdong\n2C803\tbi\n2C805\tdang\n2C808\tgong\n2C810\twang\n2C820\tzei\n2C837\ttuo\n2C847\tniao\n2C84D\tdiao\n2C84E\tzhou\n2C852\tjia\n2C853\tdie\n2C854\tshi\n2C855\tshai\n2C860\tluo\n2C877\tzan\n2C87B\tchan\n2C887\tcha\n2C888\tdong\n2C889\tci\n2C88A\tsi\n2C88B\ttiao\n2C88C\tzhi\n2C88E\tdu\n2C88F\tdan\n2C890\tqi\n2C891\tying\n2C892\tming\n2C894\tdeng\n2C8AA\tzhou\n2C8AF\tying\n2C8B3\tcan\n2C8C0\twei\n2C8D9\txu\n2C8DA\tkou\n2C8DB\tzhi\n2C8DC\thao\n2C8DD\tjun\n2C8DE\tzhu\n2C8DF\ttou\n2C8E0\tgan\n2C8E1\tjian\n2C8E2\ttuo\n2C8E3\tzhu\n2C8E4\tjian\n2C8E5\ttao\n2C8E6\tyao\n2C8E7\tfei\n2C8E8\tya\n2C8E9\twei\n2C8EA\thui\n2C8EC\thui\n2C8ED\tdang\n2C8EE\tming\n2C8EF\tren\n2C8F0\thui\n2C8F1\tzhou\n2C8F2\tpu\n2C8F3\then\n2C8F6\tzha\n2C8F7\tcu\n2C8F8\than\n2C8F9\tcu\n2C8FB\tting\n2C8FC\tlang\n2C8FD\tlian\n2C8FE\tze\n2C8FF\tlao\n2C900\thao\n2C901\ttao\n2C902\tshan\n2C904\tcan\n2C905\tji\n2C906\tgun\n2C907\tyin\n2C909\thui\n2C90A\tshi\n2C90B\tcong\n2C90C\tzha\n2C90D\thuang\n2C90E\txuan\n2C90F\tduo\n2C910\tge\n2C911\tge\n2C912\the\n2C913\tchi\n2C915\tta\n2C916\tgun\n2C918\tchi\n2C919\thu\n2C91A\tying\n2C91B\tchan\n2C91C\tzha\n2C91D\thui\n2C91E\tyi\n2C91F\tliao\n2C920\tyan\n2C921\tao\n2C922\tzun\n2C923\tdui\n2C924\tzeng\n2C925\tzhuan\n2C926\tyi\n2C928\tzao\n2C929\tai\n2C92A\tta\n2C92B\thao\n2C92C\ttuan\n2C92D\thui\n2C92E\tzan\n2C92F\tjian\n2C930\thuan\n2C931\ttui\n2C944\tzhe\n2C948\tmao\n2C973\tcang\n2C974\than\n2C975\tyi\n2C976\tbi\n2C977\tzheng\n2C978\tchuan\n2C97A\tyan\n2C97B\truan\n2C97C\tduan\n2C97D\thou\n2C97E\tlan\n2C97F\tzhan\n2C985\ttang\n2C986\ttuan\n2C9A3\tli\n2C9A5\tbei\n2C9A7\tlun\n2C9A9\tzou\n2C9AB\tduo\n2C9AF\txie\n2C9B4\tbing\n2C9B5\tzhang\n2C9BB\tguan\n2C9C0\tqiang\n2C9C3\tteng\n2C9D1\tnian\n2C9DA\tdian\n2C9E2\tlong\n2C9E4\tlao\n2C9E9\tguo\n2CA01\tmao\n2CA02\tqi\n2CA04\tyang\n2CA05\tnian\n2CA06\tgong\n2CA07\tkai\n2CA08\twan\n2CA09\ttian\n2CA0B\tzang\n2CA0C\tpi\n2CA0D\tge\n2CA0E\tyou\n2CA0F\txu\n2CA10\thui\n2CA11\tsang\n2CA12\tguang\n2CA13\tchao\n2CA14\tbei\n2CA4E\thuo\n2CA7D\txun\n2CA7E\tlai\n2CA8D\tmao\n2CAA7\tyu\n2CAA8\tzhan\n2CAA9\tnong\n2CABA\tguang\n2CB07\tzhe\n2CB27\than\n2CB28\thua\n2CB29\tyi\n2CB2A\tkou\n2CB2B\tpi\n2CB2C\twei\n2CB2D\tlun\n2CB2E\tchang\n2CB2F\tren\n2CB30\tqiang\n2CB31\tjin\n2CB32\tpi\n2CB33\tqi\n2CB35\tchen\n2CB37\tshi\n2CB38\tshu\n2CB39\tshen\n2CB3A\tchu\n2CB3B\tlu\n2CB3D\tzuo\n2CB3E\tning\n2CB3F\tzhao\n2CB40\tsi\n2CB41\tmu\n2CB42\thong\n2CB43\tpi\n2CB45\txiang\n2CB46\tduo\n2CB47\tguo\n2CB48\tcha\n2CB49\tji\n2CB4A\tdu\n2CB4C\thua\n2CB4D\than\n2CB4E\thong\n2CB4F\tyang\n2CB51\tzi\n2CB53\ttian\n2CB54\tchuo\n2CB55\ttao\n2CB56\tpeng\n2CB57\tnei\n2CB5A\tchun\n2CB5B\tbo\n2CB5C\tlei\n2CB5D\tsan\n2CB5E\tda\n2CB5F\tcou\n2CB60\tcha\n2CB61\tzhao\n2CB62\tkui\n2CB63\txian\n2CB64\thou\n2CB65\tcong\n2CB66\tnou\n2CB68\tchui\n2CB69\tweng\n2CB6A\txia\n2CB6B\tzhan\n2CB6C\thui\n2CB6D\tqi\n2CB6F\tpie\n2CB70\tyi\n2CB72\tsuo\n2CB73\txi\n2CB74\tjie\n2CB76\thei\n2CB77\tcheng\n2CB78\tlin\n2CB7A\tbiao\n2CB7B\tjiao\n2CB7C\tsui\n2CB7D\tbi\n2CB7F\tji\n2CB81\tbo\n2CB83\tzuan\n2CB84\tjiao\n2CB98\thuo\n2CB9F\tlin\n2CBA0\txia\n2CBA1\tjian\n2CBA2\thong\n2CBA3\tkuang\n2CBA4\tge\n2CBA5\tchu\n2CBA8\thuo\n2CBA9\tqi\n2CBAA\tsha\n2CBAD\tkui\n2CBAF\tque\n2CBB0\te\n2CBB1\tyin\n2CBB2\tyao\n2CBB3\tban\n2CBB4\tan\n2CBB5\txian\n2CBB9\tdeng\n2CBBA\tma\n2CBBB\twu\n2CBBF\tgai\n2CBC0\tji\n2CBC5\txia\n2CBCE\ttui\n2CC03\tmu\n2CC21\tluo\n2CC23\tjian\n2CC24\tzhou\n2CC25\tliang\n2CC31\than\n2CC33\tdie\n2CC36\tsui\n2CC37\tchan\n2CC38\tyu\n2CC3A\tye\n2CC53\tkui\n2CC54\tyou\n2CC55\tmo\n2CC56\tdi\n2CC57\tdan\n2CC59\tpan\n2CC5B\tzhuan\n2CC5C\tlei\n2CC5D\tgen\n2CC5F\twei\n2CC60\tkuo\n2CC62\twen\n2CC63\tchen\n2CC65\thong\n2CC66\tqi\n2CC6A\tyi\n2CC6B\tding\n2CC6C\tsan\n2CC6D\tpo\n2CC6E\tao\n2CC6F\tshou\n2CC70\tpi\n2CC71\tzhan\n2CC73\tyu\n2CC75\twei\n2CC77\txue\n2CC78\txue\n2CC7C\tkai\n2CC7D\txuan\n2CC7F\tguo\n2CC80\thu\n2CC85\tliao\n2CC86\tyu\n2CC95\tzan\n2CC9C\tcheng\n2CCA6\tsi\n2CCAA\tchuang\n2CCAB\tnian\n2CCAD\tjie\n2CCAE\tti\n2CCAF\tgou\n2CCB0\tshang\n2CCB2\tning\n2CCB3\tyi\n2CCB4\tman\n2CCB6\tci\n2CCB7\ten\n2CCB8\tguo\n2CCB9\tmang\n2CCBA\tbao\n2CCBB\tti\n2CCBC\tye\n2CCBE\thu\n2CCC0\tye\n2CCC1\tyao\n2CCC2\tzhui\n2CCC3\tpi\n2CCC5\tsui\n2CCC6\tjian\n2CCC9\tda\n2CCCA\ttao\n2CCCB\txi\n2CCCC\tqiu\n2CCCD\ttang\n2CCD0\tchong\n2CCD1\tying\n2CCD2\tdeng\n2CCD3\tyong\n2CCD4\tmo\n2CCDF\tfen\n2CCF2\tchan\n2CCF3\tfan\n2CCF4\tpei\n2CCF5\tpi\n2CCF6\tjiong\n2CCF7\tgua\n2CCF8\two\n2CCFB\tkuang\n2CCFD\tshen\n2CCFE\tchi\n2CCFF\ttu\n2CD00\tlang\n2CD01\tan\n2CD02\tfei\n2CD03\thuo\n2CD05\tpeng\n2CD06\tqi\n2CD07\tchi\n2CD0A\tlin\n2CD0B\ttie\n2CD0C\tmeng\n2CD0D\tbiao\n2CD0E\ttuo\n2CD0F\tjian\n2CD10\thuan\n2CD28\tnao\n2CD29\tnang\n2CD68\tmi\n2CD80\tjie\n2CD81\tren\n2CD82\tdu\n2CD84\tdiao\n2CD86\tbang\n2CD87\tjie\n2CD89\twu\n2CD8A\tgeng\n2CD8B\tju\n2CD8C\tdai\n2CD8D\ttuo\n2CD8E\tjie\n2CD8F\twei\n2CD90\tzhao\n2CD93\tting\n2CD94\tkao\n2CD95\tti\n2CD97\tlao\n2CD9B\tshan\n2CD9E\thu\n2CD9F\tla\n2CDA0\tlian\n2CDA2\txing\n2CDA3\tzha\n2CDA4\tti\n2CDA6\tyou\n2CDA7\trou\n2CDA8\tji\n2CDAA\tni\n2CDAB\thuang\n2CDAC\tqu\n2CDAD\tji\n2CDAE\txi\n2CDAF\tguo\n2CDB1\tjing\n2CDB2\txiang\n2CDB4\tpu\n2CDB5\tguan\n2CDBA\tguan\n2CDBB\tba\n2CDD5\tbu\n2CDFC\tyi\n2CDFD\txiao\n2CDFE\thong\n2CE00\twen\n2CE01\twa\n2CE02\tge\n2CE05\tchu\n2CE06\tsheng\n2CE08\tchi\n2CE09\tqiong\n2CE0A\tren\n2CE0C\tsha\n2CE0D\tchou\n2CE0E\tli\n2CE0F\tlang\n2CE10\tchuang\n2CE11\tyue\n2CE12\tqi\n2CE15\tying\n2CE16\tyan\n2CE18\tyan\n2CE19\tmiao\n2CE1A\tyue\n2CE1B\thuang\n2CE1C\tpian\n2CE1D\tan\n2CE1E\tlu\n2CE20\tge\n2CE21\tlan\n2CE22\tgao\n2CE23\txian\n2CE24\tpiao\n2CE25\tchong\n2CE26\tzhuo\n2CE27\tyan\n2CE28\tqi\n2CE29\tao\n2CE2A\tfan\n2CE2C\tkou\n2CE2D\tya\n2CE2E\tkui\n2CE2F\tpi\n2CE30\the\n2CE31\tqu\n2CE35\tzhan\n2CE36\tchang\n2CE37\tcou\n2CE38\tbian\n2CE39\tgan\n2CE3E\tqi\n2CE45\tcai\n2CE47\tbo\n2CE49\thun\n2CE4B\thun\n2CE4C\tnie\n2CE4D\tmo\n2CE4E\tshan\n2CE55\tzhen\n2CE56\tnong\n2CE57\tlai\n2CE58\tteng\n2CE63\tzhu\n2CE7A\tya\n2CE7B\tna\n2CE7C\txie\n2CE7D\thang\n2CE80\tzha\n2CE81\tzhi\n2CE82\tnie\n2CE83\tai\n2CE84\tkuo\n2CE85\tchan\n2CE87\tcuo\n2CE88\tyi\n2CE89\tze\n2CE8A\tyun\n2CE8B\tzu\n2CE8C\tya\n2CE8D\tjian\n2CE8E\tci\n2CE8F\tbo\n2CE92\tyin\n2CE93\tchu\n2CE94\tjin\n2CE95\tcha\n2CE96\tjue\n2CE9C\tlong\n2CE9F\tyao\n2D016\tli\n2D11B\tjian\n2D1DC\tpo\n2D1EF\tliu\n2D208\tmu\n2D209\tying\n2D22E\thuan\n2D268\tzui\n2D2B8\tla\n2D382\tzong\n2D39C\tdao\n2D3E6\tai\n2D3F8\twei\n2D546\tsuo\n2D5E1\tke\n2D613\thu\n2D6A6\tguo\n2D74B\tling\n2D784\tai\n2D819\tpu\n2D85C\tshen\n2D8C7\tdian\n2D8E7\tyi\n2D90E\tli\n2D930\tyu\n2D9CB\ttang\n2DA5A\tyi\n2DA5B\tmen\n2DA70\tfa\n2DA86\tzhua\n2DAC0\tkui\n2DAD9\tdi\n2DB48\tya\n2DC0E\tdang\n2DC12\tsha\n2DC4A\thong\n2DCAB\tzhu\n2DD0A\twu\n2DE5C\tluo\n2DED4\tlai\n2E024\tlao\n2E032\tgeng\n2E18F\tlan\n2E1E4\tling\n2E260\tqiu\n2E261\tlu\n2E262\tzhi\n2E263\tzuo\n2E264\tgua\n2E267\tliang\n2E268\tgua\n2E26A\tzou\n2E26B\trui\n2E26C\tcui\n2E26E\tsui\n2E26F\tcai\n2E3FA\tdu\n2E41A\tfan\n2E428\tying\n2E502\tjie\n2E505\tfu\n2E50A\tliang\n2E581\tliang\n2E5B1\txie\n2E64A\tyin\n2E64B\tdu\n2E6D7\ttang\n2E736\tdao\n2E774\tgu\n2E775\ter\n2E777\tfen\n2E778\tchun\n2E779\thuan\n2E77A\tge\n2E81E\tqiang\n2E833\tchen\n2E848\tke\n2E8F2\tgang\n2E8F3\thong\n2E8F4\tchan\n2E8F5\tzhui\n2E8F6\tlu\n2E8F7\tju\n2E92B\tmen\n2E92C\tchu\n2E92F\trui\n2E932\tbi\n2E938\te\n2E9F4\tchang\n2E9F5\twei\n2EA34\tfeng\n2EA35\tliu\n2EA5B\tbi\n2EA5C\thai\n2EA5D\tai\n2EA5E\tyi\n2EAA1\tmang\n2EAA2\thai\n2EAA3\tzong\n2EAA4\tcao\n2EAA5\tdun\n2EAC2\tning\n2EB1B\txu\n2EB1C\tyi\n2EB1D\tgui\n2EB1E\tcan\n2EB1F\thuo\n2EB20\tlu\n2EB21\thua\n2EB22\tweng\n2EB23\txian\n2EB24\tzhen\n2EB61\tjie\n2EB62\tyao\n2EB64\tmie\n2EB65\tgong\n2EB66\tchen\n2EB68\tyan\n2EB6A\tshuang\n2EB70\tgang\n2EB87\tmou\n2EBD9\tke\n2EBF5\tou\n2EBF8\tli\n2EC04\tchong\n2EC09\tping\n2EC14\twei\n2EC38\tyi\n2EC3D\tyue\n2EC3E\tlan\n2EC3F\tqie\n2EC41\tjin\n2EC47\tlian\n2EC4A\tluo\n2EC50\twan\n2EC52\tniao\n2EC63\ttui\n2EC69\tyun\n2EC6F\tdan\n2EC75\tqiao\n2EC81\tqian\n2EC83\tle\n2EC84\ttong\n2EC87\tguo\n2EC94\tai\n2EC9F\txu\n2ECAE\tshuang\n2ECB0\tbi\n2ECB2\tqing\n2ECB6\tjian\n2ECC6\the\n2ECCF\txian\n2ECD6\tyan\n2ECD7\tshu\n2ECE0\tfeng\n2ECE2\tzhu\n2ECE7\tqiao\n2ECF4\tye\n2ED14\tye\n2ED3F\ttian\n2ED45\txi\n2ED60\tyi\n2ED6E\tdiao\n2ED71\tlai\n2ED7F\tcha\n2ED81\tguan\n2ED82\tfeng\n2ED94\twei\n2ED9D\te\n2EDAC\tjian\n2EDC5\tdong\n2EDC7\tluo\n2EDC8\tji\n2EDCA\tbo\n2EDD7\tdai\n2EDDD\ttao\n2EDE8\tli\n2EDF8\tyuan\n2EDFB\tliu\n2EE08\tjun\n2EE0A\tchan\n2EE0C\tshi\n2EE0F\tcuan\n2EE10\tfang\n2EE15\tfu\n2EE1E\tqi\n2EE1F\tchang\n2EE20\tkuan\n2EE25\txie\n2EE26\tfu\n2EE2E\txie\n2EE3C\tbiao\n2EE3D\tfei\n2EE40\tpin\n2EE42\tfei\n2EE45\tmo\n2EE4B\tzhou\n2EE4C\twen\n2EE59\the\n2EE5C\tyan\n2EE5D\tda\n2F800\tli\n2F801\twan\n2F802\tyi\n2F804\tni\n2F805\twu\n2F806\ttui\n2F807\tbing\n2F808\tza\n2F809\tbei\n2F80A\tseng\n2F80B\txiang\n2F80C\tjun\n2F80D\tsuo\n2F80E\tmian\n2F80F\ttu\n2F810\thuang\n2F811\tju\n2F814\tnei\n2F815\tzai\n2F817\trong\n2F818\tyuan\n2F819\tbing\n2F81A\tdong\n2F81B\tkuang\n2F81C\tqing\n2F81D\tqian\n2F81E\tren\n2F81F\tpi\n2F820\tke\n2F821\tluo\n2F822\tge\n2F823\tchan\n2F824\tji\n2F825\tyong\n2F826\tmian\n2F827\tqin\n2F828\tshao\n2F829\tbao\n2F82A\tcong\n2F82B\tbei\n2F82C\thui\n2F82D\tbei\n2F82E\tbo\n2F82F\tji\n2F830\tji\n2F831\tqing\n2F832\tqing\n2F833\tqing\n2F835\thui\n2F836\tji\n2F837\tsou\n2F839\tjiao\n2F83A\tchi\n2F83B\tyao\n2F83C\txian\n2F83D\txi\n2F83E\tcheng\n2F83F\tzhou\n2F840\te\n2F841\tmie\n2F842\ttang\n2F843\tqi\n2F844\txian\n2F845\tshan\n2F846\tshan\n2F847\thui\n2F848\tchi\n2F849\tzha\n2F84A\tyao\n2F84B\ttu\n2F84C\ttan\n2F84D\ttu\n2F84E\thao\n2F84F\tpen\n2F850\tqie\n2F851\tzhuang\n2F852\tcheng\n2F853\tzhi\n2F854\ttu\n2F855\txing\n2F856\tji\n2F857\tbao\n2F858\tdi\n2F85A\tmai\n2F85B\thu\n2F85C\tfeng\n2F85D\tduo\n2F85E\tmeng\n2F85F\tshe\n2F860\tchi\n2F862\tji\n2F863\tyu\n2F864\ttui\n2F865\tpin\n2F866\tfu\n2F867\tsao\n2F868\tcha\n2F869\trao\n2F86A\tlan\n2F86B\tlan\n2F86D\tyuan\n2F86E\tzhi\n2F86F\tning\n2F870\tbao\n2F871\tlao\n2F872\tshou\n2F873\tjiang\n2F874\tdang\n2F875\twang\n2F876\tyao\n2F877\ttu\n2F878\tche\n2F879\txiu\n2F87A\tqian\n2F87B\twu\n2F87C\tyan\n2F87E\tdian\n2F87F\tzi\n2F880\tchan\n2F881\txun\n2F882\tchao\n2F883\tyi\n2F884\txun\n2F885\tshui\n2F886\tmao\n2F887\tfen\n2F888\tman\n2F88A\tyi\n2F88B\tbing\n2F88C\tbi\n2F88D\tshu\n2F88E\tlang\n2F88F\tshuo\n2F890\tgong\n2F893\tyu\n2F894\ttao\n2F895\ttao\n2F896\tyi\n2F899\txing\n2F89A\tdiao\n2F89B\tshan\n2F89C\tdong\n2F89D\tren\n2F89E\tzhi\n2F89F\tkuang\n2F8A0\tyuan\n2F8A1\thuang\n2F8A2\tjue\n2F8A3\thui\n2F8A4\tdong\n2F8A5\tdun\n2F8A6\tci\n2F8A7\thuang\n2F8A8\tshen\n2F8A9\thuang\n2F8AA\tlou\n2F8AB\tzeng\n2F8AC\txian\n2F8AD\tfen\n2F8AE\tcan\n2F8AF\tmeng\n2F8B0\tcheng\n2F8B1\tlan\n2F8B2\tcheng\n2F8B3\tjia\n2F8B4\tku\n2F8B5\tbao\n2F8B6\tba\n2F8B7\tjuan\n2F8B9\twan\n2F8BA\tpin\n2F8BB\tshe\n2F8BC\tsao\n2F8BD\tji\n2F8BF\tjin\n2F8C0\tyan\n2F8C1\tyan\n2F8C2\tdou\n2F8C3\tmo\n2F8C4\tjiang\n2F8C5\thui\n2F8C6\tjiao\n2F8C8\tmin\n2F8C9\tjing\n2F8CB\tji\n2F8CC\tshu\n2F8CD\tjin\n2F8CE\twei\n2F8CF\tshu\n2F8D0\twen\n2F8D1\tchang\n2F8D2\tmao\n2F8D3\tmian\n2F8D4\tzui\n2F8D5\tpu\n2F8D6\tna\n2F8D7\ttan\n2F8D8\tlang\n2F8D9\twang\n2F8DA\tzong\n2F8DB\tqi\n2F8DC\tbiao\n2F8DE\thua\n2F8DF\tguai\n2F8E0\tji\n2F8E1\tsang\n2F8E2\tmei\n2F8E4\tao\n2F8E5\tben\n2F8E6\tzi\n2F8E7\the\n2F8E8\tzha\n2F8E9\tyao\n2F8EA\tgai\n2F8EB\tshe\n2F8ED\tzhi\n2F8EE\tyi\n2F8EF\tci\n2F8F1\txu\n2F8F2\tkun\n2F8F3\tsui\n2F8F4\twen\n2F8F5\tsha\n2F8F6\tqiao\n2F8FA\tfan\n2F8FC\tyan\n2F8FD\tben\n2F8FE\tqian\n2F8FF\twu\n2F900\tpai\n2F901\thai\n2F902\tliu\n2F903\thao\n2F904\tjin\n2F905\tnie\n2F906\tben\n2F907\tping\n2F908\tgang\n2F909\tyan\n2F90A\tlong\n2F90B\tzi\n2F90C\tdian\n2F90D\tsha\n2F90E\tyan\n2F90F\tchao\n2F912\tfen\n2F913\tyue\n2F914\tjing\n2F915\tying\n2F916\tshu\n2F917\tqian\n2F918\tzai\n2F919\tzhuan\n2F91A\ttan\n2F91C\tduan\n2F91E\tcong\n2F920\tcuan\n2F921\tjue\n2F922\tzha\n2F924\txi\n2F925\tbei\n2F926\tyan\n2F928\tta\n2F929\twang\n2F92A\tgong\n2F92B\tyue\n2F92C\tping\n2F92D\tping\n2F92E\tdai\n2F92F\tyu\n2F930\ttian\n2F931\tsuo\n2F932\tqiong\n2F933\txing\n2F934\trui\n2F936\tzai\n2F938\tyi\n2F939\tping\n2F93A\tyu\n2F93E\tyan\n2F93F\tji\n2F940\tzhi\n2F945\tzhen\n2F946\tzhen\n2F947\tzhen\n2F948\tjuan\n2F949\tjie\n2F94A\tchen\n2F94B\tye\n2F94C\tshi\n2F94E\txing\n2F94F\tlu\n2F950\ttian\n2F951\thui\n2F952\tjiu\n2F953\tzu\n2F954\tchi\n2F955\tliu\n2F956\tfu\n2F957\tshu\n2F958\tjian\n2F959\tgu\n2F95A\tji\n2F95B\twen\n2F95D\ttian\n2F95E\ttian\n2F95F\tping\n2F960\tping\n2F962\tzhuan\n2F963\tzhu\n2F964\twei\n2F965\tchao\n2F966\tbei\n2F967\txi\n2F968\tjiang\n2F969\tsan\n2F96A\tji\n2F96C\tbeng\n2F96D\tyao\n2F96E\tzi\n2F96F\tzong\n2F970\tsao\n2F971\tluo\n2F972\txing\n2F974\tmei\n2F976\tchao\n2F978\tyang\n2F979\tao\n2F97A\tzhe\n2F97D\tping\n2F97F\tcong\n2F980\tken\n2F981\tren\n2F982\tyu\n2F983\tcui\n2F984\tcong\n2F985\tpi\n2F986\tying\n2F989\txuan\n2F98B\tyu\n2F98C\txi\n2F98D\tci\n2F98E\tbeng\n2F98F\tqi\n2F990\tyu\n2F991\tzhi\n2F992\tlao\n2F993\thua\n2F994\tfang\n2F995\tya\n2F996\tku\n2F998\truo\n2F999\tchai\n2F99A\trong\n2F99B\tjie\n2F99C\twu\n2F99D\tmang\n2F99E\tdi\n2F99F\tzhu\n2F9A0\tping\n2F9A1\tju\n2F9A2\tjun\n2F9A3\tcai\n2F9A5\tsuo\n2F9A8\tping\n2F9A9\tjin\n2F9AA\tcuo\n2F9AC\trui\n2F9AE\tcheng\n2F9AF\tlu\n2F9B0\tchao\n2F9B1\tlu\n2F9B2\tkui\n2F9B3\tnue\n2F9B4\tlu\n2F9B5\tkui\n2F9B6\txi\n2F9B7\tchi\n2F9B8\tqian\n2F9B9\tyuan\n2F9BA\tping\n2F9BB\tyun\n2F9BC\tdie\n2F9BD\tzhu\n2F9BE\tci\n2F9BF\tji\n2F9C0\tgui\n2F9C1\txiang\n2F9C2\tci\n2F9C3\tzhun\n2F9C4\tyi\n2F9C5\tjian\n2F9C6\tliu\n2F9C7\tshui\n2F9C8\tlu\n2F9C9\tyan\n2F9CA\tmao\n2F9CD\tnin\n2F9CE\tyuan\n2F9CF\tcheng\n2F9D0\tyu\n2F9D1\tbian\n2F9D2\tshi\n2F9D3\tjian\n2F9D4\tguan\n2F9D5\tbi\n2F9D6\tgan\n2F9D7\tqi\n2F9D8\tshu\n2F9D9\tzhao\n2F9DA\tba\n2F9DB\tjian\n2F9DC\tpian\n2F9DE\tren\n2F9DF\tshu\n2F9E2\tqi\n2F9E3\tping\n2F9E4\tzi\n2F9E6\tchao\n2F9E7\tbo\n2F9E8\txuan\n2F9E9\thua\n2F9EA\tbing\n2F9EB\tqiang\n2F9EC\tzan\n2F9EE\tkai\n2F9EF\tpeng\n2F9F0\tshai\n2F9F2\twei\n2F9F3\tqian\n2F9F4\txi\n2F9F5\tyun\n2F9F6\tpang\n2F9F7\tping\n2F9F8\tlu\n2F9F9\tchan\n2F9FA\tbi\n2F9FC\tkun\n2F9FD\tyan\n2F9FE\te\n2F9FF\te\n2FA00\tping\n2FA01\txue\n2FA02\tji\n2FA03\tban\n2FA04\te\n2FA05\tyun\n2FA06\tbao\n2FA07\ttui\n2FA08\tgan\n2FA09\tqiong\n2FA0A\tzhen\n2FA0B\tji\n2FA0C\tjian\n2FA0D\tjiu\n2FA0E\tji\n2FA0F\tpi\n2FA10\tyu\n2FA11\tma\n2FA12\tsha\n2FA15\tma\n2FA16\tqian\n2FA17\tzhi\n2FA18\tmin\n2FA19\tzhi\n2FA1A\tmi\n2FA1B\tfen\n2FA1C\tbi\n2FA1D\tpian\n30021\tqian\n30022\tjian\n3005C\tluan\n30067\tsong\n30078\tdang\n3007E\tfu\n3008B\txian\n3008E\txian\n3008F\tyu\n30097\tdi\n3009C\ttui\n300A6\tlu\n300AD\tsi\n300C6\tzan\n300EE\txue\n300F7\tchuang\n300FB\tbi\n300FF\tdu\n30101\tshen\n3011E\ttuan\n30154\tlu\n30165\tdu\n30166\tdan\n3017B\txia\n30195\twei\n3019A\tlan\n301C0\tgai\n301CE\tdong\n301D5\tjia\n301D6\thong\n301D8\tji\n301E1\the\n301E3\txi\n301F2\ttan\n301FC\tshan\n30206\tlan\n30207\tchang\n3020A\tdian\n3020D\tchen\n30213\tlan\n3022F\tza\n30236\tmo\n30241\tyan\n30244\tza\n30258\twei\n30259\tgang\n3025A\txian\n30263\tyi\n30265\tjia\n30269\tque\n3026A\tye\n30271\tjian\n3027D\txi\n30282\tzhi\n30285\tzhan\n30288\tqiang\n30291\txian\n3029B\tkui\n3029F\tman\n302A1\tyan\n302A2\tqian\n302D6\tlou\n302F8\tdang\n302F9\tzhuan\n302FD\tyan\n302FE\tbi\n30300\tying\n30302\tzheng\n30306\tqian\n30307\tze\n30309\tyun\n30319\tlan\n30326\tya\n30337\twei\n3038C\tsong\n3038E\tlong\n3038F\tdong\n30390\tlu\n30391\tye\n30394\tyao\n30396\tze\n3039B\tkuai\n3039E\tnao\n303A0\tyan\n303A2\twei\n303AB\tyue\n303B9\tyan\n303C1\tcuan\n303D3\twu\n303D5\tsan\n303DC\tlou\n303DF\tlan\n303F2\tma\n303F6\tkuai\n303FC\tdai\n3043E\tkuang\n30441\ttuan\n30444\tlun\n30454\tzhi\n30455\tyan\n30459\tliu\n3045F\tgong\n30465\txian\n30467\tcan\n3046A\tsheng\n3046B\tluo\n3046C\tzhi\n30475\tdi\n30478\tye\n3047F\ttang\n30486\tman\n30492\tchi\n30496\tmiao\n304C4\tcheng\n304C6\twu\n304D4\tshan\n304D9\tye\n304DC\tzhi\n304DF\tza\n304E7\tsun\n304EC\tli\n304F1\tkeng\n304F7\truan\n304FB\tgui\n304FC\tchan\n30507\tdi\n3050B\tgui\n30532\tqian\n30536\tyu\n30541\txun\n30545\tqu\n30548\tjiao\n30550\txie\n3056D\tkuai\n30588\tyan\n305A0\tnan\n305A9\tli\n305C6\thui\n305D3\thuang\n305D6\tlun\n305D9\tchou\n305DA\txie\n305DB\tzhai\n305DC\tyan\n305E1\tchan\n305E2\thui\n305E3\tza\n305E6\tjin\n305E8\tshi\n305EC\tqian\n305F5\tshen\n305F9\tsu\n305FA\tfen\n30600\tdai\n30608\tju\n30613\tqing\n30620\tyan\n30623\tmian\n30629\txiao\n30633\tlai\n30636\tsu\n30638\tsou\n3064B\twu\n3064E\than\n30651\txiao\n30655\tlou\n30694\tning\n306A6\tlu\n306AA\tran\n306B1\tye\n306CA\tma\n306CF\tcong\n306D2\tdong\n306DB\tshan\n306E1\tbi\n306E3\tzhi\n306E4\tzhi\n306E5\tai\n306E6\thui\n306E9\tshan\n306EA\tluan\n306EE\tlu\n306F2\tlian\n306F5\txian\n306FD\tding\n30710\tlan\n3071C\tqin\n3071D\tyang\n30722\the\n30728\tjian\n30733\tying\n30745\tying\n3074B\tyin\n3074D\thui\n30757\tjian\n3075F\txian\n30764\txian\n3077E\tchui\n30787\tyi\n3078D\tjie\n307A4\tjian\n307B2\tbei\n307B7\tzao\n307BB\tfen\n307D8\tyan\n3081B\tjian\n3082B\tgang\n30832\tkeng\n30834\tyao\n30839\tpai\n30844\tlu\n3084A\txiao\n3084B\thui\n3084E\tlai\n3084F\two\n30854\tchan\n3085E\tben\n30862\tying\n30869\tqi\n30870\tche\n30875\tlu\n3087B\tnao\n3087D\tshu\n30884\tsu\n308A2\twu\n308A4\tying\n308A6\tlou\n308E6\twei\n308E9\tning\n308EC\tji\n308EF\txian\n308F6\ttui\n308FC\tji\n308FD\tluan\n30913\ttang\n30915\tli\n30928\tta\n3092B\tdu\n3092C\tdu\n3094A\tkan\n30952\tcong\n3095B\tfen\n3095E\tying\n30960\tman\n30962\txi\n30963\tkeng\n30968\txian\n3096A\tgui\n3096D\tmeng\n30979\ttang\n3099C\tba\n309A6\tli\n309A8\thui\n309AD\tlong\n309B0\tze\n309B4\tya\n309B7\tlao\n309BE\tyan\n309BF\ttuo\n309C3\tjian\n309C7\txian\n309C9\tzhi\n309CE\tqin\n309D4\tjian\n309D8\tzhu\n309F0\tyang\n309FB\tgui\n309FE\tnong\n30A16\tti\n30A1C\tkuang\n30A26\tji\n30A33\tzi\n30A45\tlong\n30A4F\ttiao\n30A53\tcheng\n30A67\txu\n30A6E\ttuan\n30A72\tlu\n30A78\tjiao\n30A79\tdang\n30A7A\tyue\n30A7B\tzhua\n30A8A\tzhong\n30A8F\tlu\n30AA3\tying\n30AAB\ttuan\n30AAD\tzhang\n30AB6\ttuan\n30ACB\tmen\n30AD6\tlan\n30AFC\tzheng\n30AFD\tfou\n30B00\tji\n30B03\tlie\n30B05\tfu\n30B06\tqu\n30B07\tzhu\n30B08\txian\n30B09\ttuo\n30B0B\thong\n30B0C\tgeng\n30B0D\txie\n30B0E\tbi\n30B0F\tzhu\n30B10\tqiao\n30B11\tzheng\n30B12\tci\n30B13\tgai\n30B14\tbeng\n30B16\tcheng\n30B17\tqiu\n30B18\tfu\n30B19\tchen\n30B1A\tyun\n30B1B\tzhen\n30B1C\tmian\n30B1E\tqin\n30B1F\tyu\n30B20\thua\n30B21\tqie\n30B22\tqi\n30B23\txi\n30B24\tbi\n30B25\tzong\n30B26\thu\n30B27\ttian\n30B29\ttou\n30B2A\tshan\n30B2B\tzhi\n30B2C\tmiao\n30B2D\tbeng\n30B2E\txian\n30B2F\tzong\n30B30\tcong\n30B31\thui\n30B32\tquan\n30B33\tni\n30B34\tzai\n30B35\txuan\n30B36\tqi\n30B37\tsan\n30B38\tsui\n30B39\tzuan\n30B3A\tzun\n30B3B\tyu\n30B3C\tla\n30B3D\txie\n30B3E\tlian\n30B3F\tpu\n30B40\tyou\n30B41\tcong\n30B44\tguan\n30B54\tjuan\n30B5A\tlou\n30B62\tsha\n30B63\tdao\n30B79\tlong\n30B85\txiang\n30B87\thu\n30B99\tzhu\n30B9D\txiao\n30BB2\tsou\n30BCB\tni\n30BCE\tman\n30BF2\tjian\n30C06\ttan\n30C0B\tshuang\n30C0C\tzhou\n30C0F\tdai\n30C11\tlou\n30C20\txu\n30C22\ttang\n30C24\tqiu\n30C28\tlun\n30C2E\tkui\n30C31\tdui\n30C33\tshi\n30C34\tqi\n30C35\tsha\n30C36\tza\n30C37\tfu\n30C39\tliu\n30C3A\tshe\n30C3E\tke\n30C40\tgong\n30C47\tjian\n30C48\tyong\n30C49\tmeng\n30C4C\tna\n30C4D\tfen\n30C50\txu\n30C51\tjian\n30C5B\tzhong\n30C5D\txiang\n30C5F\tfen\n30C66\tfu\n30C69\tlu\n30C6E\tlu\n30C6F\tbei\n30C71\tci\n30C72\tzhi\n30C7E\tlai\n30C81\ttui\n30C82\tteng\n30C92\tlei\n30C9F\twu\n30CA0\tzhan\n30CAB\twu\n30CAC\tche\n30CAE\tqian\n30CAF\tzong\n30CB0\tlun\n30CB2\tgui\n30CB3\tzhan\n30CB4\tlong\n30CB5\tze\n30CB6\txing\n30CB8\te\n30CB9\tyi\n30CBA\tguo\n30CBB\tda\n30CC1\tji\n30CC2\tjian\n30CC4\tchen\n30CCA\tfei\n30CD7\tying\n30CDA\twei\n30CF2\tlong\n30CF5\tyi\n30CF8\tdui\n30CF9\tyan\n30CFA\tnong\n30CFC\tshi\n30D02\tsen\n30D15\tmie\n30D16\tshao\n30D17\tli\n30D18\tjian\n30D19\tjun\n30D1A\tlou\n30D1B\tdou\n30D1C\tqu\n30D1D\tluo\n30D1E\tqu\n30D22\tli\n30D23\txue\n30D24\tdai\n30D2F\tying\n30D4A\tjiao\n30D4C\tyang\n30D4D\tzhun\n30D4E\tyou\n30D4F\tchao\n30D50\tfan\n30D51\te\n30D52\tchen\n30D53\txu\n30D54\tyi\n30D56\tyi\n30D57\tyang\n30D59\tdie\n30D5A\tling\n30D5B\tgou\n30D5C\ttao\n30D5D\the\n30D5E\tyong\n30D60\tnao\n30D61\tkeng\n30D62\tshan\n30D63\the\n30D64\te\n30D65\tyi\n30D66\txiao\n30D67\tzhi\n30D68\tzhan\n30D69\tbu\n30D6B\tdou\n30D6C\tbie\n30D6D\tchan\n30D6E\te\n30D6F\tshua\n30D70\txing\n30D71\tchen\n30D72\tqi\n30D73\tzhuo\n30D74\tchu\n30D75\tni\n30D76\tzhui\n30D77\tzhuo\n30D78\tta\n30D79\tnie\n30D7A\tyuan\n30D7B\txu\n30D7C\thuo\n30D7D\ttao\n30D7E\txi\n30D7F\the\n30D80\tyu\n30D81\tyi\n30D82\tcong\n30D83\txi\n30D84\tzha\n30D85\thao\n30D86\than\n30D87\ttuo\n30D88\tchi\n30D89\ttan\n30D8A\tyi\n30D8C\tnou\n30D8D\txuan\n30D8E\tse\n30D8F\tyao\n30D91\tlong\n30D94\tdu\n30DA8\tmi\n30DAC\tlou\n30DDE\tte\n30DE0\tyi\n30DE1\twan\n30DE2\tchi\n30DE4\tsui\n30DE5\tcong\n30DE6\tfei\n30DE7\tjin\n30DE8\tkui\n30DE9\tsheng\n30DEA\tyi\n30DEB\tbiao\n30DEC\tzhuan\n30DED\tzang\n30DEE\txuan\n30DF4\tli\n30DF5\tqiao\n30DF6\tqiao\n30DF8\tdu\n30E07\tshuang\n30E08\tdie\n30E0A\tgui\n30E0E\tchan\n30E10\txi\n30E14\tlian\n30E1A\tdai\n30E1B\tchi\n30E1E\ttui\n30E40\tduo\n30E72\twei\n30E73\tchun\n30E74\tfan\n30E75\tyi\n30E76\tkuang\n30E77\tyue\n30E78\ttun\n30E7A\tfan\n30E7B\tba\n30E7C\tzhan\n30E7D\tpeng\n30E7E\txian\n30E7F\trong\n30E80\tdi\n30E81\tqu\n30E82\tpao\n30E83\tzhui\n30E84\tgong\n30E85\tju\n30E86\thong\n30E87\twan\n30E88\tyin\n30E89\tqian\n30E8A\tleng\n30E8B\tzhe\n30E8C\tlu\n30E8D\tguo\n30E8E\tpai\n30E8F\tpeng\n30E90\tkan\n30E91\tyuan\n30E92\tchuan\n30E93\tfu\n30E94\tzong\n30E95\tduo\n30E96\tzhen\n30E97\tjian\n30E98\tkeng\n30E99\tse\n30E9A\ter\n30E9B\tlao\n30E9C\tfan\n30E9D\tchong\n30E9E\tzhan\n30E9F\tji\n30EA0\tnie\n30EA1\tkai\n30EA2\tluo\n30EA3\tlin\n30EA4\tmin\n30EA8\thuo\n30EAD\tchen\n30EB2\tdang\n30EB7\trao\n30EC6\tdi\n30EDD\tbiang\n30EDE\tbiang\n30EE1\txu\n30EE6\twei\n30EEE\tqiao\n30EF3\tbi\n30F05\tyi\n30F0B\tlao\n30F0F\tlan\n30F11\tmi\n30F3B\tqing\n30F55\tji\n30F56\tba\n30F57\thua\n30F58\tdi\n30F5A\tkuang\n30F5B\tqiao\n30F5C\tou\n30F5D\tli\n30F5E\te\n30F60\tzhi\n30F61\tri\n30F62\txian\n30F63\tyin\n30F65\tbing\n30F66\tlong\n30F67\tpi\n30F68\tzhai\n30F69\tka\n30F6B\tsheng\n30F6C\the\n30F6D\tgou\n30F6E\tfu\n30F6F\tzhu\n30F70\tban\n30F71\tfu\n30F72\tji\n30F73\tqin\n30F74\tkua\n30F75\tguang\n30F76\ttong\n30F77\thui\n30F78\tpi\n30F79\tchi\n30F7A\tgui\n30F7B\tren\n30F7C\tbing\n30F7D\tyong\n30F7E\tguo\n30F7F\tzhe\n30F80\tbo\n30F81\thong\n30F83\tzhuo\n30F84\tmei\n30F85\than\n30F86\tyu\n30F87\ttun\n30F88\tsha\n30F8A\tcong\n30F8C\tjian\n30F8D\tbiao\n30F8E\tpi\n30F8F\ttao\n30F90\tfei\n30F91\tpian\n30F92\tguan\n30F93\tta\n30F95\tye\n30F96\tduo\n30F97\tzhen\n30F98\tchen\n30F99\tyu\n30F9A\twei\n30F9B\tjie\n30F9C\tduan\n30F9D\tsheng\n30F9E\tzong\n30F9F\tfu\n30FA1\thong\n30FA2\tshi\n30FA4\txia\n30FA5\tkui\n30FA6\tzuan\n30FA9\tye\n30FAA\tya\n30FAB\tjian\n30FAC\tda\n30FAD\tai\n30FAE\tlian\n30FAF\ttang\n30FB0\tcui\n30FB1\tzong\n30FB2\tlu\n30FB3\tlan\n30FB4\tsi\n30FB6\thui\n30FB7\tzan\n30FB8\tding\n30FB9\tjuan\n30FBB\ttian\n30FBC\tquan\n30FBD\tzhu\n30FBE\tnie\n30FBF\tla\n30FC1\tao\n30FC2\txu\n30FC3\tmie\n30FC4\tlei\n30FC6\tzuan\n30FC7\tzha\n30FC8\tjian\n30FC9\tlei\n30FCA\tluo\n30FE6\tzhen\n30FE8\tguan\n30FE9\txia\n30FEA\txie\n30FEB\twei\n30FEC\tpeng\n30FF0\tzuan\n30FF3\tshai\n30FF4\tya\n30FF5\tyu\n30FF9\tguang\n30FFA\ttang\n30FFB\txi\n30FFE\tpi\n31011\tzhi\n31021\tfen\n31052\tdui\n3105E\twan\n31071\tyi\n31073\tduo\n31074\tbi\n31076\tqian\n31077\tdu\n31079\tgui\n3107A\tlou\n3107D\tlan\n3107E\tlan\n31083\tsa\n31084\tmei\n31085\tbi\n31086\tge\n31087\tquan\n31088\tyun\n31089\tqiao\n3108A\tshe\n3108B\tdu\n3108C\thu\n3108D\tdui\n3108E\txie\n31090\tyun\n310A0\tduo\n310A1\tku\n310A2\tzhuo\n310A3\tyao\n310A4\thui\n310A5\te\n310A6\tping\n310A7\tlei\n310A8\te\n310A9\tfu\n310AB\tyan\n310AC\tkui\n310AD\tchui\n310AE\tpi\n310AF\tcui\n310B0\than\n310B1\tkan\n310B2\tsai\n310B3\tgao\n310B4\tjiang\n310B5\tkui\n310B6\txin\n310B7\tzhan\n310B8\tbin\n310BA\tpiao\n310BB\tqiao\n310D4\tbiao\n310D5\txia\n310D6\tyou\n310D7\ttai\n310D8\tlie\n310D9\tliu\n310DA\tli\n310DC\trui\n310DD\txiu\n310DE\tyu\n310DF\txi\n310E0\tbiao\n310F1\txi\n310F2\tyu\n310F3\tbo\n310F4\tfan\n310F5\tying\n310F7\tban\n310F8\tzhi\n310F9\ten\n310FA\ttian\n310FC\tfen\n310FD\te\n310FE\tbu\n310FF\ttan\n31100\tfen\n31101\ttou\n31103\tjian\n31104\thui\n31106\tchi\n31107\tshang\n31108\tmeng\n31109\ten\n3110A\tzan\n3113C\tzhu\n3113D\tzhe\n3113E\tguang\n3113F\tdu\n31140\tbao\n31141\tzhi\n31142\tsa\n31143\tju\n31144\tba\n31145\tlong\n31147\tzhen\n31148\tbi\n31149\trong\n3114A\tzhi\n3114B\ter\n3114D\txu\n3114E\tfu\n3114F\ttao\n31150\tbo\n31153\tbo\n31154\tsong\n31155\tlai\n31156\txuan\n31157\te\n31159\ttui\n3115A\tshe\n3115B\ttuo\n3115C\tyao\n3115D\tpian\n3115E\txia\n3115F\trou\n31160\than\n31161\tgui\n31162\tcheng\n31163\ttao\n31164\tpin\n31166\thuang\n31167\txu\n31169\txi\n3116A\tdian\n3116B\tyu\n3116C\tyan\n3116E\txiao\n31180\tqian\n31181\tqian\n31183\tkui\n31184\tfei\n31185\tlan\n31186\tman\n31188\tzuan\n3118C\tshang\n3118D\tchao\n31199\tchao\n3119A\tkui\n3119B\tchou\n311A5\tdan\n311CD\tya\n311CF\ttuo\n311D0\tyuan\n311D1\tbei\n311D2\tpi\n311D3\thu\n311D4\tna\n311D5\tyu\n311D6\tban\n311D7\tlun\n311D8\thang\n311D9\tshen\n311DA\tmo\n311DB\twei\n311DC\tqu\n311DD\tpi\n311DE\tshan\n311DF\txia\n311E0\tqiu\n311E1\txing\n311E2\tgun\n311E3\tbo\n311E4\tyou\n311E5\tgeng\n311E6\tku\n311E7\tti\n311E8\tshu\n311E9\tjiao\n311EA\tluo\n311EB\tru\n311EC\tyi\n311ED\tlai\n311EE\tmang\n311EF\tshao\n311F0\tye\n311F1\ttiao\n311F2\tfu\n311F3\tsuo\n311F4\tna\n311F5\tji\n311F6\tlu\n311F7\tcuo\n311F8\tying\n311F9\tzhi\n311FA\tji\n311FB\txian\n311FC\tjiu\n311FD\tju\n311FE\tzong\n311FF\tsu\n31200\tju\n31201\tshan\n31202\tyu\n31203\twei\n31204\thou\n31205\tzong\n31206\tlou\n31207\tgeng\n31208\tgeng\n31209\tqian\n3120A\tliu\n3120B\thao\n3120C\txiu\n3120D\truo\n3120E\tsang\n3120F\tzhu\n31210\tzhuan\n31211\thui\n31212\tsi\n31213\txun\n31214\tcen\n31215\tfan\n31216\tlai\n31217\tru\n31218\tchang\n31219\tmie\n3121A\te\n3121B\tmeng\n3121C\txian\n31247\tyi\n31248\tdiao\n3124A\tgan\n3124B\than\n3124C\tyi\n3124D\tyu\n3124E\tfu\n3124F\ttuan\n31250\tju\n31251\tban\n31252\thuan\n31253\thu\n31254\tjue\n31255\tge\n31256\tpi\n31257\tdan\n31258\tju\n31259\tzhi\n3125A\ttie\n3125B\tzhi\n3125C\tfu\n3125D\tbi\n3125E\twu\n3125F\tze\n31260\tjing\n31261\tbian\n31262\tyao\n31263\tsong\n31264\tgui\n31265\tjia\n31266\tlao\n31267\tyuan\n31268\tya\n31269\tti\n3126A\tai\n3126B\tzhu\n3126C\tjiao\n3126D\tgui\n3126E\tluo\n3126F\tyang\n31271\tkun\n31272\tmou\n31273\tmai\n31274\tyang\n31275\tlai\n31276\tkan\n31277\tyi\n31278\ttu\n31279\txi\n3127A\tfu\n3127B\ttuo\n3127C\tji\n3127D\tji\n3127E\tjun\n3127F\tjun\n31280\tlu\n31281\tqi\n31282\tming\n31283\tli\n31284\tyi\n31285\tzhui\n31286\ttu\n31287\tju\n31288\tyi\n3128A\tkong\n3128B\tjian\n3128C\tju\n3128D\tduo\n3128E\tzi\n3128F\tfu\n31290\tjie\n31291\tchun\n31292\tyuan\n31293\tmo\n31295\tti\n31296\ttu\n31297\trou\n31298\tchuan\n31299\tzhen\n3129A\ttian\n3129B\tsun\n3129C\tniao\n3129D\ttang\n3129F\txia\n312A0\ttu\n312A1\tyao\n312A2\tji\n312A3\tyan\n312A4\tyong\n312A5\tshang\n312A6\tyi\n312A7\tjue\n312A9\ttu\n312AA\tling\n312AB\tyu\n312AC\tshu\n312AD\tyu\n312AE\tluo\n312AF\tji\n312B0\tyi\n312B1\tdi\n312B2\tbu\n312B3\tlei\n312B5\tyue\n312BA\tlu\n312BB\tlu\n312BC\tchuai\n312BD\thuai\n312C6\tshan\n312C7\the\n312C8\tkuang\n312CA\tmo\n312CB\tqu\n312CD\ttou\n312CE\thua\n312D0\tqu\n312D3\tge\n312D4\tbing\n312D5\tqu\n312D6\tfu\n312D7\tfu\n312D8\tsha\n312D9\tguo\n312DC\tmo\n312DD\tbu\n312E1\tlou\n312E2\tchao\n312EA\tzhi\n312EB\tkuang\n312EC\tlian\n312EE\tmeng\n312F1\tfen\n312F4\tchan\n312F6\tlu\n312FE\tcu\n312FF\tqu\n31300\tyang\n31301\tqu\n31303\twa\n31304\tzhi\n31305\tmi\n31306\tmeng\n31307\tbie\n31308\tma\n31309\tbi\n3130A\tchang\n3130F\thun\n31316\tnong\n31317\tji\n31318\tzi\n31319\tzi\n3132B\tyan\n3132C\tze\n3132D\tzou\n3132E\tchu\n3132F\tchi\n31330\tyao\n31331\txie\n31332\tquan\n31333\tyun\n31334\tzhai\n31335\tzhan\n31336\tzou\n31337\tyi\n31338\tji\n31339\tou\n3133A\tdian\n3133D\tyi\n31341\tgong\n31342\tda\n31344\tran\n31345\tgou\n31346\tjiao\n31347\ttong\n31348\tbie\n31350\tqi\n31355\tpa\n3135B\tao\n313A0\tsi\n313B6\tkua\n313BC\tge\n313C5\tji\n313CB\tan\n313E4\tlu\n313F1\tlao\n3140F\tgu\n31419\tchan\n3141B\ttuo\n3143F\twai\n31456\tguan\n314F0\tri\n3152F\tzhan\n31570\tlei\n31580\thong\n31585\tbian\n31587\tgan\n3158E\tao\n31591\tju\n31592\tshan\n31595\tzhuai\n31596\ttu\n31599\then\n3159D\tzai\n3159E\tzai\n3159F\tkuang\n315A7\tchong\n315AB\twu\n315AD\tgong\n315B0\ttuo\n315B2\tjian\n315B7\tcheng\n315BC\tpai\n315BD\tzhong\n315C2\tsa\n315C3\thun\n315C5\tniao\n315C9\twa\n315CB\tge\n315CC\tla\n315CE\tyou\n315D5\tqiu\n315D6\tzhong\n315DA\tyong\n315DE\tku\n315DF\tling\n315E2\thuang\n315E4\tgao\n31606\thai\n31609\tlian\n3162D\tnang\n3162E\tfen\n31632\ttuo\n31667\txu\n3169D\tzha\n316A6\tmao\n316AF\tmo\n316B1\ta\n316C6\tniao\n316CD\tlun\n316D2\thong\n316D3\tlong\n316D4\tle\n316E7\thao\n316E8\thong\n316EC\tshi\n316F9\tye\n316FD\tduan\n31700\tnang\n31712\txie\n3172C\tliang\n31743\tshua\n31744\tsao\n31749\ttong\n31774\thu\n3178C\thua\n3179D\tqie\n317EB\tchan\n3180F\tkang\n31838\tyuan\n318A1\thuan\n318C2\twu\n318C4\thui\n318D1\trou\n318D5\tqi\n318F9\tzang\n318FB\the\n31911\tgui\n31917\tge\n31926\tluan\n3192D\tpeng\n3193A\tbeng\n3195F\tyue\n31963\truo\n31970\tya\n31977\tna\n31988\tgui\n319DA\tlian\n319F4\tmai\n31A19\tzha\n31A38\tkuo\n31A42\tying\n31A49\twu\n31A7D\te\n31ABF\txun\n31B0F\tlian\n31B70\tweng\n31B92\tsang\n31B9C\ttan\n31BB4\tgang\n31BB7\tcang\n31BBF\tbang\n31BE7\tfu\n31C0E\tsheng\n31C17\tche\n31C24\tqin\n31C25\tlei\n31C2D\tzi\n31C2E\tling\n31C5A\txi\n31C6D\tyan\n31C71\tjue\n31C86\tce\n31C8E\tying\n31CCB\tchu\n31CDE\tzi\n31CE2\thui\n31CE9\then\n31CEA\tdai\n31CF3\twu\n31D02\tla\n31D07\tcheng\n31D10\tchang\n31D18\tjiang\n31D1E\thou\n31D28\ten\n31D3E\tgua\n31D41\tshen\n31DA1\tgan\n31DBB\ttuo\n31E02\tou\n31E03\txi\n31E07\tlao\n31E16\tyang\n31E1B\tben\n31E1C\tgan\n31E21\thao\n31E25\ttiao\n31E27\tlu\n31E41\tqi\n31E7C\tzi\n31EA8\tmian\n31EAE\thao\n31EF4\tzha\n31F1E\than\n31F37\tzhi\n31F4E\tbei\n31F55\tdao\n31F56\tshen\n31F7F\tjiang\n31F83\thua\n31F86\tguan\n31F8E\txie\n31F9D\tzhui\n31FBE\tpu\n31FC5\tbong\n31FD7\tbiang\n31FE3\tke\n31FEB\ttang\n31FEF\twai\n32003\tbang\n32004\txu\n3201F\thang\n3202F\txie\n32049\tzhen\n32053\tbiang\n32086\txia\n32093\tzao\n32094\tzhuo\n320BB\tying\n32100\tmi\n32117\tkuai\n3211A\tlao\n32128\tqian\n32142\trou\n321A6\txi\n321A9\tsong\n321AB\txun\n321B0\txi\n321B3\tpin\n321B5\trong\n321CA\txi\n321D9\txiu\n321F0\tri\n3220D\tye\n32216\tga\n3223C\tchu\n32245\ttang\n32249\tlun\n32268\tkuang\n322B9\tchai\n322BD\tci\n322C1\txing\n322CF\tpao\n322F6\tmai\n32309\tju\n3231E\tqian\n32321\tqiang\n32330\tmao\n32347\tyi\n32349\tyuan\n3234F\txian\n32350\tmi\n32357\thuan\n3236D\tzhun\n3236E\tfang\n3236F\tjian\n32370\tmi\n32373\tyou\n32379\tbao\n3237E\tzhui\n3237F\tye\n32385\tchi\n32386\ttong\n32388\tmeng\n32389\tmo";
    let fallbackMap = null;

    function getFallbackMap() {
        if (fallbackMap) return fallbackMap;

        /* Parse lazily without FALLBACK_DATA.split(), which would allocate a
         * temporary 60k-element row array on top of the fallback map itself. */
        const map = Object.create(null);
        let cursor = 0;

        while (cursor < FALLBACK_DATA.length) {
            const separator = FALLBACK_DATA.indexOf('\t', cursor);
            if (separator < cursor) break;

            let lineEnd = FALLBACK_DATA.indexOf('\n', separator + 1);
            if (lineEnd < 0) lineEnd = FALLBACK_DATA.length;

            if (separator > cursor) {
                map[
                    FALLBACK_DATA.slice(cursor, separator)
                ] = FALLBACK_DATA.slice(separator + 1, lineEnd);
            }

            cursor = lineEnd + 1;
        }

        fallbackMap = map;
        return map;
    }

    function skipsBroadFallback(cp) {
        /* The generated fallback table has no entries in these common emoji /
         * variation-selector ranges. Avoid materializing 60k fallback entries
         * merely because a lyric contains a heart, music note or emoji. Keep
         * U+1F100..U+1F12F out of this shortcut because ICU does transliterate
         * several enclosed alphanumeric symbols there. */
        return (cp >= 0x2600 && cp <= 0x27bf)
            || (cp >= 0xfe00 && cp <= 0xfe0f)
            || cp === 0x200d
            || (cp >= 0x1f000 && cp <= 0x1f0ff)
            || (cp >= 0x1f130 && cp <= 0x1faff)
            || (cp >= 0xe0100 && cp <= 0xe01ef);
    }

    function fallbackRoman(character) {
        const cp = character.codePointAt(0);
        if (skipsBroadFallback(cp)) return character;
        const map = getFallbackMap();
        const key = cp.toString(16).toUpperCase();
        return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : character;
    }

    function isAsciiOrLatin(character) {
        const cp = character.codePointAt(0);
        if (cp <= 0x024f) return true;
        if (cp >= 0x1e00 && cp <= 0x1eff) return true;
        if (cp >= 0xab30 && cp <= 0xab6f) return true;
        return false;
    }

    function isHan(cp) {
        return (
            (cp >= 0x3400 && cp <= 0x4dbf)
            || (cp >= 0x4e00 && cp <= 0x9fff)
            || (cp >= 0xf900 && cp <= 0xfaff)
            || (cp >= 0x20000 && cp <= 0x323af)
        );
    }

    function isHangulSyllable(cp) {
        return cp >= 0xac00 && cp <= 0xd7a3;
    }

    const HANGUL_L = [
        'g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'
    ];
    const HANGUL_V = [
        'a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'
    ];
    const HANGUL_T = [
        '', 'k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','h'
    ];

    function romanizeHangul(character) {
        const cp = character.codePointAt(0) - 0xac00;
        const l = Math.floor(cp / 588);
        const v = Math.floor((cp % 588) / 28);
        const t = cp % 28;
        return `${HANGUL_L[l]}${HANGUL_V[v]}${HANGUL_T[t]}`;
    }

    const KANA = Object.freeze({
        'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
        'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
        'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
        'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri',
        'る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'o','ん':'n','が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
        'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
        'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
        'ゔ':'vu','ゐ':'wi','ゑ':'we',
        'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o','カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
        'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so','タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
        'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no','ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
        'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo','ヤ':'ya','ユ':'yu','ヨ':'yo','ラ':'ra','リ':'ri',
        'ル':'ru','レ':'re','ロ':'ro','ワ':'wa','ヲ':'o','ン':'n','ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
        'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo','ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
        'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo','パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
        'ヴ':'vu','ヰ':'wi','ヱ':'we'
    });

    const SMALL_Y = Object.freeze({
        'ゃ':'ya','ゅ':'yu','ょ':'yo','ャ':'ya','ュ':'yu','ョ':'yo'
    });


    /*
     * ICU Any-Latin does not provide useful single-character fallbacks for
     * several Southeast-Asian/Tibetan blocks in all builds. Keep a compact
     * local transliteration layer so the Romanize option remains available
     * and never leaks native combining marks into an otherwise Latin line.
     * These are transliterations, not language-specific pronunciation rules.
     */
    const SCRIPT_ROMAN_MAP = Object.freeze({
        /* Small coverage repairs for scripts where the generated table omits
         * a base letter or terminal combining mark. */
        '710':'a',  // Syriac Alaph
        '7B0':'',   // Thaana sukun

        /* Lao */
        'E81':'k','E82':'kh','E84':'kh','E87':'ng','E88':'ch','E8A':'s','E8D':'y',
        'E94':'d','E95':'t','E96':'th','E97':'th','E99':'n','E9A':'b','E9B':'p',
        'E9C':'ph','E9D':'f','E9E':'ph','E9F':'f','EA1':'m','EA2':'y','EA3':'r',
        'EA5':'l','EA7':'v','EAA':'s','EAB':'h','EAD':'o','EAE':'h','EB0':'a',
        'EB1':'a','EB2':'a','EB3':'am','EB4':'i','EB5':'i','EB6':'ue','EB7':'ue',
        'EB8':'u','EB9':'u','EBA':'','EBB':'','EBC':'','EBD':'ia','EC0':'e',
        'EC1':'ae','EC2':'o','EC3':'ai','EC4':'ai','EC8':'','EC9':'','ECA':'',
        'ECB':'','ECC':'','ECD':'','ED0':'0','ED1':'1','ED2':'2','ED3':'3',
        'ED4':'4','ED5':'5','ED6':'6','ED7':'7','ED8':'8','ED9':'9','EDC':'hn','EDD':'hm',

        /* Myanmar combining signs not covered by the generated fallback map. */
        '102B':'a','102C':'a','102D':'i','102E':'i','102F':'u','1030':'u','1031':'e',
        '1032':'ai','1036':'n','1037':'','1038':'h','1039':'','103A':'','103B':'y',
        '103C':'r','103D':'w','103E':'h','103F':'',

        /* Khmer */
        '1780':'k','1781':'kh','1782':'k','1783':'kh','1784':'ng','1785':'c','1786':'ch',
        '1787':'c','1788':'ch','1789':'ny','178A':'d','178B':'th','178C':'d','178D':'th',
        '178E':'n','178F':'t','1790':'th','1791':'d','1792':'th','1793':'n','1794':'b',
        '1795':'ph','1796':'p','1797':'ph','1798':'m','1799':'y','179A':'r','179B':'l',
        '179C':'v','179D':'sh','179E':'s','179F':'s','17A0':'h','17A1':'l','17A2':'a',
        '17A3':'a','17A4':'aa','17A5':'i','17A6':'ii','17A7':'u','17A8':'uk','17A9':'u',
        '17AA':'uu','17AB':'ry','17AC':'ryy','17AD':'ly','17AE':'lyy','17AF':'e',
        '17B0':'ai','17B1':'oo','17B2':'oo','17B3':'au','17B6':'aa','17B7':'i',
        '17B8':'ii','17B9':'y','17BA':'yy','17BB':'u','17BC':'uu','17BD':'ua',
        '17BE':'oe','17BF':'ya','17C0':'ie','17C1':'e','17C2':'ae','17C3':'ai',
        '17C4':'ao','17C5':'au','17C6':'n','17C7':'h','17C8':'','17C9':'','17CA':'',
        '17CB':'','17CC':'','17CD':'','17CE':'','17CF':'','17D0':'','17D1':'','17D2':'',
        '17D3':'','17E0':'0','17E1':'1','17E2':'2','17E3':'3','17E4':'4','17E5':'5',
        '17E6':'6','17E7':'7','17E8':'8','17E9':'9',

        /* Tibetan (Wylie-like ASCII approximation). */
        'F0B':' ','F0C':' ','F40':'k','F41':'kh','F42':'g','F43':'gh','F44':'ng',
        'F45':'c','F46':'ch','F47':'j','F49':'ny','F4A':'t','F4B':'th','F4C':'d',
        'F4D':'dh','F4E':'n','F4F':'t','F50':'th','F51':'d','F52':'dh','F53':'n',
        'F54':'p','F55':'ph','F56':'b','F57':'bh','F58':'m','F59':'ts','F5A':'tsh',
        'F5B':'dz','F5C':'dzh','F5D':'w','F5E':'zh','F5F':'z','F60':'a','F61':'y',
        'F62':'r','F63':'l','F64':'sh','F65':'ss','F66':'s','F67':'h','F68':'a',
        'F69':'ksh','F71':'a','F72':'i','F73':'i','F74':'u','F75':'u','F76':'r',
        'F77':'r','F78':'l','F79':'l','F7A':'e','F7B':'e','F7C':'o','F7D':'o',
        'F7E':'n','F7F':'h','F80':'i','F81':'i','F82':'','F83':'',
        'F90':'k','F91':'kh','F92':'g','F93':'gh','F94':'ng','F95':'c','F96':'ch',
        'F97':'j','F99':'ny','F9A':'t','F9B':'th','F9C':'d','F9D':'dh','F9E':'n',
        'F9F':'t','FA0':'th','FA1':'d','FA2':'dh','FA3':'n','FA4':'p','FA5':'ph',
        'FA6':'b','FA7':'bh','FA8':'m','FA9':'ts','FAA':'tsh','FAB':'dz','FAC':'dzh',
        'FAD':'w','FAE':'zh','FAF':'z','FB0':'a','FB1':'y','FB2':'r','FB3':'l',
        'FB4':'sh','FB5':'ss','FB6':'s','FB7':'h','FB8':'a','FB9':'ksh'
    });

    function scriptRomanEntry(character) {
        const key = character.codePointAt(0).toString(16).toUpperCase();
        return Object.prototype.hasOwnProperty.call(SCRIPT_ROMAN_MAP, key)
            ? SCRIPT_ROMAN_MAP[key]
            : null;
    }

    function combineSmallY(previous, small) {
        if (!previous) return small;
        const y = small.charAt(1) || 'a';
        if (/shi$/.test(previous)) return previous.replace(/shi$/, `sh${y}`);
        if (/chi$/.test(previous)) return previous.replace(/chi$/, `ch${y}`);
        if (/ji$/.test(previous)) return previous.replace(/ji$/, `j${y}`);
        if (/i$/.test(previous)) return previous.slice(0, -1) + `y${y}`;
        return previous + small;
    }

    function firstConsonant(value) {
        const match = String(value || '').match(/[bcdfghjklmnpqrstvwxyz]/i);
        return match ? match[0].toLowerCase() : '';
    }

    function romanizeKanaRun(characters, start) {
        let index = start;
        const parts = [];
        let geminate = false;

        while (index < characters.length) {
            const ch = characters[index];
            if (!(KANA[ch] || SMALL_Y[ch] || ch === 'っ' || ch === 'ッ' || ch === 'ー')) break;

            if (ch === 'っ' || ch === 'ッ') {
                geminate = true;
                index += 1;
                continue;
            }

            if (SMALL_Y[ch]) {
                if (parts.length) {
                    parts[parts.length - 1] = combineSmallY(parts[parts.length - 1], SMALL_Y[ch]);
                } else {
                    parts.push(SMALL_Y[ch]);
                }
                index += 1;
                continue;
            }

            if (ch === 'ー') {
                const previous = parts[parts.length - 1] || '';
                const vowel = (previous.match(/[aeiou](?!.*[aeiou])/i) || [''])[0];
                if (vowel) parts.push(vowel.toLowerCase());
                index += 1;
                continue;
            }

            let value = KANA[ch];
            const next = characters[index + 1];
            if (SMALL_Y[next]) {
                value = combineSmallY(value, SMALL_Y[next]);
                index += 1;
            }
            if (geminate) {
                const consonant = firstConsonant(value);
                if (consonant) value = consonant + value;
                geminate = false;
            }
            parts.push(value);
            index += 1;
        }

        return { value: parts.join(''), nextIndex: index };
    }


    /*
     * Urdu/Shahmukhi lyric layer.
     *
     * Perso-Arabic spelling omits many short vowels, so no deterministic
     * offline grapheme engine can recover every pronunciation.  We therefore
     * combine a hand-authored high-frequency song lexicon with a conservative
     * Urdu-aware character/diacritic parser. Unknown words remain readable
     * consonant skeletons instead of pretending that missing vowels are known.
     */
    const URDU_LYRIC_OVERRIDES = Object.freeze({
        'دل':'dil','محبت':'mohabbat','محبّت':'mohabbat','عشق':'ishq','عشقِ':'ishq-e','زندگی':'zindagi','خدا':'khuda','خُدا':'khuda',
        'پیار':'pyaar','ہم':'hum','تم':'tum','میں':'mein','ہے':'hai','ہیں':'hain','ہوں':'hoon','نہیں':'nahin','نہی':'nahin','کیا':'kya','کیوں':'kyon',
        'میرا':'mera','میری':'meri','میرے':'mere','تیرا':'tera','تیری':'teri','تیرے':'tere','میریں':'merin','جان':'jaan','جاناں':'jaanaan','جانے':'jaane',
        'ساتھ':'saath','رات':'raat','دن':'din','چاند':'chaand','تارا':'taara','تارے':'taare','آنکھ':'aankh','آنکھیں':'aankhen','خواب':'khwaab','خوابوں':'khwaabon',
        'دلبر':'dilbar','صنم':'sanam','ساجن':'saajan','سجنا':'sajna','یار':'yaar','یارا':'yaara','وفا':'wafa','دعا':'dua','درد':'dard','غم':'gham','خوشی':'khushi',
        'رنگ':'rang','روشنی':'roshni','بارش':'baarish','موسم':'mausam','ہوا':'hawa','ہو':'ho','ہواں':'hawaan','آیا':'aaya','آئی':'aayi','آئے':'aaye',
        'کبھی':'kabhi','کبھیٰ':'kabhi','کہیں':'kahin','یہ':'yeh','وہ':'woh','اور':'aur','سے':'se','کو':'ko','کا':'ka','کی':'ki','کے':'ke','تو':'to',
        'تُو':'tu','توُ':'tu','مجھے':'mujhe','تجھے':'tujhe','ہمیں':'hamein','تمہیں':'tumhein','اپنا':'apna','اپنی':'apni','اپنے':'apne','دلوں':'dilon',
        'سوہنی':'sohni','سوہنیا':'sohniya','رب':'rab','ربّ':'rabb','وے':'ve','نی':'ni','ماہی':'maahi','ماہیا':'maahiya',
        'کرتا':'karta','کرتی':'karti','کرتے':'karte','کرنا':'karna','کروں':'karoon','کریں':'karein','کر':'kar',
        'ایک':'ek','سفر':'safar','راستہ':'raasta','راستے':'raaste','منزل':'manzil','دنیا':'duniya','جہاں':'jahaan','زمانہ':'zamaana',
        'بینا':'bina','بغیر':'baghair','نظر':'nazar','نظروں':'nazron','چہرہ':'chehra','چہرے':'chehre',
        'آنکھوں':'aankhon','آنکھوںمیں':'aankhonmein','پل':'pal','لمحہ':'lamha','لمحے':'lamhe','یاد':'yaad','یادیں':'yaadein',
        'کہتا':'kehta','کہتی':'kehti','کہتے':'kehte','کہنا':'kehna','سن':'sun','سنو':'suno','سنتا':'sunta','سنتی':'sunti',
        'دیکھ':'dekh','دیکھا':'dekha','دیکھو':'dekho','دیکھتی':'dekhti','دیکھتا':'dekhta','مل':'mil','ملا':'mila','ملے':'mile',
        'چاہتا':'chahta','چاہتی':'chahti','چاہتے':'chahte','چاہوں':'chahoon','چاہیے':'chahiye','عاشق':'aashiq','عاشقی':'aashiqui'
    });

    const URDU_CHAR_MAP = Object.freeze({
        'ا':'a','آ':'aa','أ':'a','إ':'i','ب':'b','پ':'p','ت':'t','ٹ':'t','ث':'s','ج':'j','چ':'ch','ح':'h','خ':'kh',
        'د':'d','ڈ':'d','ذ':'z','ر':'r','ڑ':'r','ز':'z','ژ':'zh','س':'s','ش':'sh','ص':'s','ض':'z','ط':'t','ظ':'z',
        'ع':'','غ':'gh','ف':'f','ق':'q','ک':'k','ك':'k','گ':'g','ل':'l','م':'m','ن':'n','ں':'n','و':'w','ؤ':'o',
        'ہ':'h','ھ':'h','ۃ':'h','ة':'h','ء':"'",'ئ':'y','ی':'y','ى':'y','ے':'e','ۓ':'e'
    });

    const URDU_VOWEL_MARKS = Object.freeze({
        '\u064e':'a',  /* zabar/fatha */
        '\u0650':'i',  /* zer/kasra */
        '\u064f':'u',  /* pesh/damma */
        '\u0670':'aa', /* dagger alif */
        '\u0652':''    /* jazm/sukun */
    });

    function isUrduWordCharacter(character) {
        if (!character) return false;
        const cp = character.codePointAt(0);
        if (cp === 0x200c || cp === 0x200d) return true;
        if (cp >= 0x064b && cp <= 0x065f) return true;
        if (cp === 0x0670) return true;
        if (cp >= 0x0621 && cp <= 0x063a) return true;
        if (cp >= 0x0641 && cp <= 0x064a) return true;
        return Object.prototype.hasOwnProperty.call(URDU_CHAR_MAP, character);
    }

    function romanizeUrduWord(word) {
        const normalized = String(word || '').normalize ? String(word || '').normalize('NFC') : String(word || '');
        const override = URDU_LYRIC_OVERRIDES[normalized];
        if (override) return override;
        const chars = Array.from(normalized);
        let out = '';
        let lastConsonant = '';
        let shadda = false;
        for (let index = 0; index < chars.length; index += 1) {
            const ch = chars[index];
            if (ch === '\u200c' || ch === '\u200d') continue;
            if (ch === '\u0651') { shadda = true; continue; }
            if (Object.prototype.hasOwnProperty.call(URDU_VOWEL_MARKS, ch)) {
                out += URDU_VOWEL_MARKS[ch];
                continue;
            }
            let value = URDU_CHAR_MAP[ch];
            if (value === undefined) value = asciiMap(ch);
            if (ch === 'و') {
                /* Waw is consonantal initially, usually a vowel/glide elsewhere. */
                value = out ? 'o' : 'w';
            } else if (ch === 'ی' || ch === 'ى') {
                value = out ? 'i' : 'y';
            } else if (ch === 'ا' && out) {
                value = 'a';
            }
            if (shadda && lastConsonant) {
                out += lastConsonant;
                shadda = false;
            }
            out += value || '';
            const match = String(value || '').match(/[bcdfghjklmnpqrstvwxyz]+$/i);
            lastConsonant = match ? match[0].charAt(0) : lastConsonant;
        }
        return out
            .replace(/aa+a/g, 'aa')
            .replace(/ii+i/g, 'ii')
            .replace(/oo+o/g, 'oo')
            .replace(/'{2,}/g, "'");
    }

    function romanizeUrduRun(characters, start) {
        let index = start;
        const parts = [];
        while (index < characters.length && isUrduWordCharacter(characters[index])) {
            parts.push(characters[index]);
            index += 1;
        }
        return { value: romanizeUrduWord(parts.join('')), nextIndex: index };
    }

    const BRAHMIC_BASES = [0x0900,0x0980,0x0a00,0x0a80,0x0b00,0x0b80,0x0c00,0x0c80,0x0d00];

    function brahmicBase(cp) {
        for (let i = 0; i < BRAHMIC_BASES.length; i += 1) {
            const base = BRAHMIC_BASES[i];
            if (cp >= base && cp <= base + 0x7f) return base;
        }
        return 0;
    }

    function asciiMap(character) {
        return String(fallbackRoman(character) || '')
            .replace(/[^A-Za-z0-9' -]/g, '');
    }

    function isBrahmicConsonant(cp, base) {
        const offset = cp - base;
        return offset >= 0x15 && offset <= 0x39;
    }

    function isBrahmicVirama(cp, base) {
        return cp - base === 0x4d;
    }

    function isBrahmicNukta(cp, base) {
        return cp - base === 0x3c;
    }

    function isBrahmicVowelSign(cp, base) {
        const offset = cp - base;
        return offset >= 0x3e && offset <= 0x4c;
    }

    function consonantStem(value) {
        if (value.length > 1 && /a$/i.test(value)) return value.slice(0, -1);
        return value;
    }

    const BRAHMIC_EXTRA_MARKS = Object.freeze({
        'A02': 'n',  // Gurmukhi bindi
        'A70': 'n'   // Gurmukhi tippi
    });


    /*
     * Hindi/Punjabi-in-Devanagari lyric romanization.
     *
     * ICU's generic Any-Latin rules are intentionally academic and character
     * oriented.  That is a poor fit for sung Hindi/Punjabi: anusvara needs
     * context, inherent schwas disappear in normal pronunciation, conjuncts
     * must be read as a unit, and common lyric spellings prefer forms such as
     * "munda", "pyaar", "hain" and "hoye" rather than mechanical output.
     *
     * This layer parses a complete Devanagari word before emitting Latin text.
     * The broad ICU-derived table remains the fallback for unsupported scripts.
     */
    const DEVANAGARI_CONSONANTS = Object.freeze({
        'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
        'च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
        'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
        'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
        'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m',
        'य':'y','र':'r','ऱ':'r','ल':'l','ळ':'l','ऴ':'l','व':'v',
        'श':'sh','ष':'sh','स':'s','ह':'h',
        'क़':'q','ख़':'kh','ग़':'gh','ज़':'z','ड़':'d','ढ़':'dh','फ़':'f','य़':'y'
    });

    const DEVANAGARI_NUKTA_CONSONANTS = Object.freeze({
        'क':'q','ख':'kh','ग':'gh','ज':'z','ड':'d','ढ':'dh','फ':'f','य':'y','र':'r','ळ':'l'
    });

    const DEVANAGARI_INDEPENDENT_VOWELS = Object.freeze({
        'ऄ':'a','अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo',
        'ऋ':'ri','ॠ':'ri','ऌ':'li','ॡ':'li','ऍ':'e','ऎ':'e','ए':'e','ऐ':'ai',
        'ऑ':'o','ऒ':'o','ओ':'o','औ':'au','ॲ':'a'
    });

    const DEVANAGARI_VOWEL_SIGNS = Object.freeze({
        'ऺ':'e','ऻ':'o','ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','ॄ':'ri',
        'ॅ':'e','ॆ':'e','े':'e','ै':'ai','ॉ':'o','ॊ':'o','ो':'o','ौ':'au','ॢ':'li','ॣ':'li'
    });

    /*
     * Small pronunciation lexicon for cases where spelling alone cannot select
     * the lyric-style Latin form.  These are high-frequency Hindi/Punjabi
     * forms, not song-specific line replacements; unknown words still go
     * through the phonological parser below.
     */
    const DEVANAGARI_LYRIC_OVERRIDES = Object.freeze({
        'मुंडा':'munda','मुण्डा':'munda','बैंड':'band','चढ़':'chad','छड्ड':'chhad',
        'सारियां':'saariyan','सारियाँ':'saariyan','कवारियां':'kawariyan','कवारियाँ':'kawariyan',
        'कुवारियां':'kuwaariyan','कुवारियाँ':'kuwaariyan','कुँवारियां':'kunwaariyan','कुँवारियाँ':'kunwaariyan',
        'ओए':'oye','होए':'hoye','माँ':'maa','मां':'maa','हाँ':'haan','हां':'haan',
        'हूँ':'hoon','हूं':'hoon','हैं':'hain','मैं':'main','नहीं':'nahin','क्यों':'kyon','में':'mein',
        'हमें':'hamein','तुम्हें':'tumhein','उन्हें':'unhein','इन्हें':'inhein','कहीं':'kahin','यहीं':'yahin','वहीं':'wahin',
        'क्या':'kya','प्यार':'pyaar','प्यारा':'pyaara','प्यारी':'pyaari','प्यारे':'pyaare',
        'ये':'ye','यह':'yeh','वो':'wo','वह':'woh','और':'aur','है':'hai','था':'tha','थी':'thi','थे':'the',
        'गया':'gaya','गई':'gayi','गये':'gaye','हुआ':'hua','हुई':'hui','हुए':'hue',
        'लिया':'liya','लिए':'liye','दिया':'diya','दिए':'diye','किया':'kiya','किए':'kiye',
        'आया':'aaya','आई':'aayi','आए':'aaye','जाए':'jaaye','जाये':'jaaye','जाना':'jaana',
        'तेरा':'tera','तेरी':'teri','तेरे':'tere','मेरा':'mera','मेरी':'meri','मेरे':'mere',
        'तुम्हारा':'tumhaara','तुम्हारी':'tumhaari','तुम्हारे':'tumhaare',
        'हम':'hum','हमको':'humko','हमसे':'humse','हमने':'humne','हमारा':'hamaara','हमारी':'hamaari','हमारे':'hamaare',
        'दिल':'dil','दिलों':'dilon','ज़िंदगी':'zindagi','जिंदगी':'zindagi','मोहब्बत':'mohabbat',
        'इश्क':'ishq','इश्क़':'ishq','ख़्वाब':'khwaab','ख्वाब':'khwaab','खुदा':'khuda','ख़ुदा':'khuda',
        'साथ':'saath','सदा':'sada','डोली':'doli','बज':'baj','एह':'eh',
        'पहला':'pehla','पहली':'pehli','पहले':'pehle','ओर':'ore','कहता':'kehta','कहती':'kehti','कहते':'kehte',
        'रहता':'rehta','रहती':'rehti','रहते':'rehte','बहकता':'behakta','बहकती':'behakti','बहके':'behke',
        'मिलकर':'milkar','चलकर':'chalkar','सुनकर':'sunkar','देखकर':'dekhkar','कहकर':'kehkar','करके':'karke','दिलबर':'dilbar','धड़कन':'dhadkan','धड़कन':'dhadkan',
        'आँख':'aankh','आंख':'aankh','आँखें':'aankhen','आंखें':'aankhen','आँखों':'aankhon','आंखों':'aankhon','चाँद':'chaand','चांद':'chaand','फूल':'phool','खुशबू':'khushboo',
        'सपना':'sapna','सपने':'sapne','सपनों':'sapnon','रात':'raat','रातें':'raatein','रातों':'raaton','जान':'jaan','जानेमन':'jaaneman','सनम':'sanam','साजन':'saajan','सजना':'sajna',
        'कभी':'kabhi','अभी':'abhi','फिर':'phir','जहाँ':'jahaan','जहां':'jahaan','यहाँ':'yahaan','यहां':'yahaan','वहाँ':'wahaan','वहां':'wahaan','कैसे':'kaise','ऐसे':'aise','जैसे':'jaise',
        'तुझे':'tujhe','मुझे':'mujhe','मुझको':'mujhko','तुझको':'tujhko','उसको':'usko','इसको':'isko','अपने':'apne','अपना':'apna','अपनी':'apni','कोई':'koi','कुछ':'kuchh',
        /* Marathi/Konkani high-frequency forms sharing Devanagari. */
        'माझं':'majha','माझे':'majhe','माझा':'majha','माझी':'majhi','माझ्या':'majhya','तुझं':'tujha','तुझा':'tujha','तुझी':'tujhi','तुझ्या':'tujhya',
        'आहे':'aahe','आहेत':'aahet','नाही':'naahi','तुला':'tula','मला':'mala','पाहते':'paahte','पाहतो':'paahto','पाहिले':'paahile','डोळ्यात':'dolyaat','डोळे':'dole','मन':'man','प्रेम':'prem',
        /* Bhojpuri/Awadhi/Hindi-film colloquialisms. */
        'तोहरा':'tohra','हमार':'hamaar','हमरा':'hamra','कइसन':'kaisan','काहे':'kaahe','बाबू':'baabu','सैयाँ':'saiyaan','सइयां':'saiyaan'
    });


    /*
     * Common Perso-Arabic/Urdu loanwords are frequently published without
     * Devanagari nukta marks by lyric providers. In those spellings plain फ
     * can represent lexical /f/ rather than native /ph/. Keep this as an
     * explicit pronunciation lexicon: globally folding फ -> f would corrupt
     * genuine Hindi words such as फूल (phool), फिर (phir) and फल (phal).
     *
     * Lexicalized compounds are also included where ordinary schwa deletion
     * cannot recover the established sung form (e.g. हमसफर -> humsafar).
     */
    const DEVANAGARI_LOANWORD_PRONUNCIATIONS = Object.freeze({
        'सफर':'safar','सफ़र':'safar',
        'हमसफर':'humsafar','हमसफ़र':'humsafar',
        'मुसाफिर':'musaafir','मुसाफ़िर':'musaafir',
        'वफा':'wafa','वफ़ा':'wafa','बेवफा':'bewafa','बेवफ़ा':'bewafa',
        'वफादार':'wafaadaar','वफ़ादार':'wafaadaar',
        'माफ':'maaf','माफ़':'maaf',
        'फिक्र':'fikr','फ़िक्र':'fikr','फुर्सत':'fursat','फ़ुर्सत':'fursat',
        'फना':'fana','फ़ना':'fana','फिजा':'fiza','फ़िज़ा':'fiza',
        'तूफान':'toofaan','तूफ़ान':'toofaan','काफिला':'kaafila','काफ़िला':'kaafila',
        'हफ्ता':'hafta','हफ़्ता':'hafta','आफत':'aafat','आफ़त':'aafat',
        'दफा':'dafa','दफ़ा':'dafa','अफसोस':'afsos','अफ़सोस':'afsos',
        'खफा':'khafa','खफ़ा':'khafa','दफन':'dafan','दफ़न':'dafan',
        'लफ्ज':'lafz','लफ़्ज':'lafz','लफ्ज़':'lafz','लफ़्ज़':'lafz'
    });

    function devanagariLexiconEntry(word) {
        const lyric = DEVANAGARI_LYRIC_OVERRIDES[word];
        if (lyric) return { text: lyric, source: 'curated-lyric-lexicon' };
        const loanword = DEVANAGARI_LOANWORD_PRONUNCIATIONS[word];
        if (loanword) return { text: loanword, source: 'curated-loanword-pronunciation' };
        return null;
    }

    /*
     * LyricG2P 6.6.0 retains the compact learned schwa advisors.
     *
     * The Hindi model is a sparse logistic classifier trained from a
     * pronunciation lexicon with word-level held-out splits. In 6.6.0 the
     * classifier is lazy advisory evidence for diagnostics/candidate research;
     * normal lyric rendering stays on the deterministic hot path. A second
     * sparse classifier is trained directly on a Punjabi pronunciation
     * lexicon using script-independent articulatory/context features.
     * Both models are packed as text and decoded lazily so Latin/non-Indic
     * songs pay no initialization cost.
     */
    const HINDI_SCHWA_MODEL_META = Object.freeze({
        intercept: 2.0484594388233415,
        heldOutAccuracy: 0.9542846212700842,
        trainInstances: 24000,
        featureCutoff: 0.08,
        source: 'LyricG2P-trained sparse logistic model',
        weightCount: 487,
        role: 'lazy-schwa-advisor',
        metricStatus: 'embedded-build-metadata-not-independently-reproduced-in-this-release'
    });
    const HINDI_SCHWA_MODEL_PACKED = "c-1=BOUND\t2.81466\nc-1=VOWEL\t-0.778748\nc-1=den_liq_vd_plain\t-0.113413\nc-1=den_nas_vd_plain\t0.322097\nc-1=den_stop_vl_plain\t0.32055\nc-1=glo_fric_vd_asp\t-0.225911\nc-1=lab_liq_vd_plain\t0.572731\nc-1=lab_nas_vd_plain\t-0.114821\nc-1=lab_stop_vd_asp\t0.116576\nc-1=lab_stop_vd_plain\t-0.165495\nc-1=lab_stop_vl_asp\t-0.512977\nc-1=pal_aff_vd_asp\t-0.194004\nc-1=pal_aff_vl_asp\t-0.196023\nc-1=pal_aff_vl_plain\t-0.139943\nc-1=pal_liq_vd_plain\t0.179479\nc-1=pal_sib_vl_plain\t0.296585\nc-1=ret_nas_vd_plain\t0.860792\nc-1=ret_stop_vd_asp\t-0.523631\nc-1=ret_stop_vl_plain\t-0.209107\nc-1=vel_stop_vd_asp\t0.128907\nc-1=vel_stop_vl_asp\t-0.418933\nc-1=vel_stop_vl_plain\t-0.131643\nc-2=BOUND\t0.275642\nc-2=VOWEL\t-0.356204\nc-2=den_nas_vd_plain\t-0.0865047\nc-2=den_stop_vl_asp\t0.603974\nc-2=den_stop_vl_plain\t0.232893\nc-2=lab_liq_vd_plain\t0.304291\nc-2=lab_nas_vd_plain\t0.203036\nc-2=lab_stop_vd_asp\t0.390387\nc-2=lab_stop_vd_plain\t-0.332021\nc-2=lab_stop_vl_asp\t-0.129808\nc-2=lab_stop_vl_plain\t0.182138\nc-2=pal_aff_vd_asp\t-0.259559\nc-2=pal_aff_vd_plain\t-0.479331\nc-2=pal_aff_vl_asp\t0.148081\nc-2=pal_aff_vl_plain\t-0.129025\nc-2=pal_liq_vd_plain\t0.213923\nc-2=pal_sib_vl_plain\t0.598845\nc-2=ret_nas_vd_plain\t0.459832\nc-2=ret_stop_vd_asp\t0.370697\nc-2=ret_stop_vd_plain\t0.24498\nc-2=ret_stop_vl_asp\t-0.328445\nc-2=ret_stop_vl_plain\t-0.327729\nc-2=vel_stop_vd_asp\t0.0818211\nc-2=vel_stop_vd_plain\t0.249905\nc-2=vel_stop_vl_asp\t0.108337\nc-3=BOUND\t0.417989\nc-3=VOWEL\t0.242809\nc-3=den_nas_vd_plain\t0.229542\nc-3=den_sib_vl_plain\t-0.363145\nc-3=den_stop_vd_plain\t0.314152\nc-3=den_stop_vl_plain\t0.0904883\nc-3=glo_fric_vd_asp\t0.131303\nc-3=lab_liq_vd_plain\t0.399735\nc-3=lab_stop_vd_asp\t0.335037\nc-3=lab_stop_vd_plain\t0.1374\nc-3=lab_stop_vl_asp\t-0.320375\nc-3=lab_stop_vl_plain\t-0.229629\nc-3=pal_aff_vd_asp\t-0.259975\nc-3=pal_aff_vd_plain\t0.173819\nc-3=pal_aff_vl_asp\t0.427569\nc-3=pal_aff_vl_plain\t0.215765\nc-3=pal_sib_vl_plain\t0.766679\nc-3=ret_stop_vd_asp\t-0.137644\nc-3=ret_stop_vd_plain\t-0.160489\nc-3=ret_stop_vl_asp\t0.347946\nc-3=ret_stop_vl_plain\t-0.44173\nc-3=vel_stop_vd_asp\t-0.145317\nc-3=vel_stop_vd_plain\t0.12923\nc-3=vel_stop_vl_asp\t-0.24869\nc1=BOUND\t-1.74183\nc1=VOWEL\t4.33236\nc1=den_liq_vd_plain\t0.108343\nc1=den_nas_vd_plain\t-0.283485\nc1=den_sib_vl_plain\t0.317729\nc1=den_stop_vd_asp\t0.484494\nc1=den_stop_vd_plain\t-0.278134\nc1=den_stop_vl_asp\t-0.153753\nc1=den_stop_vl_plain\t0.849612\nc1=glo_fric_vd_asp\t0.503784\nc1=lab_liq_vd_plain\t-0.252682\nc1=lab_nas_vd_plain\t-0.117144\nc1=lab_stop_vd_asp\t-0.420295\nc1=lab_stop_vd_plain\t-0.121589\nc1=lab_stop_vl_asp\t-0.731862\nc1=lab_stop_vl_plain\t-1.52916\nc1=pal_aff_vd_asp\t-0.744507\nc1=pal_aff_vd_plain\t-0.103881\nc1=pal_aff_vl_asp\t-0.902162\nc1=pal_aff_vl_plain\t-0.522658\nc1=pal_liq_vd_plain\t1.90318\nc1=pal_sib_vl_plain\t0.389178\nc1=ret_nas_vd_plain\t2.08558\nc1=ret_stop_vd_asp\t-0.195355\nc1=ret_stop_vd_plain\t0.1397\nc1=ret_stop_vl_plain\t0.294361\nc1=vel_stop_vd_asp\t-0.904559\nc1=vel_stop_vd_plain\t-0.288838\nc1=vel_stop_vl_asp\t-0.251832\nc1=vel_stop_vl_plain\t0.261683\nc2=BOUND\t0.130204\nc2=VOWEL\t0.830272\nc2=den_liq_vd_plain\t-1.06692\nc2=den_nas_vd_plain\t0.251035\nc2=den_sib_vl_plain\t-0.701899\nc2=den_stop_vd_asp\t1.3542\nc2=den_stop_vd_plain\t-0.29878\nc2=den_stop_vl_asp\t0.175488\nc2=den_stop_vl_plain\t0.321547\nc2=glo_fric_vd_asp\t-0.308747\nc2=lab_liq_vd_plain\t0.589979\nc2=lab_nas_vd_plain\t-0.709344\nc2=lab_stop_vd_asp\t1.63365\nc2=lab_stop_vd_plain\t-1.01683\nc2=lab_stop_vl_asp\t-0.200275\nc2=lab_stop_vl_plain\t1.02756\nc2=pal_aff_vl_plain\t0.15411\nc2=pal_liq_vd_plain\t1.23585\nc2=pal_sib_vl_plain\t0.815196\nc2=ret_nas_vd_plain\t1.98456\nc2=ret_stop_vd_asp\t-0.594234\nc2=ret_stop_vd_plain\t-0.847443\nc2=ret_stop_vl_asp\t-0.714092\nc2=ret_stop_vl_plain\t-0.958682\nc2=vel_stop_vd_asp\t-0.127014\nc2=vel_stop_vd_plain\t-0.931772\nc2=vel_stop_vl_asp\t-0.738872\nc2=vel_stop_vl_plain\t0.654018\nc3=BOUND\t0.580355\nc3=VOWEL\t-0.0966522\nc3=den_liq_vd_plain\t0.395152\nc3=den_nas_vd_plain\t-0.836143\nc3=den_sib_vl_plain\t0.132046\nc3=den_stop_vl_asp\t1.5827\nc3=den_stop_vl_plain\t-0.234199\nc3=glo_fric_vd_asp\t-1.65997\nc3=lab_liq_vd_plain\t0.504256\nc3=lab_nas_vd_plain\t-0.133162\nc3=lab_stop_vd_plain\t-0.76883\nc3=lab_stop_vl_plain\t-0.227778\nc3=pal_aff_vd_plain\t0.721355\nc3=pal_aff_vl_plain\t-0.163564\nc3=pal_liq_vd_plain\t-0.27145\nc3=pal_sib_vl_plain\t1.2472\nc3=ret_nas_vd_plain\t-1.9382\nc3=ret_stop_vd_plain\t1.53767\nc3=ret_stop_vl_asp\t0.503396\nc3=ret_stop_vl_plain\t1.78896\nc3=vel_stop_vd_plain\t-1.55027\nc3=vel_stop_vl_plain\t0.852338\nch-1=क\t-0.131643\nch-1=ख\t-0.418933\nch-1=घ\t0.128907\nch-1=च\t-0.139943\nch-1=छ\t-0.196023\nch-1=झ\t-0.194004\nch-1=ट\t-0.209107\nch-1=ढ\t-0.523631\nch-1=ण\t0.860792\nch-1=त\t0.32055\nch-1=न\t0.322097\nch-1=फ\t-0.512977\nch-1=ब\t-0.165495\nch-1=भ\t0.116576\nch-1=म\t-0.114821\nch-1=य\t0.179479\nch-1=र\t-0.189708\nch-1=व\t0.572731\nch-1=श\t0.292971\nch-1=ह\t-0.225911\nch-2=ख\t0.108337\nch-2=ग\t0.249905\nch-2=घ\t0.0818211\nch-2=च\t-0.129025\nch-2=छ\t0.148081\nch-2=ज\t-0.479331\nch-2=झ\t-0.259559\nch-2=ट\t-0.327729\nch-2=ठ\t-0.328445\nch-2=ड\t0.24498\nch-2=ढ\t0.370697\nch-2=ण\t0.459832\nch-2=त\t0.232893\nch-2=थ\t0.603974\nch-2=न\t-0.0865047\nch-2=प\t0.182138\nch-2=फ\t-0.129808\nch-2=ब\t-0.332021\nch-2=भ\t0.390387\nch-2=म\t0.203036\nch-2=य\t0.213923\nch-2=र\t0.123969\nch-2=ल\t-0.150001\nch-2=व\t0.304291\nch-2=श\t-0.412071\nch-2=ष\t1.01092\nch-3=ख\t-0.24869\nch-3=ग\t0.12923\nch-3=घ\t-0.145317\nch-3=च\t0.215765\nch-3=छ\t0.427569\nch-3=ज\t0.173819\nch-3=झ\t-0.259975\nch-3=ट\t-0.44173\nch-3=ठ\t0.347946\nch-3=ड\t-0.160489\nch-3=ढ\t-0.137644\nch-3=त\t0.0904883\nch-3=द\t0.314152\nch-3=न\t0.229542\nch-3=प\t-0.229629\nch-3=फ\t-0.320375\nch-3=ब\t0.1374\nch-3=भ\t0.335037\nch-3=र\t0.180512\nch-3=ल\t-0.149336\nch-3=व\t0.399735\nch-3=श\t0.452912\nch-3=ष\t0.313767\nch-3=स\t-0.363145\nch-3=ह\t0.131303\nch1=क\t0.261683\nch1=ख\t-0.251832\nch1=ग\t-0.288838\nch1=घ\t-0.904559\nch1=च\t-0.522658\nch1=छ\t-0.902162\nch1=ज\t-0.103881\nch1=झ\t-0.744507\nch1=ट\t0.294361\nch1=ड\t0.1397\nch1=ढ\t-0.195355\nch1=ण\t2.08558\nch1=त\t0.849612\nch1=थ\t-0.153753\nch1=द\t-0.278134\nch1=ध\t0.484494\nch1=न\t-0.283485\nch1=प\t-1.52916\nch1=फ\t-0.731862\nch1=ब\t-0.121589\nch1=भ\t-0.420295\nch1=म\t-0.117144\nch1=य\t1.90318\nch1=र\t0.149805\nch1=व\t-0.252682\nch1=श\t-0.207762\nch1=ष\t0.59694\nch1=स\t0.317729\nch1=ह\t0.503784\nch2=क\t0.654018\nch2=ख\t-0.738872\nch2=ग\t-0.931772\nch2=घ\t-0.127014\nch2=च\t0.15411\nch2=ट\t-0.958682\nch2=ठ\t-0.714092\nch2=ड\t-0.847443\nch2=ढ\t-0.594234\nch2=ण\t1.98456\nch2=त\t0.321547\nch2=थ\t0.175488\nch2=द\t-0.29878\nch2=ध\t1.3542\nch2=न\t0.251035\nch2=प\t1.02756\nch2=फ\t-0.200275\nch2=ब\t-1.01683\nch2=भ\t1.63365\nch2=म\t-0.709344\nch2=य\t1.23585\nch2=र\t-0.285699\nch2=ल\t-0.781223\nch2=व\t0.589979\nch2=ष\t0.7699\nch2=स\t-0.701899\nch2=ह\t-0.308747\nch3=क\t0.852338\nch3=ग\t-1.55027\nch3=च\t-0.163564\nch3=ज\t0.721355\nch3=ट\t1.78896\nch3=ठ\t0.503396\nch3=ड\t1.53767\nch3=ण\t-1.9382\nch3=त\t-0.234199\nch3=थ\t1.5827\nch3=न\t-0.836143\nch3=प\t-0.227778\nch3=ब\t-0.76883\nch3=म\t-0.133162\nch3=य\t-0.27145\nch3=र\t0.463483\nch3=व\t0.504256\nch3=श\t-0.512593\nch3=ष\t1.7598\nch3=स\t0.132046\nch3=ह\t-1.65997\ncons_from_end=0\t0.434095\ncons_from_end=2\t0.390191\ncons_from_end=3\t2.32748\ncons_from_end=4\t-1.02966\ncons_from_start=0\t0.820984\ncons_from_start=3\t0.263232\ncons_from_start=4\t0.894064\ncur_ch=क\t-0.3091\ncur_ch=ग\t0.164344\ncur_ch=घ\t0.684547\ncur_ch=ङ\t-1.74437\ncur_ch=च\t0.167792\ncur_ch=ज\t-0.11702\ncur_ch=झ\t0.29426\ncur_ch=ट\t-0.129788\ncur_ch=ठ\t-0.420436\ncur_ch=ड\t-0.192124\ncur_ch=त\t-0.173238\ncur_ch=द\t0.113737\ncur_ch=ध\t0.715025\ncur_ch=न\t-0.228751\ncur_ch=प\t0.398786\ncur_ch=ब\t0.101948\ncur_ch=भ\t0.472894\ncur_ch=म\t0.22159\ncur_ch=य\t2.04387\ncur_ch=र\t-0.350058\ncur_ch=ल\t0.146158\ncur_ch=व\t0.86154\ncur_ch=श\t-0.446712\ncur_ch=ष\t0.259364\ncur_ch=स\t-0.102073\ncur_ch=ह\t-0.423302\ncur_class=den_liq_vd_plain\t-0.203899\ncur_class=den_nas_vd_plain\t-0.228751\ncur_class=den_sib_vl_plain\t-0.102073\ncur_class=den_stop_vd_asp\t0.715025\ncur_class=den_stop_vd_plain\t0.113737\ncur_class=den_stop_vl_plain\t-0.173238\ncur_class=glo_fric_vd_asp\t-0.423302\ncur_class=lab_liq_vd_plain\t0.86154\ncur_class=lab_nas_vd_plain\t0.22159\ncur_class=lab_stop_vd_asp\t0.472894\ncur_class=lab_stop_vd_plain\t0.101948\ncur_class=lab_stop_vl_plain\t0.398786\ncur_class=pal_aff_vd_asp\t0.29426\ncur_class=pal_aff_vd_plain\t-0.11702\ncur_class=pal_aff_vl_plain\t0.167792\ncur_class=pal_liq_vd_plain\t2.04387\ncur_class=pal_sib_vl_plain\t-0.187347\ncur_class=ret_stop_vd_plain\t-0.192124\ncur_class=ret_stop_vl_asp\t-0.420436\ncur_class=ret_stop_vl_plain\t-0.129788\ncur_class=vel_nas_vd_plain\t-1.74437\ncur_class=vel_stop_vd_asp\t0.684547\ncur_class=vel_stop_vd_plain\t0.164344\ncur_class=vel_stop_vl_plain\t-0.3091\ncur_nasal=0\t-2.98402\ncur_nasal=1\t5.03248\nnext_dead=0\t-1.66005\nnext_dead=1\t3.70851\nprev_dead=0\t0.429436\nprev_dead=1\t1.61902\ntoken_from_end=0\t-1.74183\ntoken_from_end=1\t1.87203\ntoken_from_end=2\t0.450151\ntoken_from_end=3\t-0.404919\ntoken_from_end=4\t1.87302\ntoken_from_start=0\t2.81466\ntoken_from_start=1\t-2.53901\ntoken_from_start=2\t0.142347\ntoken_from_start=3\t1.03559\ntoken_from_start=4\t0.594878\ntoken_len=1\t0.513274\ntoken_len=2\t1.25613\ntoken_len=3\t-0.408826\ntoken_len=4\t-0.789652\ntoken_len=5\t-0.170275\ntoken_len=6\t0.177667\ntoken_len=8\t1.48142\nv-1=BOUND\t2.81466\nv-1=DEAD\t1.61902\nv-1=EXPL_E\t0.853631\nv-1=EXPL_O\t0.138028\nv-1=EXPL_aa\t-0.731397\nv-1=EXPL_e\t-0.678899\nv-1=EXPL_i\t-0.802882\nv-1=EXPL_ii\t0.699709\nv-1=EXPL_o\t-0.887901\nv-1=EXPL_ri\t1.40812\nv-1=EXPL_u\t-0.960647\nv-1=EXPL_uu\t0.237967\nv-1=IMPLICIT\t-0.882201\nv-1=INDEP_E\t-0.707915\nv-1=INDEP_O\t2.39859\nv-1=INDEP_a\t-1.01371\nv-1=INDEP_aa\t-0.143595\nv-1=INDEP_e\t-0.901096\nv-1=INDEP_i\t-1.32425\nv-1=INDEP_ii\t0.840671\nv-1=INDEP_o\t-1.17125\nv-1=INDEP_ri\t0.404922\nv-1=INDEP_u\t-0.359299\nv-1=INDEP_uu\t1.19818\nv-2=BOUND\t0.275642\nv-2=DEAD\t0.805907\nv-2=EXPL_E\t0.434958\nv-2=EXPL_O\t0.300102\nv-2=EXPL_aa\t0.221617\nv-2=EXPL_i\t-0.479801\nv-2=EXPL_ii\t0.107116\nv-2=EXPL_o\t0.359213\nv-2=EXPL_ri\t0.6124\nv-2=EXPL_u\t-0.438815\nv-2=EXPL_uu\t-0.307416\nv-2=IMPLICIT\t0.551648\nv-2=INDEP_E\t-0.93116\nv-2=INDEP_O\t-0.949861\nv-2=INDEP_a\t1.44909\nv-2=INDEP_aa\t0.250676\nv-2=INDEP_e\t1.72486\nv-2=INDEP_i\t-0.232548\nv-2=INDEP_ii\t-1.16275\nv-2=INDEP_ri\t0.153452\nv-2=INDEP_u\t-0.664711\nv-3=BOUND\t0.417989\nv-3=DEAD\t0.403929\nv-3=EXPL_E\t-1.30846\nv-3=EXPL_O\t1.64888\nv-3=EXPL_aa\t0.674098\nv-3=EXPL_e\t0.126938\nv-3=EXPL_i\t-0.916117\nv-3=EXPL_ii\t-0.11834\nv-3=EXPL_o\t0.46604\nv-3=EXPL_ri\t0.25961\nv-3=EXPL_u\t-1.17935\nv-3=EXPL_uu\t1.64675\nv-3=IMPLICIT\t-0.316318\nv-3=INDEP_O\t0.991348\nv-3=INDEP_a\t-1.58229\nv-3=INDEP_aa\t1.69115\nv-3=INDEP_i\t-1.67185\nv-3=INDEP_ii\t1.33028\nv-3=INDEP_u\t-1.43104\nv-3=INDEP_uu\t0.87779\nv1=BOUND\t-1.74183\nv1=DEAD\t3.70851\nv1=EXPL_E\t-3.15302\nv1=EXPL_O\t-0.20348\nv1=EXPL_aa\t-1.41049\nv1=EXPL_e\t-0.351079\nv1=EXPL_i\t1.12074\nv1=EXPL_ii\t-0.475169\nv1=EXPL_o\t-1.85953\nv1=EXPL_ri\t-0.921346\nv1=EXPL_u\t0.715565\nv1=EXPL_uu\t-0.913397\nv1=IMPLICIT\t3.20062\nv1=INDEP_O\t0.291546\nv1=INDEP_a\t1.16328\nv1=INDEP_i\t1.10226\nv1=INDEP_ii\t1.39154\nv1=INDEP_uu\t0.339612\nv2=BOUND\t0.130204\nv2=DEAD\t-1.21276\nv2=EXPL_aa\t1.03115\nv2=EXPL_i\t-0.147756\nv2=EXPL_ii\t-0.915327\nv2=EXPL_o\t-0.612395\nv2=EXPL_ri\t2.49625\nv2=EXPL_u\t0.152783\nv2=EXPL_uu\t0.91551\nv2=IMPLICIT\t-0.586445\nv2=INDEP_aa\t1.6967\nv2=INDEP_i\t-0.137753\nv2=INDEP_ii\t-0.402262\nv2=INDEP_uu\t-0.328291\nv3=BOUND\t0.580355\nv3=DEAD\t2.38207\nv3=EXPL_O\t-0.222354\nv3=EXPL_aa\t-1.06853\nv3=EXPL_i\t1.61316\nv3=EXPL_ii\t-1.24343\nv3=EXPL_u\t0.268052\nv3=IMPLICIT\t-0.125456\nv3=INDEP_aa\t-0.56864\nv3=INDEP_ii\t1.14306\nv3=INDEP_uu\t-0.669437";

    const PUNJABI_SCHWA_MODEL_META = Object.freeze({
        intercept: -0.027926018561225535,
        heldOutAccuracy: 0.9291358654091256,
        devAccuracy: 0.9237726098191215,
        trainInstances: 18002,
        testInstances: 3923,
        featureCutoff: 0.08,
        source: 'Aryaman Arora Punjabi pronunciation lexicon, sparse logistic LyricG2P training',
        weightCount: 194,
        role: 'lazy-schwa-advisor',
        metricStatus: 'embedded-build-metadata-not-independently-reproduced-in-this-release'
    });
    const PUNJABI_SCHWA_MODEL_PACKED = "c-1=BOUND\t2.99893\nc-1=VOWEL\t-0.889744\nc-1=den_nas_vd_plain\t0.325587\nc-1=den_sib_vl_plain\t-0.248166\nc-1=den_stop_vd_asp\t0.0935539\nc-1=den_stop_vd_plain\t0.364551\nc-1=den_stop_vl_asp\t-0.454622\nc-1=den_stop_vl_plain\t0.124177\nc-1=glo_fric_vl_asp\t-0.156931\nc-1=lab_gli_vd_plain\t-0.131603\nc-1=lab_nas_vd_plain\t-0.286002\nc-1=lab_stop_vd_asp\t-0.308457\nc-1=lab_stop_vd_plain\t-0.287132\nc-1=lab_stop_vl_plain\t-0.283747\nc-1=pal_aff_vd_asp\t-0.396221\nc-1=pal_aff_vl_asp\t-0.590447\nc-1=pal_aff_vl_plain\t0.196499\nc-1=pal_gli_vd_plain\t-0.158652\nc-1=ret_nas_vd_plain\t0.0993314\nc-1=ret_stop_vd_asp\t0.506684\nc-1=ret_stop_vd_plain\t-0.306871\nc-1=ret_stop_vl_asp\t-0.246405\nc-1=ret_stop_vl_plain\t0.226443\nc-1=vel_stop_vd_asp\t0.196596\nc-1=vel_stop_vl_asp\t-0.302709\nc-2=BOUND\t-0.662629\nc-2=VOWEL\t0.186531\nc-2=den_liq_vd_plain\t0.299754\nc-2=den_nas_vd_plain\t-0.160717\nc-2=den_sib_vl_plain\t0.258849\nc-2=den_stop_vd_asp\t-0.0910713\nc-2=den_stop_vl_asp\t0.115593\nc-2=den_stop_vl_plain\t-0.129481\nc-2=glo_fric_vl_asp\t0.324496\nc-2=lab_gli_vd_plain\t-0.556771\nc-2=lab_nas_vd_plain\t0.993505\nc-2=lab_stop_vd_plain\t-0.160814\nc-2=lab_stop_vl_asp\t-0.0983351\nc-2=pal_aff_vd_plain\t0.75959\nc-2=pal_aff_vl_asp\t-0.370129\nc-2=pal_gli_vd_plain\t-0.120714\nc-2=ret_nas_vd_plain\t0.0814735\nc-2=ret_stop_vl_asp\t-0.0872243\nc-2=ret_stop_vl_plain\t-0.238202\nc-2=vel_stop_vd_asp\t-0.759549\nc-2=vel_stop_vl_plain\t0.286807\nc-3=BOUND\t0.199603\nc-3=VOWEL\t-0.202338\nc-3=den_liq_vd_plain\t-0.412876\nc-3=den_nas_vd_plain\t-0.166735\nc-3=den_sib_vl_plain\t0.284243\nc-3=den_stop_vd_asp\t0.15285\nc-3=den_stop_vd_plain\t0.117785\nc-3=den_stop_vl_asp\t-0.161496\nc-3=glo_fric_vl_asp\t-0.0835278\nc-3=lab_nas_vd_plain\t0.352546\nc-3=lab_stop_vd_plain\t0.210185\nc-3=lab_stop_vl_plain\t-0.185423\nc-3=pal_aff_vd_plain\t-0.14211\nc-3=pal_aff_vl_asp\t0.0879898\nc-3=pal_aff_vl_plain\t-0.394299\nc-3=ret_stop_vd_plain\t-0.123137\nc-3=vel_stop_vd_plain\t-0.181758\nc-3=vel_stop_vl_plain\t0.769551\nc1=BOUND\t-2.24861\nc1=VOWEL\t1.10121\nc1=den_liq_vd_plain\t1.08505\nc1=den_nas_vd_plain\t0.470972\nc1=den_sib_vl_plain\t0.451103\nc1=den_stop_vd_asp\t0.159241\nc1=den_stop_vd_plain\t-0.465282\nc1=den_stop_vl_asp\t-0.548257\nc1=glo_fric_vl_asp\t1.84247\nc1=lab_gli_vd_plain\t-0.933483\nc1=lab_nas_vd_plain\t0.152381\nc1=lab_stop_vd_asp\t-0.468649\nc1=lab_stop_vd_plain\t-0.407001\nc1=lab_stop_vl_asp\t-0.395054\nc1=lab_stop_vl_plain\t-0.698512\nc1=pal_aff_vd_asp\t-0.424388\nc1=pal_aff_vl_asp\t-0.475884\nc1=pal_aff_vl_plain\t-0.507741\nc1=pal_gli_vd_plain\t0.0876043\nc1=ret_nas_vd_plain\t0.458696\nc1=ret_stop_vd_plain\t0.364526\nc1=ret_stop_vl_plain\t0.472598\nc1=vel_stop_vd_asp\t0.175067\nc1=vel_stop_vd_plain\t0.102749\nc1=vel_stop_vl_asp\t0.101986\nc1=vel_stop_vl_plain\t0.533261\nc2=BOUND\t0.104447\nc2=VOWEL\t0.187817\nc2=den_liq_vd_plain\t-0.456038\nc2=den_nas_vd_plain\t0.282047\nc2=den_sib_vl_plain\t-0.810909\nc2=den_stop_vd_asp\t0.43576\nc2=den_stop_vd_plain\t0.237414\nc2=den_stop_vl_asp\t0.0981205\nc2=den_stop_vl_plain\t0.0913082\nc2=glo_fric_vl_asp\t0.089216\nc2=lab_gli_vd_plain\t0.220144\nc2=lab_nas_vd_plain\t0.0804084\nc2=lab_stop_vd_asp\t0.19641\nc2=lab_stop_vl_plain\t0.145138\nc2=pal_aff_vd_asp\t0.262541\nc2=pal_aff_vd_plain\t-0.108908\nc2=pal_aff_vl_plain\t0.217932\nc2=pal_gli_vd_plain\t-0.424484\nc2=ret_nas_vd_plain\t0.214571\nc2=ret_stop_vd_plain\t-0.107885\nc2=ret_stop_vl_plain\t0.32313\nc2=vel_stop_vd_asp\t-0.161952\nc2=vel_stop_vd_plain\t-0.733104\nc2=vel_stop_vl_asp\t-0.347408\nc3=VOWEL\t-0.242075\nc3=den_liq_vd_plain\t0.0880248\nc3=den_nas_vd_plain\t0.265527\nc3=den_sib_vl_plain\t0.174413\nc3=den_stop_vd_plain\t-0.233569\nc3=den_stop_vl_plain\t0.137456\nc3=glo_fric_vl_asp\t-0.332058\nc3=lab_nas_vd_plain\t-0.193348\nc3=lab_stop_vl_plain\t-0.119636\nc3=pal_aff_vd_plain\t0.152059\nc3=pal_aff_vl_plain\t-0.0823447\nc3=ret_nas_vd_plain\t0.339996\nc3=vel_stop_vd_plain\t0.18641\nc3=vel_stop_vl_plain\t-0.0993587\ncur=den_liq_vd_plain\t-0.998346\ncur=den_nas_vd_plain\t-0.337253\ncur=den_sib_vl_plain\t-0.789267\ncur=den_stop_vd_asp\t0.181904\ncur=den_stop_vd_plain\t0.358565\ncur=glo_fric_vl_asp\t-0.818963\ncur=lab_gli_vd_plain\t2.40125\ncur=lab_nas_vd_plain\t0.269474\ncur=lab_stop_vd_plain\t0.535405\ncur=lab_stop_vl_asp\t-0.316873\ncur=lab_stop_vl_plain\t0.465024\ncur=pal_aff_vd_asp\t0.0803086\ncur=pal_aff_vd_plain\t0.188447\ncur=pal_aff_vl_asp\t-0.217978\ncur=pal_aff_vl_plain\t-0.26214\ncur=pal_gli_vd_plain\t0.80367\ncur=ret_nas_vd_plain\t-0.650501\ncur=ret_stop_vd_asp\t0.176583\ncur=ret_stop_vd_plain\t-0.0843858\ncur=ret_stop_vl_asp\t-0.152518\ncur=ret_stop_vl_plain\t-0.544473\ncur=vel_stop_vd_asp\t-0.290549\ncur=vel_stop_vd_plain\t0.283128\ncur=vel_stop_vl_asp\t-0.359988\ncur=vel_stop_vl_plain\t-0.0939886\nfrom_end=0\t-0.883534\nfrom_end=1\t0.835237\nfrom_end=2\t0.211801\nfrom_end=3\t0.225981\nfrom_end=4\t-0.41741\nfrom_start=0\t0.894505\nfrom_start=1\t-0.514411\nfrom_start=3\t-0.162884\nfrom_start=4\t-0.246213\nlen=2\t0.249618\nlen=3\t0.438504\nlen=4\t-0.342384\nlen=5\t-0.320677\nnext_dead=0\t-0.207516\nnext_dead=1\t0.17959\nprev_dead=0\t0.379964\nprev_dead=1\t-0.40789\nv-1=BOUND\t2.99893\nv-1=DEAD\t-0.40789\nv-1=EXPLICIT\t-0.827058\nv-1=IMPLICIT\t-0.902163\nv-1=VOWEL\t-0.889744\nv-2=BOUND\t-0.662629\nv-2=DEAD\t0.334767\nv-2=IMPLICIT\t0.0869504\nv-2=VOWEL\t0.186531\nv-3=BOUND\t0.199603\nv-3=VOWEL\t-0.202338\nv1=BOUND\t-2.24861\nv1=DEAD\t0.17959\nv1=EXPLICIT\t-1.1361\nv1=IMPLICIT\t2.07599\nv1=VOWEL\t1.10121\nv2=BOUND\t0.104447\nv2=DEAD\t0.084066\nv2=EXPLICIT\t0.0881674\nv2=IMPLICIT\t-0.492424\nv2=VOWEL\t0.187817\nv3=DEAD\t0.13692\nv3=IMPLICIT\t0.1964\nv3=VOWEL\t-0.242075";

    let hindiSchwaWeights = null;
    let punjabiSchwaWeights = null;

    function unpackSparseWeights(packed, cacheName) {
        if (cacheName === 'hindi' && hindiSchwaWeights) return hindiSchwaWeights;
        if (cacheName === 'punjabi' && punjabiSchwaWeights) return punjabiSchwaWeights;
        const weights = Object.create(null);
        const source = String(packed || '');
        let cursor = 0;
        while (cursor < source.length) {
            let lineEnd = source.indexOf('\n', cursor);
            if (lineEnd < 0) lineEnd = source.length;
            const tab = source.lastIndexOf('\t', lineEnd - 1);
            if (tab >= cursor) {
                const value = Number(source.slice(tab + 1, lineEnd));
                if (Number.isFinite(value)) weights[source.slice(cursor, tab)] = value;
            }
            cursor = lineEnd + 1;
        }
        if (cacheName === 'hindi') hindiSchwaWeights = weights;
        else if (cacheName === 'punjabi') punjabiSchwaWeights = weights;
        return weights;
    }

    const INDIC_PLACE_GROUPS = Object.freeze({
        vel: 'कखगघङक़ख़ग़ਕਖਗਘਙਖ਼ਗ਼',
        pal: 'चछजझञशषज़ਚਛਜਝਞਸ਼ਜ਼',
        ret: 'टठडढणड़ढ़ळऴਟਠਡਢਣੜਲ਼',
        den: 'तथदधनरऱलसਤਥਦਧਨਰਲਸ',
        lab: 'पफबभमवफ़ਪਫਬਭਮਵਫ਼',
        glo: 'हਹ'
    });
    const INDIC_NASAL_GRAPHEMES = 'ङञणनमਙਞਣਨਮ';
    const INDIC_GLIDE_GRAPHEMES = 'यवਯਵ';
    const INDIC_LIQUID_GRAPHEMES = 'रऱलळऴड़ढ़ਰਲਲ਼ੜ';
    const INDIC_SIBILANT_GRAPHEMES = 'शषसज़ਸ਼ਸਜ਼';
    const INDIC_AFFRICATE_GRAPHEMES = 'चछजझज़ਚਛਜਝਜ਼';
    const INDIC_VOICED_GRAPHEMES = 'गघङजझञडढणदधनबभमयरऱलळऴवहज़ग़ड़ढ़ਗਘਙਜਝਞਡਢਣਦਧਨਬਭਮਯਰਲਵਹਜ਼ਗ਼ੜ';
    const INDIC_ASPIRATED_GRAPHEMES = 'खघछझठढथधफभहख़ढ़ਖਘਛਝਠਢਥਧਫਭਹਖ਼';

    function baseGraphemeForToken(token) {
        const source = String((token && token.source) || (token && token.grapheme) || '');
        for (const ch of source) {
            if (/[^\u0900-\u097f\u0a00-\u0a7f]/u.test(ch)) continue;
            if (ch === '़' || ch === '੍' || ch === '਼') continue;
            return ch;
        }
        return source.charAt(0) || '';
    }

    function universalIndicConsonantClass(token) {
        if (!token) return 'BOUND';
        if (token.kind === 'vowel') return 'VOWEL';
        if (token.kind !== 'consonant') return 'OTH';
        const ch = baseGraphemeForToken(token);
        let place = 'oth';
        Object.keys(INDIC_PLACE_GROUPS).some(key => {
            if (INDIC_PLACE_GROUPS[key].includes(ch)) { place = key; return true; }
            return false;
        });
        let manner = 'stop';
        if (INDIC_NASAL_GRAPHEMES.includes(ch)) manner = 'nas';
        else if (INDIC_GLIDE_GRAPHEMES.includes(ch)) manner = 'gli';
        else if (INDIC_LIQUID_GRAPHEMES.includes(ch)) manner = 'liq';
        else if (INDIC_SIBILANT_GRAPHEMES.includes(ch)) manner = 'sib';
        else if (INDIC_AFFRICATE_GRAPHEMES.includes(ch)) manner = 'aff';
        else if (ch === 'ह' || ch === 'ਹ') manner = 'fric';
        const voiced = INDIC_VOICED_GRAPHEMES.includes(ch) ? 'vd' : 'vl';
        const aspiration = INDIC_ASPIRATED_GRAPHEMES.includes(ch) ? 'asp' : 'plain';
        return `${place}_${manner}_${voiced}_${aspiration}`;
    }

    const DEVANAGARI_TRAINING_VOWELS = Object.freeze({
        'ऄ':'a','अ':'a','आ':'aa','इ':'i','ई':'ii','उ':'u','ऊ':'uu','ऋ':'ri','ॠ':'ri','ऌ':'li','ॡ':'li',
        'ऍ':'E','ऎ':'e','ए':'e','ऐ':'E','ऑ':'O','ऒ':'o','ओ':'o','औ':'O','ॲ':'a',
        'ा':'aa','ि':'i','ी':'ii','ु':'u','ू':'uu','ृ':'ri','ॄ':'ri','ॅ':'E','ॆ':'e','े':'e','ै':'E','ॉ':'O','ॊ':'o','ो':'o','ौ':'O','ॢ':'li','ॣ':'li'
    });

    function devanagariModelVowelMode(token) {
        if (!token) return 'BOUND';
        if (token.kind === 'vowel') {
            const source = String(token.source || '');
            return `INDEP_${DEVANAGARI_TRAINING_VOWELS[source.charAt(0)] || token.vowel || 'a'}`;
        }
        if (token.kind !== 'consonant') return 'BOUND';
        if (token.dead) return 'DEAD';
        if (token.implicit) return 'IMPLICIT';
        const chars = Array.from(String(token.source || ''));
        let value = token.vowel || '';
        for (let i = chars.length - 1; i >= 0; i -= 1) {
            if (DEVANAGARI_TRAINING_VOWELS[chars[i]]) { value = DEVANAGARI_TRAINING_VOWELS[chars[i]]; break; }
        }
        return `EXPL_${value}`;
    }

    function universalSchwaVowelMode(token) {
        if (!token) return 'BOUND';
        if (token.kind === 'vowel') return 'VOWEL';
        if (token.kind !== 'consonant') return 'BOUND';
        if (token.dead) return 'DEAD';
        return token.implicit ? 'IMPLICIT' : 'EXPLICIT';
    }

    function spokenTokenContext(tokens) {
        const spoken = [];
        const sourceToSpoken = new Map();
        (tokens || []).forEach((token, originalIndex) => {
            if (!token || (token.kind !== 'consonant' && token.kind !== 'vowel')) return;
            sourceToSpoken.set(originalIndex, spoken.length);
            spoken.push({ token, originalIndex });
        });
        return { spoken, sourceToSpoken };
    }

    function featureMapForHindiSchwa(tokens, originalIndex) {
        const { spoken, sourceToSpoken } = spokenTokenContext(tokens);
        const index = sourceToSpoken.get(originalIndex);
        if (!Number.isInteger(index)) return null;
        const current = spoken[index].token;
        const features = Object.create(null);
        const currentChar = baseGraphemeForToken(current);
        features[`cur_ch=${currentChar}`] = 1;
        features[`cur_class=${universalIndicConsonantClass(current)}`] = 1;
        features[`cur_nasal=${current.nasal ? 1 : 0}`] = 1;
        [-3,-2,-1,1,2,3].forEach(offset => {
            const entry = spoken[index + offset];
            const token = entry ? entry.token : null;
            features[`c${offset}=${universalIndicConsonantClass(token)}`] = 1;
            features[`v${offset}=${devanagariModelVowelMode(token)}`] = 1;
            if (token && token.kind === 'consonant') {
                features[`ch${offset}=${baseGraphemeForToken(token)}`] = 1;
            }
        });
        const consonants = spoken.map((entry, i) => entry.token.kind === 'consonant' ? i : -1).filter(i => i >= 0);
        const consonantIndex = consonants.indexOf(index);
        features[`cons_from_start=${Math.min(consonantIndex, 4)}`] = 1;
        features[`cons_from_end=${Math.min(consonants.length - 1 - consonantIndex, 4)}`] = 1;
        features[`token_from_start=${Math.min(index, 4)}`] = 1;
        features[`token_from_end=${Math.min(spoken.length - 1 - index, 4)}`] = 1;
        features[`token_len=${Math.min(spoken.length, 10)}`] = 1;
        const previous = spoken[index - 1] && spoken[index - 1].token;
        const next = spoken[index + 1] && spoken[index + 1].token;
        features[`prev_dead=${previous && previous.dead ? 1 : 0}`] = 1;
        features[`next_dead=${next && next.dead ? 1 : 0}`] = 1;
        return features;
    }

    function featureMapForTransferSchwa(tokens, originalIndex) {
        const { spoken, sourceToSpoken } = spokenTokenContext(tokens);
        const index = sourceToSpoken.get(originalIndex);
        if (!Number.isInteger(index)) return null;
        const current = spoken[index].token;
        const features = Object.create(null);
        features[`cur=${universalIndicConsonantClass(current)}`] = 1;
        [-3,-2,-1,1,2,3].forEach(offset => {
            const entry = spoken[index + offset];
            const token = entry ? entry.token : null;
            features[`c${offset}=${universalIndicConsonantClass(token)}`] = 1;
            features[`v${offset}=${universalSchwaVowelMode(token)}`] = 1;
        });
        const consonants = spoken.map((entry, i) => entry.token.kind === 'consonant' ? i : -1).filter(i => i >= 0);
        const consonantIndex = consonants.indexOf(index);
        features[`from_start=${Math.min(consonantIndex, 4)}`] = 1;
        features[`from_end=${Math.min(consonants.length - 1 - consonantIndex, 4)}`] = 1;
        features[`len=${Math.min(spoken.length, 10)}`] = 1;
        const previous = spoken[index - 1] && spoken[index - 1].token;
        const next = spoken[index + 1] && spoken[index + 1].token;
        features[`prev_dead=${previous && previous.dead ? 1 : 0}`] = 1;
        features[`next_dead=${next && next.dead ? 1 : 0}`] = 1;
        return features;
    }

    function sparseLogisticProbability(features, packed, meta, cacheName) {
        if (!features) return null;
        const weights = unpackSparseWeights(packed, cacheName);
        let score = Number(meta && meta.intercept) || 0;
        Object.keys(features).forEach(key => {
            if (features[key] && Number.isFinite(weights[key])) score += weights[key] * features[key];
        });
        if (score >= 35) return 1;
        if (score <= -35) return 0;
        return 1 / (1 + Math.exp(-score));
    }

    function learnedSchwaProbability(tokens, originalIndex, mode) {
        if (mode === 'hindi') {
            return sparseLogisticProbability(
                featureMapForHindiSchwa(tokens, originalIndex),
                HINDI_SCHWA_MODEL_PACKED,
                HINDI_SCHWA_MODEL_META,
                'hindi'
            );
        }
        if (mode === 'punjabi') {
            return sparseLogisticProbability(
                featureMapForTransferSchwa(tokens, originalIndex),
                PUNJABI_SCHWA_MODEL_PACKED,
                PUNJABI_SCHWA_MODEL_META,
                'punjabi'
            );
        }
        return null;
    }

    function isDevanagariWordCharacter(character) {
        if (!character) return false;
        const cp = character.codePointAt(0);
        if (cp === 0x200c || cp === 0x200d) return true;
        if (cp < 0x0900 || cp > 0x097f) return false;
        /* Danda/double danda and Devanagari digits terminate a spoken word. */
        if (cp === 0x0964 || cp === 0x0965 || (cp >= 0x0966 && cp <= 0x096f)) return false;
        return true;
    }

    function devanagariConsonantAt(characters, index) {
        const ch = characters[index];
        if (!ch) return null;
        let value = DEVANAGARI_CONSONANTS[ch] || '';
        if (!value) return null;
        let nextIndex = index + 1;
        if (characters[nextIndex] === '़') {
            value = DEVANAGARI_NUKTA_CONSONANTS[ch] || value;
            nextIndex += 1;
        }
        return { value, nextIndex };
    }

    function devanagariNasalForNext(tokens, tokenIndex, mark) {
        /* Chandrabindu is vowel nasalization; lyric spellings usually use n. */
        if (mark === 'ँ') return 'n';
        for (let i = tokenIndex + 1; i < tokens.length; i += 1) {
            const next = tokens[i];
            if (!next || next.kind !== 'consonant') continue;
            return /^(?:p|ph|b|bh|m)/.test(next.consonant) ? 'm' : 'n';
        }
        return 'n';
    }

    function devanagariTokenizeWord(word) {
        const characters = Array.from(word);
        const tokens = [];
        let index = 0;

        while (index < characters.length) {
            const start = index;
            const ch = characters[index];

            if (ch === '\u200c' || ch === '\u200d') {
                index += 1;
                continue;
            }

            const independentVowel = DEVANAGARI_INDEPENDENT_VOWELS[ch];
            if (independentVowel) {
                tokens.push({
                    kind: 'vowel',
                    consonant: '',
                    vowel: independentVowel,
                    implicit: false,
                    explicit: true,
                    nasal: '',
                    source: ch,
                    sourceStart: start,
                    sourceEnd: start + 1
                });
                index += 1;
                continue;
            }

            const consonantInfo = devanagariConsonantAt(characters, index);
            if (consonantInfo) {
                const token = {
                    kind: 'consonant',
                    consonant: consonantInfo.value,
                    vowel: 'a',
                    implicit: true,
                    explicit: false,
                    nasal: '',
                    source: characters.slice(index, consonantInfo.nextIndex).join(''),
                    sourceStart: start,
                    sourceEnd: consonantInfo.nextIndex
                };
                index = consonantInfo.nextIndex;

                if (characters[index] === '्') {
                    token.vowel = '';
                    token.implicit = false;
                    token.explicit = true;
                    token.dead = true;
                    index += 1;
                    if (characters[index] === '\u200c' || characters[index] === '\u200d') {
                        token.joiner = characters[index];
                        index += 1;
                    }
                    token.finalVirama = index >= characters.length;
                    token.sourceEnd = index;
                } else {
                    const sign = DEVANAGARI_VOWEL_SIGNS[characters[index]];
                    if (sign) {
                        token.vowel = sign;
                        token.implicit = false;
                        token.explicit = true;
                        token.source += characters[index];
                        index += 1;
                        token.sourceEnd = index;
                    }
                }

                tokens.push(token);
                continue;
            }

            if (ch === 'ं' || ch === 'ँ') {
                if (tokens.length) {
                    tokens[tokens.length - 1].nasal = ch;
                    tokens[tokens.length - 1].sourceEnd = index + 1;
                } else {
                    tokens.push({ kind: 'mark', value: 'n', source: ch, sourceStart: start, sourceEnd: start + 1 });
                }
                index += 1;
                continue;
            }

            if (ch === 'ः') {
                if (tokens.length) {
                    tokens[tokens.length - 1].visarga = true;
                    tokens[tokens.length - 1].sourceEnd = index + 1;
                } else {
                    tokens.push({ kind: 'mark', value: 'h', source: ch, sourceStart: start, sourceEnd: start + 1 });
                }
                index += 1;
                continue;
            }

            if (ch === 'ऽ') {
                tokens.push({ kind: 'mark', value: "'", source: ch, sourceStart: start, sourceEnd: start + 1 });
                index += 1;
                continue;
            }

            /* Accent/vedic marks are non-lexical for lyric display. */
            const cp = ch.codePointAt(0);
            if ((cp >= 0x0951 && cp <= 0x0954) || cp === 0x0971) {
                index += 1;
                continue;
            }

            const fallback = asciiMap(ch);
            tokens.push({ kind: 'mark', value: fallback || '', source: ch, sourceStart: start, sourceEnd: start + 1 });
            index += 1;
        }

        return tokens;
    }

    function applyHindiSchwaDeletion(tokens, options = null) {
        const sourceTokens = tokens.map(token => Object.assign({}, token));
        const result = sourceTokens.map(token => {
            const copy = Object.assign({}, token);
            if (copy.kind === 'consonant' && copy.implicit && copy.vowel === 'a') {
                copy.schwaDecision = { action: 'keep', reason: 'DEFAULT_ORTHOGRAPHIC_SCHWA' };
            }
            return copy;
        });
        const consonantIndexes = [];
        result.forEach((token, index) => {
            if (token.kind === 'consonant') consonantIndexes.push(index);
        });
        if (!consonantIndexes.length) return result;

        const lastConsonantIndex = consonantIndexes[consonantIndexes.length - 1];
        const last = result[lastConsonantIndex];
        if (last && last.implicit && last.vowel === 'a') {
            last.vowel = '';
            last.schwaDeleted = true;
            last.schwaDecision = { action: 'delete', reason: 'WORD_FINAL_SCHWA' };
        }

        for (let ci = consonantIndexes.length - 2; ci > 0; ci -= 1) {
            const currentIndex = consonantIndexes[ci];
            const nextIndex = consonantIndexes[ci + 1];
            const current = result[currentIndex];
            const next = result[nextIndex];
            if (
                current && current.implicit && current.vowel === 'a'
                && next && next.kind === 'consonant'
                && next.explicit && !next.dead && !!next.vowel
            ) {
                current.vowel = '';
                current.schwaDeleted = true;
                current.schwaDecision = { action: 'delete', reason: 'MEDIAL_Ca_CV_CADENCE' };
            }
        }

        for (let ci = consonantIndexes.length - 3; ci > 0; ci -= 1) {
            const current = result[consonantIndexes[ci]];
            const next = result[consonantIndexes[ci + 1]];
            const after = result[consonantIndexes[ci + 2]];
            if (
                current && current.implicit && current.vowel === 'a'
                && next && next.implicit && next.vowel === 'a'
                && after && after.kind === 'consonant' && !after.vowel
            ) {
                current.vowel = '';
                current.schwaDeleted = true;
                current.schwaDecision = { action: 'delete', reason: 'MEDIAL_IMPLICIT_CADENCE' };
                break;
            }
        }

        const mode = options && options.learnedMode;
        if (mode === 'hindi' || mode === 'punjabi') {
            const keepThreshold = mode === 'hindi' ? 0.82 : 0.86;
            const deleteThreshold = mode === 'hindi' ? 0.18 : 0.14;
            sourceTokens.forEach((sourceToken, index) => {
                if (!sourceToken || sourceToken.kind !== 'consonant' || !sourceToken.implicit || sourceToken.vowel !== 'a') return;
                const probability = learnedSchwaProbability(sourceTokens, index, mode);
                if (!Number.isFinite(probability)) return;
                result[index].schwaKeepProbability = Number(probability.toFixed(4));
                result[index].schwaModel = mode === 'hindi' ? 'hi-schwa-logreg' : 'pa-schwa-logreg';
                if (options && options.advisorOnly) {
                    result[index].schwaAdvice = probability >= keepThreshold
                        ? { action: 'keep', reason: 'LEARNED_HIGH_CONFIDENCE_KEEP', model: result[index].schwaModel, probability: result[index].schwaKeepProbability }
                        : (probability <= deleteThreshold
                            ? { action: 'delete', reason: 'LEARNED_HIGH_CONFIDENCE_DELETE', model: result[index].schwaModel, probability: result[index].schwaKeepProbability }
                            : { action: 'uncertain', reason: 'LEARNED_UNCERTAIN', model: result[index].schwaModel, probability: result[index].schwaKeepProbability });
                    return;
                }

                if (probability >= keepThreshold) {
                    if (!result[index].schwaDeleted) {
                        result[index].vowel = 'a';
                        result[index].schwaDecision = {
                            action: 'keep', reason: 'LEARNED_CONFIRM_KEEP',
                            model: result[index].schwaModel, probability: result[index].schwaKeepProbability
                        };
                    }
                } else if (probability <= deleteThreshold) {
                    const firstConsonant = consonantIndexes[0] === index;
                    if (!firstConsonant) {
                        result[index].vowel = '';
                        result[index].schwaDeleted = true;
                        result[index].schwaDecision = {
                            action: 'delete', reason: 'LEARNED_HIGH_CONFIDENCE_DELETE',
                            model: result[index].schwaModel, probability: result[index].schwaKeepProbability
                        };
                    }
                }
            });
        }
        return result;
    }

    function devanagariTokenChunks(tokens) {
        const consonantIndexes = [];
        tokens.forEach((token, index) => {
            if (token.kind === 'consonant') consonantIndexes.push(index);
        });
        const lastConsonantIndex = consonantIndexes.length
            ? consonantIndexes[consonantIndexes.length - 1]
            : -1;

        return tokens.map((token, index) => {
            if (token.kind === 'mark') return token.value || '';

            let vowel = token.vowel || '';
            /* Casual lyric romanization writes word-final ा as "a", while an
             * internal long ā remains visible as "aa" (pyaara, saariyan). */
            if (token.kind === 'consonant' && index === lastConsonantIndex && vowel === 'aa') {
                vowel = 'a';
            }

            let value = (token.consonant || '') + vowel;
            if (token.nasal) value += devanagariNasalForNext(tokens, index, token.nasal);
            if (token.visarga) value += 'h';
            return value;
        });
    }

    function normalizeDevanagariLyricRoman(value) {
        return String(value || '')
            .replace(/aae/g, 'aaye')
            .replace(/(^|[^a])ae/g, '$1aye')
            .replace(/ie/g, 'iye')
            .replace(/oe/g, 'oye')
            .replace(/([aeiou])\1\1+/g, '$1$1');
    }

    const MAX_ASCII_ALIGNMENT_CELLS = 1000000;
    const MAX_CANDIDATE_SIMILARITY_CELLS = 1000000;

    function proportionalBoundaryMaps(sourceLength, targetLength) {
        const startMap = new Array(sourceLength + 1);
        const endMap = new Array(sourceLength + 1);
        for (let index = 0; index <= sourceLength; index += 1) {
            const mapped = sourceLength
                ? Math.round((index * targetLength) / sourceLength)
                : 0;
            startMap[index] = mapped;
            endMap[index] = mapped;
        }
        if (sourceLength) {
            startMap[sourceLength] = targetLength;
            endMap[sourceLength] = targetLength;
        }
        return { startMap, endMap, approximate: true };
    }

    function alignAsciiBoundaryMaps(source, target) {
        const left = String(source || '');
        const right = String(target || '');
        const rows = left.length + 1;
        const cols = right.length + 1;

        /* A corrupt provider can deliver an effectively unbounded token. The
         * exact edit-distance alignment is quadratic, so keep exact behavior
         * for ordinary lyric words and use a monotonic bounded fallback only
         * for pathological inputs. */
        if ((rows * cols) > MAX_ASCII_ALIGNMENT_CELLS) {
            return proportionalBoundaryMaps(left.length, right.length);
        }

        /* This alignment sits on the diagnostic/provenance path for every
         * dedicated Indic word. A flat typed cost matrix avoids thousands of
         * boxed Array cells and temporary string operations while preserving
         * the old edit-distance tie-break order: diagonal, delete, insert. */
        const dp = new Uint32Array(rows * cols);
        for (let i = 1; i < rows; i += 1) dp[i * cols] = i;
        for (let j = 1; j < cols; j += 1) dp[j] = j;

        for (let i = 1; i < rows; i += 1) {
            const row = i * cols;
            const previousRow = row - cols;
            for (let j = 1; j < cols; j += 1) {
                const substitution = dp[previousRow + j - 1]
                    + (left.charCodeAt(i - 1) === right.charCodeAt(j - 1) ? 0 : 1);
                const deletion = dp[previousRow + j] + 1;
                const insertion = dp[row + j - 1] + 1;
                dp[row + j] = Math.min(substitution, deletion, insertion);
            }
        }

        const maxOperations = left.length + right.length;
        const operations = new Uint8Array(maxOperations);
        let operationStart = maxOperations;
        let i = left.length;
        let j = right.length;
        while (i > 0 || j > 0) {
            const cell = dp[(i * cols) + j];
            if (
                i > 0 && j > 0
                && cell === dp[((i - 1) * cols) + j - 1]
                    + (left.charCodeAt(i - 1) === right.charCodeAt(j - 1) ? 0 : 1)
            ) {
                operations[--operationStart] = 1; // diagonal
                i -= 1;
                j -= 1;
            } else if (i > 0 && cell === dp[((i - 1) * cols) + j] + 1) {
                operations[--operationStart] = 2; // delete
                i -= 1;
            } else {
                operations[--operationStart] = 3; // insert
                j -= 1;
            }
        }

        const minMap = new Array(left.length + 1).fill(Infinity);
        const maxMap = new Array(left.length + 1).fill(-Infinity);
        const record = (sourceIndex, targetIndex) => {
            if (targetIndex < minMap[sourceIndex]) minMap[sourceIndex] = targetIndex;
            if (targetIndex > maxMap[sourceIndex]) maxMap[sourceIndex] = targetIndex;
        };

        i = 0;
        j = 0;
        record(0, 0);
        for (let operationIndex = operationStart; operationIndex < maxOperations; operationIndex += 1) {
            const operation = operations[operationIndex];
            if (operation === 1) {
                i += 1;
                j += 1;
            } else if (operation === 2) {
                i += 1;
            } else {
                j += 1;
            }
            record(i, j);
        }

        for (i = 0; i < minMap.length; i += 1) {
            if (!Number.isFinite(minMap[i])) minMap[i] = i > 0 ? minMap[i - 1] : 0;
            if (!Number.isFinite(maxMap[i])) maxMap[i] = minMap[i];
        }
        return { startMap: maxMap, endMap: minMap };
    }

    function buildIndicWordBoundaryMaps(word, tokens, baselineChunks, finalValue) {
        const baseline = baselineChunks.join('');
        const aligned = alignAsciiBoundaryMaps(baseline, finalValue);
        const baselineStart = new Array(tokens.length);
        const baselineEnd = new Array(tokens.length);
        let offset = 0;
        baselineChunks.forEach((chunk, index) => {
            baselineStart[index] = offset;
            offset += chunk.length;
            baselineEnd[index] = offset;
        });

        const startMap = new Array(word.length + 1).fill(null);
        const endMap = new Array(word.length + 1).fill(null);
        startMap[0] = 0;
        endMap[0] = 0;
        startMap[word.length] = finalValue.length;
        endMap[word.length] = finalValue.length;

        tokens.forEach((token, tokenIndex) => {
            const sourceStart = Math.max(0, Math.min(word.length, Number(token.sourceStart) || 0));
            const sourceEnd = Math.max(sourceStart, Math.min(word.length, Number(token.sourceEnd) || sourceStart));
            const baseStart = baselineStart[tokenIndex] || 0;
            const baseEnd = baselineEnd[tokenIndex] || baseStart;
            const sourceSpan = Math.max(1, sourceEnd - sourceStart);
            const baseSpan = Math.max(0, baseEnd - baseStart);

            for (let boundary = sourceStart; boundary <= sourceEnd; boundary += 1) {
                const ratio = (boundary - sourceStart) / sourceSpan;
                const baseBoundary = Math.max(
                    baseStart,
                    Math.min(baseEnd, Math.round(baseStart + (baseSpan * ratio)))
                );
                const mappedStart = aligned.startMap[baseBoundary];
                const mappedEnd = aligned.endMap[baseBoundary];
                if (startMap[boundary] === null) startMap[boundary] = mappedStart;
                else startMap[boundary] = Math.max(startMap[boundary], mappedStart);
                if (endMap[boundary] === null) endMap[boundary] = mappedEnd;
                else endMap[boundary] = Math.min(endMap[boundary], mappedEnd);
            }
        });

        /* Token spans may overlap on malformed provider text (for example a
         * leading addak followed by vowel/nasal marks). Reassert the two word
         * endpoints after token interpolation so no token can move boundary 0
         * or the terminal boundary away from the actual output endpoints. */
        startMap[0] = 0;
        endMap[0] = 0;
        startMap[word.length] = finalValue.length;
        endMap[word.length] = finalValue.length;

        let lastStart = 0;
        let lastEnd = 0;
        for (let boundary = 0; boundary <= word.length; boundary += 1) {
            if (startMap[boundary] === null) startMap[boundary] = lastStart;
            if (endMap[boundary] === null) endMap[boundary] = lastEnd;
            startMap[boundary] = Math.max(lastStart, Math.min(finalValue.length, startMap[boundary]));
            endMap[boundary] = Math.max(lastEnd, Math.min(finalValue.length, endMap[boundary]));
            lastStart = startMap[boundary];
            lastEnd = endMap[boundary];
        }

        return { text: finalValue, startMap, endMap };
    }

    function attachTokenProvenance(result, tokens, chunks) {
        if (!result || !Array.isArray(tokens)) return result;
        result.provenance = tokens.map((token, index) => {
            const sourceStart = Math.max(0, Number(token.sourceStart) || 0);
            const sourceEnd = Math.max(sourceStart, Number(token.sourceEnd) || sourceStart);
            const outputStart = Math.max(0, Number(result.startMap[sourceStart]) || 0);
            const mappedEnd = Number(result.endMap[sourceEnd]);
            const outputEnd = Math.max(outputStart, Number.isFinite(mappedEnd) ? mappedEnd : outputStart);
            return {
                sourceStart,
                sourceEnd,
                outputStart,
                outputEnd,
                baselineChunk: String((chunks && chunks[index]) || ''),
                kind: token.kind || 'unknown',
                grapheme: token.grapheme || token.source || '',
                joiner: token.joiner || null,
                schwaDecision: token.schwaDecision || null
            };
        });
        return result;
    }

    function romanizeDevanagariWordDetailed(word, options = null) {
        const descriptor = {
            key: 'devanagari', script: 'Devanagari', language: 'hi-mr-bho-ne', dedicated: true
        };
        const languageHint = options && options.languageHint ? options.languageHint : null;
        if (languageHint && languageHint.language) descriptor.language = languageHint.language;
        const learnedRequested = !!(options && (options.applyLearnedSchwa || options.learnedAdvisor));
        const learnedMode = learnedRequested ? productionSchwaMode(word, descriptor, languageHint) : null;
        const tokens = applyHindiSchwaDeletion(
            devanagariTokenizeWord(word),
            learnedMode ? { learnedMode, advisorOnly: !!(options && options.learnedAdvisor) } : null
        );
        const chunks = devanagariTokenChunks(tokens);
        const baselineValue = normalizeDevanagariLyricRoman(chunks.join(''));
        const baselineMaps = buildIndicWordBoundaryMaps(word, tokens, chunks, baselineValue);
        const lexiconEntry = devanagariLexiconEntry(word);
        const override = lexiconEntry && lexiconEntry.text;
        const morphologyDecision = override
            ? null
            : morphologyProductionDecision(word, descriptor, baselineMaps);
        const finalValue = override || (morphologyDecision && morphologyDecision.text) || baselineValue;
        const result = finalValue === baselineValue
            ? baselineMaps
            : buildIndicWordBoundaryMaps(word, tokens, chunks, finalValue);
        result.morphologyDecision = morphologyDecision;
        result.lexiconOverride = !!override;
        result.lexiconSource = lexiconEntry ? lexiconEntry.source : null;
        result.tokens = tokens;
        result.learnedSchwa = tokens.some(token => token && Number.isFinite(token.schwaKeepProbability));
        result.learnedSchwaApplied = tokens.some(token => token && token.schwaDecision && /^LEARNED_/.test(token.schwaDecision.reason || ''));
        result.learnedSchwaMode = learnedMode;
        result.languageHint = languageHint;
        attachTokenProvenance(result, tokens, chunks);
        return result;
    }

    function romanizeDevanagariWord(word, options = null) {
        /* Normal playback needs only the final spelling. Avoid constructing
         * full provenance/edit-distance maps unless morphology can actually
         * splice a known lexical stem. Detailed diagnostics keep the exact
         * path above. */
        if (options && (options.applyLearnedSchwa || options.learnedAdvisor || options.languageHint)) {
            return romanizeDevanagariWordDetailed(word, options).text;
        }
        const descriptor = {
            key: 'devanagari', script: 'Devanagari', language: 'hi-mr-bho-ne', dedicated: true
        };
        const tokens = applyHindiSchwaDeletion(devanagariTokenizeWord(word));
        const chunks = devanagariTokenChunks(tokens);
        const baselineValue = normalizeDevanagariLyricRoman(chunks.join(''));
        const lexiconEntry = devanagariLexiconEntry(word);
        const override = lexiconEntry && lexiconEntry.text;
        if (override) return override;
        const productionHints = morphologyProductionHints(word, descriptor);
        if (!productionHints.length) return baselineValue;
        const baselineMaps = buildIndicWordBoundaryMaps(word, tokens, chunks, baselineValue);
        const morphologyDecision = morphologyProductionDecision(
            word, descriptor, baselineMaps, productionHints
        );
        return (morphologyDecision && morphologyDecision.text) || baselineValue;
    }

    function romanizeDevanagariRun(characters, start) {
        let index = start;
        const parts = [];
        while (index < characters.length && isDevanagariWordCharacter(characters[index])) {
            parts.push(characters[index]);
            index += 1;
        }
        const word = parts.join('');
        return {
            value: romanizeDevanagariWord(word),
            nextIndex: index
        };
    }


    /* Punjabi/Gurmukhi companion to the Devanagari lyric path. */
    const GURMUKHI_CONSONANTS = Object.freeze({
        'ਕ':'k','ਖ':'kh','ਗ':'g','ਘ':'gh','ਙ':'ng',
        'ਚ':'ch','ਛ':'chh','ਜ':'j','ਝ':'jh','ਞ':'ny',
        'ਟ':'t','ਠ':'th','ਡ':'d','ਢ':'dh','ਣ':'n','ੜ':'d',
        'ਤ':'t','ਥ':'th','ਦ':'d','ਧ':'dh','ਨ':'n',
        'ਪ':'p','ਫ':'ph','ਬ':'b','ਭ':'bh','ਮ':'m',
        'ਯ':'y','ਰ':'r','ਲ':'l','ਵ':'v','ਸ਼':'sh','ਸ':'s','ਹ':'h',
        'ਖ਼':'kh','ਗ਼':'gh','ਜ਼':'z','ਫ਼':'f','ਲ਼':'l'
    });

    const GURMUKHI_NUKTA_CONSONANTS = Object.freeze({
        'ਖ':'kh','ਗ':'gh','ਜ':'z','ਫ':'f','ਲ':'l','ਸ':'sh'
    });

    const GURMUKHI_INDEPENDENT_VOWELS = Object.freeze({
        'ਅ':'a','ਆ':'aa','ਇ':'i','ਈ':'ee','ਉ':'u','ਊ':'oo','ਏ':'e','ਐ':'ai','ਓ':'o','ਔ':'au'
    });

    const GURMUKHI_VOWEL_SIGNS = Object.freeze({
        'ਾ':'aa','ਿ':'i','ੀ':'ee','ੁ':'u','ੂ':'oo','ੇ':'e','ੈ':'ai','ੋ':'o','ੌ':'au'
    });

    const GURMUKHI_LYRIC_OVERRIDES = Object.freeze({
        'ਮੁੰਡਾ':'munda','ਸਾਡਾ':'saada','ਛੱਡ':'chhad','ਸਾਰੀਆਂ':'saariyan','ਕੁਆਰੀਆਂ':'kuwaariyan',
        'ਪੰਜਾਬੀ':'panjabi','ਮੈਂ':'main','ਨਹੀਂ':'nahin','ਹਾਂ':'haan','ਹੂੰ':'hoon','ਹੈ':'hai',
        'ਵਿੱਚ':'vich','ਨੂੰ':'nu','ਤੈਨੂੰ':'tainu','ਮੈਨੂੰ':'mainu','ਤੂੰ':'tu','ਤੇਰਾ':'tera','ਤੇਰੀ':'teri','ਤੇਰੇ':'tere','ਮੇਰਾ':'mera','ਮੇਰੀ':'meri','ਮੇਰੇ':'mere',
        'ਦਿਲ':'dil','ਪਿਆਰ':'pyaar','ਇਸ਼ਕ':'ishq','ਇਸ਼ਕ':'ishq','ਰੱਬ':'rabb','ਰਬ':'rab','ਜਾਣੇ':'jaane','ਜਾਨ':'jaan','ਸੋਹਣੀਏ':'sohniye','ਸੋਹਣੀ':'sohni','ਅੱਖ':'akh','ਅੱਖਾਂ':'akhan','ਅੱਖੀਆਂ':'akhiyan',
        'ਬਿਨਾ':'bina','ਜੀਣਾ':'jeena','ਕੀ':'ki','ਚਾਹੁੰਦਾ':'chahunda','ਚਾਹੁੰਦੀ':'chahundi','ਕਦੇ':'kade','ਭੁੱਲਾਂ':'bhullan','ਸੱਜਣਾ':'sajna','ਸੱਜਣ':'sajan','ਮਾਹੀ':'maahi','ਮਾਹੀਆ':'maahiya',
        'ਕੁੜੀ':'kudi','ਕੁੜੀਆਂ':'kudiyan','ਸੰਗੀਤ':'sangeet','ਜ਼ਿੰਦਗੀ':'zindagi','ਜ਼ਿੰਦਗੀ':'zindagi',
        'ਕਹਿੰਦਾ':'kehnda','ਕਹਿੰਦੀ':'kehndi','ਰਹਿੰਦਾ':'rehnda','ਰਹਿੰਦੀ':'rehndi','ਭਰਾ':'bhra',
        'ਗਿਆ':'gaya','ਗਇਆ':'gaya','ਗਈ':'gayi','ਗਏ':'gaye','ਹੋਇਆ':'hoya','ਹੋਈ':'hoi','ਹੋਏ':'hoye',
        'ਕਿਉਂ':'kyun','ਸਾਡੀਆਂ':'saadiyan','ਤੁਹਾਨੂੰ':'tuhanu','ਸਾਨੂੰ':'sanu','ਮੁੰਡਿਆਂ':'mundeyan',
        'ਨੱਚਣਾ':'nachna','ਨੱਚਦਾ':'nachda','ਨੱਚਦੀ':'nachdi','ਸ਼ਹਿਰ':'shehar','ਸ਼ਹਿਰ':'shehar'
    });

    function isGurmukhiWordCharacter(character) {
        if (!character) return false;
        const cp = character.codePointAt(0);
        if (cp === 0x200c || cp === 0x200d) return true;
        if (cp < 0x0a00 || cp > 0x0a7f) return false;
        if (cp >= 0x0a66 && cp <= 0x0a6f) return false;
        return true;
    }

    function gurmukhiTokenizeWord(word) {
        const characters = Array.from(word);
        const tokens = [];
        let index = 0;
        let geminateNext = false;
        let geminateStart = -1;

        while (index < characters.length) {
            const start = index;
            const ch = characters[index];
            if (ch === '\u200c' || ch === '\u200d') { index += 1; continue; }
            if (ch === 'ੱ') {
                geminateNext = true;
                geminateStart = index;
                index += 1;
                continue;
            }

            const independentVowel = GURMUKHI_INDEPENDENT_VOWELS[ch];
            if (independentVowel) {
                tokens.push({
                    kind: 'vowel', consonant: '', vowel: independentVowel,
                    implicit: false, explicit: true, nasal: '',
                    grapheme: ch, sourceStart: start, sourceEnd: start + 1
                });
                index += 1;
                continue;
            }

            let consonant = GURMUKHI_CONSONANTS[ch];
            if (consonant) {
                const hasNukta = characters[index + 1] === '਼';
                if (hasNukta) consonant = GURMUKHI_NUKTA_CONSONANTS[ch] || consonant;
                const token = {
                    kind: 'consonant', consonant, vowel: 'a', implicit: true,
                    explicit: false, nasal: '', geminated: geminateNext, grapheme: ch,
                    sourceStart: geminateNext && geminateStart >= 0 ? geminateStart : start,
                    sourceEnd: index + (hasNukta ? 2 : 1)
                };
                geminateNext = false;
                geminateStart = -1;
                index += hasNukta ? 2 : 1;
                if (characters[index] === '੍') {
                    token.vowel = '';
                    token.implicit = false;
                    token.explicit = true;
                    token.dead = true;
                    index += 1;
                    if (characters[index] === '\u200c' || characters[index] === '\u200d') index += 1;
                    token.sourceEnd = index;
                } else {
                    const sign = GURMUKHI_VOWEL_SIGNS[characters[index]];
                    if (sign) {
                        token.vowel = sign;
                        token.implicit = false;
                        token.explicit = true;
                        index += 1;
                        token.sourceEnd = index;
                    }
                }
                tokens.push(token);
                continue;
            }

            if (ch === 'ਂ' || ch === 'ੰ') {
                if (tokens.length) {
                    tokens[tokens.length - 1].nasal = ch;
                    tokens[tokens.length - 1].sourceEnd = index + 1;
                } else {
                    tokens.push({ kind: 'mark', value: 'n', sourceStart: start, sourceEnd: start + 1 });
                }
                index += 1;
                continue;
            }

            const fallback = asciiMap(ch);
            tokens.push({ kind: 'mark', value: fallback || '', sourceStart: start, sourceEnd: start + 1 });
            index += 1;
        }
        return tokens;
    }

    function gurmukhiTokenChunks(tokens) {
        const consonantIndexes = [];
        tokens.forEach((token, index) => { if (token.kind === 'consonant') consonantIndexes.push(index); });
        const lastConsonantIndex = consonantIndexes.length ? consonantIndexes[consonantIndexes.length - 1] : -1;
        return tokens.map((token, index) => {
            if (token.kind === 'mark') return token.value || '';
            let vowel = token.vowel || '';
            if (token.kind === 'consonant' && index === lastConsonantIndex && vowel === 'aa') vowel = 'a';
            let value = '';
            if (token.geminated && token.consonant) value += token.consonant.charAt(0);
            value += (token.consonant || '') + vowel;
            if (token.nasal) value += devanagariNasalForNext(tokens, index, token.nasal);
            return value;
        });
    }

    function romanizeGurmukhiWordDetailed(word, options = null) {
        const learnedRequested = !!(options && (options.applyLearnedSchwa || options.learnedAdvisor));
        const tokens = applyHindiSchwaDeletion(
            gurmukhiTokenizeWord(word),
            learnedRequested ? { learnedMode: 'punjabi', advisorOnly: !!options.learnedAdvisor } : null
        );
        const chunks = gurmukhiTokenChunks(tokens);
        const baselineValue = normalizeDevanagariLyricRoman(chunks.join(''));
        const baselineMaps = buildIndicWordBoundaryMaps(word, tokens, chunks, baselineValue);
        const override = GURMUKHI_LYRIC_OVERRIDES[word];
        const descriptor = {
            key: 'gurmukhi', script: 'Gurmukhi', language: 'pa', dedicated: true
        };
        const morphologyDecision = override
            ? null
            : morphologyProductionDecision(word, descriptor, baselineMaps);
        const finalValue = override || (morphologyDecision && morphologyDecision.text) || baselineValue;
        const result = finalValue === baselineValue
            ? baselineMaps
            : buildIndicWordBoundaryMaps(word, tokens, chunks, finalValue);
        result.morphologyDecision = morphologyDecision;
        result.lexiconOverride = !!override;
        result.tokens = tokens;
        result.learnedSchwa = tokens.some(token => token && Number.isFinite(token.schwaKeepProbability));
        result.learnedSchwaApplied = tokens.some(token => token && token.schwaDecision && /^LEARNED_/.test(token.schwaDecision.reason || ''));
        result.learnedSchwaMode = learnedRequested ? 'punjabi' : null;
        attachTokenProvenance(result, tokens, chunks);
        return result;
    }

    function romanizeGurmukhiWord(word) {
        const tokens = applyHindiSchwaDeletion(gurmukhiTokenizeWord(word));
        const chunks = gurmukhiTokenChunks(tokens);
        const baselineValue = normalizeDevanagariLyricRoman(chunks.join(''));
        const override = GURMUKHI_LYRIC_OVERRIDES[word];
        if (override) return override;
        const descriptor = {
            key: 'gurmukhi', script: 'Gurmukhi', language: 'pa', dedicated: true
        };
        const productionHints = morphologyProductionHints(word, descriptor);
        if (!productionHints.length) return baselineValue;
        const baselineMaps = buildIndicWordBoundaryMaps(word, tokens, chunks, baselineValue);
        const morphologyDecision = morphologyProductionDecision(
            word, descriptor, baselineMaps, productionHints
        );
        return (morphologyDecision && morphologyDecision.text) || baselineValue;
    }

    function romanizeGurmukhiRun(characters, start) {
        let index = start;
        const parts = [];
        while (index < characters.length && isGurmukhiWordCharacter(characters[index])) {
            parts.push(characters[index]);
            index += 1;
        }
        return { value: romanizeGurmukhiWord(parts.join('')), nextIndex: index };
    }

    /*
     * Lyric-aware Indic engines for the major Indian song scripts.
     *
     * The old generic Brahmic path delegated each code point to ICU. That is
     * useful as a coverage fallback, but it loses the orthographic unit around
     * viramas/matras and produces conspicuously mechanical Malayalam/Tamil
     * output. These configs parse a complete word first, preserving context
     * and source->Roman boundary maps for ELRC timing.
     *
     * The target is readable, common ASCII lyric spelling rather than IAST.
     * Long vowels are intentionally conservative in the Dravidian configs:
     * provider-supplied romanization remains authoritative when present.
     */
    /*
     * LyricG2P Indic core.
     *
     * The renderer wants the spelling a listener would naturally type beside a
     * song, not an academic one-to-one script transform.  Each first-class
     * script therefore owns its vowel-length policy, high-value conjuncts,
     * contextual nasal behaviour and a deliberately small hand-authored lyric
     * lexicon.  The lexicon is only an exception/pronunciation layer; unseen
     * words still pass through the deterministic grapheme-to-phoneme parser.
     */
    const INDIC_LYRIC_CONFIGS = Object.freeze({
        bengali: Object.freeze({
            name: 'bengali-assamese', start: 0x0980, end: 0x09ff, virama: '্', nukta: '়',
            consonants: Object.freeze({
                'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'ny',
                'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n','ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
                'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m','য':'y','য়':'y','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h','ড়':'r','ঢ়':'rh','ৱ':'w','ৰ':'r'
            }),
            independentVowels: Object.freeze({'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','ঋ':'ri','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou'}),
            vowelSigns: Object.freeze({'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ৃ':'ri','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou'}),
            marks: Object.freeze({'ঃ':'h'}), nasalMarks: 'ংঁ', finalNasal: 'ng', inherent: 'o', dropFinalSchwa: true,
            clusters: Object.freeze({'ক্ষ':'ksh','জ্ঞ':'gy','ঙ্ক':'nk','ঙ্গ':'ng','ঞ্চ':'nch','ঞ্জ':'nj','ণ্ট':'nt','ণ্ড':'nd','ন্ত':'nt','ন্দ':'nd','ম্প':'mp','ম্ব':'mb','ত্র':'tr','দ্র':'dr','প্র':'pr','ব্র':'br','ক্র':'kr','গ্র':'gr','শ্র':'shr'}),
            overrides: Object.freeze({
                'বাংলা':'bangla','গান':'gan','অসমীয়া':'asomiya','অসমীয়া':'asomiya','আমি':'ami','তুমি':'tumi','তুই':'tui','সে':'she','ভালোবাসি':'bhalobashi','ভালোবাসা':'bhalobasha',
                'ভালো':'bhalo','প্রেম':'prem','মন':'mon','মনে':'mone','আমার':'amar','তোমার':'tomar','আমাকে':'amake','তোমাকে':'tomake','কেন':'keno','কোথায়':'kothay','কোথায়':'kothay',
                'নেই':'nei','আছে':'ache','ছিল':'chhilo','হয়':'hoy','হয়':'hoy','হৃদয়':'hridoy','হৃদয়':'hridoy','জীবন':'jibon','স্বপ্ন':'shopno','রাত':'raat','চোখ':'chokh','সংগীত':'sangeet','সঙ্গীত':'sangeet','তোমায়':'tomay','তোমায়':'tomay'
            })
        }),
        gujarati: Object.freeze({
            name: 'gujarati', start: 0x0a80, end: 0x0aff, virama: '્', nukta: '઼',
            consonants: Object.freeze({
                'ક':'k','ખ':'kh','ગ':'g','ઘ':'gh','ઙ':'ng','ચ':'ch','છ':'chh','જ':'j','ઝ':'jh','ઞ':'ny',
                'ટ':'t','ઠ':'th','ડ':'d','ઢ':'dh','ણ':'n','ત':'t','થ':'th','દ':'d','ધ':'dh','ન':'n',
                'પ':'p','ફ':'ph','બ':'b','ભ':'bh','મ':'m','ય':'y','ર':'r','લ':'l','ળ':'l','વ':'v','શ':'sh','ષ':'sh','સ':'s','હ':'h'
            }),
            independentVowels: Object.freeze({'અ':'a','આ':'aa','ઇ':'i','ઈ':'ee','ઉ':'u','ઊ':'oo','ઋ':'ri','એ':'e','ઐ':'ai','ઓ':'o','ઔ':'au'}),
            vowelSigns: Object.freeze({'ા':'aa','િ':'i','ી':'ee','ુ':'u','ૂ':'oo','ૃ':'ri','ે':'e','ૈ':'ai','ો':'o','ૌ':'au'}),
            marks: Object.freeze({'ઃ':'h'}), nasalMarks: 'ંઁ', finalNasal: 'n', inherent: 'a', dropFinalSchwa: true,
            clusters: Object.freeze({'ક્ષ':'ksh','જ્ઞ':'gn','ત્ર':'tr','દ્ર':'dr','પ્ર':'pr','બ્ર':'br','ક્ર':'kr','ગ્ર':'gr','શ્ર':'shr','સ્વ':'sw'}),
            overrides: Object.freeze({
                'ગુજરાતી':'gujarati','ગીત':'geet','પ્રેમ':'prem','મારું':'maru','મારો':'maro','મારી':'mari','તારું':'taru','તારો':'taro','તારી':'tari','હું':'hu','છું':'chhu','છે':'chhe',
                'દિલ':'dil','તારા':'tara','માટે':'mate','સફર':'safar','મન':'man','જીવન':'jeevan','સપનું':'sapnu','સપના':'sapna','આંખ':'aankh','આંખો':'aankho','આંખોમાં':'aankhoma','તું':'tu','રાત':'raat','સાથ':'saath','કેમ':'kem','ક્યાં':'kya','નથી':'nathi'
            })
        }),
        odia: Object.freeze({
            name: 'odia', start: 0x0b00, end: 0x0b7f, virama: '୍', nukta: '଼',
            consonants: Object.freeze({
                'କ':'k','ଖ':'kh','ଗ':'g','ଘ':'gh','ଙ':'ng','ଚ':'ch','ଛ':'chh','ଜ':'j','ଝ':'jh','ଞ':'ny',
                'ଟ':'t','ଠ':'th','ଡ':'d','ଢ':'dh','ଣ':'n','ତ':'t','ଥ':'th','ଦ':'d','ଧ':'dh','ନ':'n',
                'ପ':'p','ଫ':'ph','ବ':'b','ଭ':'bh','ମ':'m','ଯ':'y','ୟ':'y','ର':'r','ଲ':'l','ଳ':'l','ୱ':'w','ଶ':'sh','ଷ':'sh','ସ':'s','ହ':'h','ଡ଼':'r','ଢ଼':'rh'
            }),
            independentVowels: Object.freeze({'ଅ':'a','ଆ':'aa','ଇ':'i','ଈ':'ee','ଉ':'u','ଊ':'oo','ଋ':'ri','ଏ':'e','ଐ':'ai','ଓ':'o','ଔ':'au'}),
            vowelSigns: Object.freeze({'ା':'aa','ି':'i','ୀ':'ee','ୁ':'u','ୂ':'oo','ୃ':'ri','େ':'e','ୈ':'ai','ୋ':'o','ୌ':'au'}),
            marks: Object.freeze({'ଃ':'h'}), nasalMarks: 'ଂଁ', finalNasal: 'n', inherent: 'a', dropFinalSchwa: true,
            clusters: Object.freeze({'କ୍ଷ':'ksh','ଜ୍ଞ':'gn','ତ୍ର':'tr','ଦ୍ର':'dr','ପ୍ର':'pr','ବ୍ର':'br','କ୍ର':'kr','ଗ୍ର':'gr','ଶ୍ର':'shr','ସ୍ୱ':'sw'}),
            overrides: Object.freeze({
                'ଓଡ଼ିଆ':'odia','ଓଡିଆ':'odia','ଗୀତ':'geet','ପ୍ରେମ':'prem','ମୁଁ':'mu','ତୁମେ':'tume','ମୋର':'mor','ତୁମର':'tumar','ମନ':'mana','ଜୀବନ':'jeeban','ସ୍ୱପ୍ନ':'swapna','ରାତି':'raati'
            })
        }),
        tamil: Object.freeze({
            name: 'tamil', start: 0x0b80, end: 0x0bff, virama: '்', nukta: '',
            consonants: Object.freeze({
                'க':'k','ங':'ng','ச':'ch','ஜ':'j','ஞ':'nj','ட':'t','ண':'n','த':'th','ந':'n','ன':'n',
                'ப':'p','ம':'m','ய':'y','ர':'r','ற':'r','ல':'l','ள':'l','ழ':'zh','வ':'v','ஶ':'sh','ஷ':'sh','ஸ':'s','ஹ':'h'
            }),
            independentVowels: Object.freeze({'அ':'a','ஆ':'aa','இ':'i','ஈ':'ee','உ':'u','ஊ':'oo','எ':'e','ஏ':'e','ஐ':'ai','ஒ':'o','ஓ':'o','ஔ':'au'}),
            vowelSigns: Object.freeze({'ா':'aa','ி':'i','ீ':'ee','ு':'u','ூ':'oo','ெ':'e','ே':'e','ை':'ai','ொ':'o','ோ':'o','ௌ':'au'}),
            marks: Object.freeze({'ஃ':'h'}), inherent: 'a', tamilVoicing: true,
            clusters: Object.freeze({'ஃப':'f','ங்க':'ng','ஞ்ச':'nj','ண்ட':'nd','ந்த':'ndh','ம்ப':'mb','ன்ற':'ndr','ற்ற':'tr','க்க':'kk','ச்ச':'ch','ட்ட':'tt','த்த':'th','ப்ப':'pp','ள்ள':'ll','ல்ல':'ll','ன்ன':'nn','ண்ண':'nn'}),
            overrides: Object.freeze({
                'வணக்கம்':'vanakkam','காதலே':'kaadhale','காதல்':'kaadhal','தமிழ்':'tamil','என்னை':'ennai','உன்னை':'unnai','நீ':'nee','நான்':'naan','என்':'en','உன்':'un','உயிரே':'uyire',
                'அன்பே':'anbe','அன்பு':'anbu','கண்ணே':'kanne','கண்ணில்':'kannil','இதயம்':'idhayam','மனம்':'manam','மழை':'mazhai','நிலா':'nilaa','இரவு':'iravu','எங்கே':'enge','ஏன்':'yen',
                'வேண்டும்':'vendum','இல்லை':'illai','ஒரு':'oru','என்ன':'enna','உலகம்':'ulagam','பாட்டு':'paattu','பாடல்':'paadal','காதலிக்கிறேன்':'kaadhalikkiren',
                'சொல்லு':'sollu','சொல்ல':'solla','சொன்னேன்':'sonnen','சொன்னாய்':'sonnaai'
            })
        }),
        telugu: Object.freeze({
            name: 'telugu', start: 0x0c00, end: 0x0c7f, virama: '్', nukta: '',
            consonants: Object.freeze({
                'క':'k','ఖ':'kh','గ':'g','ఘ':'gh','ఙ':'ng','చ':'ch','ఛ':'chh','జ':'j','ఝ':'jh','ఞ':'ny',
                'ట':'t','ఠ':'th','డ':'d','ఢ':'dh','ణ':'n','త':'t','థ':'th','ద':'d','ధ':'dh','న':'n',
                'ప':'p','ఫ':'ph','బ':'b','భ':'bh','మ':'m','య':'y','ర':'r','ఱ':'r','ల':'l','ళ':'l','వ':'v','శ':'sh','ష':'sh','స':'s','హ':'h'
            }),
            independentVowels: Object.freeze({'అ':'a','ఆ':'aa','ఇ':'i','ఈ':'ee','ఉ':'u','ఊ':'oo','ఋ':'ri','ౠ':'ri','ఎ':'e','ఏ':'e','ఐ':'ai','ఒ':'o','ఓ':'o','ఔ':'au'}),
            vowelSigns: Object.freeze({'ా':'aa','ి':'i','ీ':'ee','ు':'u','ూ':'oo','ృ':'ri','ౄ':'ri','ె':'e','ే':'e','ై':'ai','ొ':'o','ో':'o','ౌ':'au'}),
            marks: Object.freeze({'ః':'h'}), nasalMarks: 'ఀఁం', finalNasal: 'm', inherent: 'a', anusvaraContinuantM: true,
            clusters: Object.freeze({'క్ష':'ksh','జ్ఞ':'gn','త్ర':'tr','ద్ర':'dr','ప్ర':'pr','బ్ర':'br','క్ర':'kr','గ్ర':'gr','శ్ర':'shr','స్వ':'sw'}),
            overrides: Object.freeze({
                'తెలుగు':'telugu','పాట':'paata','పాటలు':'paatalu','ప్రేమ':'prema','నిన్ను':'ninnu','నిన్న':'ninna','నాకు':'naaku','నీకు':'neeku','నేను':'nenu','నువ్వు':'nuvvu','నీవు':'neevu',
                'ప్రేమిస్తున్నాను':'premistunnaanu','ప్రేమిస్తున్నా':'premistunnaa','మనసు':'manasu','గుండె':'gunde','కన్నుల్లో':'kannullo','కళ్ళు':'kallu','కల':'kala','రాత్రి':'raathri','వెన్నెల':'vennela',
                'ఎందుకు':'enduku','ఎక్కడ':'ekkada','లేదు':'ledu','ఉంది':'undi','ఉన్నావు':'unnaavu','నా':'naa','నీ':'nee','ఓ':'o','చెలియా':'cheliyaa','హృదయం':'hrudayam','హృదయంలో':'hrudayamlo','కళ్లు':'kallu','కళ్లలో':'kallalo'
            })
        }),
        kannada: Object.freeze({
            name: 'kannada', start: 0x0c80, end: 0x0cff, virama: '್', nukta: '',
            consonants: Object.freeze({
                'ಕ':'k','ಖ':'kh','ಗ':'g','ಘ':'gh','ಙ':'ng','ಚ':'ch','ಛ':'chh','ಜ':'j','ಝ':'jh','ಞ':'ny',
                'ಟ':'t','ಠ':'th','ಡ':'d','ಢ':'dh','ಣ':'n','ತ':'t','ಥ':'th','ದ':'d','ಧ':'dh','ನ':'n',
                'ಪ':'p','ಫ':'ph','ಬ':'b','ಭ':'bh','ಮ':'m','ಯ':'y','ರ':'r','ಱ':'r','ಲ':'l','ಳ':'l','ವ':'v','ಶ':'sh','ಷ':'sh','ಸ':'s','ಹ':'h'
            }),
            independentVowels: Object.freeze({'ಅ':'a','ಆ':'aa','ಇ':'i','ಈ':'ee','ಉ':'u','ಊ':'oo','ಋ':'ri','ೠ':'ri','ಎ':'e','ಏ':'e','ಐ':'ai','ಒ':'o','ಓ':'o','ಔ':'au'}),
            vowelSigns: Object.freeze({'ಾ':'aa','ಿ':'i','ೀ':'ee','ು':'u','ೂ':'oo','ೃ':'ri','ೄ':'ri','ೆ':'e','ೇ':'e','ೈ':'ai','ೊ':'o','ೋ':'o','ೌ':'au'}),
            marks: Object.freeze({'ಃ':'h'}), nasalMarks: 'ಁಂ', finalNasal: 'm', inherent: 'a', anusvaraContinuantM: true,
            clusters: Object.freeze({'ಕ್ಷ':'ksh','ಜ್ಞ':'gn','ತ್ರ':'tr','ದ್ರ':'dr','ಪ್ರ':'pr','ಬ್ರ':'br','ಕ್ರ':'kr','ಗ್ರ':'gr','ಶ್ರ':'shr','ಸ್ವ':'sw'}),
            overrides: Object.freeze({
                'ಕನ್ನಡ':'kannada','ಹಾಡು':'haadu','ಹಾಡುಗಳು':'haadugalu','ಪ್ರೀತಿ':'preeti','ನಿನ್ನ':'ninna','ನಿನ್ನನ್ನು':'ninnannu','ನಾನು':'naanu','ನೀನು':'neenu','ನನ್ನ':'nanna',
                'ಪ್ರೀತಿಸುತ್ತೇನೆ':'preetisuttene','ಮನಸು':'manasu','ಹೃದಯ':'hrudaya','ಕಣ್ಣು':'kannu','ಕಣ್ಣಲ್ಲಿ':'kannalli','ಕನಸು':'kanasu','ರಾತ್ರಿ':'raathri','ಬೆಳಕು':'belaku','ಏಕೆ':'eke','ಎಲ್ಲಿ':'elli','ಇಲ್ಲ':'illa','ನನ್ನೆದುರು':'nanneduru'
            })
        }),
        malayalam: Object.freeze({
            name: 'malayalam', start: 0x0d00, end: 0x0d7f, virama: '്', nukta: '',
            consonants: Object.freeze({
                'ക':'k','ഖ':'kh','ഗ':'g','ഘ':'gh','ങ':'ng','ച':'ch','ഛ':'chh','ജ':'j','ഝ':'jh','ഞ':'nj',
                'ട':'t','ഠ':'th','ഡ':'d','ഢ':'dh','ണ':'n','ത':'th','ഥ':'th','ദ':'d','ധ':'dh','ന':'n',
                'പ':'p','ഫ':'ph','ബ':'b','ഭ':'bh','മ':'m','യ':'y','ര':'r','റ':'r','ല':'l','ള':'l','ഴ':'zh','വ':'v','ശ':'sh','ഷ':'sh','സ':'s','ഹ':'h'
            }),
            independentVowels: Object.freeze({'അ':'a','ആ':'aa','ഇ':'i','ഈ':'ee','ഉ':'u','ഊ':'oo','ഋ':'ri','എ':'e','ഏ':'e','ഐ':'ai','ഒ':'o','ഓ':'o','ഔ':'au'}),
            vowelSigns: Object.freeze({'ാ':'aa','ി':'i','ീ':'ee','ു':'u','ൂ':'oo','ൃ':'ri','െ':'e','േ':'e','ൈ':'ai','ൊ':'o','ോ':'o','ൌ':'au','ൗ':'au'}),
            marks: Object.freeze({'ഃ':'h'}), nasalMarks: 'ഁം', finalNasal: 'm',
            terminalConsonants: Object.freeze({'ൺ':'n','ൻ':'n','ർ':'r','ൽ':'l','ൾ':'l','ൿ':'k'}),
            inherent: 'a', malayalamStyle: true, malayalamContextVoicing: true, anusvaraContinuantM: true,
            clusters: Object.freeze({
                'റ്റ':'tt','ന്റ':'nt','ണ്ട':'nd','ണ്ണ':'nn','ന്ന':'nn','ള്ള':'ll','ല്ല':'ll','ക്ക':'kk','ങ്ങ':'ng','ച്ച':'ch','ച്ഛ':'ch','ഞ്ഞ':'nj','ഞ്ച':'nch','മ്പ':'mp','മ്മ':'mm','പ്പ':'pp','ത്ത':'th','ദ്ദ':'dd','വ്വ':'vv',
                'ക്ഷ':'ksh','ജ്ഞ':'jn','ത്ര':'thr','ദ്ര':'dr','പ്ര':'pr','ബ്ര':'br','ക്ര':'kr','ഗ്ര':'gr','ശ്ര':'shr','സ്വ':'sw','ദ്വ':'dw','ത്വ':'thw'
            }),
            overrides: Object.freeze({
                'ഓമലേ':'o male','പുലരികളേ':'pularikale','മറഞ്ഞു':'maranju','പോയത്':'poyathu','പോയതോ':'poyatho','എങ്ങനെ':'engane',
                'നിനക്കായി':'ninakkayi','കരുതി':'karuthi','ജനലിൽ':'janalil','എന്നും':'ennum','കാതോർത്തിരുന്നു':'kathorthirunnu',
                'എവിടെയോ':'evideyo','ഒതുങ്ങി':'othungi','നിന്നോ':'ninno','വെറുമൊരു':'verumoru','സ്വപ്നമായി':'swapnamayi',
                'ചിരിയായി':'chiriyayi','കഥയായി':'kadhayayi','മലയാളം':'malayalam','പ്രണയം':'pranayam','സ്നേഹം':'sneham',
                'കാറ്റിൻ':'kaattin','തൂവൽ':'thooval','പോലെ':'pole','മെല്ലെ':'melle','തഴുകാനേ':'thazhukaane','മോഹം':'moham','പൂത്തെൻ':'poothen','നെഞ്ചിനുള്ളിൽ':'nenjinullil','മഴ':'mazha',
                'അവളുടെ':'avalude','കരിമഷി':'karimashi','മിഴി':'mizhi','ഉണ്ടല്ലോ':'undallo','മിഴികളിൽ':'mizhikalil','നിറയുന്ന':'nirayunna','മൊഴിയുണ്ടല്ലോ':'mozhiyundallo',
                'മറുപടി':'marupadi','പറയുവാൻ':'parayuvaan','മടിയുണ്ടല്ലോ':'madiyundallo','നിന്റെ':'ninte','നുണക്കുഴി':'nunakkuzhi','കണ്ടപ്പോ':'kandappo','അടിവയറ്റിൽ':'adivayattil','മഞ്ഞുള്ള':'manjulla','രാത്രി':'raathri','ചിരിയതു':'chiriyathu',
                'നിന്നെ':'ninne','കാണാൻ':'kaanaan','എന്റെ':'ente','ഹൃദയം':'hridayam','പ്രണയമേ':'pranayame','പെയ്യുന്നു':'peyyunnu','കണ്ണുകളിൽ':'kannukalil','ഒരിക്കലും':'orikkalum','മറക്കില്ല':'marakkilla','എവിടെ':'evide','രാവിൽ':'raavil','സംഗീതം':'sangeetham','മനോഹരം':'manoharam'
            })
        })
    });

    const INDIC_LYRIC_CONFIG_LIST = Object.freeze(Object.keys(INDIC_LYRIC_CONFIGS).map(key => INDIC_LYRIC_CONFIGS[key]));
    const INDIC_CLUSTER_KEYS = new Map(
        INDIC_LYRIC_CONFIG_LIST.map(config => [
            config,
            Object.keys(config.clusters || {}).sort((a, b) => Array.from(b).length - Array.from(a).length)
        ])
    );

    function configuredIndicForCodePoint(cp) {
        for (let i = 0; i < INDIC_LYRIC_CONFIG_LIST.length; i += 1) {
            const config = INDIC_LYRIC_CONFIG_LIST[i];
            if (cp >= config.start && cp <= config.end) return config;
        }
        return null;
    }

    function isConfiguredIndicWordCharacter(character, config) {
        if (!character || !config) return false;
        const cp = character.codePointAt(0);
        if (cp === 0x200c || cp === 0x200d) return true;
        if (cp < config.start || cp > config.end) return false;
        /* Script digits and danda-like punctuation terminate a lyric word. */
        const offset = cp - config.start;
        if ((offset >= 0x66 && offset <= 0x6f) || offset === 0x64 || offset === 0x65) return false;
        return true;
    }

    function indicConsonantValue(characters, index, config) {
        const ch = characters[index];
        if (!ch) return null;
        const terminal = config.terminalConsonants && config.terminalConsonants[ch];
        if (terminal) return { value: terminal, nextIndex: index + 1, terminal: true };
        let value = config.consonants[ch] || '';
        if (!value) return null;
        let nextIndex = index + 1;
        if (config.nukta && characters[nextIndex] === config.nukta) {
            const combined = ch + config.nukta;
            value = config.consonants[combined] || value;
            nextIndex += 1;
        }
        return { value, nextIndex, terminal: false };
    }

    function configuredIndicClusterAt(characters, index, config) {
        const keys = INDIC_CLUSTER_KEYS.get(config) || [];
        for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
            const source = keys[keyIndex];
            const sourceCharacters = Array.from(source);
            if (index + sourceCharacters.length > characters.length) continue;
            let matches = true;
            for (let offset = 0; offset < sourceCharacters.length; offset += 1) {
                if (characters[index + offset] !== sourceCharacters[offset]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                return {
                    value: config.clusters[source],
                    source,
                    nextIndex: index + sourceCharacters.length
                };
            }
        }
        return null;
    }

    function configuredIndicTokenizeWord(word, config) {
        const characters = Array.from(word.normalize ? word.normalize('NFC') : word);
        const tokens = [];
        let index = 0;
        while (index < characters.length) {
            const start = index;
            const ch = characters[index];
            if (ch === '\u200c' || ch === '\u200d') { index += 1; continue; }

            const independent = config.independentVowels[ch];
            if (independent !== undefined) {
                tokens.push({kind:'vowel', consonant:'', vowel:independent, implicit:false, explicit:true, grapheme:ch, sourceStart:start, sourceEnd:start+1});
                index += 1;
                continue;
            }

            const cluster = configuredIndicClusterAt(characters, index, config);
            if (cluster) {
                const token = {
                    kind:'consonant', consonant:cluster.value, vowel:config.inherent,
                    implicit:true, explicit:false, dead:false, cluster:true, grapheme:cluster.source,
                    sourceStart:start, sourceEnd:cluster.nextIndex
                };
                index = cluster.nextIndex;
                const sign = config.vowelSigns[characters[index]];
                if (sign !== undefined) {
                    token.vowel = sign;
                    token.implicit = false;
                    token.explicit = true;
                    index += 1;
                    token.sourceEnd = index;
                } else if (characters[index] === config.virama) {
                    token.vowel = '';
                    token.implicit = false;
                    token.explicit = true;
                    token.dead = true;
                    index += 1;
                    if (characters[index] === '\u200c' || characters[index] === '\u200d') {
                        token.joiner = characters[index];
                        index += 1;
                    }
                    token.finalVirama = index >= characters.length;
                    token.sourceEnd = index;
                }
                tokens.push(token);
                continue;
            }

            const info = indicConsonantValue(characters, index, config);
            if (info) {
                const token = {kind:'consonant', consonant:info.value, vowel:info.terminal ? '' : config.inherent, implicit:!info.terminal, explicit:!!info.terminal, dead:!!info.terminal, grapheme:characters.slice(start, info.nextIndex).join(''), sourceStart:start, sourceEnd:info.nextIndex};
                index = info.nextIndex;
                if (!info.terminal && characters[index] === config.virama) {
                    token.vowel = '';
                    token.implicit = false;
                    token.explicit = true;
                    token.dead = true;
                    index += 1;
                    if (characters[index] === '\u200c' || characters[index] === '\u200d') {
                        token.joiner = characters[index];
                        index += 1;
                    }
                    token.finalVirama = index >= characters.length;
                    token.sourceEnd = index;
                } else if (!info.terminal) {
                    const sign = config.vowelSigns[characters[index]];
                    if (sign !== undefined) {
                        token.vowel = sign;
                        token.implicit = false;
                        token.explicit = true;
                        index += 1;
                        token.sourceEnd = index;
                    }
                }
                tokens.push(token);
                continue;
            }

            if (config.nasalMarks && config.nasalMarks.indexOf(ch) >= 0) {
                if (tokens.length) {
                    const token = tokens[tokens.length - 1];
                    token.nasal = (token.nasal || '') + ch;
                    token.sourceEnd = index + 1;
                } else {
                    tokens.push({kind:'mark', value:config.finalNasal || 'n', sourceStart:start, sourceEnd:start+1});
                }
                index += 1;
                continue;
            }

            const mark = config.marks && config.marks[ch];
            if (mark !== undefined) {
                if (tokens.length) {
                    tokens[tokens.length - 1].postfix = (tokens[tokens.length - 1].postfix || '') + mark;
                    tokens[tokens.length - 1].sourceEnd = index + 1;
                } else {
                    tokens.push({kind:'mark', value:mark, sourceStart:start, sourceEnd:start+1});
                }
                index += 1;
                continue;
            }

            const fallback = asciiMap(ch);
            tokens.push({kind:'mark', value:fallback || '', sourceStart:start, sourceEnd:start+1});
            index += 1;
        }
        return tokens;
    }

    function applyConfiguredIndicSchwa(tokens, config) {
        if (!config.dropFinalSchwa) return tokens;
        const result = tokens.map(token => Object.assign({}, token));
        for (let i = result.length - 1; i >= 0; i -= 1) {
            const token = result[i];
            if (token.kind !== 'consonant') continue;
            if (token.implicit && token.vowel === config.inherent) token.vowel = '';
            break;
        }
        return result;
    }

    function previousSpokenToken(tokens, index) {
        for (let i = index - 1; i >= 0; i -= 1) {
            if (tokens[i].kind === 'consonant' || tokens[i].kind === 'vowel') return tokens[i];
        }
        return null;
    }

    function nextSpokenConsonant(tokens, index) {
        for (let i = index + 1; i < tokens.length; i += 1) {
            if (tokens[i].kind === 'consonant') return tokens[i].consonant || '';
            if (tokens[i].kind === 'vowel') return '';
        }
        return '';
    }

    function tamilContextConsonant(tokens, index, consonant) {
        const token = tokens[index];
        if (!token || token.dead || token.cluster) return consonant;
        const previous = previousSpokenToken(tokens, index);
        if (!previous) return consonant;

        /* A preceding dead copy marks a true doubled/fortis consonant. */
        if (
            previous.kind === 'consonant'
            && previous.dead
            && previous.consonant === consonant
        ) return consonant;

        const previousNasal = previous.kind === 'consonant'
            && /^(?:m|n|ng|nj)$/.test(previous.consonant || '');
        const vocalicLeft = previous.kind === 'vowel'
            || (previous.kind === 'consonant' && !!previous.vowel);
        if (!previousNasal && !vocalicLeft) return consonant;

        if (consonant === 'k') return 'g';
        if (consonant === 't') return 'd';
        if (consonant === 'th') return 'dh';
        if (consonant === 'p') return 'b';
        if (consonant === 'ch') return previousNasal ? 'j' : 's';
        return consonant;
    }

    /*
     * Malayalam lyric orthography is not a literal ISO transliteration.
     *
     * LyricG2P v4 treated every native ട as permanently "t". In ordinary
     * lyric words a singleton medial ട in a vocalic environment is written
     * naturally as "d" (ഇടി -> idi, പേടി -> pedi, വാടി -> vaadi).
     * Keep the rule deliberately narrow: clusters/geminates stay fortis,
     * word-initial ട stays t, and the other stop rows retain their established
     * lyric spellings instead of becoming over-phonetic.
     */
    function malayalamContextConsonant(tokens, index, consonant) {
        const token = tokens[index];
        if (!token || token.cluster || token.grapheme !== 'ട') return consonant;
        const finalShortU = token.dead && token.finalVirama;
        if (token.dead && !finalShortU) return consonant;
        if (!token.vowel && !finalShortU) return consonant;

        const previous = previousSpokenToken(tokens, index);
        if (!previous) return consonant;

        const vocalicLeft = previous.kind === 'vowel'
            || (previous.kind === 'consonant' && !!previous.vowel);
        if (!vocalicLeft) return consonant;

        return consonant === 't' ? 'd' : consonant;
    }

    /*
     * Malayalam's word-final chandrakkala frequently carries a short /u/ in
     * native lyric words. Restore it only in high-confidence native endings:
     * common native/geminate clusters, a small set of native final consonants,
     * or a same-consonant geminate encoded as two tokens. This fixes forms such
     * as -ന്ന് -> -nnu, ഇത് -> ithu and -ട് -> -du without blindly appending
     * a vowel to every modern loanword or Sanskrit-style conjunct.
     */
    function malayalamFinalShortU(tokens, index) {
        const token = tokens[index];
        if (!token || !token.finalVirama) return '';
        if (token.joiner === '\u200d' || token.joiner === '\u200c') return '';
        if (
            token.cluster
            && /^(?:റ്റ|ന്റ|ണ്ട|ണ്ണ|ന്ന|ള്ള|ല്ല|ക്ക|ങ്ങ|ച്ച|ച്ഛ|ഞ്ഞ|ഞ്ച|മ്പ|മ്മ|പ്പ|ത്ത|ദ്ദ|വ്വ)$/u.test(token.grapheme || '')
        ) return 'u';

        /* Native word endings commonly written with bare chandrakkala.  Pure
         * dead consonants are normally represented by chillus where available;
         * these letters therefore have a high-confidence lyric short-u reading
         * at the end of a word. */
        if (/^[ടതണനരറലള]$/u.test(token.grapheme || '')) return 'u';

        /* Orthographic geminates that were not captured as a predeclared
         * cluster (for example സ്സ് or ട്ട) are two same consonant tokens. */
        const previous = previousSpokenToken(tokens, index);
        if (
            previous
            && previous.kind === 'consonant'
            && previous.dead
            && previous.consonant === token.consonant
        ) return 'u';

        return '';
    }

    function configuredIndicNasal(tokens, index, config) {
        const next = nextSpokenConsonant(tokens, index);
        if (!next) return config.finalNasal || 'n';
        /* The following consonant supplies its own k/g/ch/etc.  Returning
         * plain n here yields the familiar lyric spellings nk/ng/nch rather
         * than mechanical ngk/ngg clusters. */
        if (/^(?:p|ph|b|bh|m)/.test(next)) return 'm';
        if (config.anusvaraContinuantM && /^(?:v|y|r|l|s|sh|h)/.test(next)) return 'm';
        return 'n';
    }

    function isVocalicEnvironmentToken(token) {
        return !!(token && (token.kind === 'vowel' || (token.kind === 'consonant' && !!token.vowel)));
    }

    function isNasalToken(token) {
        return !!(token && token.kind === 'consonant' && /^(?:m|n|ng|nj|ny)$/i.test(token.consonant || ''));
    }

    function malayalamPhoneticConsonant(tokens, index, consonant) {
        const token = tokens[index];
        if (!token || token.kind !== 'consonant' || token.cluster || token.dead) return consonant;
        const previous = previousSpokenToken(tokens, index);
        if (!isVocalicEnvironmentToken(previous) && !isNasalToken(previous)) return consonant;
        const grapheme = token.grapheme || '';
        if (grapheme === 'ക' && consonant === 'k') return 'g';
        if (grapheme === 'ച' && consonant === 'ch') return 'j';
        if (grapheme === 'ട' && consonant === 't') return 'd';
        if (grapheme === 'ത' && consonant === 'th') return 'd';
        if (grapheme === 'പ' && consonant === 'p') return 'b';
        return consonant;
    }

    function configuredIndicSurfaceToken(tokens, index, config) {
        const token = tokens[index];
        if (!token) return { displayOnset: '', phoneticOnset: '', nucleus: '', nasal: '', romanChunk: '', phoneticChunk: '', rules: [] };
        if (token.kind === 'mark') {
            return { displayOnset: '', phoneticOnset: '', nucleus: '', nasal: '', romanChunk: token.value || '', phoneticChunk: token.value || '', rules: [] };
        }
        const rules = [];
        const baseOnset = token.consonant || '';
        let displayOnset = baseOnset;
        let phoneticOnset = baseOnset;
        if (config.tamilVoicing && token.kind === 'consonant') {
            const adjusted = tamilContextConsonant(tokens, index, baseOnset);
            if (adjusted !== baseOnset) {
                displayOnset = adjusted;
                phoneticOnset = adjusted;
                rules.push('TA_CONTEXTUAL_STOP_REALIZATION');
            }
        }
        if (config.malayalamContextVoicing && token.kind === 'consonant') {
            const phonetic = malayalamPhoneticConsonant(tokens, index, baseOnset);
            if (phonetic !== baseOnset) {
                phoneticOnset = phonetic;
                rules.push('ML_SINGLETON_STOP_VOICING');
            }
            const lyricAdjusted = malayalamContextConsonant(tokens, index, baseOnset);
            if (lyricAdjusted !== baseOnset) {
                displayOnset = lyricAdjusted;
                rules.push('ML_LYRIC_RETROFLEX_VOICING');
            }
        }
        let nucleus = token.vowel || '';
        if (config.malayalamStyle && token.dead && token.finalVirama) {
            const restored = malayalamFinalShortU(tokens, index);
            if (restored) { nucleus = restored; rules.push('ML_FINAL_SHORT_U'); }
        }
        let nasal = '';
        if (token.nasal) { nasal = configuredIndicNasal(tokens, index, config); rules.push('INDIC_CONTEXTUAL_NASAL'); }
        const postfix = token.postfix || '';
        return {
            displayOnset, phoneticOnset, nucleus, nasal, postfix,
            romanChunk: displayOnset + nucleus + nasal + postfix,
            phoneticChunk: phoneticOnset + nucleus + nasal + postfix,
            rules
        };
    }

    function configuredIndicTokenChunks(tokens, config) {
        return tokens.map((token, index) => configuredIndicSurfaceToken(tokens, index, config).romanChunk);
    }

    function normalizeConfiguredIndicRoman(value, config) {
        let result = String(value || '');
        if (config.malayalamStyle) {
            result = result
                .replace(/ngng/g, 'ng')
                .replace(/ngg/g, 'ng')
                .replace(/njnj/g, 'nj')
                .replace(/njch/g, 'nch')
                .replace(/sv/g, 'sw')
                .replace(/thw/g, 'thw')
                .replace(/([aeiou])y([aeiou])/g, '$1y$2');
        }
        if (config.name === 'tamil') {
            result = result
                .replace(/ngg/g, 'ng')
                .replace(/njj/g, 'nj')
                .replace(/mbb/g, 'mb')
                .replace(/nddh/g, 'ndh')
                .replace(/nndr/g, 'ndr');
        }
        return result
            .replace(/([aeiou])\1\1+/g, '$1$1')
            .replace(/-{2,}/g, '-');
    }

    function romanizeConfiguredIndicWordDetailed(word, config) {
        const tokens = applyConfiguredIndicSchwa(configuredIndicTokenizeWord(word, config), config);
        const chunks = configuredIndicTokenChunks(tokens, config);
        const baseline = normalizeConfiguredIndicRoman(chunks.join(''), config);
        const baselineMaps = buildIndicWordBoundaryMaps(word, tokens, chunks, baseline);
        const override = config.overrides && config.overrides[word];
        const descriptor = descriptorForConfiguredIndic(config);
        const morphologyDecision = override
            ? null
            : morphologyProductionDecision(word, descriptor, baselineMaps);
        const finalValue = override || (morphologyDecision && morphologyDecision.text) || baseline;
        const result = finalValue === baseline
            ? baselineMaps
            : buildIndicWordBoundaryMaps(word, tokens, chunks, finalValue);
        result.morphologyDecision = morphologyDecision;
        result.lexiconOverride = !!override;
        attachTokenProvenance(result, tokens, chunks);
        return result;
    }

    function romanizeConfiguredIndicWord(word, config) {
        const tokens = applyConfiguredIndicSchwa(configuredIndicTokenizeWord(word, config), config);
        const chunks = configuredIndicTokenChunks(tokens, config);
        const baseline = normalizeConfiguredIndicRoman(chunks.join(''), config);
        const override = config.overrides && config.overrides[word];
        if (override) return override;
        const descriptor = descriptorForConfiguredIndic(config);
        const productionHints = morphologyProductionHints(word, descriptor);
        if (!productionHints.length) return baseline;
        const baselineMaps = buildIndicWordBoundaryMaps(word, tokens, chunks, baseline);
        const morphologyDecision = morphologyProductionDecision(
            word, descriptor, baselineMaps, productionHints
        );
        return (morphologyDecision && morphologyDecision.text) || baseline;
    }

    function romanizeConfiguredIndicRun(characters, start, config) {
        let index = start;
        const parts = [];
        while (index < characters.length && isConfiguredIndicWordCharacter(characters[index], config)) {
            parts.push(characters[index]);
            index += 1;
        }
        return { value: romanizeConfiguredIndicWord(parts.join(''), config), nextIndex:index };
    }

    function romanizeBrahmicRun(characters, start, base) {
        let index = start;
        let out = '';
        let geminateNext = false;

        while (index < characters.length) {
            const ch = characters[index];
            const cp = ch.codePointAt(0);
            if (brahmicBase(cp) !== base) break;

            /* Gurmukhi addak doubles the following consonant. */
            if (cp === 0x0a71) {
                geminateNext = true;
                index += 1;
                continue;
            }

            const extraMark = BRAHMIC_EXTRA_MARKS[cp.toString(16).toUpperCase()];
            if (extraMark) {
                out += extraMark;
                index += 1;
                continue;
            }

            if (isBrahmicConsonant(cp, base)) {
                const mapped = asciiMap(ch) || ch;
                const stem = consonantStem(mapped);
                if (geminateNext) {
                    out += stem;
                    geminateNext = false;
                }
                let probe = index + 1;

                if (probe < characters.length && isBrahmicNukta(characters[probe].codePointAt(0), base)) {
                    probe += 1;
                }

                if (probe < characters.length && isBrahmicVirama(characters[probe].codePointAt(0), base)) {
                    out += stem;
                    index = probe + 1;
                    continue;
                }

                if (probe < characters.length && isBrahmicVowelSign(characters[probe].codePointAt(0), base)) {
                    const vowel = asciiMap(characters[probe]) || '';
                    out += stem + vowel;
                    index = probe + 1;
                    continue;
                }

                out += mapped;
                index += 1;
                continue;
            }

            if (isBrahmicVirama(cp, base) || isBrahmicNukta(cp, base)) {
                index += 1;
                continue;
            }

            out += asciiMap(ch) || fallbackRoman(ch);
            index += 1;
        }

        return { value: out, nextIndex: index };
    }

    const SINHALA_INDEPENDENT_VOWELS = Object.freeze({
        'D85':'a','D86':'aa','D87':'ae','D88':'aae','D89':'i','D8A':'ii',
        'D8B':'u','D8C':'uu','D8D':'r','D8E':'rr','D8F':'l','D90':'ll',
        'D91':'e','D92':'ee','D93':'ai','D94':'o','D95':'oo','D96':'au'
    });
    const SINHALA_CONSONANTS = Object.freeze({
        'D9A':'ka','D9B':'kha','D9C':'ga','D9D':'gha','D9E':'nga','D9F':'nga',
        'DA0':'ca','DA1':'cha','DA2':'ja','DA3':'jha','DA4':'nya','DA5':'nya','DA6':'nja',
        'DA7':'ta','DA8':'tha','DA9':'da','DAA':'dha','DAB':'na','DAC':'nda',
        'DAD':'ta','DAE':'tha','DAF':'da','DB0':'dha','DB1':'na','DB3':'nda',
        'DB4':'pa','DB5':'pha','DB6':'ba','DB7':'bha','DB8':'ma','DB9':'mba',
        'DBA':'ya','DBB':'ra','DBD':'la','DC0':'va','DC1':'sha','DC2':'sha',
        'DC3':'sa','DC4':'ha','DC5':'la','DC6':'fa'
    });
    const SINHALA_VOWEL_SIGNS = Object.freeze({
        'DCF':'aa','DD0':'ae','DD1':'aae','DD2':'i','DD3':'ii','DD4':'u','DD6':'uu',
        'DD8':'r','DD9':'e','DDA':'ee','DDB':'ai','DDC':'o','DDD':'oo','DDE':'au','DDF':'l'
    });

    function romanizeSinhalaRun(characters, start) {
        let index = start;
        let out = '';
        while (index < characters.length) {
            const ch = characters[index];
            const cp = ch.codePointAt(0);
            if (cp < 0x0d80 || cp > 0x0dff) break;
            const key = cp.toString(16).toUpperCase();

            if (cp === 0x0d82) { out += 'n'; index += 1; continue; }
            if (cp === 0x0d83) { out += 'h'; index += 1; continue; }

            const independent = SINHALA_INDEPENDENT_VOWELS[key];
            if (independent) { out += independent; index += 1; continue; }

            const consonant = SINHALA_CONSONANTS[key];
            if (consonant) {
                const stem = consonantStem(consonant);
                const next = characters[index + 1];
                const nextCp = next ? next.codePointAt(0) : 0;
                const nextKey = nextCp.toString(16).toUpperCase();
                if (nextCp === 0x0dca) {
                    out += stem;
                    index += 2;
                    continue;
                }
                const vowel = SINHALA_VOWEL_SIGNS[nextKey];
                if (vowel) {
                    out += stem + vowel;
                    index += 2;
                    continue;
                }
                out += consonant;
                index += 1;
                continue;
            }

            /* Stray vowel signs/virama are formatting marks, not visible Latin text. */
            if (SINHALA_VOWEL_SIGNS[key] || cp === 0x0dca) {
                index += 1;
                continue;
            }

            const fallback = asciiMap(ch);
            if (fallback) out += fallback;
            index += 1;
        }
        return { value: out, nextIndex: index };
    }


    /*
     * LyricG2P 6.6 scripted-English recovery.
     *
     * Lyric providers frequently publish English lyrics phonetically in an
     * Indic script (for example "आई मेट अ बॉय" for "I met a boy"). A normal
     * transliterator cannot recover English spelling because the script stores
     * pronunciation, not the original English graphemes. This layer therefore
     * runs after the native G2P pass and treats its Latin output as a phonetic
     * observation.
     *
     * Safety is intentionally line-contextual. Native words never switch to
     * English merely because they resemble an English pronunciation. Two
     * nearby independent English anchors are required, curated native lyric
     * lexicon entries are protected, and only a small set of genuinely
     * ambiguous function forms (आई/I, इस/is, से/say, etc.) may switch once an
     * English run has already been established.
     *
     * The compact pronunciation signatures below are generated from a curated
     * common-English/song vocabulary using CMU Pronouncing Dictionary phones.
     * Only the derived signatures needed at runtime are bundled; no model,
     * network lookup or dictionary parser is required in the browser.
     */
    const INDIC_ENGLISH_RECOVERY_SCRIPT_KEYS = Object.freeze(new Set([
        'devanagari', 'gurmukhi', 'bengali', 'gujarati', 'odia',
        'tamil', 'telugu', 'kannada', 'malayalam'
    ]));

    const DEVANAGARI_ENGLISH_CONTEXT_CONVERTIBLE = Object.freeze(new Set([
        'आई', 'आइ', 'अ', 'इस', 'से'
    ]));

    const DEVANAGARI_NATIVE_GUARD_WORDS = Object.freeze(new Set([
        'का','की','के','को','से','में','पर','तक','ने','और','या','तो','ही','भी','न','ना',
        'अब','जब','तब','जो','यह','ये','वह','वो','इस','उस','इन','उन','एक','मैं','हम','तुम','तू',
        'मेरा','मेरी','मेरे','तेरा','तेरी','तेरे','अपना','अपनी','अपने','दिल','मन','जान','प्यार',
        'है','हैं','था','थी','थे','हो','हूँ','हूं','क्या','क्यों','कहाँ','कहां','कैसे','जैसे','ऐसे'
    ]));

    const INDIC_ENGLISH_PRONUNCIATION_PACKED = "a=a,ah,uh;abaut=about;abav=above;abavt=about;about=about;above=above;abuv=above;actually=actually;adar=other;ader=other;aftar=after;after=after;again=again;against=against;agayn=again;agaynst=against;agen=again;agenst=against;ah=ah;ai=i,eye;aid=i'd;aidar=either;aider=either;ail=i'll;aim=i'm;aint=ain't;ais=eyes;aiv=i've;akchli=actually;akchuali=actually;akchuli=actually;akshali=actually;akshuli=actually;al=all;all=all;almost=almost;alon=alone;alone=alone;alrait=alright;already=already;alredi=already;alrigt=alright;also=also;alvays=always;alves=always;alvis=always;am=am,i'm;amang=among;among=among;amung=among;an=an,on;anadar=another;anader=another;and=and;andar=under;ander=under;angel=angel;anoter=another;ansar=answer;ansars=answers;anser=answer;ansers=answers;ansver=answer;ansvers=answers;antu=onto;anudar=another;anuder=another;any=any;anyting=anything;ap=up;apart=apart;aport=apart;ar=or,our,are;arant=aren't;araun=around;araund=around;aravn=around;aravnd=around;are=are;aredi=already;arent=aren't;arli=early;arms=arms;arnt=aren't;around=around;ars=ours;arselvs=ourselves;arunt=aren't;as=as,us;at=at;auar=our;auars=ours;auarselvs=ourselves;auer=our;auers=ours;auerselvs=ourselves;aur=our;aurs=ours;aut=out;autsaid=outside;av=of;avar=our;avars=ours;avarselvs=ourselves;avay=away;ave=away;aver=our;avers=ours;averselvs=ourselves;avr=our;avrs=ours;avt=out;avtsaid=outside;ay=a;ayem=am;aynjal=angel;aynjul=angel;aynt=ain't;babe=babe;babi=baby;babies=babies;baby=baby;back=back;bad=bad;badi=body;badis=bodies;bai=by,bye;bak=back;ban=been;barn=burn;barnd=burned;barneng=burning;barning=burning;barns=burns;bat=but;bayb=babe;baybi=baby;baybis=babies;be=be;beat=beat;beats=beats;beautiful=beautiful;beb=babe;bebi=baby;bebis=babies;because=because;bed=bed,bad;beds=beds;befar=before;befor=before;before=before;beg=big;begar=bigger;begast=biggest;beger=bigger;begust=biggest;being=being;bek=back;bekas=because;bekos=because;bekus=because;believe=believe;believed=believed;believes=believes;believing=believing;beliv=believe;belivd=believed;beliveng=believing;beliving=believing;belivs=believes;belo=below;belov=below;ben=been;bern=burn;bernd=burned;berneng=burning;berning=burning;berns=burns;best=best;betar=better;beter=better;better=better;betvin=between;bi=be;bieng=being;bifar=before;bifor=before;big=big;bigar=bigger;bigast=biggest;biger=bigger;bigger=bigger;biggest=biggest;bigust=biggest;bikas=because;bikos=because;bikus=because;biliv=believe;bilivd=believed;biliveng=believing;biliving=believing;bilivs=believes;bilo=below;bin=been;bing=being;bit=beat;bits=beats;bitvin=between;black=black;blak=black;blek=black;blu=blue;blue=blue;blues=blues;blus=blues;bodi=body;bodies=bodies;bodis=bodies;body=body;boi=boy;bois=boys;bot=both;boy=boy;boys=boys;bradar=brother;brader=brother;brait=bright;braitar=brighter;braiter=brighter;brayk=break;braykeng=breaking;brayking=breaking;brayks=breaks;break=break;breaking=breaking;breaks=breaks;breate=breathe;breated=breathed;breates=breathes;breating=breathing;brek=break;brekeng=breaking;breking=breaking;breks=breaks;brid=breathe;bridd=breathed;brideng=breathing;briding=breathing;brids=breathes;brigt=bright;brigter=brighter;brok=broke;brokan=broken;broke=broke;broken=broken;brokun=broken;broter=brother;brudar=brother;bruder=brother;bun=been;burn=burn;burned=burned;burning=burning;burns=burns;but=but;by=by;bye=bye;byutafal=beautiful;byutaful=beautiful;byutufal=beautiful;byutuful=beautiful;call=call;called=called;calling=calling;calls=calls;came=came;can=can;cant=can't;car=car;cars=cars;cause=cause;chance=chance;chances=chances;change=change;changed=changed;changes=changes;changing=changing;chans=chance;chansas=chances;chanses=chances;chansis=chances;chansus=chances;chaynj=change;chaynjas=changes;chaynjd=changed;chaynjeng=changing;chaynjes=changes;chaynjing=changing;chaynjis=changes;chaynjus=changes;chenj=change;chenjas=changes;chenjd=changed;chenjeng=changing;chenjes=changes;chenjing=changing;chenjis=changes;chenjus=changes;chens=chance;chensas=chances;chenses=chances;chensis=chances;chensus=chances;cities=cities;city=city;close=close;cold=cold;colder=colder;come=come;comes=comes;coming=coming;cos=cos;could=could;couldnt=couldn't;crasy=crazy;cried=cried;cries=cries;cry=cry;crying=crying;cul=cool;d=the;da=the,da;dad=dad;dai=die;daid=died;daieng=dying;daing=dying;dais=dies;dam=them;damselvs=themselves;dance=dance;danced=danced;dances=dances;dancing=dancing;dans=dance;dansas=dances;danseng=dancing;danses=dances;dansing=dancing;dansis=dances;danst=danced;dansus=dances;dar=door;dareng=during;daring=during;dark=dark;darkar=darker;darker=darker;darleng=darling;darling=darling;dars=doors;das=does;dasan=doesn't;dasant=doesn't;dasun=doesn't;dasunt=doesn't;dat=that;dats=that's;daun=down;davn=down;day=they,day;dayd=they'd;dayl=they'll;days=days;dayv=they've;de=they,day;ded=did,dad,they'd;dedan=didn't;dedant=didn't;dednt=didn't;dedun=didn't;dedunt=didn't;del=they'll;dem=them;demselvs=themselves;den=then;dens=dance;densas=dances;denseng=dancing;denses=dances;densing=dancing;densis=dances;denst=danced;densus=dances;der=their,there,they're;dereng=during;dering=during;ders=theirs,there's;des=this,does,days;det=that;dets=that's;dev=they've;deval=devil;devil=devil;devul=devil;di=the;diay=da;did=did;didan=didn't;didant=didn't;didnt=didn't;didun=didn't;didunt=didn't;die=da,die;died=died;dies=dies;dis=this,these,does;do=do,da;does=does;doesnt=doesn't;doing=doing;don=don't;dont=don't;dor=door;dork=dark;dorkar=darker;dorker=darker;dorleng=darling;dorling=darling;dors=doors;dos=those;dovn=down;dream=dream;dreamed=dreamed;dreaming=dreaming;dreams=dreams;drim=dream;drimd=dreamed;drimeng=dreaming;driming=dreaming;drims=dreams;du=the,do;dueng=doing;duing=doing;dum=them;dumselvs=themselves;dur=door;dureng=during;during=during;durs=doors;dus=does;dusan=doesn't;dusant=doesn't;dusun=doesn't;dusunt=doesn't;dut=that;dying=dying;dyureng=during;dyuring=during;e=a;each=each;early=early;easier=easier;easy=easy;ef=if;eftar=after;efter=after;egsaktli=exactly;egsektli=exactly;eiter=either;ekchli=actually;ekchuali=actually;ekchuli=actually;ekshali=actually;ekshuli=actually;em=him,am;en=and,an,in;enaf=enough;end=and,end;eni=any;eniteng=anything;eniting=anything;enjal=angel;enjul=angel;enoug=enough;ensaid=inside;ensar=answer;ensars=answers;enser=answer;ensers=answers;ent=ain't;enta=into;entu=into;enuf=enough;er=or,are;eraun=around;eraund=around;eravn=around;eravnd=around;erli=early;es=as,is;esan=isn't;esant=isn't;esun=isn't;esunt=isn't;et=at,it;ets=its,it's;etself=itself;evar=ever;evari=every;even=even;evening=evening;evenings=evenings;ever=ever;everi=every;every=every;everyting=everything;evri=every;evriteng=everything;evriting=everything;exactly=exactly;eye=eye;eyes=eyes;face=face;faces=faces;fadar=father;fader=father;faiar=fire;faiars=fires;faier=fire;faiers=fires;faind=find;faindeng=finding;fainding=finding;fainds=finds;fair=fire;fairs=fires;faiv=five;fal=fall;falan=fallen;faleng=falling;faling=falling;fall=fall;fallen=fallen;falling=falling;falls=falls;fals=falls,false;false=false;falun=fallen;fame=fame;far=for,four,far;farevar=forever;farever=forever;fargat=forgot;fargatan=forgotten;fargatun=forgotten;farget=forget;fargeteng=forgetting;fargeting=forgetting;fargets=forgets;fargot=forgot;fargotan=forgotten;fargotun=forgotten;farst=first;farvard=forward;farverd=forward;fater=father;faund=found;favnd=found;faym=fame;fays=face;faysas=faces;fayses=faces;faysis=faces;faysus=faces;fear=fear;fears=fears;feks=fix;fekseng=fixing;fekses=fixes;feksing=fixing;feksis=fixes;fekst=fixed;fel=fell;fell=fell;felt=felt;fem=fame;fer=for,fear;ferevar=forever;ferever=forever;fergat=forgot;fergatan=forgotten;fergatun=forgotten;ferget=forget;fergeteng=forgetting;fergeting=forgetting;fergets=forgets;fergot=forgot;fergotan=forgotten;fergotun=forgotten;fers=fears;ferst=first;fes=face;fesas=faces;feses=faces;fesis=faces;fesus=faces;fev=few;fiks=fix;fikseng=fixing;fikses=fixes;fiksing=fixing;fiksis=fixes;fikst=fixed;fil=feel;fileng=feeling;filing=feeling;fils=feels;find=find;finding=finding;finds=finds;fir=fear;fire=fire;fires=fires;firs=fears;first=first;five=five;fix=fix;fixed=fixed;fixes=fixes;fixing=fixing;flai=fly;flaieng=flying;flaing=flying;flais=flies;flar=floor;flars=floors;flev=flew;flies=flies;flon=flown;flor=floor;flors=floors;flovn=flown;flu=flew;flur=floor;flurs=floors;fly=fly;flying=flying;fodar=father;foder=father;fol=fall;folan=fallen;foleng=falling;foling=falling;fols=falls,false;folun=fallen;for=for,four,far;forever=forever;forgat=forgot;forgatan=forgotten;forgatun=forgotten;forget=forget;forgeteng=forgetting;forgeting=forgetting;forgets=forgets;forgetting=forgetting;forgot=forgot;forgotan=forgotten;forgotten=forgotten;forgotun=forgotten;forvard=forward;forverd=forward;found=found;four=four;fram=from;frar=for;frend=friend;frends=friends;frens=friends;frer=for;fri=free;friend=friend;friends=friends;from=from;frum=from;fyu=few;game=game;games=games;gan=gone;gana=gonna;ganu=gonna;garl=girl;garls=girls;gat=got;gata=gotta;gatan=gotten;gatu=gotta;gatun=gotten;gave=gave;gaym=game;gayms=games;gayv=gave;ged=good;gem=game;gemi=gimme;gems=games;gerl=girl;gerls=girls;get=get;geteng=getting;geting=getting;gets=gets;getting=getting;gev=give,gave;gevan=given;geven=given;geveng=giving;gevin=given;geving=giving;gevs=gives;gevun=given;gid=good;gimi=gimme;gimme=gimme;girl=girl;girls=girls;git=get;giteng=getting;giting=getting;gits=gets;giv=give;givan=given;give=give;given=given;giveng=giving;gives=gives;givin=given;giving=giving;givs=gives;givun=given;go=go;goen=going;goeng=going;goes=goes;goin=going;going=going;gold=gold;goldan=golden;golden=golden;goldun=golden;gon=gone;gona=gonna;gone=gone;gonna=gonna;gonu=gonna;gos=goes;got=got;gota=gotta;gotan=gotten;gotta=gotta;gotten=gotten;gotu=gotta;gotun=gotten;gud=good;gudbai=goodbye;gudbye=goodbye;ha=huh;had=had;hadan=hadn't;hadant=hadn't;hadnt=hadn't;hadun=hadn't;hadunt=hadn't;hag=hug;hagd=hugged;hageng=hugging;haging=hugging;hags=hugs;hai=hi,high;haid=hide;haideng=hiding;haiding=hiding;haids=hides;hair=hair;halo=hello;hand=hand;hands=hands;handsome=handsome;hani=honey;hans=hands;hansam=handsome;hansum=handsome;hap=hop;hapinas=happiness;hapinus=happiness;happiness=happiness;har=her;hard=heard,hard;hardar=harder;harder=harder;hars=hers;harself=herself;hart=heart,hurt;harts=hearts,hurts;has=has;hasant=hasn't;hasnt=hasn't;hasunt=hasn't;hat=hot;hatar=hotter;hate=hate;hated=hated;hater=hotter;hates=hates;hating=hating;hau=how;haus=house,how's;hausas=houses;hauses=houses;hausis=houses;hausus=houses;hav=how,have;havan=haven't;havant=haven't;have=have;haveng=having;havent=haven't;having=having;havs=house,how's;havsas=houses;havses=houses;havsis=houses;havsus=houses;havun=haven't;havunt=haven't;hay=hey;hayt=hate;haytad=hated;hayted=hated;hayteng=hating;haytid=hated;hayting=hating;hayts=hates;haytud=hated;he=he,hey;head=head;heads=heads;hear=hear;heard=heard;hearing=hearing;hears=hears;heart=heart;hearts=hearts;hed=had,hid,head;hedan=hidden,hadn't;hedant=hadn't;heds=heads;hedun=hidden,hadn't;hedunt=hadn't;held=held;hello=hello;helo=hello;hem=him;hemself=himself;hend=hand;hends=hands;hens=hands;hensam=handsome;hensum=handsome;hep=hip;hepinas=happiness;hepinus=happiness;her=her,hair;herd=heard;here=here;heres=here's;hero=hero;hers=hers,here's;herself=herself;hert=hurt;herts=hurts;hes=his,has,he's;hesant=hasn't;hesunt=hasn't;het=hate;hetad=hated;heted=hated;heteng=hating;hetid=hated;heting=hating;hets=hates;hetud=hated;hev=have;hevan=haven't;hevant=haven't;heveng=having;heving=having;hevun=haven't;hevunt=haven't;hey=hey;hi=he,hi;hid=hid;hidan=hidden;hidden=hidden;hide=hide;hides=hides;hiding=hiding;hidun=hidden;hig=high;him=him;himself=himself;hip=hip;hir=here,hear;hireng=hearing;hiring=hearing;hiro=hero;hirs=hears,here's;his=his,he's;hm=hmm;hmm=hmm;ho=whoa;hol=whole;hold=hold;holdeng=holding;holding=holding;holds=holds;hom=home;home=home;homes=homes;homs=homes;honey=honey;hop=hope,hop;hope=hope;hoped=hoped;hopeng=hoping;hopes=hopes;hoping=hoping;hops=hopes;hopt=hoped;hord=hard;hordar=harder;horder=harder;hort=heart;horts=hearts;hot=hot;hotar=hotter;hoter=hotter;hotter=hotter;house=house;houses=houses;hov=how;hovs=how's;hu=who,huh;hug=hug;hugd=hugged;hugeng=hugging;hugged=hugged;hugging=hugging;huging=hugging;hugs=hugs;huh=huh;hulo=hello;hum=whom;huni=honey;hurt=hurt;hurts=hurts;hus=whose,has,who's;hvai=why;hvais=why's;hvait=white;hvat=what;hvats=what's;hvech=which;hven=when;hvens=when's;hver=where;hvers=where's;hvich=which;hvo=whoa;hvut=what;hvuts=what's;i=i;ich=each;id=i'd;idar=either;ider=either;if=if;igsaktli=exactly;igsektli=exactly;ill=i'll;im=him,am,i'm;in=in;inaf=enough;insaid=inside;inside=inside;inta=into;into=into;intu=into;inuf=enough;is=is;isan=isn't;isant=isn't;isi=easy;isiar=easier;isier=easier;isnt=isn't;isun=isn't;isunt=isn't;it=it;its=its,it's;itself=itself;ive=i've;iven=even;ivin=even;ivneng=evening;ivnengs=evenings;ivning=evening;ivnings=evenings;jas=jazz;jass=jazz;jast=just;jes=jazz;jest=just;jist=just;joi=joy;jois=joys;joy=joy;joys=joys;just=just;kal=call;kald=called;kaleng=calling;kaling=calling;kals=calls;kam=come;kameng=coming;kaming=coming;kams=comes;kan=can;kant=can't;kapt=kept;kar=car;kars=cars;kas=cars,cause,cos;kaym=came;kem=came;ken=can;kenda=kinda;kendu=kinda;keng=king;kent=can't;kept=kept;kes=kiss;kesas=kisses;keseng=kissing;keses=kisses;kesing=kissing;kesis=kisses;kest=kissed;kesus=kisses;kinda=kinda;kindu=kinda;king=king;kip=keep;kipeng=keeping;kiping=keeping;kips=keeps;kis=kiss;kisas=kisses;kiseng=kissing;kises=kisses;kising=kissing;kisis=kisses;kiss=kiss;kissed=kissed;kisses=kisses;kissing=kissing;kist=kissed;kisus=kisses;klos=close;knev=knew;knov=know;knoving=knowing;knovn=known;knovs=knows;kol=call;kold=called,cold;koldar=colder;kolder=colder;koleng=calling;koling=calling;kols=calls;kor=car;kors=cars;kos=cars,cause,cos;krai=cry;kraid=cried;kraieng=crying;kraing=crying;krais=cries;kraysi=crazy;kresi=crazy;kud=could;kudan=couldn't;kudant=couldn't;kudun=couldn't;kudunt=couldn't;kul=cool;kum=come;kumeng=coming;kuming=coming;kums=comes;kun=can;kveschan=question;kveschans=questions;kveschun=question;kveschuns=questions;kveshan=question;kveshun=question;kvin=queen;la=la;laf=laugh;lafeng=laughing;lafing=laughing;lafs=laughs;laft=laughed;lai=lie;laif=life;laik=like;laikeng=liking;laiking=liking;laiks=likes;laikt=liked;lain=line;lains=lines;lais=lies;lait=light;laiteng=lighting;laiting=lighting;laits=lights;laiv=live;laivd=lived;laivs=lives;las=last;last=last,lost;late=late;laug=laugh;lauged=laughed;lauging=laughing;laugs=laughs;lav=love;lavar=lover;lavars=lovers;lavd=loved;laveng=loving;laver=lover;lavers=lovers;laving=loving;lavli=lovely;lavs=loves;layt=late;least=least;leave=leave;leaves=leaves;leaving=leaving;lef=laugh;lefeng=laughing;lefing=laughing;lefs=laughs;left=left,laughed;lema=lemme;lemme=lemme;lemu=lemme;leps=lips;les=last,less;lesan=listen;lesand=listened;lesaneng=listening;lesaning=listening;lesans=listens;lesneng=listening;lesning=listening;less=less;lest=last;lesun=listen;lesund=listened;lesuneng=listening;lesuning=listening;lesuns=listens;let=late,let,lit;letal=little;leteng=letting;leting=letting;lets=lets,let's;letting=letting;letul=little;lev=live;levd=lived;leveng=living;leving=living;levs=lives;lie=lie;lies=lies;life=life;ligt=light;ligting=lighting;ligts=lights;like=like;liked=liked;likes=likes;liking=liking;line=line;lines=lines;lips=lips;lisan=listen;lisand=listened;lisaneng=listening;lisaning=listening;lisans=listens;lisneng=listening;lisning=listening;list=least;listen=listen;listened=listened;listening=listening;listens=listens;lisun=listen;lisund=listened;lisuneng=listening;lisuning=listening;lisuns=listens;lit=lit;lital=little;little=little;litul=little;liv=leave,live;livd=lived;live=live;lived=lived;liveng=leaving,living;lives=lives;living=leaving,living;livs=leaves,lives;lo=low,la;lonely=lonely;lonli=lonely;lose=lose;loses=loses;losing=losing;lost=lost;lov=low;love=love;loved=loved;lovely=lovely;lover=lover;lovers=lovers;loves=loves;loving=loving;luk=look;luked=looked;lukeng=looking;luking=looking;luks=looks;lukt=looked;lus=lose;lusas=loses;luseng=losing;luses=loses;lusing=losing;lusis=loses;lusus=loses;luv=love;luvar=lover;luvars=lovers;luvd=loved;luveng=loving;luver=lover;luvers=lovers;luving=loving;luvli=lovely;luvs=loves;m=mm;mach=much;madar=mother;made=made;mader=mother;mai=my;main=mine;maind=mind;mainds=minds;maiself=myself;mait=might;make=make;makes=makes;making=making;mam=mom;mama=mama;mamu=mama;man=man;mani=money;many=many;mar=more;marneng=morning;marnengs=mornings;marning=morning;marnings=mornings;masant=mustn't;mast=must;masunt=mustn't;may=may;maybe=maybe;maybi=maybe;mayd=made;mayk=make;maykeng=making;mayking=making;mayks=makes;me=me,may;mebi=maybe;med=made;mek=make;mekeng=making;meking=making;meks=makes;meladi=melody;meladis=melodies;melodies=melodies;melody=melody;meludi=melody;meludis=melodies;memari=memory;memaris=memories;memeri=memory;memeris=memories;memories=memories;memory=memory;men=man,men;meni=many;mes=miss;mesas=misses;meseng=missing;meses=misses,mrs;mesing=missing;mesis=misses,mrs;mest=missed;mestar=mr,mister;mester=mr,mister;mesus=misses;met=met;mi=me;migt=might;mind=mind;minds=minds;mine=mine;mis=miss;misas=misses;miseng=missing;mises=misses,mrs;mising=missing;misis=misses,mrs;miss=miss;missed=missed;misses=misses;missing=missing;mist=missed;mistar=mr,mister;mister=mr,mister;misus=misses;mm=mm;mom=mom;moma=mama;momant=moment;momants=moments;moment=moment;moments=moments;momu=mama;momunt=moment;momunts=moments;money=money;mor=more;more=more;morneng=morning;mornengs=mornings;morning=morning;mornings=mornings;mos=most;most=most;moter=mother;move=move;moved=moved;moves=moves;moving=moving;mr=mr;mrs=mrs;much=much;mudar=mother;muder=mother;mun=moon;muni=money;muns=moons;musant=mustn't;music=music;must=must;mustnt=mustn't;musunt=mustn't;muv=move;muvd=moved;muveng=moving;muving=moving;muvs=moves;my=my;myself=myself;myujik=music;myusek=music;myusik=music;na=na;naidar=neither;naider=neither;nait=night;naits=nights;name=name;names=names;nan=none;nat=not;nateng=nothing;nating=nothing;nau=now;nav=now;naym=name;nayms=names;near=near;neim=name;neiter=neither;neks=next;nekst=next;nem=name;nems=names;ner=near;nev=new;nevar=never;never=never,newer;next=next;nid=need;nidad=needed;nidar=neither;nided=needed;nideng=needing;nider=neither;nidid=needed;niding=needing;nids=needs;nidud=needed;nigt=night;nigts=nights;nir=near;no=no,na,know;noeng=knowing;noing=knowing;non=known;none=none;nop=nope;nope=nope;nos=knows;not=not;noting=nothing;nov=now;nu=knew,new;nuar=newer;nuer=newer;nun=none;nuteng=nothing;nuting=nothing;nyu=knew,new;o=oh,ah;of=of;oh=oh;ok=ok;okay=okay,ok;oke=okay,ok;ol=all;old=old;oldar=older;older=older;olmost=almost;olrait=alright;olredi=already;olso=also;olvays=always;olves=always;olvis=always;on=on;once=once;one=one;onli=only;only=only;onto=onto;ontu=onto;or=or,our,are;orant=aren't;oredi=already;orms=arms;ornt=aren't;ors=ours;orselvs=ourselves;orunt=aren't;oter=other;our=our;ours=ours;ourselves=ourselves;out=out;outside=outside;ovar=over;over=over;pain=pain;pains=pains;pap=pop;papa=papa;papu=papa;parhaps=perhaps;parheps=perhaps;parsan=person;parsun=person;parti=party;parties=parties;partis=parties;party=party;payn=pain;payns=pains;pen=pain;pens=pains;people=people;perhaps=perhaps;perheps=perhaps;persan=person;person=person;persun=person;pipal=people;pipul=people;place=place;places=places;plaing=playing;plane=plane;planes=planes;play=play;playd=played;played=played;playeng=playing;playn=plane;playns=planes;plays=plays,place;playsas=places;playses=places;playsis=places;playsus=places;ple=play;please=please;pled=played;pleing=playing;plen=plane;plens=planes;ples=plays,place;plesas=places;pleses=places;plesis=places;plesus=places;pling=playing;plis=please;pop=pop;popa=papa;popu=papa;porti=party;portis=parties;prababli=probably;prabli=probably;prabubli=probably;prens=prince;prenses=princess;preti=pretty;pretty=pretty;prince=prince;princess=princess;prins=prince;prinses=princess;priti=pretty;probabli=probably;probably=probably;probli=probably;probubli=probably;question=question;questions=questions;quin=queen;rain=rain;rains=rains;rais=rise;raisas=rises;raiseng=rising;raises=rises;raising=rising;raisis=rises;raisus=rises;rait=right;rak=rock;ran=run,ran;raneng=running;rang=wrong;raning=running;rans=runs;rap=rap;rayn=rain;rayns=rains;real=real;really=really;reason=reason;reasons=reasons;red=red;redam=rhythm;redams=rhythms;redum=rhythm;redums=rhythms;reli=really;remembar=remember;remembard=remembered;remembareng=remembering;remembaring=remembering;remembars=remembers;remember=remember;rememberd=remembered;remembered=remembered;remembereng=remembering;remembering=remembering;remembers=remembers;remembreng=remembering;remembring=remembering;ren=ran,rain;rens=rains;rep=rap;resan=risen;resun=risen;rhytm=rhythm;rhytms=rhythms;ridam=rhythm;ridams=rhythms;ridum=rhythm;ridums=rhythms;rigt=right;ril=real;rili=really;rimembar=remember;rimembard=remembered;rimembareng=remembering;rimembaring=remembering;rimembars=remembers;rimember=remember;rimemberd=remembered;rimembereng=remembering;rimembering=remembering;rimembers=remembers;rimembreng=remembering;rimembring=remembering;risan=risen,reason;risans=reasons;rise=rise;risen=risen;rises=rises;rising=rising;risun=risen,reason;risuns=reasons;road=road;roads=roads;rock=rock;rod=road;rods=roads;rok=rock;rol=roll;roll=roll;rong=wrong;ros=rose;rose=rose;rum=room;rums=rooms;run=run;runeng=running;runing=running;running=running;runs=runs;sa=saw;sadnas=sadness;sadness=sadness;sadnus=sadness;saft=soft;said=said;saing=saying;sam=some;same=same;samteng=something;samting=something;san=sun;sang=sang,sung,song;sangs=songs;sans=suns;sari=sorry;saund=sound;saunds=sounds;sauns=sounds;sav=saw;save=save;saved=saved;saves=saves;saving=saving;savnd=sound;savnds=sounds;savns=sounds;say=say;sayeng=saying;saym=same;says=says;sayv=save;sayvd=saved;sayveng=saving;sayving=saving;sayvs=saves;se=say;secret=secret;secrets=secrets;sed=said;sednas=sadness;sednus=sadness;seing=saying;sem=same;seng=sing,sang;sengeng=singing;senging=singing;sengs=sings;ses=says;sestar=sister;sester=sister;seti=city;setis=cities;sev=save;sevd=saved;seveng=saving;seving=saving;sevs=saves;sey=say;shado=shadow;shados=shadows;shadov=shadow;shadovs=shadows;shain=shine;shaineng=shining;shaining=shining;shains=shines;shal=shall;shall=shall;she=she;shedo=shadow;shedos=shadows;shel=shall;shes=she's;shi=she;shine=shine;shines=shines;shining=shining;shis=she's;sho=show;shod=showed;shoeng=showing;shoing=showing;shon=shown,shone;shone=shone;shos=shows;should=should;shouldnt=shouldn't;shov=show;shoved=showed;shoving=showing;shovn=shown;shovs=shows;shud=should;shudant=shouldn't;shudunt=shouldn't;shurli=surely;si=see;sieng=seeing;sikrat=secret;sikrats=secrets;sikret=secret;sikrets=secrets;sikrit=secret;sikrits=secrets;sikrut=secret;sikruts=secrets;sin=seen;sing=seeing,saying,sing;singeng=singing;singing=singing;sings=sings;sis=sees,says;sistar=sister;sister=sister;siti=city;sitis=cities;skai=sky;skais=skies;sken=skin;skies=skies;skin=skin;sky=sky;slept=slept;slip=sleep;slipeng=sleeping;sliping=sleeping;slips=sleeps;smail=smile;smaild=smiled;smaileng=smiling;smailing=smiling;smails=smiles;smal=small;smalar=smaller;smalast=smallest;smaler=smaller;small=small;smaller=smaller;smallest=smallest;smalust=smallest;smile=smile;smiled=smiled;smiles=smiles;smiling=smiling;smol=small;smolar=smaller;smolast=smallest;smoler=smaller;smolust=smallest;so=so,saw;soft=soft;sol=soul;sols=souls;some=some;someting=something;song=song;songs=songs;sori=sorry;sorry=sorry;soul=soul;souls=souls;sound=sound;sounds=sounds;speak=speak;speaking=speaking;speaks=speaks;spik=speak;spikeng=speaking;spiking=speaking;spiks=speaks;spok=spoke;spokan=spoken;spoke=spoke;spoken=spoken;spokun=spoken;staing=staying;stap=stop;stapeng=stopping;staping=stopping;staps=stops;stapt=stopped;star=star;stari=story;staris=stories;stars=stars;start=start;started=started;starteng=starting;startid=started;starting=starting;starts=starts;stay=stay;stayd=stayed;stayed=stayed;stayeng=staying;stays=stays;ste=stay;sted=stayed;steing=staying;stel=still;stes=stays;stil=still;still=still;sting=staying;stop=stop;stopeng=stopping;stoping=stopping;stopped=stopped;stopping=stopping;stops=stops;stopt=stopped;stor=star;stori=story;stories=stories;storis=stories;stors=stars;stort=start;storted=started;storteng=starting;stortid=started;storting=starting;storts=starts;story=story;strang=strong;strangar=stronger;stranger=stronger;stranggar=stronger;strangger=stronger;strit=street;strits=streets;strong=strong;strongar=stronger;stronger=stronger;stronggar=stronger;strongger=stronger;sum=some;sumteng=something;sumting=something;sun=soon,sun;sung=sung;suns=suns;surely=surely;svit=sweet;svitar=sweeter;svitart=sweetheart;svitast=sweetest;sviteart=sweetheart;sviter=sweeter;svitest=sweetest;svitort=sweetheart;svitust=sweetest;ta=to;tach=touch;tachas=touches;tacheng=touching;taches=touches;taching=touching;tachis=touches;tacht=touched;tachus=touches;taday=today;tade=today;tagedar=together;tageder=together;taim=time;taims=times;tak=talk;take=take;taken=taken;takeng=talking;takes=takes;taking=taking,talking;taks=talks;takt=talked;talk=talk;talked=talked;talking=talking;talks=talks;tamaro=tomorrow;tamoro=tomorrow;tanait=tonight;tangk=thank;tangks=thanks;tank=thank;tanks=thanks;tarn=turn;tarnd=turned;tarneng=turning;tarning=turning;tarns=turns;tat=that,thought;tats=that's;taun=town;tauns=towns;tavn=town;tavns=towns;tayk=take;taykan=taken;taykeng=taking;tayking=taking;tayks=takes;taykun=taken;te=the,to;tear=tear;tears=tears;teir=their;teirs=theirs;tek=take;tekan=taken;tekeng=taking;teking=taking;teks=takes;tekun=taken;tel=tell;teleng=telling;teling=telling;tell=tell;telling=telling;tells=tells;tels=tells;tem=them;temselves=themselves;ten=then;teng=thing;tengk=thank,think;tengkeng=thinking;tengking=thinking;tengks=thanks,thinks;tengs=things;ter=tear;tere=there;teres=there's;tern=turn;ternd=turned;terneng=turning;terning=turning;terns=turns;ters=tears;tese=these;tey=they;teyd=they'd;teyll=they'll;teyre=they're;teyve=they've;ti=to;time=time;times=times;ting=thing;tingk=think;tingkeng=thinking;tingking=thinking;tingks=thinks;tings=things;tink=think;tinking=thinking;tinks=thinks;tir=tear;tirs=tears;tis=this;to=to;today=today;togeter=together;tok=talk;tokeng=talking;toking=talking;toks=talks;tokt=talked;told=told;tomorrov=tomorrow;tonait=tonight;tonigt=tonight;tose=those;tot=thought;touch=touch;touched=touched;touches=touches;touching=touching;tougt=thought;tovn=town;tovns=towns;trai=try;traid=tried;traieng=trying;train=train;traing=trying;trains=trains;trais=tries;trayn=train;trayns=trains;tren=train;trens=trains;tri=three;tried=tried;tries=tries;troug=through;tru=through,true;true=true;truli=truly;truly=truly;trut=truth;truts=truths;try=try;trying=trying;tu=to,two,too;tuch=touch;tuchas=touches;tucheng=touching;tuches=touches;tuching=touching;tuchis=touches;tucht=touched;tuchus=touches;tuday=today;tude=today;tugedar=together;tugeder=together;tuk=took;tumaro=tomorrow;tumoro=tomorrow;tunait=tonight;turn=turn;turned=turned;turning=turning;turns=turns;tvais=twice;tvice=twice;tvo=two;u=a,ooh,uh;ubaut=about;ubav=above;ubavt=about;ubuv=above;udar=other;uder=other;ugayn=again;ugaynst=against;ugen=again;ugenst=against;uh=ooh,uh;ulon=alone;um=i'm;umang=among;umung=among;un=an;unadar=another;unader=another;und=and;undar=under;under=under;unudar=another;unuder=another;up=up;upart=apart;uport=apart;us=us;uv=of;uvay=away;uve=away;vach=watch;vachas=watches;vacheng=watching;vaches=watches;vaching=watching;vachis=watches;vacht=watched;vachus=watches;vai=why;vaild=wild;vais=why's;vait=white;vak=walk;vake=wake;vakeng=walking;vakes=wakes;vaking=walking,waking;vaks=walks;vakt=walked;val=will,wall;valk=walk;valked=walked;valking=walking;valks=walks;vall=wall;valls=walls;vals=walls;van=one;vana=wanna;vaneng=wanting;vaning=wanting;vanna=wanna;vans=once;vant=want;vanted=wanted;vanteng=wanting;vantid=wanted;vanting=wanting;vants=wants;vanu=wanna;var=were,we're;varant=weren't;vard=word;vards=words;varld=world;varlds=worlds;varm=warm;varnt=weren't;vars=worse;varst=worst;varunt=weren't;vas=was;vasant=wasn't;vasnt=wasn't;vasunt=wasn't;vat=what;vatch=watch;vatched=watched;vatches=watches;vatching=watching;vats=what's;vay=way;vayk=wake;vaykeng=waking;vayking=waking;vayks=wakes;vays=ways;ve=we,way;veak=weak;vech=which;ved=with,we'd;vedaut=without;vedavt=without;vek=wake;vekeng=waking;veking=waking;veks=wakes;vel=will,we'll;vell=we'll;veman=women;vemun=women;ven=when;vendo=window;vendos=windows;vens=when's;vent=went;ver=where,were,we're;verant=weren't;verd=word;verds=words;vere=were,we're;verent=weren't;veri=very;verld=world;verlds=worlds;vernt=weren't;vers=worse,where's;verst=worst;verunt=weren't;very=very;ves=ways;vesh=wish;vesheng=wishing;veshes=wishes;veshing=wishing;veshis=wishes;vesht=wished;vet=with;vetaut=without;vetavt=without;veve=we've;vhat=what;vhats=what's;vhen=when;vhens=when's;vhere=where;vheres=where's;vhich=which;vhite=white;vho=who;vhoa=whoa;vhole=whole;vhom=whom;vhos=who's;vhose=whose;vhu=whoo;vhy=why;vhys=why's;vi=we;vich=which;vid=with,we'd;vidaut=without;vidavt=without;vik=weak;vil=will,we'll;vild=wild;vill=will;viman=women;vimun=women;vin=when;vindo=window;vindos=windows;vindov=window;vindovs=windows;vir=we're;vish=wish;vished=wished;visheng=wishing;vishes=wishes;vishing=wishing;vishis=wishes;visht=wished;vit=with;vitaut=without;vitavt=without;vitout=without;viv=we've;vo=whoa;voch=watch;vochas=watches;vocheng=watching;voches=watches;voching=watching;vochis=watches;vocht=watched;vochus=watches;voice=voice;voices=voices;vois=voice;voisas=voices;voises=voices;voisis=voices;voisus=voices;vok=walk,woke;voke=woke;vokeng=walking;voking=walking;voks=walks;vokt=walked;vol=wall;vols=walls;voman=woman;vomen=women;vona=wanna;voneng=wanting;voning=wanting;vont=want,won't;vonted=wanted;vonteng=wanting;vontid=wanted;vonting=wanting;vonts=wants;vonu=wanna;vord=word;vords=words;vorld=world;vorlds=worlds;vorm=warm;vorse=worse;vorst=worst;vos=was;vosant=wasn't;vosunt=wasn't;vot=what;vould=would;vouldnt=wouldn't;voys=voice;voysas=voices;voyses=voices;voysis=voices;voysus=voices;vrong=wrong;vu=woo,whoo;vud=would;vudant=wouldn't;vudunt=wouldn't;vul=will;vuman=woman;vumun=woman;vun=one;vuns=once;vus=was;vusant=wasn't;vusunt=wasn't;vut=what;vuts=what's;ya=yeah;yang=young;yanggar=younger;yangger=younger;yar=your;yars=yours,years;yarself=yourself;yarselvs=yourselves;yas=yes;yay=yea;ye=yeah,yea;yea=yea;yeah=yeah;year=year;years=years;yep=yep;yer=year;yers=yours,years;yerself=yourself;yes=yes;yestarday=yesterday;yestarde=yesterday;yestardi=yesterday;yesterday=yesterday;yesterde=yesterday;yesterdi=yesterday;yet=yet;yir=year;yirs=years;yo=yo;yor=your;yors=yours;yorself=yourself;yorselvs=yourselves;you=you;youd=you'd;youll=you'll;young=young;younger=younger;your=your;youre=you're;yours=yours;yourself=yourself;yourselves=yourselves;youve=you've;yu=you;yud=you'd;yues=us;yul=you'll;yung=young;yunggar=younger;yungger=younger;yur=your,you're;yurs=yours;yurself=yourself;yurselvs=yourselves;yuv=you've;iu=you;lab=love";
    let indicEnglishPronunciationIndex = null;

    function normalizeIndicEnglishSurface(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[’‘]/g, "'")
            .replace(/aayee|aayi|aai|ayee/g, 'ai')
            .replace(/ayi/g, 'ai')
            .replace(/aa/g, 'a')
            .replace(/ee/g, 'i')
            .replace(/^ayi$/, 'ai')
            .replace(/oo/g, 'u')
            .replace(/chh/g, 'ch')
            .replace(/kh/g, 'k')
            .replace(/gh/g, 'g')
            .replace(/ph/g, 'f')
            .replace(/bh/g, 'b')
            .replace(/dh/g, 'd')
            .replace(/th/g, 't')
            .replace(/w/g, 'v')
            .replace(/z/g, 's')
            .replace(/([aeiou])\1+/g, '$1')
            .replace(/[^a-z]/g, '');
    }

    function englishOrthographicKey(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[’‘]/g, "'")
            .replace(/[^a-z']/g, '')
            .replace(/'/g, '');
    }

    function getIndicEnglishPronunciationIndex() {
        if (indicEnglishPronunciationIndex) return indicEnglishPronunciationIndex;
        const bySignature = new Map();
        const words = new Set();
        INDIC_ENGLISH_PRONUNCIATION_PACKED.split(';').forEach(record => {
            if (!record) return;
            const separator = record.indexOf('=');
            if (separator <= 0) return;
            const signature = record.slice(0, separator);
            const candidates = record.slice(separator + 1).split(',').filter(Boolean);
            if (!signature || !candidates.length) return;
            bySignature.set(signature, candidates);
            candidates.forEach(word => words.add(word));
        });
        indicEnglishPronunciationIndex = { bySignature, words };
        return indicEnglishPronunciationIndex;
    }

    function scriptedEnglishCandidates(baseline) {
        const signature = normalizeIndicEnglishSurface(baseline);
        if (!signature) return [];
        const index = getIndicEnglishPronunciationIndex();
        const words = index.bySignature.get(signature) || [];
        const orthographic = englishOrthographicKey(baseline);
        return words.slice(0, 5).map((word, candidateIndex) => {
            const canonicalKey = englishOrthographicKey(word);
            let score = 0.86 - (candidateIndex * 0.045);
            if (canonicalKey === orthographic) score += 0.26;
            if (word === 'i' && /^(?:ai|aayi)$/i.test(String(baseline || ''))) score += 0.08;
            return {
                word,
                signature,
                score: Math.max(0, Math.min(1.25, score)),
                orthographicMatch: canonicalKey === orthographic
            };
        });
    }

    const ENGLISH_RECOVERY_ARTICLES = Object.freeze(new Set(['a','an','the']));
    const ENGLISH_RECOVERY_PRONOUNS = Object.freeze(new Set([
        'i','me','you','he','him','she','it','we','us','they','them','who','whom'
    ]));
    const ENGLISH_RECOVERY_POSSESSIVES = Object.freeze(new Set([
        'my','mine','your','yours','his','her','hers','its','our','ours','their','theirs','whose'
    ]));
    const ENGLISH_RECOVERY_CONJUNCTIONS = Object.freeze(new Set(['and','or','but','so']));
    const ENGLISH_RECOVERY_AUXILIARIES = Object.freeze(new Set([
        'am','is','are','was','were','be','been','have','has','had','do','does','did',
        'can','could','may','might','must','shall','should','will','would'
    ]));
    const ENGLISH_RECOVERY_VERBS = Object.freeze(new Set([
        'met','get','got','make','made','take','took','give','gave','come','came','go','went','stay','leave','left',
        'run','ran','walk','move','turn','stop','start','hold','touch','kiss','hug','look','see','saw','watch','hear','heard',
        'listen','say','said','tell','told','talk','speak','spoke','call','called','know','knew','think','thought','feel','felt',
        'want','need','like','love','hate','miss','find','found','lose','lost','keep','kept','let','remember','forget','believe',
        'hope','wish','dream','try','play','sing','sang','dance','smile','laugh','cry','live','die','breathe','sleep','wake','fall',
        'fell','rise','rose','fly','flew','break','broke','fix','save','change','show','hide','shine','burn','light'
    ]));

    function englishRecoveryWordClass(word) {
        const value = String(word || '').toLowerCase();
        if (!value) return 'none';
        if (ENGLISH_RECOVERY_ARTICLES.has(value)) return 'article';
        if (ENGLISH_RECOVERY_PRONOUNS.has(value)) return 'pronoun';
        if (ENGLISH_RECOVERY_POSSESSIVES.has(value)) return 'possessive';
        if (ENGLISH_RECOVERY_CONJUNCTIONS.has(value)) return 'conjunction';
        if (ENGLISH_RECOVERY_AUXILIARIES.has(value)) return 'auxiliary';
        if (ENGLISH_RECOVERY_VERBS.has(value)) return 'verb';
        if (/^(?:what|why|when|where|who|how|which)$/.test(value)) return 'question';
        return 'content';
    }

    function englishRecoveryTransition(leftWord, rightWord) {
        if (!leftWord || !rightWord) return 0;
        const left = englishRecoveryWordClass(leftWord);
        const right = englishRecoveryWordClass(rightWord);
        let score = 0;

        if (left === 'article' && (right === 'content' || right === 'verb')) score += 0.16;
        if (left === 'article' && right === 'conjunction') score -= 0.18;
        if (left === 'possessive' && (right === 'content' || right === 'verb')) score += 0.17;
        if (left === 'pronoun' && (right === 'auxiliary' || right === 'verb')) score += 0.22;
        if (left === 'auxiliary' && (right === 'pronoun' || right === 'article' || right === 'possessive' || right === 'content' || right === 'verb')) score += 0.10;
        if ((left === 'content' || left === 'verb') && right === 'auxiliary') score += 0.15;
        if ((left === 'content' || left === 'verb' || left === 'pronoun') && right === 'conjunction') score += 0.16;
        if (left === 'conjunction' && (right === 'pronoun' || right === 'article' || right === 'possessive' || right === 'content' || right === 'verb')) score += 0.22;
        if (left === 'question' && (right === 'auxiliary' || right === 'pronoun')) score += 0.16;

        if (leftWord === 'name' && rightWord === 'is') score += 0.28;
        if (leftWord === 'and' && ENGLISH_RECOVERY_POSSESSIVES.has(rightWord)) score += 0.12;
        if (leftWord === 'the' && rightWord === 'end') score += 0.34;
        return score;
    }

    function scriptedEnglishProtection(span, descriptor) {
        const word = String(span && span.text || '');
        if (descriptor.key === 'devanagari') {
            if (DEVANAGARI_ENGLISH_CONTEXT_CONVERTIBLE.has(word)) return 'context-ambiguous';
            if (devanagariLexiconEntry(word) || DEVANAGARI_NATIVE_GUARD_WORDS.has(word)) return 'native-strong';
            return 'none';
        }
        if (descriptor.key === 'gurmukhi') {
            return GURMUKHI_LYRIC_OVERRIDES[word] ? 'native-strong' : 'none';
        }
        if (descriptor.config && descriptor.config.overrides && descriptor.config.overrides[word]) {
            return 'native-strong';
        }
        return 'none';
    }

    function isHardEnglishRecoveryBoundary(text) {
        return /[.!?;:\n\r।॥]/u.test(String(text || ''));
    }

    function canonicalRecoveredEnglish(word, sentenceInitial) {
        let value = String(word || '');
        if (/^i(?:'|$)/.test(value)) value = `I${value.slice(1)}`;
        if (sentenceInitial && /^[a-z]/.test(value)) {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
    }

    const SCRIPTED_ENGLISH_RECOVERY_CACHE_MAX = 192;
    const scriptedEnglishRecoveryCache = new Map();

    function cacheScriptedEnglishPlan(text, value) {
        if (scriptedEnglishRecoveryCache.has(text)) scriptedEnglishRecoveryCache.delete(text);
        scriptedEnglishRecoveryCache.set(text, value);
        while (scriptedEnglishRecoveryCache.size > SCRIPTED_ENGLISH_RECOVERY_CACHE_MAX) {
            const oldest = scriptedEnglishRecoveryCache.keys().next();
            if (oldest.done) break;
            scriptedEnglishRecoveryCache.delete(oldest.value);
        }
        return value;
    }

    function getScriptedEnglishRecoveryPlan(input) {
        const raw = String(input == null ? '' : input);
        const text = typeof raw.normalize === 'function' ? raw.normalize('NFC') : raw;
        if (scriptedEnglishRecoveryCache.has(text)) {
            const cached = scriptedEnglishRecoveryCache.get(text);
            scriptedEnglishRecoveryCache.delete(text);
            scriptedEnglishRecoveryCache.set(text, cached);
            return cached;
        }

        const spans = segmentText(text);
        if (!spans.some(span => INDIC_ENGLISH_RECOVERY_SCRIPT_KEYS.has(span.key))) {
            return cacheScriptedEnglishPlan(text, { active: false, text: null, spans, replacements: new Map(), recognitions: new Map(), tokens: [] });
        }

        const tokens = [];
        let group = 0;
        spans.forEach((span, spanIndex) => {
            if (span.key === 'common') {
                if (isHardEnglishRecoveryBoundary(span.text)) group += 1;
                return;
            }

            const descriptor = scriptDescriptorForCharacter(span.text.charAt(0));
            descriptor.key = span.key;
            descriptor.language = span.language;
            descriptor.script = span.script;
            descriptor.dedicated = span.dedicated;

            if (span.key === 'latin') {
                const orthographic = englishOrthographicKey(span.text);
                const index = getIndicEnglishPronunciationIndex();
                tokens.push({
                    span, spanIndex, descriptor, group,
                    baseline: span.text,
                    candidates: index.words.has(String(span.text || '').toLowerCase())
                        ? [{ word: String(span.text || '').toLowerCase(), signature: orthographic, score: 1.1, orthographicMatch: true }]
                        : [],
                    protection: 'latin',
                    latin: true,
                    anchor: index.words.has(String(span.text || '').toLowerCase()) && orthographic.length > 1
                });
                return;
            }

            if (!INDIC_ENGLISH_RECOVERY_SCRIPT_KEYS.has(span.key)) return;
            const baseline = romanizeBase(span.text);
            const candidates = scriptedEnglishCandidates(baseline);
            const protection = scriptedEnglishProtection(span, descriptor);
            const anchor = !!(
                candidates.length
                && protection === 'none'
                && candidates[0].score >= 0.78
            );
            tokens.push({
                span, spanIndex, descriptor, group, baseline, candidates,
                protection, latin: false, anchor
            });
        });

        const activeTokenIndexes = new Set();
        const groups = new Map();
        tokens.forEach((token, tokenIndex) => {
            if (!groups.has(token.group)) groups.set(token.group, []);
            groups.get(token.group).push(tokenIndex);
        });

        groups.forEach(indexes => {
            const anchors = indexes.filter(index => tokens[index].anchor);
            if (anchors.length < 2) return;
            let clusterStart = 0;
            for (let cursor = 1; cursor <= anchors.length; cursor += 1) {
                const split = cursor === anchors.length || (anchors[cursor] - anchors[cursor - 1]) > 4;
                if (!split) continue;
                const cluster = anchors.slice(clusterStart, cursor);
                clusterStart = cursor;
                if (cluster.length < 2) continue;
                const groupFirst = indexes[0];
                const groupLast = indexes[indexes.length - 1];
                const first = Math.max(groupFirst, cluster[0] - 2);
                const last = Math.min(groupLast, cluster[cluster.length - 1] + 3);
                for (let index = first; index <= last; index += 1) {
                    if (tokens[index] && tokens[index].group === tokens[cluster[0]].group) {
                        activeTokenIndexes.add(index);
                    }
                }
            }
        });

        const bestCandidateWord = token => {
            if (!token) return '';
            if (token.latin) return token.candidates.length ? token.candidates[0].word : '';
            if (!token.candidates.length) return '';
            return token.candidates[0].word;
        };

        const replacements = new Map();
        const recognitions = new Map();
        tokens.forEach((token, tokenIndex) => {
            if (token.latin || !activeTokenIndexes.has(tokenIndex) || !token.candidates.length) return;
            if (token.protection === 'native-strong') return;

            const previousToken = tokenIndex > 0 && tokens[tokenIndex - 1].group === token.group
                ? tokens[tokenIndex - 1]
                : null;
            const nextToken = tokenIndex + 1 < tokens.length && tokens[tokenIndex + 1].group === token.group
                ? tokens[tokenIndex + 1]
                : null;
            const previousWord = bestCandidateWord(previousToken);
            const nextWord = bestCandidateWord(nextToken);

            let best = null;
            token.candidates.forEach(candidate => {
                let score = candidate.score + 0.16;
                score += englishRecoveryTransition(previousWord, candidate.word);
                score += englishRecoveryTransition(candidate.word, nextWord);
                if (tokenIndex === 0 && candidate.word === 'i') score += 0.10;
                if (candidate.word === 'end' && !nextWord) score += 0.08;
                if (!best || score > best.score) best = Object.assign({}, candidate, { score });
            });
            if (!best) return;

            const minimum = token.protection === 'context-ambiguous' ? 0.88 : 0.80;
            if (best.score < minimum) return;

            const recovered = canonicalRecoveredEnglish(best.word, tokenIndex === 0);
            if (!recovered) return;
            const decision = {
                sourceStart: token.span.start,
                sourceEnd: token.span.end,
                source: token.span.text,
                baseline: token.baseline,
                text: recovered,
                word: best.word,
                signature: best.signature,
                confidence: Number(Math.min(0.99, 0.78 + Math.max(0, best.score - 0.80) * 0.25).toFixed(3)),
                protection: token.protection,
                evidence: 'multi-anchor-scripted-english-context'
            };
            recognitions.set(token.span.start, decision);
            if (recovered !== token.baseline) replacements.set(token.span.start, decision);
        });

        if (!replacements.size) {
            return cacheScriptedEnglishPlan(text, { active: false, text: null, spans, replacements, recognitions, tokens });
        }

        let output = '';
        spans.forEach(span => {
            const replacement = replacements.get(span.start);
            output += replacement && replacement.sourceEnd === span.end
                ? replacement.text
                : romanizeBase(span.text);
        });
        output = output
            .replace(/[’‘]/g, "'")
            .replace(/[ \t]+([,.;:!?])/g, '$1')
            .replace(/([([{])\s+/g, '$1')
            .replace(/\s+([)\]}])/g, '$1')
            .replace(/[ \t]{2,}/g, ' ');

        return cacheScriptedEnglishPlan(text, {
            active: true,
            text: output,
            spans,
            replacements,
            recognitions,
            tokens
        });
    }

    function scriptedEnglishRecovery(input) {
        const plan = getScriptedEnglishRecoveryPlan(input);
        return {
            active: !!plan.active,
            text: plan.active ? plan.text : romanizeBase(input),
            replacements: Array.from(plan.replacements.values()).map(item => Object.assign({}, item)),
            recognitions: Array.from((plan.recognitions || new Map()).values()).map(item => Object.assign({}, item))
        };
    }

    function appendMapped(out, value, kind, previousKind) {
        if (!value) return out;
        if (kind === 'han' && previousKind === 'han' && out && !/\s$/.test(out)) {
            out += ' ';
        }
        return out + value;
    }

    function romanizeBase(input) {
        const rawText = String(input == null ? '' : input);
        const text = typeof rawText.normalize === 'function' ? rawText.normalize('NFC') : rawText;
        const characters = Array.from(text);
        let output = '';
        let index = 0;
        let previousKind = '';

        while (index < characters.length) {
            const ch = characters[index];
            const cp = ch.codePointAt(0);

            if (isAsciiOrLatin(ch)) {
                output += ch;
                previousKind = 'latin';
                index += 1;
                continue;
            }

            if (isUrduWordCharacter(ch)) {
                const result = romanizeUrduRun(characters, index);
                output += result.value;
                previousKind = 'urdu-shahmukhi';
                index = result.nextIndex;
                continue;
            }

            const scriptMapped = scriptRomanEntry(ch);
            if (scriptMapped !== null) {
                output += scriptMapped;
                previousKind = 'script-map';
                index += 1;
                continue;
            }

            if (KANA[ch] || SMALL_Y[ch] || ch === 'っ' || ch === 'ッ' || ch === 'ー') {
                const result = romanizeKanaRun(characters, index);
                output += result.value;
                previousKind = 'kana';
                index = result.nextIndex;
                continue;
            }

            if (isHangulSyllable(cp)) {
                output += romanizeHangul(ch);
                previousKind = 'hangul';
                index += 1;
                continue;
            }

            if (cp >= 0x0900 && cp <= 0x097f && isDevanagariWordCharacter(ch)) {
                const result = romanizeDevanagariRun(characters, index);
                output += result.value;
                previousKind = 'devanagari';
                index = result.nextIndex;
                continue;
            }

            if (cp >= 0x0a00 && cp <= 0x0a7f && ch !== 'ੱ' && isGurmukhiWordCharacter(ch)) {
                const result = romanizeGurmukhiRun(characters, index);
                output += result.value;
                previousKind = 'gurmukhi';
                index = result.nextIndex;
                continue;
            }

            const indicConfig = configuredIndicForCodePoint(cp);
            if (indicConfig && isConfiguredIndicWordCharacter(ch, indicConfig)) {
                const result = romanizeConfiguredIndicRun(characters, index, indicConfig);
                output += result.value;
                previousKind = indicConfig.name;
                index = result.nextIndex;
                continue;
            }

            const base = brahmicBase(cp);
            if (base) {
                const result = romanizeBrahmicRun(characters, index, base);
                output += result.value;
                previousKind = 'brahmic';
                index = result.nextIndex;
                continue;
            }

            if (cp >= 0x0d80 && cp <= 0x0dff) {
                const result = romanizeSinhalaRun(characters, index);
                output += result.value;
                previousKind = 'sinhala';
                index = result.nextIndex;
                continue;
            }

            if (isHan(cp)) {
                output = appendMapped(output, fallbackRoman(ch), 'han', previousKind);
                previousKind = 'han';
                index += 1;
                continue;
            }

            const mapped = fallbackRoman(ch);
            output += mapped;
            previousKind = mapped === ch ? 'unknown' : 'mapped';
            index += 1;
        }

        return output
            .replace(/[’‘]/g, "'")
            .replace(/[ \t]+([,.;:!?])/g, '$1')
            .replace(/([([{])\s+/g, '$1')
            .replace(/\s+([)\]}])/g, '$1')
            .replace(/[ \t]{2,}/g, ' ');
    }


    function romanize(input) {
        const rawText = String(input == null ? '' : input);
        const text = typeof rawText.normalize === 'function' ? rawText.normalize('NFC') : rawText;
        const plan = getScriptedEnglishRecoveryPlan(text);
        return plan.active ? plan.text : romanizeBase(text);
    }

    function wordRangeAtBoundary(text, sourceIndex, predicate) {
        const index = Math.max(0, Math.min(text.length, Number(sourceIndex) || 0));
        let probe = -1;
        if (index < text.length && predicate(text.charAt(index))) probe = index;
        else if (index > 0 && predicate(text.charAt(index - 1))) probe = index - 1;
        if (probe < 0) return null;

        let start = probe;
        let end = probe + 1;
        while (start > 0 && predicate(text.charAt(start - 1))) start -= 1;
        while (end < text.length && predicate(text.charAt(end))) end += 1;
        return { start, end };
    }


    function rangeHasCodePointAnchor(text, range, predicate) {
        if (!range || typeof predicate !== 'function') return false;
        for (let offset = range.start; offset < range.end;) {
            const cp = text.codePointAt(offset);
            if (predicate(cp)) return true;
            offset += cp > 0xffff ? 2 : 1;
        }
        return false;
    }

    function isDevanagariAnchorCodePoint(cp) {
        return Number.isFinite(cp) && cp >= 0x0900 && cp <= 0x097f;
    }

    function isGurmukhiAnchorCodePoint(cp) {
        return Number.isFinite(cp) && cp >= 0x0a00 && cp <= 0x0a7f;
    }

    function configuredIndicRangeHasAnchor(text, range, config) {
        return rangeHasCodePointAnchor(text, range, cp => (
            Number.isFinite(cp)
            && cp >= config.start
            && cp <= config.end
        ));
    }

    function configuredIndicAtBoundary(text, sourceIndex) {
        const source = String(text || '');
        const index = Math.max(0, Math.min(source.length, Number(sourceIndex) || 0));
        const directIndexes = [];
        if (index < source.length) directIndexes.push(index);
        if (index > 0) directIndexes.push(index - 1);
        for (const probe of directIndexes) {
            const config = configuredIndicForCodePoint(source.codePointAt(probe));
            if (config) return config;
        }

        let left = index - 1;
        while (left >= 0 && (source.charCodeAt(left) === 0x200c || source.charCodeAt(left) === 0x200d)) left -= 1;
        let right = index;
        while (right < source.length && (source.charCodeAt(right) === 0x200c || source.charCodeAt(right) === 0x200d)) right += 1;
        const leftConfig = left >= 0 ? configuredIndicForCodePoint(source.codePointAt(left)) : null;
        const rightConfig = right < source.length ? configuredIndicForCodePoint(source.codePointAt(right)) : null;
        if (leftConfig && rightConfig) return leftConfig.name === rightConfig.name ? leftConfig : null;
        return leftConfig || rightConfig || null;
    }

    const BOUNDARY_CACHE_MAX_ENTRIES = 256;
    const boundaryCache = new Map();

    function monotonicClampBoundaryMap(values, maximum) {
        const limit = Math.max(0, Number(maximum) || 0);
        let previous = 0;
        for (let index = 0; index < values.length; index += 1) {
            const raw = Number(values[index]);
            const bounded = Number.isFinite(raw) ? Math.max(0, Math.min(limit, raw)) : previous;
            values[index] = Math.max(previous, bounded);
            previous = values[index];
        }
        if (values.length) {
            values[0] = 0;
            values[values.length - 1] = limit;
        }
        return values;
    }

    const MAX_EXACT_BOUNDARY_SOURCE_LENGTH = 1024;

    function buildNormalizationBoundaryMaps(text, normalized) {
        const source = String(text || '');
        const target = String(normalized || '');
        if (source.length > MAX_EXACT_BOUNDARY_SOURCE_LENGTH) {
            const approximate = proportionalBoundaryMaps(source.length, target.length);
            return { starts: approximate.startMap, ends: approximate.endMap, approximate: true };
        }
        const starts = new Array(source.length + 1).fill(0);
        const ends = new Array(source.length + 1).fill(0);
        const normalizeNfc = value => (
            typeof value.normalize === 'function' ? value.normalize('NFC') : value
        );

        for (let index = 0; index <= source.length; index += 1) {
            const prefixLength = normalizeNfc(source.slice(0, index)).length;
            const suffixLength = normalizeNfc(source.slice(index)).length;
            ends[index] = prefixLength;
            starts[index] = target.length - suffixLength;
        }
        monotonicClampBoundaryMap(starts, target.length);
        monotonicClampBoundaryMap(ends, target.length);
        return { starts, ends };
    }

    function buildGenericRomanBoundaryMaps(text, full) {
        const source = String(text || '');
        const output = String(full || '');
        if (source.length > MAX_EXACT_BOUNDARY_SOURCE_LENGTH) {
            const approximate = proportionalBoundaryMaps(source.length, output.length);
            return { starts: approximate.startMap, ends: approximate.endMap, approximate: true };
        }
        const starts = new Array(source.length + 1).fill(0);
        const ends = new Array(source.length + 1).fill(0);
        for (let index = 0; index <= source.length; index += 1) {
            starts[index] = output.length - romanize(source.slice(index)).length;
            ends[index] = romanize(source.slice(0, index)).length;
        }
        monotonicClampBoundaryMap(starts, output.length);
        monotonicClampBoundaryMap(ends, output.length);
        return { starts, ends };
    }


    function scriptedEnglishSpanBaseMaps(span) {
        const descriptor = scriptDescriptorForCharacter(span.text.charAt(0));
        descriptor.key = span.key;
        descriptor.language = span.language;
        descriptor.script = span.script;
        descriptor.dedicated = span.dedicated;

        if (descriptor.key === 'devanagari') {
            return romanizeDevanagariWordDetailed(span.text);
        }
        if (descriptor.key === 'gurmukhi') {
            return romanizeGurmukhiWordDetailed(span.text);
        }
        if (descriptor.config) {
            return romanizeConfiguredIndicWordDetailed(span.text, descriptor.config);
        }

        const baseline = romanizeBase(span.text);
        if (baseline === span.text) {
            const startMap = new Array(span.text.length + 1);
            const endMap = new Array(span.text.length + 1);
            for (let index = 0; index <= span.text.length; index += 1) {
                startMap[index] = index;
                endMap[index] = index;
            }
            return { text: baseline, startMap, endMap };
        }
        const approximate = proportionalBoundaryMaps(span.text.length, baseline.length);
        return { text: baseline, startMap: approximate.startMap, endMap: approximate.endMap };
    }

    function composeScriptedEnglishSpanMaps(baseMaps, replacement) {
        const target = String(replacement || '');
        const baseline = String(baseMaps && baseMaps.text || '');
        if (target === baseline) return baseMaps;
        const alignment = alignAsciiBoundaryMaps(baseline, target);
        const sourceLength = Math.max(
            0,
            Math.min(
                Array.isArray(baseMaps.startMap) ? baseMaps.startMap.length - 1 : 0,
                Array.isArray(baseMaps.endMap) ? baseMaps.endMap.length - 1 : 0
            )
        );
        const startMap = new Array(sourceLength + 1);
        const endMap = new Array(sourceLength + 1);
        for (let index = 0; index <= sourceLength; index += 1) {
            const rawStart = Number(baseMaps.startMap[index]);
            const rawEnd = Number(baseMaps.endMap[index]);
            const baselineStart = Math.max(0, Math.min(baseline.length, Number.isFinite(rawStart) ? rawStart : 0));
            const baselineEnd = Math.max(0, Math.min(baseline.length, Number.isFinite(rawEnd) ? rawEnd : baselineStart));
            startMap[index] = alignment.startMap[baselineStart];
            endMap[index] = alignment.endMap[baselineEnd];
        }
        monotonicClampBoundaryMap(startMap, target.length);
        monotonicClampBoundaryMap(endMap, target.length);
        return { text: target, startMap, endMap };
    }

    function buildScriptedEnglishBoundaryMaps(text, full, plan) {
        const source = String(text || '');
        const output = String(full || '');
        const starts = new Array(source.length + 1).fill(null);
        const ends = new Array(source.length + 1).fill(null);
        let outputCursor = 0;
        let assembled = '';

        (plan.spans || []).forEach(span => {
            const recovery = plan.replacements.get(span.start);
            const baseMaps = scriptedEnglishSpanBaseMaps(span);
            const chunk = recovery && recovery.sourceEnd === span.end
                ? recovery.text
                : String(baseMaps.text || '');
            const localMaps = recovery && recovery.sourceEnd === span.end
                ? composeScriptedEnglishSpanMaps(baseMaps, chunk)
                : baseMaps;

            for (let local = 0; local <= span.text.length; local += 1) {
                const sourceBoundary = span.start + local;
                const localStart = Number(localMaps.startMap[local]);
                const localEnd = Number(localMaps.endMap[local]);
                starts[sourceBoundary] = outputCursor + (Number.isFinite(localStart) ? localStart : 0);
                ends[sourceBoundary] = outputCursor + (Number.isFinite(localEnd) ? localEnd : 0);
            }

            assembled += chunk;
            outputCursor += chunk.length;
        });

        /* The span assembly is expected to be identical to the contextual
         * renderer. If a future punctuation transform changes that invariant,
         * fall back to monotonic proportional mapping instead of returning
         * misleading cue offsets. */
        if (assembled !== output) {
            const approximate = proportionalBoundaryMaps(source.length, output.length);
            return { starts: approximate.startMap, ends: approximate.endMap, approximate: true };
        }

        starts[0] = 0;
        ends[0] = 0;
        starts[source.length] = output.length;
        ends[source.length] = output.length;
        monotonicClampBoundaryMap(starts, output.length);
        monotonicClampBoundaryMap(ends, output.length);
        for (let index = 0; index <= source.length; index += 1) {
            if (ends[index] < starts[index]) ends[index] = starts[index];
        }
        monotonicClampBoundaryMap(ends, output.length);
        return { starts, ends, approximate: false };
    }

    function getBoundaryCacheEntry(text, knownFull = null) {
        if (boundaryCache.has(text)) {
            const cached = boundaryCache.get(text);
            boundaryCache.delete(text);
            boundaryCache.set(text, cached);
            return cached;
        }

        const normalized = typeof text.normalize === 'function'
            ? text.normalize('NFC')
            : text;
        const normalizationStable = normalized === text;
        const normalizationMaps = normalizationStable
            ? null
            : buildNormalizationBoundaryMaps(text, normalized);
        const entry = {
            full: typeof knownFull === 'string' ? knownFull : romanize(text),
            normalized,
            normalizationStable,
            normalizationMaps,
            genericMaps: null,
            scriptedEnglishMaps: null,
            starts: new Map(),
            ends: new Map(),
            prefixes: new Map(),
            words: new Map()
        };
        entry.starts.set(0, 0);
        entry.ends.set(0, 0);
        entry.starts.set(text.length, entry.full.length);
        entry.ends.set(text.length, entry.full.length);
        entry.prefixes.set(0, 0);
        entry.prefixes.set(text.length, entry.full.length);
        boundaryCache.set(text, entry);
        while (boundaryCache.size > BOUNDARY_CACHE_MAX_ENTRIES) {
            const oldest = boundaryCache.keys().next();
            if (oldest.done) break;
            boundaryCache.delete(oldest.value);
        }
        return entry;
    }

    function cachedRomanizedPrefixLength(text, index, entry) {
        if (entry.prefixes.has(index)) return entry.prefixes.get(index);
        const value = romanize(text.slice(0, index)).length;
        entry.prefixes.set(index, value);
        return value;
    }

    function cachedDetailedWord(entry, key, factory) {
        if (entry.words.has(key)) return entry.words.get(key);
        const value = factory();
        entry.words.set(key, value);
        return value;
    }

    function mapBoundary(input, sourceIndex, bias) {
        const text = String(input == null ? '' : input);
        const index = Math.max(0, Math.min(text.length, Number(sourceIndex) || 0));
        const side = bias === 'start' ? 'start' : 'end';
        const entry = getBoundaryCacheEntry(text);
        const map = side === 'start' ? entry.starts : entry.ends;
        if (map.has(index)) return map.get(index);

        const full = entry.full;
        let result = null;

        /* Romanization runs on NFC, while Jellyfin cue offsets refer to the
         * original UTF-16 string. Map original boundaries into the normalized
         * coordinate space first, then reuse the normal script-aware mapper.
         * Prefix/suffix normalization maps are monotonized so reordered or
         * stacked combining marks can never make karaoke time move backward. */
        if (!entry.normalizationStable && entry.normalizationMaps) {
            const normalizationMap = side === 'start'
                ? entry.normalizationMaps.starts
                : entry.normalizationMaps.ends;
            const normalizedIndex = normalizationMap[index];
            result = mapBoundary(entry.normalized, normalizedIndex, side);
        }

        if (result === null) {
            const scriptedEnglishPlan = getScriptedEnglishRecoveryPlan(text);
            if (scriptedEnglishPlan.active) {
                if (!entry.scriptedEnglishMaps) {
                    entry.scriptedEnglishMaps = buildScriptedEnglishBoundaryMaps(
                        text, full, scriptedEnglishPlan
                    );
                }
                const contextualMap = side === 'start'
                    ? entry.scriptedEnglishMaps.starts
                    : entry.scriptedEnglishMaps.ends;
                result = contextualMap[index];
            }
        }

        if (result === null) {
            const devanagariRange = wordRangeAtBoundary(
                text,
                index,
                isDevanagariWordCharacter
            );
            if (devanagariRange && rangeHasCodePointAnchor(text, devanagariRange, isDevanagariAnchorCodePoint)) {
                const word = text.slice(devanagariRange.start, devanagariRange.end);
                const key = `d:${devanagariRange.start}:${devanagariRange.end}`;
                const detailed = cachedDetailedWord(
                    entry,
                    key,
                    () => romanizeDevanagariWordDetailed(word)
                );
                const localIndex = index - devanagariRange.start;
                if (localIndex >= 0 && localIndex <= word.length) {
                    const prefixLength = cachedRomanizedPrefixLength(
                        text,
                        devanagariRange.start,
                        entry
                    );
                    const wordMap = side === 'start' ? detailed.startMap : detailed.endMap;
                    const mapped = wordMap[localIndex];
                    if (Number.isFinite(mapped)) result = prefixLength + mapped;
                }
            }
        }

        if (result === null) {
            const gurmukhiRange = wordRangeAtBoundary(
                text,
                index,
                isGurmukhiWordCharacter
            );
            if (
                gurmukhiRange
                && rangeHasCodePointAnchor(text, gurmukhiRange, isGurmukhiAnchorCodePoint)
                && text.charAt(gurmukhiRange.start) !== 'ੱ'
            ) {
                const word = text.slice(gurmukhiRange.start, gurmukhiRange.end);
                const key = `g:${gurmukhiRange.start}:${gurmukhiRange.end}`;
                const detailed = cachedDetailedWord(
                    entry,
                    key,
                    () => romanizeGurmukhiWordDetailed(word)
                );
                const localIndex = index - gurmukhiRange.start;
                if (localIndex >= 0 && localIndex <= word.length) {
                    const prefixLength = cachedRomanizedPrefixLength(
                        text,
                        gurmukhiRange.start,
                        entry
                    );
                    const wordMap = side === 'start' ? detailed.startMap : detailed.endMap;
                    const mapped = wordMap[localIndex];
                    if (Number.isFinite(mapped)) result = prefixLength + mapped;
                }
            }
        }

        if (result === null) {
            const indicConfig = configuredIndicAtBoundary(text, index);
            if (indicConfig) {
                const indicRange = wordRangeAtBoundary(
                    text,
                    index,
                    character => isConfiguredIndicWordCharacter(character, indicConfig)
                );
                if (indicRange && configuredIndicRangeHasAnchor(text, indicRange, indicConfig)) {
                    const word = text.slice(indicRange.start, indicRange.end);
                    const key = `${indicConfig.name}:${indicRange.start}:${indicRange.end}`;
                    const detailed = cachedDetailedWord(
                        entry,
                        key,
                        () => romanizeConfiguredIndicWordDetailed(word, indicConfig)
                    );
                    const localIndex = index - indicRange.start;
                    if (localIndex >= 0 && localIndex <= word.length) {
                        const prefixLength = cachedRomanizedPrefixLength(
                            text,
                            indicRange.start,
                            entry
                        );
                        const wordMap = side === 'start' ? detailed.startMap : detailed.endMap;
                        const mapped = wordMap[localIndex];
                        if (Number.isFinite(mapped)) result = prefixLength + mapped;
                    }
                }
            }
        }

        if (result === null) {
            /* Generic fallback is precomputed for every source boundary and
             * monotonized. Context-sensitive normalization can otherwise make
             * independently romanized prefixes/suffixes retreat, which is
             * unacceptable for synchronized lyric cue mapping. */
            if (!entry.genericMaps) entry.genericMaps = buildGenericRomanBoundaryMaps(text, full);
            const genericMap = side === 'start' ? entry.genericMaps.starts : entry.genericMaps.ends;
            result = genericMap[index];
        }

        result = Math.max(0, Math.min(full.length, result));
        map.set(index, result);
        return result;
    }

    function containsNativeScript(input) {
        for (const ch of String(input || '')) {
            const cp = ch.codePointAt(0);
            if (isAsciiOrLatin(ch)) continue;
            if (
                isUrduWordCharacter(ch)
                || isHangulSyllable(cp)
                || isHan(cp)
                || KANA[ch]
                || brahmicBase(cp)
                || (cp >= 0x0d80 && cp <= 0x0dff)
                || scriptRomanEntry(ch) !== null
            ) return true;
            if (skipsBroadFallback(cp)) continue;
            const map = getFallbackMap();
            if (Object.prototype.hasOwnProperty.call(map, cp.toString(16).toUpperCase())) {
                return true;
            }
        }
        return false;
    }

    function canRomanize(input) {
        const text = String(input || '');
        if (!containsNativeScript(text)) return false;
        const result = romanize(text);
        return !!result
            && result !== text
            && /[A-Za-z]/.test(result)
            && !containsNativeScript(result);
    }


    const MORPHOLOGY_SUFFIXES = Object.freeze({
        malayalam: Object.freeze([
            ['ങ്ങളിൽ', 'plural-locative'],
            ['ങ്ങൾ', 'plural'],
            ['കൾ', 'plural'],
            ['ത്തിന്റെ', 'genitive'],
            ['ത്തിൽ', 'locative'],
            ['യിൽ', 'locative'],
            ['യുടെ', 'genitive'],
            ['ക്ക്', 'dative'],
            ['ത്തെ', 'accusative'],
            ['യെ', 'accusative'],
            ['വാൻ', 'infinitive'],
            ['മായി', 'adverbial'],
            ['ന്നു', 'verb-ending'],
            ['ല്ലോ', 'emphatic']
        ]),
        tamil: Object.freeze([
            ['களுக்கு', 'plural-dative'],
            ['களில்', 'plural-locative'],
            ['களை', 'plural-accusative'],
            ['கள்', 'plural'],
            ['க்கு', 'dative'],
            ['இல்', 'locative'],
            ['ஆல்', 'instrumental'],
            ['உடன்', 'comitative'],
            ['வேன்', 'verb-ending'],
            ['வில்லை', 'negative']
        ]),
        telugu: Object.freeze([
            ['ల్లో', 'plural-locative'],
            ['లకు', 'plural-dative'],
            ['లను', 'plural-accusative'],
            ['లు', 'plural'],
            ['లో', 'locative'],
            ['కి', 'dative'],
            ['కు', 'dative'],
            ['తో', 'comitative'],
            ['ని', 'accusative'],
            ['గా', 'adverbial']
        ]),
        kannada: Object.freeze([
            ['ಗಳಲ್ಲಿ', 'plural-locative'],
            ['ಗಳಿಗೆ', 'plural-dative'],
            ['ಗಳನ್ನು', 'plural-accusative'],
            ['ಗಳು', 'plural'],
            ['ದಲ್ಲಿ', 'locative'],
            ['ಗೆ', 'dative'],
            ['ನ್ನು', 'accusative'],
            ['ದಿಂದ', 'ablative'],
            ['ವಾಗಿ', 'adverbial']
        ]),
        gurmukhi: Object.freeze([
            ['ਾਈਆਂ', 'feminine-plural'],
            ['ਆਂ', 'plural-oblique'],
            ['ਾਂ', 'plural-oblique'],
            ['ਦਾ', 'genitive-masc'],
            ['ਦੀ', 'genitive-fem'],
            ['ਦੇ', 'genitive-plural'],
            ['ਣਾ', 'infinitive']
        ]),
        devanagari: Object.freeze([
            ['ों', 'plural-oblique'],
            ['ें', 'plural-oblique'],
            ['ता', 'verb-noun'],
            ['ती', 'verb-feminine'],
            ['ते', 'verb-plural'],
            ['ना', 'infinitive']
        ])
    });

    /*
     * Shared-script language evidence. Script alone cannot distinguish Hindi,
     * Marathi, Bhojpuri and Nepali in Devanagari, or Urdu from Shahmukhi
     * Punjabi in Perso-Arabic. LyricG2P 6.6.0 therefore reports conservative
     * language evidence instead of pretending the Unicode block is a language.
     * These profiles only become authoritative when the margin is strong.
     */
    const SHARED_SCRIPT_LANGUAGE_PROFILES = Object.freeze({
        devanagari: Object.freeze({
            hi: Object.freeze({
                label: 'Hindi',
                exact: Object.freeze(['है','हैं','नहीं','क्या','क्यों','मुझे','तुझे','मेरा','मेरी','मेरे','तेरा','तेरी','तेरे','दिल','प्यार','और','यह','वह']),
                patterns: Object.freeze([/ाएँ$/u,/ाओं$/u,/ियों$/u,/कर$/u])
            }),
            mr: Object.freeze({
                label: 'Marathi',
                exact: Object.freeze(['आहे','आहेत','नाही','माझा','माझी','माझे','माझं','तुझा','तुझी','तुझे','तुला','मला']),
                patterns: Object.freeze([/ळ/u,/ात$/u,/ाने$/u,/ाला$/u,/ाची$/u,/ाचे$/u,/ाच्या$/u])
            }),
            bho: Object.freeze({
                label: 'Bhojpuri/Awadhi',
                exact: Object.freeze(['बा','बानी','बाड़ा','बाड़े','हमरा','हमार','तोहरा','कइसन','काहे','होखे','रउआ']),
                patterns: Object.freeze([/वा$/u,/इया$/u,/अ$/u])
            }),
            ne: Object.freeze({
                label: 'Nepali',
                exact: Object.freeze(['छ','छन्','छैन','लाई','हुन्छ','भयो','मेरो','तिमी','तपाईं','हामी','तपाईँ','तिमीलाई','मलाई','राम्रो','गर्छ','गर्छु','गर्ने','यहाँ']),
                patterns: Object.freeze([/हरू$/u,/लाई$/u,/को$/u,/की$/u,/का$/u])
            })
        }),
        'urdu-shahmukhi': Object.freeze({
            ur: Object.freeze({
                label: 'Urdu',
                exact: Object.freeze(['ہے','ہیں','نہیں','میں','میرا','میری','میرے','تم','دل','محبت','خواب','زندگی']),
                patterns: Object.freeze([/گی$/u,/گا$/u,/کے$/u,/کی$/u])
            }),
            'pa-Arab': Object.freeze({
                label: 'Punjabi/Shahmukhi',
                exact: Object.freeze(['نوں','توں','میں','ساڈا','ساڈی','ساڈے','تہاڈا','پیار','دل','مُنڈا','منڈا','کڑی']),
                patterns: Object.freeze([/اں$/u,/نوں$/u,/دا$/u,/دی$/u,/دے$/u])
            })
        })
    });

    function sharedScriptLanguageEvidence(text, descriptor) {
        const family = descriptor && descriptor.key;
        const profiles = SHARED_SCRIPT_LANGUAGE_PROFILES[family];
        if (!profiles) {
            const preserved = descriptor && (descriptor.key === 'latin' || descriptor.key === 'common');
            return {
                language: descriptor ? descriptor.language : 'unknown',
                confidence: preserved ? 1 : (descriptor && descriptor.dedicated ? 0.98 : 0.5),
                decisive: true,
                candidates: []
            };
        }

        const word = String(text || '').normalize
            ? String(text || '').normalize('NFC')
            : String(text || '');
        const scored = Object.keys(profiles).map(code => {
            const profile = profiles[code];
            let score = 0;
            const reasons = [];
            if (profile.exact.indexOf(word) >= 0) {
                score += 5;
                reasons.push('lexical-marker');
            }
            profile.patterns.forEach(pattern => {
                if (pattern.test(word)) {
                    score += 1.25;
                    reasons.push(`pattern:${pattern.source}`);
                }
            });
            return { code, label: profile.label, score, reasons };
        }).sort((left, right) => right.score - left.score);

        const top = scored[0] || { code: descriptor.language, score: 0, reasons: [] };
        const runnerUp = scored[1] || { score: 0 };
        const margin = top.score - runnerUp.score;
        const decisive = top.score >= 4 || (top.score >= 2.5 && margin >= 1.5);
        const confidence = decisive
            ? Math.min(0.98, 0.72 + (top.score * 0.045) + (margin * 0.025))
            : Math.min(0.72, 0.42 + (top.score * 0.05));

        return {
            language: decisive ? top.code : descriptor.language,
            confidence: Number(confidence.toFixed(3)),
            decisive,
            candidates: scored.map(item => ({
                language: item.code,
                label: item.label,
                score: Number(item.score.toFixed(2)),
                reasons: item.reasons
            }))
        };
    }

    function contextualLanguageEvidence(spans, index, descriptor) {
        const direct = sharedScriptLanguageEvidence(spans[index].text, descriptor);
        if (!direct.candidates.length) return direct;

        const neighbors = [];
        for (const direction of [-1, 1]) {
            let lexicalDistance = 0;
            for (let probe = index + direction; probe >= 0 && probe < spans.length; probe += direction) {
                const candidate = spans[probe];
                if (!candidate || candidate.key === 'common' || candidate.key === 'latin') continue;
                lexicalDistance += 1;
                if (candidate.key !== descriptor.key) break;
                const neighborDescriptor = scriptDescriptorForCharacter(candidate.text.charAt(0));
                neighborDescriptor.key = candidate.key;
                neighborDescriptor.language = candidate.language;
                neighborDescriptor.script = candidate.script;
                neighborDescriptor.dedicated = candidate.dedicated;
                const evidence = sharedScriptLanguageEvidence(candidate.text, neighborDescriptor);
                neighbors.push({ direction, distance: lexicalDistance, evidence });
                break;
            }
        }

        const strongNonDefault = neighbors.filter(item =>
            item.distance <= 1 && item.evidence.decisive
            && item.evidence.language && item.evidence.language !== 'hi'
        );
        if (
            descriptor.key === 'devanagari'
            && strongNonDefault.length === 2
            && strongNonDefault[0].evidence.language === strongNonDefault[1].evidence.language
        ) {
            return Object.assign({}, direct, {
                language: strongNonDefault[0].evidence.language,
                confidence: 0.91,
                decisive: true,
                contextInherited: true,
                contextOverride: direct.decisive && direct.language !== strongNonDefault[0].evidence.language
            });
        }

        if (direct.decisive) return direct;
        const decisiveNeighbors = neighbors.filter(item => item.evidence.decisive);
        if (!decisiveNeighbors.length) return direct;
        const first = decisiveNeighbors[0].evidence.language;
        if (decisiveNeighbors.some(item => item.evidence.language !== first)) return direct;
        return Object.assign({}, direct, {
            language: first,
            confidence: decisiveNeighbors.length > 1 ? 0.88 : 0.78,
            decisive: decisiveNeighbors.length > 1,
            contextInherited: true
        });
    }

    function detectLanguages(input) {
        const source = String(input == null ? '' : input);
        const spans = segmentText(source);
        const scriptedEnglishPlan = getScriptedEnglishRecoveryPlan(source);
        const results = [];
        spans.forEach((span, index) => {
            if (span.key === 'common') return;
            const descriptor = scriptDescriptorForCharacter(span.text.charAt(0));
            descriptor.key = span.key;
            descriptor.language = span.language;
            descriptor.script = span.script;
            descriptor.dedicated = span.dedicated;
            const evidence = contextualLanguageEvidence(spans, index, descriptor);
            const scriptedEnglish = (scriptedEnglishPlan.recognitions || scriptedEnglishPlan.replacements).get(span.start);
            const recovered = !!(scriptedEnglish && scriptedEnglish.sourceEnd === span.end);
            results.push({
                source: span.text,
                sourceStart: span.start,
                sourceEnd: span.end,
                script: span.script,
                scriptLanguage: span.language,
                language: recovered ? 'en' : evidence.language,
                confidence: recovered ? scriptedEnglish.confidence : evidence.confidence,
                decisive: recovered ? true : evidence.decisive,
                contextInherited: recovered ? true : !!evidence.contextInherited,
                scriptedEnglish: recovered
                    ? {
                        recovered: scriptedEnglish.text,
                        baseline: scriptedEnglish.baseline,
                        evidence: scriptedEnglish.evidence
                    }
                    : null,
                candidates: recovered
                    ? [{ language: 'en', label: 'English (phonetic Indic spelling)', score: 1, reasons: [scriptedEnglish.evidence] }].concat(evidence.candidates || [])
                    : evidence.candidates
            });
        });
        return results;
    }

    function productionSchwaMode(word, descriptor, languageHint = null) {
        if (descriptor.key === 'gurmukhi') return 'punjabi';
        if (descriptor.key !== 'devanagari') return null;
        const evidence = languageHint || sharedScriptLanguageEvidence(word, descriptor);
        if (evidence && evidence.language === 'hi' && evidence.decisive) return 'hindi';
        return null;
    }

    function configuredIndicKeyForConfig(config) {
        if (!config) return '';
        for (const key of Object.keys(INDIC_LYRIC_CONFIGS)) {
            if (INDIC_LYRIC_CONFIGS[key] === config) return key;
        }
        return config.name || '';
    }

    function scriptDescriptorForCharacter(character) {
        const ch = String(character || '');
        if (!ch) return {
            key: 'common',
            script: 'Common',
            language: 'common',
            dedicated: false
        };

        const cp = ch.codePointAt(0);

        if (/\s/u.test(ch) || /[0-9.,;:!?'"()[\]{}\-–—/\\+*=_%&@#$^~`|<>]/u.test(ch)) {
            return {
                key: 'common',
                script: 'Common',
                language: 'common',
                dedicated: false
            };
        }

        if (isUrduWordCharacter(ch)) {
            return {
                key: 'urdu-shahmukhi',
                script: 'Arabic',
                language: 'ur-pa',
                dedicated: true
            };
        }

        if (cp >= 0x0900 && cp <= 0x097f && isDevanagariWordCharacter(ch)) {
            return {
                key: 'devanagari',
                script: 'Devanagari',
                language: 'hi-mr-bho-ne',
                dedicated: true
            };
        }

        if (cp >= 0x0a00 && cp <= 0x0a7f && isGurmukhiWordCharacter(ch)) {
            return {
                key: 'gurmukhi',
                script: 'Gurmukhi',
                language: 'pa',
                dedicated: true
            };
        }

        const config = configuredIndicForCodePoint(cp);
        if (config && isConfiguredIndicWordCharacter(ch, config)) {
            const configKey = configuredIndicKeyForConfig(config);
            const languageMap = {
                malayalam: 'ml',
                tamil: 'ta',
                telugu: 'te',
                kannada: 'kn',
                bengali: 'bn-as',
                gujarati: 'gu',
                odia: 'or'
            };
            return {
                key: configKey || config.name,
                script: config.name,
                language: languageMap[configKey] || config.name,
                dedicated: true,
                config
            };
        }

        if (KANA[ch] || SMALL_Y[ch] || ch === 'っ' || ch === 'ッ' || ch === 'ー') {
            return {
                key: 'kana',
                script: 'Kana',
                language: 'ja',
                dedicated: true
            };
        }

        if (isHangulSyllable(cp)) {
            return {
                key: 'hangul',
                script: 'Hangul',
                language: 'ko',
                dedicated: true
            };
        }

        if (isHan(cp)) {
            return {
                key: 'han',
                script: 'Han',
                language: 'zh',
                dedicated: false
            };
        }

        if (isAsciiOrLatin(ch)) {
            return {
                key: 'latin',
                script: 'Latin',
                language: 'preserve',
                dedicated: false
            };
        }

        if (brahmicBase(cp)) {
            return {
                key: 'brahmic-generic',
                script: 'Brahmic',
                language: 'unknown-brahmic',
                dedicated: false
            };
        }

        if (cp >= 0x0d80 && cp <= 0x0dff) {
            return {
                key: 'sinhala',
                script: 'Sinhala',
                language: 'si',
                dedicated: true
            };
        }

        return {
            key: 'fallback',
            script: 'Other',
            language: 'unknown',
            dedicated: false
        };
    }

    function segmentText(input) {
        const text = String(input == null ? '' : input);
        const spans = [];
        let current = null;
        let offset = 0;

        for (const ch of text) {
            const length = ch.length;

            /* ZWJ/ZWNJ are grapheme controls, not language-bearing spans.
             * Keep legacy chillu and conjunct sequences attached to the script
             * they modify instead of accidentally classifying the joiner as
             * an Arabic/Common standalone character. */
            if ((ch === '\u200D' || ch === '\u200C') && current) {
                current.text += ch;
                current.end = offset + length;
                offset += length;
                continue;
            }

            const descriptor = scriptDescriptorForCharacter(ch);

            if (
                current
                && current.key === descriptor.key
                && current.language === descriptor.language
            ) {
                current.text += ch;
                current.end = offset + length;
            } else {
                current = {
                    text: ch,
                    start: offset,
                    end: offset + length,
                    key: descriptor.key,
                    script: descriptor.script,
                    language: descriptor.language,
                    dedicated: descriptor.dedicated
                };
                spans.push(current);
            }

            offset += length;
        }

        return spans;
    }

    function exactLexiconRomanization(text, descriptor) {
        const word = String(text || '').normalize
            ? String(text || '').normalize('NFC')
            : String(text || '');

        if (!word) return null;

        if (descriptor.key === 'urdu-shahmukhi') {
            const value = URDU_LYRIC_OVERRIDES[word];
            return value
                ? {
                    romanized: value,
                    source: 'curated-lyric-lexicon',
                    confidence: 0.995
                }
                : null;
        }

        if (descriptor.key === 'devanagari') {
            const entry = devanagariLexiconEntry(word);
            return entry
                ? {
                    romanized: entry.text,
                    source: entry.source,
                    confidence: 0.995
                }
                : null;
        }

        if (descriptor.key === 'gurmukhi') {
            const value = GURMUKHI_LYRIC_OVERRIDES[word];
            return value
                ? {
                    romanized: value,
                    source: 'curated-lyric-lexicon',
                    confidence: 0.995
                }
                : null;
        }

        const config = descriptor.config
            || Object.values(INDIC_LYRIC_CONFIGS).find(
                item =>
                    item
                    && (
                        item.name === descriptor.key
                        || configuredIndicKeyForConfig(item) === descriptor.key
                    )
            );

        if (
            config
            && config.overrides
            && Object.prototype.hasOwnProperty.call(
                config.overrides,
                word
            )
        ) {
            return {
                romanized: config.overrides[word],
                source: 'curated-lyric-lexicon',
                confidence: 0.995
            };
        }

        return null;
    }

    const morphologySuffixCache = Object.create(null);

    function morphologySuffixes(descriptor) {
        let family = descriptor.key;
        if (
            descriptor.key === 'bengali'
            || descriptor.key === 'gujarati'
            || descriptor.key === 'odia'
        ) return [];
        if (descriptor.key === 'bengali-assamese') family = 'bengali';
        if (!Object.prototype.hasOwnProperty.call(morphologySuffixCache, family)) {
            morphologySuffixCache[family] = Object.freeze((MORPHOLOGY_SUFFIXES[family] || [])
                .slice()
                .sort((left, right) => String(right[0]).length - String(left[0]).length));
        }
        return morphologySuffixCache[family];
    }

    function morphologyProductionHints(text, descriptor) {
        const word = String(text || '');
        const hints = [];
        for (const [suffix, role] of morphologySuffixes(descriptor)) {
            if (word.length <= suffix.length || !word.endsWith(suffix)) continue;
            const stem = word.slice(0, word.length - suffix.length);
            const stemLexicon = exactLexiconRomanization(stem, descriptor);
            if (!stemLexicon) continue;
            hints.push({
                role, suffix, stem, knownStem: true, stemRomanized: stemLexicon.romanized
            });
        }
        return hints;
    }

    function morphologyHints(text, descriptor) {
        const word = String(text || '');
        const hints = [];
        for (const [suffix, role] of morphologySuffixes(descriptor)) {
            if (word.length <= suffix.length || !word.endsWith(suffix)) continue;
            const stem = word.slice(0, word.length - suffix.length);
            const stemLexicon = exactLexiconRomanization(stem, descriptor);
            hints.push({
                role,
                suffix,
                stem,
                knownStem: !!stemLexicon,
                stemRomanized: stemLexicon ? stemLexicon.romanized : '',
                suffixRomanized: romanize(suffix)
            });
        }
        return hints;
    }

    function morphologyProductionDecision(word, descriptor, baselineMaps, knownHints = null) {
        if (!baselineMaps || !baselineMaps.text) return null;
        const hints = Array.isArray(knownHints)
            ? knownHints.slice()
            : morphologyProductionHints(word, descriptor);
        if (!hints.length) return null;
        hints.sort((left, right) => String(right.suffix).length - String(left.suffix).length);

        for (const hint of hints) {
            const sourceBoundary = hint.stem.length;
            if (sourceBoundary <= 0 || sourceBoundary >= baselineMaps.endMap.length) continue;
            const outputBoundary = baselineMaps.endMap[sourceBoundary];
            if (!Number.isFinite(outputBoundary)) continue;
            const tail = baselineMaps.text.slice(outputBoundary);
            if (!tail && hint.suffix) continue;
            const candidate = `${hint.stemRomanized}${tail}`;
            if (!candidate || containsNativeScript(candidate)) continue;
            const lengthRatio = candidate.length / Math.max(1, baselineMaps.text.length);
            if (lengthRatio < 0.55 || lengthRatio > 1.8) continue;
            return {
                text: candidate,
                role: hint.role,
                suffix: hint.suffix,
                stem: hint.stem,
                stemRomanized: hint.stemRomanized,
                sourceBoundary,
                outputBoundary,
                changed: candidate !== baselineMaps.text,
                reason: candidate === baselineMaps.text
                    ? 'known-stem-confirms-phonology'
                    : 'known-stem-spliced-at-source-boundary'
            };
        }
        return null;
    }

    function descriptorForConfiguredIndic(config) {
        const key = configuredIndicKeyForConfig(config);
        const languageMap = {
            malayalam: 'ml', tamil: 'ta', telugu: 'te', kannada: 'kn',
            bengali: 'bn-as', gujarati: 'gu', odia: 'or'
        };
        return {
            key,
            script: config.name,
            language: languageMap[key] || config.name,
            dedicated: true,
            config
        };
    }

    function consonantFeatureVector(onset) {
        const value = String(onset || '').toLowerCase();
        if (!value) return null;
        const aspirated = /h$/.test(value) && !/^(?:sh|ch|zh)$/.test(value);
        const base = aspirated ? value.slice(0, -1) : value;
        const voiced = /^(?:g|gh|j|jh|d|dh|b|bh|z|v|r|l|m|n|ng|nj|y|w)/.test(value);
        let place = 'other';
        let manner = 'other';

        if (/^(?:k|kh|g|gh|ng)/.test(value)) place = 'velar';
        else if (/^(?:ch|chh|j|jh|nj|sh|zh|s)/.test(value)) place = 'palatal-alveolar';
        else if (/^(?:t|th|d|dh|n)/.test(value)) place = 'coronal';
        else if (/^(?:p|ph|b|bh|m)/.test(value)) place = 'labial';
        else if (/^(?:v|w)/.test(value)) place = 'labiodental-labial';

        if (/^(?:k|kh|g|gh|t|th|d|dh|p|ph|b|bh)$/.test(value)) manner = 'stop';
        else if (/^(?:ch|chh|j|jh)$/.test(value)) manner = 'affricate';
        else if (/^(?:m|n|ng|nj)$/.test(value)) manner = 'nasal';
        else if (/^(?:s|sh|z|zh|h|f)$/.test(value)) manner = 'fricative';
        else if (/^(?:r|l)$/.test(value)) manner = 'liquid';
        else if (/^(?:y|v|w)$/.test(value)) manner = 'approximant';

        return {
            symbol: value,
            base,
            place,
            manner,
            voiced,
            aspirated,
            geminated: false
        };
    }

    function vowelFeatureVector(nucleus) {
        const value = String(nucleus || '').toLowerCase();
        if (!value) return null;
        const long = /^(?:aa|ee|oo)$/.test(value);
        let quality = value;
        if (value === 'aa') quality = 'a';
        else if (value === 'ee') quality = 'i';
        else if (value === 'oo') quality = 'u';
        return {
            symbol: value,
            quality,
            long,
            diphthong: /^(?:ai|au|oi|ou)$/.test(value)
        };
    }

    function punjabiToneEvidence(tokens, index, token) {
        const grapheme = String(token && token.grapheme || '');
        if (!grapheme) return null;
        const historicalAspirate = /^[ਘਝਢਧਭ]$/u.test(grapheme);
        const hCarrier = grapheme === 'ਹ';
        if (!historicalAspirate && !hCarrier) return null;

        const previous = previousSpokenToken(tokens, index);
        const wordInitial = !previous;
        let contour = 'lexically-conditioned';
        if (historicalAspirate) contour = wordInitial ? 'low-rising-likely' : 'high-falling-likely';
        else if (hCarrier) contour = wordInitial ? 'h-onset' : 'tone-trigger-possible';

        return {
            representedInDisplay: false,
            source: grapheme,
            contour,
            historicalAspirate,
            hCarrier
        };
    }

    function tokenRuleTrace(token, descriptor, contextualVoicing, finalShortU, nasal, tone) {
        const rules = [];
        if (token && token.implicit) rules.push('INHERENT_VOWEL');
        if (token && token.explicit) rules.push('EXPLICIT_VOWEL_OR_VIRAMA');
        if (token && token.cluster) rules.push('CONJUNCT_CLUSTER');
        if (token && token.geminated) rules.push('GEMINATION');
        if (contextualVoicing) rules.push(
            descriptor && descriptor.key === 'malayalam'
                ? 'ML_CONTEXTUAL_STOP_VOICING'
                : 'TA_CONTEXTUAL_STOP_REALIZATION'
        );
        if (finalShortU) rules.push('ML_FINAL_SHORT_U');
        if (nasal) rules.push('CONTEXTUAL_NASAL');
        if (tone) rules.push('PA_TONE_EVIDENCE');
        if (token && token.schwaDecision) {
            rules.push(`SCHWA_${token.schwaDecision.action.toUpperCase()}:${token.schwaDecision.reason}`);
        }
        if (token && token.schwaAdvice) {
            rules.push(`SCHWA_ADVICE_${token.schwaAdvice.action.toUpperCase()}:${token.schwaAdvice.reason}`);
        }
        return rules;
    }

    function phonemeLikeUnits(text, descriptor) {
        const word = String(text || '');
        let tokens = [];
        let config = descriptor.config || null;
        let learnedSchwa = false;

        if (descriptor.key === 'devanagari') {
            // Keep diagnostics aligned with the exact production transform. Contextual
            // language evidence is reported separately and must not silently change
            // the schwa decisions used to produce the displayed Romanization.
            const detailed = romanizeDevanagariWordDetailed(word, { learnedAdvisor: true });
            tokens = detailed.tokens || [];
            learnedSchwa = !!detailed.learnedSchwa;
        } else if (descriptor.key === 'gurmukhi') {
            const detailed = romanizeGurmukhiWordDetailed(word, { learnedAdvisor: true });
            tokens = detailed.tokens || [];
            learnedSchwa = !!detailed.learnedSchwa;
        } else {
            if (!config) {
                config = Object.values(INDIC_LYRIC_CONFIGS).find(item => item && (item.name === descriptor.key || configuredIndicKeyForConfig(item) === descriptor.key)) || null;
            }
            if (config) tokens = applyConfiguredIndicSchwa(configuredIndicTokenizeWord(word, config), config);
        }

        if (!tokens.length) return [];
        return tokens.map((token, index) => {
            let onset = token.consonant || '';
            let phoneticOnset = onset;
            let nucleus = token.vowel || '';
            let nasal = '';
            let romanChunk = '';
            let phoneticChunk = '';
            let rules = [];
            let contextualVoicing = false;
            let finalShortU = '';

            if (config) {
                const surface = configuredIndicSurfaceToken(tokens, index, config);
                onset = surface.displayOnset;
                phoneticOnset = surface.phoneticOnset;
                nucleus = surface.nucleus;
                nasal = surface.nasal;
                romanChunk = surface.romanChunk;
                phoneticChunk = surface.phoneticChunk;
                rules = surface.rules.slice();
                contextualVoicing = onset !== (token.consonant || '') || phoneticOnset !== (token.consonant || '');
                if (rules.includes('ML_FINAL_SHORT_U')) finalShortU = nucleus;
            } else {
                if (token.nasal) { nasal = devanagariNasalForNext(tokens, index, token.nasal); rules.push('INDIC_CONTEXTUAL_NASAL'); }
                if (token.kind === 'mark') {
                    romanChunk = token.value || '';
                    phoneticChunk = romanChunk;
                } else {
                    let geminatePrefix = '';
                    if (descriptor.key === 'gurmukhi' && token.geminated && token.consonant) {
                        geminatePrefix = token.consonant.charAt(0);
                        rules.push('PA_ADDAK_GEMINATION');
                    }
                    romanChunk = geminatePrefix + onset + nucleus + nasal + (token.postfix || '');
                    phoneticChunk = romanChunk;
                }
            }

            const tone = descriptor.key === 'gurmukhi' ? punjabiToneEvidence(tokens, index, token) : null;
            const consonant = consonantFeatureVector(onset);
            if (consonant) consonant.geminated = !!token.geminated || !!token.cluster;
            const phoneticConsonant = consonantFeatureVector(phoneticOnset);
            if (phoneticConsonant) phoneticConsonant.geminated = !!token.geminated || !!token.cluster;
            const vowel = vowelFeatureVector(nucleus);
            rules = rules.concat(tokenRuleTrace(token, descriptor, contextualVoicing, finalShortU, nasal, tone));
            rules = Array.from(new Set(rules));

            return {
                source: word.slice(Number(token.sourceStart) || 0, Number(token.sourceEnd) || Number(token.sourceStart) || 0),
                sourceStart: Number(token.sourceStart) || 0,
                sourceEnd: Number(token.sourceEnd) || Number(token.sourceStart) || 0,
                kind: token.kind || 'unknown',
                onset,
                phoneticOnset,
                nucleus,
                nasal,
                romanChunk,
                phoneticChunk,
                implicit: !!token.implicit,
                explicit: !!token.explicit,
                dead: !!token.dead,
                cluster: !!token.cluster,
                geminated: !!token.geminated,
                contextualVoicing,
                schwaDecision: token.schwaDecision || null,
                schwaAdvice: token.schwaAdvice || null,
                schwaKeepProbability: Number.isFinite(token.schwaKeepProbability) ? Number(token.schwaKeepProbability) : null,
                schwaModel: token.schwaModel || null,
                learnedSchwa,
                phoneme: { consonant, phoneticConsonant, vowel, nasalized: !!nasal, tone },
                rules
            };
        });
    }

    function wordTransformForDescriptor(word, descriptor) {
        if (!descriptor) return null;
        if (descriptor.key === 'devanagari') return romanizeDevanagariWordDetailed(word);
        if (descriptor.key === 'gurmukhi') return romanizeGurmukhiWordDetailed(word);
        let config = descriptor.config || null;
        if (!config) {
            config = Object.values(INDIC_LYRIC_CONFIGS).find(item =>
                item && configuredIndicKeyForConfig(item) === descriptor.key
            ) || null;
        }
        return config ? romanizeConfiguredIndicWordDetailed(word, config) : null;
    }

    function neighboringLanguage(spans, index, direction) {
        for (
            let probe = index + direction;
            probe >= 0 && probe < spans.length;
            probe += direction
        ) {
            const candidate = spans[probe];
            if (!candidate || candidate.key === 'common') continue;
            const descriptor = scriptDescriptorForCharacter(candidate.text.charAt(0));
            descriptor.key = candidate.key;
            descriptor.language = candidate.language;
            descriptor.script = candidate.script;
            descriptor.dedicated = candidate.dedicated;
            const evidence = contextualLanguageEvidence(spans, probe, descriptor);
            return {
                language: evidence.language,
                scriptLanguage: candidate.language,
                languageConfidence: evidence.confidence,
                script: candidate.script,
                key: candidate.key
            };
        }
        return null;
    }

    function tokenClassEvidence(text, descriptor, lexicon, morphology = []) {
        const word = String(text || '');
        if (descriptor.key === 'common') return { class: 'common', originHints: [], properName: 'not-applicable' };
        if (descriptor.key === 'latin') return { class: 'preserved-latin', originHints: ['latin-source'], properName: 'unknown' };
        if (lexicon) return { class: 'curated-lexicon', originHints: [lexicon.source], properName: 'unknown' };

        const hints = [];
        if (descriptor.key === 'devanagari' && /[क़ख़ग़ज़फ़़]/u.test(word)) hints.push('persian-arabic-or-foreign-orthography');
        if (descriptor.key === 'gurmukhi' && /[ਖ਼ਗ਼ਜ਼ਫ਼ਸ਼਼]/u.test(word)) hints.push('persian-urdu-or-foreign-orthography');
        if (descriptor.key === 'tamil' && /[ஜஷஸஹஶஃ]/u.test(word)) hints.push('grantha-or-foreign-orthography');
        if (descriptor.key === 'malayalam' && /(?:ക്ഷ|ജ്ഞ|ശ്ര|ത്ര|ദ്വ|ത്വ)/u.test(word)) hints.push('sanskrit-cluster-evidence');
        if (descriptor.key === 'telugu' && /(?:క్ష|జ్ఞ|శ్ర|త్ర|ద్వ)/u.test(word)) hints.push('sanskrit-cluster-evidence');
        if (descriptor.key === 'kannada' && /(?:ಕ್ಷ|ಜ್ಞ|ಶ್ರ|ತ್ರ|ದ್ವ)/u.test(word)) hints.push('sanskrit-cluster-evidence');
        if (descriptor.key === 'urdu-shahmukhi') hints.push('perso-arabic-script-vowel-ambiguity');
        if (morphology.some(hint => hint && hint.knownStem)) hints.push('known-native-stem-evidence');

        return {
            class: hints.length ? 'origin-sensitive-or-loan-risk' : 'native-or-unknown',
            originHints: hints,
            properName: 'unknown-needs-metadata'
        };
    }

    function confidenceForDescriptor(
        descriptor,
        romanized,
        lexicon,
        morphology = [],
        languageEvidence = null,
        tokenClass = null
    ) {
        if (
            descriptor.key === 'common'
            || descriptor.key === 'latin'
        ) {
            return 1;
        }

        if (lexicon) return lexicon.confidence;

        if (
            morphology.some(
                hint => hint && hint.knownStem
            )
        ) {
            return 0.965;
        }

        if (containsNativeScript(romanized)) {
            return 0.18;
        }

        if (descriptor.key === 'urdu-shahmukhi') {
            return 0.60;
        }

        if (descriptor.key === 'devanagari') {
            return languageEvidence && languageEvidence.decisive ? 0.925 : 0.885;
        }

        if (descriptor.key === 'gurmukhi') {
            return 0.91;
        }

        if (descriptor.dedicated) {
            if (descriptor.key === 'tamil') return 0.90;
            return 0.93;
        }

        if (descriptor.key === 'brahmic-generic') {
            return 0.62;
        }

        return 0.46;
    }

    function pathForDescriptor(
        descriptor,
        lexicon,
        romanized,
        morphology = []
    ) {
        if (
            descriptor.key === 'common'
            || descriptor.key === 'latin'
        ) {
            return 'preserve';
        }

        if (lexicon) return 'lexicon';

        if (morphology.some(hint => hint && hint.knownStem)) {
            return 'morphology+phonology';
        }

        if (containsNativeScript(romanized)) {
            return 'unresolved';
        }

        if (descriptor.dedicated) {
            return 'phonology';
        }

        if (descriptor.key === 'brahmic-generic') {
            return 'generic-brahmic';
        }

        return 'unicode-fallback';
    }

    function confidenceBand(value) {
        const score = Number(value);
        if (score >= 0.97) return 'very-high';
        if (score >= 0.90) return 'high';
        if (score >= 0.75) return 'medium';
        if (score >= 0.50) return 'low';
        return 'very-low';
    }

    function uncertaintyReasons(descriptor, romanized, languageEvidence, morphology, lexicon) {
        const reasons = [];
        if (containsNativeScript(romanized)) reasons.push('native-script-residue');
        if (languageEvidence && languageEvidence.candidates && languageEvidence.candidates.length && !languageEvidence.decisive) {
            reasons.push(languageEvidence.contextInherited
                ? 'shared-script-language-inherited-from-context'
                : 'shared-script-language-ambiguous');
        }
        if (descriptor.key === 'urdu-shahmukhi' && !lexicon) reasons.push('unvowelled-perso-arabic-ambiguity');
        if (descriptor.key === 'tamil' && !lexicon) reasons.push('context-sensitive-tamil-stop-realization');
        if (descriptor.key === 'brahmic-generic') reasons.push('generic-brahmic-fallback');
        if (morphology && morphology.some(hint => hint && hint.knownStem)) reasons.push('known-stem-morphology-evidence');
        return reasons;
    }

    function romanizeDetailed(input) {
        const source = String(input == null ? '' : input);
        const output = romanize(source);
        const scriptedEnglishPlan = getScriptedEnglishRecoveryPlan(source);
        /* Seed the boundary cache with the Romanization we just computed.
         * mapBoundary() is used repeatedly below for spans and provenance; without
         * this hint the first lookup redundantly Romanized the complete line. */
        getBoundaryCacheEntry(source, output);
        const sourceSpans = segmentText(source);
        const spans = [];
        let confidenceWeight = 0;
        let confidenceTotal = 0;

        sourceSpans.forEach((span, spanIndex) => {
            const descriptor =
                scriptDescriptorForCharacter(
                    span.text.charAt(0)
                );
            descriptor.key = span.key;
            descriptor.language = span.language;
            descriptor.script = span.script;
            descriptor.dedicated = span.dedicated;
            const languageEvidence = contextualLanguageEvidence(sourceSpans, spanIndex, descriptor);
            descriptor.language = languageEvidence.language;
            descriptor.languageConfidence = languageEvidence.confidence;
            descriptor.languageDecisive = languageEvidence.decisive;

            const startOut =
                mapBoundary(
                    source,
                    span.start,
                    'start'
                );
            const endOut =
                mapBoundary(
                    source,
                    span.end,
                    'end'
                );
            const romanized =
                output.slice(
                    Math.min(startOut, endOut),
                    Math.max(startOut, endOut)
                );
            const scriptedEnglish = (scriptedEnglishPlan.recognitions || scriptedEnglishPlan.replacements).get(span.start);
            const recoveredEnglish = !!(scriptedEnglish && scriptedEnglish.sourceEnd === span.end);
            const lexicon =
                exactLexiconRomanization(
                    span.text,
                    descriptor
                );
            const morphology =
                morphologyHints(
                    span.text,
                    descriptor
                );
            const tokenClass = recoveredEnglish
                ? {
                    class: 'scripted-english',
                    originHints: ['phonetic-english-in-indic-script', scriptedEnglish.evidence],
                    properName: 'unknown'
                }
                : tokenClassEvidence(
                    span.text, descriptor, lexicon, morphology
                );
            const confidence = recoveredEnglish
                ? scriptedEnglish.confidence
                : confidenceForDescriptor(
                    descriptor,
                    romanized,
                    lexicon,
                    morphology,
                    languageEvidence,
                    tokenClass
                );
            const previous =
                neighboringLanguage(
                    sourceSpans,
                    spanIndex,
                    -1
                );
            const next =
                neighboringLanguage(
                    sourceSpans,
                    spanIndex,
                    1
                );
            const codeSwitched =
                !!(
                    previous
                    && previous.language !== languageEvidence.language
                    && span.key !== 'common'
                )
                || !!(
                    next
                    && next.language !== languageEvidence.language
                    && span.key !== 'common'
                );
            const weight =
                Math.max(
                    1,
                    Array.from(span.text).filter(
                        ch => !/\s/u.test(ch)
                    ).length
                );

            confidenceTotal += confidence * weight;
            confidenceWeight += weight;

            const wordTransform = descriptor.dedicated && !recoveredEnglish
                ? wordTransformForDescriptor(span.text, descriptor)
                : null;
            const phonemes = phonemeLikeUnits(span.text, descriptor).map(unit => {
                const sourceStartGlobal = span.start + unit.sourceStart;
                const sourceEndGlobal = span.start + unit.sourceEnd;
                const transformUnit = wordTransform && Array.isArray(wordTransform.provenance)
                    ? wordTransform.provenance.find(item =>
                        item.sourceStart === unit.sourceStart && item.sourceEnd === unit.sourceEnd
                    )
                    : null;
                const rawOutputStart = transformUnit
                    ? startOut + transformUnit.outputStart
                    : mapBoundary(source, sourceStartGlobal, 'start');
                const rawOutputEnd = transformUnit
                    ? startOut + transformUnit.outputEnd
                    : mapBoundary(source, sourceEndGlobal, 'end');
                const outputStart = Math.max(startOut, Math.min(endOut, rawOutputStart));
                const outputEnd = Math.max(
                    outputStart,
                    Math.max(startOut, Math.min(endOut, rawOutputEnd))
                );
                const provenanceAdjusted = outputStart !== rawOutputStart || outputEnd !== rawOutputEnd;
                return Object.assign({}, unit, {
                    sourceStartGlobal,
                    sourceEndGlobal,
                    outputStart,
                    outputEnd,
                    provenanceMode: transformUnit
                        ? (provenanceAdjusted ? 'transform-carried-clamped' : 'transform-carried')
                        : (provenanceAdjusted ? 'boundary-reconstructed-clamped' : 'boundary-reconstructed'),
                    provenanceAdjusted
                });
            });
            const uncertainty = uncertaintyReasons(
                descriptor, romanized, languageEvidence, morphology, lexicon
            );
            if (recoveredEnglish) uncertainty.push('scripted-english-contextual-reconstruction');

            spans.push({
                source: span.text,
                romanized,
                sourceStart: span.start,
                sourceEnd: span.end,
                outputStart: startOut,
                outputEnd: endOut,
                script: span.script,
                scriptLanguage: span.language,
                language: recoveredEnglish ? 'en' : languageEvidence.language,
                languageConfidence: recoveredEnglish ? scriptedEnglish.confidence : languageEvidence.confidence,
                languageDecisive: recoveredEnglish ? true : languageEvidence.decisive,
                languageCandidates: recoveredEnglish
                    ? [{ language: 'en', label: 'English (phonetic Indic spelling)', score: 1, reasons: [scriptedEnglish.evidence] }].concat(languageEvidence.candidates || [])
                    : languageEvidence.candidates,
                path: recoveredEnglish
                    ? 'scripted-english-recovery'
                    : pathForDescriptor(
                        descriptor,
                        lexicon,
                        romanized,
                        morphology
                    ),
                confidence:
                    Number(confidence.toFixed(3)),
                confidenceBand: confidenceBand(confidence),
                confidenceKind: 'evidence-score-not-probability',
                uncertainty,
                weak:
                    confidence < 0.75
                    || containsNativeScript(romanized),
                context: {
                    previousLanguage:
                        previous
                            ? previous.language
                            : null,
                    nextLanguage:
                        next
                            ? next.language
                            : null,
                    codeSwitched,
                    scriptedEnglish: recoveredEnglish
                },
                scriptedEnglish: recoveredEnglish
                    ? {
                        baseline: scriptedEnglish.baseline,
                        recovered: scriptedEnglish.text,
                        signature: scriptedEnglish.signature,
                        evidence: scriptedEnglish.evidence
                    }
                    : null,
                lexicon:
                    lexicon
                        ? {
                            source: lexicon.source,
                            preferred: lexicon.romanized
                        }
                        : null,
                morphology,
                tokenClass,
                phonemes,
                phoneticRomanized: phonemes.length
                    ? phonemes.map(unit => unit.phoneticChunk || unit.romanChunk || '').join('')
                    : romanized
            });
        });

        const languageSummary = [];
        const languageSeen = new Set();
        spans.forEach(span => {
            if (
                span.language === 'common'
                || languageSeen.has(span.language)
            ) return;
            languageSeen.add(span.language);
            languageSummary.push(span.language);
        });

        return {
            input: source,
            text: output,
            confidence:
                confidenceWeight
                    ? Number(
                        (
                            confidenceTotal
                            / confidenceWeight
                        ).toFixed(3)
                    )
                    : 1,
            fullyRomanized:
                !containsNativeScript(output),
            languages: languageSummary,
            codeSwitched:
                languageSummary.length > 1,
            weakSpanCount:
                spans.filter(span => span.weak).length,
            confidenceBand: confidenceBand(
                confidenceWeight ? confidenceTotal / confidenceWeight : 1
            ),
            confidenceKind: 'evidence-score-not-probability',
            style: ROMANIZATION_STYLE,
            spans
        };
    }

    function normalizedRomanSkeleton(value) {
        return String(value || '')
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/aa/g, 'a')
            .replace(/ee/g, 'i')
            .replace(/oo/g, 'u')
            .replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1')
            .replace(/[^a-z0-9]+/g, '');
    }

    function levenshteinDistance(left, right) {
        const a = String(left || '');
        const b = String(right || '');
        if (!a.length) return b.length;
        if (!b.length) return a.length;

        /* normalizedRomanSkeleton() produces compact ASCII, so code-unit
         * comparison is exact here. Two typed rows avoid allocating a fresh JS
         * Array for every source character during candidate ranking. */
        const Row = Math.max(a.length, b.length) < 0xffff ? Uint16Array : Uint32Array;
        let previous = new Row(b.length + 1);
        let current = new Row(b.length + 1);
        for (let j = 0; j <= b.length; j += 1) previous[j] = j;

        for (let i = 1; i <= a.length; i += 1) {
            current[0] = i;
            const leftCode = a.charCodeAt(i - 1);
            for (let j = 1; j <= b.length; j += 1) {
                const cost = leftCode === b.charCodeAt(j - 1) ? 0 : 1;
                current[j] = Math.min(
                    current[j - 1] + 1,
                    previous[j] + 1,
                    previous[j - 1] + cost
                );
            }
            const swap = previous;
            previous = current;
            current = swap;
        }
        return previous[b.length];
    }

    function styleCompliance(value) {
        const text = String(value || '');
        let score = 0;
        const reasons = [];
        if (/^[\x00-\x7F]*$/.test(text)) {
            score += 0.65;
            reasons.push('ascii-song-style');
        }
        if (/[āīūṛṝḷḹṃṁḥṭḍṇñṅśṣ]/iu.test(text)) {
            score -= 0.95;
            reasons.push('academic-diacritics');
        }
        if (/[A-Za-z]/.test(text)) score += 0.20;
        if (/(.)\1{4,}/u.test(text)) {
            score -= 0.35;
            reasons.push('implausible-repetition');
        }
        return { score, reasons };
    }

    function preservedLatinEvidence(input, candidate) {
        const sourceLatin = String(input || '').match(/[A-Za-z][A-Za-z0-9'_-]*/g) || [];
        if (!sourceLatin.length) return { score: 0, reasons: [] };
        const text = String(candidate || '');
        const kept = sourceLatin.filter(token => text.includes(token));
        const ratio = kept.length / sourceLatin.length;
        return {
            score: (ratio * 0.8) - ((1 - ratio) * 0.8),
            reasons: ratio === 1 ? ['latin-source-preserved'] : ['latin-source-modified']
        };
    }

    function localDecisionCategory(localDetailed) {
        const local = localDetailed || {};
        const spans = Array.isArray(local.spans) ? local.spans.filter(span => span && span.script !== 'Common' && span.script !== 'Latin') : [];
        if (!spans.length) return 'preserved-or-common';
        if (spans.every(span => span.path === 'lexicon')) return 'curated-lexicon';
        if (spans.some(span => String(span.path || '').indexOf('morphology') >= 0)) return 'morphology-assisted';
        if (!local.fullyRomanized || Number(local.weakSpanCount) > 0 || spans.some(span => span.weak)) return 'weak-or-fallback';
        if (spans.some(span => Array.isArray(span.languageCandidates) && span.languageCandidates.length && !span.languageDecisive)) {
            return 'shared-script-ambiguous';
        }
        if (spans.some(span => span.tokenClass && span.tokenClass.class === 'origin-sensitive-or-loan-risk')) return 'origin-sensitive';
        return 'deterministic-phonology';
    }

    function localAuthorityBonus(category, confidence) {
        const evidence = Math.max(0, Math.min(1, Number(confidence) || 0));
        const base = {
            'curated-lexicon': 4.8,
            'morphology-assisted': 3.4,
            'deterministic-phonology': 1.75,
            'origin-sensitive': 0.8,
            'shared-script-ambiguous': 0.45,
            'weak-or-fallback': 0,
            'preserved-or-common': 3.0
        }[category] || 0.6;
        return base + (evidence * (category === 'curated-lexicon' ? 0.8 : 0.5));
    }

    function candidateSourceBonus(metadata, localCategory) {
        const source = metadata && String(metadata.source || '').toLowerCase();
        if (!source || source === 'external' || source === 'lyricg2p') return { score: 0, reason: null };
        if (source === 'curated-lexicon') return { score: 3.6, reason: 'curated-lexicon-source' };
        if (source === 'human-attested' || source === 'attested-human') return { score: 2.6, reason: 'human-attested-source' };
        if (source === 'provider-romanization' || source === 'provider') return { score: 0.9, reason: 'provider-romanization-source' };
        if (source === 'learned-model') {
            const uncertain = localCategory === 'shared-script-ambiguous'
                || localCategory === 'weak-or-fallback'
                || localCategory === 'origin-sensitive';
            return { score: uncertain ? 1.8 : 0.55, reason: uncertain ? 'learned-candidate-uncertain-local' : 'learned-candidate-source' };
        }
        if (source === 'style-alternate') return { score: -0.2, reason: 'style-alternate-source' };
        return { score: 0.1, reason: 'external-candidate-source' };
    }

    function candidateConfidence(value) {
        if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : null;
    }

    function candidateQualityScore(input, candidate, localDetailed = null, metadata = null, prepared = null) {
        const source = String(input == null ? '' : input);
        const value = String(candidate == null ? '' : candidate);
        if (!value.trim()) return { score: -Infinity, reasons: ['empty'], decisionCategory: 'invalid' };

        let score = 0;
        const reasons = [];
        const local = localDetailed || romanizeDetailed(source);
        const decisionCategory = prepared && prepared.decisionCategory
            ? prepared.decisionCategory
            : localDecisionCategory(local);

        if (!containsNativeScript(value)) {
            score += 4;
            reasons.push('fully-romanized');
        } else {
            score -= 8;
            reasons.push('native-script-residue');
        }

        const letters = (value.match(/[A-Za-z]/g) || []).length;
        const nonSpace = value.replace(/\s+/g, '').length;
        if (nonSpace) score += (letters / nonSpace) * 2;

        const sourcePunctuation = prepared && Number.isFinite(prepared.sourcePunctuation)
            ? prepared.sourcePunctuation
            : (source.match(/[.,;:!?\'"()[\]{}\-–—]/g) || []).length;
        const candidatePunctuation = (value.match(/[.,;:!?\'"()[\]{}\-–—]/g) || []).length;
        const punctuationDelta = Math.abs(sourcePunctuation - candidatePunctuation);
        score -= punctuationDelta * 0.12;
        if (!punctuationDelta) reasons.push('punctuation-preserved');

        const ratio = value.length / Math.max(1, source.length);
        if (ratio < 0.25 || ratio > 4.5) {
            score -= 1.5;
            reasons.push('implausible-length-ratio');
        }

        if (value === local.text) {
            score += localAuthorityBonus(decisionCategory, local.confidence);
            reasons.push(`local-authority:${decisionCategory}`);
        } else {
            const localSkeleton = prepared && prepared.localSkeleton !== undefined
                ? prepared.localSkeleton
                : normalizedRomanSkeleton(local.text);
            const valueSkeleton = normalizedRomanSkeleton(value);
            if (localSkeleton && valueSkeleton) {
                const similarityCells = (localSkeleton.length + 1) * (valueSkeleton.length + 1);
                if (similarityCells <= MAX_CANDIDATE_SIMILARITY_CELLS) {
                    const distance = levenshteinDistance(localSkeleton, valueSkeleton);
                    const similarity = 1 - (distance / Math.max(localSkeleton.length, valueSkeleton.length, 1));
                    score += Math.max(-0.65, similarity * 1.05);
                    if (similarity >= 0.85) reasons.push('phonologically-close-to-local');
                    else if (similarity < 0.45) reasons.push('phonologically-distant-from-local');
                } else {
                    reasons.push('phonological-distance-skipped:pathological-length');
                }
            }
        }

        const style = styleCompliance(value);
        score += style.score;
        reasons.push(...style.reasons);
        const latin = preservedLatinEvidence(source, value);
        score += latin.score;
        reasons.push(...latin.reasons);

        const confidenceEvidence = metadata ? candidateConfidence(metadata.confidence) : null;
        if (confidenceEvidence !== null) {
            score += confidenceEvidence * 1.35;
            reasons.push('candidate-confidence-evidence');
        }
        const sourceBonus = candidateSourceBonus(metadata, decisionCategory);
        score += sourceBonus.score;
        if (sourceBonus.reason) reasons.push(sourceBonus.reason);

        if (metadata && metadata.language) {
            const candidateLanguage = String(metadata.language);
            const localLanguages = Array.isArray(local.languages) ? local.languages : [];
            if (localLanguages.includes(candidateLanguage)) {
                score += 0.9;
                reasons.push('context-language-match');
            } else if (
                localLanguages.some(language => language === 'hi-mr-bho-ne')
                && ['hi', 'mr', 'bho', 'ne'].includes(candidateLanguage)
            ) {
                score += 0.3;
                reasons.push('context-shared-script-compatible');
            } else if (localLanguages.some(language => !['common', 'preserve', 'unknown'].includes(language))) {
                /* An explicit candidate language that conflicts with the
                 * detected script/language family is stronger negative evidence
                 * than a generic model-source bonus. A Punjabi-labelled model
                 * candidate must not win a Devanagari-family word merely by
                 * reporting high confidence. */
                score -= 2.6;
                reasons.push('context-language-mismatch');
            }
        }

        return {
            score: Number(score.toFixed(4)),
            reasons: Array.from(new Set(reasons)),
            decisionCategory
        };
    }

    function rankCandidates(input, candidates) {
        const source = String(input == null ? '' : input);
        const local = romanizeDetailed(source);
        const decisionCategory = localDecisionCategory(local);
        const prepared = {
            decisionCategory,
            localSkeleton: normalizedRomanSkeleton(local.text),
            sourcePunctuation: (source.match(/[.,;:!?\'"()[\]{}\-–—]/g) || []).length
        };
        const supplied = Array.isArray(candidates) ? candidates : [];
        const values = [{ text: local.text, source: 'lyricg2p', confidence: local.confidence, local: true }]
            .concat(supplied.map(item => {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    return Object.assign({}, item, { text: String(item.text || '') });
                }
                return { text: String(item || ''), source: 'external' };
            }))
            .filter(item => item.text);

        const byText = new Map();
        values.forEach(item => {
            const evaluated = candidateQualityScore(source, item.text, local, item, prepared);
            const ranked = {
                text: item.text,
                score: evaluated.score,
                local: item.text === local.text,
                source: item.source || 'external',
                language: item.language || null,
                confidence: candidateConfidence(item.confidence),
                decisionCategory,
                reasons: evaluated.reasons
            };
            const existing = byText.get(item.text);
            if (!existing) {
                byText.set(item.text, ranked);
                return;
            }

            /* Same spelling from several providers/models is one output, but
             * do not let array order discard stronger evidence. The local
             * LyricG2P spelling remains authoritative metadata when present;
             * otherwise keep the highest-scoring duplicate. */
            if (existing.local) return;
            if (ranked.local || ranked.score > existing.score) byText.set(item.text, ranked);
        });
        const unique = Array.from(byText.values());
        unique.sort((a, b) => b.score - a.score || Number(b.local) - Number(a.local));
        return unique;
    }

    function selectCandidate(input, candidates) {
        const ranked = rankCandidates(input, candidates);
        if (!ranked.length) return null;
        return Object.assign({}, ranked[0], {
            candidateCount: ranked.length,
            selectionPolicy: 'category-aware-authority+language+confidence+style+phonological-agreement'
        });
    }

    function compactVowelVariant(value) {
        return String(value || '')
            .replace(/aa/g, 'a')
            .replace(/ee/g, 'i')
            .replace(/oo/g, 'u');
    }

    function compactGeminateVariant(value) {
        return String(value || '').replace(/([bcdfgjklmnpqrtvwxyz])\1/g, '$1');
    }

    function romanizationVariants(input, limit = 3) {
        const detailed = romanizeDetailed(input);
        const candidates = [
            { text: detailed.text, source: 'lyricg2p', confidence: detailed.confidence, preference: 1, style: 'lyricmotion-song-ascii-1' },
            { text: compactVowelVariant(detailed.text), source: 'style-alternate', confidence: Math.max(0.55, detailed.confidence - 0.12), preference: 0.82, style: 'compact-vowels' },
            { text: compactGeminateVariant(detailed.text), source: 'style-alternate', confidence: Math.max(0.50, detailed.confidence - 0.18), preference: 0.72, style: 'compact-gemination' }
        ];
        const seen = new Set();
        return candidates.filter(item => {
            if (!item.text || seen.has(item.text)) return false;
            seen.add(item.text);
            return true;
        }).slice(0, Math.max(1, Number(limit) || 3));
    }

    function phonologicalIR(input) {
        const detailed = romanizeDetailed(input);
        const units = [];
        detailed.spans.forEach((span, spanIndex) => {
            (span.phonemes || []).forEach(unit => {
                units.push(Object.assign({
                    spanIndex,
                    language: span.language,
                    script: span.script
                }, unit));
            });
        });
        return {
            engine: `LyricG2P ${VERSION}`,
            style: ROMANIZATION_STYLE,
            input: detailed.input,
            text: detailed.text,
            languages: detailed.languages,
            units
        };
    }

    function exportRomanizationCase(input, expected = '') {
        const detailed = romanizeDetailed(input);
        return {
            engine: `LyricG2P ${VERSION}`,
            style: ROMANIZATION_STYLE.id,
            native: detailed.input,
            generated: detailed.text,
            expected: String(expected || ''),
            languages: detailed.languages,
            confidence: detailed.confidence,
            confidenceKind: detailed.confidenceKind,
            weakSpanCount: detailed.weakSpanCount,
            spans: detailed.spans.map(span => ({
                source: span.source,
                generated: span.romanized,
                language: span.language,
                path: span.path,
                confidence: span.confidence,
                uncertainty: span.uncertainty,
                tokenClass: span.tokenClass,
                rules: (span.phonemes || []).flatMap(unit => unit.rules || [])
            }))
        };
    }

    function explain(input) {
        const detailed =
            romanizeDetailed(input);

        return Object.assign(
            {
                engine: `LyricG2P ${VERSION}`,
                strategy:
                    'scripted-english-recovery+targeted-learned-schwa+language-evidence+phonological-ir+production-morphology+lexicon+context+confidence+provenance'
            },
            detailed
        );
    }

    const SUPPORTED_LANGUAGE_FAMILIES = Object.freeze([
        'Hindi/Devanagari', 'Marathi', 'Bhojpuri', 'Nepali',
        'Punjabi/Gurmukhi', 'Punjabi/Shahmukhi/Urdu (lexicon-assisted)',
        'Malayalam', 'Tamil', 'Telugu', 'Kannada',
        'Bengali/Assamese', 'Gujarati', 'Odia',
        'Sinhala', 'Japanese', 'Korean', 'Chinese and broad Unicode fallback'
    ]);

    window.JellyfinLyricRomanizer = Object.freeze({
        version: VERSION,
        romanize,
        romanizeDetailed,
        scriptedEnglishRecovery,
        segmentText,
        detectLanguages,
        phonologicalIR,
        romanizationVariants,
        exportRomanizationCase,
        rankCandidates,
        selectCandidate,
        explain,
        mapBoundary,
        canRomanize,
        containsNativeScript,
        strategy: 'offline-lyricg2p-v6.6.0+scripted-english-recovery+loanword-pronunciation+targeted-learned-schwa+language-evidence+phonological-ir+production-morphology+context+nbest+boundary-provenance+lazy-icu-fallback',
        supportedLanguageFamilies: SUPPORTED_LANGUAGE_FAMILIES,
        offlineOnly: true,
        romanizationStyle: ROMANIZATION_STYLE,
        confidenceSemantics: 'evidence-score-not-probability',
        learnedModelBundled: false,
        learnedTransliterationModelBundled: false,
        scriptedEnglishRecoveryBundled: true,
        scriptedEnglishRecoveryPolicy: 'multi-anchor-context+native-lexicon-guards+phonetic-pronunciation-signatures',
        loanwordPronunciationBundled: true,
        loanwordPronunciationPolicy: 'curated-nukta-omission+lexicalized-compounds+native-aspiration-guards',
        targetedLearnedAdvisorsBundled: true,
        learnedComponentsBundled: true,
        learnedComponents: Object.freeze([
            Object.freeze({
                id: 'hi-schwa-logreg', language: 'hi', type: 'schwa-keep-delete',
                heldOutAccuracy: HINDI_SCHWA_MODEL_META.heldOutAccuracy,
                weightCount: HINDI_SCHWA_MODEL_META.weightCount,
                role: HINDI_SCHWA_MODEL_META.role,
                metricStatus: HINDI_SCHWA_MODEL_META.metricStatus,
                offline: true
            }),
            Object.freeze({
                id: 'pa-schwa-logreg', language: 'pa', type: 'schwa-keep-delete',
                heldOutAccuracy: PUNJABI_SCHWA_MODEL_META.heldOutAccuracy,
                weightCount: PUNJABI_SCHWA_MODEL_META.weightCount,
                role: PUNJABI_SCHWA_MODEL_META.role,
                metricStatus: PUNJABI_SCHWA_MODEL_META.metricStatus,
                offline: true
            })
        ]),
        learnedComponentPolicy: 'lazy-advisor-only-on-diagnostics-and-candidate-research; deterministic-production-hot-path',
        candidateSelectionPolicy: 'category-aware-authority+language+confidence+style+phonological-agreement',
        candidateRanker: 'hybrid-category-aware-style-context-confidence-v3',
        fallbackEntries: FALLBACK_ENTRY_COUNT
    });
})();
