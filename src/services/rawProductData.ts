export interface SupermarketProduct {
  n: string;
  o: any;
  p: string;
  s: string;
};

export interface Supermarket {
  n: string;
  u: string;
  i: string;
  d: SupermarketProduct[];
};

const supermarkets: Supermarket[] = [
  {
    "n": "AH",
    "u": "https://www.ah.nl/producten/product/",
    "i": "https://www.ah.nl/favicon.ico",
    "d": [
      {
        "n": "",
        "o": null,
        "p": "1.39",
        "s": "200 g"
      },
      {
        "n": "AH Terra Biologisch kikkererwten",
        "o": null,
        "p": "1.99",
        "s": "500 g"
      },
      {
        "n": "AH Blanches aardappelen",
        "o": null,
        "p": "3.29",
        "s": "1,5 kg"
      },
      {
        "n": "Valle del sole Groene spliterwten",
        "o": null,
        "p": "2.39",
        "s": "900 g"
      },
      {
        "n": "Hak Mais",
        "o": null,
        "p": "1.19",
        "s": "190 g"
      },
      {
        "n": "AH Groene aspergetips",
        "o": null,
        "p": "3.99",
        "s": "100 g"
      },
      {
        "n": "Aarts Asperges",
        "o": null,
        "p": "4.69",
        "s": "530 g"
      },
      {
        "n": "Bonduelle Chilibonen in saus",
        "o": null,
        "p": "1.79",
        "s": "200 g"
      },
      {
        "n": "Royal Zongedroogde tomaten in olie",
        "o": null,
        "p": "2.75",
        "s": "290 g"
      },
      {
        "n": "AH Gesneden Kruidige Jambalaya Verspakket",
        "o": null,
        "p": "8.89",
        "s": "online10% pakketkorting"
      },
      {
        "n": "Kühne Cocktailsalade zoetzuur",
        "o": null,
        "p": "1.89",
        "s": "370 ml"
      },
      {
        "n": "Kesbeke Mini augurkjes zuur",
        "o": null,
        "p": "1.69",
        "s": "235 ml"
      },
      {
        "n": "Boon Linzen in kruidige tomatensaus",
        "o": null,
        "p": "1.99",
        "s": "380 g"
      },
      {
        "n": "Kühne Cocktail cornichons zoetzuur",
        "o": null,
        "p": "1.59",
        "s": "212 ml"
      },
      {
        "n": "Kesbeke Gesnipperde uitjes",
        "o": null,
        "p": "1.69",
        "s": "235 ml"
      },
      {
        "n": "AH Champignonsoep verspakket",
        "o": null,
        "p": "7.17",
        "s": "onlinePakket"
      },
      {
        "n": "AH Gesneden Tex Mex Burrito's Verspakket",
        "o": null,
        "p": "12.00",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Gekookte wijnzuurkool met spek",
        "o": null,
        "p": "1.49",
        "s": "520 g"
      },
      {
        "n": "Kühne Rauwkost zoetzuur",
        "o": null,
        "p": "1.89",
        "s": "330 g"
      },
      {
        "n": "La Morena Jalapeno nacho slices",
        "o": null,
        "p": "3.39",
        "s": "230 g"
      },
      {
        "n": "AH Curry Madras Verspakket",
        "o": null,
        "p": "10.95",
        "s": "online10% pakketkorting"
      },
      {
        "n": "Kühne Wortel zoetzuur",
        "o": null,
        "p": "1.99",
        "s": "330 g"
      },
      {
        "n": "Valle del sole Zwarte oogbonen",
        "o": null,
        "p": "2.99",
        "s": "900 g"
      },
      {
        "n": "AH Gesneden Bami Verspakket",
        "o": null,
        "p": "10.95",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Gesneden verspakket kimchi bowl",
        "o": null,
        "p": "4.99",
        "s": "635 g"
      },
      {
        "n": "Kühne Paprikareepjes",
        "o": null,
        "p": "1.89",
        "s": "320 g"
      },
      {
        "n": "AH Komkommerblokjes pittig",
        "o": null,
        "p": "1.59",
        "s": "330 g"
      },
      {
        "n": "AH Italiaanse Pasta Pesto Verspakket",
        "o": null,
        "p": "14.05",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Kip Hawaï verspakket",
        "o": null,
        "p": "5.89",
        "s": ""
      },
      {
        "n": "Boon Kikkererwten in curry",
        "o": null,
        "p": "1.99",
        "s": "380 g"
      },
      {
        "n": "AH Sajoer Boontjes Verspakket",
        "o": null,
        "p": "10.95",
        "s": "online10% pakketkorting"
      },
      {
        "n": "Mutti Passata rossoro gezeefde tomaten",
        "o": null,
        "p": "2.99",
        "s": "400 g"
      },
      {
        "n": "Boon Bruine bonen in stoof",
        "o": null,
        "p": "1.19",
        "s": "190 g"
      },
      {
        "n": "AH Traybake krieltjes paprika verspakket",
        "o": null,
        "p": "5.89",
        "s": ""
      },
      {
        "n": "AH Indiase wortelsoep verspakket",
        "o": null,
        "p": "9.96",
        "s": "onlinePakket"
      },
      {
        "n": "AH Snoepgroente pakket tomaat en komkommer",
        "o": null,
        "p": "11.58",
        "s": "per pakket"
      },
      {
        "n": "Sera Karisik Tursu (gemengde groente in zuur)",
        "o": null,
        "p": "2.49",
        "s": "700 g"
      },
      {
        "n": "Sera Sus Biber (hete pepers)",
        "o": null,
        "p": "1.99",
        "s": "300 g"
      },
      {
        "n": "AH Terra Bonentrio chilisaus",
        "o": null,
        "p": "2.49",
        "s": "300 g"
      },
      {
        "n": "AH Bol aubergine",
        "o": null,
        "p": "1.99",
        "s": "per stuk"
      },
      {
        "n": "AH Tasty tom gold trostomaten",
        "o": null,
        "p": "2.99",
        "s": "360 g"
      },
      {
        "n": "Miras Domates Salcasi (tomaten puree)",
        "o": null,
        "p": "2.99",
        "s": "800 g"
      },
      {
        "n": "AH Gesneden verspakket Mexicaanse salade",
        "o": null,
        "p": "4.99",
        "s": "VOOR 4.99vanaf maandag"
      },
      {
        "n": "AH Vega Portugese Kip Piri Piri Verspakket",
        "o": null,
        "p": "10.14",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Vega Gesneden Koreaanse Bowl Verspakket",
        "o": null,
        "p": "9.22",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Vega Italiaanse Lasagne Verspakket",
        "o": null,
        "p": "10.73",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Vega Chili Con Carne Verspakket",
        "o": null,
        "p": "7.23",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Terra Groentecurry Verspakket",
        "o": null,
        "p": "9.25",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Vega Gesneden Teriyaki Verspakket",
        "o": null,
        "p": "9.58",
        "s": "onlinePakket"
      },
      {
        "n": "AH Terra Kidneybonen mexicaans gekruid",
        "o": null,
        "p": "1.99",
        "s": "200 g"
      },
      {
        "n": "AH Gehakt Stroganoff Verspakket",
        "o": null,
        "p": "12.02",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Sweet crunchino puntpaprika",
        "o": null,
        "p": "2.29",
        "s": "250 g"
      },
      {
        "n": "AH Vega Groentesoep verspakket",
        "o": null,
        "p": "5.88",
        "s": "onlinePakket"
      },
      {
        "n": "AH Vega Italiaanse Pasta Pesto Verspakket",
        "o": null,
        "p": "15.30",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Thaise Kip Siam Verspakket",
        "o": null,
        "p": "11.01",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Uienstreng",
        "o": null,
        "p": "3.99",
        "s": "1 kg"
      },
      {
        "n": "AH Vega Curry Madras Verspakket",
        "o": null,
        "p": "8.43",
        "s": "onlinePakketkorting"
      },
      {
        "n": "AH Vega Gesneden Bami Verspakket",
        "o": null,
        "p": "9.60",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Traybake Kriel Paprika Verspakket",
        "o": null,
        "p": "9.79",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Snoepgroente budgetpakket",
        "o": null,
        "p": "8.69",
        "s": "per pakket"
      },
      {
        "n": "AH Biologisch Snoepgroente pakket voor de hele week",
        "o": null,
        "p": "12.37",
        "s": "per pakket"
      },
      {
        "n": "AH Vega Gesneden Indiase Madras Verspakket",
        "o": null,
        "p": "10.11",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Terra Kikkererwten in tomatensaus",
        "o": null,
        "p": "2.49",
        "s": "300 g"
      },
      {
        "n": "AH Vega Black Bean Noodles Verspakket",
        "o": null,
        "p": "10.42",
        "s": "online10% pakketkorting"
      },
      {
        "n": "Mill & Mortar Italiaanse knoflook korrels",
        "o": null,
        "p": "6.69",
        "s": "70 g"
      },
      {
        "n": "Sera Kappertjes",
        "o": null,
        "p": "2.99",
        "s": "185 gram"
      },
      {
        "n": "AH Vega Japanse Teriyaki Verspakket",
        "o": null,
        "p": "7.62",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Vega Gesneden Shakshuka Verspakket",
        "o": null,
        "p": "8.26",
        "s": "online10% pakketkorting"
      },
      {
        "n": "AH Gesneden Tomatenrisotto Verspakket",
        "o": null,
        "p": "8.71",
        "s": "online10% pakketkorting"
      },
      {
        "n": "Fullvolle Melk",
        "o": null,
        "p": "1.99",
        "s": "1 L"
      },
    ]
  }, {
    "n": "Dirk",
    "u": "https://www.dirk.nl/producten/product/",
    "i": "https://www.dirk.nl/favicon.ico",
    "d": [
      {
        "n": "Dirk Halfvolle Melk",
        "o": null,
        "p": "1.09",
        "s": "1 L"
      },
      {
        "n": "Fullvolle Melk",
        "o": "25% KORTINGvanaf dinsdag",
        "p": "0.99",
        "s": "1 L"
      },
      {
        "n": "1 de Beste Volkoren Brood",
        "o": null,
        "p": "1.29",
        "s": "800 g"
      },
      {
        "n": "Dirk Biologische Appels",
        "o": null,
        "p": "2.59",
        "s": "1 kg"
      },
      {
        "n": "1 de Beste Roomboter",
        "o": null,
        "p": "2.19",
        "s": "250 g"
      },
      {
        "n": "Dirk Verse Kipfilet",
        "o": null,
        "p": "4.79",
        "s": "450 g"
      },
      {
        "n": "1 de Beste Pasta Penne",
        "o": null,
        "p": "0.79",
        "s": "500 g"
      },
      {
        "n": "Dirk Biologische Eieren",
        "o": null,
        "p": "2.39",
        "s": "6 stuks"
      },
      {
        "n": "1 de Beste Tomatensaus",
        "o": null,
        "p": "0.99",
        "s": "500 g"
      },
      {
        "n": "Dirk Verse Spinazie",
        "o": null,
        "p": "1.49",
        "s": "300 g"
      },
      {
        "n": "1 de Beste Chocoladereep",
        "o": null,
        "p": "0.89",
        "s": "100 g"
      },
      {
        "n": "Dirk Yoghurt Naturel",
        "o": null,
        "p": "0.29",
        "s": "1 L"
      },
      {
        "n": "Dirk Biologische Wortelen",
        "o": null,
        "p": "1.29",
        "s": "500 g"
      },
      {
        "n": "1 de Beste Toiletpapier",
        "o": null,
        "p": "3.99",
        "s": "12 rollen"
      },
      {
        "n": "Dirk Verse Champignons",
        "o": null,
        "p": "1.29",
        "s": "250 g"
      },
      {
        "n": "1 de Beste Vanille Vla",
        "o": null,
        "p": "1.19",
        "s": "1 L"
      },
      {
        "n": "Dirk Biologische Bananen",
        "o": null,
        "p": "1.99",
        "s": "1 kg"
      },
      {
        "n": "1 de Beste Wasmiddel",
        "o": null,
        "p": "5.49",
        "s": "40 wasbeurten"
      },
      {
        "n": "Dirk Verse Gehakt",
        "o": null,
        "p": "3.99",
        "s": "500 g"
      },
      {
        "n": "1 de Beste Hagelslag Puur",
        "o": null,
        "p": "1.39",
        "s": "400 g"
      },
      {
        "n": "Dirk Biologische Aardappelen",
        "o": null,
        "p": "2.29",
        "s": "2 kg"
      },
      {
        "n": "1 de Beste Sinaasappelsap",
        "o": null,
        "p": "1.39",
        "s": "1 L"
      }
    ]
},
{
    "n": "Aldi",
    "u": "https://www.aldi.nl/producten/product/",
    "i": "https://www.aldi.nl/favicon.ico",
    "d": [
      {
        "n": "Müller Yoghurt Naturel",
        "o": null,
        "p": "0.99",
        "s": "500 g"
      },
      {
        "n": "Aldi Bio Volkoren Brood",
        "o": null,
        "p": "1.49",
        "s": "800 g"
      },
      {
        "n": "Moser Roth Premium Chocolade",
        "o": null,
        "p": "1.89",
        "s": "125 g"
      },
      {
        "n": "Nordpak Roomboter",
        "o": null,
        "p": "2.29",
        "s": "250 g"
      },
      {
        "n": "Rio D'Oro Sinaasappelsap",
        "o": null,
        "p": "1.79",
        "s": "1 L"
      },
      {
        "n": "Trader Joe's Hummus",
        "o": null,
        "p": "1.19",
        "s": "200 g"
      },
      {
        "n": "Aldi Biologische Eieren",
        "o": null,
        "p": "2.49",
        "s": "6 stuks"
      },
      {
        "n": "Mama Mancini's Gehaktballen",
        "o": null,
        "p": "3.99",
        "s": "400 g"
      },
      {
        "n": "Specially Selected Olijfolie Extra Vierge",
        "o": null,
        "p": "4.99",
        "s": "500 ml"
      },
      {
        "n": "Aldi Verse Spinazie",
        "o": null,
        "p": "1.29",
        "s": "300 g"
      },
      {
        "n": "Clancy's Tortilla Chips",
        "o": null,
        "p": "0.89",
        "s": "200 g"
      },
      {
        "n": "Deutsche Küche Aardappelsalade",
        "o": null,
        "p": "1.99",
        "s": "400 g"
      },
      {
        "n": "Aldi Biologische Wortelen",
        "o": null,
        "p": "1.39",
        "s": "500 g"
      },
      {
        "n": "Tandil Wasmiddel Vloeibaar",
        "o": null,
        "p": "5.99",
        "s": "1,5 L"
      },
      {
        "n": "Parkside Keukenpapier",
        "o": null,
        "p": "2.49",
        "s": "4 rollen"
      },
      {
        "n": "Aldi Biologische Appels",
        "o": null,
        "p": "2.79",
        "s": "1 kg"
      },
      {
        "n": "Milsani Kwark",
        "o": null,
        "p": "1.59",
        "s": "500 g"
      },
      {
        "n": "Aldi Verse Kipfilet",
        "o": null,
        "p": "4.99",
        "s": "400 g"
      },
      {
        "n": "Grandessa Honing",
        "o": null,
        "p": "3.49",
        "s": "350 g"
      },
      {
        "n": "Aldi Biologische Melk",
        "o": null,
        "p": "1.19",
        "s": "1 L"
      }
    ]
},
{
    "n": "Lidl",
    "u": "https://www.lidl.nl/producten/product/",
    "i": "https://www.lidl.nl/favicon.ico",
    "d": [
      {
        "n": "Deluxe Handgemaakte Pizza Margherita",
        "o": null,
        "p": "3.99",
        "s": "350 g"
      },
      {
        "n": "Lidl Bio Bananen",
        "o": null,
        "p": "1.89",
        "s": "1 kg"
      },
      {
        "n": "Milbona Griekse Yoghurt",
        "o": null,
        "p": "1.29",
        "s": "500 g"
      },
      {
        "n": "Freeway Cola",
        "o": null,
        "p": "0.79",
        "s": "1,5 L"
      },
      {
        "n": "Lidl Verse Zalmfilet",
        "o": null,
        "p": "5.99",
        "s": "250 g"
      },
      {
        "n": "Fin Carré Pure Chocolade",
        "o": null,
        "p": "0.99",
        "s": "100 g"
      },
      {
        "n": "Lidl Bio Aardappelen",
        "o": null,
        "p": "2.49",
        "s": "2 kg"
      },
      {
        "n": "Dulano Salami",
        "o": null,
        "p": "1.79",
        "s": "100 g"
      },
      {
        "n": "Lidl Verse Sperziebonen",
        "o": null,
        "p": "1.69",
        "s": "500 g"
      },
      {
        "n": "Solevita Sinaasappelsap",
        "o": null,
        "p": "1.49",
        "s": "1 L"
      },
      {
        "n": "Lidl Biologische Eieren",
        "o": null,
        "p": "2.29",
        "s": "10 stuks"
      },
      {
        "n": "Formil Wasmiddel Capsules",
        "o": null,
        "p": "4.99",
        "s": "20 stuks"
      },
      {
        "n": "Lidl Verse Champignons",
        "o": null,
        "p": "1.19",
        "s": "250 g"
      },
      {
        "n": "Gelatelli Vanille IJs",
        "o": null,
        "p": "2.99",
        "s": "1 L"
      },
      {
        "n": "Lidl Biologische Havermout",
        "o": null,
        "p": "1.39",
        "s": "500 g"
      },
      {
        "n": "Vitasia Noodles",
        "o": null,
        "p": "0.89",
        "s": "250 g"
      },
      {
        "n": "Lidl Verse Kipfilet",
        "o": null,
        "p": "4.49",
        "s": "400 g"
      },
      {
        "n": "Belbake Bloem",
        "o": null,
        "p": "0.69",
        "s": "1 kg"
      },
      {
        "n": "Lidl Biologische Spinazie",
        "o": null,
        "p": "1.59",
        "s": "300 g"
      },
      {
        "n": "Kania Tomatenketchup",
        "o": null,
        "p": "0.99",
        "s": "500 ml"
      }
    ]
  }
];

export const filterValidItems = () => {
  const filteredSuperMarket = supermarkets.map(supermarket => ({
    ...supermarket,
    d: supermarket.d.filter(item => {
      const hasValidName = item.n && item.n.trim() !== '';
      const hasValidPrice = item.p && item.p.trim() !== '';
      return hasValidName && hasValidPrice;
    })
  }));
  return filteredSuperMarket;
}

export const findProductInSupermarkets = (term: string): Record<string, any[]> => {
  if (!term || term.trim().length === 0) return {};
  
  term = term.toLowerCase().trim();
  
  // Create a result object with supermarket codes as keys
  const results: Record<string, any[]> = {};
  const supermarketValidItems = filterValidItems();
  
  // Search through each supermarket
  supermarketValidItems.forEach(supermarket => {
    
    const matchingProducts = supermarket.d.filter(product => {
      const productName = product.n.toLowerCase();
      
      // Match exact phrase first
      if (productName.includes(term)) {
        return true;
      }
      
      // For single terms, also try partial matching for terms longer than 3 chars
      if (term.length > 3) {
        return productName.split(/\s+/).some(word => 
          word.startsWith(term) || (term.length > 4 && word.includes(term))
        );
      }
      
      return false;
    });
    
    if (matchingProducts.length > 0) {
      // Use the supermarket's code (n) as the key
      results[supermarket.n.toLowerCase()] = matchingProducts.map(product => ({
        n: product.n,
        o: product.o,
        p: parseFloat(product.p),  // Convert string price to number
        s: product.s,
        l: `${supermarket.u}${product.n.toLowerCase().replace(/\s+/g, '-')}`
      }));
    }
  });
  // Simulate async behavior to match the expected interface
  return results;
};