    // Complete Product Database with Real Imagery (40 Products & Combos)
    const PRODUCTS = [
      {
        id: 'rajma-masala',
        title: 'Authentic Punjabi Rajma Masala',
        category: 'Meals',
        price: 205,
        mrp: 240,
        img: 'pouch-art/rajma-masala-front-processed.png',
        jain: false,
        spice: 'Medium',
        rating: 4.9,
        reviews: 168,
        weight: '95g net (makes 250g)',
        calories: '440 kcal',
        protein: '13.0g',
        desc: 'Rich kidney beans slow-simmered in a robust onion, ginger, garlic, and tomato gravy infused with authentic Punjabi spices. Interactive 3D pouch available.',
        has3D: true
      },
      {
        id: 'paneer-butter-masala',
        title: 'Rich Paneer Butter Masala',
        category: 'Meals',
        price: 230,
        mrp: 260,
        img: 'assets/products/paneer_butter_masala.png',
        jain: true,
        spice: 'Medium',
        rating: 4.9,
        reviews: 215,
        weight: '85g net (makes 260g)',
        calories: '380 kcal',
        protein: '14.0g',
        desc: 'Tender paneer cubes in a velvety tomato-butter gravy infused with rich cashew paste and aromatic kasuri methi.'
      },
      {
        id: 'paneer-bhurji',
        title: 'Amritsari Paneer Bhurji',
        category: 'Meals',
        price: 240,
        mrp: 280,
        img: 'assets/products/paneer_bhurji.png',
        jain: true,
        spice: 'Medium',
        rating: 4.9,
        reviews: 140,
        weight: '80g net (makes 250g)',
        calories: '390 kcal',
        protein: '15.5g',
        desc: 'Crumbled cottage cheese sautéed with finely diced bell peppers, tomatoes, onions, and freshly ground Punjabi spices.'
      },
      {
        id: 'pind-ke-chhole',
        title: 'Amritsari Pind Ke Chhole',
        category: 'Meals',
        price: 210,
        mrp: 240,
        img: 'assets/products/pind_ke_chole.png',
        jain: true,
        spice: 'Spicy',
        rating: 4.8,
        reviews: 104,
        weight: '85g net (makes 260g)',
        calories: '330 kcal',
        protein: '12.0g',
        desc: 'Robust chickpeas simmered with roasted tea leaves, dried pomegranate seeds, and Punjabi garam masala.'
      },
      {
        id: 'pav-bhaji',
        title: 'Mumbai Street Pav Bhaji',
        category: 'Meals',
        price: 195,
        mrp: 225,
        img: 'assets/products/pav_bhaji.png',
        jain: true,
        spice: 'Medium',
        rating: 4.9,
        reviews: 290,
        weight: '80g net (makes 250g)',
        calories: '290 kcal',
        protein: '6.8g',
        desc: 'Zesty mashed vegetable curry infused with authentic Mumbai tava masala and butter. Pair with toasted pav or roti.'
      },
      {
        id: 'bhindi-masala',
        title: 'Homestyle Bhindi Masala',
        category: 'Meals',
        price: 195,
        mrp: 230,
        img: 'assets/products/bhindi_masala.png',
        jain: false,
        spice: 'Medium',
        rating: 4.8,
        reviews: 92,
        weight: '75g net (makes 220g)',
        calories: '240 kcal',
        protein: '4.5g',
        desc: 'Crisp okra stir-fried with caramelized onions, roasted cumin, amchur (dry mango), and aromatic spices.'
      },
      {
        id: 'veg-kadhai',
        title: 'North Indian Veg Kadhai',
        category: 'Meals',
        price: 220,
        mrp: 255,
        img: 'assets/products/veg_kadhai.png',
        jain: true,
        spice: 'Spicy',
        rating: 4.7,
        reviews: 88,
        weight: '85g net (makes 260g)',
        calories: '310 kcal',
        protein: '8.0g',
        desc: 'Assorted crisp vegetables and bell peppers tossed in a spicy, freshly pounded coriander and red chili kadhai masala.'
      },
      {
        id: 'veg-makhanwala',
        title: 'Shahi Veg Makhanwala',
        category: 'Meals',
        price: 225,
        mrp: 260,
        img: 'assets/products/veg_makhanwala.png',
        jain: true,
        spice: 'Mild',
        rating: 4.9,
        reviews: 112,
        weight: '85g net (makes 260g)',
        calories: '340 kcal',
        protein: '7.8g',
        desc: 'Garden fresh vegetables slow-cooked in a creamy, buttery tomato-cashew gravy with a hint of fragrant fenugreek.'
      },
      {
        id: 'moong-masala',
        title: 'Nutritious Moong Masala',
        category: 'Meals',
        price: 185,
        mrp: 215,
        img: 'assets/products/moong_masala.png',
        jain: true,
        spice: 'Mild',
        rating: 4.8,
        reviews: 76,
        weight: '80g net (makes 240g)',
        calories: '280 kcal',
        protein: '11.0g',
        desc: 'Whole green gram cooked in a light, spiced homestyle gravy. Rich in natural plant protein and dietary fiber.'
      },

      // Dals
      {
        id: 'dal-makhani',
        title: 'Authentic Punjabi Dal Makhani',
        category: 'Dals',
        price: 200,
        mrp: 240,
        img: 'assets/products/dal_makhani.png',
        jain: false,
        spice: 'Medium',
        rating: 4.8,
        reviews: 142,
        weight: '85g net (makes 270g)',
        calories: '360 kcal',
        protein: '11.5g',
        desc: 'Slow-simmered black urad lentils cooked overnight with cream, butter, and gentle ginger-garlic seasoning.'
      },
      {
        id: 'dal-tadka',
        title: 'Dhaba Style Dal Tadka',
        category: 'Dals',
        price: 185,
        mrp: 215,
        img: 'assets/products/dal_tadka.png',
        jain: false,
        spice: 'Medium',
        rating: 4.9,
        reviews: 118,
        weight: '80g net (makes 260g)',
        calories: '300 kcal',
        protein: '10.5g',
        desc: 'Yellow toor dal tempered with double-shot pure desi ghee, cumin, garlic, and fiery Kashmiri red chilies.'
      },
      {
        id: 'dal-fry',
        title: 'Homestyle Yellow Dal Fry',
        category: 'Dals',
        price: 175,
        mrp: 205,
        img: 'assets/products/dal_fry.png',
        jain: true,
        spice: 'Mild',
        rating: 4.8,
        reviews: 95,
        weight: '80g net (makes 260g)',
        calories: '280 kcal',
        protein: '9.8g',
        desc: 'Classic yellow lentils tempered with ghee, cumin seeds, tomatoes, and fresh coriander. Simple and comforting.'
      },
      {
        id: 'gujarati-dal',
        title: 'Traditional Gujarati Dal',
        category: 'Dals',
        price: 175,
        mrp: 205,
        img: 'assets/products/gujarati_dal.png',
        jain: true,
        spice: 'Sweet',
        rating: 4.9,
        reviews: 130,
        weight: '80g net (makes 260g)',
        calories: '290 kcal',
        protein: '9.0g',
        desc: 'Sweet and tangy toor dal simmered with peanuts, jaggery, dried kokum, and whole cinnamon-clove tempering.'
      },

      // Rice & Khichdi
      {
        id: 'dal-khichdi',
        title: 'Comforting Dal Khichdi',
        category: 'Rice',
        price: 190,
        mrp: 220,
        img: 'assets/products/dal_khichdi.png',
        jain: true,
        spice: 'Mild',
        rating: 4.9,
        reviews: 184,
        weight: '80g net (makes 260g)',
        calories: '310 kcal',
        protein: '9.2g',
        desc: 'Classic comforting yellow moong dal and basmati rice tempered with cumin and pure ghee. Feels like home in a bowl.'
      },
      {
        id: 'masala-khichdi-kadhi',
        title: 'Masala Khichdi with Kadhi',
        category: 'Rice',
        price: 170,
        mrp: 199,
        img: 'assets/products/masala_khichdi_kadhi.png',
        jain: true,
        spice: 'Medium',
        rating: 4.8,
        reviews: 110,
        weight: '85g net (makes 280g)',
        calories: '320 kcal',
        protein: '8.5g',
        desc: 'Traditional spiced rice-lentil khichdi accompanied by sweet-tangy Gujarati yogurt kadhi.'
      },
      {
        id: 'veg-biryani',
        title: 'Royal Dum Veg Biryani',
        category: 'Rice',
        price: 225,
        mrp: 260,
        img: 'assets/products/veg_biryani.png',
        jain: true,
        spice: 'Medium',
        rating: 4.7,
        reviews: 130,
        weight: '85g net (makes 270g)',
        calories: '340 kcal',
        protein: '7.5g',
        desc: 'Long-grain fragrant basmati rice layered with garden vegetables, caramelized flavors, and whole aromatic spices.'
      },
      {
        id: 'jeera-rice',
        title: 'Fragrant Ghee Jeera Rice',
        category: 'Rice',
        price: 140,
        mrp: 165,
        img: 'assets/products/jeera_rice.png',
        jain: true,
        spice: 'Mild',
        rating: 4.8,
        reviews: 84,
        weight: '75g net (makes 250g)',
        calories: '270 kcal',
        protein: '5.0g',
        desc: 'Fluffy long-grain aged basmati rice tempered with pure desi cow ghee and roasted royal cumin seeds.'
      },
      {
        id: 'tawa-pulao',
        title: 'Mumbai Chowpatty Tawa Pulao',
        category: 'Rice',
        price: 195,
        mrp: 225,
        img: 'assets/products/tawa_pulao.png',
        jain: false,
        spice: 'Medium',
        rating: 4.8,
        reviews: 124,
        weight: '85g net (makes 260g)',
        calories: '330 kcal',
        protein: '6.5g',
        desc: 'Basmati rice tossed on a high-heat iron griddle with fresh vegetables, pav bhaji masala, and butter.'
      },
      {
        id: 'fried-rice-manchurian',
        title: 'Fried Rice with Manchurian Gravy',
        category: 'Rice',
        price: 210,
        mrp: 245,
        img: 'assets/products/fried_rice_with_manchurian_gravy.png',
        jain: false,
        spice: 'Spicy',
        rating: 4.7,
        reviews: 86,
        weight: '90g net (makes 280g)',
        calories: '350 kcal',
        protein: '7.0g',
        desc: 'Desi-Chinese wok rice tossed with scallions and paired with flavorful Manchurian gravy.'
      },
      {
        id: 'fried-rice',
        title: 'Desi Chinese Veg Fried Rice',
        category: 'Rice',
        price: 175,
        mrp: 205,
        img: 'assets/products/fried_rice.png',
        jain: false,
        spice: 'Medium',
        rating: 4.7,
        reviews: 78,
        weight: '80g net (makes 260g)',
        calories: '320 kcal',
        protein: '6.0g',
        desc: 'Wok-tossed basmati rice with finely shredded cabbage, carrots, bell peppers, soy sauce, and white pepper.'
      },
      {
        id: 'schezwan-rice',
        title: 'Fiery Schezwan Fried Rice',
        category: 'Rice',
        price: 195,
        mrp: 225,
        img: 'assets/products/schezwan_rice.png',
        jain: true,
        spice: 'Spicy',
        rating: 4.8,
        reviews: 96,
        weight: '80g net (makes 260g)',
        calories: '330 kcal',
        protein: '6.2g',
        desc: 'Spicy wok rice tossed with authentic homemade red chili Schezwan sauce, ginger, and crunchy celery.'
      },
      {
        id: 'mexican-rice',
        title: 'Zesty Mexican Fiesta Rice',
        category: 'Rice',
        price: 195,
        mrp: 230,
        img: 'assets/products/mexican_rice.png',
        jain: true,
        spice: 'Medium',
        rating: 4.7,
        reviews: 65,
        weight: '80g net (makes 260g)',
        calories: '310 kcal',
        protein: '6.8g',
        desc: 'Long-grain rice infused with ripe tomatoes, sweet corn, red kidney beans, bell peppers, and smoked paprika.'
      },

      // Breakfast & Breads
      {
        id: 'kanda-poha',
        title: 'Homestyle Kanda Poha',
        category: 'Breakfast',
        price: 120,
        mrp: 140,
        img: 'assets/products/kanda_poha.png',
        jain: false,
        spice: 'Mild',
        rating: 4.8,
        reviews: 98,
        weight: '70g net (makes 220g)',
        calories: '260 kcal',
        protein: '5.2g',
        desc: 'Flattened rice tempered with crunchy peanuts, curry leaves, onions, and fresh lemon. Light yet satisfying.'
      },
      {
        id: 'idli-sambar',
        title: 'South Indian Idli Sambar',
        category: 'Breakfast',
        price: 140,
        mrp: 165,
        img: 'assets/products/idli_sambar.png',
        jain: true,
        spice: 'Mild',
        rating: 4.9,
        reviews: 160,
        weight: '75g net (makes 240g)',
        calories: '280 kcal',
        protein: '8.0g',
        desc: 'Pillowy mini steamed idlis accompanied by aromatic vegetable lentil sambar. Authentic Udupi taste.'
      },
      {
        id: 'upma',
        title: 'South Indian Rava Upma',
        category: 'Breakfast',
        price: 120,
        mrp: 140,
        img: 'assets/products/upma.png',
        jain: true,
        spice: 'Mild',
        rating: 4.8,
        reviews: 90,
        weight: '70g net (makes 230g)',
        calories: '270 kcal',
        protein: '6.0g',
        desc: 'Roasted semolina tempered with mustard seeds, curry leaves, ginger, cashews, and garden vegetables in pure ghee.'
      },
      {
        id: 'mumbai-misal',
        title: 'Fiery Kolhapuri Mumbai Misal',
        category: 'Breakfast',
        price: 180,
        mrp: 210,
        img: 'assets/products/mumbai_misal.png',
        jain: false,
        spice: 'Spicy',
        rating: 4.9,
        reviews: 145,
        weight: '80g net (makes 260g)',
        calories: '310 kcal',
        protein: '9.5g',
        desc: 'Sprouted moth beans simmered in a zesty, spicy rassa (curry). Perfect with pav and crunchy farsan.'
      },
      {
        id: 'authentic-gujarati-thepla',
        title: 'Methi Thepla (Pack of 5)',
        category: 'Breads',
        price: 160,
        mrp: 190,
        img: 'https://magicmeals.shop/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2026-06-04-at-2.25.04-PM-rujily6xti8oefr2uleu168l4a89pddubsekayo1m8.jpeg',
        jain: true,
        spice: 'Mild',
        rating: 4.9,
        reviews: 310,
        weight: '125g (5 flatbreads)',
        calories: '360 kcal',
        protein: '9.0g',
        desc: 'Soft, nutritious whole-wheat flatbreads seasoned with fresh fenugreek, sesame, and yogurt. The quintessential travel meal.'
      },

      // Soups
      {
        id: 'tomato-soup',
        title: 'Creamy Ripe Tomato Soup',
        category: 'Soups',
        price: 95,
        mrp: 120,
        img: 'assets/products/tomato_soup.png',
        jain: true,
        spice: 'Mild',
        rating: 4.6,
        reviews: 75,
        weight: '40g net (makes 200ml)',
        calories: '110 kcal',
        protein: '2.5g',
        desc: 'Silky farm-fresh tomato soup lightly seasoned with black pepper and mild aromatic herbs.'
      },
      {
        id: 'sweet-corn-soup',
        title: 'Creamy Sweet Corn Veg Soup',
        category: 'Soups',
        price: 95,
        mrp: 120,
        img: 'assets/products/sweet_corn_soup.png',
        jain: true,
        spice: 'Mild',
        rating: 4.8,
        reviews: 82,
        weight: '45g net (makes 220ml)',
        calories: '130 kcal',
        protein: '3.0g',
        desc: 'Velvety soup loaded with crushed tender American sweet corn kernels, spring onions, and gentle white pepper.'
      },
      {
        id: 'hot-and-sour-soup',
        title: 'Desi Hot & Sour Veg Soup',
        category: 'Soups',
        price: 95,
        mrp: 120,
        img: 'assets/products/hot_&_sour_soup.png',
        jain: false,
        spice: 'Spicy',
        rating: 4.7,
        reviews: 68,
        weight: '45g net (makes 220ml)',
        calories: '120 kcal',
        protein: '2.8g',
        desc: 'Tangy, spicy soup infused with dark soy, vinegar, black pepper, shredded cabbage, carrots, and mushrooms.'
      },

      // Desserts
      {
        id: 'gajar-halwa',
        title: 'Gajar Ka Halwa Delight',
        category: 'Desserts',
        price: 150,
        mrp: 180,
        img: 'assets/products/gajar_halwa.png',
        jain: false,
        spice: 'Sweet',
        rating: 5.0,
        reviews: 240,
        weight: '75g net (makes 180g)',
        calories: '320 kcal',
        protein: '5.0g',
        desc: 'Sweet winter carrots slow-cooked in pure cow ghee, whole milk mawa, cardamom, and roasted cashews.'
      },
      {
        id: 'aam-ras',
        title: 'Pure Alphonso Aam Ras',
        category: 'Desserts',
        price: 180,
        mrp: 210,
        img: 'assets/products/aam_ras.png',
        jain: true,
        spice: 'Sweet',
        rating: 4.9,
        reviews: 195,
        weight: '60g net (makes 200ml)',
        calories: '190 kcal',
        protein: '1.5g',
        desc: '100% natural pulp crafted from authentic Ratnagiri Alphonso mangoes. Zero artificial essence.'
      },
      {
        id: 'rawa-sheera',
        title: 'Desi Ghee Rawa Sheera',
        category: 'Desserts',
        price: 140,
        mrp: 165,
        img: 'assets/products/rawa_sheera.png',
        jain: true,
        spice: 'Sweet',
        rating: 4.9,
        reviews: 115,
        weight: '75g net (makes 190g)',
        calories: '310 kcal',
        protein: '4.8g',
        desc: 'Golden roasted semolina simmered with pure cow ghee, milk, saffron strands, cardamom, and plump raisins.'
      },

      // Meal Combos
      {
        id: 'punjabi-comfort-combo',
        title: 'Punjabi Comfort Combo (Dal Makhani + Tawa Pulao)',
        category: 'Combos',
        price: 399,
        mrp: 460,
        img: 'https://magicmeals.shop/wp-content/uploads/2026/05/WhatsApp-Image-2026-08-20-at-6.45.34-PM.jpeg',
        jain: false,
        spice: 'Medium',
        rating: 4.9,
        reviews: 88,
        weight: '170g net (makes 530g)',
        calories: '690 kcal',
        protein: '18.0g',
        desc: 'A complete hearty North Indian meal box. 1x Dal Makhani + 1x Fragrant Tawa Pulao.'
      },
      {
        id: 'jain-light-comfort-combo',
        title: 'Jain Light Comfort Combo (Khichdi + Soup)',
        category: 'Combos',
        price: 275,
        mrp: 320,
        img: 'assets/combos/combo_jain_khichdi_soup.jpg',
        jain: true,
        spice: 'Mild',
        rating: 4.9,
        reviews: 74,
        weight: '120g net (makes 460g)',
        calories: '420 kcal',
        protein: '11.7g',
        desc: '100% Jain verified dinner set: 1x Pure Ghee Comforting Dal Khichdi + 1x Creamy Farm Tomato Soup. Light, warming, and gentle on digestion.'
      },
      {
        id: 'south-indian-breakfast-combo',
        title: 'South Indian Breakfast Combo (Idli Sambar + Upma)',
        category: 'Combos',
        price: 299,
        mrp: 350,
        img: 'assets/combos/combo_idli_upma.jpg',
        jain: true,
        spice: 'Mild',
        rating: 4.9,
        reviews: 82,
        weight: '145g net (makes 470g)',
        calories: '550 kcal',
        protein: '14.0g',
        desc: 'Traditional morning pairing: 1x South Indian Idli Sambar (makes 250g) + 1x Homestyle Vegetable Upma (makes 220g).'
      },
      {
        id: 'maharashtrian-nashta-combo',
        title: 'Maharashtrian Nashta Combo (Kanda Poha + Mumbai Misal)',
        category: 'Combos',
        price: 280,
        mrp: 330,
        img: 'assets/combos/combo_poha_misal.jpg',
        jain: false,
        spice: 'Spicy',
        rating: 4.8,
        reviews: 69,
        weight: '150g net (makes 480g)',
        calories: '570 kcal',
        protein: '14.7g',
        desc: 'Classic Mumbai breakfast duo: 1x Homestyle Kanda Poha (makes 220g) + 1x Fiery Mumbai Misal (makes 260g).'
      },
      {
        id: 'fiesta-bowl-combo',
        title: 'Fiesta Bowl Combo (Sweet Corn Soup + Mexican Rice)',
        category: 'Combos',
        price: 290,
        mrp: 340,
        img: 'assets/combos/combo_soup_mexican_rice.jpg',
        jain: true,
        spice: 'Medium',
        rating: 4.8,
        reviews: 58,
        weight: '125g net (makes 480g)',
        calories: '440 kcal',
        protein: '9.8g',
        desc: 'Global flavors comfort set: 1x Creamy Sweet Corn Vegetable Soup (makes 220ml) + 1x Zesty Mexican Rice (makes 260g).'
      },
      {
        id: 'dinner-dessert-combo',
        title: 'Dinner & Dessert Combo (Dal Khichdi + Gajar Halwa)',
        category: 'Combos',
        price: 320,
        mrp: 370,
        img: 'assets/combos/combo_khichdi_gajar_halwa.jpg',
        jain: false,
        spice: 'Sweet',
        rating: 5.0,
        reviews: 104,
        weight: '155g net (makes 440g)',
        calories: '630 kcal',
        protein: '14.2g',
        desc: 'Ultimate comfort meal: 1x Pure Ghee Comforting Dal Khichdi (makes 260g) + 1x Slow-Cooked Winter Gajar Ka Halwa with mawa & cashews (makes 180g).'
      },
      {
        id: 'indo-chinese-feast-combo',
        title: 'Indo-Chinese Feast Combo (Hot & Sour Soup + Manchurian Fried Rice)',
        category: 'Combos',
        price: 310,
        mrp: 360,
        img: 'assets/combos/combo_hot_sour_manchurian.jpg',
        jain: false,
        spice: 'Spicy',
        rating: 4.8,
        reviews: 63,
        weight: '135g net (makes 500g)',
        calories: '470 kcal',
        protein: '9.8g',
        desc: 'Tangy and savory desi-Chinese combo: 1x Vegetable Hot & Sour Soup (makes 220ml) + 1x Wok Fried Rice with Manchurian Gravy (makes 280g).'
      }
    ];

    const CATEGORIES = ['Rice', 'Meals', 'Breakfast', 'Dals', 'Soups', 'Desserts', 'Breads', 'Combos', 'All'];

    const REVIEWS = [
      {
        name: 'Pooja Singhal',
        loc: 'Student, London UK',
        rating: 5,
        text: 'Moving to the UK for my master’s was scary especially missing mom’s food. Magic Meals Dal Khichdi and Theplas are literally a lifesaver. Tastes 100% authentic like mom’s cooking!'
      },
      {
        name: 'Karan Mehra',
        loc: 'Frequent Trekker, Himachal',
        rating: 5,
        text: 'Carried 12 packets on our Kedarkantha trek. While others ate bland packaged bars, we had hot Pav Bhaji and Biryani at 12,000 ft in sub-zero weather. Super lightweight to carry.'
      },
      {
        name: 'Nitin & Sonal Shah',
        loc: 'Europe Tour, Mumbai',
        rating: 5,
        text: 'Finding pure Jain food during international travel is extremely tough. We packed an entire suitcase of Magic Meals Jain Dal Khichdi and Paneer Butter Masala. Absolutely stellar taste.'
      }
    ];

    // Global App State
    const State = {
      view: 'home',
      productId: null,
      selectedCategory: 'Rice',
      searchQuery: '',
      sortBy: 'popular',
      jainOnly: false,
      cart: {}, // format: { 'productId|packSize': quantity }
      byobBundles: {}, // format: { bundleKey: { title, meals, price, discount, size } }
      byobSize: 4,
      byobSlots: [],
      byobCategory: 'All',
      pdpPack: '1',
      pdpQty: 1,
      bannerSlide: 0
    };

    const $ = s => document.querySelector(s);
    const formatINR = n => '₹' + Number(n).toLocaleString('en-IN');

    function calcPrice(product, packSize) {
      if (packSize === '3') return Math.round(product.price * 3 * 0.92);
      if (packSize === '6') return Math.round(product.price * 6 * 0.85);
      return product.price;
    }

    function getCartTotalCount() {
      return Object.values(State.cart).reduce((sum, q) => sum + q, 0);
    }

    function getCartSubtotal() {
      return Object.entries(State.cart).reduce((sum, [key, qty]) => {
        if (key.startsWith('BYOB') && State.byobBundles && State.byobBundles[key]) {
          return sum + (State.byobBundles[key].price * qty);
        }
        const [id, pack] = key.split('|');
        const p = PRODUCTS.find(x => x.id === id);
        return p ? sum + (calcPrice(p, pack) * qty) : sum;
      }, 0);
    }

    function getQtyInCart(productId) {
      return State.cart[productId + '|1'] || 0;
    }

    function filterProducts() {
      return PRODUCTS.filter(p => {
        if (State.jainOnly && !p.jain) return false;
        if (State.selectedCategory !== 'All' && p.category !== State.selectedCategory) return false;
        if (State.searchQuery && !p.title.toLowerCase().includes(State.searchQuery.toLowerCase())) return false;
        return true;
      }).sort((a, b) => {
        if (State.sortBy === 'price-low') return a.price - b.price;
        if (State.sortBy === 'price-high') return b.price - a.price;
        if (State.sortBy === 'rating') return b.rating - a.rating;
        return b.reviews - a.reviews;
      });
    }

    function renderCard(p) {
      const q = getQtyInCart(p.id);
      const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      return `
        <div class="product-card" data-p="${p.id}">
          <div class="card-thumb">
            <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.src='https://magicmeals.shop/wp-content/uploads/2026/08/Magic-Meals-300x300.jpg'">
            <div class="card-badges">
              ${p.jain ? '<span class="badge-jain">Jain Friendly</span>' : ''}
              ${p.has3D ? '<span class="badge-3d">↻ 3D Pouch</span>' : ''}
            </div>
            <div class="veg-corner" title="100% Vegetarian"></div>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-rating">
                <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ${p.rating} (${p.reviews})
              </span>
              <span class="card-spice">${p.spice === 'Spicy' ? '🌶️🌶️' : p.spice === 'Medium' ? '🌶️' : '🌿 Mild'}</span>
            </div>
            <h3 class="card-title">${p.title}</h3>
            <div class="card-weight">${p.weight}</div>
            <div class="card-price-row">
              <span class="card-price">${formatINR(p.price)}</span>
              <span class="card-mrp">${formatINR(p.mrp)}</span>
              <span class="card-discount">${discount}% OFF</span>
            </div>
            <div class="card-action">
              ${q > 0 ? `
                <div class="qty-stepper">
                  <button data-minus="${p.id}" aria-label="Decrease quantity">−</button>
                  <span>${q} in box</span>
                  <button data-add="${p.id}" aria-label="Increase quantity">+</button>
                </div>
              ` : `
                <button class="btn-add" data-add="${p.id}">+ Add to Meal Box</button>
              `}
            </div>
          </div>
        </div>
      `;
    }

    // Home View with Travel Banner
    function renderHomeView() {
      const bestSellers = PRODUCTS.filter(p => p.category !== 'Combos' && (!State.jainOnly || p.jain)).slice(0, 8);
      const combos = PRODUCTS.filter(p => p.category === 'Combos' && (!State.jainOnly || p.jain));

      return `
        <!-- ANIMATED HERO with Veg Biryani pouch -->
        <section id="hero" data-section="hero" class="hero" aria-labelledby="heroTitle">
          <div class="hero-inner">
            <div class="hero-stage-wrap">
              <h1 id="heroTitle" class="hero-headline" data-hero="headline">
                <span class="hero-headline-line"><span>REAL</span> <span>FOOD.</span></span>
                <span class="hero-headline-line"><span>READY IN</span> <span>MINUTES.</span></span>
              </h1>
              <div class="hero-stage">
                <div class="hero-steam" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
                <div class="hero-shadow" data-hero="shadow" aria-hidden="true"></div>
                <!-- Layout footprint anchor for the pouch -->
                <div class="hero-pouch-anchor" id="heroPouchAnchor" aria-hidden="true"></div>
                <!-- 4 nested wrappers so scroll / parallax / float / drop tweens never fight over one transform -->
                <div class="hero-pouch" data-hero="scroll" id="heroPouch">
                  <div class="hero-pouch-parallax" data-hero="parallax">
                    <div class="hero-pouch-float" data-hero="float">
                      <img src="biryani_pouch_front.png" width="919" height="1007" alt="Magic Meals Royal Dum Veg Biryani freeze-dried meal pouch" class="hero-pouch-img" data-hero="pouch" fetchpriority="high">
                      <div class="hero-pouch-placeholder" aria-hidden="true">POUCH IMAGE HERE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="hero-copy">
              <p class="hero-sub" data-hero="sub">Homestyle Indian meals. Just add hot water.</p>
              <div class="hero-actions">
                <button type="button" class="hero-btn hero-btn--primary" data-hero="btn" data-scroll-to="best-sellers">Shop Now</button>
                <button type="button" class="hero-btn hero-btn--secondary" data-hero="btn" data-scroll-to="how-it-works" data-scroll-fallback="best-sellers">How It Works</button>
              </div>
            </div>
          </div>
        </section>

        <!-- SCROLL-DRIVEN HOW IT WORKS (Pin & Scrub via GSAP) -->
        <section id="how-it-works" data-section="how-it-works" class="hiw-section" aria-labelledby="hiwTitle">
          <div class="hiw-pin-container" id="hiwPinContainer">
            <div class="wrap hiw-inner-wrap">
              <div class="hiw-header-group">
                <h2 id="hiwTitle" class="hiw-title">How It Works</h2>
                <div class="hiw-progress-nav" aria-label="Step progress">
                  <div class="hiw-progress-bar-track">
                    <div class="hiw-progress-bar-fill" id="hiwProgressBarFill"></div>
                  </div>
                  <div class="hiw-progress-dots" id="hiwProgressDots">
                    <button type="button" class="hiw-dot active" data-step-target="1" aria-label="Step 1: Pour"></button>
                    <button type="button" class="hiw-dot" data-step-target="2" aria-label="Step 2: Add hot water"></button>
                    <button type="button" class="hiw-dot" data-step-target="3" aria-label="Step 3: Eat"></button>
                  </div>
                </div>
              </div>

              <div class="hiw-layout-grid">
                <!-- Left Column: Step list (only active highlighted, others dimmed) -->
                <div class="hiw-steps-col" id="hiwStepsList" role="list" aria-label="Preparation steps">
                  <div class="hiw-step-card active" data-hiw-step="1" role="listitem">
                    <div class="hiw-step-badge">1</div>
                    <div class="hiw-step-text">
                      <h3 class="hiw-step-name">Pour</h3>
                      <p class="hiw-step-desc">Empty the rice and veggies into a bowl.</p>
                    </div>
                  </div>

                  <div class="hiw-step-card" data-hiw-step="2" role="listitem">
                    <div class="hiw-step-badge">2</div>
                    <div class="hiw-step-text">
                      <h3 class="hiw-step-name">Add hot water</h3>
                      <p class="hiw-step-desc">Pour hot water up to the line.</p>
                    </div>
                  </div>

                  <div class="hiw-step-card" data-hiw-step="3" role="listitem">
                    <div class="hiw-step-badge">3</div>
                    <div class="hiw-step-text">
                      <h3 class="hiw-step-name">Eat</h3>
                      <p class="hiw-step-desc">Wait 7 minutes, stir gently, and enjoy.</p>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Visual Stage (Pouch Target, falling grains, water stream, steam, ceramic bowl) -->
                <div class="hiw-stage-col">
                  <div class="hiw-stage" id="hiwStage">
                    <!-- Target placeholder for the shared hero pouch (NO duplicate pouch element) -->
                    <div class="hiw-pouch-target" id="hiw-pouch-target" aria-hidden="true"></div>

                    <!-- Rice & Veggie Particles Stream (CSS shapes: warm cream, green, orange) -->
                    <div class="hiw-particles-field" id="hiwParticles" aria-hidden="true"></div>

                    <!-- Hot Water Stream -->
                    <div class="hiw-water-stream" id="hiwWaterStream" aria-hidden="true">
                      <div class="hiw-water-beam"></div>
                    </div>

                    <!-- Steam Wisps -->
                    <div class="hiw-steam-wisps" id="hiwSteamWisps" aria-hidden="true">
                      <span></span><span></span><span></span><span></span>
                    </div>

                    <!-- Photographic Ceramic Bowl with exact matching dimensions & geometry -->
                    <div class="hiw-bowl-actor" id="hiwBowlActor">
                      <div class="hiw-ceramic-bowl">
                        <div class="hiw-bowl-shadow" aria-hidden="true"></div>
                        <img src="how-it-works/bowl_empty.png" alt="Empty Ceramic Bowl" class="hiw-bowl-img hiw-bowl-empty-img" id="bowlEmptyImg" width="657" height="568">

                        <!-- Inner Cavity for Pour & Water animations -->
                        <div class="hiw-bowl-opening" id="hiwBowlOpening">
                          <!-- Dry mix mound (fills up at Step 1) -->
                          <div class="hiw-food-dry" id="foodDry">
                            <div class="hiw-dry-base"></div>
                            <div class="hiw-fleck hiw-fleck-pea" style="top:42%; left:42%;"></div>
                            <div class="hiw-fleck hiw-fleck-carrot" style="top:52%; left:58%;"></div>
                            <div class="hiw-fleck hiw-fleck-pea" style="top:58%; left:34%;"></div>
                            <div class="hiw-fleck hiw-fleck-carrot" style="top:45%; left:68%;"></div>
                            <div class="hiw-fleck hiw-fleck-pea" style="top:48%; left:25%;"></div>
                            <div class="hiw-fleck hiw-fleck-carrot" style="top:62%; left:72%;"></div>
                          </div>

                          <!-- Translucent water level with glossy sheen (rises at Step 2) -->
                          <div class="hiw-food-water" id="foodWater"></div>
                        </div>

                        <!-- Cooked Biryani Photo: exact matching photographic bowl (crossfades at Step 3) -->
                        <img src="how-it-works/bowl_ready_biryani.png" alt="Finished Veg Biryani" class="hiw-bowl-img hiw-bowl-ready-img" id="foodFinished" width="657" height="568">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback view for reduced motion or <360px screens -->
              <div class="hiw-fallback-view" id="hiwFallbackView" aria-hidden="true">
                <img src="how-it-works/bowl_ready_biryani.png" alt="Delicious Veg Biryani Ready" class="hiw-fallback-img" width="320" height="320" loading="lazy">
              </div>
            </div>
          </div>
        </section>

        <!-- Best Sellers Grid -->
        <section id="best-sellers" data-section="best-sellers" style="margin-top:24px;">
          <div class="section-header">
            <h2 class="section-title">Best Sellers</h2>
            <a class="view-all-link" data-go="shop" data-cat="All">See All Meals (${PRODUCTS.length}) →</a>
          </div>
          <div class="product-grid">
            ${bestSellers.map(renderCard).join('')}
          </div>
        </section>

        <!-- Money-Saving Combos -->
        ${combos.length ? `
          <section id="combos" style="margin-top:38px;">
            <div class="section-header">
              <h2 class="section-title">Value Combos <span class="title-badge">Save up to 15%</span></h2>
              <a class="view-all-link" data-go="shop" data-cat="Combos">Browse All Combos →</a>
            </div>
            <div class="product-grid">
              ${combos.map(renderCard).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Why Freeze-Dried vs Normal Pouch -->
        <section id="freeze-drying" data-section="freeze-drying" class="edu-section" style="margin-top:38px;">
          <div class="section-header">
            <h2 class="section-title">The Magic of Freeze-Drying</h2>
          </div>
          <div class="edu-grid">
            <div class="edu-card">
              <div class="edu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </div>
              <div>
                <h4>98% Nutrient Retention</h4>
                <p>Unlike thermal canning which destroys vitamins, freeze-drying gently sublimates ice crystals without breaking food fibers.</p>
              </div>
            </div>
            <div class="edu-card">
              <div class="edu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h4>Zero Chemical Preservatives</h4>
                <p>Because there is 0% residual moisture, bacteria cannot survive naturally. 100% natural with no chemical preservatives.</p>
              </div>
            </div>
            <div class="edu-card">
              <div class="edu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                </svg>
              </div>
              <div>
                <h4>Ultra Lightweight for Travel</h4>
                <p>An 80g featherweight pouch yields a generous 260g hearty meal once hot water is poured in. Fits easily into hand luggage.</p>
              </div>
            </div>
          </div>
        </section>

        
        <!-- Customer Stories in Action -->
        <section class="customers-loved-section" style="margin-top:38px;">
          <div class="section-header">
            <h2 class="section-title">Customer Stories in Action</h2>
          </div>

          <div class="reel-wrapper">
            <button class="scroll-btn scroll-left" id="reelScrollLeft" aria-label="Previous customer review">&#10094;</button>
            <button class="scroll-btn scroll-right" id="reelScrollRight" aria-label="Next customer review">&#10095;</button>

            <div class="reel-container" id="youtubeReelsContainer">
              <!-- Card 1 -->
              <div class="reel-card" data-video-id="stLqnv38SHk" title="Customer Review - Dal Khichdi">
                <img src="thumb_stLqnv38SHk.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--white)"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Comforting Dal Khichdi</span>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="reel-card" data-video-id="FQu7hM1dFAA" title="Customer Review - Mumbai Misal">
                <img src="thumb_FQu7hM1dFAA.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--white)"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Spicy Mumbai Misal</span>
                </div>
              </div>

              <!-- Card 3 -->
              <div class="reel-card" data-video-id="248l3FWQ5ls" title="Customer Review - Gajar Ka Halwa">
                <img src="thumb_248l3FWQ5ls.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--white)"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Gajar Ka Halwa Dessert</span>
                </div>
              </div>

              <!-- Card 4 -->
              <div class="reel-card" data-video-id="hveTAhjX3zk" title="Customer Review - Dal Khichdi Pouch">
                <img src="thumb_hveTAhjX3zk.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--white)"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">Comforting Dal Khichdi</span>
                </div>
              </div>

              <!-- Card 5 -->
              <div class="reel-card" data-video-id="D8cyKsu4w84" title="Customer Review - Travel Meals">
                <img src="thumb_D8cyKsu4w84.jpg" alt="Magic Meals Customer Review" class="reel-thumb-img">
                <div class="reel-top-overlay">
                  <div class="reel-brand-badge">
                    <img src="magic_meals_logo_saffron.png" alt="Magic Meals" class="reel-badge-logo">
                    <div class="reel-badge-info">
                      <span class="reel-badge-title">Customer Review</span>
                      <span class="reel-badge-channel">Magic Meals</span>
                    </div>
                  </div>
                </div>
                <div class="reel-shorts-badge">
                  <span>⚡ Shorts</span>
                </div>
                <div class="reel-center-play">
                  <div class="shorts-play-bubble">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--white)"><polygon points="7 4 19 12 7 20 7 4"/></svg>
                  </div>
                </div>
                <div class="reel-bottom-overlay">
                  <span class="reel-dish-tag">100% Homestyle Indian Taste</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Customer Testimonials -->
        <section style="margin-top:38px;">
          <div class="section-header">
            <h2 class="section-title">Loved by Travelers & Students</h2>
          </div>
          <div class="reviews-scroll">
            ${REVIEWS.map(r => `
              <div class="review-card">
                <div class="review-stars">★★★★★</div>
                <blockquote>"${r.text}"</blockquote>
                <div class="reviewer-meta">
                  <div class="reviewer-avatar">${r.name.charAt(0)}</div>
                  <div>
                    <b>${r.name}</b>
                    <small>${r.loc}</small>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    // Shop Catalog View
    function renderShopView() {
      const list = filterProducts();
      return `
        <section style="padding: 18px 0;">
          <div class="section-header">
            <div>
              <h1 style="font-size:28px;">Shop Real Meals</h1>
              <p>${list.length} meal options available ${State.selectedCategory !== 'All' ? `• Category: <b style="color:var(--brand-primary);">${State.selectedCategory}</b>` : ''} ${State.jainOnly ? '• Jain Friendly Only' : ''}</p>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="search-bar-wrap">
            <input type="search" id="catalogSearchInput" class="search-input" placeholder="Search by dish name (e.g. Khichdi, Paneer, Poha)..." value="${State.searchQuery}">
            <select id="catalogSortSelect" class="sort-select" aria-label="Sort dishes">
              <option value="popular" ${State.sortBy === 'popular' ? 'selected' : ''}>Most Popular</option>
              <option value="rating" ${State.sortBy === 'rating' ? 'selected' : ''}>Highest Rated ★</option>
              <option value="price-low" ${State.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-high" ${State.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
            </select>
          </div>

          <!-- Category Filter Tabs & Jain Filter Chip -->
          <div class="shop-cat-tabs" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; margin: 12px 0 20px 0; -webkit-overflow-scrolling:touch; scrollbar-width:none; align-items:center;">
            <button type="button" class="cat-pill ${State.jainOnly ? 'active' : ''}" data-jain-toggle="true" id="shopJainFilterChip" style="white-space:nowrap; padding:7px 16px; border-radius:999px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid ${State.jainOnly ? 'var(--veg-green, #15803D)' : 'var(--border)'}; background:${State.jainOnly ? 'var(--veg-green, #15803D)' : 'var(--white)'}; color:${State.jainOnly ? '#ffffff' : 'var(--text-body)'}; transition:all 0.2s ease; display:inline-flex; align-items:center; gap:6px; box-shadow: ${State.jainOnly ? '0 2px 6px rgba(21,128,61,0.25)' : 'none'};" aria-pressed="${State.jainOnly}">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${State.jainOnly ? '#ffffff' : 'var(--veg-green, #15803D)'};"></span>
              Jain Only
            </button>
            <span style="width:1px; height:20px; background:var(--border); flex-shrink:0;"></span>
            ${['All', 'Combos', 'Breakfast', 'Meals', 'Rice', 'Dals', 'Soups', 'Desserts', 'Breads'].map(cat => {
              const isActive = State.selectedCategory === cat;
              return `
                <button type="button" class="cat-pill ${isActive ? 'active' : ''}" data-cat="${cat}" style="white-space:nowrap; padding:7px 16px; border-radius:999px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border)'}; background:${isActive ? 'var(--brand-primary)' : 'var(--white)'}; color:${isActive ? '#ffffff' : 'var(--text-body)'}; transition:all 0.2s ease; display:inline-flex; align-items:center; gap:5px; box-shadow: ${isActive ? '0 2px 6px rgba(224,90,43,0.25)' : 'none'};">
                  ${cat === 'Combos' ? '🔥 Combos' : cat}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Products Listing -->
          ${list.length > 0 ? `
            <div class="product-grid">
              ${list.map(renderCard).join('')}
            </div>
          ` : `
            <div style="text-align:center; padding: 48px 16px; background:var(--white); border-radius:16px; border:1px solid var(--border);">
              <div style="font-size:42px; margin-bottom:12px;">🥣</div>
              <h3 style="margin-bottom:6px;">No meals match your filter</h3>
              <p style="color:var(--text-muted); margin-bottom:16px;">Try clearing search terms or turning off the Jain filter to see all dishes.</p>
              <button class="btn sm" id="resetFiltersBtn">Reset Filters</button>
            </div>
          `}
        </section>
      `;
    }

    // Product Detail Page (PDP) View
    function renderProductView() {
      const p = PRODUCTS.find(x => x.id === State.productId) || PRODUCTS[0];
      const packPrice = calcPrice(p, State.pdpPack);
      const totalAmount = packPrice * State.pdpQty;
      const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

      return `
        <div class="pdp-view">
          <div class="pdp-back" data-go="shop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Back to All Meals
          </div>

          <div class="pdp-layout">
            <!-- Product Gallery (Interactive 3D Pouch for Rajma Masala only) -->
            ${p.id === 'rajma-masala' ? `
              <div class="pdp-gallery pdp-gallery-3d" id="pdpGallery3D">
                <div id="pdp3dCanvasContainer" class="pdp-3d-canvas-container"></div>
                <div class="pdp-3d-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  <span>Drag to rotate 360° (Front & Back)</span>
                </div>
                <div class="pdp-3d-controls">
                  <button type="button" class="pdp-3d-btn" onclick="window.snapPdp3d('front')">Front</button>
                  <button type="button" class="pdp-3d-btn" onclick="window.snapPdp3d('back')">Back</button>
                  <button type="button" class="pdp-3d-btn" onclick="window.togglePdp3dSpin()">Auto Spin</button>
                </div>
                <div class="card-badges">
                  ${p.jain ? '<span class="badge-jain">Jain Friendly</span>' : ''}
                </div>
                <div class="veg-corner"></div>
              </div>
            ` : `
              <div class="pdp-gallery">
                <img src="${p.img}" alt="${p.title}" onerror="this.src='https://magicmeals.shop/wp-content/uploads/2026/08/Magic-Meals-300x300.jpg'">
                <div class="card-badges">
                  ${p.jain ? '<span class="badge-jain">Jain Friendly</span>' : ''}
                </div>
                <div class="veg-corner"></div>
              </div>
            `}

            <!-- Product Purchase Details -->
            <div class="pdp-info">
              <div class="pdp-badges-row">
                <span class="card-rating">
                  <svg viewBox="0 0 24 24" style="width:16px;height:16px;color:var(--rating);fill:var(--rating);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <b>${p.rating}</b> (${p.reviews} verified customer reviews)
                </span>
                <span style="color:var(--text-muted);">•</span>
                <span style="font-size:13px; font-weight:600; color:var(--brand-primary);">In Stock • Ships in 24 hrs</span>
              </div>

              <h1 class="pdp-title">${p.title}</h1>
              <p class="pdp-desc">${p.desc}</p>

              <!-- Pack Variant Selector -->
              <div style="margin-top:6px;">
                <label style="font-size:13.5px; font-weight:700; color:var(--text); display:block; margin-bottom:6px;">Select Pack Size:</label>
                <div class="pack-selector">
                  <button class="pack-opt" data-pdp-pack="1" aria-pressed="${State.pdpPack === '1'}">
                    <b>Single Pack</b>
                    <span class="p-price">${formatINR(calcPrice(p, '1'))}</span>
                    <small style="color:var(--text-muted); font-size:11px;">Standard</small>
                  </button>
                  <button class="pack-opt" data-pdp-pack="3" aria-pressed="${State.pdpPack === '3'}">
                    <b>Pack of 3</b>
                    <span class="p-price">${formatINR(calcPrice(p, '3'))}</span>
                    <small class="savings">Save 8%</small>
                  </button>
                  <button class="pack-opt" data-pdp-pack="6" aria-pressed="${State.pdpPack === '6'}">
                    <b>Pack of 6</b>
                    <span class="p-price">${formatINR(calcPrice(p, '6'))}</span>
                    <small class="savings">Save 15%</small>
                  </button>
                </div>
              </div>

              <!-- Quantity & Add to Cart -->
              <div class="pdp-action-bar">
                <div class="qty-stepper" style="width:130px; border-radius:12px;">
                  <button id="pdpQtyMinus" aria-label="Decrease quantity">−</button>
                  <span>${State.pdpQty}</span>
                  <button id="pdpQtyPlus" aria-label="Increase quantity">+</button>
                </div>
                <button class="btn" style="flex:1;" id="pdpAddToCartBtn">
                  Add to Meal Box • ${formatINR(totalAmount)}
                </button>
              </div>

              <!-- Pincode Delivery Check -->
              <div class="pincode-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <input type="text" id="pincodeInput" placeholder="Enter Pincode for Delivery Time" maxlength="6">
                <button class="pincode-btn" id="checkPincodeBtn">Check</button>
              </div>
              <div id="pincodeResult" style="font-size:12.5px; color:var(--brand-primary); font-weight:600; display:none;">
                ✓ Express delivery available in 2-3 business days. COD available.
              </div>

              <!-- Nutrition & Meal Facts -->
              <ul class="pdp-facts-grid">
                <li class="pdp-fact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span>Quick & Easy</span>
                </li>
                <li class="pdp-fact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>
                  <span>Zero Preservatives</span>
                </li>
                <li class="pdp-fact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/></svg>
                  <span>9 Months Shelf Life</span>
                </li>
                <li class="pdp-fact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>Energy: ${p.calories}</span>
                </li>
              </ul>

              <!-- Preparation Guide Accordion -->
              <div style="background:var(--white); border:1px solid var(--border); border-radius:14px; padding:16px;">
                <h4 style="margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                  <span>🫕 How to Prepare:</span>
                </h4>
                <ol style="margin:0; padding-left:18px; font-size:13.5px; color:var(--text); line-height:1.7;">
                  <li>Open pouch and add boiling hot water up to the marked line inside.</li>
                  <li>Stir well, zip the pouch tightly, and let rest until fully hydrated.</li>
                  <li>Open, give it a quick stir, and eat straight from the travel-friendly bowl!</li>
                </ol>
              </div>
            </div>
          </div>

          <!-- Related Dishes -->
          ${related.length > 0 ? `
            <div style="margin-top:48px;">
              <div class="section-header">
                <div>
                  <h2>You Might Also Like</h2>
                  <p>Other popular dishes in ${p.category}</p>
                </div>
              </div>
              <div class="product-grid">
                ${related.map(renderCard).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    function flyToSlot(sourceEl, slotEl) {
      if (!sourceEl || !slotEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined') {
        return;
      }
      const startRect = sourceEl.getBoundingClientRect();
      const destRect = slotEl.getBoundingClientRect();
      if (startRect.width === 0 || startRect.height === 0 || destRect.width === 0) return;

      const childImg = sourceEl.tagName === 'IMG' ? sourceEl : (sourceEl.querySelector && sourceEl.querySelector('img'));
      const imgSrc = childImg ? childImg.src : '';

      const flyer = document.createElement('div');
      flyer.className = 'fly-to-cart-clone';
      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = 'Box Meal';
        flyer.appendChild(img);
      }
      const size = 52;
      const startX = startRect.left + (startRect.width - size) / 2;
      const startY = startRect.top + (startRect.height - size) / 2;
      const targetX = destRect.left + (destRect.width - size) / 2;
      const targetY = destRect.top + (destRect.height - size) / 2;

      Object.assign(flyer.style, {
        position: 'fixed',
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: '10000',
        pointerEvents: 'none',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgb(var(--black-rgb) / 0.25)',
        transformOrigin: 'center center'
      });
      document.body.appendChild(flyer);

      const deltaX = targetX - startX;
      const deltaY = targetY - startY;

      gsap.timeline({
        onComplete: () => flyer.remove()
      })
      .to(flyer, { x: deltaX, duration: 0.38, ease: 'power1.inOut' }, 0)
      .to(flyer, { y: deltaY, duration: 0.38, ease: 'power2.inOut' }, 0)
      .to(flyer, { scale: 0.88, duration: 0.38, ease: 'sine.inOut' }, 0);
    }

    // Build Your Own Box (BYOB) View
    function renderByobView() {
      const size = State.byobSize || 4;
      const is2Pack = size === 2;
      const is4Pack = size === 4;
      const is6Pack = size === 6;
      const totalSlots = size;
      const filledCount = State.byobSlots.length;
      const isFull = filledCount >= totalSlots;
      const slotsNeeded = totalSlots - filledCount;

      const categories = ['All', 'Rice', 'Meals', 'Breakfast', 'Dals', 'Soups'];
      const pantryMeals = PRODUCTS.filter(p => {
        if (p.category === 'Combos') return false;
        if (State.jainOnly && !p.jain) return false;
        if (State.byobCategory !== 'All' && p.category !== State.byobCategory) return false;
        return true;
      });

      const byobMeals = State.byobSlots.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
      const rawTotal = byobMeals.reduce((sum, p) => sum + p.price, 0);

      let boxName = '4-Pack Explorer Box';
      let discountPercent = 10;
      if (is2Pack) {
        boxName = '2-Pack Solo / Trekker Box';
        discountPercent = 5;
      } else if (is6Pack) {
        boxName = '6-Pack Travel Box';
        discountPercent = 15;
      }

      const discountAmt = isFull ? Math.round(rawTotal * (discountPercent / 100)) : 0;
      const finalTotal = rawTotal - discountAmt;
      const progressPercent = Math.min(100, Math.round((filledCount / totalSlots) * 100));

      const unlockMsg = isFull 
        ? (is6Pack ? '🎉 15% OFF + Free Gift Unlocked!' : is4Pack ? '🎉 10% OFF Unlocked!' : '🎉 5% OFF Unlocked!') 
        : `Add ${slotsNeeded} more ${slotsNeeded === 1 ? 'meal' : 'meals'} for ${discountPercent}% OFF`;

      return `
        <div class="byob-container">
          <div class="byob-header">
            <span class="byob-badge-pill">🍱 Custom Meal Builder</span>
            <h1 class="byob-title">Build Your Own Meal Box</h1>
            <p class="byob-subtitle">
              Pick your favorite homestyle freeze-dried dishes. Perfect for treks, hostels, and international flights!
            </p>

            <div class="byob-size-selector" role="group" aria-label="Select Box Size">
              <button type="button" class="byob-size-btn ${is2Pack ? 'active' : ''}" data-byob-size="2">
                <span>2-Pack Solo</span>
                <span class="byob-size-badge">Save 5%</span>
              </button>
              <button type="button" class="byob-size-btn ${is4Pack ? 'active' : ''}" data-byob-size="4">
                <span>4-Pack Box</span>
                <span class="byob-size-badge">Save 10%</span>
              </button>
              <button type="button" class="byob-size-btn ${is6Pack ? 'active' : ''}" data-byob-size="6">
                <span>6-Pack Travel</span>
                <span class="byob-size-badge">Save 15% + Gift</span>
              </button>
            </div>
          </div>

          <!-- Mobile Sticky Top Packing Tray (Trekkers / Travel Pack) -->
          <div class="byob-mobile-top-tray" id="byobMobileTopTray">
            <div class="byob-m-tray-header">
              <div class="byob-m-tray-title">
                <span>🎒</span>
                <b>Your Pack (${filledCount}/${totalSlots})</b>
                ${isFull ? '<span class="byob-m-ready-tag">Pack Ready!</span>' : ''}
              </div>
              <div class="byob-m-tray-actions">
                ${filledCount > 0 ? '<button type="button" class="byob-box-reset-btn" id="byobResetBtnMobile">Clear</button>' : ''}
              </div>
            </div>

            <div class="byob-m-slots-row slots-${totalSlots}">
              ${Array.from({ length: totalSlots }).map((_, i) => {
                const slotMealId = State.byobSlots[i];
                const meal = slotMealId ? PRODUCTS.find(x => x.id === slotMealId) : null;
                if (meal) {
                  return `
                    <div class="byob-m-slot filled" id="byobSlotMobile_${i}" data-byob-remove="${i}" title="Tap to remove ${meal.title}">
                      <img src="${meal.img}" alt="${meal.title}">
                      <button type="button" class="byob-m-slot-x" data-byob-remove="${i}" aria-label="Remove ${meal.title}">✕</button>
                    </div>
                  `;
                } else {
                  return `
                    <div class="byob-m-slot empty" id="byobSlotMobile_${i}">
                      <span class="byob-m-slot-num">${i + 1}</span>
                    </div>
                  `;
                }
              }).join('')}
            </div>

            <div class="byob-m-progress-wrap">
              <div class="byob-m-progress-bar">
                <div class="byob-m-progress-fill" style="width: ${progressPercent}%;"></div>
              </div>
              <div class="byob-m-progress-msg">
                ${unlockMsg}
              </div>
            </div>
          </div>

          <div class="byob-layout-grid">
            <!-- Left Column: Meal Shelf (Pantry) -->
            <div class="byob-pantry-col">
              <div class="byob-pantry-header">
                <div class="byob-cat-scroll" role="tablist">
                  ${categories.map(cat => `
                    <button type="button" class="byob-cat-pill ${State.byobCategory === cat ? 'active' : ''}" data-byob-cat="${cat}">
                      ${cat === 'All' ? 'All Dishes' : cat}
                    </button>
                  `).join('')}
                </div>
                <div style="font-size:13px; color:var(--text-muted); font-weight:600;">
                  Showing ${pantryMeals.length} homestyle dishes
                </div>
              </div>

              <div class="byob-meals-grid">
                ${pantryMeals.map(p => {
                  const inBoxCount = State.byobSlots.filter(id => id === p.id).length;
                  return `
                    <div class="byob-meal-card" data-p="${p.id}">
                      <div class="byob-meal-thumb">
                        <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.src='https://magicmeals.shop/wp-content/uploads/2026/08/Magic-Meals-300x300.jpg'">
                        <div class="card-badges">
                          ${p.jain ? '<span class="badge-jain">Jain</span>' : ''}
                        </div>
                        <div class="veg-corner"></div>
                      </div>
                      <div class="byob-meal-body">
                        <h3 class="byob-meal-title">${p.title}</h3>
                        <div class="byob-meal-meta">
                          <span>${p.weight} • ${p.spice === 'Spicy' ? '🌶️🌶️' : p.spice === 'Medium' ? '🌶️' : '🌿'}</span>
                          <span class="byob-meal-price">${formatINR(p.price)}</span>
                        </div>
                        <button type="button" class="btn-byob-add ${inBoxCount > 0 ? 'in-box' : ''}" data-byob-add="${p.id}">
                          ${inBoxCount > 0 ? `✓ In Box (${inBoxCount})` : '+ Add to Box'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Right Column: Sticky Box Carton (Desktop Only) -->
            <div class="byob-box-col">
              <div class="byob-box-carton" id="byobCarton">
                <div class="byob-box-header">
                  <div class="byob-box-name">
                    <span>📦</span>
                    <span>${boxName}</span>
                  </div>
                  ${filledCount > 0 ? `
                    <button type="button" class="byob-box-reset-btn" id="byobResetBtn">Clear Box</button>
                  ` : ''}
                </div>

                <!-- Box Slots Grid -->
                <div class="byob-slots-grid slots-${totalSlots}" id="byobSlotsGrid">
                  ${Array.from({ length: totalSlots }).map((_, i) => {
                    const slotMealId = State.byobSlots[i];
                    const meal = slotMealId ? PRODUCTS.find(x => x.id === slotMealId) : null;
                    if (meal) {
                      return `
                        <div class="byob-slot filled" id="byobSlot_${i}">
                          <img src="${meal.img}" alt="${meal.title}">
                          <div class="byob-slot-title-overlay">${meal.title}</div>
                          <button type="button" class="byob-slot-remove-btn" data-byob-remove="${i}" title="Remove dish" aria-label="Remove ${meal.title}">✕</button>
                        </div>
                      `;
                    } else {
                      return `
                        <div class="byob-slot empty" id="byobSlot_${i}">
                          <div class="byob-slot-num">${i + 1}</div>
                          <div class="byob-slot-label">Empty Slot</div>
                        </div>
                      `;
                    }
                  }).join('')}
                </div>

                <!-- Perks / Progress Meter -->
                <div class="byob-perk-box">
                  <div class="byob-perk-header">
                    <span>${unlockMsg}</span>
                    <span>${progressPercent}%</span>
                  </div>
                  <div class="byob-perk-track">
                    <div class="byob-perk-fill" style="width: ${progressPercent}%;"></div>
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div class="byob-price-box">
                  <div class="byob-price-row">
                    <div>
                      ${isFull && discountAmt > 0 ? `<span class="byob-original-price">${formatINR(rawTotal)}</span>` : ''}
                      <span class="byob-final-price">${formatINR(finalTotal)}</span>
                    </div>
                    ${isFull && discountAmt > 0 ? `
                      <span class="byob-savings-tag">You Save ${formatINR(discountAmt)}</span>
                    ` : `
                      <span style="font-size:12px; color:var(--text-muted);">${filledCount}/${totalSlots} selected</span>
                    `}
                  </div>
                  ${is6Pack && isFull ? `
                    <div style="font-size:12px; color:var(--brand-primary); font-weight:700; margin-top:6px;">
                      🎁 Includes Free Magic Travel Spoon & Mat
                    </div>
                  ` : ''}
                  ${is2Pack && isFull ? `
                    <div style="font-size:12px; color:var(--brand-primary); font-weight:700; margin-top:6px;">
                      🎒 Quick Pack for Weekend Treks & Solo Flights
                    </div>
                  ` : ''}
                </div>

                <!-- Add Box to Cart CTA -->
                <button type="button" class="byob-add-cart-btn" id="byobAddToCartBtn" ${!isFull ? 'disabled' : ''}>
                  ${isFull 
                    ? `Add Box to Cart • ${formatINR(finalTotal)} →` 
                    : `Add ${slotsNeeded} More ${slotsNeeded === 1 ? 'Meal' : 'Meals'}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Dedicated Smart BYOB Bottom Action Bar -->
        <div class="byob-mobile-action-bar" id="byobMobileActionBar">
          <div class="byob-m-bar-info">
            <div class="byob-m-bar-count">
              <b>${filledCount}/${totalSlots} Packed</b>
              ${isFull && discountAmt > 0 ? `<span class="byob-savings-tag" style="margin-left:4px; font-size:10.5px; padding:2px 6px;">Save ${formatINR(discountAmt)}</span>` : ''}
            </div>
            <div class="byob-m-bar-price">
              ${isFull && discountAmt > 0 ? `<span class="byob-original-price" style="font-size:12px; margin-right:4px;">${formatINR(rawTotal)}</span>` : ''}
              <span class="byob-final-price" style="font-size:18px;">${formatINR(finalTotal)}</span>
            </div>
          </div>
          <button type="button" class="byob-m-bar-btn ${isFull ? 'active' : ''}" id="byobAddToCartBtnMobile" ${!isFull ? 'disabled' : ''}>
            ${isFull ? `Add Box to Cart • ${formatINR(finalTotal)} →` : `Pack ${slotsNeeded} More`}
          </button>
        </div>
      `;
    }

    // Main Render Function
    function renderApp(isRouteChange = false) {
      const container = $('#app');
      if (container && isRouteChange) {
        container.classList.remove('view-swap-fade');
        void container.offsetWidth;
        container.classList.add('view-swap-fade');
      }
      if (State.view === 'home') {
        container.innerHTML = renderHomeView();
      } else if (State.view === 'shop') {
        container.innerHTML = renderShopView();
      } else if (State.view === 'product') {
        container.innerHTML = renderProductView();
      } else if (State.view === 'byob') {
        container.innerHTML = renderByobView();
      }

      // Update Header State (Transparent on Home, Solid on Shop, Product & BYOB views)
      document.body.dataset.view = State.view;
      const siteHeader = document.getElementById('siteHeader');
      if (siteHeader) {
        if (State.view === 'home') {
          siteHeader.classList.remove('header-solid');
          updateHeaderTransparency();
        } else {
          siteHeader.classList.add('header-solid');
          siteHeader.classList.remove('is-scrolled');
        }
      }

      // Update Header Quick Links (Shop, BYOB)
      document.querySelectorAll('.header-quick-link').forEach(link => {
        const go = link.dataset.go;
        const cat = link.dataset.cat;
        if (go === 'byob' && State.view === 'byob') {
          link.classList.add('active');
        } else if (State.view === 'shop' && (cat === State.selectedCategory || (cat === 'All' && !State.selectedCategory))) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update Mobile Drawer States (Shop, Build Your Own Box, Profile)
      document.querySelectorAll('.drawer-cat-btn').forEach(btn => {
        const go = btn.dataset.go;
        if (go === 'shop' && State.view === 'shop') {
          btn.classList.add('active');
        } else if (go === 'byob' && State.view === 'byob') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      document.querySelectorAll('.mobile-bottom-nav button').forEach(b => {
        const go = b.dataset.go;
        const cat = b.dataset.cat;
        if (State.view === 'home' && go === 'home') b.classList.add('active');
        else if (State.view === 'shop' && (!cat || cat === State.selectedCategory)) b.classList.add('active');
        else b.classList.remove('active');
      });

      $('#jainToggleBtn')?.setAttribute('aria-pressed', State.jainOnly);

      renderCartDrawer();

      if (State.view === 'product' && State.productId === 'rajma-masala') {
        setTimeout(initPdp3dPouch, 50);
      } else {
        disposePdp3dPouch();
      }

      // Let feature modules (hero.js) re-initialise after the SPA swaps the view
      document.dispatchEvent(new CustomEvent('app:rendered', { detail: { view: State.view } }));
    }

    function updateHeaderTransparency() {
      const header = document.getElementById('siteHeader');
      if (!header || State.view !== 'home') return;
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', updateHeaderTransparency, { passive: true });

    function renderCartDrawer() {
      const totalCount = getCartTotalCount();
      const subtotal = getCartSubtotal();
      const freeShipThreshold = 499;
      const leftForFreeShip = Math.max(0, freeShipThreshold - subtotal);
      const shipPercent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));

      $('#cartBadgeCount').textContent = totalCount;
      $('#mobileCartCount').textContent = totalCount;
      $('#drawerItemCount').textContent = totalCount;

      if (leftForFreeShip === 0 && subtotal > 0) {
        $('#shippingMeterMsg').innerHTML = '🎉 You unlocked <b>FREE Express Delivery!</b>';
        $('#shippingMeterPercent').textContent = '100%';
      } else {
        $('#shippingMeterMsg').innerHTML = `Add <b>${formatINR(leftForFreeShip)}</b> more for FREE Shipping`;
        $('#shippingMeterPercent').textContent = `${shipPercent}%`;
      }
      $('#shippingBarFill').style.width = `${shipPercent}%`;

      const itemsList = $('#cartItemsList');
      const entries = Object.entries(State.cart);

      if (entries.length === 0) {
        itemsList.innerHTML = `
          <div style="text-align:center; padding: 48px 16px;">
            <div style="font-size:48px; margin-bottom:12px;">🛒</div>
            <h4 style="margin-bottom:6px;">Your Meal Box is Empty</h4>
            <p style="color:var(--text-muted); font-size:13.5px; margin-bottom:18px;">Pick your favorite homestyle dishes and fill your box!</p>
            <button class="btn sm" id="browseMealsBtn">Browse Meals</button>
          </div>
        `;
        $('#drawerFooter').style.display = 'none';
      } else {
        $('#drawerFooter').style.display = 'block';
        itemsList.innerHTML = entries.map(([key, qty]) => {
          if (key.startsWith('BYOB') && State.byobBundles && State.byobBundles[key]) {
            const bundle = State.byobBundles[key];
            const linePrice = bundle.price * qty;
            return `
              <div class="cart-item-row byob-cart-row">
                <div class="cart-item-thumb" style="background:var(--brand-primary-tint); display:grid; place-items:center; font-size:24px;">
                  🍱
                </div>
                <div class="cart-item-info">
                  <b>${bundle.title}</b>
                  <small style="color:var(--text-muted); font-size:11.5px; line-height:1.2; display:block; margin:2px 0;">${bundle.meals.join(', ')}</small>
                  <span class="item-price" style="color:var(--brand-primary);">${formatINR(linePrice)} <small style="color:var(--whatsapp-dark); font-weight:700;">(Saved ${formatINR(bundle.discount * qty)})</small></span>
                </div>
                <div class="qty-stepper" style="width:96px; min-height:34px;">
                  <button data-drawer-minus="${key}">−</button>
                  <span style="font-size:13px;">${qty}</span>
                  <button data-drawer-plus="${key}">+</button>
                </div>
              </div>
            `;
          }
          const [id, pack] = key.split('|');
          const p = PRODUCTS.find(x => x.id === id);
          if (!p) return '';
          const linePrice = calcPrice(p, pack) * qty;
          const packLabel = pack === '3' ? 'Pack of 3' : pack === '6' ? 'Pack of 6' : 'Single Pouch';

          return `
            <div class="cart-item-row">
              <div class="cart-item-thumb">
                <img src="${p.img}" alt="${p.title}" onerror="this.src='https://magicmeals.shop/wp-content/uploads/2026/08/Magic-Meals-300x300.jpg'">
              </div>
              <div class="cart-item-info">
                <b>${p.title}</b>
                <small>${packLabel}</small>
                <span class="item-price">${formatINR(linePrice)}</span>
              </div>
              <div class="qty-stepper" style="width:96px; min-height:34px;">
                <button data-drawer-minus="${key}">−</button>
                <span style="font-size:13px;">${qty}</span>
                <button data-drawer-plus="${key}">+</button>
              </div>
            </div>
          `;
        }).join('');
      }

      $('#cartSubtotalAmt').textContent = formatINR(subtotal);
    }

    function navigateTo(view, productId = null) {
      State.view = view;
      State.productId = productId;
      if (view === 'product') {
        State.pdpPack = '1';
        State.pdpQty = 1;
      }
      closeCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderApp(true);
      try {
        const hash = view === 'product' ? `p-${productId}` : view;
        history.replaceState(null, '', `#${hash}`);
      } catch (e) {}
    }

    function toggleCart(open = null) {
      const drawer = $('#cartDrawer');
      const overlay = $('#drawerOverlay');
      const isOpen = open !== null ? open : !drawer.classList.contains('open');
      drawer.classList.toggle('open', isOpen);
      overlay.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    
    
    
    // Auto-Rotating Promo Bar Logic
    function initPromoBar() {
      const slides = document.querySelectorAll('.promo-slide');
      if (!slides.length) return;
      let currentIdx = 0;
      let timer = null;

      function showSlide(idx) {
        slides.forEach((s, i) => {
          s.classList.toggle('active', i === idx);
        });
        currentIdx = idx;
      }

      function nextSlide() {
        showSlide((currentIdx + 1) % slides.length);
      }

      function prevSlide() {
        showSlide((currentIdx - 1 + slides.length) % slides.length);
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(nextSlide, 3500);
      }

      function stopTimer() {
        clearInterval(timer);
      }

      const bar = document.getElementById('promoBar');
      if (bar) {
        bar.addEventListener('mouseenter', stopTimer);
        bar.addEventListener('mouseleave', startTimer);
      }

      const prevBtn = document.getElementById('promoPrevBtn');
      const nextBtn = document.getElementById('promoNextBtn');
      if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); startTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); startTimer(); });

      startTimer();
    }

    function openVideoModal(videoId) {
      const modal = document.getElementById('videoModalBackdrop');
      const iframe = document.getElementById('videoModalIframe');
      if (modal && iframe) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeVideoModal() {
      const modal = document.getElementById('videoModalBackdrop');
      const iframe = document.getElementById('videoModalIframe');
      if (modal && iframe) {
        iframe.src = '';
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    let lastFocusedBeforeDrawer = null;

    function openMobileDrawer() {
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileDrawerBackdrop');
      if (drawer && backdrop) {
        lastFocusedBeforeDrawer = document.activeElement;
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        const closeBtn = document.getElementById('mobileMenuCloseBtn');
        if (closeBtn) closeBtn.focus();
      }
    }

    function closeMobileDrawer() {
      const drawer = document.getElementById('mobileDrawer');
      const backdrop = document.getElementById('mobileDrawerBackdrop');
      if (drawer && backdrop) {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
        if (lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === 'function') {
          lastFocusedBeforeDrawer.focus();
        }
      }
    }

    function closeCart() {
      toggleCart(false);
    }

    function showToast(message) {
      const toast = $('#toast');
      if (!toast) return;
      toast.innerHTML = `<span>✓</span><span>${message}</span>`;
      toast.classList.add('show');
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    function pulseCartIcon() {
      const isMobile = window.innerWidth <= 768;
      const destEl = (isMobile && document.getElementById('mobileCartTrigger')) || document.getElementById('cartOpenBtn');
      const badge = document.getElementById('cartBadgeCount');
      const mobBadge = document.getElementById('mobileCartCount');

      if (destEl && typeof gsap !== 'undefined') {
        gsap.fromTo(destEl, 
          { scale: 1 }, 
          { scale: 1.25, duration: 0.16, yoyo: true, repeat: 1, ease: 'back.out(2)' }
        );
      }
      [badge, mobBadge].forEach(b => {
        if (b) {
          b.classList.remove('pop');
          void b.offsetWidth;
          b.classList.add('pop');
        }
      });
    }

    function flyToCart(sourceEl) {
      if (!sourceEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined') {
        pulseCartIcon();
        return;
      }

      // Target the header cart button (visible on all screens at top-right)
      const destEl = document.getElementById('cartOpenBtn') || document.getElementById('mobileCartTrigger');
      if (!destEl) {
        pulseCartIcon();
        return;
      }

      const startRect = sourceEl.getBoundingClientRect();
      const destRect = destEl.getBoundingClientRect();

      if (startRect.width === 0 || startRect.height === 0) {
        pulseCartIcon();
        return;
      }

      let imgSrc = '';
      if (sourceEl.tagName === 'IMG') {
        imgSrc = sourceEl.src;
      } else {
        const childImg = sourceEl.querySelector && sourceEl.querySelector('img');
        if (childImg) imgSrc = childImg.src;
      }

      const flyer = document.createElement('div');
      flyer.className = 'fly-to-cart-clone';

      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = 'Flying Meal';
        flyer.appendChild(img);
      } else {
        flyer.innerHTML = `<span style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; font-size:24px;">🍱</span>`;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw <= 768;

      // Sizing calibrated for device viewports
      const startSize = isMobile ? 52 : 64;
      const startX = startRect.left + (startRect.width - startSize) / 2;
      const startY = startRect.top + (startRect.height - startSize) / 2;
      const targetX = destRect.left + (destRect.width - startSize) / 2;
      const targetY = destRect.top + (destRect.height - startSize) / 2;

      Object.assign(flyer.style, {
        position: 'fixed',
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${startSize}px`,
        height: `${startSize}px`,
        zIndex: '10000',
        pointerEvents: 'none',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 14px 34px rgb(var(--black-rgb) / 0.28), 0 0 16px rgb(var(--brand-primary-rgb) / 0.35)',
        transformOrigin: 'center center'
      });

      if (flyer.firstChild && flyer.firstChild.tagName === 'IMG') {
        Object.assign(flyer.firstChild.style, {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        });
      }

      document.body.appendChild(flyer);

      // Total distance vector
      const deltaX = targetX - startX;
      const deltaY = targetY - startY;

      // Safe viewport boundary clamps so flyer NEVER flies out of the screen
      const minSafeY = 48; // keep below top browser chrome & ticker
      const maxSafeY = vh - startSize - 16;

      // Calculate midpoint: smoothly arcs toward cart while strictly staying on screen
      let midAbsY;
      if (startY > targetY) {
        const directMidY = startY + deltaY * 0.55;
        const curveLift = Math.min(28, Math.max(0, (startY - minSafeY) * 0.12));
        midAbsY = Math.max(minSafeY, directMidY - curveLift);
      } else {
        const directMidY = startY + deltaY * 0.50;
        const curveDrop = Math.min(28, Math.max(0, (maxSafeY - startY) * 0.12));
        midAbsY = Math.min(maxSafeY, directMidY + curveDrop);
      }

      const midDeltaY = midAbsY - startY;
      const dur = 0.52;
      const tMid = 0.24;

      const tl = gsap.timeline({
        onComplete: () => {
          flyer.remove();
          pulseCartIcon();
        }
      });

      // Horizontal: continuous uninterrupted forward momentum across the full flight (NO MID-AIR PAUSE)
      tl.to(flyer, {
        x: deltaX,
        duration: dur,
        ease: 'power1.inOut'
      }, 0);

      // Vertical: arcs smoothly up to apex without stopping, then drops into the cart
      tl.to(flyer, {
        y: midDeltaY,
        duration: tMid,
        ease: 'sine.out'
      }, 0);

      tl.to(flyer, {
        y: deltaY,
        duration: dur - tMid,
        ease: 'power2.in'
      }, tMid);

      // Subtle dynamic tilt and scale down into the cart
      tl.to(flyer, {
        scale: 0.88,
        rotation: deltaX > 0 ? 8 : -8,
        duration: tMid,
        ease: 'sine.out'
      }, 0);

      tl.to(flyer, {
        scale: 0.28,
        opacity: 0.92,
        rotation: 0,
        duration: dur - tMid,
        ease: 'power2.in'
      }, tMid);
    }

    function flyToSlot(sourceEl, slotEl) {
      if (!sourceEl || !slotEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof gsap === 'undefined') {
        return;
      }
      const startRect = sourceEl.getBoundingClientRect();
      const destRect = slotEl.getBoundingClientRect();
      if (startRect.width === 0 || destRect.width === 0) return;

      let imgSrc = '';
      if (sourceEl.tagName === 'IMG') imgSrc = sourceEl.src;
      else {
        const img = sourceEl.querySelector && sourceEl.querySelector('img');
        if (img) imgSrc = img.src;
      }

      const flyer = document.createElement('div');
      flyer.className = 'fly-to-cart-clone';
      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        flyer.appendChild(img);
      }
      const size = 52;
      const startX = startRect.left + (startRect.width - size) / 2;
      const startY = startRect.top + (startRect.height - size) / 2;
      const destX = destRect.left + (destRect.width - size) / 2;
      const destY = destRect.top + (destRect.height - size) / 2;

      Object.assign(flyer.style, {
        position: 'fixed',
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: '10000',
        pointerEvents: 'none',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
      });
      if (flyer.firstChild) {
        Object.assign(flyer.firstChild.style, { width: '100%', height: '100%', objectFit: 'cover' });
      }
      document.body.appendChild(flyer);

      gsap.to(flyer, {
        x: destX - startX,
        y: destY - startY,
        scale: 0.85,
        duration: 0.38,
        ease: 'power2.inOut',
        onComplete: () => {
          flyer.remove();
        }
      });
    }

    function modifyCart(itemKey, delta) {
      State.cart[itemKey] = (State.cart[itemKey] || 0) + delta;
      if (State.cart[itemKey] <= 0) {
        delete State.cart[itemKey];
      }
      renderCartDrawer();
      renderApp();
    }

    document.addEventListener('click', e => {
      const target = e.target.closest('button, a, [data-go], [data-p], [data-cat], [data-byob-remove], [data-byob-add], [data-byob-size], [data-byob-cat], #mobileDrawerBackdrop');
      if (!target) return;

      
      
      const reelCard = target.closest('.reel-card');
      if (reelCard && reelCard.dataset.videoId) {
        openVideoModal(reelCard.dataset.videoId);
        return;
      }
      if (target.id === 'videoModalCloseBtn' || target.id === 'videoModalBackdrop') {
        closeVideoModal();
        return;
      }

      
      if (target.id === 'mobileBottomCategoriesBtn') {
        openMobileDrawer();
        return;
      }
      if (target.id === 'heroJainQuickBtn') {
        State.jainOnly = true;
        navigateTo('shop');
        showToast('Showing 100% Jain-friendly dishes');
        return;
      }

      if (target.id === 'mobileMenuOpenBtn') {
        openMobileDrawer();
        return;
      }
      if (target.id === 'mobileMenuCloseBtn' || target.id === 'mobileDrawerBackdrop') {
        closeMobileDrawer();
        return;
      }
      if (target.id === 'drawerProfileBtn' || target.closest('#drawerProfileBtn') || target.dataset.action === 'profile' || target.closest('[data-action="profile"]')) {
        closeMobileDrawer();
        const backdrop = document.getElementById('authModalBackdrop');
        if (backdrop) {
          backdrop.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
        return;
      }
      if (target.closest('#mobileDrawer') && (target.dataset.cat || target.dataset.go)) {
        closeMobileDrawer();
      }

      if (target.id === 'reelScrollLeft') {
        const reels = document.getElementById('youtubeReelsContainer');
        if (reels) reels.scrollBy({ left: -300, behavior: 'smooth' });
        return;
      }
      if (target.id === 'reelScrollRight') {
        const reels = document.getElementById('youtubeReelsContainer');
        if (reels) reels.scrollBy({ left: 300, behavior: 'smooth' });
        return;
      }

      // BYOB Box Size Toggle
      const byobSizeBtn = target.dataset.byobSize ? target : target.closest('[data-byob-size]');
      if (byobSizeBtn) {
        State.byobSize = parseInt(byobSizeBtn.dataset.byobSize, 10);
        if (State.byobSlots.length > State.byobSize) {
          State.byobSlots = State.byobSlots.slice(0, State.byobSize);
        }
        renderApp();
        return;
      }

      // BYOB Category Filter Pill
      if (target.dataset.byobCat) {
        State.byobCategory = target.dataset.byobCat;
        renderApp();
        return;
      }

      // BYOB Add Dish to Box
      if (target.dataset.byobAdd) {
        e.stopPropagation();
        const pId = target.dataset.byobAdd;
        if (State.byobSlots.length >= State.byobSize) {
          showToast(`Box is full (${State.byobSize}/${State.byobSize})! Complete your box or remove a dish.`);
          return;
        }
        const card = target.closest('.byob-meal-card');
        const img = card ? card.querySelector('.byob-meal-thumb img') : target;
        const nextSlotIdx = State.byobSlots.length;
        const isMobile = window.innerWidth <= 960;
        const slotEl = (isMobile ? document.getElementById(`byobSlotMobile_${nextSlotIdx}`) : null) 
          || document.getElementById(`byobSlot_${nextSlotIdx}`);
        if (slotEl) flyToSlot(img, slotEl);

        State.byobSlots.push(pId);
        renderApp();
        if (State.byobSlots.length >= State.byobSize) {
          const perkMsg = State.byobSize === 6 
            ? '🎉 6-Pack Box Ready! 15% OFF + Free Gift unlocked!' 
            : State.byobSize === 2 
              ? '🎉 2-Pack Ready! 5% OFF unlocked!' 
              : '🎉 4-Pack Box Ready! 10% OFF unlocked!';
          showToast(perkMsg);
        } else {
          showToast('Added dish to box!');
        }
        return;
      }

      // BYOB Remove Dish from Box
      const byobRemoveBtn = target.dataset.byobRemove !== undefined ? target : target.closest('[data-byob-remove]');
      if (byobRemoveBtn) {
        const idx = parseInt(byobRemoveBtn.dataset.byobRemove, 10);
        State.byobSlots.splice(idx, 1);
        renderApp();
        showToast('Removed dish from box');
        return;
      }

      // BYOB Clear Box (Desktop + Mobile)
      if (target.id === 'byobResetBtn' || target.id === 'byobResetBtnMobile') {
        State.byobSlots = [];
        renderApp();
        showToast('Box cleared');
        return;
      }

      // BYOB Add Complete Box to Cart (Desktop + Mobile)
      if (target.id === 'byobAddToCartBtn' || target.id === 'byobAddToCartBtnMobile') {
        if (State.byobSlots.length < State.byobSize) return;
        const size = State.byobSize;
        const is2Pack = size === 2;
        const is6Pack = size === 6;
        const discountPercent = is6Pack ? 15 : is2Pack ? 5 : 10;
        const byobMeals = State.byobSlots.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
        const rawTotal = byobMeals.reduce((sum, p) => sum + p.price, 0);
        const discountAmt = Math.round(rawTotal * (discountPercent / 100));
        const finalTotal = rawTotal - discountAmt;

        const boxTitle = is2Pack ? 'Custom 2-Pack Solo Box' : is6Pack ? 'Custom 6-Pack Travel Box' : 'Custom 4-Pack Explorer Box';
        const bundleKey = `BYOB-${size}-${Date.now()}|1`;
        State.byobBundles = State.byobBundles || {};
        State.byobBundles[bundleKey] = {
          title: boxTitle,
          meals: byobMeals.map(m => m.title),
          price: finalTotal,
          discount: discountAmt,
          size: size
        };

        State.cart[bundleKey] = 1;
        const carton = document.getElementById('byobCarton') || target;
        flyToCart(carton);
        showToast(`Added ${boxTitle} to cart!`);
        renderCartDrawer();
        renderApp();
        setTimeout(() => toggleCart(true), 650);
        return;
      }

      if (target.dataset.p && !target.closest('.qty-stepper, .btn-add, .btn-byob-add')) {
        navigateTo('product', target.dataset.p);
        return;
      }

      if (target.dataset.add) {
        e.stopPropagation();
        const pId = target.dataset.add;
        const card = target.closest('.product-card');
        const img = card ? card.querySelector('.card-thumb img') : null;
        flyToCart(img || target);
        modifyCart(`${pId}|1`, 1);
        showToast('Meal added to box!');
        return;
      }

      if (target.dataset.minus) {
        e.stopPropagation();
        modifyCart(`${target.dataset.minus}|1`, -1);
        return;
      }

      if (target.dataset.drawerPlus) {
        modifyCart(target.dataset.drawerPlus, 1);
        return;
      }
      if (target.dataset.drawerMinus) {
        modifyCart(target.dataset.drawerMinus, -1);
        return;
      }

      if (target.dataset.cat) {
        e.preventDefault();
        State.selectedCategory = target.dataset.cat;
        navigateTo('shop');
        return;
      }

      if (target.dataset.go) {
        e.preventDefault();
        navigateTo(target.dataset.go);
        return;
      }

      if (target.dataset.jainQuick) {
        State.jainOnly = true;
        navigateTo('shop');
        showToast('Filtered for 100% Jain meals');
        return;
      }

      if (target.id === 'jainToggleBtn' || target.closest('#jainToggleBtn') || target.dataset.jainToggle !== undefined || target.closest('[data-jain-toggle]')) {
        State.jainOnly = !State.jainOnly;
        showToast(State.jainOnly ? 'Showing Jain-friendly meals only' : 'Showing all vegetarian meals');
        renderApp();
        return;
      }

      if (target.id === 'cartOpenBtn' || target.id === 'mobileCartTrigger') {
        toggleCart(true);
        return;
      }
      if (target.id === 'closeDrawerBtn') {
        closeCart();
        return;
      }
      if (target.id === 'browseMealsBtn') {
        closeCart();
        navigateTo('shop');
        return;
      }

      if (target.dataset.pdpPack) {
        State.pdpPack = target.dataset.pdpPack;
        renderApp();
        return;
      }

      if (target.id === 'pdpQtyPlus') {
        State.pdpQty++;
        renderApp();
        return;
      }
      if (target.id === 'pdpQtyMinus') {
        State.pdpQty = Math.max(1, State.pdpQty - 1);
        renderApp();
        return;
      }

      if (target.id === 'pdpAddToCartBtn') {
        const itemKey = `${State.productId}|${State.pdpPack}`;
        const pdpImg = document.querySelector('.pdp-gallery img');
        flyToCart(pdpImg || target);
        modifyCart(itemKey, State.pdpQty);
        showToast(`Added ${State.pdpQty}x to Meal Box!`);
        return;
      }

      if (target.id === 'checkPincodeBtn') {
        const pin = $('#pincodeInput').value.trim();
        if (pin.length === 6 && /^\d+$/.test(pin)) {
          $('#pincodeResult').style.display = 'block';
        } else {
          alert('Please enter a valid 6-digit Indian PIN code.');
        }
        return;
      }

      if (target.id === 'resetFiltersBtn') {
        State.searchQuery = '';
        State.selectedCategory = 'All';
        State.jainOnly = false;
        renderApp();
        return;
      }

      if (target.id === 'checkoutBtn') {
        handleShopifyCheckout();
        return;
      }
    });

    async function handleShopifyCheckout() {
      const btn = document.getElementById('checkoutBtn');
      if (!btn) return;

      const cfg = window.SHOPIFY_CONFIG || {};
      const shop = cfg.shopDomain || '1z10zd-y0.myshopify.com';
      const token = cfg.storefrontAccessToken;

      const cartEntries = Object.entries(State.cart);
      if (cartEntries.length === 0) {
        showToast('Your meal box is empty!');
        return;
      }

      // Check if token is still placeholder
      if (!token || token.includes('PASTE_YOUR_PUBLIC_STOREFRONT_TOKEN') || token.trim() === '') {
        alert(
          '⚠️ Shopify Storefront Token Not Configured Yet!\n\n' +
          'Please open "shopify-config.js" in your project folder and paste your Public Storefront API Access Token.\n\n' +
          'Redirecting to your store admin in the meantime...'
        );
        window.open(`https://${shop}`, '_blank');
        return;
      }

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.style.opacity = '0.75';
      btn.innerHTML = `
        <span style="display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" fill="none" style="animation: spin 0.8s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Connecting to Shopify...
        </span>
      `;

      try {
        const lines = [];
        const mapping = cfg.productVariantMapping || {};

        for (const [key, qty] of cartEntries) {
          if (qty <= 0) continue;
          let variantId = null;
          if (key.startsWith('BYOB')) {
            variantId = mapping[key] || mapping['family-feast-box'] || null;
          } else {
            const [pId] = key.split('|');
            variantId = mapping[pId] || null;
          }

          if (variantId) {
            const gid = String(variantId).startsWith('gid://') ? variantId : `gid://shopify/ProductVariant/${variantId}`;
            lines.push({ merchandiseId: gid, quantity: qty });
          }
        }

        // If no mapped variant IDs found yet, auto-discover products from Shopify Storefront API!
        if (lines.length === 0) {
          const fetchProductsQuery = `
            query {
              products(first: 20) {
                edges {
                  node {
                    id
                    handle
                    title
                    variants(first: 1) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

          const prodRes = await fetch(`https://${shop}/api/${cfg.apiVersion || '2024-01'}/graphql.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': token
            },
            body: JSON.stringify({ query: fetchProductsQuery })
          });

          const prodData = await prodRes.json();
          const shopifyProds = prodData?.data?.products?.edges || [];

          if (shopifyProds.length > 0) {
            for (const [key, qty] of cartEntries) {
              const [pId] = key.split('|');
              const localProd = PRODUCTS.find(x => x.id === pId);
              const matched = shopifyProds.find(e => {
                const t = e.node.title.toLowerCase();
                const h = e.node.handle.toLowerCase();
                return (localProd && (t.includes(localProd.title.toLowerCase().slice(0, 10)) || h.includes(pId))) || false;
              }) || shopifyProds[0];

              const vId = matched?.node?.variants?.edges?.[0]?.node?.id;
              if (vId) {
                lines.push({ merchandiseId: vId, quantity: qty });
              }
            }
          }
        }

        if (lines.length === 0) {
          alert(
            '⚠️ No Products Found in Shopify Store!\n\n' +
            'Your Storefront API is connected successfully, but no products are published in your Shopify store.\n\n' +
            'Please go to Shopify Admin > Products, create at least 1 product, and make sure its Sales Channel is set to "Headless" or "Online Store".'
          );
          return;
        }

        // Create Checkout Cart via Storefront API
        const cartCreateMutation = `
          mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart {
                id
                checkoutUrl
              }
              userErrors {
                code
                field
                message
              }
            }
          }
        `;

        const cartRes = await fetch(`https://${shop}/api/${cfg.apiVersion || '2024-01'}/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': token
          },
          body: JSON.stringify({
            query: cartCreateMutation,
            variables: { input: { lines } }
          })
        });

        const cartData = await cartRes.json();
        const checkoutUrl = cartData?.data?.cartCreate?.cart?.checkoutUrl;

        if (checkoutUrl) {
          showToast('Redirecting to secure Shopify Checkout...');
          window.location.href = checkoutUrl;
          return;
        } else {
          const userErrs = cartData?.data?.cartCreate?.userErrors || cartData?.errors || [];
          const msg = userErrs.map(e => e.message).join('\n') || 'Unable to create checkout cart.';
          alert('Shopify Notice:\n' + msg);
        }
      } catch (err) {
        console.error('Shopify checkout error:', err);
        alert('Checkout error: ' + err.message + '\n\nPlease check console for details.');
      } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = originalText;
      }
    }

    $('#drawerOverlay').addEventListener('click', closeCart);
    const mBackdrop = document.getElementById('mobileDrawerBackdrop');
    if (mBackdrop) mBackdrop.addEventListener('click', closeMobileDrawer);

    document.addEventListener('keydown', e => {
      const drawer = document.getElementById('mobileDrawer');
      const isDrawerOpen = drawer && drawer.classList.contains('open');

      if (e.key === 'Escape') {
        closeCart();
        closeMobileDrawer();
        closeVideoModal();
        return;
      }

      if (e.key === 'Tab' && isDrawerOpen) {
        const focusables = Array.from(drawer.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    document.addEventListener('input', e => {
      if (e.target.id === 'catalogSearchInput') {
        State.searchQuery = e.target.value;
        const cursor = e.target.selectionStart;
        renderApp();
        const input = $('#catalogSearchInput');
        if (input) {
          input.focus();
          input.setSelectionRange(cursor, cursor);
        }
      }
    });

    document.addEventListener('change', e => {
      if (e.target.id === 'catalogSortSelect') {
        State.sortBy = e.target.value;
        renderApp();
      }
    });

    function initRoute() {
      const hash = (location.hash || '').slice(1);
      if (hash.startsWith('p-')) {
        const id = hash.slice(2);
        if (PRODUCTS.some(x => x.id === id)) {
          navigateTo('product', id);
          return;
        }
      }
      if (hash === 'shop') {
        navigateTo('shop');
        return;
      }
      if (hash === 'byob') {
        navigateTo('byob');
        return;
      }
      navigateTo('home');
    }

    initRoute();
    window.addEventListener('hashchange', initRoute);
    
      // Auth Modal Open/Close & Tabs (Delegated on document)
      document.addEventListener('click', (e) => {
        const authBtn = e.target.closest('#authOpenBtn');
        if (authBtn) {
          const backdrop = document.getElementById('authModalBackdrop');
          if (backdrop) {
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
          }
          return;
        }
        const closeBtn = e.target.closest('#authModalCloseBtn');
        if (closeBtn) {
          const backdrop = document.getElementById('authModalBackdrop');
          if (backdrop) {
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
          }
          return;
        }
        const backdrop = document.getElementById('authModalBackdrop');
        if (backdrop && e.target === backdrop) {
          backdrop.classList.remove('open');
          document.body.style.overflow = '';
          return;
        }
        if (e.target.closest('#tabSignInBtn')) {
          document.getElementById('tabSignInBtn')?.classList.add('active');
          document.getElementById('tabSignUpBtn')?.classList.remove('active');
          const sIn = document.getElementById('signInForm');
          const sUp = document.getElementById('signUpForm');
          if (sIn) sIn.style.display = 'block';
          if (sUp) sUp.style.display = 'none';
          return;
        }
        if (e.target.closest('#tabSignUpBtn')) {
          document.getElementById('tabSignUpBtn')?.classList.add('active');
          document.getElementById('tabSignInBtn')?.classList.remove('active');
          const sIn = document.getElementById('signInForm');
          const sUp = document.getElementById('signUpForm');
          if (sIn) sIn.style.display = 'none';
          if (sUp) sUp.style.display = 'block';
          return;
        }
      });

      initPromoBar();

      // =========================================================================
      // 3D Stand-Up Pouch Interactive Viewer for Rajma Masala PDP
      // (Exclusively enabled when viewing this specific product)
      // =========================================================================
      var pdp3dScene = null;
      var pdp3dCamera = null;
      var pdp3dRenderer = null;
      var pdp3dControls = null;
      var pdp3dAnimId = null;
      var pdp3dPouchGroup = null;
      var pdp3dIsSpinning = false;
      var pdp3dTargetRotY = null;
      var pdp3dResizeObserver = null;

      window.snapPdp3d = function(view) {
        pdp3dIsSpinning = false;
        if (!pdp3dPouchGroup) return;
        if (view === 'front') {
          pdp3dTargetRotY = 0;
        } else if (view === 'back') {
          pdp3dTargetRotY = Math.PI;
        }
      };

      window.togglePdp3dSpin = function() {
        pdp3dIsSpinning = !pdp3dIsSpinning;
      };

      function initPdp3dPouch() {
        disposePdp3dPouch();
        const container = document.getElementById('pdp3dCanvasContainer');
        if (!container || !window.THREE) return;

        const rect = container.getBoundingClientRect();
        const width = rect.width || container.clientWidth || 420;
        const height = rect.height || container.clientHeight || 420;

        pdp3dScene = new THREE.Scene();

        pdp3dCamera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
        pdp3dCamera.position.set(0, 0, 2.95);

        pdp3dRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        pdp3dRenderer.setSize(width, height);
        pdp3dRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        pdp3dRenderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(pdp3dRenderer.domElement);

        if (window.THREE.OrbitControls) {
          pdp3dControls = new THREE.OrbitControls(pdp3dCamera, pdp3dRenderer.domElement);
          pdp3dControls.enableDamping = true;
          pdp3dControls.dampingFactor = 0.08;
          pdp3dControls.minDistance = 1.3;
          pdp3dControls.maxDistance = 4.2;
          pdp3dControls.minPolarAngle = Math.PI * 0.35;
          pdp3dControls.maxPolarAngle = Math.PI * 0.65;
          pdp3dControls.addEventListener('start', () => { 
            pdp3dIsSpinning = false; 
            pdp3dTargetRotY = null;
          });
        }

        // Soft uniform lighting to preserve crisp contrast of printed packaging details
        const amb = new THREE.AmbientLight(0xffffff, 0.96);
        pdp3dScene.add(amb);
        const keyLight = new THREE.DirectionalLight(0xfffbf2, 0.22);
        keyLight.position.set(2, 4, 3);
        pdp3dScene.add(keyLight);
        const backFill = new THREE.DirectionalLight(0xf2f4ff, 0.22);
        backFill.position.set(-2, 2, -3);
        pdp3dScene.add(backFill);

        // Ground shadow
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const sCtx = shadowCanvas.getContext('2d');
        const grad = sCtx.createRadialGradient(128, 128, 5, 128, 128, 120);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
        grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 256, 256);
        const sTex = new THREE.CanvasTexture(shadowCanvas);
        const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ map: sTex, transparent: true, depthWrite: false }));
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = -0.92;
        pdp3dScene.add(shadowMesh);

        // Load Textures (Uses embedded high-resolution data URIs to guarantee zero CORS issues under file:///)
        const texLoader = new THREE.TextureLoader();
        const frontSrc = (window.RAJMA_POUCH_TEXTURES && window.RAJMA_POUCH_TEXTURES.front) || 'pouch-art/rajma-masala-front-processed.png';
        const backSrc = (window.RAJMA_POUCH_TEXTURES && window.RAJMA_POUCH_TEXTURES.back) || 'pouch-art/rajma-masala-back-processed.png';
        const maxAniso = pdp3dRenderer.capabilities ? pdp3dRenderer.capabilities.getMaxAnisotropy() : 8;

        const texF = texLoader.load(frontSrc);
        texF.encoding = THREE.sRGBEncoding;
        texF.generateMipmaps = false;
        texF.minFilter = THREE.LinearFilter;
        texF.magFilter = THREE.LinearFilter;
        texF.anisotropy = maxAniso;

        const texB = texLoader.load(backSrc);
        texB.encoding = THREE.sRGBEncoding;
        texB.generateMipmaps = false;
        texB.minFilter = THREE.LinearFilter;
        texB.magFilter = THREE.LinearFilter;
        texB.anisotropy = maxAniso;

        // Pouch Geometry
        const POUCH_W = 1.16;
        const POUCH_H = 1.80;
        const MAX_BULGE = 0.22;

        function createGeo(isFront) {
          const segX = 40, segY = 56;
          const geo = new THREE.BufferGeometry();
          const pos = [], nrm = [], uvs = [], idx = [];

          for (let j = 0; j <= segY; j++) {
            const v = j / segY;
            const y = (v - 0.5) * POUCH_H;
            
            // Continuous, smooth depth profile without any abrupt drops or creases across the logo
            let vDepth = 0;
            if (v < 0.12) {
              // Base gusset: smooth expansion from bottom edge
              vDepth = Math.sin((v / 0.12) * Math.PI * 0.5) * 0.85;
            } else if (v < 0.65) {
              // Main food cavity: gentle belly fullness
              const t = (v - 0.12) / (0.65 - 0.12);
              vDepth = 0.85 + 0.15 * Math.sin(t * Math.PI);
            } else {
              // Smooth, continuous taper up to top heat seal (NO DENT across the logo)
              const t = (v - 0.65) / (1.0 - 0.65);
              vDepth = 0.05 + 0.80 * 0.5 * (1 + Math.cos(t * Math.PI));
            }

            for (let i = 0; i <= segX; i++) {
              const u = i / segX;
              const x = (u - 0.5) * POUCH_W;
              let hDepth = 0;
              const distFromCenter = Math.abs((u - 0.5) / 0.5);
              if (distFromCenter < 0.90) {
                hDepth = Math.cos((distFromCenter / 0.90) * Math.PI * 0.5);
              } else {
                hDepth = 0.0;
              }

              const sign = isFront ? 1 : -1;
              const z = sign * MAX_BULGE * vDepth * hDepth;
              pos.push(x, y, z);
              nrm.push(0, 0, sign);
              if (isFront) {
                uvs.push(u, v);
              } else {
                // Non-mirrored back UV so text reads correctly left-to-right
                uvs.push(1.0 - u, v);
              }
            }
          }

          for (let j = 0; j < segY; j++) {
            for (let i = 0; i < segX; i++) {
              const a = j * (segX + 1) + i;
              const b = j * (segX + 1) + (i + 1);
              const c = (j + 1) * (segX + 1) + i;
              const d = (j + 1) * (segX + 1) + (i + 1);
              if (isFront) {
                idx.push(a, b, d, a, d, c);
              } else {
                idx.push(a, d, b, a, c, d);
              }
            }
          }

          geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
          geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
          geo.setIndex(idx);
          geo.computeVertexNormals();
          return geo;
        }

        const matF = new THREE.MeshStandardMaterial({ map: texF, roughness: 0.65, metalness: 0.01, transparent: true, alphaTest: 0.02 });
        const matB = new THREE.MeshStandardMaterial({ map: texB, roughness: 0.65, metalness: 0.01, transparent: true, alphaTest: 0.02 });

        pdp3dPouchGroup = new THREE.Group();
        pdp3dPouchGroup.add(new THREE.Mesh(createGeo(true), matF));
        pdp3dPouchGroup.add(new THREE.Mesh(createGeo(false), matB));
        pdp3dScene.add(pdp3dPouchGroup);

        function loop() {
          pdp3dAnimId = requestAnimationFrame(loop);
          if (pdp3dIsSpinning && pdp3dPouchGroup) {
            pdp3dPouchGroup.rotation.y += 0.007;
          } else if (pdp3dTargetRotY !== null && pdp3dPouchGroup) {
            pdp3dPouchGroup.rotation.y += (pdp3dTargetRotY - pdp3dPouchGroup.rotation.y) * 0.12;
            if (Math.abs(pdp3dTargetRotY - pdp3dPouchGroup.rotation.y) < 0.003) {
              pdp3dPouchGroup.rotation.y = pdp3dTargetRotY;
              pdp3dTargetRotY = null;
            }
          }
          if (pdp3dControls) pdp3dControls.update();
          if (pdp3dRenderer && pdp3dScene && pdp3dCamera) {
            pdp3dRenderer.render(pdp3dScene, pdp3dCamera);
          }
        }
        loop();

        if (window.ResizeObserver) {
          pdp3dResizeObserver = new ResizeObserver(() => {
            if (!container || !pdp3dRenderer || !pdp3dCamera) return;
            const r = container.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              pdp3dCamera.aspect = r.width / r.height;
              pdp3dCamera.updateProjectionMatrix();
              pdp3dRenderer.setSize(r.width, r.height);
            }
          });
          pdp3dResizeObserver.observe(container);
        }
      }

      function disposePdp3dPouch() {
        if (pdp3dAnimId) {
          cancelAnimationFrame(pdp3dAnimId);
          pdp3dAnimId = null;
        }
        if (pdp3dResizeObserver) {
          pdp3dResizeObserver.disconnect();
          pdp3dResizeObserver = null;
        }
        if (pdp3dRenderer && pdp3dRenderer.domElement && pdp3dRenderer.domElement.parentNode) {
          pdp3dRenderer.domElement.parentNode.removeChild(pdp3dRenderer.domElement);
        }
        pdp3dScene = null;
        pdp3dCamera = null;
        pdp3dRenderer = null;
        pdp3dControls = null;
        pdp3dPouchGroup = null;
        pdp3dTargetRotY = null;
      }
