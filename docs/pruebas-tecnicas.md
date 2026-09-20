# Pruebas tecnicas

Las siguientes pruebas documentan la validacion funcional del prototipo. Las pruebas marcadas como "Observado" requieren ejecucion con usuarios reales, Supabase activo y Gemini disponible para completar evidencia final.

| ID | Nombre | Objetivo | Precondicion | Pasos | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TEC-001 | Registro con email | Verificar alta de usuario | Supabase Auth habilitado | Abrir registro, completar datos y enviar | Usuario creado o pendiente de confirmacion | Flujo implementado en formulario de registro; requiere evidencia final con usuario de prueba | Observado |
| TEC-002 | Login con email | Verificar acceso con credenciales | Usuario registrado | Ingresar email y contrasena | Redireccion a `/chat` | Usuario autenticado accede al chat y visualiza su correo | Aprobado |
| TEC-003 | Login con Google | Verificar OAuth real | Google provider configurado | Presionar "Continuar con Google" y completar OAuth | Redireccion a `/chat` | Flujo implementado con Supabase OAuth; requiere captura final del proveedor | Observado |
| TEC-004 | Logout | Verificar cierre de sesion | Usuario autenticado | Presionar "Salir" | Sesion local eliminada y retorno al login | El cierre de sesion elimina la sesion activa | Aprobado |
| TEC-005 | Ruta protegida sin token | Validar proteccion API | Backend activo | GET `/api/sessions` sin Authorization | HTTP 401 | Devuelve `Token de autenticacion requerido.` | Aprobado |
| TEC-006 | Ruta protegida con token valido | Validar token correcto | Usuario autenticado | GET `/api/sessions` con Bearer valido | HTTP 200 con sesiones propias | Flujo utilizado por el chat para listar sesiones | Aprobado |
| TEC-007 | Token invalido | Validar rechazo | Backend activo | GET `/api/sessions` con Bearer falso | HTTP 401 | Devuelve `Token de autenticacion invalido o expirado.` | Aprobado |
| TEC-008 | Token expirado | Validar rechazo | Token expirado disponible | GET `/api/sessions` con token expirado | HTTP 401 | Cubierto por validacion Supabase; requiere evidencia con token expirado | Observado |
| TEC-009 | Crear conversacion | Verificar creacion de sesion | Usuario autenticado | Presionar "Nueva conversacion" | Nueva sesion disponible | Se crea y visualiza una nueva conversacion en el sidebar | Aprobado |
| TEC-010 | Enviar mensaje | Verificar chat con IA | Usuario autenticado | Enviar "Que es una pila?" | Respuesta del tutor y guardado | El tutor responde dentro del dominio academico | Aprobado |
| TEC-011 | Guardar historial | Verificar persistencia | Mensaje enviado | Consultar mensajes de la sesion | Mensaje usuario y respuesta guardados | Mensajes visibles dentro de la conversacion activa | Aprobado |
| TEC-012 | Recuperar historial | Verificar lectura persistente | Sesion con mensajes | Recargar y seleccionar sesion | Historial cargado | Conversaciones previas se recuperan desde Supabase | Aprobado |
| TEC-013 | Seleccionar tema | Verificar envio de topic | Usuario autenticado | Elegir tema y enviar consulta | El backend acepta el topic valido | Selector visible y conectado al envio del mensaje | Aprobado |
| TEC-015 | Consulta fuera del dominio | Validar alcance academico | Usuario autenticado | Preguntar tema ajeno a AED I | Rechazo amable y sugerencia de reformular | Ante consulta externa, el tutor mantiene el dominio AED I | Aprobado |
| TEC-016 | Error de Gemini | Validar manejo de fallo IA | Simular fallo de API | Enviar mensaje | Error seguro sin stack trace | Manejo de errores centralizado; requiere evidencia controlada | Observado |
| TEC-017 | Error de Supabase | Validar manejo DB | Simular fallo DB o RLS | Consultar o guardar datos | Mensaje seguro | Manejo de errores centralizado; requiere evidencia controlada | Observado |
| TEC-018 | Build frontend | Verificar compilacion | Dependencias instaladas | Ejecutar `pnpm run build` en frontend | Build correcto | Build ejecutado correctamente luego de la fase responsive | Aprobado |
| TEC-019 | Responsive | Verificar usabilidad multiplataforma | Frontend activo | Probar tamanos definidos | Sin scroll horizontal y UI usable | Verificado en escritorio, notebook, tablet y celular | Aprobado |

## Conclusion

Las pruebas tecnicas muestran que el prototipo cumple los flujos principales esperados: autenticacion, acceso protegido, chat con tutor, persistencia de historial, seleccion de parametros academicos y responsive. Los casos observados deben completarse con capturas finales durante la preparacion de evidencias del TFG.
