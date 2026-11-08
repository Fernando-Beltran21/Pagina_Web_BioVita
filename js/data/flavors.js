/* =========================================================
   BIOVITA · flavors.js  (datos compartidos)
   Responsable: DEV 3
   Lo consumen: experience.js (UI) y los módulos Three.js.
   ========================================================= */
window.BIOVITA = window.BIOVITA || {};

window.BIOVITA.flavors = [
  {
    id: 'frutos-rojos',
    name: 'Frutos Rojos',
    tagline: 'Intenso y antioxidante',
    description: 'Fresa, frambuesa y zarzamora sobre una base cremosa y ligeramente ácida. Nuestro sabor estrella.',
    notes: ['Fresa', 'Frambuesa', 'Zarzamora'],
    color: '#e0325f',   // etiqueta / acento
    light: '#ff9fb5',   // fondos suaves
    soft: '#ffe3ea',    // degradados
    liquid: '#f6b3c3'   // color del líquido 3D
  },
  {
    id: 'mango',
    name: 'Mango',
    tagline: 'Tropical y sedoso',
    description: 'Mango maduro con un final suave que equilibra la acidez natural de la fermentación.',
    notes: ['Mango maduro', 'Toque cítrico', 'Cremoso'],
    color: '#f59e0b',
    light: '#ffd27a',
    soft: '#fff2d4',
    liquid: '#ffd98c'
  },
  {
    id: 'guayaba',
    name: 'Guayaba',
    tagline: 'Regional y aromático',
    description: 'Inspirado en la guayaba de Calvillo, Aguascalientes: aromático, dulce y lleno de carácter.',
    notes: ['Guayaba', 'Floral', 'Dulce natural'],
    color: '#ef6f6c',
    light: '#ffc0b8',
    soft: '#ffebe7',
    liquid: '#ffc6bd'
  },
  {
    id: 'citricos',
    name: 'Cítricos',
    tagline: 'Refrescante y vibrante',
    description: 'Limón y naranja para una explosión de frescura. Ideal después de entrenar.',
    notes: ['Limón', 'Naranja', 'Ultra fresco'],
    color: '#7cc22e',
    light: '#d4f58a',
    soft: '#f1fbdc',
    liquid: '#e6f5b0'
  }
];

window.BIOVITA.currentFlavor = window.BIOVITA.flavors[0];
