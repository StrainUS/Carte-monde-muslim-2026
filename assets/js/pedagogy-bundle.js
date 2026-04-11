(function () {
'use strict';
var P = window.IslamMapData;
if (!P) { console.error('[pedagogy-bundle] Charger data.js avant pedagogy-bundle.js'); return; }
/** Banque de questions : `assets/js/quiz-bank.js` (avant ce fichier) remplit `window.IslamMapQuizBank`. */
const QUIZ_DATA = Array.isArray(window.IslamMapQuizBank) && window.IslamMapQuizBank.length
  ? window.IslamMapQuizBank.map(function (x) { return Object.assign({}, x); })
  : [];
if (!QUIZ_DATA.length) {
  console.error("[pedagogy-bundle] Charger assets/js/quiz-bank.js avant pedagogy-bundle.js (banque quiz vide).");
}

/** Sources officielles / instituts — à citer (millésimes variables ; vérifier les pages primaires). */
const SOURCES_2026 = [
  { id: "pew", label: "Pew Research Center — The Future of World Religions", url: "https://www.pewresearch.org/topic/religion/", note: "Démographie religieuse mondiale, projections (dont 2060)." },
  { id: "pew-muslim", label: "Pew — Muslims (séries démographiques)", url: "https://www.pewresearch.org/topic/religion/religious-affiliation/muslims/", note: "Ordre de grandeur ~2 milliards de musulmans (synthèses récentes)." },
  { id: "pnat", label: "France — Politique nationale d’anticipation de la radicalisation (PNAT) / rapports associés", url: "https://www.interieur.gouv.fr/", note: "Suivi des sorties de détention et dispositifs anti-radicalisation (consulter rapports actualisés)." },
  { id: "eu-tesat", label: "UE — TE-SAT / rapports sur la menace terroriste", url: "https://www.europol.europa.eu/", note: "Menace terroriste en Europe (Europol)." },
  { id: "bamf", label: "Allemagne — BAMF (enquêtes sur les musulmans en Allemagne)", url: "https://www.bamf.de/", note: "Ordre de grandeur population musulmane allemande (enquêtes publiées)." },
  { id: "unhcr", label: "UNHCR — situations de réfugiés / conflits", url: "https://www.unhcr.org/", note: "Contextes humanitaires liés aux crises au Moyen-Orient et au Sahel." },
  { id: "cia", label: "CIA — The World Factbook", url: "https://www.cia.gov/the-world-factbook/", note: "Fiches pays (religions, etc.) : ordres de grandeur indicatifs à croiser." },
  { id: "un-wpp", label: "ONU — World Population Prospects (WPP)", url: "https://population.un.org/wpp/", note: "Projections démographiques par pays." },
  { id: "legi-cp-terror", label: "France — Code pénal (terrorisme, texte consolidé)", url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/", note: "Livre IV, titre II — infractions en matière de terrorisme ; intitulés et articles à jour sur Légifrance uniquement." },
  { id: "eu-dir-2017-541", label: "UE — Directive (UE) 2017/541 (lutte contre le terrorisme)", url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017L0541", note: "Harmonisation pénale et coopération ; croiser avec transpositions nationales." },
  { id: "un-sc-terror", label: "ONU — Conseil de sécurité (terrorisme, résolutions)", url: "https://www.un.org/securitycouncil/content/threats-international-peace-and-security-terrorism", note: "Sanctions, obligations des États ; pas de définition unique substituable aux droits internes." },
  { id: "unodc-terror", label: "ONUDC — Programme contre le terrorisme", url: "https://www.unodc.org/unodc/en/terrorism/index.html", note: "Conventions sectorielles, assistance aux États." },
  { id: "fatf-tf", label: "GAFI / FATF — Financement du terrorisme", url: "https://www.fatf-gafi.org/en/topics/terrorist-financing.html", note: "Normes internationales AML/CFT complémentaires au droit pénal." },
  { id: "europol-tesat", label: "Europol — TE-SAT (rapport UE)", url: "https://www.europol.europa.eu/publications-events/main-reports/european-union-terrorism-situation-and-trend-report-te-sat", note: "Situation et tendances ; millésime annuel à citer." },
  { id: "eurojust", label: "Eurojust — coopération judiciaire", url: "https://www.eurojust.europa.eu/", note: "Coordination enquêtes et poursuites transfrontalières." },
  { id: "sgdsn", label: "France — SGDSN (menace terroriste, rapports)", url: "https://www.sgdsn.gouv.fr/", note: "Synthèses officielles sur la menace ; croiser avec parquets et jugements." },
  { id: "justice-fr", label: "France — Ministère de la Justice", url: "https://www.justice.gouv.fr/", note: "Politique pénale, assises spéciales, communiqués." },
  { id: "insee", label: "France — INSEE", url: "https://www.insee.fr/", note: "Statistiques publiques nationales officielles." },
  { id: "wb-data", label: "Banque mondiale — Données ouvertes", url: "https://data.worldbank.org/", note: "Indicateurs par pays (contexte socio-économique)." },
  { id: "oecd", label: "OCDE", url: "https://www.oecd.org/", note: "Indicateurs comparés et rapports thématiques." },
  { id: "stop-djihadisme", label: "France — stop-djihadisme.gouv.fr", url: "https://www.stop-djihadisme.gouv.fr/", note: "Prévention de la radicalisation (grand public)." },
];

/**
 * Fiches « sécurité / terrorisme » — complètent la fiche pays (non stigmatisante : faits & cadre).
 * Clés optionnelles : terrorisme, france, ue, conflit
 */
const SECURITY_NOTES = {
  Iran: {
    conflit: "État-major régional chiite : soutiens à des proxies (Hezbollah, milices irakiennes, Houthis selon périodes). Sanctions et géopolitique du Golfe.",
    terrorisme: "Groupes désignés par l'UE/ONU comme terroristes (ex. Hezbollah selon listes UE) — distinguer État, société civile et idéologie d'État.",
    france: "Veille radicale : réseaux, financements, ingérences ; pas de confusion avec les communautés chiites en France.",
    ue: "Liste UE des organisations terroristes et sanctions ciblées (vérifier textes actualisés).",
  },
  Irak: {
    conflit: "Post-2003 : fragmentation, présence Daech (historique), PMF chiites pro-Iran, Kurdistan.",
    terrorisme: "Daech (résiduel), milices, attentats sectaires. Risque persistant pour les forces locales.",
    france: "Anciens combattants, diaspora, filière djihadiste Syrie-Irak (historique 2014–2019).",
    ue: "Traitement des combattants étrangers, justice internationale (crimes Daech).",
  },
  Syrie: {
    conflit: "Post-Assad 2024–2026 : gouvernement de transition, HTS au centre du pouvoir à Damas, chaos régional, réconciliation incertaine.",
    terrorisme: "Résidus djihadistes, prisons et camps du nord-est. Routes de combattants.",
    france: "Filière djihadiste historique ; retours, RAD, S-files.",
    ue: "Sanctions, justice universelle, GDI.",
  },
  Yémen: {
    conflit: "Houthis (zaïdi) vs coalition ; guerre par procuration Iran / monarchies du Golfe.",
    terrorisme: "Ansar Allah désigné comme groupe terroriste par certains États (positions divergentes). Piraterie et drones.",
    france: "Moins de proximité directe qu'Irak/Syrie ; vigilance maritime.",
    ue: "Aide humanitaire, embargo armes.",
  },
  Liban: {
    conflit: "Hezbollah armé, équilibre confessionnel fragile, effondrement économique.",
    terrorisme: "Hezbollah sur listes UE/US ; attentats historiques.",
    france: "Liens historiques Liban-France ; communautés libanaises.",
    ue: "Politique commune, aide.",
  },
  "Arabie Saoudite": {
    conflit: "Leadership sunnite, rivalité avec l'Iran, guerre Yémen.",
    terrorisme: "Al-Qaida historique sur sol saoudien ; répression interne post-2017.",
    france: "Export doctrinal salafiste (lieux de culte, ONG) — sujets de Renseignement territorial.",
    ue: "Partenaire économique ; droits humains critiqués.",
  },
  France: {
    conflit: "Terrorisme djihadiste, ultra-droite, extrême gauche radicale — menaces plurielles.",
    terrorisme: "PNAT, S-file, sorties de détention suivies ; vigilance écoles, lieux de culte, réseaux en ligne.",
    france: "Lois anti-terrorisme, interdiction RAMF 2026 (signalétique fichage) : distinguer risques idéologiques et populations.",
    ue: "Coordination Europol, mandats d'arrêt.",
  },
  "Égypte": {
    conflit: "Sinaï, Frères musulmans écrasés depuis 2013, autoritarisme.",
    terrorisme: "Wilayat Sinaï (affiliation ÉI), répression.",
    france: "Tourisme, diaspora, Al-Azhar comme instance religieuse médiatisée.",
    ue: "Aide bilatérale limitée.",
  },
  Turquie: {
    conflit: "Kurdes, Syrie nord, méditerranée orientale.",
    terrorisme: "PKK désigné terroriste par l'UE et les États-Unis ; opérations transfrontalières.",
    france: "Diaspora kurde et turque ; discours politiques importés.",
    ue: "Candidature suspendue, OTAN.",
  },
  Nigeria: {
    conflit: "ISWAP, Boko Haram, fracture Nord/Sud.",
    terrorisme: "Groupes affiliés ÉI / Al-Qaida selon zones.",
    france: "Présence militaire régionale (G5 Sahel historique) ; pas de front intérieur direct majeur.",
    ue: "Aide au développement, sécurité.",
  },
  Mali: {
    conflit: "Insurrection djihadiste, putschs, présence Wagner/Russie.",
    terrorisme: "JNIM, GSIM — contrôle rural.",
    france: "Opération Barkhane terminée ; vigilance diaspora et propagande.",
    ue: "EUTM, sanctions.",
  },
  Afghanistan: {
    conflit: "Talibans au pouvoir ; minorités hazaras persécutées.",
    terrorisme: "ÉI-K, Al-Qaida résiduels.",
    france: "Évacuations 2021 ; filières historiques.",
    ue: "Aide humanitaire conditionnelle.",
  },
  Pakistan: {
    conflit: "TTP, Baloutchistan, tensions avec l'Inde.",
    terrorisme: "Attentats fréquents ; armée et renseignement.",
    france: "Peu d'impact direct ; diaspora.",
    ue: "GSP+, droits humains.",
  },
  "Royaume-Uni": {
    conflit: "Attentats historiques ; prévention Prevent.",
    terrorisme: "Menace islamiste et extrémiste plurielle.",
    france: "Coopération renseignement, AUKUS hors sujet.",
    ue: "Brexit — pas dans l'UE.",
  },
  Allemagne: {
    conflit: "Montée de l'AfD, débats migration.",
    terrorisme: "Attentats 2016 Berlin, filières ; enquêtes BAMF et Verfassungsschutz.",
    france: "Coopération Schengen, arrestations transfrontalières.",
    ue: "Moteur institutionnel.",
  },
};

/** Cercles indicatifs « chaleur » terrorisme / conflit armé (rayon km — indicatif, non exhaustif). */
const TERROR_HOTSPOTS = [
  { lat: 33.4, lng: 43.7, km: 280, intensity: 0.85, label: "Irak — PMF / résidus Daech", zone: "Irak" },
  { lat: 35.0, lng: 38.0, km: 220, intensity: 0.9, label: "Syrie — zones de non-droit / camps", zone: "Syrie" },
  { lat: 15.5, lng: 48.0, km: 350, intensity: 0.75, label: "Yémen — conflit & Houthis", zone: "Yémen" },
  { lat: 10.5, lng: 13.0, km: 400, intensity: 0.7, label: "Nigeria nord-est — ISWAP/Boko Haram", zone: "Nigeria" },
  { lat: 34.4, lng: 69.2, km: 200, intensity: 0.65, label: "Afghanistan — ÉI-K / résidus", zone: "Afghanistan" },
  { lat: 31.8, lng: 35.2, km: 120, intensity: 0.55, label: "Proche-Orient — filières historiques", zone: "Israël" },
];

/** Glossaire (mots-clés cliquables). */
const GLOSSARY = {
  "Acte de terrorisme (France)": "Qualification du Code pénal (art. 421-1 et s.) : se référer exclusivement au texte consolidé Légifrance pour l'énoncé légal et les conditions d'application.",
  "Terrorisme (usage international)": "Coopération encadrée par le Conseil de sécurité de l'ONU, conventions sectorielles (ex. financement) et droits internes ; pas une étiquette unique remplaçant le juge national.",
  "Directive (UE) 2017/541": "Acte d'harmonisation pénale et de coopération policière dans l'UE contre le terrorisme — à lire sur EUR-Lex avec les transpositions françaises.",
  "Liste des personnes / entités (UE)": "Actes de gel et sanctions adoptés par l'UE sur fondement résolutions ONU et autonomes — consulter les règlements consolidés au JOUE.",
  "AML / CFT": "Anti-blanchiment et lutte contre le financement du terrorisme : cadre GAFI et directives européennes (ex. 2015/849) — distinct de la seule démographie religieuse.",
  Djihadisme: "Terme politique et médiatique : instrumentalisation du djihad (effort) en violence insurrectionnelle transnationale — à distinguer des usages juridiques classiques.",
  Wahhabisme: "Courant hanbalite strict lié à la réforme d'Ibn Abd al-Wahhab (XVIIIe s.), légitimé historiquement par le pacte avec la dynastie saoudienne.",
  "Chiisme duodécimain": "Branche majoritaire du chiisme : succession de 12 imams, juridiction marja' en Irak/Iran.",
  Salafisme: "Retour aux sources (salaf) — spectre du conservatisme au jihadisme ; ne présuppose pas la violence.",
  Taqiya: "Prudence doctrinale (surtout chiite) : ne pas assimiler à « mensonge systématique » hors contexte.",
  "Frères musulmans": "Mouvement transnational fondé 1928 ; statuts juridiques variables selon pays et époques.",
  PMF: "Popular Mobilization Forces (Irak) : coalition de milices surtout chiites après 2014.",
  Houthis: "Mouvement zaïdi yéménite (Ansar Allah), soutien iranien allégué.",
  HTS: "Hayat Tahrir al-Sham — ex-filiation Al-Qaida, dominant à Idlib puis à Damas après 2024.",
};

/** Timeline 610–2026 (points d’ancrage — cours magistral). */
const TIMELINE_EVENTS = [
  { year: 610, t: "Début de la révélation coranique (islamique)", d: "Contexte tribu Mecque." },
  { year: 632, t: "Décès du Prophète", d: "Désaccord sur la succession → bases sunnisme/chiisme." },
  { year: 680, t: "Kerbala", d: "Mort de Hussein ; mémoire martyrologique chiite centrale." },
  { year: 1501, t: "Safavides", d: "Chiisme duodécimain religion d’État en Perse." },
  { year: 1744, t: "Pacte wahhabite-saoudien", d: "Alliance Émir du Nedjd / réforme doctrinale." },
  { year: 1979, t: "Révolution iranienne", d: "République islamique ; export de modèle et soutiens régionaux." },
  { year: 2001, t: "11 septembre & résolution 1373", d: "Attentats aux États-Unis ; le Conseil de sécurité impose aux États des obligations renforcées de lutte contre le terrorisme et le financement." },
  { year: 2014, t: "État islamique", d: "Califat territorial Irak-Syrie ; génocide yazidis." },
  { year: 2021, t: "Talibans au pouvoir", d: "Retrait international ; crise droits humains et terrorisme résiduel." },
  { year: 2024, t: "Chute du régime Assad", d: "Transition chaotique ; HTS à Damas — scénarios ouverts." },
  { year: 2026, t: "Prévention & veille", d: "Menace plurielle UE ; prévention, PNAT, RAD, coopération Europol." },
];
Object.assign(P, {
  QUIZ_DATA,
  SOURCES_2026,
  SECURITY_NOTES,
  TERROR_HOTSPOTS,
  GLOSSARY,
  TIMELINE_EVENTS,
});
})();
