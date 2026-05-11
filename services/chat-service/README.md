# Chat Service - Arquitectura de Mensajería (Patrón Decorator)

Este módulo implementa el **Patrón Decorator** para la gestión y renderizado de mensajes. Esta elección arquitectónica permite extender las funcionalidades de un mensaje (menciones, archivos adjuntos, reacciones) de manera dinámica y componible sin necesidad de modificar la clase base de mensajes.

## 1. Descripción del Patrón

El patrón Decorator se utiliza para añadir responsabilidades a objetos de forma dinámica. En nuestro sistema de chat, un mensaje puede ser simplemente texto, pero también puede tener metadatos adicionales que requieren un comportamiento o renderizado especial.

### Componentes Clave:
- **IMensaje (Interfaz/Abstracta)**: Define la estructura básica que todo mensaje debe seguir (getMetadata, render).
- **MensajeBase (Componente Concreto)**: La implementación básica que contiene el texto del mensaje.
- **MensajeDecorator (Decorador Base)**: Mantiene una referencia a un objeto `IMensaje` y delega las operaciones a él.
- **Decoradores Concretos**: 
    - `MensajeConMencion`: Resalta usuarios mencionados en el texto.
    - `MensajeConArchivo`: Añade la lógica de visualización y descarga de adjuntos.
    - `MensajeConReaccion`: Gestiona el mapa de emojis y contadores.

## 2. Diagrama de Clases (UML)

```mermaid
classDiagram
    class IMensaje {
        <<interface>>
        +getMetadata() Object
        +render() ReactNode
    }

    class MensajeBase {
        -mensaje: Object
        +getMetadata() Object
        +render() ReactNode
    }

    class MensajeDecorator {
        <<abstract>>
        #mensajeDecorado: IMensaje
        +getMetadata() Object
        +render() ReactNode
    }

    class MensajeConMencion {
        -mencionIds: string[]
        +render() ReactNode
    }

    class MensajeConArchivo {
        -archivo: Object
        +render() ReactNode
    }

    class MensajeConReaccion {
        -reacciones: Map
        +render() ReactNode
    }

    IMensaje <|.. MensajeBase
    IMensaje <|.. MensajeDecorator
    MensajeDecorator o-- IMensaje : envuelve
    MensajeDecorator <|-- MensajeConMencion
    MensajeDecorator <|-- MensajeConArchivo
    MensajeDecorator <|-- MensajeConReaccion
```

## 3. Componibilidad y MensajeFactory

La potencia de esta arquitectura reside en que los decoradores son **componibles**. Un mensaje puede ser envuelto múltiples veces para combinar funcionalidades. 

La `MensajeFactory` es la encargada de orquestar este orden de envoltura:

```typescript
// Ejemplo de composición en MensajeFactory
let mensaje = new MensajeBase(rawMessage);

if (rawMessage.hasMention) {
    mensaje = new MensajeConMencion(mensaje, rawMessage.mentions);
}

if (rawMessage.fileUrl) {
    mensaje = new MensajeConArchivo(mensaje, rawMessage.fileMetadata);
}

if (rawMessage.reacciones) {
    mensaje = new MensajeConReaccion(mensaje, rawMessage.reacciones);
}

// Al llamar a mensaje.render(), se ejecuta la cadena:
// Reaccion(Archivo(Mencion(Base)))
```

### Ventajas de esta implementación:
1. **Principio de Responsabilidad Única**: Cada decorador solo sabe gestionar su funcionalidad específica.
2. **Principio de Abierto/Cerrado**: Podemos añadir un nuevo tipo de mensaje (ej. `MensajeConEncuesta`) creando un nuevo decorador sin tocar el código existente.
3. **Orden de Renderizado**: Permite controlar exactamente si un elemento se dibuja "dentro" o "fuera" del contenido base.

## 4. Validación de Mensajes (Patrón Chain of Responsibility) - US-CH01

Para el envío de mensajes, hemos implementado el patrón **Chain of Responsibility (CoR)**. Esta arquitectura permite centralizar y modularizar las validaciones, asegurando que el sistema sea extensible y eficiente.

### Componentes de la Cadena:
1.  **ValidarCamposHandler**: Verifica que el mensaje no esté vacío.
2.  **ValidarTamanoHandler**: Controla el límite de caracteres (Criterio 2).
3.  **ValidarPermisosHandler**: Valida la membresía del usuario en el grupo.
4.  **ValidarContenidoHandler**: Filtra lenguaje ofensivo o spam.
5.  **ValidarMencionesHandler**: Detecta menciones e inyecta los IDs detectados para optimizar el flujo posterior.

### Diagrama de Clases (UML)

```mermaid
classDiagram
    class IValidadorMensajeHandler {
        <<interface>>
        +setSiguiente(handler)
        +manejar(request)
    }

    class BaseHandler {
        <<abstract>>
        -siguiente: IValidadorMensajeHandler
        +setSiguiente(handler)
        +manejar(request)
        +retornarError(msg, code)
    }

    class ValidarCamposHandler { +manejar(request) }
    class ValidarTamanoHandler { +manejar(request) }
    class ValidarPermisosHandler { +manejar(request) }
    class ValidarContenidoHandler { +manejar(request) }
    class ValidarMencionesHandler { +manejar(request) }

    IValidadorMensajeHandler <|.. BaseHandler
    BaseHandler <|-- ValidarCamposHandler
    BaseHandler <|-- ValidarTamanoHandler
    BaseHandler <|-- ValidarPermisosHandler
    BaseHandler <|-- ValidarContenidoHandler
    BaseHandler <|-- ValidarMencionesHandler
    BaseHandler o-- IValidadorMensajeHandler : siguiente
```

### Diagrama de Secuencia: Flujo de Envío Exitoso

```mermaid
sequenceDiagram
    participant C as Socket/Controller
    participant UC as SendGroupMessage
    participant F as ValidationChainFactory
    participant Chain as Cadena de Validación
    participant DB as Firestore
    participant Sub as ChatSubject

    C->>UC: execute(msgData)
    UC->>F: createGroupMessageChain()
    F-->>UC: cadenaEnsamblada
    UC->>Chain: manejar(request)
    Chain->>Chain: Validar Campos
    Chain->>Chain: Validar Permisos
    Chain->>Chain: Validar Menciones (Inyecta data)
    Chain-->>UC: { esValido: true }
    
    Note over UC: Si es válido, procede con Cloudinary (si aplica)
    
    UC->>DB: create(message)
    DB-->>UC: messageId
    
    UC->>Sub: notify(NUEVO_MENSAJE, data)
    Sub->>UC: Update Observers
    
    UC-->>C: result (Success)
```

### Diagrama de Secuencia: Flujo de Cortocircuito (Fallo de Permisos)

```mermaid
sequenceDiagram
    participant UC as SendGroupMessage
    participant P as ValidarPermisosHandler
    participant DB as Firestore

    UC->>P: manejar(request)
    P->>DB: isMember(groupId, userId)
    DB-->>P: false
    P-->>UC: { esValido: false, error: "No tienes permiso", codigo: "FORBIDDEN" }
    
    Note over UC: El flujo se detiene. No se guarda en DB ni se notifica.
    
    UC-->>UC: throw Error
```

### Beneficios Técnicos:
*   **Limpieza de Código**: Se eliminaron bloques `if/else` anidados en los casos de uso.
*   **Optimización de Recursos**: Se validan los permisos y el tamaño **antes** de realizar operaciones costosas como subidas a la nube.
*   **Extensibilidad**: Para añadir una nueva validación (ej. `ValidarAntiSpamAvanzado`), solo se requiere crear el handler y añadirlo a la `ValidationChainFactory` sin tocar la lógica de negocio del chat.

---
*Documentación actualizada para la US-CH01 - Sprint 4.*
