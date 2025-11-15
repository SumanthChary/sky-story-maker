export const TRANSLATIONS = {
  "en-US": {
    title: "Stories in the sky",
    revealButton: "Reveal constellation",
    revealingButton: "Revealing...",
    resetButton: "Create new sky",
    saveButton: "Save my constellation",
    minStarsAlert: "Please place at least 3 stars to create a constellation!",
    mysteriousPattern: "The Mysterious Pattern",
    mysteriousStory: "These stars have created an interesting shape - what do you see?",
    instructions: "Click anywhere to place stars and create your own story",
    savedSuccess: "Saved successfully",
    savedDescription: "Your constellation has been saved as an image",
    errorSaving: "Error saving",
    errorSavingDescription: "Failed to save constellation",
    notEnoughStars: "Not enough stars",
    errorGenerating: "Error generating story",
    errorGeneratingDescription: "Failed to generate constellation story. Please check your API key.",
    whopAccessRequired: "Membership required",
    whopAccessRequiredDescription: "Sign in through Whop or purchase access to generate stories.",
  },
  "es-ES": {
    title: "Historias en el cielo",
    revealButton: "Revelar constelación",
    revealingButton: "Revelando...",
    resetButton: "Crear nuevo cielo",
    saveButton: "Guardar mi constelación",
    minStarsAlert: "¡Por favor coloca al menos 3 estrellas para crear una constelación!",
    mysteriousPattern: "El Patrón Misterioso",
    mysteriousStory: "Estas estrellas han creado una forma interesante - ¿qué ves?",
    instructions: "Haz clic en cualquier lugar para colocar estrellas y crear tu propia historia",
    savedSuccess: "Guardado exitosamente",
    savedDescription: "Tu constelación ha sido guardada como imagen",
    errorSaving: "Error al guardar",
    errorSavingDescription: "Error al guardar la constelación",
    notEnoughStars: "No hay suficientes estrellas",
    errorGenerating: "Error al generar historia",
    errorGeneratingDescription: "Error al generar la historia de la constelación. Por favor verifica tu clave API.",
    whopAccessRequired: "Se requiere membresía",
    whopAccessRequiredDescription: "Inicia sesión en Whop o compra acceso para generar historias.",
  },
  "fr-FR": {
    title: "Histoires dans le ciel",
    revealButton: "Révéler la constellation",
    revealingButton: "Révélation...",
    resetButton: "Créer un nouveau ciel",
    saveButton: "Sauvegarder ma constellation",
    minStarsAlert: "Veuillez placer au moins 3 étoiles pour créer une constellation !",
    mysteriousPattern: "Le Motif Mystérieux",
    mysteriousStory: "Ces étoiles ont créé une forme intéressante - que voyez-vous ?",
    instructions: "Cliquez n'importe où pour placer des étoiles et créer votre propre histoire",
    savedSuccess: "Sauvegarde réussie",
    savedDescription: "Votre constellation a été sauvegardée en tant qu'image",
    errorSaving: "Erreur de sauvegarde",
    errorSavingDescription: "Échec de la sauvegarde de la constellation",
    notEnoughStars: "Pas assez d'étoiles",
    errorGenerating: "Erreur de génération",
    errorGeneratingDescription: "Échec de la génération de l'histoire de la constellation. Veuillez vérifier votre clé API.",
    whopAccessRequired: "Abonnement requis",
    whopAccessRequiredDescription: "Connectez-vous via Whop ou achetez un accès pour générer des histoires.",
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS["en-US"];
export type Locale = keyof typeof TRANSLATIONS;

export function findMatchingLocale(locale: string): Locale {
  if (TRANSLATIONS[locale as Locale]) return locale as Locale;
  const lang = locale.split("-")[0];
  const match = Object.keys(TRANSLATIONS).find((key) => key.startsWith(lang + "-"));
  return (match as Locale) || "en-US";
}

export function getBrowserLocale(): Locale {
  const browserLocale = navigator.languages?.[0] || navigator.language || "en-US";
  return findMatchingLocale(browserLocale);
}

export function createTranslator(locale: Locale) {
  return (key: TranslationKey): string => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS["en-US"][key] || key;
  };
}
