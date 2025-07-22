import { createClient } from "./supabase";

// English default tasks
const englishTasks = [
  {
    title: "Dust surfaces",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "high" as const,
  },
  {
    title: "Vacuum carpets/floors",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "high" as const,
  },
  {
    title: "Clean windows",
    frequency: "monthly" as const,
    category: "living_room" as const,
    priority: "medium" as const,
  },
  {
    title: "Disinfect remote controls",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "medium" as const,
  },
  {
    title: "Organize objects/decorations",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "low" as const,
  },
  {
    title: "Wash dishes",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Clean countertops and surfaces",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Clean the stove",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Empty trash bin",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Clean the refrigerator",
    frequency: "monthly" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Clean microwave",
    frequency: "weekly" as const,
    category: "kitchen" as const,
    priority: "medium" as const,
  },
  {
    title: "Mop the floor",
    frequency: "weekly" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Organize pantry",
    frequency: "monthly" as const,
    category: "kitchen" as const,
    priority: "medium" as const,
  },
  {
    title: "Clean toilet",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Clean sink and faucet",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Clean shower/bathtub",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Change towels",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Mop the floor",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Clean mirrors",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Empty waste basket",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Make the bed",
    frequency: "daily" as const,
    category: "bedroom" as const,
    priority: "high" as const,
  },
  {
    title: "Change sheets",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "high" as const,
  },
  {
    title: "Dust surfaces",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Vacuum carpet/floor",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "high" as const,
  },
  {
    title: "Organize closet/wardrobe",
    frequency: "monthly" as const,
    category: "bedroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Wash clothes",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "high" as const,
  },
  {
    title: "Fold and put away clothes",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "high" as const,
  },
  {
    title: "Clean dryer filter",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "high" as const,
  },
  {
    title: "Clean washing machine (cleaning cycle)",
    frequency: "monthly" as const,
    category: "laundry" as const,
    priority: "medium" as const,
  },
  {
    title: "Sweep patio/garage",
    frequency: "weekly" as const,
    category: "exterior" as const,
    priority: "medium" as const,
  },
  {
    title: "Mow lawn",
    frequency: "weekly" as const,
    category: "exterior" as const,
    priority: "high" as const,
  },
  {
    title: "Clean garden furniture",
    frequency: "monthly" as const,
    category: "exterior" as const,
    priority: "low" as const,
  },
  {
    title: "Clean doors/handles",
    frequency: "weekly" as const,
    category: "general" as const,
    priority: "high" as const,
  },
  {
    title: "Clean light switches",
    frequency: "weekly" as const,
    category: "general" as const,
    priority: "high" as const,
  },
  {
    title: "Clean all house windows",
    frequency: "monthly" as const,
    category: "general" as const,
    priority: "medium" as const,
  },
  {
    title: "Dust lamps",
    frequency: "monthly" as const,
    category: "general" as const,
    priority: "medium" as const,
  },
  {
    title: "Shake curtains/blinds",
    frequency: "monthly" as const,
    category: "general" as const,
    priority: "medium" as const,
  },
];

// Spanish default tasks
const spanishTasks = [
  {
    title: "Quitar el polvo de superficies",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "high" as const,
  },
  {
    title: "Aspirar alfombras/pisos",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar ventanas",
    frequency: "monthly" as const,
    category: "living_room" as const,
    priority: "medium" as const,
  },
  {
    title: "Desinfectar controles remotos",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "medium" as const,
  },
  {
    title: "Ordenar objetos/decoración",
    frequency: "weekly" as const,
    category: "living_room" as const,
    priority: "low" as const,
  },
  {
    title: "Lavar platos",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar encimeras y superficies",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar la estufa",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Vaciar el basurero",
    frequency: "daily" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar el refrigerador",
    frequency: "monthly" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar microondas",
    frequency: "weekly" as const,
    category: "kitchen" as const,
    priority: "medium" as const,
  },
  {
    title: "Trapear el piso",
    frequency: "weekly" as const,
    category: "kitchen" as const,
    priority: "high" as const,
  },
  {
    title: "Organizar la despensa",
    frequency: "monthly" as const,
    category: "kitchen" as const,
    priority: "medium" as const,
  },
  {
    title: "Limpiar el inodoro",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar lavamanos y grifo",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar la ducha/bañera",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Cambiar toallas",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Trapear el piso",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar espejos",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Vaciar cesto de basura",
    frequency: "weekly" as const,
    category: "bathroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Tender la cama",
    frequency: "daily" as const,
    category: "bedroom" as const,
    priority: "high" as const,
  },
  {
    title: "Cambiar sábanas",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "high" as const,
  },
  {
    title: "Quitar el polvo",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Aspirar alfombra/piso",
    frequency: "weekly" as const,
    category: "bedroom" as const,
    priority: "high" as const,
  },
  {
    title: "Ordenar ropero/guardarropa",
    frequency: "monthly" as const,
    category: "bedroom" as const,
    priority: "medium" as const,
  },
  {
    title: "Lavar ropa",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "high" as const,
  },
  {
    title: "Doblar y guardar la ropa",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar el filtro de la secadora",
    frequency: "weekly" as const,
    category: "laundry" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar lavadora (ciclo limpieza)",
    frequency: "monthly" as const,
    category: "laundry" as const,
    priority: "medium" as const,
  },
  {
    title: "Barrer patio/cochera",
    frequency: "weekly" as const,
    category: "exterior" as const,
    priority: "medium" as const,
  },
  {
    title: "Cortar césped",
    frequency: "weekly" as const,
    category: "exterior" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar muebles de jardín",
    frequency: "monthly" as const,
    category: "exterior" as const,
    priority: "low" as const,
  },
  {
    title: "Limpiar puertas/manijas",
    frequency: "weekly" as const,
    category: "general" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar interruptores de luz",
    frequency: "weekly" as const,
    category: "general" as const,
    priority: "high" as const,
  },
  {
    title: "Limpiar ventanas de toda la casa",
    frequency: "monthly" as const,
    category: "general" as const,
    priority: "medium" as const,
  },
  {
    title: "Desempolvar lámparas",
    frequency: "monthly" as const,
    category: "general" as const,
    priority: "medium" as const,
  },
  {
    title: "Sacudir cortinas/persianas",
    frequency: "monthly" as const,
    category: "general" as const,
    priority: "medium" as const,
  },
];

export async function populateDefaultTasks(
  userId: string,
  language: "en" | "es" = "en"
) {
  const supabase = createClient();

  const tasks = language === "es" ? spanishTasks : englishTasks;

  const tasksWithUserId = tasks.map((task) => ({
    ...task,
    user_id: userId,
    completed: false,
  }));

  const { error } = await supabase.from("tasks").insert(tasksWithUserId);

  if (error) {
    console.error("Error populating default tasks:", error);
    throw error;
  }

  return { success: true, tasksCount: tasks.length };
}
