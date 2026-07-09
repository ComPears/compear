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
  'app.description.nl': 'Add grocery items to compare prices across Dutch supermarkets. Prices from supermarkets without APIs are estimated using advanced algorithms.',
  'app.description.uk': 'Add grocery items to compare prices across UK supermarkets. Prices from supermarkets without APIs are estimated using advanced algorithms.',
  'app.description.de': 'Add grocery items to compare prices across German supermarkets. Prices from supermarkets without APIs are estimated using advanced algorithms.',

  // Navigation
  'nav.home': 'Go to home',
  'nav.search': 'Search',
  'nav.deals': 'Deals',
  'nav.receipts': 'Receipts',
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
  'app.description.nl': 'Voeg boodschappen toe om prijzen te vergelijken tussen verschillende Nederlandse supermarkten. Prijzen van supermarkten zonder API\'s worden geschat met geavanceerde algoritmen.',
  'app.description.uk': 'Voeg boodschappen toe om prijzen te vergelijken tussen verschillende Britse supermarkten. Prijzen van supermarkten zonder API\'s worden geschat met geavanceerde algoritmen.',
  'app.description.de': 'Voeg boodschappen toe om prijzen te vergelijken tussen verschillende Duitse supermarkten. Prijzen van supermarkten zonder API\'s worden geschat met geavanceerde algoritmen.',

  // Navigation
  'nav.home': 'Naar home',
  'nav.search': 'Zoek',
  'nav.deals': 'Aanbiedingen',
  'nav.receipts': 'Bonnen',
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
  'nav.deals': 'Angebote',
  'nav.receipts': 'Belege',
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
  'error.minCharacters': 'Bitte mindestens 2 Zeichen eingeben.',
  
  // Optimal Strategy
  'optimal.madeWith': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in {country} Supermärkten!',
  'optimal.madeWith.nl': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in niederländischen Supermärkten!',
  'optimal.madeWith.uk': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in britischen Supermärkten!',
  'optimal.madeWith.de': 'Erstellt mit ComPear - Vergleichen Sie Lebensmittelpreise in deutschen Supermärkten!'
};

// Export all translations
export const translations = {
  en,
  nl,
  de
}; 