export interface PactAudioProfile {
  id: string;
  name: string;
  soundName: string;
  soundDescription: string;
  spokenPrompt: string;
  resurgenceQuote: string;
  badgeColor: string;
}

export const PACT_AUDIO_PROFILES: Record<string, PactAudioProfile> = {
  pact_alcohol: {
    id: 'pact_alcohol',
    name: 'Cero Alcohol & Cerveza',
    soundName: 'Lucidez Cristalina',
    soundDescription: 'Turbulencia etílica amortiguada seguida de campanas armónicas de claridad mental',
    spokenPrompt: 'Efecto registrado. La lucidez es el mayor poder de un Monarca. ¡Despeja la niebla y recupera tu dominio!',
    resurgenceQuote: '«La verdadera fuerza del cazador reside en una mente fría e inquebrantable. Que este trago amargo te recuerde quién tiene el control.»',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
  },
  pact_smoke: {
    id: 'pact_smoke',
    name: 'Cero Tabaco & Vapeo',
    soundName: 'Segundo Aire Vital',
    soundDescription: 'Silbido sibilante disipado por una oleada de aire puro y cuerda expansiva',
    spokenPrompt: 'Niebla disipada. Llena tus pulmones de aire puro. Tu vitalidad no se vende por humo.',
    resurgenceQuote: '«Un tropiezo no quema tus pulmones si decides que termina aquí. Respira hondo: tu resistencia sigue viva.»',
    badgeColor: 'text-slate-300 border-slate-500/30 bg-slate-900/40',
  },
  pact_soda: {
    id: 'pact_soda',
    name: 'Cero Refresco',
    soundName: 'Manantial Purificador',
    soundDescription: 'Efervescencia corrosiva disuelta en gotas cristalinas de agua pura de manantial',
    spokenPrompt: 'Toxina registrada. Tu cuerpo es tu templo de combate. Bebe agua pura y renueva tus células.',
    resurgenceQuote: '«La sed de un cazador se sacia con disciplina, no con azúcar líquida. Límpiate por dentro y sigue adelante.»',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30',
  },
  pact_sugar: {
    id: 'pact_sugar',
    name: 'Cero Azúcar & Golosinas',
    soundName: 'Voluntad de Acero',
    soundDescription: 'Colapso de glucosa transformado en marcha rítmica de energía estable',
    spokenPrompt: 'Pico de azúcar detectado. La gratificación rápida es una ilusión; tu recompensa es la maestría.',
    resurgenceQuote: '«El placer pasajero dura segundos; el orgullo de superarlo dura toda la vida. Continúa firme.»',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-950/30',
  },
  pact_junk_food: {
    id: 'pact_junk_food',
    name: 'Cero Comida Chatarra',
    soundName: 'Forja del Guerrero',
    soundDescription: 'Impacto pesado disuelto por resonancia metálica de energía limpia y combustible de campeón',
    spokenPrompt: 'Digestión pesada, pero espíritu ágil. Tu próxima comida será combustible de campeón.',
    resurgenceQuote: '«Una mala elección no arruina una jornada si la siguiente es digna de un cazador de rango S.»',
    badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-950/30',
  },
  pact_doomscroll: {
    id: 'pact_doomscroll',
    name: 'Cero Doomscrolling',
    soundName: 'Reconexión Neural',
    soundDescription: 'Glitch digital estático cortado por un pulso ascendente de enfoque en el mundo real',
    spokenPrompt: 'Interferencia cortada. Sal de la pantalla; tu verdadera vida se conquista en el mundo real.',
    resurgenceQuote: '«El abismo digital busca espectadores; tú eres el protagonista de tu propia leyenda. Guarda el móvil y avanza.»',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30',
  },
  pact_sleep: {
    id: 'pact_sleep',
    name: 'Cero Desvelarse',
    soundName: 'Descanso del Monarca',
    soundDescription: 'Tic-tac nocturno disuelto en una aurora cálida de regeneración y reposo profundo',
    spokenPrompt: 'Cansancio registrado. El descanso no es debilidad, es la recarga del poder. Duerme temprano y despierta imparable.',
    resurgenceQuote: '«Incluso los Monarcas necesitan reposar para desatar su mayor poder al amanecer. Cierra el día con honra.»',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-950/30',
  },
};

export const DEFAULT_PACT_PROFILE: PactAudioProfile = {
  id: 'custom',
  name: 'Pacto Personalizado',
  soundName: 'Resurgir del Fénix',
  soundDescription: 'Ruptura de juramento seguida del arpegio triunfal de resurgimiento',
  spokenPrompt: 'Pacto registrado. Un Monarca tropieza, pero su voluntad es inquebrantable. ¡Ponte de pie!',
  resurgenceQuote: '«Una caída no define tu rango; lo que define a un Monarca es levantarse de inmediato sin dudar.»',
  badgeColor: 'text-red-400 border-red-500/30 bg-red-950/30',
};

export function getPactAudioProfile(pactId?: string): PactAudioProfile {
  if (!pactId) return DEFAULT_PACT_PROFILE;
  return PACT_AUDIO_PROFILES[pactId] || DEFAULT_PACT_PROFILE;
}
