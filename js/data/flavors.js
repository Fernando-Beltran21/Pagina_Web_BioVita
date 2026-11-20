/* =========================================================
   BIOVITA · flavors.js  (datos compartidos)
   Responsable: DEV 3
   Lo consumen: experience.js (UI) y los módulos Three.js.
   Biovita tiene un único sabor: guayaba de Calvillo.
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
  }
];

window.BIOVITA.currentFlavor = window.BIOVITA.flavors[0];
