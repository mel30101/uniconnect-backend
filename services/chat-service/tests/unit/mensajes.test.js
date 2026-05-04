const MensajeBase = require('../../src/domain/MensajeBase');
const MensajeConArchivo = require('../../src/domain/decorators/MensajeConArchivo');
const MensajeConMencion = require('../../src/domain/decorators/MensajeConMencion');
const MensajeConReaccion = require('../../src/domain/decorators/MensajeConReaccion');

describe('Pruebas Unitarias - Patrón Decorador de Mensajes', () => {

  // ==========================================
  // Criterio 1: MensajeBase
  // ==========================================
  describe('Criterio 1: MensajeBase.render() retorna únicamente texto plano', () => {
    test('Caso 1: Retorna el contenido del mensaje base', () => {
      const mensaje = new MensajeBase('Hola Mundo');
      expect(mensaje.render()).toBe('Hola Mundo');
      expect(mensaje.getMetadata()).toEqual({});
    });

    test('Caso 2: Retorna el contenido de un mensaje diferente', () => {
      const mensaje = new MensajeBase('Segunda prueba');
      expect(mensaje.render()).toBe('Segunda prueba');
    });
  });

  // ==========================================
  // Criterio 2: MensajeConArchivo
  // ==========================================
  describe('Criterio 2: MensajeConArchivo(MensajeBase).render() incluye los campos archivo', () => {
    test('Caso 1: Incluye los campos archivo y el ícono en el renderizado para un PDF', () => {
      const mensajeBase = new MensajeBase('Adjunto el reporte');
      const mensajeConArchivo = new MensajeConArchivo(mensajeBase, {
        url: 'http://example.com/report.pdf',
        mimeType: 'application/pdf',
        tamano: 1024,
        fileName: 'reporte.pdf'
      });

      const rendered = mensajeConArchivo.render();
      expect(rendered).toContain('Adjunto el reporte');
      expect(rendered).toContain('📕'); 
      
      const metadata = mensajeConArchivo.getMetadata();
      expect(metadata.archivo).toBeDefined();
      expect(metadata.archivo.fileName).toBe('reporte.pdf');
    });

    test('Caso 2: Detección de tipo imagen', () => {
      const mensajeBase = new MensajeBase('Mira la foto');
      const mensajeConArchivo = new MensajeConArchivo(mensajeBase, {
        url: 'http://example.com/photo.png',
        mimeType: 'image/png',
        tamano: 2048,
        fileName: 'photo.png'
      });

      const rendered = mensajeConArchivo.render();
      expect(rendered).toContain('🖼️'); 
      const metadata = mensajeConArchivo.getMetadata();
      expect(metadata.archivo.detectedType).toBe('imagen');
    });
  });

  // ==========================================
  // Criterio 3: Composición de Decoradores
  // ==========================================
  describe('Criterio 3: MensajeConMencion(MensajeConArchivo(MensajeBase)) incluye tanto archivo como menciones', () => {
    test('Caso 1: Renderizado con mención y archivo', () => {
      const mensajeBase = new MensajeBase('Hola @juan, revisa el archivo');
      const mensajeConArchivo = new MensajeConArchivo(mensajeBase, {
        url: 'http://example.com/file.docx',
        mimeType: 'application/msword',
        tamano: 500,
        fileName: 'file.docx'
      });
      const mensajeConMencion = new MensajeConMencion(mensajeConArchivo, ['juan']);
      
      const rendered = mensajeConMencion.render();
      expect(rendered).toContain('**@juan**');
      expect(rendered).toContain('📘'); 
    });

    test('Caso 2: Composición con múltiples menciones', () => {
      const mensajeBase = new MensajeBase('Hey @ana y @carlos, miren esto');
      const mensajeConArchivo = new MensajeConArchivo(mensajeBase, {
        fileName: 'document.pdf'
      });
      const mensajeConMencion = new MensajeConMencion(mensajeConArchivo, ['ana', 'carlos']);

      const rendered = mensajeConMencion.render();
      expect(rendered).toContain('**@ana**');
      expect(rendered).toContain('**@carlos**');
    });
  });

  // ==========================================
  // Criterio 4: Prueba Negativa
  // ==========================================
  describe('Criterio 4: Prueba negativa - un mensaje sin decorador de archivo no tiene el campo archivo', () => {
    test('Caso 1: MensajeBase sin archivo no contiene el campo archivo en la metadata', () => {
      const mensajeBase = new MensajeBase('Hola sin archivo');
      const metadata = mensajeBase.getMetadata();
      expect(metadata.archivo).toBeUndefined();
    });

    test('Caso 2: MensajeConMencion sobre MensajeBase sin archivo no tiene archivo en la metadata', () => {
      const mensajeBase = new MensajeBase('Hola @juan');
      const mensajeConMencion = new MensajeConMencion(mensajeBase, ['juan']);
      const metadata = mensajeConMencion.getMetadata();
      expect(metadata.archivo).toBeUndefined();
    });
  });

  // ==========================================
  // Criterio 5: Cobertura de clases y decoradores
  // ==========================================
  describe('Criterio 5: Cobertura de clases y decoradores', () => {

    describe('MensajeConReaccion', () => {
      test('Caso 1: Añade una reacción exitosamente', () => {
        const mensajeBase = new MensajeBase('Mensaje con reacción');
        const mensajeConReaccion = new MensajeConReaccion(mensajeBase);
        
        mensajeConReaccion.addReaccion('👍', 'user123');
        const metadata = mensajeConReaccion.getMetadata();

        expect(metadata.reacciones['👍']).toBeDefined();
        expect(metadata.reacciones['👍'].count).toBe(1);
        expect(metadata.reacciones['👍'].users).toContain('user123');
      });

      test('Caso 2: Permite añadir reacciones múltiples y de distintos tipos', () => {
        const mensajeBase = new MensajeBase('Mensaje con reacciones múltiples');
        const mensajeConReaccion = new MensajeConReaccion(mensajeBase);

        mensajeConReaccion.addReaccion('👍', 'user123');
        mensajeConReaccion.addReaccion('👍', 'user456');
        mensajeConReaccion.addReaccion('😂', 'user123');
        const metadata = mensajeConReaccion.getMetadata();

        expect(metadata.reacciones['👍'].count).toBe(2);
        expect(metadata.reacciones['😂'].count).toBe(1);
      });
    });
  });
});