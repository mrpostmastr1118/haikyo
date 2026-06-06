export type RegionType = 'country' | 'prefecture';

export interface Spot {
  id: string;
  name: string;
  locationLabel: string;
  regionKey: string;      // ADM0_A3 for countries, nam_ja for Japan prefectures
  regionType: RegionType;
  regionLabel: string;    // Human-readable region name
  lat: number;
  lng: number;
  year_abandoned?: number;
  excerpt: string;
  body: string;
  image: string;
  tags: string[];
}

export const SPOTS: Spot[] = [
  {
    id: 'gunkanjima',
    name: '時の孤島、軍艦島',
    locationLabel: '長崎県 / 日本',
    regionKey: '長崎県',
    regionType: 'prefecture',
    regionLabel: '長崎県',
    lat: 32.6277,
    lng: 129.7388,
    year_abandoned: 1974,
    excerpt: '海に浮かぶ鉄とコンクリートの廃城。風化する壁の向こうに、かつての生の痕跡が刻まれている。',
    body: `端島——軍艦島と呼ばれるこの小さな島は、かつて海底炭鉱の上に築かれた人口密度世界最高の集落だった。1974年の閉山とともに全住民が去り、50年の時を経た今、コンクリートの廃墟と海風だけが残る。\n\n波に削られた護岸、崩れかけたアパートの窓枠、錆びた遊具。それらは破壊ではなく、自然への還元の過程だ。潮風が建物の空洞を吹き抜けるとき、ここに根を張っていた何万もの人生が、静かに共鳴する。`,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    tags: ['廃都市', '海', '産業遺産'],
  },
  {
    id: 'ta-prohm',
    name: '木が石を抱く聖堂、タ・プローム',
    locationLabel: 'シェムリアップ / カンボジア',
    regionKey: 'KHM',
    regionType: 'country',
    regionLabel: 'カンボジア',
    lat: 13.4348,
    lng: 103.8896,
    year_abandoned: 1432,
    excerpt: '熱帯の根が石造りの寺院を静かに侵食する。征服ではなく、共生。自然と人工が溶け合う場所。',
    body: `12世紀に建てられたヒンドゥー・仏教寺院タ・プロームは、クメール帝国崩壊後の数百年間、密林に飲み込まれながら存在し続けた。ガジュマルとスポアン樹の根は、石の隙間から芽吹き、今では建物と一体となって天へ伸びる。\n\n修復家たちはあえて多くの木を残した。撤去すれば石が崩れる——根が建物を支えていたのだ。破壊と保護の境界が消えた場所。ここでは、人の手が作ったものと、自然が作るものの区別が、意味を失っていく。`,
    image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80',
    tags: ['遺跡', '密林', '寺院'],
  },
  {
    id: 'bokor',
    name: '霧の山頂の白い宮殿、ボコール丘',
    locationLabel: 'カンポット / カンボジア',
    regionKey: 'KHM',
    regionType: 'country',
    regionLabel: 'カンボジア',
    lat: 10.6383,
    lng: 104.0057,
    year_abandoned: 1972,
    excerpt: '雲の上に佇む植民地時代のホテルと教会。霧が晴れるとき、一瞬だけその白い輪郭が現れる。',
    body: `標高1,079m、フランス植民地時代にボコール山の頂に建設された避暑地。ボコール・ヒル・ステーションは1920年代の絶頂期を経て、内戦と革命の荒波に翻弄され、二度にわたって放棄された。\n\n現在でも、山頂の霧の中に白い廃ホテルと教会が立つ。熱帯にある建物とは思えないほど壁が白く、欧州の山岳リゾートの幻影を見るようだ。霧が流れるたびに、建物は現れたり消えたりする。`,
    image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&q=80',
    tags: ['廃ホテル', '霧', '植民地遺構'],
  },
  {
    id: 'pripyat',
    name: '時が止まった都市、プリピャチ',
    locationLabel: 'キエフ州 / ウクライナ',
    regionKey: 'UKR',
    regionType: 'country',
    regionLabel: 'ウクライナ',
    lat: 51.4045,
    lng: 30.0548,
    year_abandoned: 1986,
    excerpt: '1986年4月27日の朝、住民5万人は36時間以内に去った。以来、街は静寂の中で独自の進化を続けている。',
    body: `チェルノブイリ原発から3kmの位置に建設された計画都市プリピャチは、ソ連の理想を体現した近代都市だった。遊園地、病院、スーパーマーケット、学校。すべてが整い、すべてが機能していた——ある朝までは。\n\n今、観覧車は赤い鉄の骨格だけを晒し、体育館の床板を苔が覆い、プールの底に雨水が溜まる。しかし窓から鹿が覗き、天井から鳥が巣を作り、野生の森が街の中心部まで迫っている。人が去ったあと、生命は別の形で戻ってきた。`,
    image: 'https://images.unsplash.com/photo-1527604399580-59a2d82e1b34?w=800&q=80',
    tags: ['廃都市', '自然回帰', '近代遺構'],
  },
  {
    id: 'kolmanskop',
    name: '砂漠に沈む宝石、コルマンスコップ',
    locationLabel: 'ルーデリッツ近郊 / ナミビア',
    regionKey: 'NAM',
    regionType: 'country',
    regionLabel: 'ナミビア',
    lat: -26.7079,
    lng: 15.2273,
    year_abandoned: 1956,
    excerpt: 'かつてダイヤモンドで栄えたドイツ入植地の街が、今はナミブの砂に静かに飲まれていく。',
    body: `20世紀初頭、砂漠でダイヤモンドが発見され、この地には一夜にして欧州風の邸宅が建ち並んだ。カジノ、病院、スケートリンクまであったという。しかし鉱脈が尽きると住民は去り、砂漠が帰ってきた。\n\nナミブの砂は窓から、ドアから、床下から忍び込む。室内に砂丘が生まれ、かつてダイニングルームだった空間が、砂と光の彫刻に変わっていく。崩壊ではなく、変容。砂漠がこの場所を、もう一度自分のものにしようとしている。`,
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
    tags: ['廃村', '砂漠', '植民地遺構'],
  },
  {
    id: 'caithness',
    name: '苔むす塔、キルクホーン城',
    locationLabel: 'ケイスネス / スコットランド',
    regionKey: 'GBR',
    regionType: 'country',
    regionLabel: 'イギリス',
    lat: 58.4384,
    lng: -3.0982,
    year_abandoned: 1679,
    excerpt: '北端の荒野に立つ中世の城塔。風が吹き抜ける石の空洞の中で、苔と地衣類が新たな世界を築く。',
    body: `スコットランド北端、オークニー諸島が見える丘の上にキルクホーン城の塔が立つ。17世紀に炎上して以来、300年以上にわたって廃墟のまま風雨に晒されてきた。\n\n石灰岩の壁面は今、無数の地衣類と苔に覆われている。緑・灰・オレンジ・黄——色彩が幾何学的なパターンを描く。これはひとつの生態系だ。城が生きていたときには存在しなかった命が、廃墟の上に根づいている。崩壊は終わりではなく、別の始まりの序章だった。`,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    tags: ['廃城', '苔', '中世遺構'],
  },
];

// Group spots by regionKey, preserving first-encounter order
export function getRegionGroups(): { regionKey: string; regionLabel: string; spots: Spot[] }[] {
  const order: string[] = [];
  const map = new Map<string, Spot[]>();
  for (const spot of SPOTS) {
    if (!map.has(spot.regionKey)) {
      order.push(spot.regionKey);
      map.set(spot.regionKey, []);
    }
    map.get(spot.regionKey)!.push(spot);
  }
  return order.map((key) => ({
    regionKey: key,
    regionLabel: map.get(key)![0].regionLabel,
    spots: map.get(key)!,
  }));
}

export const ARTICLE_REGION_KEYS = new Set(SPOTS.map((s) => s.regionKey));
