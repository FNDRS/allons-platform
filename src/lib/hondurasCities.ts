/**
 * Cities allons-api recognises for a listing, spelled the way it stores them.
 * A program published with a city outside this list is rejected, and a city
 * spelled differently would not match the discovery filters.
 */
export const HONDURAS_CITIES: readonly string[] = [
  "La Ceiba", "Tela", "Jutiapa", "Arizona", "Esparta",
  "Choluteca", "San Lorenzo", "Pespire", "Marcovia", "Namasigue",
  "Trujillo", "Tocoa", "Bonito Oriental", "Balfate", "Iriona",
  "Comayagua", "Siguatepeque", "Taulabe", "Lejamani", "La Libertad",
  "Santa Rosa de Copan", "Copan Ruinas", "Nueva Arcadia", "La Jigua", "Cucuyagua",
  "San Pedro Sula", "Puerto Cortes", "Choloma", "Villanueva", "La Lima",
  "Yuscaran", "Danli", "Trojes", "Teupasenti", "Jacaleapa",
  "Tegucigalpa", "Comayaguela", "Valle de Angeles", "Santa Lucia", "Talanga",
  "Puerto Lempira", "Brus Laguna", "Ahuas", "Juan Francisco Bulnes", "Villeda Morales",
  "La Esperanza", "Intibuca", "Jesus de Otoro", "Yamaranguila", "San Miguelito",
  "Roatan", "Guanaja", "Utila", "Jose Santos Guardiola",
  "La Paz", "Marcala", "San Jose", "Santiago de Puringla", "Cane",
  "Gracias", "Erandique", "La Campa", "San Manuel Colohete", "Gualcinse",
  "Nueva Ocotepeque", "Sinuapa", "La Labor", "Belen Gualcho", "Mercedes",
  "Juticalpa", "Catacamas", "Campamento", "San Esteban", "Patuca",
  "Santa Barbara", "Quimistan", "Trinidad", "Ilama", "San Luis",
  "Nacaome", "Amapala", "Aramecina", "Alianza",
  "Yoro", "El Progreso", "Olanchito", "Morazan", "Victoria",
].sort((a, b) => a.localeCompare(b, "es"));
