import { Translations } from '../context/LanguageContext';

// English translations
const en: Translations = {
  // App Header
  'app.title': 'ComPear',
  'app.compareHeading': 'Compare your groceries',
  'app.clearAll': 'Clear All',
  'app.comingSoon': 'Coming Soon',
  'app.weWillBeAvailable': 'We will be available in {country} soon!',
  'app.currentlyOnlyNetherlandsSupported': 'Currently, only Netherlands is supported.',
  'app.switchToNetherlands': 'Switch to Netherlands',
  'app.totalItems': 'Total for {count} items across all {country} supermarkets',
  
  // Main Content
  'app.description': 'Add grocery items to compare prices across {country} supermarkets. Prices from supermarkets without APIs are estimated using advanced algorithms.',
  'app.description.nl': 'Search or scan a product, add it to your list, and compare the same item across Dutch supermarkets.',
  'app.description.uk': 'Add grocery items to compare prices across UK supermarkets. Prices from supermarkets without APIs are estimated using advanced algorithms.',
  'app.description.de': 'Add grocery items to compare prices across German supermarkets. Prices from supermarkets without APIs are estimated using advanced algorithms.',

  // Navigation
  'nav.home': 'Go to home',
  'nav.search': 'Search',
  'nav.receipts': 'Receipts',
  'nav.stores': 'Stores',
  'nav.switchToLocal': 'Switch to local language',
  'nav.switchToEnglish': 'Switch to English',
  'nav.suggestion': 'Share a suggestion',
  'nav.openCheapest': 'Open cheapest supermarket dialog',
  'nav.openBasket': 'Open basket',
  
  // Compare All Stores Tab
  'tabs.compareAllStores': 'Compare All Stores',
  'tabs.optimalStrategy': 'Optimal Strategy',
  'tabs.individualItems': 'Individual Items',
  
  // Short mobile tab labels
  'tabs.individualItemsShort': 'Items',
  'tabs.compareAllStoresShort': 'Compare', 
  'tabs.optimalStrategyShort': 'Strategy',
  
  // Table Headers - Updated
  'table.supermarket': 'Supermarket',
  'table.totalPrice': 'Total Price',
  'table.itemsFound': 'Items Found',
  'table.estPrices': 'Est. Prices',
  'table.onSale': 'On Sale',
  
  // Product Table Headers
  'table.product': 'Product',
  'table.quantity': 'Quantity',
  'table.price': 'Price',
  'table.unitPrice': 'Unit Price',
  'table.size': 'Size',
  
  // Labels
  'label.cheapest': 'Cheapest',
  'label.lowest': 'Lowest',
  'label.sale': 'Sale',
  'label.estimated': 'Estimated',
  'label.none': 'None',
  'label.items': 'items',
  
  // Tooltips and Info
  'info.estimatedPrices': 'Estimated prices are calculated using advanced algorithms when actual prices are not available.',
  'info.clickToView': 'Click to view products',
  'info.shareList': 'Share this list',
  
  // Dialogs
  'dialog.close': 'Close',
  'dialog.share': 'Share',
  'dialog.productsInSupermarket': 'Products in {supermarket}',
  
  // Not Found Page
  '404.title': '404 - Country Not Found',
  '404.notSupported': '"{code}" is not a supported country code.',
  '404.supportedCountries': 'We currently only support the Netherlands, United Kingdom, and Germany.',
  '404.goTo': 'Go to Netherlands',
  '404.uk': 'United Kingdom',
  '404.germany': 'Germany',
  
  // Search Component
  'search.title': 'Search for Products',
  'search.placeholderShort': 'Search products (e.g. halfvolle melk, eieren, pasta)',
  'search.placeholder': 'Search for products (e.g., vrije uitloop for free-range eggs, halfvolle melk for semi-skimmed milk)',
  'search.searching': 'Searching supermarkets...',
  'search.resultsFound': 'Found {count} products. Click on one to add to your list.',
  'search.productDatabase': 'Product Database Results',
  'search.supermarketProducts': 'Supermarket Products',
  'search.updating': '(updating...)',
  'search.addToList': 'Add to Shopping List',
  'search.category': 'Category: {category}',
  'search.quantityUnit': 'Quantity ({unit})',
  'search.quantity': 'Quantity',
  'search.cancel': 'Cancel',
  'search.addToListButton': 'Add to List',
  'search.addButton': 'Add',
  'search.resultCount': '{groups} product groups · {results} results',
  'search.noProductsFound': 'No products found for "{term}".',
  'search.homeHint': 'Type a product name or scan a barcode. Pick the exact product, then we compare that item across stores.',
  'search.pickProductHint': 'Pick the exact product you want — we compare that same item at every supermarket.',
  'search.pageHint': 'Search by name or scan the barcode on the packaging to compare prices.',
  'search.barcodeChip': 'Barcode: {barcode}',
  'search.barcodeNotFound': 'No products found for barcode {barcode}. Try searching by product name — we match across all stores by name, not just barcode.',
  'search.barcodeInvalid': 'Could not read a valid EAN barcode. Enter the 13-digit code manually or search by product name.',
  'search.viewList': 'View list',
  'search.listCount': '{count} items on your comparison list',
  'search.addedToList': 'Added to your comparison list',
  'search.storeFilter': 'Store',
  'search.allStores': 'All stores',
  'search.dealsOnly': 'Deals only',
  'search.emptyPrompt': 'Type at least 2 letters or scan a barcode to compare products.',
  'search.scanButton': 'Scan barcode',
  'search.scanTitle': 'Scan barcode',
  'search.scanHint':
    'Point your camera at the EAN barcode on the packaging. Works best on standard retail barcodes.',
  'search.scanning': 'Scanning…',
  'search.manualEan': 'Or enter EAN manually',
  'search.searchButton': 'Search',
  'search.cameraDenied':
    'Camera access is blocked. Allow camera for compears.shop in your browser settings (lock icon in the address bar), then try again.',
  'search.cameraNotFound': 'No camera found on this device.',
  'search.cameraInUse': 'Camera is in use by another app. Close it and try again.',
  'search.cameraUnavailable':
    'Camera unavailable. Enter the barcode manually or check browser permissions.',
  'search.noResults': 'No products found. Try a different search term or filter.',
  'search.showDebug': 'Show Debug',
  'search.hideDebug': 'Hide Debug',
  
  // Error messages
  'error.noProductsFound': 'No products found for "{searchTerm}". Please try a different search term.',
  'error.searchFailed': 'Search failed. Please try again.',
  'error.minCharacters': 'Please enter at least 2 characters to search.',
  
  // Optimal Strategy
  'optimal.title': 'Optimal Shopping Strategy',
  'optimal.description': 'The optimal shopping strategy for buying items across multiple stores',
  'optimal.shareList': 'Share List',
  'optimal.itemCount': '{count} items',
  'optimal.totalCost': 'Total Cost: {cost}',
  'optimal.shoppingListTitle': 'My ComPear Optimal Shopping List',
  'optimal.at': 'At {store}:',
  'optimal.subtotal': 'Subtotal: {amount}',
  'optimal.total': 'Total: {amount}',
  'optimal.madeWith': 'Made with ComPear - Compare grocery prices across {country} supermarkets!',
  'optimal.madeWith.nl': 'Made with ComPear - Compare grocery prices across Dutch supermarkets!',
  'optimal.madeWith.uk': 'Made with ComPear - Compare grocery prices across UK supermarkets!',
  'optimal.madeWith.de': 'Made with ComPear - Compare grocery prices across German supermarkets!',
  
  // Individual Items section
  'individual.estimatedText': 'Some prices are estimated using advanced algorithms when official data isn\'t available.',
  'individual.addItemsPrompt': 'Add grocery items to compare prices',
  
  // Clipboard messages
  'clipboard.copied': 'Shopping list copied to clipboard!',
  'clipboard.failed': 'Could not copy to clipboard. Please share manually.',
  
  // Product Dialog Labels
  'dialog.total': 'Total: {amount}',
  'dialog.saleItems': 'Sale Items: {count}',
  'dialog.estimatedPrices': 'Estimated Prices: {count}',

  'filters.dietary': 'Dietary & labels',
  'filters.label.vegan': 'Vegan',
  'filters.label.vegetarian': 'Vegetarian',
  'filters.label.gluten-free': 'Gluten-free',
  'filters.label.lactose-free': 'Lactose-free',
  'filters.label.organic': 'Organic / Bio',
  'filters.label.sugar-free': 'Sugar-free',
  'filters.label.nut-free': 'Nut-free',
  'filters.label.halal': 'Halal',

  'stores.title': 'Store locator',
  'stores.subtitle': 'Find nearby supermarkets and open directions in Maps.',
  'stores.nearMe': 'Near me',
  'stores.usingLocation': 'Using your location',
  'stores.noneFound': 'No stores found for this filter.',
  'stores.loadError': 'Could not load store locations.',
  'stores.geoUnsupported': 'Geolocation is not supported in this browser.',
  'stores.geoDenied': 'Location access denied. Showing all stores instead.',
  'stores.geoDeniedHint':
    'Location is blocked. Allow location for compears.shop in your browser settings (lock icon in the address bar), then tap Near me again.',
  'stores.geoTimeout': 'Could not get your location in time. Try again or pick a store filter.',
  'stores.geoUnavailable': 'Your location could not be determined. Showing all stores instead.',
  'stores.locating': 'Getting your location…',
  'stores.osmAttribution': 'Store data © OpenStreetMap contributors',
  'stores.openMaps': 'Open in Maps',

  'shared.title': 'Share shopping list',
  'shared.description': 'Create a link anyone can open to view and import this list into their basket.',
  'shared.listName': 'List name',
  'shared.createLink': 'Create share link',
  'shared.creating': 'Creating…',
  'shared.created': 'Share link ready — copy it or send to someone.',
  'shared.copyLink': 'Copy link',
  'shared.copied': 'Link copied!',
  'shared.close': 'Close',
  'shared.createError': 'Could not create share link. Try again.',
  'shared.notFound': 'This shared list was not found or has expired.',
  'shared.itemCount': '{count} items',
  'shared.importBasket': 'Import to my basket',

  'basket.title': 'Basket',
  'basket.empty': 'Your basket is empty.',
  'basket.clear': 'Clear basket',
  'basket.shareDefaultName': 'My ComPear shopping list',
};

// Dutch translations
const nl: Translations = {
  // App Header
  'app.title': 'ComPear',
  'app.compareHeading': 'Vergelijk je boodschappen',
  'app.clearAll': 'Alles Wissen',
  'app.comingSoon': 'Binnenkort Beschikbaar',
  'app.weWillBeAvailable': 'We zijn binnenkort beschikbaar in {country}!',
  'app.currentlyOnlyNetherlandsSupported': 'Momenteel wordt alleen Nederland ondersteund.',
  'app.switchToNetherlands': 'Ga naar Nederland',
  'app.totalItems': 'Totaal voor {count} artikelen in alle {country} supermarkten',
  
  // Main Content
  'app.description': 'Voeg boodschappen toe om prijzen te vergelijken tussen verschillende {country} supermarkten. Prijzen van supermarkten zonder API\'s worden geschat met geavanceerde algoritmen.',
  'app.description.nl': 'Zoek of scan een product, voeg het toe aan je lijst en vergelijk hetzelfde artikel bij alle supermarkten.',
  'app.description.uk': 'Voeg boodschappen toe om prijzen te vergelijken tussen verschillende Britse supermarkten. Prijzen van supermarkten zonder API\'s worden geschat met geavanceerde algoritmen.',
  'app.description.de': 'Voeg boodschappen toe om prijzen te vergelijken tussen verschillende Duitse supermarkten. Prijzen van supermarkten zonder API\'s worden geschat met geavanceerde algoritmen.',

  // Navigation
  'nav.home': 'Naar home',
  'nav.search': 'Zoek',
  'nav.receipts': 'Bonnen',
  'nav.stores': 'Winkels',
  'nav.switchToLocal': 'Schakel naar lokale taal',
  'nav.switchToEnglish': 'Schakel naar Engels',
  'nav.suggestion': 'Deel een suggestie',
  'nav.openCheapest': 'Open goedkoopste supermarkt',
  'nav.openBasket': 'Open mandje',
  
  // Compare All Stores Tab
  'tabs.compareAllStores': 'Vergelijk Alle Winkels',
  'tabs.optimalStrategy': 'Optimale Strategie',
  'tabs.individualItems': 'Individuele Producten',
  
  // Short mobile tab labels
  'tabs.individualItemsShort': 'Items',
  'tabs.compareAllStoresShort': 'Vergelijk',
  'tabs.optimalStrategyShort': 'Strategie',
  
  // Table Headers - Updated to match the actual data display
  'table.supermarket': 'Supermarkt',
  'table.totalPrice': 'Totale Prijs',
  'table.itemsFound': 'Artikelen Gevonden',
  'table.estPrices': 'Geschatte Prijzen',
  'table.onSale': 'In de Aanbieding',
  
  // Product Table Headers
  'table.product': 'Product',
  'table.quantity': 'Hoeveelheid',
  'table.price': 'Prijs',
  'table.unitPrice': 'Prijs per Eenheid',
  'table.size': 'Maat',
  
  // Labels
  'label.cheapest': 'Goedkoopst',
  'label.lowest': 'Laagste',
  'label.sale': 'Aanbieding',
  'label.estimated': 'Geschat',
  'label.none': 'Geen',
  'label.items': 'artikelen',
  
  // Tooltips and Info
  'info.estimatedPrices': 'Geschatte prijzen worden berekend met geavanceerde algoritmen wanneer werkelijke prijzen niet beschikbaar zijn.',
  'info.clickToView': 'Klik om producten te bekijken',
  'info.shareList': 'Deel deze lijst',
  
  // Dialogs
  'dialog.close': 'Sluiten',
  'dialog.share': 'Delen',
  'dialog.productsInSupermarket': 'Producten bij {supermarket}',
  
  // Not Found Page
  '404.title': '404 - Land Niet Gevonden',
  '404.notSupported': '"{code}" is geen ondersteunde landcode.',
  '404.supportedCountries': 'We ondersteunen momenteel alleen Nederland, Verenigd Koninkrijk en Duitsland.',
  '404.goTo': 'Ga naar Nederland',
  '404.uk': 'Verenigd Koninkrijk',
  '404.germany': 'Duitsland',
  
  // Search Component
  'search.title': 'Zoek Producten',
  'search.placeholderShort': 'Zoek producten (bijv. halfvolle melk, eieren, pasta)',
  'search.placeholder': 'Zoek naar producten (bijv. vrije uitloop voor scharreleieren, halfvolle melk)',
  'search.searching': 'Supermarkten doorzoeken...',
  'search.resultsFound': '{count} producten gevonden. Klik op een product om het aan je lijst toe te voegen.',
  'search.productDatabase': 'Resultaten Productdatabase',
  'search.supermarketProducts': 'Supermarkt Producten',
  'search.updating': '(bijwerken...)',
  'search.addToList': 'Aan Boodschappenlijst Toevoegen',
  'search.category': 'Categorie: {category}',
  'search.quantityUnit': 'Hoeveelheid ({unit})',
  'search.quantity': 'Hoeveelheid',
  'search.cancel': 'Annuleren',
  'search.addToListButton': 'Aan Lijst Toevoegen',
  'search.addButton': 'Toevoegen',
  'search.resultCount': '{groups} productgroepen · {results} resultaten',
  'search.noProductsFound': 'Geen producten gevonden voor "{term}".',
  'search.homeHint': 'Typ een productnaam of scan een streepjescode. Kies het exacte product — wij vergelijken dat artikel bij alle winkels.',
  'search.pickProductHint': 'Kies het exacte product dat je wilt — wij vergelijken datzelfde artikel bij elke supermarkt.',
  'search.pageHint': 'Zoek op naam of scan de streepjescode op de verpakking om prijzen te vergelijken.',
  'search.barcodeChip': 'Streepjescode: {barcode}',
  'search.barcodeNotFound': 'Geen producten gevonden voor streepjescode {barcode}. Zoek op productnaam — wij vergelijken het artikel bij alle winkels op naam, niet alleen via streepjescode.',
  'search.barcodeInvalid': 'Geen geldige EAN-streepjescode gelezen. Voer de 13 cijfers handmatig in of zoek op productnaam.',
  'search.viewList': 'Bekijk lijst',
  'search.listCount': '{count} artikelen op je vergelijkingslijst',
  'search.addedToList': 'Toegevoegd aan je vergelijkingslijst',
  'search.storeFilter': 'Winkel',
  'search.allStores': 'Alle winkels',
  'search.dealsOnly': 'Alleen aanbiedingen',
  'search.emptyPrompt': 'Typ minstens 2 letters of scan een streepjescode om producten te vergelijken.',
  'search.scanButton': 'Scan streepjescode',
  'search.scanTitle': 'Scan streepjescode',
  'search.scanHint':
    'Richt je camera op de EAN-streepjescode op de verpakking. Werkt het best op standaard barcodes.',
  'search.scanning': 'Scannen…',
  'search.manualEan': 'Of typ EAN handmatig',
  'search.searchButton': 'Zoeken',
  'search.cameraDenied':
    'Cameratoegang geblokkeerd. Sta camera toe voor compears.shop in je browserinstellingen (slotje in de adresbalk) en probeer opnieuw.',
  'search.cameraNotFound': 'Geen camera gevonden op dit apparaat.',
  'search.cameraInUse': 'Camera is in gebruik door een andere app. Sluit die en probeer opnieuw.',
  'search.cameraUnavailable':
    'Camera niet beschikbaar. Voer de streepjescode handmatig in of controleer browserrechten.',
  'search.noResults': 'Geen producten gevonden. Probeer een andere zoekterm of filter.',
  'search.showDebug': 'Debug Tonen',
  'search.hideDebug': 'Debug Verbergen',
  
  // Error messages
  'error.noProductsFound': 'Geen producten gevonden voor "{searchTerm}". Probeer een andere zoekterm.',
  'error.searchFailed': 'Zoeken mislukt. Probeer het opnieuw.',
  'error.minCharacters': 'Voer minimaal 2 tekens in om te zoeken.',
  
  // Optimal Strategy
  'optimal.title': 'Optimale Winkelstrategie',
  'optimal.description': 'De optimale winkelstrategie om artikelen te kopen bij verschillende winkels',
  'optimal.shareList': 'Lijst Delen',
  'optimal.itemCount': '{count} artikelen',
  'optimal.totalCost': 'Totale Kosten: {cost}',
  'optimal.shoppingListTitle': 'Mijn ComPear Optimale Boodschappenlijst',
  'optimal.at': 'Bij {store}:',
  'optimal.subtotal': 'Subtotaal: {amount}',
  'optimal.total': 'Totaal: {amount}',
  'optimal.madeWith': 'Gemaakt met ComPear - Vergelijk boodschappenprijzen bij {country} supermarkten!',
  'optimal.madeWith.nl': 'Gemaakt met ComPear - Vergelijk boodschappenprijzen bij Nederlandse supermarkten!',
  'optimal.madeWith.uk': 'Gemaakt met ComPear - Vergelijk boodschappenprijzen bij Britse supermarkten!',
  'optimal.madeWith.de': 'Gemaakt met ComPear - Vergelijk boodschappenprijzen bij Duitse supermarkten!',
  
  // Individual Items section
  'individual.estimatedText': 'Sommige prijzen worden geschat met geavanceerde algoritmen wanneer officiële gegevens niet beschikbaar zijn.',
  'individual.addItemsPrompt': 'Voeg boodschappen toe om prijzen te vergelijken',
  
  // Clipboard messages
  'clipboard.copied': 'Boodschappenlijst gekopieerd naar klembord!',
  'clipboard.failed': 'Kon niet kopiëren naar klembord. Deel a.u.b. handmatig.',
  
  // Product Dialog Labels
  'dialog.total': 'Totaal: {amount}',
  'dialog.saleItems': 'Artikelen in Aanbieding: {count}',
  'dialog.estimatedPrices': 'Geschatte Prijzen: {count}',

  'filters.dietary': 'Dieet & labels',
  'filters.label.vegan': 'Vegan',
  'filters.label.vegetarian': 'Vegetarisch',
  'filters.label.gluten-free': 'Glutenvrij',
  'filters.label.lactose-free': 'Lactosevrij',
  'filters.label.organic': 'Biologisch',
  'filters.label.sugar-free': 'Suikervrij',
  'filters.label.nut-free': 'Notenvrij',
  'filters.label.halal': 'Halal',

  'stores.title': 'Winkelzoeker',
  'stores.subtitle': 'Vind supermarkten in de buurt en open routebeschrijving in Maps.',
  'stores.nearMe': 'In de buurt',
  'stores.usingLocation': 'Jouw locatie',
  'stores.noneFound': 'Geen winkels gevonden voor dit filter.',
  'stores.loadError': 'Kon winkels niet laden.',
  'stores.geoUnsupported': 'Geolocatie wordt niet ondersteund.',
  'stores.geoDenied': 'Locatie geweigerd. Toon alle winkels.',
  'stores.geoDeniedHint':
    'Locatie is geblokkeerd. Sta locatie toe voor compears.shop in je browserinstellingen (slotje in de adresbalk) en tik opnieuw op In de buurt.',
  'stores.geoTimeout': 'Locatie kon niet op tijd worden bepaald. Probeer opnieuw.',
  'stores.geoUnavailable': 'Locatie kon niet worden bepaald. Toon alle winkels.',
  'stores.locating': 'Locatie ophalen…',
  'stores.osmAttribution': 'Winkeldata © OpenStreetMap-bijdragers',
  'stores.openMaps': 'Open in Maps',

  'shared.title': 'Deel boodschappenlijst',
  'shared.description': 'Maak een link die anderen kunnen openen om deze lijst te bekijken en te importeren.',
  'shared.listName': 'Lijstnaam',
  'shared.createLink': 'Deellink maken',
  'shared.creating': 'Bezig…',
  'shared.created': 'Deellink klaar — kopieer of stuur door.',
  'shared.copyLink': 'Kopieer link',
  'shared.copied': 'Link gekopieerd!',
  'shared.close': 'Sluiten',
  'shared.createError': 'Kon geen deellink maken. Probeer opnieuw.',
  'shared.notFound': 'Deze gedeelde lijst bestaat niet of is verlopen.',
  'shared.itemCount': '{count} artikelen',
  'shared.importBasket': 'Importeer in mijn mandje',

  'basket.title': 'Winkelmand',
  'basket.empty': 'Je mandje is leeg.',
  'basket.clear': 'Mandje legen',
  'basket.shareDefaultName': 'Mijn ComPear boodschappenlijst',
};

// German translations (basic)
const de: Translations = {
  // App Header
  'app.title': 'ComPear',
  'app.compareHeading': 'Lebensmittel vergleichen',
  'app.clearAll': 'Alles Löschen',
  'app.comingSoon': 'Demnächst Verfügbar',
  'app.weWillBeAvailable': 'Wir werden bald in {country} verfügbar sein!',
  'app.currentlyOnlyNetherlandsSupported': 'Derzeit wird nur die Niederlande unterstützt.',
  'app.switchToNetherlands': 'Zu den Niederlanden wechseln',
  
  // Main Content
  'app.description': 'Fügen Sie Lebensmittel hinzu, um Preise in verschiedenen {country} Supermärkten zu vergleichen. Preise von Supermärkten ohne APIs werden mit fortschrittlichen Algorithmen geschätzt.',
  'app.description.nl': 'Fügen Sie Lebensmittel hinzu, um Preise in verschiedenen niederländischen Supermärkten zu vergleichen. Preise von Supermärkten ohne APIs werden mit fortschrittlichen Algorithmen geschätzt.',
  'app.description.uk': 'Fügen Sie Lebensmittel hinzu, um Preise in verschiedenen britischen Supermärkten zu vergleichen. Preise von Supermärkten ohne APIs werden mit fortschrittlichen Algorithmen geschätzt.',
  'app.description.de': 'Fügen Sie Lebensmittel hinzu, um Preise in verschiedenen deutschen Supermärkten zu vergleichen. Preise von Supermärkten ohne APIs werden mit fortschrittlichen Algorithmen geschätzt.',

  // Navigation
  'nav.home': 'Zur Startseite',
  'nav.search': 'Suchen',
  'nav.receipts': 'Belege',
  'nav.stores': 'Filialen',
  'nav.switchToLocal': 'Zur Landessprache wechseln',
  'nav.switchToEnglish': 'Zu Englisch wechseln',
  'nav.suggestion': 'Vorschlag teilen',
  'nav.openCheapest': 'Günstigsten Supermarkt öffnen',
  'nav.openBasket': 'Warenkorb öffnen',
  
  // Basic tabs
  'tabs.compareAllStores': 'Alle Geschäfte Vergleichen',
  'tabs.optimalStrategy': 'Optimale Strategie',
  'tabs.individualItems': 'Einzelne Produkte',
  
  // Short mobile tab labels  
  'tabs.individualItemsShort': 'Artikel',
  'tabs.compareAllStoresShort': 'Vergleich',
  'tabs.optimalStrategyShort': 'Strategie',
  
  // Search Component
  'search.title': 'Produkte Suchen',
  'search.placeholderShort': 'Produkte suchen (z.B. halfvolle melk, Eier, Pasta)',
  'search.placeholder': 'Nach Produkten suchen (z.B. vrije uitloop für Freilandeier, halfvolle melk für halbvolle Milch)',
  'search.searching': 'Supermärkte werden durchsucht...',
  'search.resultsFound': '{count} Produkte gefunden. Klicken Sie auf eines, um es Ihrer Liste hinzuzufügen.',
  'search.productDatabase': 'Ergebnisse der Produktdatenbank',
  'search.supermarketProducts': 'Supermarkt-Produkte',
  'search.cancel': 'Abbrechen',
  'search.addToListButton': 'Zur Liste Hinzufügen',
  'search.addButton': 'Hinzufügen',
  'search.resultCount': '{groups} Produktgruppen · {results} Ergebnisse',
  'search.homeHint': 'Produktname eingeben oder Barcode scannen. Wählen Sie das genaue Produkt — wir vergleichen es in allen Geschäften.',
  'search.pickProductHint': 'Wählen Sie das genaue Produkt — wir vergleichen dasselbe Artikel in jedem Supermarkt.',
  'search.pageHint': 'Nach Name suchen oder den Barcode auf der Verpackung scannen.',
  'search.barcodeChip': 'Barcode: {barcode}',
  'search.barcodeNotFound': 'Keine Produkte für Barcode {barcode} gefunden. Suche nach Produktname — wir vergleichen über alle Filialen hinweg per Name.',
  'search.barcodeInvalid': 'Kein gültiger EAN-Barcode erkannt. Gib die 13 Ziffern manuell ein oder suche nach Produktname.',
  'search.viewList': 'Liste anzeigen',
  'search.listCount': '{count} Artikel auf Ihrer Vergleichsliste',
  'search.addedToList': 'Zur Vergleichsliste hinzugefügt',
  'search.storeFilter': 'Geschäft',
  'search.allStores': 'Alle Geschäfte',
  'search.dealsOnly': 'Nur Angebote',
  'search.emptyPrompt': 'Mindestens 2 Buchstaben eingeben oder Barcode scannen.',
  'search.scanButton': 'Barcode scannen',
  'search.scanTitle': 'Barcode scannen',
  'search.scanHint':
    'Richten Sie die Kamera auf den EAN-Barcode auf der Verpackung.',
  'search.scanning': 'Scannen…',
  'search.manualEan': 'Oder EAN manuell eingeben',
  'search.searchButton': 'Suchen',
  'search.cameraDenied':
    'Kamerazugriff blockiert. Erlauben Sie die Kamera für compears.shop in den Browser-Einstellungen.',
  'search.cameraNotFound': 'Keine Kamera auf diesem Gerät gefunden.',
  'search.cameraInUse': 'Kamera wird von einer anderen App verwendet.',
  'search.cameraUnavailable':
    'Kamera nicht verfügbar. Barcode manuell eingeben oder Berechtigungen prüfen.',
  'search.noResults': 'Keine Produkte gefunden. Anderen Suchbegriff oder Filter versuchen.',
  'error.minCharacters': 'Bitte mindestens 2 Zeichen eingeben.',
  
  // Optimal Strategy
  'optimal.madeWith': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in {country} Supermärkten!',
  'optimal.madeWith.nl': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in niederländischen Supermärkten!',
  'optimal.madeWith.uk': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in britischen Supermärkten!',
  'optimal.madeWith.de': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in deutschen Supermärkten!',

  'filters.dietary': 'Ernährung & Labels',
  'filters.label.vegan': 'Vegan',
  'filters.label.vegetarian': 'Vegetarisch',
  'filters.label.gluten-free': 'Glutenfrei',
  'filters.label.lactose-free': 'Laktosefrei',
  'filters.label.organic': 'Bio',
  'filters.label.sugar-free': 'Zuckerfrei',
  'filters.label.nut-free': 'Nussfrei',
  'filters.label.halal': 'Halal',

  'stores.title': 'Filialfinder',
  'stores.subtitle': 'Supermärkte in der Nähe finden und in Maps öffnen.',
  'stores.nearMe': 'In der Nähe',
  'stores.usingLocation': 'Ihr Standort',
  'stores.noneFound': 'Keine Filialen für diesen Filter.',
  'stores.loadError': 'Filialen konnten nicht geladen werden.',
  'stores.geoUnsupported': 'Geolocation wird nicht unterstützt.',
  'stores.geoDenied': 'Standort verweigert. Zeige alle Filialen.',
  'stores.geoDeniedHint':
    'Standort ist blockiert. Erlauben Sie den Standort für compears.shop in den Browser-Einstellungen (Schloss in der Adressleiste) und tippen Sie erneut auf In der Nähe.',
  'stores.geoTimeout': 'Standort konnte nicht rechtzeitig ermittelt werden. Bitte erneut versuchen.',
  'stores.geoUnavailable': 'Standort konnte nicht ermittelt werden. Zeige alle Filialen.',
  'stores.locating': 'Standort wird ermittelt…',
  'stores.osmAttribution': 'Filialdaten © OpenStreetMap-Mitwirkende',
  'stores.openMaps': 'In Maps öffnen',

  'shared.title': 'Einkaufsliste teilen',
  'shared.description': 'Link erstellen, den andere öffnen können, um die Liste zu importieren.',
  'shared.listName': 'Listenname',
  'shared.createLink': 'Teil-Link erstellen',
  'shared.creating': 'Erstelle…',
  'shared.created': 'Link bereit — kopieren oder senden.',
  'shared.copyLink': 'Link kopieren',
  'shared.copied': 'Link kopiert!',
  'shared.close': 'Schließen',
  'shared.createError': 'Link konnte nicht erstellt werden.',
  'shared.notFound': 'Liste nicht gefunden oder abgelaufen.',
  'shared.itemCount': '{count} Artikel',
  'shared.importBasket': 'In meinen Warenkorb importieren',

  'basket.title': 'Warenkorb',
  'basket.empty': 'Ihr Warenkorb ist leer.',
  'basket.clear': 'Warenkorb leeren',
  'basket.shareDefaultName': 'Meine ComPear Einkaufsliste',
};

// Export all translations
export const translations = {
  en,
  nl,
  de
}; 