(function () {
'use strict';
var P = window.IslamMapData;
if (!P) { console.error('[pedagogy-bundle] Charger data.js avant pedagogy-bundle.js'); return; }
/** Quiz carte & certification — 20 Q (formation sécurité / géo-religieux) */
const QUIZ_DATA = [
  { q: "Quelle est la plus grande population sunnite mondiale ?", opts: ["Pakistan", "Arabie Saoudite", "Indonésie", "Bangladesh"], ans: 2 },
  { q: "Quel pays est le centre mondial du chiisme duodécimain ?", opts: ["Irak", "Arabie Saoudite", "Iran", "Azerbaïdjan"], ans: 2 },
  { q: "Kerbala et Najaf (villes saintes chiites) se trouvent dans quel pays ?", opts: ["Iran", "Syrie", "Pakistan", "Irak"], ans: 3 },
  { q: "L'islam ibadi est majoritaire dans quel pays ?", opts: ["Bahreïn", "Oman", "Koweït", "Qatar"], ans: 1 },
  { q: "L'épisode de Kerbala (680) est surtout associé à :", opts: ["la bataille qui fonde une mémoire chiite du martyre", "la fondation de l'école hanafite", "la conquête omeyyade de l'Inde", "le traité de Taïf"], ans: 0 },
  { q: "La dynastie safavide (1501, Iran) a surtout contribué à :", opts: ["imposer le sunnisme hanafite", "ancrer le chiisme duodécimain comme religion d'État", "introduire l'ibadisme en Perse", "abolir les confréries"], ans: 1 },
  { q: "Le pacte wahhabite-saoudien (1744) est lié à :", opts: ["l'Empire ottoman", "l'alliance Émir du Nedjd / cheikh Mohammed ibn Abd al-Wahhab", "la révolution iranienne de 1979", "la décolonisation du Yémen"], ans: 1 },
  { q: "Bahreïn : quelle particularité confessionnelle (synthèse pédagogique) ?", opts: ["100 % sunnite", "majorité chiite dans un État à direction sunnite", "50/50 équilibré", "majorité ibadi"], ans: 1 },
  { q: "En formation sécurité (France), le suivi PNAT concerne notamment :", opts: ["uniquement les infractions routières", "les personnes signalées pour radicalisation / terrorisme", "les seules entreprises du CAC40", "les sportifs de haut niveau"], ans: 1 },
  { q: "Ordre de grandeur documenté côté libérations de détention liées au terrorisme (France, cumul 2021→) :", opts: ["~50", "~150", "~340", "~900"], ans: 2 },
  { q: "Les Houthis (Yémen) relèvent principalement du courant :", opts: ["hanafi", "zaïdi (chii)", "ibadi", "malékite"], ans: 1 },
  { q: "Quel groupe est classiquement qualifié de chiite « pro-Iran » au Liban (enseignement général) ?", opts: ["Daech", "Hezbollah", "Al-Qaida", "Ansar al-Sunna"], ans: 1 },
  { q: "En Irak post-2003, les PMF (Hashd al-Shaabi) sont surtout décrits comme :", opts: ["une coalition de milices paramilitaires majoritairement chiites", "une armée sunnite unifiée", "une force de l'OTAN", "une garde royale wahhabite"], ans: 0 },
  { q: "En Syrie (après 2011, synthèse), la transition politique 2024–2026 s'inscrit surtout dans :", opts: ["un retour du parti Baas inchangé", "un effondrement du clan alaouite et une phase d'incertitude sécuritaire", "l'annexion par l'Iran", "l'adhésion à l'UE"], ans: 1 },
  { q: "Les Frères musulmans : dans les débats UE / listes terrorisme, le point pédagogique est :", opts: ["qu'il n'y a jamais eu de controverse juridique", "qu'un même mouvement peut être analysé comme parti / réseau / signal d'extrémisme selon contexte et listes", "qu'ils sont toujours classés comme organisation humanitaire en Europe", "qu'ils sont ibadites"], ans: 1 },
  { q: "Terrorisme de type « wahhabite/salafiste djihadiste » (synthèse) : quel couple pays / groupe est souvent cité en formation ?", opts: ["Iran / Hezbollah", "Arabie historique / Al-Qaida ou filiales type Daech", "Oman / Ibadi", "Koweït / Houthis"], ans: 1 },
  { q: "Projection démographique de référence (Pew, religions) vers 2060 :", opts: ["l'islam disparaît en Asie", "le nombre de musulmans pourrait égaler puis dépasser les chrétiens à l'échelle mondiale", "les chiites dépassent 90 % de l'humanité", "l'ibadisme domine l'Europe"], ans: 1 },
  { q: "En Allemagne, l'enquête BAMF sur les musulmans cite souvent l'ordre de grandeur :", opts: ["50 000 personnes", "550 000", "5,5 millions", "55 millions"], ans: 2 },
  { q: "Risque professionnel (France/EU) : la radicalisation djihadiste se distingue par :", opts: ["une adhésion exclusivement génétique", "un processus idéologique, social, parfois carcéral — jamais une « essence » communautaire", "un critère linguistique obligatoire", "une affiliation sportive"], ans: 1 },
  { q: "Bon réflexe « CNAPS / SSIAP » : face à un discours politico-religieux agressif, on :", opts: ["humilie la personne en public", "signale, documente, respecte le cadre légal et la neutralité du service", "diffuse sur les réseaux sans cadre", "ignore systématiquement"], ans: 1 },
];

/** Sources officielles / instituts — à citer (millésimes variables ; vérifier les pages primaires). */
const SOURCES_2026 = [
  { id: "pew", label: "Pew Research Center — The Future of World Religions", url: "https://www.pewresearch.org/topic/religion/", note: "Démographie religieuse mondiale, projections (dont 2060)." },
  { id: "pew-muslim", label: "Pew — Muslims (séries démographiques)", url: "https://www.pewresearch.org/topic/religion/religious-affiliation/muslims/", note: "Ordre de grandeur ~2 milliards de musulmans (synthèses récentes)." },
  { id: "pnat", label: "France — Politique nationale d’anticipation de la radicalisation (PNAT) / rapports associés", url: "https://www.interieur.gouv.fr/", note: "Suivi des sorties de détention et dispositifs anti-radicalisation (consulter rapports actualisés)." },
  { id: "eu-tesat", label: "UE — TE-SAT / rapports sur la menace terroriste", url: "https://www.europol.europa.eu/", note: "Menace terroriste en Europe (Europol)." },
  { id: "bamf", label: "Allemagne — BAMF (enquêtes sur les musulmans en Allemagne)", url: "https://www.bamf.de/", note: "Ordre de grandeur population musulmane allemande (enquêtes publiées)." },
  { id: "unhcr", label: "UNHCR — situations de réfugiés / conflits", url: "https://www.unhcr.org/", note: "Contextes humanitaires liés aux crises au Moyen-Orient et au Sahel." },
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

/** Cercles indicatifs « chaleur » terrorisme / conflit armé (rayon km — pédagogique, non exhaustif). */
const TERROR_HOTSPOTS = [
  { lat: 33.4, lng: 43.7, km: 280, intensity: 0.85, label: "Irak — PMF / résidus Daech", zone: "Irak" },
  { lat: 35.0, lng: 38.0, km: 220, intensity: 0.9, label: "Syrie — zones de non-droit / camps", zone: "Syrie" },
  { lat: 15.5, lng: 48.0, km: 350, intensity: 0.75, label: "Yémen — conflit & Houthis", zone: "Yémen" },
  { lat: 10.5, lng: 13.0, km: 400, intensity: 0.7, label: "Nigeria nord-est — ISWAP/Boko Haram", zone: "Nigeria" },
  { lat: 34.4, lng: 69.2, km: 200, intensity: 0.65, label: "Afghanistan — ÉI-K / résidus", zone: "Afghanistan" },
  { lat: 31.8, lng: 35.2, km: 120, intensity: 0.55, label: "Proche-Orient — filières historiques", zone: "Israël" },
];

/** Glossaire pédagogique (mots-clés cliquables). */
const GLOSSARY = {
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
  { year: 2001, t: "11 septembre", d: "Globalisation du terrorisme djihadiste de type Al-Qaida." },
  { year: 2014, t: "État islamique", d: "Califat territorial Irak-Syrie ; génocide yazidis." },
  { year: 2021, t: "Talibans au pouvoir", d: "Retrait international ; crise droits humains et terrorisme résiduel." },
  { year: 2024, t: "Chute du régime Assad", d: "Transition chaotique ; HTS à Damas — scénarios ouverts." },
  { year: 2026, t: "Formation & veille", d: "Menace plurielle UE ; outils PNAT, RAD, coopération Europol." },
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
