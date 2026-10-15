export const normalizeMessage = (message: string) => message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function electronicsGuidance(message: string) {
  const text = normalizeMessage(message);
  if (!/\b(laptop|macbook|computer|computadora|ordenador|portatil|keyboard|teclado|screen|pantalla|monitor|phone|telefono|celular|tablet)\b/.test(text)) return undefined;
  if (/\b(spill|spilled|derrame|mojado|wet|liquid|liquido)\b/.test(text)) return {
    en: 'If liquid has spilled on your device, turn it off and unplug it if safe to do so. Do not charge it, apply heat, or turn it on to check it. Follow the manufacturer’s liquid-damage instructions and contact their repair service. Which device was affected?',
    es: 'Si se derramó líquido sobre tu dispositivo, apágalo y desconéctalo si puedes hacerlo sin riesgo. No lo cargues, apliques calor ni lo enciendas para comprobarlo. Sigue las instrucciones del fabricante para daños por líquidos y contacta con su servicio técnico. ¿Qué dispositivo se mojó?',
  };
  return {
    en: 'For your laptop or electronic device, start with a clean, soft, lint-free microfiber cloth.\n1. Turn it off and unplug the charger and accessories.\n2. Gently wipe the exterior with the dry cloth. For stubborn marks, check the manufacturer’s instructions before lightly dampening the cloth; never spray liquid directly or let moisture enter openings.\n3. Use a separate clean cloth for the screen. Avoid household cleaners, abrasives and unapproved solvents.\nWhat is the device model, so we can check its specific care instructions?',
    es: 'Para tu portátil o dispositivo electrónico, empieza con un paño de microfibra limpio, suave y sin pelusa.\n1. Apágalo y desconecta el cargador y los accesorios.\n2. Limpia suavemente el exterior con el paño seco. Para marcas persistentes, consulta las instrucciones del fabricante antes de humedecer ligeramente el paño; nunca rocíes líquido directamente ni dejes que entre humedad por las aberturas.\n3. Usa otro paño limpio para la pantalla. Evita limpiadores domésticos, abrasivos y disolventes no autorizados.\n¿Cuál es el modelo del dispositivo para consultar sus instrucciones de cuidado específicas?',
  };
}

export function cleaningFallback(message: string) {
  return electronicsGuidance(message) ?? {
    en: 'What item or surface are you cleaning, and is it dust, grease, or a stain? Tell me the material too, so I can suggest a suitable method. Until then, follow its care label and avoid applying an unknown cleaning product.',
    es: '¿Qué objeto o superficie quieres limpiar, y se trata de polvo, grasa o una mancha? Dime también el material para poder sugerir un método adecuado. Mientras tanto, sigue sus instrucciones de cuidado y evita aplicar un producto desconocido.',
  };
}
