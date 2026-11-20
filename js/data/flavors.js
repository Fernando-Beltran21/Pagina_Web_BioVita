/* =========================================================
   BIOVITA · flavors.js  (datos compartidos)
   Responsable: DEV 3
   Lo consumen: experience.js (UI) y los módulos Three.js.
   El primer sabor del arreglo es el sabor inicial de la página.
   ========================================================= */
window.BIOVITA = window.BIOVITA || {};

window.BIOVITA.flavors = [
  {
    id: 'guayaba',
    name: 'Guayaba',
    tagline: 'De Calvillo, Aguascalientes',
    description: 'Nuestro sabor insignia, con guayaba de Calvillo: aromático, dulce y lleno de carácter local.',
    notes: ['Guayaba de Calvillo', 'Aromático', 'Dulce natural'],
    color: '#ef6f6c',    // acento de la UI
    light: '#ffc0b8',    // fondos suaves
    soft: '#ffebe7',     // degradados
    liquid: '#f4b6b0',   // color del líquido 3D
    labelAccent: '#ff7b6b' // color de "vita" en la etiqueta verde
  },
  {
    id: 'frutos-rojos',
    name: 'Frutos Rojos',
    tagline: 'Intenso y antioxidante',
    description: 'Fresa, frambuesa y zarzamora sobre una base cremosa y ligeramente ácida.',
    notes: ['Fresa', 'Frambuesa', 'Zarzamora'],
    color: '#e0325f',
    light: '#ff9fb5',
    soft: '#ffe3ea',
    liquid: '#f6b3c3',
    labelAccent: '#ff5c85'
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
    liquid: '#ffd98c',
    labelAccent: '#ffb42e'
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
    liquid: '#e6f5b0',
    labelAccent: '#ffe14d'
  }
];

window.BIOVITA.currentFlavor = window.BIOVITA.flavors[0];
