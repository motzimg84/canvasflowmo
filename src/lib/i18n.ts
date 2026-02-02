// PROJECT: CanvasFlow Pro
// MODULE: Internationalization Dictionary

export type Language = 'en' | 'es' | 'de' | 'fr' | 'it';

export interface Translations {
  // Common
  appName: string;
  welcome: string;
  login: string;
  signup: string;
  logout: string;
  email: string;
  password: string;
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  search: string;
  
  // Canvas columns
  todo: string;
  doing: string;
  finished: string;
  
  // Projects
  addProject: string;
  projectName: string;
  selectColor: string;
  noProjects: string;
  privateActivity: string;
  
  // Activities
  addActivity: string;
  activityTitle: string;
  startDate: string;
  duration: string;
  daysLabel: string;
  noActivities: string;
  moveToTodo: string;
  moveToDoing: string;
  moveToFinished: string;
  notes: string;
  showNotes: string;
  hideNotes: string;
  progress: string;
  
  // Settings
  settings: string;
  companyName: string;
  brandColor: string;
  language: string;
  
  // Alarms
  overdueAlarm: string;
  startWarning: string;
  deleteMsg: string;
  
  // Gantt
  ganttChart: string;
  noDoingActivities: string;
  dayView: string;
  weekView: string;
  monthView: string;
  today: string;
  
  // AI Assistant
  aiAssistant: string;
  askAI: string;
  aiPlaceholder: string;
  
  // Auth
  signupSuccess: string;
  loginSuccess: string;
  authError: string;
  noAccount: string;
  hasAccount: string;
  forgotPassword: string;
  resetPassword: string;
  resetEmailSent: string;
  backToLogin: string;
  newPassword: string;
  confirmNewPassword: string;
  passwordUpdated: string;
  passwordMismatch: string;
  updatePassword: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "CanvasFlow Pro",
    welcome: "Welcome",
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    email: "Email",
    password: "Password",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    todo: "To Do",
    doing: "In Progress",
    finished: "Finished",
    addProject: "New Project",
    projectName: "Project Name",
    selectColor: "Select Color",
    noProjects: "No projects yet",
    privateActivity: "Private",
    addActivity: "Add Activity",
    activityTitle: "Activity Title",
    startDate: "Start Date",
    duration: "Duration",
    daysLabel: "days",
    noActivities: "No activities",
    moveToTodo: "Move to To Do",
    moveToDoing: "Move to In Progress",
    moveToFinished: "Mark as Finished",
    notes: "Notes",
    showNotes: "Show notes",
    hideNotes: "Hide notes",
    progress: "Progress",
    settings: "Settings",
    companyName: "Company Name",
    brandColor: "Brand Color",
    language: "Language",
    overdueAlarm: "Critical Overdue!",
    startWarning: "Should have started",
    deleteMsg: "Activity moved to finished and permanently deleted.",
    ganttChart: "Gantt Chart",
    noDoingActivities: "No activities in progress to display",
    dayView: "Day",
    weekView: "Week",
    monthView: "Month",
    today: "Today",
    aiAssistant: "AI Assistant",
    askAI: "Ask AI",
    aiPlaceholder: "Ask me to create projects, move activities, or change language...",
    signupSuccess: "Account created successfully!",
    loginSuccess: "Welcome back!",
    authError: "Authentication error",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset Password",
    resetEmailSent: "Check your email for the reset link",
    backToLogin: "Back to login",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordUpdated: "Password updated successfully!",
    passwordMismatch: "Passwords do not match",
    updatePassword: "Update Password",
  },
  es: {
    appName: "CanvasFlow Pro",
    welcome: "Bienvenido",
    login: "Iniciar Sesión",
    signup: "Registrarse",
    logout: "Cerrar Sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    todo: "Por hacer",
    doing: "En curso",
    finished: "Finalizado",
    addProject: "Nuevo Proyecto",
    projectName: "Nombre del Proyecto",
    selectColor: "Seleccionar Color",
    noProjects: "Sin proyectos aún",
    privateActivity: "Privado",
    addActivity: "Agregar Actividad",
    activityTitle: "Título de la Actividad",
    startDate: "Fecha de Inicio",
    duration: "Duración",
    daysLabel: "días",
    noActivities: "Sin actividades",
    moveToTodo: "Mover a Por hacer",
    moveToDoing: "Mover a En curso",
    moveToFinished: "Marcar como Finalizado",
    notes: "Notas",
    showNotes: "Mostrar notas",
    hideNotes: "Ocultar notas",
    progress: "Progreso",
    settings: "Configuración",
    companyName: "Nombre de la Empresa",
    brandColor: "Color de Marca",
    language: "Idioma",
    overdueAlarm: "¡Crítico: Vencido!",
    startWarning: "Debería haber iniciado",
    deleteMsg: "Actividad finalizada y eliminada permanentemente.",
    ganttChart: "Diagrama de Gantt",
    noDoingActivities: "Sin actividades en curso para mostrar",
    dayView: "Día",
    weekView: "Semana",
    monthView: "Mes",
    today: "Hoy",
    aiAssistant: "Asistente IA",
    askAI: "Preguntar a IA",
    aiPlaceholder: "Pídeme crear proyectos, mover actividades o cambiar idioma...",
    signupSuccess: "¡Cuenta creada exitosamente!",
    loginSuccess: "¡Bienvenido de nuevo!",
    authError: "Error de autenticación",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    forgotPassword: "¿Olvidaste tu contraseña?",
    resetPassword: "Restablecer Contraseña",
    resetEmailSent: "Revisa tu correo para el enlace de restablecimiento",
    backToLogin: "Volver al inicio de sesión",
    newPassword: "Nueva Contraseña",
    confirmNewPassword: "Confirmar Nueva Contraseña",
    passwordUpdated: "¡Contraseña actualizada exitosamente!",
    passwordMismatch: "Las contraseñas no coinciden",
    updatePassword: "Actualizar Contraseña",
  },
  de: {
    appName: "CanvasFlow Pro",
    welcome: "Willkommen",
    login: "Anmelden",
    signup: "Registrieren",
    logout: "Abmelden",
    email: "E-Mail",
    password: "Passwort",
    loading: "Laden...",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    create: "Erstellen",
    search: "Suchen",
    todo: "Zu erledigen",
    doing: "In Arbeit",
    finished: "Abgeschlossen",
    addProject: "Neues Projekt",
    projectName: "Projektname",
    selectColor: "Farbe auswählen",
    noProjects: "Noch keine Projekte",
    privateActivity: "Privat",
    addActivity: "Aktivität hinzufügen",
    activityTitle: "Aktivitätstitel",
    startDate: "Startdatum",
    duration: "Dauer",
    daysLabel: "Tage",
    noActivities: "Keine Aktivitäten",
    moveToTodo: "Zu erledigen verschieben",
    moveToDoing: "In Arbeit verschieben",
    moveToFinished: "Als abgeschlossen markieren",
    notes: "Notizen",
    showNotes: "Notizen anzeigen",
    hideNotes: "Notizen ausblenden",
    progress: "Fortschritt",
    settings: "Einstellungen",
    companyName: "Firmenname",
    brandColor: "Markenfarbe",
    language: "Sprache",
    overdueAlarm: "Kritisch überfällig!",
    startWarning: "Hätte beginnen sollen",
    deleteMsg: "Aktivität abgeschlossen und dauerhaft gelöscht.",
    ganttChart: "Gantt-Diagramm",
    noDoingActivities: "Keine Aktivitäten in Arbeit anzuzeigen",
    dayView: "Tag",
    weekView: "Woche",
    monthView: "Monat",
    today: "Heute",
    aiAssistant: "KI-Assistent",
    askAI: "KI fragen",
    aiPlaceholder: "Bitte mich, Projekte zu erstellen, Aktivitäten zu verschieben oder die Sprache zu ändern...",
    signupSuccess: "Konto erfolgreich erstellt!",
    loginSuccess: "Willkommen zurück!",
    authError: "Authentifizierungsfehler",
    noAccount: "Kein Konto?",
    hasAccount: "Bereits ein Konto?",
    forgotPassword: "Passwort vergessen?",
    resetPassword: "Passwort zurücksetzen",
    resetEmailSent: "Überprüfen Sie Ihre E-Mail für den Reset-Link",
    backToLogin: "Zurück zur Anmeldung",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    passwordUpdated: "Passwort erfolgreich aktualisiert!",
    passwordMismatch: "Passwörter stimmen nicht überein",
    updatePassword: "Passwort aktualisieren",
  },
  fr: {
    appName: "CanvasFlow Pro",
    welcome: "Bienvenue",
    login: "Se connecter",
    signup: "S'inscrire",
    logout: "Se déconnecter",
    email: "E-mail",
    password: "Mot de passe",
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    todo: "À faire",
    doing: "En cours",
    finished: "Terminé",
    addProject: "Nouveau Projet",
    projectName: "Nom du Projet",
    selectColor: "Sélectionner la couleur",
    noProjects: "Pas encore de projets",
    privateActivity: "Privé",
    addActivity: "Ajouter une activité",
    activityTitle: "Titre de l'activité",
    startDate: "Date de début",
    duration: "Durée",
    daysLabel: "jours",
    noActivities: "Aucune activité",
    moveToTodo: "Déplacer vers À faire",
    moveToDoing: "Déplacer vers En cours",
    moveToFinished: "Marquer comme terminé",
    notes: "Notes",
    showNotes: "Afficher les notes",
    hideNotes: "Masquer les notes",
    progress: "Progression",
    settings: "Paramètres",
    companyName: "Nom de l'entreprise",
    brandColor: "Couleur de marque",
    language: "Langue",
    overdueAlarm: "En retard critique!",
    startWarning: "Aurait dû commencer",
    deleteMsg: "Activité terminée et définitivement supprimée.",
    ganttChart: "Diagramme de Gantt",
    noDoingActivities: "Aucune activité en cours à afficher",
    dayView: "Jour",
    weekView: "Semaine",
    monthView: "Mois",
    today: "Aujourd'hui",
    aiAssistant: "Assistant IA",
    askAI: "Demander à l'IA",
    aiPlaceholder: "Demandez-moi de créer des projets, déplacer des activités ou changer de langue...",
    signupSuccess: "Compte créé avec succès!",
    loginSuccess: "Content de vous revoir!",
    authError: "Erreur d'authentification",
    noAccount: "Pas de compte?",
    hasAccount: "Déjà un compte?",
    forgotPassword: "Mot de passe oublié?",
    resetPassword: "Réinitialiser le mot de passe",
    resetEmailSent: "Vérifiez votre e-mail pour le lien de réinitialisation",
    backToLogin: "Retour à la connexion",
    newPassword: "Nouveau mot de passe",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    passwordUpdated: "Mot de passe mis à jour avec succès!",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    updatePassword: "Mettre à jour le mot de passe",
  },
  it: {
    appName: "CanvasFlow Pro",
    welcome: "Benvenuto",
    login: "Accedi",
    signup: "Registrati",
    logout: "Esci",
    email: "Email",
    password: "Password",
    loading: "Caricamento...",
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    edit: "Modifica",
    create: "Crea",
    search: "Cerca",
    todo: "Da fare",
    doing: "In corso",
    finished: "Completato",
    addProject: "Nuovo Progetto",
    projectName: "Nome Progetto",
    selectColor: "Seleziona Colore",
    noProjects: "Nessun progetto ancora",
    privateActivity: "Privato",
    addActivity: "Aggiungi Attività",
    activityTitle: "Titolo Attività",
    startDate: "Data Inizio",
    duration: "Durata",
    daysLabel: "giorni",
    noActivities: "Nessuna attività",
    moveToTodo: "Sposta in Da fare",
    moveToDoing: "Sposta in In corso",
    moveToFinished: "Segna come Completato",
    notes: "Note",
    showNotes: "Mostra note",
    hideNotes: "Nascondi note",
    progress: "Progresso",
    settings: "Impostazioni",
    companyName: "Nome Azienda",
    brandColor: "Colore Brand",
    language: "Lingua",
    overdueAlarm: "Critico: In ritardo!",
    startWarning: "Avrebbe dovuto iniziare",
    deleteMsg: "Attività completata ed eliminata definitivamente.",
    ganttChart: "Diagramma di Gantt",
    noDoingActivities: "Nessuna attività in corso da visualizzare",
    dayView: "Giorno",
    weekView: "Settimana",
    monthView: "Mese",
    today: "Oggi",
    aiAssistant: "Assistente IA",
    askAI: "Chiedi all'IA",
    aiPlaceholder: "Chiedimi di creare progetti, spostare attività o cambiare lingua...",
    signupSuccess: "Account creato con successo!",
    loginSuccess: "Bentornato!",
    authError: "Errore di autenticazione",
    noAccount: "Non hai un account?",
    hasAccount: "Hai già un account?",
    forgotPassword: "Password dimenticata?",
    resetPassword: "Reimposta Password",
    resetEmailSent: "Controlla la tua email per il link di reimpostazione",
    backToLogin: "Torna al login",
    newPassword: "Nuova Password",
    confirmNewPassword: "Conferma Nuova Password",
    passwordUpdated: "Password aggiornata con successo!",
    passwordMismatch: "Le password non corrispondono",
    updatePassword: "Aggiorna Password",
  },
};

export const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};
