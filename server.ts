import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import OpenAI from 'openai';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize NVIDIA client safely
const getNvidiaClient = () => {
  const apiKey = process.env.NVIDIA_API_KEY || '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';
  return new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: apiKey,
  });
};

// API: AI Quest Generator & System Oracle Analysis
app.post('/api/ai/generate-quest', async (req, res) => {
  try {
    const { hunterName, rank, level, goalDescription, attributeTarget, difficulty, autonomous, category } = req.body;

    const client = getNvidiaClient();

    let prompt = '';
    if (autonomous || !goalDescription) {
      prompt = `Actúa como la fría, autoritaria e implacable interfaz del 'SISTEMA' de Solo Leveling (The System / Arquitecto de las Sombras).
Tu tarea es INVENTAR COMPLETAMENTE desde cero una Misión de Entrenamiento del Sistema para el cazador, sin que el usuario tenga que darte una idea previa.

Datos del Cazador:
- Nombre: ${hunterName || 'Sung Jin-Woo'}
- Rango Actual: Rango ${rank || 'E'}
- Nivel: ${level || 1}
- Categoría/Área sugerida: ${category || 'aleatorio'} (físico, intelecto/estudio, disciplina/hábitos, mindfulness/mente, salud/hidratación)
- Dificultad: ${difficulty || 'Normal'}

INVENTA una prueba o hábito de la vida real inspirada en el entrenamiento del Monarca de las Sombras (ejemplos: series físicas estrictas, desconexión de dopamina/pantallas, lectura densa de sabiduría, baño de agua fría, ayuno/hidratación pura de maná, organización del santuario, sesión de foco implacable).

Responde ÚNICAMENTE con un JSON válido que tenga esta estructura exacta (sin markdown adicional fuera del JSON):
{
  "title": "Título épico del Sistema (ej: [Misión Diaria del Sistema: Purificación del Templo Interior])",
  "description": "Descripción autoritaria del Sistema con lore de Solo Leveling y la directiva de la vida real.",
  "targetCount": 20,
  "unit": "minutos / páginas / repeticiones / litros",
  "attributeReward": "STR",
  "category": "fitness",
  "xpReward": 950,
  "goldReward": 1600,
  "essenceReward": 15,
  "systemMessage": "Una advertencia corta y fría del Sistema (ej: 'El dolor es temporal. El estancamiento es eterno. Cumple o enfrenta la penalización.')."
}`;
    } else {
      prompt = `Actúa como la fría, autoritaria y majestuosa interfaz del 'SISTEMA' de Solo Leveling (The System / Arquitecto de las Sombras).
Un cazador humano te ha presentado su meta u objetivo de la vida real: "${goalDescription}".

Datos del Cazador:
- Nombre: ${hunterName || 'Sung Jin-Woo'}
- Rango Actual: Rango ${rank || 'E'}
- Nivel: ${level || 1}
- Atributo Deseado: ${attributeTarget || 'STR'}
- Dificultad solicitada: ${difficulty || 'Normal'}

Genera una Misión Diaria u Opcional inmersiva con formato Solo Leveling.
Responde ÚNICAMENTE con un JSON válido que tenga esta estructura exacta (sin markdown adicional fuera del JSON):
{
  "title": "Título épico de la misión (ej: [Misión Diaria: Templanza del Monarca])",
  "description": "Breve descripción autoritaria del Sistema explicando el propósito y la advertencia de no fallar.",
  "targetCount": 10,
  "unit": "páginas / minutos / repeticiones / litros",
  "attributeReward": "${attributeTarget || 'STR'}",
  "category": "habit",
  "xpReward": 850,
  "goldReward": 1500,
  "essenceReward": 15,
  "systemMessage": "Una frase corta del Sistema con advertencia ceremonial o motivación sombría."
}`;
    }

    const completion = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 2048,
    });

    const rawContent = completion.choices[0]?.message?.content || '';
    
    // Clean JSON response if wrapped in codeblocks
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, quest: parsed });
    } catch (parseErr) {
      const fallbackTitle = autonomous 
        ? '[Misión del Sistema: Forja de Resistencia Sombría]' 
        : `[Misión Diaria: ${(goalDescription || 'Protocolo').slice(0, 30)}]`;
      return res.json({
        success: true,
        quest: {
          title: fallbackTitle,
          description: autonomous 
            ? 'El Sistema ha detectado margen de crecimiento. Completa 30 minutos de trabajo profundo o actividad física sin distracciones.' 
            : `El Sistema ha evaluado tu solicitud: ${goalDescription}. Cumple el objetivo asignado sin vacilación.`,
          targetCount: 30,
          unit: 'minutos',
          attributeReward: attributeTarget || 'STR',
          category: 'discipline',
          xpReward: 1000,
          goldReward: 2000,
          essenceReward: 20,
          systemMessage: 'El Sistema no tolera la debilidad. Completa la prueba.',
        },
      });
    }
  } catch (error: any) {
    console.error('Error generating AI Quest with NVIDIA:', error);
    // Return fallback graceful quest
    return res.status(200).json({
      success: true,
      quest: {
        title: req.body.autonomous ? '[Misión de Entrenamiento: Marcha de la Sombra]' : `[Misión: ${req.body.goalDescription || 'Protocolo del Monarca'}]`,
        description: req.body.autonomous ? 'Supera 50 flexiones o 30 minutos de lectura profunda para templar tu voluntad.' : `El Sistema te impone esta prueba: ${req.body.goalDescription || 'Supera tus límites diarios'}.`,
        targetCount: 30,
        unit: req.body.autonomous ? 'minutos' : 'completado',
        attributeReward: req.body.attributeTarget || 'STR',
        category: 'fitness',
        xpReward: 900,
        goldReward: 1800,
        essenceReward: 15,
        systemMessage: "La disciplina forja al verdadero Monarca.",
      },
      fallback: true,
    });
  }
});

// API: AI Emergency Red Gate Quest Generator
app.post('/api/ai/emergency-quest', async (req, res) => {
  try {
    const { hunterName, rank, level } = req.body;
    const client = getNvidiaClient();

    const prompt = `Actúa como la voz de emergencia en rojo del SISTEMA de Solo Leveling.
[¡ALERTA MÁXIMA: HA SURGIDO UNA PUERTA ROJA DE EMERGENCIA / CALAMIDAD INESPERADA!]
Genera una Misión de Emergencia Sorpresa de alta tensión para el cazador ${hunterName || 'Sung Jin-Woo'} (Nivel ${level || 1}, Rango ${rank || 'E'}).

La misión debe ser un desafío rápido e intenso de la vida real (ej: 'Sprint de 15 minutos sin pestañas ni redes', '100 flexiones o sentadillas en tiempo récord', 'Organizar tu espacio de trabajo en 10 min', '10 min de respiración helada o estiramientos intensos').

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "title": "[EMERGENCIA: Asalto a la Puerta Roja]",
  "description": "Una perturbación de maná de alto rango requiere tu intervención inmediata. Vence la inercia antes de que la puerta se cierre.",
  "targetCount": 15,
  "unit": "minutos de enfoque / reps intensas",
  "attributeReward": "STR",
  "category": "special",
  "xpReward": 2500,
  "goldReward": 4500,
  "essenceReward": 35,
  "emergencyTimeLimitMinutes": 60,
  "systemMessage": "¡ADVERTENCIA: Si no completas esta misión dentro del plazo, serás transportado a la Zona de Penalización!"
}`;

    const completion = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      top_p: 0.95,
      max_tokens: 1024,
    });

    const rawContent = completion.choices[0]?.message?.content || '';
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, emergencyQuest: parsed });
    } catch {
      return res.json({
        success: true,
        emergencyQuest: {
          title: '[EMERGENCIA: Incursión de la Puerta Roja]',
          description: 'Una grieta dimensional de clase A ha aparecido en tu sector. Completa 20 minutos de trabajo ininterrumpido sin distracciones para cerrarla.',
          targetCount: 20,
          unit: 'minutos',
          attributeReward: 'INT',
          category: 'special',
          xpReward: 2400,
          goldReward: 4000,
          essenceReward: 30,
          emergencyTimeLimitMinutes: 60,
          systemMessage: '¡El Sistema exige tu máxima concentración! ¡No vaciles!',
        }
      });
    }
  } catch (err) {
    return res.json({
      success: true,
      emergencyQuest: {
        title: '[EMERGENCIA: Alerta de Puerta Roja]',
        description: 'Se ha detectado una sobrecarga de maná. Realiza 40 repeticiones físicas o 15 minutos de foco supremo inmediatamente.',
        targetCount: 15,
        unit: 'minutos',
        attributeReward: 'STR',
        category: 'special',
        xpReward: 2000,
        goldReward: 3500,
        essenceReward: 25,
        emergencyTimeLimitMinutes: 60,
        systemMessage: '¡Las sombras aguardan tu orden, Monarca!',
      },
      fallback: true,
    });
  }
});

// API: AI System Oracle Advice
app.post('/api/ai/oracle-advice', async (req, res) => {
  try {
    const { playerStats, currentStreak, topWeakness } = req.body;
    const client = getNvidiaClient();

    const prompt = `Eres la voz de inteligencia del SISTEMA de Solo Leveling.
El cazador solicita una evaluación de estado:
- Nivel: ${playerStats.level}
- Rango: ${playerStats.rank}
- Racha de días: ${currentStreak}
- Estadísticas: STR ${playerStats.str}, AGI ${playerStats.agi}, INT ${playerStats.int}, VIT ${playerStats.vit}, WIS ${playerStats.wis}
- Estado reportado: "${topWeakness || 'Buscando mayor disciplina'}"

Escribe un análisis breve, cortante, desafiante y táctico (máximo 3 párrafos cortos) con recomendaciones de entrenamiento del Sistema.
Formato: Texto directo sin rodeos.`;

    const completion = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 1024,
    });

    const advice = completion.choices[0]?.message?.content || 'El Sistema observa tu progreso. No te detengas.';
    return res.json({ success: true, advice });
  } catch (err) {
    return res.json({
      success: true,
      advice: 'El Sistema ha registrado tu energía. Concéntrate en incrementar tu Fuerza y disciplina diaria para despertar tu verdadero potencial como Monarca.',
      fallback: true,
    });
  }
});

// API: AI System Weekly Audit (Asociación de Cazadores)
app.post('/api/ai/weekly-audit', async (req, res) => {
  try {
    const { hunterName, rank, level, streakDays, attributes, questsCompletedCount, totalXp } = req.body;
    const client = getNvidiaClient();

    const prompt = `Actúa como la Comisión de Evaluación de la Asociación de Cazadores y el núcleo de inteligencia del SISTEMA de Solo Leveling.
Genera una AUDITORÍA SEMANAL OFICIAL DEL CAZADOR para evaluar su progreso hacia la maestría y formación de hábitos.

Datos del Cazador:
- Nombre: ${hunterName || 'Sung Jin-Woo'}
- Rango: ${rank || 'E-RANK'} (Nivel ${level || 1})
- Días de Racha Consecutiva: ${streakDays || 1}
- Misiones Completadas esta semana: ${questsCompletedCount || 0}
- XP Acumulada: ${totalXp || 0}
- Atributos Actuales: STR: ${attributes?.str?.value || 10}, INT: ${attributes?.int?.value || 10}, VIT: ${attributes?.vit?.value || 10}, AGI: ${attributes?.agi?.value || 10}, WIS: ${attributes?.wis?.value || 10}, CHA: ${attributes?.cha?.value || 10}

Evalúa al cazador y genera un informe estructurado.
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown adicional):
{
  "hunterRating": "S" (o SSS, SS, S, A, B, C, D según su rendimiento),
  "consistencyScore": 88 (número entero del 0 al 100 evaluando su consistencia),
  "dominantStat": "Fuerza / Disciplina",
  "laggingStat": "Sabiduría / Enfoque",
  "aiDiagnosticTitle": "DICTAMEN DEL SISTEMA: EVOLUCIÓN CONSTANTE HACIA EL MONARCA",
  "aiAnalysis": "2 o 3 oraciones densas con el tono autoritario y solemne de Solo Leveling analizando su rendimiento, balance de fuerza física vs intelectual y dominio del maná.",
  "aiRecommendations": [
    "Recomendación táctica 1 para la semana",
    "Recomendación táctica 2 para la semana",
    "Recomendación táctica 3 para la semana"
  ],
  "recommendedFocusCategory": "fitness" (o intellect, discipline, habit, mindfulness),
  "hunterAssociationSeal": "AUTORIZADO POR EL SISTEMA Y LA ASOCIACIÓN DE CAZADORES"
}`;

    const completion = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048,
    });

    const rawContent = completion.choices[0]?.message?.content || '';
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json({ success: true, report: parsed });
    } catch (parseErr) {
      return res.json({
        success: true,
        report: {
          hunterRating: streakDays > 7 ? 'S' : 'A',
          consistencyScore: Math.min(100, 70 + streakDays * 3),
          dominantStat: 'Fuerza & Resistencia',
          laggingStat: 'Sabiduría y Recuperación',
          aiDiagnosticTitle: 'DICTAMEN DEL SISTEMA: DESPERTAR CONTINUO',
          aiAnalysis: `El cazador ${hunterName} mantiene una trayectoria ascendente con una racha de ${streakDays} días. Su núcleo de maná se estabiliza, pero debe equilibrar la fuerza física con la claridad mental.`,
          aiRecommendations: [
            'Incrementa los bloques de trabajo profundo para balancear INT y WIS.',
            'Mantén la hidratación matutina antes de cualquier incursión física.',
            'Desafía a la Sombra Reflejo diariamente para medir tu incremento de poder.'
          ],
          recommendedFocusCategory: 'discipline',
          hunterAssociationSeal: 'CERTIFICACIÓN OFICIAL DE RANGO'
        }
      });
    }
  } catch (err) {
    return res.json({
      success: true,
      report: {
        hunterRating: 'A',
        consistencyScore: 85,
        dominantStat: 'Tenacidad',
        laggingStat: 'Enfoque Mental',
        aiDiagnosticTitle: 'DICTAMEN DE CONTINGENCIA DEL SISTEMA',
        aiAnalysis: 'Tus canales de maná muestran una actividad constante. Continúa ejecutando tus protocolos diarios para consolidar tu rango.',
        aiRecommendations: [
          'No omitas las sesiones de estiramiento y recuperación.',
          'Aumenta la lectura diaria en 10 páginas para nutrir tu atributo de Inteligencia.',
          'Conquista una mazmorra de concentración cada 48 horas.'
        ],
        recommendedFocusCategory: 'habit',
        hunterAssociationSeal: 'SISTEMA - SELLO DE AUTORIDAD'
      },
      fallback: true
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
