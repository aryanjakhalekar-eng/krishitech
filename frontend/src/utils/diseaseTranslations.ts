/**
 * Display Translation Layer for KrishiRakshak AI
 *
 * Translates technical AI predictions, crop names, severity metrics, and
 * stepped IPM advisories into farmer-friendly rural Marathi for Maharashtra farmers,
 * while preserving internal English model codes and backend API responses.
 */

export interface LocalizedDiseaseInfo {
  name: string;
  category: string;
  tag: string;
  summary: string;
}

export interface LocalizedAdvisory {
  cultural: string;
  biological: string;
  chemical: string;
  safety: string;
}

// ── Crop Names ─────────────────────────────────────────────────────────────
export const cropNames: Record<string, { en: string; mr: string; icon: string }> = {
  Tomato: { en: 'Tomato', mr: 'टोमॅटो (Tomato)', icon: '🍅' },
  Rice: { en: 'Rice', mr: 'भात / धान (Rice)', icon: '🌾' },
  Soybean: { en: 'Soybean', mr: 'सोयाबीन (Soybean)', icon: '🌱' },
  Grape: { en: 'Grape', mr: 'द्राक्ष (Grape)', icon: '🍇' },
};

export const getLocalizedCrop = (crop: string, lang: string = 'en'): string => {
  const norm = Object.keys(cropNames).find(c => c.toLowerCase() === (crop || '').toLowerCase());
  if (norm) {
    return lang === 'mr' ? cropNames[norm].mr : cropNames[norm].en;
  }
  return crop;
};

// ── Disease Display Translations ──────────────────────────────────────────
export const diseaseTranslations: Record<string, { en: LocalizedDiseaseInfo; mr: LocalizedDiseaseInfo }> = {
  // Tomato
  'Tomato_Early Blight': {
    en: {
      name: 'Tomato Early Blight',
      category: 'Fungal Disease',
      tag: 'Early Blight (Alternaria solani)',
      summary: 'Fungal leaf spot causing concentric ring lesions and premature leaf drop.'
    },
    mr: {
      name: 'टोमॅटोवरील अर्ली ब्लाइट रोग (Early Blight)',
      category: 'बुरशीजन्य रोग (Fungal)',
      tag: 'अल्टरनेरिया करपा (Alternaria solani)',
      summary: 'पानांवर तपकिरी-काळे गोलाकार चकतीसारखे ठिपके पडतात व पाने सुकतात.'
    }
  },
  'Tomato_Late Blight': {
    en: {
      name: 'Tomato Late Blight',
      category: 'Water Mold (Oomycete)',
      tag: 'Late Blight (Phytophthora infestans)',
      summary: 'Aggressive water-soaked dark patches that rapidly blacken leaves and stems in humid weather.'
    },
    mr: {
      name: 'टोमॅटोवरील लेट ब्लाइट रोग (Late Blight)',
      category: 'पाणीयुक्त करपा (Oomycete)',
      tag: 'लेट ब्लाइट तांबेरा (Phytophthora infestans)',
      summary: 'ओलसर ढगाळ हवेत पानांवर जलद पसरणारे काळपट डाग, खोड व फळे काळी पडतात.'
    }
  },
  'Tomato_Bacterial Spot': {
    en: {
      name: 'Tomato Bacterial Spot',
      category: 'Bacterial Disease',
      tag: 'Bacterial Spot (Xanthomonas)',
      summary: 'Small, water-soaked dark angular spots that coalesce and cause severe leaf yellowing.'
    },
    mr: {
      name: 'टोमॅटोवरील जिवाणूजन्य ठिपके (Bacterial Spot)',
      category: 'जिवाणूजन्य रोग (Bacterial)',
      tag: 'झँथोमोनास ठिपके (Xanthomonas)',
      summary: 'पानांवर बारीक काळसर ठिपके पडतात, पाने पिवळी पडून गळतात.'
    }
  },
  'Tomato_Leaf Mold': {
    en: {
      name: 'Tomato Leaf Mold',
      category: 'Fungal Disease',
      tag: 'Leaf Mold (Passalora fulva)',
      summary: 'Pale green/yellow spots on upper surface with olive-green velvety mold on undersides.'
    },
    mr: {
      name: 'टोमॅटोवरील पानांची बुरशी (Leaf Mold)',
      category: 'बुरशीजन्य रोग (Fungal)',
      tag: 'पानावरील बुरशी (Passalora fulva)',
      summary: 'पानाच्या वर पिवळे ठिपके आणि खाली मखमली ऑलिव्ह-हिरवी बुरशी तयार होते.'
    }
  },
  'Tomato_Healthy Crop': {
    en: {
      name: 'Healthy Tomato Crop',
      category: 'Healthy',
      tag: 'No Disease Detected',
      summary: 'Crop foliage is vibrant, disease-free, and growing normally.'
    },
    mr: {
      name: 'टोमॅटोचे पीक निरोगी आहे (Healthy Crop)',
      category: 'निरोगी पीक',
      tag: 'कोणताही रोग आढळला नाही',
      summary: 'पिकाची पाने टवटवीत असून कोणतीही रोगाची लक्षणे नाहीत.'
    }
  },

  // Rice
  'Rice_Leaf Blast': {
    en: {
      name: 'Rice Leaf Blast',
      category: 'Fungal Disease',
      tag: 'Blast (Magnaporthe oryzae)',
      summary: 'Spindle-shaped diamond lesions with grayish centers and brown borders on paddy leaves.'
    },
    mr: {
      name: 'भातावरील पानांचा करपा रोग (Rice Blast)',
      category: 'बुरशीजन्य रोग (Fungal)',
      tag: 'ब्लास्ट करपा (Magnaporthe oryzae)',
      summary: 'भाताच्या पात्यांवर डोळ्यासारखे किंवा बदामाच्या आकाराचे करपलेले ठिपके दिसतात.'
    }
  },
  'Rice_Brown Spot': {
    en: {
      name: 'Rice Brown Spot',
      category: 'Fungal Disease',
      tag: 'Brown Spot (Bipolaris oryzae)',
      summary: 'Oval to circular brown spots with yellow halos, common under low soil fertility.'
    },
    mr: {
      name: 'भातावरील तपकिरी ठिपके (Brown Spot)',
      category: 'बुरशीजन्य रोग (Fungal)',
      tag: 'तपकिरी ठिपके रोग (Bipolaris oryzae)',
      summary: 'पानांवर गोलाकार किंवा लंबगोलाकार तपकिरी रंगाचे डाग पडतात.'
    }
  },
  'Rice_Bacterial Leaf Blight': {
    en: {
      name: 'Rice Bacterial Leaf Blight',
      category: 'Bacterial Disease',
      tag: 'Bacterial Blight (Xanthomonas oryzae)',
      summary: 'Water-soaked translucent stripes turning yellow-white along the leaf margins.'
    },
    mr: {
      name: 'भातावरील जिवाणू करपा (Bacterial Leaf Blight)',
      category: 'जिवाणूजन्य रोग (Bacterial)',
      tag: 'जिवाणू करपा (Xanthomonas oryzae)',
      summary: 'पात्यांच्या कडा पिवळ्या-पांढऱ्या पडून सुकतात आणि पाने करपल्यासारखी दिसतात.'
    }
  },
  'Rice_Tungro': {
    en: {
      name: 'Rice Tungro Virus Disease',
      category: 'Viral Disease',
      tag: 'Tungro Virus (RTV)',
      summary: 'Leaf discoloration turning yellow-orange, stunted plant growth transmitted by green leafhoppers.'
    },
    mr: {
      name: 'भातावरील टुंग्रो विषाणू रोग (Tungro Virus)',
      category: 'विषाणूजन्य रोग (Viral)',
      tag: 'टुंग्रो रोग (Tungro Virus)',
      summary: 'हिरव्या तुडतुड्यांमुळे पसरतो, पात्यांचा रंग पिवळसर-नारिंगी होतो व पिकाची वाढ खुंटते.'
    }
  },
  'Rice_Healthy Crop': {
    en: {
      name: 'Healthy Rice Crop',
      category: 'Healthy',
      tag: 'No Disease Detected',
      summary: 'Paddy foliage is lush green, disease-free, and tillering well.'
    },
    mr: {
      name: 'भाताचे पीक निरोगी आहे (Healthy Crop)',
      category: 'निरोगी पीक',
      tag: 'कोणताही रोग आढळला नाही',
      summary: 'भाताची पाने हिरवीगार असून फुटवे व्यवस्थित निघत आहेत.'
    }
  },

  // Grape
  'Grape_Black Rot': {
    en: {
      name: 'Grape Black Rot',
      category: 'Fungal Disease',
      tag: 'Black Rot (Guignardia bidwellii)',
      summary: 'Reddish-brown circular leaf lesions and shriveled black mummified berries.'
    },
    mr: {
      name: 'द्राक्षावरील काळा कुजवा (Black Rot)',
      category: 'बुरशीजन्य रोग (Fungal)',
      tag: 'काळा कुजवा (Black Rot)',
      summary: 'पानांवर लालसर तपकिरी डाग पडतात आणि द्राक्षाचे मणी काळे पडून सुकून जातात.'
    }
  },
  'Grape_Esca (Black Measles)': {
    en: {
      name: 'Grape Esca (Black Measles)',
      category: 'Vascular Fungal Complex',
      tag: 'Esca / Black Measles',
      summary: 'Tiger-stripe interveinal leaf scorch pattern and dark spots on berries.'
    },
    mr: {
      name: 'द्राक्षावरील एस्का रोग (Black Measles)',
      category: 'बुरशीजन्य खोडकूज (Fungal)',
      tag: 'एस्का / वाघासारखे पट्टे (Esca)',
      summary: 'पानांच्या शिरांमध्ये पिवळे-तपकिरी वाघाच्या पट्ट्यांसारखे चट्टे उमटतात.'
    }
  },
  'Grape_Leaf Blight': {
    en: {
      name: 'Grape Leaf Blight',
      category: 'Fungal Disease',
      tag: 'Leaf Blight (Pseudocercospora vitis)',
      summary: 'Irregular dark necrotic angular spots causing premature foliage drying and drop.'
    },
    mr: {
      name: 'द्राक्षावरील पानांचा करपा (Grape Leaf Blight)',
      category: 'बुरशीजन्य रोग (Fungal)',
      tag: 'पानाचा करपा (Leaf Blight)',
      summary: 'पानांवर अनियमित काळे-तपकिरी ठिपके पडून पाने अकाली वाळतात.'
    }
  },
  'Grape_Healthy Crop': {
    en: {
      name: 'Healthy Grape Vine',
      category: 'Healthy',
      tag: 'No Disease Detected',
      summary: 'Vine leaves and canopy are robust, well-aerated, and healthy.'
    },
    mr: {
      name: 'द्राक्षाची बाग निरोगी आहे (Healthy Crop)',
      category: 'निरोगी बाग',
      tag: 'कोणताही रोग आढळला नाही',
      summary: 'वेलीची पाने हिरवी, निरोगी व जोमदार आहेत.'
    }
  },

  // Soybean
  'Soybean_Healthy Crop': {
    en: {
      name: 'Healthy Soybean Crop',
      category: 'Healthy',
      tag: 'No Disease Detected',
      summary: 'Soybean foliage is vigorous, disease-free, and developing pods normally.'
    },
    mr: {
      name: 'सोयाबीनचे पीक निरोगी आहे (Healthy Crop)',
      category: 'निरोगी पीक',
      tag: 'कोणताही रोग आढळला नाही',
      summary: 'सोयाबीनची पाने हिरवीगार असून पीक जोमदार आहे.'
    }
  },
};

export const getLocalizedDisease = (crop: string = '', disease: string = '', lang: string = 'en'): string => {
  const cleanCrop = (crop || '').trim();
  const cleanDisease = (disease || '').trim();
  const fullKey = `${cleanCrop}_${cleanDisease}`;

  for (const [key, val] of Object.entries(diseaseTranslations)) {
    if (key.toLowerCase() === fullKey.toLowerCase()) {
      return lang === 'mr' ? val.mr.name : val.en.name;
    }
  }

  for (const [key, val] of Object.entries(diseaseTranslations)) {
    if (key.toLowerCase().endsWith(cleanDisease.toLowerCase())) {
      return lang === 'mr' ? val.mr.name : val.en.name;
    }
  }

  if (cleanDisease.toLowerCase().includes('healthy')) {
    return lang === 'mr' ? 'निरोगी पीक (Healthy Crop)' : 'Healthy Crop';
  }

  return cleanDisease;
};

export const getLocalizedDiseaseInfo = (crop: string = '', disease: string = '', lang: string = 'en'): LocalizedDiseaseInfo => {
  const cleanCrop = (crop || '').trim();
  const cleanDisease = (disease || '').trim();
  const fullKey = `${cleanCrop}_${cleanDisease}`;

  for (const [key, val] of Object.entries(diseaseTranslations)) {
    if (key.toLowerCase() === fullKey.toLowerCase()) {
      return lang === 'mr' ? val.mr : val.en;
    }
  }

  for (const [key, val] of Object.entries(diseaseTranslations)) {
    if (key.toLowerCase().endsWith(cleanDisease.toLowerCase())) {
      return lang === 'mr' ? val.mr : val.en;
    }
  }

  if (cleanDisease.toLowerCase().includes('healthy')) {
    return lang === 'mr'
      ? { name: 'निरोगी पीक (Healthy Crop)', category: 'निरोगी', tag: 'कोणताही रोग नाही', summary: 'पीक निरोगी आहे.' }
      : { name: 'Healthy Crop', category: 'Healthy', tag: 'No Disease Detected', summary: 'Crop foliage is healthy.' };
  }

  return {
    name: cleanDisease,
    category: lang === 'mr' ? 'पिकाचा रोग (Crop Disease)' : 'Crop Disease',
    tag: cleanDisease,
    summary: lang === 'mr' ? 'शेतात तपासणी करून कृषी तज्ज्ञांचा सल्ला घ्या.' : 'Inspect field and consult local extension officer.'
  };
};

export const getLocalizedAdvisory = (
  crop: string,
  disease: string,
  originalAdvisory?: any,
  lang: string = 'en'
): LocalizedAdvisory => {
  if (lang !== 'mr') {
    return {
      cultural: originalAdvisory?.cultural_control || 'Inspect crop regularly, remove diseased leaves, and ensure good field drainage.',
      biological: originalAdvisory?.biological_control || 'Apply bio-fungicides like Trichoderma or Neem Seed Kernel Extract (NSKE 5%).',
      chemical: originalAdvisory?.approved_chemical_control || 'Consult local Agricultural Extension Officer or Gram Sevak for CIB approved dosage.',
      safety: originalAdvisory?.safety_warning || 'Always wear protective mask, gloves, and follow label pre-harvest safety interval.'
    };
  }

  const d = (disease || '').toLowerCase();
  const c = (crop || '').toLowerCase();

  // Healthy Crop
  if (d.includes('healthy')) {
    return {
      cultural: 'पिकाची दर आठवड्याला नियमित पाहणी करा. योग्य खत व पाण्याचे वेळेवर व्यवस्थापन ठेवा. शेतात तण वाढू देऊ नका.',
      biological: 'जमिनीची सुपीकता टिकवण्यासाठी शेणखत किंवा सेंद्रिय गांडूळ खत वापरा. ट्रायकोडर्माचा वापर जमिनीतून करा.',
      chemical: 'कोणत्याही रासायनिक औषधांची फवारणी करण्याची अजिबात गरज नाही. तुमचे पीक निरोगी आहे.',
      safety: 'पिकाची दर ४-५ दिवसांनी नियमित पाहणी करा. अनावश्यक कीटकनाशके फवारून खर्च करू नका.'
    };
  }

  // Tomato Early Blight
  if (c.includes('tomato') && d.includes('early')) {
    return {
      cultural: '१. रोगट व पिवळी पडलेली खालची पाने खुडून शेताबाहेर खड्ड्यात गाडा किंवा जाळा.\n२. झाडांना बांबूच्या काठीने आधार द्या (Staking).\n३. झाडाच्या बुंध्याजवळ पाणी साचू देऊ नका.',
      biological: 'ट्रायकोडर्मा व्हिरिडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर किंवा ५% निंबोळी अर्क (NSKE) फवारा.',
      chemical: 'मॅन्कोझेब ७५% WP २.५ ग्रॅम प्रति लिटर किंवा क्लोरोथॅलोनिल ७५% WP २.० ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.',
      safety: 'फवारणी करताना तोंडाला मास्क व हातमोजे वापरा. फवारणीनंतर ७ दिवस टोमॅटो तोडू नका (Pre-Harvest Interval).'
    };
  }

  // Tomato Late Blight
  if (c.includes('tomato') && d.includes('late')) {
    return {
      cultural: '१. ढगाळ व दमट हवामानात त्वरित शेताची पाहणी करा.\n२. रोगट झाडे व पाने तत्काळ शेतातून काढून नष्ट करा.\n३. अतिरिक्त नायट्रोजन (युरिया) देणे टाळा.',
      biological: 'स्यूडोमोनास फ्लुओरेसेन्स (Pseudomonas fluorescens) १० ग्रॅम प्रति लिटर पाण्यात मिसळून पानांवर फवारा.',
      chemical: 'सायमोक्सॅनिल ८% + मॅन्कोझेब ६४% WP २.० ग्रॅम प्रति लिटर किंवा मेटॅलॅक्सिल ८% + मॅन्कोझेब ६४% २.५ ग्रॅम/लिटर फवारा.',
      safety: 'रोग वेगाने पसरत असल्यास त्वरित फवारणी करा. फवारणीनंतर १० दिवस तोडणी करू नका. वारा वाहत असलेल्या दिशेने फवारणी करू नका.'
    };
  }

  // Tomato Bacterial Spot
  if (c.includes('tomato') && d.includes('bacterial')) {
    return {
      cultural: '१. रोपांची लागवड करताना निरोगी बियाणे वापरा.\n२. झाडांवर जास्त पाणी फवारू नका (ठिबक सिंचनाचा वापर करा).\n३. शेतातील तण त्वरित काढा.',
      biological: 'स्यूडोमोनास फ्लुओरेसेन्स १० ग्रॅम/लिटर किंवा बॅसिलस सबटिलिस ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.',
      chemical: 'कॉपर ऑक्सिक्लोराईड ५०% WP २.५ ग्रॅम + स्ट्रेप्टोसायक्लिन ०.१ ग्रॅम (१ ग्रॅम प्रति १० लिटर पाणी) फवारा.',
      safety: 'दुपारच्या कडक उन्हात कॉपरची फवारणी टाळा. डोळे आणि त्वचेचे रक्षण करण्यासाठी सुरक्षा चष्मा वापरा.'
    };
  }

  // Tomato Leaf Mold
  if (c.includes('tomato') && d.includes('mold')) {
    return {
      cultural: '१. झाडांमधील हवा खेळती राहण्यासाठी खालची दाट पाने काढा.\n२. शेतातील पाण्याचा निचरा व्यवस्थित करा.',
      biological: 'बॅसिलस सबटिलिस ५ ग्रॅम प्रति लिटर पाण्यात मिसळून पानांच्या खालच्या बाजूला फवारा.',
      chemical: 'डिफेनोकोनाझोल २५% EC ०.५ मिली प्रति लिटर किंवा कॉपर हायड्रॉक्साईड ५३.८% DF २.० ग्रॅम प्रति लिटर फवारा.',
      safety: 'पानांच्या खालच्या बाजूला जिथे बुरशी असते तिथे औषध व्यवस्थित पोहोचेल याची खात्री करा.'
    };
  }

  // Rice Leaf Blast
  if (c.includes('rice') && (d.includes('blast') || d.includes('करपा'))) {
    return {
      cultural: '१. शेतात सतत खोल पाणी साचवून ठेवू नका; वेळोवेळी पाणी काढून वाफसा येऊ द्या.\n२. युरिया खताचा अतिरेक टाळा (विभागून द्या).\n३. रोगाची लागण झालेली रोपे नष्ट करा.',
      biological: 'स्यूडोमोनास फ्लुओरेसेन्स १० ग्रॅम प्रति किलो बियाण्याला चोळा आणि ५ ग्रॅम/लिटर फवारा.',
      chemical: 'ट्रायसायक्लॅझोल ७५% WP (Tricyclazole) ०.६ ग्रॅम प्रति लिटर किंवा आयसोप्रॉथिओलेन ४०% EC १.५ मिली प्रति लिटर पाण्यात फवारा.',
      safety: 'फवारणी करताना तोंडावर मास्क वापरा. ज्वलनशील औषध असल्याने आगीपासून दूर ठेवा. १४ दिवस कापणी करू नका.'
    };
  }

  // Rice Brown Spot
  if (c.includes('rice') && d.includes('brown')) {
    return {
      cultural: '१. जमिनीत पालाश (Potash) आणि सेंद्रिय खतांचा संतुलित वापर करा.\n२. शेतात पाण्याची कमतरता भासू देऊ नका.',
      biological: 'ट्रायकोडर्मा व्हिरिडी ४ ग्रॅम प्रति किलो बियाण्याला बीजप्रक्रिया करा.',
      chemical: 'मॅन्कोझेब ७५% WP २.० ग्रॅम प्रति लिटर किंवा एडीफेनफॉस ५०% EC १.० मिली प्रति लिटर पाण्यात फवारा.',
      safety: 'वाऱ्याच्या उलट दिशेने फवारणी करू नका. फवारणीनंतर हात-पाय साबणाने स्वच्छ धुवा.'
    };
  }

  // Rice Bacterial Leaf Blight
  if (c.includes('rice') && d.includes('bacterial')) {
    return {
      cultural: '१. पुनर्लागवड करताना रोपांचे शेंडे कापू नका.\n२. शेतातून अतिरिक्त पाणी बाहेर काढून टाका.\n३. नत्र खतांचे प्रमाण कमी करा.',
      biological: 'शेणखताची २०% गाळलेली स्लरी किंवा स्यूडोमोनास ५ ग्रॅम प्रति लिटर फवारा.',
      chemical: 'कॉपर ऑक्सिक्लोराईड ५०% WP २.५ ग्रॅम + स्ट्रेप्टोसायक्लिन ०.१ ग्रॅम प्रति लिटर किंवा कासुगामायसीन ३% SL २.० मिली फवारा.',
      safety: 'कडक ऊन किंवा सोसाट्याचा वारा असताना फवारणी करू नका. १० दिवस जनावरांना शेतात चरू देऊ नका.'
    };
  }

  // Rice Tungro
  if (c.includes('rice') && d.includes('tungro')) {
    return {
      cultural: '१. हा रोग हिरव्या तुडतुड्यांमुळे पसरतो, त्यामुळे तुडतुड्यांचे नियंत्रण करा.\n२. आधीच्या पिकाचे अवशेष व धसकटे नष्ट करा.',
      biological: 'तुडतुड्यांचे नैसर्गिक शत्रू (कोळी, मिरिड बग) वाचवा. निंबोळी तेल (१५०० ppm) ५ मिली प्रति लिटर फवारा.',
      chemical: 'थायमेथॉक्झाम २५% WG ०.२ ग्रॅम किंवा डिनोटिफ्युरान २०% SG ०.४ ग्रॅम प्रति लिटर फवारा.',
      safety: 'तुडतुड्यांची लक्षणे दिसताच लवकर फवारणी करा. संरक्षणात्मक कपडे व मास्क वापरा.'
    };
  }

  // Grape Black Rot
  if (c.includes('grape') && d.includes('black')) {
    return {
      cultural: '१. छाटणी करताना सुकलेले व काळे पडलेले घड आणि वेलीचे भाग कापून नष्ट करा.\n२. घडात हवा खेळती राहण्यासाठी पानांची विरळणी करा.',
      biological: 'बॅसिलस सबटिलिस ५ ग्रॅम प्रति लिटर किंवा ट्रायकोडर्मा फवारणी करा.',
      chemical: 'मॅन्कोझेब ७५% WP २.५ ग्रॅम किंवा मायक्लोब्युटॅनिल १०% WP ०.४ ग्रॅम किंवा अझॉक्सीस्ट्रॉबिन २३% SC १.० मिली प्रति लिटर फवारा.',
      safety: 'द्राक्षाची काढणी करण्यापूर्वी किमान १४ दिवस आधी फवारणी बंद करा (PHI १४ दिवस).'
    };
  }

  // Grape Esca
  if (c.includes('grape') && d.includes('esca')) {
    return {
      cultural: '१. छाटणीची अवजारे ७०% अल्कोहोल किंवा डेटॉलने निर्जंतुक करा.\n२. छाटणीच्या ताज्या जखमांवर बोर्डो पेस्ट लावा.',
      biological: 'छाटणीनंतर त्वरित ट्रायकोडर्माची पेस्ट जखमांवर लावा.',
      chemical: 'थायोफॅनेट मिथाईल ७०% WP ची २० ग्रॅम प्रति लिटर पाण्यात पेस्ट तयार करून छाटलेल्या भागावर लावा.',
      safety: 'रोगट सुकलेली झाडे मुळासकट उपटून बागेबाहेर जाळून टाका.'
    };
  }

  // Grape Leaf Blight
  if (c.includes('grape') && d.includes('blight')) {
    return {
      cultural: '१. बागेतील पाण्याचा निचरा चांगला ठेवा. जमिनीलगतची पाने छाटा.\n२. बागेभोवती असलेले रानटी वेलींचे अवशेष काढा.',
      biological: 'स्यूडोमोनास फ्लुओरेसेन्स ५ ग्रॅम प्रति लिटर फवारा.',
      chemical: 'क्रेसॉक्झिम-मिथाईल ४४.३% SC ०.७ मिली किंवा कॉपर ऑक्सिक्लोराईड ५०% WP २.५ ग्रॅम प्रति लिटर फवारा.',
      safety: 'दुपारच्या ३२ अंश पेक्षा जास्त तापमानात कॉपर फवारू नका. १० दिवस सुरक्षा अंतर पाळा.'
    };
  }

  // Generic fallback
  return {
    cultural: 'पिकाची नियमित पाहणी करा. रोगट पाने काढून नष्ट करा. शेतात पाणी साचू देऊ नका.',
    biological: '५% निंबोळी अर्क (NSKE) किंवा ट्रायकोडर्माचा सेंद्रिय वापर करा.',
    chemical: 'स्थानिक कृषी सहायक (ग्रामसेवक) किंवा कृषी विज्ञान केंद्राच्या सल्ल्यानेच योग्य कीटकनाशकाची फवारणी करा.',
    safety: 'फवारणी करताना तोंडाला मास्क, हातमोजे व चष्मा अनिवार्यपणे वापरा.'
  };
};

export const getLocalizedSeverity = (level: string, lang: string = 'en'): string => {
  const l = (level || '').toUpperCase();
  if (lang === 'mr') {
    if (l === 'LOW' || l === 'MILD') return 'कमी धोका (Low)';
    if (l === 'MODERATE') return 'मध्यम धोका (Moderate)';
    if (l === 'HIGH' || l === 'SEVERE') return 'गंभीर / जास्त धोका (Severe)';
    return level;
  }
  return level;
};

export const getLocalizedSafetyGate = (action: string, lang: string = 'en') => {
  if (lang === 'mr') {
    if (action === 'AUTOMATED_ADVISORY') {
      return {
        badge: 'सुरक्षित सल्ला मंजूर',
        actionLabel: 'सुरक्षित सल्ला मंजूर',
        title: 'एआय सुरक्षा चाचणी: यशस्वी (PASSED)',
        message: 'प्रतिमेचा दर्जा व विश्वासार्हता उच्च असल्याने स्वयंचलित सुरक्षित कृषी सल्ला प्रदर्शित केला आहे.',
        color: 'emerald'
      };
    }
    if (action === 'HUMAN_ESCALATION') {
      return {
        badge: 'कृषी अधिकाऱ्यांकडे वर्ग',
        actionLabel: 'कृषी अधिकाऱ्यांकडे वर्ग',
        title: 'तज्ज्ञांची पडताळणी आवश्यक (Human Review)',
        message: 'या पिकाची केस आपल्या स्थानिक कृषी सहाय्यकांकडे (ग्रामसेवक) पडताळणीसाठी पाठवली आहे.',
        color: 'amber'
      };
    }
    return {
      badge: 'पुन्हा फोटो काढा',
      actionLabel: 'पुन्हा फोटो काढा',
      title: 'अस्पष्ट फोटो (Retake Required)',
      message: 'फोटो अंधुक किंवा अस्पष्ट असल्याने कृपया पानाचा स्वच्छ व जवळून फोटो पुन्हा काढा.',
      color: 'red'
    };
  }

  if (action === 'AUTOMATED_ADVISORY') {
    return {
      badge: 'PASSED',
      actionLabel: 'PASSED',
      title: 'AI Safety Gate: PASSED',
      message: 'Automated advisory released. High image quality and AI confidence verified.',
      color: 'emerald'
    };
  }
  if (action === 'HUMAN_ESCALATION') {
    return {
      badge: 'HUMAN ESCALATION',
      actionLabel: 'HUMAN ESCALATION',
      title: 'Human Officer Review Required',
      message: 'Case escalated to local Agricultural Extension Officer for manual validation.',
      color: 'amber'
    };
  }
  return {
    badge: 'RETRY REQUIRED',
    actionLabel: 'RETRY REQUIRED',
    title: 'Image Quality Retake Required',
    message: 'The leaf photograph was blurry or poorly lit. Please retake a clear photo.',
    color: 'red'
  };
};
