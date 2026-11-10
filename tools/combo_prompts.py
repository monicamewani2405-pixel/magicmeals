# Map each unique normalized dish combination to a detailed, mouthwatering culinary prompt
# Guidelines:
# - Authentic Indian dining feast showing ALL dishes in the combo together
# - Pure vegetarian, strictly NO onion rings/slices, NO garlic cloves, NO root vegetables (carrots/potatoes unless the dish inherently requires it, but avoid garnishes of raw onion/garlic so it can be 100% reused for Jain)
# - Accompaniments: warm fresh phulka/roti or puri, fresh lemon wedges, green chilies, cilantro garnish
# - Commercial food photography, 45-degree angle, rustic dark wooden table or brass thali, steam, vibrant colors

PROMPTS = {
    # 1. South Indian Breakfast: Idli Sambar + Upma
    ('idli-sambar', 'upma'): {
        'name': 'south_indian_breakfast',
        'prompt': """Mouthwatering commercial culinary food photography of authentic South Indian Breakfast spread.
On a rich wooden dining tabletop with fresh green banana leaf presentation:
1. Steaming soft, fluffy, snow-white steamed Idlis served with a rich, aromatic Madras Sambar in a traditional brass bowl, and vibrant coconut chutney.
2. A golden brass katori of fluffy, savory Rawa Upma tempered with mustard seeds, curry leaves, ginger, green chilies, and roasted cashews.
Delicate rising steam, soft morning directional window light, rustic South Indian filter coffee tumbler in the background bokeh, photorealistic, vibrant, delicious."""
    },

    # 2. Maharashtrian Nashta: Kanda Poha + Mumbai Misal
    ('kanda-poha', 'mumbai-misal'): {
        'name': 'maharashtrian_nashta',
        'prompt': """Commercial culinary food photography of a traditional Maharashtrian breakfast nashta feast on a rustic wooden table:
1. A traditional brass plate of golden tempered Poha with roasted peanuts, curry leaves, fresh grated coconut, and a slice of lemon.
2. A fiery, aromatic terracotta bowl of authentic Mumbai Misal with spiced sprouted moth beans in red rassa gravy, topped with crispy crunchy farsan and coriander.
Accompanied by butter-toasted soft pav buns and a lemon wedge. Rising steam, appetizing textures, warm sunlight, commercial food magazine quality."""
    },

    # 3. Fiesta Bowl: Sweet Corn Soup + Mexican Rice
    ('sweet-corn-soup', 'mexican-rice'): {
        'name': 'fiesta_bowl',
        'prompt': """Vibrant commercial food photography of a colorful Fiesta meal spread on a warm rustic wooden table:
1. A warm ceramic bowl of velvety Sweet Corn Soup topped with tender golden corn kernels, fresh spring greens, and a touch of cracked black pepper.
2. An artisanal skillet of zesty, flavorful Mexican Rice loaded with sweet corn, bell peppers, tomatoes, and Mexican spices.
Fresh cilantro, lime wedges, warm ambient lighting, beautiful steam, high-end culinary photography."""
    },

    # 4. Dinner & Dessert: Dal Khichdi + Gajar Halwa
    ('dal-khichdi', 'gajar-halwa'): {
        'name': 'dinner_dessert',
        'prompt': """Appetizing commercial food photography of a comforting homestyle Indian dinner and dessert spread on a rustic wooden table:
1. An artisanal handcrafted stoneware bowl of comforting yellow Moong Dal Khichdi, thick and velvety with basmati rice, topped with crackled cumin seeds, a whole red chili, curry leaves, and a melting pool of golden cow desi ghee.
2. A traditional brass bowl of rich reddish-amber Gajar Ka Halwa slow-cooked in cow ghee and mawa, generously garnished with roasted cashews and slivered pistachios.
Delicate warm steam, roasted papad curl, antique brass cutlery, soft warm dining lighting."""
    },

    # 5. Indo-Chinese Feast: Hot & Sour Soup + Manchurian Fried Rice
    ('hot-and-sour-soup', 'fried-rice-manchurian'): {
        'name': 'indo_chinese_feast',
        'prompt': """Mouthwatering commercial culinary food photography of an authentic Indo-Chinese dining feast on a dark slate tabletop:
1. A steaming ceramic bowl of rich, dark, aromatic Hot and Sour Soup loaded with shredded cabbage, carrots, bell peppers, tofu, and fresh coriander.
2. A sizzling wok plate of fragrant Manchurian Fried Rice with colorful wok-tossed vegetables and golden vegetable Manchurian balls glazed in savory Indo-Chinese gravy.
Chopsticks, rising steam, dramatic restaurant lighting, glossy textures, ultra-realistic commercial food styling."""
    },

    # 6. North Indian Royal: Paneer Butter Masala + Jeera Rice + Rawa Sheera (Already generated sample! We will also have PBM + Tawa Pulao and PBM + Veg Biryani)
    ('paneer-butter-masala', 'tawa-pulao', 'rawa-sheera'): {
        'name': 'pbm_tawa_pulao_rawa_sheera',
        'prompt': """Commercial culinary food photography of a royal North Indian banquet spread on a dark wooden dining table:
1. A traditional copper handi of rich, velvety orange-red Paneer Butter Masala with soft golden cottage cheese cubes, cream swirl, and cilantro garnish.
2. A brass platter of aromatic, spicy Mumbai-style Tawa Pulao loaded with green peas, bell peppers, and fresh coriander.
3. A golden brass katori of warm Rawa Sheera (sooji halwa) cooked in pure cow desi ghee, garnished with toasted cashews and saffron.
Accompanied by warm soft phulkas, lemon wedges, delicate rising steam, warm natural dining lighting."""
    },

    ('paneer-butter-masala', 'veg-biryani', 'rawa-sheera'): {
        'name': 'pbm_veg_biryani_rawa_sheera',
        'prompt': """Commercial culinary food photography of a grand North Indian royal thali spread on a dark wooden table:
1. A traditional copper handi of creamy, rich Paneer Butter Masala with golden paneer cubes and a swirl of fresh cream.
2. A royal ceramic handi of fragrant Dum Veg Biryani with long aromatic basmati rice grains layered with saffron, vegetables, and mint leaves.
3. A traditional brass bowl of rich golden desi ghee Rawa Sheera garnished with roasted cashews and saffron strands.
Accompanied by fresh warm rotis, sliced lemon, rising steam, editorial luxury dining photography."""
    },

    # 7. Comfort Combos: Rajma Masala + [Rice] + Gajar Halwa
    ('rajma-masala', 'jeera-rice', 'gajar-halwa'): {
        'name': 'rajma_jeera_gajar_halwa',
        'prompt': """Heartwarming commercial food photography of an iconic Punjabi Comfort Thali on a dark rustic wooden table:
1. A traditional brass handi of slow-simmered Punjabi Rajma Masala, rich thick spiced red kidney bean curry garnished with fresh cilantro and ginger juliennes.
2. A brass bowl of fragrant, fluffy Jeera Rice with roasted cumin seeds and fresh coriander with a ghee sheen.
3. A brass katori of glistening rich Gajar Ka Halwa garnished with roasted cashews and slivered pistachios.
Warm soft phulkas, fresh green chilies, lemon wedge, delicate rising steam, warm homely restaurant lighting."""
    },

    ('rajma-masala', 'tawa-pulao', 'gajar-halwa'): {
        'name': 'rajma_tawa_pulao_gajar_halwa',
        'prompt': """Commercial food photography of a hearty Indian dinner combo on a rustic dining table:
1. A rich terracotta bowl of authentic slow-cooked Rajma Masala with tender red kidney beans in thick spiced tomato gravy.
2. A platter of spicy, colorful Mumbai Tawa Pulao with basmati rice, peas, and bell peppers.
3. A traditional brass dessert bowl of rich, warm Gajar Ka Halwa garnished with toasted nuts.
Fresh rotis, lemon wedges, steam rising, warm restaurant lighting, commercial culinary magazine styling."""
    },

    ('rajma-masala', 'veg-biryani', 'gajar-halwa'): {
        'name': 'rajma_veg_biryani_gajar_halwa',
        'prompt': """High-end commercial culinary food photography of a comforting Indian feast on a dark wooden table:
1. A copper handi of authentic rich Punjabi Rajma Masala with spiced red kidney bean gravy and fresh coriander.
2. An artisanal clay handi of fragrant Hyderabadi Dum Veg Biryani with aromatic basmati rice and fresh mint.
3. A gleaming brass bowl of decadent Gajar Ka Halwa garnished with cashews and pistachios.
Soft phulkas, sliced lemon, gentle steam rising, beautiful directional sunlight, appetizing presentation."""
    },

    ('rajma-masala', 'fried-rice-manchurian', 'gajar-halwa'): {
        'name': 'rajma_manchurian_gajar_halwa',
        'prompt': """Commercial culinary food photography of a fusion Indian feast spread on a rustic table:
1. A deep ceramic bowl of hearty, slow-cooked Rajma Masala with thick spiced red bean curry.
2. A sizzling wok plate of Manchurian Fried Rice with savory vegetable Manchurian balls in rich glossy gravy.
3. A traditional brass dessert katori of warm, rich Gajar Ka Halwa topped with roasted cashews.
Delicate rising steam, warm natural lighting, appetizing textures, commercial food styling."""
    },

    ('rajma-masala', 'jeera-rice', 'rawa-sheera'): {
        'name': 'jain_rajma_jeera_rawa_sheera',
        'prompt': """Pure sattvic Indian culinary photography of Rajma Comfort Combo on a dark wooden table:
1. A traditional copper bowl of slow-cooked sattvic Rajma Masala (zero onion, zero garlic) in a rich spiced tomato-ginger gravy with fresh coriander.
2. A brass bowl of fluffy, aromatic Jeera Rice with cumin seeds and desi ghee.
3. A brass katori of golden cow ghee Rawa Sheera garnished with roasted cashews and saffron.
Soft phulka rotis, fresh lemon wedges, steam, commercial culinary photography."""
    },

    # 8. Homestyle Veg Makhanwala Combos
    ('veg-makhanwala', 'jeera-rice', 'gajar-halwa'): {
        'name': 'veg_makhanwala_jeera_gajar_halwa',
        'prompt': """Commercial food photography of a royal Veg Makhanwala meal feast on a rustic wooden dining table:
1. A traditional handi of velvety Veg Makhanwala loaded with tender garden vegetables (cauliflower, green beans, peas, bell peppers - strictly NO paneer/cottage cheese) in a rich buttery tomato-cashew makhani gravy with cream swirl.
2. A brass bowl of aromatic, fluffy basmati Jeera Rice.
3. A brass katori of rich, glistening Gajar Ka Halwa with roasted nuts.
Warm phulkas, lemon wedges, delicate rising steam, warm ambient lighting."""
    },

    ('veg-makhanwala', 'tawa-pulao', 'gajar-halwa'): {
        'name': 'veg_makhanwala_tawa_pulao_gajar_halwa',
        'prompt': """Commercial culinary food photography of a vibrant homestyle Indian meal on a dark wooden table:
1. A ceramic handi of rich, buttery Veg Makhanwala with fresh vegetables (green peas, beans, cauliflower, bell peppers - NO paneer) in creamy makhani sauce.
2. A brass platter of aromatic, spiced Mumbai Tawa Pulao.
3. A traditional brass bowl of warm, rich Gajar Ka Halwa garnished with cashews and pistachios.
Soft rotis, fresh lemon, rising steam, natural window lighting."""
    },

    ('veg-makhanwala', 'veg-biryani', 'gajar-halwa'): {
        'name': 'veg_makhanwala_biryani_gajar_halwa',
        'prompt': """Commercial food photography of a deluxe Indian feast on a dark wooden table:
1. A copper handi of velvety Veg Makhanwala full of colorful vegetables in rich tomato-cashew gravy with a swirl of cream (NO paneer).
2. A royal ceramic bowl of fragrant saffron Dum Veg Biryani with long basmati grains.
3. A glistening brass bowl of warm Gajar Ka Halwa with golden cashews.
Phulkas in a basket, fresh lemon, soft rising steam, appetizing magazine quality."""
    },

    ('veg-makhanwala', 'jeera-rice', 'dal-fry'): {
        'name': 'jain_veg_makhanwala_jeera_dal_fry',
        'prompt': """Pure sattvic Indian vegetarian feast on an authentic brass thali and dark wooden table:
1. A copper bowl of sattvic Veg Makhanwala (zero onion, zero garlic) with vegetables in rich creamy butter-tomato sauce.
2. A brass katori of comforting yellow Dal Fry with cumin-ghee tadka and curry leaves.
3. A brass plate of fluffy basmati Jeera Rice with toasted cumin seeds.
Warm rotis, lemon wedge, green chilies, delicate steam, photorealistic commercial food photography."""
    },

    # 9. Street Style Combos: Pav Bhaji + Rawa Sheera & Pav Bhaji + Tawa Pulao
    ('pav-bhaji', 'rawa-sheera'): {
        'name': 'pav_bhaji_rawa_sheera',
        'prompt': """Mouthwatering commercial food photography of authentic Mumbai Street Style feast on a dark rustic wooden table:
1. A traditional copper platter of rich, spicy, buttery mashed Pav Bhaji topped with a generous melting slab of Amul butter and fresh coriander, served with two golden butter-toasted pav buns cut in half and a fresh lemon wedge.
2. A traditional brass katori of golden, rich Rawa Sheera (sooji halwa) roasted in cow desi ghee, garnished with toasted cashews and saffron.
Piping hot rising steam, melting butter sheen, warm street food aesthetic, high-end commercial quality."""
    },

    ('pav-bhaji', 'tawa-pulao'): {
        'name': 'pav_bhaji_tawa_pulao',
        'prompt': """Commercial culinary food photography of the ultimate Mumbai Street Food feast on a rustic wooden table:
1. A sizzling copper plate of rich, spiced Pav Bhaji with a melting square of butter, accompanied by soft butter-grilled pav buns and fresh lemon.
2. A traditional brass platter of spicy, vibrant Tawa Pulao tossed with basmati rice, bell peppers, green peas, and fresh cilantro.
Rising hot steam, glossy butter textures, authentic Mumbai flavor aesthetic, magazine editorial styling."""
    },

    # 10. Paneer Bhurji Protein Veg Combos
    ('paneer-bhurji', 'jeera-rice', 'aam-ras'): {
        'name': 'paneer_bhurji_jeera_aam_ras',
        'prompt': """Commercial culinary food photography of a high-protein Indian summer feast on a dark rustic wooden table:
1. A traditional brass kadhai of savory, spiced Paneer Bhurji (crumbled cottage cheese scrambled with tomatoes, turmeric, green peas, and fresh coriander - zero raw onion rings).
2. A brass bowl of fluffy, fragrant Jeera Rice with cumin seeds and desi ghee sheen.
3. An elegant glass bowl or brass katori of thick, velvety, golden-yellow Alphonso Aam Ras garnished with cardamom and mint leaf.
Warm soft phulka rotis, lemon wedge, delicate rising steam, bright appetizing lighting."""
    },

    ('paneer-bhurji', 'veg-biryani', 'aam-ras'): {
        'name': 'paneer_bhurji_biryani_aam_ras',
        'prompt': """Commercial food photography of a luxurious Indian dining spread on a dark wooden table:
1. A brass handi of spiced, savory scrambled Paneer Bhurji garnished with fresh cilantro and green chilies.
2. A royal ceramic bowl of fragrant saffron Dum Veg Biryani with long basmati grains.
3. A bowl of luscious, thick pure Alphonso Aam Ras with a glistening mango texture.
Soft rotis, fresh lemon wedges, rising steam, commercial culinary photography."""
    },

    ('paneer-bhurji', 'tawa-pulao', 'aam-ras'): {
        'name': 'paneer_bhurji_tawa_pulao_aam_ras',
        'prompt': """Commercial culinary food photography of a vibrant Indian meal combo on a rustic dining table:
1. A copper skillet of authentic scrambled Paneer Bhurji with tomatoes, spices, and fresh herbs.
2. A platter of spicy Mumbai Tawa Pulao tossed with basmati rice and crisp vegetables.
3. A glass katori of thick, rich golden Alphonso Aam Ras.
Warm phulkas, lemon slices, rising steam, warm natural dining lighting."""
    },

    # 11. Punjabi Swaad: Pind Ke Chhole Combos
    ('pind-ke-chhole', 'jeera-rice', 'gajar-halwa'): {
        'name': 'chhole_jeera_gajar_halwa',
        'prompt': """Commercial culinary food photography of an authentic Punjabi Swaad feast on a dark wooden table:
1. A traditional copper handi of rich, dark, authentic Amritsari Pind Ke Chhole (tender chickpeas slow-simmered in robust Punjabi spices, pomegranate seed, and ginger juliennes, topped with green chilies and cilantro).
2. A brass bowl of fluffy, fragrant basmati Jeera Rice.
3. A traditional brass katori of glistening warm Gajar Ka Halwa garnished with golden cashews.
Accompanied by soft bhature or warm phulkas, lemon wedge, rising steam, editorial food photography."""
    },

    ('pind-ke-chhole', 'tawa-pulao', 'gajar-halwa'): {
        'name': 'chhole_tawa_pulao_gajar_halwa',
        'prompt': """Commercial food photography of a hearty Punjabi meal on a rustic wooden dining table:
1. A terracotta bowl of rich, spicy dark Pind Ke Chhole garnished with fresh ginger and cilantro.
2. A brass plate of colorful, spiced Mumbai Tawa Pulao with basmati rice and green peas.
3. A brass bowl of warm, decadent Gajar Ka Halwa with roasted nuts.
Warm rotis, fresh lemon wedges, steam, commercial food photography."""
    },

    ('pind-ke-chhole', 'veg-biryani', 'gajar-halwa'): {
        'name': 'chhole_biryani_gajar_halwa',
        'prompt': """Commercial food photography of a grand Punjabi celebration spread on a dark wooden table:
1. A copper handi of dark, aromatic Pind Ke Chhole with robust Punjabi spices and ginger.
2. A ceramic handi of fragrant saffron Dum Veg Biryani with long basmati grains.
3. A glistening brass bowl of warm Gajar Ka Halwa topped with slivered almonds and cashews.
Fresh phulkas, lemon wedge, gentle steam, appetizing dining light."""
    },

    ('pind-ke-chhole', 'jeera-rice', 'dal-fry'): {
        'name': 'jain_chhole_jeera_dal_fry',
        'prompt': """Pure sattvic Indian vegetarian feast on an authentic brass thali on a dark wooden table:
1. A copper bowl of sattvic Pind Ke Chhole (tender spiced chickpeas slow-cooked with ginger, spices, zero onion, zero garlic).
2. A brass bowl of comforting yellow Dal Fry with cumin ghee tadka.
3. A brass platter of fluffy basmati Jeera Rice.
Warm phulka rotis, lemon wedge, rising steam, natural warm lighting."""
    },

    # 12. Classic Dinner Combos
    ('tomato-soup', 'dal-makhani', 'jeera-rice'): {
        'name': 'tomato_soup_dal_makhani_jeera',
        'prompt': """Commercial culinary food photography of a Classic Dinner spread on a dark rustic wooden table:
1. A ceramic bowl of velvety roasted Tomato Soup with a swirl of cream and fresh basil/cilantro.
2. A traditional copper handi of slow-cooked, creamy Dal Makhani (black lentils simmered with butter and cream).
3. A brass bowl of fragrant, fluffy Jeera Rice with toasted cumin seeds.
Warm soft rotis, butter, rising steam, cozy evening restaurant lighting."""
    },

    ('dal-makhani', 'jeera-rice'): {
        'name': 'dal_makhani_jeera',
        'prompt': """Commercial food photography of a North Indian dinner on a dark rustic wooden table:
1. A traditional copper handi of slow-cooked Dal Makhani, rich and velvety black lentils cooked with butter and cream, garnished with cream swirl and fresh coriander.
2. A brass bowl of fragrant, fluffy basmati Jeera Rice with roasted cumin seeds and a desi ghee sheen.
Warm soft phulka rotis in a basket, lemon wedge, rising steam, cozy dining atmosphere."""
    },

    ('dal-fry', 'jeera-rice'): {
        'name': 'dal_fry_jeera',
        'prompt': """Commercial food photography of a comforting homestyle meal on a rustic wooden table:
1. A traditional brass handi of golden Dal Fry with aromatic desi ghee tadka of cumin seeds, curry leaves, and a whole dried red chili.
2. A brass plate of fluffy, aromatic basmati Jeera Rice with crackled cumin seeds.
Warm soft phulkas, roasted papad, lemon wedge, delicate rising steam, warm natural lighting."""
    },

    # 13. Royal & Dessert Combos
    ('veg-biryani', 'rawa-sheera'): {
        'name': 'biryani_rawa_sheera',
        'prompt': """Commercial culinary food photography of a Royal Biryani & Dessert spread on a dark wooden table:
1. An artisanal ceramic handi of fragrant Dum Veg Biryani with long saffron basmati rice grains layered with tender spiced vegetables, mint, and saffron.
2. A traditional brass katori of golden, rich Rawa Sheera roasted in pure cow desi ghee and garnished with toasted cashews and saffron.
Delicate rising steam, lemon wedge, antique brass spoon, warm ambient lighting."""
    },

    ('tawa-pulao', 'aam-ras'): {
        'name': 'tawa_pulao_aam_ras',
        'prompt': """Commercial food photography of a Royal Mumbai lunch spread on a rustic wooden table:
1. A brass platter of colorful, spicy Mumbai Tawa Pulao with basmati rice, green peas, and bell peppers, garnished with fresh cilantro and lemon wedge.
2. An elegant glass bowl of thick, velvety, golden Alphonso Aam Ras with glistening mango pulp.
Delicate rising steam, bright afternoon natural light, highly appetizing."""
    },

    ('veg-biryani', 'aam-ras'): {
        'name': 'biryani_aam_ras',
        'prompt': """Commercial food photography of a Royal Biryani & Mango Royale meal on a dark wooden table:
1. A royal handi of fragrant saffron Dum Veg Biryani with long basmati grains, vegetables, and mint leaves.
2. A traditional bowl of luscious, thick Alphonso Aam Ras made from pure mango pulp with a touch of cardamom.
Rising steam, warm natural lighting, appetizing textures."""
    },

    ('schezwan-rice', 'aam-ras'): {
        'name': 'schezwan_rice_aam_ras',
        'prompt': """Commercial food photography of a Royal Fusion meal spread on a dark wooden table:
1. A wok bowl of fiery red Schezwan Fried Rice tossed with colorful vegetables and Indo-Chinese schezwan chili sauce.
2. A cooling bowl of luscious, thick golden Alphonso Aam Ras.
Rising steam, vibrant colors, dramatic restaurant lighting."""
    },

    ('schezwan-rice', 'rawa-sheera'): {
        'name': 'schezwan_rice_rawa_sheera',
        'prompt': """Commercial food photography of an Indo-Chinese and traditional dessert pairing on a dark table:
1. A steaming wok plate of spicy, aromatic Schezwan Fried Rice with crisp vegetables and fresh scallions.
2. A traditional brass katori of warm golden desi ghee Rawa Sheera garnished with cashews.
Rising steam, vibrant textures, commercial culinary quality."""
    },

    # 14. Light Comfort Dal Khichdi Combos
    ('dal-khichdi', 'aam-ras'): {
        'name': 'dal_khichdi_aam_ras',
        'prompt': """Commercial food photography of a Comfort & Sweet summer meal on a rustic wooden table:
1. A handcrafted stoneware bowl of comforting yellow Moong Dal Khichdi with cumin ghee tadka, curry leaves, and a melting dollop of cow ghee.
2. A bowl of thick, velvety golden Alphonso Aam Ras garnished with cardamom.
Roasted papad, antique brass spoon, gentle rising steam, warm natural light."""
    },

    ('dal-khichdi', 'rawa-sheera'): {
        'name': 'dal_khichdi_rawa_sheera',
        'prompt': """Commercial food photography of a pure comfort Indian lunch on a rustic wooden table:
1. An artisanal bowl of creamy yellow Moong Dal Khichdi with cumin-curry leaf desi ghee tadka and melting ghee in the center.
2. A brass katori of warm, rich golden Rawa Sheera with toasted cashews and saffron.
Roasted papad, delicate rising steam, cozy dining lighting."""
    },

    ('dal-khichdi', 'moong-masala'): {
        'name': 'dal_khichdi_moong_masala',
        'prompt': """Commercial culinary food photography of a light, wholesome Indian dinner on a dark wooden table:
1. A handcrafted ceramic bowl of comforting yellow Moong Dal Khichdi with cumin ghee tempering and fresh cilantro.
2. A traditional copper bowl of spiced, savory Moong Masala (tender green moong lentils in homestyle tomato gravy).
Warm soft phulkas, lemon wedge, delicate rising steam, warm natural lighting."""
    }
}
