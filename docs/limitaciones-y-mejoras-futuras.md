# Limitaciones y mejoras futuras

## Limitaciones

- El sistema no reemplaza al docente.
- No realiza evaluacion formal del estudiante.
- No corrige codigo automaticamente.
- No incluye compilador ni entorno de ejecucion de algoritmos.
- No se integra al sistema academico institucional.
- Depende de APIs externas como Supabase y Gemini.
- Puede generar respuestas que requieren revision docente.
- La seguridad implementada es basica y adecuada para un prototipo academico, no para un entorno productivo de alta criticidad.
- El rate limit es en memoria, por lo que no es suficiente para despliegues distribuidos.
- La base de conocimiento inicial es limitada y puede requerir ampliacion con materiales oficiales.

## Mejoras futuras

- Panel docente para administrar contenidos y revisar interacciones.
- Carga avanzada de materiales academicos.
- Correccion guiada de codigo.
- Analiticas de uso.
- Seguimiento de progreso del estudiante.
- Integracion con sistemas institucionales.
- Expansion a otras asignaturas.
- Despliegue en produccion con monitoreo y observabilidad.
- Validacion con mayor cantidad de estudiantes.
- Implementacion de evaluaciones formativas configurables.
- Uso de herramientas mantenidas como Helmet y rate limit persistente.
- Registro de eventos de seguridad y auditoria.

## Criterio de evolucion

Las mejoras futuras deben priorizarse segun impacto academico, factibilidad tecnica, proteccion de datos y validacion con docentes y estudiantes. Cualquier evolucion hacia produccion requiere revisar seguridad, privacidad, disponibilidad y politicas institucionales.
