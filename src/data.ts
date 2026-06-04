import { Research, Article, Publication, Note, TimelineMilestone } from './types';

// 9 Sample Research Works
export const researchesData: Research[] = [
  {
    id: "res-1",
    title: "Novel Herbal Formulation for Pain Relief: Synergistic Effects of Curcumin and Boswellic Acids",
    category: "Herbal Medicine & Inflammation",
    journal: "Phytomedicine Reports",
    year: "2025",
    summary: "Investigation into the molecular pathways of co-formulating Curcuma longa and Boswellia serrata. This study uncovers synergism in the down-regulation of inflammatory markers THF-alpha and IL-1 beta.",
    tags: ["Analgesic", "Co-formulation", "Curcumin", "Synergism"],
    methodology: "In vivo testing on Wistar rats utilizing the hot plate and carrageenan-induced paw edema assays. Molecular docking to map binding affinities to the COX-2 enzyme.",
    findings: "The combined formulation exhibited a 58% increase in pain tolerance compared to monotherapy. Downregulation of inflammatory enzymes was verified via western blot analysis.",
    impact: "Provides a scientific foundation for formulating non-addictive, plant-derived analgesic options to reduce reliance on NSAIDs with gastrointestinal side-effects."
  },
  {
    id: "res-2",
    title: "Targeted Drug Delivery Systems in Oncology: Nanoparticle-Mediated Chemotherapy",
    category: "Nanotechnology & Cancer",
    journal: "International Oncology Delivery",
    year: "2025",
    summary: "Designing PLGA-PEG nanoparticles conjugated with folic acid to optimize cytotoxic drug delivery directly to folate-receptor-overexpressing ovarian cancer cells.",
    tags: ["Nanotechnology", "Folic Acid", "PLGA-PEG", "Chemotherapy"],
    methodology: "Synthesis of polymer nanoparticles via single-emulsion solvent evaporation. Cell viability assays (MTT) conducted on MCF-7 and HeLa cells with confocal laser imaging.",
    findings: "Achieved double the cytocompatibility in healthy cells while increasing cancer-cell apoptosis by 40% due to enhanced intracellular drug accumulation via receptor-mediated endocytosis.",
    impact: "Enhances localized concentration of highly toxic chemotherapy drugs, mitigating severe systemic side effects common in cancer patients."
  },
  {
    id: "res-3",
    title: "Cardioprotective Agents of Plant Origin: Evaluating Mitochondrial Shielding Mechanisms",
    category: "Cardiology & Natural Products",
    journal: "Cardiovascular Phytotherapy",
    year: "2024",
    summary: "Evaluation of the compound Astragaloside IV in countering oxidative stress-induced apoptosis in cardiac muscle during ischemia-reperfusion injury models.",
    tags: ["Mitochondria", "Oxidative Stress", "Cardioprotection", "Astragaloside IV"],
    methodology: "Isolated rat heart studies (Langendorff preparation). Determination of mitochondrial membrane potential using JC-1 dye and quantification of ATP production rate.",
    findings: "Pre-treatment with Astragaloside IV preserved mitochondrial crest structure and decreased lactate dehydrogenase (LDH) leakage by 35% during reperfusion.",
    impact: "Identifies a critical molecular target for clinical pre-cardiac event treatment and surgical pre-conditioning methodologies."
  },
  {
    id: "res-4",
    title: "Neuroprotective Potential of Ginkgo Biloba in Neurodegenerative Disorders",
    category: "Neuropharmacology",
    journal: "Journal of Neurodegenerative Research",
    year: "2024",
    summary: "Investigating the molecular action of Ginkgo extract EGb 761 in preserving synaptic plasticity and memory mechanisms in mouse models of induced amyloid toxicity.",
    tags: ["Alzheimer's", "Neuroprotection", "Synaptic Plasticity", "EGb 761"],
    methodology: "Y-maze test and Morris water maze to evaluate spatial navigation. Immunohistochemistry of hippocampus tissues to quantify amyloid-beta plaques and superoxide levels.",
    findings: "Treatment with extract improved hippocampal synaptic density and significantly reduced memory consolidation errors by preserving acetylcholinesterase activity.",
    impact: "Validates long-standing traditional applications of Ginkgo extracts with hard physiological evidence, laying the clinical pathway for adjunctive treatment protocols."
  },
  {
    id: "res-5",
    title: "Evaluation of Antidiabetic Activity of Synthesized Chalcone Derivatives",
    category: "Endocrinology & Medicinal Chemistry",
    journal: "Endocrine Chemistry & Biology",
    year: "2023",
    summary: "Synthesizing a series of fluorine-substituted chalcones and evaluating their competitive inhibition against enzyme alpha-glucosidase for Type II diabetes management.",
    tags: ["Diabetes", "Chalcone", "Alpha-Glucosidase", "Fluorine Derivatives"],
    methodology: "Claisen-Schmidt condensation reaction for chemical synthesis. In vitro enzyme-inhibition kinetics monitored at 405nm. Docking protocols on human intestinal sucrase-isomaltase.",
    findings: "Selected compound 3g showed an IC50 of 4.2 micromolar, ten-fold more potent than standard pharmaceutical Acarbose with no noticeable in-vitro hepatotoxicity.",
    impact: "Unlocks an economical, structurally simple molecule pathway to restrict postprandial glucose surges in diabetic patients."
  },
  {
    id: "res-6",
    title: "Phytochemical Screening and Gastroprotective Effects of Morinda Citrifolia",
    category: "Gastroenterology",
    journal: "Gastrointestinal Biology",
    year: "2023",
    summary: "Assessment of Morinda citrifolia (Noni) fruit extract in protecting mucosal linings against ethanol-induced gastric ulcer models, analyzing anti-secretory mechanics.",
    tags: ["Gastric Ulcer", "Morinda Citrifolia", "Phytochemistry", "Mucosal Defense"],
    methodology: "Induction of gastric lesions with absolute oral ethanol. Determination of gastric juice pH, total acidity, and estimation of mucosal glutathione (GSH) and catalase levels.",
    findings: "Fruit extract at 400 mg/kg restored mucosal GSH content to near-control values, leading to an index of gastroprotection of 82% against corrosive lesions.",
    impact: "Validates safe gastroprotective natural remedies, reducing dependency on proton pump inhibitors which have been tied to kidney issues on prolonged use."
  },
  {
    id: "res-7",
    title: "In-vitro Antimicrobial Activity of Silver Nanoparticles Synthesized from Piper Nigrum",
    category: "Microbiology & Green Synthesis",
    journal: "Nanomedicine and Microbiology",
    year: "2024",
    summary: "Harnessing biochemical reducing agents in black pepper to synthesize silver nanoparticles (AgNPs) capable of breaking down multidrug-resistant biofilm barriers.",
    tags: ["Green Synthesis", "Silver Nanoparticles", "Biofilms", "Piper Nigrum"],
    methodology: "Reduction of silver nitrate using aqueous Piper nigrum extract. Characterization via UV-Vis, FTIR, and TEM. Micro-broth dilution assays against MRSA strains.",
    findings: "The biological silver nanoparticles successfully compromised MRSA biofilm structures at concentrations of 15 micrograms/mL, rupturing bacterial cell walls.",
    impact: "Presents an environmental-friendly, simple synthesis route for producing high-affinity antibacterial surfaces and sterilizing agents."
  },
  {
    id: "res-8",
    title: "Assessment of Hepatoprotective Efficacy of Silymarin-Loaded Solid Lipid Nanoparticles",
    category: "Hepatology & Drug Formulation",
    journal: "Hepatology Discovery",
    year: "2025",
    summary: "Re-engineering silymarin delivery using custom hot-homogenized lipid vectors to significantly bypass first-pass liver degradation and improve oral systemic bioavailability.",
    tags: ["Silymarin", "Bioavailability", "Solid Lipid Nanoparticles", "Liver Protection"],
    methodology: "Preparation of solid lipid nanoparticles using glyceryl monostearate as lipid core. Liver enzymes (SGOT, SGPT) measured post carbon tetrachloride (CCl4) injury in models.",
    findings: "Solid lipid formulation elevated the oral bioavailable fraction by 450% and lowered critical marker enzymes AST and ALT significantly compared to pure silymarin powder.",
    impact: "Solves poor absorption issues of herbal active ingredients, turning traditional therapeutics into potent, standardized clinical remedies."
  },
  {
    id: "res-9",
    title: "Therapeutic Evaluation of Novel NSAID Conjugates with Reduced Gastric Toxicity",
    category: "Analgesics & Chemistry",
    journal: "European Journal of Medicinal Chemistry",
    year: "2024",
    summary: "Designing ester and amide conjugates of Ketorolac with natural amino acids to mask acid carboxyl groups, aiming to mitigate mucosal damage while preserving inflammation block.",
    tags: ["Ketorolac", "Prodrug", "Gastroprotective NSAIDs", "Amino Acid Conjugate"],
    methodology: "Steglich-like esterification synthesis followed by spectroscopic structure verification. Gastric tolerability indexing via histological cross-sections of stomach walls.",
    findings: "Conjugated designs retained excellent 92% analgesic activity while showing a notable 80-85% decrease in micro-hemorrhages and ulcerations across the gastric mucosa.",
    impact: "Offers safer options for patients under chronic treatment for arthritic ailments, reducing pain safely without compromising digestive health."
  }
];

// 60+ Sample Articles
export const articlesCategories = [
  "All",
  "Toxicology",
  "Molecular Pharmacology",
  "Clinical Studies",
  "Herbal Medicine",
  "Drug Discovery",
  "Neuropharmacology",
  "Pharmacokinetics"
];

// Generate 62 unique articles matching the 60+ requirement
export const generateArticles = (): Article[] => {
  const categories = [
    "Toxicology", "Molecular Pharmacology", "Clinical Studies",
    "Herbal Medicine", "Drug Discovery", "Neuropharmacology", "Pharmacokinetics"
  ];
  
  const topics = [
    "Advances in Pharmacology 2026: Trends in Targeting Intracellular Receptors",
    "Modern Toxicology: Analyzing Cellular Damage and Heavy Metal Antidotes",
    "Phytotherapy of Chronic Arthritis: Anti-inflammatory Biomarkers Examined",
    "Preclinical Trials: Protocols for Ethical Drug Screening in Laboratory Mice",
    "Gastrointestinal Absorption Barriers: Re-designing Orally Disintegrating Tablets",
    "The Role of Oxidative Stress in Vascular Aging and Cardioprotective Therapy",
    "Bioavailability Optimization: Nano-carriers as Lipophilic Solubility Accelerators",
    "Receptor Binding Kinetics: A Deeper Look into Agonist-Receptor Interactions",
    "Innovative Treatments for Neurodegenerative Disease: Targeting Beta-Amyloid",
    "Phytomedicine Research Methods: High-Performance Thin-Layer Chromatography",
    "Hepatotoxicity Screening: Advanced Biomarkers for Early Detection of Liver Damage",
    "Sutures and Drug Delivery: Coating Materials with Biodegradable Polymers",
    "FDA Drug Approvals Q1 2026: Mechanistic Insights and Therapeutic Classes",
    "Metabolism of Bioactive Polyphenols: Navigating First-pass Extraction",
    "Cancer Chemotherapy Side Effects: Protective Compounds from Sea Weed Extracts",
    "Pharmacodynamics of Novel Analgesics: Dissecting Peripheral Cox Pathways",
    "Evaluating Cytotoxicity of Botanical Compounds via Automated MTT Assays",
    "Intercellular Signaling Mechanisms in Cardiac Hypertrophy Development",
    "Clinical Application of Anti-Angiogenic Factors in Retinopathy Studies",
    "Drug-Drug Interactions: Dynamic Co-administration Protocols for Elders",
    "Green Chemistry Synthesis: Utilizing Aqueous Leaf Extracts for Nano-Catalysts",
    "Alzheimer's Disease Pathology: Mitochondrial Uncoupling Protein-2 Roles",
    "Evaluating In-Vitro Insulin Mimetic Qualities of Rare Forest Herbs",
    "Antidiabetic Regimens: Revisiting Metformin in Gestational Diabetes Profiles",
    "Bacterial Biofilm Resistance: Testing Essential Oils as Membrane Disruptors",
    "Inhaled Aerosol Drug Formulations: Powder Physics and Lung Deposition Rates",
    "Assessing Toxicity Profile of Saponin-Rich Bark Formulations",
    "Renal Clearance Dynamics: Mathematical Simulators for Nephrotic Patients",
    "Targeting Histamine Pathways: Third-Generation Antihistamine Discovery",
    "Microbes as Natural Synthesizers: Producing Bio-compatible Enzymes in Lab",
    "Novel Drug Formulation for Dermal Psoriasis using Nano-emulsions",
    "Understanding the Neurochemistry of Serotonin Re-uptake Channel Mutants",
    "Methods in Pharmacovigilance: Automated Reporting Systems for Adverse Reactions",
    "Evaluating Antibacterial Properties of Zinc Oxide Nano-particles",
    "Natural Bio-polymers in Controlled Drug Release: Pectin and Chitosan Gels",
    "Therapeutic Potential of Secondary Metabolites: Alkaloids and Terpenes",
    "Investigating Anti-Asthmatic Activities of Traditional Smoking Herbs",
    "Role of GABA-gated Chloride Channels in Modern Sedative Therapeutics",
    "Assessing Transdermal Absorption using Franz Diffusion Cell Models",
    "Bio-inspired Scaffold Design for Localized Osteoarthritis Drug Release",
    "Exploring Anti-Viral Properties of Selected Polyphenolic Red Ginseng Fractions",
    "Dose Optimization Strategy: Phase I Study Models for High-Risk Oncology",
    "Enzyme Kinetics in Liver Slices: Evaluating Cytochrome P450 Levels",
    "Heavy Metal Chelation Therapeutics: Evaluating BAL Derivatives Potency",
    "Epigenetic Modifications: How Anti-oxidants Regulate Histone Acetylation",
    "Evaluating Gastric Gastrin Secretions post Administration of Bitter Powders",
    "Modern Chromatography: Supercritical Fluid Chromatography in Drug Development",
    "Targeting Mitochondrial Dynamics in Acute Myocardial Infarction Events",
    "Phytochemistry of Withania Somnifera: A Comprehensive Adaptogen Analysis",
    "Therapeutic Delivery into the Central Nervous System: Bypassing the Blood-Brain Barrier",
    "Novel Methods in Micro-encapsulation of Volatile Oils for Oral Delivery",
    "Targeting IL-6 Cytokine Release: Biological Therapies in Rheumatology",
    "Bioequivalence Requirements for Generic Drug Approvals: Global Comparison",
    "Investigating Wound Healing Actions of Hydrogels Infused with Centella Extract",
    "Role of Nitric Oxide Synthesase in Smooth Muscle Relaxation and Therapy",
    "Immunotherapy Side Effects: Pharmacological Interventions for Auto-immunity",
    "Assessing Anti-hyperlipidemic Properties of Organic Fenugreek Seed Saponins",
    "Drug Excipient Interactions: Assessing Solid State Stability via DSC Analysis",
    "Neurotransmission Alterations in Chronic Stress: Preclinical Target Validation",
    "A Simple Method for Purifying Anti-malarial Artmisinin from Plant Tissue",
    "Evaluating Calcium Channel Antagonists in High-Altitude Pulmonary Edema",
    "Nanostructured Lipid Carriers (NLCs): The Next Generation of Drug Delivery"
  ];

  const articles: Article[] = [];
  
  for (let i = 0; i < topics.length; i++) {
    const cat = categories[i % categories.length];
    const daysAgo = i * 4 + 7;
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysAgo);
    
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const readTimes = ["3 min read", "5 min read", "8 min read", "10 min read", "6 min read"];
    const viewCounts = Math.floor(Math.sin(i) * 300) + 450 + (i * 2);

    articles.push({
      id: `art-${i + 1}`,
      title: topics[i],
      category: cat,
      date: formattedDate,
      readTime: readTimes[i % readTimes.length],
      author: "Dr. Ashwin Singh Chouhan",
      snippet: `A detailed scientific exploration on ${topics[i].toLowerCase()}. This article compiles clinical insights, analytical chemistry validations, and modern drug formulation methodologies tailored for researchers in pharmacology and therapeutics.`,
      views: viewCounts
    });
  }

  return articles;
};

// 4 Publications with glowing flip card borders
export const publicationsData: Publication[] = [
  {
    id: "pub-1",
    title: "Synergistic Anti-Inflammatory Effects of Combined Boswellia Serrata and Curcuma Longa Extracts in Wistar Rats",
    journal: "Journal of Ethnopharmacology",
    year: "2025",
    abstract: "This study systematically evaluated the co-administration of Boswellia and Curcuma extracts. Our findings show a 45% greater reduction in paw edema than either extract alone. This synergistic effect is mediated via the dual chemical block of high-affinity COX-2 enzymes and 5-LOX inflammatory pathway molecules.",
    doi: "10.1016/j.jep.2025.118942",
    citationCount: 48,
    authors: "Chouhan AS, Sharma PK, Patel LK"
  },
  {
    id: "pub-2",
    title: "Formulation and Evaluation of Transdermal Patches Containing Glibenclamide Nanoparticles for Sustained Glycemic Control",
    journal: "International Journal of Pharmaceutics",
    year: "2024",
    abstract: "Transdermal glibenclamide nanoparticles were synthesized via solvent evaporation. The formulation achieved peak therapeutic plasma level in 4 hours and sustained controlled drug release for 24 hours. The transdermal application completely bypasses hepatic first-pass metabolism, improving bioavailability by 70%.",
    doi: "10.1016/j.ijpharm.2024.123510",
    citationCount: 65,
    authors: "Chouhan AS, Dave H, Rathod DS"
  },
  {
    id: "pub-3",
    title: "Mitochondrial Protection by Bioactive Flavonoids Against Doxorubicin-Induced Cardiotoxicity in Cardiac H9c2 Cells",
    journal: "Toxicology and Applied Pharmacology",
    year: "2023",
    abstract: "Doxorubicin triggers cardiotoxicity by causing radical damage inside the cardiac cell's mitochondria. This investigation profiles structural support provided by botanical flavonoids (quercetin and rutin). Pre-treatment preserved cellular respiration and slashed mitochondrial oxidative stresses (ROS) by 60%.",
    doi: "10.1016/j.taap.2023.116490",
    citationCount: 112,
    authors: "Chouhan AS, Singh J, Verma M"
  },
  {
    id: "pub-4",
    title: "Green Synthesis of Gold Nanoparticles Using Ginger Rhizome and Evaluation of Selective Cytotoxicity on Breast MCF-7 Cancer Lines",
    journal: "Nanomedicine & Biotechnology Review",
    year: "2025",
    abstract: "We report a single-pot green synthesis of gold nanoparticles (AuNPs) using Zingiber officinale root extract as an eco-friendly stabilizer. The bio-synthesized AuNPs displayed selective apoptosis induction inside MCF-7 cancer cell cultures while maintaining 90% survivability in healthy mammary epithelial cells.",
    doi: "10.1016/j.nanomed.2025.109311",
    citationCount: 32,
    authors: "Chouhan AS, Chaudhary S, Sheikh Y"
  }
];

// 10 Sample notes
export const notesData: Note[] = [
  {
    id: "note-1",
    title: "Advanced Receptor Pharmacology & Signal Transduction",
    size: "4.2 MB",
    type: "PDF",
    description: "Detailed hand-compiled lecture slides and notes outlining G-protein coupled receptors, intracellular cyclic AMP cascades, receptor up-regulation mechanics, and binding affinities values.",
    content: "# Advanced Receptor Pharmacology\n\n## 1. G-Protein Coupled Receptors (GPCRs)\nGPCRs represent the largest class of membrane receptors. They feature standard 7-transmembrane alpha-helices.\n\n### Signal Cascades:\n1. Agonist binds to outer receptor site.\n2. GDP is swapped with GTP on the G-alpha molecule.\n3. G-alpha separates from G-beta-gamma subunits.\n4. Activation of Adenylate Cyclase leads to cAMP generation from ATP.\n5. Cyclic AMP binds to regulatory proteins releasing active Protein Kinase A (PKA).\n\n## 2. Receptor Binding Kinetics\nWe graph saturation curves using the equation:\nB = (Bmax * [L]) / (Kd + [L])\nWhere B is bound drug, Bmax is maximum capacity, and Kd is dissociation constant."
  },
  {
    id: "note-2",
    title: "HPLC Method Validation and ICH Guidelines Notes",
    size: "1.8 MB",
    type: "PDF",
    description: "Crucial protocol checklist summarizing High-Performance Liquid Chromatography validation parameter definitions (accuracy, precision, specificity, linearity, LOD/LOQ) according to Q2(R1) ICH guidelines.",
    content: "# HPLC Validation & ICH Guidelines\n\n## 1. Linearity and Calibration Curves\nRequires a minimum of 5 concentration points spread across the expected range (typically 80% to 120% of test concentration). Acceptable coefficient of determination R² > 0.999.\n\n## 2. Limit of Detection (LOD)\nFormula: LOD = 3.3 * (SD / S)\nWhere SD is standard deviation of blank response and S is slope of calibration line.\n\n## 3. Limit of Quantification (LOQ)\nFormula: LOQ = 10 * (SD / S)\nProvides numerical boundary for accurate quantitative analysis."
  },
  {
    id: "note-3",
    title: "Principles of Toxicology: Dose-Response Relationships",
    size: "2.5 MB",
    type: "PDF",
    description: "Comprehensive lecture study notes covering therapeutic index (TI), LD50, ED50, NOAEL indices, toxicokinetics curves, and chemical safety evaluation protocols.",
    content: "# Dose-Response Relationships in Toxicology\n\n## 1. Graded vs. Quantal Curves\n- **Graded:** Measures the degree of response in a single organism (e.g., blood pressure drop in mmHg).\n- **Quantal:** Profiles the distribution of an 'all-or-none' response in an entire population (e.g., survival vs death percentage).\n\n## 2. Safety Indexes\nTherapeutic Index (TI) = LD50 / ED50\nCertain Safety Factor (CSF) = LD1 / ED99\nA higher safety index represents a safer molecule profile since therapeutic dosage shares no overlap with toxic dosage."
  },
  {
    id: "note-4",
    title: "Phytochemical Extraction Techniques: Maceration to Soxhlet",
    size: "3.1 MB",
    type: "PDF",
    description: "Syllabus manual covering laboratory extraction procedures: cold maceration, percolation, reflux, supercritical CO2 extraction, and Soxhlet continuous hot extraction dynamics.",
    content: "# Phytochemical Extraction Protocols\n\n## 1. Soxhlet Extraction Principle\nSoxhlet extraction is used when the desired bioactive chemical has limited solubility in a solvent, and the impurities are insoluble.\n\n- The solvent is heated to reflux in a distillation flask.\n- Solvent vapor travels up and into a condenser, dripping into the chamber containing the plant material.\n- Siphon tube drains the loaded solvent back into the heating flask when liquid climbs to the top of the siphon leg.\n\n## 2. Solvent Selection Index (Polarity):\nHexane (Non-polar) -> Dichloromethane -> Ethyl Acetate -> Ethanol -> Water (Polar)"
  },
  {
    id: "note-5",
    title: "Pharmacokinetics: Compartmental vs Non-Compartmental Analysis",
    size: "1.2 MB",
    type: "PDF",
    description: "Chemical math cheat sheet with core equations for Volume of Distribution (Vd), Clearance (Cl), Half-life (t1/2), Bioavailability (F), and AUC multi-compartment graphs.",
    content: "# Pharmacokinetics Formula Guide\n\n## 1. Bioavailability (F)\nF = (AUC_oral * Dose_IV) / (AUC_IV * Dose_oral) * 100 %\nCalculates systemic absorption percentage of oral dosage.\n\n## 2. Apparent Volume of Distribution (Vd)\nVd = Dose / C0\nWhere C0 is the plasmaconcentration extrapolated to time zero.\nValues > 42 liters hint that the chemical is storing inside fatty tissues, rather than remaining inside blood vessels."
  },
  {
    id: "note-6",
    title: "Bioavailability and Bioequivalence (BA/BE) Study Designs",
    size: "2.0 MB",
    type: "PDF",
    description: "FDA clinical regulatory guideline overview describing cross-over study layouts, washout intervals, bioequivalence margins (80-125%), and evaluation metrics.",
    content: "# BA/BE Study Guidelines Summary\n\n## 1. Standard Crossover Layout (2x2)\nSubjects are randomized to receive either Test (A) or Reference (B) in Period 1, then flipped in Period 2.\n- Group I: A -> Washout Period -> B\n- Group II: B -> Washout Period -> A\n\n## 2. Washout Interval Strategy\nMust exceed 5 times the elimination half-life (5 * t1/2) of the therapeutic chemical to prevent overlap carryover effects.\n\n## 3. FDA Integrity Margins\nThe 90% confidence interval of the geometric mean ratio (Test/Reference) for AUC and Cmax must lie strictly inside 80% to 125%."
  },
  {
    id: "note-7",
    title: "Classification of Autonomic Nervous System Drugs",
    size: "1.5 MB",
    type: "PDF",
    description: "Comprehensive visual layout indexing cholinergics, adrenergics, block agents, mechanism pathways, and autonomic receptors distributions.",
    content: "# Autonomic Nervous System (ANS) Drug Classes\n\n## 1. Parasympathetic System (Cholinergic)\n- **Direct Agonists:** Pilocarpine, Bethanechol (stimulate muscarinic receptors).\n- **Indirect Agonists (Cholinesterase blockers):** Neostigmine, Physostigmine (stabilize acetylcholine by preventing enzymatic breakdown).\n- **Antagonists:** Atropine, Scopolamine (block autonomic receptors, drying secretions and speeding heart).\n\n## 2. Sympathetic System (Adrenergic)\n- **Alpha-1 Agonists:** Phenylephrine (vasoconstrictor).\n- **Beta-1 Agonists:** Dobutamine (increases heart contractility).\n- **Beta-2 Agonists:** Albuterol (bronchodilator for asthma relief)."
  },
  {
    id: "note-8",
    title: "Receptor Binding Assays and Scatchard Plot Analysis",
    size: "1.9 MB",
    type: "PDF",
    description: "Biochem protocol to determine drug and molecular target affinity. Learn how to transform non-linear hyperbola graphs into linear plots for extraction of Kd.",
    content: "# Scatchard Equations & Affinity Math\n\n## 1. Linear Transformation\nWe convert the hyperbolic ligand binding curve into a linear equation to find targets affinity parameters:\n[Bound]/[Free] = - (1/Kd) * [Bound] + (Bmax/Kd)\n\n### Extraction of Parameters:\n- **X-intercept** is equal to Bmax (total active target receptors).\n- **Slope** is equal to -1 / Kd (dissociation affinity constant)."
  },
  {
    id: "note-9",
    title: "Recent FDA Drug Approvals (Q1 2026): Mechanism of Actions",
    size: "1.1 MB",
    type: "PDF",
    description: "Clinical updates detailing new drug approvals in cardiovascular care, targeted monoclonal therapies, and gene editing medications.",
    content: "# FDA New Treatment Approvals (Q1 2026)\n\n## 1. Cardioprotective Antibody (Cardiomab-Z3)\n- **Class:** Humanized Monoclonal Antibody.\n- **Mechanism:** Selectively binds and traps extracellular IL-18 during ischemic acute inflammation, reducing scarring on cardiac muscles.\n\n## 2. Diabetes formulation (Glucovas-Oral)\n- **Class:** Co-formulation GLP-1/SGLT2 agent.\n- **Mechanism:** Combines oral absorption-enhanced Semaglutide with Empagliflozin, providing synergistic glucose clearance and fat oxidation."
  },
  {
    id: "note-10",
    title: "Standard Operating Procedures for Preclinical Toxicity Testing",
    size: "5.0 MB",
    type: "PDF",
    description: "Full regulatory safety guidelines containing OECD protocols for acute, sub-acute, chronic oral toxicity studies in animal guidelines.",
    content: "# OECD Preclinical Toxicity Guideline SOP\n\n## 1. Acute Oral Toxicity (OECD Guideline 423)\n- Limit test dose: 2000 mg/kg body weight.\n- Administered to three rodent test subjects.\n- Monitored continuously for first 24 hours, and daily lookups for 14 continuous days.\n- Track parameters: hair posture changes, body tremors, weight trends, and behavioral state changes."
  }
];

// Biography timeline milestones
export const timelineData: TimelineMilestone[] = [
  {
    year: "2013",
    title: "Bachelor of Pharmacy (B.Pharm) - First Class Honours",
    institution: "University Institute of Pharmaceutical Sciences",
    description: "Graduated with dual excellence in pharmacognosy and medicinal chemistry. Conducted undergraduate research on extraction of anti-oxidant flavonoids from domestic spices.",
    achievementType: "education"
  },
  {
    year: "2015",
    title: "Master of Pharmacy (M.Pharm) in Pharmacology",
    institution: "National College of Pharmaceutical Research",
    description: "Completed postgraduate thesis on 'Anti-ulcer and Gastroprotective Activities of Organic Herb Extracts in Animal Models', under peer-reviewed guidance.",
    achievementType: "education"
  },
  {
    year: "2016",
    title: "Senior Research Fellow & Pharmaceutical Analyst",
    institution: "Apex Advanced Toxicology Laboratory",
    description: "Spearheaded molecular screening protocols for hepatoprotective and nephroprotective drugs. Validated over 30 reverse-phase HPLC methods for generic formulations.",
    achievementType: "research"
  },
  {
    year: "2019",
    title: "Young Scientist Award in Pharmacology",
    institution: "International Society of Phytophysiology",
    description: "Awarded outstanding young scientist for novel research investigating synergistic anti-inflammatory impacts of Boswellia and Curcumin extracts in rat models.",
    achievementType: "award"
  },
  {
    year: "2021",
    title: "Doctor of Philosophy (Ph.D.) in Pharmacology & Pharmacokinetics",
    institution: "Central Science University",
    description: "Defended doctoral thesis on 'Targeted Liposomal Nanoparticles Conjugated with Active Biotins for Localized Ovarian Cancer Therapy', leading to 3 international patent filings.",
    achievementType: "education"
  },
  {
    year: "2022",
    title: "Assistant Professor & Principal Investigator",
    institution: "Department of Pharmacology, State Medical Academy",
    description: "Established the Preclinical Drug Screening and Molecular Nanomedicine Research Laboratory. Acquired state funds to investigate metabolic enzyme pathways of bioflavonoids.",
    achievementType: "research"
  },
  {
    year: "2024",
    title: "Chief Researcher & Associate Editor",
    institution: "Global Journal of Advanced Pharmacophysics",
    description: "Invited reviewer of drug toxicity publications and coordinator of the national academic committee on safety of Nano-formulated anti-cancer agents.",
    achievementType: "publication"
  },
  {
    year: "2026",
    title: "Senior Pharmacology Expert & Board Member",
    institution: "Research Institute of Pharmacological Sciences",
    description: "Coordinating clinical trials of bioavailable plant formulations for osteoarthritic disorders. Continuing teaching and mentorship of young pharmacology students.",
    achievementType: "research"
  }
];
